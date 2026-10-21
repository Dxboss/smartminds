import React from "react";
import Link from "next/link";
import { Course } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { resolveItemColor, isDarkHex } from "@/components/ui/sectionBg";

interface CourseHeaderProps {
  course: Course;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const bannerBg = resolveItemColor(course.banner_bg_color);
  const isDark = bannerBg ? isDarkHex(bannerBg) : false;
  const customTextColor = resolveItemColor(course.banner_text_color);
  const customAccent = resolveItemColor(course.accent_color) || (isDark ? "#D9B84A" : "#23216B");

  return (
    <div
      className={`space-y-5 transition-all ${
        bannerBg
          ? `p-6 sm:p-8 rounded-xl border ${isDark ? "border-white/15 text-white shadow-md" : "border-line text-ink shadow-xs"} mb-8`
          : "mb-10"
      }`}
      style={bannerBg ? { backgroundColor: bannerBg } : undefined}
    >
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-2 text-xs ${isDark ? "text-white/70" : "text-ink-soft"}`}
      >
        <Link href="/" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-navy-900"}`}>
          Home
        </Link>
        <Icon name="chevron-right" size={12} className={isDark ? "text-white/40" : undefined} />
        <Link href="/courses" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-navy-900"}`}>
          Qualifications & courses
        </Link>
        <Icon name="chevron-right" size={12} className={isDark ? "text-white/40" : undefined} />
        <span className={`font-semibold truncate max-w-xs ${isDark ? "text-white" : "text-navy-900"}`}>
          {course.title}
        </span>
      </nav>

      {/* Regulated Accreditation Ribbon */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold shadow-xs ${
            isDark
              ? "bg-white/15 text-white border border-white/20"
              : "bg-navy-900 text-white"
          }`}
        >
          <Icon name="shield-check" size={14} className="text-gold-300" />
          <span>
            {course.type === "regulated"
              ? "Ofqual Regulated Qualification (RQF)"
              : "CPD Accredited Certificate"}
          </span>
        </span>

        {course.awarding_body && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold border ${
              isDark
                ? "bg-white/10 text-white border-white/20"
                : "bg-paper text-navy-900 border-line"
            }`}
          >
            <span>Awarding Body: {course.awarding_body}</span>
          </span>
        )}

        {course.awarding_reference && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono border ${
              isDark
                ? "bg-white/10 text-white/80 border-white/15"
                : "bg-paper text-ink-soft border-line"
            }`}
          >
            QN: {course.awarding_reference}
          </span>
        )}

        {course.funding === "both" && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold border ${
              isDark
                ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            Government Funding Eligible
          </span>
        )}
      </div>

      {/* Qualification Title & Lead Editorial Copy */}
      <div className="space-y-3">
        <Heading
          level="h1"
          style={customTextColor ? { color: customTextColor } : isDark ? { color: "#FFFFFF" } : undefined}
          className={`${
            !customTextColor && !isDark ? "text-navy-900" : ""
          } text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight font-bold`}
        >
          {course.title}
        </Heading>

        <p
          style={
            customTextColor
              ? { color: customTextColor, opacity: 0.9 }
              : isDark
              ? { color: "rgba(255,255,255,0.85)" }
              : undefined
          }
          className={`text-base sm:text-lg max-w-3xl leading-relaxed ${
            !customTextColor && !isDark ? "text-ink-soft" : ""
          }`}
        >
          {course.summary}
        </p>
      </div>

      {/* Live Online Delivery Format Specification Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div
          className={`p-3.5 rounded-md border shadow-xs ${
            isDark
              ? "bg-white/10 border-white/15 text-white backdrop-blur-xs"
              : "bg-white border-line"
          }`}
        >
          <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDark ? "text-white/60" : "text-ink-soft"}`}>
            Class Delivery
          </span>
          <strong className={`text-xs sm:text-sm font-heading font-bold block leading-tight truncate ${isDark ? "text-white" : "text-navy-900"}`}>
            {course.custom_delivery_text ||
              (course.attendance_type === "physical_venue" || course.delivery === "classroom"
                ? "Physical Campus / Venue"
                : course.delivery === "blended"
                ? "Blended Learning"
                : course.delivery === "self_paced"
                ? "Self-Paced Distance"
                : "Live Online Evening")}
          </strong>
          <span className={`text-[11px] mt-0.5 block truncate ${isDark ? "text-white/70" : "text-ink-soft"}`}>
            {course.custom_delivery_text
              ? "Tutor-led interactive schedule"
              : course.attendance_type === "physical_venue" || course.delivery === "classroom"
              ? "On-site face-to-face tuition & lab training"
              : course.delivery === "blended"
              ? "Online theory + workplace practice"
              : course.delivery === "self_paced"
              ? "Flexible online portal + 1-to-1 assessor"
              : "Weekly interactive Zoom lectures"}
          </span>
        </div>

        <div
          className={`p-3.5 rounded-md border shadow-xs ${
            isDark
              ? "bg-white/10 border-white/15 text-white backdrop-blur-xs"
              : "bg-white border-line"
          }`}
        >
          <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDark ? "text-white/60" : "text-ink-soft"}`}>
            Intake & Start
          </span>
          <strong className={`text-xs sm:text-sm font-heading font-bold block leading-tight truncate ${isDark ? "text-white" : "text-navy-900"}`}>
            {course.intake_text || "Rolling Admissions"}
          </strong>
          <span className={`text-[11px] mt-0.5 block truncate ${isDark ? "text-white/70" : "text-ink-soft"}`}>
            {course.intake_text ? "Enrolling Active Cohorts" : "Autumn 2026 Cohorts Enrolling"}
          </span>
        </div>

        <div
          className={`p-3.5 rounded-md border shadow-xs ${
            isDark
              ? "bg-white/10 border-white/15 text-white backdrop-blur-xs"
              : "bg-white border-line"
          }`}
        >
          <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDark ? "text-white/60" : "text-ink-soft"}`}>
            Assessment Model
          </span>
          <strong className={`text-xs sm:text-sm font-heading font-bold block leading-tight truncate ${isDark ? "text-white" : "text-navy-900"}`}>
            {course.assessment_model_text || "100% Portfolio Based"}
          </strong>
          <span className={`text-[11px] mt-0.5 block truncate ${isDark ? "text-white/70" : "text-ink-soft"}`}>
            {course.assessment_model_text ? "Coursework & Tutor Review" : "No formal written exams"}
          </span>
        </div>

        <div
          className={`p-3.5 rounded-md border shadow-xs ${
            isDark
              ? "bg-white/10 border-white/15 text-white backdrop-blur-xs"
              : "bg-white border-line"
          }`}
        >
          <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDark ? "text-white/60" : "text-ink-soft"}`}>
            Dedicated Support
          </span>
          <strong className={`text-xs sm:text-sm font-heading font-bold block leading-tight truncate ${isDark ? "text-white" : "text-navy-900"}`}>
            {course.support_model_text || "Named British Assessor"}
          </strong>
          <span className={`text-[11px] mt-0.5 block truncate ${isDark ? "text-white/70" : "text-ink-soft"}`}>
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
                {course.attendance_type === "physical_venue"
                  ? "Campus Training & Assessment Venues:"
                  : "Practical Training & Assessment Locations:"}
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
