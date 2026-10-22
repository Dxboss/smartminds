import React from "react";
import { connection } from "next/server";
import { getServerSession } from "@/lib/session";
import { getPaymentRepo } from "@/lib/repositories";
import { StudentPaymentsClient } from "@/components/student/StudentPaymentsClient";
import { fulfillStripeCheckoutSession } from "@/app/actions/enrolmentActions";

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
    paid?: string;
  }>;
}

export default async function StudentPaymentsPage({ searchParams }: PageProps) {
  await connection();
  const params = await searchParams;

  if (params.session_id) {
    try {
      await fulfillStripeCheckoutSession(params.session_id);
    } catch (err) {
      console.warn("[Student Payments]: Stripe session fulfillment error:", err);
    }
  }

  const session = await getServerSession();
  if (!session) return null;

  const learnerId = session.learnerId || "learner-001";
  const paymentRepo = getPaymentRepo();
  const [planSummary, bankSettings] = await Promise.all([
    paymentRepo.getMyPaymentPlan(session, learnerId),
    paymentRepo.getCollegeBankSettings(session),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {!planSummary ? (
        <div className="bg-white rounded-md border border-line p-12 text-center text-xs text-ink-soft">
          No payment plan records found for this learner account.
        </div>
      ) : (
        <StudentPaymentsClient
          planSummary={planSummary}
          collegeBankSettings={{
            bankName: bankSettings.bankName,
            accountName: bankSettings.accountName,
            sortCode: bankSettings.sortCode,
            accountNumber: bankSettings.accountNumber,
            bacsReferencePrefix: bankSettings.bacsReferencePrefix,
          }}
        />
      )}
    </div>
  );
}
