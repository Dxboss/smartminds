import { sql, isDbConfigured, sanitizeDbError } from "@/lib/db";
import { PaymentRepo } from "../interfaces";
import {
  PaymentRecord,
  PaymentScheduleItem,
  LearnerPaymentPlanSummary,
  LedgerSummary,
  PaymentGatewaySettings,
  SessionUser,
  PermissionDeniedError,
} from "../types";
import {
  collegePaymentGatewaySettings,
  seedPaymentRecords,
  seedPaymentSchedules,
} from "../seedData";

export class PostgresPaymentRepo implements PaymentRepo {
  private assertOwnerOrSuper(actor: SessionUser): void {
    if (actor.role === "admin_staff" || actor.role === "tutor") {
      throw new PermissionDeniedError(
        "Administrative staff and tutors are strictly prohibited from accessing payment data."
      );
    }
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the college owner or super admin can access this financial resource."
      );
    }
  }

  private assertNoAdminOrTutorAccess(actor: SessionUser): void {
    if (actor.role === "admin_staff" || actor.role === "tutor") {
      throw new PermissionDeniedError(
        "Administrative staff and tutors are strictly prohibited from accessing payment data."
      );
    }
  }

  async getLedger(actor: SessionUser): Promise<PaymentRecord[]> {
    this.assertOwnerOrSuper(actor);

    if (!isDbConfigured) {
      return seedPaymentRecords.map((p) => ({ ...p }));
    }

    try {
      const rows = (await sql`
        SELECT data FROM payments ORDER BY created_at DESC;
      `) as { data: PaymentRecord }[];
      return rows.map((r) => r.data);
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresPaymentRepo] getLedger error:", sanitizeDbError(err));
      throw new Error(`Failed to fetch payment ledger: ${sanitizeDbError(err)}`);
    }
  }

  async getLedgerSummary(actor: SessionUser): Promise<LedgerSummary> {
    this.assertOwnerOrSuper(actor);

    if (!isDbConfigured) {
      const receivedThisMonth = seedPaymentRecords
        .filter((r) => r.status === "paid")
        .reduce((sum, r) => sum + r.amountGbp, 0);

      const outstanding = seedPaymentSchedules
        .filter((s) => s.status === "due" || s.status === "overdue")
        .reduce((sum, s) => sum + s.amountGbp, 0);

      const overdueCount = new Set(
        seedPaymentSchedules.filter((s) => s.status === "overdue").map((s) => s.learnerId)
      ).size;

      const upcomingCount = seedPaymentSchedules.filter((s) => s.status === "due").length;

      return {
        receivedThisMonthGbp: Math.round(receivedThisMonth * 100) / 100,
        totalOutstandingGbp: Math.round(outstanding * 100) / 100,
        overdueLearnersCount: overdueCount,
        upcomingInstalmentsCount: upcomingCount,
      };
    }

    try {
      const payments = await this.getLedger(actor);
      const scheduleItems = await this.getPaymentSchedules(actor);

      const receivedThisMonth = payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amountGbp, 0);

      const totalOutstanding = scheduleItems
        .filter((s) => s.status === "due" || s.status === "overdue")
        .reduce((sum, s) => sum + s.amountGbp, 0);

      const overdueCount = new Set(
        scheduleItems.filter((s) => s.status === "overdue").map((s) => s.learnerId)
      ).size;

      const upcomingCount = scheduleItems.filter((s) => s.status === "due").length;

      return {
        receivedThisMonthGbp: Math.round(receivedThisMonth * 100) / 100,
        totalOutstandingGbp: Math.round(totalOutstanding * 100) / 100,
        overdueLearnersCount: overdueCount,
        upcomingInstalmentsCount: upcomingCount,
      };
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresPaymentRepo] getLedgerSummary error:", sanitizeDbError(err));
      throw new Error(`Failed to calculate ledger summary: ${sanitizeDbError(err)}`);
    }
  }

  async getPaymentSchedules(
    actor: SessionUser,
    filter?: { learnerId?: string; status?: PaymentScheduleItem["status"] }
  ): Promise<PaymentScheduleItem[]> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role === "student") {
      if (!actor.learnerId || (filter?.learnerId && filter.learnerId !== actor.learnerId)) {
        throw new PermissionDeniedError(
          "Students can only view their own payment schedules."
        );
      }
    }

    if (!isDbConfigured) {
      let result = [...seedPaymentSchedules];
      const targetLearnerId = actor.role === "student" ? actor.learnerId : filter?.learnerId;
      if (targetLearnerId) {
        result = result.filter((s) => s.learnerId === targetLearnerId);
      }
      if (filter?.status) {
        result = result.filter((s) => s.status === filter.status);
      }
      return result.map((s) => ({ ...s }));
    }

    try {
      const targetLearnerId = actor.role === "student" ? actor.learnerId : filter?.learnerId;
      let rows: { data: PaymentScheduleItem }[] = [];

      if (targetLearnerId && filter?.status) {
        rows = (await sql`
          SELECT data FROM payment_schedules
          WHERE learner_id = ${targetLearnerId} AND status = ${filter.status}
          ORDER BY instalment_number ASC;
        `) as { data: PaymentScheduleItem }[];
      } else if (targetLearnerId) {
        rows = (await sql`
          SELECT data FROM payment_schedules
          WHERE learner_id = ${targetLearnerId}
          ORDER BY instalment_number ASC;
        `) as { data: PaymentScheduleItem }[];
      } else if (filter?.status) {
        rows = (await sql`
          SELECT data FROM payment_schedules
          WHERE status = ${filter.status}
          ORDER BY instalment_number ASC;
        `) as { data: PaymentScheduleItem }[];
      } else {
        rows = (await sql`
          SELECT data FROM payment_schedules
          ORDER BY instalment_number ASC;
        `) as { data: PaymentScheduleItem }[];
      }

      return rows.map((r) => r.data);
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresPaymentRepo] getPaymentSchedules error:", sanitizeDbError(err));
      throw new Error(`Failed to fetch payment schedules: ${sanitizeDbError(err)}`);
    }
  }

  async getMyPaymentPlan(
    actor: SessionUser,
    learnerId: string
  ): Promise<LearnerPaymentPlanSummary | null> {
    this.assertNoAdminOrTutorAccess(actor);

    if (actor.role === "student" && actor.learnerId !== learnerId) {
      throw new PermissionDeniedError(
        "Students are prohibited from viewing another learner's payment plan."
      );
    }

    if (!isDbConfigured) {
      const schedules = seedPaymentSchedules.filter((s) => s.learnerId === learnerId);
      const history = seedPaymentRecords.filter((r) => r.learnerId === learnerId);
      if (schedules.length === 0 && history.length === 0) return null;

      const totalPaid = history
        .filter((r) => r.status === "paid")
        .reduce((sum, r) => sum + r.amountGbp, 0);
      const totalAmount = schedules.reduce((sum, s) => sum + s.amountGbp, 0) || totalPaid;
      const balanceRemaining = Math.max(0, totalAmount - totalPaid);
      const nextDue = schedules.find((s) => s.status === "due" || s.status === "overdue");
      const isOverdue = schedules.some((s) => s.status === "overdue");

      return {
        enrolmentId: schedules[0]?.enrolmentId || "enrolment-001",
        learnerId,
        courseTitle: "Enrolled Course",
        planMonths: schedules.length,
        totalAmountGbp: Math.round(totalAmount * 100) / 100,
        totalPaidGbp: Math.round(totalPaid * 100) / 100,
        balanceRemainingGbp: Math.round(balanceRemaining * 100) / 100,
        nextDueDate: nextDue?.dueDate,
        nextDueAmountGbp: nextDue?.amountGbp,
        status: balanceRemaining === 0 ? "settled" : isOverdue ? "overdue" : "up_to_date",
        schedule: schedules.map((s) => ({ ...s })),
        history: history.map((r) => ({ ...r })),
      };
    }

    try {
      const schedules = await this.getPaymentSchedules(actor, { learnerId });
      const payments = (await sql`
        SELECT data FROM payments WHERE learner_id = ${learnerId} ORDER BY created_at DESC;
      `) as { data: PaymentRecord }[];
      const history = payments.map((p) => p.data);

      if (schedules.length === 0 && history.length === 0) return null;

      const totalAmount = schedules.reduce((sum, s) => sum + s.amountGbp, 0) || history.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amountGbp, 0);
      const totalPaid = history
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amountGbp, 0);
      const balanceRemaining = Math.max(0, totalAmount - totalPaid);

      const nextDue = schedules.find(
        (s) => s.status === "due" || s.status === "overdue" || (s as any).status === "pending"
      );
      const isOverdue = schedules.some((s) => s.status === "overdue");
      const rawTotalInstalments =
        schedules.length > 0 ? schedules[0].totalInstalments : undefined;
      const hasDepositItem = schedules.some((s) => (s as any).type === "deposit");
      const planMonths =
        rawTotalInstalments && rawTotalInstalments > 1 && hasDepositItem
          ? rawTotalInstalments - 1
          : rawTotalInstalments || schedules.length;

      return {
        enrolmentId: schedules[0]?.enrolmentId || "",
        learnerId,
        courseTitle: history[0]?.courseTitle || "Enrolled Course",
        planMonths,
        totalAmountGbp: Math.round(totalAmount * 100) / 100,
        totalPaidGbp: Math.round(totalPaid * 100) / 100,
        balanceRemainingGbp: Math.round(balanceRemaining * 100) / 100,
        nextDueDate: nextDue?.dueDate,
        nextDueAmountGbp: nextDue?.amountGbp,
        status: balanceRemaining === 0 ? "settled" : isOverdue ? "overdue" : "up_to_date",
        schedule: schedules,
        history,
      };
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresPaymentRepo] getMyPaymentPlan(${learnerId}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to fetch payment plan: ${sanitizeDbError(err)}`);
    }
  }

  async getAllLearnerPaymentPlans(actor: SessionUser): Promise<LearnerPaymentPlanSummary[]> {
    this.assertOwnerOrSuper(actor);

    if (!isDbConfigured) {
      return [];
    }

    try {
      const [schedRows, payRows, enrRows, lrnRows] = await Promise.all([
        sql`SELECT data FROM payment_schedules ORDER BY instalment_number ASC;` as unknown as Promise<{ data: PaymentScheduleItem }[]>,
        sql`SELECT data FROM payments ORDER BY created_at DESC;` as unknown as Promise<{ data: PaymentRecord }[]>,
        sql`SELECT data FROM enrolments ORDER BY created_at DESC;` as unknown as Promise<{ data: any }[]>,
        sql`SELECT data FROM learners;` as unknown as Promise<{ data: any }[]>,
      ]);

      const allSchedules = schedRows.map((r) => r.data);
      const allPayments = payRows.map((r) => r.data);
      const allEnrolments = enrRows.map((r) => r.data);
      const allLearners = lrnRows.map((r) => r.data);

      const summaries: LearnerPaymentPlanSummary[] = [];
      const seenEnrolments = new Set<string>();

      for (const enr of allEnrolments) {
        if (!enr?.id || seenEnrolments.has(enr.id)) continue;
        seenEnrolments.add(enr.id);

        const learnerEnrolments = allEnrolments.filter((e) => e.learnerId === enr.learnerId);
        const isMultiCourse = learnerEnrolments.length > 1;
        const learner = allLearners.find((l) => l.id === enr.learnerId);

        const schedules = allSchedules.filter((s) =>
          isMultiCourse
            ? s.enrolmentId === enr.id
            : s.enrolmentId === enr.id || s.learnerId === enr.learnerId
        );
        const history = allPayments.filter((p) =>
          isMultiCourse
            ? p.enrolmentId === enr.id
            : p.enrolmentId === enr.id || p.learnerId === enr.learnerId
        );

        if (schedules.length === 0 && history.length === 0) continue;

        const totalPaid = history
          .filter((r) => r.status === "paid")
          .reduce((sum, r) => sum + Number(r.amountGbp || 0), 0);
        const totalScheduled = schedules.reduce((sum, s) => sum + Number(s.amountGbp || 0), 0);
        const totalAmount = totalScheduled > 0 ? totalScheduled : totalPaid;
        const balanceRemaining = Math.max(0, totalAmount - totalPaid);

        const nextDue = schedules.find(
          (s) => s.status === "due" || s.status === "overdue" || (s as any).status === "pending"
        );
        const isOverdue = schedules.some((s) => s.status === "overdue");

        const rawTotalInstalments =
          schedules.length > 0 ? schedules[0].totalInstalments : undefined;
        const hasDepositItem = schedules.some((s) => (s as any).type === "deposit");
        const planMonths =
          enr.planMonths ||
          (rawTotalInstalments && rawTotalInstalments > 1 && hasDepositItem
            ? rawTotalInstalments - 1
            : rawTotalInstalments);

        summaries.push({
          enrolmentId: enr.id,
          learnerId: enr.learnerId,
          learnerName: learner ? `${learner.firstName} ${learner.lastName}` : undefined,
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
          status: balanceRemaining <= 0 ? "settled" : isOverdue ? "overdue" : "up_to_date",
          schedule: schedules,
          history,
        });
      }

      // Fallback for any schedules whose enrolment row was not in enrolments table
      const distinctLearners = Array.from(new Set(allSchedules.map((s) => s.learnerId)));
      for (const lId of distinctLearners) {
        if (summaries.some((s) => s.learnerId === lId)) continue;
        const plan = await this.getMyPaymentPlan(actor, lId);
        if (plan) summaries.push(plan);
      }

      return summaries;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresPaymentRepo] getAllLearnerPaymentPlans error:", sanitizeDbError(err));
      throw new Error(`Failed to fetch all payment plans: ${sanitizeDbError(err)}`);
    }
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
    this.assertOwnerOrSuper(actor);

    const paymentId = `pay-bt-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const record: PaymentRecord = {
      id: paymentId,
      learnerId: data.learnerId,
      learnerName: "Learner",
      courseTitle: "Course",
      enrolmentId: data.enrolmentId,
      amountGbp: data.amountGbp,
      status: "paid",
      method: "bank_transfer",
      reference: data.reference,
      notes: data.notes,
      paidAt: nowIso,
    };

    if (!isDbConfigured) {
      seedPaymentRecords.unshift(record);
      const unpaid = seedPaymentSchedules.find(
        (s) => s.learnerId === data.learnerId && (s.status === "due" || s.status === "overdue")
      );
      if (unpaid) {
        unpaid.status = "paid";
        unpaid.paidAt = nowIso;
      }
      return record;
    }

    try {
      await sql`
        INSERT INTO payments (id, enrolment_id, learner_id, amount, status, payment_method, reference, notes, data, created_at)
        VALUES (${record.id}, ${record.enrolmentId}, ${record.learnerId}, ${record.amountGbp}, ${record.status}, ${record.method}, ${record.reference || null}, ${record.notes || null}, ${JSON.stringify(record)}::jsonb, now());
      `;

      await sql`
        UPDATE learners
        SET access_status = 'active',
            data = jsonb_set(data, '{accessStatus}', '"active"'),
            updated_at = now()
        WHERE id = ${data.learnerId};
      `;

      await sql`
        UPDATE enrolments
        SET status = 'active',
            data = jsonb_set(data, '{status}', '"active"'),
            updated_at = now()
        WHERE id = ${data.enrolmentId};
      `;

      return record;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresPaymentRepo] markBankTransferReceived error:", sanitizeDbError(err));
      throw new Error(`Failed to mark bank transfer received: ${sanitizeDbError(err)}`);
    }
  }

  async confirmScheduleBankTransfer(
    actor: SessionUser,
    data: { scheduleItemId: string; notes?: string }
  ): Promise<PaymentRecord> {
    this.assertOwnerOrSuper(actor);

    const now = new Date().toISOString();
    if (!isDbConfigured) {
      const item = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
      if (!item) throw new Error(`Schedule item ${data.scheduleItemId} not found.`);
      item.status = "paid";
      item.paidAt = now;
      delete item.adminQuery;

      const record: PaymentRecord = {
        id: `pay-sch-${Date.now()}`,
        learnerId: item.learnerId,
        learnerName: "Learner",
        courseTitle: "Course",
        enrolmentId: item.enrolmentId,
        amountGbp: item.amountGbp,
        status: "paid",
        method: "bank_transfer",
        reference: `SCHED-${item.instalmentNumber}-${data.scheduleItemId}`,
        notes: data.notes || "Instalment bank transfer confirmed by Director",
        paidAt: now,
      };
      seedPaymentRecords.unshift(record);
      return record;
    }

    try {
      const rows = (await sql`
        SELECT data FROM payment_schedules WHERE id = ${data.scheduleItemId} LIMIT 1;
      `) as { data: PaymentScheduleItem }[];

      const item = rows[0]?.data;
      if (!item) {
        throw new Error(`Payment schedule item ${data.scheduleItemId} not found.`);
      }

      const paymentId = `pay-sch-${Date.now()}`;
      const record: PaymentRecord = {
        id: paymentId,
        learnerId: item.learnerId,
        learnerName: "Learner",
        courseTitle: "Course",
        enrolmentId: item.enrolmentId,
        amountGbp: item.amountGbp,
        status: "paid",
        method: "bank_transfer",
        reference: `SCHED-${item.instalmentNumber}-${data.scheduleItemId}`,
        notes: data.notes || "Instalment bank transfer confirmed by Director",
        paidAt: now,
      };

      await sql`
        INSERT INTO payments (id, enrolment_id, learner_id, amount, status, payment_method, reference, notes, data, created_at)
        VALUES (${record.id}, ${record.enrolmentId}, ${record.learnerId}, ${record.amountGbp}, ${record.status}, ${record.method}, ${record.reference || null}, ${record.notes || null}, ${JSON.stringify(record)}::jsonb, now());
      `;

      item.status = "paid";
      item.paidAt = now;
      delete item.adminQuery;

      await sql`
        UPDATE payment_schedules
        SET status = 'paid',
            paid_at = now(),
            data = ${JSON.stringify(item)}::jsonb,
            updated_at = now()
        WHERE id = ${data.scheduleItemId};
      `;

      return record;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresPaymentRepo] confirmScheduleBankTransfer error:", sanitizeDbError(err));
      throw new Error(`Failed to confirm schedule bank transfer: ${sanitizeDbError(err)}`);
    }
  }

  async reportInstalmentBankTransfer(
    actor: SessionUser,
    data: {
      scheduleItemId: string;
      reference: string;
      receiptUrl?: string;
      receiptFileName?: string;
    }
  ): Promise<PaymentScheduleItem> {
    this.assertNoAdminOrTutorAccess(actor);

    const now = new Date().toISOString();
    if (!isDbConfigured) {
      const item = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
      if (!item) throw new Error(`Schedule item ${data.scheduleItemId} not found.`);
      item.status = "awaiting_confirmation";
      item.reportedTransfer = {
        reference: data.reference,
        receiptUrl: data.receiptUrl,
        receiptFileName: data.receiptFileName,
        reportedAt: now,
      };
      return item;
    }

    try {
      const rows = (await sql`
        SELECT data FROM payment_schedules WHERE id = ${data.scheduleItemId} LIMIT 1;
      `) as { data: PaymentScheduleItem }[];

      const item = rows[0]?.data;
      if (!item) throw new Error(`Payment schedule item ${data.scheduleItemId} not found.`);

      item.status = "awaiting_confirmation";
      item.reportedTransfer = {
        reference: data.reference,
        receiptUrl: data.receiptUrl,
        receiptFileName: data.receiptFileName,
        reportedAt: now,
      };

      await sql`
        UPDATE payment_schedules
        SET status = 'awaiting_confirmation',
            data = ${JSON.stringify(item)}::jsonb,
            updated_at = now()
        WHERE id = ${data.scheduleItemId};
      `;

      return item;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresPaymentRepo] reportInstalmentBankTransfer error:", sanitizeDbError(err));
      throw new Error(`Failed to report bank transfer: ${sanitizeDbError(err)}`);
    }
  }

  async queryBankTransfer(
    actor: SessionUser,
    data: { scheduleItemId: string; reason: string }
  ): Promise<PaymentScheduleItem> {
    this.assertOwnerOrSuper(actor);

    const now = new Date().toISOString();
    if (!isDbConfigured) {
      const item = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
      if (!item) throw new Error(`Schedule item ${data.scheduleItemId} not found.`);
      item.status = "action_required";
      item.adminQuery = {
        note: data.reason,
        queriedAt: now,
        queriedBy: actor.name || actor.email,
      };
      return item;
    }

    try {
      const rows = (await sql`
        SELECT data FROM payment_schedules WHERE id = ${data.scheduleItemId} LIMIT 1;
      `) as { data: PaymentScheduleItem }[];

      const item = rows[0]?.data;
      if (!item) throw new Error(`Payment schedule item ${data.scheduleItemId} not found.`);

      item.status = "action_required";
      item.adminQuery = {
        note: data.reason,
        queriedAt: now,
        queriedBy: actor.name || actor.email,
      };

      await sql`
        UPDATE payment_schedules
        SET status = 'action_required',
            data = ${JSON.stringify(item)}::jsonb,
            updated_at = now()
        WHERE id = ${data.scheduleItemId};
      `;

      return item;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresPaymentRepo] queryBankTransfer error:", sanitizeDbError(err));
      throw new Error(`Failed to query bank transfer: ${sanitizeDbError(err)}`);
    }
  }

  async getCollegeBankSettings(actor: SessionUser): Promise<PaymentGatewaySettings> {
    this.assertNoAdminOrTutorAccess(actor);

    // If student, strip secret keys!
    if (actor.role === "student") {
      return {
        stripePublishableKey: collegePaymentGatewaySettings.stripePublishableKey,
        stripeSecretKey: "",
        stripeWebhookSecret: "",
        isLiveMode: collegePaymentGatewaySettings.isLiveMode,
        bankName: collegePaymentGatewaySettings.bankName,
        accountName: collegePaymentGatewaySettings.accountName,
        sortCode: collegePaymentGatewaySettings.sortCode,
        accountNumber: collegePaymentGatewaySettings.accountNumber,
        bacsReferencePrefix: collegePaymentGatewaySettings.bacsReferencePrefix,
      };
    }

    return { ...collegePaymentGatewaySettings };
  }

  async exportLedgerCsv(actor: SessionUser): Promise<string> {
    this.assertOwnerOrSuper(actor);

    const payments = await this.getLedger(actor);
    const header = "Payment ID,Learner ID,Enrolment ID,Amount,Status,Method,Reference,Date";
    const rows = payments.map((p) =>
      [
        p.id,
        p.learnerId,
        p.enrolmentId || "",
        p.amountGbp.toFixed(2),
        p.status,
        p.method,
        `"${p.reference || ""}"`,
        p.paidAt,
      ].join(",")
    );

    return [header, ...rows].join("\n");
  }
}
