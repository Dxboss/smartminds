import React from "react";
import { Course } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";

interface CourseOutcomesProps {
  course: Course;
}

export const CourseOutcomes: React.FC<CourseOutcomesProps> = ({ course }) => {
  if (course.job_prospects.length === 0 && course.progression.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="outcomes-heading" className="space-y-6">
      <Heading
        level="h2"
        id="outcomes-heading"
        className="text-navy-900 text-2xl"
      >
        Career Opportunities & Progression
      </Heading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Job Prospects */}
        {course.job_prospects.length > 0 && (
          <div className="bg-white rounded-lg border border-line p-6 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="user" size={18} className="text-navy-900" />
              <h3 className="font-heading font-bold text-lg text-navy-900">
                Target Roles & Careers
              </h3>
            </div>

            <ul className="space-y-2 text-sm text-ink-soft">
              {course.job_prospects.map((job, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gold-700 font-bold">&bull;</span>
                  <span>{job}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progression Routes */}
        {course.progression.length > 0 && (
          <div className="bg-white rounded-lg border border-line p-6 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="graduation-cap" size={18} className="text-navy-900" />
              <h3 className="font-heading font-bold text-lg text-navy-900">
                Next Progression Routes
              </h3>
            </div>

            <ul className="space-y-2 text-sm text-ink-soft">
              {course.progression.map((prog, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-navy-900 font-bold">&rarr;</span>
                  <span>{prog}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
