import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import {
  getLearnerRepo,
  getEnrolmentRepo,
  getPaymentRepo,
} from "@/lib/repositories";
import { getCohortSchedule } from "@/lib/persistedData";
import {
  seedAssignments,
  seedSubmissions,
  seedClasses,
  seedSessions,
} from "@/lib/repositories/seedData";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/content/pricing";
import { ChangePasswordPrompt } from "@/components/student/ChangePasswordPrompt";

export const instant = false;

export default async function StudentDashboardPage() {
  const session = await getServerSession();
  if (!session) return null;

  let learnerId = session.learnerId;
  if (!learnerId) {
    const { seedLearners } = await import("@/lib/repositories/seedData");
    const found = seedLearners.find(
      (l) => l.email.toLowerCase() === session.email.toLowerCase()
    );
    learnerId = found?.id || "learner-001";
  }

  const learnerRepo = getLearnerRepo();
  const enrolmentRepo = getEnrolmentRepo();
  const paymentRepo = getPaymentRepo();

  const learner = await learnerRepo.getLearnerById(session, learnerId);
  const enrolments = await enrolmentRepo.listEnrolments(session, { learnerId });
  const paymentSummary = await paymentRepo.getMyPaymentPlan(session, learnerId);

  // Derive class and session for this learner
  const primaryEnrolment = enrolments[0];
  const assignedClass = seedClasses.find((c) => c.id === primaryEnrolment?.classId);
  const nextSession = seedSessions.find((s) => s.classId === assignedClass?.id);

  const cohortSchedule = getCohortSchedule();
  const effectiveZoomLink =
    primaryEnrolment?.sessionTiming === "evening"
      ? cohortSchedule.evening.zoomUrl || nextSession?.zoomLink || "https://zoom.us"
      : cohortSchedule.afternoon.zoomUrl || nextSession?.zoomLink || "https://zoom.us";

  // Assignments due & submissions for this learner
  const mySubmissions = seedSubmissions.filter((s) => s.learnerId === learnerId);
  const markedResults = mySubmissions.filter((s) => s.status === "marked");
  const pendingAssignments = seedAssignments.filter(
    (a) => a.classId === assignedClass?.id && !mySubmissions.some((s) => s.assignmentId === a.id && s.status === "marked")
  );

  // Check upcoming/overdue payment status
  const unpaidItems = paymentSummary?.schedule?.filter((s) => s.status !== "paid") || [];
  const now = new Date();
  const urgentPayment = unpaidItems.find((s) => {
    if (s.status === "overdue") return true;
    const dueTime = new Date(s.dueDate).getTime();
    const diffDays = Math.ceil((dueTime - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 5; // Due within 5 days or overdue
  });
  const isOverdue = urgentPayment?.status === "overdue";
  const daysUntilDue = urgentPayment
    ? Math.ceil((new Date(urgentPayment.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isAccessPaused =
    learner?.accessStatus === "paused" || primaryEnrolment?.status === "paused";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Temporary Password Security Prompt */}
      {session.mustChangePassword && (
        <ChangePasswordPrompt userEmail={session.email} />
      )}

      {/* Urgent / Upcoming Instalment Banner */}
      {urgentPayment && (
        <div
          className={`p-4 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
            isOverdue
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-2 rounded-sm shrink-0 ${
                isOverdue ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
              }`}
            >
              <Icon name="credit-card" size={20} />
            </div>
            <div>
              <div className="font-heading font-bold text-base">
                {isOverdue ? "Tuition instalment overdue" : "Upcoming tuition instalment reminder"}
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {isOverdue
                  ? `Instalment ${urgentPayment.instalmentNumber} (${formatCurrency(urgentPayment.amountGbp)}) was due on ${urgentPayment.dueDate}. Please clear balance or notify college admissions to avoid study access interruption.`
                  : `Instalment ${urgentPayment.instalmentNumber} (${formatCurrency(urgentPayment.amountGbp)}) is due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"} (${urgentPayment.dueDate}).`}
              </p>
            </div>
          </div>
          <Link
            href="/student/payments"
            className="px-4 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors shrink-0 text-center inline-flex items-center justify-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <span>View & pay instalment</span>
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      )}
      {/* Welcome & Access Status Banner */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                learner?.accessStatus === "active"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <span>
              Access Status:{" "}
              {learner?.accessStatus === "active" ? "Active Study" : "Access Paused"}
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Welcome back, {session.name}
          </h1>
          <p className="text-sm text-ink-soft">
            {primaryEnrolment
              ? `Currently enrolled on: ${primaryEnrolment.courseTitle} (${primaryEnrolment.courseLevelLabel})`
              : "Review your live classroom timetable, coursework deadlines, and academic results."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/student/recordings"
            className="px-4 py-2.5 rounded-sm border border-navy-900 text-navy-900 text-xs font-bold hover:bg-navy-900 hover:text-white transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
          >
            <Icon name="video" size={16} />
            <span>Class recordings</span>
          </Link>
          <Link
            href="/student/assignments"
            className="px-4 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Icon name="file-text" size={16} />
            <span>Coursework</span>
          </Link>
        </div>
      </div>

      {/* Grid: Next Class & Assignments Due */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Next Class & Latest Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Live Class Session */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="calendar" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Next live interactive class
                </h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-navy-900 text-gold-300">
                Live Online
              </span>
            </div>

            {nextSession && assignedClass ? (
              <div className="p-5 rounded-sm bg-paper border border-line space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-ink-soft uppercase tracking-wider block">
                    {assignedClass.name}
                  </span>
                  <h3 className="text-base font-bold text-navy-900">
                    {nextSession.title}
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Instructor: {assignedClass.tutorName} · Scheduled:{" "}
                    {new Date(nextSession.scheduledAt).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    at {new Date(nextSession.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} BST
                  </p>
                </div>

                {isAccessPaused ? (
                  <div className="p-4 rounded-sm bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-sm bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                        <Icon name="alert-circle" size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-navy-900">
                          Live classroom access paused
                        </p>
                        <p className="text-xs text-ink-soft">
                          Access to live interactive Zoom sessions is temporarily paused due to an outstanding instalment balance. Once payment is completed, your live seminar link will unlock instantly.
                        </p>
                      </div>
                    </div>
                    <div>
                      <Link
                        href="/student/payments"
                        className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm min-h-[44px]"
                      >
                        <Icon name="credit-card" size={14} />
                        <span>Settle outstanding instalment</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={effectiveZoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm min-h-[44px]"
                    >
                      <Icon name="external-link" size={14} />
                      <span>Join live Zoom classroom</span>
                    </a>
                    <span className="text-xs text-ink-soft">
                      Virtual classroom opens 10 minutes prior to session
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-sm bg-paper text-center space-y-1">
                <p className="text-xs font-bold text-navy-900">No upcoming live classes scheduled</p>
                <p className="text-xs text-ink-soft">Check back soon or consult your tutor timetable.</p>
              </div>
            )}
          </div>

          {/* Latest Marked Results */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Latest results & tutor feedback
                </h2>
              </div>
              <Link
                href="/student/courses"
                className="text-xs font-bold text-navy-900 underline hover:text-gold-700"
              >
                View all units
              </Link>
            </div>

            {markedResults.length > 0 ? (
              <div className="space-y-3">
                {markedResults.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-sm border border-line bg-paper space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-navy-900 px-1.5 py-0.5 rounded-sm bg-navy-900/5">
                          {sub.unitCode}
                        </span>
                        <span className="text-xs font-semibold text-ink">
                          Reflective Practice Submission
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto uppercase tracking-wider">
                        {sub.outcome === "achieved" ? "Achieved" : "Not yet achieved"}
                      </span>
                    </div>

                    {sub.feedback && (
                      <div className="p-3 bg-white rounded-sm border border-line/60 text-xs text-ink-soft space-y-1">
                        <span className="font-bold text-navy-900 block">
                          Tutor feedback (Dr. Eleanor Vance):
                        </span>
                        <p className="leading-relaxed italic">
                          &ldquo;{sub.feedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-sm bg-paper text-center text-xs text-ink-soft">
                No marked coursework results yet. Once your tutor marks your submissions, grades will appear here.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Assignments Due & Payment Balance */}
        <div className="space-y-6">
          {/* Assignments Due */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="clock" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Assignments due
                </h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-navy-900/5 text-navy-900">
                {pendingAssignments.length} Pending
              </span>
            </div>

            {pendingAssignments.length > 0 ? (
              <div className="space-y-3">
                {pendingAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-sm bg-paper border border-line space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-navy-900">
                        {a.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 flex-shrink-0">
                        Due
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">
                      {a.instructions}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-line/60 text-[11px]">
                      <span className="text-ink-soft">
                        Deadline: {new Date(a.deadline).toLocaleDateString("en-GB")}
                      </span>
                      <Link
                        href={`/student/assignments/${a.id}`}
                        className="font-bold text-navy-900 underline hover:text-gold-700"
                      >
                        Upload work
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-sm bg-paper text-center text-xs text-ink-soft">
                All assignments are currently submitted and up to date!
              </div>
            )}
          </div>

          {/* Payment Plan Overview (Own Plan Only) */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="credit-card" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  My payment plan
                </h2>
              </div>
              <Link
                href="/student/payments"
                className="text-xs font-bold text-navy-900 underline hover:text-gold-700"
              >
                Full plan
              </Link>
            </div>

            {paymentSummary ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-sm bg-paper border border-line flex items-center justify-between">
                  <span className="text-ink-soft">Remaining balance</span>
                  <span className="font-heading text-lg font-bold text-navy-900">
                    {formatCurrency(paymentSummary.balanceRemainingGbp)}
                  </span>
                </div>

                {paymentSummary.nextDueDate && (
                  <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-navy-900 block">Next due date</span>
                      <span className="text-ink-soft">{paymentSummary.nextDueDate}</span>
                    </div>
                    <span className="font-bold text-navy-900">
                      {formatCurrency(paymentSummary.nextDueAmountGbp || 0)}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/student/payments"
                    className="w-full py-2.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors text-center inline-flex items-center justify-center gap-1.5 min-h-[44px] shadow-sm"
                  >
                    <span>View schedule & pay (£{urgentPayment ? urgentPayment.amountGbp : paymentSummary.nextDueAmountGbp || 0})</span>
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-soft">No active payment plan records.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
