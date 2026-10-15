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

export interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image?: string;
  mediaPosition?: "left" | "right";
  columnRatio?: "50-50" | "60-40" | "70-30" | "40-60" | "33-67";
  paddingDensity?: "compact" | "normal" | "spacious";
  bgColor?: "white" | "paper" | "navy" | "cream";
  isEditor?: boolean;
  onSelectElement?: (
    element: "badge" | "headline" | "subheadline" | "button" | "secondaryButton" | "image"
  ) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline = "Live classes with real tutors. Qualifications that move your career forward.",
  subheadline = "Study recognised UK diplomas in health, social care, education, and business through interactive live evening classes with dedicated tutor mentoring.",
  badgeText = "British Accredited Training",
  buttonText = "Get free advice",
  buttonLink,
  secondaryButtonText = "View all courses",
  secondaryButtonLink = "/courses",
  image = "/images/hero-learner.jpg",
  mediaPosition = "right",
  columnRatio = "60-40",
  paddingDensity = "normal",
  bgColor = "paper",
  isEditor = false,
  onSelectElement,
}) => {
  const isImageLeft = mediaPosition === "left";
  const isDark = bgColor === "navy";

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

  const paddingClass =
    paddingDensity === "compact"
      ? "pt-6 pb-10 md:pt-10 md:pb-14"
      : paddingDensity === "spacious"
      ? "pt-16 pb-24 md:pt-24 md:pb-32"
      : "pt-10 pb-16 md:pt-16 md:pb-24";

  const bgClass =
    bgColor === "white"
      ? "bg-white"
      : bgColor === "navy"
      ? "bg-navy-900 text-white"
      : bgColor === "cream"
      ? "bg-gold-50/70"
      : "bg-paper";

  return (
    <section className={`relative overflow-hidden ${bgClass} ${paddingClass} border-b border-line`}>
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
            <div className="flex flex-wrap items-center gap-2.5">
              <Tag variant="live">Live Online Classes</Tag>
              <Tag variant={isDark ? "gold" : "navy"}>Regulated Qualifications</Tag>
              <Tag variant={isDark ? "default" : "gold"}>Flexible Instalments</Tag>
            </div>

            <div className="space-y-4">
              {/* Eyebrow / Badge Element */}
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
                <Eyebrow tone={isDark ? "gold" : "navy"} className="tracking-widest">
                  {badgeText}
                </Eyebrow>
                {isEditor && (
                  <span className="hidden group-hover/badge:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                    Badge ✎
                  </span>
                )}
              </div>

              {/* Main Headline Element */}
              <div
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("headline");
                  }
                }}
                className={
                  isEditor
                    ? "cursor-pointer group/h1 relative rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 p-0.5 -m-0.5"
                    : ""
                }
              >
                <Heading level="h1" className={`max-w-2xl ${isDark ? "text-white" : "text-navy-900"}`}>
                  {headline}
                </Heading>
                {isEditor && (
                  <span className="hidden group-hover/h1:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                    Headline ✎
                  </span>
                )}
              </div>

              {/* Subheadline Element */}
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
                <p className={`text-lg sm:text-xl max-w-xl leading-relaxed ${isDark ? "text-paper/85" : "text-ink-soft"}`}>
                  {subheadline}
                </p>
                {isEditor && (
                  <span className="hidden group-hover/sub:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                    Subheadline ✎
                  </span>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <div
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("button");
                  }
                }}
                className={
                  isEditor
                    ? "cursor-pointer group/btn relative inline-block rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                    : ""
                }
              >
                <BookingCTAButton
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {buttonText}
                </BookingCTAButton>
                {isEditor && (
                  <span className="hidden group-hover/btn:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                    Primary CTA ✎
                  </span>
                )}
              </div>

              <div
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("secondaryButton");
                  }
                }}
                className={
                  isEditor
                    ? "cursor-pointer group/secbtn relative inline-block rounded-xs hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                    : ""
                }
              >
                <Button
                  href={secondaryButtonLink || "/courses"}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {secondaryButtonText}
                </Button>
                {isEditor && (
                  <span className="hidden group-hover/secbtn:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                    Secondary Button ✎
                  </span>
                )}
              </div>
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
          <div
            onClick={(e) => {
              if (isEditor && onSelectElement) {
                e.stopPropagation();
                onSelectElement("image");
              }
            }}
            className={`${mediaColSpan} relative ${isImageLeft ? "lg:order-1" : "lg:order-2"} ${
              isEditor
                ? "cursor-pointer group/img rounded-lg hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
                : ""
            }`}
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

              {isEditor && (
                <span className="hidden group-hover/img:inline-flex absolute top-3 right-3 z-30 px-2 py-1 rounded-sm bg-navy-900 text-gold-300 text-[10px] font-bold shadow-md items-center gap-1">
                  <Icon name="layers" size={12} />
                  <span>Change Photo ✎</span>
                </span>
              )}

              {/* Floating Live Classroom Indicator Pill */}
              <div className="absolute -bottom-4 left-3 sm:left-6 max-w-[calc(100%-1.5rem)] z-20 bg-white/95 backdrop-blur-md rounded-sm border border-line p-3 shadow-subtle flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-navy-900 text-white flex items-center justify-center flex-shrink-0">
                  <Icon name="star" size={18} className="text-gold-500" />
                </div>
                <div className="text-left">
                  <span className="font-heading font-bold text-sm text-navy-900 block leading-tight">
                    Live Evening Sessions
                  </span>
                  <span className="text-xs text-ink-soft block leading-tight">
                    Recordings available 24/7 to rewatch
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
