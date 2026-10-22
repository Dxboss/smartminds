"use server";

import { revalidatePath } from "next/cache";
import { globalSettings } from "@/content/globals";
import {
  defaultPlan6Months,
  defaultPlan3Months,
  defaultPlan10Months,
  defaultPlan12Months,
  defaultPlan14Months,
} from "@/content/plans";
import { PaymentPlanTemplate, CourseLevel } from "@/content/types";
import { calculatePricing, formatCurrency } from "@/content/pricing";
import {
  seedLearners,
  seedEnrolments,
  seedPaymentRecords,
  seedPaymentSchedules,
  seedClasses,
} from "@/lib/repositories/seedData";
import { Learner, Enrolment, PaymentRecord, PaymentScheduleItem } from "@/lib/repositories/types";
import { siteConfig } from "@/content/siteConfig";
import { sendEmail } from "@/lib/email";
import { savePersistedRecord, getLiveCourses } from "@/lib/persistedData";
import { setSessionCookie } from "@/lib/session";
import { getBaseUrl } from "@/lib/baseUrl";
import {
  buildStudentWelcomeEmail,
  buildCourseAddedEmail,
  buildAdminPaymentAlertEmail,
} from "@/lib/emailTemplates";
import { validateCoupon, calculateDiscountedPricing } from "@/lib/coupons";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

export interface EnrolmentFormInput {
  courseId: string;
  levelLabel?: string;
  planId: string; // "full" | "3" | "6" | "10" | "12" | "14" | plan ID
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  address?: string;
  postcode?: string;
  paymentOption: "full" | "instalments";
  preferredSession?: "afternoon" | "evening";
  cardNumberLast4?: string;
  couponCode?: string;
  termsAccepted: boolean;
  learnerType?: "myself" | "child";
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  childName?: string;
  childYearGroup?: string;
  trainingLocation?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}

const fullPayPlanTemplate: PaymentPlanTemplate = {
  name: "Pay in Full",
  months: 1,
  deposit_type: "percent",
  deposit_value: 100,
  grace_days: 0,
  after_grace: "pause_access",
};

function resolvePlanForLevel(
  level: CourseLevel,
  planId: string,
  paymentOption: "full" | "instalments"
): PaymentPlanTemplate {
  if (paymentOption === "full" || planId === "full") {
    return fullPayPlanTemplate;
  }
  if (level.plans && level.plans.length > 0) {
    const match = level.plans.find(
      (p) => p.id === planId || p.months.toString() === planId
    );
    if (match) return match;
  }
  if (planId === "3" || planId === "plan-3m") return defaultPlan3Months;
  if (planId === "6" || planId === "plan-6m") return defaultPlan6Months;
  if (planId === "10" || planId === "plan-10m") return defaultPlan10Months;
  if (planId === "12" || planId === "plan-12m") return defaultPlan12Months;
  if (planId === "14" || planId === "plan-14m") return defaultPlan14Months;

  return level.plans?.[0] || defaultPlan6Months;
}

export async function processSelfEnrolmentAction(input: EnrolmentFormInput) {
  // 1. Validation
  if (!input.fullName || input.fullName.trim().length < 2) {
    throw new Error("Please enter your full name.");
  }
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    throw new Error("Please enter a valid email address.");
  }
  if (!input.phone || input.phone.trim().length < 7) {
    throw new Error("Please enter a valid telephone number.");
  }
  if (!input.termsAccepted) {
    throw new Error("You must accept the terms of enrolment and student agreement.");
  }

  // Check if existing learner by email
  const existingLearnerCheck = seedLearners.find(
    (l: Learner) => l.email.toLowerCase() === input.email.trim().toLowerCase()
  );

  if (!existingLearnerCheck) {
    if (!input.dob || !input.dob.trim()) {
      if (input.cardNumberLast4 === "Stripe") {
        input.dob = "To be confirmed upon onboarding";
      } else {
        throw new Error("Date of birth is required for new learner registration.");
      }
    }
    if (!input.address || !input.address.trim()) {
      if (input.cardNumberLast4 === "Stripe") {
        input.address = "Address provided via Stripe Checkout";
      } else {
        throw new Error("Home address and postcode are required for new learner registration.");
      }
    }
  }

  // 2. Resolve Course & Pricing
  const course = getLiveCourses().find((c) => c.id === input.courseId);
  if (!course) {
    throw new Error("Selected course was not found. Please refresh and try again.");
  }

  const level =
    course.levels.find((l) => l.level_label === input.levelLabel) ||
    course.levels[0];
  if (!level) {
    throw new Error("Course level is invalid.");
  }

  const selectedPlan: PaymentPlanTemplate = resolvePlanForLevel(
    level,
    input.planId,
    input.paymentOption
  );

  let pricing = calculatePricing(level, selectedPlan, globalSettings);
  let appliedCoupon = null;
  if (input.couponCode) {
    const couponValidation = validateCoupon(input.couponCode);
    if (couponValidation.valid && couponValidation.coupon) {
      appliedCoupon = couponValidation.coupon;
      pricing = calculateDiscountedPricing(pricing, appliedCoupon);
    }
  }

  const amountCharged =
    input.paymentOption === "full" ? pricing.fullPayPrice : pricing.deposit;
  const receiptRef = `REC-${new Date().getFullYear()}-${Math.floor(
    100000 + Math.random() * 900000
  )}`;

  // 3. Register or Retrieve Learner (Unified Identity Architecture)
  const names = input.fullName.trim().split(" ");
  const firstName = names[0] || "Learner";
  const lastName = names.slice(1).join(" ") || "Student";
  const cleanEmail = input.email.trim().toLowerCase();

  let learner = seedLearners.find(
    (l: Learner) => l.email.toLowerCase() === cleanEmail
  );
  const isReturningStudent = Boolean(learner);

  const learnerId = learner
    ? learner.id
    : `learner-${(seedLearners.length + 1).toString().padStart(3, "0")}`;

  const studentId = `SM-${new Date().getFullYear()}-${learner ? learner.id.replace(/\D/g, "").padStart(4, "0") : Math.floor(1000 + Math.random() * 9000)}`;

  if (!learner) {
    learner = {
      id: learnerId,
      userId: `user-${learnerId}`,
      firstName,
      lastName,
      email: cleanEmail,
      phone: input.phone.trim(),
      enrolmentDate: new Date().toISOString(),
      accessStatus: "active",
      notes: `Self-enrolled: ${course.title} (${level.level_label})${input.dob ? ` | DOB: ${input.dob}` : ""}${input.address ? ` | Address: ${input.address}` : ""}${input.childName ? ` | Child: ${input.childName} (${input.childYearGroup})` : ""}${input.trainingLocation ? ` | Campus: ${input.trainingLocation}` : ""}`,
      learnerType: input.learnerType || "myself",
      guardianName: input.guardianName || (input.learnerType === "child" ? input.fullName.trim() : undefined),
      guardianPhone: input.guardianPhone || (input.learnerType === "child" ? input.phone.trim() : undefined),
      guardianEmail: input.guardianEmail || (input.learnerType === "child" ? cleanEmail : undefined),
      childName: input.childName,
      childYearGroup: input.childYearGroup,
      safeguardingCompleted: false,
    };
    seedLearners.push(learner);
  } else {
    learner.accessStatus = "active";
    if (input.phone) learner.phone = input.phone.trim();
    if (input.childName) learner.childName = input.childName;
    if (input.childYearGroup) learner.childYearGroup = input.childYearGroup;
  }

  // 4. Create or Activate Course Enrolment
  const matchingClass = seedClasses.find((c) => c.courseId === course.id);
  const classId = matchingClass ? matchingClass.id : "class-adult-care-l3";

  // Check if learner is already enrolled in this exact course & level
  let enrolment = seedEnrolments.find(
    (e: Enrolment) =>
      e.learnerId === learner.id &&
      e.courseId === course.id &&
      e.courseLevelLabel === level.level_label
  );

  if (!enrolment) {
    const enrolmentId = `enrolment-${(seedEnrolments.length + 1)
      .toString()
      .padStart(3, "0")}`;
    enrolment = {
      id: enrolmentId,
      learnerId: learner.id,
      courseId: course.id,
      courseSlug: course.slug || course.id,
      courseTitle: course.title,
      courseLevelLabel: level.level_label,
      classId,
      sessionTiming: input.preferredSession === "afternoon" ? "afternoon" : "evening",
      tutorName: matchingClass?.tutorName || "Dr. Eleanor Vance",
      trainingLocation: input.trainingLocation,
      enrolledAt: new Date().toISOString(),
      status: "active",
      fundingType: "self_pay",
      assessmentMethod: course.type === "cpd" ? "completion" : "criteria",
      completedUnits: [],
      certificateIssued: false,
    };
    seedEnrolments.push(enrolment);
  } else {
    enrolment.status = "active";
  }

  // 5. Record Payment in College Ledger
  const paymentId = `pay-rec-${(seedPaymentRecords.length + 1)
    .toString()
    .padStart(3, "0")}`;
  const paymentPlanLabel =
    input.paymentOption === "full"
      ? "Paid in full (10% upfront discount)"
      : `${selectedPlan.months} monthly payments (${formatCurrency(pricing.monthly)}/mo)`;

  const paymentRecord: PaymentRecord = {
    id: paymentId,
    enrolmentId: enrolment.id,
    learnerId: learner.id,
    learnerName: `${learner.firstName} ${learner.lastName}`,
    courseTitle: course.title,
    amountGbp: amountCharged,
    method: "stripe",
    reference: input.stripePaymentIntentId || receiptRef,
    status: "paid",
    paidAt: new Date().toISOString(),
    notes: paymentPlanLabel,
    stripeSessionId: input.stripeSessionId,
  };
  seedPaymentRecords.push(paymentRecord);

  // 6. Generate Payment Schedule Items (Track what is paid, what is owing, and future due dates)
  const newSchedules: PaymentScheduleItem[] = [];
  const nowIso = new Date().toISOString();
  const todayYmd = nowIso.split("T")[0];

  if (input.paymentOption === "instalments" && selectedPlan.months > 1) {
    // Instalment 1: Initial Deposit Paid Now
    const grace1 = new Date();
    grace1.setDate(grace1.getDate() + (selectedPlan.grace_days || 7));

    newSchedules.push({
      id: `sched-${enrolment.id}-1`,
      enrolmentId: enrolment.id,
      learnerId: learner.id,
      instalmentNumber: 1,
      totalInstalments: selectedPlan.months,
      amountGbp: pricing.deposit,
      dueDate: todayYmd,
      status: "paid",
      paidAt: nowIso,
      graceExpiryDate: grace1.toISOString().split("T")[0],
    });

    // Instalments 2..N: Monthly payments spread across remaining schedule
    for (let i = 2; i <= selectedPlan.months; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      const graceDate = new Date(dueDate);
      graceDate.setDate(graceDate.getDate() + (selectedPlan.grace_days || 7));
      const amount = i === selectedPlan.months ? pricing.finalPayment : pricing.monthly;

      newSchedules.push({
        id: `sched-${enrolment.id}-${i}`,
        enrolmentId: enrolment.id,
        learnerId: learner.id,
        instalmentNumber: i,
        totalInstalments: selectedPlan.months,
        amountGbp: amount,
        dueDate: dueDate.toISOString().split("T")[0],
        status: "due",
        graceExpiryDate: graceDate.toISOString().split("T")[0],
      });
    }
  } else {
    // Single payment in full
    newSchedules.push({
      id: `sched-${enrolment.id}-1`,
      enrolmentId: enrolment.id,
      learnerId: learner.id,
      instalmentNumber: 1,
      totalInstalments: 1,
      amountGbp: pricing.fullPayPrice,
      dueDate: todayYmd,
      status: "paid",
      paidAt: nowIso,
      graceExpiryDate: todayYmd,
    });
  }

  // Update in-memory seed schedule registry
  for (const sched of newSchedules) {
    const existingIdx = seedPaymentSchedules.findIndex((s) => s.id === sched.id);
    if (existingIdx >= 0) {
      seedPaymentSchedules[existingIdx] = sched;
    } else {
      seedPaymentSchedules.push(sched);
    }
  }

  // 7. Generate Temporary Password for New Learner
  const tempPassword = `SMT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  // Persist to local JSON storage for cross-restart preservation
  savePersistedRecord({
    learner,
    enrolment,
    paymentRecord,
    paymentSchedules: newSchedules,
    tempPassword: !isReturningStudent ? tempPassword : undefined,
    mustChangePassword: !isReturningStudent,
  });

  // 7. Auto-Authenticate student session cookie for NEW student onboarding only.
  // SECURITY REQUIREMENT: Existing students must NEVER be auto-authenticated from a public checkout form.
  // They must authenticate securely using their existing password at /login.
  if (!isReturningStudent) {
    try {
      await setSessionCookie({
        id: learner.userId,
        email: learner.email,
        name: `${learner.firstName} ${learner.lastName}`,
        role: "student",
        learnerId: learner.id,
        mustChangePassword: true,
      });
    } catch (err) {
      console.warn("[Session Warning]: Unable to set session cookie during enrolment:", err);
    }
  }

  // 8. Automated School-Branded HTML Emails via Central Dispatcher
  const baseUrl = getBaseUrl();
  const portalUrl = `${baseUrl}/student`;
  const isAfternoon = input.preferredSession === "afternoon";
  const cohortDay = matchingClass ? (matchingClass.scheduleDescription?.split(" ")[0] || "Weekly Live Online") : "Weekly Live Online";
  const cohortTime = isAfternoon
    ? "14:00 – 16:00 UK Time (Afternoon Cohort)"
    : "18:30 – 20:30 UK Time (Evening Cohort)";

  // A. Branded Email to Student (Differentiates First-Time vs Returning Multi-Course Enrolments)
  if (isReturningStudent) {
    const courseAddedEmail = buildCourseAddedEmail({
      studentName: input.fullName.trim(),
      studentId,
      courseTitle: course.title,
      levelName: level.level_label,
      awardingBody: course.awarding_body || "TQUK",
      amountCharged,
      receiptRef,
      paymentPlanLabel,
      portalUrl,
      loginEmail: cleanEmail,
    });

    await sendEmail({
      to: cleanEmail,
      recipientName: input.fullName.trim(),
      department: "admissions",
      subject: courseAddedEmail.subject,
      text: courseAddedEmail.text,
      html: courseAddedEmail.html,
      templateKey: "student_course_added",
      triggerEvent: "Returning Student Additional Course Enrolment",
    });
  } else {
    const welcomeEmail = buildStudentWelcomeEmail({
      studentName: input.fullName.trim(),
      studentId,
      courseTitle: course.title,
      levelName: level.level_label,
      awardingBody: course.awarding_body || "TQUK",
      amountCharged,
      receiptRef,
      paymentPlanLabel,
      portalUrl,
      loginEmail: cleanEmail,
      tempPassword,
      preferredTiming: input.preferredSession || "evening",
    });

    await sendEmail({
      to: cleanEmail,
      recipientName: input.fullName.trim(),
      department: "admissions",
      subject: welcomeEmail.subject,
      text: welcomeEmail.text,
      html: welcomeEmail.html,
      templateKey: "student_enrolment_welcome",
      triggerEvent: "New Student First Enrolment & Payment Confirmed",
    });
  }

  // B. Branded Payment & Enrolment Alert to College Admin
  const adminAlertEmail = buildAdminPaymentAlertEmail({
    studentName: input.fullName.trim(),
    studentId,
    email: cleanEmail,
    phone: input.phone.trim(),
    courseTitle: course.title,
    levelName: level.level_label,
    amountCharged,
    receiptRef,
    paymentType: input.paymentOption === "full" ? "Paid in Full" : `${selectedPlan.months}-Month Instalment Plan`,
    isReturningStudent,
  });

  await sendEmail({
    to: process.env.OWNER_EMAIL?.trim() || siteConfig.contact.email,
    recipientName: "Smartminds Admissions & Finance",
    department: "finance",
    subject: adminAlertEmail.subject,
    text: adminAlertEmail.text,
    html: adminAlertEmail.html,
    templateKey: "admin_payment_notification",
    triggerEvent: "Student Self-Enrolment & Payment Confirmed",
  });

  // 9. Revalidate Portal Routes (only permitted during Server Action executions)
  try {
    revalidatePath("/admin");
    revalidatePath("/admin/learners");
    revalidatePath("/admin/payments");
    revalidatePath("/student");
    revalidatePath("/student/courses");
    revalidatePath("/student/enrolments");
  } catch {
    // In Next.js, revalidatePath cannot be invoked during Server Component render (e.g. /enrol/success)
  }

  return {
    success: true,
    studentId,
    studentEmail: cleanEmail,
    studentName: input.fullName.trim(),
    courseTitle: course.title,
    levelName: level.level_label,
    amountCharged,
    receiptRef,
    paymentOption: input.paymentOption,
    portalUrl: "/student",
    isReturningStudent,
    learnerType: input.learnerType || "myself",
    childName: input.childName,
    trainingLocation: input.trainingLocation,
  };
}

/**
 * Creates a Stripe Checkout Session if STRIPE_SECRET_KEY is present in environment.
 * If absent, returns hasStripe: false so frontend seamlessly falls back to instant card simulation.
 */
export async function createStripeCheckoutAction(input: {
  courseId: string;
  levelLabel?: string;
  planId: string;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  address?: string;
  postcode?: string;
  preferredSession?: "afternoon" | "evening";
  couponCode?: string;
  paymentOption: "full" | "instalments";
  learnerType?: "myself" | "child";
  childName?: string;
  childYearGroup?: string;
  trainingLocation?: string;
  origin: string;
}): Promise<{ hasStripe: boolean; checkoutUrl?: string; message?: string }> {
  const stripe = getStripeClient();
  if (!stripe) {
    return {
      hasStripe: false,
      message: "Stripe key is not set. Instant enrolment simulation active.",
    };
  }

  const course = getLiveCourses().find((c) => c.id === input.courseId);
  if (!course) throw new Error("Selected course was not found.");
  const level =
    course.levels.find((l) => l.level_label === input.levelLabel) ||
    course.levels[0];
  if (!level) throw new Error("Course level is invalid.");

  const selectedPlan: PaymentPlanTemplate = resolvePlanForLevel(
    level,
    input.planId,
    input.paymentOption
  );

  let pricing = calculatePricing(level, selectedPlan, globalSettings);
  if (input.couponCode) {
    const couponValidation = validateCoupon(input.couponCode);
    if (couponValidation.valid && couponValidation.coupon) {
      pricing = calculateDiscountedPricing(pricing, couponValidation.coupon);
    }
  }

  const amountCharged =
    input.paymentOption === "full" ? pricing.fullPayPrice : pricing.deposit;
  const unitAmountPence = Math.round(amountCharged * 100);

  const successUrl = `${input.origin}/enrol/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${input.origin}/enrol?course=${course.id}&cancelled=1`;

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: input.email.trim().toLowerCase(),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: unitAmountPence,
            product_data: {
              name: `${course.title} (${level.level_label})`,
              description:
                input.paymentOption === "full"
                  ? "Full payment (10% upfront discount applied)"
                  : `${selectedPlan.months}-month instalment plan initial deposit`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "enrolment",
        courseId: course.id,
        levelLabel: level.level_label,
        planId: input.planId,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        dob: input.dob || "",
        address: input.address || "",
        postcode: input.postcode || "",
        preferredSession: input.preferredSession || "evening",
        couponCode: input.couponCode || "",
        paymentOption: input.paymentOption,
        learnerType: input.learnerType || "myself",
        childName: input.childName || "",
        childYearGroup: input.childYearGroup || "",
        trainingLocation: input.trainingLocation || "",
      },
    });

    return {
      hasStripe: true,
      checkoutUrl: session.url || undefined,
    };
  } catch (err: any) {
    console.error("[Stripe Checkout Exception]:", err);
    throw new Error(err.message || "Failed to initialize Stripe checkout.");
  }
}

/**
 * Idempotently fulfills a completed Stripe Checkout session.
 * Verifies with Stripe API that the session is genuine and payment_status is 'paid'.
 * Prevents replay attacks and duplicate enrolment records.
 */
export async function fulfillStripeCheckoutSession(sessionId: string) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe is not configured in this environment.");
  }

  // 1. Check idempotency: Has this session already been fulfilled?
  const { seedPaymentRecords, seedLearners } = await import(
    "@/lib/repositories/seedData"
  );
  const { loadPersistedRecords } = await import("@/lib/persistedData");
  const persisted = loadPersistedRecords();

  const allRecords = [...(persisted.paymentRecords || []), ...seedPaymentRecords];
  const existingRecord = allRecords.find(
    (p) => p.stripeSessionId === sessionId || p.reference === sessionId
  );

  if (existingRecord) {
    const allLearners = [...(persisted.learners || []), ...seedLearners];
    const learner = allLearners.find((l) => l.id === existingRecord.learnerId);

    const studentId = learner
      ? `SM-${new Date(learner.enrolmentDate || Date.now()).getFullYear()}-${learner.id.replace(/\D/g, "").padStart(4, "0")}`
      : "SM-CONFIRMED";

    return {
      success: true,
      alreadyFulfilled: true,
      studentId,
      studentEmail: learner?.email || "",
      studentName: learner ? `${learner.firstName} ${learner.lastName}` : existingRecord.learnerName,
      courseTitle: existingRecord.courseTitle,
      levelName: "",
      amountCharged: existingRecord.amountGbp,
      receiptRef: existingRecord.reference,
      paymentOption: "full" as const,
      portalUrl: "/student",
      isReturningStudent: false,
      learnerType: "myself" as const,
    };
  }

  // 2. Query Stripe for Session verification
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  if (session.payment_status !== "paid") {
    throw new Error(
      `Stripe Checkout Session ${sessionId} has not been paid. Current status: ${session.payment_status}`
    );
  }

  const meta = session.metadata || {};
  if (!meta.courseId || !meta.email || !meta.fullName) {
    throw new Error("Stripe Checkout Session is missing required enrolment metadata.");
  }

  const paymentIntentId =
    typeof session.payment_intent === "object" && session.payment_intent
      ? session.payment_intent.id
      : typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.id;

  // Check if this was an instalment payment from the student portal
  if (meta.type === "instalment" && meta.scheduleItemId) {
    const { updatePaymentScheduleStatusInStore, savePersistedRecord } = await import(
      "@/lib/persistedData"
    );
    const { seedPaymentSchedules } = await import("@/lib/repositories/seedData");

    const sched = seedPaymentSchedules.find((s) => s.id === meta.scheduleItemId);
    const nowIso = new Date().toISOString();
    if (sched) {
      sched.status = "paid";
      sched.paidAt = nowIso;
      delete sched.adminQuery;
      delete sched.reportedTransfer;
    }
    updatePaymentScheduleStatusInStore(meta.scheduleItemId, {
      status: "paid",
      paidAt: nowIso,
      adminQuery: undefined,
      reportedTransfer: undefined,
    });

    const instalmentRecord: PaymentRecord = {
      id: `pay-rec-${Date.now()}`,
      enrolmentId: meta.enrolmentId || (sched?.enrolmentId ?? ""),
      learnerId: meta.learnerId || (sched?.learnerId ?? ""),
      learnerName: meta.fullName,
      courseTitle: meta.courseTitle || "Course Instalment",
      amountGbp: (session.amount_total ?? 0) / 100,
      method: "stripe",
      reference: paymentIntentId,
      status: "paid",
      paidAt: nowIso,
      notes: `Instalment paid via Stripe (${paymentIntentId})`,
      stripeSessionId: sessionId,
    };
    seedPaymentRecords.push(instalmentRecord);
    savePersistedRecord({ paymentRecord: instalmentRecord });

    return {
      success: true,
      studentId: meta.learnerId || "STUDENT-INSTALMENT",
      studentEmail: meta.email || "",
      studentName: meta.fullName,
      courseTitle: meta.courseTitle || "Course Instalment",
      levelName: "",
      amountCharged: instalmentRecord.amountGbp,
      receiptRef: paymentIntentId,
      paymentOption: "instalments" as const,
      portalUrl: "/student/payments",
      isReturningStudent: true,
      learnerType: "myself" as const,
    };
  }

  // Fulfill Course Self-Enrolment
  const enrolmentResult = await processSelfEnrolmentAction({
    courseId: meta.courseId,
    levelLabel: meta.levelLabel || undefined,
    planId: meta.planId || "full",
    fullName: meta.fullName,
    email: meta.email,
    phone: meta.phone || "07000000000",
    dob: meta.dob || undefined,
    address: meta.address || undefined,
    postcode: meta.postcode || undefined,
    preferredSession: meta.preferredSession === "afternoon" ? "afternoon" : "evening",
    couponCode: meta.couponCode || undefined,
    paymentOption: meta.paymentOption === "full" ? "full" : "instalments",
    termsAccepted: true,
    cardNumberLast4: "Stripe",
    learnerType: (meta.learnerType as any) || "myself",
    childName: meta.childName || undefined,
    childYearGroup: meta.childYearGroup || undefined,
    trainingLocation: meta.trainingLocation || undefined,
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
  });

  return enrolmentResult;
}

export async function verifyExistingStudentAction(identifier: string) {
  const clean = identifier?.trim().toLowerCase();
  if (!clean) {
    return { success: false, error: "Please enter your Student ID or email." };
  }

  const { seedLearners } = await import("@/lib/repositories/seedData");
  const { loadPersistedRecords } = await import("@/lib/persistedData");
  const persisted = loadPersistedRecords();

  const allLearners = [...(persisted.learners || []), ...seedLearners];
  const learner = allLearners.find(
    (l) =>
      l.email.toLowerCase() === clean ||
      l.id.toLowerCase() === clean ||
      (l.userId && l.userId.toLowerCase() === clean) ||
      clean.includes(l.id.toLowerCase())
  );

  if (!learner) {
    return {
      success: false,
      error: "No active student record matches that ID or email. Please double-check or register as a new learner.",
    };
  }

  const studentId = `SM-${new Date(learner.enrolmentDate || Date.now()).getFullYear()}-${learner.id.replace(/\D/g, "").padStart(4, "0")}`;

  return {
    success: true,
    learner: {
      id: learner.id,
      firstName: learner.firstName,
      lastName: learner.lastName,
      fullName: `${learner.firstName} ${learner.lastName}`,
      email: learner.email,
      phone: learner.phone || "",
      studentId,
    },
  };
}

/**
 * Server Action for Parents to complete their child's safeguarding and consent form post-login.
 */
export async function submitSafeguardingFormAction(input: {
  learnerId?: string;
  learnerEmail?: string;
  parentSignature: string;
  childConcerns?: string;
  emergencyPhone?: string;
}) {
  const learner = seedLearners.find(
    (l) =>
      (input.learnerId && l.id === input.learnerId) ||
      (input.learnerEmail && l.email.toLowerCase() === input.learnerEmail.toLowerCase())
  );

  if (learner) {
    learner.safeguardingCompleted = true;
    learner.parentSignature = input.parentSignature;
    if (input.childConcerns) learner.childConcerns = input.childConcerns;
    if (input.emergencyPhone) learner.emergencyPhone = input.emergencyPhone;

    // Persist
    savePersistedRecord({ learner });
  }

  try {
    revalidatePath("/student");
    revalidatePath("/admin/learners");
  } catch {}

  return { success: true };
}

