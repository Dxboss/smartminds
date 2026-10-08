import React from "react";
import { getServerSession } from "@/lib/session";
import { getEnrolmentRepo } from "@/lib/repositories";
import { seedClasses, seedSessions } from "@/lib/repositories/seedData";
import { StreamOnlyPlayer } from "@/components/student/StreamOnlyPlayer";
import { Icon } from "@/components/ui/Icon";

export default async function StudentRecordingsPage() {
  const session = await getServerSession();
  if (!session) return null;

  const learnerId = session.learnerId || "learner-001";
  const enrolmentRepo = getEnrolmentRepo();
  const enrolments = await enrolmentRepo.listEnrolments(session, { learnerId });

  // Gather class IDs for this learner
  const myClassIds = new Set(enrolments.map((e) => e.classId));
  const myClasses = seedClasses.filter((c) => myClassIds.has(c.id));
  const availableRecordings = seedSessions.filter(
    (s) => myClassIds.has(s.classId) && s.recordingUrl
  );

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

      {availableRecordings.length === 0 ? (
        <div className="bg-white rounded-md border border-line p-12 text-center space-y-3 shadow-sm">
          <Icon name="video" size={36} className="text-navy-900/40 mx-auto" />
          <h2 className="font-heading text-xl font-bold text-navy-900">
            No class recordings available yet
          </h2>
          <p className="text-xs text-ink-soft max-w-md mx-auto">
            Recordings are uploaded after each live class session has concluded. Check back following your next scheduled class.
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
