import React from "react";
import Link from "next/link";
import { Course } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";

interface CourseHeaderProps {
  course: Course;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-ink-soft"
      >
        <Link href="/" className="hover:text-navy-900 transition-colors">
          Home
        </Link>
        <Icon name="chevron-right" size={12} />
        <Link href="/courses" className="hover:text-navy-900 transition-colors">
          Courses
        </Link>
        <Icon name="chevron-right" size={12} />
        <span className="text-navy-900 font-semibold truncate max-w-xs">
          {course.title}
        </span>
      </nav>

      {/* Badges / Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <Tag variant="navy">{course.category}</Tag>
        <Tag variant="live">Live Online Classes</Tag>
        {course.awarding_body && (
          <Tag variant="gold">Accredited by {course.awarding_body}</Tag>
        )}
        {course.funding === "funded" && (
          <Tag variant="gold">100% Government Funded</Tag>
        )}
      </div>

      {/* Course Title */}
      <Heading
        level="h1"
        className="text-navy-900 text-3xl sm:text-4xl md:text-5xl"
      >
        {course.title}
      </Heading>

      {/* Short Summary */}
      <p className="text-base sm:text-lg text-ink-soft max-w-3xl leading-relaxed">
        {course.summary}
      </p>

      {/* Key Quick Facts Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-line">
        <div className="p-3 bg-white rounded-sm border border-line">
          <span className="text-[11px] font-mono uppercase text-ink-soft block">
            Delivery
          </span>
          <strong className="text-xs sm:text-sm font-heading font-bold text-navy-900">
            {course.delivery === "live_online"
              ? "Live Online Evening"
              : "Blended Online"}
          </strong>
        </div>

        <div className="p-3 bg-white rounded-sm border border-line">
          <span className="text-[11px] font-mono uppercase text-ink-soft block">
            Start Date
          </span>
          <strong className="text-xs sm:text-sm font-heading font-bold text-navy-900">
            {course.start_mode === "rolling" ? "Rolling Start" : "Fixed Cohort"}
          </strong>
        </div>

        <div className="p-3 bg-white rounded-sm border border-line">
          <span className="text-[11px] font-mono uppercase text-ink-soft block">
            Assessment
          </span>
          <strong className="text-xs sm:text-sm font-heading font-bold text-navy-900 capitalize">
            {course.assessment_method} Portfolio
          </strong>
        </div>

        <div className="p-3 bg-white rounded-sm border border-line">
          <span className="text-[11px] font-mono uppercase text-ink-soft block">
            Free Textbook
          </span>
          <strong className="text-xs sm:text-sm font-heading font-bold text-navy-900">
            {course.free_textbook ? "Included Free" : "Digital Handouts"}
          </strong>
        </div>
      </div>
    </div>
  );
};
