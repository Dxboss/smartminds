import { Enrolment } from "@/lib/repositories/types";
import { EnrolmentRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";
import { sql, isDbConfigured } from "@/lib/db";
import { sanitizeDbError } from "@/lib/migrations";

export class PostgresEnrolmentRepo implements EnrolmentRepo {
  private async getTutorClassIds(tutorId?: string): Promise<Set<string>> {
    if (!tutorId) return new Set();
    try {
      const rows = (await sql`
        SELECT id FROM classes WHERE tutor_id = ${tutorId};
      `) as { id: string }[];
      return new Set(rows.map((r) => r.id));
    } catch {
      return new Set();
    }
  }

  async listEnrolments(
    actor: SessionUser,
    filter?: { learnerId?: string; classId?: string }
  ): Promise<Enrolment[]> {
    if (actor.role === "student") {
      if (filter?.learnerId && filter.learnerId !== actor.learnerId) {
        throw new PermissionDeniedError(
          "Students are strictly prohibited from viewing enrolments of other learners."
        );
      }
      filter = { ...filter, learnerId: actor.learnerId };
    } else if (actor.role === "tutor") {
      const tutorClasses = await this.getTutorClassIds(actor.tutorId);
      if (filter?.classId && !tutorClasses.has(filter.classId)) {
        throw new PermissionDeniedError(
          "Tutors may only access enrolments for their assigned classes."
        );
      }
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const {
        pullLatestFromNeon,
        loadPersistedRecords,
        isAutomatedTestEnv,
        isFictionalDemoRecord,
      } = await import("@/lib/persistedData");
      await pullLatestFromNeon().catch(() => {});
      const store = loadPersistedRecords();

      let rows: { data: Enrolment }[] = [];
      try {
        rows = (await sql`SELECT data FROM enrolments ORDER BY created_at DESC;`) as {
          data: Enrolment;
        }[];
      } catch {
        try {
          rows = (await sql`SELECT data FROM enrolments;`) as { data: Enrolment }[];
        } catch {
          rows = [];
        }
      }

      const map = new Map<string, Enrolment>();
      for (const se of store.enrolments || []) {
        if (se?.id) map.set(se.id, se);
      }
      for (const r of rows) {
        if (r?.data?.id) {
          const existing = map.get(r.data.id);
          map.set(r.data.id, existing ? { ...r.data, ...existing } : r.data);
        }
      }

      const isTest = isAutomatedTestEnv();
      let all = Array.from(map.values()).filter((e) => isTest || !isFictionalDemoRecord(e));

      if (filter?.learnerId) {
        all = all.filter((e) => e.learnerId === filter!.learnerId);
      }
      if (filter?.classId) {
        all = all.filter((e) => e.classId === filter!.classId);
      }
      if (actor.role === "tutor") {
        const tutorClasses = await this.getTutorClassIds(actor.tutorId);
        const cleanName = (actor.name || "").trim().toLowerCase();
        all = all.filter(
          (e) =>
            (e.classId && tutorClasses.has(e.classId)) ||
            (actor.tutorId && e.tutorId === actor.tutorId) ||
            (cleanName && (e.tutorName || "").trim().toLowerCase() === cleanName)
        );
      }

      return all;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresEnrolmentRepo] listEnrolments error:", sanitizeDbError(err));
      throw new Error(`Failed to list enrolments from database: ${sanitizeDbError(err)}`);
    }
  }

  async getEnrolmentById(actor: SessionUser, id: string): Promise<Enrolment | null> {
    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT data FROM enrolments WHERE id = ${id} LIMIT 1;
      `) as { data: Enrolment }[];

      const found = rows[0]?.data || null;
      if (!found) return null;

      if (actor.role === "student" && actor.learnerId !== found.learnerId) {
        throw new PermissionDeniedError("Students may only view their own enrolment details.");
      }
      if (actor.role === "tutor") {
        const tutorClasses = await this.getTutorClassIds(actor.tutorId);
        if (found.classId && !tutorClasses.has(found.classId)) {
          throw new PermissionDeniedError("Tutors may only view enrolments in their assigned classes.");
        }
      }

      return found;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresEnrolmentRepo] getEnrolmentById(${id}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to get enrolment: ${sanitizeDbError(err)}`);
    }
  }

  async createEnrolment(actor: SessionUser, enrolment: Omit<Enrolment, "id">): Promise<Enrolment> {
    const id = `enrol-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newEnrolment: Enrolment = {
      ...enrolment,
      id,
    };

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      await sql`
        INSERT INTO enrolments (
          id, learner_id, course_id, course_slug, course_title, course_level_label,
          class_id, status, funding_type, assessment_method, completed_units,
          certificate_issued, enrolled_at, data, created_at, updated_at
        ) VALUES (
          ${newEnrolment.id},
          ${newEnrolment.learnerId},
          ${newEnrolment.courseId},
          ${newEnrolment.courseSlug},
          ${newEnrolment.courseTitle},
          ${newEnrolment.courseLevelLabel || null},
          ${newEnrolment.classId || null},
          ${newEnrolment.status},
          ${newEnrolment.fundingType},
          ${newEnrolment.assessmentMethod},
          ${JSON.stringify(newEnrolment.completedUnits || [])}::jsonb,
          ${newEnrolment.certificateIssued ?? false},
          ${newEnrolment.enrolledAt},
          ${JSON.stringify(newEnrolment)}::jsonb,
          now(),
          now()
        );
      `;
      return newEnrolment;
    } catch (err) {
      console.error("[PostgresEnrolmentRepo] createEnrolment error:", sanitizeDbError(err));
      throw new Error(`Failed to create enrolment: ${sanitizeDbError(err)}`);
    }
  }

  async moveLearnerClass(actor: SessionUser, enrolmentId: string, newClassId: string): Promise<Enrolment> {
    if (actor.role !== "admin_staff" && actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only administrative staff or owner can move a learner between classes.");
    }

    const existing = await this.getEnrolmentById(actor, enrolmentId);
    if (!existing) {
      throw new Error(`Enrolment with id ${enrolmentId} not found.`);
    }

    const updated: Enrolment = {
      ...existing,
      classId: newClassId,
    };

    try {
      await sql`
        UPDATE enrolments
        SET class_id = ${newClassId},
            data = ${JSON.stringify(updated)}::jsonb,
            updated_at = now()
        WHERE id = ${enrolmentId};
      `;
      return updated;
    } catch (err) {
      console.error(`[PostgresEnrolmentRepo] moveLearnerClass error:`, sanitizeDbError(err));
      throw new Error(`Failed to move learner class: ${sanitizeDbError(err)}`);
    }
  }

  async updateStatus(actor: SessionUser, enrolmentId: string, status: Enrolment["status"]): Promise<Enrolment> {
    if (actor.role !== "admin_staff" && actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only administrative staff or owner can update enrolment status.");
    }

    const existing = await this.getEnrolmentById(actor, enrolmentId);
    if (!existing) {
      throw new Error(`Enrolment with id ${enrolmentId} not found.`);
    }

    const updated: Enrolment = {
      ...existing,
      status,
    };

    try {
      await sql`
        UPDATE enrolments
        SET status = ${status},
            data = ${JSON.stringify(updated)}::jsonb,
            updated_at = now()
        WHERE id = ${enrolmentId};
      `;
      return updated;
    } catch (err) {
      console.error(`[PostgresEnrolmentRepo] updateStatus error:`, sanitizeDbError(err));
      throw new Error(`Failed to update enrolment status: ${sanitizeDbError(err)}`);
    }
  }
}
