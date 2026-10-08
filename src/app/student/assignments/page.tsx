import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { getEnrolmentRepo } from "@/lib/repositories";
import {
  seedAssignments,
  seedSubmissions,
  seedClasses,
} from "@/lib/repositories/seedData";
import { Icon } from "@/components/ui/Icon";

export default async function StudentAssignmentsPage() {
  const session = await getServerSession();
  if (!session) return null;

  const learnerId = session.learnerId || "learner-001";
  const enrolmentRepo = getEnrolmentRepo();
  const enrolments = await enrolmentRepo.listEnrolments(session, { learnerId });

  const classIds = new Set(enrolments.map((e) => e.classId));
  const assignments = seedAssignments.filter((a) => classIds.has(a.classId));
  const submissions = seedSubmissions.filter((s) => s.learnerId === learnerId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="file-text" size={14} />
            <span>Academic Assessment</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Coursework assignments
          </h1>
          <p className="text-sm text-ink-soft">
            Submit coursework briefs, review deadlines, and access developmental tutor feedback.
          </p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-md border border-line p-12 text-center space-y-3 shadow-sm">
          <Icon name="file-text" size={36} className="text-navy-900/40 mx-auto" />
          <h2 className="font-heading text-xl font-bold text-navy-900">
            No coursework assignments assigned yet
          </h2>
          <p className="text-xs text-ink-soft max-w-md mx-auto">
            Your course tutor will post assignment briefs following unit lecture sessions.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
          <div className="p-6 border-b border-line bg-paper/50 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-navy-900">
              Curriculum assignment list
            </h2>
            <span className="text-xs text-ink-soft font-semibold">
              {assignments.length} Total Assignments
            </span>
          </div>

          <div className="divide-y divide-line">
            {assignments.map((assignment) => {
              const submission = submissions.find(
                (s) => s.assignmentId === assignment.id
              );
              const assignedClass = seedClasses.find(
                (c) => c.id === assignment.classId
              );

              let statusBadge = (
                <span className="px-2.5 py-1 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                  Not submitted
                </span>
              );

              if (submission?.status === "marked") {
                statusBadge = (
                  <span className="px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                    {submission.outcome === "achieved" ? "Achieved" : "Not yet achieved"}
                  </span>
                );
              } else if (submission?.status === "submitted") {
                statusBadge = (
                  <span className="px-2.5 py-1 rounded-sm bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                    Submitted · Pending marking
                  </span>
                );
              }

              return (
                <div
                  key={assignment.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-paper/30 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-navy-900 px-1.5 py-0.5 rounded-sm bg-navy-900/5">
                        {assignment.unitCode}
                      </span>
                      <span className="text-xs text-ink-soft">
                        Cohort: {assignedClass?.name}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-navy-900">
                      {assignment.title}
                    </h3>

                    <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                      {assignment.instructions}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-ink-soft pt-1">
                      <span>
                        Deadline:{" "}
                        <strong className="text-navy-900">
                          {new Date(assignment.deadline).toLocaleDateString("en-GB")}
                        </strong>
                      </span>
                      {submission?.submittedAt && (
                        <span>
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString("en-GB")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 flex-shrink-0">
                    {statusBadge}

                    <Link
                      href={`/student/assignments/${assignment.id}`}
                      className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <span>
                        {submission?.status === "marked" ? "View results & feedback" : "Upload submission"}
                      </span>
                      <Icon name="arrow-right" size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
