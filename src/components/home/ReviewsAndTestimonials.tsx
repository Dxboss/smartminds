"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { ConsentGuard } from "@/components/consent/ConsentGuard";

interface Testimonial {
  name: string;
  roleOrCourse: string;
  quote: string;
  rating: number;
  image?: string;
  verified: boolean;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Abigail M.",
    roleOrCourse: "Level 3 Diploma in Adult Care",
    quote:
      "Balancing 12-hour care shifts with study felt impossible before Smartminds. The evening classes fit around my rota, and having every session recorded meant I could rewatch medication administration units on my days off. I received my promotion to Senior Carer within two months of finishing.",
    rating: 5,
    image: "/images/hero-learner.jpg",
    verified: true,
  },
  {
    name: "David K.",
    roleOrCourse: "Level 3 Award in Education & Training (AET)",
    quote:
      "The micro-teach session was what I was most anxious about, but the tutor was constructive and patient. The course gave me the exact teaching credentials I needed to start lecturing at my local FE college. Clear instalment schedule with no surprise charges.",
    rating: 5,
    image: "/images/tutor-teaching.jpg",
    verified: true,
  },
  {
    name: "Grace O.",
    roleOrCourse: "Level 3 Early Years Educator (EYE)",
    quote:
      "I spread my course payments over 6 months, and it was so straightforward. The tutor feedback on my observation files was detailed and prompt. Now I am fully certified to practise as a nursery nurse.",
    rating: 5,
    image: "/images/certificate-moment.jpg",
    verified: true,
  },
];

export const ReviewsAndTestimonials: React.FC = () => {
  const [tiktokRequested, setTiktokRequested] = useState(false);

  return (
    <Section variant="paper" className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow tone="navy" className="mb-2">
              Learner Experiences
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Real stories from qualified graduates
            </Heading>
            <p className="text-ink-soft text-base sm:text-lg max-w-xl leading-relaxed">
              Read how healthcare workers, aspiring tutors, and career changers
              achieved their Ofqual-regulated certificates with Smartminds.
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
            <span className="font-heading font-bold text-navy-900 text-sm">
              4.9/5.0 Verified Student Rating
            </span>
          </div>
        </div>

        {/* Layout Grid: 3 Testimonials + 1 Video Spotlight Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3 Written Testimonials */}
          <div className="lg:col-span-7 space-y-6">
            {TESTIMONIALS.map((t) => (
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
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-navy-900 text-white font-heading font-bold flex items-center justify-center flex-shrink-0">
                        {t.name.slice(0, 2)}
                      </div>
                    )}

                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-900 leading-snug">
                        {t.name}
                      </h3>
                      <span className="text-xs font-semibold text-gold-700 block">
                        {t.roleOrCourse}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-gold-500 flex-shrink-0">
                    {[...Array(t.rating)].map((_, i) => (
                      <Icon
                        key={i}
                        name="star"
                        size={13}
                        className="fill-gold-500 stroke-gold-700"
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-sm text-ink-soft leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Verified badge */}
                {t.verified && (
                  <div className="mt-4 pt-3 border-t border-line flex items-center gap-1.5 text-xs text-navy-900 font-semibold">
                    <Icon name="check" size={14} className="text-navy-900" />
                    <span>Verified Smartminds Graduate</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column: Click-to-Load Video / TikTok Learner Spotlight */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg border border-line p-6 shadow-subtle">
              <div className="flex items-center justify-between mb-4">
                <Tag variant="navy">Video Spotlight</Tag>
                <span className="text-xs text-ink-soft font-mono">
                  Student Stories
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
                Watch learners share their qualification journey
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed mb-5">
                Real feedback recorded by our students. Social media embeds only
                load when you choose to play and with your cookie consent.
              </p>

              {/* Click-to-load video container */}
              {!tiktokRequested ? (
                <div className="relative aspect-[9/12] max-h-[440px] w-full rounded-lg bg-navy-900/5 border border-line overflow-hidden flex flex-col items-center justify-center p-6 text-center group">
                  <div className="relative w-full h-full absolute inset-0 opacity-20 pointer-events-none">
                    <Image
                      src="/images/certificate-moment.jpg"
                      alt="Student graduate thumbnail"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                  </div>

                  <div className="relative z-10 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-navy-900 text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform">
                      <Icon name="star" size={24} className="text-gold-500" />
                    </div>

                    <h4 className="font-heading text-lg font-bold text-navy-900">
                      Graduate Spotlight Video
                    </h4>
                    <p className="text-xs text-ink-soft max-w-xs mx-auto">
                      Click below to load this video. No external cookies or
                      tracking scripts are loaded until requested.
                    </p>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setTiktokRequested(true)}
                    >
                      Load video story
                    </Button>
                  </div>
                </div>
              ) : (
                <ConsentGuard
                  category="marketing"
                  fallbackTitle="Cookie Consent Required"
                  fallbackDescription="To view social video embeds from TikTok or YouTube, please allow marketing cookies in your preferences."
                >
                  <div className="relative aspect-[9/12] max-h-[440px] w-full rounded-lg bg-paper border border-line flex flex-col items-center justify-center p-6 text-center">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full bg-navy-900/10 text-navy-900 flex items-center justify-center mx-auto">
                        <Icon name="shield-check" size={24} />
                      </div>
                      <h4 className="font-heading text-base font-bold text-navy-900">
                        External Embed Slot (PLACEHOLDER)
                      </h4>
                      <p className="text-xs text-ink-soft max-w-xs">
                        Official student TikTok video embed URL will be placed
                        here by the college owner. Embed script held behind
                        explicit consent per PRD 10.1 & 16.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTiktokRequested(false)}
                      >
                        Hide embed
                      </Button>
                    </div>
                  </div>
                </ConsentGuard>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
