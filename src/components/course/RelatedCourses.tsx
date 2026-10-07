import React from "react";
import Link from "next/link";
import { Course } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

interface RelatedCoursesProps {
  currentCourseId: string;
  category: string;
  allCourses: Course[];
}

export const RelatedCourses: React.FC<RelatedCoursesProps> = ({
  currentCourseId,
  category,
  allCourses,
}) => {
  // Find related courses in same category or other courses
  const related = allCourses
    .filter((c) => c.id !== currentCourseId && c.published)
    .sort((a) => (a.category === category ? -1 : 1))
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="related-courses-heading"
      className="space-y-6 pt-6 border-t border-line"
    >
      <Heading
        level="h2"
        id="related-courses-heading"
        className="text-navy-900 text-2xl"
      >
        Related Qualifications
      </Heading>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.slug}`}
            className="group p-5 bg-white rounded-lg border border-line shadow-subtle hover:border-navy-900/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">
                  {course.category}
                </span>
                <Tag variant="default" className="text-[10px]">
                  {course.levels[0]?.level_label || "Cert"}
                </Tag>
              </div>

              <h4 className="font-heading font-bold text-base text-navy-900 group-hover:text-navy-700 transition-colors mb-2 line-clamp-2">
                {course.title}
              </h4>

              <p className="text-xs text-ink-soft line-clamp-2 mb-4">
                {course.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-between text-xs font-bold text-navy-900 group-hover:text-navy-700">
              <span>View qualification</span>
              <Icon
                name="arrow-right"
                size={14}
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
