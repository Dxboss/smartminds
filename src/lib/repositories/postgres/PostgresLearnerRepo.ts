import { Learner } from "@/lib/repositories/types";
import { LearnerRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";
import { sql, isDbConfigured } from "@/lib/db";
import { sanitizeDbError } from "@/lib/migrations";

export class PostgresLearnerRepo implements LearnerRepo {
  private async getLearnerIdsForTutor(tutorId?: string, tutorName?: string): Promise<Set<string>> {
    if (!tutorId && !tutorName) return new Set();
    try {
      const cleanName = (tutorName || "").trim().toLowerCase();
      const firstName = cleanName.split(" ")[0] || "";
      const rows = (await sql`
        SELECT DISTINCT COALESCE(e.learner_id, e.data->>'learnerId') AS learner_id
        FROM enrolments e
        LEFT JOIN classes c ON (e.class_id = c.id OR e.data->>'classId' = c.id)
        WHERE (${tutorId || ""} <> '' AND (c.tutor_id = ${tutorId || ""} OR e.data->>'tutorId' = ${tutorId || ""}))
           OR (${cleanName} <> '' AND (
                LOWER(COALESCE(e.data->>'tutorName', '')) = ${cleanName}
                OR (${firstName.length >= 3} AND LOWER(COALESCE(e.data->>'tutorName', '')) = ${firstName})
              ));
      `) as { learner_id: string }[];
      return new Set(rows.map((r) => r.learner_id).filter(Boolean));
    } catch (err) {
      console.error("[PostgresLearnerRepo] getLearnerIdsForTutor error:", sanitizeDbError(err));
      return new Set();
    }
  }

  async listLearners(actor: SessionUser): Promise<Learner[]> {
    if (actor.role === "student") {
      throw new PermissionDeniedError("Students are strictly prohibited from listing other learners.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      if (actor.role === "tutor") {
        const allowedIds = await this.getLearnerIdsForTutor(actor.tutorId, actor.name);
        if (allowedIds.size === 0) return [];

        const idArray = Array.from(allowedIds);
        const rows = (await sql`
          SELECT data FROM learners WHERE id = ANY(${idArray}::text[]) ORDER BY last_name ASC;
        `) as { data: Learner }[];
        return rows.map((r) => r.data);
      }

      // admin_staff, owner_admin, super_admin
      const rows = (await sql`
        SELECT data FROM learners ORDER BY last_name ASC;
      `) as { data: Learner }[];
      return rows.map((r) => r.data);
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresLearnerRepo] listLearners error:", sanitizeDbError(err));
      throw new Error(`Failed to list learners from database: ${sanitizeDbError(err)}`);
    }
  }

  async getLearnerById(actor: SessionUser, id: string): Promise<Learner | null> {
    if (actor.role === "student") {
      if (actor.learnerId !== id) {
        throw new PermissionDeniedError("Students may only access their own learner record.");
      }
    } else if (actor.role === "tutor") {
      const allowedIds = await this.getLearnerIdsForTutor(actor.tutorId, actor.name);
      if (!allowedIds.has(id)) {
        throw new PermissionDeniedError("Tutors may only access learners enrolled in their assigned classes.");
      }
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT data FROM learners WHERE id = ${id} LIMIT 1;
      `) as { data: Learner }[];

      return rows[0]?.data || null;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresLearnerRepo] getLearnerById(${id}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to fetch learner from database: ${sanitizeDbError(err)}`);
    }
  }

  async updateLearnerStatus(
    actor: SessionUser,
    id: string,
    status: "active" | "paused" | "archived",
    archiveReason?: string
  ): Promise<Learner> {
    if (actor.role !== "admin_staff" && actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only administrative staff and owner admin can modify learner status.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const existing = await this.getLearnerById(actor, id);
      if (!existing) {
        throw new Error(`Learner with id ${id} not found.`);
      }

      const updated: Learner = {
        ...existing,
        accessStatus: status,
      };

      if (status === "archived") {
        updated.archivedAt = new Date().toISOString();
        if (archiveReason) updated.archiveReason = archiveReason;
      } else {
        delete updated.archivedAt;
        delete updated.archiveReason;
      }

      await sql`
        UPDATE learners
        SET access_status = ${status},
            archive_reason = ${archiveReason || null},
            archived_at = ${status === "archived" ? new Date().toISOString() : null},
            data = ${JSON.stringify(updated)}::jsonb,
            updated_at = now()
        WHERE id = ${id};
      `;

      return updated;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresLearnerRepo] updateLearnerStatus(${id}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to update learner status: ${sanitizeDbError(err)}`);
    }
  }
}
