"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";
import { siteConfig } from "@/content/siteConfig";

export interface FinalCTABandProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  bgColor?: "white" | "paper" | "navy" | "cream";
  align?: "left" | "center";
}

export const FinalCTABand: React.FC<FinalCTABandProps> = ({
  headline = "Not sure which course? Book a free call.",
  subheadline = "Speak directly with an academic adviser. We will assess your background, confirm entry requirements, check government funding eligibility, and help you select the right payment plan.",
  badgeText = "Personalised Guidance",
  buttonText = "Book a free call",
  buttonLink,
  secondaryButtonText = "Prefer WhatsApp? Message us",
  secondaryButtonLink,
  bgColor = "navy",
  align = "center",
}) => {
  const isDark = bgColor === "navy";
  const isCenter = align !== "left";

  const bgClass =
    bgColor === "paper"
      ? "bg-paper text-ink border-t border-line"
      : bgColor === "white"
      ? "bg-white text-ink border-t border-line"
      : bgColor === "cream"
      ? "bg-gold-50/70 text-ink border-t border-gold-200"
      : "bg-navy-900 text-white";

  return (
    <section
      aria-label="Book a free consultation"
      className={`${bgClass} py-16 md:py-20 relative overflow-hidden`}
    >
      {/* Decorative crescent arc in background */}
      <div
        className={`absolute -top-32 -right-32 w-96 h-96 pointer-events-none select-none ${
          isDark ? "opacity-[0.06] text-white" : "opacity-[0.04] text-navy-900"
        }`}
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
            strokeWidth="8"
          />
        </svg>
      </div>

      <Container>
        <div className={`max-w-3xl ${isCenter ? "mx-auto text-center" : "text-left"} space-y-6`}>
          <Eyebrow tone={isDark ? "gold" : "navy"} className="tracking-widest">
            {badgeText}
          </Eyebrow>

          {/* Heading verbatim from PRD 10.1 */}
          <Heading
            level="h2"
            className={`${isDark ? "text-white" : "text-navy-900"} text-3xl sm:text-4xl md:text-5xl`}
          >
            {headline}
          </Heading>

          <p className={`${isDark ? "text-paper/85" : "text-ink-soft"} text-base sm:text-lg leading-relaxed ${isCenter ? "max-w-xl mx-auto" : "max-w-xl"}`}>
            {subheadline}
          </p>

          {/* Action CTAs */}
          <div className={`pt-2 flex flex-col sm:flex-row items-center gap-4 ${isCenter ? "justify-center" : "justify-start"}`}>
            <BookingCTAButton
              variant={isDark ? "on-navy-gold" : "primary"}
              size="lg"
              className="w-full sm:w-auto shadow-md"
            >
              {buttonText}
            </BookingCTAButton>

            <a
              href={secondaryButtonLink || siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-sm border font-heading font-bold text-base transition-colors flex items-center justify-center gap-2 ${
                isDark
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
              }`}
            >
              <Icon name="whatsapp" size={18} className="text-emerald-500" />
              <span>{secondaryButtonText}</span>
            </a>
          </div>

          {/* Reassurance items */}
          <div className={`pt-6 border-t flex flex-wrap items-center gap-6 text-xs ${
            isDark ? "border-white/15 text-paper/70" : "border-line text-ink-soft"
          } ${isCenter ? "justify-center" : "justify-start"}`}>
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className={isDark ? "text-gold-500" : "text-navy-900"} />
              <span>15-minute friendly consultation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className={isDark ? "text-gold-500" : "text-navy-900"} />
              <span>Zero sales pressure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className={isDark ? "text-gold-500" : "text-navy-900"} />
              <span>Funding & instalment advice included</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
