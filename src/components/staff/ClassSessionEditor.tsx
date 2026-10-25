"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  updateSessionScheduleAction,
  toggleAttendanceAction,
  sendClassSessionReminderAction,
  createAutomatedZoomMeetingAction,
} from "@/app/staff/actions";
import { Learner } from "@/lib/repositories/types";

interface Props {
  sessionId: string;
  initialScheduledAt: string;
  initialZoomLink?: string;
  initialRecordingUrl?: string;
  cohortZoomLink?: string;
  learners: Learner[];
}

export const ClassSessionEditor: React.FC<Props> = ({
  sessionId,
  initialScheduledAt,
  initialZoomLink = "",
  initialRecordingUrl = "",
  cohortZoomLink = "",
  learners,
}) => {
  const [scheduledAt, setScheduledAt] = useState(
    initialScheduledAt.slice(0, 16) // format for datetime-local
  );
  const [zoomLink, setZoomLink] = useState(initialZoomLink || cohortZoomLink);
  const [updateCohortRecurringLink, setUpdateCohortRecurringLink] = useState(true);
  const [updateReason, setUpdateReason] = useState("");
  const [recordingUrl, setRecordingUrl] = useState(initialRecordingUrl);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isReminding, setIsReminding] = useState(false);
  const [reminderFeedback, setReminderFeedback] = useState<string | null>(null);
  const [isGeneratingZoom, setIsGeneratingZoom] = useState(false);
  const [zoomFeedback, setZoomFeedback] = useState<string | null>(null);

  const handleSendReminder = async () => {
    setIsReminding(true);
    setReminderFeedback(null);
    try {
      const res = await sendClassSessionReminderAction(sessionId);
      setReminderFeedback(`Live class reminder dispatched to ${res.remindedCount} enrolled students!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send reminder");
    } finally {
      setIsReminding(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSessionScheduleAction(sessionId, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        zoomLink,
        recordingUrl: recordingUrl.trim(),
        updateCohortRecurringLink,
        updateReason: updateReason.trim(),
      });
      setSaveSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update schedule");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateZoomMeeting = async () => {
    setIsGeneratingZoom(true);
    setZoomFeedback(null);
    try {
      const res = await createAutomatedZoomMeetingAction(sessionId);
      if (res.success && res.joinUrl) {
        setZoomLink(res.joinUrl);
        setZoomFeedback(res.message || "Zoom meeting generated with cloud recording.");
      } else {
        setZoomFeedback(res.message || "Could not generate Zoom meeting automatically.");
      }
    } catch (err) {
      setZoomFeedback(err instanceof Error ? err.message : "Error connecting to Zoom API");
    } finally {
      setIsGeneratingZoom(false);
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
          <div>
            <h2 className="font-heading text-lg font-bold text-navy-900">
              Edit session timetable & Zoom meeting link
            </h2>
            <p className="text-xs text-ink-soft">
              This recurring Zoom link will be used repeatedly for all live classes in this cohort.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900 flex items-center gap-2">
            <Icon name="check-circle" size={16} className="text-emerald-700 shrink-0" />
            <span>
              Session timetable updated successfully! Branded email notifications and student portal access refreshed.
            </span>
          </div>
        )}

        {reminderFeedback && (
          <div className="p-3 bg-gold-50 border border-gold-300 rounded-sm text-xs text-navy-900 flex items-center gap-2 font-semibold shadow-xs">
            <Icon name="bell" size={16} className="text-gold-600 shrink-0" />
            <span>{reminderFeedback}</span>
          </div>
        )}

        {zoomFeedback && (
          <div className="p-3 bg-paper border border-line rounded-sm text-xs text-navy-900 flex items-center gap-2 font-medium shadow-2xs">
            <Icon name="info" size={16} className="text-gold-600 shrink-0" />
            <span>{zoomFeedback}</span>
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
              <div className="flex items-center justify-between">
                <label htmlFor="zoom-link" className="font-semibold text-navy-900 block">
                  Zoom Meeting URL (Cohort Link)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateZoomMeeting}
                  disabled={isGeneratingZoom}
                  className="text-[11px] font-bold text-navy-900 hover:text-gold-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Generate automated meeting with Cloud Recording using dual-account pool"
                >
                  <Icon name="sparkles" size={12} className="text-gold-500" />
                  <span>{isGeneratingZoom ? "Connecting..." : "⚡ Auto-Generate via Zoom"}</span>
                </button>
              </div>
              <input
                id="zoom-link"
                type="url"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900 font-mono text-[11px]"
                required
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-[11px] text-navy-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateCohortRecurringLink}
                    onChange={(e) => setUpdateCohortRecurringLink(e.target.checked)}
                    className="rounded-xs border-line text-navy-900 focus:ring-gold-500"
                  />
                  <span>Save as default recurring Zoom link</span>
                </label>
                {zoomLink && (
                  <a
                    href={zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-900 hover:underline"
                  >
                    <Icon name="video" size={12} className="text-navy-900" />
                    <span>Launch Room &rarr;</span>
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label htmlFor="update-reason" className="font-semibold text-navy-900 block text-xs">
                Schedule Adjustment Note (Optional)
              </label>
              <input
                id="update-reason"
                type="text"
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                placeholder="e.g. Cohort agreed to shift start time to 15:00"
                className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900 text-xs min-h-[38px]"
              />
              <p className="text-[10px] text-ink-soft">
                If the class time or link was updated by cohort agreement, entering a brief note logs an activity record for College Admissions and includes the reason in learner notification emails.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-line/50">
            <label htmlFor="recording-url" className="font-semibold text-navy-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Icon name="video" size={14} className="text-navy-900" />
                <span>Class Recording URL (Stream-Only Access for Enrolled Students)</span>
              </span>
              <span className="text-[11px] font-normal text-ink-soft">
                Protected stream replay
              </span>
            </label>
            <input
              id="recording-url"
              type="url"
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              placeholder="https://example.com/stream/recording-session-01.mp4 or Zoom cloud recording URL"
              className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900 font-mono text-[11px]"
            />
            <p className="text-[11px] text-ink-soft">
              When added, this recording will appear in the student portal under &quot;Recorded live classes&quot; with right-click protection, download disabled, and dynamic watermark. Students are automatically notified.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-ink-soft">
              Saving updates timetable, recurring link, and dispatches branded email invitations.
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={isReminding}
                className="px-3 py-2 rounded-sm bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold transition-colors disabled:opacity-50 min-h-[38px] flex items-center justify-center gap-1.5 shadow-2xs"
                title="Send a pre-class reminder email to all students"
              >
                <Icon name="bell" size={14} />
                <span>{isReminding ? "Dispatching..." : "Send Pre-Class Reminder"}</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors disabled:opacity-50 min-h-[38px] flex items-center justify-center gap-2 shadow-2xs"
              >
                <Icon name="mail" size={14} />
                <span>{isSaving ? "Saving & Notifying..." : "Save & Notify Enrolled Students"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Attendance Register Section */}
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
