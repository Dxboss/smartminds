"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  updateSessionScheduleAction,
  toggleAttendanceAction,
} from "@/app/staff/actions";
import { Learner } from "@/lib/repositories/types";

interface Props {
  sessionId: string;
  initialScheduledAt: string;
  initialZoomLink?: string;
  learners: Learner[];
}

export const ClassSessionEditor: React.FC<Props> = ({
  sessionId,
  initialScheduledAt,
  initialZoomLink = "",
  learners,
}) => {
  const [scheduledAt, setScheduledAt] = useState(
    initialScheduledAt.slice(0, 16) // format for datetime-local
  );
  const [zoomLink, setZoomLink] = useState(initialZoomLink);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSessionScheduleAction(sessionId, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        zoomLink,
      });
      setSaveSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update schedule");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAttendance = async (learnerId: string) => {
    const nextState = !attendance[learnerId];
    setAttendance((prev) => ({ ...prev, [learnerId]: nextState }));
    try {
      await toggleAttendanceAction(sessionId, learnerId, nextState);
    } catch {
      // Revert on error
      setAttendance((prev) => ({ ...prev, [learnerId]: !nextState }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Time & Zoom Link Editor Form */}
      <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-line pb-4">
          <Icon name="calendar" size={20} className="text-navy-900" />
          <h2 className="font-heading text-lg font-bold text-navy-900">
            Edit session timetable & Zoom meeting link
          </h2>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900 flex items-center gap-2">
            <Icon name="check-circle" size={16} className="text-emerald-700" />
            <span>Session timetable and Zoom link successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="scheduled-time" className="font-semibold text-navy-900 block">
                Session Date & Start Time
              </label>
              <input
                id="scheduled-time"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="zoom-link" className="font-semibold text-navy-900 block">
                Zoom Meeting URL
              </label>
              <input
                id="zoom-link"
                type="url"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900 font-mono text-[11px]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-ink-soft">
              Changes update learner portal timetables instantly.
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors disabled:opacity-50 min-h-[38px]"
            >
              {isSaving ? "Saving..." : "Save session schedule"}
            </button>
          </div>
        </form>
      </div>

      {/* Attendance Register Section (Optional Toggle per PRD 12.5) */}
      <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Icon name="users" size={20} className="text-navy-900" />
            <div>
              <h2 className="font-heading text-lg font-bold text-navy-900">
                Session attendance register (Optional toggle)
              </h2>
              <p className="text-xs text-ink-soft">
                Mark student presence during interactive live teaching.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-navy-900/5 text-navy-900">
            {learners.length} Enrolled Learners
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Study Access</th>
                <th className="py-2.5 px-3 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {learners.map((l) => {
                const isPresent = !!attendance[l.id];
                return (
                  <tr key={l.id} className="hover:bg-paper/30">
                    <td className="py-3 px-3 font-bold text-navy-900">
                      {l.firstName} {l.lastName}
                    </td>
                    <td className="py-3 px-3 text-ink-soft">{l.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-sm font-semibold text-[10px] uppercase ${
                          l.accessStatus === "active"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {l.accessStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(l.id)}
                        className={`px-3 py-1.5 rounded-sm font-bold text-xs transition-colors min-h-[32px] ${
                          isPresent
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-paper text-ink-soft border border-line hover:border-navy-900"
                        }`}
                      >
                        {isPresent ? "✓ Present" : "Mark Present"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
