import { EntitlementRepo } from "../interfaces";
import {
  AuditLogEntry,
  FeatureEntitlement,
  FeatureModuleKey,
  PermissionDeniedError,
  SessionUser,
} from "../types";
import { seedEntitlements, seedAuditLog } from "../seedData";

export class MemoryEntitlementRepo implements EntitlementRepo {
  private entitlements: FeatureEntitlement[] = [...seedEntitlements];
  private auditLog: AuditLogEntry[] = [...seedAuditLog];

  async listEntitlements(): Promise<FeatureEntitlement[]> {
    return this.entitlements.map((e) => ({ ...e }));
  }

  async isModuleEnabled(moduleKey: FeatureModuleKey): Promise<boolean> {
    const item = this.entitlements.find((e) => e.module_key === moduleKey);
    return item ? item.enabled : false;
  }

  async updateEntitlement(
    actor: SessionUser,
    moduleKey: FeatureModuleKey,
    enabled: boolean
  ): Promise<FeatureEntitlement> {
    if (actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Permission denied: Only the super admin has authority to toggle feature entitlements."
      );
    }

    const item = this.entitlements.find((e) => e.module_key === moduleKey);
    if (!item) {
      throw new Error(`Module key '${moduleKey}' is not registered in feature entitlements.`);
    }

    const previousState = item.enabled;
    item.enabled = enabled;
    item.enabled_by = actor.name || actor.email;
    item.enabled_at = new Date().toISOString();

    // Record audit log entry
    const auditEntry: AuditLogEntry = {
      id: `audit-${(this.auditLog.length + 1).toString().padStart(3, "0")}`,
      actorUserId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "UPDATE_FEATURE_ENTITLEMENT",
      details: `Module '${moduleKey}' switched from ${previousState} to ${enabled} by ${actor.name} (${actor.email})`,
      timestamp: new Date().toISOString(),
    };
    this.auditLog.push(auditEntry);

    return { ...item };
  }

  async getAuditLog(actor: SessionUser): Promise<AuditLogEntry[]> {
    if (actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the super admin can inspect administrative system audit logs."
      );
    }
    return this.auditLog.map((a) => ({ ...a }));
  }
}
