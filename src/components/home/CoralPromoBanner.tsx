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
  type FontFamilyChoice,
  type FontSizeChoice,
  type FontWeightChoice,
  type FontStyleChoice,
  type FontColorChoice,
} from "@/components/ui/typographyUtils";
import { resolveItemColor } from "@/components/ui/sectionBg";

export interface CoralPromoBannerProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonBgColor?: string;
  secondaryButtonTextColor?: string;
  image?: string;
  items?: BuilderSectionItem[];
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
      | "video",
    itemIndex?: number
  ) => void;
}

const DEFAULT_PROMO_BULLETS = [
  {
    title: "100% Coursework & Portfolio Assessment",
    desc: "Zero closed-book exams. You are assessed on workplace portfolio evidence.",
  },
  {
    title: "0% Interest Monthly Fee Spread",
    desc: "Divide tuition into 3 to 12 interest-free monthly instalments.",
  },
  {
    title: "Dedicated British 1-to-1 Assessor",
    desc: "Direct mentor guidance, unlimited draft feedback, and live tutor workshops.",
  },
];

export const CoralPromoBanner: React.FC<CoralPromoBannerProps> = ({
  headline = "Why You Should Study With Smartminds?",
  subheadline,
  badgeText = "Limited Promotion",
  buttonText = "Explore Accredited Programmes",
  buttonLink = "/courses",
  buttonBgColor,
  buttonTextColor,
  secondaryButtonText = "Speak with an Assessor",
  secondaryButtonLink = "/book",
  secondaryButtonBgColor,
  secondaryButtonTextColor,
  image = "/images/promo-woman-card.jpg",
  items,
  bgColor,
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
    defaultColor: "white",
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
    defaultColor: "white",
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

  const bannerBgStyle: React.CSSProperties = {
    backgroundColor:
      bgColor === "navy"
        ? "#23216B"
        : bgColor === "teal"
        ? "#0B4D4E"
        : bgColor === "gold"
        ? "#B78A2E"
        : bgColor === "paper"
        ? "#FAF8F3"
        : bgColor?.startsWith("#") || bgColor?.startsWith("rgb")
        ? bgColor
        : "#E53935",
  };

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: buttonBgColor || "#ffffff",
    color: buttonTextColor || (bgColor === "navy" ? "#23216B" : "#E53935"),
  };

  const secondaryBtnStyle: React.CSSProperties = {
    backgroundColor: secondaryButtonBgColor || undefined,
    color: secondaryButtonTextColor || "#ffffff",
  };

  interface PromoBulletItem {
    title: string;
    desc: string;
    icon: IconName;
    titleColor?: string;
    descColor?: string;
    iconColor?: string;
    cardBg?: string;
  }

  const activeBullets: PromoBulletItem[] =
    items && items.length > 0
      ? items.map((it) => ({
          title: it.title,
          desc: it.desc || "",
          icon: (it.icon as IconName) || "check",
          titleColor: it.titleColor,
          descColor: it.descColor,
          iconColor: (it as any).iconColor,
          cardBg: it.cardBg,
        }))
      : DEFAULT_PROMO_BULLETS.map((b) => ({ ...b, icon: "check" as IconName }));

  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <Container>
        <div style={bannerBgStyle} className="relative rounded-3xl text-white shadow-2xl overflow-hidden p-8 sm:p-12 lg:p-14">
          {/* Subtle curved background rings matching Image 2 */}
          <div
            className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full border-8 border-white/10 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full border-8 border-white/10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Headline, Bullets & Buy Now CTA */}
            <div className="lg:col-span-7 space-y-6">
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "badge"}
                label="Badge"
                onClick={() => onSelectElement?.("badge")}
                inline
              >
                <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider border border-white/30">
                  {badgeText}
                </span>
              </EditableElementWrapper>

              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "headline"}
                label="Headline"
                onClick={() => onSelectElement?.("headline")}
              >
                <h2
                  style={hlStyle}
                  className={`tracking-tight leading-tight text-white ${hlClass}`}
                >
                  {headline}
                </h2>
              </EditableElementWrapper>

              {subheadline && (
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "subheadline"}
                  label="Subheadline"
                  onClick={() => onSelectElement?.("subheadline")}
                  className="mt-2"
                >
                  <p
                    style={subStyle}
                    className={`leading-relaxed text-white/90 text-sm sm:text-base ${subClass}`}
                  >
                    {subheadline}
                  </p>
                </EditableElementWrapper>
              )}

              <div className="space-y-4 pt-2">
                {activeBullets.map((bullet, idx) => {
                  const resolvedTitle = resolveItemColor(bullet.titleColor);
                  const resolvedDesc = resolveItemColor(bullet.descColor);
                  const resolvedBg = resolveItemColor(bullet.cardBg);

                  const titleCol = resolvedTitle || "#ffffff";
                  const descCol = resolvedDesc || "rgba(255, 255, 255, 0.95)";

                  const iconTone = bullet.iconColor;
                  const iconCircleBg =
                    iconTone === "gold"
                      ? "bg-gold-500 text-navy-900"
                      : iconTone === "navy"
                      ? "bg-navy-900 text-gold-300"
                      : iconTone === "teal"
                      ? "bg-[#0B4D4E] text-white"
                      : iconTone === "amber"
                      ? "bg-amber-500 text-white"
                      : iconTone === "blue"
                      ? "bg-sky-500 text-white"
                      : "bg-white text-[#E53935]";

                  const rowClass =
                    bullet.cardBg && bullet.cardBg !== "transparent"
                      ? bullet.cardBg === "navy"
                        ? "p-3 rounded-xl bg-navy-900/40 border border-white/20 backdrop-blur-xs"
                        : bullet.cardBg === "white"
                        ? "p-3 rounded-xl bg-white/20 border border-white/30 backdrop-blur-xs"
                        : resolvedBg
                        ? "p-3 rounded-xl border border-white/20"
                        : "p-3 rounded-xl bg-black/10 border border-white/15"
                      : "";

                  return (
                    <EditableElementWrapper
                      key={bullet.title + idx}
                      isEditor={isEditor}
                      isSelected={isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx}
                      label={`Bullet #${idx + 1}`}
                      onClick={() => onSelectElement?.("item", idx)}
                    >
                      <div
                        style={resolvedBg && bullet.cardBg !== "transparent" ? { backgroundColor: resolvedBg } : undefined}
                        className={`flex items-start gap-3.5 ${rowClass}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${iconCircleBg}`}>
                          <Icon name={bullet.icon} size={16} />
                        </div>
                        <p style={{ color: descCol }} className="text-base sm:text-lg font-medium leading-snug">
                          <strong style={{ color: titleCol }} className="font-bold">{bullet.title}</strong>
                          {bullet.desc && <span> &mdash; {bullet.desc}</span>}
                        </p>
                      </div>
                    </EditableElementWrapper>
                  );
                })}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <EditableElementWrapper
                  isEditor={isEditor}
                  isSelected={isEditor && selectedElementKey === "button"}
                  label="Primary CTA"
                  onClick={() => onSelectElement?.("button")}
                  inline
                >
                  <Link
                    href={buttonLink || "/courses"}
                    style={primaryBtnStyle}
                    className="inline-flex items-center justify-center px-9 py-4 rounded-full font-heading font-extrabold text-base tracking-wide shadow-xl hover:opacity-95 transition-all hover:scale-105"
                  >
                    <span>{buttonText || "Claim Discount Now"}</span>
                    <Icon name="arrow-right" size={18} className="ml-2" />
                  </Link>
                </EditableElementWrapper>

                {secondaryButtonText && (
                  <EditableElementWrapper
                    isEditor={isEditor}
                    isSelected={isEditor && selectedElementKey === "secondaryButton"}
                    label="Secondary CTA"
                    onClick={() => onSelectElement?.("secondaryButton")}
                    inline
                  >
                    <Link
                      href={secondaryButtonLink || "/book"}
                      style={secondaryBtnStyle}
                      className="inline-flex items-center justify-center px-7 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 font-heading font-bold text-sm tracking-wide transition-colors"
                    >
                      <span>{secondaryButtonText}</span>
                    </Link>
                  </EditableElementWrapper>
                )}
              </div>
            </div>

            {/* Right: Smiling Woman with Card (Seamless matching Image 2) */}
            <div className="lg:col-span-5 relative">
              <EditableElementWrapper
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "image"}
                label="Promo Image"
                onClick={() => onSelectElement?.("image")}
              >
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[1/1] shadow-2xl border-4 border-white/25">
                  <Image
                    src={image || "/images/promo-woman-card.jpg"}
                    alt="Adult learner joyfully holding her accredited Smartminds discount card"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 450px"
                    priority
                  />
                </div>
              </EditableElementWrapper>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

