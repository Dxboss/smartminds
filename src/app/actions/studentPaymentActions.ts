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

export interface ReportBankTransferInput {
  scheduleItemId: string;
  payerReference?: string;
}

/**
 * Student reports that they have sent a bank transfer for an instalment.
 *
 * This does NOT mark the instalment as paid. Only the owner can confirm
 * receipt via the Payments Ledger (PaymentRepo.markBankTransferReceived),
 * so a student can never settle their own balance. No card processing
 * exists in this phase.
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
  const payerRef = input.payerReference?.trim().slice(0, 60) || "Not provided";

  // Alert the owner so they can verify the bank statement and confirm.
  demoOutbox.unshift({
    id: `outbox-transfer-${Date.now()}`,
    recipientEmail: siteConfig.contact.email,
    recipientName: "Student Accounts",
    subject: `Transfer reported: ${session.name}, instalment ${item.instalmentNumber} of ${item.totalInstalments}`,
    renderedBody: `${session.name} (${session.email}) reports sending a bank transfer.\n\nInstalment: ${item.instalmentNumber} of ${item.totalInstalments}\nAmount due: ${formatCurrency(item.amountGbp)}\nDue date: ${item.dueDate}\nPayer reference: ${payerRef}\nNotice: ${noticeRef}\n\nCheck the bank statement, then confirm receipt in Payments Ledger (/admin/payments). The instalment stays unpaid until you confirm.`,
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
    renderedBody: `Dear ${session.name},\n\nThanks for letting us know you have sent ${formatCurrency(item.amountGbp)} for instalment ${item.instalmentNumber} of ${item.totalInstalments}.\n\nStudent Accounts will confirm once it shows on our statement, usually within one working day. You will get a receipt by email then.\n\nNotice reference: ${noticeRef}\n\nStudent Accounts\nSmartminds Training College`,
    templateKey: "transfer_reported_student",
    sentAt: notifiedAt,
    triggerEvent: "Student Reported Bank Transfer",
  });

  revalidatePath("/admin/payments");
  return { success: true, noticeReference: noticeRef, notifiedAt };
}
