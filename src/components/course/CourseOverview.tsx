import React from "react";
import { Course, CourseLevel } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";

interface CourseOverviewProps {
  course: Course;
  selectedLevel: CourseLevel;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({
  course,
  selectedLevel,
}) => {
  return (
    <div className="space-y-8">
      {/* Overview & Description */}
      <section
        aria-labelledby="course-description-heading"
        className="space-y-3"
      >
        <Heading
          level="h2"
          id="course-description-heading"
          className="text-navy-900 text-2xl"
        >
          Course Overview
        </Heading>
        <p className="text-sm sm:text-base text-ink-soft leading-relaxed whitespace-pre-line">
          {course.description}
        </p>
      </section>

      {/* Level-Specific Duration & Guided Learning Hours */}
      <section
        aria-labelledby="course-specs-heading"
        className="bg-white rounded-lg border border-line p-6 shadow-subtle space-y-4"
      >
        <Heading
          level="h3"
          id="course-specs-heading"
          className="text-navy-900 text-lg"
        >
          {selectedLevel.level_label} Study Details
        </Heading>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-paper rounded-sm border border-line">
            <span className="font-mono uppercase text-ink-soft block mb-1">
              Expected Duration
            </span>
            <strong className="text-sm font-heading font-bold text-navy-900">
              {selectedLevel.duration_text}
            </strong>
          </div>

          <div className="p-3 bg-paper rounded-sm border border-line">
            <span className="font-mono uppercase text-ink-soft block mb-1">
              Guided Learning Hours
            </span>
            <strong className="text-sm font-heading font-bold text-navy-900">
              {selectedLevel.guided_learning_hours} GLH
            </strong>
          </div>

          <div className="p-3 bg-paper rounded-sm border border-line">
            <span className="font-mono uppercase text-ink-soft block mb-1">
              Total Qualification Units
            </span>
            <strong className="text-sm font-heading font-bold text-navy-900">
              {selectedLevel.units.length} Units
            </strong>
          </div>
        </div>
      </section>

      {/* What is Included per PRD 10.3 */}
      <section
        aria-labelledby="what-is-included-heading"
        className="bg-paper rounded-lg border border-line p-6 space-y-4"
      >
        <Heading
          level="h3"
          id="what-is-included-heading"
          className="text-navy-900 text-lg"
        >
          What is included in this course
        </Heading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-ink">
          <div className="flex items-start gap-2.5">
            <Icon
              name="check"
              size={16}
              className="text-navy-900 mt-0.5 flex-shrink-0"
            />
            <span>Weekly live online teaching sessions with expert tutors</span>
          </div>

          <div className="flex items-start gap-2.5">
            <Icon
              name="check"
              size={16}
              className="text-navy-900 mt-0.5 flex-shrink-0"
            />
            <span>24/7 stream access to all class recordings for revision</span>
          </div>

          <div className="flex items-start gap-2.5">
            <Icon
              name="check"
              size={16}
              className="text-navy-900 mt-0.5 flex-shrink-0"
            />
            <span>Dedicated tutor 1-on-1 feedback on all submitted units</span>
          </div>

          <div className="flex items-start gap-2.5">
            <Icon
              name="check"
              size={16}
              className="text-navy-900 mt-0.5 flex-shrink-0"
            />
            <span>
              Awarding organisation registration and certificate issuance
            </span>
          </div>

          {course.free_textbook && (
            <div className="flex items-start gap-2.5">
              <Icon
                name="check"
                size={16}
                className="text-navy-900 mt-0.5 flex-shrink-0"
              />
              <span>
                Official printed course textbook delivered to your address
              </span>
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <Icon
              name="check"
              size={16}
              className="text-navy-900 mt-0.5 flex-shrink-0"
            />
            <span>Student welfare and academic study skills mentorship</span>
          </div>
        </div>
      </section>
    </div>
  );
};
