import React from "react";
import { getServerSession } from "@/lib/session";
import { getEntitlementRepo } from "@/lib/repositories";
import { listAllPlatformUsers } from "@/lib/persistedData";
import { SuperAdminDashboard } from "./SuperAdminDashboard";


export default async function SuperAdminPage() {
  const session = await getServerSession();
  if (!session) return null;

  const repo = getEntitlementRepo();
  const entitlements = await repo.listEntitlements();
  const auditLog = await repo.getAuditLog(session);
  const platformUsers = listAllPlatformUsers();

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
