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

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-paper pt-10 pb-16 md:pt-16 md:pb-24 border-b border-line">
      {/* Subtle background SVG celestial crescent trace */}
      <div
        className="absolute top-1/2 -right-48 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.04] text-navy-900 select-none"
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
          {/* Left Column: Text & CTAs (Asymmetric, weighted left) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <Tag variant="live">Live Online Classes</Tag>
              <Tag variant="navy">Regulated Qualifications</Tag>
              <Tag variant="gold">Flexible Instalments</Tag>
            </div>

            <div className="space-y-4">
              <Eyebrow tone="navy" className="tracking-widest">
                British Accredited Training
              </Eyebrow>

              {/* PRD 10.1 Hero H1 verbatim */}
              <Heading level="h1" className="text-navy-900 max-w-2xl">
                Live classes with real tutors. Qualifications that move your
                career forward.
              </Heading>

              <p className="text-lg sm:text-xl text-ink-soft max-w-xl leading-relaxed">
                Study recognized UK diplomas in health, social care, education,
                and business through interactive live evening classes with
                dedicated tutor mentoring.
              </p>
            </div>

            {/* CTAs: Exactly one primary CTA in viewport per PRD 7.4 */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <BookingCTAButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Get free advice
              </BookingCTAButton>

              <Button
                href="/courses"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                View all courses
              </Button>
            </div>

            {/* Small reassurance line beneath CTAs per PRD 10.1 */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-soft pt-1">
              <Icon
                name="check"
                size={16}
                className="text-navy-900 flex-shrink-0"
              />
              <span>
                Pay in full and save, or spread the cost at no extra charge.
              </span>
            </div>
          </div>

          {/* Right Column: Real Learner Photo in Signature ArcMask */}
          <div className="lg:col-span-5 relative">
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
                    src="/images/hero-learner.jpg"
                    alt="Adult learner smiling while attending live online class with notes and laptop"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                    priority
                    className="object-cover object-center"
                  />
                </div>
              </ArcMask>

              {/* Floating Live Classroom Indicator Pill */}
              <div className="absolute -bottom-4 left-6 z-20 bg-white/95 backdrop-blur-md rounded-sm border border-line p-3 shadow-subtle flex items-center gap-3">
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
