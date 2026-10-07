"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";
import { siteConfig } from "@/content/siteConfig";

export const FinalCTABand: React.FC = () => {
  return (
    <section
      aria-label="Book a free consultation"
      className="bg-navy-900 text-white py-16 md:py-20 relative overflow-hidden"
    >
      {/* Decorative crescent arc in background */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 pointer-events-none opacity-[0.06] text-white select-none"
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
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Eyebrow tone="gold" className="tracking-widest">
            Personalised Guidance
          </Eyebrow>

          {/* Heading verbatim from PRD 10.1 */}
          <Heading
            level="h2"
            className="text-white text-3xl sm:text-4xl md:text-5xl"
          >
            Not sure which course? Book a free call.
          </Heading>

          <p className="text-paper/85 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Speak directly with an academic adviser. We will assess your
            background, confirm entry requirements, check government funding
            eligibility, and help you select the right payment plan.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <BookingCTAButton
              variant="on-navy-gold"
              size="lg"
              className="w-full sm:w-auto shadow-md"
            >
              Book a free call
            </BookingCTAButton>

            <a
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-sm border border-white/30 text-white hover:bg-white/10 font-heading font-bold text-base transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="whatsapp" size={18} className="text-emerald-400" />
              <span>Prefer WhatsApp? Message us</span>
            </a>
          </div>

          {/* Reassurance items */}
          <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-paper/70">
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-gold-500" />
              <span>15-minute friendly consultation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-gold-500" />
              <span>Zero sales pressure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-gold-500" />
              <span>Funding & instalment advice included</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
