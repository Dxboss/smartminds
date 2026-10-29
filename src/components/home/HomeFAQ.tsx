"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";
import { resolveSectionBg, SectionBgColor, resolveItemColor } from "@/components/ui/sectionBg";
import {
  resolveTypography,
  resolveSubheadlineTypography,
  resolveBadgeStyles,
} from "@/components/ui/typographyUtils";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
  cardBg?: string;
  cardBorder?: string;
  titleColor?: string;
  descColor?: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question:
      "Are your qualifications recognised by UK employers and CQC inspectors?",
    answer:
      "Yes. Our regulated qualifications are awarded by established UK awarding organisations (such as TQUK) and regulated by Ofqual. They meet the strict workforce standards required by the Care Quality Commission (CQC), Skills for Care, and local education authorities across England and Wales.",
    category: "Accreditation",
  },
  {
    question: "Are classes live or pre-recorded?",
    answer:
      "All core teaching is delivered through live online classes led by qualified UK tutors, not automated pre-recorded slide decks. You interact directly with your tutor, participate in group discussions, and receive live guidance on assignment criteria.",
    category: "Teaching",
  },
  {
    question: "What happens if I miss an evening live class?",
    answer:
      "Every single live webinar is recorded in high definition and made available to your personal student portal within 24 hours. You can rewatch recordings anytime, as many times as you need, ensuring you never fall behind if your shift pattern changes.",
    category: "Flexibility",
  },
  {
    question: "How do instalment plans work? Is there any interest or APR?",
    answer:
      "We never charge interest, finance fees, or APR. You pay an initial deposit followed by equal monthly payments across 3, 6, 10, or 12 months. The total amount you pay in instalments is the exact same standard course price — at no extra charge.",
    category: "Payments",
  },
  {
    question: "Can I study while working full-time or doing shift work?",
    answer:
      "Yes. Over 80% of our adult learners work full-time in care, education, or office environments. Live sessions run on weekday evenings (typically 6:30 PM to 8:30 PM), and your coursework portfolio can be completed flexibly around your work rota.",
    category: "Flexibility",
  },
  {
    question: "Am I eligible for government-funded training?",
    answer:
      "Eligible learners can access fully funded routes through schemes such as the Adult Education Budget (AEB) and Free Courses for Jobs, depending on UK residency status, employment, age, and existing qualification levels. You can check your eligibility with our admissions team on a free 15-minute call.",
    category: "Funding",
  },
  {
    question: "How soon can I start after enrolling?",
    answer:
      "We operate a rolling start model, with new cohorts launching every two to four weeks. Once you choose your course and complete registration, our admissions team will confirm your cohort schedule and provide your student access details immediately.",
    category: "Enrolment",
  },
  {
    question: "What tutor support do I receive between classes?",
    answer:
      "You are assigned a dedicated course tutor whom you can reach via student messaging and email. Tutors review your draft portfolio submissions, give unit-by-unit constructive feedback, and offer 1-on-1 tutorials if you require additional support on specific units.",
    category: "Support",
  },
];

export interface HomeFAQProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  badgeFontFamily?: string;
  badgeWeight?: string;
  items?: { title: string; desc?: string; tag?: string; cardBg?: string; cardBorder?: string; titleColor?: string; descColor?: string; [key: string]: any }[];
  bgColor?: SectionBgColor;
  columns?: 1 | 2 | 3 | 4;
  calloutHeadline?: string;
  calloutText?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  calloutBgColor?: string;
  showCallout?: boolean;
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
      | "callout",
    itemIndex?: number
  ) => void;
}

export const HomeFAQ: React.FC<HomeFAQProps> = ({
  headline = "Everything you need to know before enrolling",
  subheadline = "Clear answers about class schedules, Ofqual accreditation, flexible instalment plans, and tutor support.",
  badgeText,
  badgeColor,
  badgeBgColor,
  badgeFontFamily,
  badgeWeight,
  items,
  bgColor = "white",
  columns = 4,
  calloutHeadline = "Still have a question?",
  calloutText = "Our admissions advisers are ready to help clarify any aspect of your qualification.",
  buttonText = "Book a free call",
  buttonLink = "#book-call",
  secondaryButtonText = "Contact our office",
  secondaryButtonLink = "/contact",
  calloutBgColor = "paper",
  showCallout = true,
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
  isEditor,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { isDark } = resolveSectionBg(bgColor, "white");

  const { className: badgeClass, style: badgeStyle } = resolveBadgeStyles({
    color: badgeColor,
    bgColor: badgeBgColor,
    fontFamily: badgeFontFamily as any,
    weight: badgeWeight as any,
    isDark,
    variant: isDark ? "gold" : "navy",
  });

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily as any,
    fontSize: headlineFontSize as any,
    fontWeight: headlineFontWeight as any,
    fontStyle: headlineFontStyle as any,
    color: headlineColor,
    align: headlineAlign as any,
    transform: headlineTransform as any,
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

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const displayList: FAQItem[] =
    items && items.length > 0
      ? items.map((it) => ({
          question: it.title,
          answer: it.desc || "",
          category: it.tag || "General",
          cardBg: it.cardBg,
          cardBorder: it.cardBorder,
          titleColor: it.titleColor,
          descColor: it.descColor,
        }))
      : FAQ_ITEMS;

  return (
    <Section variant={bgColor} className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "badge"}
            label="FAQ Eyebrow"
            onClick={() => onSelectElement?.("badge")}
            className="inline-block mb-2"
          >
            <Eyebrow
              tone={isDark ? "gold" : "navy"}
              style={badgeStyle}
              className={badgeColor || badgeBgColor ? badgeClass : ""}
            >
              {badgeText || "Frequently Asked Questions"}
            </Eyebrow>
          </EditableElementWrapper>
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "headline"}
            label="FAQ Headline"
            onClick={() => onSelectElement?.("headline")}
            className="mb-3"
          >
            <Heading level="h2" style={hlStyle} className={`mb-3 ${hlClass}`}>
              {headline}
            </Heading>
          </EditableElementWrapper>

          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "subheadline"}
            label="FAQ Subtitle"
            onClick={() => onSelectElement?.("subheadline")}
          >
            <p style={subStyle} className={`leading-relaxed ${subClass}`}>
              {subheadline}
            </p>
          </EditableElementWrapper>
        </div>

        {/* Dynamic Accordion List (supports 1, 2, or 3 columns) */}
        <div
          className={
            columns === 2
              ? "max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
              : columns === 3
              ? "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start"
              : "max-w-3xl mx-auto space-y-3.5"
          }
        >
          {displayList.map((item, index) => {
            const isOpen = openIndex === index;
            const headingId = `faq-heading-${index}`;
            const panelId = `faq-panel-${index}`;
            const isSelected = isEditor && selectedElementKey === "item" && selectedElementItemIndex === index;
            const resolvedItemBg = item.cardBg ? resolveItemColor(item.cardBg) : undefined;
            const resolvedItemBorder = item.cardBorder ? resolveItemColor(item.cardBorder) : undefined;
            const resolvedItemTitle = item.titleColor ? resolveItemColor(item.titleColor) : undefined;
            const resolvedItemDesc = item.descColor ? resolveItemColor(item.descColor) : undefined;

            const cardStyle: React.CSSProperties = {
              backgroundColor: resolvedItemBg,
              borderColor: resolvedItemBorder,
            };
            const questionStyle: React.CSSProperties = {
              color: resolvedItemTitle,
            };
            const answerStyle: React.CSSProperties = {
              color: resolvedItemDesc,
            };

            return (
              <EditableElementWrapper
                key={index}
                isEditor={isEditor}
                isSelected={isSelected}
                label={`FAQ #${index + 1}`}
                onClick={() => {
                  onSelectElement?.("item", index);
                }}
                className="w-full block"
              >
                <div
                  style={cardStyle}
                  className={`rounded-lg border transition-all ${
                    isDark
                      ? isOpen
                        ? "border-gold-500/60 bg-white/10 shadow-subtle text-white"
                        : "border-white/10 bg-white/5 hover:border-gold-500/40 text-white"
                      : isOpen
                      ? "border-navy-900/40 bg-paper shadow-subtle text-ink"
                      : "border-line bg-white hover:border-navy-900/20 text-ink"
                  }`}
                >
                  <button
                    type="button"
                    id={headingId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={(e) => {
                      toggleIndex(index);
                      if (isEditor && onSelectElement) {
                        e.stopPropagation();
                        onSelectElement("item", index);
                      }
                    }}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 min-h-[44px] focus:outline-none rounded-lg"
                  >
                    <span
                      style={questionStyle}
                      className={`font-heading font-bold text-lg leading-snug ${isDark ? "text-white" : "text-navy-900"}`}
                    >
                      {item.question}
                    </span>

                    <span
                      className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 transition-transform ${
                        isDark
                          ? isOpen
                            ? "bg-gold-500 text-navy-900 rotate-180"
                            : "bg-white/10 text-gold-300"
                          : isOpen
                          ? "bg-navy-900 text-white rotate-180"
                          : "bg-paper text-navy-900"
                      }`}
                    >
                      <Icon name="chevron-down" size={16} />
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={headingId}
                      className={`px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-sm leading-relaxed border-t mt-1 ${
                        isDark
                          ? "text-paper/85 border-white/10"
                          : "text-ink-soft border-line/60"
                      }`}
                    >
                      <p style={answerStyle} className="pt-3">{item.answer}</p>
                    </div>
                  )}
                </div>
              </EditableElementWrapper>
            );
          })}
        </div>

        {/* Still have questions band */}
        {showCallout !== false && (
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "callout"}
            label="Assistance Card"
            onClick={() => onSelectElement?.("callout")}
          >
            {(() => {
              const cardBg = calloutBgColor || "paper";
              const isDarkCard =
                cardBg === "navy" ||
                cardBg === "slate" ||
                cardBg === "navy_gradient";

              const cardBgClass =
                cardBg === "paper"
                  ? "bg-paper text-navy-900 border border-line"
                  : cardBg === "cream"
                  ? "bg-cream text-navy-900 border border-gold-300"
                  : cardBg === "white"
                  ? "bg-white text-navy-900 border border-line shadow-sm"
                  : cardBg === "gold"
                  ? "bg-gold-500 text-navy-900 border border-gold-600"
                  : cardBg === "slate"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : isDarkCard
                  ? "bg-navy-900 text-white border border-navy-700"
                  : "bg-paper text-navy-900 border border-line";

              return (
                <div
                  className={`mt-12 text-center max-w-md mx-auto p-6 rounded-lg transition-colors ${cardBgClass}`}
                >
                  <h3
                    className={`font-heading text-lg font-bold mb-1 ${
                      isDarkCard ? "text-white" : "text-navy-900"
                    }`}
                  >
                    {calloutHeadline || "Still have a question?"}
                  </h3>
                  <p
                    className={`text-xs mb-4 ${
                      isDarkCard ? "text-paper/80" : "text-ink-soft"
                    }`}
                  >
                    {calloutText ||
                      "Our admissions advisers are ready to help clarify any aspect of your qualification."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {buttonText !== "" && (
                      buttonLink &&
                      buttonLink !== "#book-call" &&
                      !buttonLink.startsWith("#") ? (
                        <Link
                          href={buttonLink}
                          className={`w-full sm:w-auto px-4 py-2 rounded-sm text-xs font-bold transition-colors ${
                            isDarkCard
                              ? "bg-gold-500 text-navy-900 hover:bg-gold-300 shadow-sm"
                              : "bg-navy-900 text-white hover:bg-navy-700 shadow-sm"
                          }`}
                        >
                          {buttonText || "Book a free call"}
                        </Link>
                      ) : (
                        <BookingCTAButton
                          variant={isDarkCard ? "on-navy-gold" : "primary"}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {buttonText || "Book a free call"}
                        </BookingCTAButton>
                      )
                    )}
                    {secondaryButtonText && (
                      <Link
                        href={secondaryButtonLink || "/contact"}
                        className={`text-xs font-semibold underline underline-offset-4 py-2 ${
                          isDarkCard
                            ? "text-gold-300 hover:text-white"
                            : "text-navy-900 hover:text-navy-700"
                        }`}
                      >
                        {secondaryButtonText}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })()}
          </EditableElementWrapper>
        )}
      </Container>
    </Section>
  );
};
