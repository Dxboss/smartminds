"use server";

import { revalidatePath } from "next/cache";
import { courses } from "@/content/courses";
import { globalSettings } from "@/content/globals";
import {
  defaultPlan6Months,
  defaultPlan3Months,
  defaultPlan10Months,
  defaultPlan12Months,
} from "@/content/plans";
import { PaymentPlanTemplate } from "@/content/types";
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
import { savePersistedRecord } from "@/lib/persistedData";
import { setSessionCookie } from "@/lib/session";
import { getBaseUrl } from "@/lib/baseUrl";
import {
  buildStudentWelcomeEmail,
  buildCourseAddedEmail,
  buildAdminPaymentAlertEmail,
} from "@/lib/emailTemplates";
import { validateCoupon, calculateDiscountedPricing } from "@/lib/coupons";

export interface EnrolmentFormInput {
  courseId: string;
  levelLabel?: string;
  planId: string; // "full" | "3" | "6" | "10" | "12" | plan ID
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
}

const fullPayPlanTemplate: PaymentPlanTemplate = {
  name: "Pay in Full",
  months: 1,
  deposit_type: "percent",
  deposit_value: 100,
  grace_days: 0,
  after_grace: "pause_access",
};

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
  const course = courses.find((c) => c.id === input.courseId);
  if (!course) {
    throw new Error("Selected course was not found. Please refresh and try again.");
  }

  const level =
    course.levels.find((l) => l.level_label === input.levelLabel) ||
    course.levels[0];
  if (!level) {
    throw new Error("Course level is invalid.");
  }

  let selectedPlan: PaymentPlanTemplate = defaultPlan6Months;
  if (input.paymentOption === "full" || input.planId === "full") {
    selectedPlan = fullPayPlanTemplate;
  } else if (input.planId === "3" || input.planId === "plan-3m") {
    selectedPlan = defaultPlan3Months;
  } else if (input.planId === "6" || input.planId === "plan-6m") {
    selectedPlan = defaultPlan6Months;
  } else if (input.planId === "10" || input.planId === "plan-10m") {
    selectedPlan = defaultPlan10Months;
  } else if (input.planId === "12" || input.planId === "plan-12m") {
    selectedPlan = defaultPlan12Months;
  } else if (level.plans && level.plans.length > 0) {
    const customMatch = level.plans.find(
      (p) => p.id === input.planId || p.months.toString() === input.planId
    );
    if (customMatch) selectedPlan = customMatch;
  }

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
      notes: `Self-enrolled: ${course.title} (${level.level_label})${input.dob ? ` | DOB: ${input.dob}` : ""}${input.address ? ` | Address: ${input.address}` : ""}`,
    };
    seedLearners.push(learner);
  } else {
    learner.accessStatus = "active";
    if (input.phone) learner.phone = input.phone.trim();
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
    reference: receiptRef,
    status: "paid",
    paidAt: new Date().toISOString(),
    notes: paymentPlanLabel,
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

  // 9. Revalidate Portal Routes
  revalidatePath("/admin");
  revalidatePath("/admin/learners");
  revalidatePath("/admin/payments");
  revalidatePath("/student");
  revalidatePath("/student/courses");
  revalidatePath("/student/enrolments");

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
  origin: string;
}): Promise<{ hasStripe: boolean; checkoutUrl?: string; message?: string }> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey || stripeSecretKey.trim().length === 0) {
    return {
      hasStripe: false,
      message: "Stripe key is not set. Instant enrolment simulation active.",
    };
  }

  const course = courses.find((c) => c.id === input.courseId);
  if (!course) throw new Error("Selected course was not found.");
  const level =
    course.levels.find((l) => l.level_label === input.levelLabel) ||
    course.levels[0];
  if (!level) throw new Error("Course level is invalid.");

  let selectedPlan: PaymentPlanTemplate = defaultPlan6Months;
  if (input.paymentOption === "full" || input.planId === "full") {
    selectedPlan = fullPayPlanTemplate;
  } else if (input.planId === "3") {
    selectedPlan = defaultPlan3Months;
  } else if (input.planId === "10") {
    selectedPlan = defaultPlan10Months;
  } else if (input.planId === "12") {
    selectedPlan = defaultPlan12Months;
  }

  const pricing = calculatePricing(level, selectedPlan, globalSettings);
  const amountCharged =
    input.paymentOption === "full" ? pricing.fullPayPrice : pricing.deposit;
  const unitAmountPence = Math.round(amountCharged * 100);

  const successUrl = new URL(`${input.origin}/enrol/success`);
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  successUrl.searchParams.set("courseId", course.id);
  successUrl.searchParams.set("levelLabel", level.level_label);
  successUrl.searchParams.set("fullName", input.fullName);
  successUrl.searchParams.set("email", input.email);
  successUrl.searchParams.set("phone", input.phone);
  successUrl.searchParams.set("paymentOption", input.paymentOption);
  successUrl.searchParams.set("planId", input.planId);
  if (input.dob) successUrl.searchParams.set("dob", input.dob);
  if (input.address) successUrl.searchParams.set("address", input.address);
  if (input.postcode) successUrl.searchParams.set("postcode", input.postcode);
  if (input.preferredSession) successUrl.searchParams.set("preferredSession", input.preferredSession);
  if (input.couponCode) successUrl.searchParams.set("couponCode", input.couponCode);

  const params = new URLSearchParams();
  params.append("success_url", successUrl.toString());
  params.append("cancel_url", `${input.origin}/enrol?course=${course.id}&cancelled=1`);
  params.append("customer_email", input.email.trim().toLowerCase());
  // Note: Modern Stripe accounts manage payment methods dynamically via Stripe Dashboard (Cards, Apple Pay, Google Pay)
  params.append("mode", "payment");
  params.append("line_items[0][price_data][currency]", "gbp");
  params.append("line_items[0][price_data][unit_amount]", unitAmountPence.toString());
  params.append(
    "line_items[0][price_data][product_data][name]",
    `${course.title} (${level.level_label})`
  );

  // Stripe session metadata for record keeping and auditing
  params.append("metadata[courseId]", course.id);
  params.append("metadata[fullName]", input.fullName);
  params.append("metadata[email]", input.email);
  if (input.dob) params.append("metadata[dob]", input.dob);
  if (input.address) params.append("metadata[address]", input.address);
  if (input.postcode) params.append("metadata[postcode]", input.postcode);
  params.append(
    "line_items[0][price_data][product_data][description]",
    input.paymentOption === "full"
      ? "Full payment (10% upfront discount applied)"
      : `${selectedPlan.months}-month instalment plan initial deposit`
  );
  params.append("line_items[0][quantity]", "1");

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey.trim()}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Stripe API Error]:", errorText);
      throw new Error(`Stripe API Error: ${errorText}`);
    }

    const session = await response.json();
    return {
      hasStripe: true,
      checkoutUrl: session.url,
    };
  } catch (err) {
    console.error("[Stripe Checkout Exception]:", err);
    throw err;
  }
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

