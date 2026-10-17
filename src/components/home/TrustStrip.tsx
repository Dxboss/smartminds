import React from "react";
import Image from "next/image";
import { siteConfig } from "@/content/siteConfig";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import {
  AccreditationBadgeRow,
  AccreditationBadgeItem,
} from "@/components/accreditation/AccreditationLogos";
import { resolveSectionBg, SectionBgColor } from "@/components/ui/sectionBg";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";

export interface TrustStripProps {
  headline?: string;
  subheadline?: string;
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

  const getColSpans = (ratio?: string) => {
    switch (ratio) {
      case "50-50":
        return { reviews: "md:col-span-5", badges: "md:col-span-6" };
      case "70-30":
        return { reviews: "md:col-span-7", badges: "md:col-span-4" };
      case "40-60":
        return { reviews: "md:col-span-4", badges: "md:col-span-7" };
      case "33-67":
        return { reviews: "md:col-span-3", badges: "md:col-span-8" };
      case "60-40":
      default:
        return { reviews: "md:col-span-5", badges: "md:col-span-6" };
    }
  };

  const { reviews: reviewsColSpan, badges: badgesColSpan } = getColSpans(columnRatio);

  return (
    <section
      aria-label="Accreditations and Learner Reviews"
      style={bgStyle}
      className={`${bgClass} py-8 shadow-subtle relative z-20 border-b border-line`}
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Reviews Rating & Real Learner Photos */}
          <div className={`${reviewsColSpan} ${isImageLeft ? "md:order-2" : "md:order-1"}`}>
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "badge"}
              label="Reviews & Rating"
              onClick={() => onSelectElement?.("badge")}
              className="flex items-center gap-4 p-2 -m-2 rounded-sm"
            >
            {/* 3 overlapping real student/tutor circular photos */}
            <div className="flex -space-x-3 flex-shrink-0" aria-hidden="true">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-line">
                <Image
                  src="/images/certificate-moment.jpg"
                  alt="Certified healthcare graduate"
                  fill
                  sizes="44px"
                  loading="eager"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-line">
                <Image
                  src="/images/tutor-teaching.jpg"
                  alt="Subject-specialist tutor"
                  fill
                  sizes="44px"
                  loading="eager"
                  className="object-cover"
                />
              </div>
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-line">
                <Image
                  src="/images/hero-learner.jpg"
                  alt="Adult online learner"
                  fill
                  sizes="44px"
                  loading="eager"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Rating info from content config */}
            <div>
              <div className="flex items-center gap-1 text-gold-500 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={14}
                    className="fill-gold-500 stroke-gold-700"
                  />
                ))}
                <span className={`font-heading font-bold text-sm ml-1 ${isDark ? "text-white" : "text-navy-900"}`}>
                  {siteConfig.reviews.ratingValue}
                </span>
              </div>
              <p className={`text-xs leading-tight ${isDark ? "text-paper/80" : "text-ink-soft"}`}>
                {subheadline || siteConfig.reviews.ratingCountText}
              </p>
            </div>

            </EditableElementWrapper>
          </div>

          {/* Vertical Divider on Desktop */}
          <div className={`hidden md:block md:col-span-1 border-l h-10 mx-auto ${isDark ? "border-navy-800" : "border-line"}`} />

          {/* Right: Verified UK Accreditation Logo Badges (Equal Heights) */}
          <div className={`${badgesColSpan} ${isImageLeft ? "md:order-1" : "md:order-2"} flex flex-col items-start md:items-end gap-2`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-paper/70" : "text-ink-soft"}`}>
              {headline || "Official Awarding & Regulated Bodies"}
            </span>
            <AccreditationBadgeRow
              items={items}
              variant={isDark ? "dark" : "light"}
              className="justify-start md:justify-end"
              isEditor={isEditor}
              onSelectBadge={(idx) => {
                if (isEditor && onSelectElement) {
                  onSelectElement("item", idx);
                }
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
};
