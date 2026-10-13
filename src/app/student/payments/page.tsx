import React from "react";
import { getServerSession } from "@/lib/session";
import { getPaymentRepo } from "@/lib/repositories";
import { StudentPaymentsClient } from "@/components/student/StudentPaymentsClient";

export const instant = false;

export default async function StudentPaymentsPage() {
  const session = await getServerSession();
  if (!session) return null;

  const learnerId = session.learnerId || "learner-001";
  const paymentRepo = getPaymentRepo();
  const planSummary = await paymentRepo.getMyPaymentPlan(session, learnerId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {!planSummary ? (
        <div className="bg-white rounded-md border border-line p-12 text-center text-xs text-ink-soft">
          No payment plan records found for this learner account.
        </div>
      ) : (
        <StudentPaymentsClient planSummary={planSummary} />
      )}
    </div>
  );
}
