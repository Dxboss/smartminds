import React from "react";
import Link from "next/link";
import { Course } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";

interface CourseHeaderProps {
  course: Course;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  return (
    <div className="space-y-5 mb-10">
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
          Qualifications & courses
        </Link>
        <Icon name="chevron-right" size={12} />
        <span className="text-navy-900 font-semibold truncate max-w-xs">
          {course.title}
        </span>
      </nav>

      {/* Regulated Accreditation Ribbon */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-navy-900 text-white shadow-xs">
          <Icon name="shield-check" size={14} className="text-gold-300" />
          <span>
            {course.type === "regulated"
              ? "Ofqual Regulated Qualification (RQF)"
              : "CPD Accredited Certificate"}
          </span>
        </span>

        {course.awarding_body && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-paper text-navy-900 border border-line">
            <span>Awarding Body: {course.awarding_body}</span>
          </span>
        )}

        {course.awarding_reference && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono bg-paper text-ink-soft border border-line">
            QN: {course.awarding_reference}
          </span>
        )}

        {course.funding === "both" && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Government Funding Eligible
          </span>
        )}
      </div>

      {/* Qualification Title & Lead Editorial Copy */}
      <div className="space-y-3">
        <Heading
          level="h1"
          className="text-navy-900 text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight"
        >
          {course.title}
        </Heading>

        <p className="text-base sm:text-lg text-ink-soft max-w-3xl leading-relaxed">
          {course.summary}
        </p>
      </div>

      {/* Live Online Delivery Format Specification Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 bg-white rounded-md border border-line shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft block mb-1">
            Class Delivery
          </span>
          <strong className="text-xs sm:text-sm font-heading font-bold text-navy-900 block leading-tight truncate">
            {course.custom_delivery_text ||
              (course.delivery === "blended" ? "Blended Learning" : "Live Online Evening")}
          </strong>
          <span className="text-[11px] text-ink-soft mt-0.5 block truncate">
            {course.custom_delivery_text
              ? "Tutor-led interactive schedule"
              : course.delivery === "blended"
              ? "Online theory + workplace practice"
              : "Weekly interactive Zoom lectures"}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-md border border-line shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft block mb-1">
            Intake & Start
          </span>
          <strong className="text-xs sm:text-sm font-heading font-bold text-navy-900 block leading-tight truncate">
            {course.intake_text || "Rolling Admissions"}
          </strong>
          <span className="text-[11px] text-ink-soft mt-0.5 block truncate">
            {course.intake_text ? "Enrolling Active Cohorts" : "Autumn 2026 Cohorts Enrolling"}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-md border border-line shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft block mb-1">
            Assessment Model
          </span>
          <strong className="text-xs sm:text-sm font-heading font-bold text-navy-900 block leading-tight truncate">
            {course.assessment_model_text || "100% Portfolio Based"}
          </strong>
          <span className="text-[11px] text-ink-soft mt-0.5 block truncate">
            {course.assessment_model_text ? "Coursework & Tutor Review" : "No formal written exams"}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-md border border-line shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft block mb-1">
            Dedicated Support
          </span>
          <strong className="text-xs sm:text-sm font-heading font-bold text-navy-900 block leading-tight truncate">
            {course.support_model_text || "Named British Assessor"}
          </strong>
          <span className="text-[11px] text-ink-soft mt-0.5 block truncate">
            {course.support_model_text ? "Assessor-led guidance" : "1-to-1 tutorials & fast marking"}
          </span>
        </div>
      </div>

      {/* Practical Locations Banner (if course has physical locations) */}
      {course.training_locations && course.training_locations.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-1.5 bg-emerald-100 rounded text-emerald-800 flex-shrink-0">
              <Icon name="map-pin" size={16} />
            </span>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-950 block">
                Practical Training & Assessment Locations:
              </span>
              <span className="text-sm font-medium text-emerald-900">
                {course.training_locations.join(" • ")}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-sm shadow-xs self-start sm:self-auto">
            Choose Centre at Enrolment
          </span>
        </div>
      )}

      {/* Private Tutoring Session Structure Notice */}
      {course.session_duration_info && (
        <div className="p-4 bg-gold-300/20 border border-gold-500/40 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-navy-950">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-1.5 bg-gold-500/20 rounded text-navy-900 flex-shrink-0">
              <Icon name="clock" size={16} />
            </span>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-navy-900 block">
                Session Duration & Learning Structure:
              </span>
              <span className="text-sm text-ink-soft font-medium">
                {course.session_duration_info}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-navy-900 bg-gold-400 px-3 py-1 rounded-sm shadow-xs self-start sm:self-auto">
            12-Week Term Bulk Rates Available
          </span>
        </div>
      )}
    </div>
  );
};
