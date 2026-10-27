"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { UserProfile, ClassCohort, Booking, Task } from "@/lib/repositories/types";
import {
  inviteStaffMemberAction,
  toggleStaffStatusAction,
  removeStaffMemberAction,
  updateStaffMemberAction,
} from "@/app/admin/actions";
import { impersonateUserAction } from "@/app/super/actions";
import { DEFAULT_COLLEGE_FACULTIES, type FacultyRecord } from "@/content/faculties";
import type { ImpersonationAuditLog } from "@/lib/persistedData";

interface Props {
  initialUsers: UserProfile[];
  classes: ClassCohort[];
  bookings: Booking[];
  tasks: Task[];
  userRole: string;
  faculties?: FacultyRecord[];
  initialImpersonationLogs?: ImpersonationAuditLog[];
}

export const StaffDirectory: React.FC<Props> = ({
  initialUsers,
  classes,
  bookings,
  tasks,
  userRole,
  faculties = DEFAULT_COLLEGE_FACULTIES,
  initialImpersonationLogs = [],
}) => {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Impersonation state
  const [isImpersonatingId, setIsImpersonatingId] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs] = useState<ImpersonationAuditLog[]>(initialImpersonationLogs);

  // Invite modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"tutor" | "admin_staff">("tutor");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [inviteSpecialism, setInviteSpecialism] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<string>("tutor");
  const [editDepartment, setEditDepartment] = useState("");
  const [editSpecialism, setEditSpecialism] = useState("");
  const [editFacultyId, setEditFacultyId] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const isOwnerOrSuper = userRole === "owner_admin" || userRole === "super_admin";

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all") {
      if (roleFilter === "tutors" && u.role !== "tutor") return false;
      if (roleFilter === "admin_staff" && u.role !== "admin_staff") return false;
      if (roleFilter === "active" && !u.active) return false;
      if (roleFilter === "inactive" && u.active) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchSpec = u.specialism?.toLowerCase().includes(q) || false;
      const matchDept = u.department?.toLowerCase().includes(q) || false;
      if (!matchName && !matchEmail && !matchSpec && !matchDept) return false;
    }

    return true;
  });

  // Calculate workload metrics
  const getTutorClasses = (tutorId?: string) => {
    if (!tutorId) return [];
    return classes.filter((c) => c.tutorId === tutorId);
  };

  const getStaffBookings = (userId: string) => {
    return bookings.filter((b) => b.assignedStaffId === userId);
  };

  const getStaffTasks = (userId: string) => {
    return tasks.filter((t) => t.assignedToId === userId && t.status !== "completed");
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!isOwnerOrSuper) return;
    try {
      const res = await toggleStaffStatusAction(userId);
      if (!res.success || !res.user) {
        alert(res.error || "Failed to update staff status");
        return;
      }
      const updatedUser = res.user;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: updatedUser.active } : u))
      );
      setFeedback(
        `Staff member status updated: ${updatedUser.name} is now ${
          updatedUser.active ? "Active" : "Inactive"
        }.`
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update staff status");
    }
  };

  const handleRemoveStaff = async (userId: string, userName: string) => {
    if (!isOwnerOrSuper) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently remove ${userName} from the staff directory? This will delete their account and revoke all portal permissions immediately.`
    );
    if (!confirmed) return;

    try {
      const res = await removeStaffMemberAction(userId);
      if (!res.success) {
        alert(res.error || "Failed to remove staff member");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFeedback(`Staff member ${userName} has been permanently removed.`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove staff member");
    }
  };

  const handleImpersonate = async (userIdOrEmail: string, name: string) => {
    if (!isOwnerOrSuper) return;
    setIsImpersonatingId(userIdOrEmail);
    try {
      const res = await impersonateUserAction(userIdOrEmail);
      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        alert(res.error || "Failed to impersonate staff member");
        setIsImpersonatingId(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to impersonate staff member");
      setIsImpersonatingId(null);
    }
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDepartment(user.department || "");
    setEditSpecialism(user.specialism || "");
    setEditActive(user.active !== false);

    // Match faculty from department or specialism or pre-select
    const matchedFac = faculties.find(
      (f) =>
        (user.department && f.name.toLowerCase().includes(user.department.toLowerCase())) ||
        (user.specialism && f.name.toLowerCase().includes(user.specialism.toLowerCase()))
    );
    setEditFacultyId(matchedFac?.id || faculties[0]?.id || "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;

    setIsEditSubmitting(true);
    try {
      const selectedFaculty = faculties.find((f) => f.id === editFacultyId);
      const res = await updateStaffMemberAction({
        userIdOrEmail: editingUser.id || editingUser.email,
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole as any,
        department: editDepartment.trim() || selectedFaculty?.name,
        specialism: editSpecialism.trim(),
        facultyId: editFacultyId,
        facultyName: selectedFaculty?.name,
        active: editActive,
      });

      if (!res.success || !res.user) {
        alert(res.error || "Failed to update staff member");
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id || u.email.toLowerCase() === editingUser.email.toLowerCase()
            ? {
                ...u,
                name: res.user!.name,
                email: res.user!.email,
                role: res.user!.role as any,
                department: res.user!.department,
                specialism: res.user!.specialism,
                active: res.user!.active !== false,
              }
            : u
        )
      );
      setEditingUser(null);
      setFeedback(`Successfully updated ${res.user.name}'s profile, faculty, and platform permissions.`);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update staff member");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await inviteStaffMemberAction({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        department: inviteDepartment || undefined,
        specialism: inviteSpecialism || undefined,
      });

      if (!res.success || !res.user) {
        alert(res.error || "Failed to send staff invitation");
        return;
      }

      setUsers((prev) => [...prev, res.user!]);
      setIsModalOpen(false);
      setInviteName("");
      setInviteEmail("");
      setInviteDepartment("");
      setInviteSpecialism("");
      setFeedback(
        `Invitation issued to ${res.user.name}. Onboarding notification dispatched to Outbox.`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send staff invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics summary
  const totalTutors = users.filter((u) => u.role === "tutor").length;
  const totalAdminStaff = users.filter((u) => u.role === "admin_staff").length;
  const activeStaff = users.filter((u) => u.active).length;

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          role="status"
          className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2"
        >
          <Icon name="check-circle" size={16} className="text-emerald-700" />
          <span>{feedback}</span>
        </div>
      )}

      {/* College Staff KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-line shadow-sm">
          <div className="flex items-center justify-between text-ink-soft mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Active Staff
            </span>
            <Icon name="users" size={18} className="text-navy-900" />
          </div>
          <div className="font-heading text-3xl font-bold text-navy-900">
            {activeStaff}
          </div>
          <div className="text-[11px] text-ink-soft mt-1">
            Across teaching & operations
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-line shadow-sm">
          <div className="flex items-center justify-between text-ink-soft mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tutors & Assessors
            </span>
            <Icon name="graduation-cap" size={18} className="text-navy-700" />
          </div>
          <div className="font-heading text-3xl font-bold text-navy-900">
            {totalTutors}
          </div>
          <div className="text-[11px] text-ink-soft mt-1">
            Delivering live online evening cohorts
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-line shadow-sm">
          <div className="flex items-center justify-between text-ink-soft mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Admissions & Admin
            </span>
            <Icon name="calendar" size={18} className="text-navy-700" />
          </div>
          <div className="font-heading text-3xl font-bold text-navy-900">
            {totalAdminStaff}
          </div>
          <div className="text-[11px] text-ink-soft mt-1">
            Managing advisory appointments & onboarding
          </div>
        </div>

        <div className="bg-paper p-5 rounded-md border border-line shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-ink-soft mb-1">
            <Icon name="shield-check" size={18} className="text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-navy-900">
              Financial Access Barrier
            </span>
          </div>
          <p className="text-[11px] text-ink-soft leading-relaxed mt-1">
            Strict repository permission barrier enforced: Administrative staff have{" "}
            <strong className="text-navy-900 font-semibold">zero access</strong> to
            payment records or ledgers.
          </p>
        </div>
      </div>

      {/* Directory Controls Bar */}
      <div className="bg-white p-4 rounded-md border border-line shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-ink-soft font-semibold mr-1">Filter:</span>
          {[
            { id: "all", label: `All Staff (${users.length})` },
            { id: "tutors", label: `Tutors (${totalTutors})` },
            { id: "admin_staff", label: `Administrative Staff (${totalAdminStaff})` },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRoleFilter(f.id)}
              className={`px-3 py-1.5 rounded-sm font-semibold transition-colors ${
                roleFilter === f.id
                  ? "bg-navy-900 text-white"
                  : "bg-paper text-ink-soft hover:text-ink border border-line"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search name, specialism, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
            />
            <div className="absolute left-2.5 top-2 text-ink-soft pointer-events-none">
              <Icon name="search" size={14} />
            </div>
          </div>

          {isOwnerOrSuper && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(true)}
                className="px-3 py-1.5 bg-paper hover:bg-gold-300/30 text-navy-900 border border-line rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
                title="View immutable security and impersonation access logs"
              >
                <Icon name="shield-check" size={14} className="text-gold-700" />
                <span>Security Logs ({auditLogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-700 text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Icon name="plus" size={14} />
                <span>Add Staff Member</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Security Band</th>
                <th className="py-3 px-4">Faculty / Department</th>
                <th className="py-3 px-4">Assigned Workload</th>
                <th className="py-3 px-4">Status</th>
                {isOwnerOrSuper && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-soft">
                    No staff members match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const tutorCohorts = getTutorClasses(u.tutorId);
                  const staffBookings = getStaffBookings(u.id);
                  const openTasks = getStaffTasks(u.id);

                  return (
                    <tr key={u.id} className="hover:bg-paper/40 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <strong className="text-navy-900 block font-semibold text-xs">
                              {u.name}
                            </strong>
                            <span className="text-[11px] text-ink-soft block font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Security Band */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                              u.role === "owner_admin" || u.role === "super_admin"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : u.role === "tutor"
                                ? "bg-navy-50 text-navy-900 border border-navy-200"
                                : "bg-blue-50 text-blue-900 border border-blue-200"
                            }`}
                          >
                            {u.role === "owner_admin"
                              ? "Centre Director"
                              : u.role === "super_admin"
                              ? "Super Admin"
                              : u.role === "tutor"
                              ? "Tutor / Assessor"
                              : "Administrative Staff"}
                          </span>

                          {u.role === "admin_staff" && (
                            <span className="block text-[10px] text-ink-soft">
                              No financial ledger access
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Department & Specialism */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-navy-900 block">
                          {u.department || "General Operations"}
                        </span>
                        <span className="text-[11px] text-ink-soft block line-clamp-1">
                          {u.specialism || "Staff Member"}
                        </span>
                      </td>

                      {/* Workload */}
                      <td className="py-3.5 px-4">
                        {u.role === "tutor" ? (
                          tutorCohorts.length > 0 ? (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-navy-900 block">
                                {tutorCohorts.length} Live Cohort{tutorCohorts.length > 1 ? "s" : ""}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {tutorCohorts.map((c) => (
                                  <span
                                    key={c.id}
                                    className="px-1.5 py-0.5 rounded-sm text-[10px] bg-paper text-ink-soft border border-line"
                                  >
                                    {c.courseLevelLabel}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-ink-soft">
                              No cohorts assigned
                            </span>
                          )
                        ) : u.role === "admin_staff" ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div className="text-navy-900 font-medium">
                              {staffBookings.length} Assigned Consultation{staffBookings.length === 1 ? "" : "s"}
                            </div>
                            <div className="text-ink-soft">
                              {openTasks.length} Open Task{openTasks.length === 1 ? "" : "s"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-ink-soft">
                            Centre Leadership & Oversight
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                            u.active
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-paper text-ink-soft border border-line"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.active ? "bg-emerald-600" : "bg-ink-soft"
                            }`}
                          />
                          {u.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      {isOwnerOrSuper && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Allow editing any user, except Owner Admin cannot edit Super Admin */}
                            {!(userRole === "owner_admin" && u.role === "super_admin") && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(u)}
                                className="px-2.5 py-1 rounded-sm border border-navy-700 bg-white hover:bg-navy-900 hover:text-white text-navy-900 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                title={`Edit ${u.name}'s role, faculty, or specialism`}
                              >
                                <Icon name="edit" size={12} />
                                <span>Edit</span>
                              </button>
                            )}

                            {u.role === "tutor" && (
                              <button
                                type="button"
                                disabled={isImpersonatingId === (u.email || u.id)}
                                onClick={() => handleImpersonate(u.email || u.id, u.name)}
                                className="px-2.5 py-1 rounded-sm border border-navy-900 bg-navy-50 hover:bg-navy-900 hover:text-white text-navy-900 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="View Tutor Console as this faculty member"
                              >
                                <Icon name="eye" size={12} />
                                <span>{isImpersonatingId === (u.email || u.id) ? "Loading..." : "View as Tutor"}</span>
                              </button>
                            )}

                            {u.role !== "owner_admin" && u.role !== "super_admin" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(u.id, u.active)}
                                  className={`px-2.5 py-1 rounded-sm border text-xs font-semibold transition-colors cursor-pointer ${
                                    u.active
                                      ? "bg-paper hover:bg-rose-50 text-ink-soft hover:text-rose-700 border-line hover:border-rose-200"
                                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                                  }`}
                                >
                                  {u.active ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStaff(u.id, u.name)}
                                  className="px-2.5 py-1 rounded-sm border border-line hover:border-red-300 bg-white hover:bg-red-50 text-ink-soft hover:text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                                  title={`Permanently remove ${u.name}`}
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-md border border-line shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Invite New Staff Member
                </h3>
                <p className="text-xs text-ink-soft mt-1">
                  Issue an official college credentials invitation to an assessor or administrator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ink-soft hover:text-navy-900 p-1"
                aria-label="Close modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Full Name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  College Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. staff.member@smartmindstraining.co.uk"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Role Assignment *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-sm border cursor-pointer flex flex-col gap-1 transition-colors ${
                      inviteRole === "tutor"
                        ? "border-navy-900 bg-navy-50/50"
                        : "border-line bg-paper"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value="tutor"
                        checked={inviteRole === "tutor"}
                        onChange={() => setInviteRole("tutor")}
                        className="text-navy-900 focus:ring-navy-900"
                      />
                      <span className="font-bold text-navy-900">Tutor / Assessor</span>
                    </div>
                    <span className="text-[11px] text-ink-soft">
                      Live online teaching, assignments & learner marking.
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-sm border cursor-pointer flex flex-col gap-1 transition-colors ${
                      inviteRole === "admin_staff"
                        ? "border-navy-900 bg-navy-50/50"
                        : "border-line bg-paper"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value="admin_staff"
                        checked={inviteRole === "admin_staff"}
                        onChange={() => setInviteRole("admin_staff")}
                        className="text-navy-900 focus:ring-navy-900"
                      />
                      <span className="font-bold text-navy-900">Administrative Staff</span>
                    </div>
                    <span className="text-[11px] text-ink-soft">
                      Consultation bookings & onboarding. Zero financial access.
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  {inviteRole === "tutor" ? "Assigned Faculty *" : "Department *"}
                </label>
                {inviteRole === "tutor" ? (
                  <select
                    required
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900 text-xs"
                  >
                    <option value="">Select Faculty...</option>
                    {faculties.map((fac) => (
                      <option key={fac.id} value={fac.name}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    required
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900 text-xs"
                  >
                    <option value="">Select Department...</option>
                    <option value="Admissions & Student Enrolment">Admissions & Student Enrolment</option>
                    <option value="Student Support & Services">Student Support & Services</option>
                    <option value="Operations & Centre Administration">Operations & Centre Administration</option>
                    <option value="Quality Assurance & Compliance">Quality Assurance & Compliance</option>
                  </select>
                )}
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Specialism / Focus Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Level 3 Adult Care Assessor or Admissions Coordinator"
                  value={inviteSpecialism}
                  onChange={(e) => setInviteSpecialism(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              {inviteRole === "admin_staff" && (
                <div className="p-3 rounded-sm bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <Icon name="shield-check" size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Governance note: Administrative staff can be assigned to handle online appointments and admissions, but are blocked from viewing student payment ledgers or fee collections.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-sm border border-line bg-paper text-ink-soft hover:text-ink font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-sm bg-navy-900 hover:bg-navy-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Issuing Invitation..." : "Send Staff Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Member Modal */}
      {editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-md border border-line shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Edit Staff Profile &amp; Permissions
                </h3>
                <p className="text-xs text-ink-soft mt-1">
                  Update role, assigned faculty, specialism, or details for {editingUser.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-ink-soft hover:text-navy-900 p-1 cursor-pointer"
                aria-label="Close edit modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Platform Role *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900 text-xs cursor-pointer"
                >
                  <option value="tutor">Course Tutor &amp; Vocational Assessor</option>
                  <option value="admin_staff">Operations &amp; Admissions Administrator</option>
                  <option value="owner_admin">Centre Director &amp; Lead Administrator</option>
                  <option value="student">Enrolled Student</option>
                  {userRole === "super_admin" && (
                    <option value="super_admin">Super Administrator (Platform Governance)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Assigned Faculty
                </label>
                <select
                  value={editFacultyId}
                  onChange={(e) => {
                    setEditFacultyId(e.target.value);
                    const selected = faculties.find((f) => f.id === e.target.value);
                    if (selected) {
                      setEditDepartment(selected.name);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900 text-xs cursor-pointer"
                >
                  <option value="">Select Faculty...</option>
                  {faculties.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Subject / Specialism
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adult Social Care (Level 3 & 5) or Functional Skills Maths"
                  value={editSpecialism}
                  onChange={(e) => setEditSpecialism(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faculty of Health & Social Care or Admissions"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-active-toggle"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded border-line text-navy-900 focus:ring-navy-900"
                />
                <label htmlFor="edit-active-toggle" className="font-semibold text-navy-900 cursor-pointer">
                  Active staff member account (grants portal access)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 rounded-sm border border-line bg-paper text-ink-soft hover:text-ink font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-4 py-2 rounded-sm bg-navy-900 hover:bg-navy-700 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isEditSubmitting ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Security & Impersonation Logs Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-gold-300/30 text-navy-900 border border-gold-500/40 flex items-center justify-center">
                  <Icon name="shield-check" size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-navy-900">
                    Security &amp; Impersonation Access Logs
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Immutable audit records of all staff and student portal sessions initiated by College Administrators.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="text-ink-soft hover:text-navy-900 text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto flex-1 text-xs">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 bg-paper rounded-sm border border-line text-ink-soft">
                  <p className="font-semibold text-navy-900 mb-1">No Impersonation Logs Recorded Yet</p>
                  <p className="text-[11px]">When an administrator views the portal as a tutor or student, an immutable timestamped event will appear here.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line bg-paper/60 text-ink-soft font-semibold">
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Administrator</th>
                      <th className="py-2.5 px-3">Account Viewed</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-paper/30">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-ink-soft whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("en-GB")}
                        </td>
                        <td className="py-2.5 px-3">
                          <strong className="text-navy-900 block">{log.actorEmail}</strong>
                          <span className="text-[10px] text-ink-soft uppercase font-bold">{log.actorRole}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <strong className="text-navy-900 block">{log.targetName}</strong>
                          <span className="text-[10px] text-ink-soft font-mono">{log.targetEmail}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded-xs bg-paper border border-line text-[10px] font-bold uppercase">
                            {log.targetRole}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                              log.action === "impersonation_started"
                                ? "bg-amber-50 text-amber-900 border border-amber-300"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {log.action === "impersonation_started" ? "Session Started" : "Session Ended"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-1.5 rounded-sm bg-navy-900 text-white font-semibold text-xs hover:bg-navy-700 cursor-pointer"
              >
                Close Audit Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
