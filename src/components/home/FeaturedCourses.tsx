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
import { resolveSectionBg, SectionBgColor, resolveItemColor } from "@/components/ui/sectionBg";
import { OrangeWaveAccent } from "@/components/ui/OrangeWaveAccent";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";
import {
  resolveTypography,
  resolveSubheadlineTypography,
} from "@/components/ui/typographyUtils";

export interface FeaturedCoursesProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: SectionBgColor;
  columns?: 2 | 3 | 4;
  rows?: 1 | 2 | 3 | 4 | "all";
  courseLimit?: number;
  categoryFilter?: string;
  courses?: Course[];
  headlineFontFamily?: string;
  headlineFontSize?: string;
  headlineFontWeight?: string;
  headlineFontStyle?: string;
  headlineColor?: string;
  headlineTransform?: string;
  headlineAlign?: string;
  subheadlineFontFamily?: string;
  subheadlineFontSize?: string;
  subheadlineFontWeight?: string;
  subheadlineFontStyle?: string;
  subheadlineColor?: string;
  subheadlineAlign?: string;
  isEditor?: boolean;
  selectedElementKey?: string | null;
  selectedElementItemIndex?: number | null;
  onSelectElement?: (
    elementKey:
      | "headline"
      | "subheadline"
      | "badge"
      | "button"
      | "secondaryButton"
      | "image"
      | "item"
      | "bg",
    itemIndex?: number
  ) => void;
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
  categoryFilter,
  courses: propCourses,
  headlineFontFamily,
  headlineFontSize,
  headlineFontWeight,
  headlineFontStyle,
  headlineColor,
  headlineTransform,
  headlineAlign,
  subheadlineFontFamily,
  subheadlineFontSize,
  subheadlineFontWeight,
  subheadlineFontStyle,
  subheadlineColor,
  subheadlineAlign,
  isEditor,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { isDark } = resolveSectionBg(bgColor, "white");

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily as any,
    fontSize: headlineFontSize as any,
    fontWeight: headlineFontWeight as any,
    fontStyle: headlineFontStyle as any,
    color: headlineColor,
    align: headlineAlign as any,
    transform: headlineTransform as any,
    isDark,
    defaultFamily: "heading",
    defaultSize: "2xl",
    defaultWeight: "extrabold",
  });

  const { className: subClass, style: subStyle } = resolveSubheadlineTypography({
    fontFamily: subheadlineFontFamily as any,
    fontSize: subheadlineFontSize as any,
    fontWeight: subheadlineFontWeight as any,
    fontStyle: subheadlineFontStyle as any,
    color: subheadlineColor,
    align: subheadlineAlign as any,
    isDark,
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

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

    // 1. If explicit categoryFilter is set from CMS and not "all"
    if (categoryFilter && categoryFilter !== "all") {
      matched = matched.filter((c) => {
        const cat = c.category.toLowerCase();
        const target = categoryFilter.toLowerCase();
        if (target.includes("care") || target.includes("health")) {
          return cat.includes("health") || cat.includes("care");
        }
        if (target.includes("teach") || target.includes("educat")) {
          return cat.includes("teach") || cat.includes("educat") || c.title.toLowerCase().includes("aet");
        }
        if (target.includes("child") || target.includes("early")) {
          return cat.includes("child") || cat.includes("early");
        }
        if (target.includes("cpd")) {
          return c.type === "cpd" || cat.includes("cpd");
        }
        if (target.includes("tutor") || target.includes("exam")) {
          return Boolean(c.is_private_tutoring) || c.type === "tutoring" || cat.includes("tutor");
        }
        return cat.includes(target) || target.includes(cat);
      });
    } else if (selectedCategory !== "all") {
      // 2. Otherwise use the client tab selector if categoryFilter is "all"
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
  }, [categoryFilter, selectedCategory, effectiveCourses, effectiveLimit]);

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

  const isSpecificCategory = Boolean(categoryFilter && categoryFilter !== "all");

  return (
    <Section variant={bgColor} id="popular-courses" className="pt-24 pb-20 border-b border-line scroll-mt-20">
      <Container>
        {/* Section Header: Centered with Orange Wave Accent matching Inspiration */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "headline"}
            label="Courses Headline"
            onClick={() => onSelectElement?.("headline")}
          >
            <div className="inline-block relative">
              <h2 style={hlStyle} className={`${hlClass} tracking-tight leading-tight`}>
                {headline === "Popular Courses" && (!headlineColor || headlineColor === "auto") ? (
                  <>
                    <span className="text-[#FF5722]">Popular</span>{" "}
                    <span className="text-[#0B4D4E]">Courses</span>
                  </>
                ) : (
                  <span>{headline}</span>
                )}
              </h2>
              <div className="flex justify-center mt-2">
                <OrangeWaveAccent width={150} height={20} className="text-[#FF5722]" />
              </div>
            </div>
          </EditableElementWrapper>

          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "subheadline"}
            label="Courses Subtitle"
            onClick={() => onSelectElement?.("subheadline")}
          >
            <p style={subStyle} className={`mt-3 leading-relaxed ${subClass}`}>
              {subheadline}
            </p>
          </EditableElementWrapper>
        </div>

        {/* Category Filter Tabs: Responsive horizontal pills (hidden if already filtered to a specific discipline by CMS) */}
        {!isSpecificCategory && (
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
      )}

        {/* Visual Course Cards Grid: Responsive Columns (2, 3, 4 on desktop, 2 on tablet, 1 on mobile) */}
        <div className={gridColsClass}>
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              headingLevel="h3"
            />
          ))}
        </div>

        {/* Centered View All Button matching Target Image 2 */}
        <div className="text-center mt-12">
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "button"}
            label="Courses Button"
            onClick={() => onSelectElement?.("button")}
            className="inline-block"
          >
            <Link
              href={buttonLink || "/courses"}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-teal-300 text-[#0B4D4E] hover:bg-teal-50 hover:border-teal-500 font-heading font-bold text-sm tracking-wide transition-all shadow-xs"
            >
              <span>{buttonText || "View All Courses"}</span>
              <Icon name="arrow-right" size={15} className="ml-2 text-[#0B4D4E]" />
            </Link>
          </EditableElementWrapper>
        </div>
      </Container>
    </Section>
  );
};
