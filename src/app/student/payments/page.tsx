import React from "react";
import { getServerSession } from "@/lib/session";
import { getPaymentRepo } from "@/lib/repositories";
import { formatCurrency } from "@/content/pricing";
import { Icon } from "@/components/ui/Icon";

export default async function StudentPaymentsPage() {
  const session = await getServerSession();
  if (!session) return null;

  const learnerId = session.learnerId || "learner-001";
  const paymentRepo = getPaymentRepo();
  const planSummary = await paymentRepo.getMyPaymentPlan(session, learnerId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="credit-card" size={14} />
            <span>Learner Financial Account</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            My payment plan & balance
          </h1>
          <p className="text-sm text-ink-soft">
            Review your instalment plan schedule, receipt history, and upcoming payment due dates.
          </p>
        </div>

        {/* Disabled Pay Now CTA with Tooltip per PRD 12.5 */}
        <div className="relative group">
          <button
            type="button"
            disabled
            className="px-5 py-2.5 rounded-sm bg-navy-900/40 text-white text-xs font-bold cursor-not-allowed inline-flex items-center gap-2 min-h-[44px]"
            aria-describedby="pay-now-tooltip"
          >
            <Icon name="credit-card" size={16} />
            <span>Pay now</span>
          </button>
          <div
            id="pay-now-tooltip"
            role="tooltip"
            className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-navy-900 text-white text-[11px] rounded-sm shadow-lg text-center z-30"
          >
            Payment processing is disabled in demo mode. No cards are charged.
          </div>
        </div>
      </div>

      {!planSummary ? (
        <div className="bg-white rounded-md border border-line p-12 text-center text-xs text-ink-soft">
          No payment plan records found for this learner account.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Total Course Fee
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                {formatCurrency(planSummary.totalAmountGbp)}
              </span>
              <span className="text-xs text-ink-soft">
                {planSummary.courseTitle}
              </span>
            </div>

            <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Paid to Date
              </span>
              <span className="font-heading text-3xl font-bold text-emerald-700 block">
                {formatCurrency(planSummary.totalPaidGbp)}
              </span>
              <span className="text-xs text-emerald-800 font-semibold inline-flex items-center gap-1">
                <Icon name="check" size={12} />
                <span>Verified receipts</span>
              </span>
            </div>

            <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Remaining Balance
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                {formatCurrency(planSummary.balanceRemainingGbp)}
              </span>
              <span className="text-xs text-ink-soft">
                Scheduled over instalments
              </span>
            </div>

            <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Next Due Date
              </span>
              <span className="font-heading text-2xl font-bold text-navy-900 block">
                {planSummary.nextDueDate || "Fully Settled"}
              </span>
              <span className="text-xs text-ink-soft">
                {planSummary.nextDueAmountGbp
                  ? `${formatCurrency(planSummary.nextDueAmountGbp)} due`
                  : "All instalments complete"}
              </span>
            </div>
          </div>

          {/* Payment Schedule Table */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="calendar" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Instalment payment schedule
                </h2>
              </div>
              <span className="text-xs font-semibold text-ink-soft">
                {planSummary.schedule.length} Instalments
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                    <th className="py-2.5 px-3">Instalment</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Paid Date</th>
                    <th className="py-2.5 px-3">Grace Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {planSummary.schedule.map((item) => (
                    <tr key={item.id} className="hover:bg-paper/40">
                      <td className="py-3 px-3 font-bold text-navy-900">
                        Instalment {item.instalmentNumber} of {item.totalInstalments}
                      </td>
                      <td className="py-3 px-3 text-ink-soft">{item.dueDate}</td>
                      <td className="py-3 px-3 font-semibold text-navy-900">
                        {formatCurrency(item.amountGbp)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-sm font-semibold uppercase text-[10px] tracking-wider ${
                            item.status === "paid"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : item.status === "overdue"
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-ink-soft">
                        {item.paidAt
                          ? new Date(item.paidAt).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="py-3 px-3 text-ink-soft font-mono text-[11px]">
                        {item.graceExpiryDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Receipts History */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Payment receipt history
                </h2>
              </div>
              <span className="text-xs font-semibold text-ink-soft">
                {planSummary.history.length} Transactions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                    <th className="py-2.5 px-3">Receipt Reference</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Date Received</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {planSummary.history.map((rec) => (
                    <tr key={rec.id} className="hover:bg-paper/40">
                      <td className="py-3 px-3 font-mono text-xs font-bold text-navy-900">
                        {rec.reference}
                      </td>
                      <td className="py-3 px-3 capitalize text-ink-soft">
                        {rec.method.replace("_", " ")}
                      </td>
                      <td className="py-3 px-3 font-semibold text-navy-900">
                        {formatCurrency(rec.amountGbp)}
                      </td>
                      <td className="py-3 px-3 text-ink-soft">
                        {new Date(rec.paidAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px] uppercase">
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
