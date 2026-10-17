"use client";

import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { ArcMask } from "@/components/ui/ArcMask";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";
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
  subheadlineFontFamily?: FontFamilyChoice;
  subheadlineFontSize?: FontSizeChoice;
  subheadlineFontWeight?: FontWeightChoice;
  subheadlineFontStyle?: FontStyleChoice;
  subheadlineColor?: FontColorChoice;
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
  subheadlineFontFamily,
  subheadlineFontSize,
  subheadlineFontWeight,
  subheadlineFontStyle,
  subheadlineColor,
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
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

  return (
    <section
      style={bgStyle}
      className={`relative overflow-hidden ${bgClass} ${paddingClass} border-b border-line`}
    >
      {/* Subtle background SVG celestial crescent trace */}
      <div
        className={`absolute top-1/2 -right-48 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none ${
          isDark ? "opacity-[0.08] text-gold-500" : "opacity-[0.04] text-navy-900"
        } select-none`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          fill="currentColor"
          className="w-full h-full"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
          />
        </svg>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text & CTAs Column */}
          <div className={`${textColSpan} space-y-6 ${isImageLeft ? "lg:order-2" : "lg:order-1"}`}>
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "tags"}
              label="Tags & Badges"
              onClick={() => onSelectElement?.("tags")}
              className="p-1 -m-1"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                {activeTags.map((tag, idx) => (
                  <Tag
                    key={tag.id || idx}
                    variant={
                      tag.variant === "live"
                        ? "live"
                        : isDark && tag.variant === "navy"
                        ? "gold"
                        : tag.variant || "default"
                    }
                  >
                    {tag.label}
                  </Tag>
                ))}
              </div>
            </EditableElementWrapper>

            <div className="space-y-4">
              {/* Eyebrow / Badge Element */}
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "badge"}
                label="Badge"
                onClick={() => onSelectElement?.("badge")}
                inline
              >
                <Eyebrow tone={isDark ? "gold" : "navy"} className="tracking-widest">
                  {badgeText}
                </Eyebrow>
              </EditableElementWrapper>

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
                  className={`max-w-2xl ${hlClass}`}
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

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "button"}
                label="Primary CTA"
                onClick={() => onSelectElement?.("button")}
                inline
              >
                <div className={isEditor ? "pointer-events-none" : ""}>
                  {buttonLink && buttonLink !== "/book" ? (
                    <Button
                      href={buttonLink}
                      className={`w-full sm:w-auto ${primaryBtn.className}`}
                      style={primaryBtn.style}
                    >
                      {primaryBtn.icon && primaryBtn.iconPosition === "left" && (
                        <Icon name={primaryBtn.icon} size={18} />
                      )}
                      <span>{buttonText}</span>
                      {primaryBtn.icon && primaryBtn.iconPosition === "right" && (
                        <Icon name={primaryBtn.icon} size={18} />
                      )}
                    </Button>
                  ) : (
                    <BookingCTAButton
                      className={`w-full sm:w-auto ${primaryBtn.className}`}
                      style={primaryBtn.style}
                    >
                      {primaryBtn.icon && primaryBtn.iconPosition === "left" && (
                        <Icon name={primaryBtn.icon} size={18} />
                      )}
                      <span>{buttonText}</span>
                      {primaryBtn.icon && primaryBtn.iconPosition === "right" && (
                        <Icon name={primaryBtn.icon} size={18} />
                      )}
                    </BookingCTAButton>
                  )}
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
                  <Button
                    href={secondaryButtonLink || "/courses"}
                    className={`w-full sm:w-auto ${secondaryBtn.className}`}
                    style={secondaryBtn.style}
                  >
                    {secondaryBtn.icon && secondaryBtn.iconPosition === "left" && (
                      <Icon name={secondaryBtn.icon} size={18} />
                    )}
                    <span>{secondaryButtonText}</span>
                    {secondaryBtn.icon && secondaryBtn.iconPosition === "right" && (
                      <Icon name={secondaryBtn.icon} size={18} />
                    )}
                  </Button>
                </div>
              </EditableElementWrapper>
            </div>

            {/* Small reassurance line beneath CTAs per PRD 10.1 */}
            <div className={`flex items-center gap-2 text-xs sm:text-sm pt-1 ${isDark ? "text-paper/80" : "text-ink-soft"}`}>
              <Icon
                name="check"
                size={16}
                className={`${isDark ? "text-gold-500" : "text-navy-900"} flex-shrink-0`}
              />
              <span>
                Pay in full and save, or spread the cost at no extra charge.
              </span>
            </div>
          </div>

          {/* Media Column: Real Learner Photo in Signature ArcMask */}
          <div className={`${mediaColSpan} relative ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "image"}
              label="Hero Photo"
              onClick={() => onSelectElement?.("image")}
              className="rounded-lg"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Offset decorative backdrop panel */}
                <div
                  className="absolute -inset-3 bg-navy-900/5 rounded-lg -rotate-1 transform pointer-events-none"
                  aria-hidden="true"
                />

                {/* ArcMasked Image with subtle gold accent edge */}
                <ArcMask accentBorder={true} curvePosition="bottom">
                  <div className="relative aspect-[4/3] w-full bg-line overflow-hidden">
                    <Image
                      src={image || "/images/hero-learner.jpg"}
                      alt="Adult learner smiling while attending live online class with notes and laptop"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                      priority
                      loading="eager"
                      className="object-cover object-center"
                    />
                  </div>
                </ArcMask>
              </div>
            </EditableElementWrapper>

            {/* Floating Live Classroom Indicator Pill */}
            {floatingBadgeEnabled !== false && (
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "floatingBadge"}
                label="Live Badge"
                onClick={() => onSelectElement?.("floatingBadge")}
                className="absolute -bottom-4 left-3 sm:left-6 max-w-[calc(100%-1.5rem)] z-30"
              >
                <div className="bg-white/95 backdrop-blur-md rounded-sm border border-line p-3 shadow-subtle flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-navy-900 text-white flex items-center justify-center flex-shrink-0">
                    <Icon
                      name={(floatingBadgeIcon as any) || "star"}
                      size={18}
                      className="text-gold-500"
                    />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="font-heading font-bold text-sm text-navy-900 block leading-tight truncate">
                      {floatingBadgeTitle || "Live Evening Sessions"}
                    </span>
                    <span className="text-xs text-ink-soft block leading-tight truncate">
                      {floatingBadgeSubtitle || "Recordings available 24/7 to rewatch"}
                    </span>
                  </div>
                </div>
              </EditableElementWrapper>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};
