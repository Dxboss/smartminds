"use client";

import React, { useState } from "react";
import { Course } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { CourseHeader } from "./CourseHeader";
import { CourseMediaShowcase } from "./CourseMediaShowcase";
import { VideoSlotPlaceholder } from "./VideoSlotPlaceholder";
import { LevelSelector } from "./LevelSelector";
import { CourseOverview } from "./CourseOverview";
import { CourseUnitsList } from "./CourseUnitsList";
import { CourseRequirements } from "./CourseRequirements";
import { CourseOutcomes } from "./CourseOutcomes";
import { CoursePricingPanel } from "./CoursePricingPanel";
import { CourseTrustRow } from "./CourseTrustRow";
import { CourseFAQ } from "./CourseFAQ";
import { RelatedCourses } from "./RelatedCourses";

interface CourseDetailClientProps {
  course: Course;
  allCourses: Course[];
}

export const CourseDetailClient: React.FC<CourseDetailClientProps> = ({
  course,
  allCourses,
}) => {
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);
  const levels = Array.isArray(course.levels) ? course.levels : [];
  const isTutoring = course.type === "tutoring" || course.is_private_tutoring === true;
  const selectedLevel = levels[selectedLevelIndex] || levels[0];

  return (
    <div className="bg-paper py-8 md:py-14 pb-32 lg:pb-16 min-h-screen">
      <Container>
        {/* Header Block */}
        <CourseHeader course={course} />

        {/* 2-Column Split: Content on Left (col-span-8), Sticky Pricing Panel on Right (col-span-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. Interactive Video, Photographic Tour & Delivery Model Showcase */}
            {!isTutoring && course.show_video_showcase !== false && (
              <CourseMediaShowcase course={course} />
            )}

            {/* 2. Level Selector (Tabs / Segmented Control) */}
            {levels.length > 1 && (
              <div className="bg-white rounded-lg border border-line p-5 shadow-subtle">
                <LevelSelector
                  levels={levels}
                  selectedIndex={selectedLevelIndex}
                  onSelectIndex={setSelectedLevelIndex}
                />
              </div>
            )}

            {/* 3. Course Overview, Duration & Included Features */}
            {selectedLevel && (
              <CourseOverview course={course} selectedLevel={selectedLevel} />
            )}

            {/* Tutoring Specialized Section: Enhanced DBS Safeguarding Assurance */}
            {(isTutoring || course.show_dbs_guarantee) && (
              <section aria-label="Safeguarding & DBS assurance" className="bg-white rounded-lg border border-line p-6 shadow-subtle space-y-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 sm:mt-0">
                    <Icon name="shield-check" size={22} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-navy-900 leading-tight">
                      Enhanced DBS Certified Tutors &amp; Child Safeguarding
                    </h3>
                    <p className="text-xs text-ink-soft mt-0.5">
                      Every tutor working with children holds an active Enhanced DBS certificate and completes statutory safeguarding checks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3.5 bg-paper rounded-sm border border-line">
                    <strong className="text-navy-900 block font-semibold mb-1">
                      100% Vetted Teachers
                    </strong>
                    <span className="text-[11px] text-ink-soft leading-relaxed block">
                      Qualified UK teachers and subject specialists with proven classroom experience.
                    </span>
                  </div>
                  <div className="p-3.5 bg-paper rounded-sm border border-line">
                    <strong className="text-navy-900 block font-semibold mb-1">
                      Direct Parent Updates
                    </strong>
                    <span className="text-[11px] text-ink-soft leading-relaxed block">
                      Regular written reports tracking comprehension, homework, and milestone progress.
                    </span>
                  </div>
                  <div className="p-3.5 bg-paper rounded-sm border border-line">
                    <strong className="text-navy-900 block font-semibold mb-1">
                      Safe Centre &amp; Online
                    </strong>
                    <span className="text-[11px] text-ink-soft leading-relaxed block">
                      Dedicated study facilities at Brunswick Square or monitored live video lessons.
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Tutoring Specialized Section: Exam Boards & National Curriculum */}
            {(isTutoring || course.show_exam_boards) && (
              <section aria-label="Exam board curriculum alignment" className="bg-white rounded-lg border border-line p-6 shadow-subtle space-y-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-50 border border-navy-200 flex items-center justify-center text-navy-900 shrink-0 mt-0.5 sm:mt-0">
                    <Icon name="award" size={22} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-navy-900 leading-tight">
                      National Curriculum &amp; Official UK Exam Boards
                    </h3>
                    <p className="text-xs text-ink-soft mt-0.5">
                      Targeted tuition mapped directly to standard UK examination boards and grammar entrance frameworks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                  <div className="p-3 bg-paper rounded-sm border border-line">
                    <strong className="text-base font-heading font-bold text-navy-900 block">AQA</strong>
                    <span className="text-[11px] text-ink-soft">English Lang &amp; Maths</span>
                  </div>
                  <div className="p-3 bg-paper rounded-sm border border-line">
                    <strong className="text-base font-heading font-bold text-navy-900 block">Edexcel</strong>
                    <span className="text-[11px] text-ink-soft">Foundation &amp; Higher Tier</span>
                  </div>
                  <div className="p-3 bg-paper rounded-sm border border-line">
                    <strong className="text-base font-heading font-bold text-navy-900 block">OCR</strong>
                    <span className="text-[11px] text-ink-soft">Mark Scheme Mastery</span>
                  </div>
                  <div className="p-3 bg-paper rounded-sm border border-line">
                    <strong className="text-base font-heading font-bold text-navy-900 block">11+ Grammar</strong>
                    <span className="text-[11px] text-ink-soft">GL Assessment &amp; CEM</span>
                  </div>
                </div>
              </section>
            )}

            {/* 4. Units List for Selected Level */}
            {selectedLevel && !isTutoring && <CourseUnitsList selectedLevel={selectedLevel} />}

            {/* 5. Entry Requirements for Selected Level */}
            {selectedLevel && !isTutoring && (
              <CourseRequirements selectedLevel={selectedLevel} />
            )}

            {/* 6. Career Prospects & Progression Routes */}
            {!isTutoring && course.show_career_progression !== false && (
              <CourseOutcomes course={course} />
            )}

            {/* 7. Trust Row & Booking Consultation */}
            {!isTutoring && <CourseTrustRow />}

            {/* 8. Course FAQs */}
            <CourseFAQ faqs={Array.isArray(course.faqs) ? course.faqs : []} />

            {/* 9. Related Qualifications */}
            <RelatedCourses
              currentCourseId={course.id}
              category={course.category || ""}
              allCourses={allCourses}
            />
          </div>

          {/* Right Column: Sticky Pricing Panel per PRD 10.3 & 10.4 */}
          <div id="pricing" className="lg:col-span-4 scroll-mt-24">
            {selectedLevel && (
              <CoursePricingPanel
                course={course}
                selectedLevel={selectedLevel}
              />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
