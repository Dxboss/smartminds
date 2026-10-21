import React from "react";
import { IconName } from "@/components/ui/Icon";
import { COLLEGE_COLOR_PALETTES, isDarkHex } from "@/components/ui/sectionBg";

export type ButtonBgPreset =
  | "navy"
  | "gold"
  | "white"
  | "outline-navy"
  | "outline-gold"
  | "outline-white"
  | "emerald"
  | "slate"
  | (string & {});

export type ButtonTextColorPreset =
  | "auto"
  | "white"
  | "navy"
  | "gold"
  | "ink"
  | (string & {});

export type ButtonFontFamily = "heading" | "body";
export type ButtonFontWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold";
export type ButtonTextTransform = "normal" | "uppercase";
export type ButtonIconPosition = "left" | "right";
export type ButtonRadius = "none" | "sm" | "md" | "full";
export type ButtonSizePreset = "sm" | "md" | "lg";

export interface ButtonCustomConfig {
  bgColor?: string;
  textColor?: string;
  fontFamily?: ButtonFontFamily;
  fontWeight?: ButtonFontWeight;
  textTransform?: ButtonTextTransform;
  icon?: string;
  iconPosition?: ButtonIconPosition;
  radius?: ButtonRadius;
  size?: ButtonSizePreset;
}

export interface AvailableButtonIcon {
  name: IconName | "none";
  label: string;
}

export const AVAILABLE_BUTTON_ICONS: AvailableButtonIcon[] = [
  { name: "none", label: "No Icon" },
  { name: "arrow-right", label: "Arrow Right" },
  { name: "arrow-left", label: "Arrow Left" },
  { name: "phone", label: "Telephone" },
  { name: "whatsapp", label: "WhatsApp" },
  { name: "calendar", label: "Calendar" },
  { name: "sparkles", label: "Sparkles" },
  { name: "check", label: "Checkmark" },
  { name: "download", label: "Download Prospectus" },
  { name: "book-open", label: "Course Guide" },
  { name: "graduation-cap", label: "Academic Cap" },
  { name: "star", label: "Star" },
  { name: "clock", label: "Clock / Duration" },
  { name: "mail", label: "Email / Callback" },
  { name: "shield-check", label: "Regulated Shield" },
  { name: "external-link", label: "External Link" },
];

export interface ButtonColorPresetOption {
  key: ButtonBgPreset;
  label: string;
  swatchClass: string;
  textColor: string;
}

export const BUTTON_COLOR_PRESETS: ButtonColorPresetOption[] = [
  {
    key: "navy",
    label: "Navy 900 (Primary)",
    swatchClass: "bg-navy-900 border-navy-950",
    textColor: "text-white",
  },
  {
    key: "gold",
    label: "Gold 500 (Accent)",
    swatchClass: "bg-gold-500 border-gold-600",
    textColor: "text-navy-900",
  },
  {
    key: "white",
    label: "Clean White",
    swatchClass: "bg-white border-line",
    textColor: "text-navy-900",
  },
  {
    key: "outline-navy",
    label: "Navy Outline",
    swatchClass: "bg-transparent border-2 border-navy-900",
    textColor: "text-navy-900",
  },
  {
    key: "outline-gold",
    label: "Gold Outline",
    swatchClass: "bg-transparent border-2 border-gold-500",
    textColor: "text-gold-500",
  },
  {
    key: "outline-white",
    label: "White Outline",
    swatchClass: "bg-navy-900/60 border-2 border-white",
    textColor: "text-white",
  },
  {
    key: "emerald",
    label: "Emerald (WhatsApp/Live)",
    swatchClass: "bg-emerald-600 border-emerald-700",
    textColor: "text-white",
  },
  {
    key: "slate",
    label: "Slate Charcoal",
    swatchClass: "bg-slate-800 border-slate-900",
    textColor: "text-white",
  },
];

/**
 * Resolves comprehensive Tailwind classes and inline styles for customizable buttons
 */
export function resolveCustomButtonClasses(
  config?: ButtonCustomConfig,
  fallbackVariant: "primary" | "on-navy-gold" | "outline" = "primary",
  fallbackSize: "sm" | "md" | "lg" = "md",
  isDarkContainer = false
): {
  className: string;
  style: React.CSSProperties;
  icon?: IconName;
  iconPosition: ButtonIconPosition;
} {
  const classes: string[] = [
    "inline-flex items-center justify-center text-center transition-all duration-200 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  ];
  const inlineStyle: React.CSSProperties = {};

  // 1. Resolve Color / Variant
  const bg = config?.bgColor;
  if (!bg) {
    if (fallbackVariant === "on-navy-gold") {
      classes.push("bg-gold-500 text-navy-900 hover:bg-gold-300 active:bg-gold-700 focus-visible:ring-white shadow-subtle border border-transparent");
    } else if (fallbackVariant === "outline") {
      if (isDarkContainer) {
        classes.push("border border-white/40 text-white hover:bg-white/10 active:bg-white/20 focus-visible:ring-white bg-transparent");
      } else {
        classes.push("border border-navy-900 text-navy-900 hover:bg-navy-900/5 active:bg-navy-900/10 focus-visible:ring-navy-900 bg-transparent");
      }
    } else {
      // primary fallback
      if (isDarkContainer) {
        classes.push("bg-gold-500 text-navy-900 hover:bg-gold-300 font-bold shadow-subtle border border-transparent");
      } else {
        classes.push("bg-navy-900 text-white hover:bg-navy-700 active:bg-navy-900 focus-visible:ring-gold-500 shadow-subtle border border-transparent");
      }
    }
  } else {
    switch (bg) {
      case "navy":
        classes.push("bg-navy-900 text-white hover:bg-navy-700 active:bg-navy-900 focus-visible:ring-gold-500 shadow-subtle border border-transparent");
        break;
      case "gold":
        classes.push("bg-gold-500 text-navy-900 hover:bg-gold-300 active:bg-gold-700 focus-visible:ring-white shadow-subtle border border-transparent");
        break;
      case "white":
        classes.push("bg-white text-navy-900 hover:bg-paper active:bg-line/60 focus-visible:ring-navy-900 shadow-subtle border border-line");
        break;
      case "outline-navy":
        classes.push("bg-transparent border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white active:bg-navy-950 focus-visible:ring-navy-900");
        break;
      case "outline-gold":
        classes.push("bg-transparent border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-900 active:bg-gold-600 focus-visible:ring-gold-500");
        break;
      case "outline-white":
        classes.push("bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy-900 active:bg-white/90 focus-visible:ring-white");
        break;
      case "emerald":
        classes.push("bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus-visible:ring-emerald-400 shadow-subtle border border-transparent");
        break;
      case "slate":
        classes.push("bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 focus-visible:ring-slate-400 shadow-subtle border border-transparent");
        break;
      default: {
        const matchedPalette = COLLEGE_COLOR_PALETTES.find((p) => p.key === bg);
        if (matchedPalette) {
          inlineStyle.backgroundColor = matchedPalette.hex;
          inlineStyle.borderColor = "transparent";
          if (!config?.textColor || config.textColor === "auto") {
            classes.push(matchedPalette.isDark ? "!text-white" : "!text-navy-900");
          }
          classes.push("shadow-subtle hover:brightness-110 active:brightness-90");
        } else if (bg.startsWith("#") || bg.startsWith("rgb")) {
          inlineStyle.backgroundColor = bg;
          inlineStyle.borderColor = "transparent";
          if (!config?.textColor || config.textColor === "auto") {
            classes.push(isDarkHex(bg) ? "!text-white" : "!text-navy-900");
          }
          classes.push("shadow-subtle hover:brightness-110 active:brightness-90");
        } else {
          classes.push("bg-navy-900 text-white hover:bg-navy-700 shadow-subtle border border-transparent");
        }
        break;
      }
    }
  }

  // 2. Text Color override (if explicitly specified)
  if (config?.textColor && config.textColor !== "auto") {
    switch (config.textColor) {
      case "white":
        classes.push("!text-white");
        break;
      case "navy":
        classes.push("!text-navy-900");
        break;
      case "gold":
        classes.push("!text-gold-300");
        break;
      case "ink":
        classes.push("!text-ink");
        break;
      default: {
        const matchedTextColor = COLLEGE_COLOR_PALETTES.find((p) => p.key === config.textColor);
        if (matchedTextColor) {
          inlineStyle.color = matchedTextColor.hex;
        } else if (config.textColor.startsWith("#") || config.textColor.startsWith("rgb")) {
          inlineStyle.color = config.textColor;
        }
        break;
      }
    }
  }

  // 3. Typography: Font Family
  const fontFam = config?.fontFamily || (fallbackVariant === "outline" ? "heading" : "heading");
  if (fontFam === "body") {
    classes.push("font-sans");
  } else {
    classes.push("font-heading tracking-wide");
  }

  // 4. Typography: Font Weight
  const weight = config?.fontWeight;
  if (weight) {
    switch (weight) {
      case "normal":
        classes.push("font-normal");
        break;
      case "medium":
        classes.push("font-medium");
        break;
      case "semibold":
        classes.push("font-semibold");
        break;
      case "bold":
        classes.push("font-bold");
        break;
      case "extrabold":
        classes.push("font-extrabold");
        break;
    }
  } else {
    classes.push("font-bold");
  }

  // 5. Typography: Text Transform
  if (config?.textTransform === "uppercase") {
    classes.push("uppercase tracking-wider");
  } else if (config?.textTransform === "normal") {
    classes.push("normal-case");
  }

  // 6. Corner Radius
  const radius = config?.radius || "sm";
  switch (radius) {
    case "none":
      inlineStyle.borderRadius = "0px";
      classes.push("!rounded-none rounded-none");
      break;
    case "sm":
      inlineStyle.borderRadius = "6px";
      classes.push("!rounded-sm rounded-sm"); // PRD standard 6px
      break;
    case "md":
      inlineStyle.borderRadius = "12px";
      classes.push("!rounded-md rounded-md"); // PRD 16px / rounded
      break;
    case "full":
      inlineStyle.borderRadius = "9999px";
      classes.push("!rounded-full rounded-full"); // Pill
      break;
  }

  // 7. Size & Padding
  const size = config?.size || fallbackSize;
  switch (size) {
    case "sm":
      classes.push("min-h-[38px] px-3.5 py-1.5 text-xs gap-1.5");
      break;
    case "lg":
      classes.push("min-h-[52px] px-7 py-3 text-base sm:text-lg gap-2.5");
      break;
    case "md":
    default:
      classes.push("min-h-[44px] px-5 py-2.5 text-sm sm:text-base gap-2");
      break;
  }

  // 8. Icon and Position
  const validIcon =
    config?.icon && config.icon !== "none" ? (config.icon as IconName) : undefined;
  const iconPos = config?.iconPosition || "right";

  return {
    className: classes.join(" "),
    style: inlineStyle,
    icon: validIcon,
    iconPosition: iconPos,
  };
}
