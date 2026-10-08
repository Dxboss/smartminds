import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/session";
import {
  seedAssignments,
  seedSubmissions,
  seedClasses,
} from "@/lib/repositories/seedData";
import { CourseworkUploadForm } from "@/components/student/CourseworkUploadForm";
import { Icon } from "@/components/ui/Icon";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentAssignmentDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session) return null;

  const { id } = await params;
  const assignment = seedAssignments.find((a) => a.id === id);
  if (!assignment) {
    notFound();
  }

  const learnerId = session.learnerId || "learner-001";
  const submission = seedSubmissions.find(
    (s) => s.assignmentId === assignment.id && s.learnerId === learnerId
  );
  const assignedClass = seedClasses.find((c) => c.id === assignment.classId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/student/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors"
        >
          <Icon name="arrow-left" size={14} />
          <span>Back to assignments list</span>
        </Link>
      </div>

      {/* Main Assignment Brief Card */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-navy-900 px-2 py-0.5 rounded-sm bg-navy-900/5">
                {assignment.unitCode}
              </span>
              <span className="text-xs text-ink-soft">
                Cohort: {assignedClass?.name}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
              {assignment.title}
            </h1>
          </div>

          <div className="text-right sm:self-center">
            <span className="text-xs text-ink-soft block">Submission Deadline</span>
            <span className="font-bold text-sm text-navy-900">
              {new Date(assignment.deadline).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Detailed Brief Instructions */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-navy-900">
            Coursework Brief & Assessment Criteria
          </h2>
          <div className="p-4 rounded-sm bg-paper border border-line text-xs sm:text-sm text-ink leading-relaxed space-y-2">
            <p>{assignment.instructions}</p>
            <p className="text-xs text-ink-soft pt-2 border-t border-line/60">
              Assessor: {assignedClass?.tutorName || "Faculty Instructor"} · Regulated criteria assessment methodology.
            </p>
          </div>
        </div>

        {/* Tutor Feedback Section (If Marked) */}
        {submission?.status === "marked" && (
          <div className="p-5 rounded-sm bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size={18} className="text-emerald-700" />
                <h3 className="font-heading text-lg font-bold text-emerald-950">
                  Assessment Outcome: {submission.outcome === "achieved" ? "Achieved" : "Not yet achieved"}
                </h3>
              </div>
              <span className="text-xs text-emerald-800 font-semibold">
                Marked {submission.markedAt ? new Date(submission.markedAt).toLocaleDateString("en-GB") : ""}
              </span>
            </div>

            {submission.feedback && (
              <div className="p-4 bg-white rounded-sm border border-emerald-200/60 text-xs text-emerald-950 space-y-1">
                <span className="font-bold block">Assessor Developmental Feedback:</span>
                <p className="leading-relaxed italic">&ldquo;{submission.feedback}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Submission Upload Section */}
        <div className="border-t border-line pt-6 space-y-4">
          <h2 className="font-heading text-lg font-bold text-navy-900">
            Submit coursework
          </h2>
          <CourseworkUploadForm
            assignmentId={assignment.id}
            unitCode={assignment.unitCode}
            existingFileName={submission?.fileName}
            isMarked={submission?.status === "marked"}
          />
        </div>
      </div>
    </div>
  );
}
