"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { courses } from "@/content";
import { CourseCard } from "@/components/course/CourseCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { calculatePricing, formatCurrency } from "@/content/pricing";
import { globalSettings } from "@/content/globals";
import { defaultPlan6Months } from "@/content/plans";
import { Course } from "@/content/types";

export interface FeaturedCoursesProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: "white" | "paper" | "navy" | "cream";
  columns?: 2 | 3 | 4;
}

const CATEGORY_TABS = [
  { id: "all", label: "All Qualifications" },
  { id: "health", label: "Health & Social Care" },
  { id: "teaching", label: "Teacher Training & AET" },
  { id: "early-years", label: "Early Years & Childcare" },
  { id: "business", label: "Business & Management" },
];

export const FeaturedCourses: React.FC<FeaturedCoursesProps> = ({
  headline = "Popular live-taught qualifications",
  subheadline = "Explore our most requested British diplomas. Every programme features live tutor-led sessions, continuous mentor support, and flexible instalment schedules.",
  buttonText = "View all courses",
  buttonLink = "/courses",
  bgColor = "white",
  columns = 3,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const isDark = bgColor === "navy";

  const filteredCourses = useMemo(() => {
    const published = courses.filter((c) => c.published);
    if (selectedCategory === "all") return published.slice(0, 8);

    return published.filter((c) => {
      const cat = c.category.toLowerCase();
      const title = c.title.toLowerCase();
      if (selectedCategory === "health") {
        return cat.includes("health") || cat.includes("care");
      }
      if (selectedCategory === "teaching") {
        return cat.includes("teach") || cat.includes("educat") || title.includes("aet") || title.includes("cava");
      }
      if (selectedCategory === "early-years") {
        return cat.includes("child") || cat.includes("early") || title.includes("young people");
      }
      if (selectedCategory === "business") {
        return cat.includes("business") || cat.includes("admin") || cat.includes("management");
      }
      return true;
    });
  }, [selectedCategory]);

  const colClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <Section variant={bgColor} className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <Eyebrow tone={isDark ? "gold" : "navy"} className="mb-2">
              Official College Prospectus
            </Eyebrow>
            <Heading level="h2" className={`mb-2 ${isDark ? "text-white" : "text-navy-900"}`}>
              {headline}
            </Heading>
            <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${isDark ? "text-paper/85" : "text-ink-soft"}`}>
              {subheadline}
            </p>
          </div>

          {/* View Mode Toggle: Table (Prospectus) vs Cards */}
          <div className="flex items-center gap-2 self-start lg:self-end">
            <span className={`text-xs font-semibold mr-1 hidden sm:inline ${isDark ? "text-paper/70" : "text-ink-soft"}`}>
              Display format:
            </span>
            <div className={`p-1 rounded-sm border flex items-center gap-1 ${
              isDark ? "bg-white/5 border-white/15" : "bg-paper border-line"
            }`}>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-bold transition-colors ${
                  viewMode === "table"
                    ? isDark
                      ? "bg-gold-500 text-navy-900 shadow-xs"
                      : "bg-navy-900 text-white shadow-xs"
                    : isDark
                    ? "text-paper/80 hover:text-white"
                    : "text-ink-soft hover:text-navy-900"
                }`}
                aria-label="Switch to Prospectus Table view"
              >
                <Icon name="book-open" size={14} />
                <span>Prospectus Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-bold transition-colors ${
                  viewMode === "grid"
                    ? isDark
                      ? "bg-gold-500 text-navy-900 shadow-xs"
                      : "bg-navy-900 text-white shadow-xs"
                    : isDark
                    ? "text-paper/80 hover:text-white"
                    : "text-ink-soft hover:text-navy-900"
                }`}
                aria-label="Switch to Course Cards view"
              >
                <Icon name="layers" size={14} />
                <span>Course Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none text-xs sm:text-sm">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-sm whitespace-nowrap font-semibold border transition-all ${
                  isActive
                    ? isDark
                      ? "bg-gold-500 text-navy-900 border-gold-400 shadow-xs font-bold"
                      : "bg-navy-900 text-white border-navy-900 shadow-xs font-bold"
                    : isDark
                    ? "bg-white/5 text-paper/80 border-white/10 hover:border-white/30"
                    : "bg-white text-ink-soft border-line hover:border-navy-900/40 hover:text-navy-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* VIEW 1: British FE Prospectus Table */}
        {viewMode === "table" ? (
          <div className="space-y-4">
            {/* Desktop / Tablet Matrix Table */}
            <div className={`hidden md:block overflow-hidden rounded-md border ${
              isDark ? "bg-white/5 border-white/15" : "bg-white border-line shadow-subtle"
            }`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                    isDark ? "bg-navy-950 text-paper/70 border-white/10" : "bg-paper text-navy-900 border-line"
                  }`}>
                    <th scope="col" className="py-3.5 px-5">Qualification &amp; Reference</th>
                    <th scope="col" className="py-3.5 px-4">Level &amp; Awarding Body</th>
                    <th scope="col" className="py-3.5 px-4">Live Teaching Format</th>
                    <th scope="col" className="py-3.5 px-4">Assessment Format</th>
                    <th scope="col" className="py-3.5 px-4">Tuition &amp; 0% Instalments</th>
                    <th scope="col" className="py-3.5 px-5 text-right">Prospectus Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${isDark ? "divide-white/10" : "divide-line"}`}>
                  {filteredCourses.map((course) => {
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

                    return (
                      <tr
                        key={course.id}
                        className={`transition-colors ${
                          isDark ? "hover:bg-white/5" : "hover:bg-paper/60"
                        }`}
                      >
                        {/* Qualification Title & QN */}
                        <td className="py-4 px-5 align-top max-w-xs">
                          <Link
                            href={`/courses/${course.slug}`}
                            className={`font-heading font-bold text-base block hover:underline leading-snug ${
                              isDark ? "text-white hover:text-gold-300" : "text-navy-900 hover:text-navy-700"
                            }`}
                          >
                            {course.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[11px] text-ink-soft">
                              {course.awarding_reference
                                ? `QN: ${course.awarding_reference}`
                                : "Regulated RQF"}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-semibold ${
                              isDark ? "bg-white/10 text-gold-300" : "bg-navy-900/5 text-navy-900"
                            }`}>
                              {course.category}
                            </span>
                          </div>
                        </td>

                        {/* Level & Awarding Body */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <span className={`font-bold block ${isDark ? "text-white" : "text-navy-900"}`}>
                            {levelRange}
                          </span>
                          <span className="text-xs text-ink-soft block mt-0.5">
                            {course.awarding_body ? `Awarded by ${course.awarding_body}` : "Regulated Body"}
                          </span>
                        </td>

                        {/* Live Teaching Format */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Live Evening Classes</span>
                          </div>
                          <span className="text-xs text-ink-soft block mt-0.5">
                            Weekly Zoom + 24/7 Replays
                          </span>
                        </td>

                        {/* Assessment Format */}
                        <td className="py-4 px-4 align-top text-xs text-ink-soft">
                          <span className={`font-semibold block ${isDark ? "text-paper" : "text-ink"}`}>
                            100% Coursework &amp; Portfolio
                          </span>
                          <span className="text-[11px] block mt-0.5">
                            No timed closed-book exams
                          </span>
                        </td>

                        {/* Tuition & 0% Instalments */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          {course.funding === "funded" ? (
                            <div>
                              <span className="text-xs font-bold text-navy-900 bg-gold-500/20 px-2 py-0.5 rounded-sm block w-fit">
                                100% Subsidised
                              </span>
                              <span className="text-[11px] text-ink-soft block mt-0.5">
                                Government AEB funding route
                              </span>
                            </div>
                          ) : pricing ? (
                            <div>
                              <strong className={`font-heading font-bold text-base ${isDark ? "text-white" : "text-navy-900"}`}>
                                {formatCurrency(pricing.fullPayPrice)}
                              </strong>
                              {pricing.months > 1 && (
                                <span className="text-xs text-ink-soft block mt-0.5">
                                  Or spread from{" "}
                                  <strong className={isDark ? "text-gold-300" : "text-navy-700"}>
                                    {formatCurrency(pricing.monthly)}/mo
                                  </strong>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-ink-soft">Enquire for fees</span>
                          )}
                        </td>

                        {/* Action CTA */}
                        <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                          <Link
                            href={`/courses/${course.slug}`}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors min-h-[38px] ${
                              isDark
                                ? "bg-gold-500 text-navy-900 hover:bg-gold-300"
                                : "bg-navy-900 text-white hover:bg-navy-700 shadow-xs"
                            }`}
                          >
                            <span>Syllabus &amp; Fees</span>
                            <Icon name="arrow-right" size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Summary Cards for 360px & 390px viewports */}
            <div className="md:hidden space-y-3">
              {filteredCourses.map((course) => {
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

                return (
                  <div
                    key={course.id}
                    className={`rounded-md border p-4 space-y-3 ${
                      isDark ? "bg-white/5 border-white/15 text-white" : "bg-white border-line shadow-xs text-ink"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider block">
                          {course.awarding_reference ? `QN: ${course.awarding_reference}` : course.category}
                        </span>
                        <Link
                          href={`/courses/${course.slug}`}
                          className={`font-heading font-bold text-lg leading-tight block mt-0.5 ${
                            isDark ? "text-white" : "text-navy-900"
                          }`}
                        >
                          {course.title}
                        </Link>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-sm whitespace-nowrap flex-shrink-0 ${
                        isDark ? "bg-white/10 text-gold-300" : "bg-navy-900 text-white"
                      }`}>
                        {levelRange}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-ink-soft py-2 border-y border-line/60">
                      <div>
                        <span className="font-semibold block text-navy-900">Awarding Body:</span>
                        <span>{course.awarding_body || "Ofqual Regulated"}</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-navy-900">Delivery:</span>
                        <span>Live Weekly Zoom</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-navy-900">Assessment:</span>
                        <span>100% Coursework (No Exams)</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-navy-900">0% Instalments:</span>
                        <span>
                          {pricing ? `From ${formatCurrency(pricing.monthly)}/mo` : "Funded route"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div>
                        {pricing ? (
                          <div className="leading-none">
                            <span className="font-heading font-bold text-lg text-navy-900">
                              {formatCurrency(pricing.fullPayPrice)}
                            </span>
                            <span className="text-[10px] text-ink-soft block mt-0.5">Pay in full fee</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-navy-900">Free Funding Route</span>
                        )}
                      </div>

                      <Link
                        href={`/courses/${course.slug}`}
                        className={`inline-flex items-center justify-center min-h-[44px] px-4 rounded-sm text-xs font-bold uppercase tracking-wider ${
                          isDark
                            ? "bg-gold-500 text-navy-900"
                            : "bg-navy-900 text-white shadow-xs"
                        }`}
                      >
                        <span>View Syllabus &amp; Fees &rarr;</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VIEW 2: Visual Course Cards Grid */
          <div className={`grid ${colClass} gap-6`}>
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                headingLevel="h3"
                priority={index < 3}
              />
            ))}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-10 pt-6 border-t border-line/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-soft">
            <Icon name="shield-check" size={16} className="text-navy-900 flex-shrink-0" />
            <span>
              All qualifications listed are regulated by Ofqual or accredited through established UK professional awarding bodies.
            </span>
          </div>

          <Link
            href={buttonLink || "/courses"}
            className={`inline-flex items-center justify-center min-h-[44px] px-6 rounded-sm border font-heading font-bold text-sm tracking-wide transition-colors whitespace-nowrap flex-shrink-0 ${
              isDark
                ? "border-gold-300 text-gold-300 hover:bg-gold-500 hover:text-navy-900"
                : "border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
            }`}
          >
            {buttonText || "Browse complete qualification catalogue"} &rarr;
          </Link>
        </div>
      </Container>
    </Section>
  );
};
