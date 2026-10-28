import React from "react";
import { getServerSession } from "@/lib/session";
import { getEntitlementRepo } from "@/lib/repositories";
import { listAllPlatformUsers, pullLatestFromNeon } from "@/lib/persistedData";
import { SuperAdminDashboard } from "./SuperAdminDashboard";


export default async function SuperAdminPage() {
  const session = await getServerSession();
  if (!session) return null;

  await pullLatestFromNeon();

  let entitlements: any[] = [];
  let auditLog: any[] = [];
  let platformUsers: any[] = [];

  try {
    const repo = getEntitlementRepo();
    entitlements = await repo.listEntitlements();
  } catch (err) {
    console.error("[SuperAdminPage] Failed to fetch entitlements:", err);
    try {
      const { seedEntitlements } = await import("@/lib/repositories/seedData");
      entitlements = seedEntitlements.map((e) => ({ ...e }));
    } catch {
      entitlements = [];
    }
  }

  try {
    const repo = getEntitlementRepo();
    auditLog = await repo.getAuditLog(session);
  } catch (err) {
    console.error("[SuperAdminPage] Failed to fetch audit log:", err);
    try {
      const { getAuditLogsFromStore } = await import("@/lib/persistedData");
      auditLog = getAuditLogsFromStore();
    } catch {
      auditLog = [];
    }
  }

  try {
    platformUsers = listAllPlatformUsers();
  } catch (err) {
    console.error("[SuperAdminPage] Failed to load platform users:", err);
    platformUsers = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SuperAdminDashboard
        initialUsers={platformUsers}
        entitlements={entitlements}
        auditLogs={auditLog}
        currentSuperAdminEmail={session.impersonatorEmail || session.email}
      />
    </div>
  );
}
