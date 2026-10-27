import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { getEnrolmentRepo, getLearnerRepo } from "@/lib/repositories";
import { seedClasses, seedSessions } from "@/lib/repositories/seedData";
import { StreamOnlyPlayer } from "@/components/student/StreamOnlyPlayer";
import { Icon } from "@/components/ui/Icon";


export default async function StudentRecordingsPage() {
  const session = await getServerSession();
  if (!session) return null;

  // Resolve learnerId strictly for current session - do NOT fall back to learner-001
  let learnerId = session.learnerId;
  if (!learnerId) {
    const { seedLearners } = await import("@/lib/repositories/seedData");
    const found = seedLearners.find(
      (l) => l.email.toLowerCase() === session.email.toLowerCase()
    );
    learnerId = found?.id;
  }

  const enrolmentRepo = getEnrolmentRepo();
  const learnerRepo = getLearnerRepo();

  const [enrolments, learner] = await Promise.all([
    learnerId ? enrolmentRepo.listEnrolments(session, { learnerId }) : Promise.resolve([]),
    learnerId ? learnerRepo.getLearnerById(session, learnerId) : Promise.resolve(null),
  ]);

  const isAccessPaused = learner?.accessStatus === "paused";

  // Gather class IDs for this learner
  const myClassIds = new Set(enrolments.map((e) => e.classId));
  const myClasses = seedClasses.filter((c) => myClassIds.has(c.id));

  // Show all recordings published for the learner's enrolled cohorts
  const availableRecordings = seedSessions.filter((s) => {
    return myClassIds.has(s.classId) && Boolean(s.recordingUrl);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="video" size={14} />
            <span>Classroom Archives</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Recorded live classes
          </h1>
          <p className="text-sm text-ink-soft">
            Catch up on previous interactive sessions delivered by your course tutor.
          </p>
        </div>
      </div>

      {isAccessPaused ? (
        <div className="bg-white rounded-md border border-amber-300 p-8 text-center space-y-4 shadow-sm bg-amber-50/40">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Icon name="alert-circle" size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold text-navy-900">
              Classroom Archives Paused
            </h2>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              Access to recorded seminar streams is temporarily suspended due to an overdue instalment. Please settle your outstanding tuition balance to restore immediate on-demand playback.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/student/payments"
              className="px-5 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm min-h-[44px]"
            >
              <Icon name="credit-card" size={14} />
              <span>Settle payment & unlock archives</span>
            </Link>
          </div>
        </div>
      ) : availableRecordings.length === 0 ? (
        <div className="bg-white rounded-md border border-line p-12 text-center space-y-3 shadow-sm">
          <Icon name="video" size={36} className="text-navy-900/40 mx-auto" />
          <h2 className="font-heading text-xl font-bold text-navy-900">
            No class recordings available yet
          </h2>
          <p className="text-xs text-ink-soft max-w-md mx-auto">
            Welcome to Smartminds College! Live class recordings are automatically published here within 24 hours of each scheduled session. As a newly joined student, your upcoming live timetable is active on your portal dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Featured Primary Recording Player */}
          {availableRecordings[0] && (
            <div className="bg-white rounded-md border border-line p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
                    Now Playing
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-navy-900">
                    {availableRecordings[0].title}
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-sm bg-navy-900 text-gold-300">
                  Stream Only
                </span>
              </div>

              <StreamOnlyPlayer
                viewerEmail={session.email}
                videoTitle={availableRecordings[0].title}
                sessionDate={new Date(availableRecordings[0].scheduledAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                classNameTitle={
                  myClasses.find((c) => c.id === availableRecordings[0].classId)?.name ||
                  "Accredited Cohort"
                }
                videoUrl={availableRecordings[0].recordingUrl}
              />
            </div>
          )}

          {/* Recordings Archive List by Class */}
          <div className="bg-white rounded-md border border-line p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-navy-900 border-b border-line pb-4">
              Cohort class recording archive
            </h2>

            <div className="space-y-4">
              {availableRecordings.map((recording, idx) => {
                const assignedClass = myClasses.find((c) => c.id === recording.classId);
                return (
                  <div
                    key={recording.id}
                    className="p-4 sm:p-5 rounded-sm border border-line bg-paper hover:bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-navy-900 px-2 py-0.5 rounded-sm bg-navy-900/5">
                          Session {idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-navy-900">
                          {recording.title}
                        </h3>
                      </div>
                      <p className="text-xs text-ink-soft">
                        Cohort: {assignedClass?.name} · Recorded {new Date(recording.scheduledAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="text-xs text-ink-soft font-mono">
                        {recording.durationMinutes} mins
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 min-h-[36px]"
                      >
                        <Icon name="video" size={14} />
                        <span>Watch stream</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
