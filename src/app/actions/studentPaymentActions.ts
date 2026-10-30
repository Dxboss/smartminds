"use server";

import { getServerSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  demoOutbox,
  seedPaymentSchedules,
  seedLearners,
} from "@/lib/repositories/seedData";
import { siteConfig } from "@/content/siteConfig";
import { formatCurrency } from "@/content/pricing";
import { getStripeClient } from "@/lib/stripe";
import { getPaymentRepo } from "@/lib/repositories";
import { sendEmail } from "@/lib/email";

export interface ReportBankTransferInput {
  scheduleItemId: string;
  payerReference?: string;
  amountGbp?: number;
  receiptUrl?: string;
  receiptFileName?: string;
}

/**
 * Student reports that they have sent a bank transfer for an instalment,
 * optionally uploading their receipt/screenshot proof of payment.
 */
export async function reportBankTransferAction(input: ReportBankTransferInput) {
  const session = await getServerSession();
  if (!session || session.role !== "student") {
    throw new Error("Only signed-in students can report an instalment transfer.");
  }

  // Learner identity comes from the signed session only, never the browser.
  let learnerId = session.learnerId;
  if (!learnerId) {
    const found = seedLearners.find(
      (l) => l.email.toLowerCase() === session.email.toLowerCase()
    );
    learnerId = found?.id;
  }
  if (!learnerId) {
    try {
      const { loadPersistedRecords } = await import("@/lib/persistedData");
      const store = loadPersistedRecords();
      const pFound = (store.learners || []).find(
        (l) => l.email?.toLowerCase() === session.email.toLowerCase()
      );
      learnerId = pFound?.id;
    } catch {
      // Ignore
    }
  }

  const notifiedAt = new Date().toISOString();
  const noticeRef = `TRF-${Date.now().toString().slice(-6)}`;
  const payerRef = input.payerReference?.trim().slice(0, 60) || session.learnerId || "Student ID";

  const paymentRepo = getPaymentRepo();
  const updatedItem = await paymentRepo.reportInstalmentBankTransfer(session, {
    scheduleItemId: input.scheduleItemId,
    reference: payerRef,
    amountGbp: input.amountGbp,
    receiptUrl: input.receiptUrl,
    receiptFileName: input.receiptFileName,
  });

  const reportedAmount = input.amountGbp && input.amountGbp > 0 ? input.amountGbp : updatedItem.amountGbp;

  const financeEmail = "finance@smartmindstraining.co.uk";
  let attachmentContent: string | undefined;
  let attachmentType: string | undefined;
  if (input.receiptUrl && input.receiptUrl.startsWith("data:")) {
    const parts = input.receiptUrl.split(";base64,");
    if (parts.length === 2) {
      attachmentType = parts[0].replace("data:", "") || "image/png";
      attachmentContent = parts[1];
    }
  }

  // Live email to Finance department (finance@smartmindstraining.co.uk)
  try {
    await sendEmail({
      to: financeEmail,
      department: "finance",
      subject: `Payment proof uploaded: ${session.name} — Instalment ${updatedItem.instalmentNumber} of ${updatedItem.totalInstalments}`,
      text: `Dear Finance Team,\n\n${session.name} (${session.email}) has submitted a bank transfer payment notice and uploaded payment proof for verification.\n\nLearner: ${session.name}\nLearner Email: ${session.email}\nCourse: ${updatedItem.courseTitle || "Course"}\nInstalment: ${updatedItem.instalmentNumber} of ${updatedItem.totalInstalments}\nAmount Transferred: ${formatCurrency(reportedAmount)}\nScheduled Instalment: ${formatCurrency(updatedItem.amountGbp)}\nDue Date: ${updatedItem.dueDate}\nBank Transfer Reference: ${payerRef}\nReceipt Document: ${input.receiptFileName || "Attached"}\nTracking Notice: ${noticeRef}\nTimestamp: ${new Date(notifiedAt).toLocaleString("en-GB")}\n\nPlease review the attached receipt proof and verify the funds in the college bank account:\nGo to Admin Portal → Financial Ledger (/admin/payments) to view the receipt and click 'Confirm & Mark Paid'.\n\nSmartminds Automated Financial System`,
      attachments:
        attachmentContent && attachmentType
          ? [
            {
              filename: input.receiptFileName || "payment-proof.png",
              content: attachmentContent,
              content_type: attachmentType,
            },
          ]
          : undefined,
      templateKey: "transfer_reported_owner",
      triggerEvent: "Student Reported Bank Transfer",
    });
  } catch (emailErr) {
    console.warn("[studentPaymentActions] Live finance email error:", emailErr);
  }

  // Alert the finance team in demo outbox
  demoOutbox.unshift({
    id: `outbox-transfer-${Date.now()}`,
    recipientEmail: financeEmail,
    recipientName: "Smartminds Finance & Accounts",
    subject: `Payment proof uploaded: ${session.name} — Instalment ${updatedItem.instalmentNumber} of ${updatedItem.totalInstalments}`,
    renderedBody: `${session.name} (${session.email}) reports sending a bank transfer of ${formatCurrency(reportedAmount)}.\n\nInstalment: ${updatedItem.instalmentNumber} of ${updatedItem.totalInstalments}\nScheduled due: ${formatCurrency(updatedItem.amountGbp)}\nDue date: ${updatedItem.dueDate}\nPayer reference: ${payerRef}\nReceipt uploaded: ${input.receiptFileName || "None (reference only)"}\nNotice: ${noticeRef}\n\nCheck the bank statement or preview the uploaded receipt, then confirm receipt in Payments Ledger (/admin/payments). The instalment stays unpaid until confirmed.`,
    templateKey: "transfer_reported_owner",
    sentAt: notifiedAt,
    triggerEvent: "Student Reported Bank Transfer",
  });

  // Live acknowledgment to the student
  try {
    await sendEmail({
      to: session.email,
      department: "finance",
      subject: `We have your payment notice (${noticeRef})`,
      text: `Dear ${session.name},\n\nThank you for letting us know you have sent ${formatCurrency(reportedAmount)} for instalment ${updatedItem.instalmentNumber} of ${updatedItem.totalInstalments}.${input.receiptFileName ? ` Your payment proof (${input.receiptFileName}) was received and routed to finance.` : ""}\n\nOur Finance team will verify the payment against our bank account and dispatch your official receipt, usually within one working business day.\n\nNotice reference: ${noticeRef}\n\nFinance & Student Accounts\nSmartminds Training College`,
      templateKey: "transfer_reported_student",
      triggerEvent: "Student Reported Bank Transfer",
    });
  } catch (ackErr) {
    console.warn("[studentPaymentActions] Student ack email error:", ackErr);
  }

  // Acknowledge to the student in demo outbox
  demoOutbox.unshift({
    id: `outbox-transfer-ack-${Date.now()}`,
    recipientEmail: session.email,
    recipientName: session.name,
    subject: `We have your transfer notice (${noticeRef})`,
    renderedBody: `Dear ${session.name},\n\nThanks for letting us know you have sent ${formatCurrency(reportedAmount)} for instalment ${updatedItem.instalmentNumber} of ${updatedItem.totalInstalments}.${input.receiptFileName ? ` Your payment proof (${input.receiptFileName}) was received.` : ""}\n\nStudent Accounts will confirm once it shows on our statement, usually within one working day. You will get a receipt by email then.\n\nNotice reference: ${noticeRef}\n\nStudent Accounts\nSmartminds Training College`,
    templateKey: "transfer_reported_student",
    sentAt: notifiedAt,
    triggerEvent: "Student Reported Bank Transfer",
  });

  try {
    revalidatePath("/admin/payments");
    revalidatePath("/student/payments");
    revalidatePath("/student");
    revalidatePath("/admin");
  } catch { }

  return { success: true, noticeReference: noticeRef, notifiedAt };
}

/**
 * Pay next instalment with Stripe Card / Apple Pay.
 * If Stripe is configured, creates a real Stripe Checkout Session.
 * Otherwise falls back to instant simulation for prototype review.
 */
export async function payInstalmentWithStripeAction(
  scheduleItemId: string,
  origin?: string
): Promise<{ success: boolean; receiptReference: string; checkoutUrl?: string }> {
  const session = await getServerSession();
  if (!session || session.role !== "student") {
    throw new Error("Only signed-in students can pay an instalment.");
  }

  let learnerId = session.learnerId;
  if (!learnerId) {
    const found = seedLearners.find(
      (l) => l.email.toLowerCase() === session.email.toLowerCase()
    );
    learnerId = found?.id;
  }
  if (!learnerId) {
    throw new Error("No learner record is linked to this account.");
  }

  const item = seedPaymentSchedules.find((s) => s.id === scheduleItemId);
  if (!item || item.learnerId !== learnerId) {
    throw new Error("Instalment not found on your account.");
  }
  if (item.status === "paid") {
    throw new Error("This instalment is already marked as paid.");
  }

  const { seedPaymentRecords, seedEnrolments } = await import(
    "@/lib/repositories/seedData"
  );
  const enrolment = seedEnrolments.find((e) => e.id === item.enrolmentId);

  // 1. Live Stripe Checkout Flow
  const stripe = getStripeClient();
  if (stripe && origin) {
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.email,
        mode: "payment",
        success_url: `${origin}/student/payments?session_id={CHECKOUT_SESSION_ID}&paid=1`,
        cancel_url: `${origin}/student/payments?cancelled=1`,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              unit_amount: Math.round(item.amountGbp * 100),
              product_data: {
                name: `${enrolment?.courseTitle || "Course"} — Instalment ${item.instalmentNumber} of ${item.totalInstalments}`,
                description: `Tuition instalment payment for ${session.name}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "instalment",
          scheduleItemId: item.id,
          learnerId: learnerId,
          enrolmentId: item.enrolmentId,
          fullName: session.name,
          email: session.email,
          courseTitle: enrolment?.courseTitle || "Course",
        },
      });

      return {
        success: true,
        receiptReference: checkoutSession.id,
        checkoutUrl: checkoutSession.url || undefined,
      };
    } catch (err: any) {
      console.error("[Stripe Instalment Exception]:", err?.message || err);
      throw new Error(
        "Unable to initialize card checkout. Please contact student accounts or try bank transfer."
      );
    }
  }

  // 2. Demo Instant Approval Simulation
  const { updatePaymentScheduleStatusInStore, savePersistedRecord } = await import(
    "@/lib/persistedData"
  );

  const now = new Date().toISOString();
  item.status = "paid";
  item.paidAt = now;
  delete item.adminQuery;
  delete item.reportedTransfer;

  updatePaymentScheduleStatusInStore(item.id, {
    status: "paid",
    paidAt: now,
    adminQuery: undefined,
    reportedTransfer: undefined,
  });

  const receiptRef = `REC-${Date.now().toString().slice(-6)}`;
  const learner = seedLearners.find((l) => l.id === learnerId);

  const newRecord = {
    id: `pay-rec-${Date.now()}`,
    enrolmentId: item.enrolmentId,
    learnerId: learnerId,
    learnerName: session.name,
    courseTitle: enrolment?.courseTitle || "Course",
    amountGbp: item.amountGbp,
    method: "stripe" as const,
    reference: `ch_stripe_${receiptRef}`,
    status: "paid" as const,
    paidAt: now,
    notes: `Card payment for Instalment ${item.instalmentNumber} of ${item.totalInstalments}`,
  };

  seedPaymentRecords.unshift(newRecord);
  savePersistedRecord({ paymentRecord: newRecord });

  // Unpause learner access if previously paused
  if (learner && learner.accessStatus === "paused") {
    learner.accessStatus = "active";
  }
  if (enrolment && enrolment.status === "paused") {
    enrolment.status = "active";
  }

  // Send automated receipt email
  demoOutbox.unshift({
    id: `outbox-stripe-inst-${Date.now()}`,
    recipientEmail: session.email,
    recipientName: session.name,
    subject: `Payment Receipt: ${formatCurrency(item.amountGbp)} (Instalment ${item.instalmentNumber} of ${item.totalInstalments})`,
    renderedBody: `Dear ${session.name},\n\nThank you for your payment of ${formatCurrency(item.amountGbp)}.\n\nReceipt Reference: ${receiptRef}\nMethod: Card (Stripe Instant)\nInstalment: ${item.instalmentNumber} of ${item.totalInstalments}\nDate: ${new Date().toLocaleDateString("en-GB")}\n\nYour instalment schedule has been updated and your tuition balance reduced accordingly.\n\nSmartminds Training College`,
    templateKey: "stripe_instalment_receipt",
    sentAt: now,
    triggerEvent: "Stripe Instalment Payment Succeeded",
  });

  try {
    revalidatePath("/student/payments");
    revalidatePath("/admin/payments");
  } catch { }

  return { success: true, receiptReference: receiptRef };
}

/**
 * Switch an instalment or future schedule to Direct Debit (GoCardless).
 */
export async function switchInstalmentsToGoCardlessAction(
  scheduleItemId: string,
  origin: string
) {
  const session = await getServerSession();
  if (!session || session.role !== "student") {
    throw new Error("Must be logged in as a student.");
  }

  const { isGoCardlessConfigured, createGoCardlessRedirectFlow } = await import(
    "@/lib/gocardless"
  );
  const { seedPaymentSchedules } = await import(
    "@/lib/repositories/seedData"
  );
  const { updatePaymentScheduleStatusInStore } = await import(
    "@/lib/persistedData"
  );
  const { randomBytes } = await import("node:crypto");

  const item = seedPaymentSchedules.find((s) => s.id === scheduleItemId);
  if (!item) throw new Error("Instalment not found.");

  if (isGoCardlessConfigured()) {
    const sessionToken = randomBytes(16).toString("hex");
    const successUrl = `${origin}/student/payments?gocardless_mandate_setup=1`;

    const nameParts = session.name.split(" ");
    const flow = await createGoCardlessRedirectFlow({
      sessionToken,
      successRedirectUrl: successUrl,
      description: `Smartminds Tuition Direct Debit: ${item.courseTitle || "Instalments"}`,
      prefilledCustomer: {
        givenName: nameParts[0] || "Learner",
        familyName: nameParts.slice(1).join(" ") || "Student",
        email: session.email,
      },
    });

    return {
      hasGoCardless: true,
      redirectUrl: flow.redirectUrl,
    };
  }

  // Demo fallback: update schedule method to Direct Debit
  item.method = "gocardless";
  updatePaymentScheduleStatusInStore(item.id, {
    method: "gocardless",
  });

  try {
    revalidatePath("/student/payments");
  } catch {}

  return {
    hasGoCardless: false,
    success: true,
    message: "Upcoming instalments successfully switched to Direct Debit (GoCardless).",
  };
}

/**
 * Fetch active college bank details for display to students.
 */
export async function getCollegeBankDetailsForStudentAction() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Must be logged in.");
  }
  const { collegePaymentGatewaySettings } = await import(
    "@/lib/repositories/seedData"
  );
  return {
    bankName: collegePaymentGatewaySettings.bankName,
    accountName: collegePaymentGatewaySettings.accountName,
    sortCode: collegePaymentGatewaySettings.sortCode,
    accountNumber: collegePaymentGatewaySettings.accountNumber,
    bacsReferencePrefix: collegePaymentGatewaySettings.bacsReferencePrefix,
  };
}

export interface StudentSelfAddCourseInput {
  courseId: string;
  levelLabel: string;
  paymentOption: "full" | "instalments";
  planMonths?: number;
  paymentMethod: "card" | "bacs";
  tutoringSlot?: string;
  tutoringDeliveryMode?: "online" | "physical_centre" | "room_home_request";
  tutoringRoomOrAddress?: string;
}

/**
 * Direct self-serve enrolment action for authenticated students from their dashboard.
 * Supports Level 2-4 ([3, 6, 10, 12] mo) vs Level 5+ ([6, 10, 12, 14] mo) fallback.
 */
export async function studentSelfAddCourseAction(input: StudentSelfAddCourseInput) {
  const session = await getServerSession();
  if (!session || session.role !== "student") {
    throw new Error("You must be logged in as a student to add a qualification.");
  }

  const { pullLatestFromNeon, loadPersistedRecords, savePersistedRecord } = await import(
    "@/lib/persistedData"
  );
  const { seedLearners, seedClasses } = await import("@/lib/repositories/seedData");
  await pullLatestFromNeon().catch(() => { });
  const store = loadPersistedRecords();

  let learnerId = session.learnerId;
  let learner = (store.learners || []).find(
    (l) => l.id === learnerId || (l.email && session.email && l.email.toLowerCase() === session.email.toLowerCase())
  );
  if (!learner) {
    learner = seedLearners.find(
      (l) => l.id === learnerId || (l.email && session.email && l.email.toLowerCase() === session.email.toLowerCase())
    );
  }
  if (!learner) {
    throw new Error("Learner profile not found for active session.");
  }
  learnerId = learner.id;

  // Resolve course & pricing
  const { getCourseRepo } = await import("@/lib/repositories");
  const courseRepo = getCourseRepo();
  const allCourses = await courseRepo.listCourses();
  const course = allCourses.find((c) => c.id === input.courseId);
  if (!course) {
    throw new Error("Selected course was not found.");
  }

  const level = course.levels.find((l) => l.level_label === input.levelLabel) || course.levels[0];
  if (!level) {
    throw new Error("Course level was not found.");
  }

  const isLevelFiveOrAbove = (label: string) => {
    const match = label.match(/(?:level|lvl|\bl)\s*(\d+)/i);
    if (match && parseInt(match[1], 10) >= 5) return true;
    return /\b([5-8])\b/.test(label);
  };

  const isL5Plus = isLevelFiveOrAbove(level.level_label);
  const allowedMonths = isL5Plus ? [6, 10, 12, 14] : [3, 6, 10, 12];
  const months = input.planMonths && allowedMonths.includes(input.planMonths) ? input.planMonths : allowedMonths[0];

  const fullPrice = level.price_gbp || 1250;
  const isFullPay = input.paymentOption === "full";
  const fullPayDiscountPercent = level.full_pay_discount_percent ?? 10;
  const payableTotal = isFullPay ? Math.round(fullPrice * (1 - fullPayDiscountPercent / 100)) : fullPrice;
  const depositAmount = isFullPay ? payableTotal : Math.round(payableTotal * 0.15); // 15% deposit

  const enrolmentId = `enr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  // Find suitable cohort or 1-on-1 class
  const isOneToOne = course.id === "course-tutoring-children" || Boolean(course.is_private_tutoring);
  const matchedClass = (store.cohorts || seedClasses || []).find((c: any) => c.courseId === course.id);
  const classId = isOneToOne ? "class-tutoring-kids" : matchedClass?.id || "class-adult-care-apr26";

  const newEnrolment: any = {
    id: enrolmentId,
    learnerId,
    courseId: course.id,
    courseSlug: course.slug || course.id,
    courseTitle: course.title,
    courseLevelLabel: level.level_label,
    classId,
    status: "active" as const,
    fundingType: "self_pay" as const,
    assessmentMethod: "criteria" as const,
    completedUnits: [],
    certificateIssued: false,
    enrolledAt: new Date().toISOString(),
    planMonths: isFullPay ? 1 : months,
    tutorName: matchedClass?.tutorName || "Unassigned / TBA",
    sessionTiming: isOneToOne ? ("self_paced" as const) : ("evening" as const),
    tutoringSlot: isOneToOne ? input.tutoringSlot || "Saturday, 10:00am" : undefined,
    tutoringDeliveryMode: isOneToOne ? input.tutoringDeliveryMode || "physical_centre" : undefined,
    tutoringRoomOrAddress: isOneToOne ? input.tutoringRoomOrAddress : undefined,
  };

  // Payment Record
  const paymentId = `pay-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const paymentRef = `SMTC-${Date.now().toString().slice(-6)}`;
  const initialPaymentAmount = isFullPay ? payableTotal : depositAmount;

  const newPayment: any = {
    id: paymentId,
    enrolmentId,
    learnerId,
    amount: initialPaymentAmount,
    currency: "GBP",
    status: input.paymentMethod === "card" ? "paid" : "pending",
    paymentMethod: input.paymentMethod === "card" ? "card" : "bacs",
    reference: paymentRef,
    notes: `${course.title} (${level.level_label}) — ${isFullPay ? "Full Tuition" : "Enrolment Deposit"}`,
    createdAt: new Date().toISOString(),
  };

  // Payment Schedules (if instalment)
  const paymentSchedules: any[] = [];
  if (!isFullPay && months > 1) {
    const remainingBalance = Math.max(0, payableTotal - depositAmount);
    const monthlyRate = Math.round((remainingBalance / (months - 1)) * 100) / 100;

    paymentSchedules.push({
      id: `sched-${enrolmentId}-1`,
      enrolmentId,
      learnerId,
      instalmentNumber: 1,
      dueDate: new Date().toISOString(),
      amount: depositAmount,
      status: input.paymentMethod === "card" ? "paid" : "due",
      paidAt: input.paymentMethod === "card" ? new Date().toISOString() : undefined,
      paymentReference: paymentRef,
      createdAt: new Date().toISOString(),
    });

    for (let i = 2; i <= months; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      paymentSchedules.push({
        id: `sched-${enrolmentId}-${i}`,
        enrolmentId,
        learnerId,
        instalmentNumber: i,
        dueDate: dueDate.toISOString(),
        amount: monthlyRate,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Persist atomically to Neon and store
  await savePersistedRecord({
    enrolment: newEnrolment,
    paymentRecord: newPayment,
    paymentSchedules: paymentSchedules.length > 0 ? paymentSchedules : undefined,
  });

  revalidatePath("/student");
  revalidatePath("/student/courses");
  revalidatePath("/student/payments");
  revalidatePath("/admin/learners");
  revalidatePath("/admin/payments");

  return {
    success: true,
    enrolment: newEnrolment,
    paymentRef,
    amountPaid: initialPaymentAmount,
    isCard: input.paymentMethod === "card",
  };
}
