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

interface Props {
  section: BuilderSection;
  isEditor?: boolean;
  courses?: Course[];
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
      | "floatingBadge",
    itemIndex?: number
  ) => void;
}

import {
  resolveSectionBg,
  isDarkHex,
  type SectionBgColor,
  type SectionBgPreset,
} from "@/components/ui/sectionBg";

export { resolveSectionBg, isDarkHex, type SectionBgColor, type SectionBgPreset };
import {
  resolveTypography,
  resolveSubheadlineTypography,
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
                <Tag variant={isDark ? "gold" : "navy"}>Spotlight Video</Tag>
                <span
                  className={`text-xs font-mono ${
                    isDark ? "text-gold-300" : "text-ink-soft"
                  }`}
                >
                  HD Playback
                </span>
              </div>

              <h3
                className={`font-heading text-lg font-bold mb-1 ${
                  isDark ? "text-white" : "text-navy-900"
                }`}
              >
                {section.videoTitle || "Classroom & Assessor Spotlight"}
              </h3>
              <p
                className={`text-xs mb-4 leading-relaxed ${
                  isDark ? "text-paper/70" : "text-ink-soft"
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
          secondaryButtonText={section.secondaryButtonText}
          secondaryButtonLink={section.secondaryButtonLink}
          secondaryButtonBgColor={section.secondaryButtonBgColor}
          secondaryButtonTextColor={section.secondaryButtonTextColor}
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

    case "trust_strip":
      return (
        <TrustStrip
          headline={section.headline}
          subheadline={section.subheadline}
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
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
          items={section.items}
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
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
          items={section.items}
          isEditor={isEditor}
          selectedElementKey={selectedElementKey}
          selectedElementItemIndex={selectedElementItemIndex}
          onSelectElement={onSelectElement}
        />
      );

    case "why_smartminds": {
      // Dynamic Smart Container with Modular Feature Cards + optional Split Image
      if (section.items && section.items.length > 0) {
        const isImageLeft = section.mediaPosition === "left";
        const hasImage = Boolean(section.image);

        const getSplitColSpans = (ratio?: string) => {
          switch (ratio) {
            case "50-50":
              return { main: "lg:col-span-6", side: "lg:col-span-6" };
            case "70-30":
              return { main: "lg:col-span-8", side: "lg:col-span-4" };
            case "40-60":
              return { main: "lg:col-span-5", side: "lg:col-span-7" };
            case "33-67":
              return { main: "lg:col-span-4", side: "lg:col-span-8" };
            case "60-40":
            default:
              return { main: "lg:col-span-7", side: "lg:col-span-5" };
          }
        };

        const { main: cardsColSpan, side: mediaColSpan } = getSplitColSpans(
          section.columnRatio
        );

        const colClass =
          section.columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : section.columns === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

        const paddingClass =
          section.paddingDensity === "compact"
            ? "py-10"
            : section.paddingDensity === "spacious"
            ? "py-24"
            : "py-16";

        const { bgClass, isDark, style } = resolveSectionBg(section.bgColor, "paper");

        const { className: hlClass, style: hlStyle } = resolveTypography({
          fontFamily: section.headlineFontFamily,
          fontSize: section.headlineFontSize,
          fontWeight: section.headlineFontWeight,
          fontStyle: section.headlineFontStyle,
          color: section.headlineColor,
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
              <div
                className={`max-w-3xl mb-12 ${
                  section.align === "center" ? "mx-auto text-center" : "text-left"
                }`}
              >
                {section.badgeText && (
                  <div
                    onClick={(e) => {
                      if (isEditor && onSelectElement) {
                        e.stopPropagation();
                        onSelectElement("badge");
                      }
                    }}
                    className={
                      isEditor
                        ? "cursor-pointer group/badge relative inline-block rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                        : ""
                    }
                  >
                    <Eyebrow tone={isDark ? "gold" : "navy"} className="mb-2">
                      {section.badgeText}
                    </Eyebrow>
                    {isEditor && (
                      <span className="hidden group-hover/badge:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                        Badge ✎
                      </span>
                    )}
                  </div>
                )}

                <div
                  onClick={(e) => {
                    if (isEditor && onSelectElement) {
                      e.stopPropagation();
                      onSelectElement("headline");
                    }
                  }}
                  className={
                    isEditor
                      ? "cursor-pointer group/h2 relative rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 p-0.5 -m-0.5"
                      : ""
                  }
                >
                  <Heading
                    level="h2"
                    style={hlStyle}
                    className={`mb-3 ${hlClass}`}
                  >
                    {section.headline}
                  </Heading>
                  {isEditor && (
                    <span className="hidden group-hover/h2:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                      Headline ✎
                    </span>
                  )}
                </div>

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
                    className={`leading-relaxed ${subClass}`}
                  >
                    {section.subheadline}
                  </p>
                  {isEditor && (
                    <span className="hidden group-hover/sub:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                      Subheadline ✎
                    </span>
                  )}
                </div>
              </div>

              {hasImage ? (
                /* Split Layout (Elementor Column Orientation) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Cards Column */}
                  <div
                    className={`${cardsColSpan} space-y-4 ${
                      isImageLeft ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.items.map((it, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            if (isEditor && onSelectElement) {
                              e.stopPropagation();
                              onSelectElement("item", idx);
                            }
                          }}
                          className={`p-5 rounded-lg border transition-all ${
                            isDark
                              ? "bg-white/5 border-white/10 hover:border-gold-500/40 text-white"
                              : "bg-white border-line shadow-subtle hover:border-navy-900/30 text-ink"
                          } ${
                            isEditor
                              ? "cursor-pointer group/card relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div
                              className={`w-9 h-9 rounded-sm flex items-center justify-center ${
                                isDark
                                  ? "bg-gold-500/10 text-gold-300"
                                  : "bg-navy-900 text-white"
                              }`}
                            >
                              <Icon
                                name={(it.icon as IconName) || "check-circle"}
                                size={16}
                                className={isDark ? "text-gold-300" : "text-gold-500"}
                              />
                            </div>
                            {it.tag && (
                              <Tag variant={isDark ? "gold" : "default"}>
                                {it.tag}
                              </Tag>
                            )}
                          </div>
                          <h3
                            className={`font-heading text-lg font-bold mb-1.5 ${
                              isDark ? "text-white" : "text-navy-900"
                            }`}
                          >
                            {it.title}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isDark ? "text-paper/80" : "text-ink-soft"
                            }`}
                          >
                            {it.desc}
                          </p>
                          {it.link && (
                            <Link
                              href={it.link}
                              className={`inline-flex items-center gap-1 text-xs font-bold mt-3 underline underline-offset-4 ${
                                isDark ? "text-gold-300" : "text-navy-900 hover:text-gold-700"
                              }`}
                            >
                              <span>Learn more</span>
                              <Icon name="arrow-right" size={12} />
                            </Link>
                          )}
                          {isEditor && (
                            <span className="hidden group-hover/card:inline-flex absolute top-2 right-2 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
                              Card #{idx + 1} ✎
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Media Column */}
                  <div
                    onClick={(e) => {
                      if (isEditor && onSelectElement) {
                        e.stopPropagation();
                        onSelectElement("image");
                      }
                    }}
                    className={`${mediaColSpan} relative ${
                      isImageLeft ? "lg:order-1" : "lg:order-2"
                    } ${
                      isEditor
                        ? "cursor-pointer group/img rounded-lg hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                        : ""
                    }`}
                  >
                    <ArcMask accentBorder={true} curvePosition="bottom">
                      <div className="relative aspect-[4/3] w-full bg-line overflow-hidden">
                        <Image
                          src={section.image || "/images/tutor-teaching.jpg"}
                          alt={section.headline}
                          fill
                          sizes="(max-width: 1024px) 100vw, 450px"
                          className="object-cover"
                        />
                      </div>
                    </ArcMask>
                    {isEditor && (
                      <span className="hidden group-hover/img:inline-flex absolute top-3 right-3 z-30 px-2 py-1 rounded-sm bg-navy-900 text-gold-300 text-[10px] font-bold shadow-md items-center gap-1">
                        <Icon name="layers" size={12} />
                        <span>Change Photo ✎</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Pure Grid Layout */
                <div className={`grid ${colClass} gap-6`}>
                  {section.items.map((it, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => {
                        if (isEditor && onSelectElement) {
                          e.stopPropagation();
                          onSelectElement("item", idx);
                        }
                      }}
                      className={`p-6 rounded-lg border transition-all ${
                        isDark
                          ? "bg-white/5 border-white/10 hover:border-gold-500/40 text-white"
                          : "bg-white border-line shadow-subtle hover:border-navy-900/30 text-ink"
                      } ${
                        isEditor
                          ? "cursor-pointer group/card relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div
                          className={`w-10 h-10 rounded-sm flex items-center justify-center ${
                            isDark
                              ? "bg-gold-500/10 text-gold-300"
                              : "bg-navy-900 text-white"
                          }`}
                        >
                          <Icon
                            name={(it.icon as IconName) || "check-circle"}
                            size={18}
                            className={isDark ? "text-gold-300" : "text-gold-500"}
                          />
                        </div>
                        {it.tag && (
                          <Tag variant={isDark ? "gold" : "default"}>
                            {it.tag}
                          </Tag>
                        )}
                      </div>
                      <h3
                        className={`font-heading text-xl font-bold mb-2 ${
                          isDark ? "text-white" : "text-navy-900"
                        }`}
                      >
                        {it.title}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDark ? "text-paper/80" : "text-ink-soft"
                        }`}
                      >
                        {it.desc}
                      </p>
                      {it.link && (
                        <Link
                          href={it.link}
                          className={`inline-flex items-center gap-1 text-xs font-bold mt-4 underline underline-offset-4 ${
                            isDark ? "text-gold-300" : "text-navy-900 hover:text-gold-700"
                          }`}
                        >
                          <span>Explore qualification</span>
                          <Icon name="arrow-right" size={12} />
                        </Link>
                      )}
                      {isEditor && (
                        <span className="hidden group-hover/card:inline-flex absolute top-3 right-3 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
                          Card #{idx + 1} ✎
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Container>
          </section>
        );
      }

      return (
        <HowItWorksTimeline
          headline={section.headline}
          subheadline={section.subheadline}
        />
      );
    }

    case "pricing":
      return (
        <PricingFlexibility
          headline={section.headline}
          subheadline={section.subheadline}
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
          items={section.items}
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
          buttonText={section.buttonText}
          buttonLink={section.buttonLink}
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
          courses={courses}
        />
      );

    case "testimonials":
      return (
        <ReviewsAndTestimonials
          headline={section.headline}
          subheadline={section.subheadline}
          videoTitle={section.videoTitle}
          videoDesc={section.videoDesc}
          videoThumbnail={section.videoThumbnail}
          videoUrl={section.videoUrl}
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
          items={section.items}
          bgColor={section.bgColor as any}
          columns={(section.columns === 1 ? 2 : section.columns) as 2 | 3 | 4 | undefined}
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
          secondaryButtonText={section.secondaryButtonText}
          secondaryButtonLink={section.secondaryButtonLink}
          secondaryButtonBgColor={section.secondaryButtonBgColor}
          secondaryButtonTextColor={section.secondaryButtonTextColor}
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
      const { bgClass: annBg, style: annStyle } = resolveSectionBg(section.bgColor, "navy");

      return (
        <div style={annStyle} className={`${annBg} py-3 px-4 sm:px-6`}>
          <Container>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-sm bg-gold-500 text-navy-900 flex-shrink-0">
                  <Icon name="bell" size={13} />
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-wide">
                  {section.headline}
                </span>
              </div>
              {section.buttonText && (
                <a
                  href={section.buttonLink || "/courses"}
                  className="px-3.5 py-1.5 rounded-sm bg-gold-500 hover:bg-gold-300 text-navy-900 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  {section.buttonText}
                </a>
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

      const { bgClass, isNavy, style } = resolveSectionBg(section.bgColor, "paper");

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
                className={`font-heading text-2xl sm:text-3xl font-bold mb-2 ${
                  isNavy ? "text-white" : "text-navy-900"
                } ${isEditor ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500" : ""}`}
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
                className={`text-xs sm:text-sm ${
                  isNavy ? "text-paper/80" : "text-ink-soft"
                } ${isEditor ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500" : ""}`}
              >
                {section.subheadline}
              </p>
            </div>
            <div className={`grid ${colClass} gap-4`}>
              {(section.items || []).map((it, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    if (isEditor && onSelectElement) {
                      e.stopPropagation();
                      onSelectElement("item", idx);
                    }
                  }}
                  className={`p-4 rounded-sm text-center space-y-1 ${
                    isNavy
                      ? "bg-white/5 border border-white/10"
                      : "bg-white border border-line shadow-xs"
                  } ${
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
                    className={`font-heading text-3xl font-bold block ${
                      isNavy ? "text-gold-300" : "text-navy-900"
                    }`}
                  >
                    {it.title}
                  </span>
                  <strong
                    className={`text-xs block ${
                      isNavy ? "text-white" : "text-ink"
                    }`}
                  >
                    {it.tag || "Verified Metric"}
                  </strong>
                  <span
                    className={`text-[11px] block leading-tight ${
                      isNavy ? "text-white/70" : "text-ink-soft"
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
              ))}
            </div>
          </Container>
        </div>
      );
    }

    case "contact_block": {
      const { bgClass: contactBg, style: contactStyle } = resolveSectionBg(section.bgColor, "paper");

      return (
        <div style={contactStyle} className={`${contactBg} py-14 border-y border-line`}>
          <Container>
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg border border-line shadow-subtle space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-1">
                  {section.headline}
                </h2>
                <p className="text-xs sm:text-sm text-ink-soft">
                  {section.subheadline}
                </p>
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
              <button
                type="button"
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-heading font-bold text-sm rounded-sm transition-colors"
              >
                {section.buttonText || "Request Free Advice Call"}
              </button>
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

    default:
      return null;
  }
};
