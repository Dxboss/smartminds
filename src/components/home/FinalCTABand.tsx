"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";
import { siteConfig } from "@/content/siteConfig";
import { resolveSectionBg, SectionBgColor } from "@/components/ui/sectionBg";
import {
  resolveTypography,
  resolveSubheadlineTypography,
  FontFamilyChoice,
  FontSizeChoice,
  FontWeightChoice,
  FontStyleChoice,
  FontColorChoice,
} from "@/components/ui/typographyUtils";

import {
  resolveCustomButtonClasses,
  ButtonFontFamily,
  ButtonFontWeight,
  ButtonTextTransform,
  ButtonIconPosition,
  ButtonRadius,
  ButtonSizePreset,
} from "@/components/ui/buttonCustomizer";
import { Button } from "@/components/ui/Button";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";

export interface FinalCTABandProps {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonFontFamily?: ButtonFontFamily;
  buttonFontWeight?: ButtonFontWeight;
  buttonTextTransform?: ButtonTextTransform;
  buttonIcon?: string;
  buttonIconPosition?: ButtonIconPosition;
  buttonRadius?: ButtonRadius;
  buttonSize?: ButtonSizePreset;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonBgColor?: string;
  secondaryButtonTextColor?: string;
  secondaryButtonFontFamily?: ButtonFontFamily;
  secondaryButtonFontWeight?: ButtonFontWeight;
  secondaryButtonTextTransform?: ButtonTextTransform;
  secondaryButtonIcon?: string;
  secondaryButtonIconPosition?: ButtonIconPosition;
  secondaryButtonRadius?: ButtonRadius;
  secondaryButtonSize?: ButtonSizePreset;
  bgColor?: SectionBgColor;
  align?: "left" | "center";
  headlineFontFamily?: FontFamilyChoice;
  headlineFontSize?: FontSizeChoice;
  headlineFontWeight?: FontWeightChoice;
  headlineFontStyle?: FontStyleChoice;
  headlineColor?: FontColorChoice;
  subheadlineFontFamily?: FontFamilyChoice;
  subheadlineFontSize?: FontSizeChoice;
  subheadlineFontWeight?: FontWeightChoice;
  subheadlineFontStyle?: FontStyleChoice;
  subheadlineColor?: FontColorChoice;
  isEditor?: boolean;
  selectedElementKey?: string | null;
  selectedElementItemIndex?: number | null;
  onSelectElement?: (
    element:
      | "badge"
      | "headline"
      | "subheadline"
      | "button"
      | "secondaryButton"
  ) => void;
}

export const FinalCTABand: React.FC<FinalCTABandProps> = ({
  headline = "Not sure which course? Book a free call.",
  subheadline = "Speak directly with an academic adviser. We will assess your background, confirm entry requirements, check government funding eligibility, and help you select the right payment plan.",
  badgeText = "Personalised Guidance",
  buttonText = "Book a free call",
  buttonLink,
  buttonBgColor,
  buttonTextColor,
  buttonFontFamily,
  buttonFontWeight,
  buttonTextTransform,
  buttonIcon,
  buttonIconPosition,
  buttonRadius,
  buttonSize,
  secondaryButtonText = "Prefer WhatsApp? Message us",
  secondaryButtonLink,
  secondaryButtonBgColor,
  secondaryButtonTextColor,
  secondaryButtonFontFamily,
  secondaryButtonFontWeight,
  secondaryButtonTextTransform,
  secondaryButtonIcon,
  secondaryButtonIconPosition,
  secondaryButtonRadius,
  secondaryButtonSize,
  bgColor = "navy",
  align = "center",
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
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const { bgClass, isDark, style: bgStyle } = resolveSectionBg(bgColor, "navy");
  const isCenter = align !== "left";

  const primaryBtn = resolveCustomButtonClasses(
    {
      bgColor: buttonBgColor,
      textColor: buttonTextColor,
      fontFamily: buttonFontFamily,
      fontWeight: buttonFontWeight,
      textTransform: buttonTextTransform,
      icon: buttonIcon,
      iconPosition: buttonIconPosition,
      radius: buttonRadius,
      size: buttonSize,
    },
    isDark ? "on-navy-gold" : "primary",
    "lg",
    isDark
  );

  const secondaryBtn = resolveCustomButtonClasses(
    {
      bgColor: secondaryButtonBgColor,
      textColor: secondaryButtonTextColor,
      fontFamily: secondaryButtonFontFamily,
      fontWeight: secondaryButtonFontWeight,
      textTransform: secondaryButtonTextTransform,
      icon: secondaryButtonIcon || (!secondaryButtonBgColor ? "whatsapp" : undefined),
      iconPosition: secondaryButtonIconPosition || "left",
      radius: secondaryButtonRadius,
      size: secondaryButtonSize,
    },
    "outline",
    "lg",
    isDark
  );

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily,
    fontSize: headlineFontSize,
    fontWeight: headlineFontWeight,
    fontStyle: headlineFontStyle,
    color: headlineColor,
    isDark,
    defaultFamily: "heading",
    defaultSize: "xl",
    defaultWeight: "bold",
    defaultColor: isDark ? "white" : "navy",
  });

  const { className: subClass, style: subStyle } = resolveSubheadlineTypography({
    fontFamily: subheadlineFontFamily,
    fontSize: subheadlineFontSize,
    fontWeight: subheadlineFontWeight,
    fontStyle: subheadlineFontStyle,
    color: subheadlineColor,
    isDark,
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

  return (
    <section
      aria-label="Book a free consultation"
      style={bgStyle}
      className={`${bgClass} py-16 md:py-20 relative overflow-hidden`}
    >
      {/* Decorative crescent arc in background */}
      <div
        className={`absolute -top-32 -right-32 w-96 h-96 pointer-events-none select-none ${
          isDark ? "opacity-[0.06] text-white" : "opacity-[0.04] text-navy-900"
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          fill="currentColor"
          className="w-full h-full"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
          />
        </svg>
      </div>

      <Container>
        <div className={`max-w-3xl ${isCenter ? "mx-auto text-center" : "text-left"} space-y-6`}>
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "badge"}
            label="Badge"
            onClick={() => onSelectElement?.("badge")}
            inline
          >
            <Eyebrow tone={isDark ? "gold" : "navy"} className="tracking-widest">
              {badgeText}
            </Eyebrow>
          </EditableElementWrapper>

          {/* Heading verbatim from PRD 10.1 */}
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "headline"}
            label="Headline"
            onClick={() => onSelectElement?.("headline")}
            className="p-0.5 -m-0.5"
          >
            <Heading
              level="h2"
              style={hlStyle}
              className={hlClass}
            >
              {headline}
            </Heading>
          </EditableElementWrapper>

          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "subheadline"}
            label="Subheadline"
            onClick={() => onSelectElement?.("subheadline")}
            className="p-0.5 -m-0.5"
          >
            <p
              style={subStyle}
              className={`leading-relaxed ${isCenter ? "max-w-xl mx-auto" : "max-w-xl"} ${subClass}`}
            >
              {subheadline}
            </p>
          </EditableElementWrapper>

          {/* Action CTAs */}
          <div className={`pt-2 flex flex-col sm:flex-row items-center gap-4 ${isCenter ? "justify-center" : "justify-start"}`}>
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "button"}
              label="Primary CTA"
              onClick={() => onSelectElement?.("button")}
              inline
            >
              <div className={isEditor ? "pointer-events-none" : ""}>
                {buttonLink && buttonLink !== "/book" ? (
                  <Button
                    href={buttonLink}
                    className={`w-full sm:w-auto shadow-md ${primaryBtn.className}`}
                    style={primaryBtn.style}
                  >
                    {primaryBtn.icon && primaryBtn.iconPosition === "left" && (
                      <Icon name={primaryBtn.icon} size={18} />
                    )}
                    <span>{buttonText}</span>
                    {primaryBtn.icon && primaryBtn.iconPosition === "right" && (
                      <Icon name={primaryBtn.icon} size={18} />
                    )}
                  </Button>
                ) : (
                  <BookingCTAButton
                    className={`w-full sm:w-auto shadow-md ${primaryBtn.className}`}
                    style={primaryBtn.style}
                  >
                    {primaryBtn.icon && primaryBtn.iconPosition === "left" && (
                      <Icon name={primaryBtn.icon} size={18} />
                    )}
                    <span>{buttonText}</span>
                    {primaryBtn.icon && primaryBtn.iconPosition === "right" && (
                      <Icon name={primaryBtn.icon} size={18} />
                    )}
                  </BookingCTAButton>
                )}
              </div>
            </EditableElementWrapper>

            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "secondaryButton"}
              label="Secondary CTA"
              onClick={() => onSelectElement?.("secondaryButton")}
              inline
            >
              <div className={isEditor ? "pointer-events-none" : ""}>
                <a
                  href={secondaryButtonLink || siteConfig.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full sm:w-auto ${secondaryBtn.className}`}
                  style={secondaryBtn.style}
                >
                  {secondaryBtn.icon && secondaryBtn.iconPosition === "left" && (
                    <Icon
                      name={secondaryBtn.icon}
                      size={18}
                      className={secondaryBtn.icon === "whatsapp" ? "text-emerald-500" : ""}
                    />
                  )}
                  <span>{secondaryButtonText}</span>
                  {secondaryBtn.icon && secondaryBtn.iconPosition === "right" && (
                    <Icon
                      name={secondaryBtn.icon}
                      size={18}
                      className={secondaryBtn.icon === "whatsapp" ? "text-emerald-500" : ""}
                    />
                  )}
                </a>
              </div>
            </EditableElementWrapper>
          </div>

          {/* Reassurance items */}
          <div className={`pt-6 border-t flex flex-wrap items-center gap-6 text-xs ${
            isDark ? "border-white/15 text-paper/70" : "border-line text-ink-soft"
          } ${isCenter ? "justify-center" : "justify-start"}`}>
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className={isDark ? "text-gold-500" : "text-navy-900"} />
              <span>15-minute friendly consultation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className={isDark ? "text-gold-500" : "text-navy-900"} />
              <span>Zero sales pressure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className={isDark ? "text-gold-500" : "text-navy-900"} />
              <span>Funding & instalment advice included</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
