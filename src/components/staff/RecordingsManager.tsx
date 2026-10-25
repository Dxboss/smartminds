"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  updateSessionRecordingAction,
  getRecordingAdminDownloadUrlAction,
} from "@/app/staff/actions";

export interface RecordingSessionItem {
  id: string;
  title: string;
  scheduledAt: string;
  recordingUrl?: string;
  className: string;
}

interface Props {
  initialSessions: RecordingSessionItem[];
}

export const RecordingsManager: React.FC<Props> = ({ initialSessions }) => {
  const [sessions, setSessions] = useState<RecordingSessionItem[]>(initialSessions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAdminDownload = async (sessionId: string) => {
    try {
      const res = await getRecordingAdminDownloadUrlAction(sessionId);
      if (res.success && res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      } else {
        alert("No direct download URL available for this session.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error getting download URL");
    }
  };

  const startEdit = (session: RecordingSessionItem) => {
    setEditingId(session.id);
    setTempUrl(session.recordingUrl || "");
    setSuccessMsg(null);
  };

  const handleSave = async (sessionId: string) => {
    setSavingId(sessionId);
    try {
      await updateSessionRecordingAction(sessionId, tempUrl.trim());
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, recordingUrl: tempUrl.trim() } : s))
      );
      setEditingId(null);
      setSuccessMsg("Stream recording link updated successfully. Watermark security is active.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update recording");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div
          role="status"
          className="p-4 rounded-[6px] bg-[#F0FDF4] border border-[#BBF7D0] text-sm text-[#166534] flex items-center gap-2"
        >
          <Icon name="check-circle" className="w-4 h-4 shrink-0 text-[#16A34A]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Security & Watermark Notice */}
      <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[16px] p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-[var(--navy-700)] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="shield-check" className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--navy-900)]">
              Stream-only recording policy
            </h2>
            <p className="text-xs text-[var(--ink-soft)] mt-1 leading-relaxed">
              Recordings are published as secure video streams. The student portal automatically overlays an anti-piracy learner watermark with their verified email address and IP identifier. Direct downloads and raw media files are strictly restricted.
            </p>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[var(--line)] p-8 text-center text-sm text-[var(--ink-soft)]">
          No live class sessions found for your assigned cohorts.
        </div>
      ) : (
        <div className="bg-white rounded-[16px] border border-[var(--line)] divide-y divide-[var(--line)] overflow-hidden">
          {sessions.map((session) => {
            const isEditing = editingId === session.id;
            const hasRecording = Boolean(session.recordingUrl);
            const dateStr = new Date(session.scheduledAt).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={session.id} className="p-6 transition-colors hover:bg-[var(--paper)]/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-[6px] bg-[var(--paper)] text-[var(--navy-900)] border border-[var(--line)]">
                        {session.className}
                      </span>
                      <span className="text-xs text-[var(--ink-soft)]">{dateStr}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[var(--navy-900)]">
                      {session.title}
                    </h3>

                    <div className="pt-1">
                      {hasRecording ? (
                        <div className="flex items-center gap-2 text-xs text-[var(--ink)]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-medium">Active stream:</span>
                          <span className="font-mono text-xs text-[var(--navy-700)] truncate max-w-md">
                            {session.recordingUrl}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span>No stream recording link published yet</span>
                        </div>
                      )}
                    </div>
                  </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {hasRecording && (
                        <button
                          type="button"
                          onClick={() => handleAdminDownload(session.id)}
                          className="px-3 py-2 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] hover:bg-white text-xs font-semibold text-[var(--navy-900)] flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Admin: download raw MP4 backup for college archiving"
                        >
                          <Icon name="download" size={13} className="text-[var(--navy-900)]" />
                          <span>Backup</span>
                        </button>
                      )}

                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={() => startEdit(session)}
                          className="px-3.5 py-2 rounded-[6px] border border-[var(--navy-900)] text-xs font-bold text-[var(--navy-900)] hover:bg-[var(--navy-900)] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] cursor-pointer"
                        >
                          {hasRecording ? "Edit stream link" : "Add stream link"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 text-xs font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                {isEditing && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave(session.id);
                    }}
                    className="mt-4 pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center gap-3"
                  >
                    <div className="relative flex-1 w-full">
                      <input
                        type="url"
                        required
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="https://stream.smartmindstraining.co.uk/sessions/..."
                        className="w-full text-xs font-mono px-3 py-2 rounded-[6px] border border-[var(--line)] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-700)]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingId === session.id}
                      className="w-full sm:w-auto px-4 py-2 rounded-[6px] bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-700)] transition-colors disabled:opacity-50 shrink-0"
                    >
                      {savingId === session.id ? "Saving..." : "Save link"}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
