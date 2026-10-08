import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import {
  seedAssignments,
  seedClasses,
  seedEnrolments,
  seedLearners,
  seedSubmissions,
} from "@/lib/repositories/seedData";
import { SubmissionsGradingTable } from "@/components/staff/SubmissionsGradingTable";
import { Icon } from "@/components/ui/Icon";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TutorAssignmentSubmissionsPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (
    session.role !== "tutor" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const assignment = seedAssignments.find((a) => a.id === id);
  if (!assignment) {
    notFound();
  }

  const tutorId = session.tutorId || "tutor-001";
  // Tutor isolation: only see assignments for their own classes
  if (
    session.role === "tutor" &&
    assignment.tutorId !== tutorId &&
    assignment.tutorId !== session.id
  ) {
    notFound();
  }

  const cls = seedClasses.find((c) => c.id === assignment.classId);
  const classEnrolments = seedEnrolments.filter((e) => e.classId === assignment.classId);
  const learnerIds = new Set(classEnrolments.map((e) => e.learnerId));
  const enrolledLearners = seedLearners.filter((l) => learnerIds.has(l.id));

  const submissions = seedSubmissions.filter((s) => s.assignmentId === assignment.id);
  const isCriteriaAssessment = cls ? !cls.courseId.includes("cpd") : true;

  const deadlineFormatted = new Date(assignment.deadline).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <div>
        <Link
          href="/staff/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--navy-700)] hover:text-[var(--navy-900)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] rounded-[6px] px-1 py-0.5"
        >
          <Icon name="arrow-left" className="w-3.5 h-3.5" />
          <span>Back to assignments</span>
        </Link>
      </div>

      {/* Assignment Header Card */}
      <section
        aria-labelledby="assignment-heading"
        className="bg-white rounded-[16px] border border-[var(--line)] p-6 md:p-8 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-[6px] bg-[var(--paper)] text-[var(--ink-soft)] border border-[var(--line)]">
                {assignment.unitCode}
              </span>
              <span className="text-xs font-medium text-[var(--ink-soft)]">
                Cohort: <strong className="text-[var(--ink)]">{cls?.name || assignment.classId}</strong>
              </span>
            </div>
            <h1
              id="assignment-heading"
              className="font-heading text-2xl md:text-3xl font-bold text-[var(--navy-900)] tracking-tight"
            >
              {assignment.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2 shrink-0">
            <Icon name="calendar" className="w-4 h-4 text-[var(--navy-700)]" />
            <div className="text-xs">
              <span className="text-[var(--ink-soft)] block">Submission deadline</span>
              <strong className="text-[var(--ink)]">{deadlineFormatted}</strong>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-2">
            Brief instructions for learners
          </h2>
          <p className="text-sm text-[var(--ink)] whitespace-pre-line leading-relaxed bg-[var(--paper)] p-4 rounded-[6px] border border-[var(--line)]">
            {assignment.instructions}
          </p>
        </div>
      </section>

      {/* Submissions Matrix & Marking Table */}
      <section aria-label="Learner submissions register">
        <SubmissionsGradingTable
          assignmentId={assignment.id}
          assignmentTitle={assignment.title}
          isCriteriaAssessment={isCriteriaAssessment}
          learners={enrolledLearners}
          initialSubmissions={submissions}
        />
      </section>
    </div>
  );
}
