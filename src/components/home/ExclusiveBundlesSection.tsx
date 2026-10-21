"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { OrangeWaveAccent } from "@/components/ui/OrangeWaveAccent";
import { BuilderSectionItem } from "@/lib/repositories/seedData";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";
import {
  resolveTypography,
  resolveSubheadlineTypography,
  type FontFamilyChoice,
  type FontSizeChoice,
  type FontWeightChoice,
  type FontStyleChoice,
  type FontColorChoice,
} from "@/components/ui/typographyUtils";
import { resolveSectionBg, resolveItemColor } from "@/components/ui/sectionBg";

export interface BundleItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  includedCourses: string[];
  duration: string;
  price: string;
  originalPrice: string;
  monthly: string;
  saveAmount: string;
  enrolLink: string;
}

const DEFAULT_BUNDLES: BundleItem[] = [
  {
    id: "bundle-care",
    title: "Healthcare Leadership Pathway",
    subtitle: "Lead Adult Care Worker (Level 3) + Leadership & Management (Level 5)",
    tag: "Highest Career Progression",
    image: "/images/adult-care-training.jpg",
    includedCourses: [
      "Level 3 Diploma in Adult Care (TQUK RQF)",
      "Level 5 Diploma in Leadership for Health & Social Care",
      "Dedicated 1-on-1 Senior Care Assessor",
      "Full CQC Registered Manager Exam Prep",
    ],
    duration: "12 – 18 Months",
    price: "£1,890.00",
    originalPrice: "£2,450.00",
    monthly: "£157.50/mo",
    saveAmount: "Save £560",
    enrolLink: "/enrol?course=diploma-in-adult-care&level=Level%205",
  },
  {
    id: "bundle-teaching",
    title: "Dual Educator & Assessor Masterclass",
    subtitle: "Level 3 Award in Education & Training (AET) + Level 3 Assessor (CAVA)",
    tag: "Most Popular Dual Track",
    image: "/images/teacher-training.jpg",
    includedCourses: [
      "Level 3 Award in Education and Training (AET)",
      "Level 3 Certificate in Assessing Vocational Achievement (CAVA)",
      "Full Microteach Video Assessment Guidance",
      "Workplace Portfolio Observation Support",
    ],
    duration: "6 – 9 Months",
    price: "£1,250.00",
    originalPrice: "£1,590.00",
    monthly: "£104.17/mo",
    saveAmount: "Save £340",
    enrolLink: "/enrol?course=award-in-education-and-training-aet",
  },
  {
    id: "bundle-earlyyears",
    title: "Early Years Educator & SENCO Bundle",
    subtitle: "Level 3 Early Years Educator (EYE) + Advanced SENCO Specialism",
    tag: "Nursery & School Ready",
    image: "/images/early-years-training.jpg",
    includedCourses: [
      "Level 3 Diploma for the Early Years Educator (EYE)",
      "Special Educational Needs Coordinator (SENCO) Module",
      "Full DBS-Compliant Practical Observations",
      "Dedicated Early Childhood Faculty Tutor",
    ],
    duration: "9 – 12 Months",
    price: "£1,620.00",
    originalPrice: "£2,100.00",
    monthly: "£135.00/mo",
    saveAmount: "Save £480",
    enrolLink: "/enrol?course=diploma-early-years-educator",
  },
  {
    id: "bundle-compliance",
    title: "Care Governance & Compliance Dual Award",
    subtitle: "Level 4 Care Management + Mandatory Quality & CQC Audit Specialist",
    tag: "Care Home Compliance",
    image: "/images/tutor-teaching.jpg",
    includedCourses: [
      "Level 4 Certificate in Principles of Leadership and Management",
      "Health & Social Care Auditing and Inspection Preparation",
      "Safeguarding Adults Lead Practitioner Certificate",
      "Workplace Governance Mentoring",
    ],
    duration: "8 – 12 Months",
    price: "£1,420.00",
    originalPrice: "£1,850.00",
    monthly: "£118.33/mo",
    saveAmount: "Save £430",
    enrolLink: "/enrol?course=diploma-in-adult-care&level=Level%204",
  },
  {
    id: "bundle-leadership",
    title: "Higher Education & School Leadership",
    subtitle: "Level 5 Diploma in Education & Training + Academic Department Head",
    tag: "Further Education Track",
    image: "/images/certificate-moment.jpg",
    includedCourses: [
      "Level 5 Diploma in Education and Training (DET)",
      "Educational Leadership and Curriculum Development",
      "Advanced Pedagogical Mentoring and Assessment",
      "College Department Head Portfolio Guidance",
    ],
    duration: "12 – 18 Months",
    price: "£1,980.00",
    originalPrice: "£2,600.00",
    monthly: "£165.00/mo",
    saveAmount: "Save £620",
    enrolLink: "/enrol?course=award-in-education-and-training-aet",
  },
];

export interface ExclusiveBundlesSectionProps {
  headline?: string;
  subheadline?: string;
  items?: BuilderSectionItem[];
  bgColor?: string;
  headlineFontFamily?: FontFamilyChoice;
  headlineFontSize?: FontSizeChoice;
  headlineFontWeight?: FontWeightChoice;
  headlineFontStyle?: FontStyleChoice;
  headlineColor?: FontColorChoice;
  headlineTransform?: "normal" | "uppercase";
  headlineAlign?: "left" | "center" | "right";
  subheadlineFontFamily?: FontFamilyChoice;
  subheadlineFontSize?: FontSizeChoice;
  subheadlineFontWeight?: FontWeightChoice;
  subheadlineFontStyle?: FontStyleChoice;
  subheadlineColor?: FontColorChoice;
  subheadlineAlign?: "left" | "center" | "right";
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
      | "bg"
      | "video",
    itemIndex?: number
  ) => void;
}

export const ExclusiveBundlesSection: React.FC<ExclusiveBundlesSectionProps> = ({
  headline = "Our Exclusive Course Bundles",
  subheadline = "Save up to £560 when combining foundational certificates with advanced supervisory diplomas.",
  items,
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
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily,
    fontSize: headlineFontSize,
    fontWeight: headlineFontWeight,
    fontStyle: headlineFontStyle,
    color: headlineColor,
    transform: headlineTransform,
    align: headlineAlign || "center",
    defaultFamily: "heading",
    defaultSize: "xl",
    defaultWeight: "bold",
  });

  const { className: subClass, style: subStyle } = resolveSubheadlineTypography({
    fontFamily: subheadlineFontFamily,
    fontSize: subheadlineFontSize,
    fontWeight: subheadlineFontWeight,
    fontStyle: subheadlineFontStyle,
    color: subheadlineColor,
    align: subheadlineAlign || "center",
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

  const activeBundles: BundleItem[] =
    items && items.length > 0
      ? items.map((it, idx) => ({
          id: it.id || `bundle-custom-${idx}`,
          title: it.title,
          subtitle: it.desc || it.subtitle || "",
          tag: it.tag || "Dual Pathway",
          image: it.icon?.startsWith("/")
            ? it.icon
            : DEFAULT_BUNDLES[idx % DEFAULT_BUNDLES.length].image,
          includedCourses: [
            it.desc || "Dual Qualification Curriculum Track",
            "Dedicated 1-on-1 Assessor Mentoring",
            "100% Coursework & Portfolio Assessment",
          ],
          duration: it.badge || "12 Months",
          price: it.price || "£1,490.00",
          originalPrice: it.originalPrice || "£1,950.00",
          monthly: it.monthly || "£124.17/mo",
          saveAmount: it.saveAmount || "Special Bundle",
          enrolLink: it.link || "/courses",
        }))
      : DEFAULT_BUNDLES;

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const firstCard = container.querySelector("[data-bundle-card]") as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 360;
    container.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const firstCard = container.querySelector("[data-bundle-card]") as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 360;
    const newIndex = Math.min(2, Math.max(0, Math.round(container.scrollLeft / cardWidth)));
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-paper border-b border-line overflow-hidden">
      <Container>
        {/* Section Heading with Signature Orange Wave Accent */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex flex-col items-center w-full">
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "headline"}
              label="Headline"
              onClick={() => onSelectElement?.("headline")}
              className="w-full"
            >
              <h2
                style={hlStyle}
                className={`tracking-tight leading-tight ${hlClass}`}
              >
                {headline}
              </h2>
            </EditableElementWrapper>
            <div className="flex justify-center mt-2">
              <OrangeWaveAccent width={140} height={18} className="text-[#FF5722]" />
            </div>
          </div>
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "subheadline"}
            label="Subheadline"
            onClick={() => onSelectElement?.("subheadline")}
            className="w-full mt-3"
          >
            <p
              style={subStyle}
              className={`leading-relaxed ${subClass}`}
            >
              {subheadline}
            </p>
          </EditableElementWrapper>
        </div>

        {/* Interactive Responsive Carousel Track */}
        <div className="relative">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex gap-6 lg:gap-8 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            tabIndex={0}
            role="region"
            aria-label="Exclusive course bundles carousel"
          >
            {activeBundles.map((bundle, idx) => {
              const isFeatured = idx === 1;
              const cardWidthClass = "w-[85vw] sm:w-[350px] lg:w-[370px] max-w-[380px] flex-shrink-0 snap-start";

                const rawItem = items?.[idx];
                const resolvedCardBg = resolveItemColor(rawItem?.cardBg);
                const resolvedTitleColor = resolveItemColor(rawItem?.titleColor);
                const resolvedDescColor = resolveItemColor(rawItem?.descColor);

                return (
                  <EditableElementWrapper
                    key={bundle.id}
                    isEditor={isEditor}
                    isSelected={isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx}
                    label={`Bundle Card #${idx + 1}`}
                    onClick={() => onSelectElement?.("item", idx)}
                    className={`${cardWidthClass} flex flex-col h-full`}
                  >
                    <div
                      key={bundle.id}
                      data-bundle-card
                      style={resolvedCardBg ? { backgroundColor: resolvedCardBg } : undefined}
                      className={`${isEditor ? "w-full" : cardWidthClass} h-full relative rounded-3xl overflow-hidden bg-white border shadow-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                        isFeatured
                          ? "border-teal-500 ring-2 ring-teal-500/20"
                          : "border-line"
                      }`}
                    >
                      {/* Top Half: Real Photo with Atmospheric Teal Overlay & Floating Price Tag (Image 2 style) */}
                      <div className="relative h-52 bg-gradient-to-br from-[#0B4D4E] to-[#073637] p-4 sm:p-5 flex flex-col justify-between overflow-hidden group/art">
                        {/* Real photo background */}
                        <Image
                          src={bundle.image}
                          alt={bundle.title}
                          fill
                          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 400px"
                          className="object-cover group-hover/art:scale-105 transition-transform duration-500 ease-out"
                        />

                        {/* Dark teal gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B4D4E] via-[#0B4D4E]/75 to-[#073637]/40 pointer-events-none" />

                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 z-10 w-full">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-xs truncate">
                            {bundle.tag}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF5722] text-white shadow-xs shrink-0 whitespace-nowrap">
                            {bundle.saveAmount}
                          </span>
                        </div>

                        {/* Bottom Price Pill Tag matching Image 2 */}
                        <div className="self-center z-10 bg-white px-4 py-1.5 rounded-full shadow-lg border border-teal-100 flex items-center gap-2 whitespace-nowrap">
                          <span className="font-heading font-extrabold text-lg sm:text-xl text-[#FF5722] leading-none">
                            {bundle.price}
                          </span>
                          <span className="text-xs text-ink-soft line-through leading-none">
                            {bundle.originalPrice}
                          </span>
                        </div>
                      </div>

                    {/* Bottom Half: Course Metadata, Title, Avatars & Enrol CTA */}
                    <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-ink-soft">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B4D4E]">
                            Dual Qualification
                          </span>
                          <span className="flex items-center gap-1 font-medium text-[11px]">
                            <Icon name="clock" size={12} />
                            {bundle.duration}
                          </span>
                        </div>

                        <h3
                          style={resolvedTitleColor ? { color: resolvedTitleColor } : undefined}
                          className="font-heading text-xl font-bold text-navy-900 leading-snug min-h-[3rem] flex items-start"
                        >
                          {bundle.title}
                        </h3>

                        <p
                          style={resolvedDescColor ? { color: resolvedDescColor } : undefined}
                          className="text-xs text-ink-soft line-clamp-2 leading-relaxed min-h-[2.5rem]"
                        >
                          {bundle.subtitle}
                        </p>
                      </div>

                    {/* Avatar Stack Proof & Action Link matching Image 2 */}
                    <div className="flex items-center justify-between pt-3 border-t border-line/80">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-[#0B4D4E] text-white text-[9px] font-bold flex items-center justify-center">
                            SJ
                          </div>
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-[#FF5722] text-white text-[9px] font-bold flex items-center justify-center">
                            DK
                          </div>
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-navy-900 text-white text-[9px] font-bold flex items-center justify-center">
                            +
                          </div>
                        </div>
                        <span className="text-xs font-bold text-ink-soft">
                          + 250 Learners
                        </span>
                      </div>

                      <Link
                        href={bundle.enrolLink}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B4D4E] hover:bg-[#073637] text-white font-heading font-bold text-xs tracking-wide shadow-xs transition-all hover:scale-105"
                      >
                        <span>Enrol Bundle</span>
                        <Icon name="arrow-right" size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </EditableElementWrapper>
            );
            })}
          </div>
        </div>

        {/* Carousel Pagination Controls: Left Arrow, 3 Interactive Navigation Dots, Right Arrow */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-10">
          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="w-10 h-10 rounded-full border border-teal-200 bg-white text-[#0B4D4E] hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-xs hover:shadow-md cursor-pointer"
            aria-label="Previous bundle slide"
          >
            <Icon name="chevron-left" size={18} />
          </button>

          {/* Interactive Navigation Dots matching base design */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((dotIdx) => {
              const isActive = activeIndex === dotIdx;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => scrollToIndex(dotIdx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? "w-8 h-2.5 bg-[#0B4D4E] shadow-sm"
                      : "w-2.5 h-2.5 bg-line hover:bg-teal-400"
                  }`}
                  aria-label={`Go to bundle slide ${dotIdx + 1}`}
                />
              );
            })}
          </div>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={() => scrollToIndex(Math.min(2, activeIndex + 1))}
            disabled={activeIndex === 2}
            className="w-10 h-10 rounded-full border border-teal-200 bg-white text-[#0B4D4E] hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-xs hover:shadow-md cursor-pointer"
            aria-label="Next bundle slide"
          >
            <Icon name="chevron-right" size={18} />
          </button>
        </div>
      </Container>
    </section>
  );
};
