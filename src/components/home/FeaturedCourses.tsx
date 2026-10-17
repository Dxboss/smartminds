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
import { resolveSectionBg, SectionBgColor } from "@/components/ui/sectionBg";

export interface FeaturedCoursesProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: SectionBgColor;
  columns?: 2 | 3 | 4;
  courses?: Course[];
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
  buttonText = "Browse complete qualification catalogue",
  buttonLink = "/courses",
  bgColor = "white",
  columns = 3,
  courses: propCourses,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { isDark } = resolveSectionBg(bgColor, "white");

  const effectiveCourses = propCourses && propCourses.length > 0 ? propCourses : courses;

  const filteredCourses = useMemo(() => {
    const published = effectiveCourses.filter((c) => c.published);
    if (selectedCategory === "all") return published.slice(0, 6);

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

          {/* Institutional Trust Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft bg-paper px-3 py-2 rounded-sm border border-line self-start lg:self-end">
            <Icon name="shield-check" size={16} className="text-navy-900 flex-shrink-0" />
            <span>Ofqual-Regulated &amp; UK Accredited</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none text-xs sm:text-sm border-b border-line/60">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-sm whitespace-nowrap font-semibold border transition-all ${
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

        {/* Visual Course Cards Grid */}
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

        {/* Bottom Banner */}
        <div className="mt-12 pt-6 border-t border-line/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-soft">
            <Icon name="check" size={16} className="text-emerald-600 flex-shrink-0" />
            <span>
              All qualifications feature live interactive evening Zoom seminars, dedicated assessor support, and direct college monthly payment plans.
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
