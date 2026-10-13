"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  Booking,
  BlockedDay,
  AvailabilityRule,
  UserProfile,
} from "@/lib/repositories/types";
import {
  rescheduleBookingAction,
  toggleBlockedDayAdminAction,
  assignBookingStaffAction,
  updateBookingStatusAction,
  sendBookingReminderAction,
} from "@/app/admin/actions";

interface Props {
  initialBookings: Booking[];
  initialBlockedDays?: BlockedDay[];
  initialAvailabilityRules?: AvailabilityRule[];
  userRole?: string;
  currentUserId?: string;
  staffList?: UserProfile[];
}

export const BookingsManager: React.FC<Props> = ({
  initialBookings,
  initialBlockedDays = [],
  initialAvailabilityRules = [],
  userRole = "owner_admin",
  currentUserId,
  staffList = [],
}) => {
  const [activeTab, setActiveTab] = useState<"appointments" | "blackout" | "availability">("appointments");
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>(initialBlockedDays);

  // New blocked day form state
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  // Reschedule state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("2026-10-16");
  const [newTime, setNewTime] = useState("14:00");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const handleSendReminder = async (b: Booking) => {
    setRemindingId(b.id);
    try {
      await sendBookingReminderAction(b.id);
      setFeedback(`Consultation reminder dispatched to ${b.fullName} (${b.email})!`);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send reminder");
    } finally {
      setRemindingId(null);
    }
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine" | "unassigned">("all");

  const openReschedule = (b: Booking) => {
    setSelectedBooking(b);
    setReason("");
    const dt = new Date(b.scheduledAt);
    const dateStr = dt.toISOString().slice(0, 10);
    const timeStr = dt.toTimeString().slice(0, 5);
    setNewDate(dateStr);
    setNewTime(timeStr);
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsSubmitting(true);
    try {
      const scheduledIso = new Date(`${newDate}T${newTime}:00Z`).toISOString();
      await rescheduleBookingAction(selectedBooking.id, scheduledIso, reason);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id
            ? {
                ...b,
                scheduledAt: scheduledIso,
                status: "rescheduled",
                notes: reason
                  ? `${b.notes ? b.notes + " | " : ""}Rescheduled: ${reason}`
                  : b.notes,
              }
            : b
        )
      );
      setSelectedBooking(null);
      setFeedback("Appointment successfully rescheduled. Confirmation dispatched to Outbox.");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reschedule booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignStaff = async (bookingId: string, staffId: string) => {
    try {
      const staffMember = staffList.find((s) => s.id === staffId);
      const staffName = staffMember ? staffMember.name : "Unassigned";
      await assignBookingStaffAction(bookingId, staffId, staffName);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                assignedStaffId: staffId || undefined,
                assignedStaffName: staffMember ? staffName : undefined,
              }
            : b
        )
      );
      setFeedback(`Consultation successfully assigned to ${staffName}.`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign staff member");
    }
  };

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: "confirmed" | "completed" | "rescheduled" | "cancelled"
  ) => {
    try {
      await updateBookingStatusAction(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      setFeedback(`Consultation status updated to ${newStatus}.`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleToggleBlock = async (date: string, reasonText?: string) => {
    try {
      const res = await toggleBlockedDayAdminAction(date, reasonText);
      setBlockedDays(res.blockedDays);
      setFeedback("Calendar availability updated successfully.");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle blocked day");
    }
  };

  const handleAddBlockedDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) return;
    setIsBlocking(true);
    try {
      const res = await toggleBlockedDayAdminAction(blockDate, blockReason || "Owner blocked date");
      setBlockedDays(res.blockedDays);
      setBlockDate("");
      setBlockReason("");
      setFeedback("Date blocked successfully. It will no longer appear on the public booking calendar.");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to block date");
    } finally {
      setIsBlocking(false);
    }
  };

  const assignableStaff = staffList.filter(
    (s) => s.active && (s.role === "admin_staff" || s.role === "owner_admin")
  );

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (scopeFilter === "mine" && b.assignedStaffId !== currentUserId) return false;
    if (scopeFilter === "unassigned" && b.assignedStaffId) return false;
    return true;
  });

  const isOwnerOrSuper = userRole === "owner_admin" || userRole === "super_admin";

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

      {/* Primary Section Switcher */}
      <div className="flex border-b border-line gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("appointments")}
          className={`py-3 px-4 font-heading font-bold text-sm tracking-wide border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "appointments"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="calendar" size={16} />
          <span>Consultation Bookings ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("blackout")}
          className={`py-3 px-4 font-heading font-bold text-sm tracking-wide border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "blackout"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="clock" size={16} />
          <span>Blocked Dates / Holidays ({blockedDays.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("availability")}
          className={`py-3 px-4 font-heading font-bold text-sm tracking-wide border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "availability"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="shield-check" size={16} />
          <span>Weekly Working Hours</span>
        </button>
      </div>

      {/* VIEW 1: Appointments List */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          {/* Sub-filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-soft font-semibold mr-1">Scope:</span>
              <button
                type="button"
                onClick={() => setScopeFilter("all")}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                  scopeFilter === "all"
                    ? "bg-navy-900 text-white"
                    : "bg-paper text-ink-soft hover:text-ink border border-line"
                }`}
              >
                All Bookings ({bookings.length})
              </button>
              {currentUserId && (
                <button
                  type="button"
                  onClick={() => setScopeFilter("mine")}
                  className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                    scopeFilter === "mine"
                      ? "bg-navy-900 text-white"
                      : "bg-paper text-ink-soft hover:text-ink border border-line"
                  }`}
                >
                  Assigned to Me ({bookings.filter((b) => b.assignedStaffId === currentUserId).length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setScopeFilter("unassigned")}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                  scopeFilter === "unassigned"
                    ? "bg-navy-900 text-white"
                    : "bg-paper text-ink-soft hover:text-ink border border-line"
                }`}
              >
                Unassigned ({bookings.filter((b) => !b.assignedStaffId).length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-soft font-semibold mr-1">Status:</span>
              {["all", "confirmed", "rescheduled", "completed"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-semibold capitalize transition-colors ${
                    statusFilter === tab
                      ? "bg-navy-700 text-white"
                      : "bg-paper text-ink-soft hover:text-ink border border-line"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Course Interest</th>
                    <th className="py-3 px-4">Scheduled Slot</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ink-soft">
                        No bookings found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const dt = new Date(b.scheduledAt);
                      const dateStr = dt.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      const timeStr = dt.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={b.id} className="hover:bg-paper/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <strong className="text-navy-900 block font-semibold">
                              {b.fullName}
                            </strong>
                            <span className="text-[11px] text-ink-soft block font-mono">
                              {b.phone}
                            </span>
                            <span className="text-[11px] text-ink-soft block">
                              {b.email}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-navy-900">
                            {b.courseInterest}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-navy-900 block">{dateStr}</span>
                            <span className="text-[11px] text-ink-soft block">{timeStr} UK Time</span>
                            <div className="mt-1">
                              {b.meetingPlatform === "phone" ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-purple-50 text-purple-800 text-[10px] font-semibold border border-purple-200">
                                  <Icon name="phone" size={10} />
                                  <span>Phone Call ({b.phone})</span>
                                </span>
                              ) : b.meetingPlatform === "google_meet" || !b.meetingPlatform ? (
                                <a
                                  href={b.meetingLink || "https://meet.google.com"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200 hover:underline"
                                  title="Open Google Meet Room"
                                >
                                  <Icon name="video" size={10} />
                                  <span>Google Meet Link</span>
                                </a>
                              ) : (
                                <a
                                  href={b.meetingLink || "https://zoom.us"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200 hover:underline"
                                  title="Open Zoom Room"
                                >
                                  <Icon name="video" size={10} />
                                  <span>Zoom Room Link</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              {b.assignedStaffName ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-medium bg-navy-50 text-navy-900 border border-navy-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-navy-700" />
                                  {b.assignedStaffName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                  Unassigned
                                </span>
                              )}
                              {assignableStaff.length > 0 && (
                                <select
                                  aria-label="Reassign advisor"
                                  value={b.assignedStaffId || ""}
                                  onChange={(e) => handleAssignStaff(b.id, e.target.value)}
                                  className="block w-full text-[11px] py-1 px-1.5 rounded-sm border border-line bg-paper text-ink"
                                >
                                  <option value="">Reassign advisor...</option>
                                  {assignableStaff.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name} ({s.role === "owner_admin" ? "Director" : "Admissions"})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                                  b.status === "confirmed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : b.status === "rescheduled"
                                    ? "bg-amber-100 text-amber-800"
                                    : b.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-paper text-ink-soft border border-line"
                                }`}
                              >
                                {b.status}
                              </span>
                              <select
                                aria-label="Update consultation status"
                                value={b.status}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    b.id,
                                    e.target.value as
                                      | "confirmed"
                                      | "completed"
                                      | "rescheduled"
                                      | "cancelled"
                                  )
                                }
                                className="block w-full text-[10px] py-0.5 px-1 rounded-sm border border-line bg-white text-ink-soft"
                              >
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="rescheduled">Rescheduled</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-ink-soft max-w-xs truncate">
                            {b.notes || "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                disabled={remindingId === b.id}
                                onClick={() => handleSendReminder(b)}
                                className="px-2.5 py-1 rounded-sm bg-gold-50 hover:bg-gold-500 hover:text-navy-900 border border-gold-300 text-navy-900 text-xs font-semibold transition-colors disabled:opacity-50"
                                title="Send branded reminder email to this applicant"
                              >
                                {remindingId === b.id ? "Sending..." : "Send Reminder"}
                              </button>
                              <button
                                type="button"
                                onClick={() => openReschedule(b)}
                                className="px-2.5 py-1 rounded-sm bg-paper hover:bg-navy-900 hover:text-white border border-line text-navy-900 text-xs font-semibold transition-colors"
                              >
                                Reschedule
                              </button>
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
        </div>
      )}

      {/* VIEW 2: Blocked Days / Holidays Manager */}
      {activeTab === "blackout" && (
        <div className="space-y-6">
          <div className="bg-paper p-4 rounded-md border border-line text-xs text-ink-soft">
            <strong className="text-navy-900 block mb-0.5">Control Your Unavailable Dates</strong>
            Any date added below will be immediately removed from the public website booking calendar. Visitors will not be able to book on these dates.
          </div>

          {/* Add Blackout Date Form */}
          {isOwnerOrSuper ? (
            <div className="bg-white p-5 rounded-md border border-line shadow-sm">
              <h3 className="font-heading text-lg font-bold text-navy-900 mb-3">
                Block a New Date (Holiday / Leave / Inset)
              </h3>
              <form onSubmit={handleAddBlockedDay} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 text-xs">
                <div className="flex-1">
                  <label className="font-bold text-navy-900 block mb-1">
                    Date to Block *
                  </label>
                  <input
                    type="date"
                    required
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900 min-h-[40px]"
                  />
                </div>

                <div className="flex-1">
                  <label className="font-bold text-navy-900 block mb-1">
                    Reason / Description (e.g. Bank Holiday, Annual Leave)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. College Staff Training Day"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900 min-h-[40px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBlocking}
                  className="px-5 py-2 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors disabled:opacity-50 min-h-[40px] flex items-center justify-center gap-1.5"
                >
                  <Icon name="plus" size={14} />
                  <span>{isBlocking ? "Blocking..." : "Block Date"}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-sm">
              Only the College Owner or SuperAdmin can add or remove blocked dates.
            </div>
          )}

          {/* List of currently blocked dates */}
          <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
            <div className="p-4 border-b border-line bg-paper/60 flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-navy-900">
                Currently Blocked Dates ({blockedDays.length})
              </span>
              <span className="text-[11px] text-ink-soft">Automatically updated in live booking modal</span>
            </div>

            <div className="divide-y divide-line">
              {blockedDays.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-soft">
                  No dates are currently blocked. Your full standard weekly availability is open to applicants.
                </div>
              ) : (
                blockedDays.map((b) => (
                  <div key={b.date} className="p-4 flex items-center justify-between gap-4 hover:bg-paper/30 transition-colors text-xs">
                    <div>
                      <strong className="text-navy-900 font-semibold block text-sm">
                        {new Date(b.date).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                      <span className="text-ink-soft text-xs">{b.reason || "Owner blocked date"}</span>
                    </div>

                    {isOwnerOrSuper && (
                      <button
                        type="button"
                        onClick={() => handleToggleBlock(b.date, b.reason)}
                        className="px-3 py-1.5 rounded-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold transition-colors"
                      >
                        Remove Block (Open Date)
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Weekly Working Hours */}
      {activeTab === "availability" && (
        <div className="space-y-6">
          <div className="bg-paper p-4 rounded-md border border-line text-xs text-ink-soft">
            <strong className="text-navy-900 block mb-0.5">Recurring Weekly Operating Hours</strong>
            These rules configure the default slots offered to prospective students. Public slots are automatically divided into 30-minute intervals.
          </div>

          <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
            <div className="p-4 border-b border-line bg-paper/60">
              <h3 className="font-heading font-bold text-sm text-navy-900">
                College Standard Working Schedule
              </h3>
            </div>

            <div className="divide-y divide-line text-xs">
              {[
                { day: "Monday", hours: "09:00 – 17:00", active: true, slots: "16 possible consultation slots" },
                { day: "Tuesday", hours: "09:00 – 17:00", active: true, slots: "16 possible consultation slots" },
                { day: "Wednesday", hours: "09:00 – 17:00", active: true, slots: "16 possible consultation slots" },
                { day: "Thursday", hours: "09:00 – 17:00", active: true, slots: "16 possible consultation slots" },
                { day: "Friday", hours: "09:00 – 16:00", active: true, slots: "14 possible consultation slots" },
                { day: "Saturday", hours: "Weekend (Closed)", active: false, slots: "By special arrangement" },
                { day: "Sunday", hours: "Weekend (Closed)", active: false, slots: "Closed" },
              ].map((item) => (
                <div key={item.day} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.active ? "bg-emerald-500" : "bg-ink-soft/30"}`} />
                    <strong className="text-navy-900 font-bold text-sm w-28">{item.day}</strong>
                    <span className="text-ink-soft">{item.hours}</span>
                  </div>
                  <span className="text-[11px] text-ink-soft font-mono">{item.slots}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Reschedule Consultation
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Applicant: <strong>{selectedBooking.fullName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReschedule} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  New Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  New Time Slot (UK Time)
                </label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Reschedule Note / Reason (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Applicant requested later afternoon slot due to work shift."
                  className="w-full p-2.5 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div className="p-3 rounded-sm bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
                <Icon name="info" size={14} className="mt-0.5 flex-shrink-0 text-blue-700" />
                <span>
                  Rescheduling will automatically dispatch a revised calendar notice to the applicant&apos;s email ({selectedBooking.email}) and log it to the Outbox.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-3.5 py-2 rounded-sm border border-line text-ink-soft hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Confirm new slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
