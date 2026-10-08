"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  remindNotSubmittedAction,
  markSubmissionAction,
} from "@/app/staff/actions";
import { Learner, Submission } from "@/lib/repositories/types";

interface Props {
  assignmentId: string;
  assignmentTitle: string;
  isCriteriaAssessment: boolean;
  learners: Learner[];
  initialSubmissions: Submission[];
}

export const SubmissionsGradingTable: React.FC<Props> = ({
  assignmentId,
  isCriteriaAssessment,
  learners,
  initialSubmissions,
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [remindingLearnerId, setRemindingLearnerId] = useState<string | null>(null);
  const [remindSuccess, setRemindSuccess] = useState<string | null>(null);

  // Active Marking Modal / Drawer State
  const [activeMarkingSub, setActiveMarkingSub] = useState<Submission | null>(null);
  const [markingOutcome, setMarkingOutcome] = useState<"achieved" | "not_yet_achieved">(
    "achieved"
  );
  const [markingFeedback, setMarkingFeedback] = useState("");
  const [isSavingMark, setIsSavingMark] = useState(false);

  const handleRemind = async (learnerId: string, learnerName: string) => {
    setRemindingLearnerId(learnerId);
    setRemindSuccess(null);
    try {
      await remindNotSubmittedAction(assignmentId, learnerId);
      setRemindSuccess(`Reminder email simulated and logged in Outbox for ${learnerName}!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to dispatch reminder");
    } finally {
      setRemindingLearnerId(null);
    }
  };

  const openMarkingModal = (sub: Submission) => {
    setActiveMarkingSub(sub);
    setMarkingOutcome(sub.outcome === "not_yet_achieved" ? "not_yet_achieved" : "achieved");
    setMarkingFeedback(sub.feedback || "");
  };

  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMarkingSub) return;

    setIsSavingMark(true);
    try {
      await markSubmissionAction(activeMarkingSub.id, {
        outcome: markingOutcome,
        feedback: markingFeedback,
      });

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === activeMarkingSub.id
            ? {
                ...s,
                status: "marked",
                outcome: markingOutcome,
                feedback: markingFeedback,
              }
            : s
        )
      );

      setActiveMarkingSub(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record mark");
    } finally {
      setIsSavingMark(false);
    }
  };

  return (
    <div className="space-y-6">
      {remindSuccess && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-sm text-xs text-blue-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="mail" size={16} className="text-blue-700 flex-shrink-0" />
            <span>{remindSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setRemindSuccess(null)}
            className="text-blue-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
        <div className="p-5 border-b border-line bg-paper/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-navy-900">
              Student submissions & marking roster
            </h2>
            <p className="text-xs text-ink-soft">
              {isCriteriaAssessment
                ? "Regulated criteria grading: Achieved / Not yet achieved with feedback."
                : "Completion-only course: Automatic attendance and modular checkpoint rules."}
            </p>
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
                <th className="py-2.5 px-3">Submission Status</th>
                <th className="py-2.5 px-3">Submitted File</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {learners.map((learner) => {
                const sub = submissions.find((s) => s.learnerId === learner.id);
                const hasSubmitted = sub && (sub.status === "submitted" || sub.status === "marked");

                return (
                  <tr key={learner.id} className="hover:bg-paper/30">
                    <td className="py-3 px-3">
                      <span className="font-bold text-navy-900 block">
                        {learner.firstName} {learner.lastName}
                      </span>
                      <span className="text-ink-soft text-[11px] font-mono">
                        {learner.email}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {hasSubmitted ? (
                        <span
                          className={`px-2 py-0.5 rounded-sm font-semibold uppercase text-[10px] tracking-wider ${
                            sub.status === "marked"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {sub.status === "marked" ? "Marked" : "Submitted"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 font-semibold uppercase text-[10px] tracking-wider">
                          Not submitted
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-ink-soft">
                      {sub?.fileName ? (
                        <span className="font-mono text-[11px] text-navy-900">
                          {sub.fileName}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {isCriteriaAssessment ? (
                        sub?.outcome ? (
                          <span
                            className={`px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase tracking-wider ${
                              sub.outcome === "achieved"
                                ? "bg-emerald-100 text-emerald-900"
                                : sub.outcome === "not_yet_achieved"
                                ? "bg-red-100 text-red-900"
                                : "bg-paper text-ink-soft"
                            }`}
                          >
                            {sub.outcome === "achieved"
                              ? "Achieved"
                              : sub.outcome === "not_yet_achieved"
                              ? "Not yet achieved"
                              : "Pending"}
                          </span>
                        ) : (
                          "—"
                        )
                      ) : (
                        <span className="text-xs text-ink-soft font-semibold">
                          Completion Rules
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {hasSubmitted ? (
                        isCriteriaAssessment ? (
                          <button
                            type="button"
                            onClick={() => openMarkingModal(sub)}
                            className="px-3 py-1.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1 min-h-[32px]"
                          >
                            <Icon name="check" size={14} />
                            <span>{sub.status === "marked" ? "Edit mark" : "Mark coursework"}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-800 font-semibold">
                            ✓ Satisfied
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemind(learner.id, `${learner.firstName} ${learner.lastName}`)}
                          disabled={remindingLearnerId === learner.id}
                          className="px-3 py-1.5 rounded-sm border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white transition-colors text-xs font-semibold inline-flex items-center gap-1 min-h-[32px] disabled:opacity-50"
                        >
                          <Icon name="mail" size={14} />
                          <span>
                            {remindingLearnerId === learner.id ? "Sending..." : "Remind not submitted"}
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criteria Marking Modal / Dialog */}
      {activeMarkingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-md border border-line shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Assess Coursework: {activeMarkingSub.learnerName}
                </h3>
                <p className="text-xs text-ink-soft">
                  Unit: {activeMarkingSub.unitCode} · Submitted: {activeMarkingSub.fileName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMarkingSub(null)}
                className="w-8 h-8 rounded-sm hover:bg-paper flex items-center justify-center text-ink-soft"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMark} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-navy-900 block">
                  Assessment Outcome Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMarkingOutcome("achieved")}
                    className={`p-3 rounded-sm border text-xs font-bold text-center transition-all ${
                      markingOutcome === "achieved"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-500/30"
                        : "bg-paper text-ink-soft border-line hover:border-navy-900"
                    }`}
                  >
                    ✓ Achieved
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarkingOutcome("not_yet_achieved")}
                    className={`p-3 rounded-sm border text-xs font-bold text-center transition-all ${
                      markingOutcome === "not_yet_achieved"
                        ? "bg-red-50 text-red-900 border-red-500 ring-2 ring-red-500/30"
                        : "bg-paper text-ink-soft border-line hover:border-navy-900"
                    }`}
                  >
                    ✗ Not yet achieved
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="marking-feedback" className="font-bold text-navy-900 block">
                  Developmental Feedback for Learner
                </label>
                <textarea
                  id="marking-feedback"
                  rows={4}
                  value={markingFeedback}
                  onChange={(e) => setMarkingFeedback(e.target.value)}
                  placeholder="Provide constructive assessment rationale against unit learning outcomes and workplace evidence..."
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setActiveMarkingSub(null)}
                  className="px-4 py-2 rounded-sm border border-line text-ink-soft hover:text-navy-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMark}
                  className="px-5 py-2.5 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors disabled:opacity-50 min-h-[40px]"
                >
                  {isSavingMark ? "Saving Evaluation..." : "Save assessment outcome"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
