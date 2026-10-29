"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HeroSection,
  TrustStrip,
  ChooseYourPath,
  HowItWorksTimeline,
  PricingFlexibility,
  FeaturedCourses,
  ReviewsAndTestimonials,
  HomeFAQ,
  FinalCTABand,
  StudentIDBenefitsSection,
  StaffTrainingSection,
  CoralPromoBanner,
  ExclusiveBundlesSection,
  WhyChooseUsSection,
} from "@/components/home";
import { BuilderSection } from "@/lib/repositories/seedData";
import { Icon, IconName } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { ArcMask } from "@/components/ui/ArcMask";
import { Button } from "@/components/ui/Button";
import { ConsentGuard } from "@/components/consent/ConsentGuard";
import { CompositeBlockRenderer } from "@/components/cms/CompositeBlockRenderer";
import { resolveCustomButtonClasses } from "@/components/ui/buttonCustomizer";
import type { Course } from "@/content/types";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";
import { siteConfig } from "@/content/siteConfig";
import { formatCurrency } from "@/content";
import { DEFAULT_COLLEGE_FACULTIES, type FacultyRecord } from "@/content/faculties";
import { CoursesListingView } from "@/components/course/CoursesListingView";
import { GeneralContactForm } from "@/components/forms/GeneralContactForm";
import { FundedEligibilityForm } from "@/components/forms/FundedEligibilityForm";
import { PrivateTutoringForm } from "@/components/forms/PrivateTutoringForm";
import { NativeScheduler } from "@/components/booking/NativeScheduler";

interface Props {
  section: BuilderSection;
  isEditor?: boolean;
  courses?: Course[];
  faculties?: FacultyRecord[];
  selectedElementKey?:
    | "headline"
    | "subheadline"
    | "badge"
    | "tags"
    | "button"
    | "secondaryButton"
    | "image"
    | "item"
    | "bg"
    | "video"
    | "floatingBadge"
    | "sealBadge"
    | "trustNote"
    | "socialProof"
    | "reassurance"
    | "callout"
    | null;
  selectedElementItemIndex?: number | null;
  onSelectElement?: (
    elementKey:
      | "headline"
      | "subheadline"
      | "badge"
      | "tags"
      | "button"
      | "secondaryButton"
      | "image"
      | "item"
      | "bg"
      | "video"
      | "floatingBadge"
      | "sealBadge"
      | "trustNote"
      | "socialProof"
      | "reassurance"
      | "callout",
    itemIndex?: number
  ) => void;
}

import {
  resolveSectionBg,
  isDarkHex,
  resolveItemColor,
  type SectionBgColor,
  type SectionBgPreset,
} from "@/components/ui/sectionBg";

export { resolveSectionBg, isDarkHex, type SectionBgColor, type SectionBgPreset };
import {
  resolveTypography,
  resolveSubheadlineTypography,
  resolveCardContainerStyles,
  resolveBadgeStyles,
} from "@/components/ui/typographyUtils";

export function isDirectVideo(url?: string): boolean {
  if (!url) return false;
  return Boolean(url.trim().match(/\.(mp4|webm|ogg|mov)($|\?)/i));
}

export function formatEmbedUrl(url?: string, hideControls = false): string {
  if (!url) return "";
  const clean = url.trim();

  // Direct MP4/WebM video stream
  if (isDirectVideo(clean)) {
    return clean;
  }

  // YouTube watch / short link / embed / shorts
  const ytMatch = clean.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch && ytMatch[1]) {
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      enablejsapi: "1",
      ...(hideControls
        ? {
            controls: "0",
            disablekb: "1",
            iv_load_policy: "3",
          }
        : {
            controls: "1",
          }),
    });
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?${params.toString()}`;
  }

  // Vimeo standard / player link
  const vimeoMatch = clean.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/
  );
  if (vimeoMatch && vimeoMatch[3]) {
    const params = new URLSearchParams({
      autoplay: "1",
      dnt: "1",
      ...(hideControls
        ? {
            controls: "0",
            title: "0",
            byline: "0",
            portrait: "0",
            badge: "0",
          }
        : {}),
    });
    return `https://player.vimeo.com/video/${vimeoMatch[3]}?${params.toString()}`;
  }

  return clean;
}

const VideoSpotlightBlock: React.FC<{
  section: BuilderSection;
  isEditor?: boolean;
  selectedElementKey?: Props["selectedElementKey"];
  selectedElementItemIndex?: Props["selectedElementItemIndex"];
  onSelectElement?: Props["onSelectElement"];
}> = ({ section, isEditor, selectedElementKey, selectedElementItemIndex, onSelectElement }) => {
  const [videoRequested, setVideoRequested] = React.useState(false);
  const embedUrl = formatEmbedUrl(section.videoUrl, true);
  const isImageLeft = section.mediaPosition === "left";
  const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");

  const paddingClass =
    section.paddingDensity === "compact"
      ? "py-10"
      : section.paddingDensity === "spacious"
      ? "py-24"
      : "py-16";

  const getColSpans = (ratio?: string) => {
    switch (ratio) {
      case "50-50":
        return { text: "lg:col-span-6", video: "lg:col-span-6" };
      case "70-30":
        return { text: "lg:col-span-8", video: "lg:col-span-4" };
      case "40-60":
        return { text: "lg:col-span-5", video: "lg:col-span-7" };
      case "33-67":
        return { text: "lg:col-span-4", video: "lg:col-span-8" };
      case "60-40":
      default:
        return { text: "lg:col-span-7", video: "lg:col-span-5" };
    }
  };

  const { text: textColSpan, video: videoColSpan } = getColSpans(
    section.columnRatio
  );

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: section.headlineFontFamily,
    fontSize: section.headlineFontSize,
    fontWeight: section.headlineFontWeight,
    fontStyle: section.headlineFontStyle,
    color: section.headlineColor,
    align: section.headlineAlign,
    transform: section.headlineTransform,
    isDark,
    defaultFamily: "heading",
    defaultSize: "lg",
    defaultWeight: "bold",
  });

  const { className: subClass, style: subStyle } = resolveSubheadlineTypography({
    fontFamily: section.subheadlineFontFamily,
    fontSize: section.subheadlineFontSize,
    fontWeight: section.subheadlineFontWeight,
    fontStyle: section.subheadlineFontStyle,
    color: section.subheadlineColor,
    align: section.subheadlineAlign,
    isDark,
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

  return (
    <section
      style={style}
      className={`${bgClass} ${paddingClass} border-b border-line`}
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text / Content Column */}
          <div
            className={`${textColSpan} space-y-4 ${
              isImageLeft ? "lg:order-2" : "lg:order-1"
            }`}
          >
            {section.badgeText && (
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "badge"}
                label="Badge"
                onClick={() => onSelectElement?.("badge")}
                inline
              >
                <Eyebrow tone={isDark ? "gold" : "navy"} className="mb-2">
                  {section.badgeText}
                </Eyebrow>
              </EditableElementWrapper>
            )}

            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "headline"}
              label="Headline"
              onClick={() => onSelectElement?.("headline")}
            >
              <Heading
                level="h2"
                style={hlStyle}
                className={hlClass}
              >
                {section.headline}
              </Heading>
            </EditableElementWrapper>

            {section.subheadline && (
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "subheadline"}
                label="Subheadline"
                onClick={() => onSelectElement?.("subheadline")}
              >
                <p
                  style={subStyle}
                  className={`leading-relaxed ${subClass}`}
                >
                  {section.subheadline}
                </p>
              </EditableElementWrapper>
            )}

            {(section.buttonText || section.secondaryButtonText) && (() => {
              const primaryBtn = resolveCustomButtonClasses(
                {
                  bgColor: section.buttonBgColor,
                  textColor: section.buttonTextColor,
                  fontFamily: section.buttonFontFamily,
                  fontWeight: section.buttonFontWeight,
                  textTransform: section.buttonTextTransform,
                  icon: section.buttonIcon,
                  iconPosition: section.buttonIconPosition,
                  radius: section.buttonRadius,
                  size: section.buttonSize,
                },
                isDark ? "on-navy-gold" : "primary",
                "md",
                isDark
              );

              const secondaryBtn = resolveCustomButtonClasses(
                {
                  bgColor: section.secondaryButtonBgColor,
                  textColor: section.secondaryButtonTextColor,
                  fontFamily: section.secondaryButtonFontFamily,
                  fontWeight: section.secondaryButtonFontWeight,
                  textTransform: section.secondaryButtonTextTransform,
                  icon: section.secondaryButtonIcon,
                  iconPosition: section.secondaryButtonIconPosition,
                  radius: section.secondaryButtonRadius,
                  size: section.secondaryButtonSize,
                },
                "outline",
                "md",
                isDark
              );

              return (
                <div className="flex flex-wrap gap-4 pt-2">
                  {section.buttonText && (
                    <EditableElementWrapper
                      isEditor={isEditor}
                      isSelected={isEditor && selectedElementKey === "button"}
                      label="Primary CTA"
                      onClick={() => onSelectElement?.("button")}
                      inline
                    >
                      <div className={isEditor ? "pointer-events-none" : ""}>
                        <Button
                          href={section.buttonLink}
                          className={primaryBtn.className}
                          style={primaryBtn.style}
                        >
                          {primaryBtn.icon && primaryBtn.iconPosition === "left" && (
                            <Icon name={primaryBtn.icon} size={16} />
                          )}
                          <span>{section.buttonText}</span>
                          {primaryBtn.icon && primaryBtn.iconPosition === "right" && (
                            <Icon name={primaryBtn.icon} size={16} />
                          )}
                        </Button>
                      </div>
                    </EditableElementWrapper>
                  )}
                  {section.secondaryButtonText && (
                    <EditableElementWrapper
                      isEditor={isEditor}
                      isSelected={isEditor && selectedElementKey === "secondaryButton"}
                      label="Secondary CTA"
                      onClick={() => onSelectElement?.("secondaryButton")}
                      inline
                    >
                      <div className={isEditor ? "pointer-events-none" : ""}>
                        <Button
                          href={section.secondaryButtonLink}
                          className={secondaryBtn.className}
                          style={secondaryBtn.style}
                        >
                          {secondaryBtn.icon && secondaryBtn.iconPosition === "left" && (
                            <Icon name={secondaryBtn.icon} size={16} />
                          )}
                          <span>{section.secondaryButtonText}</span>
                          {secondaryBtn.icon && secondaryBtn.iconPosition === "right" && (
                            <Icon name={secondaryBtn.icon} size={16} />
                          )}
                        </Button>
                      </div>
                    </EditableElementWrapper>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Video Player / Showcase Column */}
          <div
            className={`${videoColSpan} ${
              isImageLeft ? "lg:order-1" : "lg:order-2"
            }`}
          >
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "video"}
              label="Video Spotlight"
              onClick={() => onSelectElement?.("video")}
              className="rounded-lg"
            >
              <div
                className={`rounded-lg border p-5 transition-all ${
                  isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-white border-line shadow-subtle"
                }`}
              >

              <div className="flex items-center justify-between mb-3">
                <span
                  style={{
                    color: section.videoTagColor,
                    backgroundColor: section.videoTagBgColor,
                  }}
                  className={`inline-block px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider ${
                    !section.videoTagBgColor
                      ? isDark
                        ? "bg-gold-500/20 text-gold-300 border border-gold-500/30"
                        : "bg-navy-900 text-gold-300"
                      : ""
                  }`}
                >
                  {section.videoTag || "Spotlight Video"}
                </span>
                <span
                  style={{ color: section.videoBadgeColor }}
                  className={`text-xs font-mono ${
                    !section.videoBadgeColor
                      ? isDark
                        ? "text-gold-300"
                        : "text-ink-soft"
                      : ""
                  }`}
                >
                  {section.videoBadge || "HD Playback"}
                </span>
              </div>

              <h3
                style={{
                  color: section.videoTitleColor,
                  fontFamily: section.videoTitleFontFamily
                    ? `var(--font-${section.videoTitleFontFamily})`
                    : undefined,
                  fontSize:
                    section.videoTitleFontSize === "xl"
                      ? "1.5rem"
                      : section.videoTitleFontSize === "lg"
                      ? "1.25rem"
                      : section.videoTitleFontSize === "sm"
                      ? "1rem"
                      : undefined,
                  fontWeight:
                    section.videoTitleFontWeight === "bold"
                      ? 700
                      : section.videoTitleFontWeight === "medium"
                      ? 500
                      : undefined,
                }}
                className={`font-heading text-lg font-bold mb-1 ${
                  !section.videoTitleColor
                    ? isDark
                      ? "text-white"
                      : "text-navy-900"
                    : ""
                }`}
              >
                {section.videoTitle || "Classroom & Assessor Spotlight"}
              </h3>
              <p
                style={{
                  color: section.videoDescColor,
                  fontSize: section.videoDescFontSize,
                }}
                className={`text-xs mb-4 leading-relaxed ${
                  !section.videoDescColor
                    ? isDark
                      ? "text-paper/70"
                      : "text-ink-soft"
                    : ""
                }`}
              >
                {section.videoDesc ||
                  "Watch real student experiences and live lecture previews."}
              </p>

              {!videoRequested ? (
                <div
                  onClick={() => setVideoRequested(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setVideoRequested(true);
                    }
                  }}
                  aria-label={`Play video spotlight: ${section.videoTitle || "Video story"}`}
                  className="relative aspect-[16/10] w-full rounded-md bg-navy-900/10 border border-line overflow-hidden flex flex-col items-center justify-center p-6 text-center group cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative w-full h-full absolute inset-0 opacity-40 group-hover:opacity-30 transition-opacity">
                    <Image
                      src={
                        section.videoThumbnail ||
                        section.image ||
                        "/images/tutor-teaching.jpg"
                      }
                      alt={section.videoTitle || "Video thumbnail"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 550px"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative z-10 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-navy-900 text-white flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                      <Icon name="video" size={24} className="text-gold-300" />
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoRequested(true);
                      }}
                    >
                      Play Video Story
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[16/10] w-full rounded-md bg-black border border-line overflow-hidden">
                  {isDirectVideo(section.videoUrl) ? (
                    <video
                      src={section.videoUrl}
                      autoPlay
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={section.videoTitle || "Spotlight Video"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white text-xs p-4 text-center">
                      <p>
                        No video embed URL configured. Enter a YouTube, Vimeo,
                        or video stream link in the inspector.
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoRequested(false);
                    }}
                    aria-label="Close video spotlight"
                    className="absolute top-2 right-2 px-2.5 py-1 bg-navy-900/90 hover:bg-navy-900 text-white/90 hover:text-white rounded-sm text-xs font-semibold border border-white/20 transition-colors z-20 cursor-pointer shadow-md"
                  >
                    Close Video
                  </button>
                </div>
              )}
              </div>
            </EditableElementWrapper>
          </div>
        </div>
      </Container>
    </section>
  );
};

export const SectionRenderer: React.FC<Props> = ({
  section,
  isEditor = false,
  courses,
  faculties,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  if (!section.enabled && !isEditor) return null;

  switch (section.type) {
    case "hero":
      return (
        <HeroSection
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          tags={section.tags}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          buttonBgColor={section.buttonBgColor}
          buttonTextColor={section.buttonTextColor}
          buttonFontFamily={section.buttonFontFamily}
          buttonFontWeight={section.buttonFontWeight}
          buttonTextTransform={section.buttonTextTransform}
          buttonIcon={section.buttonIcon}
          buttonIconPosition={section.buttonIconPosition}
          buttonRadius={section.buttonRadius}
          buttonSize={section.buttonSize}
          buttonHoverBgColor={section.buttonHoverBgColor}
          buttonHoverTextColor={section.buttonHoverTextColor}
          secondaryButtonText={section.secondaryButtonText}
          secondaryButtonLink={section.secondaryButtonLink}
          secondaryButtonBgColor={section.secondaryButtonBgColor}
          secondaryButtonTextColor={section.secondaryButtonTextColor}
          secondaryButtonHoverBgColor={section.secondaryButtonHoverBgColor}
          secondaryButtonHoverTextColor={section.secondaryButtonHoverTextColor}
          secondaryButtonFontFamily={section.secondaryButtonFontFamily}
          secondaryButtonFontWeight={section.secondaryButtonFontWeight}
          secondaryButtonTextTransform={section.secondaryButtonTextTransform}
          secondaryButtonIcon={section.secondaryButtonIcon}
          secondaryButtonIconPosition={section.secondaryButtonIconPosition}
          secondaryButtonRadius={section.secondaryButtonRadius}
          secondaryButtonSize={section.secondaryButtonSize}
          image={section.image}
          floatingBadgeTitle={section.floatingBadgeTitle}
          floatingBadgeSubtitle={section.floatingBadgeSubtitle}
          floatingBadgeIcon={section.floatingBadgeIcon}
          floatingBadgeEnabled={section.floatingBadgeEnabled}
          mediaPosition={section.mediaPosition}
          columnRatio={section.columnRatio}
          align={section.align}
          alignMobile={section.alignMobile}
          paddingDensity={section.paddingDensity}
          paddingDensityMobile={section.paddingDensityMobile}
          bgColor={section.bgColor as any}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          sealText={section.sealText}
          sealLink={section.sealLink}
          sealVideoUrl={section.sealVideoUrl}
          sealBgColor={section.sealBgColor}
          sealTextColor={section.sealTextColor}
          sealPlayColor={section.sealPlayColor}
          sealFontSize={section.sealFontSize}
          sealEnabled={section.sealEnabled}
          socialProofEnabled={section.socialProofEnabled}
          avatar1Text={section.avatar1Text}
          avatar1Bg={section.avatar1Bg}
          avatar1Color={section.avatar1Color}
          avatar2Text={section.avatar2Text}
          avatar2Bg={section.avatar2Bg}
          avatar2Color={section.avatar2Color}
          avatar3Text={section.avatar3Text}
          avatar3Bg={section.avatar3Bg}
          avatar3Color={section.avatar3Color}
          socialProofRating={section.socialProofRating}
          socialProofRatingColor={section.socialProofRatingColor}
          socialProofStars={section.socialProofStars}
          socialProofStarColor={section.socialProofStarColor}
          socialProofText={section.socialProofText}
          socialProofTextColor={section.socialProofTextColor}
          reassuranceEnabled={section.reassuranceEnabled}
          reassuranceText={section.reassuranceText}
          reassuranceIcon={section.reassuranceIcon}
          reassuranceTextColor={section.reassuranceTextColor}
          reassuranceIconColor={section.reassuranceIconColor}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={(el) => onSelectElement?.(el)}
        />
      );

    case "trust_strip":
      return (
        <TrustStrip
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          items={section.items}
          bgColor={section.bgColor as any}
          columnRatio={section.columnRatio}
          mediaPosition={section.mediaPosition}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "choose_path":
      return (
        <ChooseYourPath
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          badgeFontFamily={section.badgeFontFamily}
          badgeWeight={section.badgeWeight}
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
          items={section.items}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          buttonBgColor={section.buttonBgColor}
          buttonTextColor={section.buttonTextColor}
          buttonHoverBgColor={section.buttonHoverBgColor}
          buttonHoverTextColor={section.buttonHoverTextColor}
          buttonFontFamily={section.buttonFontFamily}
          buttonFontWeight={section.buttonFontWeight}
          buttonTextTransform={section.buttonTextTransform}
          buttonIcon={section.buttonIcon as any}
          buttonIconPosition={section.buttonIconPosition}
          buttonRadius={section.buttonRadius}
          buttonSize={section.buttonSize}
          buttonEnabled={section.buttonEnabled}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "how_it_works":
      return (
        <HowItWorksTimeline
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          badgeFontFamily={section.badgeFontFamily}
          badgeWeight={section.badgeWeight}
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
          items={section.items}
          calloutHeadline={section.calloutHeadline}
          calloutText={section.calloutText}
          calloutBadge={section.calloutBadge}
          calloutIcon={section.calloutIcon}
          calloutBgColor={section.calloutBgColor}
          showCallout={section.showCallout}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "why_smartminds":
      return (
        <WhyChooseUsSection
          id={section.id}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          badgeFontFamily={section.badgeFontFamily}
          badgeWeight={section.badgeWeight}
          headline={section.headline}
          subheadline={section.subheadline}
          items={section.items}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          buttonBgColor={section.buttonBgColor}
          buttonTextColor={section.buttonTextColor}
          buttonHoverBgColor={section.buttonHoverBgColor}
          buttonHoverTextColor={section.buttonHoverTextColor}
          buttonFontFamily={section.buttonFontFamily}
          buttonFontWeight={section.buttonFontWeight}
          buttonTextTransform={section.buttonTextTransform}
          buttonIcon={section.buttonIcon}
          buttonIconPosition={section.buttonIconPosition}
          buttonRadius={section.buttonRadius}
          buttonSize={section.buttonSize}
          trustNote={section.trustNote}
          trustNoteIcon={section.trustNoteIcon}
          trustNoteColor={section.trustNoteColor}
          image={section.image}
          image2={section.image2}
          image3={section.image3}
          floatingBadgeTitle={section.floatingBadgeTitle}
          floatingBadgeSubtitle={section.floatingBadgeSubtitle}
          floatingBadgeIcon={section.floatingBadgeIcon}
          floatingBadgeEnabled={section.floatingBadgeEnabled}
          bgColor={section.bgColor}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          paddingDensity={section.paddingDensity}
          mediaPosition={section.mediaPosition}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "pricing":
      return (
        <PricingFlexibility
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          badgeFontFamily={section.badgeFontFamily}
          badgeWeight={section.badgeWeight}
          trustNote={section.trustNote}
          trustNoteColor={section.trustNoteColor}
          trustNoteFontFamily={section.trustNoteFontFamily}
          trustNoteFontSize={section.trustNoteFontSize}
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
          items={section.items}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "featured_courses":
      return (
        <FeaturedCourses
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          badgeFontFamily={section.badgeFontFamily}
          badgeWeight={section.badgeWeight}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          buttonBgColor={section.buttonBgColor}
          buttonTextColor={section.buttonTextColor}
          buttonHoverBgColor={section.buttonHoverBgColor}
          buttonHoverTextColor={section.buttonHoverTextColor}
          buttonFontFamily={section.buttonFontFamily}
          buttonFontWeight={section.buttonFontWeight}
          buttonTextTransform={section.buttonTextTransform}
          buttonIcon={section.buttonIcon}
          buttonIconPosition={section.buttonIconPosition}
          buttonRadius={section.buttonRadius}
          buttonSize={section.buttonSize}
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
          rows={section.rows}
          courseLimit={section.courseLimit}
          categoryFilter={section.courseCategoryFilter}
          courses={courses}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "testimonials":
      return (
        <ReviewsAndTestimonials
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          badgeFontFamily={section.badgeFontFamily}
          badgeWeight={section.badgeWeight}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          videoTitle={section.videoTitle}
          videoDesc={section.videoDesc}
          videoThumbnail={section.videoThumbnail}
          videoUrl={section.videoUrl}
          videoTag={section.videoTag}
          videoTagColor={section.videoTagColor}
          videoTagBgColor={section.videoTagBgColor}
          videoBadge={section.videoBadge}
          videoBadgeColor={section.videoBadgeColor}
          videoTitleColor={section.videoTitleColor}
          videoTitleFontFamily={section.videoTitleFontFamily}
          videoTitleFontSize={section.videoTitleFontSize}
          videoTitleFontWeight={section.videoTitleFontWeight}
          videoDescColor={section.videoDescColor}
          videoDescFontSize={section.videoDescFontSize}
          columnRatio={section.columnRatio}
          bgColor={section.bgColor as any}
          mediaPosition={section.mediaPosition}
          items={section.items}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "video_spotlight":
      return (
        <VideoSpotlightBlock
          section={section}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "faq_accordion":
      return (
        <HomeFAQ
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          badgeFontFamily={section.badgeFontFamily}
          badgeWeight={section.badgeWeight}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          items={section.items}
          bgColor={section.bgColor as any}
          columns={section.columns as 1 | 2 | 3 | 4 | undefined}
          calloutHeadline={section.calloutHeadline}
          calloutText={section.calloutText}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          secondaryButtonText={section.secondaryButtonText}
          secondaryButtonLink={section.secondaryButtonLink}
          calloutBgColor={section.calloutBgColor}
          showCallout={section.showCallout}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "cta_banner":
      return (
        <FinalCTABand
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          badgeColor={section.badgeColor}
          badgeBgColor={section.badgeBgColor}
          badgeFontFamily={section.badgeFontFamily}
          badgeWeight={section.badgeWeight}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          buttonBgColor={section.buttonBgColor}
          buttonTextColor={section.buttonTextColor}
          buttonHoverBgColor={section.buttonHoverBgColor}
          buttonHoverTextColor={section.buttonHoverTextColor}
          buttonFontFamily={section.buttonFontFamily}
          buttonFontWeight={section.buttonFontWeight}
          buttonTextTransform={section.buttonTextTransform}
          buttonIcon={section.buttonIcon}
          buttonIconPosition={section.buttonIconPosition}
          buttonRadius={section.buttonRadius}
          buttonSize={section.buttonSize}
          secondaryButtonText={section.secondaryButtonText}
          secondaryButtonLink={section.secondaryButtonLink}
          secondaryButtonBgColor={section.secondaryButtonBgColor}
          secondaryButtonTextColor={section.secondaryButtonTextColor}
          secondaryButtonHoverBgColor={section.secondaryButtonHoverBgColor}
          secondaryButtonHoverTextColor={section.secondaryButtonHoverTextColor}
          secondaryButtonFontFamily={section.secondaryButtonFontFamily}
          secondaryButtonFontWeight={section.secondaryButtonFontWeight}
          secondaryButtonTextTransform={section.secondaryButtonTextTransform}
          secondaryButtonIcon={section.secondaryButtonIcon}
          secondaryButtonIconPosition={section.secondaryButtonIconPosition}
          secondaryButtonRadius={section.secondaryButtonRadius}
          secondaryButtonSize={section.secondaryButtonSize}
          bgColor={section.bgColor as any}
          align={section.align}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "announcement": {
      const { bgClass: annBg, isDark: annDark, style: annStyle } = resolveSectionBg(section.bgColor, "navy");
      const { className: annHlClass, style: annHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        isDark: annDark,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "semibold",
      });
      const btnAnn = resolveCustomButtonClasses({
        bgColor: section.buttonBgColor,
        textColor: section.buttonTextColor,
        hoverBgColor: section.buttonHoverBgColor,
        hoverTextColor: section.buttonHoverTextColor,
        fontFamily: section.buttonFontFamily,
        fontWeight: section.buttonFontWeight,
        textTransform: section.buttonTextTransform,
        radius: section.buttonRadius,
        size: section.buttonSize || "sm",
      });

      return (
        <div style={annStyle} className={`${annBg} py-3 px-4 sm:px-6`}>
          <Container>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-sm bg-gold-500 text-navy-900 flex-shrink-0">
                  <Icon name="bell" size={13} />
                </span>
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "headline"}
                  label="Announcement Text"
                  onClick={() => onSelectElement?.("headline")}
                >
                  <span style={annHlStyle} className={`tracking-wide ${annHlClass}`}>
                    {section.headline}
                  </span>
                </EditableElementWrapper>
              </div>
              {section.buttonText && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "button"}
                  label="Button"
                  onClick={() => onSelectElement?.("button")}
                >
                  <a
                    href={section.buttonLink || "/courses"}
                    style={btnAnn.style}
                    className={`px-3.5 py-1.5 rounded-sm bg-gold-500 hover:bg-gold-300 text-navy-900 text-xs font-bold transition-colors whitespace-nowrap ${btnAnn.className}`}
                  >
                    {section.buttonText}
                  </a>
                </EditableElementWrapper>
              )}
            </div>
          </Container>
        </div>
      );
    }

    case "stats_counter": {
      const colClass =
        section.columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : section.columns === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2 sm:grid-cols-4";

      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const { className: statHlClass, style: statHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: statSubClass, style: statSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });

      return (
        <div style={style} className={`${bgClass} py-12`}>
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("headline");
                  }
                }}
                style={statHlStyle}
                className={`mb-2 ${statHlClass} ${
                  isEditor ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500" : ""
                }`}
              >
                {section.headline}
              </h2>
              <p
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("subheadline");
                  }
                }}
                style={statSubStyle}
                className={`${statSubClass} ${
                  isEditor ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500" : ""
                }`}
              >
                {section.subheadline}
              </p>
            </div>
            <div className={`grid ${colClass} gap-4`}>
              {(section.items || []).map((it, idx) => {
                const { containerClass, containerStyle, titleStyle, descStyle } = resolveCardContainerStyles(it, isDark);
                return (
                  <div
                    key={idx}
                    onClick={(e) => {
                      if (isEditor && onSelectElement) {
                        e.stopPropagation();
                        onSelectElement("item", idx);
                      }
                    }}
                    style={containerStyle}
                    className={`text-center space-y-1 ${containerClass} ${
                      isEditor
                        ? "cursor-pointer group/stat relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                        : ""
                    }`}
                  >
                    {it.icon && (
                      <Icon
                        name={it.icon as IconName}
                        size={20}
                        className="text-gold-500 mx-auto mb-1"
                      />
                    )}
                    <span
                      style={titleStyle}
                      className={`font-heading text-3xl font-bold block ${
                        isDark ? "text-gold-300" : "text-navy-900"
                      }`}
                    >
                      {it.title}
                    </span>
                    <strong
                      className={`text-xs block ${
                        isDark ? "text-white" : "text-ink"
                      }`}
                    >
                      {it.tag || "Verified Metric"}
                    </strong>
                    <span
                      style={descStyle}
                      className={`text-[11px] block leading-tight ${
                        isDark ? "text-white/70" : "text-ink-soft"
                      }`}
                    >
                      {it.desc}
                    </span>
                    {isEditor && (
                      <span className="hidden group-hover/stat:inline-flex absolute top-1 right-1 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
                        Stat #{idx + 1} ✎
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Container>
        </div>
      );
    }

    case "contact_block": {
      const { bgClass: contactBg, isDark: contactDark, style: contactStyle } = resolveSectionBg(section.bgColor, "paper");
      const { className: cbHlClass, style: cbHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark: false,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: cbSubClass, style: cbSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark: false,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });
      const cbBtn = resolveCustomButtonClasses({
        bgColor: section.buttonBgColor,
        textColor: section.buttonTextColor,
        hoverBgColor: section.buttonHoverBgColor,
        hoverTextColor: section.buttonHoverTextColor,
        fontFamily: section.buttonFontFamily,
        fontWeight: section.buttonFontWeight,
        textTransform: section.buttonTextTransform,
        radius: section.buttonRadius,
        size: section.buttonSize,
      });

      return (
        <div style={contactStyle} className={`${contactBg} py-14 border-y border-line`}>
          <Container>
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg border border-line shadow-subtle space-y-4">
              <div>
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "headline"}
                  label="Form Headline"
                  onClick={() => onSelectElement?.("headline")}
                >
                  <h2 style={cbHlStyle} className={`mb-1 ${cbHlClass}`}>
                    {section.headline}
                  </h2>
                </EditableElementWrapper>
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "subheadline"}
                  label="Form Subtitle"
                  onClick={() => onSelectElement?.("subheadline")}
                >
                  <p style={cbSubStyle} className={cbSubClass}>
                    {section.subheadline}
                  </p>
                </EditableElementWrapper>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Full Name"
                  disabled={isEditor}
                  className="px-3 py-2 border border-line rounded-sm bg-paper text-ink"
                />
                <input
                  type="tel"
                  placeholder="UK Phone Number"
                  disabled={isEditor}
                  className="px-3 py-2 border border-line rounded-sm bg-paper text-ink"
                />
                <input
                  type="text"
                  placeholder="Course of Interest"
                  disabled={isEditor}
                  className="sm:col-span-2 px-3 py-2 border border-line rounded-sm bg-paper text-ink"
                />
              </div>
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "button"}
                label="Submit Button"
                onClick={() => onSelectElement?.("button")}
                className="block"
              >
                <button
                  type="button"
                  style={cbBtn.style}
                  className={`w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-heading font-bold text-sm rounded-sm transition-colors ${cbBtn.className}`}
                >
                  {section.buttonText || "Request Free Advice Call"}
                </button>
              </EditableElementWrapper>
            </div>
          </Container>
        </div>
      );
    }

    case "composite_block": {
      return (
        <CompositeBlockRenderer
          section={section}
          isEditor={isEditor}
          onSelectElement={onSelectElement}
        />
      );
    }

    case "student_benefits": {
      return (
        <StudentIDBenefitsSection
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          bgColor={section.bgColor as any}
          items={section.items}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );
    }

    case "staff_training": {
      return (
        <StaffTrainingSection
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          metricsBannerTitle={section.metricsBannerTitle}
          metricsBannerSubtitle={section.metricsBannerSubtitle}
          items={section.items}
          image={section.image}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          bgColor={section.bgColor as any}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );
    }

    case "coral_promo": {
      return (
        <CoralPromoBanner
          headline={section.headline}
          subheadline={section.subheadline}
          badgeText={section.badgeText}
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          buttonBgColor={section.buttonBgColor}
          buttonTextColor={section.buttonTextColor}
          secondaryButtonText={section.secondaryButtonText}
          secondaryButtonLink={section.secondaryButtonLink}
          secondaryButtonBgColor={section.secondaryButtonBgColor}
          secondaryButtonTextColor={section.secondaryButtonTextColor}
          image={section.image}
          items={section.items}
          bgColor={section.bgColor as any}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );
    }

    case "exclusive_bundles": {
      return (
        <ExclusiveBundlesSection
          headline={section.headline}
          subheadline={section.subheadline}
          items={section.items}
          bgColor={section.bgColor as any}
          headlineFontFamily={section.headlineFontFamily}
          headlineFontSize={section.headlineFontSize}
          headlineFontWeight={section.headlineFontWeight}
          headlineFontStyle={section.headlineFontStyle}
          headlineColor={section.headlineColor}
          headlineTransform={section.headlineTransform}
          headlineAlign={section.headlineAlign}
          subheadlineFontFamily={section.subheadlineFontFamily}
          subheadlineFontSize={section.subheadlineFontSize}
          subheadlineFontWeight={section.subheadlineFontWeight}
          subheadlineFontStyle={section.subheadlineFontStyle}
          subheadlineColor={section.subheadlineColor}
          subheadlineAlign={section.subheadlineAlign}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );
    }

    case "courses_listing": {
      const listingCourses = courses && courses.length > 0 ? courses : [];
      const listingFaculties =
        faculties && faculties.length > 0
          ? faculties
          : DEFAULT_COLLEGE_FACULTIES;
      const { bgClass, style } = resolveSectionBg(section.bgColor, "paper");

      return (
        <section style={style} className={`${bgClass} min-h-screen`}>
          <CoursesListingView
            initialCourses={listingCourses}
            initialFaculties={listingFaculties}
            customHeadline={section.headline}
            customSubheadline={section.subheadline}
            bgColor={section.bgColor}
            badgeText={section.badgeText}
            badgeColor={section.badgeColor}
            badgeBgColor={section.badgeBgColor}
            badgeFontFamily={section.badgeFontFamily}
            badgeWeight={section.badgeWeight}
            headlineFontFamily={section.headlineFontFamily}
            headlineFontSize={section.headlineFontSize}
            headlineFontWeight={section.headlineFontWeight}
            headlineFontStyle={section.headlineFontStyle}
            headlineColor={section.headlineColor}
            headlineTransform={section.headlineTransform}
            headlineAlign={section.headlineAlign}
            subheadlineFontFamily={section.subheadlineFontFamily}
            subheadlineFontSize={section.subheadlineFontSize}
            subheadlineFontWeight={section.subheadlineFontWeight}
            subheadlineFontStyle={section.subheadlineFontStyle}
            subheadlineColor={section.subheadlineColor}
            subheadlineAlign={section.subheadlineAlign}
            isEditor={isEditor}
            selectedElementKey={selectedElementKey}
            onSelectElement={(el) => onSelectElement?.(el)}
          />
        </section>
      );
    }

    case "page_header": {
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const badges = section.badgeText
        ? section.badgeText.split("•").map((s) => s.trim()).filter(Boolean)
        : [];
      const { className: phHlClass, style: phHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign || section.align,
        isDark,
        defaultFamily: "heading",
        defaultSize: "xl",
        defaultWeight: "bold",
      });
      const { className: phSubClass, style: phSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign || section.align,
        isDark,
        defaultFamily: "body",
        defaultSize: "lg",
        defaultWeight: "normal",
      });
      const { className: phBadgeClass, style: phBadgeStyle } = resolveBadgeStyles({
        color: section.badgeColor,
        bgColor: section.badgeBgColor,
        fontFamily: section.badgeFontFamily,
        weight: section.badgeWeight,
        isDark,
        variant: isDark ? "gold" : "navy",
      });
      const padClass =
        section.paddingDensity === "compact"
          ? "py-6 md:py-10"
          : section.paddingDensity === "spacious"
          ? "py-14 md:py-20"
          : "py-10 md:py-14";
      const alignContainerClass =
        section.align === "center" || section.headlineAlign === "center"
          ? "max-w-3xl mx-auto text-center"
          : (section.align as string) === "right" || section.headlineAlign === "right"
          ? "max-w-3xl ml-auto text-right"
          : "max-w-3xl";

      return (
        <header style={style} className={`${bgClass} ${padClass} border-b border-line`}>
          <Container>
            <div className={alignContainerClass}>
              {badges.length > 0 && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "badge"}
                  label="Header Badges"
                  onClick={() => onSelectElement?.("badge")}
                  className="inline-block mb-3"
                >
                  <div
                    className={`flex flex-wrap items-center gap-2 ${
                      section.align === "center" || section.headlineAlign === "center" ? "justify-center" : ""
                    }`}
                  >
                    {badges.map((b, i) =>
                      section.badgeColor || section.badgeBgColor ? (
                        <span
                          key={i}
                          style={phBadgeStyle}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs uppercase tracking-wider ${phBadgeClass}`}
                        >
                          {b}
                        </span>
                      ) : (
                        <Tag key={i} variant={i === 0 ? "gold" : "navy"}>
                          {b}
                        </Tag>
                      )
                    )}
                  </div>
                </EditableElementWrapper>
              )}
              {section.eyebrow && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "badge"}
                  label="Eyebrow"
                  onClick={() => onSelectElement?.("badge")}
                  className="inline-block mb-2"
                >
                  <Eyebrow
                    tone={isDark ? "gold" : "navy"}
                    style={phBadgeStyle}
                    className={section.badgeColor || section.badgeBgColor ? phBadgeClass : ""}
                  >
                    {section.eyebrow}
                  </Eyebrow>
                </EditableElementWrapper>
              )}
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "headline"}
                label="Page Headline"
                onClick={() => onSelectElement?.("headline")}
              >
                <Heading
                  level="h1"
                  style={phHlStyle}
                  className={`mb-4 ${phHlClass}`}
                >
                  {section.headline}
                </Heading>
              </EditableElementWrapper>
              {section.subheadline && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "subheadline"}
                  label="Description"
                  onClick={() => onSelectElement?.("subheadline")}
                >
                  <p style={phSubStyle} className={`leading-relaxed ${phSubClass}`}>
                    {section.subheadline}
                  </p>
                </EditableElementWrapper>
              )}
            </div>
          </Container>
        </header>
      );
    }

    case "about_story": {
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const { className: asHlClass, style: asHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: asSubClass, style: asSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark,
        defaultFamily: "body",
        defaultSize: "md",
        defaultWeight: "normal",
      });
      const { className: asBadgeClass, style: asBadgeStyle } = resolveBadgeStyles({
        color: section.badgeColor,
        bgColor: section.badgeBgColor,
        fontFamily: section.badgeFontFamily,
        weight: section.badgeWeight,
        isDark,
        variant: isDark ? "gold" : "navy",
      });
      const asBtn = resolveCustomButtonClasses({
        bgColor: section.buttonBgColor,
        textColor: section.buttonTextColor,
        hoverBgColor: section.buttonHoverBgColor,
        hoverTextColor: section.buttonHoverTextColor,
        fontFamily: section.buttonFontFamily,
        fontWeight: section.buttonFontWeight,
        textTransform: section.buttonTextTransform,
        radius: section.buttonRadius,
        size: section.buttonSize,
      });
      const isMediaLeft = section.mediaPosition === "left";
      const padClass =
        section.paddingDensity === "compact"
          ? "py-8 md:py-10"
          : section.paddingDensity === "spacious"
          ? "py-16 md:py-24"
          : "py-12";

      return (
        <section style={style} className={`${bgClass} ${padClass} border-b border-line`}>
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className={`lg:col-span-7 space-y-5 ${isMediaLeft ? "lg:order-2" : "lg:order-1"}`}>
                {section.badgeText && (
                  <EditableElementWrapper
                    isEditor={isEditor}
                    isSelected={isEditor && selectedElementKey === "badge"}
                    label="Story Badge"
                    onClick={() => onSelectElement?.("badge")}
                    className="inline-block"
                  >
                    {section.badgeColor || section.badgeBgColor ? (
                      <span
                        style={asBadgeStyle}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs uppercase tracking-wider ${asBadgeClass}`}
                      >
                        {section.badgeText}
                      </span>
                    ) : (
                      <Tag variant={isDark ? "gold" : "navy"}>{section.badgeText}</Tag>
                    )}
                  </EditableElementWrapper>
                )}
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "headline"}
                  label="Story Headline"
                  onClick={() => onSelectElement?.("headline")}
                >
                  <Heading level="h2" style={asHlStyle} className={asHlClass}>
                    {section.headline}
                  </Heading>
                </EditableElementWrapper>
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "subheadline"}
                  label="Story Description"
                  onClick={() => onSelectElement?.("subheadline")}
                >
                  <div
                    style={asSubStyle}
                    className={`space-y-4 leading-relaxed whitespace-pre-line ${asSubClass}`}
                  >
                    {section.subheadline}
                  </div>
                </EditableElementWrapper>
                {section.buttonText && section.buttonEnabled !== false && (
                  <div className="pt-2">
                    <EditableElementWrapper
                      isEditor={isEditor}
                      isSelected={isEditor && selectedElementKey === "button"}
                      label="CTA Button"
                      onClick={() => onSelectElement?.("button")}
                      className="inline-block"
                    >
                      <Button
                        href={section.buttonLink || "/courses"}
                        variant="primary"
                        size={section.buttonSize || "md"}
                        style={asBtn.style}
                        className={asBtn.className}
                      >
                        {section.buttonText}
                      </Button>
                    </EditableElementWrapper>
                  </div>
                )}
              </div>
              <div className={`lg:col-span-5 ${isMediaLeft ? "lg:order-1" : "lg:order-2"}`}>
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "image"}
                  label="Story Image"
                  onClick={() => onSelectElement?.("image")}
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-line shadow-subtle bg-line">
                    <Image
                      src={section.image || "/images/tutor-teaching.jpg"}
                      alt={section.headline || "Tutor teaching class"}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover"
                    />
                  </div>
                </EditableElementWrapper>
              </div>
            </div>
          </Container>
        </section>
      );
    }

    case "accreditations_block": {
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "white");
      const accItems = section.items && section.items.length > 0
        ? section.items
        : siteConfig.accreditations.map((acc) => ({
            title: acc.acronym,
            tag: acc.name,
            desc: acc.description,
            icon: "shield-check",
          }));
      const { className: accHlClass, style: accHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: accSubClass, style: accSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });
      const { className: accBadgeClass, style: accBadgeStyle } = resolveBadgeStyles({
        color: section.badgeColor,
        bgColor: section.badgeBgColor,
        fontFamily: section.badgeFontFamily,
        weight: section.badgeWeight,
        isDark,
        variant: isDark ? "gold" : "navy",
      });
      const colClass =
        section.columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : section.columns === 4
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-3";

      return (
        <section
          aria-labelledby="accreditation-heading"
          style={style}
          className={`${bgClass} py-12 border-b border-line`}
        >
          <Container>
            <div className="max-w-2xl mb-8 space-y-2">
              {section.badgeText && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "badge"}
                  label="Eyebrow"
                  onClick={() => onSelectElement?.("badge")}
                  className="inline-block"
                >
                  <Eyebrow
                    tone={isDark ? "gold" : "navy"}
                    style={accBadgeStyle}
                    className={section.badgeColor || section.badgeBgColor ? accBadgeClass : ""}
                  >
                    {section.badgeText}
                  </Eyebrow>
                </EditableElementWrapper>
              )}
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "headline"}
                label="Accreditation Headline"
                onClick={() => onSelectElement?.("headline")}
              >
                <Heading level="h2" id="accreditation-heading" style={accHlStyle} className={accHlClass}>
                  {section.headline}
                </Heading>
              </EditableElementWrapper>
              {section.subheadline && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "subheadline"}
                  label="Accreditation Subtitle"
                  onClick={() => onSelectElement?.("subheadline")}
                >
                  <p style={accSubStyle} className={`leading-relaxed ${accSubClass}`}>
                    {section.subheadline}
                  </p>
                </EditableElementWrapper>
              )}
            </div>

            <div className={`grid ${colClass} gap-6`}>
              {accItems.map((acc, idx) => {
                const { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle } =
                  resolveCardContainerStyles(acc as any, isDark);
                const isSelected =
                  isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={(e) => {
                      if (isEditor && onSelectElement) {
                        e.stopPropagation();
                        onSelectElement("item", idx);
                      }
                    }}
                    style={containerStyle}
                    className={`space-y-2 ${containerClass} ${
                      isSelected ? "ring-2 ring-gold-500 border-navy-900" : ""
                    } ${
                      isEditor ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        name={((acc as any).icon as IconName) || "shield-check"}
                        size={18}
                        className={isDark ? "text-gold-300" : "text-navy-900"}
                      />
                      <strong style={titleStyle} className={titleClass}>
                        {acc.title}
                      </strong>
                    </div>
                    <h3 className={`text-xs font-semibold ${isDark ? "text-gold-300" : "text-gold-700"}`}>
                      {acc.tag}
                    </h3>
                    <p style={descStyle} className={`text-xs leading-relaxed ${descClass}`}>
                      {acc.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      );
    }

    case "team_grid": {
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const teamItems = section.items && section.items.length > 0
        ? section.items
        : siteConfig.team.map((m) => ({
            title: m.name,
            tag: m.role,
            desc: m.credentials,
            image: m.image,
          }));
      const { className: tmHlClass, style: tmHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: tmSubClass, style: tmSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });
      const { className: tmBadgeClass, style: tmBadgeStyle } = resolveBadgeStyles({
        color: section.badgeColor,
        bgColor: section.badgeBgColor,
        fontFamily: section.badgeFontFamily,
        weight: section.badgeWeight,
        isDark,
        variant: isDark ? "gold" : "navy",
      });
      const colClass =
        section.columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : section.columns === 4
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-3";

      return (
        <section
          aria-labelledby="team-heading"
          style={style}
          className={`${bgClass} py-12 border-b border-line`}
        >
          <Container>
            <div className="max-w-2xl mb-8 space-y-1">
              {section.badgeText && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "badge"}
                  label="Team Eyebrow"
                  onClick={() => onSelectElement?.("badge")}
                  className="inline-block"
                >
                  <Eyebrow
                    tone={isDark ? "gold" : "navy"}
                    style={tmBadgeStyle}
                    className={section.badgeColor || section.badgeBgColor ? tmBadgeClass : ""}
                  >
                    {section.badgeText}
                  </Eyebrow>
                </EditableElementWrapper>
              )}
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "headline"}
                label="Team Headline"
                onClick={() => onSelectElement?.("headline")}
              >
                <Heading level="h2" id="team-heading" style={tmHlStyle} className={tmHlClass}>
                  {section.headline}
                </Heading>
              </EditableElementWrapper>
              {section.subheadline && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "subheadline"}
                  label="Team Subtitle"
                  onClick={() => onSelectElement?.("subheadline")}
                >
                  <p style={tmSubStyle} className={`leading-relaxed ${tmSubClass}`}>
                    {section.subheadline}
                  </p>
                </EditableElementWrapper>
              )}
            </div>

            <div className={`grid ${colClass} gap-6`}>
              {teamItems.map((member, idx) => {
                const { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle } =
                  resolveCardContainerStyles(member as any, isDark);
                const isSelected =
                  isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={(e) => {
                      if (isEditor && onSelectElement) {
                        e.stopPropagation();
                        onSelectElement("item", idx);
                      }
                    }}
                    style={containerStyle}
                    className={`space-y-4 ${containerClass} ${
                      isSelected ? "ring-2 ring-gold-500 border-navy-900" : ""
                    } ${
                      isEditor ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500" : ""
                    }`}
                  >
                    <div className="relative aspect-square rounded-sm overflow-hidden bg-line">
                      <Image
                        src={member.image || "/images/tutor-sarah.jpg"}
                        alt={member.title}
                        fill
                        sizes="300px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <strong style={titleStyle} className={`block ${titleClass}`}>
                        {member.title}
                      </strong>
                      <span className={`text-xs font-semibold block mb-1 ${isDark ? "text-gold-300" : "text-gold-700"}`}>
                        {member.tag}
                      </span>
                      <p style={descStyle} className={`text-xs leading-relaxed font-mono text-[11px] ${descClass}`}>
                        {member.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      );
    }

    case "legal_notice": {
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const { className: lnHlClass, style: lnHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "semibold",
      });
      const { className: lnSubClass, style: lnSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });

      return (
        <section style={style} className={`${bgClass} py-8 border-b border-line`}>
          <Container>
            <div
              className={`p-6 rounded-lg border text-center text-xs leading-relaxed ${
                isDark ? "bg-white/5 border-white/15 text-paper/85" : "bg-paper border-line text-ink-soft"
              }`}
            >
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "headline"}
                label="Legal Title"
                onClick={() => onSelectElement?.("headline")}
              >
                <p style={lnHlStyle} className={`mb-1 ${lnHlClass}`}>
                  {section.headline || "Company Legal Registration"}
                </p>
              </EditableElementWrapper>
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "subheadline"}
                label="Legal Registration Text"
                onClick={() => onSelectElement?.("subheadline")}
              >
                <p style={lnSubStyle} className={lnSubClass}>
                  {section.subheadline || siteConfig.legalLine}
                </p>
              </EditableElementWrapper>
            </div>
          </Container>
        </section>
      );
    }

    case "contact_split": {
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const { className: csHlClass, style: csHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark: false,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: csSubClass, style: csSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark: false,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });
      const isMediaLeft = section.mediaPosition === "left";

      return (
        <section style={style} className={`${bgClass} py-10 md:py-16`}>
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Direct channels and office hours */}
              <div className={`lg:col-span-5 space-y-6 ${isMediaLeft ? "lg:order-2" : "lg:order-1"}`}>
                {/* WhatsApp Highlight Box */}
                <div className="p-6 rounded-lg bg-navy-900 text-white space-y-4 shadow-subtle">
                  <div className="flex items-center gap-2">
                    <Icon name="whatsapp" size={24} className="text-emerald-400" />
                    <h2 className="font-heading font-bold text-xl text-white">
                      Chat on WhatsApp
                    </h2>
                  </div>
                  <p className="text-xs text-paper/85 leading-relaxed">
                    Need a fast answer regarding course prices or start dates?
                    Message our admissions team directly on WhatsApp during business hours.
                  </p>
                  <a
                    href={siteConfig.contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center min-h-[44px] w-full px-4 rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-sm transition-colors shadow-sm gap-2"
                  >
                    <Icon name="whatsapp" size={18} />
                    <span>Message Admissions Team</span>
                  </a>
                </div>

                {/* Contact Details Card */}
                <div className="bg-white rounded-lg border border-line p-6 shadow-subtle space-y-5">
                  <h3 className="font-heading font-bold text-lg text-navy-900 border-b border-line pb-3">
                    Office Information
                  </h3>
                  <div className="space-y-4 text-sm text-ink">
                    <div className="flex items-start gap-3">
                      <Icon name="map-pin" size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block font-heading font-bold text-navy-900 text-xs uppercase tracking-wider mb-0.5">
                          Postal Address
                        </strong>
                        <address className="not-italic text-xs text-ink-soft leading-relaxed">
                          {siteConfig.contact.address}
                        </address>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="phone" size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block font-heading font-bold text-navy-900 text-xs uppercase tracking-wider mb-0.5">
                          Telephone
                        </strong>
                        <a href={`tel:${siteConfig.contact.phone}`} className="text-xs text-ink hover:text-navy-900 font-semibold underline">
                          {siteConfig.contact.phoneDisplay}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="mail" size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block font-heading font-bold text-navy-900 text-xs uppercase tracking-wider mb-0.5">
                          Email Admissions
                        </strong>
                        <a href={`mailto:${siteConfig.contact.email}`} className="text-xs text-ink hover:text-navy-900 font-semibold underline">
                          {siteConfig.contact.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="clock" size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block font-heading font-bold text-navy-900 text-xs uppercase tracking-wider mb-0.5">
                          Opening Hours
                        </strong>
                        <p className="text-xs text-ink-soft leading-relaxed">
                          {siteConfig.contact.openingHours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: General Contact Form */}
              <div className={`lg:col-span-7 ${isMediaLeft ? "lg:order-1" : "lg:order-2"}`}>
                <div className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle">
                  <div className="mb-6">
                    <EditableElementWrapper
                      isEditor={isEditor}
                      isSelected={isEditor && selectedElementKey === "headline"}
                      label="Form Headline"
                      onClick={() => onSelectElement?.("headline")}
                    >
                      <h2 style={csHlStyle} className={`mb-2 ${csHlClass}`}>
                        {section.headline || "Send an Admissions Enquiry"}
                      </h2>
                    </EditableElementWrapper>
                    <EditableElementWrapper
                      isEditor={isEditor}
                      isSelected={isEditor && selectedElementKey === "subheadline"}
                      label="Form Subtitle"
                      onClick={() => onSelectElement?.("subheadline")}
                    >
                      <p style={csSubStyle} className={`leading-relaxed ${csSubClass}`}>
                        {section.subheadline ||
                          "Complete the short form below and an academic advisor will get back to you within 24 business hours."}
                      </p>
                    </EditableElementWrapper>
                  </div>
                  <GeneralContactForm sourcePage="/contact" />
                </div>
              </div>
            </div>
          </Container>
        </section>
      );
    }

    case "funding_split": {
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const { className: fsHlClass, style: fsHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark: false,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: fsSubClass, style: fsSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark: false,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });
      const fundingItems =
        section.items && section.items.length > 0
          ? section.items
          : [
              {
                title: "Adult Education Budget",
                tag: "AEB Funding",
                desc: "For adults aged 19+ looking to gain foundational Level 2 and Level 3 diplomas in healthcare, adult care, and education support.",
              },
              {
                title: "National Skills Fund",
                tag: "Free Courses for Jobs",
                desc: "Full funding for eligible adults to complete high-value Level 3 qualifications, even if you already hold a Level 3 in an unrelated subject.",
              },
            ];

      return (
        <section style={style} className={`${bgClass} py-10 md:py-16`}>
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Plain-language funding explanation */}
              <div className="lg:col-span-7 space-y-8">
                {/* How Government Funding Works */}
                <div className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle space-y-4">
                  <EditableElementWrapper
                    isEditor={isEditor}
                    isSelected={isEditor && selectedElementKey === "headline"}
                    label="Funding Headline"
                    onClick={() => onSelectElement?.("headline")}
                  >
                    <Heading level="h2" style={fsHlStyle} className={fsHlClass}>
                      {section.headline || "How does government funding work?"}
                    </Heading>
                  </EditableElementWrapper>
                  <EditableElementWrapper
                    isEditor={isEditor}
                    isSelected={isEditor && selectedElementKey === "subheadline"}
                    label="Funding Description"
                    onClick={() => onSelectElement?.("subheadline")}
                  >
                    <p style={fsSubStyle} className={`leading-relaxed ${fsSubClass}`}>
                      {section.subheadline ||
                        "UK government funding is designed to upskill adults in vital sectors including adult social care, education, and early years nurseries. If you meet residency and eligibility thresholds, the government covers 100% of your course fees — you pay zero tuition."}
                    </p>
                  </EditableElementWrapper>
                  <div className="p-4 rounded-sm bg-paper border border-line space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-navy-900 font-bold block">
                      {siteConfig.funding.complianceWarning}
                    </span>
                    <p className="text-xs text-ink-soft leading-relaxed font-mono">
                      {siteConfig.funding.eligibilityNote}
                    </p>
                  </div>
                </div>

                {/* Core Funded Initiatives */}
                <div className="space-y-4">
                  <Heading level="h2" className={`${isDark ? "text-white" : "text-navy-900"} text-2xl`}>
                    Funded Programmes Available
                  </Heading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fundingItems.map((item, idx) => {
                      const { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle } =
                        resolveCardContainerStyles(item as any, false);
                      const isSelected =
                        isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            if (isEditor && onSelectElement) {
                              e.stopPropagation();
                              onSelectElement("item", idx);
                            }
                          }}
                          style={containerStyle}
                          className={`space-y-2 ${containerClass} ${
                            isSelected ? "ring-2 ring-gold-500 border-navy-900" : ""
                          } ${
                            isEditor
                              ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500"
                              : ""
                          }`}
                        >
                          <Tag variant={idx === 0 ? "gold" : "navy"}>{item.tag || "Funded Route"}</Tag>
                          <h3 style={titleStyle} className={titleClass}>
                            {item.title}
                          </h3>
                          <p style={descStyle} className={`text-xs leading-relaxed ${descClass}`}>
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Funding Eligibility Form */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle">
                  <div className="mb-6">
                    <h2 className="font-heading font-bold text-2xl text-navy-900 mb-2">
                      Check Your Funding Eligibility
                    </h2>
                    <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                      Complete this 60-second assessment and our finance coordinator will verify your funding route.
                    </p>
                  </div>
                  <FundedEligibilityForm sourcePage="/funding" />
                </div>
              </div>
            </div>
          </Container>
        </section>
      );
    }

    case "cpd_listing": {
      const cpdCourses = (courses || []).filter((c) => c.type === "cpd" && c.published);
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const { className: cpdHlClass, style: cpdHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: cpdSubClass, style: cpdSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });

      return (
        <section style={style} className={`${bgClass} py-10 md:py-16`}>
          <Container>
            <div className="space-y-6">
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "headline"}
                label="CPD Headline"
                onClick={() => onSelectElement?.("headline")}
              >
                <Heading level="h2" style={cpdHlStyle} className={cpdHlClass}>
                  {section.headline || "Available CPD Programmes"}
                </Heading>
              </EditableElementWrapper>
              {section.subheadline && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "subheadline"}
                  label="CPD Subtitle"
                  onClick={() => onSelectElement?.("subheadline")}
                >
                  <p style={cpdSubStyle} className={`leading-relaxed ${cpdSubClass}`}>
                    {section.subheadline}
                  </p>
                </EditableElementWrapper>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cpdCourses.map((course) => {
                  const level = course.levels[0];
                  return (
                    <article
                      key={course.id}
                      className="bg-white rounded-lg border border-line p-6 shadow-subtle flex flex-col justify-between hover:border-navy-900/30 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold uppercase text-gold-700 tracking-wider">
                            {course.category}
                          </span>
                          <Tag variant="default" className="text-xs">
                            {level?.level_label || "CPD"}
                          </Tag>
                        </div>
                        <h3 className="font-heading text-xl font-bold text-navy-900">
                          <Link href={`/courses/${course.slug}`}>
                            {course.title}
                          </Link>
                        </h3>
                        <p className="text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-3">
                          {course.summary}
                        </p>
                      </div>
                      <div className="pt-6 mt-6 border-t border-line flex items-center justify-between">
                        <div>
                          <span className="text-[11px] uppercase text-ink-soft font-mono block">
                            Fee
                          </span>
                          <strong className="font-heading font-bold text-xl text-navy-900">
                            {formatCurrency(level?.price_gbp || 95)}
                          </strong>
                        </div>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-bold text-xs transition-colors"
                        >
                          <span>Enrol &amp; details</span>
                          <Icon name="arrow-right" size={14} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      );
    }

    case "tutoring_split": {
      const { bgClass, style } = resolveSectionBg(section.bgColor, "paper");
      const { className: tsHlClass, style: tsHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark: false,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: tsSubClass, style: tsSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark: false,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });
      const tutoringItems =
        section.items && section.items.length > 0
          ? section.items
          : [
              {
                title: "Mathematics (KS3 & GCSE)",
                desc: "Foundation & Higher tiers. Number work, algebra, ratio, geometry, and past paper step-by-step problem solving.",
              },
              {
                title: "English Language & Lit",
                desc: "Creative writing, reading comprehension, textual analysis, and essay structuring for AQA and Edexcel exam boards.",
              },
            ];

      return (
        <section style={style} className={`${bgClass} py-10 md:py-16`}>
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Tutoring Information */}
              <div className="lg:col-span-7 space-y-8">
                <div className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle space-y-4">
                  <EditableElementWrapper
                    isEditor={isEditor}
                    isSelected={isEditor && selectedElementKey === "headline"}
                    label="Tutoring Headline"
                    onClick={() => onSelectElement?.("headline")}
                  >
                    <Heading level="h2" style={tsHlStyle} className={tsHlClass}>
                      {section.headline || "What We Offer"}
                    </Heading>
                  </EditableElementWrapper>
                  <EditableElementWrapper
                    isEditor={isEditor}
                    isSelected={isEditor && selectedElementKey === "subheadline"}
                    label="Tutoring Description"
                    onClick={() => onSelectElement?.("subheadline")}
                  >
                    <p style={tsSubStyle} className={`leading-relaxed ${tsSubClass}`}>
                      {section.subheadline ||
                        "Every child learns at a different pace. Our 1-on-1 tutoring pairs your child with a patient, qualified educator who tailors each 60-minute lesson to target areas where your child needs the most reinforcement."}
                    </p>
                  </EditableElementWrapper>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {tutoringItems.map((item, idx) => {
                      const { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle } =
                        resolveCardContainerStyles({ cardBg: "paper", ...item } as any, false);
                      const isSelected =
                        isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            if (isEditor && onSelectElement) {
                              e.stopPropagation();
                              onSelectElement("item", idx);
                            }
                          }}
                          style={containerStyle}
                          className={`space-y-1.5 ${containerClass} ${
                            isSelected ? "ring-2 ring-gold-500 border-navy-900" : ""
                          } ${
                            isEditor
                              ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500"
                              : ""
                          }`}
                        >
                          <h3 style={titleStyle} className={titleClass}>
                            {item.title}
                          </h3>
                          <p style={descStyle} className={`text-xs leading-relaxed ${descClass}`}>
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Safeguarding Reassurance */}
                <div className="p-6 rounded-lg bg-navy-900 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon name="shield-check" size={20} className="text-gold-500" />
                    <h3 className="font-heading font-bold text-lg text-white">
                      Rigorous Tutor Safeguarding
                    </h3>
                  </div>
                  <p className="text-xs text-paper/85 leading-relaxed">
                    All tutors undergo Enhanced DBS vetting, photo ID verification, and reference checks. Sessions are delivered in our supervised online classroom.
                  </p>
                </div>
              </div>

              {/* Right Column: Private Tutoring Form */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle">
                  <div className="mb-6">
                    <h2 className="font-heading font-bold text-2xl text-navy-900 mb-2">
                      Request Tutoring Consultation
                    </h2>
                    <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                      Tell us about your child&apos;s year group and learning goals. We will match you with a specialist tutor.
                    </p>
                  </div>
                  <PrivateTutoringForm sourcePage="/private-tutoring" />
                </div>
              </div>
            </div>
          </Container>
        </section>
      );
    }

    case "scheduler_block": {
      const liveCourseOptions = (courses || []).map((c) => ({
        id: c.id,
        title: c.title,
        published: c.published,
      }));
      const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");
      const { className: sbHlClass, style: sbHlStyle } = resolveTypography({
        fontFamily: section.headlineFontFamily,
        fontSize: section.headlineFontSize,
        fontWeight: section.headlineFontWeight,
        fontStyle: section.headlineFontStyle,
        color: section.headlineColor,
        transform: section.headlineTransform,
        align: section.headlineAlign,
        isDark,
        defaultFamily: "heading",
        defaultSize: "lg",
        defaultWeight: "bold",
      });
      const { className: sbSubClass, style: sbSubStyle } = resolveSubheadlineTypography({
        fontFamily: section.subheadlineFontFamily,
        fontSize: section.subheadlineFontSize,
        fontWeight: section.subheadlineFontWeight,
        fontStyle: section.subheadlineFontStyle,
        color: section.subheadlineColor,
        align: section.subheadlineAlign,
        isDark,
        defaultFamily: "body",
        defaultSize: "sm",
        defaultWeight: "normal",
      });
      const schedulerItems =
        section.items && section.items.length > 0
          ? section.items
          : [
              { title: "15 Minutes", desc: "Short, focused discussion" },
              { title: "Real Tutors", desc: "Speak to subject teachers" },
              { title: "Zero Obligation", desc: "Purely informational advice" },
            ];

      return (
        <section style={style} className={`${bgClass} py-10 md:py-16`}>
          <Container>
            <div className="max-w-3xl mx-auto space-y-8">
              {(section.headline || section.subheadline) && (
                <div className="text-center space-y-2">
                  {section.headline && (
                    <EditableElementWrapper
                      isEditor={isEditor}
                      isSelected={isEditor && selectedElementKey === "headline"}
                      label="Scheduler Headline"
                      onClick={() => onSelectElement?.("headline")}
                    >
                      <Heading level="h2" style={sbHlStyle} className={sbHlClass}>
                        {section.headline}
                      </Heading>
                    </EditableElementWrapper>
                  )}
                  {section.subheadline && (
                    <EditableElementWrapper
                      isEditor={isEditor}
                      isSelected={isEditor && selectedElementKey === "subheadline"}
                      label="Scheduler Subtitle"
                      onClick={() => onSelectElement?.("subheadline")}
                    >
                      <p style={sbSubStyle} className={sbSubClass}>
                        {section.subheadline}
                      </p>
                    </EditableElementWrapper>
                  )}
                </div>
              )}

              {/* College Consultation Scheduler Card */}
              <div className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle">
                <NativeScheduler coursesList={liveCourseOptions} />
              </div>

              {/* Consultation Reassurance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {schedulerItems.map((item, idx) => {
                  const { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle } =
                    resolveCardContainerStyles(item as any, isDark);
                  const isSelected =
                    isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={(e) => {
                        if (isEditor && onSelectElement) {
                          e.stopPropagation();
                          onSelectElement("item", idx);
                        }
                      }}
                      style={containerStyle}
                      className={`text-xs space-y-1 ${containerClass} ${
                        isSelected ? "ring-2 ring-gold-500 border-navy-900" : ""
                      } ${
                        isEditor
                          ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500"
                          : ""
                      }`}
                    >
                      <strong style={titleStyle} className={`block ${titleClass}`}>
                        {item.title}
                      </strong>
                      <span style={descStyle} className={descClass}>
                        {item.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      );
    }

    default:
      return null;
  }
};
