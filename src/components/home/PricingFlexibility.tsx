import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

export interface PricingFlexibilityProps {
  headline?: string;
  subheadline?: string;
  bgColor?: "white" | "paper" | "navy" | "cream";
  columns?: 2 | 3 | 4;
}

export const PricingFlexibility: React.FC<PricingFlexibilityProps> = ({
  headline = "Flexible ways to pay — no hidden fees, no interest charges",
  subheadline = "We believe career qualifications should be accessible. Choose an upfront discount, spread your fees monthly with zero markup, or check whether your course is covered by government funding.",
  bgColor = "paper",
  columns = 3,
}) => {
  const isDark = bgColor === "navy";

  const colClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 lg:grid-cols-3";

  return (
    <Section variant={bgColor} className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <Eyebrow tone={isDark ? "gold" : "navy"} className="mb-2">
            Honest, Transparent Pricing
          </Eyebrow>
          <Heading level="h2" className={`mb-3 ${isDark ? "text-white" : "text-navy-900"}`}>
            {headline}
          </Heading>
          <p className={`text-base sm:text-lg leading-relaxed ${isDark ? "text-paper/85" : "text-ink-soft"}`}>
            {subheadline}
          </p>
        </div>

        {/* Dynamic Column Split Layout */}
        <div className={`grid ${colClass} gap-6 items-stretch`}>
          {/* Card 1: Pay in Full */}
          <div className={`rounded-lg border p-7 transition-colors flex flex-col justify-between ${
            isDark
              ? "bg-white/5 border-white/10 hover:border-gold-500/50 text-white"
              : "bg-white border-line shadow-subtle hover:border-navy-900/30 text-ink"
          }`}>
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <Tag variant="gold">Best Value</Tag>
                <span className={`text-xs font-mono uppercase tracking-wider ${isDark ? "text-gold-300" : "text-ink-soft"}`}>
                  Option 01
                </span>
              </div>

              <h3 className={`font-heading text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-navy-900"}`}>
                Pay in full
              </h3>
              <p className="text-sm font-bold text-navy-900 mb-4">
                Save 10% on your total course fee
              </p>

              <p className="text-sm text-ink-soft leading-relaxed mb-6">
                Pay your tuition upfront in a single secure payment and receive
                an instant 10% discount across any regulated or CPD diploma.
              </p>

              <ul className="space-y-3 text-sm text-ink mb-6">
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className="text-navy-900 mt-0.5 flex-shrink-0"
                  />
                  <span>Instant 10% reduction applied to course total</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className="text-navy-900 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    Immediate enrolment and access to course materials
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className="text-navy-900 mt-0.5 flex-shrink-0"
                  />
                  <span>No ongoing monthly debits or payment schedules</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-line">
              <Link
                href="/courses"
                className="w-full inline-flex items-center justify-center min-h-[44px] px-4 rounded-sm border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white font-heading font-bold text-base transition-colors"
              >
                Browse discounted courses
              </Link>
            </div>
          </div>

          {/* Card 2: Spread the Cost (Instalments) - Highlighted */}
          <div className="bg-navy-900 text-white rounded-lg border-2 border-gold-500 p-7 shadow-subtle flex flex-col justify-between relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-gold-500 text-navy-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-sm">
                Most Popular
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                <Tag variant="live" className="text-xs">
                  Zero Extra Cost
                </Tag>
                <span className="text-xs font-mono uppercase tracking-wider text-paper/70">
                  Option 02
                </span>
              </div>

              <h3 className="font-heading text-2xl font-bold text-white mb-1">
                Spread in instalments
              </h3>
              <p className="text-sm font-semibold text-gold-300 mb-4">
                Same total price, split over 3 to 12 months
              </p>

              <p className="text-sm text-paper/85 leading-relaxed mb-6">
                Pay an initial deposit, then split the exact remaining course
                fee across monthly payments. No interest, no credit agreements,
                and no finance uplift.
              </p>

              <ul className="space-y-3 text-sm text-paper/90 mb-6">
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className="text-gold-500 mt-0.5 flex-shrink-0"
                  />
                  <span>Exact same total price — zero percentage markup</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className="text-gold-500 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    Customisable 3, 6, 10, or 12-month payment schedules
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className="text-gold-500 mt-0.5 flex-shrink-0"
                  />
                  <span>Direct debit with automatic grace period support</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-white/20">
              <Link
                href="/courses"
                className="w-full inline-flex items-center justify-center min-h-[44px] px-4 rounded-sm bg-gold-500 text-navy-900 hover:bg-gold-300 font-heading font-bold text-base transition-colors"
              >
                View instalment breakdowns
              </Link>
            </div>
          </div>

          {/* Card 3: Government Funded */}
          <div className={`rounded-lg border p-7 transition-colors flex flex-col justify-between ${
            isDark
              ? "bg-white/5 border-white/10 hover:border-gold-500/50 text-white"
              : "bg-white border-line shadow-subtle hover:border-navy-900/30 text-ink"
          }`}>
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <Tag variant={isDark ? "gold" : "navy"}>Subject to Eligibility</Tag>
                <span className={`text-xs font-mono uppercase tracking-wider ${isDark ? "text-gold-300" : "text-ink-soft"}`}>
                  Option 03
                </span>
              </div>

              <h3 className={`font-heading text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-navy-900"}`}>
                Government funded
              </h3>
              <p className={`text-sm font-semibold mb-4 ${isDark ? "text-gold-300" : "text-navy-700"}`}>
                Fully funded options via AEB & Free Courses for Jobs
              </p>

              <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-paper/80" : "text-ink-soft"}`}>
                Depending on your age, employment status, prior qualifications,
                and UK residency, you may qualify for fully funded training at
                no personal cost.
              </p>

              <ul className={`space-y-3 text-sm mb-6 ${isDark ? "text-paper/90" : "text-ink"}`}>
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className={`${isDark ? "text-gold-500" : "text-navy-900"} mt-0.5 flex-shrink-0`}
                  />
                  <span>Available for select Level 2 & Level 3 diplomas</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className={`${isDark ? "text-gold-500" : "text-navy-900"} mt-0.5 flex-shrink-0`}
                  />
                  <span>
                    Free assessment of your entitlement before enrolling
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    className={`${isDark ? "text-gold-500" : "text-navy-900"} mt-0.5 flex-shrink-0`}
                  />
                  <span>
                    Fast 48-hour eligibility review by our admissions team
                  </span>
                </li>
              </ul>
            </div>

            <div className={`pt-6 border-t ${isDark ? "border-white/10" : "border-line"}`}>
              <Link
                href="/funding"
                className={`w-full inline-flex items-center justify-center min-h-[44px] px-4 rounded-sm border font-heading font-bold text-base transition-colors ${
                  isDark
                    ? "border-gold-300 text-gold-300 hover:bg-gold-500 hover:text-navy-900"
                    : "border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
                }`}
              >
                Check funding eligibility &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Legal & Compliance reassurance notice */}
        <p className="text-center text-xs text-ink-soft mt-8 max-w-xl mx-auto leading-relaxed">
          Smartminds instalment plans are direct payment schedules between the
          learner and the college. No credit checks, no loan agreements, and no
          third-party lenders.
        </p>
      </Container>
    </Section>
  );
};
