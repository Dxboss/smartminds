"use client";

import React, { useState, useTransition } from "react";
import {
  AvailabilityRule,
  BlockedDay,
  ClassCohort,
  CohortScheduleConfig,
  Course,
  UserProfile,
} from "@/lib/repositories/types";
import { Icon } from "@/components/ui/Icon";
import {
  toggleBlockedDayAction,
  updateAvailabilityRulesAction,
  updateCohortScheduleAdminAction,
  createCohortAction,
  updateCohortAction,
  deleteCohortAction,
} from "@/app/admin/actions";

interface AvailabilityManagerViewProps {
  initialRules: AvailabilityRule[];
  initialBlockedDays: BlockedDay[];
  initialCohortSchedule?: CohortScheduleConfig;
  initialCohorts?: ClassCohort[];
  courses?: Course[];
  tutors?: UserProfile[];
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

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function AvailabilityManagerView({
  initialRules,
  initialBlockedDays,
  initialCohortSchedule,
  initialCohorts = [],
  courses = [],
  tutors = [],
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
  const [cohorts, setCohorts] = useState<ClassCohort[]>(initialCohorts);
  const [editingCohort, setEditingCohort] = useState<ClassCohort | null>(null);
  const [showCreateCohort, setShowCreateCohort] = useState(false);

  const defaultCourse = courses[0];
  const [cohortForm, setCohortForm] = useState({
    name: "",
    courseId: defaultCourse?.id || "",
    courseLevelLabel: defaultCourse?.levels?.[0]?.level_label || "Level 3 Diploma",
    tutorId: "",
    tutorName: "Unassigned / TBA",
    intakeLabel: "May 2026 Intake",
    scheduleDescription: "Tuesdays & Thursdays, 18:30 – 20:30 (GMT/BST)",
    nextSessionDate: "",
    sessionTiming: "evening" as "afternoon" | "evening",
    zoomLink: "",
  });

  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const openEditCohortModal = (cohort: ClassCohort) => {
    setEditingCohort(cohort);
    setShowCreateCohort(false);
    setCohortForm({
      name: cohort.name || "",
      courseId: cohort.courseId || defaultCourse?.id || "",
      courseLevelLabel: cohort.courseLevelLabel || "Level 3 Diploma",
      tutorId: cohort.tutorId || "",
      tutorName: cohort.tutorName || "Unassigned / TBA",
      intakeLabel: cohort.intakeLabel || "",
      scheduleDescription: cohort.scheduleDescription || "",
      nextSessionDate: toDatetimeLocalValue(cohort.nextSessionDate),
      sessionTiming: cohort.sessionTiming || "evening",
      zoomLink: cohort.zoomLink || "",
    });
  };

  const openCreateCohortModal = () => {
    setEditingCohort(null);
    setShowCreateCohort(true);
    const firstCourse = courses[0];
    setCohortForm({
      name: firstCourse ? `${firstCourse.title} — Evening Cohort` : "New Course Cohort",
      courseId: firstCourse?.id || "",
      courseLevelLabel: firstCourse?.levels?.[0]?.level_label || "Level 3 Diploma",
      tutorId: tutors[0]?.id || "",
      tutorName: tutors[0]?.name || "Unassigned / TBA",
      intakeLabel: "May 2026 Intake",
      scheduleDescription: "Tuesdays & Thursdays, 18:30 – 20:30 (GMT/BST)",
      nextSessionDate: "",
      sessionTiming: "evening",
      zoomLink: cohortSchedule.evening.zoomUrl || "",
    });
  };

  const handleSaveCohortModal = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const nextIso = cohortForm.nextSessionDate
          ? new Date(cohortForm.nextSessionDate).toISOString()
          : undefined;

        if (editingCohort) {
          const res = await updateCohortAction(editingCohort.id, {
            name: cohortForm.name.trim(),
            courseId: cohortForm.courseId,
            courseLevelLabel: cohortForm.courseLevelLabel.trim(),
            tutorId: cohortForm.tutorId,
            tutorName: cohortForm.tutorName,
            intakeLabel: cohortForm.intakeLabel.trim(),
            scheduleDescription: cohortForm.scheduleDescription.trim(),
            nextSessionDate: nextIso,
            sessionTiming: cohortForm.sessionTiming,
            zoomLink: cohortForm.zoomLink.trim() || undefined,
          });
          if (res.success && res.cohort) {
            setCohorts((prev) =>
              prev.map((c) => (c.id === editingCohort.id ? res.cohort : c))
            );
            setEditingCohort(null);
            setToastMessage(`Updated cohort schedule & date for "${res.cohort.name}".`);
            setTimeout(() => setToastMessage(null), 4000);
          }
        } else {
          const res = await createCohortAction({
            name: cohortForm.name.trim(),
            courseId: cohortForm.courseId,
            courseLevelLabel: cohortForm.courseLevelLabel.trim(),
            tutorId: cohortForm.tutorId || "unassigned",
            tutorName: cohortForm.tutorName || "Unassigned / TBA",
            intakeLabel: cohortForm.intakeLabel.trim(),
            scheduleDescription: cohortForm.scheduleDescription.trim(),
            nextSessionDate: nextIso,
            sessionTiming: cohortForm.sessionTiming,
            zoomLink: cohortForm.zoomLink.trim() || undefined,
          });
          if (res.success && res.cohort) {
            setCohorts((prev) => [...prev, res.cohort]);
            setShowCreateCohort(false);
            setToastMessage(`Created new cohort "${res.cohort.name}".`);
            setTimeout(() => setToastMessage(null), 4000);
          }
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to save cohort.");
      }
    });
  };

  const handleDeleteCohort = (cohort: ClassCohort) => {
    if (!window.confirm(`Remove cohort "${cohort.name}"?`)) return;
    startTransition(async () => {
      try {
        const res = await deleteCohortAction(cohort.id);
        if (res.success) {
          setCohorts((prev) => prev.filter((c) => c.id !== cohort.id));
          setToastMessage(`Removed cohort "${cohort.name}".`);
          setTimeout(() => setToastMessage(null), 4000);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to remove cohort.");
      }
    });
  };

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

      {/* Individual Course Cohorts, Dates, Times & Tutor Schedule */}
      <div className="bg-white rounded-md border border-line p-4 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-[11px] font-bold self-start">
              <Icon name="calendar" size={13} />
              <span>Course Cohort Management</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-navy-900">
              Course cohorts, class dates & tutor allocation
            </h2>
            <p className="text-xs text-ink-soft max-w-2xl">
              Create or edit individual course cohorts, change weekly class days and times, set next live session dates, and assign real tutors from your staff directory.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateCohortModal}
            className="w-full sm:w-auto px-5 py-2.5 bg-navy-900 text-white rounded-sm text-xs font-bold hover:bg-navy-700 transition-colors shadow-sm shrink-0 cursor-pointer min-h-[44px] inline-flex items-center justify-center gap-2"
          >
            <Icon name="plus" size={14} />
            <span>Create New Cohort</span>
          </button>
        </div>

        {cohorts.length === 0 ? (
          <div className="p-8 text-center bg-paper/50 rounded-sm border border-line space-y-2">
            <p className="text-sm font-bold text-navy-900">No course cohorts configured yet.</p>
            <p className="text-xs text-ink-soft">
              Click &ldquo;Create New Cohort&rdquo; above to add a live class cohort for any qualification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cohorts.map((cohort) => {
              const matchedCourse = courses.find((c) => c.id === cohort.courseId);
              const nextDateFormatted = cohort.nextSessionDate
                ? new Date(cohort.nextSessionDate).toLocaleString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not scheduled yet";

              return (
                <div
                  key={cohort.id}
                  className="p-4 sm:p-5 rounded-sm bg-paper border border-line flex flex-col justify-between gap-4 hover:border-navy-900/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-navy-900/10 text-navy-900 mb-1">
                          {cohort.intakeLabel || "Rolling Intake"} ·{" "}
                          {cohort.sessionTiming === "afternoon" ? "Afternoon" : "Evening"}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-navy-900 leading-snug">
                          {cohort.name}
                        </h3>
                        <p className="text-xs text-ink-soft">
                          {matchedCourse?.title || cohort.courseId} ({cohort.courseLevelLabel})
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-line text-xs">
                      <div className="bg-white p-2.5 rounded-sm border border-line">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                          Weekly Day & Time
                        </span>
                        <span className="font-semibold text-navy-900 block mt-0.5">
                          {cohort.scheduleDescription || "Flexible schedule"}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-sm border border-line">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                          Next Live Session Date
                        </span>
                        <span className="font-semibold text-navy-900 block mt-0.5">
                          {nextDateFormatted}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-sm border border-line sm:col-span-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                            Assigned Course Tutor
                          </span>
                          <span className="font-semibold text-navy-900 block mt-0.5">
                            {cohort.tutorName || "Unassigned / TBA"}
                          </span>
                        </div>
                        {cohort.zoomLink && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 truncate max-w-[180px]">
                            Zoom Linked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                    <button
                      type="button"
                      onClick={() => openEditCohortModal(cohort)}
                      className="px-3.5 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 min-h-[38px]"
                    >
                      <Icon name="clock" size={13} />
                      <span>Edit Date, Time & Tutor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCohort(cohort)}
                      disabled={isPending}
                      className="px-3 py-2 rounded-sm border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer min-h-[38px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Cohort Modal */}
      {(editingCohort || showCreateCohort) && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-line max-w-xl w-full p-6 shadow-xl space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 block">
                  {editingCohort ? "Edit Cohort Schedule & Tutor" : "New Course Cohort"}
                </span>
                <h3 className="font-heading text-2xl font-bold text-navy-900">
                  {editingCohort ? editingCohort.name : "Create course cohort"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCohort(null);
                  setShowCreateCohort(false);
                }}
                className="text-xs font-bold text-ink-soft hover:text-navy-900 px-2 py-1"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveCohortModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Course / Qualification *
                  </label>
                  <select
                    value={cohortForm.courseId}
                    onChange={(e) => {
                      const selectedCourse = courses.find((c) => c.id === e.target.value);
                      const firstLevel = selectedCourse?.levels?.[0]?.level_label || "Level 3 Diploma";
                      setCohortForm((prev) => ({
                        ...prev,
                        courseId: e.target.value,
                        courseLevelLabel: firstLevel,
                        name: selectedCourse
                          ? `${selectedCourse.title} — ${prev.intakeLabel || "Active Cohort"}`
                          : prev.name,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white text-navy-900 min-h-[42px]"
                    required
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Cohort Display Name *
                  </label>
                  <input
                    type="text"
                    value={cohortForm.name}
                    onChange={(e) => setCohortForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Diploma in Adult Care — May 2026 Cohort"
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white text-navy-900 min-h-[42px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Qualification Level Label *
                  </label>
                  <input
                    type="text"
                    value={cohortForm.courseLevelLabel}
                    onChange={(e) =>
                      setCohortForm((prev) => ({ ...prev, courseLevelLabel: e.target.value }))
                    }
                    placeholder="e.g. Level 3 Diploma"
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white text-navy-900 min-h-[42px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Intake Label (Month / Term) *
                  </label>
                  <input
                    type="text"
                    value={cohortForm.intakeLabel}
                    onChange={(e) =>
                      setCohortForm((prev) => ({ ...prev, intakeLabel: e.target.value }))
                    }
                    placeholder="e.g. May 2026 Intake"
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white text-navy-900 min-h-[42px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Cohort Session Timing *
                  </label>
                  <select
                    value={cohortForm.sessionTiming}
                    onChange={(e) => {
                      const timing = e.target.value as "afternoon" | "evening";
                      setCohortForm((prev) => ({
                        ...prev,
                        sessionTiming: timing,
                        zoomLink:
                          prev.zoomLink ||
                          (timing === "afternoon"
                            ? cohortSchedule.afternoon.zoomUrl
                            : cohortSchedule.evening.zoomUrl),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white text-navy-900 min-h-[42px]"
                  >
                    <option value="afternoon">
                      Afternoon ({cohortSchedule.afternoon.timeLabel})
                    </option>
                    <option value="evening">
                      Evening ({cohortSchedule.evening.timeLabel})
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Weekly Class Days & Time Description *
                  </label>
                  <input
                    type="text"
                    value={cohortForm.scheduleDescription}
                    onChange={(e) =>
                      setCohortForm((prev) => ({
                        ...prev,
                        scheduleDescription: e.target.value,
                      }))
                    }
                    placeholder="e.g. Tuesdays & Thursdays, 18:30 – 20:30 (GMT/BST)"
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white text-navy-900 min-h-[42px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Next Live Class Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={cohortForm.nextSessionDate}
                    onChange={(e) =>
                      setCohortForm((prev) => ({ ...prev, nextSessionDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white text-navy-900 min-h-[42px]"
                  />
                  <p className="text-[10px] text-ink-soft mt-1">
                    Updates the next scheduled live class in student and tutor portals.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Assigned Tutor (from Staff Directory)
                  </label>
                  <select
                    value={cohortForm.tutorName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchedTutor = tutors.find((t) => t.name === val);
                      setCohortForm((prev) => ({
                        ...prev,
                        tutorName: val,
                        tutorId: matchedTutor?.id || "unassigned",
                      }));
                    }}
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white text-navy-900 min-h-[42px]"
                  >
                    <option value="Unassigned / TBA">Unassigned / TBA</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Cohort Zoom Classroom URL
                  </label>
                  <input
                    type="url"
                    value={cohortForm.zoomLink}
                    onChange={(e) =>
                      setCohortForm((prev) => ({ ...prev, zoomLink: e.target.value }))
                    }
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-mono bg-white text-navy-900 min-h-[42px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCohort(null);
                    setShowCreateCohort(false);
                  }}
                  className="px-4 py-2.5 rounded-sm border border-line text-xs font-semibold text-ink-soft hover:text-navy-900 cursor-pointer min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors cursor-pointer min-h-[42px] disabled:opacity-50"
                >
                  {isPending
                    ? "Saving..."
                    : editingCohort
                    ? "Save Cohort Date & Time"
                    : "Create Cohort"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
