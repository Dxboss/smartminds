import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import {
  seedAssignments,
  seedSubmissions,
  seedClasses,
  seedEnrolments,
} from "@/lib/repositories/seedData";
import { Icon } from "@/components/ui/Icon";

export default async function TutorAssignmentsPage() {
  const session = await getServerSession();
  if (!session) return null;

  const tutorId = session.tutorId || "tutor-001";
  const myClasses = seedClasses.filter((c) => c.tutorId === tutorId);
  const myClassIds = new Set(myClasses.map((c) => c.id));
  const myAssignments = seedAssignments.filter(
    (a) => a.tutorId === tutorId || myClassIds.has(a.classId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="file-text" size={14} />
            <span>Marking & Assessment Hub</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Cohort coursework & marking
          </h1>
          <p className="text-sm text-ink-soft">
            Review submission status across your assigned classes, evaluate coursework, and provide developmental feedback.
          </p>
        </div>

        <div>
          <Link
            href="/staff/assignments/new"
            className="px-5 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Icon name="plus" size={16} />
            <span>Create new assignment</span>
          </Link>
        </div>
      </div>

      {myAssignments.length === 0 ? (
        <div className="bg-white rounded-md border border-line p-12 text-center space-y-3 shadow-sm">
          <Icon name="file-text" size={36} className="text-navy-900/40 mx-auto" />
          <h2 className="font-heading text-xl font-bold text-navy-900">
            No coursework assignments created yet
          </h2>
          <p className="text-xs text-ink-soft max-w-md mx-auto">
            Create an assignment brief for your cohort. When published, an automated notification is simulated to all enrolled students.
          </p>
          <div className="pt-2">
            <Link
              href="/staff/assignments/new"
              className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Icon name="plus" size={14} />
              <span>Create first assignment</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
          <div className="p-6 border-b border-line bg-paper/50 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-navy-900">
              Active assignments queue
            </h2>
            <span className="text-xs font-semibold text-ink-soft">
              {myAssignments.length} Assignments
            </span>
          </div>

          <div className="divide-y divide-line">
            {myAssignments.map((assignment) => {
              const assignedClass = myClasses.find((c) => c.id === assignment.classId);
              const classEnrolments = seedEnrolments.filter(
                (e) => e.classId === assignment.classId
              );
              const totalClassLearners = classEnrolments.length || 6;

              const submissions = seedSubmissions.filter(
                (s) => s.assignmentId === assignment.id
              );
              const submittedCount = submissions.filter(
                (s) => s.status === "submitted" || s.status === "marked"
              ).length;
              const markedCount = submissions.filter((s) => s.status === "marked").length;

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
                        Cohort: {assignedClass?.name || "Assigned Cohort"}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-navy-900">
                      {assignment.title}
                    </h3>

                    <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                      {assignment.instructions}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-soft pt-1">
                      <span>
                        Deadline:{" "}
                        <strong className="text-navy-900">
                          {new Date(assignment.deadline).toLocaleDateString("en-GB")}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        Submissions:{" "}
                        <strong className="text-navy-900">
                          {submittedCount} of {totalClassLearners}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        Marked:{" "}
                        <strong className="text-emerald-700">
                          {markedCount}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
                    <Link
                      href={`/staff/assignments/${assignment.id}`}
                      className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <span>Review submissions & mark</span>
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
