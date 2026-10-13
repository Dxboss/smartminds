"use client";

import React, { useState, useTransition } from "react";
import { AvailabilityRule, BlockedDay, CohortScheduleConfig } from "@/lib/repositories/types";
import { Icon } from "@/components/ui/Icon";
import {
  toggleBlockedDayAction,
  updateAvailabilityRulesAction,
  updateCohortScheduleAdminAction,
} from "@/app/admin/actions";

interface AvailabilityManagerViewProps {
  initialRules: AvailabilityRule[];
  initialBlockedDays: BlockedDay[];
  initialCohortSchedule?: CohortScheduleConfig;
  userRole: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AvailabilityManagerView({
  initialRules,
  initialBlockedDays,
  initialCohortSchedule,
  userRole,
}: AvailabilityManagerViewProps) {
  const [rules, setRules] = useState<AvailabilityRule[]>(initialRules);
  const [blockedDays, setBlockedDays] =
    useState<BlockedDay[]>(initialBlockedDays);
  const [cohortSchedule, setCohortSchedule] = useState<CohortScheduleConfig>(
    initialCohortSchedule || {
      afternoon: {
        timeLabel: "14:00 – 16:00",
        startTime: "14:00",
        endTime: "16:00",
        description: "Interactive live tutor seminar. Ideal for flexible daytime learners.",
        zoomUrl: "https://zoom.us/j/smartminds-afternoon-cohort",
      },
      evening: {
        timeLabel: "18:30 – 20:30",
        startTime: "18:30",
        endTime: "20:30",
        description: "Interactive live tutor seminar. Ideal for working professionals.",
        zoomUrl: "https://zoom.us/j/smartminds-evening-cohort",
      },
    }
  );

  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSaveCohortSchedule = () => {
    startTransition(async () => {
      try {
        const result = await updateCohortScheduleAdminAction(cohortSchedule);
        if (result.success) {
          setToastMessage("Live class cohort schedules and Zoom accounts updated successfully.");
          setTimeout(() => setToastMessage(null), 4000);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to update cohort schedule.");
      }
    });
  };

  const handleRuleTimeChange = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setRules((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRules = () => {
    startTransition(async () => {
      try {
        const result = await updateAvailabilityRulesAction(rules);
        if (result.success) {
          setToastMessage("College consultation schedule updated successfully.");
          setTimeout(() => setToastMessage(null), 4000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to update rules.");
      }
    });
  };

  const handleAddBlockedDay = () => {
    if (!newBlockedDate) return;
    startTransition(async () => {
      try {
        const result = await toggleBlockedDayAction(
          newBlockedDate,
          newBlockedReason.trim() || undefined
        );
        if (result.success && result.blockedDays) {
          setBlockedDays(result.blockedDays);
          setNewBlockedDate("");
          setNewBlockedReason("");
          setToastMessage(
            `Date ${newBlockedDate} added to blocked calendar.`
          );
          setTimeout(() => setToastMessage(null), 4000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to block day.");
      }
    });
  };

  const handleRemoveBlockedDay = (date: string) => {
    startTransition(async () => {
      try {
        const result = await toggleBlockedDayAction(date);
        if (result.success && result.blockedDays) {
          setBlockedDays(result.blockedDays);
          setToastMessage(`Date ${date} unblocked.`);
          setTimeout(() => setToastMessage(null), 4000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to toggle day.");
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Title Header */}
      <div className="bg-white rounded-md border border-line p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-xs font-semibold self-start">
            <Icon name="clock" size={14} />
            <span>Consultation Schedule & Calendar</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
            Admissions Availability & Days Off
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft max-w-3xl">
            Configure weekly telephone consultation windows and blackout bank holidays or director days off.
          </p>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3.5 sm:p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="check" size={16} className="text-emerald-700 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold text-emerald-800 hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Weekly Hours */}
        <div className="bg-white rounded-md border border-line p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900">
                Weekly Consultation Hours
              </h2>
              <p className="text-xs text-ink-soft">
                Standard 30-minute advisory slots offered to prospective applicants.
              </p>
            </div>
            <button
              onClick={handleSaveRules}
              disabled={isPending}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-navy-900 text-white rounded-sm text-xs font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50 min-h-[44px] sm:min-h-0 flex items-center justify-center shrink-0 cursor-pointer"
            >
              {isPending ? "Saving..." : "Save Hours"}
            </button>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((dayNum) => {
              const rule = rules.find((r) => r.dayOfWeek === dayNum);
              return (
                <div
                  key={dayNum}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-sm bg-paper border border-line text-sm"
                >
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <span className="font-heading font-bold text-base sm:text-sm text-navy-900 tracking-wide sm:w-28">
                      {DAY_NAMES[dayNum]}
                    </span>
                    <span className="sm:hidden text-[10px] font-semibold text-gold-700 uppercase bg-white px-2 py-0.5 rounded-xs border border-line">
                      Advisory Hours
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-32">
                      <input
                        type="time"
                        value={rule?.startTime || "09:00"}
                        onChange={(e) =>
                          handleRuleTimeChange(
                            dayNum,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="w-full px-2.5 py-2 sm:py-1 border border-line rounded-sm text-xs font-semibold bg-white text-navy-900 min-h-[40px] sm:min-h-0 focus:outline-none focus:ring-2 focus:ring-navy-900"
                        aria-label={`${DAY_NAMES[dayNum]} start time`}
                      />
                    </div>
                    <span className="text-xs font-bold text-ink-soft shrink-0 px-0.5">to</span>
                    <div className="relative flex-1 sm:w-32">
                      <input
                        type="time"
                        value={rule?.endTime || "17:00"}
                        onChange={(e) =>
                          handleRuleTimeChange(dayNum, "endTime", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:py-1 border border-line rounded-sm text-xs font-semibold bg-white text-navy-900 min-h-[40px] sm:min-h-0 focus:outline-none focus:ring-2 focus:ring-navy-900"
                        aria-label={`${DAY_NAMES[dayNum]} end time`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blocked Days & Holidays */}
        <div className="bg-white rounded-md border border-line p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-sm">
          <div className="border-b border-line pb-4 space-y-1">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900">
              Blocked Days & Holidays
            </h2>
            <p className="text-xs text-ink-soft">
              Slots on these days will be blacked out from the public applicant booking tool.
            </p>
          </div>

          {/* Add Date Form */}
          <div className="p-3.5 sm:p-4 bg-paper rounded-sm border border-line space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-900 block">
              Blackout New Date
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  Calendar Date *
                </label>
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[42px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  Reason for Closure
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank Holiday / Staff Inset"
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[42px]"
                />
              </div>
            </div>
            <button
              onClick={handleAddBlockedDay}
              disabled={!newBlockedDate || isPending}
              className="w-full py-2.5 bg-navy-900 text-white rounded-sm text-xs font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50 min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              Block This Date
            </button>
          </div>

          {/* Blocked Dates List */}
          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {blockedDays.length === 0 ? (
              <p className="text-xs text-ink-soft text-center py-6 bg-paper/50 rounded-sm border border-line/60">
                No dates currently blocked. All weekday slots are active.
              </p>
            ) : (
              blockedDays.map((bd) => (
                <div
                  key={bd.date}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-sm border border-line bg-white hover:bg-paper/50 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-navy-900 block">
                      {bd.date}
                    </span>
                    <span className="text-xs text-ink-soft block truncate">
                      {bd.reason || "College Holiday / Day Off"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedDay(bd.date)}
                    className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-sm border border-rose-200 transition-colors min-h-[38px] sm:min-h-0 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cohort Schedules & 2 Zoom Pro Accounts Configuration */}
      <div className="bg-white rounded-md border border-line p-4 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-[11px] font-bold self-start">
              <Icon name="video" size={13} />
              <span>Independent Zoom Pro Infrastructure</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900">
              Live Class Cohort Timetables & 2 Zoom Accounts
            </h2>
            <p className="text-xs text-ink-soft max-w-2xl">
              Configure timing schedules and dedicated Zoom Pro meeting rooms for Afternoon vs Evening cohorts. Enrolled students are automatically routed to the correct account to prevent concurrency crashes.
            </p>
          </div>
          <button
            onClick={handleSaveCohortSchedule}
            disabled={isPending}
            className="w-full sm:w-auto px-5 py-2.5 bg-navy-900 text-gold-300 hover:text-white rounded-sm text-xs font-bold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50 shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            {isPending ? "Saving Timetables..." : "Save Cohort Schedules & Zoom Accounts"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Afternoon Cohort (Zoom Account #1) */}
          <div className="p-4 sm:p-5 rounded-sm bg-paper border border-line space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <h3 className="font-heading font-bold text-base text-navy-900">
                  Afternoon Cohort (Zoom Account #1)
                </h3>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-mono font-semibold px-2 py-0.5 rounded-xs bg-white border border-line text-navy-900 shrink-0">
                Daytime Seminars
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Dedicated Zoom Pro Meeting Link *
                </label>
                <input
                  type="url"
                  value={cohortSchedule.afternoon.zoomUrl}
                  onChange={(e) =>
                    setCohortSchedule((prev) => ({
                      ...prev,
                      afternoon: { ...prev.afternoon, zoomUrl: e.target.value },
                    }))
                  }
                  placeholder="https://zoom.us/j/your-afternoon-account-id"
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[42px]"
                />
                <p className="text-[10px] text-ink-soft mt-1">
                  Paste the permanent recurring meeting URL from Account 1.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={cohortSchedule.afternoon.startTime}
                    onChange={(e) =>
                      setCohortSchedule((prev) => ({
                        ...prev,
                        afternoon: {
                          ...prev.afternoon,
                          startTime: e.target.value,
                          timeLabel: `${e.target.value} – ${prev.afternoon.endTime}`,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white focus:outline-none min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={cohortSchedule.afternoon.endTime}
                    onChange={(e) =>
                      setCohortSchedule((prev) => ({
                        ...prev,
                        afternoon: {
                          ...prev.afternoon,
                          endTime: e.target.value,
                          timeLabel: `${prev.afternoon.startTime} – ${e.target.value}`,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white focus:outline-none min-h-[42px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Website Display Label
                </label>
                <input
                  type="text"
                  value={cohortSchedule.afternoon.timeLabel}
                  onChange={(e) =>
                    setCohortSchedule((prev) => ({
                      ...prev,
                      afternoon: { ...prev.afternoon, timeLabel: e.target.value },
                    }))
                  }
                  placeholder="e.g. 14:00 – 16:00"
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Internal Cohort Notes (Admin Only)
                </label>
                <input
                  type="text"
                  value={cohortSchedule.afternoon.description}
                  onChange={(e) =>
                    setCohortSchedule((prev) => ({
                      ...prev,
                      afternoon: { ...prev.afternoon, description: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none min-h-[42px]"
                />
                <p className="text-[10px] text-ink-soft mt-1">
                  Internal admin notes; not displayed on the public website.
                </p>
              </div>
            </div>
          </div>

          {/* Evening Cohort (Zoom Account #2) */}
          <div className="p-4 sm:p-5 rounded-sm bg-paper border border-line space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-navy-900 shrink-0" />
                <h3 className="font-heading font-bold text-base text-navy-900">
                  Evening Cohort (Zoom Account #2)
                </h3>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-mono font-semibold px-2 py-0.5 rounded-xs bg-white border border-line text-navy-900 shrink-0">
                Working Professionals
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Dedicated Zoom Pro Meeting Link *
                </label>
                <input
                  type="url"
                  value={cohortSchedule.evening.zoomUrl}
                  onChange={(e) =>
                    setCohortSchedule((prev) => ({
                      ...prev,
                      evening: { ...prev.evening, zoomUrl: e.target.value },
                    }))
                  }
                  placeholder="https://zoom.us/j/your-evening-account-id"
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[42px]"
                />
                <p className="text-[10px] text-ink-soft mt-1">
                  Paste the permanent recurring meeting URL from Account 2.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={cohortSchedule.evening.startTime}
                    onChange={(e) =>
                      setCohortSchedule((prev) => ({
                        ...prev,
                        evening: {
                          ...prev.evening,
                          startTime: e.target.value,
                          timeLabel: `${e.target.value} – ${prev.evening.endTime}`,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white focus:outline-none min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={cohortSchedule.evening.endTime}
                    onChange={(e) =>
                      setCohortSchedule((prev) => ({
                        ...prev,
                        evening: {
                          ...prev.evening,
                          endTime: e.target.value,
                          timeLabel: `${prev.evening.startTime} – ${e.target.value}`,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white focus:outline-none min-h-[42px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Website Display Label
                </label>
                <input
                  type="text"
                  value={cohortSchedule.evening.timeLabel}
                  onChange={(e) =>
                    setCohortSchedule((prev) => ({
                      ...prev,
                      evening: { ...prev.evening, timeLabel: e.target.value },
                    }))
                  }
                  placeholder="e.g. 18:30 – 20:30"
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Internal Cohort Notes (Admin Only)
                </label>
                <input
                  type="text"
                  value={cohortSchedule.evening.description}
                  onChange={(e) =>
                    setCohortSchedule((prev) => ({
                      ...prev,
                      evening: { ...prev.evening, description: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none min-h-[42px]"
                />
                <p className="text-[10px] text-ink-soft mt-1">
                  Internal admin notes; not displayed on the public website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
