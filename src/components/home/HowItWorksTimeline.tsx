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

import { BuilderSectionItem } from "@/lib/repositories/seedData";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";
import { resolveSectionBg, SectionBgColor } from "@/components/ui/sectionBg";
import {
  resolveCardContainerStyles,
  resolveTypography,
  resolveSubheadlineTypography,
  resolveBadgeStyles,
} from "@/components/ui/typographyUtils";

export interface HowItWorksTimelineProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  badgeFontFamily?: string;
  badgeWeight?: string;
  bgColor?: SectionBgColor;
  columns?: 2 | 3 | 4;
  items?: BuilderSectionItem[];
  calloutHeadline?: string;
  calloutText?: string;
  calloutBadge?: string;
  calloutIcon?: string;
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
      | "video"
      | "callout",
    itemIndex?: number
  ) => void;
}

export const HowItWorksTimeline: React.FC<HowItWorksTimelineProps> = ({
  headline = "How it works: from consultation to qualification",
  subheadline = "Our structured route gives you personal tutor support from day one, fitting around your working week with both live classes and 24/7 access to recordings.",
  badgeText,
  badgeColor,
  badgeBgColor,
  badgeFontFamily,
  badgeWeight,
  bgColor = "white",
  columns = 4,
  items,
  calloutHeadline = "Worried about missing an evening session?",
  calloutText = "Every live class is recorded in high definition and published to your student stream within 24 hours. You can rewatch lessons, review slides, and catch up at your own pace without falling behind.",
  calloutBadge = "Unlimited Replays",
  calloutIcon = "clock",
  calloutBgColor = "navy",
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
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
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
      : columns === 3
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  // Use dynamic editable items if configured; fallback to default steps
  const renderedSteps: Step[] =
    items && items.length > 0
      ? items.map((it, idx) => ({
          number: it.number || (idx < 9 ? `0${idx + 1}` : `${idx + 1}`),
          title: it.title,
          subtitle: it.subtitle || it.tag || "",
          description: it.desc || "",
          badge: it.badge || it.tag,
        }))
      : STEPS;

  return (
    <Section variant={bgColor} className="border-b border-line">
      <Container>
        <div
          className={`max-w-2xl mb-14 ${
            headlineAlign === "left"
              ? "text-left"
              : headlineAlign === "right"
              ? "ml-auto text-right"
              : "text-center mx-auto"
          }`}
        >
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "badge"}
            label="Journey Eyebrow"
            onClick={() => onSelectElement?.("badge")}
            className="inline-block mb-2"
          >
            <Eyebrow
              tone={isDark ? "gold" : "navy"}
              style={badgeStyle}
              className={badgeColor || badgeBgColor ? badgeClass : ""}
            >
              {badgeText || "The Learning Journey"}
            </Eyebrow>
          </EditableElementWrapper>

          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "headline"}
            label="Journey Headline"
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
            label="Journey Subheadline"
            onClick={() => onSelectElement?.("subheadline")}
            className="block"
          >
            <p style={subStyle} className={subClass}>
              {subheadline}
            </p>
          </EditableElementWrapper>
        </div>

        {/* Dynamic Timeline Grid */}
        <div className={`grid ${colClass} gap-6 relative`}>
          {renderedSteps.map((step, index) => {
            const rawItem = items?.[index];
            const { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle } = resolveCardContainerStyles(rawItem, isDark);

            return (
              <EditableElementWrapper
                key={step.number + index}
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "item" && selectedElementItemIndex === index}
                label={`Step #${index + 1}`}
                onClick={() => onSelectElement?.("item", index)}
                className="h-full"
              >
                <div
                  style={containerStyle}
                  className={`relative flex flex-col justify-between h-full ${containerClass}`}
                >
                  <div>
                    {/* Step header */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`font-heading font-bold text-3xl tracking-tight ${isDark || rawItem?.cardBg === "navy" ? "text-gold-300" : "text-navy-900"}`}>
                        {step.number}
                      </span>
                      {step.badge && (
                        <Tag variant={rawItem?.badgeVariant || (isDark || rawItem?.cardBg === "navy" ? "gold" : "default")} className="text-xs">
                          {step.badge}
                        </Tag>
                      )}
                    </div>

                    <h3 style={titleStyle} className={`mb-1 ${titleClass}`}>
                      {step.title}
                    </h3>
                    {step.subtitle && (
                      <span className={`text-xs font-semibold block mb-3 ${isDark || rawItem?.cardBg === "navy" ? "text-gold-300" : "text-navy-700"}`}>
                        {step.subtitle}
                      </span>
                    )}

                    <p style={descStyle} className={`leading-relaxed ${descClass}`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Progress connector indicator */}
                  <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${isDark || rawItem?.cardBg === "navy" ? "border-white/10 text-paper/60" : "border-line text-ink-soft"}`}>
                    <span className="font-mono">Step {index + 1} of {renderedSteps.length}</span>
                    <span className={`font-bold ${isDark || rawItem?.cardBg === "navy" ? "text-gold-300" : "text-navy-900"}`}>
                      {index < renderedSteps.length - 1 ? "→" : "✓"}
                    </span>
                  </div>
                </div>
              </EditableElementWrapper>
            );
          })}
        </div>

        {/* Dedicated "Recordings available to rewatch" Callout Band per PRD 10.1 */}
        {showCallout !== false && (
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "callout"}
            label="Callout Band"
            onClick={() => onSelectElement?.("callout")}
          >
            {(() => {
              const isLightCallout =
                calloutBgColor === "paper" ||
                calloutBgColor === "white" ||
                calloutBgColor === "cream" ||
                calloutBgColor === "gold" ||
                calloutBgColor === "mint" ||
                calloutBgColor === "sand";

              const calloutBgClass =
                calloutBgColor === "paper"
                  ? "bg-paper text-navy-900 border border-line"
                  : calloutBgColor === "cream"
                  ? "bg-cream text-navy-900 border border-gold-300"
                  : calloutBgColor === "slate"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : calloutBgColor === "gold"
                  ? "bg-gold-500 text-navy-900 border border-gold-600"
                  : calloutBgColor === "white"
                  ? "bg-white text-navy-900 border border-line shadow-sm"
                  : "bg-navy-900 text-white";

              return (
                <div
                  className={`mt-10 rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors ${calloutBgClass}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-sm flex items-center justify-center shrink-0 ${
                        isLightCallout
                          ? "bg-navy-900/10 text-navy-900"
                          : "bg-white/10 text-gold-500"
                      }`}
                    >
                      <Icon name={(calloutIcon as any) || "clock"} size={22} />
                    </div>
                    <div>
                      <h4
                        className={`font-heading text-lg font-bold mb-1 ${
                          isLightCallout ? "text-navy-900" : "text-white"
                        }`}
                      >
                        {calloutHeadline || "Worried about missing an evening session?"}
                      </h4>
                      <p
                        className={`text-sm max-w-2xl leading-relaxed ${
                          isLightCallout ? "text-ink-soft" : "text-paper/85"
                        }`}
                      >
                        {calloutText ||
                          "Every live class is recorded in high definition and published to your student stream within 24 hours. You can rewatch lessons, review slides, and catch up at your own pace without falling behind."}
                      </p>
                    </div>
                  </div>

                  {calloutBadge && (
                    <div className="shrink-0 self-stretch md:self-auto flex items-center">
                      <span
                        className={`px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider ${
                          isLightCallout
                            ? "bg-navy-900 text-white"
                            : "bg-white/10 border border-white/20 text-gold-300"
                        }`}
                      >
                        {calloutBadge}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </EditableElementWrapper>
        )}
      </Container>
    </Section>
  );
};
