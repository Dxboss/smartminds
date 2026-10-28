"use client";

import React, { useState, useTransition } from "react";
import {
  PaymentRecord,
  LedgerSummary,
  PaymentScheduleItem,
  LearnerPaymentPlanSummary,
  Learner,
  Enrolment,
  UserRole,
} from "@/lib/repositories/types";
import { formatCurrency } from "@/content/pricing";
import { Icon } from "@/components/ui/Icon";
import {
  recordBankTransferAction,
  exportLedgerCsvAction,
  savePaymentGatewaySettingsAction,
  enrolAndProcessPaymentAction,
  updateCollegeGraceDaysAction,
  resetLearnerGracePeriodAction,
  confirmScheduleBankTransferAction,
  queryBankTransferAction,
  deletePaymentRecordAction,
  clearAllTestPaymentsAction,
} from "@/app/admin/actions";

interface PaymentsLedgerViewProps {
  ledgerRecords: PaymentRecord[];
  ledgerSummary: LedgerSummary;
  schedules: PaymentScheduleItem[];
  learnerPlans?: LearnerPaymentPlanSummary[];
  learners: Learner[];
  enrolments: Enrolment[];
  userRole: UserRole;
}

export function PaymentsLedgerView({
  ledgerRecords: initialRecords,
  ledgerSummary: initialSummary,
  schedules: initialSchedules,
  learnerPlans: initialLearnerPlans = [],
  learners: initialLearners,
  enrolments,
  userRole,
}: PaymentsLedgerViewProps) {
  const [activeTab, setActiveTab] = useState<
    "balances" | "schedules" | "records" | "gateway"
  >("balances");
  const [records, setRecords] = useState<PaymentRecord[]>(initialRecords);
  const [schedules, setSchedules] = useState<PaymentScheduleItem[]>(initialSchedules);
  const [plans, setPlans] = useState<LearnerPaymentPlanSummary[]>(initialLearnerPlans);
  const [summary, setSummary] = useState<LedgerSummary>(initialSummary);
  const [learners, setLearners] = useState<Learner[]>(initialLearners);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "owing" | "overdue" | "settled">("all");
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<"all" | "due" | "overdue" | "paid">("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedPlanLearnerId, setExpandedPlanLearnerId] = useState<string | null>(null);

  // Bank Transfer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLearnerId, setSelectedLearnerId] = useState(
    learners[0]?.id || ""
  );
  const [amountGbp, setAmountGbp] = useState("150.00");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  // Transfer Proof & Query Modal States
  const [receiptPreviewModal, setReceiptPreviewModal] = useState<{
    schedule: PaymentScheduleItem;
    learnerName: string;
  } | null>(null);
  const [queryModalSchedule, setQueryModalSchedule] =
    useState<PaymentScheduleItem | null>(null);
  const [queryReasonInput, setQueryReasonInput] = useState(
    "Funds have not appeared on the college bank statement yet"
  );

  // Automated Enrolment & Payment Modal State
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [enrolName, setEnrolName] = useState("");
  const [enrolEmail, setEnrolEmail] = useState("");
  const [enrolCourseTitle, setEnrolCourseTitle] = useState(
    "Diploma in Adult Care (RQF Level 3)"
  );
  const [enrolCourseId, setEnrolCourseId] = useState("diploma-in-adult-care");
  const [enrolPlanChoice, setEnrolPlanChoice] = useState<
    "full" | "plan-3m" | "plan-6m" | "plan-10m" | "plan-12m" | "plan-14m"
  >("plan-10m");
  const [enrolAmount, setEnrolAmount] = useState("100.00");
  const [enrolMethod, setEnrolMethod] = useState<"stripe" | "bank_transfer">(
    "stripe"
  );

  // Export CSV Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<
    "balances_owing" | "transactions" | "instalment_schedules"
  >("balances_owing");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "all" | "daily" | "weekly" | "monthly" | "annually"
  >("all");

  const getCourseFee = (cId: string) => {
    if (cId === "diploma-in-adult-care-l5") return 1900;
    if (cId === "children-young-people-workforce") return 1450;
    if (cId === "award-in-education-and-training") return 495;
    return 1400; // default Level 3 Adult Care
  };

  const calculatePlanDetails = (cId: string, choice: string) => {
    const fee = getCourseFee(cId);
    if (choice === "full") {
      const discounted = Math.round(fee * 0.9 * 100) / 100;
      return {
        type: "full" as const,
        months: 1,
        totalFee: fee,
        deposit: discounted,
        monthly: 0,
        finalMonthly: 0,
        label: `Pay in Full (10% Discount: £${discounted.toFixed(2)})`,
      };
    }
    if (choice === "plan-3m") {
      const deposit = Math.round(fee * 0.20 * 100) / 100;
      const remaining = fee - deposit;
      const monthly = Math.round((remaining / 2) * 100) / 100;
      return {
        type: "instalment_deposit" as const,
        months: 3,
        totalFee: fee,
        deposit,
        monthly,
        finalMonthly: Math.round((remaining - monthly) * 100) / 100,
        label: `3-Month Plan (20% Dep: £${deposit.toFixed(2)} + 2x £${monthly.toFixed(2)})`,
      };
    }
    if (choice === "plan-6m") {
      const deposit = Math.round(fee * 0.15 * 100) / 100;
      const remaining = fee - deposit;
      const monthly = Math.round((remaining / 5) * 100) / 100;
      return {
        type: "instalment_deposit" as const,
        months: 6,
        totalFee: fee,
        deposit,
        monthly,
        finalMonthly: Math.round((remaining - monthly * 4) * 100) / 100,
        label: `6-Month Plan (15% Dep: £${deposit.toFixed(2)} + 5x £${monthly.toFixed(2)})`,
      };
    }
    if (choice === "plan-12m") {
      const deposit = Math.min(100, fee);
      const remaining = fee - deposit;
      const monthly = Math.round((remaining / 11) * 100) / 100;
      return {
        type: "instalment_deposit" as const,
        months: 12,
        totalFee: fee,
        deposit,
        monthly,
        finalMonthly: Math.round((remaining - monthly * 10) * 100) / 100,
        label: `12-Month Plan (£${deposit.toFixed(2)} Dep + 11x £${monthly.toFixed(2)})`,
      };
    }
    if (choice === "plan-14m") {
      const deposit = Math.min(150, fee);
      const remaining = fee - deposit;
      const monthly = Math.round((remaining / 13) * 100) / 100;
      return {
        type: "instalment_deposit" as const,
        months: 14,
        totalFee: fee,
        deposit,
        monthly,
        finalMonthly: Math.round((remaining - monthly * 12) * 100) / 100,
        label: `14-Month Plan (£${deposit.toFixed(2)} Dep + 13x £${monthly.toFixed(2)})`,
      };
    }
    // Default: 10 months
    const deposit = Math.min(100, fee);
    const remaining = fee - deposit;
    const monthly = Math.round((remaining / 9) * 100) / 100;
    return {
      type: "instalment_deposit" as const,
      months: 10,
      totalFee: fee,
      deposit,
      monthly,
      finalMonthly: Math.round((remaining - monthly * 8) * 100) / 100,
      label: `10-Month Plan (£${deposit.toFixed(2)} Dep + 9x £${monthly.toFixed(2)})`,
    };
  };

  // Gateway Settings State
  const [stripePublishableKey, setStripePublishableKey] = useState(
    "pk_live_51MzSmartmindsCollegeKey9810"
  );
  const [stripeSecretKey, setStripeSecretKey] = useState(
    "sk_live_••••••••••••••••••••••••••••"
  );
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState(
    "whsec_••••••••••••••••••••••••••••"
  );
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [bankName, setBankName] = useState("Barclays Bank UK PLC");
  const [accountName, setAccountName] = useState(
    "Smartminds Training College Ltd"
  );
  const [sortCode, setSortCode] = useState("20-04-15");
  const [accountNumber, setAccountNumber] = useState("43928104");
  const [bacsReferencePrefix, setBacsReferencePrefix] = useState("SMTC");

  const [modalError, setModalError] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Grace Period Policy State
  const [globalGraceInput, setGlobalGraceInput] = useState<number>(5);
  const [graceFeedback, setGraceFeedback] = useState<string | null>(null);
  const [customGraceModalSchedule, setCustomGraceModalSchedule] = useState<PaymentScheduleItem | null>(null);
  const [customGraceDaysInput, setCustomGraceDaysInput] = useState<number>(5);

  const [isPending, startTransition] = useTransition();

  // Non-owner permission check
  const isOwner = userRole === "owner_admin" || userRole === "super_admin";
  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto p-8 rounded-md bg-white border border-line shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-700 flex items-center justify-center">
          <Icon name="shield-check" size={24} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-navy-900">
          Access Restricted: Financial Ledger
        </h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          The payment ledger and tuition fee transactions are restricted exclusively to the
          College Director & Lead Administrator. Administrative staff have zero access
          to financial accounts as required by governance policies.
        </p>
      </div>
    );
  }

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod =
      methodFilter === "all" || r.method === methodFilter;
    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Filter plans (Who is owing and what is left on each student)
  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      (p.learnerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.learnerEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.courseTitle || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (planFilter === "owing") return p.balanceRemainingGbp > 0;
    if (planFilter === "overdue") return p.status === "overdue";
    if (planFilter === "settled") return p.balanceRemainingGbp === 0;
    return true;
  });

  // Filter schedules
  const filteredSchedules = schedules.filter((s) => {
    const learner = learners.find((l) => l.id === s.learnerId);
    const learnerName = learner
      ? `${learner.firstName} ${learner.lastName}`
      : "";
    const matchesSearch =
      learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.learnerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (learner?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (scheduleStatusFilter !== "all" && s.status !== scheduleStatusFilter) return false;
    return true;
  });

  const owingLearnersCount = plans.filter((p) => p.balanceRemainingGbp > 0).length;
  const overdueLearnersCount = plans.filter((p) => p.status === "overdue").length;
  const settledLearnersCount = plans.filter((p) => p.balanceRemainingGbp === 0).length;

  const selectedLearnerEnrolment = enrolments.find(
    (e) => e.learnerId === selectedLearnerId
  );

  const handleUpdateGlobalGrace = (days: number) => {
    setGlobalGraceInput(days);
    startTransition(async () => {
      try {
        const res = await updateCollegeGraceDaysAction(days);
        if (res.success) {
          setGraceFeedback(
            `College grace period set to ${days} days. ${res.updatedCount} active instalment schedule(s) updated.`
          );
          setSchedules((prev) =>
            prev.map((item) => {
              if (item.status !== "paid") {
                const dueMs = Date.parse(item.dueDate);
                if (!isNaN(dueMs)) {
                  return {
                    ...item,
                    graceExpiryDate: new Date(dueMs + days * 86400000).toISOString().slice(0, 10),
                  };
                }
              }
              return item;
            })
          );
          setTimeout(() => setGraceFeedback(null), 6000);
        }
      } catch (err: any) {
        setGraceFeedback(`Failed to update grace period: ${err?.message || "Unknown error"}`);
      }
    });
  };

  const handleResetIndividualGrace = (scheduleId: string, customDays: number) => {
    startTransition(async () => {
      try {
        const res = await resetLearnerGracePeriodAction(scheduleId, customDays);
        if (res.success) {
          setGraceFeedback(
            `Grace period extended (+${customDays} days). New expiry date: ${res.graceExpiryDate}`
          );
          setSchedules((prev) =>
            prev.map((item) =>
              item.id === scheduleId
                ? { ...item, graceExpiryDate: res.graceExpiryDate }
                : item
            )
          );
          setCustomGraceModalSchedule(null);
          setTimeout(() => setGraceFeedback(null), 6000);
        }
      } catch (err: any) {
        setGraceFeedback(`Failed to adjust grace: ${err?.message || "Unknown error"}`);
      }
    });
  };

  const handleDeletePaymentRecord = (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this test payment record from the college ledger?")) return;
    startTransition(async () => {
      try {
        const res = await deletePaymentRecordAction(paymentId);
        if (res.success) {
          setRecords((prev) => prev.filter((r) => r.id !== paymentId));
          setFeedbackNotice("Test payment record was successfully deleted from the ledger.");
        }
      } catch (err: any) {
        setFeedbackNotice(`Error deleting payment: ${err?.message || "Failed"}`);
      }
    });
  };

  const handleClearAllTestPayments = () => {
    if (
      !confirm(
        "WARNING: Are you sure you want to purge all test payments, schedules, and test student records? This resets your ledger to a pristine clean slate ready for live Stripe & bank payments."
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const res = await clearAllTestPaymentsAction();
        if (res.success) {
          setRecords([]);
          setSchedules([]);
          setPlans([]);
          setLearners([]);
          setSummary({
            receivedThisMonthGbp: 0,
            totalOutstandingGbp: 0,
            overdueLearnersCount: 0,
            upcomingInstalmentsCount: 0,
          });
          setFeedbackNotice(
            `Clean slate complete! Successfully purged test payments and reset ledger.`
          );
        }
      } catch (err: any) {
        setFeedbackNotice(`Error clearing test payments: ${err?.message || "Failed"}`);
      }
    });
  };

  const handleRecordBankTransfer = () => {
    setModalError("");
    const parsedAmount = parseFloat(amountGbp);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setModalError("Please enter a valid amount in GBP (£).");
      return;
    }
    if (!reference.trim()) {
      setModalError("Please provide a bank transfer reference (e.g. BACS-9842).");
      return;
    }
    if (!selectedLearnerEnrolment) {
      setModalError("No active enrolment found for selected learner.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await recordBankTransferAction({
          learnerId: selectedLearnerId,
          enrolmentId: selectedLearnerEnrolment.id,
          amountGbp: parsedAmount,
          reference: reference.trim(),
          notes: notes.trim() || undefined,
        });

        if (result.success && result.record) {
          setRecords((prev) => [result.record, ...prev]);
          setSchedules((prev) => {
            const next = [...prev];
            const unpaidIdx = next.findIndex(
              (s) => s.learnerId === selectedLearnerId && (s.status === "due" || s.status === "overdue")
            );
            if (unpaidIdx >= 0) {
              next[unpaidIdx] = {
                ...next[unpaidIdx],
                status: "paid",
                paidAt: new Date().toISOString(),
              };
            }
            return next;
          });
          setPlans((prev) =>
            prev.map((p) => {
              if (p.learnerId === selectedLearnerId) {
                const newPaid = p.totalPaidGbp + parsedAmount;
                const newBal = Math.max(0, p.totalAmountGbp - newPaid);
                const unpaidSched = p.schedule.find(
                  (s) => s.status === "due" || s.status === "overdue"
                );
                return {
                  ...p,
                  totalPaidGbp: newPaid,
                  balanceRemainingGbp: newBal,
                  status: newBal <= 0 ? "settled" : p.status,
                  schedule: p.schedule.map((s) =>
                    s.id === unpaidSched?.id
                      ? { ...s, status: "paid", paidAt: new Date().toISOString() }
                      : s
                  ),
                };
              }
              return p;
            })
          );
          setSummary((prev) => ({
            ...prev,
            receivedThisMonthGbp:
              prev.receivedThisMonthGbp + parsedAmount,
            totalOutstandingGbp: Math.max(
              0,
              prev.totalOutstandingGbp - parsedAmount
            ),
          }));
          setIsModalOpen(false);
          setReference("");
          setNotes("");
          setFeedbackNotice(
            `Payment of £${parsedAmount.toFixed(
              2
            )} recorded successfully. Enrolment access confirmed and receipt dispatched to Outbox.`
          );
          setTimeout(() => setFeedbackNotice(null), 6000);
        }
      } catch (err: unknown) {
        setModalError(
          err instanceof Error ? err.message : "Failed to record payment."
        );
      }
    });
  };

  const handleProcessEnrolment = () => {
    setModalError("");
    if (!enrolName.trim()) {
      setModalError("Please enter learner full name.");
      return;
    }
    if (!enrolEmail.trim() || !enrolEmail.includes("@")) {
      setModalError("Please enter a valid learner email address.");
      return;
    }
    const amt = parseFloat(enrolAmount);
    if (isNaN(amt) || amt <= 0) {
      setModalError("Please enter a valid payment amount.");
      return;
    }

    const ref = `${enrolMethod === "stripe" ? "ch_live_" : "BACS-"}${Date.now().toString().slice(-6)}`;

    const planDetails = calculatePlanDetails(enrolCourseId, enrolPlanChoice);

    startTransition(async () => {
      try {
        const result = await enrolAndProcessPaymentAction({
          learnerName: enrolName.trim(),
          learnerEmail: enrolEmail.trim(),
          courseId: enrolCourseId,
          courseTitle: enrolCourseTitle,
          amountPaidGbp: amt,
          paymentType: planDetails.type,
          paymentMethod: enrolMethod,
          reference: ref,
          totalInstalments: planDetails.months,
          monthlyAmountGbp: planDetails.monthly,
          finalAmountGbp: planDetails.finalMonthly,
          totalCourseFeeGbp: planDetails.totalFee,
        });

        if (result.success && result.payment) {
          setRecords((prev) => [result.payment, ...prev]);
          if (result.learner) {
            setLearners((prev) => [result.learner, ...prev]);
          }
          if (result.schedules && result.schedules.length > 0) {
            setSchedules((prev) => [...result.schedules, ...prev]);
            const newPlan: LearnerPaymentPlanSummary = {
              enrolmentId: result.enrolment?.id || `enrolment-${Date.now()}`,
              learnerId: result.learner.id,
              learnerName: `${result.learner.firstName} ${result.learner.lastName}`,
              learnerEmail: result.learner.email,
              courseTitle: enrolCourseTitle,
              levelLabel: "Level 3",
              totalAmountGbp: planDetails.totalFee,
              totalPaidGbp: amt,
              balanceRemainingGbp: Math.max(0, planDetails.totalFee - amt),
              planMonths: planDetails.months,
              nextDueDate: result.schedules.find(
                (s: PaymentScheduleItem) => s.status === "due"
              )?.dueDate,
              nextDueAmountGbp: result.schedules.find(
                (s: PaymentScheduleItem) => s.status === "due"
              )?.amountGbp,
              status: planDetails.totalFee - amt <= 0 ? "settled" : "up_to_date",
              schedule: result.schedules,
              history: [result.payment],
            };
            setPlans((prev) => [newPlan, ...prev]);
          }
          setSummary((prev) => ({
            ...prev,
            receivedThisMonthGbp: prev.receivedThisMonthGbp + amt,
            totalOutstandingGbp:
              prev.totalOutstandingGbp + Math.max(0, planDetails.totalFee - amt),
          }));
          setIsEnrolModalOpen(false);
          setEnrolName("");
          setEnrolEmail("");
          setFeedbackNotice(
            `Enrolment complete! Learner created, payment of £${amt.toFixed(
              2
            )} recorded, and automated welcome email with portal credentials sent to ${enrolEmail}.`
          );
          setTimeout(() => setFeedbackNotice(null), 8000);
        }
      } catch (err: unknown) {
        setModalError(
          err instanceof Error ? err.message : "Failed to process enrolment."
        );
      }
    });
  };

  const handleSaveGateway = () => {
    startTransition(async () => {
      try {
        const result = await savePaymentGatewaySettingsAction({
          stripePublishableKey,
          stripeSecretKey,
          stripeWebhookSecret,
          isLiveMode,
          bankName,
          accountName,
          sortCode,
          accountNumber,
          bacsReferencePrefix,
        });
        if (result.success) {
          setFeedbackNotice(
            "Payment API credentials and BACS banking account details updated successfully."
          );
          setTimeout(() => setFeedbackNotice(null), 5000);
        }
      } catch (err: unknown) {
        alert(
          err instanceof Error ? err.message : "Failed to update gateway."
        );
      }
    });
  };

  const handleConfirmScheduleTransfer = (scheduleId: string) => {
    startTransition(async () => {
      try {
        const res = await confirmScheduleBankTransferAction({ scheduleItemId: scheduleId });
        if (res.success) {
          setSchedules((prev) =>
            prev.map((s) =>
              s.id === scheduleId
                ? { ...s, status: "paid", paidAt: res.record.paidAt, adminQuery: undefined }
                : s
            )
          );
          setRecords((prev) => [res.record, ...prev]);
          setReceiptPreviewModal(null);
          setFeedbackNotice("Payment confirmed and official receipt dispatched.");
          setTimeout(() => setFeedbackNotice(null), 5000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to confirm payment.");
      }
    });
  };

  const handleQueryTransfer = (scheduleId: string) => {
    if (!queryReasonInput.trim()) return;
    startTransition(async () => {
      try {
        const res = await queryBankTransferAction({
          scheduleItemId: scheduleId,
          reason: queryReasonInput.trim(),
        });
        if (res.success) {
          setSchedules((prev) =>
            prev.map((s) =>
              s.id === scheduleId
                ? { ...s, status: "action_required", adminQuery: res.item.adminQuery }
                : s
            )
          );
          setQueryModalSchedule(null);
          setReceiptPreviewModal(null);
          setFeedbackNotice("Query sent to learner and notification emailed.");
          setTimeout(() => setFeedbackNotice(null), 5000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to send query.");
      }
    });
  };

  const handleExportCsv = (
    reportType: "balances_owing" | "transactions" | "instalment_schedules" = selectedReportType,
    timeframe: "all" | "daily" | "weekly" | "monthly" | "annually" = selectedTimeframe
  ) => {
    startTransition(async () => {
      try {
        const result = await exportLedgerCsvAction({
          reportType,
          timeframe,
        });
        if (result.success && result.csvData) {
          const blob = new Blob([result.csvData], {
            type: "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          const reportSuffix =
            reportType === "balances_owing"
              ? "balances-debtors"
              : reportType === "transactions"
              ? "transactions-receipts"
              : "instalment-schedules";
          link.setAttribute(
            "download",
            `smartminds-${reportSuffix}-${timeframe}-${
              new Date().toISOString().split("T")[0]
            }.csv`
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setIsExportModalOpen(false);
          setFeedbackNotice(
            `Financial report (${reportSuffix} • ${timeframe}) exported to CSV successfully.`
          );
          setTimeout(() => setFeedbackNotice(null), 4000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to export CSV");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Bar */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-xs font-semibold">
            <Icon name="credit-card" size={14} />
            <span>Director Financial Hub</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Tuition Ledger & Payment API
          </h1>
          <p className="text-sm text-ink-soft">
            Manage live Stripe payment gateways, automated student enrolments, BACS invoice verification, and instalment schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsEnrolModalOpen(true)}
            className="px-4 py-2.5 rounded-sm bg-navy-900 text-white text-sm font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <Icon name="graduation-cap" size={16} />
            <span>Enrol Student & Take Payment</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={isPending}
            className="px-4 py-2.5 rounded-sm border border-line bg-paper text-navy-900 text-sm font-semibold hover:bg-white hover:border-navy-700 transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
            title="Download formatted reports for accounting, debts owed, and tax audits"
          >
            <Icon name="download" size={16} />
            <span>Export CSV Reports</span>
          </button>
          <button
            onClick={() => {
              setReference(`BACS-${Date.now().toString().slice(-4)}`);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-sm border border-navy-900 bg-white text-navy-900 text-sm font-bold hover:bg-paper transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <Icon name="check-circle" size={16} />
            <span>Record BACS Transfer</span>
          </button>
          {userRole === "super_admin" && (
            <button
              type="button"
              onClick={handleClearAllTestPayments}
              disabled={isPending}
              className="px-3.5 py-2.5 rounded-sm border border-red-300 bg-red-50 text-red-800 text-sm font-semibold hover:bg-red-100 transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              title="Purge all test payments, schedules, and test student enrolments (Super Admin Only)"
            >
              <Icon name="trash" size={15} />
              <span>Clear Test Ledger</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackNotice && (
        <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon name="check" size={16} className="text-emerald-700" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-xs font-bold text-emerald-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
            Received this month
          </span>
          <span className="font-heading text-3xl font-bold text-navy-900 block">
            {formatCurrency(summary.receivedThisMonthGbp)}
          </span>
          <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
            <Icon name="check" size={12} />
            <span>Reconciled & cleared</span>
          </span>
        </div>

        <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
            Outstanding balances
          </span>
          <span className="font-heading text-3xl font-bold text-navy-900 block">
            {formatCurrency(summary.totalOutstandingGbp)}
          </span>
          <span className="text-xs text-ink-soft">
            Across active instalment plans
          </span>
        </div>

        <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
            Overdue accounts
          </span>
          <span className="font-heading text-3xl font-bold text-amber-700 block">
            {summary.overdueLearnersCount}
          </span>
          <span className="text-xs text-amber-800 font-semibold inline-flex items-center gap-1">
            <Icon name="alert-circle" size={12} />
            <span>Subject to grace period</span>
          </span>
        </div>

        <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
            Upcoming instalments
          </span>
          <span className="font-heading text-3xl font-bold text-navy-900 block">
            {summary.upcomingInstalmentsCount}
          </span>
          <span className="text-xs text-ink-soft">
            Due in current academic cycle
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-line gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("balances")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "balances"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="users" size={16} />
          <span>Learner Balances & Owing ({owingLearnersCount} Owing)</span>
        </button>
        <button
          onClick={() => setActiveTab("schedules")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "schedules"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="calendar" size={16} />
          <span>Monthly Instalment Schedules ({schedules.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "records"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="file-text" size={16} />
          <span>Cleared Transactions ({records.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("gateway")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "gateway"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="credit-card" size={16} />
          <span>Payment API & Banking Gateway</span>
        </button>
      </div>

      {/* Tab: Learner Balances & Owing ("Who is owing & what is left") */}
      {activeTab === "balances" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-md border border-line flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search learner, email or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
              />
              <Icon
                name="search"
                size={16}
                className="absolute left-3 top-2.5 text-ink-soft"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { id: "all", label: `All Learners (${plans.length})` },
                { id: "owing", label: `Owing Balance (${owingLearnersCount})` },
                { id: "overdue", label: `Overdue (${overdueLearnersCount})` },
                { id: "settled", label: `Settled (${settledLearnersCount})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setPlanFilter(btn.id as any)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                    planFilter === btn.id
                      ? "bg-navy-900 text-white"
                      : "bg-paper text-ink-soft border border-line hover:text-navy-900"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-md border border-line overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper text-navy-900 border-b border-line font-semibold">
                  <tr>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-4">Enrolled Course</th>
                    <th className="py-3 px-4">Instalment Plan</th>
                    <th className="py-3 px-4 text-right">Total Fee</th>
                    <th className="py-3 px-4 text-right">Paid to Date</th>
                    <th className="py-3 px-4 text-right">Balance Left</th>
                    <th className="py-3 px-4">Next Due Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-ink-soft">
                        No learner payment plans found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((p) => {
                      const isExpanded = expandedPlanLearnerId === p.learnerId;
                      const isOverdue = p.status === "overdue";
                      const isOwing = p.balanceRemainingGbp > 0;
                      const percentPaid =
                        p.totalAmountGbp > 0
                          ? Math.min(
                              100,
                              Math.round((p.totalPaidGbp / p.totalAmountGbp) * 100)
                            )
                          : 100;

                      return (
                        <React.Fragment key={p.enrolmentId}>
                          <tr
                            className={`hover:bg-paper/50 transition-colors ${
                              isOverdue ? "bg-amber-50/40" : ""
                            }`}
                          >
                            <td className="py-3.5 px-4 font-semibold text-navy-900">
                              <span className="block font-bold">
                                {p.learnerName || "Learner"}
                              </span>
                              <span className="block text-xs font-normal text-ink-soft">
                                {p.learnerEmail}
                              </span>
                              {p.learnerPhone && (
                                <span className="block text-[11px] font-mono text-ink-soft">
                                  {p.learnerPhone}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-navy-900 block">
                                {p.courseTitle}
                              </span>
                              <span className="text-xs text-ink-soft">
                                {p.levelLabel || "Accredited"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium text-ink">
                              {p.planMonths ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 font-semibold">
                                  <span>{p.planMonths} Monthly Payments</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-paper text-ink-soft">
                                  <span>Pay in Full</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-ink font-semibold">
                              {formatCurrency(p.totalAmountGbp)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">
                              <div>{formatCurrency(p.totalPaidGbp)}</div>
                              <div className="w-16 h-1.5 bg-line rounded-full ml-auto mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 rounded-full"
                                  style={{ width: `${percentPaid}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isOwing ? (
                                <div className="font-mono font-bold">
                                  <span className="text-base text-rose-700 font-bold">
                                    {formatCurrency(p.balanceRemainingGbp)}
                                  </span>
                                  <span className="block text-[10px] uppercase font-bold text-ink-soft">
                                    owing
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                  <Icon name="check" size={14} />
                                  <span>Settled (£0.00)</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              {p.nextDueDate ? (
                                <div>
                                  <span className="font-mono font-bold text-navy-900 block">
                                    {p.nextDueDate}
                                  </span>
                                  <span className="text-ink-soft text-[11px]">
                                    {formatCurrency(p.nextDueAmountGbp || 0)} due
                                  </span>
                                </div>
                              ) : (
                                <span className="text-ink-soft">All complete</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-sm text-xs font-semibold uppercase tracking-wider ${
                                  p.status === "settled"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : p.status === "overdue"
                                    ? "bg-rose-100 text-rose-800 border border-rose-200 animate-pulse"
                                    : p.status === "due"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-blue-50 text-blue-800 border border-blue-200"
                                }`}
                              >
                                {p.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {isOwing && (
                                  <button
                                    onClick={() => {
                                      setSelectedLearnerId(p.learnerId || "");
                                      setAmountGbp(
                                        p.nextDueAmountGbp
                                          ? p.nextDueAmountGbp.toString()
                                          : p.balanceRemainingGbp.toString()
                                      );
                                      setReference(
                                        `BACS-${Date.now().toString().slice(-4)}`
                                      );
                                      setIsModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold text-navy-900 bg-gold-300 hover:bg-gold-500 rounded-sm border border-gold-500 transition-colors shadow-2xs"
                                  >
                                    Record Payment
                                  </button>
                                )}
                                {p.schedule.length > 0 && (
                                  <button
                                    onClick={() =>
                                      setExpandedPlanLearnerId(
                                        isExpanded ? null : p.learnerId || null
                                      )
                                    }
                                    className="px-2 py-1 text-xs font-semibold text-ink-soft hover:text-navy-900 bg-paper hover:bg-white rounded-sm border border-line transition-colors inline-flex items-center gap-1"
                                    title="View month-by-month instalment schedule"
                                  >
                                    <span>{p.schedule.length} mo</span>
                                    <Icon
                                      name={isExpanded ? "chevron-up" : "chevron-down"}
                                      size={12}
                                    />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Schedule Accordion Row */}
                          {isExpanded && (
                            <tr className="bg-paper/40">
                              <td
                                colSpan={9}
                                className="p-4 border-t border-b border-line"
                              >
                                <div className="bg-white rounded-sm border border-line p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        name="calendar"
                                        size={16}
                                        className="text-navy-900"
                                      />
                                      <h4 className="font-heading text-sm font-bold text-navy-900">
                                        Instalment Schedule breakdown:{" "}
                                        {p.learnerName} ({p.schedule.length} Monthly
                                        payments)
                                      </h4>
                                    </div>
                                    <span className="text-xs text-ink-soft">
                                      {formatCurrency(p.totalPaidGbp)} of{" "}
                                      {formatCurrency(p.totalAmountGbp)} paid (
                                      {formatCurrency(p.balanceRemainingGbp)}{" "}
                                      left)
                                    </span>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                                          <th className="py-2 px-3">
                                            Instalment
                                          </th>
                                          <th className="py-2 px-3">
                                            Due Date
                                          </th>
                                          <th className="py-2 px-3 text-right">
                                            Amount
                                          </th>
                                          <th className="py-2 px-3 text-center">
                                            Status
                                          </th>
                                          <th className="py-2 px-3">
                                            Payment Date
                                          </th>
                                          <th className="py-2 px-3">
                                            Grace Limit
                                          </th>
                                          <th className="py-2 px-3 text-right">
                                            Action
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-line">
                                        {p.schedule.map((s) => (
                                          <tr
                                            key={s.id}
                                            className="hover:bg-paper/30"
                                          >
                                            <td className="py-2.5 px-3 font-semibold text-navy-900">
                                              Instalment {s.instalmentNumber} of{" "}
                                              {s.totalInstalments}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-ink">
                                              {s.dueDate}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold text-navy-900">
                                              {formatCurrency(s.amountGbp)}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                              <span
                                                className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                                                  s.status === "paid"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : s.status === "action_required" || s.adminQuery
                                                    ? "bg-rose-50 text-rose-800 border border-rose-200"
                                                    : s.status === "awaiting_confirmation" || s.reportedTransfer
                                                    ? "bg-amber-50 text-amber-900 border border-amber-300 font-bold"
                                                    : s.status === "overdue"
                                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                    : "bg-paper text-ink-soft border border-line"
                                                }`}
                                              >
                                                {s.status === "paid"
                                                  ? "PAID"
                                                  : s.status === "action_required" || s.adminQuery
                                                  ? "QUERY SENT"
                                                  : s.status === "awaiting_confirmation" || s.reportedTransfer
                                                  ? "REPORTED"
                                                  : s.status}
                                              </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-ink-soft">
                                              {s.paidAt
                                                ? new Date(
                                                    s.paidAt
                                                  ).toLocaleDateString("en-GB")
                                                : "—"}
                                            </td>
                                            <td className="py-2.5 px-3 text-ink-soft font-mono text-[11px]">
                                              {s.graceExpiryDate}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                              {s.status !== "paid" && (
                                                <div className="flex items-center justify-end gap-1 flex-wrap">
                                                  {(s.status === "awaiting_confirmation" || s.reportedTransfer) && (
                                                    <>
                                                      {s.reportedTransfer?.receiptUrl && (
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            setReceiptPreviewModal({
                                                              schedule: s,
                                                              learnerName: p.learnerName || s.learnerId,
                                                            })
                                                          }
                                                          className="px-2 py-0.5 text-[10px] font-bold text-navy-900 bg-amber-100 hover:bg-amber-200 rounded-xs border border-amber-300"
                                                        >
                                                          Receipt
                                                        </button>
                                                      )}
                                                      <button
                                                        type="button"
                                                        onClick={() => handleConfirmScheduleTransfer(s.id)}
                                                        className="px-2 py-0.5 text-[10px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xs"
                                                      >
                                                        Confirm
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setQueryModalSchedule(s);
                                                          setQueryReasonInput("Funds have not appeared on the college bank statement yet");
                                                        }}
                                                        className="px-2 py-0.5 text-[10px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xs"
                                                      >
                                                        Query
                                                      </button>
                                                    </>
                                                  )}
                                                  {!s.reportedTransfer && s.status !== "awaiting_confirmation" && (
                                                    <button
                                                      onClick={() => {
                                                        setSelectedLearnerId(
                                                          p.learnerId || ""
                                                        );
                                                        setAmountGbp(
                                                          s.amountGbp.toString()
                                                        );
                                                        setReference(
                                                          `BACS-INST-${
                                                            s.instalmentNumber
                                                          }-${Date.now()
                                                            .toString()
                                                            .slice(-4)}`
                                                        );
                                                        setIsModalOpen(true);
                                                      }}
                                                      className="px-2 py-0.5 text-[11px] font-bold text-navy-900 bg-paper hover:bg-gold-300 rounded-xs border border-line transition-colors"
                                                    >
                                                      Record Payment
                                                    </button>
                                                  )}
                                                </div>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Cleared Transactions */}
      {activeTab === "records" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-md border border-line flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search learner, reference or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
              />
              <Icon
                name="users"
                size={16}
                className="absolute left-3 top-2.5 text-ink-soft"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
              >
                <option value="all">All Payment Methods</option>
                <option value="stripe">Stripe</option>
                <option value="bank_transfer">Bank Transfer (BACS)</option>
                <option value="manual">Manual / Cash</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-md border border-line overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper text-navy-900 border-b border-line font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-ink-soft">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-paper/50 transition-colors">
                        <td className="py-3 px-4 text-ink whitespace-nowrap text-xs">
                          {new Date(r.paidAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-navy-900">
                          {r.learnerName}
                        </td>
                        <td className="py-3 px-4 text-ink-soft text-xs">
                          {r.courseTitle}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${
                              r.method === "stripe"
                                ? "bg-indigo-50 text-indigo-700"
                                : r.method === "bank_transfer"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {r.method === "stripe"
                              ? "Stripe"
                              : r.method === "bank_transfer"
                              ? "Bank Transfer"
                              : "Manual"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-ink-soft">
                          {r.reference}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-navy-900">
                          {formatCurrency(r.amountGbp)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${
                              r.status === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {r.status === "paid" ? "Cleared" : "Refunded"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-soft max-w-xs truncate">
                          {r.notes || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePaymentRecord(r.id)}
                            disabled={isPending}
                            className="p-1 rounded-xs text-ink-soft hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete test payment record"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Instalment Schedules */}
      {activeTab === "schedules" && (
        <div className="space-y-4">
          {/* College Grace Period Policy Card */}
          <div className="bg-white p-5 rounded-md border border-line shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-navy-900">
                    Instalment grace period policy
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-sm bg-navy-900/10 text-navy-900 font-semibold uppercase tracking-wider">
                    College director control
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-1 max-w-xl">
                  Set college-wide grace window (days allowed after scheduled due date before late alerts trigger and study access is placed on hold). The owner can adjust from 1 to 30 days or reset individual learners.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-ink-soft">Policy presets:</span>
                {[3, 5, 7, 10].map((days) => (
                  <button
                    key={days}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleUpdateGlobalGrace(days)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-colors ${
                      globalGraceInput === days
                        ? "bg-navy-900 text-white"
                        : "bg-paper text-navy-900 border border-line hover:bg-gold-300"
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {graceFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs font-medium flex items-center gap-2">
                <Icon name="check" size={14} className="text-emerald-700 shrink-0" />
                <span>{graceFeedback}</span>
              </div>
            )}
          </div>
          {/* Schedule Status Filter Bar */}
          <div className="bg-white p-4 rounded-md border border-line flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search schedule by learner or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
              />
              <Icon
                name="search"
                size={16}
                className="absolute left-3 top-2.5 text-ink-soft"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { id: "all", label: `All Schedules (${schedules.length})` },
                {
                  id: "due",
                  label: `Due (${schedules.filter((s) => s.status === "due").length})`,
                },
                {
                  id: "overdue",
                  label: `Overdue (${schedules.filter((s) => s.status === "overdue").length})`,
                },
                {
                  id: "paid",
                  label: `Paid (${schedules.filter((s) => s.status === "paid").length})`,
                },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setScheduleStatusFilter(btn.id as any)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                    scheduleStatusFilter === btn.id
                      ? "bg-navy-900 text-white"
                      : "bg-paper text-ink-soft border border-line hover:text-navy-900"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-md border border-line overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper text-navy-900 border-b border-line font-semibold">
                  <tr>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-4">Instalment</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Grace Expiry</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ink-soft">
                        No instalment schedules found.
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((s) => {
                      const learner = learners.find((l) => l.id === s.learnerId);
                      const isOverdue = s.status === "overdue";
                      return (
                        <tr
                          key={s.id}
                          className={`hover:bg-paper/50 transition-colors ${
                            isOverdue ? "bg-amber-50/30" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-semibold text-navy-900">
                            {learner
                              ? `${learner.firstName} ${learner.lastName}`
                              : s.learnerId}
                            <span className="block text-xs font-normal text-ink-soft">
                              {learner?.email}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-ink-soft text-xs">
                            Instalment {s.instalmentNumber} of {s.totalInstalments}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-ink">
                            {s.dueDate}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-ink-soft">
                            {s.graceExpiryDate}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-navy-900">
                            {formatCurrency(s.amountGbp)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-sm text-xs font-semibold inline-flex items-center gap-1 ${
                                s.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : s.status === "action_required" || s.adminQuery
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : s.status === "awaiting_confirmation" || s.reportedTransfer
                                  ? "bg-amber-50 text-amber-900 border border-amber-300 font-bold"
                                  : s.status === "overdue"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-paper text-ink-soft border border-line"
                              }`}
                            >
                              {s.status === "paid"
                                ? "PAID"
                                : s.status === "action_required" || s.adminQuery
                                ? "QUERY SENT"
                                : s.status === "awaiting_confirmation" || s.reportedTransfer
                                ? "TRANSFER REPORTED"
                                : s.status.toUpperCase()}
                            </span>
                            {s.reportedTransfer && (
                              <div className="text-[10px] text-ink-soft mt-0.5 font-mono">
                                Ref: {s.reportedTransfer.reference}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {s.status !== "paid" && (
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {(s.status === "awaiting_confirmation" || s.reportedTransfer) && (
                                  <>
                                    {s.reportedTransfer?.receiptUrl && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setReceiptPreviewModal({
                                            schedule: s,
                                            learnerName: learner ? `${learner.firstName} ${learner.lastName}` : s.learnerId,
                                          })
                                        }
                                        className="px-2 py-1 text-xs font-bold text-navy-900 bg-amber-100 hover:bg-amber-200 rounded-sm border border-amber-300 transition-colors"
                                      >
                                        View Receipt
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmScheduleTransfer(s.id)}
                                      disabled={isPending}
                                      className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-sm transition-colors shadow-xs"
                                    >
                                      Confirm Receipt
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQueryModalSchedule(s);
                                        setQueryReasonInput("Funds have not appeared on the college bank statement yet");
                                      }}
                                      disabled={isPending}
                                      className="px-2 py-1 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-sm transition-colors"
                                    >
                                      Can't Find / Query
                                    </button>
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomGraceModalSchedule(s);
                                    setCustomGraceDaysInput(5);
                                  }}
                                  title="Extend or reset grace period for this student"
                                  className="px-2 py-1 text-xs font-semibold text-ink-soft bg-paper hover:text-navy-900 hover:bg-line rounded-sm border border-line transition-colors"
                                >
                                  Grace
                                </button>
                                {!s.reportedTransfer && s.status !== "awaiting_confirmation" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLearnerId(s.learnerId);
                                      setAmountGbp(s.amountGbp.toString());
                                      setReference(
                                        `BACS-INST-${s.instalmentNumber}-${Date.now().toString().slice(-4)}`
                                      );
                                      setIsModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 text-xs font-semibold text-navy-900 bg-paper hover:bg-gold-300 rounded-sm border border-line transition-colors"
                                  >
                                    Record Payment
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Gateway & Banking API Settings */}
      {activeTab === "gateway" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stripe API Credentials */}
          <div className="bg-white rounded-md border border-line p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl font-bold text-navy-900">
                    Stripe Checkout & Card Processing
                  </h2>
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Connected
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-0.5">
                  Direct API keys for credit/debit cards, Apple Pay, Google Pay and Klarna.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-sm bg-paper border border-line">
                <div>
                  <strong className="text-xs font-bold text-navy-900 block">
                    Environment Mode
                  </strong>
                  <span className="text-xs text-ink-soft">
                    {isLiveMode ? "Live Production (Real charges)" : "Test / Sandbox Mode"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-colors ${
                    isLiveMode
                      ? "bg-rose-700 text-white"
                      : "bg-navy-900 text-white"
                  }`}
                >
                  {isLiveMode ? "Switch to Test" : "Switch to Live"}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono focus:outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Stripe Secret Key (Encrypted)
                </label>
                <input
                  type="password"
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono focus:outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Webhook Signing Secret
                </label>
                <input
                  type="password"
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>
          </div>

          {/* College BACS Bank Account Details */}
          <div className="bg-white rounded-md border border-line p-6 space-y-6 shadow-sm">
            <div className="border-b border-line pb-4">
              <h2 className="font-heading text-xl font-bold text-navy-900">
                College Bank Account (BACS Invoices)
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Bank account details automatically attached to learner tuition invoices.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Account Name (Payee)
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Sort Code
                  </label>
                  <input
                    type="text"
                    value={sortCode}
                    onChange={(e) => setSortCode(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono focus:outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono focus:outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Reference Code Prefix
                </label>
                <input
                  type="text"
                  value={bacsReferencePrefix}
                  onChange={(e) => setBacsReferencePrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={handleSaveGateway}
                disabled={isPending}
                className="px-5 py-2.5 bg-navy-900 text-white rounded-sm text-xs font-bold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Gateway & Banking Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Bank Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center">
                  <Icon name="credit-card" size={16} />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Record Bank Transfer (BACS)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-soft hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Learner Account
                </label>
                <select
                  value={selectedLearnerId}
                  onChange={(e) => setSelectedLearnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
                >
                  {learners.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.firstName} {l.lastName} ({l.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Enrolment & Qualification
                </label>
                <div className="p-2.5 bg-paper rounded-sm border border-line text-xs text-navy-900 font-semibold">
                  {selectedLearnerEnrolment
                    ? selectedLearnerEnrolment.courseTitle
                    : "No active enrolment"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Amount Received (£ GBP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountGbp}
                    onChange={(e) => setAmountGbp(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    BACS / Bank Reference
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. BACS-9842"
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Audit Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified on Barclays business account statement..."
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-line rounded-sm text-sm font-semibold text-ink-soft hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordBankTransfer}
                disabled={isPending}
                className="px-5 py-2 bg-navy-900 text-white rounded-sm text-sm font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Confirming..." : "Confirm & Credit Ledger"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrol Student & Take Payment Modal */}
      {isEnrolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center">
                  <Icon name="graduation-cap" size={16} />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Enrol Student & Process Payment
                </h3>
              </div>
              <button
                onClick={() => setIsEnrolModalOpen(false)}
                className="text-ink-soft hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Learner Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Enrolled Learner Name"
                    value={enrolName}
                    onChange={(e) => setEnrolName(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Learner Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="learner@example.co.uk"
                    value={enrolEmail}
                    onChange={(e) => setEnrolEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Qualification Target
                </label>
                <select
                  value={enrolCourseId}
                  onChange={(e) => {
                    const newCourseId = e.target.value;
                    setEnrolCourseId(newCourseId);
                    let nextPlan = enrolPlanChoice;
                    if (newCourseId === "diploma-in-adult-care-l5") {
                      setEnrolCourseTitle("Diploma in Adult Care (RQF Level 5)");
                      if (nextPlan === "plan-3m") {
                        nextPlan = "plan-6m";
                        setEnrolPlanChoice("plan-6m");
                      }
                    } else if (newCourseId === "diploma-in-adult-care") {
                      setEnrolCourseTitle("Diploma in Adult Care (RQF Level 3)");
                      if (nextPlan === "plan-14m") {
                        nextPlan = "plan-12m";
                        setEnrolPlanChoice("plan-12m");
                      }
                    } else if (newCourseId === "children-young-people-workforce") {
                      setEnrolCourseTitle("Children & Young People Workforce (CYPW Level 3)");
                      if (nextPlan === "plan-14m") {
                        nextPlan = "plan-12m";
                        setEnrolPlanChoice("plan-12m");
                      }
                    } else {
                      setEnrolCourseTitle("Award in Education and Training (AET Level 3)");
                      if (nextPlan === "plan-14m") {
                        nextPlan = "plan-12m";
                        setEnrolPlanChoice("plan-12m");
                      }
                    }
                    const pd = calculatePlanDetails(newCourseId, nextPlan);
                    setEnrolAmount(pd.deposit.toFixed(2));
                  }}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
                >
                  <option value="diploma-in-adult-care">
                    Diploma in Adult Care (RQF Level 3 — £1,400)
                  </option>
                  <option value="diploma-in-adult-care-l5">
                    Diploma in Adult Care (RQF Level 5 — £1,900)
                  </option>
                  <option value="children-young-people-workforce">
                    Children & Young People Workforce (CYPW Level 3 — £1,450)
                  </option>
                  <option value="award-in-education-and-training">
                    Award in Education and Training (AET Level 3 — £495)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Instalment Plan Option ({enrolCourseId.includes("l5") ? "Level 5+: 6, 10, 12, 14m" : "Level 2–4: 3, 6, 10, 12m"})
                  </label>
                  <select
                    value={enrolPlanChoice}
                    onChange={(e) => {
                      const choice = e.target.value as any;
                      setEnrolPlanChoice(choice);
                      const pd = calculatePlanDetails(enrolCourseId, choice);
                      setEnrolAmount(pd.deposit.toFixed(2));
                    }}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
                  >
                    {!enrolCourseId.includes("l5") && (
                      <option value="plan-3m">3 Monthly Payments (20% deposit)</option>
                    )}
                    <option value="plan-6m">6 Monthly Payments (15% deposit)</option>
                    <option value="plan-10m">10 Monthly Payments (£100 deposit)</option>
                    <option value="plan-12m">12 Monthly Payments (£100 deposit)</option>
                    {enrolCourseId.includes("l5") && (
                      <option value="plan-14m">14 Monthly Payments (£100 deposit)</option>
                    )}
                    <option value="full">Pay in Full (10% upfront discount)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={enrolMethod}
                    onChange={(e) =>
                      setEnrolMethod(e.target.value as "stripe" | "bank_transfer")
                    }
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
                  >
                    <option value="stripe">Stripe (Card / Apple Pay)</option>
                    <option value="bank_transfer">BACS Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Amount to Clear Now (£ GBP Deposit)
                </label>
                <input
                  type="number"
                  step="10"
                  value={enrolAmount}
                  onChange={(e) => setEnrolAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>

              {/* Plan Financial Schedule Breakdown */}
              {(() => {
                const pd = calculatePlanDetails(enrolCourseId, enrolPlanChoice);
                return (
                  <div className="p-3 bg-paper rounded-sm border border-line text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-navy-900 font-bold border-b border-line/60 pb-1">
                      <span>Plan Financial Overview</span>
                      <span>Total Course Fee: £{pd.totalFee.toFixed(2)}</span>
                    </div>
                    {pd.type === "full" ? (
                      <p className="text-emerald-800 font-semibold">
                        Full payment: £{pd.deposit.toFixed(2)} with 10% discount applied. Balance remaining after clearing: £0.00.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 pt-1 text-ink-soft">
                        <div>
                          <span className="block text-[11px] font-semibold text-navy-900">Initial Deposit:</span>
                          <span>£{pd.deposit.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] font-semibold text-navy-900">Future Balance:</span>
                          <span>£{(pd.totalFee - pd.deposit).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] font-semibold text-navy-900">Monthly Due:</span>
                          <span>{pd.months - 1}x ~£{pd.monthly.toFixed(2)}/mo</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="p-3 bg-paper rounded-sm border border-line text-xs text-ink-soft space-y-1">
                <span className="font-semibold text-navy-900 block">
                  Automated Pipeline Trigger:
                </span>
                <p>
                  Upon submission, the student record will be created, enrolment activated, payment credited to ledger, and an automated Welcome & Portal Invitation Email dispatched immediately to the student.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsEnrolModalOpen(false)}
                className="px-4 py-2 border border-line rounded-sm text-sm font-semibold text-ink-soft hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessEnrolment}
                disabled={isPending}
                className="px-5 py-2 bg-navy-900 text-white rounded-sm text-sm font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Enrolling..." : "Enrol & Send Credentials"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Grace Period Adjustment Modal */}
      {customGraceModalSchedule && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-navy-900">
                  Adjust learner grace period
                </h3>
                <p className="text-xs text-ink-soft">
                  Instalment {customGraceModalSchedule.instalmentNumber} of {customGraceModalSchedule.totalInstalments} (Due {customGraceModalSchedule.dueDate})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomGraceModalSchedule(null)}
                className="text-ink-soft hover:text-navy-900"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-xs text-ink-soft leading-relaxed">
                Extend or reset the grace window for this specific instalment. This allows extra time for the student without changing the global policy for others.
              </p>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                  Grace duration from due date:
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[3, 5, 7, 14].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCustomGraceDaysInput(d)}
                      className={`py-1.5 text-xs font-bold rounded-sm border transition-colors ${
                        customGraceDaysInput === d
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-paper text-navy-900 border-line hover:bg-gold-300"
                      }`}
                    >
                      +{d} days
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customGraceDaysInput}
                    onChange={(e) => setCustomGraceDaysInput(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-1.5 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                  <span className="text-xs text-ink-soft">
                    days from due date ({customGraceModalSchedule.dueDate})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setCustomGraceModalSchedule(null)}
                className="px-4 py-2 border border-line rounded-sm text-xs font-semibold text-ink-soft hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleResetIndividualGrace(
                    customGraceModalSchedule.id,
                    customGraceDaysInput
                  )
                }
                className="px-4 py-2 bg-navy-900 text-white rounded-sm text-xs font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Updating..." : "Save New Grace Period"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Receipt Proof Preview Modal */}
      {receiptPreviewModal && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-navy-900">
                  Uploaded Payment Proof
                </h3>
                <p className="text-xs text-ink-soft">
                  {receiptPreviewModal.learnerName} · Instalment {receiptPreviewModal.schedule.instalmentNumber} of {receiptPreviewModal.schedule.totalInstalments} ({formatCurrency(receiptPreviewModal.schedule.amountGbp)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptPreviewModal(null)}
                className="text-ink-soft hover:text-navy-900 p-1"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-paper rounded-sm border border-line text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Reported Reference:</span>
                  <span className="font-mono font-bold text-navy-900">{receiptPreviewModal.schedule.reportedTransfer?.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Reported Date:</span>
                  <span>{receiptPreviewModal.schedule.reportedTransfer?.reportedAt ? new Date(receiptPreviewModal.schedule.reportedTransfer.reportedAt).toLocaleString("en-GB") : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Document Name:</span>
                  <span className="font-semibold">{receiptPreviewModal.schedule.reportedTransfer?.receiptFileName || "payment-proof.png"}</span>
                </div>
              </div>

              {receiptPreviewModal.schedule.reportedTransfer?.receiptUrl && (
                <div className="border border-line rounded-sm p-2 bg-paper/50 text-center">
                  {receiptPreviewModal.schedule.reportedTransfer.receiptUrl.startsWith("data:image") ? (
                    <img
                      src={receiptPreviewModal.schedule.reportedTransfer.receiptUrl}
                      alt="Uploaded receipt proof"
                      className="max-h-72 w-auto mx-auto rounded-sm border border-line object-contain"
                    />
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <Icon name="download" size={32} className="mx-auto text-navy-900" />
                      <p className="text-xs font-semibold text-navy-900">Document Proof Attached</p>
                      <a
                        href={receiptPreviewModal.schedule.reportedTransfer.receiptUrl}
                        download={receiptPreviewModal.schedule.reportedTransfer.receiptFileName || "payment-receipt.pdf"}
                        className="inline-block px-3 py-1 bg-navy-900 text-white rounded-sm text-xs font-bold"
                      >
                        Download / View Document
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  const s = receiptPreviewModal.schedule;
                  setReceiptPreviewModal(null);
                  setQueryModalSchedule(s);
                  setQueryReasonInput("Funds have not appeared on the college bank statement yet");
                }}
                className="px-3 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-sm"
              >
                Can't Find / Query
              </button>
              <button
                type="button"
                onClick={() => handleConfirmScheduleTransfer(receiptPreviewModal.schedule.id)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-sm text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
              >
                Confirm Receipt & Settle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Query Payment Modal */}
      {queryModalSchedule && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-navy-900">
                  Query Bank Transfer Notice
                </h3>
                <p className="text-xs text-ink-soft">
                  Instalment {queryModalSchedule.instalmentNumber} of {queryModalSchedule.totalInstalments} ({formatCurrency(queryModalSchedule.amountGbp)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQueryModalSchedule(null)}
                className="text-ink-soft hover:text-navy-900 p-1"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-ink-soft leading-relaxed">
                If you have checked the bank statement and cannot verify the funds, tell the learner why. An email notification and portal alert will be sent immediately so they can update their reference or pay via card.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Quick reasons:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "Funds have not appeared on statement yet",
                    "Payer name/reference does not match our records",
                    "Transferred amount does not match instalment fee",
                    "Uploaded receipt proof was blurry or incomplete",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQueryReasonInput(preset)}
                      className="px-2 py-1 text-[11px] rounded-sm bg-paper border border-line hover:bg-line text-navy-900 text-left transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Reason sent to student:
                </label>
                <textarea
                  rows={3}
                  value={queryReasonInput}
                  onChange={(e) => setQueryReasonInput(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setQueryModalSchedule(null)}
                className="px-3 py-1.5 border border-line rounded-sm text-xs font-semibold text-ink-soft hover:bg-paper"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !queryReasonInput.trim()}
                onClick={() => handleQueryTransfer(queryModalSchedule.id)}
                className="px-4 py-2 bg-navy-900 text-white rounded-sm text-xs font-bold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Sending Query..." : "Send Query & Alert Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Financial & Debtors Report Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line shadow-card max-w-xl w-full p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-[11px] font-semibold">
                  <Icon name="download" size={13} />
                  <span>College Financial Reports</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Export Financial & Debtors Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-ink-soft hover:text-navy-900 p-1 cursor-pointer"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Step 1: Select Report Focus */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                  1. Select Report Focus
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: "balances_owing" as const,
                      title: "Learner Balances & Outstanding Debt (Debtors Ledger)",
                      badge: "Recommended for Admin",
                      badgeClass: "bg-gold-500/20 text-navy-900 border-gold-500/30",
                      description:
                        "Displays total tuition fees, amounts paid, exact balance owed, instalment plan, next payment due date, and student phone/email.",
                    },
                    {
                      id: "transactions" as const,
                      title: "Cash-Flow Transaction Receipts Ledger",
                      badge: "Bank & Stripe Audit",
                      badgeClass: "bg-navy-900/10 text-navy-900 border-navy-900/20",
                      description:
                        "Audit log of every incoming transaction, Stripe reference ID, BACS bank transfer confirmations, and payment timestamps.",
                    },
                    {
                      id: "instalment_schedules" as const,
                      title: "Instalment Schedules & Due Dates Breakdown",
                      badge: "Timetable Reconciliation",
                      badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
                      description:
                        "Detailed row-by-row breakdown of all scheduled monthly instalments, due dates, grace period expiry, and status.",
                    },
                  ].map((rep) => {
                    const isSelected = selectedReportType === rep.id;
                    return (
                      <div
                        key={rep.id}
                        onClick={() => setSelectedReportType(rep.id)}
                        className={`p-3 rounded-sm border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-paper border-navy-900 shadow-2xs"
                            : "bg-white border-line hover:border-navy-900/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-navy-900 text-xs">
                            <input
                              type="radio"
                              name="reportType"
                              value={rep.id}
                              checked={isSelected}
                              onChange={() => setSelectedReportType(rep.id)}
                              className="text-navy-900 focus:ring-0"
                            />
                            <span>{rep.title}</span>
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border ${rep.badgeClass}`}
                          >
                            {rep.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-soft pl-5">
                          {rep.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Timeframe Period */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                  2. Select Reporting Period
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: "all" as const, label: "All Time", desc: "Complete History" },
                    { id: "daily" as const, label: "Today", desc: "Daily Cash" },
                    { id: "weekly" as const, label: "This Week", desc: "Past 7 Days" },
                    { id: "monthly" as const, label: "This Month", desc: "Current Month" },
                    { id: "annually" as const, label: "This Year", desc: "Annual / Tax" },
                  ].map((tf) => {
                    const isSelected = selectedTimeframe === tf.id;
                    return (
                      <button
                        key={tf.id}
                        type="button"
                        onClick={() => setSelectedTimeframe(tf.id)}
                        className={`p-2.5 rounded-sm border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                            : "bg-paper text-navy-900 border-line hover:bg-white hover:border-navy-900/30"
                        }`}
                      >
                        <span className="font-bold text-xs">{tf.label}</span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? "text-gold-300" : "text-ink-soft"
                          }`}
                        >
                          {tf.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informational callout */}
              <div className="p-3 bg-paper border border-line rounded-sm text-[11px] text-ink-soft flex items-start gap-2">
                <Icon name="info" size={15} className="text-navy-900 shrink-0 mt-0.5" />
                <span>
                  The exported CSV file is fully formatted for Microsoft Excel, Apple Numbers, and Google Sheets. It includes metadata summary headers, tuition breakdown, and customer identifiers.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 border border-line rounded-sm text-xs font-semibold text-ink-soft hover:bg-paper cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleExportCsv(selectedReportType, selectedTimeframe)}
                className="px-5 py-2.5 bg-navy-900 text-white rounded-sm text-xs font-bold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                <Icon name="download" size={15} />
                <span>
                  {isPending ? "Generating CSV Report..." : "Download CSV Report"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
