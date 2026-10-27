import { sql } from "../../db";
import { UserRepo } from "../interfaces";
import {
  PermissionDeniedError,
  SessionUser,
  UserProfile,
  UserRole,
} from "../types";

export class PostgresUserRepo implements UserRepo {
  private mapRowToUserProfile(row: any): UserProfile {
    const extra = row.data && typeof row.data === "object" ? row.data : {};
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as UserRole,
      active: row.active ?? true,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      tutorId: row.tutor_id || extra.tutorId,
      learnerId: row.learner_id || extra.learnerId,
      specialism: row.specialism || extra.specialism,
      department: row.department || extra.department,
    };
  }

  async getUserById(
    actor: SessionUser,
    id: string
  ): Promise<UserProfile | null> {
    if (
      actor.id !== id &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Users can only retrieve their own account profile."
      );
    }

    const rows = (await sql`
      SELECT id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at
      FROM user_credentials
      WHERE id = ${id}
      LIMIT 1
    `) as any[];

    if (!rows || rows.length === 0) return null;
    return this.mapRowToUserProfile(rows[0]);
  }

  async listStaffAndTutors(actor: SessionUser): Promise<UserProfile[]> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only staff members and administrators can list college staff and tutors."
      );
    }

    const rows = (await sql`
      SELECT id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at
      FROM user_credentials
      WHERE role IN ('tutor', 'admin_staff', 'owner_admin')
      ORDER BY name ASC
    `) as any[];

    return rows.map((r) => this.mapRowToUserProfile(r));
  }

  async inviteUser(
    actor: SessionUser,
    data: {
      email: string;
      name: string;
      role: UserRole;
      specialism?: string;
      department?: string;
    }
  ): Promise<UserProfile> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can issue staff/tutor invitations."
      );
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const email = data.email.toLowerCase().trim();
    const tutorId = data.role === "tutor" ? `tutor-${Date.now()}` : null;
    const nowIso = new Date().toISOString();

    const inserted = (await sql`
      INSERT INTO user_credentials (
        id, email, name, role, tutor_id, active, specialism, department, data, created_at, updated_at
      )
      VALUES (
        ${id},
        ${email},
        ${data.name},
        ${data.role},
        ${tutorId},
        true,
        ${data.specialism || null},
        ${data.department || null},
        ${JSON.stringify({ specialism: data.specialism, department: data.department })}::jsonb,
        ${nowIso},
        ${nowIso}
      )
      RETURNING id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at
    `) as any[];

    return this.mapRowToUserProfile(inserted[0]);
  }

  async deactivateUser(actor: SessionUser, id: string): Promise<UserProfile> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can deactivate staff members."
      );
    }

    const updated = (await sql`
      UPDATE user_credentials
      SET active = false,
          updated_at = now()
      WHERE id = ${id}
      RETURNING id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at
    `) as any[];

    if (!updated || updated.length === 0) {
      throw new Error(`User ${id} not found.`);
    }

    return this.mapRowToUserProfile(updated[0]);
  }

  async toggleUserStatus(actor: SessionUser, id: string): Promise<UserProfile> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can change staff activation status."
      );
    }

    const updated = (await sql`
      UPDATE user_credentials
      SET active = NOT active,
          updated_at = now()
      WHERE id = ${id}
      RETURNING id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at
    `) as any[];

    if (!updated || updated.length === 0) {
      throw new Error(`User ${id} not found.`);
    }

    return this.mapRowToUserProfile(updated[0]);
  }

  async deleteUser(actor: SessionUser, id: string): Promise<boolean> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can remove staff members."
      );
    }

    const targetRows = (await sql`
      SELECT id, role, email FROM user_credentials WHERE id = ${id} LIMIT 1
    `) as any[];

    if (!targetRows || targetRows.length === 0) return false;
    const target = targetRows[0];

    if (target.role === "owner_admin" || target.role === "super_admin") {
      throw new Error("Cannot delete primary Owner or Super Administrator account.");
    }

    await sql`
      DELETE FROM user_credentials WHERE id = ${id}
    `;

    return true;
  }
}
