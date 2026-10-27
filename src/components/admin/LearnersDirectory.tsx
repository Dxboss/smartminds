"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Learner, Enrolment, ClassCohort } from "@/lib/repositories/types";
import {
  moveLearnerClassAction,
  assignLearnerTutorAndSessionAction,
  archiveLearnerAction,
  restoreLearnerAction,
  deleteLearnerPermanentlyAction,
  adminEnrolNewStudentAction,
} from "@/app/admin/actions";
import { impersonateUserAction } from "@/app/super/actions";
import type { Course } from "@/content/types";

interface Props {
  initialLearners: Learner[];
  initialEnrolments: Enrolment[];
  classes: ClassCohort[];
  availableCourses?: Course[];
  userRole?: string;
}

export const LearnersDirectory: React.FC<Props> = ({
  initialLearners,
  initialEnrolments,
  classes,
  availableCourses = [],
  userRole = "owner_admin",
}) => {
  const [learners, setLearners] = useState<Learner[]>(initialLearners);
  const [enrolments, setEnrolments] = useState<Enrolment[]>(initialEnrolments);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "funded" | "archived">("all");
  const [search, setSearch] = useState("");

  // Tutor & Cohort Allocation Modal State
  const [movingEnrolment, setMovingEnrolment] = useState<Enrolment | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>(classes[0]?.id || "");
  const [selectedTutor, setSelectedTutor] = useState<string>("Dr. Eleanor Vance");
  const [selectedTiming, setSelectedTiming] = useState<"afternoon" | "evening">("evening");
  const [isMoving, setIsMoving] = useState(false);

  // Archive & Safe Removal Modal State
  const [archivingLearner, setArchivingLearner] = useState<Learner | null>(null);
  const [archiveReason, setArchiveReason] = useState<string>("Course Completed / Graduated");
  const [isArchiving, setIsArchiving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // View Details Modal State
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);

  // Impersonation state
  const [isImpersonatingId, setIsImpersonatingId] = useState<string | null>(null);

  // Enrol New Student Modal State
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolFirstName, setEnrolFirstName] = useState("");
  const [enrolLastName, setEnrolLastName] = useState("");
  const [enrolEmail, setEnrolEmail] = useState("");
  const [enrolPhone, setEnrolPhone] = useState("");
  const [enrolDob, setEnrolDob] = useState("");
  const [enrolAddress, setEnrolAddress] = useState("");
  const [enrolPostcode, setEnrolPostcode] = useState("");
  const [enrolEmergencyName, setEnrolEmergencyName] = useState("");
  const [enrolEmergencyPhone, setEnrolEmergencyPhone] = useState("");

  const [enrolCourseId, setEnrolCourseId] = useState(
    availableCourses[0]?.id || "course-adult-care"
  );
  const selectedCourseObj = availableCourses.find((c) => c.id === enrolCourseId) || availableCourses[0];
  const courseLevelsList = selectedCourseObj?.levels || [];
  const [enrolLevelLabel, setEnrolLevelLabel] = useState(
    courseLevelsList[0]?.level_label || "Level 3"
  );
  const selectedLevelObj = courseLevelsList.find((l) => l.level_label === enrolLevelLabel) || courseLevelsList[0];

  const [enrolClassId, setEnrolClassId] = useState(classes[0]?.id || "class-adult-care-apr26");
  const [enrolTutor, setEnrolTutor] = useState("Dr. Eleanor Vance");
  const [enrolTiming, setEnrolTiming] = useState<"evening" | "afternoon" | "self_paced">("evening");
  const [enrolFundingType, setEnrolFundingType] = useState<"self_pay" | "funded" | "sponsored">("self_pay");
  const [enrolPlanType, setEnrolPlanType] = useState<"full" | "instalments">("instalments");
  const [enrolPrice, setEnrolPrice] = useState(
    selectedLevelObj ? selectedLevelObj.price_gbp.toString() : "1250"
  );
  const [enrolDeposit, setEnrolDeposit] = useState(
    selectedLevelObj?.plans?.[0]?.deposit_value !== undefined
      ? selectedLevelObj.plans[0].deposit_value.toString()
      : "150"
  );
  const [enrolMonths, setEnrolMonths] = useState("6");
  const [enrolPaymentMethod, setEnrolPaymentMethod] = useState<"card" | "bacs" | "employer" | "funded">("card");
  const [enrolPaymentStatus, setEnrolPaymentStatus] = useState<"paid" | "pending">("paid");
  const [enrolCreatedSuccess, setEnrolCreatedSuccess] = useState<{
    name: string;
    email: string;
    tempPass: string;
    studentId: string;
  } | null>(null);

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleImpersonate = async (userIdOrEmail: string, name: string) => {
    setIsImpersonatingId(userIdOrEmail);
    try {
      const res = await impersonateUserAction(userIdOrEmail);
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to impersonate student");
      setIsImpersonatingId(null);
    }
  };

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

  const handleArchiveLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivingLearner) return;

    setIsArchiving(true);
    try {
      const res = await archiveLearnerAction(archivingLearner.id, archiveReason);
      setLearners((prev) =>
        prev.map((l) => (l.id === archivingLearner.id ? res.learner : l))
      );
      setArchivingLearner(null);
      setFeedback(
        `Learner ${archivingLearner.firstName} ${archivingLearner.lastName} has been archived. Their academic records, submissions, and payments remain legally preserved.`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive learner");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestoreLearner = async (learner: Learner) => {
    setIsRestoring(true);
    try {
      const res = await restoreLearnerAction(learner.id);
      setLearners((prev) =>
        prev.map((l) => (l.id === learner.id ? res.learner : l))
      );
      setFeedback(
        `Learner ${learner.firstName} ${learner.lastName} has been restored to active student status.`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to restore learner");
    } finally {
      setIsRestoring(false);
    }
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
    if (filter === "archived") {
      if (learner.accessStatus !== "archived") return false;
    } else if (filter === "all") {
      if (learner.accessStatus === "archived" && !search.trim()) return false;
    } else if (filter === "active") {
      if (learner.accessStatus !== "active") return false;
    } else if (filter === "paused") {
      if (learner.accessStatus !== "paused") return false;
    } else if (filter === "funded") {
      if (enr?.fundingType !== "funded") return false;
      if (learner.accessStatus === "archived") return false;
    }

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
        <div className="flex items-center gap-2 border-b border-line pb-2 sm:pb-0 sm:border-none flex-wrap">
          {(["all", "active", "paused", "funded", "archived"] as const).map((tab) => {
            const count =
              tab === "archived"
                ? learners.filter((l) => l.accessStatus === "archived").length
                : tab === "active"
                ? learners.filter((l) => l.accessStatus === "active").length
                : tab === "paused"
                ? learners.filter((l) => l.accessStatus === "paused").length
                : undefined;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filter === tab
                    ? "bg-navy-900 text-white"
                    : "bg-paper text-ink-soft hover:text-ink border border-line"
                }`}
              >
                <span>{tab === "funded" ? "Workplace funded" : tab}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      filter === tab ? "bg-white/20 text-white" : "bg-line text-ink"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={() => {
              setEnrolCreatedSuccess(null);
              setIsEnrolModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-700 text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm cursor-pointer shrink-0"
          >
            <Icon name="plus" size={14} />
            <span>Enrol New Student</span>
          </button>
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
                  const isArchived = learner.accessStatus === "archived";

                  return (
                    <tr
                      key={learner.id}
                      className={`hover:bg-paper/40 transition-colors ${
                        isArchived ? "bg-slate-50/50 opacity-80" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-900 block text-sm">
                            {learner.firstName} {learner.lastName}
                          </span>
                          {isArchived && (
                            <span className="px-1.5 py-0.2 rounded-xs bg-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider">
                              Archived
                            </span>
                          )}
                        </div>
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
                            isArchived
                              ? "bg-slate-100 text-slate-700 border-slate-300"
                              : isPaused
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isImpersonatingId === learner.id || isImpersonatingId === learner.email}
                            onClick={() => handleImpersonate(learner.email || learner.id, `${learner.firstName} ${learner.lastName}`)}
                            className="px-2 py-1 rounded-sm border border-gold-500 bg-gold-300/20 hover:bg-gold-500 hover:text-navy-900 text-navy-900 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="View Student Portal as this learner"
                          >
                            <Icon name="eye" size={12} />
                            <span>{isImpersonatingId === learner.id || isImpersonatingId === learner.email ? "Loading..." : "View as Student"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedLearner(learner)}
                            className="px-2.5 py-1 text-xs text-navy-900 font-semibold hover:underline cursor-pointer"
                          >
                            Details
                          </button>
                          {isArchived ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreLearner(learner)}
                              disabled={isRestoring}
                              className="px-2.5 py-1 rounded-sm border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              title="Restore learner account to active student roster"
                            >
                              <Icon name="undo" size={12} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <>
                              {enr && (
                                <button
                                  type="button"
                                  onClick={() => openMoveModal(enr)}
                                  className="px-2.5 py-1 rounded-sm border border-navy-900 text-navy-900 text-xs font-semibold hover:bg-navy-900 hover:text-white transition-colors cursor-pointer"
                                >
                                  Assign Tutor / Session
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setArchivingLearner(learner);
                                  setArchiveReason("Course Completed / Graduated");
                                }}
                                className="px-2.5 py-1 rounded-sm border border-line text-ink-soft hover:text-red-700 hover:border-red-300 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                                title="Safely remove or archive learner while preserving records"
                              >
                                Archive
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!confirm(`Are you sure you want to permanently delete learner ${learner.firstName} ${learner.lastName}? This will permanently remove all associated enrolment and payment records.`)) return;
                                  try {
                                    const res = await deleteLearnerPermanentlyAction(learner.id);
                                    if (res.success) {
                                      setLearners((prev) => prev.filter((l) => l.id !== learner.id));
                                      setEnrolments((prev) => prev.filter((e) => e.learnerId !== learner.id));
                                    } else {
                                      alert("Failed to delete learner.");
                                    }
                                  } catch (e) {
                                    alert("Error deleting learner.");
                                  }
                                }}
                                className="p-1 rounded text-ink-soft hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Permanently Delete Learner Record"
                              >
                                <Icon name="trash" size={13} />
                              </button>
                            </>
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

      {/* Archive / Safe Removal Modal */}
      {archivingLearner && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Archive Learner Record
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Safely remove {archivingLearner.firstName} {archivingLearner.lastName} from active roster.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setArchivingLearner(null)}
                className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3 rounded-sm bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Icon name="info" size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Why Archive Instead of Permanent Delete?</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  To comply with awarding body regulations (e.g. NCFE / Pearson) and financial auditing laws, student grades, assignments, and payment receipts are retained permanently. The student will lose portal access immediately, but their historical records can be viewed or restored at any time.
                </p>
              </div>
            </div>

            <form onSubmit={handleArchiveLearner} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Reason for Archival / Removal
                </label>
                <select
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                >
                  <option value="Course Completed / Graduated">
                    Course Completed / Graduated
                  </option>
                  <option value="Learner Withdrew from Study">
                    Learner Withdrew from Study
                  </option>
                  <option value="Non-Attendance / Inactive Account">
                    Non-Attendance / Inactive Account
                  </option>
                  <option value="Transferred to Another Institution">
                    Transferred to Another Institution
                  </option>
                  <option value="Duplicate Record / Administrative Cleanup">
                    Duplicate Record / Administrative Cleanup
                  </option>
                  <option value="Other / Special Circumstances">
                    Other / Special Circumstances
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setArchivingLearner(null)}
                  className="px-3.5 py-2 rounded-sm border border-line text-ink-soft hover:text-navy-900 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isArchiving}
                  className="px-4 py-2 rounded-sm bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Icon name="trash" size={14} />
                  <span>{isArchiving ? "Archiving..." : "Confirm Archival"}</span>
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
                          : selectedLearner.accessStatus === "archived"
                          ? "bg-slate-100 text-slate-700 border-slate-300"
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
                  className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {selectedLearner.accessStatus === "archived" && (
                <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                  <Icon name="info" size={16} className="text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Account Archived & Removed from Active Roster</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Archived on {selectedLearner.archivedAt ? new Date(selectedLearner.archivedAt).toLocaleDateString("en-GB") : "Recorded"}:{" "}
                      <span className="italic font-medium">{selectedLearner.archiveReason || "Administrative archival"}</span>. All qualification records, coursework submissions, and payment receipts remain permanently preserved.
                    </p>
                  </div>
                </div>
              )}

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
      {/* Enrol New Student Modal */}
      {isEnrolModalOpen && (
        <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-navy-900 text-white flex items-center justify-center font-bold">
                  <Icon name="user" size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-navy-900">
                    Enrol New Student &amp; Issue Portal Credentials
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Creates the student profile, registers qualification enrolment, and dispatches the welcome induction email.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnrolModalOpen(false)}
                className="text-ink-soft hover:text-navy-900 text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {enrolCreatedSuccess ? (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-xs space-y-2">
                  <strong className="text-sm font-bold text-emerald-900 block flex items-center gap-1.5">
                    <Icon name="check-circle" size={16} className="text-emerald-700" />
                    <span>Student Onboarded &amp; Induction Dispatched!</span>
                  </strong>
                  <p className="text-emerald-800 leading-relaxed">
                    Student account for <strong>{enrolCreatedSuccess.name}</strong> has been created. A welcome email containing induction materials and portal access instructions has been dispatched.
                  </p>
                  <div className="p-3 bg-white rounded border border-emerald-300/60 font-mono text-xs space-y-1">
                    <div><strong>Student ID:</strong> {enrolCreatedSuccess.studentId}</div>
                    <div><strong>Portal Login:</strong> {enrolCreatedSuccess.email}</div>
                    <div><strong>Temporary Password:</strong> <span className="bg-gold-300/40 px-1.5 py-0.5 rounded font-bold text-navy-900">{enrolCreatedSuccess.tempPass}</span></div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEnrolCreatedSuccess(null);
                      setIsEnrolModalOpen(false);
                    }}
                    className="px-4 py-2 bg-navy-900 text-white rounded-sm font-semibold text-xs hover:bg-navy-700 cursor-pointer"
                  >
                    Done &amp; View in Directory
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!enrolFirstName.trim() || !enrolLastName.trim() || !enrolEmail.trim()) {
                    alert("Please provide the student's name and email address.");
                    return;
                  }

                  setIsEnrolling(true);
                  try {
                    const priceNum = parseFloat(enrolPrice) || 1250;
                    const depNum = parseFloat(enrolDeposit) || 150;
                    const monthsNum = parseInt(enrolMonths, 10) || 6;
                    const monthlyNum = Math.round((priceNum - depNum) / monthsNum);

                    const res = await adminEnrolNewStudentAction({
                      firstName: enrolFirstName,
                      lastName: enrolLastName,
                      email: enrolEmail,
                      phone: enrolPhone,
                      dateOfBirth: enrolDob || undefined,
                      addressLine1: enrolAddress || undefined,
                      postcode: enrolPostcode || undefined,
                      emergencyContactName: enrolEmergencyName || undefined,
                      emergencyContactPhone: enrolEmergencyPhone || undefined,
                      courseId: enrolCourseId,
                      courseTitle: selectedCourseObj?.title || "Accredited Qualification",
                      levelLabel: enrolLevelLabel,
                      classId: enrolClassId,
                      className: classes.find((c) => c.id === enrolClassId)?.name || "Evening Cohort",
                      tutorName: enrolTutor,
                      sessionTiming: enrolTiming,
                      fundingType: enrolFundingType,
                      paymentPlanType: enrolPlanType,
                      totalPrice: priceNum,
                      depositAmount: depNum,
                      monthlyAmount: monthlyNum,
                      months: monthsNum,
                      paymentMethod: enrolPaymentMethod,
                      paymentStatus: enrolPaymentStatus,
                    });

                    if (res.success && res.learner && res.enrolment) {
                      setLearners((prev) => [res.learner, ...prev]);
                      setEnrolments((prev) => [res.enrolment, ...prev]);
                      setEnrolCreatedSuccess({
                        name: `${res.learner.firstName} ${res.learner.lastName}`,
                        email: res.learner.email,
                        tempPass: res.tempPassword,
                        studentId: res.learner.id,
                      });
                      setFeedback(`Student ${res.learner.firstName} ${res.learner.lastName} enrolled successfully.`);
                    }
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Failed to enrol student.");
                  } finally {
                    setIsEnrolling(false);
                  }
                }}
                className="overflow-y-auto pr-1 space-y-4 text-xs flex-1"
              >
                {/* 1. Student Personal Details */}
                <div className="space-y-3 p-3.5 bg-paper rounded-sm border border-line">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Icon name="user" size={13} className="text-gold-700" />
                    <span>1. Student Identity &amp; Contact Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={enrolFirstName}
                        onChange={(e) => setEnrolFirstName(e.target.value)}
                        placeholder="e.g. Sarah"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={enrolLastName}
                        onChange={(e) => setEnrolLastName(e.target.value)}
                        placeholder="e.g. Jenkins"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={enrolEmail}
                        onChange={(e) => setEnrolEmail(e.target.value)}
                        placeholder="sarah.jenkins@example.com"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={enrolPhone}
                        onChange={(e) => setEnrolPhone(e.target.value)}
                        placeholder="+44 7700 900123"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={enrolDob}
                        onChange={(e) => setEnrolDob(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Postcode (Ofqual Cert)</label>
                      <input
                        type="text"
                        value={enrolPostcode}
                        onChange={(e) => setEnrolPostcode(e.target.value)}
                        placeholder="GL1 1UG"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">Home / Postal Address</label>
                    <input
                      type="text"
                      value={enrolAddress}
                      onChange={(e) => setEnrolAddress(e.target.value)}
                      placeholder="Flat 3B, Brunswick Square, Gloucester"
                      className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                    />
                  </div>
                </div>

                {/* 2. Course & Cohort Assignment */}
                <div className="space-y-3 p-3.5 bg-paper rounded-sm border border-line">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Icon name="book-open" size={13} className="text-gold-700" />
                    <span>2. Qualification &amp; Academic Cohort Assignment</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Selected Qualification *</label>
                      <select
                        value={enrolCourseId}
                        onChange={(e) => {
                          const cid = e.target.value;
                          setEnrolCourseId(cid);
                          const c = availableCourses.find((x) => x.id === cid);
                          if (c && c.levels && c.levels.length > 0) {
                            setEnrolLevelLabel(c.levels[0].level_label);
                            setEnrolPrice(c.levels[0].price_gbp.toString());
                            if (c.levels[0].plans && c.levels[0].plans.length > 0) {
                              setEnrolDeposit(c.levels[0].plans[0].deposit_value.toString());
                            }
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                      >
                        {availableCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Qualification Level</label>
                      <select
                        value={enrolLevelLabel}
                        onChange={(e) => {
                          const lvl = e.target.value;
                          setEnrolLevelLabel(lvl);
                          const found = courseLevelsList.find((l) => l.level_label === lvl);
                          if (found) {
                            setEnrolPrice(found.price_gbp.toString());
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                      >
                        {courseLevelsList.map((lvl) => (
                          <option key={lvl.level_label} value={lvl.level_label}>
                            {lvl.level_label} (£{lvl.price_gbp})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Class Cohort Group</label>
                      <select
                        value={enrolClassId}
                        onChange={(e) => {
                          const cid = e.target.value;
                          setEnrolClassId(cid);
                          const cl = classes.find((c) => c.id === cid);
                          if (cl?.tutorName) setEnrolTutor(cl.tutorName);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.scheduleDescription || c.intakeLabel})
                          </option>
                        ))}
                        <option value="class-tutoring-kids">1-on-1 Academic Tutoring (After-School / Sat)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Assigned Tutor</label>
                      <input
                        type="text"
                        value={enrolTutor}
                        onChange={(e) => setEnrolTutor(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Session Timing</label>
                      <select
                        value={enrolTiming}
                        onChange={(e) => setEnrolTiming(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      >
                        <option value="evening">Evening Session (18:30 – 20:30)</option>
                        <option value="afternoon">Afternoon Session (14:00 – 16:00)</option>
                        <option value="self_paced">Flexible / 1-on-1 Tutoring</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Tuition Fee & Payment Plan */}
                <div className="space-y-3 p-3.5 bg-paper rounded-sm border border-line">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Icon name="credit-card" size={13} className="text-gold-700" />
                    <span>3. Tuition Fee &amp; Payment Structure</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Funding Classification</label>
                      <select
                        value={enrolFundingType}
                        onChange={(e) => setEnrolFundingType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      >
                        <option value="self_pay">Self-Pay Student</option>
                        <option value="funded">Government / AEB Funded</option>
                        <option value="sponsored">Workplace / Employer Sponsored</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Payment Schedule</label>
                      <select
                        value={enrolPlanType}
                        onChange={(e) => setEnrolPlanType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      >
                        <option value="instalments">Monthly 0% Instalments</option>
                        <option value="full">Full Upfront Payment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Total Tuition Fee (£)</label>
                      <input
                        type="number"
                        value={enrolPrice}
                        onChange={(e) => setEnrolPrice(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono font-bold text-navy-900"
                      />
                    </div>

                    {enrolPlanType === "instalments" && (
                      <>
                        <div>
                          <label className="block text-[11px] font-semibold text-navy-900 mb-1">Deposit Today (£)</label>
                          <input
                            type="number"
                            value={enrolDeposit}
                            onChange={(e) => setEnrolDeposit(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-navy-900 mb-1">Spread Months</label>
                          <select
                            value={enrolMonths}
                            onChange={(e) => setEnrolMonths(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono"
                          >
                            <option value="3">3 Months</option>
                            <option value="6">6 Months</option>
                            <option value="10">10 Months</option>
                            <option value="12">12 Months</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Deposit Payment Status</label>
                      <select
                        value={enrolPaymentStatus}
                        onChange={(e) => setEnrolPaymentStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      >
                        <option value="paid">Paid (Card / Bank Transfer)</option>
                        <option value="pending">Pending Invoice / First Payment</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsEnrolModalOpen(false)}
                    className="px-3.5 py-2 rounded-sm border border-line bg-paper text-ink-soft hover:text-ink font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEnrolling}
                    className="px-4 py-2 rounded-sm bg-navy-900 hover:bg-navy-700 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Icon name="check" size={14} />
                    <span>{isEnrolling ? "Processing Enrolment..." : "Confirm & Send Welcome Email"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
