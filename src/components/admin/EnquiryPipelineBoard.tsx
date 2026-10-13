"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { EnquiryLead, EnquiryStage } from "@/lib/repositories/types";
import { updateEnquiryStageAction, approveFundedEnrolmentAction } from "@/app/admin/actions";

interface Props {
  initialEnquiries: EnquiryLead[];
  availableCohorts: Array<{ id: string; name: string }>;
}

const STAGES: { id: EnquiryStage; label: string; description: string; badgeColor: string }[] = [
  {
    id: "new",
    label: "New enquiries",
    description: "Inbound web submissions awaiting first contact",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
  },
  {
    id: "contacted",
    label: "Contacted",
    description: "In discussions, consultation booked, or eligibility check",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: "enrolled",
    label: "Enrolled",
    description: "Place accepted and learner cohort allocated",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "lost",
    label: "Lost / Closed",
    description: "Not progressing or postponed to future intake",
    badgeColor: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
];

export const EnquiryPipelineBoard: React.FC<Props> = ({
  initialEnquiries,
  availableCohorts,
}) => {
  const [enquiries, setEnquiries] = useState<EnquiryLead[]>(initialEnquiries);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [selectedCohortId, setSelectedCohortId] = useState(availableCohorts[0]?.id || "");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleStageChange = async (enquiryId: string, newStage: EnquiryStage) => {
    try {
      await updateEnquiryStageAction(enquiryId, newStage);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, stage: newStage } : e))
      );
      setFeedback(`Enquiry moved to ${newStage}.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update stage");
    }
  };

  const handleSaveNote = async (enquiryId: string) => {
    try {
      await updateEnquiryStageAction(
        enquiryId,
        enquiries.find((e) => e.id === enquiryId)?.stage || "new",
        tempNote.trim()
      );
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, notes: tempNote.trim() } : e))
      );
      setEditingNoteId(null);
      setFeedback("Operational note updated.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  const handleApproveFunded = async (enquiry: EnquiryLead) => {
    setEnrollingId(enquiry.id);
    try {
      await approveFundedEnrolmentAction(enquiry.id, selectedCohortId);
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === enquiry.id
            ? {
                ...e,
                stage: "enrolled",
                notes: `${e.notes ? e.notes + " | " : ""}Funded place approved. Enrolled on selected cohort.`,
              }
            : e
        )
      );
      setFeedback(`Funded place approved for ${enquiry.fullName}. Welcome email dispatched to Outbox.`);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve funded enrolment");
    } finally {
      setEnrollingId(null);
    }
  };

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

      {/* Cohort Picker for Funded Approvals */}
      <div className="bg-white rounded-md border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <Icon name="graduation-cap" size={16} className="text-navy-900" />
          <span className="font-bold text-navy-900">
            Target Cohort for Manual / Funded Enrolments:
          </span>
        </div>
        <select
          value={selectedCohortId}
          onChange={(e) => setSelectedCohortId(e.target.value)}
          className="px-3 py-1.5 rounded-sm border border-line bg-paper text-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900"
        >
          {availableCohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 4-Stage Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {STAGES.map((col) => {
          const stageEnquiries = enquiries.filter((e) => e.stage === col.id);

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverCol !== col.id) setDragOverCol(col.id);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget === e.target) setDragOverCol(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCol(null);
                const enquiryId = e.dataTransfer.getData("text/plain") || draggedId;
                if (enquiryId) {
                  handleStageChange(enquiryId, col.id);
                }
              }}
              className={`rounded-md border flex flex-col max-h-[800px] transition-all duration-150 ${
                dragOverCol === col.id
                  ? "bg-navy-50/50 border-navy-900 ring-2 ring-navy-900/20"
                  : "bg-paper/70 border-line"
              }`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-line bg-white rounded-t-md">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="font-heading text-lg font-bold text-navy-900">
                    {col.label}
                  </h2>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-sm border ${col.badgeColor}`}
                  >
                    {stageEnquiries.length}
                  </span>
                </div>
                <p className="text-[11px] text-ink-soft leading-tight">
                  {col.description}
                </p>
              </div>

              {/* Cards List */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {stageEnquiries.length === 0 ? (
                  <div className="p-6 text-center text-xs text-ink-soft italic">
                    No leads in this stage
                  </div>
                ) : (
                  stageEnquiries.map((enq) => {
                    const isEditingNote = editingNoteId === enq.id;
                    const dateFormatted = new Date(enq.submittedAt).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
                    );

                    return (
                      <div
                        key={enq.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", enq.id);
                          setDraggedId(enq.id);
                        }}
                        onDragEnd={() => {
                          setDraggedId(null);
                          setDragOverCol(null);
                        }}
                        className={`p-4 rounded-sm bg-white border border-line space-y-2.5 shadow-sm text-xs hover:border-navy-900/40 transition-all cursor-grab active:cursor-grabbing ${
                          draggedId === enq.id
                            ? "opacity-40 scale-[0.98] ring-1 ring-navy-900/40"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-navy-900 text-sm block">
                              {enq.fullName}
                            </span>
                            <span className="text-[11px] text-ink-soft font-mono">
                              {dateFormatted}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm border uppercase flex items-center gap-1 shrink-0 ${
                              enq.formType === "consultation_booking"
                                ? "bg-navy-900 text-gold-300 border-navy-900 font-bold shadow-2xs"
                                : enq.formType === "funding_check"
                                ? "bg-amber-50 text-amber-900 border-amber-200 font-bold"
                                : "bg-navy-900/5 text-navy-900 border-line"
                            }`}
                          >
                            {enq.formType === "consultation_booking" && (
                              <Icon name="calendar" size={11} className="text-gold-300" />
                            )}
                            <span>
                              {enq.formType === "consultation_booking"
                                ? "Booked Call"
                                : enq.formType.replace(/_/g, " ")}
                            </span>
                          </span>
                        </div>

                        <div className="space-y-1 text-ink-soft">
                          <div className="font-medium text-navy-900">
                            {enq.courseInterest}
                          </div>
                          <div>Email: {enq.email}</div>
                          <div>Tel: {enq.phone}</div>
                          {enq.employmentStatus && (
                            <div className="text-[11px] text-ink-soft">
                              Work: <strong>{enq.employmentStatus}</strong>
                              {enq.workplaceLocation ? ` (${enq.workplaceLocation})` : ""}
                            </div>
                          )}
                        </div>

                        {/* Operational Notes */}
                        <div className="pt-2 border-t border-line/60 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-navy-900">Staff notes:</span>
                            {!isEditingNote && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(enq.id);
                                  setTempNote(enq.notes || "");
                                }}
                                className="text-navy-900 hover:underline font-semibold"
                              >
                                {enq.notes ? "Edit note" : "+ Add note"}
                              </button>
                            )}
                          </div>

                          {isEditingNote ? (
                            <div className="space-y-1.5 pt-1">
                              <textarea
                                rows={2}
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                placeholder="Record call summary or action required..."
                                className="w-full text-xs p-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                              />
                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingNoteId(null)}
                                  className="px-2 py-1 text-[11px] text-ink-soft hover:text-ink"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveNote(enq.id)}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-sm bg-navy-900 text-white"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-ink bg-paper p-1.5 rounded-sm border border-line/40 leading-relaxed italic">
                              {enq.notes || "No notes recorded yet."}
                            </p>
                          )}
                        </div>

                        {/* Stage Controls & Funded Enrolment Action */}
                        <div className="pt-2 border-t border-line/60 flex flex-wrap items-center gap-1.5">
                          {col.id === "new" && (
                            <button
                              type="button"
                              onClick={() => handleStageChange(enq.id, "contacted")}
                              className="px-2.5 py-1 rounded-sm bg-navy-900 text-white text-[11px] font-bold hover:bg-navy-700 transition-colors"
                            >
                              Mark contacted
                            </button>
                          )}

                          {col.id === "contacted" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStageChange(enq.id, "enrolled")}
                                className="px-2.5 py-1 rounded-sm bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-800 transition-colors"
                              >
                                Mark enrolled
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStageChange(enq.id, "lost")}
                                className="px-2 py-1 rounded-sm border border-line text-ink-soft text-[11px] hover:text-ink transition-colors"
                              >
                                Mark lost
                              </button>
                            </>
                          )}

                          {col.id !== "enrolled" && enq.formType === "funding_check" && (
                            <button
                              type="button"
                              disabled={enrollingId === enq.id}
                              onClick={() => handleApproveFunded(enq)}
                              className="w-full mt-1 px-3 py-1.5 rounded-sm bg-gold-500 text-navy-900 text-[11px] font-bold hover:bg-gold-700 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <Icon name="check" size={12} />
                              <span>
                                {enrollingId === enq.id
                                  ? "Enrolling..."
                                  : "Approve funding & enrol"}
                              </span>
                            </button>
                          )}

                          {col.id === "lost" && (
                            <button
                              type="button"
                              onClick={() => handleStageChange(enq.id, "new")}
                              className="px-2 py-1 rounded-sm border border-line text-ink-soft text-[11px] hover:text-ink transition-colors"
                            >
                              Re-open lead
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
