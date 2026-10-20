"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { FeatureEntitlement, AuditLogEntry, UserRole } from "@/lib/repositories/types";
import type { PersistedUserRecord } from "@/lib/persistedData";
import {
  createPlatformUserAction,
  deletePlatformUserAction,
  cleanDemoUsersAction,
  impersonateUserAction,
  getPlatformBackupJsonAction,
  restorePlatformBackupAction,
} from "./actions";
import { EntitlementToggleList } from "./EntitlementToggleList";

interface SuperAdminDashboardProps {
  initialUsers: PersistedUserRecord[];
  entitlements: FeatureEntitlement[];
  auditLogs: AuditLogEntry[];
  currentSuperAdminEmail: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  initialUsers,
  entitlements,
  auditLogs,
  currentSuperAdminEmail,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "backup" | "audit" | "modules">("users");

  // User Management State
  const [users, setUsers] = useState<PersistedUserRecord[]>(initialUsers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("owner_admin");
  const [newUserPassword, setNewUserPassword] = useState("Smartminds2026!");
  const [userSearch, setUserSearch] = useState("");

  // Feedback State
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Backup & Restore State
  const [restoreJson, setRestoreJson] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setStatusMessage({ type: "error", text: "Please enter both name and email." });
      return;
    }

    startTransition(async () => {
      try {
        const res = await createPlatformUserAction({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          password: newUserPassword,
        });
        if (res.success && res.user) {
          setUsers((prev) => [res.user, ...prev.filter((u) => u.email.toLowerCase() !== res.user.email.toLowerCase())]);
          setShowCreateModal(false);
          setNewUserName("");
          setNewUserEmail("");
          setNewUserPassword("Smartminds2026!");
          setStatusMessage({
            type: "success",
            text: `Successfully created user '${res.user.name}' as ${res.user.role}. They can now log in with their credentials.`,
          });
          router.refresh();
        }
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err?.message || "Failed to create user." });
      }
    });
  };

  const handleDeleteUser = (userId: string, email: string) => {
    if (email.toLowerCase() === currentSuperAdminEmail.toLowerCase()) {
      alert("Cannot delete the primary Super Administrator account.");
      return;
    }
    if (!confirm(`Are you sure you want to remove user '${email}' from the platform?`)) return;

    startTransition(async () => {
      try {
        const res = await deletePlatformUserAction(userId);
        if (res.success) {
          setUsers((prev) => prev.filter((u) => u.id !== userId && u.email !== email));
          setStatusMessage({ type: "success", text: `User ${email} has been removed.` });
          router.refresh();
        }
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err?.message || "Failed to remove user." });
      }
    });
  };

  const handleCleanDemoUsers = () => {
    if (
      !confirm(
        "Are you sure you want to clean up all dummy/demo users and sample learners? This will keep only your superadmin account and any newly created real users."
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await cleanDemoUsersAction();
        if (res.success) {
          setStatusMessage({
            type: "success",
            text: `Demo cleanup complete! Removed ${res.cleanedUsers} demo accounts and ${res.cleanedLearners} sample learners.`,
          });
          router.refresh();
        }
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err?.message || "Failed to clean demo users." });
      }
    });
  };

  const handleImpersonate = (userId: string, email: string) => {
    startTransition(async () => {
      try {
        const res = await impersonateUserAction(userId || email);
        if (res.success && res.redirectUrl) {
          router.push(res.redirectUrl);
          router.refresh();
        }
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err?.message || "Failed to initiate impersonation." });
      }
    });
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await getPlatformBackupJsonAction();
      if (res.success && res.data) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatusMessage({
          type: "success",
          text: `Backup successfully generated and downloaded as '${res.filename}'.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to generate backup." });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRestoreJson(content);
    };
    reader.readAsText(file);
  };

  const handleRestoreSubmit = () => {
    if (!restoreJson.trim()) {
      setStatusMessage({ type: "error", text: "Please upload or paste a backup JSON snapshot." });
      return;
    }
    if (
      !confirm(
        "WARNING: Restoring from a backup will overwrite current database records with the snapshot data. Do you wish to continue?"
      )
    ) {
      return;
    }

    setIsRestoring(true);
    startTransition(async () => {
      try {
        const res = await restorePlatformBackupAction(restoreJson);
        if (res.success) {
          setStatusMessage({ type: "success", text: res.message });
          setRestoreJson("");
          router.refresh();
        } else {
          setStatusMessage({ type: "error", text: res.message });
        }
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err?.message || "Restore operation failed." });
      } finally {
        setIsRestoring(false);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-md border text-sm flex items-center justify-between gap-4 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={statusMessage.type === "success" ? "shield-check" : "info"}
              size={18}
              className={statusMessage.type === "success" ? "text-emerald-700" : "text-red-700"}
            />
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Navigation & Switcher */}
      <div className="bg-white rounded-md border border-line p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-xs font-semibold mb-2">
            <Icon name="sparkles" size={13} />
            <span>Master Control & Platform Governance</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-navy-900">
            Super Administrator Console
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Logged in as <strong className="text-navy-900 font-semibold">{currentSuperAdminEmail}</strong> (David George &bull; George Digitals).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin"
            className="px-3.5 py-2 rounded-sm border border-line text-xs font-semibold text-navy-900 bg-paper hover:bg-navy-900 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="arrow-left" size={14} />
            <span>College Admin</span>
          </Link>
          <Link
            href="/admin/cms"
            className="px-3.5 py-2 rounded-sm border border-gold-500/40 text-xs font-bold text-navy-900 bg-gold-300/30 hover:bg-gold-500 hover:text-navy-900 transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="sparkles" size={14} />
            <span>Site CMS Editor</span>
          </Link>
          <Link
            href="/student"
            className="px-3.5 py-2 rounded-sm border border-line text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Student Portal</span>
          </Link>
          <Link
            href="/staff"
            className="px-3.5 py-2 rounded-sm border border-line text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Staff Console</span>
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-line flex flex-wrap gap-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-t-md transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === "users"
              ? "border-navy-900 text-navy-900 bg-white font-bold"
              : "border-transparent text-ink-soft hover:text-navy-900 hover:bg-white/50"
          }`}
        >
          <Icon name="user" size={16} />
          <span>User Management & Impersonation</span>
          <span className="text-xs bg-navy-900 text-gold-300 px-1.5 py-0.5 rounded-full font-mono">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("backup")}
          className={`px-4 py-2.5 rounded-t-md transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === "backup"
              ? "border-navy-900 text-navy-900 bg-white font-bold"
              : "border-transparent text-ink-soft hover:text-navy-900 hover:bg-white/50"
          }`}
        >
          <Icon name="file-text" size={16} />
          <span>Platform Backup & Recovery</span>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
            Daily Auto
          </span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-t-md transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === "audit"
              ? "border-navy-900 text-navy-900 bg-white font-bold"
              : "border-transparent text-ink-soft hover:text-navy-900 hover:bg-white/50"
          }`}
        >
          <Icon name="shield-check" size={16} />
          <span>User Audit Logs</span>
          <span className="text-xs bg-paper border border-line text-ink-soft px-1.5 py-0.5 rounded-full font-mono">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("modules")}
          className={`px-4 py-2.5 rounded-t-md transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === "modules"
              ? "border-navy-900 text-navy-900 bg-white font-bold"
              : "border-transparent text-ink-soft hover:text-navy-900 hover:bg-white/50"
          }`}
        >
          <Icon name="sparkles" size={16} />
          <span>Feature Entitlements</span>
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT & IMPERSONATION */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-white rounded-md border border-line p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-navy-900">
                Registered Platform Accounts
              </h2>
              <p className="text-xs text-ink-soft mt-1">
                Create the College Owner&apos;s real account, manage staff/tutor roles, clean demo profiles, or impersonate any user to troubleshoot issues.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-sm bg-navy-900 text-white hover:bg-navy-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="user" size={14} />
                <span>+ Create Platform User</span>
              </button>

              <button
                onClick={handleCleanDemoUsers}
                disabled={isPending}
                className="px-3.5 py-2 rounded-sm border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Remove sample learners and fake demo profiles"
              >
                <Icon name="trash" size={14} />
                <span>Clean Demo Users</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-md border border-line p-4 shadow-xs">
            <div className="relative">
              <Icon
                name="search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-sm border border-line focus:outline-none focus:ring-1 focus:ring-navy-900"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-md border border-line overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-paper/60 text-ink-soft font-semibold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Created / Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-ink-soft">
                        No users match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSuper = user.role === "super_admin";
                      const isOwner = user.role === "owner_admin";
                      const isTutor = user.role === "tutor";
                      const isStudent = user.role === "student";

                      return (
                        <tr key={user.id} className="hover:bg-paper/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-navy-900">{user.name}</div>
                            <div className="text-[11px] text-ink-soft font-mono">{user.id}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-ink">
                            {user.email}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-xs font-semibold text-[11px] uppercase tracking-wider ${
                                isSuper
                                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                                  : isOwner
                                  ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                                  : isTutor
                                  ? "bg-blue-100 text-blue-900 border border-blue-300"
                                  : isStudent
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : "bg-slate-100 text-slate-900 border border-slate-300"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-ink-soft">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : "System Baseline"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isSuper && (
                                <button
                                  type="button"
                                  onClick={() => handleImpersonate(user.id, user.email)}
                                  disabled={isPending}
                                  className="px-2.5 py-1 rounded-xs bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-600 hover:text-white transition-all font-semibold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  title={`Impersonate ${user.name} to see what they see`}
                                >
                                  <Icon name="arrow-right" size={11} />
                                  <span>Impersonate</span>
                                </button>
                              )}

                              {user.email.toLowerCase() !== currentSuperAdminEmail.toLowerCase() && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                  disabled={isPending}
                                  className="p-1 rounded-xs text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer"
                                  title="Delete user"
                                >
                                  <Icon name="trash" size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create User Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-md border border-line shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-navy-900">
                      Create Platform User
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Set up the College Owner or staff credentials directly.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-ink-soft hover:text-ink cursor-pointer p-1"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Director Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3 py-2 rounded-sm border border-line focus:outline-none focus:ring-1 focus:ring-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Official Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. director@smartmindstraining.co.uk"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-sm border border-line focus:outline-none focus:ring-1 focus:ring-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Platform Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-sm border border-line focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white"
                    >
                      <option value="owner_admin">
                        College Owner (Full Admin & Financial Access)
                      </option>
                      <option value="admin_staff">
                        Admin Staff (No Financial Access)
                      </option>
                      <option value="tutor">
                        Tutor (Assigned Cohorts & Grading)
                      </option>
                      <option value="student">
                        Student / Learner
                      </option>
                    </select>
                    <p className="text-[11px] text-ink-soft mt-1">
                      Select <strong>College Owner</strong> to give the client full administrative oversight of the platform.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">
                      Initial Password
                    </label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-sm border border-line focus:outline-none focus:ring-1 focus:ring-navy-900 font-mono"
                    />
                    <p className="text-[11px] text-ink-soft mt-1">
                      User can sign in with this password and update it anytime.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-3.5 py-2 rounded-sm border border-line text-ink-soft hover:text-navy-900 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-2 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isPending ? "Creating..." : "Confirm & Create User"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLATFORM BACKUP & RECOVERY */}
      {activeTab === "backup" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-md border border-line p-6 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Icon name="shield-check" size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Automated Daily Backup
                </span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-navy-900">
                Active &amp; Healthy
              </h3>
              <p className="text-xs text-ink-soft">
                Automated continuous snapshot enabled. All learners, enrolments, credentials, and CMS state are packaged daily.
              </p>
            </div>

            <div className="bg-white rounded-md border border-line p-6 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-navy-900">
                <Icon name="file-text" size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Data Scope Indexed
                </span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-navy-900">
                100% Core Records
              </h3>
              <p className="text-xs text-ink-soft">
                Includes User Credentials, Enrolment Timetables, Course Payments, Site Theme JSON, and Feature Entitlements.
              </p>
            </div>

            <div className="bg-white rounded-md border border-line p-6 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-purple-700">
                <Icon name="sparkles" size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Disaster Recovery
                </span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-navy-900">
                One-Click Restore
              </h3>
              <p className="text-xs text-ink-soft">
                Instant restore from downloaded JSON snapshots to recover the entire platform state in seconds.
              </p>
            </div>
          </div>

          {/* Backup Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Download Snapshot Card */}
            <div className="bg-white rounded-md border border-line p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <Icon name="download" size={18} className="text-navy-900" />
                <h3 className="font-heading text-lg font-bold text-navy-900">
                  Export Platform Snapshot
                </h3>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Generate an immediate point-in-time JSON archive of the Smartminds platform. You can store this backup on your local drive or secure cloud storage.
              </p>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full py-2.5 px-4 rounded-sm bg-navy-900 text-gold-300 hover:bg-navy-700 hover:text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Icon name="download" size={15} />
                <span>Download Platform Backup (.json)</span>
              </button>
            </div>

            {/* Restore Platform Card */}
            <div className="bg-white rounded-md border border-line p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <Icon name="layers" size={18} className="text-navy-900" />
                <h3 className="font-heading text-lg font-bold text-navy-900">
                  Restore Platform from Backup
                </h3>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Upload a previously saved Smartminds backup file to roll back or recover the platform data.
              </p>

              <div>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-ink-soft file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-gold-300 hover:file:bg-navy-700 cursor-pointer"
                />
              </div>

              {restoreJson && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-sm border border-emerald-300 flex items-center justify-between">
                  <span>Backup JSON loaded ({restoreJson.length} bytes ready).</span>
                  <button
                    onClick={() => setRestoreJson("")}
                    className="underline text-emerald-900 font-bold"
                  >
                    Clear
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={!restoreJson || isRestoring}
                onClick={handleRestoreSubmit}
                className="w-full py-2.5 px-4 rounded-sm bg-red-800 text-white hover:bg-red-700 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Icon name="shield-check" size={15} />
                <span>{isRestoring ? "Restoring Platform..." : "Execute Platform Restore"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
          <div className="p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper/50">
            <div>
              <h2 className="font-heading text-xl font-bold text-navy-900">
                Cryptographic User Audit Trail
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Immutable audit log tracking system state transitions, user access, and governance activities.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-1 rounded-sm bg-navy-900 text-gold-300">
              Security Audit Log
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-ink-soft font-semibold">
                  <th className="py-2.5 px-4">Timestamp (UTC)</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ink-soft">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-paper/30 font-mono text-[11px]">
                      <td className="py-3 px-4 text-ink-soft whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-navy-900">{log.actorEmail}</span>
                        <span className="text-ink-soft block text-[10px]">Role: {log.actorRole}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-xs bg-navy-900 text-gold-300 font-semibold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink max-w-md break-words font-sans text-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FEATURE ENTITLEMENTS */}
      {activeTab === "modules" && (
        <div className="space-y-6">
          <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
            <div className="p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper/50">
              <div>
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Feature Entitlements (Module Switches)
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Only the super admin can modify module switches. Every state change is immutably appended to the audit log.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded-sm bg-navy-900 text-gold-300">
                Module Management
              </span>
            </div>

            <EntitlementToggleList initialEntitlements={entitlements} />
          </div>

          {/* Roles & Permissions Matrix */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-line pb-4">
              <Icon name="shield-check" size={20} className="text-navy-900" />
              <h2 className="font-heading text-xl font-bold text-navy-900">
                Roles &amp; Permissions Matrix (Enforced at Data Layer)
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
                      See other learners, tutor consoles, administrative portals, or financial ledger
                    </td>
                  </tr>
                  <tr className="hover:bg-paper/40">
                    <td className="py-3 px-3 font-bold text-navy-900">Staff (Tutor)</td>
                    <td className="py-3 px-3 text-ink-soft">Teaching faculty</td>
                    <td className="py-3 px-3 text-ink">
                      Assigned cohort learners, unit grading, live Zoom timetables, marking queue
                    </td>
                    <td className="py-3 px-3 text-red-700 font-medium">
                      Payment records, tuition balances, unassigned cohorts, superadmin controls
                    </td>
                  </tr>
                  <tr className="hover:bg-paper/40">
                    <td className="py-3 px-3 font-bold text-navy-900">Admin Staff</td>
                    <td className="py-3 px-3 text-ink-soft">College administration</td>
                    <td className="py-3 px-3 text-ink">
                      Learner admissions, class cohort allocation, tutor scheduling, document requests
                    </td>
                    <td className="py-3 px-3 text-red-700 font-medium">
                      Strict zero access to PaymentRepo, student fee balances, or financial ledger
                    </td>
                  </tr>
                  <tr className="hover:bg-paper/40">
                    <td className="py-3 px-3 font-bold text-navy-900">Owner Admin</td>
                    <td className="py-3 px-3 text-ink-soft">College Director / Owner</td>
                    <td className="py-3 px-3 text-ink">
                      Full college operations, financial balances, payment tracking, staff management, CMS
                    </td>
                    <td className="py-3 px-3 text-ink-soft font-medium">
                      Feature module switches (reserved for Super Admin developer console)
                    </td>
                  </tr>
                  <tr className="hover:bg-paper/40">
                    <td className="py-3 px-3 font-bold text-purple-900">Super Admin</td>
                    <td className="py-3 px-3 text-ink-soft">David George (George Digitals)</td>
                    <td className="py-3 px-3 text-purple-950 font-medium">
                      Feature switches, create user accounts, impersonation, audit logs, backup and recovery, CMS
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-medium">
                      Unrestricted platform developer governance
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
