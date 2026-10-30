import { NextRequest, NextResponse } from "next/server";
import {
  getGoCardlessConfig,
  verifyGoCardlessWebhookSignature,
} from "@/lib/gocardless";
import {
  seedPaymentSchedules,
  seedPaymentRecords,
  seedLearners,
  seedEnrolments,
} from "@/lib/repositories/seedData";
import {
  savePersistedRecord,
  updatePaymentScheduleStatusInStore,
  loadPersistedRecords,
} from "@/lib/persistedData";
import { PaymentRecord } from "@/lib/repositories/types";

export const dynamic = "force-dynamic";

/**
 * GoCardless Webhook Endpoint (PRD Section 10 & Live Payment Sync)
 * Automatically processes Direct Debit status updates, payments cleared, and payment failures.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("Webhook-Signature") || "";

    const config = getGoCardlessConfig();
    if (config?.webhookSecret) {
      const isValid = verifyGoCardlessWebhookSignature(
        rawBody,
        signature,
        config.webhookSecret
      );
      if (!isValid) {
        console.error("[GoCardless Webhook] Invalid signature rejected.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 498 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }

    const events = Array.isArray(payload?.events) ? payload.events : [];
    console.log(`[GoCardless Webhook] Processing ${events.length} incoming event(s)...`);

    for (const evt of events) {
      const resourceType = evt.resource_type;
      const action = evt.action;
      const paymentId = evt.links?.payment;
      const mandateId = evt.links?.mandate;

      // 1. PAYMENT EVENTS
      if (resourceType === "payments" && paymentId) {
        if (action === "confirmed" || action === "paid_out") {
          // Payment succeeded & cleared
          const persisted = loadPersistedRecords();
          const allSchedules = [...(persisted.paymentSchedules || []), ...seedPaymentSchedules];
          const matchedSchedule = allSchedules.find(
            (s: any) =>
              s.gocardlessPaymentId === paymentId ||
              s.paymentReference === paymentId ||
              (s.id && evt.details?.metadata?.scheduleItemId === s.id)
          );

          const nowIso = new Date().toISOString();
          if (matchedSchedule) {
            matchedSchedule.status = "paid";
            matchedSchedule.paidAt = nowIso;
            delete matchedSchedule.adminQuery;
            delete matchedSchedule.reportedTransfer;

            updatePaymentScheduleStatusInStore(matchedSchedule.id, {
              status: "paid",
              paidAt: nowIso,
              adminQuery: undefined,
              reportedTransfer: undefined,
            });

            // Append PaymentRecord if not already recorded
            const allRecords = [...(persisted.paymentRecords || []), ...seedPaymentRecords];
            const exists = allRecords.some(
              (p) => p.gocardlessPaymentId === paymentId || p.reference === paymentId
            );

            if (!exists) {
              const learner = seedLearners.find((l) => l.id === matchedSchedule.learnerId);
              const enrolment = seedEnrolments.find((e) => e.id === matchedSchedule.enrolmentId);

              const record: PaymentRecord = {
                id: `pay-gc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                enrolmentId: matchedSchedule.enrolmentId,
                learnerId: matchedSchedule.learnerId,
                learnerName: learner ? `${learner.firstName} ${learner.lastName}` : "Student",
                courseTitle: enrolment?.courseTitle || matchedSchedule.courseTitle || "Course Instalment",
                amountGbp: matchedSchedule.amountGbp,
                method: "gocardless",
                reference: paymentId,
                gocardlessPaymentId: paymentId,
                gocardlessMandateId: mandateId,
                status: "paid",
                paidAt: nowIso,
                notes: `Direct Debit instalment paid via GoCardless (${paymentId})`,
              };

              seedPaymentRecords.push(record);
              savePersistedRecord({ paymentRecord: record });
            }
          }
        } else if (action === "failed" || action === "cancelled") {
          // Payment failed (e.g. insufficient funds)
          const persisted = loadPersistedRecords();
          const allSchedules = [...(persisted.paymentSchedules || []), ...seedPaymentSchedules];
          const matchedSchedule = allSchedules.find(
            (s: any) =>
              s.gocardlessPaymentId === paymentId ||
              s.paymentReference === paymentId ||
              (s.id && evt.details?.metadata?.scheduleItemId === s.id)
          );

          if (matchedSchedule && matchedSchedule.status !== "paid") {
            matchedSchedule.status = "overdue";
            updatePaymentScheduleStatusInStore(matchedSchedule.id, {
              status: "overdue",
            });
            console.warn(`[GoCardless Webhook] Marked schedule item ${matchedSchedule.id} as OVERDUE due to failed direct debit.`);
          }
        }
      }

      // 2. MANDATE EVENTS
      if (resourceType === "mandates" && mandateId) {
        if (action === "cancelled" || action === "failed") {
          console.warn(`[GoCardless Webhook] Mandate ${mandateId} was cancelled or failed.`);
        }
      }
    }

    return NextResponse.json({ received: true, processedEvents: events.length }, { status: 200 });
  } catch (err: any) {
    console.error("[GoCardless Webhook Unhandled Exception]:", err);
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
  }
}

