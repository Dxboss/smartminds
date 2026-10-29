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
      const { pullLatestFromNeon, loadPersistedRecords } = await import("@/lib/persistedData");
      await pullLatestFromNeon().catch(() => { });
      const store = loadPersistedRecords();

      const dbSchedules = await this.getPaymentSchedules(actor, { learnerId }).catch(() => []);
      const payments = (await sql`
        SELECT data FROM payments WHERE learner_id = ${learnerId} ORDER BY created_at DESC;
      `.catch(() => [])) as { data: PaymentRecord }[];
      const dbHistory = payments.map((p) => p.data);

      let enrRows: { data: any }[] = [];
      try {
        enrRows = (await sql`
          SELECT data FROM enrolments WHERE learner_id = ${learnerId} ORDER BY created_at DESC;
        `) as { data: any }[];
      } catch {
        enrRows = [];
      }

      const schedMap = new Map<string, PaymentScheduleItem>();
      for (const s of (store.paymentSchedules || []).filter((x) => x.learnerId === learnerId)) {
        if (s?.id) schedMap.set(s.id, s);
      }
      for (const s of dbSchedules) {
        if (s?.id) schedMap.set(s.id, { ...schedMap.get(s.id), ...s });
      }
      const schedules = Array.from(schedMap.values()).sort(
        (a, b) => (a.instalmentNumber || 0) - (b.instalmentNumber || 0)
      );

      const histMap = new Map<string, PaymentRecord>();
      for (const p of (store.paymentRecords || []).filter((x) => x.learnerId === learnerId)) {
        if (p?.id) histMap.set(p.id, p);
      }
      for (const p of dbHistory) {
        if (p?.id) histMap.set(p.id, { ...histMap.get(p.id), ...p });
      }
      const history = Array.from(histMap.values());

      const enrMap = new Map<string, any>();
      for (const e of (store.enrolments || []).filter((x) => x.learnerId === learnerId)) {
        if (e?.id) enrMap.set(e.id, e);
      }
      for (const r of enrRows) {
        if (r?.data?.id) enrMap.set(r.data.id, { ...enrMap.get(r.data.id), ...r.data });
      }
      const learnerEnrolments = Array.from(enrMap.values());

      if (schedules.length === 0 && history.length === 0) return null;

      const totalAmount =
        schedules.reduce((sum, s) => sum + Number(s.amountGbp || 0), 0) ||
        history
          .filter((p) => p.status === "paid")
          .reduce((sum, p) => sum + Number(p.amountGbp || 0), 0);
      const totalPaid = history
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amountGbp || 0), 0);
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
          .reduce((sum, r) => sum + Number(r.amountGbp || 0), 0);
        const enrSchedSum = enrSched.reduce((sum, s) => sum + Number(s.amountGbp || 0), 0);
        const enrTotal = enrSchedSum > 0 ? enrSchedSum : enrPaid;
        const enrRawInst = enrSched[0]?.totalInstalments;
        const enrHasDep = enrSched.some((s) => (s as any).type === "deposit");
        const enrMonths =
          enr.planMonths ||
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
        enrolmentId: learnerEnrolments[0]?.id || schedules[0]?.enrolmentId || "",
        learnerId,
        courseTitle:
          learnerEnrolments.length > 1
            ? `${learnerEnrolments.length} Qualifications (${learnerEnrolments.map((e) => e.courseTitle).join(" + ")})`
            : learnerEnrolments[0]?.courseTitle || history[0]?.courseTitle || "Enrolled Course",
        levelLabel: learnerEnrolments[0]?.courseLevelLabel,
        planMonths,
        totalAmountGbp: Math.round(totalAmount * 100) / 100,
        totalPaidGbp: Math.round(totalPaid * 100) / 100,
        balanceRemainingGbp: Math.round(balanceRemaining * 100) / 100,
        nextDueDate: nextDue?.dueDate,
        nextDueAmountGbp: nextDue?.amountGbp,
        status: balanceRemaining === 0 ? "settled" : isOverdue ? "overdue" : "up_to_date",
        schedule: schedules.map((s) => ({
          ...s,
          courseTitle:
            s.courseTitle ||
            enrolmentTitleMap.get(s.enrolmentId) ||
            learnerEnrolments[0]?.courseTitle,
        })),
        history,
        courses,
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
      const { pullLatestFromNeon, loadPersistedRecords } = await import("@/lib/persistedData");
      await pullLatestFromNeon().catch(() => { });
      const store = loadPersistedRecords();

      const [schedRows, payRows, enrRows, lrnRows] = await Promise.all([
        (sql`SELECT data FROM payment_schedules ORDER BY instalment_number ASC;`.catch(
          () => []
        ) as unknown) as Promise<{ data: PaymentScheduleItem }[]>,
        (sql`SELECT data FROM payments ORDER BY created_at DESC;`.catch(
          () => []
        ) as unknown) as Promise<{ data: PaymentRecord }[]>,
        (sql`SELECT data FROM enrolments ORDER BY created_at DESC;`.catch(
          () => []
        ) as unknown) as Promise<{ data: any }[]>,
        (sql`SELECT data FROM learners;`.catch(() => []) as unknown) as Promise<{ data: any }[]>,
      ]);

      const mergeById = <T extends { id?: string }>(a: T[] = [], b: T[] = []): T[] => {
        const m = new Map<string, T>();
        for (const item of a) if (item?.id) m.set(item.id, item);
        for (const item of b) if (item?.id) m.set(item.id, { ...m.get(item.id), ...item });
        return Array.from(m.values());
      };

      const allSchedules = mergeById<PaymentScheduleItem>(
        store.paymentSchedules || [],
        schedRows.map((r) => r.data).filter(Boolean)
      );
      const allPayments = mergeById<PaymentRecord>(
        store.paymentRecords || [],
        payRows.map((r) => r.data).filter(Boolean)
      );
      const allEnrolments = mergeById<any>(
        store.enrolments || [],
        enrRows.map((r) => r.data).filter(Boolean)
      );
      const allLearners = mergeById<any>(
        store.learners || [],
        lrnRows.map((r) => r.data).filter(Boolean)
      );

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
    data: { scheduleItemId: string; confirmedAmountGbp?: number; notes?: string }
  ): Promise<PaymentRecord> {
    this.assertOwnerOrSuper(actor);

    const now = new Date().toISOString();
    const { seedLearners, seedEnrolments, seedPaymentRecords, seedPaymentSchedules } = await import("../seedData");
    const { updatePaymentScheduleStatusInStore, savePersistedRecord } = await import("@/lib/persistedData");

    let item: PaymentScheduleItem | undefined;
    let learnerName = "Learner";
    let courseTitle = "Course";

    if (!isDbConfigured) {
      item = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
      if (!item) throw new Error(`Schedule item ${data.scheduleItemId} not found.`);

      const learner = seedLearners.find((l) => l.id === item!.learnerId);
      const enrolment = seedEnrolments.find((e) => e.id === item!.enrolmentId);
      if (learner) learnerName = `${learner.firstName} ${learner.lastName}`;
      if (enrolment) courseTitle = enrolment.courseTitle;
      if (item.courseTitle) courseTitle = item.courseTitle;

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

      const record: PaymentRecord = {
        id: `pay-sch-${Date.now()}`,
        learnerId: item.learnerId,
        learnerName,
        courseTitle,
        enrolmentId: item.enrolmentId,
        amountGbp: confirmedAmount,
        status: "paid",
        method: "bank_transfer",
        reference: item.reportedTransfer?.reference || `TRF-CONF-${Date.now().toString().slice(-6)}`,
        receiptUrl: item.reportedTransfer?.receiptUrl,
        receiptFileName: item.reportedTransfer?.receiptFileName,
        notes: data.notes || `Instalment ${item.instalmentNumber} of ${item.totalInstalments} bank transfer confirmed`,
        paidAt: now,
      };
      seedPaymentRecords.unshift(record);

      updatePaymentScheduleStatusInStore(item.id, {
        amountGbp: item.amountGbp,
        status: "paid",
        paidAt: now,
        adminQuery: undefined,
      });
      savePersistedRecord({ paymentRecord: record, paymentSchedules: [item] });

      return record;
    }

    try {
      const rows = (await sql`
        SELECT data FROM payment_schedules WHERE id = ${data.scheduleItemId} LIMIT 1;
      `) as { data: PaymentScheduleItem }[];

      item = rows[0]?.data;
      if (!item) {
        const fallback = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
        if (!fallback) throw new Error(`Payment schedule item ${data.scheduleItemId} not found.`);
        item = { ...fallback };
      }

      try {
        const lRows = (await sql`SELECT data FROM learners WHERE id = ${item.learnerId} LIMIT 1;`) as any[];
        if (lRows[0]?.data) {
          learnerName = `${lRows[0].data.firstName} ${lRows[0].data.lastName}`;
        } else {
          const l = seedLearners.find((x) => x.id === item!.learnerId);
          if (l) learnerName = `${l.firstName} ${l.lastName}`;
        }
        const eRows = (await sql`SELECT data FROM enrolments WHERE id = ${item.enrolmentId} LIMIT 1;`) as any[];
        if (eRows[0]?.data?.courseTitle) {
          courseTitle = eRows[0].data.courseTitle;
        } else {
          const e = seedEnrolments.find((x) => x.id === item!.enrolmentId);
          if (e) courseTitle = e.courseTitle;
        }
      } catch {
        // Fallback to defaults
      }
      if (item.courseTitle) courseTitle = item.courseTitle;

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
        try {
          await sql`
            INSERT INTO payment_schedules (
              id, enrolment_id, learner_id, instalment_number, due_date, amount, status, data, created_at, updated_at
            )
            VALUES (
              ${remainderItem.id},
              ${remainderItem.enrolmentId || "enr-unknown"},
              ${remainderItem.learnerId || "lrn-unknown"},
              ${Number(remainderItem.instalmentNumber || 1)},
              ${remainderItem.dueDate ? new Date(remainderItem.dueDate).toISOString() : new Date().toISOString()},
              ${Number(remainderItem.amountGbp || 0)},
              'due',
              ${JSON.stringify(remainderItem)}::jsonb,
              now(),
              now()
            )
            ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(remainderItem)}::jsonb, updated_at = now();
          `;
        } catch { }
        seedPaymentSchedules.push(remainderItem);
        savePersistedRecord({ paymentSchedules: [remainderItem] });
      } else {
        item.amountGbp = confirmedAmount;
      }

      const paymentId = `pay-sch-${Date.now()}`;
      const record: PaymentRecord = {
        id: paymentId,
        learnerId: item.learnerId,
        learnerName,
        courseTitle,
        enrolmentId: item.enrolmentId,
        amountGbp: confirmedAmount,
        status: "paid",
        method: "bank_transfer",
        reference: item.reportedTransfer?.reference || `TRF-CONF-${Date.now().toString().slice(-6)}`,
        receiptUrl: item.reportedTransfer?.receiptUrl,
        receiptFileName: item.reportedTransfer?.receiptFileName,
        notes: data.notes || `Instalment ${item.instalmentNumber} of ${item.totalInstalments} bank transfer confirmed`,
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

      updatePaymentScheduleStatusInStore(item.id, {
        amountGbp: item.amountGbp,
        status: "paid",
        paidAt: now,
        adminQuery: undefined,
      });
      savePersistedRecord({ paymentRecord: record, paymentSchedules: [item] });

      const seedIdx = seedPaymentSchedules.findIndex((s) => s.id === item!.id);
      if (seedIdx >= 0) {
        seedPaymentSchedules[seedIdx] = { ...seedPaymentSchedules[seedIdx], ...item };
      }
      seedPaymentRecords.unshift(record);

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
      amountGbp?: number;
      receiptUrl?: string;
      receiptFileName?: string;
    }
  ): Promise<PaymentScheduleItem> {
    this.assertNoAdminOrTutorAccess(actor);

    const now = new Date().toISOString();
    const { updatePaymentScheduleStatusInStore, savePersistedRecord } = await import("@/lib/persistedData");

    if (!isDbConfigured) {
      const item = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
      if (!item) throw new Error(`Schedule item ${data.scheduleItemId} not found.`);
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
      savePersistedRecord({ paymentSchedules: [item] });

      return item;
    }

    try {
      const rows = (await sql`
        SELECT data FROM payment_schedules WHERE id = ${data.scheduleItemId} LIMIT 1;
      `) as { data: PaymentScheduleItem }[];

      let item = rows[0]?.data;
      if (!item) {
        const fallback = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
        if (!fallback) throw new Error(`Payment schedule item ${data.scheduleItemId} not found.`);
        item = { ...fallback };
      }

      item.status = "awaiting_confirmation";
      item.reportedTransfer = {
        reference: data.reference,
        amountGbp: data.amountGbp || item.amountGbp,
        receiptUrl: data.receiptUrl,
        receiptFileName: data.receiptFileName,
        reportedAt: now,
      };
      delete item.adminQuery;

      await sql`
        INSERT INTO payment_schedules (
          id, enrolment_id, learner_id, instalment_number, due_date, amount, status, data, updated_at
        )
        VALUES (
          ${item.id},
          ${item.enrolmentId || "enr-unknown"},
          ${item.learnerId || "lrn-unknown"},
          ${Number(item.instalmentNumber || 1)},
          ${item.dueDate ? new Date(item.dueDate).toISOString() : new Date().toISOString()},
          ${Number(item.amountGbp || 0)},
          'awaiting_confirmation',
          ${JSON.stringify(item)}::jsonb,
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          status = 'awaiting_confirmation',
          data = ${JSON.stringify(item)}::jsonb,
          updated_at = now();
      `;

      updatePaymentScheduleStatusInStore(item.id, {
        status: "awaiting_confirmation",
        reportedTransfer: item.reportedTransfer,
        adminQuery: undefined,
      });
      savePersistedRecord({ paymentSchedules: [item] });

      const seedIdx = seedPaymentSchedules.findIndex((s) => s.id === item!.id);
      if (seedIdx >= 0) {
        seedPaymentSchedules[seedIdx] = { ...seedPaymentSchedules[seedIdx], ...item };
      } else {
        seedPaymentSchedules.push(item);
      }

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
    const { updatePaymentScheduleStatusInStore, savePersistedRecord } = await import("@/lib/persistedData");

    if (!isDbConfigured) {
      const item = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
      if (!item) throw new Error(`Schedule item ${data.scheduleItemId} not found.`);
      item.status = "action_required";
      item.adminQuery = {
        note: data.reason,
        queriedAt: now,
        queriedBy: actor.name || actor.email,
      };

      updatePaymentScheduleStatusInStore(item.id, {
        status: "action_required",
        adminQuery: item.adminQuery,
      });
      savePersistedRecord({ paymentSchedules: [item] });

      return item;
    }

    try {
      const rows = (await sql`
        SELECT data FROM payment_schedules WHERE id = ${data.scheduleItemId} LIMIT 1;
      `) as { data: PaymentScheduleItem }[];

      let item = rows[0]?.data;
      if (!item) {
        const fallback = seedPaymentSchedules.find((s) => s.id === data.scheduleItemId);
        if (!fallback) throw new Error(`Payment schedule item ${data.scheduleItemId} not found.`);
        item = { ...fallback };
      }

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

      updatePaymentScheduleStatusInStore(item.id, {
        status: "action_required",
        adminQuery: item.adminQuery,
      });
      savePersistedRecord({ paymentSchedules: [item] });

      const seedIdx = seedPaymentSchedules.findIndex((s) => s.id === item!.id);
      if (seedIdx >= 0) {
        seedPaymentSchedules[seedIdx] = { ...seedPaymentSchedules[seedIdx], ...item };
      }

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
