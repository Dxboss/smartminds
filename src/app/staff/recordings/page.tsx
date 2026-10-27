import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { seedClasses, seedSessions } from "@/lib/repositories/seedData";
import { RecordingsManager, RecordingSessionItem } from "@/components/staff/RecordingsManager";


export default async function TutorRecordingsPage() {
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

  const tutorId = session.tutorId || "tutor-001";

  // Tutor isolation: only see classes belonging to this tutor
  const myClasses =
    session.role === "tutor"
      ? seedClasses.filter((c) => c.tutorId === tutorId || c.tutorId === session.id)
      : seedClasses;

  const myClassIds = new Set(myClasses.map((c) => c.id));
  const mySessions = seedSessions.filter((s) => myClassIds.has(s.classId));

  const recordingSessions: RecordingSessionItem[] = mySessions.map((s) => {
    const cls = myClasses.find((c) => c.id === s.classId);
    return {
      id: s.id,
      title: s.title,
      scheduledAt: s.scheduledAt,
      recordingUrl: s.recordingUrl,
      className: cls?.name || s.classId,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--navy-900)] tracking-tight">
          Class recordings
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">
          Publish and update secure stream playback links for completed lecture sessions.
        </p>
      </div>

      <RecordingsManager initialSessions={recordingSessions} />
    </div>
  );
}
