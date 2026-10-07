import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

interface Step {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Talk to us",
    subtitle: "Free, zero-pressure advice call",
    description:
      "Speak directly with an academic adviser. We review your career objectives, prior experience, and confirm whether you are eligible for government funding or self-paced instalments.",
    badge: "15-minute call",
  },
  {
    number: "02",
    title: "Choose course & plan",
    subtitle: "Transparent pricing with no hidden fees",
    description:
      "Select your qualification level. Pay in full to save with an upfront discount, or spread the exact full price over monthly instalments at no extra charge.",
    badge: "Flexible payment",
  },
  {
    number: "03",
    title: "Join live classes",
    subtitle: "Interactive teaching with real tutors",
    description:
      "Participate in structured evening webinars with experienced UK practitioners. Ask questions in real time, participate in discussions, and receive individual tutor guidance.",
    badge: "Live + recordings",
  },
  {
    number: "04",
    title: "Get certified",
    subtitle: "Ofqual-regulated British diploma",
    description:
      "Submit coursework units with step-by-step marker feedback. Earn your accredited qualification from recognised awarding bodies (TQUK / CPD) to unlock new career opportunities.",
    badge: "Official diploma",
  },
];

export const HowItWorksTimeline: React.FC = () => {
  return (
    <Section variant="white" className="border-b border-line">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow tone="navy" className="mb-2">
            The Learning Journey
          </Eyebrow>
          <Heading level="h2" className="text-navy-900 mb-3">
            How it works: from consultation to qualification
          </Heading>
          <p className="text-ink-soft text-base sm:text-lg leading-relaxed">
            Our structured route gives you personal tutor support from day one,
            fitting around your working week with both live classes and 24/7
            access to recordings.
          </p>
        </div>

        {/* 4-Step Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="relative bg-paper rounded-lg border border-line p-6 flex flex-col justify-between shadow-subtle group hover:border-navy-900/30 transition-colors"
            >
              <div>
                {/* Step header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-heading font-bold text-3xl text-navy-900 tracking-tight">
                    {step.number}
                  </span>
                  {step.badge && (
                    <Tag variant="default" className="text-xs">
                      {step.badge}
                    </Tag>
                  )}
                </div>

                <h3 className="font-heading text-xl font-bold text-navy-900 mb-1">
                  {step.title}
                </h3>
                <span className="text-xs font-semibold text-gold-700 block mb-3">
                  {step.subtitle}
                </span>

                <p className="text-sm text-ink-soft leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Progress connector indicator */}
              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs text-ink-soft">
                <span className="font-mono">Step {index + 1} of 4</span>
                <span className="text-navy-900 font-bold">
                  {index < 3 ? "\u2192" : "\u2713"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated "Recordings available to rewatch" Callout Band per PRD 10.1 */}
        <div className="mt-10 bg-navy-900 text-white rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0 text-gold-500">
              <Icon name="clock" size={22} />
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold text-white mb-1">
                Worried about missing an evening session?
              </h4>
              <p className="text-sm text-paper/85 max-w-2xl leading-relaxed">
                Every live class is recorded in high definition and published to
                your student stream within 24 hours. You can rewatch lessons,
                review slides, and catch up at your own pace without falling
                behind.
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 self-stretch md:self-auto flex items-center">
            <span className="px-3.5 py-2 rounded-sm bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-gold-300">
              Unlimited Replays
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
};
