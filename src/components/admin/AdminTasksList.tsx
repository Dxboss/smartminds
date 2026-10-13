"use client";

import React, { useState, useMemo, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { Task, UserProfile } from "@/lib/repositories/types";
import {
  completeAdminTaskAction,
  createAdminTaskAction,
  reviewAdminTaskAction,
  flagAdminTaskRedAction,
  applyStaffBonusPenaltyAction,
} from "@/app/admin/actions";

interface Props {
  initialTasks: Task[];
  staffAndTutors: UserProfile[];
  isOwner: boolean;
}

export const AdminTasksList: React.FC<Props> = ({
  initialTasks,
  staffAndTutors,
  isOwner,
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<"open" | "all" | "completed">("open");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Create Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState(
    staffAndTutors[0]?.id || ""
  );
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [modalError, setModalError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Review Directive Modal State
  const [reviewingTask, setReviewingTask] = useState<Task | null>(null);
  const [reviewSatisfaction, setReviewSatisfaction] = useState<
    "satisfied" | "needs_revision" | "unsatisfied"
  >("satisfied");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Red Strike Modal State
  const [flaggingTask, setFlaggingTask] = useState<Task | null>(null);
  const [strikeReason, setStrikeReason] = useState("");
  const [isSubmittingStrike, setIsSubmittingStrike] = useState(false);

  // Disciplinary Bonus Penalty Modal State
  const [penalizingStaff, setPenalizingStaff] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [penaltyBonusAmount, setPenaltyBonusAmount] = useState<number>(250);
  const [penaltyNote, setPenaltyNote] = useState("");
  const [isSubmittingPenalty, setIsSubmittingPenalty] = useState(false);

  // Compute strikes per staff member
  const staffStrikeCounts = useMemo(() => {
    const map: Record<
      string,
      { name: string; count: number; hasPenalty: boolean }
    > = {};
    for (const t of tasks) {
      if (t.isRedFlagged) {
        if (!map[t.assignedToId]) {
          map[t.assignedToId] = {
            name: t.assignedToName,
            count: 0,
            hasPenalty: false,
          };
        }
        map[t.assignedToId].count += 1;
        if (t.penaltyApplied) {
          map[t.assignedToId].hasPenalty = true;
        }
      }
    }
    return map;
  }, [tasks]);

  const handleMarkComplete = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      await completeAdminTaskAction(taskId);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "completed",
                isOverdue: false,
                completedAt: new Date().toISOString(),
              }
            : t
        )
      );
      setFeedback("Operational directive marked as completed.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark task complete");
    } finally {
      setCompletingId(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewingTask) return;
    setIsSubmittingReview(true);
    try {
      const res = await reviewAdminTaskAction(reviewingTask.id, {
        satisfaction: reviewSatisfaction,
        feedback:
          reviewFeedback.trim() ||
          (reviewSatisfaction === "satisfied"
            ? "Submission approved by Director."
            : "Revisions required."),
      });
      if (res.success && res.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === reviewingTask.id ? res.task : t))
        );
        setFeedback(
          `Directive review recorded (${
            reviewSatisfaction === "satisfied"
              ? "Approved"
              : reviewSatisfaction === "needs_revision"
              ? "Revision Requested"
              : "Unsatisfied"
          }) and dispatched to staff.`
        );
        setTimeout(() => setFeedback(null), 5000);
        setReviewingTask(null);
        setReviewFeedback("");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleFlagRedSubmit = async () => {
    if (!flaggingTask) return;
    setIsSubmittingStrike(true);
    try {
      const res = await flagAdminTaskRedAction(
        flaggingTask.id,
        strikeReason.trim() ||
          "Directive overdue and not completed within mandatory compliance deadline."
      );
      if (res.success && res.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === flaggingTask.id ? res.task : t))
        );
        if (res.penaltyTriggered) {
          setFeedback(
            `🔴 Strike #${res.totalStaffStrikes} issued to ${flaggingTask.assignedToName}. WARNING: 3 strikes threshold reached! Disciplinary bonus penalty is now applicable.`
          );
        } else {
          setFeedback(
            `🔴 Strike #${res.totalStaffStrikes} of 3 issued to ${flaggingTask.assignedToName} and recorded in Outbox.`
          );
        }
        setTimeout(() => setFeedback(null), 6000);
        setFlaggingTask(null);
        setStrikeReason("");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to issue red mark");
    } finally {
      setIsSubmittingStrike(false);
    }
  };

  const handlePenaltySubmit = async () => {
    if (!penalizingStaff) return;
    setIsSubmittingPenalty(true);
    try {
      const res = await applyStaffBonusPenaltyAction(
        penalizingStaff.id,
        penalizingStaff.name,
        {
          bonusReductionAmount: Number(penaltyBonusAmount),
          penaltyNote:
            penaltyNote.trim() ||
            "Performance bonus docked due to 3 accumulated overdue compliance directives.",
        }
      );
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.assignedToId === penalizingStaff.id && t.isRedFlagged
              ? {
                  ...t,
                  penaltyApplied: true,
                  bonusReductionAmount: Number(penaltyBonusAmount),
                  penaltyNote,
                }
              : t
          )
        );
        setFeedback(
          `Disciplinary penalty applied: -£${penaltyBonusAmount} bonus deduction logged for ${penalizingStaff.name}. Formal notice dispatched to Outbox.`
        );
        setTimeout(() => setFeedback(null), 6000);
        setPenalizingStaff(null);
        setPenaltyNote("");
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to apply bonus penalty"
      );
    } finally {
      setIsSubmittingPenalty(false);
    }
  };

  const handleCreateTask = () => {
    setModalError("");
    if (!title.trim()) {
      setModalError("Please enter a directive title.");
      return;
    }
    if (!description.trim()) {
      setModalError("Please enter detailed directive instructions.");
      return;
    }
    const assignee = staffAndTutors.find((u) => u.id === assignedToId);
    if (!assignee) {
      setModalError("Please select an assignee from staff or tutors.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createAdminTaskAction({
          title: title.trim(),
          description: description.trim(),
          assignedToId: assignee.id,
          assignedToName: assignee.name,
          deadline,
        });

        if (result.success && result.task) {
          setTasks((prev) => [result.task, ...prev]);
          setIsModalOpen(false);
          setTitle("");
          setDescription("");
          setFeedback(
            `Directive assigned to ${assignee.name} and logged in Outbox.`
          );
          setTimeout(() => setFeedback(null), 5000);
        }
      } catch (err: unknown) {
        setModalError(
          err instanceof Error ? err.message : "Failed to assign task."
        );
      }
    });
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "open") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-fade-in"
        >
          <Icon name="check-circle" size={16} className="text-emerald-700" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-md border border-line flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("open")}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
              filter === "open"
                ? "bg-navy-900 text-white"
                : "bg-paper text-ink-soft hover:text-navy-900 border border-line"
            }`}
          >
            Open Tasks ({tasks.filter((t) => t.status !== "completed").length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
              filter === "completed"
                ? "bg-navy-900 text-white"
                : "bg-paper text-ink-soft hover:text-navy-900 border border-line"
            }`}
          >
            Completed ({tasks.filter((t) => t.status === "completed").length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-navy-900 text-white"
                : "bg-paper text-ink-soft hover:text-navy-900 border border-line"
            }`}
          >
            All Tasks ({tasks.length})
          </button>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-navy-900 text-white rounded-sm text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
          >
            <Icon name="plus" size={14} />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      {/* Staff Compliance & Disciplinary Overview */}
      {Object.keys(staffStrikeCounts).length > 0 && (
        <div className="p-4 rounded-md border border-line bg-white shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-xs bg-navy-900 text-gold-300 flex items-center justify-center">
                <Icon name="shield-check" size={13} />
              </div>
              <h3 className="font-heading text-lg font-bold text-navy-900">
                Staff Compliance & Disciplinary Strikes
              </h3>
            </div>
            <span className="text-[11px] text-ink-soft">
              Regulatory Standard: 3 red strikes triggers mandatory bonus reduction & formal reprimand.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {Object.entries(staffStrikeCounts).map(([staffId, info]) => {
              const hasReachedLimit = info.count >= 3;
              return (
                <div
                  key={staffId}
                  className={`p-3 rounded-sm border flex items-center justify-between gap-3 ${
                    hasReachedLimit
                      ? "bg-rose-50 border-rose-300"
                      : "bg-paper border-line"
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-navy-900">
                      {info.name}
                    </div>
                    <div className="text-[11px] text-ink-soft flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-xs font-mono font-bold text-[10px] ${
                          hasReachedLimit
                            ? "bg-rose-600 text-white"
                            : "bg-amber-200 text-amber-900"
                        }`}
                      >
                        {info.count} / 3 Strikes
                      </span>
                      {info.hasPenalty && (
                        <span className="text-rose-700 font-semibold text-[10px]">
                          (Penalty Deducted)
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwner && hasReachedLimit && (
                    <button
                      onClick={() =>
                        setPenalizingStaff({ id: staffId, name: info.name })
                      }
                      className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-xs text-[11px] font-bold transition-colors shadow-xs"
                    >
                      Reduce Bonus
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-8 bg-white border border-line rounded-md text-center text-sm text-ink-soft">
            No directives found matching this view.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted =
              task.status === "completed" || task.status === "reviewed";
            const staffStrikes =
              staffStrikeCounts[task.assignedToId]?.count || 0;

            return (
              <div
                key={task.id}
                className={`p-6 rounded-md border transition-all ${
                  task.status === "reviewed"
                    ? "bg-emerald-50/20 border-emerald-200 shadow-xs"
                    : isCompleted
                    ? "bg-paper/50 border-line opacity-85"
                    : task.isRedFlagged
                    ? "bg-rose-50/30 border-rose-300 shadow-xs"
                    : task.isOverdue
                    ? "bg-rose-50/20 border-rose-300 shadow-xs"
                    : "bg-white border-line hover:border-navy-900/30 shadow-xs"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          task.status === "reviewed"
                            ? "bg-emerald-100 text-emerald-800"
                            : isCompleted
                            ? "bg-slate-200 text-slate-700"
                            : task.isRedFlagged
                            ? "bg-rose-600 text-white"
                            : task.isOverdue
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {task.status === "reviewed"
                          ? "Director Approved"
                          : isCompleted
                          ? "Completed (Pending Review)"
                          : task.isRedFlagged
                          ? "Red Mark (Strike Issued)"
                          : task.isOverdue
                          ? "Overdue Directive"
                          : "Action Required"}
                      </span>

                      <span className="text-xs text-ink-soft font-mono">
                        Deadline: {task.deadline}
                      </span>

                      {staffStrikes > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                            staffStrikes >= 3
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : "bg-amber-50 text-amber-900 border border-amber-200"
                          }`}
                        >
                          Staff Record: {staffStrikes}/3 Strikes
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-heading text-xl font-bold ${
                        isCompleted && task.status !== "reviewed"
                          ? "text-ink-soft"
                          : "text-navy-900"
                      }`}
                    >
                      {task.title}
                    </h3>

                    <p className="text-sm text-ink-soft leading-relaxed">
                      {task.description}
                    </p>

                    {/* Disciplinary Red Strike Details */}
                    {task.isRedFlagged && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Icon
                            name="alert-circle"
                            size={14}
                            className="text-rose-700"
                          />
                          <span>Official Disciplinary Red Mark Issued</span>
                        </div>
                        <p className="text-[11px] text-rose-800 leading-normal">
                          Reason:{" "}
                          {task.redFlagReason ||
                            "Directive overdue and not completed within statutory compliance window."}
                        </p>
                        {task.penaltyApplied && (
                          <div className="pt-1.5 border-t border-rose-200 font-semibold text-[11px] text-rose-950 flex flex-wrap items-center gap-1.5">
                            <span>
                              ⚡ Disciplinary Bonus Deduction Applied: -£
                              {task.bonusReductionAmount}
                            </span>
                            {task.penaltyNote && (
                              <span className="font-normal italic">
                                ({task.penaltyNote})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Review Feedback Box */}
                    {task.adminSatisfaction && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-sm text-xs text-emerald-950 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Icon
                              name="check-circle"
                              size={14}
                              className="text-emerald-700"
                            />
                            <span>
                              Director Review:{" "}
                              {task.adminSatisfaction === "satisfied"
                                ? "Satisfied & Approved"
                                : task.adminSatisfaction === "needs_revision"
                                ? "Needs Revision"
                                : "Unsatisfied"}
                            </span>
                          </div>
                          {task.reviewedAt && (
                            <span className="text-[10px] text-emerald-800/80 font-mono">
                              {new Date(task.reviewedAt).toLocaleDateString(
                                "en-GB"
                              )}
                            </span>
                          )}
                        </div>
                        {task.adminFeedback && (
                          <p className="text-[11px] text-emerald-900 italic">
                            &ldquo;{task.adminFeedback}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-ink pt-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Icon name="user" size={13} className="text-navy-900" />
                        <span>
                          Assigned to: <strong>{task.assignedToName}</strong>
                        </span>
                      </div>
                      <div className="text-ink-soft">
                        Issued by:{" "}
                        {task.assignedByRole === "owner_admin"
                          ? "Director"
                          : "Admin"}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex-shrink-0 pt-2 md:pt-0">
                    <div className="flex flex-wrap md:flex-col items-start gap-2">
                      {!isCompleted ? (
                        <>
                          <button
                            onClick={() => handleMarkComplete(task.id)}
                            disabled={completingId === task.id}
                            className="px-3.5 py-1.5 bg-paper hover:bg-emerald-50 text-navy-900 hover:text-emerald-800 border border-line hover:border-emerald-300 rounded-sm text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Icon name="check" size={14} />
                            <span>
                              {completingId === task.id
                                ? "Completing..."
                                : "Mark as Done"}
                            </span>
                          </button>

                          {isOwner && !task.isRedFlagged && (
                            <button
                              onClick={() => {
                                setFlaggingTask(task);
                                setStrikeReason(
                                  `Overdue directive "${task.title}" not completed within required compliance deadline.`
                                );
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 rounded-sm text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <Icon name="alert-circle" size={13} />
                              <span>Issue Red Strike</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-sm border border-emerald-200">
                            <Icon name="check-circle" size={14} />
                            <span>
                              {task.status === "reviewed"
                                ? "Approved"
                                : "Completed"}
                            </span>
                          </span>

                          {isOwner && (
                            <button
                              onClick={() => {
                                setReviewingTask(task);
                                setReviewSatisfaction(
                                  task.adminSatisfaction || "satisfied"
                                );
                                setReviewFeedback(task.adminFeedback || "");
                              }}
                              className="w-full px-3 py-1.5 bg-navy-900 hover:bg-navy-700 text-white rounded-sm text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
                            >
                              <Icon name="edit" size={12} />
                              <span>
                                {task.adminSatisfaction
                                  ? "Update Review"
                                  : "Review Directive"}
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center">
                  <Icon name="check-circle" size={16} />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Assign Operational Directive
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-soft hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Directive Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verify workplace observation log for enrolled learner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Assign To (Faculty Tutor or Operations Staff)
                </label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
                >
                  {staffAndTutors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role === "tutor" ? "Tutor" : "Operations"} (
                      {u.specialism || u.department || u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Compliance Deadline Date
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Directive Details & Required Action
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the regulatory or learner support steps required..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-line rounded-sm text-sm font-semibold text-ink-soft hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                disabled={isPending}
                className="px-5 py-2 bg-navy-900 text-white rounded-sm text-sm font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Assigning..." : "Assign Directive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Directive Modal */}
      {reviewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center">
                  <Icon name="edit" size={16} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-navy-900">
                    Review Staff Directive
                  </h3>
                  <p className="text-xs text-ink-soft">
                    {reviewingTask.assignedToName} &bull; {reviewingTask.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewingTask(null)}
                className="text-ink-soft hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-2">
                  Assessment &amp; Satisfaction Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewSatisfaction("satisfied")}
                    className={`p-2.5 rounded-sm border text-xs font-bold text-center transition-all ${
                      reviewSatisfaction === "satisfied"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20"
                        : "bg-white border-line text-ink-soft hover:border-navy-900/30"
                    }`}
                  >
                    <div className="text-emerald-700 font-bold mb-0.5">
                      ✓ Approved
                    </div>
                    <div className="text-[10px] font-normal text-emerald-900">
                      Satisfied
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewSatisfaction("needs_revision")}
                    className={`p-2.5 rounded-sm border text-xs font-bold text-center transition-all ${
                      reviewSatisfaction === "needs_revision"
                        ? "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20"
                        : "bg-white border-line text-ink-soft hover:border-navy-900/30"
                    }`}
                  >
                    <div className="text-amber-700 font-bold mb-0.5">
                      ↺ Revision
                    </div>
                    <div className="text-[10px] font-normal text-amber-900">
                      Changes Needed
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewSatisfaction("unsatisfied")}
                    className={`p-2.5 rounded-sm border text-xs font-bold text-center transition-all ${
                      reviewSatisfaction === "unsatisfied"
                        ? "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20"
                        : "bg-white border-line text-ink-soft hover:border-navy-900/30"
                    }`}
                  >
                    <div className="text-rose-700 font-bold mb-0.5">
                      ✕ Reject
                    </div>
                    <div className="text-[10px] font-normal text-rose-900">
                      Unsatisfied
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Director Feedback &amp; Instructions
                </label>
                <textarea
                  rows={4}
                  placeholder="Specify commendations, required evidence adjustments, or compliance notes..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
                <p className="text-[11px] text-ink-soft mt-1">
                  This feedback will be posted to the staff member&apos;s workspace and dispatched as an official directive review notice.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setReviewingTask(null)}
                className="px-4 py-2 border border-line rounded-sm text-sm font-semibold text-ink-soft hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview}
                className="px-5 py-2 bg-navy-900 text-white rounded-sm text-sm font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmittingReview ? "Saving Review..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Red Strike Modal */}
      {flaggingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-rose-700 text-white flex items-center justify-center">
                  <Icon name="alert-circle" size={16} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-navy-900">
                    Issue Official Red Strike
                  </h3>
                  <p className="text-xs text-rose-800 font-semibold">
                    Staff Recipient: {flaggingTask.assignedToName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFlaggingTask(null)}
                className="text-ink-soft hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Icon name="shield-check" size={14} className="text-rose-700" />
                <span>Disciplinary Escalation Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Directives overdue past deadline receive a Red Mark. If a staff member accumulates <strong>3 strikes</strong>, college management is empowered to dock their performance bonus and enter a disciplinary reprimand on record.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Official Red Flag Reason
                </label>
                <textarea
                  rows={3}
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  placeholder="State why this directive is flagged as overdue or non-compliant..."
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setFlaggingTask(null)}
                className="px-4 py-2 border border-line rounded-sm text-sm font-semibold text-ink-soft hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFlagRedSubmit}
                disabled={isSubmittingStrike}
                className="px-5 py-2 bg-rose-700 text-white rounded-sm text-sm font-semibold hover:bg-rose-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmittingStrike ? "Issuing Strike..." : "Confirm & Issue Red Strike"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disciplinary Bonus Deduction Modal */}
      {penalizingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-rose-900 text-gold-300 flex items-center justify-center">
                  <Icon name="shield-check" size={16} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-navy-900">
                    Impose Disciplinary Bonus Penalty
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Staff: {penalizingStaff.name} (3 Strikes Threshold Reached)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPenalizingStaff(null)}
                className="text-ink-soft hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-900 space-y-1">
              <div className="font-bold">Faculty Regulatory Action</div>
              <p className="text-[11px] leading-relaxed">
                This action deducts the specified sum from the staff member&apos;s scheduled performance bonus and dispatches a formal disciplinary notice to the Outbox.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Bonus Deduction Amount (£ GBP)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPenaltyBonusAmount(amt)}
                      className={`py-2 px-3 rounded-sm border text-xs font-bold transition-colors ${
                        penaltyBonusAmount === amt
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-paper text-ink-soft border-line hover:border-navy-900"
                      }`}
                    >
                      -£{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Formal Statement &amp; Reprimand Note
                </label>
                <textarea
                  rows={3}
                  value={penaltyNote}
                  onChange={(e) => setPenaltyNote(e.target.value)}
                  placeholder="Failure to complete 3 mandatory compliance directives within required statutory timelines..."
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setPenalizingStaff(null)}
                className="px-4 py-2 border border-line rounded-sm text-sm font-semibold text-ink-soft hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePenaltySubmit}
                disabled={isSubmittingPenalty}
                className="px-5 py-2 bg-rose-700 text-white rounded-sm text-sm font-semibold hover:bg-rose-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmittingPenalty ? "Enforcing Deduction..." : "Enforce Bonus Penalty"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
