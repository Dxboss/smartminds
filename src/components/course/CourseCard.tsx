import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/content/types";
import { calculatePricing, formatCurrency } from "@/content/pricing";
import { globalSettings } from "@/content/globals";
import { defaultPlan6Months } from "@/content/plans";
import { Icon } from "@/components/ui/Icon";

export interface CourseCardProps {
  course: Course;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

/**
 * CourseCover: Consistent visual header for all cards (PRD 7.4 & 10.2).
 * Every card uses the exact same aspect-[16/9] ratio.
 * When a dedicated photo exists, it is displayed.
 * Where there is no photo, all cards receive the exact same neutral treatment.
 */
const CourseCover: React.FC<{ course: Course; priority?: boolean }> = ({
  course,
  priority = false,
}) => {
  const hasDedicatedPhoto =
    Boolean(course.image) &&
    (course.id === "course-adult-care" ||
      course.id === "course-aet" ||
      course.id === "course-leadership-care");

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

  // PRD Item 2: Consistent neutral treatment across all cards lacking photography
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper border-b border-line p-5 sm:p-6 flex flex-col justify-between text-navy-900 transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft font-semibold">
          {course.category}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-white text-navy-900 border border-line">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live Online
        </span>
      </div>

      {/* Center Motif with Uniform Neutral Icon */}
      <div className="flex items-center gap-3.5 my-auto py-2">
        <div className="w-11 h-11 rounded-sm bg-white border border-line flex items-center justify-center flex-shrink-0 text-navy-900 shadow-sm group-hover:border-navy-900/30 transition-colors">
          <Icon name="graduation-cap" size={22} className="text-navy-900" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-mono text-ink-soft block uppercase tracking-wider">
            Smartminds College
          </span>
          <strong className="font-heading font-bold text-lg text-navy-900 leading-tight block truncate">
            {course.awarding_body ? `Awarded by ${course.awarding_body}` : "Regulated Qualification"}
          </strong>
        </div>
      </div>

      {/* Bottom Rule */}
      <div className="flex items-center justify-between text-[11px] text-ink-soft font-mono pt-2 border-t border-line">
        <span>Curriculum Delivery</span>
        <span className="text-navy-900 font-semibold font-sans">
          {course.type === "regulated" ? "RQF Regulated" : "CPD Accredited"}
        </span>
      </div>
    </div>
  );
};

/**
 * CourseCard: Spacious, breathable, human-designed course card.
 * PRD 7.4 & 10.2:
 * - Titles wrap naturally instead of truncating (no line-clamp-2).
 * - Format all prices to two decimals with thousands separators (£445.50, £1,305.00).
 * - Hide instalment line when months = 1.
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
      {/* 1. Spacious Visual Header (Consistent aspect-[16/9] on all cards) */}
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

          {/* Course Title: Wraps naturally instead of truncating (PRD Item 2) */}
          <HeadingTag className="font-heading text-2xl font-bold text-navy-900 group-hover:text-navy-700 transition-colors leading-tight">
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

        {/* 3. Open Footer: Price on Left, Action on Right */}
        <div className="pt-5 border-t border-line flex items-end justify-between gap-4">
          {/* Price Block (Formatted to two decimal places per PRD Item 1) */}
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
                  {formatCurrency(pricing.fullPayPrice)}
                </span>
                {pricing.saving > 0 && (
                  <span className="text-xs line-through text-ink-soft">
                    {formatCurrency(pricing.total)}
                  </span>
                )}
              </div>
              {/* Hide instalment line when months = 1 (PRD Item 1) */}
              {pricing.months > 1 && (
                <span className="text-xs text-ink-soft block mt-0.5 font-medium">
                  Or spread{" "}
                  <strong className="text-navy-700 font-bold">
                    {formatCurrency(pricing.monthly)}/mo
                  </strong>
                </span>
              )}
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
