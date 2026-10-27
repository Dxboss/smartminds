import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { getEnrolmentRepo, getCourseRepo } from "@/lib/repositories";
import { Icon } from "@/components/ui/Icon";


export default async function StudentCoursesPage() {
  const session = await getServerSession();
  if (!session) return null;

  let learnerId = session.learnerId;
  if (!learnerId) {
    const { seedLearners } = await import("@/lib/repositories/seedData");
    const found = seedLearners.find(
      (l) => l.email.toLowerCase() === session.email.toLowerCase()
    );
    learnerId = found?.id;
  }

  const enrolmentRepo = getEnrolmentRepo();
  const courseRepo = getCourseRepo();

  const enrolments = learnerId
    ? await enrolmentRepo.listEnrolments(session, { learnerId })
    : [];
  const allCourses = await courseRepo.listCourses();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="graduation-cap" size={14} />
            <span>Academic Curriculum</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            My courses & units
          </h1>
          <p className="text-sm text-ink-soft">
            Track your unit criteria progress, portfolio submissions, and course completion milestones.
          </p>
        </div>
      </div>

      {/* Enrolments List */}
      {enrolments.length === 0 ? (
        <div className="bg-white rounded-md border border-line p-12 text-center space-y-3 shadow-sm">
          <Icon name="book-open" size={36} className="text-navy-900/40 mx-auto" />
          <h2 className="font-heading text-xl font-bold text-navy-900">
            No enrolled courses found
          </h2>
          <p className="text-xs text-ink-soft max-w-md mx-auto">
            You do not currently have an active course enrolment. Browse accredited courses to begin.
          </p>
          <div className="pt-2">
            <Link
              href="/courses"
              className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore course catalog</span>
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {enrolments.map((enrolment) => {
            const courseDetails = allCourses.find((c) => c.id === enrolment.courseId);
            const levelDetails = courseDetails?.levels.find(
              (l) => l.level_label === enrolment.courseLevelLabel
            );
            const units = levelDetails?.units || [
              { code: "UNIT-301", title: "Principles of Person-Centred Practice", credits: 6 },
              { code: "UNIT-302", title: "Safeguarding and Duty of Care in Social Care", credits: 5 },
              { code: "UNIT-303", title: "Effective Communication in Adult Care Settings", credits: 4 },
              { code: "UNIT-304", title: "Health and Safety Responsibilities in Care Work", credits: 4 },
            ];

            const completedCount = enrolment.completedUnits.length;
            const totalUnits = units.length;
            const progressPercent = totalUnits > 0 ? Math.round((completedCount / totalUnits) * 100) : 0;

            return (
              <div
                key={enrolment.id}
                className="bg-white rounded-md border border-line shadow-sm overflow-hidden"
              >
                {/* Course Header Banner */}
                <div className="p-6 border-b border-line bg-paper/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                        {enrolment.courseLevelLabel}
                      </span>
                      {courseDetails?.awarding_body && (
                        <span className="text-[11px] px-2 py-0.2 rounded-sm bg-navy-900/5 text-ink-soft font-semibold">
                          Awarding Body: {courseDetails.awarding_body}
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-navy-900">
                      {enrolment.courseTitle}
                    </h2>
                    <p className="text-xs text-ink-soft">
                      Enrolled: {new Date(enrolment.enrolledAt).toLocaleDateString("en-GB")} · Status:{" "}
                      <span className="font-semibold capitalize text-navy-900">
                        {enrolment.status}
                      </span>
                    </p>
                  </div>

                  {/* Progress Ring / Bar */}
                  <div className="flex items-center gap-4 self-start md:self-auto bg-white p-3 rounded-sm border border-line">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs gap-3">
                        <span className="font-semibold text-navy-900">Overall Progress</span>
                        <span className="font-bold text-navy-900">{progressPercent}%</span>
                      </div>
                      <div className="w-36 h-2 bg-paper rounded-full overflow-hidden border border-line">
                        <div
                          className="h-full bg-navy-900 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-ink-soft">
                        {completedCount} of {totalUnits} units achieved
                      </p>
                    </div>
                  </div>
                </div>

                {/* Units List (Criteria vs Completion Rules) */}
                <div className="p-6">
                  {enrolment.assessmentMethod === "criteria" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-lg font-bold text-navy-900">
                          Curriculum units & criteria status
                        </h3>
                        <span className="text-xs text-ink-soft">
                          Regulated RQF Qualification
                        </span>
                      </div>

                      <div className="divide-y divide-line border border-line rounded-sm overflow-hidden">
                        {units.map((unit, idx) => {
                          const isAchieved = enrolment.completedUnits.includes(unit.code);
                          const isInProgress = !isAchieved && idx === completedCount;

                          let badgeClass = "bg-paper text-ink-soft border-line";
                          let badgeText = "Not yet achieved";

                          if (isAchieved) {
                            badgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
                            badgeText = "Achieved";
                          } else if (isInProgress) {
                            badgeClass = "bg-blue-50 text-blue-800 border-blue-200";
                            badgeText = "In progress";
                          }

                          return (
                            <div
                              key={unit.code}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-paper/30 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-navy-900 px-1.5 py-0.5 rounded-sm bg-navy-900/5">
                                    {unit.code}
                                  </span>
                                  <h4 className="text-sm font-bold text-navy-900">
                                    {unit.title}
                                  </h4>
                                </div>
                                {unit.credits && (
                                  <p className="text-xs text-ink-soft">
                                    Credit Value: {unit.credits} Credits · Workplace Observational Assessment
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 self-start sm:self-auto">
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-sm border uppercase tracking-wider ${badgeClass}`}
                                >
                                  {badgeText}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Completion Rules for CPD or non-criteria courses */
                    <div className="p-6 rounded-sm bg-paper border border-line space-y-4">
                      <div className="flex items-center gap-2 text-navy-900">
                        <Icon name="info" size={20} />
                        <h3 className="font-heading text-lg font-bold">
                          Course completion rules (CPD Certification)
                        </h3>
                      </div>

                      <div className="space-y-2 text-xs text-ink-soft leading-relaxed">
                        <p>
                          This continuing professional development course does not use criteria portfolio marking.
                          Your certificate is awarded upon satisfying the following completion requirements:
                        </p>
                        <ul className="list-disc list-inside space-y-1 pl-2 font-medium text-ink">
                          <li>Attend 100% of live online interactive teaching sessions or review archived class recordings.</li>
                          <li>Complete the end-of-module knowledge check questionnaire.</li>
                          <li>Submit the workplace reflection declaration signed by your manager or self-attested.</li>
                        </ul>
                      </div>

                      <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <Icon name="check-circle" size={16} className="text-emerald-600" />
                        <span>Interactive live attendance is currently tracked automatically.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
