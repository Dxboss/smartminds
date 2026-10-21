import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

import { BuilderSectionItem } from "@/lib/repositories/seedData";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";
import {
  resolveCardContainerStyles,
  resolveTypography,
  resolveSubheadlineTypography,
} from "@/components/ui/typographyUtils";

export interface PricingFlexibilityProps {
  headline?: string;
  subheadline?: string;
  bgColor?: "white" | "paper" | "navy" | "cream";
  columns?: 2 | 3 | 4;
  items?: BuilderSectionItem[];
  headlineFontFamily?: string;
  headlineFontSize?: string;
  headlineFontWeight?: string;
  headlineFontStyle?: string;
  headlineColor?: string;
  headlineTransform?: string;
  headlineAlign?: string;
  subheadlineFontFamily?: string;
  subheadlineFontSize?: string;
  subheadlineFontWeight?: string;
  subheadlineFontStyle?: string;
  subheadlineColor?: string;
  subheadlineAlign?: string;
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

const DEFAULT_PRICING_ITEMS: BuilderSectionItem[] = [
  {
    number: "Option 01",
    title: "Pay in full",
    subtitle: "Save 10% on your total course fee",
    desc: "Pay your tuition upfront in a single secure payment and receive an instant 10% discount across any regulated or CPD diploma.",
    badge: "Best Value",
    bullets: [
      "Instant 10% reduction applied to course total",
      "Immediate enrolment and access to course materials",
      "No ongoing monthly debits or payment schedules",
    ],
    link: "/courses",
  },
  {
    number: "Option 02",
    title: "Spread in instalments",
    subtitle: "Same total price, split over 3 to 12 months",
    desc: "Pay an initial deposit, then split the exact remaining course fee across monthly payments. No interest, no credit agreements, and no finance uplift.",
    badge: "Most Popular",
    bullets: [
      "Exact same total price — zero percentage markup",
      "Customisable 3, 6, 10, or 12-month payment schedules",
      "Direct debit with automatic grace period support",
    ],
    link: "/courses",
  },
  {
    number: "Option 03",
    title: "Government funded",
    subtitle: "Fully funded options via AEB & Free Courses for Jobs",
    desc: "Depending on your age, employment status, prior qualifications, and UK residency, you may qualify for fully funded training at no personal cost.",
    badge: "Subject to Eligibility",
    bullets: [
      "Available for select Level 2 & Level 3 diplomas",
      "Free assessment of your entitlement before enrolling",
      "Fast 48-hour eligibility review by our admissions team",
    ],
    link: "/funding",
  },
];

export const PricingFlexibility: React.FC<PricingFlexibilityProps> = ({
  headline = "Flexible ways to pay — no hidden fees, no interest charges",
  subheadline = "We believe career qualifications should be accessible. Choose an upfront discount, spread your fees monthly with zero markup, or check whether your course is covered by government funding.",
  bgColor = "paper",
  columns = 3,
  items,
  headlineFontFamily,
  headlineFontSize,
  headlineFontWeight,
  headlineFontStyle,
  headlineColor,
  headlineTransform,
  headlineAlign,
  subheadlineFontFamily,
  subheadlineFontSize,
  subheadlineFontWeight,
  subheadlineFontStyle,
  subheadlineColor,
  subheadlineAlign,
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const isDark = bgColor === "navy";

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily as any,
    fontSize: headlineFontSize as any,
    fontWeight: headlineFontWeight as any,
    fontStyle: headlineFontStyle as any,
    color: headlineColor,
    transform: headlineTransform as any,
    align: headlineAlign as any,
    isDark,
    defaultFamily: "heading",
    defaultSize: "lg",
    defaultWeight: "bold",
  });

  const { className: subClass, style: subStyle } = resolveSubheadlineTypography({
    fontFamily: subheadlineFontFamily as any,
    fontSize: subheadlineFontSize as any,
    fontWeight: subheadlineFontWeight as any,
    fontStyle: subheadlineFontStyle as any,
    color: subheadlineColor,
    align: subheadlineAlign as any,
    isDark,
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

  const colClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 lg:grid-cols-3";

  const activePricingCards = items && items.length > 0 ? items : DEFAULT_PRICING_ITEMS;

  return (
    <Section variant={bgColor} className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div
          className={`max-w-2xl mb-12 ${
            headlineAlign === "center"
              ? "mx-auto text-center"
              : headlineAlign === "right"
              ? "ml-auto text-right"
              : "text-left"
          }`}
        >
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "badge"}
            label="Pricing Eyebrow"
            onClick={() => onSelectElement?.("badge")}
            className="inline-block mb-2"
          >
            <Eyebrow tone={isDark ? "gold" : "navy"}>
              Honest, Transparent Pricing
            </Eyebrow>
          </EditableElementWrapper>

          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "headline"}
            label="Pricing Headline"
            onClick={() => onSelectElement?.("headline")}
            className="block mb-3"
          >
            <Heading level="h2" style={hlStyle} className={hlClass}>
              {headline}
            </Heading>
          </EditableElementWrapper>

          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "subheadline"}
            label="Pricing Subheadline"
            onClick={() => onSelectElement?.("subheadline")}
            className="block"
          >
            <p style={subStyle} className={subClass}>
              {subheadline}
            </p>
          </EditableElementWrapper>
        </div>

        {/* Dynamic Column Split Layout */}
        <div className={`grid ${colClass} gap-6 items-stretch`}>
          {activePricingCards.map((card, idx) => {
            const isFeatured =
              card.badge?.toLowerCase().includes("popular") ||
              (!card.badge && idx === 1);

            const { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle } = resolveCardContainerStyles(card, isDark || isFeatured);

            return (
              <EditableElementWrapper
                key={card.title + idx}
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx}
                label={`Pricing Option #${idx + 1}`}
                onClick={() => onSelectElement?.("item", idx)}
                className="h-full"
              >
                <div
                  style={isFeatured && !card.cardBg && !card.cardBorder ? undefined : containerStyle}
                  className={`flex flex-col justify-between h-full relative ${
                    isFeatured && !card.cardBg && !card.cardBorder
                      ? "bg-navy-900 text-white border-2 border-gold-500 shadow-subtle p-7 rounded-lg"
                      : containerClass
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-gold-500 text-navy-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-sm">
                        {card.badge || "Most Popular"}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className={`flex items-center justify-between gap-2 mb-4 ${isFeatured ? "pt-1" : ""}`}>
                      {card.badge && !isFeatured && (
                        <Tag variant={card.badgeVariant || (isDark ? "gold" : "default")}>{card.badge}</Tag>
                      )}
                      {isFeatured && (
                        <Tag variant="live" className="text-xs">
                          Zero Extra Cost
                        </Tag>
                      )}
                      <span
                        className={`text-xs font-mono uppercase tracking-wider ${
                          isFeatured || card.cardBg === "navy" ? "text-paper/70" : isDark ? "text-gold-300" : "text-ink-soft"
                        }`}
                      >
                        {card.number || `Option 0${idx + 1}`}
                      </span>
                    </div>

                    <h3 style={titleStyle} className={`mb-1 ${titleClass}`}>
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p
                        className={`text-sm font-bold mb-4 ${
                          isFeatured || card.cardBg === "navy" ? "text-gold-300" : isDark ? "text-gold-300" : "text-navy-900"
                        }`}
                      >
                        {card.subtitle}
                      </p>
                    )}

                    {card.desc && (
                      <p
                        style={descStyle}
                        className={`text-sm leading-relaxed mb-6 ${
                          descStyle ? "" : isFeatured ? "text-paper/85" : isDark ? "text-paper/80" : "text-ink-soft"
                        }`}
                      >
                        {card.desc}
                      </p>
                    )}

                    {card.bullets && card.bullets.length > 0 && (
                      <ul
                        className={`space-y-3 text-sm mb-6 ${
                          isFeatured ? "text-paper/90" : isDark ? "text-paper/90" : "text-ink"
                        }`}
                      >
                        {card.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <Icon
                              name="check"
                              size={16}
                              className={`${
                                isFeatured || isDark ? "text-gold-500" : "text-navy-900"
                              } mt-0.5 flex-shrink-0`}
                            />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div
                    className={`pt-6 border-t ${
                      isFeatured ? "border-white/20" : isDark ? "border-white/10" : "border-line"
                    }`}
                  >
                    <Link
                      href={card.link || "/courses"}
                      onClick={(e) => {
                        if (isEditor) e.preventDefault();
                      }}
                      className={`w-full inline-flex items-center justify-center min-h-[44px] px-4 rounded-sm font-heading font-bold text-base transition-colors ${
                        isFeatured
                          ? "bg-gold-500 text-navy-900 hover:bg-gold-300"
                          : isDark
                          ? "border border-gold-300 text-gold-300 hover:bg-gold-500 hover:text-navy-900"
                          : "border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
                      }`}
                    >
                      {card.link?.includes("fund")
                        ? "Check funding eligibility →"
                        : isFeatured
                        ? "View instalment breakdowns"
                        : "Browse discounted courses"}
                    </Link>
                  </div>
                </div>
              </EditableElementWrapper>
            );
          })}
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
