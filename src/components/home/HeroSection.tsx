"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { ArcMask } from "@/components/ui/ArcMask";
import { useBooking } from "@/context/BookingContext";
import { resolveSectionBg, SectionBgColor } from "@/components/ui/sectionBg";
import {
  resolveTypography,
  resolveSubheadlineTypography,
  FontFamilyChoice,
  FontSizeChoice,
  FontWeightChoice,
  FontStyleChoice,
  FontColorChoice,
} from "@/components/ui/typographyUtils";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";

import {
  resolveCustomButtonClasses,
  ButtonFontFamily,
  ButtonFontWeight,
  ButtonTextTransform,
  ButtonIconPosition,
  ButtonRadius,
  ButtonSizePreset,
} from "@/components/ui/buttonCustomizer";

export interface HeroTagItem {
  id?: string;
  label: string;
  variant?: "live" | "navy" | "gold" | "default";
}

export interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  tags?: HeroTagItem[];
  buttonText?: string;
  buttonLink?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonFontFamily?: ButtonFontFamily;
  buttonFontWeight?: ButtonFontWeight;
  buttonTextTransform?: ButtonTextTransform;
  buttonIcon?: string;
  buttonIconPosition?: ButtonIconPosition;
  buttonRadius?: ButtonRadius;
  buttonSize?: ButtonSizePreset;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonBgColor?: string;
  secondaryButtonTextColor?: string;
  secondaryButtonFontFamily?: ButtonFontFamily;
  secondaryButtonFontWeight?: ButtonFontWeight;
  secondaryButtonTextTransform?: ButtonTextTransform;
  secondaryButtonIcon?: string;
  secondaryButtonIconPosition?: ButtonIconPosition;
  secondaryButtonRadius?: ButtonRadius;
  secondaryButtonSize?: ButtonSizePreset;
  image?: string;
  floatingBadgeTitle?: string;
  floatingBadgeSubtitle?: string;
  floatingBadgeIcon?: string;
  floatingBadgeEnabled?: boolean;
  mediaPosition?: "left" | "right";
  columnRatio?: "50-50" | "60-40" | "70-30" | "40-60" | "33-67";
  align?: "left" | "center";
  alignMobile?: "left" | "center";
  paddingDensity?: "compact" | "normal" | "spacious";
  paddingDensityMobile?: "compact" | "normal" | "spacious";
  bgColor?: SectionBgColor;
  headlineFontFamily?: FontFamilyChoice;
  headlineFontSize?: FontSizeChoice;
  headlineFontWeight?: FontWeightChoice;
  headlineFontStyle?: FontStyleChoice;
  headlineColor?: FontColorChoice;
  headlineTransform?: ButtonTextTransform | "normal" | "uppercase";
  headlineAlign?: "left" | "center" | "right";
  subheadlineFontFamily?: FontFamilyChoice;
  subheadlineFontSize?: FontSizeChoice;
  subheadlineFontWeight?: FontWeightChoice;
  subheadlineFontStyle?: FontStyleChoice;
  subheadlineColor?: FontColorChoice;
  subheadlineAlign?: "left" | "center" | "right";
  sealText?: string;
  sealLink?: string;
  sealVideoUrl?: string;
  sealBgColor?: string;
  sealTextColor?: string;
  sealPlayColor?: string;
  sealFontSize?: string;
  sealEnabled?: boolean;
  isEditor?: boolean;
  selectedElementKey?: string | null;
  selectedElementItemIndex?: number | null;
  onSelectElement?: (
    element:
      | "badge"
      | "tags"
      | "headline"
      | "subheadline"
      | "button"
      | "secondaryButton"
      | "image"
      | "floatingBadge"
      | "sealBadge"
  ) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline = "Live classes with real tutors. Qualifications that move your career forward.",
  subheadline = "Study recognised UK diplomas in health, social care, education, and business through interactive live evening classes with dedicated tutor mentoring.",
  badgeText = "British Accredited Training",
  tags,
  buttonText = "Get free advice",
  buttonLink,
  buttonBgColor,
  buttonTextColor,
  buttonFontFamily,
  buttonFontWeight,
  buttonTextTransform,
  buttonIcon,
  buttonIconPosition,
  buttonRadius,
  buttonSize,
  secondaryButtonText = "View all courses",
  secondaryButtonLink = "/courses",
  secondaryButtonBgColor,
  secondaryButtonTextColor,
  secondaryButtonFontFamily,
  secondaryButtonFontWeight,
  secondaryButtonTextTransform,
  secondaryButtonIcon,
  secondaryButtonIconPosition,
  secondaryButtonRadius,
  secondaryButtonSize,
  image = "/images/hero-learner.jpg",
  floatingBadgeTitle = "Live Evening Sessions",
  floatingBadgeSubtitle = "Recordings available 24/7 to rewatch",
  floatingBadgeIcon = "star",
  floatingBadgeEnabled = true,
  mediaPosition = "right",
  columnRatio = "60-40",
  align = "left",
  alignMobile,
  paddingDensity = "normal",
  paddingDensityMobile,
  bgColor = "paper",
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
  sealText = "• WATCH VIDEO • EXPLORE COURSES •",
  sealLink = "#popular-courses",
  sealVideoUrl,
  sealBgColor = "#074C4E",
  sealTextColor = "#ffffff",
  sealPlayColor,
  sealFontSize = "7",
  sealEnabled = true,
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { openBooking } = useBooking();
  const isImageLeft = mediaPosition === "left";
  const { bgClass, isDark, style: bgStyle } = resolveSectionBg(bgColor, "paper");

  const primaryBtn = resolveCustomButtonClasses(
    {
      bgColor: buttonBgColor,
      textColor: buttonTextColor,
      fontFamily: buttonFontFamily,
      fontWeight: buttonFontWeight,
      textTransform: buttonTextTransform,
      icon: buttonIcon,
      iconPosition: buttonIconPosition,
      radius: buttonRadius,
      size: buttonSize,
    },
    isDark ? "on-navy-gold" : "primary",
    "lg",
    isDark
  );

  const secondaryBtn = resolveCustomButtonClasses(
    {
      bgColor: secondaryButtonBgColor,
      textColor: secondaryButtonTextColor,
      fontFamily: secondaryButtonFontFamily,
      fontWeight: secondaryButtonFontWeight,
      textTransform: secondaryButtonTextTransform,
      icon: secondaryButtonIcon,
      iconPosition: secondaryButtonIconPosition,
      radius: secondaryButtonRadius,
      size: secondaryButtonSize,
    },
    "outline",
    "lg",
    isDark
  );

  const defaultTags: HeroTagItem[] = [
    { id: "tag-1", label: "Live Online Classes", variant: "live" },
    { id: "tag-2", label: "Regulated Qualifications", variant: "navy" },
    { id: "tag-3", label: "Flexible Instalments", variant: "gold" },
  ];
  const activeTags = tags && tags.length > 0 ? tags : defaultTags;

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily,
    fontSize: headlineFontSize,
    fontWeight: headlineFontWeight,
    fontStyle: headlineFontStyle,
    color: headlineColor,
    transform: headlineTransform,
    align: headlineAlign || (align as any),
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
    align: subheadlineAlign || (align as any),
    isDark,
    defaultFamily: "body",
    defaultSize: "lg",
    defaultWeight: "normal",
  });

  const getColSpans = (ratio?: string) => {
    switch (ratio) {
      case "50-50":
        return { text: "lg:col-span-6", media: "lg:col-span-6" };
      case "70-30":
        return { text: "lg:col-span-8", media: "lg:col-span-4" };
      case "40-60":
        return { text: "lg:col-span-5", media: "lg:col-span-7" };
      case "33-67":
        return { text: "lg:col-span-4", media: "lg:col-span-8" };
      case "60-40":
      default:
        return { text: "lg:col-span-7", media: "lg:col-span-5" };
    }
  };

  const { text: textColSpan, media: mediaColSpan } = getColSpans(columnRatio);

  const effectiveMobilePad = paddingDensityMobile || paddingDensity;
  const mobilePadClass =
    effectiveMobilePad === "compact"
      ? "pt-6 pb-8"
      : effectiveMobilePad === "spacious"
      ? "pt-14 pb-20"
      : "pt-10 pb-14";

  const desktopPadClass =
    paddingDensity === "compact"
      ? "md:pt-10 md:pb-14"
      : paddingDensity === "spacious"
      ? "md:pt-24 md:pb-32"
      : "md:pt-16 md:pb-24";

  const paddingClass = `${mobilePadClass} ${desktopPadClass}`;

  const effectiveHeroImg = image && !image.includes("hero-learner") ? image : "/images/hero-student-thumbsup.jpg";

  return (
    <section
      style={bgStyle}
      className={`relative ${bgClass} ${paddingClass} ${
        !isDark ? "rounded-b-[50px] md:rounded-b-[84px] border-b border-line shadow-xs" : "border-b border-line"
      }`}
    >
      {/* Background vector wave contours cleanly clipped to rounded bottom */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-b-[50px] md:rounded-b-[84px]">
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 600"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M-100,220 C300,120 650,420 1100,160 C1320,40 1500,280 1650,220"
            stroke={isDark ? "#D9B84A" : "#0B4D4E"}
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M-50,380 C360,260 780,560 1200,310 C1420,210 1550,420 1680,360"
            stroke={isDark ? "#ffffff" : "#0B4D4E"}
            strokeWidth="1.2"
          />
          <path
            d="M120,60 C420,320 920,120 1380,460"
            stroke="#FF5722"
            strokeWidth="1"
            opacity="0.35"
            strokeDasharray="4 8"
          />
        </svg>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text & CTAs Column */}
          <div className={`${textColSpan} space-y-6 ${isImageLeft ? "lg:order-2" : "lg:order-1"}`}>
            {/* Eyebrow / Pill Badge in Image 1 capsule style */}
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "badge"}
              label="Badge"
              onClick={() => onSelectElement?.("badge")}
              inline
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-teal-200/80 text-[#0B4D4E] text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
                <span className="tracking-wide uppercase text-[11px] font-extrabold">{badgeText}</span>
              </div>
            </EditableElementWrapper>

            <div className="space-y-4">
              {/* Main Headline Element */}
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "headline"}
                label="Headline"
                onClick={() => onSelectElement?.("headline")}
                className="p-0.5 -m-0.5"
              >
                <Heading
                  level="h1"
                  style={hlStyle}
                  className={`max-w-2xl leading-tight ${hlClass}`}
                >
                  {headline}
                </Heading>
              </EditableElementWrapper>

              {/* Subheadline Element */}
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "subheadline"}
                label="Subheadline"
                onClick={() => onSelectElement?.("subheadline")}
                className="p-0.5 -m-0.5"
              >
                <p
                  style={subStyle}
                  className={`max-w-xl leading-relaxed ${subClass}`}
                >
                  {subheadline}
                </p>
              </EditableElementWrapper>
            </div>

            {/* CTAs: Vibrant Orange / Coral button from Image 1 */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "button"}
                label="Primary CTA"
                onClick={() => onSelectElement?.("button")}
                inline
              >
                <div className={isEditor ? "pointer-events-none" : ""}>
                  <Link
                    href={buttonLink || "#popular-courses"}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF5722] hover:bg-[#e64a19] text-white font-heading font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                  >
                    <span>{buttonText || "Explore Courses"}</span>
                    <Icon name="arrow-right" size={18} />
                  </Link>
                </div>
              </EditableElementWrapper>

              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "secondaryButton"}
                label="Secondary CTA"
                onClick={() => onSelectElement?.("secondaryButton")}
                inline
              >
                <div className={isEditor ? "pointer-events-none" : ""}>
                  {secondaryButtonLink && secondaryButtonLink !== "/book" ? (
                    <Link
                      href={secondaryButtonLink}
                      className="w-full sm:w-auto px-7 py-4 rounded-full bg-white border-2 border-teal-300 hover:border-teal-500 text-[#0B4D4E] hover:bg-teal-50 font-heading font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200"
                    >
                      <Icon name="phone" size={17} className="text-[#0B4D4E]" />
                      <span className="text-[#0B4D4E] font-bold">
                        {secondaryButtonText && secondaryButtonText.trim()
                          ? secondaryButtonText
                          : "Speak with an Assessor"}
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openBooking()}
                      className="w-full sm:w-auto px-7 py-4 rounded-full bg-white border-2 border-teal-300 hover:border-teal-500 text-[#0B4D4E] hover:bg-teal-50 font-heading font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <Icon name="phone" size={17} className="text-[#0B4D4E]" />
                      <span className="text-[#0B4D4E] font-bold">
                        {secondaryButtonText && secondaryButtonText.trim()
                          ? secondaryButtonText
                          : "Speak with an Assessor"}
                      </span>
                    </button>
                  )}
                </div>
              </EditableElementWrapper>
            </div>

            {/* Reassurance line & Student Avatars proof (Image 1 Onlearn style) */}
            <div className="pt-2 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#0B4D4E] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    EM
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FF5722] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    KA
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-navy-900 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    +2k
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="star" size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1.5 font-bold text-[#0B4D4E] text-xs">4.9/5</span>
                  </div>
                  <span className="text-[#0B4D4E]/70 text-[11px] block leading-none mt-0.5">2,500+ Working Adults Certified</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#0B4D4E] font-medium">
                <Icon
                  name="check"
                  size={15}
                  className="text-emerald-700 flex-shrink-0"
                />
                <span>0% Interest Monthly Plans Available</span>
              </div>
            </div>
          </div>

          {/* Media Column: Image 1 Thumbs-Up Student Photography */}
          <div className={`${mediaColSpan} relative ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "image"}
              label="Hero Photo"
              onClick={() => onSelectElement?.("image")}
              className="rounded-3xl"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Clean photo card with rounded corners, top ribbon badge, and soft glow matching Image 2 */}
                <div className="relative aspect-[4/3] sm:aspect-[4/4.2] w-full overflow-hidden rounded-3xl shadow-2xl border-4 border-white bg-teal-50">
                  <Image
                    src={effectiveHeroImg}
                    alt="Adult learner smiling while attending live online class with notes and laptop"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
                    priority
                    loading="eager"
                    className="object-cover object-center"
                  />
                </div>

                {/* Top Right Orange Ribbon Pill Badge (Target Image 2 style) */}
                <div className="absolute -top-3 -right-2 sm:-right-3 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FF5722] text-white shadow-xl flex items-center justify-center border-2 border-white">
                  <Icon name="award" size={22} className="text-white" />
                </div>
              </div>
            </EditableElementWrapper>

            {/* Floating Live Classroom Indicator Pill (Image 2 style) */}
            {floatingBadgeEnabled !== false && (
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "floatingBadge"}
                label="Live Badge"
                onClick={() => onSelectElement?.("floatingBadge")}
                className="absolute -bottom-5 -left-2 sm:left-4 max-w-[calc(100%-1.5rem)] z-30"
              >
                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-teal-100 p-3 sm:p-4 shadow-xl flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#0B4D4E] flex items-center justify-center flex-shrink-0 border border-teal-100 shadow-xs">
                    <Icon
                      name={(floatingBadgeIcon as any) || "users"}
                      size={22}
                      className="text-[#0B4D4E]"
                    />
                  </div>
                  <div className="text-left min-w-0 pr-2">
                    <span className="font-heading font-extrabold text-sm sm:text-base text-[#0B4D4E] block leading-tight truncate">
                      {floatingBadgeTitle || "250k+ Assisted Students"}
                    </span>
                    <span className="text-xs text-ink-soft block leading-tight mt-0.5">
                      {floatingBadgeSubtitle || "98% Pass Rate • British Qualifications"}
                    </span>
                  </div>
                </div>
              </EditableElementWrapper>
            )}
          </div>
        </div>
      </Container>

      {/* Bottom Center Circular Interactive Seal Badge (Target Inspiration Onlearn style) */}
      {sealEnabled && (
        <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "sealBadge"}
            label="Watch Video Seal Badge"
            onClick={() => onSelectElement?.("sealBadge")}
            inline
          >
            {sealVideoUrl ? (
              <button
                type="button"
                onClick={() => {
                  if (isEditor) {
                    onSelectElement?.("sealBadge");
                  } else {
                    setIsVideoModalOpen(true);
                  }
                }}
                style={{
                  backgroundColor: sealBgColor || "#074C4E",
                  color: sealTextColor || "#ffffff",
                }}
                className="group flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label={sealText || "Watch video and explore courses"}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Rotating circular text */}
                  <svg
                    className="w-full h-full p-1.5 animate-spin-slow opacity-95 text-white"
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <path
                        id="heroCirclePath"
                        d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                      />
                    </defs>
                    <text
                      fontSize={sealFontSize || "7"}
                      fill="currentColor"
                      letterSpacing="2"
                      className="uppercase font-bold tracking-widest"
                    >
                      <textPath xlinkHref="#heroCirclePath" startOffset="0%">
                        {sealText || "• WATCH VIDEO • EXPLORE COURSES •"}
                      </textPath>
                    </text>
                  </svg>
                  {/* Center play button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      style={{ color: sealPlayColor || sealBgColor || "#074C4E" }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#FF5722] group-hover:text-white transition-all duration-200"
                    >
                      <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <a
                href={sealLink || "#popular-courses"}
                onClick={(e) => {
                  if (isEditor) {
                    e.preventDefault();
                    onSelectElement?.("sealBadge");
                  }
                }}
                style={{
                  backgroundColor: sealBgColor || "#074C4E",
                  color: sealTextColor || "#ffffff",
                }}
                className="group flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label={sealText || "Explore popular courses and watch live lecture previews"}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Rotating circular text */}
                  <svg
                    className="w-full h-full p-1.5 animate-spin-slow opacity-95 text-white"
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <path
                        id="heroCirclePath"
                        d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                      />
                    </defs>
                    <text
                      fontSize={sealFontSize || "7"}
                      fill="currentColor"
                      letterSpacing="2"
                      className="uppercase font-bold tracking-widest"
                    >
                      <textPath xlinkHref="#heroCirclePath" startOffset="0%">
                        {sealText || "• WATCH VIDEO • EXPLORE COURSES •"}
                      </textPath>
                    </text>
                  </svg>
                  {/* Center play button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      style={{ color: sealPlayColor || sealBgColor || "#074C4E" }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#FF5722] group-hover:text-white transition-all duration-200"
                    >
                      <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            )}
          </EditableElementWrapper>
        </div>
      )}

      {/* Video Modal Player (opens on seal click if video link is present) */}
      {isVideoModalOpen && sealVideoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-video flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close video player"
            >
              <Icon name="close" size={20} />
            </button>
            {sealVideoUrl.includes("youtube.com") || sealVideoUrl.includes("youtu.be") || sealVideoUrl.includes("vimeo.com") ? (
              <iframe
                src={
                  sealVideoUrl.includes("watch?v=")
                    ? sealVideoUrl.replace("watch?v=", "embed/") + "?autoplay=1"
                    : sealVideoUrl.includes("youtu.be/")
                    ? sealVideoUrl.replace("youtu.be/", "www.youtube.com/embed/") + "?autoplay=1"
                    : sealVideoUrl
                }
                title="Smartminds College Video Preview"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={sealVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};
