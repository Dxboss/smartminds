import React from "react";
import { getServerSession } from "@/lib/session";
import { getEntitlementRepo } from "@/lib/repositories";
import { EntitlementToggleList } from "./EntitlementToggleList";
import { Icon } from "@/components/ui/Icon";

export default async function SuperAdminPage() {
  const session = await getServerSession();
  if (!session) return null;

  const repo = getEntitlementRepo();
  const entitlements = await repo.listEntitlements();
  const auditLog = await repo.getAuditLog(session);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-xs font-semibold">
            <Icon name="sparkles" size={14} />
            <span>Developer Governance Console</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Super Administrator Control
          </h1>
          <p className="text-sm text-ink-soft">
            Manage system-wide feature entitlements, review cryptographic session logs, and audit configuration changes.
          </p>
        </div>
      </div>

      {/* Feature Entitlements Section (PRD Section 6) */}
      <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
        <div className="p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper/50">
          <div>
            <h2 className="font-heading text-xl font-bold text-navy-900">
              Feature entitlements (Module switches)
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Only the super admin can modify module switches. Every state change is immutably appended to the audit log.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-1 rounded-sm bg-navy-900 text-gold-300 self-start sm:self-auto">
            PRD Section 6
          </span>
        </div>

        <EntitlementToggleList initialEntitlements={entitlements} />
      </div>

      {/* Roles & Permissions Matrix (PRD Section 3) */}
      <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-line pb-4">
          <Icon name="shield-check" size={20} className="text-navy-900" />
          <h2 className="font-heading text-xl font-bold text-navy-900">
            Roles & permissions matrix (Enforced at Data Layer)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Identity Scope</th>
                <th className="py-2.5 px-3">Authorized Actions</th>
                <th className="py-2.5 px-3">Strictly Prohibited Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr className="hover:bg-paper/40">
                <td className="py-3 px-3 font-bold text-navy-900">Student</td>
                <td className="py-3 px-3 text-ink-soft">Enrolled learner</td>
                <td className="py-3 px-3 text-ink">
                  Own course units, stream-only recordings, assignments, grades, own payment balance
                </td>
                <td className="py-3 px-3 text-red-700 font-medium">
                  See other learners, tutor consoles, administrative portals, or ledger
                </td>
              </tr>
              <tr className="hover:bg-paper/40">
                <td className="py-3 px-3 font-bold text-navy-900">Staff (Tutor)</td>
                <td className="py-3 px-3 text-ink-soft">Teaching faculty</td>
                <td className="py-3 px-3 text-ink">
                  Own classes and learners, Zoom links, recordings, assignments, criteria marking
                </td>
                <td className="py-3 px-3 text-red-700 font-medium">
                  See payments or college revenue, other teachers&apos; classes, edit prices/courses
                </td>
              </tr>
              <tr className="hover:bg-paper/40">
                <td className="py-3 px-3 font-bold text-navy-900">Administrative staff</td>
                <td className="py-3 px-3 text-ink-soft">Office team</td>
                <td className="py-3 px-3 text-ink">
                  Handle enquiries, bookings, learner records (active/paused), class moves, send approved templates
                </td>
                <td className="py-3 px-3 text-red-700 font-medium">
                  Any payment amounts, balances, totals, exports or financial alerts
                </td>
              </tr>
              <tr className="hover:bg-paper/40">
                <td className="py-3 px-3 font-bold text-navy-900">Owner admin</td>
                <td className="py-3 px-3 text-ink-soft">College Principal (Client)</td>
                <td className="py-3 px-3 text-ink">
                  Everything day-to-day: payments ledger, courses, pricing, tutors, availability, template library
                </td>
                <td className="py-3 px-3 text-ink-soft">
                  Modules locked by agency super admin via feature entitlements
                </td>
              </tr>
              <tr className="hover:bg-paper/40">
                <td className="py-3 px-3 font-bold text-navy-900">Super admin</td>
                <td className="py-3 px-3 text-ink-soft">Engineering agency</td>
                <td className="py-3 px-3 text-ink">
                  All capabilities plus feature entitlement toggling, system audit logs, environment reset
                </td>
                <td className="py-3 px-3 text-ink-soft">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Viewer */}
      <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Icon name="info" size={20} className="text-navy-900" />
            <h2 className="font-heading text-xl font-bold text-navy-900">
              System audit log
            </h2>
          </div>
          <span className="text-xs font-semibold text-ink-soft">
            {auditLog.length} Recorded actions
          </span>
        </div>

        <div className="divide-y divide-line">
          {auditLog.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-900">{log.action}</span>
                  <span className="text-ink-soft font-mono text-[11px]">by {log.actorEmail}</span>
                  <span className="px-1.5 py-0.2 rounded-sm bg-navy-900/5 text-ink-soft font-semibold text-[10px]">
                    {log.actorRole}
                  </span>
                </div>
                <p className="text-ink-soft">{log.details}</p>
              </div>
              <span className="text-ink-soft font-mono text-[11px] self-start sm:self-auto">
                {new Date(log.timestamp).toLocaleString("en-GB")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
