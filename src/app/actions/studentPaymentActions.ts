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

export interface ReportBankTransferInput {
  scheduleItemId: string;
  payerReference?: string;
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
    throw new Error("No learner record is linked to this account.");
  }

  const item = seedPaymentSchedules.find((s) => s.id === input.scheduleItemId);
  if (!item || item.learnerId !== learnerId) {
    throw new Error("Instalment not found on your account.");
  }
  if (item.status === "paid") {
    throw new Error("This instalment is already marked as paid.");
  }

  const notifiedAt = new Date().toISOString();
  const noticeRef = `TRF-${Date.now().toString().slice(-6)}`;
  const payerRef = input.payerReference?.trim().slice(0, 60) || "Student ID";

  item.status = "awaiting_confirmation";
  item.reportedTransfer = {
    reference: payerRef,
    receiptUrl: input.receiptUrl,
    receiptFileName: input.receiptFileName,
    reportedAt: notifiedAt,
  };
  delete item.adminQuery;

  const { updatePaymentScheduleStatusInStore } = await import("@/lib/persistedData");
  updatePaymentScheduleStatusInStore(item.id, {
    status: "awaiting_confirmation",
    reportedTransfer: item.reportedTransfer,
    adminQuery: undefined,
  });

  // Alert the owner so they can verify the bank statement and confirm.
  demoOutbox.unshift({
    id: `outbox-transfer-${Date.now()}`,
    recipientEmail: siteConfig.contact.email,
    recipientName: "Student Accounts",
    subject: `Transfer reported: ${session.name}, instalment ${item.instalmentNumber} of ${item.totalInstalments}`,
    renderedBody: `${session.name} (${session.email}) reports sending a bank transfer.\n\nInstalment: ${item.instalmentNumber} of ${item.totalInstalments}\nAmount due: ${formatCurrency(item.amountGbp)}\nDue date: ${item.dueDate}\nPayer reference: ${payerRef}\nReceipt uploaded: ${input.receiptFileName || "None (reference only)"}\nNotice: ${noticeRef}\n\nCheck the bank statement or preview the uploaded receipt, then confirm receipt in Payments Ledger (/admin/payments). The instalment stays unpaid until you confirm.`,
    templateKey: "transfer_reported_owner",
    sentAt: notifiedAt,
    triggerEvent: "Student Reported Bank Transfer",
  });

  // Acknowledge to the student.
  demoOutbox.unshift({
    id: `outbox-transfer-ack-${Date.now()}`,
    recipientEmail: session.email,
    recipientName: session.name,
    subject: `We have your transfer notice (${noticeRef})`,
    renderedBody: `Dear ${session.name},\n\nThanks for letting us know you have sent ${formatCurrency(item.amountGbp)} for instalment ${item.instalmentNumber} of ${item.totalInstalments}.${input.receiptFileName ? ` Your payment proof (${input.receiptFileName}) was received.` : ""}\n\nStudent Accounts will confirm once it shows on our statement, usually within one working day. You will get a receipt by email then.\n\nNotice reference: ${noticeRef}\n\nStudent Accounts\nSmartminds Training College`,
    templateKey: "transfer_reported_student",
    sentAt: notifiedAt,
    triggerEvent: "Student Reported Bank Transfer",
  });

  try {
    revalidatePath("/admin/payments");
    revalidatePath("/student/payments");
  } catch {}

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
  } catch {}

  return { success: true, receiptReference: receiptRef };
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
