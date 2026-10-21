"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon, IconName } from "@/components/ui/Icon";
import { resolveSectionBg, resolveItemColor } from "@/components/ui/sectionBg";
import {
  resolveTypography,
  resolveSubheadlineTypography,
} from "@/components/ui/typographyUtils";
import { BuilderSectionItem } from "@/lib/repositories/seedData";

export interface WhyChooseUsProps {
  id?: string;
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  items?: BuilderSectionItem[];
  buttonText?: string;
  buttonLink?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  trustNote?: string;
  trustNoteIcon?: string;
  image?: string;
  image2?: string;
  image3?: string;
  floatingBadgeTitle?: string;
  floatingBadgeSubtitle?: string;
  floatingBadgeIcon?: string;
  floatingBadgeEnabled?: boolean;
  bgColor?: string;
  headlineFontFamily?: "heading" | "body" | "serif";
  headlineFontSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  headlineFontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  headlineFontStyle?: "normal" | "italic";
  headlineColor?: "auto" | "navy" | "white" | "gold" | "ink_soft" | (string & {});
  subheadlineFontFamily?: "heading" | "body" | "serif";
  subheadlineFontSize?: "sm" | "md" | "lg" | "xl";
  subheadlineFontWeight?: "normal" | "medium" | "semibold" | "bold";
  subheadlineFontStyle?: "normal" | "italic";
  subheadlineColor?: "auto" | "navy" | "white" | "gold" | "ink_soft" | (string & {});
  paddingDensity?: "compact" | "normal" | "spacious";
  mediaPosition?: "left" | "right";
  isEditor?: boolean;
  selectedElementKey?: string | null;
  selectedElementItemIndex?: number | null;
  onSelectElement?: (elementKey: any, itemIndex?: number) => void;
}

const DEFAULT_ITEMS: BuilderSectionItem[] = [
  {
    title: "Course Management",
    desc: "Structured qualification modules and comprehensive British curricula tailored for career progression.",
    icon: "check-circle",
    cardBg: "mint",
    iconColor: "emerald",
    titleColor: "navy",
  },
  {
    title: "Students Progress Tracking",
    desc: "Real-time guided learning hours monitoring, portfolio milestones, and assessor feedback.",
    icon: "check-circle",
    cardBg: "peach",
    iconColor: "amber",
    titleColor: "navy",
  },
  {
    title: "Interactive Live Class",
    desc: "Weekly evening Zoom seminars led by experienced UK subject-specialist practitioners.",
    icon: "check-circle",
    cardBg: "lavender",
    iconColor: "purple",
    titleColor: "navy",
  },
  {
    title: "Quiz and Assignments",
    desc: "100% coursework assessments with continuous mentor guidance and zero exam stress.",
    icon: "check-circle",
    cardBg: "sky",
    iconColor: "cyan",
    titleColor: "navy",
  },
];

export const WhyChooseUsSection: React.FC<WhyChooseUsProps> = ({
  id = "sec-why-choose-us",
  badgeText = "WHY CHOOSE US?",
  headline = "Innovative and effective learning approaches",
  subheadline = "Educate the ultimate destination for knowledge seekers and educators alike. We are committed to transforming vocational training through interactive live evening classes, accredited UK qualifications, and dedicated assessor support.",
  items = DEFAULT_ITEMS,
  buttonText = "GET STARTED",
  buttonLink = "/courses",
  buttonBgColor,
  buttonTextColor,
  trustNote = "24/7 Hrs Ready to our support team",
  trustNoteIcon = "star",
  image = "/images/hero-student-thumbsup.jpg",
  image2 = "/images/promo-woman-card.jpg",
  image3 = "/images/hero-learner.jpg",
  floatingBadgeTitle = "26+",
  floatingBadgeSubtitle = "Years of Experiences",
  floatingBadgeIcon = "star",
  floatingBadgeEnabled = true,
  bgColor = "mint",
  headlineFontFamily,
  headlineFontSize = "xl",
  headlineFontWeight = "bold",
  headlineFontStyle,
  headlineColor,
  subheadlineFontFamily,
  subheadlineFontSize = "md",
  subheadlineFontWeight = "normal",
  subheadlineFontStyle,
  subheadlineColor,
  paddingDensity = "normal",
  mediaPosition = "right",
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const { bgClass, isDark, style } = resolveSectionBg(bgColor, "mint");

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily,
    fontSize: headlineFontSize,
    fontWeight: headlineFontWeight,
    fontStyle: headlineFontStyle,
    color: headlineColor,
    isDark,
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
    isDark,
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

  const paddingClass =
    paddingDensity === "compact"
      ? "py-10 md:py-14"
      : paddingDensity === "spacious"
      ? "py-20 md:py-28"
      : "py-14 md:py-20";

  const displayedItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const isMediaLeft = mediaPosition === "left";

  const getPillSurfaceClass = (cardBg?: string) => {
    switch (cardBg) {
      case "mint":
        return "bg-[#dff5ec] hover:bg-[#d4f0e5] border-[#c4ecdc]";
      case "peach":
        return "bg-[#faedd9] hover:bg-[#f6e4cc] border-[#f2dcbc]";
      case "lavender":
        return "bg-[#eeeaf8] hover:bg-[#e6dff5] border-[#dfd6f1]";
      case "sky":
        return "bg-[#e2f3fa] hover:bg-[#d6eef7] border-[#c6e5f3]";
      case "white":
        return "bg-white hover:bg-paper border-line shadow-2xs";
      case "paper":
        return "bg-paper hover:bg-white border-line";
      case "navy":
        return "bg-navy-900 text-white border-navy-700";
      case "gold_subtle":
        return "bg-gold-50 hover:bg-gold-100 border-gold-200";
      case "transparent":
        return "bg-transparent border-line/40";
      default:
        return "bg-[#dff5ec] border-[#c4ecdc]";
    }
  };

  const getPillIconTone = (iconColor?: string, cardBg?: string) => {
    switch (iconColor) {
      case "emerald":
        return { circle: "bg-emerald-100/80 text-emerald-700", icon: "text-emerald-700" };
      case "amber":
        return { circle: "bg-amber-100/80 text-amber-700", icon: "text-amber-700" };
      case "purple":
        return { circle: "bg-purple-100/80 text-purple-700", icon: "text-purple-700" };
      case "cyan":
      case "blue":
        return { circle: "bg-sky-100/80 text-sky-700", icon: "text-sky-700" };
      case "gold":
        return { circle: "bg-gold-100 text-gold-700", icon: "text-gold-700" };
      case "navy":
        return { circle: "bg-navy-100 text-navy-900", icon: "text-navy-900" };
      case "white":
        return { circle: "bg-white/20 text-white", icon: "text-white" };
      default:
        if (cardBg === "peach") return { circle: "bg-amber-100/80 text-amber-700", icon: "text-amber-700" };
        if (cardBg === "lavender") return { circle: "bg-purple-100/80 text-purple-700", icon: "text-purple-700" };
        if (cardBg === "sky") return { circle: "bg-sky-100/80 text-sky-700", icon: "text-sky-700" };
        return { circle: "bg-emerald-100/80 text-emerald-700", icon: "text-emerald-700" };
    }
  };

  return (
    <section
      id={id}
      style={style}
      className={`relative overflow-hidden ${bgClass} ${paddingClass} border-b border-line`}
    >
      {/* Translucent background organic curved shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <svg
          className="absolute -top-24 -left-24 w-[500px] h-[500px] text-emerald-200/25 blur-2xl"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,72.7,41.4C64,53.7,52.2,63.7,38.9,71C25.6,78.3,10.8,82.9,-3.8,89.5C-18.4,96.1,-32.8,104.7,-46.1,101.4C-59.4,98.1,-71.6,82.9,-79.8,66.8C-88,50.7,-92.2,33.7,-92.5,17C-92.8,0.3,-89.2,-16.1,-82.1,-30.2C-75,-44.3,-64.4,-56.1,-51.4,-63.9C-38.4,-71.7,-23,-75.5,-7.1,-63.2C8.8,-50.9,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
        <svg
          className="absolute -bottom-32 -right-24 w-[600px] h-[600px] text-teal-200/20 blur-3xl"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <path d="M38.9,-65.4C50.2,-58.5,59.1,-48.5,66.2,-37C73.3,-25.5,78.6,-12.8,79.1,0.3C79.6,13.4,75.3,26.7,68.1,38.5C60.9,50.2,50.8,60.3,38.8,67.6C26.7,74.9,12.7,79.3,-1.2,81.4C-15.1,83.5,-29.5,83.2,-42.6,77.1C-55.7,71,-67.5,59.1,-74.6,45.2C-81.7,31.3,-84.1,15.7,-82.9,0.7C-81.7,-14.3,-76.9,-28.5,-68.8,-40.4C-60.7,-52.3,-49.3,-61.8,-36.8,-68.2C-24.3,-74.6,-10.7,-77.9,1.4,-80.3C13.5,-82.7,27.6,-72.3,38.9,-65.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* =========================================================================
              LEFT COLUMN: CONTENT & INTERACTIVE PILLS
              ========================================================================= */}
          <div
            className={`lg:col-span-6 space-y-6 ${
              isMediaLeft ? "lg:order-2" : "lg:order-1"
            }`}
          >
            {/* 1. EYEBROW TAG WITH SMALL SQUARE */}
            {badgeText && (
              <div
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("badge");
                  }
                }}
                className={`inline-flex items-center gap-2 ${
                  isEditor
                    ? "cursor-pointer group/badge relative rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 p-0.5 -m-0.5"
                    : ""
                }`}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-2xs bg-emerald-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800">
                  {badgeText}
                </span>
                {isEditor && (
                  <span className="hidden group-hover/badge:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                    Badge ✎
                  </span>
                )}
              </div>
            )}

            {/* 2. MAIN HEADLINE */}
            <div
              onClick={(e) => {
                if (isEditor && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement("headline");
                }
              }}
              className={
                isEditor
                  ? "cursor-pointer group/hl relative rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 p-0.5 -m-0.5"
                  : ""
              }
            >
              <h2
                style={hlStyle}
                className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy-900 tracking-tight leading-[1.12] ${hlClass}`}
              >
                {headline}
              </h2>
              {isEditor && (
                <span className="hidden group-hover/hl:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                  Headline ✎
                </span>
              )}
            </div>

            {/* 3. SUBHEADLINE / DESCRIPTION */}
            <div
              onClick={(e) => {
                if (isEditor && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement("subheadline");
                }
              }}
              className={
                isEditor
                  ? "cursor-pointer group/sub relative rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 p-0.5 -m-0.5"
                  : ""
              }
            >
              <p
                style={subStyle}
                className={`text-sm sm:text-base text-ink-soft leading-relaxed max-w-xl ${subClass}`}
              >
                {subheadline}
              </p>
              {isEditor && (
                <span className="hidden group-hover/sub:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                  Subheadline ✎
                </span>
              )}
            </div>

            {/* 4. FOUR COLORFUL CHECKLIST PILLS */}
            <div className="space-y-3 pt-1">
              {displayedItems.map((item, idx) => {
                const resolvedPillBg = resolveItemColor(item.cardBg);
                const resolvedTitleCol = resolveItemColor(item.titleColor);
                const resolvedDescCol = resolveItemColor(item.descColor);
                const surfaceClass = resolvedPillBg ? "" : getPillSurfaceClass(item.cardBg);
                const { circle: iconCircleClass, icon: iconClass } = getPillIconTone(
                  item.iconColor,
                  item.cardBg
                );

                const isSelected =
                  isEditor &&
                  selectedElementKey === "item" &&
                  selectedElementItemIndex === idx;

                return (
                  <div
                    key={item.id || idx}
                    onClick={(e) => {
                      if (isEditor && onSelectElement) {
                        e.stopPropagation();
                        onSelectElement("item", idx);
                      }
                    }}
                    style={resolvedPillBg ? { backgroundColor: resolvedPillBg, borderColor: "transparent" } : undefined}
                    className={`group/pill relative flex items-center gap-3.5 px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl border transition-all duration-200 ${surfaceClass} ${
                      isSelected
                        ? "ring-2 ring-gold-500 border-navy-900 shadow-md"
                        : ""
                    } ${
                      isEditor
                        ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                        : ""
                    }`}
                  >
                    {/* Circle Checkmark Icon */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover/pill:scale-110 ${iconCircleClass}`}
                    >
                      <Icon
                        name={(item.icon as IconName) || "check-circle"}
                        size={18}
                        className={iconClass}
                      />
                    </div>

                    {/* Pill Text */}
                    <div className="min-w-0 flex-1">
                      <span
                        style={resolvedTitleCol ? { color: resolvedTitleCol } : undefined}
                        className={`font-heading text-base sm:text-lg font-bold block leading-tight ${
                          resolvedTitleCol
                            ? ""
                            : item.titleColor === "white"
                            ? "text-white"
                            : item.titleColor === "gold"
                            ? "text-gold-700"
                            : item.titleColor === "ink_soft"
                            ? "text-ink-soft"
                            : "text-navy-900"
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.desc && (
                        <span
                          style={resolvedDescCol ? { color: resolvedDescCol } : undefined}
                          className={`text-xs block mt-0.5 leading-snug ${
                            resolvedDescCol
                              ? ""
                              : item.descColor === "white"
                              ? "text-white/80"
                              : item.descColor === "navy"
                              ? "text-navy-900"
                              : "text-ink-soft"
                          }`}
                        >
                          {item.desc}
                        </span>
                      )}
                    </div>

                    {isEditor && (
                      <span className="hidden group-hover/pill:inline-flex absolute -top-3 right-3 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
                        Feature #{idx + 1} ✎
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 5. TRUST / SUPPORT NOTE & CTA BUTTON */}
            <div className="pt-3 flex flex-col items-start gap-6 sm:gap-7">
              {trustNote && (
                <div
                  onClick={(e) => {
                    if (isEditor && onSelectElement) {
                      e.stopPropagation();
                      onSelectElement("floatingBadge");
                    }
                  }}
                  className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-900 ${
                    isEditor
                      ? "cursor-pointer group/trust relative rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 p-0.5 -m-0.5"
                      : ""
                  }`}
                >
                  <span className="text-emerald-500 font-bold text-base leading-none">
                    ✱
                  </span>
                  <span>{trustNote}</span>
                  {isEditor && (
                    <span className="hidden group-hover/trust:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                      Support Note ✎
                    </span>
                  )}
                </div>
              )}

              {/* 6. PRIMARY CTA BUTTON */}
              {buttonText && (
                <div className="pt-1 sm:pt-2">
                  <div
                    onClick={(e) => {
                      if (isEditor && onSelectElement) {
                        e.stopPropagation();
                        onSelectElement("button");
                      }
                    }}
                    className={`inline-block ${
                      isEditor
                        ? "cursor-pointer group/btn relative rounded-full hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                        : ""
                    }`}
                  >
                    <Link
                      href={buttonLink || "/courses"}
                      style={{
                        backgroundColor: buttonBgColor || undefined,
                        color: buttonTextColor || undefined,
                      }}
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-sm tracking-wider uppercase shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
                    >
                      <span>{buttonText}</span>
                      <Icon name="arrow-right" size={16} />
                    </Link>
                    {isEditor && (
                      <span className="hidden group-hover/btn:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                        CTA Button ✎
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: SIGNATURE 3-CIRCLE OVERLAPPING COMPOSITION
              ========================================================================= */}
          <div
            className={`lg:col-span-6 relative ${
              isMediaLeft ? "lg:order-1" : "lg:order-2"
            }`}
          >
            {/* Top Right Triangular Dotted Pattern */}
            <div className="absolute top-2 right-4 sm:right-8 grid grid-cols-5 gap-1.5 opacity-60 z-0 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-600/70"
                />
              ))}
            </div>

            {/* Circular Composition Stage */}
            <div className="relative w-full max-w-[480px] sm:max-w-[540px] aspect-square mx-auto flex items-center justify-center">
              {/* CIRCLE 1: Top-Left with Amber/Orange Ring */}
              <div
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("image");
                  }
                }}
                className={`absolute top-[4%] left-[10%] w-[50%] aspect-square rounded-full border-[6px] border-amber-500 shadow-xl overflow-hidden z-10 bg-line transition-transform duration-300 hover:scale-[1.02] ${
                  isEditor
                    ? "cursor-pointer group/c1 hover:ring-4 hover:ring-gold-500"
                    : ""
                }`}
              >
                <Image
                  src={image || "/images/hero-student-thumbsup.jpg"}
                  alt="Male student writing in lecture hall"
                  fill
                  sizes="(max-width: 768px) 50vw, 280px"
                  className="object-cover"
                />
                {isEditor && (
                  <span className="hidden group-hover/c1:inline-flex absolute inset-0 m-auto w-max h-max px-2 py-1 rounded bg-navy-900/90 text-gold-300 text-[10px] font-bold z-20">
                    Photo 1 ✎
                  </span>
                )}
              </div>

              {/* CIRCLE 2: Top-Right with Emerald/Green Ring */}
              <div
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("image");
                  }
                }}
                className={`absolute top-[18%] right-[4%] w-[46%] aspect-square rounded-full border-[6px] border-emerald-500 shadow-xl overflow-hidden z-20 bg-line transition-transform duration-300 hover:scale-[1.02] ${
                  isEditor
                    ? "cursor-pointer group/c2 hover:ring-4 hover:ring-gold-500"
                    : ""
                }`}
              >
                <Image
                  src={image2 || "/images/promo-woman-card.jpg"}
                  alt="Excited female student holding notebooks"
                  fill
                  sizes="(max-width: 768px) 50vw, 260px"
                  className="object-cover"
                />
                {isEditor && (
                  <span className="hidden group-hover/c2:inline-flex absolute inset-0 m-auto w-max h-max px-2 py-1 rounded bg-navy-900/90 text-gold-300 text-[10px] font-bold z-20">
                    Photo 2 ✎
                  </span>
                )}
              </div>

              {/* CIRCLE 3: Bottom-Center with Sky/Cyan Ring */}
              <div
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("image");
                  }
                }}
                className={`absolute bottom-[4%] left-[16%] w-[52%] aspect-square rounded-full border-[6px] border-sky-400 shadow-2xl overflow-hidden z-30 bg-line transition-transform duration-300 hover:scale-[1.02] ${
                  isEditor
                    ? "cursor-pointer group/c3 hover:ring-4 hover:ring-gold-500"
                    : ""
                }`}
              >
                <Image
                  src={image3 || "/images/hero-learner.jpg"}
                  alt="Focused female student studying in library"
                  fill
                  sizes="(max-width: 768px) 50vw, 290px"
                  className="object-cover"
                />
                {isEditor && (
                  <span className="hidden group-hover/c3:inline-flex absolute inset-0 m-auto w-max h-max px-2 py-1 rounded bg-navy-900/90 text-gold-300 text-[10px] font-bold z-20">
                    Photo 3 ✎
                  </span>
                )}
              </div>

              {/* FLOATING WHITE CIRCLE WITH GREEN ASTERISK */}
              <div className="absolute top-[52%] left-[2%] -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg border border-emerald-100 flex items-center justify-center transition-transform hover:rotate-45 duration-300 pointer-events-none select-none">
                <span className="text-emerald-500 text-2xl sm:text-3xl font-bold leading-none">
                  ✱
                </span>
              </div>

              {/* FLOATING 26+ YEARS EXPERIENCE CARD */}
              {floatingBadgeEnabled !== false && (
                <div
                  onClick={(e) => {
                    if (isEditor && onSelectElement) {
                      e.stopPropagation();
                      onSelectElement("floatingBadge");
                    }
                  }}
                  className={`absolute bottom-[6%] right-[2%] z-40 bg-white rounded-xl shadow-2xl p-3.5 sm:p-4 border border-line/40 flex items-center gap-3 transition-transform duration-200 hover:-translate-y-0.5 ${
                    isEditor
                      ? "cursor-pointer group/exp hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                      : ""
                  }`}
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Icon
                      name={(floatingBadgeIcon as IconName) || "star"}
                      size={20}
                      className="text-white fill-white"
                    />
                  </div>
                  <div>
                    <strong className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900 leading-none block">
                      {floatingBadgeTitle || "26+"}
                    </strong>
                    <span className="text-[11px] sm:text-xs text-ink-soft block font-medium mt-0.5 leading-tight whitespace-nowrap">
                      {floatingBadgeSubtitle || "Years of Experiences"}
                    </span>
                  </div>
                  {isEditor && (
                    <span className="hidden group-hover/exp:inline-flex absolute -top-4 right-2 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
                      Stat Card ✎
                    </span>
                  )}
                </div>
              )}

              {/* Bottom Right Squiggly Wavy Lines (Teal & Orange) */}
              <div className="absolute -bottom-6 right-10 sm:right-16 z-0 pointer-events-none select-none">
                <svg
                  width="72"
                  height="26"
                  viewBox="0 0 72 26"
                  fill="none"
                  className="opacity-80"
                >
                  <path
                    d="M2 7C6 2 10 2 14 7C18 12 22 12 26 7C30 2 34 2 38 7C42 12 46 12 50 7C54 2 58 2 62 7C66 12 70 12 74 7"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 19C6 14 10 14 14 19C18 24 22 24 26 19C30 14 34 14 38 19C42 24 46 24 50 19C54 14 58 14 62 19C66 24 70 24 74 19"
                    stroke="#F97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
