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
import { OrangeWaveAccent } from "@/components/ui/OrangeWaveAccent";

export interface FeaturedCoursesProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: SectionBgColor;
  columns?: 2 | 3 | 4;
  rows?: 1 | 2 | 3 | 4 | "all";
  courseLimit?: number;
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
  headline = "Popular Courses",
  subheadline = "Explore our most requested British diplomas. Every programme features live tutor-led sessions, continuous mentor support, and flexible instalment schedules.",
  buttonText = "Browse complete qualification catalogue",
  buttonLink = "/courses",
  bgColor = "white",
  columns = 4,
  rows = 2,
  courseLimit,
  courses: propCourses,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { isDark } = resolveSectionBg(bgColor, "white");

  const effectiveCourses = propCourses && propCourses.length > 0 ? propCourses : courses;

  const effectiveLimit = useMemo(() => {
    if (typeof courseLimit === "number" && courseLimit > 0) {
      return courseLimit;
    }
    if (rows === "all") {
      return undefined;
    }
    const cols = columns || 4;
    const numRows = typeof rows === "number" ? rows : 2;
    return cols * numRows;
  }, [courseLimit, rows, columns]);

  const filteredCourses = useMemo(() => {
    const published = effectiveCourses.filter((c) => c.published);
    let matched = published;
    if (selectedCategory !== "all") {
      matched = published.filter((c) => {
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
    }

    if (effectiveLimit && effectiveLimit > 0) {
      return matched.slice(0, effectiveLimit);
    }
    return matched;
  }, [selectedCategory, effectiveCourses, effectiveLimit]);

  const gridColsClass = useMemo(() => {
    switch (columns) {
      case 2:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
      case 4:
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
    }
  }, [columns]);

  return (
    <Section variant={bgColor} id="popular-courses" className="pt-24 pb-20 border-b border-line scroll-mt-20">
      <Container>
        {/* Section Header: Centered with Orange Wave Accent matching Inspiration */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block relative">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {headline === "Popular Courses" ? (
                <>
                  <span className="text-[#FF5722]">Popular</span>{" "}
                  <span className="text-[#0B4D4E]">Courses</span>
                </>
              ) : (
                <span className="text-[#0B4D4E]">{headline}</span>
              )}
            </h2>
            <div className="flex justify-center mt-2">
              <OrangeWaveAccent width={150} height={20} className="text-[#FF5722]" />
            </div>
          </div>
          <p className="text-base sm:text-lg text-ink-soft mt-3 leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Category Filter Tabs: Responsive horizontal pills (centered when fitting, scrollable from first tab without clipping on tablet/mobile) */}
        <div className="w-full overflow-x-auto pb-4 mb-10 scrollbar-none">
          <div className="flex items-center gap-2.5 min-w-max mx-auto px-4 justify-start sm:justify-center text-xs sm:text-sm">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-5 py-2.5 rounded-full whitespace-nowrap font-bold text-xs sm:text-sm transition-all shadow-xs ${
                    isActive
                      ? "bg-[#0B4D4E] text-white shadow-md font-extrabold"
                      : "bg-white text-ink-soft border border-line hover:border-[#0B4D4E] hover:text-[#0B4D4E]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Course Cards Grid: Responsive Columns (2, 3, 4 on desktop, 2 on tablet, 1 on mobile) */}
        <div className={gridColsClass}>
          {filteredCourses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              headingLevel="h3"
              priority={index < (columns || 4)}
            />
          ))}
        </div>

        {/* Centered View All Button matching Target Image 2 */}
        <div className="text-center mt-12">
          <Link
            href={buttonLink || "/courses"}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-teal-300 text-[#0B4D4E] hover:bg-teal-50 hover:border-teal-500 font-heading font-bold text-sm tracking-wide transition-all shadow-xs"
          >
            <span>View All Courses</span>
            <Icon name="arrow-right" size={15} className="ml-2 text-[#0B4D4E]" />
          </Link>
        </div>
      </Container>
    </Section>
  );
};
