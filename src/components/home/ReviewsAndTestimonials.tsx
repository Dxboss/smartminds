"use client";

import React, { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/content/siteConfig";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { formatEmbedUrl, isDirectVideo } from "@/components/cms/SectionRenderer";
import { resolveSectionBg, SectionBgColor } from "@/components/ui/sectionBg";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";
import { resolveCardContainerStyles } from "@/components/ui/typographyUtils";

export interface ReviewsAndTestimonialsProps {
  headline?: string;
  subheadline?: string;
  videoTitle?: string;
  videoDesc?: string;
  videoThumbnail?: string;
  videoUrl?: string;
  columnRatio?: "50-50" | "60-40" | "70-30" | "40-60" | "33-67";
  bgColor?: SectionBgColor;
  mediaPosition?: "left" | "right";
  items?: import("@/lib/repositories/seedData").BuilderSectionItem[];
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

export const ReviewsAndTestimonials: React.FC<ReviewsAndTestimonialsProps> = ({
  headline = "Real stories from qualified graduates",
  subheadline = "Read how healthcare workers, aspiring tutors, and career changers achieved their Ofqual-regulated certificates with Smartminds.",
  videoTitle = "Watch learners share their qualification journey",
  videoDesc = "Real feedback recorded by our graduates sharing their study experience, tutor support, and career progression.",
  videoThumbnail = "/images/certificate-moment.jpg",
  videoUrl,
  columnRatio = "60-40",
  bgColor = "paper",
  mediaPosition = "right",
  items,
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const isImageLeft = mediaPosition === "left";
  const { isDark } = resolveSectionBg(bgColor, "paper");
  const [tiktokRequested, setTiktokRequested] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const effectiveVideoUrl = (videoUrl && videoUrl.trim()) || "";

  const handleTogglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectVideo(effectiveVideoUrl)) {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    } else if (iframeRef.current?.contentWindow) {
      const command = isPlaying ? "pauseVideo" : "playVideo";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: "" }),
        "*"
      );
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectVideo(effectiveVideoUrl)) {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
      }
    } else if (iframeRef.current?.contentWindow) {
      const command = isMuted ? "unMute" : "mute";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: "" }),
        "*"
      );
      setIsMuted(!isMuted);
    }
  };

  // Dynamic Column Ratio Spans
  const getColSpans = (ratio?: string) => {
    switch (ratio) {
      case "50-50":
        return { left: "lg:col-span-6", right: "lg:col-span-6" };
      case "70-30":
        return { left: "lg:col-span-8", right: "lg:col-span-4" };
      case "40-60":
        return { left: "lg:col-span-5", right: "lg:col-span-7" };
      case "33-67":
        return { left: "lg:col-span-4", right: "lg:col-span-8" };
      case "60-40":
      default:
        return { left: "lg:col-span-7", right: "lg:col-span-5" };
    }
  };

  const { left: leftColSpan, right: rightColSpan } = getColSpans(columnRatio);

  return (
    <Section variant={bgColor} className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow tone={isDark ? "gold" : "navy"} className="mb-2">
              Learner Experiences
            </Eyebrow>

            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "headline"}
              label="Headline"
              onClick={() => onSelectElement?.("headline")}
              className="mb-2"
            >
              <Heading level="h2" className={isDark ? "text-white" : "text-navy-900"}>
                {headline}
              </Heading>
            </EditableElementWrapper>

            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "subheadline"}
              label="Subheadline"
              onClick={() => onSelectElement?.("subheadline")}
            >
              <p className={`text-base sm:text-lg max-w-xl leading-relaxed ${isDark ? "text-paper/85" : "text-ink-soft"}`}>
                {subheadline}
              </p>
            </EditableElementWrapper>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex text-gold-500">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={16}
                  className="fill-gold-500 stroke-gold-700"
                />
              ))}
            </div>
            <span className={`font-heading font-bold text-sm ${isDark ? "text-white" : "text-navy-900"}`}>
              {siteConfig.reviews.ratingValue} • {siteConfig.reviews.sourceText}
            </span>
          </div>
        </div>

        {/* Layout Grid: 3 Testimonials + 1 Video Spotlight Column with Adjustable Width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Written Testimonials */}
          <div className={`${leftColSpan} space-y-6 ${isImageLeft ? "lg:order-2" : "lg:order-1"}`}>
            {(items && items.length > 0
              ? items.map((it) => ({
                  name: it.title,
                  roleOrCourse: it.subtitle || it.tag || "",
                  quote: it.desc || "",
                  image: it.image || "",
                }))
              : siteConfig.testimonials
            ).map((t, idx) => {
              const rawItem = items?.[idx];
              const { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle } = resolveCardContainerStyles(rawItem, isDark);

              return (
                <EditableElementWrapper
                  key={t.name + idx}
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx}
                  label={`Review #${idx + 1}`}
                  onClick={() => onSelectElement?.("item", idx)}
                  className="rounded-lg"
                >
                  <div style={containerStyle} className={`p-6 ${containerClass}`}>
                    {/* Header with photo, name, course */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3.5">
                        {t.image ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-line bg-line flex-shrink-0">
                            <Image
                              src={t.image}
                              alt={t.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : null}
                        <div>
                          <strong style={titleStyle} className={`block leading-tight ${titleClass}`}>
                            {t.name}
                          </strong>
                          <span className={`text-xs block font-medium ${isDark || rawItem?.cardBg === "navy" ? "text-paper/70" : "text-ink-soft"}`}>
                            {t.roleOrCourse}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p style={descStyle} className={`italic ${descClass}`}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                </EditableElementWrapper>
              );
            })}
          </div>

          {/* Column 2: Click-to-Load Video / TikTok Learner Spotlight (Fully Editable) */}
          <div className={`${rightColSpan} ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "video"}
              label="Video Spotlight"
              onClick={() => onSelectElement?.("video")}
              className="rounded-lg"
            >
              <div
                className={`rounded-lg border p-6 transition-all ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-line shadow-subtle text-ink"
                }`}
              >

              <div className="flex items-center justify-between mb-4">
                <Tag variant="navy">Video Spotlight</Tag>
                <span className="text-xs text-ink-soft font-mono">
                  Student Stories
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
                {videoTitle}
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed mb-5">
                {videoDesc}
              </p>

              {/* Click-to-play video card */}
              {!tiktokRequested ? (
                <div
                  onClick={() => setTiktokRequested(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setTiktokRequested(true);
                    }
                  }}
                  aria-label={`Play student testimonial video: ${videoTitle}`}
                  className="relative aspect-[9/12] max-h-[440px] w-full rounded-lg bg-navy-950 border border-line overflow-hidden flex flex-col items-center justify-center p-6 text-center group cursor-pointer shadow-md hover:shadow-xl hover:border-navy-700/50 transition-all duration-300"
                >
                  <div className="absolute inset-0">
                    <Image
                      src={videoThumbnail}
                      alt={videoTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      loading="eager"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/60 to-navy-950/40" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="w-16 h-16 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-gold-300 transition-all duration-300">
                      <Icon name="video" size={28} className="text-navy-900 ml-0.5" />
                    </div>

                    <div className="space-y-1.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-white/20 text-white backdrop-blur-xs">
                        Student Story
                      </span>
                      <h4 className="font-heading text-xl font-bold text-white leading-tight">
                        {videoTitle}
                      </h4>
                      <p className="text-xs text-white/80">
                        Click card to play testimonial
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[9/12] max-h-[440px] w-full rounded-lg bg-black border border-line overflow-hidden flex flex-col items-center justify-center text-center group">
                  {isDirectVideo(effectiveVideoUrl) ? (
                    <video
                      ref={videoRef}
                      src={effectiveVideoUrl}
                      autoPlay
                      playsInline
                      controls={false}
                      className="w-full h-full object-cover"
                    />
                  ) : formatEmbedUrl(effectiveVideoUrl, true) ? (
                    <iframe
                      ref={iframeRef}
                      src={formatEmbedUrl(effectiveVideoUrl, true)}
                      title={videoTitle}
                      className="w-full h-full border-0 pointer-events-auto"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="p-6 space-y-4 text-white text-center flex flex-col items-center justify-center h-full">
                      <div className="w-14 h-14 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center mx-auto">
                        <Icon name="check-circle" size={28} />
                      </div>
                      <blockquote className="text-sm italic text-paper/90 leading-relaxed max-w-xs">
                        &ldquo;{videoDesc || "Studying with Smartminds gave me the exact flexibility I needed as a working healthcare assistant. Fast feedback from my assessor made all the difference."}&rdquo;
                      </blockquote>
                      <div className="text-xs font-bold text-gold-300">
                        {videoTitle || "Verified Graduate Feedback"}
                      </div>
                      <span className="text-[11px] text-paper/60">
                        Smartminds Training College Graduate
                      </span>
                    </div>
                  )}

                  {/* Custom Minimalist Controls Overlay (Only shown when an active video is playing) */}
                  {effectiveVideoUrl && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent p-3 pt-6 flex items-center justify-between text-white z-20">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTogglePlayPause}
                          className="px-2.5 py-1.5 rounded-sm bg-navy-900/90 hover:bg-navy-900 text-gold-300 border border-gold-500/30 flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          aria-label={isPlaying ? "Pause video" : "Play video"}
                        >
                          <Icon name={isPlaying ? "pause" : "play"} size={13} />
                          <span>{isPlaying ? "Pause" : "Play"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleMute}
                          className="px-2.5 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                        >
                          <span>{isMuted ? "Unmute" : "Mute"}</span>
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
                        Live Study Session
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTiktokRequested(false);
                    }}
                    aria-label="Close video player"
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
    </Section>
  );
};
