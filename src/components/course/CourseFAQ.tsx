"use client";

import React, { useState } from "react";
import { FAQ } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";

interface CourseFAQProps {
  faqs: FAQ[];
}

export const CourseFAQ: React.FC<CourseFAQProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="course-faq-heading" className="space-y-4">
      <Heading
        level="h2"
        id="course-faq-heading"
        className="text-navy-900 text-2xl"
      >
        Course FAQs
      </Heading>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const headingId = `c-faq-head-${idx}`;
          const panelId = `c-faq-panel-${idx}`;

          return (
            <div
              key={idx}
              className={`rounded-lg border transition-all ${
                isOpen
                  ? "border-navy-900/40 bg-paper shadow-subtle"
                  : "border-line bg-white hover:border-navy-900/20"
              }`}
            >
              <button
                type="button"
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-navy-900 rounded-lg"
              >
                <span className="font-heading font-bold text-base sm:text-lg text-navy-900 leading-snug">
                  {faq.question}
                </span>

                <span
                  className={`w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 transition-transform ${
                    isOpen
                      ? "bg-navy-900 text-white rotate-180"
                      : "bg-paper text-navy-900"
                  }`}
                >
                  <Icon name="chevron-down" size={14} />
                </span>
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-ink-soft leading-relaxed border-t border-line/60"
                >
                  <p className="pt-2">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
