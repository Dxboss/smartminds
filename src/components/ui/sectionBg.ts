import React from "react";

export type SectionBgPreset =
  | "paper"
  | "white"
  | "navy"
  | "navy_deep"
  | "navy_indigo"
  | "navy_twilight"
  | "navy_nautical"
  | "navy_slate"
  | "navy_gradient"
  | "cream"
  | "gold"
  | "gold_honey"
  | "gold_deep"
  | "yellow_soft"
  | "yellow_sun"
  | "grey_pearl"
  | "grey_fog"
  | "grey_slate"
  | "grey_ash"
  | "grey_charcoal"
  | "slate"
  | "sage"
  | "mint"
  | "coral"
  | "sand";

export type SectionBgColor = SectionBgPreset | (string & {});

export interface ColorOption {
  key: string;
  label: string;
  hex: string;
  category: "navy" | "yellow" | "grey" | "classic";
  isDark: boolean;
  description?: string;
}

export const COLLEGE_COLOR_PALETTES: ColorOption[] = [
  // 1. Shades of Navy Blue
  { key: "navy", label: "Royal Navy (Official)", hex: "#23216B", category: "navy", isDark: true, description: "Official deep college brand navy" },
  { key: "navy_deep", label: "Midnight Deep Navy", hex: "#151347", category: "navy", isDark: true, description: "Ultra-deep midnight navy for high contrast" },
  { key: "navy_indigo", label: "Rich Indigo Navy", hex: "#34318F", category: "navy", isDark: true, description: "Vibrant collegiate blue tone" },
  { key: "navy_twilight", label: "Twilight Sapphire", hex: "#282570", category: "navy", isDark: true, description: "Medium-rich evening navy" },
  { key: "navy_nautical", label: "Deep Nautical Navy", hex: "#1B2A4A", category: "navy", isDark: true, description: "Calm maritime slate navy" },
  { key: "navy_slate", label: "Soft Slate Navy", hex: "#373D54", category: "navy", isDark: true, description: "Subtle muted blue-grey navy" },
  { key: "navy_gradient", label: "Royal Navy Gradient", hex: "#23216B", category: "navy", isDark: true, description: "Subtle gradient from deep navy to indigo" },

  // 2. Shades of Yellow & Gold
  { key: "gold", label: "College Gold (Official)", hex: "#D9B84A", category: "yellow", isDark: false, description: "Official college signature gold" },
  { key: "cream", label: "Warm Gold Cream", hex: "#FBF6E2", category: "yellow", isDark: false, description: "Gentle ivory tint for soft backgrounds" },
  { key: "gold_honey", label: "Warm Honey Amber", hex: "#E8A938", category: "yellow", isDark: false, description: "Rich sunny amber warmth" },
  { key: "gold_deep", label: "Deep Bronze Gold", hex: "#B78A2E", category: "yellow", isDark: true, description: "Rich antique bronze gold" },
  { key: "yellow_soft", label: "Pastel Lemon Chiffon", hex: "#FEF9E7", category: "yellow", isDark: false, description: "Very light sunny pastel" },
  { key: "yellow_sun", label: "Bright Sunflower", hex: "#F5BA13", category: "yellow", isDark: false, description: "Vibrant attention-grabbing yellow" },

  // 3. Shades of Grey
  { key: "grey_pearl", label: "Light Pearl Grey", hex: "#F8FAFC", category: "grey", isDark: false, description: "Clean crisp almost-white grey" },
  { key: "grey_fog", label: "Soft Fog Mist", hex: "#F1F5F9", category: "grey", isDark: false, description: "Neutral subtle section background" },
  { key: "grey_slate", label: "Cool Slate Grey", hex: "#E2E8F0", category: "grey", isDark: false, description: "Classic interface divider grey" },
  { key: "grey_ash", label: "Muted Ash Grey", hex: "#CBD5E1", category: "grey", isDark: false, description: "Medium neutral stone grey" },
  { key: "grey_charcoal", label: "Dark Charcoal Grey", hex: "#334155", category: "grey", isDark: true, description: "Deep architectural charcoal" },
  { key: "slate", label: "Midnight Slate Black", hex: "#0B132B", category: "grey", isDark: true, description: "Near-black slate tone" },

  // 4. Classic Brand Bases
  { key: "white", label: "Crisp Pure White", hex: "#FFFFFF", category: "classic", isDark: false, description: "Standard modern clean canvas" },
  { key: "paper", label: "Parchment Paper (Brand)", hex: "#FAF8F3", category: "classic", isDark: false, description: "College signature tactile paper" },
  { key: "sand", label: "Warm Sand", hex: "#F7F4EE", category: "classic", isDark: false, description: "Earthy warm beige neutral" },
  { key: "sage", label: "Sage Mist", hex: "#EFF5F2", category: "classic", isDark: false, description: "Calm organic herbal mist" },
];

export function isDarkHex(hex: string): boolean {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }
  return false;
}

export interface ResolvedSectionBg {
  bgClass: string;
  isDark: boolean;
  isNavy: boolean;
  style?: React.CSSProperties;
}

export function resolveSectionBg(
  bgColor?: string,
  fallback: SectionBgPreset = "paper"
): ResolvedSectionBg {
  const effective = (bgColor || fallback).trim();
  const isCustomHex = Boolean(effective.startsWith("#"));

  // Match known palette preset
  const matchedPreset = COLLEGE_COLOR_PALETTES.find((p) => p.key === effective);

  let isDark = false;
  let isNavy = false;
  let bgClass = "bg-paper text-ink";
  let style: React.CSSProperties | undefined = undefined;

  if (isCustomHex) {
    isDark = isDarkHex(effective);
    bgClass = isDark ? "text-white" : "text-ink";
    style = { backgroundColor: effective };
  } else if (effective === "navy_gradient") {
    isDark = true;
    isNavy = true;
    bgClass = "bg-gradient-to-br from-[#1C1A57] via-[#23216B] to-[#34318F] text-white";
  } else if (matchedPreset) {
    isDark = matchedPreset.isDark;
    isNavy = matchedPreset.category === "navy";
    bgClass = isDark ? "text-white" : "text-ink";
    style = { backgroundColor: matchedPreset.hex };

    // Standard tailwind utility classes for base presets where suitable
    if (effective === "white") bgClass = "bg-white text-ink";
    else if (effective === "paper") bgClass = "bg-paper text-ink";
    else if (effective === "navy") bgClass = "bg-navy-900 text-white";
    else if (effective === "slate") bgClass = "bg-[#0B132B] text-white";
    else if (effective === "cream") bgClass = "bg-[#FBF6E2] text-ink border-y border-gold-200/60";
  } else if (effective === "mint") {
    bgClass = "bg-[#E8F4F1] text-ink";
  } else if (effective === "coral") {
    isDark = true;
    bgClass = "bg-[#E53935] text-white";
  } else {
    // Fallback to paper
    bgClass = "bg-paper text-ink";
  }

  return {
    bgClass,
    isDark,
    isNavy,
    style,
  };
}

