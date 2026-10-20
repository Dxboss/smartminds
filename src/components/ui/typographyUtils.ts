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
  align?: "left" | "center" | "right";
  transform?: "normal" | "uppercase";
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

  // 5. Alignment and Transform
  let alignClass = "";
  if (options.align === "center") alignClass = "text-center";
  else if (options.align === "right") alignClass = "text-right";
  else if (options.align === "left") alignClass = "text-left";

  const transformClass = options.transform === "uppercase" ? "uppercase tracking-wider" : "normal-case";

  // 6. Color class and inline style
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

  const className = `${familyClass} ${sizeClass} ${weightClass} ${italicClass} ${alignClass} ${transformClass} ${colorClass}`.trim();

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

  let alignClass = "";
  if (options.align === "center") alignClass = "text-center";
  else if (options.align === "right") alignClass = "text-right";
  else if (options.align === "left") alignClass = "text-left";

  const className = `${familyClass} ${sizeClass} ${weightClass} ${italicClass} ${alignClass} ${colorClass}`.trim();

  return {
    className,
    style: inlineStyle,
  };
}

export interface ResolvedCardStyles {
  containerClass: string;
  titleClass: string;
  descClass: string;
}

export function resolveCardContainerStyles(
  item?: {
    cardBg?: string;
    cardBorder?: string;
    cardRadius?: string;
    cardPadding?: string;
    titleColor?: string;
    titleSize?: string;
    titleWeight?: string;
    descColor?: string;
    textAlign?: string;
  },
  isDark = false
): ResolvedCardStyles {
  // Surface fill
  let bgClass = isDark ? "bg-white/5 text-white" : "bg-white text-ink";
  if (item?.cardBg === "white") bgClass = "bg-white text-ink";
  else if (item?.cardBg === "paper") bgClass = "bg-paper text-ink";
  else if (item?.cardBg === "navy") bgClass = "bg-navy-900 text-white";
  else if (item?.cardBg === "gold_subtle") bgClass = "bg-gold-500/10 text-navy-900";
  else if (item?.cardBg === "transparent") bgClass = "bg-transparent text-inherit";

  // Border style
  let borderClass = isDark ? "border border-white/10" : "border border-line";
  if (item?.cardBorder === "line") borderClass = "border border-line";
  else if (item?.cardBorder === "gold") borderClass = "border-2 border-gold-500 shadow-sm";
  else if (item?.cardBorder === "navy") borderClass = "border-2 border-navy-900";
  else if (item?.cardBorder === "none") borderClass = "border-0";

  // Radius (strictly PRD 2 radii rule: 6px vs 16px)
  let radiusClass = "rounded-lg"; // default signature 16px
  if (item?.cardRadius === "sm") radiusClass = "rounded-sm"; // 6px
  else if (item?.cardRadius === "xl") radiusClass = "rounded-xl"; // 16px
  else if (item?.cardRadius === "none") radiusClass = "rounded-none";

  // Padding
  let paddingClass = "p-6";
  if (item?.cardPadding === "compact") paddingClass = "p-4";
  else if (item?.cardPadding === "spacious") paddingClass = "p-8";

  // Alignment
  let alignClass = "text-left";
  if (item?.textAlign === "center") alignClass = "text-center";
  else if (item?.textAlign === "right") alignClass = "text-right";

  // Title styling
  let titleColor = isDark || item?.cardBg === "navy" ? "text-white" : "text-navy-900";
  if (item?.titleColor === "navy") titleColor = "text-navy-900";
  else if (item?.titleColor === "gold") titleColor = "text-gold-500";
  else if (item?.titleColor === "white") titleColor = "text-white";
  else if (item?.titleColor === "ink_soft") titleColor = "text-ink-soft";

  let titleSize = "text-xl";
  if (item?.titleSize === "sm") titleSize = "text-base sm:text-lg";
  else if (item?.titleSize === "md") titleSize = "text-lg sm:text-xl";
  else if (item?.titleSize === "lg") titleSize = "text-xl sm:text-2xl";
  else if (item?.titleSize === "xl") titleSize = "text-2xl sm:text-3xl";

  let titleWeight = "font-bold";
  if (item?.titleWeight === "normal") titleWeight = "font-normal";
  else if (item?.titleWeight === "medium") titleWeight = "font-medium";
  else if (item?.titleWeight === "semibold") titleWeight = "font-semibold";
  else if (item?.titleWeight === "bold") titleWeight = "font-bold";

  // Description styling
  let descColor = isDark || item?.cardBg === "navy" ? "text-paper/80" : "text-ink-soft";
  if (item?.descColor === "navy") descColor = "text-navy-900";
  else if (item?.descColor === "gold") descColor = "text-gold-500";
  else if (item?.descColor === "white") descColor = "text-white/80";
  else if (item?.descColor === "ink_soft") descColor = "text-ink-soft";

  const containerClass = `${bgClass} ${borderClass} ${radiusClass} ${paddingClass} ${alignClass} shadow-subtle transition-all`.trim();
  const titleClass = `font-heading ${titleSize} ${titleWeight} ${titleColor}`.trim();
  const descClass = `text-sm leading-relaxed ${descColor}`.trim();

  return { containerClass, titleClass, descClass };
}

