import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getLearnerRepo } from "@/lib/repositories";
import { seedClasses, seedSessions, seedEnrolments } from "@/lib/repositories/seedData";
import { ClassSessionEditor } from "@/components/staff/ClassSessionEditor";
import { Icon } from "@/components/ui/Icon";

interface PageProps {
  params: Promise<{ id: string }>;
}


export default async function TutorClassDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session) return null;

  const { id } = await params;
  const tutorId = session.tutorId || "tutor-001";

  const cls = seedClasses.find((c) => c.id === id);
  if (!cls) {
    notFound();
  }

  // Enforce security rule: Tutors see only their own classes
  if (session.role === "tutor" && cls.tutorId !== tutorId) {
    notFound();
  }

  const learnerRepo = getLearnerRepo();
  const allMyLearners = await learnerRepo.listLearners(session);

  // Filter learners enrolled in this specific cohort
  const classEnrolments = seedEnrolments.filter((e) => e.classId === cls.id);
  const classLearnerIds = new Set(classEnrolments.map((e) => e.learnerId));
  const classLearners = allMyLearners.filter((l) => classLearnerIds.has(l.id));

  // Find next session for this class
  const classSessions = seedSessions.filter((s) => s.classId === cls.id);
  const primarySession = classSessions[0] || {
    id: `session-new-${cls.id}`,
    classId: cls.id,
    title: `Next Class Session: ${cls.name}`,
    scheduledAt: "2026-10-13T18:30:00Z",
    durationMinutes: 120,
    zoomLink: cls.zoomLink || "https://zoom.us/j/sample-smartminds-care",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/staff"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors"
        >
          <Icon name="arrow-left" size={14} />
          <span>Back to my classes overview</span>
        </Link>
      </div>

      {/* Cohort Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                {cls.courseLevelLabel}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-sm bg-navy-900/5 text-ink-soft">
                Intake: {cls.intakeLabel}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
              {cls.name}
            </h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-sm bg-navy-900 text-gold-300 self-start sm:self-auto">
            Live Online Cohort
          </span>
        </div>

        <p className="text-xs text-ink-soft">
          Weekly timetable: <strong>{cls.scheduleDescription}</strong> · Lead Instructor: {cls.tutorName}
        </p>
      </div>

      {/* Interactive Session Timetable and Attendance Editor */}
      <ClassSessionEditor
        sessionId={primarySession.id}
        initialScheduledAt={primarySession.scheduledAt}
        initialZoomLink={primarySession.zoomLink}
        initialRecordingUrl={primarySession.recordingUrl}
        cohortZoomLink={cls.zoomLink}
        learners={classLearners}
      />
    </div>
  );
}
