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
      {/* Course Overview & Educational Description */}
      <section
        aria-labelledby="course-description-heading"
        className="space-y-3"
      >
        <span className="text-[11px] font-mono uppercase tracking-wider text-gold-700 font-bold block">
          Academic & Vocational Specification
        </span>
        <Heading
          level="h2"
          id="course-description-heading"
          className="text-navy-900 text-2xl sm:text-3xl"
        >
          Qualification overview & delivery structure
        </Heading>
        <div className="text-sm sm:text-base text-ink-soft leading-relaxed space-y-4">
          <p className="whitespace-pre-line">{course.description}</p>
        </div>
      </section>

      {/* Level-Specific Duration, Credits, and Guided Learning Hours */}
      <section
        aria-labelledby="course-specs-heading"
        className="bg-white rounded-md border border-line p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-line pb-3">
          <Heading
            level="h3"
            id="course-specs-heading"
            className="text-navy-900 text-xl font-bold"
          >
            {selectedLevel.level_label} Study specifications
          </Heading>
          <span className="text-xs text-ink-soft font-mono">
            {course.awarding_body ? `Ofqual Accredited by ${course.awarding_body}` : "Accredited Qualification"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 bg-paper rounded-sm border border-line">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft block mb-1">
              Expected Duration
            </span>
            <strong className="text-base font-heading font-bold text-navy-900 block">
              {selectedLevel.duration_text}
            </strong>
            <span className="text-[11px] text-ink-soft mt-0.5 block">
              Flexible pace around work shifts
            </span>
          </div>

          <div className="p-3.5 bg-paper rounded-sm border border-line">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft block mb-1">
              Guided Learning Hours
            </span>
            <strong className="text-base font-heading font-bold text-navy-900 block">
              {selectedLevel.guided_learning_hours} GLH
            </strong>
            <span className="text-[11px] text-ink-soft mt-0.5 block">
              Live lectures + guided reading
            </span>
          </div>

          <div className="p-3.5 bg-paper rounded-sm border border-line">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft block mb-1">
              Accredited Units
            </span>
            <strong className="text-base font-heading font-bold text-navy-900 block">
              {selectedLevel.units.length} Regulated Units
            </strong>
            <span className="text-[11px] text-ink-soft mt-0.5 block">
              Continuous portfolio assessment
            </span>
          </div>
        </div>
      </section>

      {/* Workplace Evidence & Assessment Guide */}
      <section
        aria-labelledby="workplace-evidence-heading"
        className="bg-paper rounded-md border border-line p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Icon name="shield-check" size={18} className="text-navy-900 shrink-0" />
          <Heading
            level="h3"
            id="workplace-evidence-heading"
            className="text-navy-900 text-lg font-bold"
          >
            How your assessment & workplace observation works
          </Heading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-ink">
          <div className="space-y-1.5 p-3.5 bg-white rounded-sm border border-line">
            <strong className="text-navy-900 block font-semibold text-xs">
              Direct Workplace Evidence:
            </strong>
            <p className="text-ink-soft leading-relaxed text-[11px]">
              {course.workplace_evidence_text ||
                "You will build a professional portfolio using real workplace evidence gathered during your employment or voluntary care placement, including care plan reviews, risk assessments, and reflective accounts."}
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-white rounded-sm border border-line">
            <strong className="text-navy-900 block font-semibold text-xs">
              Flexible Observation Methods:
            </strong>
            <p className="text-ink-soft leading-relaxed text-[11px]">
              {course.observation_methods_text ||
                "Workplace observations can be conducted remotely via recorded video session or in-person with a registered Expert Witness (such as your registered manager or clinical lead)."}
            </p>
          </div>
        </div>
      </section>

      {/* What is Included per PRD 10.3 */}
      <section
        aria-labelledby="what-is-included-heading"
        className="bg-white rounded-md border border-line p-5 sm:p-6 space-y-4 shadow-xs"
      >
        <Heading
          level="h3"
          id="what-is-included-heading"
          className="text-navy-900 text-lg font-bold"
        >
          What is included with your tuition fees
        </Heading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ink">
          {(course.tuition_includes && course.tuition_includes.length > 0
            ? course.tuition_includes
            : [
                "Weekly live online evening lectures delivered via Zoom with qualified assessors",
                "24/7 access to the Smartminds Learner Portal and recorded lecture streams",
                "Dedicated named tutor providing individual written feedback within 5 working days",
                "Official awarding organisation registration fees and Ofqual certificate issuance",
                "One-to-one academic mentoring, assignment planning, and study skills guidance",
              ]
          ).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <Icon
                name="check"
                size={15}
                className="text-navy-900 mt-0.5 shrink-0"
              />
              <span>{item}</span>
            </div>
          ))}

          {course.free_textbook && (
            <div className="flex items-start gap-2.5">
              <Icon
                name="check"
                size={15}
                className="text-navy-900 mt-0.5 shrink-0"
              />
              <span>
                Physical printed core textbook dispatched to your UK residential address free of charge
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
