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
  type FontFamilyChoice,
  type FontSizeChoice,
  type FontWeightChoice,
  type FontStyleChoice,
  type FontColorChoice,
} from "@/components/ui/typographyUtils";
import { resolveSectionBg, resolveItemColor, isDarkHex } from "@/components/ui/sectionBg";

export interface StaffTrainingSectionProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  metricsBannerTitle?: string;
  metricsBannerSubtitle?: string;
  metricsBannerIcon?: string;
  items?: BuilderSectionItem[];
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: string;
  headlineFontFamily?: FontFamilyChoice;
  headlineFontSize?: FontSizeChoice;
  headlineFontWeight?: FontWeightChoice;
  headlineFontStyle?: FontStyleChoice;
  headlineColor?: FontColorChoice;
  headlineTransform?: "normal" | "uppercase";
  headlineAlign?: "left" | "center" | "right";
  subheadlineFontFamily?: FontFamilyChoice;
  subheadlineFontSize?: FontSizeChoice;
  subheadlineFontWeight?: FontWeightChoice;
  subheadlineFontStyle?: FontStyleChoice;
  subheadlineColor?: FontColorChoice;
  subheadlineAlign?: "left" | "center" | "right";
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
      | "floatingBadge",
    itemIndex?: number
  ) => void;
}

const DEFAULT_BENEFITS = [
  {
    title: "Group Discounts & Bulk Onboarding",
    desc: "Tiered corporate tuition rates for residential care homes, nursery groups, and schools training cohorts of 3 to 50+ staff simultaneously.",
    icon: "users" as IconName,
    color: "teal",
  },
  {
    title: "Dedicated Account Manager & Progress Dashboard",
    desc: "Real-time manager visibility into employee attendance, assignment submissions, guided learning hours, and expected completion dates.",
    icon: "check" as IconName,
    color: "amber",
  },
  {
    title: "30-Day Corporate Invoicing & Flexible Billing",
    desc: "Structured payment plans aligned to your institutional training budget with zero interest or setup costs.",
    icon: "credit-card" as IconName,
    color: "blue",
  },
];

export const StaffTrainingSection: React.FC<StaffTrainingSectionProps> = ({
  headline = "Staff Training & Corporate Enrolment",
  subheadline = "Upskill your healthcare assistants, nursery practitioners, and operational leaders with tailored institutional cohorts, volume fee reductions, and dedicated assessor allocation.",
  badgeText = "Corporate Training",
  metricsBannerTitle = "50+ UK Care & Education Providers",
  metricsBannerSubtitle = "Trust Smartminds for annual accredited staff compliance & diplomas",
  metricsBannerIcon = "users",
  items,
  image = "/images/staff-training-team.jpg",
  buttonText = "Request Corporate Prospectus",
  buttonLink = "/contact",
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
  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily,
    fontSize: headlineFontSize,
    fontWeight: headlineFontWeight,
    fontStyle: headlineFontStyle,
    color: headlineColor,
    transform: headlineTransform,
    align: headlineAlign || "left",
    defaultFamily: "heading",
    defaultSize: "xl",
    defaultWeight: "bold",
  });

  const { className: subClass, style: subStyle } = resolveSubheadlineTypography({
    fontFamily: subheadlineFontFamily,
    fontSize: subheadlineFontSize,
    fontWeight: subheadlineFontWeight,
    fontStyle: subheadlineFontStyle,
    color: subheadlineColor,
    align: subheadlineAlign || "left",
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

  interface StaffBenefitPoint {
    title: string;
    desc: string;
    icon: IconName;
    color: string;
    iconColor?: string;
    cardBg?: string;
    cardBorder?: string;
    titleColor?: string;
    descColor?: string;
  }

  const activePoints: StaffBenefitPoint[] =
    items && items.length > 0
      ? items.map((it, idx) => ({
          title: it.title,
          desc: it.desc || "",
          icon: (it.icon as IconName) || DEFAULT_BENEFITS[idx % DEFAULT_BENEFITS.length].icon,
          color: idx === 0 ? "teal" : idx === 1 ? "amber" : "blue",
          iconColor: (it as any).iconColor,
          cardBg: it.cardBg,
          cardBorder: it.cardBorder,
          titleColor: it.titleColor,
          descColor: it.descColor,
        }))
      : DEFAULT_BENEFITS;
  return (
    <section className="py-20 lg:py-28 bg-paper border-b border-line overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 lg:items-stretch">
          {/* Left: Team & Training Visual Showcase (Equal Height to Right Side) */}
          <div className="lg:col-span-6 relative flex flex-col">
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "image"}
              label="Staff Training Image"
              onClick={() => onSelectElement?.("image")}
              className="h-full"
            >
              <div className="relative w-full h-full min-h-[380px] lg:min-h-[520px] rounded-3xl overflow-hidden shadow-xl border-2 border-teal-100 bg-white flex flex-col justify-between">
                <div className="relative w-full flex-1 min-h-[320px]">
                  <Image
                    src={image || "/images/staff-training-team.jpg"}
                    alt="Smartminds assessor delivering staff training workshop to healthcare and education professionals"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 550px"
                    priority
                  />
                </div>

                {/* Symmetrical Corporate Metrics Banner at Bottom */}
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "floatingBadge"}
                  label="Corporate Metrics Banner"
                  onClick={() => onSelectElement?.("floatingBadge")}
                  inline
                  className="w-full"
                >
                  <div className="relative z-10 p-4 sm:p-5 bg-white/95 backdrop-blur-md border-t border-line">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#0B4D4E] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Icon name={(metricsBannerIcon as IconName) || "users"} size={22} />
                      </div>
                      <div>
                        <span className="font-heading font-extrabold text-sm sm:text-base text-[#0B4D4E] block leading-tight">
                          {metricsBannerTitle || "50+ UK Care & Education Providers"}
                        </span>
                        <span className="text-xs text-ink-soft block leading-tight mt-0.5">
                          {metricsBannerSubtitle || "Trust Smartminds for annual accredited staff compliance & diplomas"}
                        </span>
                      </div>
                    </div>
                  </div>
                </EditableElementWrapper>
              </div>
            </EditableElementWrapper>
          </div>

          {/* Right: Copy & Corporate Benefits (Equal Heights for all 3 cards) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "badge"}
                label="Badge"
                onClick={() => onSelectElement?.("badge")}
                inline
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>{badgeText || "Corporate Training"}</span>
                </div>
              </EditableElementWrapper>

              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "headline"}
                label="Headline"
                onClick={() => onSelectElement?.("headline")}
              >
                <h2
                  style={hlStyle}
                  className={`tracking-tight leading-tight ${hlClass}`}
                >
                  {headline}
                </h2>
              </EditableElementWrapper>

              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "subheadline"}
                label="Subheadline"
                onClick={() => onSelectElement?.("subheadline")}
                className="mt-2"
              >
                <p
                  style={subStyle}
                  className={`leading-relaxed max-w-xl ${subClass}`}
                >
                  {subheadline}
                </p>
              </EditableElementWrapper>
            </div>

            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              {activePoints.map((point, idx) => {
                const resolvedBg = resolveItemColor(point.cardBg);
                const isNavyCard = point.cardBg === "navy" || (resolvedBg ? isDarkHex(resolvedBg) : false);
                const resolvedBorder = resolveItemColor(point.cardBorder);
                const resolvedTitleCol = resolveItemColor(point.titleColor);
                const resolvedDescCol = resolveItemColor(point.descColor);

                const cardStyle: React.CSSProperties = {
                  backgroundColor: resolvedBg || "#ffffff",
                  borderColor: resolvedBorder || (point.cardBorder === "none" ? "transparent" : isNavyCard ? "rgba(255,255,255,0.15)" : "#E6E1D5"),
                };
                const titleStyle: React.CSSProperties = {
                  color: resolvedTitleCol || (isNavyCard ? "#ffffff" : "#23216B"),
                };
                const descStyle: React.CSSProperties = {
                  color: resolvedDescCol || (isNavyCard ? "rgba(255,255,255,0.85)" : "#5A5A6E"),
                };

                const iconTone = point.iconColor || (isNavyCard ? "gold" : point.color);
                const iconColor =
                  iconTone === "gold"
                    ? "bg-gold-50 text-gold-700 border-gold-200"
                    : iconTone === "navy"
                    ? "bg-navy-900 text-gold-300 border-navy-700"
                    : iconTone === "white"
                    ? "bg-white/15 text-white border-white/30"
                    : iconTone === "amber"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : iconTone === "blue"
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : "bg-teal-50 text-[#0B4D4E] border-teal-100";

                return (
                  <EditableElementWrapper
                    key={point.title + idx}
                    isEditor={isEditor}
                    isSelected={isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx}
                    label={`Benefit Point #${idx + 1}`}
                    onClick={() => onSelectElement?.("item", idx)}
                  >
                    <div style={cardStyle} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-line hover:border-[#0B4D4E] transition-all shadow-xs min-h-[88px]">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-xs ${iconColor}`}>
                        <Icon name={point.icon} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 style={titleStyle} className="font-heading font-bold text-base text-navy-900 leading-snug">
                          {point.title}
                        </h3>
                        <p style={descStyle} className="text-xs sm:text-sm text-ink-soft mt-0.5 leading-normal">
                          {point.desc}
                        </p>
                      </div>
                    </div>
                  </EditableElementWrapper>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "button"}
                label="Primary CTA"
                onClick={() => onSelectElement?.("button")}
                inline
              >
                <Link
                  href={buttonLink || "/contact"}
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-navy-900 text-white font-heading font-bold text-sm tracking-wide shadow-md hover:bg-navy-700 transition-all hover:scale-[1.02]"
                >
                  <span>{buttonText || "Request Corporate Proposal"}</span>
                  <Icon name="arrow-right" size={16} className="ml-2" />
                </Link>
              </EditableElementWrapper>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white text-navy-900 border border-line font-heading font-bold text-sm tracking-wide hover:border-navy-700 transition-colors"
              >
                <span>Speak to Admissions</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
