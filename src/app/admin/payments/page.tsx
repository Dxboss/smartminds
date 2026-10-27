import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import {
  getPaymentRepo,
  getLearnerRepo,
  getEnrolmentRepo,
} from "@/lib/repositories";
import { PaymentsLedgerView } from "@/components/admin/PaymentsLedgerView";


export const metadata: Metadata = {
  title: "Tuition Payments Ledger | Smartminds Administration",
  description:
    "College financial ledger, fee collections, instalment schedules, and BACS bank transfer verification.",
};

export default async function AdminPaymentsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/admin/payments");
  }

  // Security barrier: Staff have NO access to payments
  if (session.role === "admin_staff") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="p-8 rounded-md bg-white border border-line shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-700 mx-auto flex items-center justify-center font-bold">
            !
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">
            Permission Denied: Financial Ledger
          </h1>
          <p className="text-sm text-ink-soft max-w-md mx-auto">
            Administrative staff accounts are strictly prohibited from accessing tuition payments, fee ledgers, and banking records under college financial governance.
          </p>
        </div>
      </div>
    );
  }

  if (session.role !== "owner_admin" && session.role !== "super_admin") {
    redirect("/login");
  }

  const paymentRepo = getPaymentRepo();
  const learnerRepo = getLearnerRepo();
  const enrolmentRepo = getEnrolmentRepo();

  const [ledgerRecords, ledgerSummary, schedules, learnerPlans, learners, enrolments] = await Promise.all([
    paymentRepo.getLedger(session),
    paymentRepo.getLedgerSummary(session),
    paymentRepo.getPaymentSchedules(session),
    paymentRepo.getAllLearnerPaymentPlans(session),
    learnerRepo.listLearners(session),
    enrolmentRepo.listEnrolments(session),
  ]);

  return (
    <PaymentsLedgerView
      ledgerRecords={ledgerRecords}
      ledgerSummary={ledgerSummary}
      schedules={schedules}
      learnerPlans={learnerPlans}
      learners={learners}
      enrolments={enrolments}
      userRole={session.role}
    />
  );
}
