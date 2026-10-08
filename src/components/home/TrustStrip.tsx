import React from "react";
import Image from "next/image";
import { siteConfig } from "@/content/siteConfig";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export const TrustStrip: React.FC = () => {
  return (
    <section
      aria-label="Accreditations and Learner Reviews"
      className="bg-white border-b border-line py-8 shadow-subtle relative z-20"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Google Review Rating & Real Learner Photos */}
          <div className="md:col-span-5 flex items-center gap-4">
            {/* 3 overlapping real student/tutor circular photos */}
            <div className="flex -space-x-3 flex-shrink-0" aria-hidden="true">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-line">
                <Image
                  src="/images/certificate-moment.jpg"
                  alt="Certified healthcare graduate"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-line">
                <Image
                  src="/images/tutor-teaching.jpg"
                  alt="Subject-specialist tutor"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-line">
                <Image
                  src="/images/hero-learner.jpg"
                  alt="Adult online learner"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Rating info from content config */}
            <div>
              <div className="flex items-center gap-1 text-gold-500 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={14}
                    className="fill-gold-500 stroke-gold-700"
                  />
                ))}
                <span className="font-heading font-bold text-sm text-navy-900 ml-1">
                  {siteConfig.reviews.ratingValue}
                </span>
              </div>
              <p className="text-xs text-ink-soft leading-tight">
                {siteConfig.reviews.ratingCountText}
              </p>
            </div>
          </div>

          {/* Vertical Divider on Desktop */}
          <div className="hidden md:block md:col-span-1 border-l border-line h-10 mx-auto" />

          {/* Right: Verified UK Accreditation Badges */}
          <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-3 sm:gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft mr-1 hidden sm:inline">
              Accredited by:
            </span>
            {siteConfig.accreditations.map((item) => (
              <div
                key={item.acronym}
                className="px-3 py-1.5 rounded-sm bg-paper border border-line flex items-center gap-2 hover:border-navy-900/30 transition-colors"
                title={`${item.name} - ${item.description}`}
              >
                <Icon name="shield-check" size={15} className="text-navy-900" />
                <span className="font-heading font-bold text-sm tracking-wide text-navy-900 leading-none">
                  {item.acronym}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
