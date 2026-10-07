import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/content/types";
import { calculatePricing } from "@/content/pricing";
import { globalSettings } from "@/content/globals";
import { defaultPlan6Months } from "@/content/plans";
import { Icon } from "@/components/ui/Icon";

export interface CourseCardProps {
  course: Course;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

/**
 * CourseCover: Clean, breathable visual header.
 * Uses real photography when available, or a refined bespoke British academy
 * monograph cover when awaiting photography to avoid duplicate stock photos.
 */
const CourseCover: React.FC<{ course: Course; priority?: boolean }> = ({
  course,
  priority = false,
}) => {
  // Unique real photos for specific courses to prevent duplicate stock photos
  const hasDedicatedPhoto =
    course.id === "course-adult-care" ||
    course.id === "course-aet" ||
    course.id === "course-leadership-care";

  if (hasDedicatedPhoto && course.image) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper border-b border-line">
        <Image
          src={course.image}
          alt={course.imageAlt || course.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle Bottom Scrim for depth */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Discreet Live Online Indicator */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-navy-900/90 text-white backdrop-blur-md shadow-sm border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live Online
          </span>
        </div>
      </div>
    );
  }

  // Bespoke Monograph Academy Banners for categories awaiting real photography
  const getMonographTheme = (category: string) => {
    switch (category) {
      case "Childcare & Early Years":
        return {
          icon: "book-open" as const,
          faculty: "Early Years Faculty",
          tag: "EYE Licence to Practise",
          accentColor: "text-gold-300",
        };
      case "Business & Administration":
        return {
          icon: "sparkles" as const,
          faculty: "Business & Management",
          tag: "RQF Accredited",
          accentColor: "text-gold-300",
        };
      case "Private Tutoring":
        return {
          icon: "graduation-cap" as const,
          faculty: "1-on-1 Academic Tutoring",
          tag: "KS3 & GCSE Maths & English",
          accentColor: "text-gold-300",
        };
      case "Continuing Professional Development":
      default:
        return {
          icon: "shield-check" as const,
          faculty: "Healthcare & Social Care",
          tag: "Certified Compliance Training",
          accentColor: "text-gold-300",
        };
    }
  };

  const theme = getMonographTheme(course.category);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy-900 border-b border-line p-5 sm:p-6 flex flex-col justify-between text-white transition-all group-hover:bg-[#282578]">
      {/* Subtle geometric architectural linework */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(217, 184, 74, 0.35) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Top Header inside Monograph */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-gold-300 font-semibold">
          {theme.faculty}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-white/10 text-white border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Live Online
        </span>
      </div>

      {/* Center Motif with Icon & Short Title */}
      <div className="relative z-10 flex items-center gap-3.5 my-auto py-2">
        <div className="w-11 h-11 rounded-sm bg-white/10 border border-gold-500/30 flex items-center justify-center flex-shrink-0 group-hover:border-gold-500 transition-colors">
          <Icon name={theme.icon} size={22} className="text-gold-500" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-white/70 block uppercase tracking-wider font-mono">
            {theme.tag}
          </span>
          <strong className="font-heading font-bold text-lg sm:text-xl text-white leading-tight block truncate">
            {course.title.replace(/\s*\([^)]*\)/g, "")}
          </strong>
        </div>
      </div>

      {/* Bottom Rule */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-white/60 font-mono pt-2 border-t border-white/10">
        <span>Smartminds College</span>
        {course.awarding_body && (
          <span className="text-gold-300 font-semibold">
            {course.awarding_body}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * CourseCard: Spacious, breathable, human-designed course card.
 * Replaces choked stacked boxes with an open, elegant editorial structure.
 */
export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  headingLevel = "h3",
  priority = false,
}) => {
  const lowestLevel = course.levels[0];
  const primaryPlan = lowestLevel?.plans[0] || defaultPlan6Months;
  const pricing = lowestLevel
    ? calculatePricing(lowestLevel, primaryPlan, globalSettings)
    : null;

  const levelLabels = course.levels.map((l) => l.level_label);
  const levelRange =
    levelLabels.length > 1
      ? `${levelLabels[0]} – ${levelLabels[levelLabels.length - 1]}`
      : levelLabels[0] || "Certificate";

  const HeadingTag = headingLevel;

  return (
    <article className="group bg-white rounded-lg border border-line shadow-subtle hover:border-navy-900/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* 1. Spacious Visual Header (No heavy stickers covering faces) */}
      <CourseCover course={course} priority={priority} />

      {/* 2. Open, Breathing Card Body */}
      <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between space-y-6">
        <div className="space-y-3">
          {/* Eyebrow: Category & Awarding Body */}
          <div className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wider uppercase text-gold-700">
            <span>{course.category}</span>
            {course.awarding_body && (
              <span className="text-ink-soft/70 font-mono text-[11px] lowercase tracking-normal">
                Awarded by{" "}
                <strong className="text-navy-900 uppercase font-bold">
                  {course.awarding_body}
                </strong>
              </span>
            )}
          </div>

          {/* Course Title */}
          <HeadingTag className="font-heading text-2xl font-bold text-navy-900 group-hover:text-navy-700 transition-colors leading-tight line-clamp-2">
            <Link
              href={`/courses/${course.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-sm"
            >
              {course.title}
            </Link>
          </HeadingTag>

          {/* Outcome Summary */}
          <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">
            {course.summary}
          </p>

          {/* Airy Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-navy-900 font-semibold bg-paper px-2.5 py-1 rounded-sm border border-line">
              <Icon
                name="graduation-cap"
                size={14}
                className="text-navy-900 flex-shrink-0"
              />
              {levelRange}
            </span>

            {lowestLevel?.duration_text && (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft bg-paper px-2.5 py-1 rounded-sm border border-line">
                <Icon
                  name="clock"
                  size={13}
                  className="text-ink-soft flex-shrink-0"
                />
                {lowestLevel.duration_text}
              </span>
            )}

            {(course.funding === "funded" || course.funding === "both") && (
              <span className="inline-flex items-center gap-1 text-xs text-gold-700 font-semibold bg-gold-300/20 px-2.5 py-1 rounded-sm border border-gold-500/30">
                Funded Route
              </span>
            )}
          </div>
        </div>

        {/* 3. Open, De-Choked Footer: Price on Left, Action on Right (No nested gray boxes) */}
        <div className="pt-5 border-t border-line flex items-end justify-between gap-4">
          {/* Price Block */}
          {course.funding === "funded" ? (
            <div>
              <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                Tuition Fee
              </span>
              <strong className="font-heading font-bold text-xl text-navy-900 block leading-tight">
                100% Subsidised
              </strong>
              <span className="text-xs text-gold-700 font-semibold block mt-0.5">
                Funding eligibility applies
              </span>
            </div>
          ) : pricing ? (
            <div>
              <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                From (Pay in Full)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-bold text-2xl text-navy-900 leading-tight">
                  £{pricing.fullPayPrice}
                </span>
                {pricing.saving > 0 && (
                  <span className="text-xs line-through text-ink-soft">
                    £{pricing.total}
                  </span>
                )}
              </div>
              <span className="text-xs text-ink-soft block mt-0.5 font-medium">
                Or spread{" "}
                <strong className="text-navy-700 font-bold">
                  £{pricing.monthly}/mo
                </strong>
              </span>
            </div>
          ) : null}

          {/* Crisp Action Button */}
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-sm bg-navy-900 text-white hover:bg-navy-700 active:bg-navy-900 font-heading font-bold text-sm tracking-wide transition-all shadow-subtle group-hover:bg-navy-700 group-hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-500 flex-shrink-0"
          >
            <span>Details</span>
            <Icon
              name="arrow-right"
              size={15}
              className="ml-1.5 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </article>
  );
};
