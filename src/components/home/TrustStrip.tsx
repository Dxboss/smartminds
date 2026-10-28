import React from "react";
import Image from "next/image";
import { siteConfig } from "@/content/siteConfig";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import {
  AccreditationBadgeRow,
  AccreditationBadgeItem,
} from "@/components/accreditation/AccreditationLogos";
import { resolveSectionBg, SectionBgColor, resolveItemColor } from "@/components/ui/sectionBg";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";
import {
  resolveTypography,
  resolveSubheadlineTypography,
} from "@/components/ui/typographyUtils";

export interface TrustStripProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  headlineFontFamily?: string;
  headlineFontSize?: string;
  headlineFontWeight?: string;
  headlineFontStyle?: string;
  headlineColor?: string;
  subheadlineFontFamily?: string;
  subheadlineFontSize?: string;
  subheadlineFontWeight?: string;
  subheadlineFontStyle?: string;
  subheadlineColor?: string;
  items?: AccreditationBadgeItem[];
  bgColor?: SectionBgColor;
  columnRatio?: "50-50" | "60-40" | "70-30" | "40-60" | "33-67";
  mediaPosition?: "left" | "right";
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
      | "bg",
    itemIndex?: number
  ) => void;
}

export const TrustStrip: React.FC<TrustStripProps> = ({
  headline,
  subheadline,
  badgeText,
  badgeColor,
  badgeBgColor,
  headlineFontFamily,
  headlineFontSize,
  headlineFontWeight,
  headlineFontStyle,
  headlineColor,
  subheadlineFontFamily,
  subheadlineFontSize,
  subheadlineFontWeight,
  subheadlineFontStyle,
  subheadlineColor,
  items,
  bgColor = "white",
  columnRatio = "60-40",
  mediaPosition = "right",
  isEditor,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const isImageLeft = mediaPosition === "left";
  const { bgClass, isDark, style: bgStyle } = resolveSectionBg(bgColor, "white");

  const resolvedHeadlineColor = headlineColor ? resolveItemColor(headlineColor) : undefined;
  const resolvedSubheadlineColor = subheadlineColor ? resolveItemColor(subheadlineColor) : undefined;
  const resolvedBadgeColor = badgeColor ? resolveItemColor(badgeColor) : undefined;
  const resolvedBadgeBg = badgeBgColor ? resolveItemColor(badgeBgColor) : undefined;

  // Determine width balance based on columnRatio
  const getRatioClasses = (ratio?: string) => {
    switch (ratio) {
      case "50-50":
        return {
          reviewsClass: "md:w-1/2 md:max-w-md",
          badgesClass: "md:w-1/2",
        };
      case "70-30":
        return {
          reviewsClass: "md:w-7/12 md:max-w-lg",
          badgesClass: "md:w-5/12",
        };
      case "40-60":
        return {
          reviewsClass: "md:w-4/12 md:max-w-sm",
          badgesClass: "md:w-8/12",
        };
      case "33-67":
        return {
          reviewsClass: "md:w-1/3 md:max-w-xs",
          badgesClass: "md:w-2/3",
        };
      case "60-40":
      default:
        return {
          reviewsClass: "md:w-auto md:max-w-md flex-shrink-0",
          badgesClass: "md:flex-1",
        };
    }
  };

  const { reviewsClass, badgesClass } = getRatioClasses(columnRatio);

  return (
    <section
      aria-label="Accreditations and Learner Reviews"
      style={bgStyle}
      className={`${bgClass} py-6 sm:py-8 shadow-subtle relative z-20 border-b border-line overflow-hidden`}
    >
      <Container>
        <div
          className={`flex flex-col ${
            isImageLeft ? "md:flex-row-reverse" : "md:flex-row"
          } items-center justify-between gap-6 md:gap-8 lg:gap-10`}
        >
          {/* Reviews Rating & Real Learner Photos (Guaranteed max-width so writeup never touches logos) */}
          <div className={`${reviewsClass} min-w-0 w-full`}>
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "badge"}
              label="Reviews & Rating"
              onClick={() => onSelectElement?.("badge")}
              className="flex items-center gap-3.5 sm:gap-4 p-2 -m-2 rounded-sm"
            >
              {/* 3 overlapping real student/tutor circular photos */}
              <div className="flex -space-x-3 flex-shrink-0" aria-hidden="true">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white shadow-xs bg-line flex-shrink-0">
                  <Image
                    src="/images/certificate-moment.jpg"
                    alt="Certified healthcare graduate"
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white shadow-xs bg-line flex-shrink-0">
                  <Image
                    src="/images/tutor-teaching.jpg"
                    alt="Subject-specialist tutor"
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white shadow-xs bg-line flex-shrink-0">
                  <Image
                    src="/images/hero-learner.jpg"
                    alt="Adult online learner"
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Rating info & Writeup: strict max-w and text wrapping to prevent any overflow */}
              <div
                style={resolvedBadgeBg ? { backgroundColor: resolvedBadgeBg } : undefined}
                className="min-w-0 max-w-[230px] sm:max-w-[260px] lg:max-w-[290px]"
              >
                <div className="flex items-center gap-1 text-gold-500 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={14}
                      className="fill-gold-500 stroke-gold-700 flex-shrink-0"
                    />
                  ))}
                  <span
                    style={resolvedBadgeColor ? { color: resolvedBadgeColor } : undefined}
                    className={`font-heading font-bold text-sm ml-1 flex-shrink-0 ${
                      isDark ? "text-white" : "text-navy-900"
                    }`}
                  >
                    {badgeText || siteConfig.reviews.ratingValue}
                  </span>
                </div>
                <p
                  style={resolvedSubheadlineColor ? { color: resolvedSubheadlineColor } : undefined}
                  className={`text-xs leading-snug whitespace-normal break-words line-clamp-2 ${
                    isDark ? "text-paper/80" : "text-ink-soft"
                  }`}
                  title={subheadline || siteConfig.reviews.ratingCountText}
                >
                  {subheadline || siteConfig.reviews.ratingCountText}
                </p>
              </div>
            </EditableElementWrapper>
          </div>

          {/* Vertical Divider Strictly in the Center on Desktop */}
          <div
            className={`hidden md:block w-px h-10 flex-shrink-0 ${
              isDark ? "bg-navy-800" : "bg-line"
            }`}
            aria-hidden="true"
          />

          {/* Right: Verified UK Accreditation Logo Badges (Equal Heights, Right-aligned with Breathing Room) */}
          <div
            className={`${badgesClass} min-w-0 w-full flex flex-col items-start md:items-end gap-2`}
          >
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "headline"}
              label="Accreditation Headline"
              onClick={() => onSelectElement?.("headline")}
              className="p-1 -m-1 rounded-sm"
            >
              <span
                style={resolvedHeadlineColor ? { color: resolvedHeadlineColor } : undefined}
                className={`text-[11px] font-semibold uppercase tracking-wider block ${
                  isDark ? "text-paper/70" : "text-ink-soft"
                }`}
              >
                {headline || "Official Awarding & Regulated Bodies"}
              </span>
            </EditableElementWrapper>

            <div className="w-full overflow-x-auto scrollbar-none py-1 flex items-center justify-start md:justify-end">
              <AccreditationBadgeRow
                items={items}
                variant={isDark ? "dark" : "light"}
                className="justify-start md:justify-end flex-nowrap"
                isEditor={isEditor}
                selectedIndex={
                  selectedElementKey === "item" ? selectedElementItemIndex : null
                }
                onSelectBadge={(idx) => {
                  if (isEditor && onSelectElement) {
                    onSelectElement("item", idx);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
