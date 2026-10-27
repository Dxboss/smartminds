import { sql } from "../../db";
import { EntitlementRepo } from "../interfaces";
import {
  AuditLogEntry,
  FeatureEntitlement,
  FeatureModuleKey,
  PermissionDeniedError,
  SessionUser,
} from "../types";
import { seedEntitlements } from "../seedData";

export class PostgresEntitlementRepo implements EntitlementRepo {
  async listEntitlements(): Promise<FeatureEntitlement[]> {
    try {
      const rows = (await sql`
        SELECT module_key, name, description, enabled, enabled_by, enabled_at
        FROM feature_entitlements
        ORDER BY module_key ASC
      `) as any[];

      if (!rows || rows.length === 0) {
        return seedEntitlements.map((e) => ({ ...e }));
      }

      return rows.map((r) => ({
        module_key: r.module_key as FeatureModuleKey,
        name: r.name || "",
        description: r.description || "",
        enabled: Boolean(r.enabled),
        enabled_by: r.enabled_by || "",
        enabled_at: r.enabled_at ? new Date(r.enabled_at).toISOString() : "",
      }));
    } catch (err) {
      console.warn("[PostgresEntitlementRepo] listEntitlements error, using seeds:", err);
      return seedEntitlements.map((e) => ({ ...e }));
    }
  }

  async isModuleEnabled(moduleKey: FeatureModuleKey): Promise<boolean> {
    try {
      const rows = (await sql`
        SELECT enabled
        FROM feature_entitlements
        WHERE module_key = ${moduleKey}
        LIMIT 1
      `) as any[];

      if (!rows || rows.length === 0) {
        const fallback = seedEntitlements.find((e) => e.module_key === moduleKey);
        return fallback ? fallback.enabled : false;
      }

      return Boolean(rows[0].enabled);
    } catch (err) {
      console.warn("[PostgresEntitlementRepo] isModuleEnabled error, using seeds:", err);
      const fallback = seedEntitlements.find((e) => e.module_key === moduleKey);
      return fallback ? fallback.enabled : false;
    }
  }

  async updateEntitlement(
    actor: SessionUser,
    moduleKey: FeatureModuleKey,
    enabled: boolean
  ): Promise<FeatureEntitlement> {
    const isSuper = actor.role === "super_admin" || actor.originalRole === "super_admin";
    if (!isSuper) {
      throw new PermissionDeniedError(
        "Permission denied: Only the super admin has authority to toggle feature entitlements."
      );
    }

    try {
      const currentRows = (await sql`
        SELECT module_key, name, description, enabled
        FROM feature_entitlements
        WHERE module_key = ${moduleKey}
        LIMIT 1
      `) as any[];

      const previousState = currentRows.length > 0 ? Boolean(currentRows[0].enabled) : false;
      const nowIso = new Date().toISOString();
      const enabledBy = actor.name || actor.email;

      const updated = (await sql`
        INSERT INTO feature_entitlements (module_key, name, description, enabled, enabled_by, enabled_at, updated_at)
        VALUES (${moduleKey}, ${currentRows[0]?.name || moduleKey}, ${currentRows[0]?.description || ""}, ${enabled}, ${enabledBy}, ${nowIso}, ${nowIso})
        ON CONFLICT (module_key) DO UPDATE
        SET enabled = EXCLUDED.enabled,
            enabled_by = EXCLUDED.enabled_by,
            enabled_at = EXCLUDED.enabled_at,
            updated_at = EXCLUDED.updated_at
        RETURNING module_key, name, description, enabled, enabled_by, enabled_at
      `) as any[];

      // Record audit log entry in transaction or append
      const auditId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const details = `Module '${moduleKey}' switched from ${previousState} to ${enabled} by ${actor.name} (${actor.email})`;
      try {
        await sql`
          INSERT INTO audit_logs (id, actor_user_id, actor_email, actor_role, action, details, timestamp)
          VALUES (${auditId}, ${actor.id}, ${actor.email}, ${actor.role}, 'UPDATE_FEATURE_ENTITLEMENT', ${details}, ${nowIso})
        `;
      } catch (auditErr) {
        console.warn("[PostgresEntitlementRepo] Failed to insert audit log:", auditErr);
      }

      const r = updated[0];
      return {
        module_key: r.module_key as FeatureModuleKey,
        name: r.name || "",
        description: r.description || "",
        enabled: Boolean(r.enabled),
        enabled_by: r.enabled_by || "",
        enabled_at: r.enabled_at ? new Date(r.enabled_at).toISOString() : nowIso,
      };
    } catch (err) {
      console.error("[PostgresEntitlementRepo] Failed to update entitlement:", err);
      throw err;
    }
  }

  async recordCustomAudit(params: {
    action: string;
    details: string;
    actor: SessionUser;
  }): Promise<void> {
    try {
      const auditId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const nowIso = new Date().toISOString();
      await sql`
        INSERT INTO audit_logs (id, actor_user_id, actor_email, actor_role, action, details, timestamp)
        VALUES (${auditId}, ${params.actor.id}, ${params.actor.email}, ${params.actor.role}, ${params.action}, ${params.details}, ${nowIso})
      `;
    } catch (err) {
      console.warn("[PostgresEntitlementRepo] Failed to record custom audit:", err);
    }
  }

  async getAuditLog(actor: SessionUser): Promise<AuditLogEntry[]> {
    const isSuper = actor.role === "super_admin" || actor.originalRole === "super_admin";
    if (!isSuper) {
      throw new PermissionDeniedError(
        "Only the super admin can inspect administrative system audit logs."
      );
    }

    try {
      const rows = (await sql`
        SELECT id, actor_user_id, actor_email, actor_role, action, details, timestamp
        FROM audit_logs
        ORDER BY timestamp DESC
        LIMIT 200
      `) as any[];

      return rows.map((r) => ({
        id: r.id,
        actorUserId: r.actor_user_id,
        actorEmail: r.actor_email,
        actorRole: r.actor_role,
        action: r.action,
        details: r.details || "",
        timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.warn("[PostgresEntitlementRepo] Error querying audit_logs, fallback to local store:", err);
      try {
        const { getAuditLogsFromStore } = await import("@/lib/persistedData");
        return getAuditLogsFromStore();
      } catch {
        return [];
      }
    }
  }
}
