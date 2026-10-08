"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Task } from "@/lib/repositories/types";
import { completeTutorTaskAction } from "@/app/staff/actions";

interface Props {
  initialTasks: Task[];
}

export const TutorTasksList: React.FC<Props> = ({ initialTasks }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("open");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleMarkComplete = async (taskId: string) => {
    setCompletingId(taskId);
    setFeedbackMsg(null);
    try {
      await completeTutorTaskAction(taskId);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "completed", isOverdue: false, completedAt: new Date().toISOString() }
            : t
        )
      );
      setFeedbackMsg("Task marked as completed successfully.");
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark task complete");
    } finally {
      setCompletingId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "open") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      {feedbackMsg && (
        <div
          role="status"
          className="p-4 rounded-[6px] bg-[#F0FDF4] border border-[#BBF7D0] text-sm text-[#166534] flex items-center gap-2"
        >
          <Icon name="check-circle" className="w-4 h-4 shrink-0 text-[#16A34A]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
        {(["open", "all", "completed"] as const).map((tab) => {
          const count =
            tab === "open"
              ? tasks.filter((t) => t.status !== "completed").length
              : tab === "completed"
              ? tasks.filter((t) => t.status === "completed").length
              : tasks.length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 ${
                filter === tab
                  ? "bg-[var(--navy-900)] text-white"
                  : "bg-[var(--paper)] text-[var(--ink-soft)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <span>{tab === "open" ? "Pending actions" : tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filter === tab
                    ? "bg-white/20 text-white"
                    : "bg-[var(--line)] text-[var(--ink)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[var(--line)] p-8 text-center text-sm text-[var(--ink-soft)]">
          No tasks found under this filter.
        </div>
      ) : (
        <div className="bg-white rounded-[16px] border border-[var(--line)] divide-y divide-[var(--line)] overflow-hidden">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const deadlineDate = new Date(task.deadline).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={task.id}
                className="p-6 transition-colors hover:bg-[var(--paper)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {isCompleted ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-[6px] bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] inline-flex items-center gap-1">
                        <Icon name="check-circle" className="w-3 h-3" />
                        Completed
                      </span>
                    ) : task.isOverdue ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-[6px] bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] inline-flex items-center gap-1">
                        <Icon name="alert-circle" className="w-3 h-3" />
                        Overdue
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-[6px] bg-amber-50 text-amber-800 border border-amber-200">
                        In progress
                      </span>
                    )}

                    <span className="text-xs text-[var(--ink-soft)]">
                      Assigned by: <strong>College management</strong>
                    </span>
                  </div>

                  <h3
                    className={`font-heading text-lg font-bold ${
                      isCompleted ? "line-through text-[var(--ink-soft)]" : "text-[var(--navy-900)]"
                    }`}
                  >
                    {task.title}
                  </h3>

                  <p className="text-xs text-[var(--ink)] leading-relaxed">{task.description}</p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-[var(--ink-soft)]">
                    <span className="flex items-center gap-1">
                      <Icon name="calendar" className="w-3.5 h-3.5 text-[var(--navy-700)]" />
                      <span>Deadline: {deadlineDate}</span>
                    </span>
                    {task.completedAt && (
                      <span className="text-xs text-[#166534]">
                        Done: {new Date(task.completedAt).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  {!isCompleted ? (
                    <button
                      type="button"
                      disabled={completingId === task.id}
                      onClick={() => handleMarkComplete(task.id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-[6px] bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-700)] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                    >
                      <Icon name="check-circle" className="w-3.5 h-3.5" />
                      <span>{completingId === task.id ? "Saving..." : "Mark complete"}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#166534] inline-flex items-center gap-1">
                      <Icon name="check-circle" className="w-4 h-4 text-[#16A34A]" />
                      Finished
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
