"use client";

import React, { useState, useTransition } from "react";
import { LearnerPaymentPlanSummary } from "@/lib/repositories/types";
import { formatCurrency } from "@/content/pricing";
import { Icon } from "@/components/ui/Icon";
import { reportBankTransferAction } from "@/app/actions/studentPaymentActions";

interface StudentPaymentsClientProps {
  planSummary: LearnerPaymentPlanSummary;
}

function daysUntil(dateStr: string): number {
  const due = new Date(`${dateStr}T00:00:00`).getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

export function StudentPaymentsClient({ planSummary }: StudentPaymentsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payerRef, setPayerRef] = useState("");
  const [isPending, startTransition] = useTransition();
  const [modalError, setModalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  const nextUnpaid = planSummary.schedule.find((s) => s.status !== "paid");
  const days = nextUnpaid ? daysUntil(nextUnpaid.dueDate) : null;
  const isOverdue = !!nextUnpaid && (nextUnpaid.status === "overdue" || (days !== null && days < 0));
  const isSoon = !isOverdue && days !== null && days <= 3;
  const alreadyReported = !!nextUnpaid && reportedIds.includes(nextUnpaid.id);

  const openModal = () => {
    setModalError(null);
    setNotice(null);
    setPayerRef("");
    setIsModalOpen(true);
  };

  const handleReport = () => {
    if (!nextUnpaid) return;
    setModalError(null);
    startTransition(async () => {
      try {
        const res = await reportBankTransferAction({
          scheduleItemId: nextUnpaid.id,
          payerReference: payerRef,
        });
        setReportedIds((prev) => [...prev, nextUnpaid.id]);
        setNotice(res.noticeReference);
      } catch (err: unknown) {
        setModalError(err instanceof Error ? err.message : "Could not send your notice. Please try again.");
      }
    });
  };

  const bannerTone = isOverdue
    ? "bg-red-50 border-red-300 text-red-900"
    : isSoon
    ? "bg-amber-50 border-amber-300 text-amber-900"
    : "bg-white border-line text-navy-900";

  return (
    <div className="space-y-6">
      {/* Payment reminder */}
      {nextUnpaid && (
        <section
          aria-label="Next instalment reminder"
          className={`p-4 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${bannerTone}`}
        >
          <div className="flex items-start gap-3">
            <Icon name={isOverdue ? "alert-circle" : "clock"} size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {isOverdue ? "Instalment overdue" : isSoon ? "Instalment due soon" : "Next instalment"}
                {" · "}
                {nextUnpaid.instalmentNumber} of {nextUnpaid.totalInstalments}
              </p>
              <p className="text-sm mt-1 leading-relaxed">
                {isOverdue ? (
                  <>
                    <strong>{formatCurrency(nextUnpaid.amountGbp)}</strong> was due on{" "}
                    <strong>{nextUnpaid.dueDate}</strong>. Please pay before{" "}
                    <strong>{nextUnpaid.graceExpiryDate}</strong> to keep your study access.
                  </>
                ) : (
                  <>
                    <strong>{formatCurrency(nextUnpaid.amountGbp)}</strong> is due{" "}
                    <strong>
                      {days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}
                    </strong>{" "}
                    ({nextUnpaid.dueDate}).
                  </>
                )}
                {alreadyReported && " We have your transfer notice and will confirm shortly."}
              </p>
            </div>
          </div>

          {!alreadyReported && (
            <button
              type="button"
              id="open-pay-instalment"
              onClick={openModal}
              className="w-full sm:w-auto px-4 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-semibold text-sm transition-colors min-h-[44px] inline-flex items-center justify-center gap-2"
            >
              <Icon name="credit-card" size={16} />
              <span>How to pay</span>
            </button>
          )}
        </section>
      )}

      {/* Header */}
      <div className="bg-white rounded-sm border border-line p-6 sm:p-8 space-y-1">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
          My payment plan
        </h1>
        <p className="text-sm text-ink-soft">
          Your instalment schedule, receipts and upcoming due dates.
        </p>
      </div>

      {/* Summary */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-sm overflow-hidden">
        {[
          { label: "Course fee", value: formatCurrency(planSummary.totalAmountGbp), note: planSummary.courseTitle },
          { label: "Paid so far", value: formatCurrency(planSummary.totalPaidGbp), note: `${planSummary.history.length} receipts` },
          { label: "Left to pay", value: formatCurrency(planSummary.balanceRemainingGbp), note: "0% interest" },
          {
            label: "Next due",
            value: planSummary.nextDueDate || "Settled",
            note: planSummary.nextDueAmountGbp ? formatCurrency(planSummary.nextDueAmountGbp) : "Nothing outstanding",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 sm:p-5">
            <dt className="text-xs font-semibold text-ink-soft uppercase tracking-wider">{s.label}</dt>
            <dd className="font-heading text-2xl sm:text-3xl font-bold text-navy-900 mt-1">{s.value}</dd>
            <dd className="text-xs text-ink-soft truncate">{s.note}</dd>
          </div>
        ))}
      </dl>

      {/* Schedule */}
      <section className="bg-white rounded-sm border border-line p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-navy-900 flex items-center gap-2">
          <Icon name="calendar" size={18} />
          Instalment schedule
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="py-2.5 px-3 font-semibold">Instalment</th>
                <th className="py-2.5 px-3 font-semibold">Due</th>
                <th className="py-2.5 px-3 font-semibold">Amount</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Grace ends</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {planSummary.schedule.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-3 font-semibold text-navy-900">
                    {item.instalmentNumber} of {item.totalInstalments}
                  </td>
                  <td className="py-3 px-3 text-ink-soft">{item.dueDate}</td>
                  <td className="py-3 px-3 font-semibold text-navy-900">{formatCurrency(item.amountGbp)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-sm font-semibold text-[11px] ${
                        item.status === "paid"
                          ? "bg-emerald-50 text-emerald-800"
                          : item.status === "overdue"
                          ? "bg-red-50 text-red-800"
                          : reportedIds.includes(item.id)
                          ? "bg-amber-50 text-amber-900"
                          : "bg-paper text-ink"
                      }`}
                    >
                      {item.status === "paid"
                        ? `Paid ${item.paidAt ? new Date(item.paidAt).toLocaleDateString("en-GB") : ""}`
                        : reportedIds.includes(item.id)
                        ? "Awaiting confirmation"
                        : item.status === "overdue"
                        ? "Overdue"
                        : "Due"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-ink-soft font-mono text-[11px]">{item.graceExpiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Receipts */}
      <section className="bg-white rounded-sm border border-line p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-navy-900 flex items-center gap-2">
          <Icon name="check-circle" size={18} />
          Receipts
        </h2>
        {planSummary.history.length === 0 ? (
          <p className="text-sm text-ink-soft">No payments recorded yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {planSummary.history.map((rec) => (
              <li key={rec.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div>
                  <span className="font-mono text-xs font-bold text-navy-900">{rec.reference}</span>
                  <span className="block text-xs text-ink-soft capitalize">
                    {rec.method.replace("_", " ")} · {new Date(rec.paidAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <strong className="text-navy-900">{formatCurrency(rec.amountGbp)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* How to pay modal */}
      {isModalOpen && nextUnpaid && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60"
        >
          <div className="bg-white rounded-lg border border-line max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="pay-modal-title" className="font-heading text-xl font-bold text-navy-900">
                  {notice ? "Thanks, we have your notice" : `Pay instalment ${nextUnpaid.instalmentNumber}`}
                </h3>
                <p className="text-xs text-ink-soft">
                  {formatCurrency(nextUnpaid.amountGbp)} due {nextUnpaid.dueDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="w-11 h-11 -mr-2 -mt-2 inline-flex items-center justify-center text-ink-soft hover:text-navy-900"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {notice ? (
              <div className="space-y-4">
                <p className="text-sm text-ink leading-relaxed">
                  Student Accounts will check the bank statement and confirm, usually within one
                  working day. Your receipt arrives by email once it is confirmed.
                </p>
                <p className="text-xs text-ink-soft">
                  Notice reference <span className="font-mono font-bold text-navy-900">{notice}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full min-h-[44px] rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-semibold text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {modalError && (
                  <p role="alert" className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-sm text-xs">
                    {modalError}
                  </p>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">Bank transfer</h4>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    Use the college bank details on your enrolment email, with your student ID as the
                    reference. Then tell us below so we can match it.
                  </p>
                  <label htmlFor="payer-ref" className="block text-xs font-semibold text-navy-900 pt-1">
                    Reference you used (optional)
                  </label>
                  <input
                    id="payer-ref"
                    type="text"
                    maxLength={60}
                    value={payerRef}
                    onChange={(e) => setPayerRef(e.target.value)}
                    placeholder="e.g. your student ID"
                    className="w-full px-3 min-h-[44px] border border-line rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                  <button
                    type="button"
                    id="report-transfer"
                    disabled={isPending}
                    onClick={handleReport}
                    className="w-full min-h-[44px] rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-semibold text-sm disabled:opacity-60"
                  >
                    {isPending ? "Sending..." : "I have sent the transfer"}
                  </button>
                </div>

                <div className="p-3 rounded-sm border border-dashed border-line bg-paper flex items-start gap-2.5">
                  <Icon name="credit-card" size={16} className="text-ink-soft mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-navy-900">Card payment</p>
                    <p className="text-xs text-ink-soft">Not enabled yet, contact your developer.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
