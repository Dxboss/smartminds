import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import {
  getLearnerRepo,
  getEnrolmentRepo,
  getPaymentRepo,
} from "@/lib/repositories";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/content/pricing";

export default async function StudentDashboardPage() {
  const session = await getServerSession();
  if (!session) return null;

  const learnerId = session.learnerId || "learner-001";
  const learnerRepo = getLearnerRepo();
  const enrolmentRepo = getEnrolmentRepo();
  const paymentRepo = getPaymentRepo();

  const learner = await learnerRepo.getLearnerById(session, learnerId);
  const enrolments = await enrolmentRepo.listEnrolments(session, { learnerId });
  const paymentSummary = await paymentRepo.getMyPaymentPlan(session, learnerId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Enrolment Status: {learner?.accessStatus === "active" ? "Active Study" : "Access Paused"}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Welcome back, {session.name}
          </h1>
          <p className="text-sm text-ink-soft">
            Here is your current course progress, upcoming interactive class sessions, and assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/recordings"
            className="px-4 py-2 rounded-sm border border-navy-900 text-navy-900 text-sm font-semibold hover:bg-navy-900 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="video" size={16} />
            <span>View recordings</span>
          </Link>
          <Link
            href="/student/assignments"
            className="px-4 py-2 rounded-sm bg-navy-900 text-white text-sm font-semibold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="file-text" size={16} />
            <span>Submit coursework</span>
          </Link>
        </div>
      </div>

      {/* Grid: Next Class & Enrolled Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Live Class Session */}
        <div className="lg:col-span-2 bg-white rounded-md border border-line p-6 space-y-5 shadow-sm">
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

          <div className="p-5 rounded-sm bg-paper border border-line space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">
                Diploma in Adult Care (Level 3) — Autumn Cohort
              </span>
              <h3 className="text-base font-bold text-navy-900">
                Session 4: Person-Centred Assessment & Duty of Care
              </h3>
              <p className="text-xs text-ink-soft">
                Tutor: Dr. Eleanor Vance · Tuesday 13 October 2026, 18:30 – 20:30 BST
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://zoom.us/j/sample-smartminds-care"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Icon name="external-link" size={14} />
                <span>Join live Zoom classroom (Placeholder)</span>
              </a>
              <span className="text-xs text-ink-soft">
                Room opens 10 minutes prior to session start
              </span>
            </div>
          </div>

          {/* Enrolled Courses Summary */}
          <div className="space-y-3 pt-2">
            <h3 className="font-heading text-lg font-bold text-navy-900">
              Active enrolments
            </h3>
            {enrolments.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-sm border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-navy-900">
                      {e.courseTitle} ({e.courseLevelLabel})
                    </span>
                    <span className="text-[11px] px-2 py-0.2 rounded-sm bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      {e.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Assessment: {e.assessmentMethod === "criteria" ? "Unit Criteria Grading" : "Completion Rules"} · Enrolled {new Date(e.enrolledAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <Link
                  href="/student/courses"
                  className="text-xs font-bold text-navy-900 underline hover:text-gold-700"
                >
                  View units & progress
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Financial & Balances (Own Only) */}
        <div className="bg-white rounded-md border border-line p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <Icon name="shield-check" size={20} className="text-navy-900" />
            <h2 className="font-heading text-xl font-bold text-navy-900">
              My payment plan
            </h2>
          </div>

          {paymentSummary ? (
            <div className="space-y-4">
              <div className="p-4 rounded-sm bg-paper border border-line space-y-2">
                <span className="text-xs text-ink-soft block">Remaining balance</span>
                <span className="font-heading text-2xl font-bold text-navy-900 block">
                  {formatCurrency(paymentSummary.balanceRemainingGbp)}
                </span>
                <p className="text-xs text-ink-soft">
                  Total course fee: {formatCurrency(paymentSummary.totalAmountGbp)} · Paid to date: {formatCurrency(paymentSummary.totalPaidGbp)}
                </p>
              </div>

              {paymentSummary.nextDueDate && (
                <div className="p-3.5 rounded-sm bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <span className="font-bold text-navy-900 block">
                    Next instalment due
                  </span>
                  <p className="text-ink">
                    {formatCurrency(paymentSummary.nextDueAmountGbp || 0)} due on {paymentSummary.nextDueDate}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  title="Payment processing is disabled in demo mode"
                  className="w-full py-2.5 rounded-sm bg-navy-900/30 text-white text-xs font-bold cursor-not-allowed text-center"
                >
                  Pay now (Disabled in demo)
                </button>
                <p className="text-[11px] text-ink-soft text-center mt-1.5">
                  Automated card checkout enabled in Phase 1b
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-soft">No active payment plan records.</p>
          )}
        </div>
      </div>
    </div>
  );
}
