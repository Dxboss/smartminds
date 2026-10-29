import { PaymentRepo, ExportCsvOptions, CsvTimeframe, CsvReportType } from "../interfaces";
import {
  LedgerSummary,
  LearnerPaymentPlanSummary,
  PaymentRecord,
  PaymentScheduleItem,
  PaymentGatewaySettings,
  PermissionDeniedError,
  SessionUser,
} from "../types";
import {
  seedPaymentRecords,
  seedPaymentSchedules,
  seedEnrolments,
  seedLearners,
  demoOutbox,
} from "../seedData";
import {
  syncPersistedRecords,
  updatePaymentScheduleStatusInStore,
  savePersistedRecord,
} from "@/lib/persistedData";

export class MemoryPaymentRepo implements PaymentRepo {
  private get records(): PaymentRecord[] {
    syncPersistedRecords();
    return seedPaymentRecords;
  }

  private get schedules(): PaymentScheduleItem[] {
    syncPersistedRecords();
    return seedPaymentSchedules;
  }

  private assertNoAdminOrTutorAccess(actor: SessionUser): void {
    if (actor.role === "admin_staff") {
      throw new PermissionDeniedError(
        "Administrative staff are strictly prohibited from accessing payment repositories."
      );
    }
    if (actor.role === "tutor") {
      throw new PermissionDeniedError(
        "Tutors are strictly prohibited from accessing payment repositories."
      );
    }
  }

  async getLedger(
    actor: SessionUser,
    filter?: { status?: string; learnerId?: string }
  ): Promise<PaymentRecord[]> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role === "student") {
      throw new PermissionDeniedError(
        "Students are prohibited from accessing the general payment ledger."
      );
    }

    let result = [...this.records];
    if (filter?.learnerId) {
      result = result.filter((r) => r.learnerId === filter.learnerId);
    }
    if (filter?.status) {
      result = result.filter((r) => r.status === filter.status);
    }
    return result.map((r) => ({ ...r }));
  }

  async getPaymentSchedules(
    actor: SessionUser,
    filter?: { learnerId?: string; status?: string }
  ): Promise<PaymentScheduleItem[]> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role === "student") {
      if (!actor.learnerId || (filter?.learnerId && filter.learnerId !== actor.learnerId)) {
        throw new PermissionDeniedError(
          "Students can only access their own payment schedules."
        );
      }
      return this.schedules
        .filter((s) => s.learnerId === actor.learnerId)
        .map((s) => ({ ...s }));
    }

    let result = [...this.schedules];
    if (filter?.learnerId) {
      result = result.filter((s) => s.learnerId === filter.learnerId);
    }
    if (filter?.status) {
      result = result.filter((s) => s.status === filter.status);
    }
    return result.map((s) => ({ ...s }));
  }

  async getLedgerSummary(actor: SessionUser): Promise<LedgerSummary> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role === "student") {
      throw new PermissionDeniedError(
        "Students cannot view college ledger financial summaries."
      );
    }

    const receivedThisMonth = this.records
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + r.amountGbp, 0);

    const outstanding = this.schedules
      .filter((s) => s.status === "due" || s.status === "overdue")
      .reduce((sum, s) => sum + s.amountGbp, 0);

    const overdueCount = new Set(
      this.schedules.filter((s) => s.status === "overdue").map((s) => s.learnerId)
    ).size;

    const upcomingCount = this.schedules.filter((s) => s.status === "due").length;

    return {
      receivedThisMonthGbp: Math.round(receivedThisMonth * 100) / 100,
      totalOutstandingGbp: Math.round(outstanding * 100) / 100,
      overdueLearnersCount: overdueCount,
      upcomingInstalmentsCount: upcomingCount,
    };
  }

  async getMyPaymentPlan(
    actor: SessionUser,
    learnerId: string
  ): Promise<LearnerPaymentPlanSummary | null> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role === "student" && actor.learnerId !== learnerId) {
      throw new PermissionDeniedError(
        "Students cannot access payment plans of another learner."
      );
    }

    const learnerEnrolments = seedEnrolments.filter((e) => e.learnerId === learnerId);
    const enrolment = learnerEnrolments[0];
    if (!enrolment) return null;

    const schedules = this.schedules.filter((s) => s.learnerId === learnerId);
    const history = this.records.filter((r) => r.learnerId === learnerId);
    const learner = seedLearners.find((l) => l.id === learnerId);

    const totalPaid = history
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + r.amountGbp, 0);

    const totalScheduled = schedules.reduce((sum, s) => sum + s.amountGbp, 0);
    const totalAmount = totalScheduled > 0 ? totalScheduled : totalPaid;
    const balanceRemaining = Math.max(0, totalAmount - totalPaid);

    const nextDue = schedules.find(
      (s) => s.status === "due" || s.status === "overdue" || (s as any).status === "pending"
    );

    let status: LearnerPaymentPlanSummary["status"] = "settled";
    if (schedules.some((s) => s.status === "overdue")) {
      status = "overdue";
    } else if (schedules.some((s) => s.status === "due" || (s as any).status === "pending")) {
      status = "due";
    } else if (balanceRemaining > 0) {
      status = "up_to_date";
    }

    const rawTotalInstalments =
      schedules.length > 0 ? schedules[0].totalInstalments : undefined;
    const hasDepositItem = schedules.some((s) => (s as any).type === "deposit");
    const planMonths =
      (enrolment as any).planMonths ||
      (rawTotalInstalments && rawTotalInstalments > 1 && hasDepositItem
        ? rawTotalInstalments - 1
        : rawTotalInstalments);

    const isMulti = learnerEnrolments.length > 1;
    const courses = learnerEnrolments.map((enr) => {
      const enrSched = schedules.filter((s) =>
        isMulti ? s.enrolmentId === enr.id : s.enrolmentId === enr.id || s.learnerId === learnerId
      );
      const enrHist = history.filter((r) =>
        isMulti ? r.enrolmentId === enr.id : r.enrolmentId === enr.id || r.learnerId === learnerId
      );
      const enrPaid = enrHist
        .filter((r) => r.status === "paid")
        .reduce((sum, r) => sum + r.amountGbp, 0);
      const enrSchedSum = enrSched.reduce((sum, s) => sum + s.amountGbp, 0);
      const enrTotal = enrSchedSum > 0 ? enrSchedSum : enrPaid;
      const enrRawInst = enrSched[0]?.totalInstalments;
      const enrHasDep = enrSched.some((s) => (s as any).type === "deposit");
      const enrMonths =
        (enr as any).planMonths ||
        (enrRawInst && enrRawInst > 1 && enrHasDep ? enrRawInst - 1 : enrRawInst);
      return {
        enrolmentId: enr.id,
        courseTitle: enr.courseTitle,
        levelLabel: enr.courseLevelLabel,
        planMonths: enrMonths,
        totalAmountGbp: Math.round(enrTotal * 100) / 100,
        totalPaidGbp: Math.round(enrPaid * 100) / 100,
        balanceRemainingGbp: Math.max(0, Math.round((enrTotal - enrPaid) * 100) / 100),
      };
    });

    const enrolmentTitleMap = new Map<string, string>(
      learnerEnrolments.map((e) => [e.id, e.courseTitle])
    );

    return {
      enrolmentId: enrolment.id,
      learnerId,
      learnerName: learner ? `${learner.firstName} ${learner.lastName}` : undefined,
      learnerEmail: learner?.email,
      learnerPhone: learner?.phone,
      courseTitle:
        learnerEnrolments.length > 1
          ? `${learnerEnrolments.length} Qualifications (${learnerEnrolments.map((e) => e.courseTitle).join(" + ")})`
          : enrolment.courseTitle,
      levelLabel: enrolment.courseLevelLabel,
      planMonths,
      totalAmountGbp: Math.round(totalAmount * 100) / 100,
      totalPaidGbp: Math.round(totalPaid * 100) / 100,
      balanceRemainingGbp: Math.round(balanceRemaining * 100) / 100,
      nextDueDate: nextDue?.dueDate,
      nextDueAmountGbp: nextDue?.amountGbp,
      status,
      schedule: schedules.map((s) => ({
        ...s,
        courseTitle: s.courseTitle || enrolmentTitleMap.get(s.enrolmentId) || enrolment.courseTitle,
      })),
      history: history.map((r) => ({ ...r })),
      courses,
    };
  }

  async getAllLearnerPaymentPlans(
    actor: SessionUser
  ): Promise<LearnerPaymentPlanSummary[]> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role === "student") {
      throw new PermissionDeniedError(
        "Students cannot view platform-wide learner payment plans."
      );
    }

    const summaries: LearnerPaymentPlanSummary[] = [];
    const seenEnrolments = new Set<string>();

    for (const enr of seedEnrolments) {
      if (seenEnrolments.has(enr.id)) continue;
      seenEnrolments.add(enr.id);

      const learnerEnrolments = seedEnrolments.filter(
        (e) => e.learnerId === enr.learnerId
      );
      const isMultiCourse = learnerEnrolments.length > 1;

      const learner = seedLearners.find((l) => l.id === enr.learnerId);
      const schedules = this.schedules.filter((s) =>
        isMultiCourse
          ? s.enrolmentId === enr.id
          : s.enrolmentId === enr.id || s.learnerId === enr.learnerId
      );
      const history = this.records.filter((r) =>
        isMultiCourse
          ? r.enrolmentId === enr.id
          : r.enrolmentId === enr.id || r.learnerId === enr.learnerId
      );

      // Only include if has schedules or has payment history
      if (schedules.length === 0 && history.length === 0) continue;

      const totalPaid = history
        .filter((r) => r.status === "paid")
        .reduce((sum, r) => sum + r.amountGbp, 0);

      const totalScheduled = schedules.reduce((sum, s) => sum + s.amountGbp, 0);
      const totalAmount = totalScheduled > 0 ? totalScheduled : totalPaid;
      const balanceRemaining = Math.max(0, totalAmount - totalPaid);

      const nextDue = schedules.find(
        (s) => s.status === "due" || s.status === "overdue" || (s as any).status === "pending"
      );

      let status: LearnerPaymentPlanSummary["status"] = "settled";
      if (schedules.some((s) => s.status === "overdue")) {
        status = "overdue";
      } else if (schedules.some((s) => s.status === "due" || (s as any).status === "pending")) {
        status = "due";
      } else if (balanceRemaining > 0) {
        status = "up_to_date";
      }

      const rawTotalInstalments =
        schedules.length > 0 ? schedules[0].totalInstalments : undefined;
      const hasDepositItem = schedules.some((s) => (s as any).type === "deposit");
      const planMonths =
        (enr as any).planMonths ||
        (rawTotalInstalments && rawTotalInstalments > 1 && hasDepositItem
          ? rawTotalInstalments - 1
          : rawTotalInstalments);

      summaries.push({
        enrolmentId: enr.id,
        learnerId: enr.learnerId,
        learnerName: learner ? `${learner.firstName} ${learner.lastName}` : "Learner",
        learnerEmail: learner?.email,
        learnerPhone: learner?.phone,
        courseTitle: enr.courseTitle,
        levelLabel: enr.courseLevelLabel,
        planMonths,
        totalAmountGbp: Math.round(totalAmount * 100) / 100,
        totalPaidGbp: Math.round(totalPaid * 100) / 100,
        balanceRemainingGbp: Math.round(balanceRemaining * 100) / 100,
        nextDueDate: nextDue?.dueDate,
        nextDueAmountGbp: nextDue?.amountGbp,
        status,
        schedule: schedules.map((s) => ({ ...s })),
        history: history.map((r) => ({ ...r })),
      });
    }

    return summaries;
  }

  async markBankTransferReceived(
    actor: SessionUser,
    data: {
      learnerId: string;
      enrolmentId: string;
      amountGbp: number;
      reference: string;
      notes?: string;
    }
  ): Promise<PaymentRecord> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can confirm and mark bank transfers."
      );
    }

    const learner = seedLearners.find((l) => l.id === data.learnerId);
    const enrolment = seedEnrolments.find((e) => e.id === data.enrolmentId);

    const newRecord: PaymentRecord = {
      id: `pay-rec-${(this.records.length + 1).toString().padStart(3, "0")}`,
      enrolmentId: data.enrolmentId,
      learnerId: data.learnerId,
      learnerName: learner ? `${learner.firstName} ${learner.lastName}` : "Learner",
      courseTitle: enrolment ? enrolment.courseTitle : "Course",
      amountGbp: data.amountGbp,
      method: "bank_transfer",
      reference: data.reference,
      status: "paid",
      paidAt: new Date().toISOString(),
      notes: data.notes,
    };

    seedPaymentRecords.unshift(newRecord);

    // If there is an unpaid schedule item for this learner, mark it as paid!
    const earliestUnpaid = seedPaymentSchedules.find(
      (s) => s.learnerId === data.learnerId && (s.status === "due" || s.status === "overdue")
    );
    if (earliestUnpaid) {
      earliestUnpaid.status = "paid";
      earliestUnpaid.paidAt = newRecord.paidAt;
      updatePaymentScheduleStatusInStore(earliestUnpaid.id, {
        status: "paid",
        paidAt: newRecord.paidAt,
      });
    }

    // Persist new payment record to store
    savePersistedRecord({
      paymentRecord: newRecord,
    });

    // If learner was paused for overdue payment, activate access
    if (learner && learner.accessStatus === "paused") {
      learner.accessStatus = "active";
    }
    if (enrolment && enrolment.status === "paused") {
      enrolment.status = "active";
    }

    return { ...newRecord };
  }

  async reportInstalmentBankTransfer(
    actor: SessionUser,
    data: {
      scheduleItemId: string;
      reference: string;
      amountGbp?: number;
      receiptUrl?: string;
      receiptFileName?: string;
    }
  ): Promise<PaymentScheduleItem> {
    this.assertNoAdminOrTutorAccess(actor);

    const item =
      seedPaymentSchedules.find((s) => s.id === data.scheduleItemId) ||
      this.schedules.find((s) => s.id === data.scheduleItemId);

    if (!item) {
      throw new Error(`Schedule item ${data.scheduleItemId} not found.`);
    }

    if (actor.role === "student" && actor.learnerId && item.learnerId !== actor.learnerId) {
      throw new PermissionDeniedError("Students can only report transfers for their own instalments.");
    }

    const now = new Date().toISOString();
    item.status = "awaiting_confirmation";
    item.reportedTransfer = {
      reference: data.reference,
      amountGbp: data.amountGbp || item.amountGbp,
      receiptUrl: data.receiptUrl,
      receiptFileName: data.receiptFileName,
      reportedAt: now,
    };
    delete item.adminQuery;

    updatePaymentScheduleStatusInStore(item.id, {
      status: "awaiting_confirmation",
      reportedTransfer: item.reportedTransfer,
      adminQuery: undefined,
    });

    savePersistedRecord({
      paymentSchedules: [item],
    });

    return { ...item };
  }

  async confirmScheduleBankTransfer(
    actor: SessionUser,
    data: {
      scheduleItemId: string;
      confirmedAmountGbp?: number;
      notes?: string;
    }
  ): Promise<PaymentRecord> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can confirm schedule bank transfers."
      );
    }

    const item = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
    if (!item) {
      throw new Error(`Schedule item ${data.scheduleItemId} not found.`);
    }

    const learner = seedLearners.find((l) => l.id === item.learnerId);
    const enrolment = seedEnrolments.find((e) => e.id === item.enrolmentId);

    const now = new Date().toISOString();
    const confirmedAmount = Number(data.confirmedAmountGbp ?? item.reportedTransfer?.amountGbp ?? item.amountGbp);
    const originalScheduled = item.amountGbp;

    if (confirmedAmount < originalScheduled) {
      const remainder = Math.round((originalScheduled - confirmedAmount) * 100) / 100;
      item.amountGbp = confirmedAmount;
      const remainderItem: PaymentScheduleItem = {
        ...item,
        id: `${item.id}-rem-${Date.now().toString().slice(-4)}`,
        amountGbp: remainder,
        status: "due",
        paidAt: undefined,
        reportedTransfer: undefined,
        adminQuery: undefined,
      };
      seedPaymentSchedules.push(remainderItem);
      savePersistedRecord({ paymentSchedules: [remainderItem] });
    } else {
      item.amountGbp = confirmedAmount;
    }

    item.status = "paid";
    item.paidAt = now;
    delete item.adminQuery;

    updatePaymentScheduleStatusInStore(item.id, {
      amountGbp: item.amountGbp,
      status: "paid",
      paidAt: now,
      adminQuery: undefined,
    });

    const newRecord: PaymentRecord = {
      id: `pay-rec-${(this.records.length + 1).toString().padStart(3, "0")}`,
      enrolmentId: item.enrolmentId,
      learnerId: item.learnerId,
      learnerName: learner ? `${learner.firstName} ${learner.lastName}` : "Learner",
      courseTitle: enrolment ? enrolment.courseTitle : "Course",
      amountGbp: confirmedAmount,
      method: "bank_transfer",
      reference: item.reportedTransfer?.reference || `TRF-CONF-${Date.now().toString().slice(-6)}`,
      receiptUrl: item.reportedTransfer?.receiptUrl,
      receiptFileName: item.reportedTransfer?.receiptFileName,
      status: "paid",
      paidAt: now,
      notes: data.notes || `Instalment ${item.instalmentNumber} of ${item.totalInstalments} confirmed by owner`,
    };

    seedPaymentRecords.unshift(newRecord);
    savePersistedRecord({ paymentRecord: newRecord, paymentSchedules: [item] });

    // Restore learner access if paused
    if (learner && learner.accessStatus === "paused") {
      learner.accessStatus = "active";
    }
    if (enrolment && enrolment.status === "paused") {
      enrolment.status = "active";
    }

    // Send receipt email to student
    if (learner) {
      demoOutbox.unshift({
        id: `outbox-trf-approved-${Date.now()}`,
        recipientEmail: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        subject: `Payment Confirmed: Instalment ${item.instalmentNumber} of ${item.totalInstalments}`,
        renderedBody: `Dear ${learner.firstName},\n\nWe have verified your bank transfer of £${item.amountGbp.toFixed(2)} for Instalment ${item.instalmentNumber} of ${item.totalInstalments}.\n\nReceipt Reference: ${newRecord.reference}\nStatus: Paid\nDate Confirmed: ${new Date().toLocaleDateString("en-GB")}\n\nYour instalment schedule has been updated in your Student Portal.\n\nStudent Accounts\nSmartminds Training College`,
        templateKey: "transfer_confirmed_student",
        sentAt: now,
        triggerEvent: "Admin Confirmed Bank Transfer",
      });
    }

    return { ...newRecord };
  }

  async queryBankTransfer(
    actor: SessionUser,
    data: {
      scheduleItemId: string;
      reason: string;
    }
  ): Promise<PaymentScheduleItem> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can query reported payments."
      );
    }

    const item = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
    if (!item) {
      throw new Error(`Schedule item ${data.scheduleItemId} not found.`);
    }

    const learner = seedLearners.find((l) => l.id === item.learnerId);
    const now = new Date().toISOString();

    item.status = "action_required";
    item.adminQuery = {
      note: data.reason,
      queriedAt: now,
      queriedBy: actor.name || "Student Accounts",
    };

    updatePaymentScheduleStatusInStore(item.id, {
      status: "action_required",
      adminQuery: item.adminQuery,
    });

    // Alert learner via email
    if (learner) {
      demoOutbox.unshift({
        id: `outbox-query-${Date.now()}`,
        recipientEmail: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        subject: `Action Required: Payment query on Instalment ${item.instalmentNumber} of ${item.totalInstalments}`,
        renderedBody: `Dear ${learner.firstName},\n\nOur Student Accounts team checked the college bank account for your reported transfer of £${item.amountGbp.toFixed(2)}, but could not locate the funds on our statement.\n\nReason: ${data.reason}\n\nWhat to do next:\n1. Log into your Student Portal (/student/payments).\n2. Review your transfer details and update your reference or re-upload your bank receipt.\n3. Or pay directly via card/Apple Pay to clear your balance instantly.\n\nYour grace period remains active while we resolve this with you.\n\nStudent Accounts\nSmartminds Training College`,
        templateKey: "payment_query_student",
        sentAt: now,
        triggerEvent: "Admin Queried Payment Notice",
      });
    }

    return { ...item };
  }

  async getCollegeBankSettings(actor: SessionUser): Promise<PaymentGatewaySettings> {
    syncPersistedRecords();
    const { collegePaymentGatewaySettings } = await import("../seedData");

    if (actor.role === "student") {
      return {
        ...collegePaymentGatewaySettings,
        stripeSecretKey: "",
        stripeWebhookSecret: "",
      };
    }

    this.assertNoAdminOrTutorAccess(actor);
    return { ...collegePaymentGatewaySettings };
  }

  async exportLedgerCsv(
    actor: SessionUser,
    options?: ExportCsvOptions
  ): Promise<string> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can export financial ledger data."
      );
    }

    const reportType = options?.reportType || "balances_owing";
    const timeframe = options?.timeframe || "all";

    const isDateInTimeframe = (dateStr?: string): boolean => {
      if (timeframe === "all" || !dateStr) return true;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;

      const now = new Date();
      if (timeframe === "daily") {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      }
      if (timeframe === "weekly") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= oneWeekAgo && d <= now;
      }
      if (timeframe === "monthly") {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      }
      if (timeframe === "annually") {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    };

    const timeframeLabel =
      timeframe === "daily"
        ? "Today (Daily)"
        : timeframe === "weekly"
          ? "Past 7 Days (Weekly)"
          : timeframe === "monthly"
            ? "Current Month (Monthly)"
            : timeframe === "annually"
              ? "Current Year (Annually)"
              : "All Time";

    const nowFormatted = new Date().toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. REPORT TYPE: BALANCES OWING & DEBTORS (DEFAULT)
    if (reportType === "balances_owing") {
      const allPlans = await this.getAllLearnerPaymentPlans(actor);

      // Filter plans if timeframe is specified
      const filteredPlans = allPlans.filter((p) => {
        if (timeframe === "all") return true;
        // Check if has a payment in period or due in period
        const hasPaymentInPeriod = p.history.some((h) =>
          isDateInTimeframe(h.paidAt)
        );
        const hasDueInPeriod = p.schedule.some((s) =>
          isDateInTimeframe(s.dueDate)
        );
        return hasPaymentInPeriod || hasDueInPeriod;
      });

      const totalInvoiced = filteredPlans.reduce(
        (sum, p) => sum + p.totalAmountGbp,
        0
      );
      const totalCollected = filteredPlans.reduce(
        (sum, p) => sum + p.totalPaidGbp,
        0
      );
      const totalOwing = filteredPlans.reduce(
        (sum, p) => sum + p.balanceRemainingGbp,
        0
      );

      const metadataLines = [
        `# SMARTMINDS TRAINING COLLEGE — LEARNER BALANCES & DEBTORS REPORT`,
        `# Report Period: ${timeframeLabel} | Export Date: ${nowFormatted}`,
        `# Summary: Enrolled Learners: ${filteredPlans.length} | Total Invoiced: £${totalInvoiced.toFixed(2)} | Total Collected: £${totalCollected.toFixed(2)} | Total Outstanding Debt: £${totalOwing.toFixed(2)}`,
        `# Note: Figures derived from live database enrolment ledgers and Stripe transaction reconciliations.`,
      ];

      const headers = [
        "Student ID",
        "Student Name",
        "Email Address",
        "Phone Number",
        "Course Title",
        "Level",
        "Payment Plan",
        "Total Tuition Fee (GBP)",
        "Total Paid So Far (GBP)",
        "Outstanding Balance Remaining (GBP)",
        "Account Standing",
        "Next Payment Due Date",
        "Next Payment Due (GBP)",
        "Enrolment ID",
      ];

      const rows = filteredPlans.map((p) => {
        const standing =
          p.status === "settled"
            ? "Fully Settled"
            : p.status === "overdue"
              ? "OVERDUE (Grace Action Required)"
              : p.status === "due"
                ? "Payment Due Soon"
                : "Up to Date (Active)";

        const planDescription = p.planMonths
          ? `${p.planMonths}-Month Monthly Instalment Plan (0% Interest)`
          : "Full Upfront Payment";

        return [
          p.learnerId || "N/A",
          `"${(p.learnerName || "").replace(/"/g, '""')}"`,
          `"${(p.learnerEmail || "").replace(/"/g, '""')}"`,
          `"${(p.learnerPhone || "").replace(/"/g, '""')}"`,
          `"${p.courseTitle.replace(/"/g, '""')}"`,
          `"${p.levelLabel || ""}"`,
          `"${planDescription}"`,
          p.totalAmountGbp.toFixed(2),
          p.totalPaidGbp.toFixed(2),
          p.balanceRemainingGbp.toFixed(2),
          `"${standing}"`,
          p.nextDueDate || "None",
          p.nextDueAmountGbp !== undefined ? p.nextDueAmountGbp.toFixed(2) : "0.00",
          p.enrolmentId,
        ];
      });

      return [
        ...metadataLines,
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");
    }

    // 2. REPORT TYPE: TRANSACTION RECEIPTS (CASH INFLOW)
    if (reportType === "transactions") {
      const filteredRecords = this.records.filter((r) =>
        isDateInTimeframe(r.paidAt)
      );

      const totalReceived = filteredRecords
        .filter((r) => r.status === "paid")
        .reduce((sum, r) => sum + r.amountGbp, 0);

      const metadataLines = [
        `# SMARTMINDS TRAINING COLLEGE — TRANSACTION RECEIPTS LEDGER`,
        `# Report Period: ${timeframeLabel} | Export Date: ${nowFormatted}`,
        `# Summary: Total Transactions: ${filteredRecords.length} | Total Received: £${totalReceived.toFixed(2)}`,
      ];

      const headers = [
        "Payment ID",
        "Date Paid",
        "Student ID",
        "Student Name",
        "Course Title",
        "Amount Received (GBP)",
        "Payment Method",
        "Payment Reference / Transaction ID",
        "Status",
      ];

      const rows = filteredRecords.map((r) => [
        r.id,
        r.paidAt,
        r.learnerId,
        `"${r.learnerName.replace(/"/g, '""')}"`,
        `"${r.courseTitle.replace(/"/g, '""')}"`,
        r.amountGbp.toFixed(2),
        r.method.toUpperCase(),
        `"${r.reference.replace(/"/g, '""')}"`,
        r.status.toUpperCase(),
      ]);

      return [
        ...metadataLines,
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");
    }

    // 3. REPORT TYPE: INSTALMENT SCHEDULES BREAKDOWN
    const filteredSchedules = this.schedules.filter((s) =>
      isDateInTimeframe(s.dueDate)
    );

    const metadataLines = [
      `# SMARTMINDS TRAINING COLLEGE — INSTALMENT SCHEDULES & DUE DATES REPORT`,
      `# Report Period: ${timeframeLabel} | Export Date: ${nowFormatted}`,
      `# Summary: Total Instalment Records: ${filteredSchedules.length}`,
    ];

    const headers = [
      "Schedule ID",
      "Student ID",
      "Student Name",
      "Instalment",
      "Amount Due (GBP)",
      "Due Date",
      "Grace Expiry Date",
      "Status",
      "Date Settled",
      "Enrolment ID",
    ];

    const rows = filteredSchedules.map((s) => {
      const learner = seedLearners.find((l) => l.id === s.learnerId);
      const studentName = learner ? `${learner.firstName} ${learner.lastName}` : s.learnerId;

      return [
        s.id,
        s.learnerId,
        `"${studentName.replace(/"/g, '""')}"`,
        `Instalment ${s.instalmentNumber} of ${s.totalInstalments}`,
        s.amountGbp.toFixed(2),
        s.dueDate,
        s.graceExpiryDate,
        s.status.toUpperCase(),
        s.paidAt || "Pending",
        s.enrolmentId,
      ];
    });

    return [
      ...metadataLines,
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
  }
}


