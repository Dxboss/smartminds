"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Learner, Enrolment, ClassCohort } from "@/lib/repositories/types";
import {
  moveLearnerClassAction,
  assignLearnerTutorAndSessionAction,
} from "@/app/admin/actions";

interface Props {
  initialLearners: Learner[];
  initialEnrolments: Enrolment[];
  classes: ClassCohort[];
}

export const LearnersDirectory: React.FC<Props> = ({
  initialLearners,
  initialEnrolments,
  classes,
}) => {
  const [learners] = useState<Learner[]>(initialLearners);
  const [enrolments, setEnrolments] = useState<Enrolment[]>(initialEnrolments);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "funded">("all");
  const [search, setSearch] = useState("");

  // Tutor & Cohort Allocation Modal State
  const [movingEnrolment, setMovingEnrolment] = useState<Enrolment | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>(classes[0]?.id || "");
  const [selectedTutor, setSelectedTutor] = useState<string>("Dr. Eleanor Vance");
  const [selectedTiming, setSelectedTiming] = useState<"afternoon" | "evening">("evening");
  const [isMoving, setIsMoving] = useState(false);

  // View Details Modal State
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);

  const [feedback, setFeedback] = useState<string | null>(null);

  const openMoveModal = (enr: Enrolment) => {
    setMovingEnrolment(enr);
    setTargetClassId(enr.classId);
    setSelectedTutor(
      enr.tutorName ||
        classes.find((c) => c.id === enr.classId)?.tutorName ||
        "Dr. Eleanor Vance"
    );
    setSelectedTiming(enr.sessionTiming || "evening");
  };

  const handleMoveCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingEnrolment || !targetClassId) return;

    setIsMoving(true);
    try {
      await assignLearnerTutorAndSessionAction(movingEnrolment.id, {
        tutorName: selectedTutor,
        sessionTiming: selectedTiming,
        classId: targetClassId,
      });
      const targetClass = classes.find((c) => c.id === targetClassId);

      setEnrolments((prev) =>
        prev.map((enr) =>
          enr.id === movingEnrolment.id
            ? {
                ...enr,
                classId: targetClassId,
                tutorName: selectedTutor,
                sessionTiming: selectedTiming,
                courseId: targetClass?.courseId || enr.courseId,
                courseTitle: targetClass?.name.split(" — ")[0] || enr.courseTitle,
                courseLevelLabel: targetClass?.courseLevelLabel || enr.courseLevelLabel,
              }
            : enr
        )
      );

      const learner = learners.find((l) => l.id === movingEnrolment.learnerId);
      setMovingEnrolment(null);
      setFeedback(
        `Learner ${learner?.firstName || ""} assigned to ${selectedTutor} (${selectedTiming === "afternoon" ? "Afternoon session 14:00–16:00" : "Evening session 18:30–20:30"}).`
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to allocate tutor and session");
    } finally {
      setIsMoving(false);
    }
  };

  const filteredLearners = learners.filter((learner) => {
    const enr = enrolments.find((e) => e.learnerId === learner.id);

    // Filter tab
    if (filter === "active" && learner.accessStatus !== "active") return false;
    if (filter === "paused" && learner.accessStatus !== "paused") return false;
    if (filter === "funded" && enr?.fundingType !== "funded") return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = `${learner.firstName} ${learner.lastName}`.toLowerCase().includes(q);
      const matchEmail = learner.email.toLowerCase().includes(q);
      const matchCourse = enr?.courseTitle.toLowerCase().includes(q);
      return matchName || matchEmail || matchCourse;
    }

    return true;
  });

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


      {/* Controls: Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b border-line pb-2 sm:pb-0 sm:border-none">
          {(["all", "active", "paused", "funded"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold capitalize transition-colors ${
                filter === tab
                  ? "bg-navy-900 text-white"
                  : "bg-paper text-ink-soft hover:text-ink border border-line"
              }`}
            >
              {tab === "funded" ? "Workplace funded" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by learner name, email, or course..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-line bg-white text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
          />
          <span className="absolute left-2.5 top-2 text-ink-soft">
            <Icon name="search" size={14} />
          </span>
        </div>
      </div>

      {/* Learners Directory Table */}
      <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4">Course & Cohort</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4">Funding Stream</th>
                <th className="py-3 px-4">Enrolment Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-soft">
                    No learners found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredLearners.map((learner) => {
                  const enr = enrolments.find((e) => e.learnerId === learner.id);
                  const assignedClass = classes.find((c) => c.id === enr?.classId);
                  const isPaused = learner.accessStatus === "paused";

                  return (
                    <tr key={learner.id} className="hover:bg-paper/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-navy-900 block text-sm">
                          {learner.firstName} {learner.lastName}
                        </span>
                        <div className="text-[11px] text-ink-soft">
                          <span>{learner.email}</span> · <span>{learner.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 space-y-0.5">
                        <div className="font-semibold text-navy-900">
                          {enr?.courseTitle || "Course Enrolment"}
                        </div>
                        <div className="text-[11px] text-ink-soft">
                          Cohort: <strong>{assignedClass?.name || enr?.classId || "—"}</strong>
                        </div>
                        <div className="text-[11px] flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="font-medium text-navy-900">
                            Tutor: {enr?.tutorName || assignedClass?.tutorName || "Dr. Eleanor Vance"}
                          </span>
                          <span>·</span>
                          <span className="capitalize font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                            {enr?.sessionTiming === "afternoon" ? "Afternoon (14:00–16:00)" : "Evening (18:30–20:30)"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-sm font-semibold text-[10px] capitalize border ${
                            isPaused
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {learner.accessStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${
                            enr?.fundingType === "funded"
                              ? "bg-gold-500/20 text-navy-900 border border-gold-500/40"
                              : "bg-paper text-ink-soft border border-line"
                          }`}
                        >
                          {enr?.fundingType === "funded" ? "Funded" : "Self-Pay"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink-soft font-mono text-[11px]">
                        {new Date(learner.enrolmentDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedLearner(learner)}
                            className="px-2.5 py-1 text-xs text-navy-900 font-semibold hover:underline"
                          >
                            Details
                          </button>
                          {enr && (
                            <button
                              type="button"
                              onClick={() => openMoveModal(enr)}
                              className="px-2.5 py-1 rounded-sm border border-navy-900 text-navy-900 text-xs font-semibold hover:bg-navy-900 hover:text-white transition-colors"
                            >
                              Assign Tutor / Session
                            </button>
                          )}
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

      {/* Tutor & Session Allocation Modal */}
      {movingEnrolment && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Allocate Tutor & Study Session
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Allocate student to a tutor and choose afternoon or evening session timetable.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMovingEnrolment(null)}
                className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleMoveCohort} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Assigned Certified Tutor
                </label>
                <select
                  value={selectedTutor}
                  onChange={(e) => setSelectedTutor(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                >
                  <option value="Dr. Eleanor Vance">
                    Dr. Eleanor Vance (Lead Healthcare Assessor)
                  </option>
                  <option value="Marcus Vance">
                    Marcus Vance (Lead Education & Training Assessor)
                  </option>
                  <option value="Dr. Sarah Jenkins">
                    Dr. Sarah Jenkins (Clinical Practice & Safeguarding)
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Study Session Timing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTiming("afternoon")}
                    className={`p-2.5 rounded-sm border text-left transition-all ${
                      selectedTiming === "afternoon"
                        ? "border-navy-900 bg-navy-50 font-bold"
                        : "border-line bg-white hover:bg-paper"
                    }`}
                  >
                    <span className="block font-bold text-navy-900">Afternoon Session</span>
                    <span className="text-[11px] text-ink-soft">14:00 – 16:00 UK Time</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTiming("evening")}
                    className={`p-2.5 rounded-sm border text-left transition-all ${
                      selectedTiming === "evening"
                        ? "border-navy-900 bg-navy-50 font-bold"
                        : "border-line bg-white hover:bg-paper"
                    }`}
                  >
                    <span className="block font-bold text-navy-900">Evening Session</span>
                    <span className="text-[11px] text-ink-soft">18:30 – 20:30 UK Time</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Cohort / Class Group
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.intakeLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-sm bg-paper border border-line text-[11px] text-ink-soft space-y-1">
                <span className="font-bold text-navy-900 block">Allocation Notes:</span>
                <p>
                  The learner&apos;s timetable and portal sessions will update immediately based on this tutor allocation and session timing.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setMovingEnrolment(null)}
                  className="px-3 py-1.5 rounded-sm border border-line text-ink-soft hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMoving}
                  className="px-4 py-1.5 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors disabled:opacity-50"
                >
                  {isMoving ? "Allocating..." : "Save Tutor & Session Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Learner Details Modal (Strictly Zero Payments) */}
      {selectedLearner && (() => {
        const enr = enrolments.find((e) => e.learnerId === selectedLearner.id);
        const assignedClass = classes.find((c) => c.id === enr?.classId);

        return (
          <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-md border border-line p-6 max-w-lg w-full space-y-5 shadow-xl">
              <div className="flex items-start justify-between border-b border-line pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                      Learner Record
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded-sm text-[10px] font-semibold border ${
                        selectedLearner.accessStatus === "active"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {selectedLearner.accessStatus}
                    </span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-navy-900">
                    {selectedLearner.firstName} {selectedLearner.lastName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLearner(null)}
                  className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-3 bg-paper p-3 rounded-sm border border-line">
                  <div>
                    <span className="text-ink-soft block text-[11px]">Email Address</span>
                    <strong className="text-navy-900">{selectedLearner.email}</strong>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[11px]">Telephone</span>
                    <strong className="text-navy-900">{selectedLearner.phone}</strong>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[11px]">Enrolment Date</span>
                    <strong className="text-navy-900 font-mono">
                      {new Date(selectedLearner.enrolmentDate).toLocaleDateString("en-GB")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[11px]">Funding Stream</span>
                    <strong className="text-navy-900 capitalize">
                      {enr?.fundingType === "funded" ? "Workplace Funded" : "Self-Pay"}
                    </strong>
                  </div>
                </div>

                {/* Course History & Cohort Allocation */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                    Academic Course & Cohort
                  </h4>
                  <div className="p-3 rounded-sm border border-line bg-white space-y-1">
                    <div className="font-bold text-sm text-navy-900">
                      {enr?.courseTitle}
                    </div>
                    <div className="text-ink-soft">
                      Cohort: <strong>{assignedClass?.name}</strong> · Tutor: {assignedClass?.tutorName}
                    </div>
                    <div className="text-[11px] text-ink-soft">
                      Weekly Schedule: {assignedClass?.scheduleDescription}
                    </div>
                  </div>
                </div>

                {/* Completed Units */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                    Completed Qualification Units
                  </h4>
                  {enr && enr.completedUnits.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {enr.completedUnits.map((u) => (
                        <span
                          key={u}
                          className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-semibold"
                        >
                          {u} Achieved
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink-soft italic">No units marked complete yet.</p>
                  )}
                </div>

                {/* Administrative Notes */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                    Office Notes
                  </h4>
                  <p className="p-2.5 rounded-sm bg-paper border border-line text-ink leading-relaxed">
                    {selectedLearner.notes || "No operational notes recorded."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setSelectedLearner(null)}
                  className="px-4 py-2 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors text-xs"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
