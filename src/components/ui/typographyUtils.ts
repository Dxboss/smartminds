import React from "react";

export type FontFamilyChoice = "heading" | "body" | "serif";
export type FontSizeChoice = "sm" | "md" | "lg" | "xl" | "2xl";
export type FontWeightChoice = "normal" | "medium" | "semibold" | "bold" | "extrabold";
export type FontStyleChoice = "normal" | "italic";
export type FontColorChoice = "auto" | "navy" | "white" | "gold" | "ink_soft" | (string & {});

export interface TypographyOptions {
  fontFamily?: FontFamilyChoice;
  fontSize?: FontSizeChoice;
  fontWeight?: FontWeightChoice;
  fontStyle?: FontStyleChoice;
  color?: FontColorChoice;
  defaultColor?: "navy" | "white" | "gold" | "ink-soft" | "white/85" | string;
  defaultSize?: FontSizeChoice;
  defaultWeight?: FontWeightChoice;
  defaultFamily?: FontFamilyChoice;
  isDark?: boolean;
}

export interface ResolvedTypography {
  className: string;
  style?: React.CSSProperties;
}

export function resolveTypography(options: TypographyOptions): ResolvedTypography {
  const family = options.fontFamily || options.defaultFamily || "heading";
  const size = options.fontSize || options.defaultSize || "lg";
  const weight = options.fontWeight || options.defaultWeight || "bold";
  const styleChoice = options.fontStyle || "normal";
  const colorChoice = options.color || "auto";

  // 1. Font Family class
  let familyClass = "font-heading";
  if (family === "body") familyClass = "font-body";
  else if (family === "serif") familyClass = "font-serif";

  // 2. Font Size class
  let sizeClass = "text-3xl sm:text-4xl lg:text-5xl"; // default lg
  if (size === "sm") sizeClass = "text-xl sm:text-2xl";
  else if (size === "md") sizeClass = "text-2xl sm:text-3xl lg:text-4xl";
  else if (size === "lg") sizeClass = "text-3xl sm:text-4xl lg:text-5xl";
  else if (size === "xl") sizeClass = "text-4xl sm:text-5xl lg:text-6xl";
  else if (size === "2xl") sizeClass = "text-5xl sm:text-6xl lg:text-7xl";

  // 3. Font Weight class
  let weightClass = "font-bold";
  if (weight === "normal") weightClass = "font-normal";
  else if (weight === "medium") weightClass = "font-medium";
  else if (weight === "semibold") weightClass = "font-semibold";
  else if (weight === "bold") weightClass = "font-bold";
  else if (weight === "extrabold") weightClass = "font-extrabold";

  // 4. Font Style class
  const italicClass = styleChoice === "italic" ? "italic" : "not-italic";

  // 5. Color class and inline style
  let colorClass = "";
  let inlineStyle: React.CSSProperties | undefined = undefined;

  if (colorChoice === "auto") {
    if (options.defaultColor === "white" || (options.isDark && options.defaultColor !== "navy")) {
      colorClass = "text-white";
    } else if (options.defaultColor === "white/85" || options.isDark) {
      colorClass = "text-white/85";
    } else if (options.defaultColor === "ink-soft") {
      colorClass = "text-ink-soft";
    } else {
      colorClass = options.isDark ? "text-white" : "text-navy-900";
    }
  } else if (colorChoice === "navy") {
    colorClass = "text-navy-900";
  } else if (colorChoice === "white") {
    colorClass = "text-white";
  } else if (colorChoice === "gold") {
    colorClass = "text-gold-500";
  } else if (colorChoice === "ink_soft") {
    colorClass = "text-ink-soft";
  } else if (typeof colorChoice === "string" && colorChoice.startsWith("#")) {
    inlineStyle = { color: colorChoice };
  } else {
    colorClass = options.isDark ? "text-white" : "text-navy-900";
  }

  const className = `${familyClass} ${sizeClass} ${weightClass} ${italicClass} ${colorClass}`.trim();

  return {
    className,
    style: inlineStyle,
  };
}

export function resolveSubheadlineTypography(options: TypographyOptions): ResolvedTypography {
  const family = options.fontFamily || options.defaultFamily || "body";
  const size = options.fontSize || options.defaultSize || "md";
  const weight = options.fontWeight || options.defaultWeight || "normal";
  const styleChoice = options.fontStyle || "normal";
  const colorChoice = options.color || "auto";

  let familyClass = "font-body";
  if (family === "heading") familyClass = "font-heading";
  else if (family === "serif") familyClass = "font-serif";

  let sizeClass = "text-base sm:text-lg";
  if (size === "sm") sizeClass = "text-xs sm:text-sm";
  else if (size === "md") sizeClass = "text-base sm:text-lg";
  else if (size === "lg") sizeClass = "text-lg sm:text-xl";
  else if (size === "xl") sizeClass = "text-xl sm:text-2xl";
  else if (size === "2xl") sizeClass = "text-2xl sm:text-3xl";

  let weightClass = "font-normal";
  if (weight === "normal") weightClass = "font-normal";
  else if (weight === "medium") weightClass = "font-medium";
  else if (weight === "semibold") weightClass = "font-semibold";
  else if (weight === "bold") weightClass = "font-bold";
  else if (weight === "extrabold") weightClass = "font-extrabold";

  const italicClass = styleChoice === "italic" ? "italic" : "not-italic";

  let colorClass = options.isDark ? "text-paper/85" : "text-ink-soft";
  let inlineStyle: React.CSSProperties | undefined = undefined;

  if (colorChoice === "auto") {
    colorClass = options.isDark ? "text-paper/85" : "text-ink-soft";
  } else if (colorChoice === "navy") {
    colorClass = "text-navy-900";
  } else if (colorChoice === "white") {
    colorClass = "text-white";
  } else if (colorChoice === "gold") {
    colorClass = "text-gold-500";
  } else if (colorChoice === "ink_soft") {
    colorClass = "text-ink-soft";
  } else if (typeof colorChoice === "string" && colorChoice.startsWith("#")) {
    inlineStyle = { color: colorChoice };
    colorClass = "";
  }

  const className = `${familyClass} ${sizeClass} ${weightClass} ${italicClass} ${colorClass}`.trim();

  return {
    className,
    style: inlineStyle,
  };
}
