"use client";

import React, { useState } from "react";
import { Course } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { CourseHeader } from "./CourseHeader";
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

  // Safety fallback if course has no levels
  const selectedLevel = course.levels[selectedLevelIndex] || course.levels[0];

  return (
    <div className="bg-paper py-8 md:py-14 pb-24 lg:pb-16 min-h-screen">
      <Container>
        {/* Header Block */}
        <CourseHeader course={course} />

        {/* 2-Column Split: Content on Left (col-span-8), Sticky Pricing Panel on Right (col-span-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. Intro Video Slot per PRD 10.3 */}
            <VideoSlotPlaceholder courseTitle={course.title} />

            {/* 2. Level Selector (Tabs / Segmented Control) */}
            <div className="bg-white rounded-lg border border-line p-5 shadow-subtle">
              <LevelSelector
                levels={course.levels}
                selectedIndex={selectedLevelIndex}
                onSelectIndex={setSelectedLevelIndex}
              />
            </div>

            {/* 3. Course Overview, Duration & Included Features */}
            {selectedLevel && (
              <CourseOverview course={course} selectedLevel={selectedLevel} />
            )}

            {/* 4. Units List for Selected Level */}
            {selectedLevel && <CourseUnitsList selectedLevel={selectedLevel} />}

            {/* 5. Entry Requirements for Selected Level */}
            {selectedLevel && (
              <CourseRequirements selectedLevel={selectedLevel} />
            )}

            {/* 6. Career Prospects & Progression Routes */}
            <CourseOutcomes course={course} />

            {/* 7. Trust Row & Booking Consultation */}
            <CourseTrustRow />

            {/* 8. Course FAQs */}
            <CourseFAQ faqs={course.faqs} />

            {/* 9. Related Qualifications */}
            <RelatedCourses
              currentCourseId={course.id}
              category={course.category}
              allCourses={allCourses}
            />
          </div>

          {/* Right Column: Sticky Pricing Panel per PRD 10.3 & 10.4 */}
          <div className="lg:col-span-4">
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
