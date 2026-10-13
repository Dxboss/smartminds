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
 * Maps each course to an authentic British FE college photograph.
 */
const getCourseImage = (course: Course): string => {
  if (course.image && course.image.startsWith("/images/")) {
    return course.image;
  }
  const id = course.id.toLowerCase();
  const cat = course.category.toLowerCase();

  if (cat.includes("child") || id.includes("child") || id.includes("cypw") || id.includes("early")) {
    return "/images/early-years-training.jpg";
  }
  if (cat.includes("teaching") || id.includes("aet") || id.includes("tutor") || id.includes("education")) {
    return "/images/teacher-training.jpg";
  }
  if (id.includes("cava") || id.includes("safeguard") || id.includes("iqa")) {
    return "/images/tutor-teaching.jpg";
  }
  if (id.includes("certificate") || id.includes("residential")) {
    return "/images/certificate-moment.jpg";
  }
  return "/images/adult-care-training.jpg";
};

/**
 * CourseCover: Authentic British Further Education prospectus visual header.
 * Uses high-resolution contextual educational photography with institutional badges.
 */
const CourseCover: React.FC<{ course: Course; priority?: boolean }> = ({
  course,
  priority = false,
}) => {
  const photoSrc = getCourseImage(course);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy-900 border-b border-line">
      <Image
        src={photoSrc}
        alt={course.imageAlt || `${course.title} training at Smartminds Training College`}
        fill
        priority={priority}
        loading={priority ? "eager" : undefined}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      {/* Subtle depth scrim */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Badges */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-navy-900/90 text-gold-300 backdrop-blur-md shadow-sm border border-gold-500/30">
          <Icon name="shield-check" size={13} className="text-gold-300" />
          {course.type === "regulated" ? "Ofqual RQF" : "CPD Accredited"}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-white/95 text-navy-900 backdrop-blur-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live Interactive Seminars
        </span>
      </div>

      {/* Bottom Qualification Number / Awarding Body Strip */}
      <div className="absolute bottom-2.5 inset-x-3 pointer-events-none flex items-center justify-between text-[11px] text-white/95">
        <span className="font-mono text-white/80 text-[10px] uppercase tracking-wider">
          {course.awarding_reference ? `QN: ${course.awarding_reference}` : "British Regulated"}
        </span>
        {course.awarding_body && (
          <span className="font-semibold text-white text-[11px] bg-black/30 px-2 py-0.5 rounded-sm backdrop-blur-sm">
            {course.awarding_body}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * CourseCard: Spacious, editorial, human-designed course card.
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
    <article className="group bg-white rounded-md border border-line shadow-subtle hover:border-navy-900/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* 1. Authentic Visual Header */}
      <CourseCover course={course} priority={priority} />

      {/* 2. Card Body */}
      <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between space-y-6">
        <div className="space-y-3">
          {/* Eyebrow: Category & Faculty */}
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

          {/* Course Title: Wraps naturally with no truncation */}
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

          {/* Metadata Chips */}
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
                Funded Route Available
              </span>
            )}
          </div>
        </div>

        {/* 3. Footer: Price on Left, Action on Right */}
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
                  {formatCurrency(pricing.fullPayPrice)}
                </span>
                {pricing.saving > 0 && (
                  <span className="text-xs line-through text-ink-soft">
                    {formatCurrency(pricing.total)}
                  </span>
                )}
              </div>
              {pricing.months > 1 && (
                <span className="text-xs text-ink-soft block mt-0.5 font-medium">
                  {pricing.deposit > 0 ? (
                    <>
                      <strong className="text-navy-900 font-semibold">
                        {formatCurrency(pricing.deposit)}
                      </strong>{" "}
                      dep +{" "}
                      <strong className="text-navy-700 font-bold">
                        {formatCurrency(pricing.monthly)}/mo
                      </strong>
                    </>
                  ) : (
                    <>
                      Or spread{" "}
                      <strong className="text-navy-700 font-bold">
                        {formatCurrency(pricing.monthly)}/mo
                      </strong>
                    </>
                  )}
                </span>
              )}
            </div>
          ) : null}

          {/* Action Button: Human Education Copy */}
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center justify-center min-h-[44px] px-4 sm:px-5 rounded-sm bg-navy-900 text-white hover:bg-navy-700 active:bg-navy-900 font-heading font-bold text-sm tracking-wide transition-all shadow-subtle group-hover:bg-navy-700 group-hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-500 flex-shrink-0"
          >
            <span>View Syllabus & Fees</span>
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
