import { PaymentRepo } from "../interfaces";
import {
  LedgerSummary,
  LearnerPaymentPlanSummary,
  PaymentRecord,
  PaymentScheduleItem,
  PermissionDeniedError,
  SessionUser,
} from "../types";
import {
  seedPaymentRecords,
  seedPaymentSchedules,
  seedEnrolments,
  seedLearners,
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

    const enrolment = seedEnrolments.find((e) => e.learnerId === learnerId);
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

    const nextDue = schedules.find((s) => s.status === "due" || s.status === "overdue");

    let status: LearnerPaymentPlanSummary["status"] = "settled";
    if (schedules.some((s) => s.status === "overdue")) {
      status = "overdue";
    } else if (schedules.some((s) => s.status === "due")) {
      status = "due";
    } else if (balanceRemaining > 0) {
      status = "up_to_date";
    }

    const totalInstalmentsCount =
      schedules.length > 0 ? schedules[0].totalInstalments : undefined;

    return {
      enrolmentId: enrolment.id,
      learnerId,
      learnerName: learner ? `${learner.firstName} ${learner.lastName}` : undefined,
      learnerEmail: learner?.email,
      learnerPhone: learner?.phone,
      courseTitle: enrolment.courseTitle,
      levelLabel: enrolment.courseLevelLabel,
      planMonths: totalInstalmentsCount,
      totalAmountGbp: Math.round(totalAmount * 100) / 100,
      totalPaidGbp: Math.round(totalPaid * 100) / 100,
      balanceRemainingGbp: Math.round(balanceRemaining * 100) / 100,
      nextDueDate: nextDue?.dueDate,
      nextDueAmountGbp: nextDue?.amountGbp,
      status,
      schedule: schedules.map((s) => ({ ...s })),
      history: history.map((r) => ({ ...r })),
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
    const seenLearners = new Set<string>();

    for (const enr of seedEnrolments) {
      if (seenLearners.has(enr.learnerId)) continue;
      seenLearners.add(enr.learnerId);

      const learner = seedLearners.find((l) => l.id === enr.learnerId);
      const schedules = this.schedules.filter((s) => s.learnerId === enr.learnerId);
      const history = this.records.filter((r) => r.learnerId === enr.learnerId);

      // Only include if has schedules or has payment history
      if (schedules.length === 0 && history.length === 0) continue;

      const totalPaid = history
        .filter((r) => r.status === "paid")
        .reduce((sum, r) => sum + r.amountGbp, 0);

      const totalScheduled = schedules.reduce((sum, s) => sum + s.amountGbp, 0);
      const totalAmount = totalScheduled > 0 ? totalScheduled : totalPaid;
      const balanceRemaining = Math.max(0, totalAmount - totalPaid);

      const nextDue = schedules.find((s) => s.status === "due" || s.status === "overdue");

      let status: LearnerPaymentPlanSummary["status"] = "settled";
      if (schedules.some((s) => s.status === "overdue")) {
        status = "overdue";
      } else if (schedules.some((s) => s.status === "due")) {
        status = "due";
      } else if (balanceRemaining > 0) {
        status = "up_to_date";
      }

      const totalInstalmentsCount =
        schedules.length > 0 ? schedules[0].totalInstalments : undefined;

      summaries.push({
        enrolmentId: enr.id,
        learnerId: enr.learnerId,
        learnerName: learner ? `${learner.firstName} ${learner.lastName}` : "Learner",
        learnerEmail: learner?.email,
        learnerPhone: learner?.phone,
        courseTitle: enr.courseTitle,
        levelLabel: enr.courseLevelLabel,
        planMonths: totalInstalmentsCount,
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

  async exportLedgerCsv(actor: SessionUser): Promise<string> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can export financial ledger data."
      );
    }

    const headers = [
      "Payment ID",
      "Learner ID",
      "Learner Name",
      "Course Title",
      "Amount GBP",
      "Method",
      "Reference",
      "Status",
      "Date Paid",
    ];

    const rows = this.records.map((r) => [
      r.id,
      r.learnerId,
      `"${r.learnerName.replace(/"/g, '""')}"`,
      `"${r.courseTitle.replace(/"/g, '""')}"`,
      r.amountGbp.toFixed(2),
      r.method,
      r.reference,
      r.status,
      r.paidAt,
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }
}

