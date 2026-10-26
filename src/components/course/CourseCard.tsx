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
  if (course.image && course.image.trim().length > 0) {
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
  const isCustomOrData =
    photoSrc.startsWith("data:") ||
    photoSrc.startsWith("http://") ||
    photoSrc.startsWith("https://");

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy-900 border-b border-line">
      <Image
        src={photoSrc}
        alt={course.imageAlt || `${course.title} training at Smartminds Training College`}
        fill
        priority={priority}
        loading={priority ? "eager" : undefined}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        unoptimized={isCustomOrData}
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
  const photoSrc = getCourseImage(course);

  return (
    <article className="group bg-white rounded-2xl border border-line shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-teal-300/80 transition-all duration-300 flex flex-col justify-between overflow-hidden p-3.5 sm:p-4 h-full">
      {/* 1. Framed Image Header matching Image 1 */}
      <div>
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-navy-900/10 mb-3.5">
          <Image
            src={photoSrc}
            alt={course.imageAlt || `${course.title} training at Smartminds Training College`}
            fill
            priority={priority}
            loading={priority ? "eager" : undefined}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Top Pill Badges */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0B4D4E]/90 text-white backdrop-blur-md shadow-xs">
              <Icon name="shield-check" size={12} className="text-gold-300" />
              {course.type === "regulated" ? "Ofqual RQF" : "Accredited"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/95 text-navy-900 backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Online
            </span>
          </div>
        </div>

        {/* 2. Avatar Stack Proof (Image 1 Onlearn style) */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full border border-white bg-[#0B4D4E] text-white text-[8px] font-bold flex items-center justify-center">
                SJ
              </div>
              <div className="w-5 h-5 rounded-full border border-white bg-[#FF5722] text-white text-[8px] font-bold flex items-center justify-center">
                DK
              </div>
              <div className="w-5 h-5 rounded-full border border-white bg-navy-900 text-white text-[8px] font-bold flex items-center justify-center">
                +
              </div>
            </div>
            <span className="text-[11px] font-bold text-ink-soft">
              {(course as any).enrolment_count || 180}+ Students
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
            <Icon name="star" size={12} className="fill-amber-400 text-amber-400" />
            <span>4.9</span>
            <span className="text-ink-soft font-normal">({(course as any).review_count || 48})</span>
          </div>
        </div>

        {/* 3. Course Title & Description with Strict Equal Heights */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#0B4D4E]">
            <span>{course.category} • {levelRange}</span>
          </div>

          <div className="min-h-[3rem] sm:min-h-[3.25rem] flex items-start">
            <HeadingTag className="font-heading text-lg sm:text-xl font-bold text-navy-900 group-hover:text-[#0B4D4E] transition-colors leading-snug line-clamp-2">
              <Link
                href={`/courses/${course.slug}`}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm"
              >
                {course.title}
              </Link>
            </HeadingTag>
          </div>

          <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {course.summary || course.description || "Accredited British qualification with dedicated personal assessor mentoring and live Zoom workshops."}
          </p>
        </div>
      </div>

      {/* 4. Footer: Vibrant Orange Price on Left, Dark Teal Pill Button on Right */}
      <div className="pt-3 mt-3.5 border-t border-line flex items-center justify-between gap-2 min-h-[3.75rem]">
        {/* Price Block */}
        {course.funding === "funded" ? (
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-wider text-ink-soft block font-mono">
              Tuition Fee
            </span>
            <strong className="font-heading font-extrabold text-base sm:text-lg text-emerald-700 block leading-tight">
              100% Subsidised
            </strong>
          </div>
        ) : pricing ? (
          <div className="min-w-0 pr-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#FF5722] leading-none block whitespace-nowrap">
                {course.levels.length > 1 ? "From " : ""}
                {formatCurrency(pricing.sellingPrice)}
              </span>
              {pricing.hasPriceSlash && (
                <span className="line-through text-ink-soft/70 text-xs font-medium whitespace-nowrap">
                  {formatCurrency(pricing.regularPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] leading-tight text-ink-soft flex-wrap">
              {pricing.monthly > 0 && (
                <span className="text-[10px] text-ink-soft/90 font-medium whitespace-nowrap">
                  £{Math.round(pricing.monthly)}/mo (0% APR)
                </span>
              )}
              {pricing.saving > 0 && (
                <span className="text-[10px] text-emerald-700 font-bold whitespace-nowrap bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200" title={`Save ${formatCurrency(pricing.saving)} when paying in full`}>
                  {formatCurrency(pricing.fullPayPrice)} upfront
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Action Link: Dark teal rounded-full pill from Image 1 */}
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center justify-center h-9 px-3 sm:px-3.5 rounded-full bg-[#0B4D4E] hover:bg-[#073637] text-white font-heading font-bold text-xs tracking-wide transition-all shadow-xs group-hover:scale-105 flex-shrink-0 whitespace-nowrap"
        >
          <span>Enrol Now</span>
          <Icon
            name="arrow-right"
            size={12}
            className="ml-1 group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>
    </article>
  );
};
