"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon, IconName } from "@/components/ui/Icon";
import { BuilderSectionItem } from "@/lib/repositories/seedData";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";
import {
  resolveTypography,
  resolveSubheadlineTypography,
} from "@/components/ui/typographyUtils";
import { resolveSectionBg } from "@/components/ui/sectionBg";

export interface StudentIDBenefitsSectionProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: string;
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

const DEFAULT_BENEFITS: BuilderSectionItem[] = [
  {
    title: "Recognised UK Student Status & TOTUM Card",
    desc: "Unlock thousands of student discounts across 350+ UK retailers, dining, software, and public transit with your verified student registration.",
    icon: "credit-card",
  },
  {
    title: "24/7 Virtual Portal & Live Webinar Replays",
    desc: "Never fall behind with around-the-clock access to recorded live evening seminars, unit workbooks, coursework upload dropboxes, and assessor messaging.",
    icon: "calendar",
  },
  {
    title: "Instant Employer Digital QR Verification",
    desc: "Every certificate features a secure cryptographic QR code allowing care homes, schools, and NHS trusts to instantly verify your qualifications online.",
    icon: "shield-check",
  },
];

export const StudentIDBenefitsSection: React.FC<StudentIDBenefitsSectionProps> = ({
  headline = "Get Official Student ID & NUS TOTUM Benefits",
  subheadline = "Every enrolled learner receives official British college credentials, granting verified student status and nationwide retail benefits.",
  badgeText = "Verified Student Credentials",
  buttonText = "Explore Accredited Courses",
  buttonLink = "/courses",
  bgColor = "white",
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
  const { bgClass, isDark, style } = resolveSectionBg(bgColor, "white");

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

  const activeBenefits = items && items.length > 0 ? items : DEFAULT_BENEFITS;

  return (
    <section
      style={style}
      className={`py-20 lg:py-28 ${bgClass} border-b border-line overflow-hidden`}
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Features & Copy */}
          <div className="lg:col-span-6 space-y-6">
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "badge"}
              label="Benefits Eyebrow"
              onClick={() => onSelectElement?.("badge")}
              className="inline-block"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paper border border-line text-navy-900 text-xs font-bold uppercase tracking-wider">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>{badgeText}</span>
              </div>
            </EditableElementWrapper>

            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "headline"}
              label="Benefits Headline"
              onClick={() => onSelectElement?.("headline")}
              className="block"
            >
              <h2 style={hlStyle} className={`tracking-tight leading-tight ${hlClass}`}>
                {headline}
              </h2>
            </EditableElementWrapper>

            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "subheadline"}
              label="Benefits Subheadline"
              onClick={() => onSelectElement?.("subheadline")}
              className="block"
            >
              <p style={subStyle} className={`leading-relaxed max-w-xl ${subClass}`}>
                {subheadline}
              </p>
            </EditableElementWrapper>

            <div className="space-y-4 pt-2">
              {activeBenefits.map((item, idx) => {
                const cardStyle: React.CSSProperties = {
                  backgroundColor: item.cardBg
                    ? item.cardBg === "white"
                      ? "#ffffff"
                      : item.cardBg === "navy"
                      ? "#23216B"
                      : item.cardBg === "gold_subtle"
                      ? "#F3E58A"
                      : item.cardBg === "paper"
                      ? "#FAF8F3"
                      : undefined
                    : undefined,
                  borderColor: item.cardBorder
                    ? item.cardBorder === "none"
                      ? "transparent"
                      : item.cardBorder === "gold"
                      ? "#D9B84A"
                      : item.cardBorder === "navy"
                      ? "#23216B"
                      : undefined
                    : undefined,
                  borderRadius:
                    item.cardRadius === "none" ? "0" : item.cardRadius === "sm" ? "6px" : item.cardRadius === "xl" ? "20px" : undefined,
                };

                const titleStyle: React.CSSProperties = {
                  color: item.titleColor
                    ? item.titleColor === "white"
                      ? "#ffffff"
                      : item.titleColor === "navy"
                      ? "#23216B"
                      : item.titleColor === "gold"
                      ? "#B78A2E"
                      : item.titleColor === "ink_soft"
                      ? "#5A5A6E"
                      : undefined
                    : undefined,
                  fontSize: item.titleSize === "sm" ? "14px" : item.titleSize === "lg" ? "18px" : item.titleSize === "xl" ? "20px" : undefined,
                  fontWeight: item.titleWeight === "normal" ? 400 : item.titleWeight === "medium" ? 500 : item.titleWeight === "semibold" ? 600 : item.titleWeight === "bold" ? 700 : undefined,
                };

                const descStyle: React.CSSProperties = {
                  color: item.descColor
                    ? item.descColor === "white"
                      ? "#ffffff"
                      : item.descColor === "navy"
                      ? "#23216B"
                      : item.descColor === "gold"
                      ? "#B78A2E"
                      : item.descColor === "ink_soft"
                      ? "#5A5A6E"
                      : undefined
                    : undefined,
                };

                return (
                  <EditableElementWrapper
                    key={item.title + idx}
                    isEditor={isEditor}
                    isSelected={
                      isEditor &&
                      selectedElementKey === "item" &&
                      selectedElementItemIndex === idx
                    }
                    label={`Benefit #${idx + 1}`}
                    onClick={() => onSelectElement?.("item", idx)}
                    className="block rounded-xl"
                  >
                    <div
                      style={cardStyle}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                        isDark
                          ? "bg-white/5 border-white/10 hover:border-gold-400"
                          : "bg-paper/60 border-line hover:border-navy-900/40"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center flex-shrink-0">
                        <Icon
                          name={(item.icon as IconName) || "check-circle"}
                          size={20}
                          className="text-gold-400"
                        />
                      </div>
                      <div>
                        <h3
                          style={titleStyle}
                          className={`font-heading font-bold text-base ${
                            isDark ? "text-white" : "text-navy-900"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p
                          style={descStyle}
                          className={`text-sm mt-0.5 leading-normal ${
                            isDark ? "text-paper/70" : "text-ink-soft"
                          }`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </EditableElementWrapper>
                );
              })}
            </div>

            <div className="pt-2">
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "button"}
                label="Primary Button"
                onClick={() => onSelectElement?.("button")}
                className="inline-block"
              >
                <Link
                  href={buttonLink || "/courses"}
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-navy-900 text-white font-heading font-bold text-sm tracking-wide shadow-md hover:bg-navy-800 transition-all hover:scale-[1.02]"
                >
                  <span>{buttonText}</span>
                  <Icon name="arrow-right" size={16} className="ml-2 text-gold-400" />
                </Link>
              </EditableElementWrapper>
            </div>
          </div>

          {/* Right: Realistic Student ID Card Showcase Panel */}
          <div className="lg:col-span-6">
            <div className="relative p-6 sm:p-10 rounded-2xl bg-paper border border-line shadow-lg">
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* ID Card Front */}
                <div className="w-full max-w-[280px] bg-white rounded-xl p-5 shadow-xl border border-line/90 transform sm:-rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-line">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-xs bg-navy-900 text-white flex items-center justify-center text-[10px] font-bold">
                        SM
                      </div>
                      <div>
                        <span className="font-heading font-extrabold text-xs text-navy-900 block leading-none">
                          SMARTMINDS
                        </span>
                        <span className="text-[9px] text-ink-soft block leading-none tracking-wider uppercase mt-0.5">
                          Training College
                        </span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-gold-500/15 text-gold-700 border border-gold-500/30 uppercase">
                      Official ID
                    </span>
                  </div>

                  <div className="pt-4 flex flex-col items-center text-center">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-navy-900 shadow-sm mb-3">
                      <Image
                        src="/images/hero-learner.jpg"
                        alt="Enrolled Student"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-navy-900 leading-tight">
                      Sarah Jenkins
                    </h4>
                    <span className="text-[11px] text-ink-soft block mt-0.5">
                      Diploma in Adult Care (RQF Level 5)
                    </span>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-paper text-navy-900 text-[10px] font-bold border border-line">
                      ID: SMT-2026-8819
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[9px] text-ink-soft">
                    <span>STATUS: ACTIVE</span>
                    <span className="font-bold text-navy-900">EXP: 10/2027</span>
                  </div>
                </div>

                {/* ID Card Back */}
                <div className="w-full max-w-[280px] bg-white rounded-xl p-5 shadow-xl border border-line/90 transform sm:rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-8 bg-navy-900 rounded-xs mb-4 flex items-center px-3">
                    <span className="text-[9px] font-mono text-paper tracking-widest">
                      ACCREDITED VOCATIONAL LEARNER
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded-md bg-paper border border-line flex items-center justify-between">
                      <div className="text-[10px] space-y-0.5">
                        <span className="font-bold text-navy-900 block">QR Security Token</span>
                        <span className="text-[9px] text-ink-soft block">Scan for live registry proof</span>
                      </div>
                      <div className="w-12 h-12 bg-navy-900 rounded flex items-center justify-center text-white">
                        <Icon name="shield-check" size={24} className="text-gold-500" />
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <div className="h-6 w-full flex items-center justify-center gap-1 opacity-70">
                        {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 4, 2, 6, 1].map((w, i) => (
                          <div
                            key={i}
                            className="bg-navy-900 h-full rounded-xs"
                            style={{ width: `${w * 1.5}px` }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[9px] text-ink-soft block tracking-widest mt-1">
                        *SMT982140182390*
                      </span>
                    </div>

                    <div className="pt-2 border-t border-line text-center">
                      <span className="text-[9px] font-bold text-navy-900 uppercase tracking-wider block">
                        UK Register of Learning Providers: 10094821
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
