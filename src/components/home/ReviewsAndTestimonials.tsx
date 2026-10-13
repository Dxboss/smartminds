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

export interface ReviewsAndTestimonialsProps {
  headline?: string;
  subheadline?: string;
  videoTitle?: string;
  videoDesc?: string;
  videoThumbnail?: string;
  videoUrl?: string;
  columnRatio?: "50-50" | "60-40" | "70-30" | "40-60" | "33-67";
  bgColor?: "white" | "paper" | "navy" | "cream";
  mediaPosition?: "left" | "right";
  isEditor?: boolean;
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
  isEditor = false,
  onSelectElement,
}) => {
  const isImageLeft = mediaPosition === "left";
  const isDark = bgColor === "navy";
  const [tiktokRequested, setTiktokRequested] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const effectiveVideoUrl =
    (videoUrl && videoUrl.trim()) ||
    "https://www.youtube.com/watch?v=M7lc1UVf-VE";

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
            <Heading level="h2" className={`mb-2 ${isDark ? "text-white" : "text-navy-900"}`}>
              {headline}
            </Heading>
            <p className={`text-base sm:text-lg max-w-xl leading-relaxed ${isDark ? "text-paper/85" : "text-ink-soft"}`}>
              {subheadline}
            </p>
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
            {siteConfig.testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-lg border border-line p-6 shadow-subtle hover:border-navy-900/30 transition-colors"
              >
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
                      <strong className="font-heading font-bold text-lg text-navy-900 block leading-tight">
                        {t.name}
                      </strong>
                      <span className="text-xs text-ink-soft block font-medium">
                        {t.roleOrCourse}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-ink-soft leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {/* Column 2: Click-to-Load Video / TikTok Learner Spotlight (Fully Editable) */}
          <div className={`${rightColSpan} ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
            <div
              onClick={(e) => {
                if (isEditor && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement("video");
                }
              }}
              className={`rounded-lg border p-6 transition-all ${
                isDark
                  ? "bg-white/5 border-white/10 hover:border-gold-500/50 text-white"
                  : "bg-white border-line shadow-subtle text-ink"
              } ${
                isEditor
                  ? "cursor-pointer group/video relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                  : ""
              }`}
            >
              {isEditor && (
                <span className="hidden group-hover/video:inline-flex absolute -top-3.5 right-4 z-30 px-2 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-md items-center gap-1">
                  <Icon name="video" size={11} />
                  <span>Video Spotlight Settings ✎</span>
                </span>
              )}

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
                    <div className="p-6 space-y-3 text-white">
                      <div className="w-12 h-12 rounded-full bg-white/10 text-gold-300 flex items-center justify-center mx-auto">
                        <Icon name="video" size={24} />
                      </div>
                      <h4 className="font-heading text-base font-bold text-white">
                        Student Testimonial
                      </h4>
                      <p className="text-xs text-white/70 max-w-xs">
                        Loading video stream...
                      </p>
                    </div>
                  )}

                  {/* Custom Minimalist Controls Overlay (Hides third-party controls, keeps branded controls) */}
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
          </div>
        </div>
      </Container>
    </Section>
  );
};
