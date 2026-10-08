import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { getLearnerRepo, getTaskRepo } from "@/lib/repositories";
import { seedClasses, seedAssignments } from "@/lib/repositories/seedData";
import { Icon } from "@/components/ui/Icon";

export default async function StaffDashboardPage() {
  const session = await getServerSession();
  if (!session) return null;

  const tutorId = session.tutorId || "tutor-001";
  const myClasses = seedClasses.filter((c) => c.tutorId === tutorId);

  const learnerRepo = getLearnerRepo();
  const taskRepo = getTaskRepo();

  // Repository enforces that tutor only receives learners in their own assigned classes
  const myLearners = await learnerRepo.listLearners(session);
  const myTasks = await taskRepo.listTasks(session);
  const myAssignments = seedAssignments.filter((a) => a.tutorId === tutorId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="users" size={14} />
            <span>Tutor Faculty Area</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Instructor Console: {session.name}
          </h1>
          <p className="text-sm text-ink-soft">
            Manage your live classroom timetable, assignment criteria marking, and student academic progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/staff/assignments/new"
            className="px-4 py-2 rounded-sm bg-navy-900 text-white text-sm font-semibold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="plus" size={16} />
            <span>Create assignment</span>
          </Link>
        </div>
      </div>

      {/* Grid: My Classes & Assigned Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes & Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="calendar" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Assigned cohorts & timetable
                </h2>
              </div>
              <span className="text-xs font-semibold text-ink-soft">
                {myClasses.length} Active {myClasses.length === 1 ? "Cohort" : "Cohorts"}
              </span>
            </div>

            <div className="space-y-4">
              {myClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-5 rounded-sm bg-paper border border-line space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-navy-900">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-ink-soft">
                        Schedule: {cls.scheduleDescription} · Level: {cls.courseLevelLabel}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-navy-900 text-gold-300 self-start sm:self-auto">
                      {cls.intakeLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-line/60">
                    {cls.zoomLink && (
                      <a
                        href={cls.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Icon name="external-link" size={14} />
                        <span>Launch Zoom classroom</span>
                      </a>
                    )}
                    <span className="text-xs text-ink-soft">
                      {myLearners.length} Enrolled learners assigned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions & Marking Queue */}
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="file-text" size={20} className="text-navy-900" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Coursework & criteria marking queue
                </h2>
              </div>
              <span className="text-xs font-semibold text-ink-soft">
                {myAssignments.length} Active assignments
              </span>
            </div>

            <div className="space-y-3">
              {myAssignments.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-sm border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-navy-900">{a.title}</h4>
                    <p className="text-xs text-ink-soft">
                      Unit code: {a.unitCode} · Deadline: {new Date(a.deadline).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <Link
                    href={`/staff/assignments/${a.id}`}
                    className="px-3 py-1.5 rounded-sm border border-navy-900 text-navy-900 text-xs font-semibold hover:bg-navy-900 hover:text-white transition-colors text-center"
                  >
                    View submissions
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Assigned Tasks by Owner */}
        <div className="space-y-6">
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-line pb-4">
              <Icon name="check" size={20} className="text-navy-900" />
              <h2 className="font-heading text-xl font-bold text-navy-900">
                Tasks from Principal
              </h2>
            </div>

            {myTasks.length === 0 ? (
              <p className="text-xs text-ink-soft">No outstanding assigned tasks.</p>
            ) : (
              <div className="space-y-3">
                {myTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-sm bg-paper border border-line space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-navy-900">
                        {t.title}
                      </span>
                      {t.isOverdue && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-line/60 text-[11px] text-ink-soft">
                      <span>Due {new Date(t.deadline).toLocaleDateString("en-GB")}</span>
                      <span className="font-semibold text-navy-900">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-sm bg-navy-900/5 border border-line text-xs text-ink-soft space-y-1">
            <span className="font-bold text-navy-900 block">
              Teaching Role Privacy Barrier
            </span>
            <p className="leading-relaxed">
              Tutors see only their own assigned classes and learners. Course pricing, student balances, and college financial records are restricted to the owner admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
