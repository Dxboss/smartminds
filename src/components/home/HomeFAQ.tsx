"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
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
  items?: { title: string; desc?: string; tag?: string }[];
  bgColor?: "white" | "paper" | "navy" | "cream";
  columns?: 2 | 3 | 4;
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
      | "bg",
    itemIndex?: number
  ) => void;
}

export const HomeFAQ: React.FC<HomeFAQProps> = ({
  headline = "Everything you need to know before enrolling",
  subheadline = "Clear answers about class schedules, Ofqual accreditation, flexible instalment plans, and tutor support.",
  items,
  bgColor = "white",
  columns = 4,
  isEditor,
  onSelectElement,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isDark = bgColor === "navy";

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const displayList: FAQItem[] =
    items && items.length > 0
      ? items.map((it) => ({
          question: it.title,
          answer: it.desc || "",
          category: it.tag || "General",
        }))
      : FAQ_ITEMS;

  return (
    <Section variant={bgColor} className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Eyebrow tone={isDark ? "gold" : "navy"} className="mb-2">
            Frequently Asked Questions
          </Eyebrow>
          <div
            onClick={(e) => {
              if (isEditor && onSelectElement) {
                e.stopPropagation();
                onSelectElement("headline");
              }
            }}
            className={
              isEditor
                ? "cursor-pointer group/h relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 rounded-sm inline-block"
                : ""
            }
          >
            <Heading level="h2" className={`mb-3 ${isDark ? "text-white" : "text-navy-900"}`}>
              {headline}
            </Heading>
            {isEditor && (
              <span className="hidden group-hover/h:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
                FAQ Title ✎
              </span>
            )}
          </div>
          <div
            onClick={(e) => {
              if (isEditor && onSelectElement) {
                e.stopPropagation();
                onSelectElement("subheadline");
              }
            }}
            className={
              isEditor
                ? "cursor-pointer group/sh relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 rounded-sm inline-block"
                : ""
            }
          >
            <p className={`text-base sm:text-lg leading-relaxed ${isDark ? "text-paper/85" : "text-ink-soft"}`}>
              {subheadline}
            </p>
            {isEditor && (
              <span className="hidden group-hover/sh:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
                FAQ Subtitle ✎
              </span>
            )}
          </div>
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

            return (
              <div
                key={index}
                onClick={() => {
                  if (isEditor && onSelectElement) {
                    onSelectElement("item", index);
                  }
                }}
                className={`rounded-lg border transition-all ${
                  isDark
                    ? isOpen
                      ? "border-gold-500/60 bg-white/10 shadow-subtle text-white"
                      : "border-white/10 bg-white/5 hover:border-gold-500/40 text-white"
                    : isOpen
                    ? "border-navy-900/40 bg-paper shadow-subtle text-ink"
                    : "border-line bg-white hover:border-navy-900/20 text-ink"
                } ${
                  isEditor
                    ? "group/faq relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 cursor-pointer"
                    : ""
                }`}
              >
                {isEditor && (
                  <span className="hidden group-hover/faq:inline-flex absolute -top-3.5 right-4 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap">
                    FAQ Question #{index + 1} ✎
                  </span>
                )}
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
                  <span className={`font-heading font-bold text-lg leading-snug ${isDark ? "text-white" : "text-navy-900"}`}>
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
                    <p className="pt-3">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions band */}
        <div className="mt-12 text-center max-w-md mx-auto p-6 rounded-lg bg-paper border border-line">
          <h3 className="font-heading text-lg font-bold text-navy-900 mb-1">
            Still have a question?
          </h3>
          <p className="text-xs text-ink-soft mb-4">
            Our admissions advisers are ready to help clarify any aspect of your
            qualification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <BookingCTAButton
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
            >
              Book a free call
            </BookingCTAButton>
            <Link
              href="/contact"
              className="text-xs font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 py-2"
            >
              Contact our office
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
};
