"use client";

import React, { useState, useTransition } from "react";
import { LearnerPaymentPlanSummary, PaymentScheduleItem } from "@/lib/repositories/types";
import { formatCurrency } from "@/content/pricing";
import { formatPaymentPlanLabel } from "@/content/plans";
import { Icon } from "@/components/ui/Icon";
import {
  reportBankTransferAction,
  payInstalmentWithStripeAction,
  switchInstalmentsToGoCardlessAction,
} from "@/app/actions/studentPaymentActions";

interface CollegeBankDetails {
  bankName: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
  bacsReferencePrefix: string;
}

interface StudentPaymentsClientProps {
  planSummary: LearnerPaymentPlanSummary;
  collegeBankSettings?: CollegeBankDetails;
}

function daysUntil(dateStr: string): number {
  const due = new Date(`${dateStr}T00:00:00`).getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

export function StudentPaymentsClient({
  planSummary,
  collegeBankSettings,
}: StudentPaymentsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"choose" | "stripe" | "gocardless" | "transfer">("stripe");
  const [payerRef, setPayerRef] = useState("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [modalError, setModalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [stripeSuccessRef, setStripeSuccessRef] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [selectedScheduleItem, setSelectedScheduleItem] =
    useState<PaymentScheduleItem | null>(null);

  // Find next unpaid instalment
  const nextUnpaid = planSummary.schedule.find((s) => s.status !== "paid");
  const activeModalItem = selectedScheduleItem || nextUnpaid;

  const days = nextUnpaid ? daysUntil(nextUnpaid.dueDate) : null;
  const isOverdue =
    !!nextUnpaid &&
    (nextUnpaid.status === "overdue" || (days !== null && days < 0));
  const isSoon = !isOverdue && days !== null && days <= 3;
  const isAwaitingConf =
    !!nextUnpaid &&
    (nextUnpaid.status === "awaiting_confirmation" ||
      reportedIds.includes(nextUnpaid.id));
  const hasAdminQuery = !!nextUnpaid && (nextUnpaid.status === "action_required" || !!nextUnpaid.adminQuery);

  // Time-gated: Card payment unlocks 7 days before due date, or anytime if overdue / in grace
  const isCardPaymentUnlocked =
    !!activeModalItem &&
    (activeModalItem.status === "overdue" ||
      daysUntil(activeModalItem.dueDate) <= 7);

  const bank = collegeBankSettings || {
    bankName: "Barclays Bank UK PLC",
    accountName: "Smartminds Training College Ltd",
    sortCode: "20-04-15",
    accountNumber: "43928104",
    bacsReferencePrefix: "SMTC",
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setModalError("File exceeds 8MB limit. Please upload a smaller receipt or screenshot.");
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openPaymentModal = (
    defaultTab: "choose" | "stripe" | "gocardless" | "transfer" = "stripe",
    targetItem?: PaymentScheduleItem
  ) => {
    const item = targetItem || activeModalItem;
    setSelectedScheduleItem(targetItem || null);
    setModalError(null);
    setNotice(null);
    setPayerRef("");
    setTransferAmount(item ? item.amountGbp.toFixed(2) : "");
    setReceiptFileName(null);
    setReceiptDataUrl(null);
    setModalMode(defaultTab);
    setIsModalOpen(true);
  };

  const handleSwitchToGoCardless = () => {
    if (!activeModalItem) return;
    setModalError(null);
    startTransition(async () => {
      try {
        const res = await switchInstalmentsToGoCardlessAction(
          activeModalItem.id,
          window.location.origin
        );
        if (res.hasGoCardless && res.redirectUrl) {
          window.location.href = res.redirectUrl;
          return;
        }
        setNotice(res.message || "Direct Debit mandate successfully configured.");
      } catch (err: unknown) {
        setModalError(
          err instanceof Error
            ? err.message
            : "Direct Debit setup failed. Please try again."
        );
      }
    });
  };

  const handleReportBankTransfer = () => {
    if (!activeModalItem) return;
    setModalError(null);
    const amountNum = parseFloat(transferAmount);
    const resolvedAmount = amountNum > 0 ? amountNum : activeModalItem.amountGbp;

    startTransition(async () => {
      try {
        const res = await reportBankTransferAction({
          scheduleItemId: activeModalItem.id,
          payerReference: payerRef || planSummary.learnerId || "Student ID",
          amountGbp: resolvedAmount,
          receiptUrl: receiptDataUrl || undefined,
          receiptFileName: receiptFileName || undefined,
        });
        setReportedIds((prev) => [...prev, activeModalItem.id]);
        activeModalItem.status = "awaiting_confirmation";
        activeModalItem.reportedTransfer = {
          reference: payerRef || planSummary.learnerId || "Student ID",
          amountGbp: resolvedAmount,
          receiptUrl: receiptDataUrl || undefined,
          receiptFileName: receiptFileName || undefined,
          reportedAt: new Date().toISOString(),
        };
        delete activeModalItem.adminQuery;
        setNotice(res.noticeReference);
      } catch (err: unknown) {
        setModalError(
          err instanceof Error
            ? err.message
            : "Could not send your transfer notice. Please try again."
        );
      }
    });
  };

  const handlePayWithStripe = () => {
    if (!activeModalItem) return;
    setModalError(null);
    startTransition(async () => {
      try {
        const res = await payInstalmentWithStripeAction(
          activeModalItem.id,
          window.location.origin
        );
        if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
          return;
        }
        setStripeSuccessRef(res.receiptReference);
        setIsModalOpen(false);
      } catch (err: unknown) {
        setModalError(
          err instanceof Error
            ? err.message
            : "Card payment failed to process. Please try again."
        );
      }
    });
  };

  const bannerTone = hasAdminQuery
    ? "bg-rose-50 border-rose-300 text-rose-900"
    : isOverdue
      ? "bg-red-50 border-red-300 text-red-900"
      : isSoon
        ? "bg-amber-50 border-amber-300 text-amber-900"
        : "bg-white border-line text-navy-900";

  return (
    <div className="space-y-6">
      {/* Stripe Instant Approval Banner */}
      {stripeSuccessRef && (
        <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon name="check-circle" size={20} className="text-emerald-700 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Payment successfully approved & settled via Stripe</p>
              <p className="text-xs text-emerald-800">
                Official Receipt: <strong className="font-mono">{stripeSuccessRef}</strong>. Your payment schedule has been updated.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStripeSuccessRef(null)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Payment Reminder / Query Banner */}
      {nextUnpaid && (
        <section
          aria-label="Next instalment reminder"
          className={`p-4 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${bannerTone}`}
        >
          <div className="flex items-start gap-3">
            <Icon
              name={hasAdminQuery ? "alert-circle" : isOverdue ? "alert-circle" : "clock"}
              size={20}
              className="flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {hasAdminQuery
                  ? "Action required — Payment query"
                  : isOverdue
                    ? "Instalment overdue"
                    : isSoon
                      ? "Instalment due soon"
                      : "Next instalment"}
                {" · "}
                {nextUnpaid.instalmentNumber} of {nextUnpaid.totalInstalments}
              </p>

              <div className="text-sm mt-1 leading-relaxed">
                {hasAdminQuery ? (
                  <div>
                    <p className="font-medium">
                      Student Accounts queried your reported payment:{" "}
                      <span className="italic">"{nextUnpaid.adminQuery?.note}"</span>
                    </p>
                    <p className="text-xs text-ink-soft mt-1">
                      Please re-verify your reference, upload a clearer receipt screenshot, or pay via card.
                    </p>
                  </div>
                ) : isOverdue ? (
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
                {isAwaitingConf && !hasAdminQuery && (
                  <span className="font-semibold text-amber-900 block mt-1">
                    ✓ We have received your transfer notice & proof. Accounts will confirm within 1 working day.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Primary Action 1: Time-gated Stripe Card Payment */}
            {isCardPaymentUnlocked && !isAwaitingConf && (
              <button
                type="button"
                id="pay-with-card-btn"
                onClick={() => openPaymentModal("stripe")}
                disabled={isPending}
                className="w-full sm:w-auto px-4 py-2.5 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-semibold text-sm transition-colors min-h-[44px] inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <Icon name="credit-card" size={16} />
                <span>Pay {formatCurrency(nextUnpaid.amountGbp)} via Card</span>
              </button>
            )}

            {/* Action 2: Bank Transfer or re-upload */}
            <button
              type="button"
              id="open-pay-instalment"
              onClick={() => openPaymentModal("transfer")}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-sm font-heading font-semibold text-sm transition-colors min-h-[44px] inline-flex items-center justify-center gap-2 ${isCardPaymentUnlocked && !isAwaitingConf
                  ? "bg-white border border-line text-navy-900 hover:bg-paper"
                  : "bg-navy-900 text-white hover:bg-navy-700"
                }`}
            >
              <Icon name="calendar" size={16} />
              <span>{hasAdminQuery ? "Update Transfer Notice" : "Bank Transfer"}</span>
            </button>
          </div>
        </section>
      )}

      {/* Header */}
      <div className="bg-white rounded-sm border border-line p-6 sm:p-8 space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              My payment plan
            </h1>
            <p className="text-sm text-ink-soft">
              Your instalment schedule, receipts and upcoming due dates.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xs bg-navy-900/10 text-navy-900 font-bold text-xs">
            {formatPaymentPlanLabel({
              planMonths: planSummary.planMonths || planSummary.schedule.length,
              courseTitle: planSummary.courseTitle,
            })}
          </span>
        </div>
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

      {/* Multi-Course Breakdown if student has 2 or more qualifications */}
      {planSummary.courses && planSummary.courses.length > 1 && (
        <section className="bg-white rounded-sm border border-line p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-navy-900 flex items-center gap-2">
              <Icon name="book-open" size={18} />
              Enrolled Courses &amp; Payment Breakdown ({planSummary.courses.length})
            </h2>
            <span className="text-xs text-ink-soft">
              Combined summary above includes all active qualification plans
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planSummary.courses.map((c) => (
              <div
                key={c.enrolmentId}
                className="p-4 rounded-sm border border-line bg-paper/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm">
                      {c.courseTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {(c.courseLevelLabel || c.levelLabel) && (
                        <span className="px-1.5 py-0.5 rounded-xs bg-gold-300/40 border border-gold-500/40 text-navy-900 font-bold text-[10px]">
                          {c.courseLevelLabel || c.levelLabel}
                        </span>
                      )}
                      <span className="text-xs text-ink-soft font-semibold">
                        {formatPaymentPlanLabel({
                          planMonths: c.planMonths,
                          courseTitle: c.courseTitle,
                        })}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${c.balanceRemainingGbp <= 0
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                  >
                    {c.balanceRemainingGbp <= 0 ? "Settled" : "Active"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded border border-line">
                    <span className="text-[10px] text-ink-soft block">Course Fee</span>
                    <strong className="text-navy-900 font-mono">
                      {formatCurrency(c.totalAmountGbp)}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-line">
                    <span className="text-[10px] text-ink-soft block">Paid to Date</span>
                    <strong className="text-emerald-700 font-mono">
                      {formatCurrency(c.totalPaidGbp)}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-line">
                    <span className="text-[10px] text-ink-soft block">Remaining</span>
                    <strong
                      className={`font-mono ${c.balanceRemainingGbp <= 0
                          ? "text-emerald-700"
                          : "text-amber-800"
                        }`}
                    >
                      {formatCurrency(c.balanceRemainingGbp)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Schedule */}
      <section className="bg-white rounded-sm border border-line p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-navy-900 flex items-center gap-2">
            <Icon name="calendar" size={18} />
            Instalment schedule
          </h2>
          <span className="text-xs text-ink-soft">
            Card payment unlocks 7 days prior to each due date
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="py-2.5 px-3 font-semibold">Instalment</th>
                <th className="py-2.5 px-3 font-semibold">Due</th>
                <th className="py-2.5 px-3 font-semibold">Amount</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Grace ends</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {planSummary.schedule.map((item) => {
                const itemDays = daysUntil(item.dueDate);
                const itemCardUnlocked = item.status !== "paid" && itemDays <= 7;
                return (
                  <tr key={item.id}>
                    <td className="py-3 px-3 font-semibold text-navy-900">
                      <div>
                        {item.instalmentNumber} of {item.totalInstalments}
                      </div>
                      {(item.courseTitle || item.description) && (
                        <div className="text-[10px] text-ink-soft font-normal truncate max-w-xs mt-0.5">
                          {item.courseTitle || item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-ink-soft">{item.dueDate}</td>
                    <td className="py-3 px-3 font-semibold text-navy-900">{formatCurrency(item.amountGbp)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-sm font-semibold text-[11px] inline-flex items-center gap-1 ${item.status === "paid"
                            ? "bg-emerald-50 text-emerald-800"
                            : item.status === "action_required" || item.adminQuery
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : item.status === "awaiting_confirmation" || reportedIds.includes(item.id)
                                ? "bg-amber-50 text-amber-900"
                                : item.status === "overdue"
                                  ? "bg-red-50 text-red-800"
                                  : "bg-paper text-ink"
                          }`}
                      >
                        {item.status === "paid"
                          ? `Paid ${item.paidAt ? new Date(item.paidAt).toLocaleDateString("en-GB") : ""}`
                          : item.status === "action_required" || item.adminQuery
                            ? "Query — Action required"
                            : item.status === "awaiting_confirmation" || reportedIds.includes(item.id)
                              ? "Awaiting confirmation"
                              : item.status === "overdue"
                                ? "Overdue"
                                : "Due"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-ink-soft font-mono text-[11px]">{item.graceExpiryDate}</td>
                    <td className="py-3 px-3 text-right">
                      {item.status !== "paid" && (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {itemCardUnlocked ? (
                            <button
                              type="button"
                              onClick={() => openPaymentModal("stripe", item)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-sm bg-navy-900 text-white hover:bg-navy-700"
                            >
                              Pay by Card
                            </button>
                          ) : (
                            <span className="text-[11px] text-ink-soft italic">
                              Unlocks {new Date(new Date(item.dueDate).getTime() - 7 * 86400000).toLocaleDateString("en-GB")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => openPaymentModal("transfer", item)}
                            className="px-2 py-1 text-[11px] font-semibold text-ink-soft hover:text-navy-900 border border-line rounded-sm"
                          >
                            Transfer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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

      {/* Modal: Payment & Proof Submission */}
      {isModalOpen && activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60"
        >
          <div className="bg-white rounded-lg border border-line max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
              <div>
                <h3 id="pay-modal-title" className="font-heading text-xl font-bold text-navy-900">
                  {notice ? "Transfer Notice Received" : `Pay Instalment ${activeModalItem.instalmentNumber}`}
                </h3>
                <p className="text-xs text-ink-soft">
                  Amount: <strong className="text-navy-900">{formatCurrency(activeModalItem.amountGbp)}</strong> · Due {activeModalItem.dueDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="w-10 h-10 -mr-2 -mt-2 inline-flex items-center justify-center text-ink-soft hover:text-navy-900"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {notice ? (
              <div className="space-y-4">
                <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-2">
                  <p className="font-semibold">Thank you! Your payment notice is registered.</p>
                  <p className="text-xs leading-relaxed">
                    Student Accounts will inspect our bank statement and approve your receipt, usually within one working day.
                  </p>
                  <p className="text-xs font-mono font-bold text-navy-900 pt-1">
                    Tracking Reference: {notice}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full min-h-[44px] rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-semibold text-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {modalError && (
                  <p role="alert" className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-sm text-xs">
                    {modalError}
                  </p>
                )}

                {/* Tabs for Payment Mode */}
                <div className="flex border-b border-line gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setModalMode("stripe")}
                    className={`pb-2 px-3 text-xs font-bold transition-colors border-b-2 ${
                      modalMode === "stripe"
                        ? "border-navy-900 text-navy-900"
                        : "border-transparent text-ink-soft hover:text-navy-900"
                    }`}
                  >
                    Card / Stripe (Instant)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode("gocardless")}
                    className={`pb-2 px-3 text-xs font-bold transition-colors border-b-2 ${
                      modalMode === "gocardless"
                        ? "border-navy-900 text-navy-900"
                        : "border-transparent text-ink-soft hover:text-navy-900"
                    }`}
                  >
                    Direct Debit (GoCardless)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode("transfer")}
                    className={`pb-2 px-3 text-xs font-bold transition-colors border-b-2 ${
                      modalMode === "transfer"
                        ? "border-navy-900 text-navy-900"
                        : "border-transparent text-ink-soft hover:text-navy-900"
                    }`}
                  >
                    Manual Bank Transfer
                  </button>
                </div>

                {/* Tab: Direct Debit (GoCardless) */}
                {modalMode === "gocardless" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-paper rounded-sm border border-line space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon name="layers" size={18} className="text-navy-900" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                          UK Direct Debit Mandate
                        </h4>
                      </div>
                      <p className="text-xs text-ink-soft leading-relaxed">
                        Connect your UK bank account (Sort Code &amp; Account Number). Your instalments will be automatically collected by GoCardless on their scheduled due dates, protected by the UK Direct Debit Guarantee.
                      </p>
                      <div className="p-3 bg-white rounded-xs border border-line text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-ink-soft">Target Instalment:</span>
                          <strong>Instalment {activeModalItem.instalmentNumber} of {activeModalItem.totalInstalments}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-soft">Amount to Debit:</span>
                          <strong className="font-mono text-navy-900">{formatCurrency(activeModalItem.amountGbp)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-soft">Due Date:</span>
                          <span>{activeModalItem.dueDate}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          id="confirm-gocardless-btn"
                          disabled={isPending}
                          onClick={handleSwitchToGoCardless}
                          className="w-full min-h-[44px] rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          <Icon name="shield-check" size={16} />
                          <span>
                            {isPending
                              ? "Setting up Direct Debit..."
                              : `Set Up Direct Debit with GoCardless`}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Card / Stripe */}
                {modalMode === "stripe" && (
                  <div className="space-y-4">
                    {isCardPaymentUnlocked ? (
                      <div className="p-4 bg-paper rounded-sm border border-line space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon name="credit-card" size={18} className="text-navy-900" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                            Instant Stripe Settlement
                          </h4>
                        </div>
                        <p className="text-xs text-ink-soft leading-relaxed">
                          Pay directly using Credit/Debit Card, Apple Pay, or Google Pay. Your payment is verified instantly without waiting for bank statement checks.
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            id="confirm-stripe-btn"
                            disabled={isPending}
                            onClick={handlePayWithStripe}
                            className="w-full min-h-[44px] rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            <Icon name="check-circle" size={16} />
                            <span>
                              {isPending
                                ? "Processing Secure Payment..."
                                : `Confirm & Pay ${formatCurrency(activeModalItem.amountGbp)}`}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-sm border border-amber-200 text-amber-900 text-xs space-y-2">
                        <p className="font-bold">Card payment unlocks 7 days before due date</p>
                        <p>
                          This instalment is due on <strong>{activeModalItem.dueDate}</strong>. Card payment will unlock automatically on{" "}
                          <strong>
                            {new Date(new Date(activeModalItem.dueDate).getTime() - 7 * 86400000).toLocaleDateString("en-GB")}
                          </strong>. In the meantime, you can transfer via BACS below.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Bank Transfer & Receipt Upload */}
                {modalMode === "transfer" && (
                  <div className="space-y-4">
                    {/* Live College Bank Account Details */}
                    <div className="p-3 bg-paper rounded-sm border border-line space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-line">
                        <span className="font-bold uppercase tracking-wider text-navy-900">
                          College Bank Details
                        </span>
                        {copiedField && (
                          <span className="text-[11px] font-bold text-emerald-700">
                            Copied {copiedField}!
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-ink-soft block text-[10px] uppercase">Bank</span>
                          <span className="font-semibold text-navy-900">{bank.bankName}</span>
                        </div>
                        <div>
                          <span className="text-ink-soft block text-[10px] uppercase">Payee Name</span>
                          <span className="font-semibold text-navy-900">{bank.accountName}</span>
                        </div>
                        <div>
                          <span className="text-ink-soft block text-[10px] uppercase">Sort Code</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bank.sortCode, "Sort Code")}
                            className="font-mono font-bold text-navy-900 hover:underline inline-flex items-center gap-1"
                          >
                            {bank.sortCode}
                            <span className="text-[10px] text-ink-soft font-normal">(copy)</span>
                          </button>
                        </div>
                        <div>
                          <span className="text-ink-soft block text-[10px] uppercase">Account Number</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bank.accountNumber, "Account Number")}
                            className="font-mono font-bold text-navy-900 hover:underline inline-flex items-center gap-1"
                          >
                            {bank.accountNumber}
                            <span className="text-[10px] text-ink-soft font-normal">(copy)</span>
                          </button>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-line text-[11px] text-ink-soft">
                        Reference to quote:{" "}
                        <strong className="text-navy-900 font-mono">
                          {bank.bacsReferencePrefix}-{planSummary.learnerId || "STUDENT"}
                        </strong>
                      </div>
                    </div>

                    {/* Amount transferred input */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="transfer-amount" className="block text-xs font-semibold text-navy-900">
                          Amount you transferred (£)
                        </label>
                        <span className="text-[11px] text-ink-soft">
                          Scheduled: <strong className="text-navy-900">{formatCurrency(activeModalItem.amountGbp)}</strong>
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm font-semibold">£</span>
                        <input
                          id="transfer-amount"
                          type="number"
                          step="0.01"
                          min="1"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder={activeModalItem.amountGbp.toFixed(2)}
                          className="w-full pl-7 pr-3 min-h-[44px] border border-line rounded-sm text-sm font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-ink-soft">
                        Enter the exact amount you sent from your bank account (e.g. £20.00 for partial deposit or custom instalment).
                      </p>
                    </div>

                    {/* Reference input */}
                    <div className="space-y-1">
                      <label htmlFor="payer-ref" className="block text-xs font-semibold text-navy-900">
                        Reference code you used in your bank app
                      </label>
                      <input
                        id="payer-ref"
                        type="text"
                        maxLength={60}
                        value={payerRef}
                        onChange={(e) => setPayerRef(e.target.value)}
                        placeholder={`e.g. ${bank.bacsReferencePrefix}-${planSummary.learnerId || "001"}`}
                        className="w-full px-3 min-h-[44px] border border-line rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono"
                      />
                    </div>

                    {/* Receipt Upload File Input */}
                    <div className="space-y-1">
                      <label htmlFor="receipt-upload" className="block text-xs font-semibold text-navy-900">
                        Upload Transfer Receipt / Screenshot proof (Optional but recommended)
                      </label>
                      <input
                        id="receipt-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        onChange={handleFileUpload}
                        className="block w-full text-xs text-ink-soft file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-700 cursor-pointer"
                      />
                      {receiptFileName && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-900 text-xs flex items-center justify-between mt-1">
                          <span className="truncate">✓ Attached: <strong>{receiptFileName}</strong></span>
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptFileName(null);
                              setReceiptDataUrl(null);
                            }}
                            className="text-xs text-rose-700 hover:underline ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      id="report-transfer"
                      disabled={isPending}
                      onClick={handleReportBankTransfer}
                      className="w-full min-h-[44px] rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-semibold text-sm disabled:opacity-60 transition-colors shadow-sm"
                    >
                      {isPending ? "Submitting transfer notice..." : "Submit Notice & Proof of Payment"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

