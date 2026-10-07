import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/content/types";
import { calculatePricing } from "@/content/pricing";
import { globalSettings } from "@/content/globals";
import { defaultPlan6Months } from "@/content/plans";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";

export interface CourseCardProps {
  course: Course;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

/**
 * CourseCard: Editorial, non-AI-looking card design with integrated photography,
 * scannable qualification badges, and real-time calculated pricing per PRD 10.3.
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
      {/* 1. Restrained Editorial Image Header (2:1 Widescreen Ratio) */}
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-paper border-b border-line">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.imageAlt || course.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          /* Editorial Branded Fallback Header */
          <div className="absolute inset-0 bg-navy-900 flex items-center justify-between p-6">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-gold-300 uppercase tracking-widest block">
                Smartminds College
              </span>
              <strong className="font-heading text-lg text-white block">
                {course.category}
              </strong>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Icon name="star" size={20} className="text-gold-500" />
            </div>
          </div>
        )}

        {/* Subtle Top & Bottom Legibility Scrim */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-black/20 pointer-events-none"
          aria-hidden="true"
        />

        {/* Floating Pills Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-white/95 text-navy-900 shadow-sm backdrop-blur-sm">
            {course.category}
          </span>

          <div className="flex items-center gap-1.5">
            {course.funding === "funded" || course.funding === "both" ? (
              <Tag variant="gold" className="text-xs shadow-sm">
                Funded
              </Tag>
            ) : null}
            <Tag variant="live" className="text-xs shadow-sm">
              Live Online
            </Tag>
          </div>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Course Title */}
          <HeadingTag className="font-heading text-xl sm:text-2xl font-bold text-navy-900 group-hover:text-navy-700 transition-colors leading-tight mb-2 line-clamp-2">
            <Link
              href={`/courses/${course.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-sm"
            >
              {course.title}
            </Link>
          </HeadingTag>

          {/* Short Outcome Summary */}
          <p className="text-sm text-ink-soft leading-relaxed line-clamp-2 mb-4">
            {course.summary}
          </p>

          {/* Scannable Metadata Strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-soft mb-5 pb-4 border-b border-line/60">
            <div className="flex items-center gap-1.5">
              <Icon
                name="graduation-cap"
                size={14}
                className="text-navy-900 flex-shrink-0"
              />
              <span className="font-semibold text-navy-900">{levelRange}</span>
            </div>

            {lowestLevel?.duration_text && (
              <div className="flex items-center gap-1.5">
                <Icon
                  name="clock"
                  size={13}
                  className="text-ink-soft flex-shrink-0"
                />
                <span>{lowestLevel.duration_text}</span>
              </div>
            )}

            {course.awarding_body && (
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <span className="text-ink-soft/80">Award:</span>
                <strong className="text-navy-900">{course.awarding_body}</strong>
              </div>
            )}
          </div>
        </div>

        {/* 3. Card Footer Block: Pricing & Primary Action */}
        <div className="space-y-3.5">
          {/* Pricing Snippet */}
          {course.funding === "funded" ? (
            <div className="bg-paper rounded-sm border border-line p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                  Tuition Route
                </span>
                <strong className="font-heading font-bold text-base text-navy-900">
                  Government Funded
                </strong>
              </div>
              <span className="text-xs font-semibold text-gold-700 bg-gold-500/10 px-2 py-0.5 rounded-sm border border-gold-500/30">
                100% Subsidised
              </span>
            </div>
          ) : pricing ? (
            <div className="bg-paper rounded-sm border border-line p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                  From (Pay in Full)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-bold text-lg text-navy-900">
                    £{pricing.fullPayPrice}
                  </span>
                  {pricing.saving > 0 && (
                    <span className="text-xs line-through text-ink-soft">
                      £{pricing.total}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                  Or spread
                </span>
                <span className="font-heading font-bold text-sm text-navy-700">
                  £{pricing.monthly}/mo
                </span>
              </div>
            </div>
          ) : null}

          {/* Action Link Button */}
          <Link
            href={`/courses/${course.slug}`}
            className="w-full inline-flex items-center justify-center min-h-[44px] px-4 rounded-sm bg-navy-900 text-white hover:bg-navy-700 active:bg-navy-900 font-heading font-bold text-sm transition-colors shadow-subtle group-hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-500"
          >
            <span>View course & pricing</span>
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
