import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import {
  getLearnerRepo,
  getPaymentRepo,
  getBookingRepo,
  getTaskRepo,
} from "@/lib/repositories";
import { formatCurrency } from "@/content/pricing";
import { Icon } from "@/components/ui/Icon";

export const instant = false;

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session) return null;

  const isOwnerOrSuper =
    session.role === "owner_admin" || session.role === "super_admin";

  const learnerRepo = getLearnerRepo();
  const bookingRepo = getBookingRepo();
  const taskRepo = getTaskRepo();

  const learners = await learnerRepo.listLearners(session);
  const bookings = await bookingRepo.listBookings(session);
  const tasks = await taskRepo.listTasks(session);

  // Financial data is strictly accessed ONLY if role is owner_admin or super_admin
  let ledgerSummary = null;
  let ledgerRecords = null;
  if (isOwnerOrSuper) {
    const paymentRepo = getPaymentRepo();
    ledgerSummary = await paymentRepo.getLedgerSummary(session);
    ledgerRecords = await paymentRepo.getLedger(session);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Title Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-xs font-semibold">
            <Icon name="shield-check" size={14} />
            <span>{isOwnerOrSuper ? "Owner Control Hub" : "Administrative Operations"}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            {isOwnerOrSuper ? "College Management & Financials" : "Admissions & Learner Operations"}
          </h1>
          <p className="text-sm text-ink-soft">
            {isOwnerOrSuper
              ? "Comprehensive overview of college fee collections, learner enrolments, and faculty assignments."
              : "Handle applicant enquiries, consultation calls, class allocations, and learner support."}
          </p>
        </div>

        {isOwnerOrSuper && (
          <div className="flex items-center gap-3">
            <Link
              href="/admin/payments"
              className="px-4 py-2 rounded-sm bg-navy-900 text-white text-sm font-semibold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="file-text" size={16} />
              <span>Full payments ledger</span>
            </Link>
          </div>
        )}
      </div>

      {/* Case 1: Owner Admin / Super Admin (With Financials) */}
      {isOwnerOrSuper && ledgerSummary && (
        <div className="space-y-8">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Received this month
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                {formatCurrency(ledgerSummary.receivedThisMonthGbp)}
              </span>
              <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                <Icon name="check" size={12} />
                <span>Verified payments</span>
              </span>
            </div>

            <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Total outstanding
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                {formatCurrency(ledgerSummary.totalOutstandingGbp)}
              </span>
              <span className="text-xs text-ink-soft">
                Scheduled future instalments
              </span>
            </div>

            <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Overdue learners
              </span>
              <span className="font-heading text-3xl font-bold text-red-600 block">
                {ledgerSummary.overdueLearnersCount}
              </span>
              <span className="text-xs text-red-700">
                Past grace period limit
              </span>
            </div>

            <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Upcoming instalments
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                {ledgerSummary.upcomingInstalmentsCount}
              </span>
              <span className="text-xs text-ink-soft">
                Due within next 30 days
              </span>
            </div>
          </div>

          {/* Recent Payments Ledger Snippet */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="credit-card" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Recent payment transactions
                </h2>
              </div>
              <Link
                href="/admin/payments"
                className="text-xs font-bold text-navy-900 underline hover:text-gold-700"
              >
                View all records & CSV export
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                    <th className="py-2.5 px-3">Learner</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ledgerRecords?.slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-paper/40">
                      <td className="py-2.5 px-3 font-bold text-navy-900">
                        {r.learnerName}
                      </td>
                      <td className="py-2.5 px-3 text-ink-soft">{r.courseTitle}</td>
                      <td className="py-2.5 px-3 font-semibold text-navy-900">
                        {formatCurrency(r.amountGbp)}
                      </td>
                      <td className="py-2.5 px-3 capitalize">{r.method.replace("_", " ")}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-ink-soft">
                        {r.reference}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-ink-soft">
                        {new Date(r.paidAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Administrative Staff Workspace (NO PAYMENTS) */}
      {!isOwnerOrSuper && (
        <div className="space-y-6">

          {/* Operational Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/pipeline"
              className="p-5 rounded-md bg-white border border-line shadow-sm hover:border-navy-900/50 transition-colors space-y-1 block"
            >
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Admissions leads
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                8 Active
              </span>
              <span className="text-[11px] text-navy-700 font-medium inline-flex items-center gap-1">
                View pipeline &rarr;
              </span>
            </Link>

            <Link
              href="/admin/bookings"
              className="p-5 rounded-md bg-white border border-line shadow-sm hover:border-navy-900/50 transition-colors space-y-1 block"
            >
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Consultations
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                {bookings.length} Booked
              </span>
              <span className="text-[11px] text-navy-700 font-medium inline-flex items-center gap-1">
                Manage schedule &rarr;
              </span>
            </Link>

            <Link
              href="/admin/learners"
              className="p-5 rounded-md bg-white border border-line shadow-sm hover:border-navy-900/50 transition-colors space-y-1 block"
            >
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Enrolled learners
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                {learners.length} Records
              </span>
              <span className="text-[11px] text-navy-700 font-medium inline-flex items-center gap-1">
                Cohort directory &rarr;
              </span>
            </Link>

            <Link
              href="/admin/tasks"
              className="p-5 rounded-md bg-white border border-line shadow-sm hover:border-navy-900/50 transition-colors space-y-1 block"
            >
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                Assigned tasks
              </span>
              <span className="font-heading text-3xl font-bold text-navy-900 block">
                {tasks.filter((t) => t.status !== "completed").length} Pending
              </span>
              <span className="text-[11px] text-navy-700 font-medium inline-flex items-center gap-1">
                View tasks &rarr;
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Shared Section: Learner Directory & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learner Directory */}
        <div className="lg:col-span-2 bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <Icon name="users" size={20} className="text-navy-900" />
              <h2 className="font-heading text-xl font-bold text-navy-900">
                Learner records ({learners.length} sample learners)
              </h2>
            </div>
            <span className="text-xs font-semibold text-ink-soft">
              Active / Paused status only
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Access status</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {learners.slice(0, 8).map((l) => (
                  <tr key={l.id} className="hover:bg-paper/40">
                    <td className="py-2.5 px-3 font-bold text-navy-900">
                      {l.firstName} {l.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-ink-soft">{l.email}</td>
                    <td className="py-2.5 px-3 text-ink-soft">{l.phone}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-sm font-semibold text-[11px] ${
                          l.accessStatus === "active"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {l.accessStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-ink-soft truncate max-w-[200px]">
                      {l.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bookings & Consultations */}
        <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <Icon name="calendar" size={20} className="text-navy-900" />
            <h2 className="font-heading text-xl font-bold text-navy-900">
              Free advice bookings
            </h2>
          </div>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-sm bg-paper border border-line space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-navy-900">
                    {b.fullName}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-ink-soft">
                  Interested: {b.courseInterest}
                </p>
                <p className="text-[11px] text-ink-soft">
                  Scheduled: {new Date(b.scheduledAt).toLocaleString("en-GB")}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-line">
            <h3 className="text-xs font-bold text-navy-900 mb-2">
              Assigned operational tasks
            </h3>
            <div className="space-y-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-sm bg-white border border-line text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-navy-900">{t.title}</span>
                    {t.isOverdue && (
                      <span className="text-[10px] text-red-700 font-bold">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-ink-soft text-[11px] line-clamp-1">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
