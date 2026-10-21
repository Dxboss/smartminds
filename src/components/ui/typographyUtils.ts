import React from "react";
import { COLLEGE_COLOR_PALETTES, resolveItemColor, isDarkHex } from "./sectionBg";

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
    inlineStyle = { color: "var(--navy-900, #0b3b3c)" };
  } else if (colorChoice === "white") {
    colorClass = "text-white";
    inlineStyle = { color: "#ffffff" };
  } else if (colorChoice === "gold") {
    colorClass = "text-gold-500";
    inlineStyle = { color: "var(--gold-500, #ff5722)" };
  } else if (colorChoice === "ink_soft") {
    colorClass = "text-ink-soft";
    inlineStyle = { color: "var(--ink-soft, #475569)" };
  } else if (typeof colorChoice === "string" && (colorChoice.startsWith("#") || colorChoice.startsWith("rgb"))) {
    inlineStyle = { color: colorChoice };
    colorClass = "";
  } else {
    const matched = COLLEGE_COLOR_PALETTES.find((p) => p.key === colorChoice);
    if (matched) {
      inlineStyle = { color: matched.hex };
      colorClass = "";
    } else {
      inlineStyle = { color: options.isDark ? "#ffffff" : "var(--navy-900, #0b3b3c)" };
      colorClass = options.isDark ? "text-white" : "text-navy-900";
    }
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
    inlineStyle = { color: "var(--navy-900, #0b3b3c)" };
  } else if (colorChoice === "white") {
    colorClass = "text-white";
    inlineStyle = { color: "#ffffff" };
  } else if (colorChoice === "gold") {
    colorClass = "text-gold-500";
    inlineStyle = { color: "var(--gold-500, #ff5722)" };
  } else if (colorChoice === "ink_soft") {
    colorClass = "text-ink-soft";
    inlineStyle = { color: "var(--ink-soft, #475569)" };
  } else if (typeof colorChoice === "string" && (colorChoice.startsWith("#") || colorChoice.startsWith("rgb"))) {
    inlineStyle = { color: colorChoice };
    colorClass = "";
  } else {
    const matched = COLLEGE_COLOR_PALETTES.find((p) => p.key === colorChoice);
    if (matched) {
      inlineStyle = { color: matched.hex };
      colorClass = "";
    }
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
  containerStyle?: React.CSSProperties;
  titleClass: string;
  titleStyle?: React.CSSProperties;
  descClass: string;
  descStyle?: React.CSSProperties;
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
  let containerStyle: React.CSSProperties | undefined = undefined;
  let titleStyle: React.CSSProperties | undefined = undefined;
  let descStyle: React.CSSProperties | undefined = undefined;

  // Surface fill
  let bgClass = isDark ? "bg-white/5 text-white" : "bg-white text-ink";
  const resolvedBg = resolveItemColor(item?.cardBg);
  const isNavyCard = item?.cardBg === "navy" || (resolvedBg ? isDarkHex(resolvedBg) : false);

  if (item?.cardBg === "white") bgClass = "bg-white text-ink";
  else if (item?.cardBg === "paper") bgClass = "bg-paper text-ink";
  else if (item?.cardBg === "navy") bgClass = "bg-navy-900 text-white";
  else if (item?.cardBg === "gold_subtle") bgClass = "bg-gold-500/10 text-navy-900";
  else if (item?.cardBg === "transparent") bgClass = "bg-transparent text-inherit";
  else if (resolvedBg) {
    containerStyle = { backgroundColor: resolvedBg };
    bgClass = isNavyCard ? "text-white" : "text-ink";
  }

  // Border style
  let borderClass = isDark || isNavyCard ? "border border-white/10" : "border border-line";
  const resolvedBorder = resolveItemColor(item?.cardBorder);

  if (item?.cardBorder === "line") borderClass = isDark || isNavyCard ? "border border-white/10" : "border border-line";
  else if (item?.cardBorder === "gold") borderClass = "border-2 border-gold-500 shadow-sm";
  else if (item?.cardBorder === "navy") borderClass = "border-2 border-navy-900";
  else if (item?.cardBorder === "none") borderClass = "border-0";
  else if (resolvedBorder) {
    containerStyle = { ...(containerStyle || {}), borderColor: resolvedBorder, borderWidth: "2px" };
  }

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
  let titleColor = isDark || isNavyCard ? "text-white" : "text-navy-900";
  const resolvedTitle = resolveItemColor(item?.titleColor);
  if (item?.titleColor === "navy") titleColor = "text-navy-900";
  else if (item?.titleColor === "gold") titleColor = "text-gold-500";
  else if (item?.titleColor === "white") titleColor = "text-white";
  else if (item?.titleColor === "ink_soft") titleColor = "text-ink-soft";
  else if (resolvedTitle) {
    titleStyle = { color: resolvedTitle };
    titleColor = "";
  }

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
  let descColor = isDark || isNavyCard ? "text-paper/80" : "text-ink-soft";
  const resolvedDesc = resolveItemColor(item?.descColor);
  if (item?.descColor === "navy") descColor = "text-navy-900";
  else if (item?.descColor === "gold") descColor = "text-gold-500";
  else if (item?.descColor === "white") descColor = "text-white/80";
  else if (item?.descColor === "ink_soft") descColor = "text-ink-soft";
  else if (resolvedDesc) {
    descStyle = { color: resolvedDesc };
    descColor = "";
  }

  const containerClass = `${bgClass} ${borderClass} ${radiusClass} ${paddingClass} ${alignClass} shadow-subtle transition-all`.trim();
  const titleClass = `font-heading ${titleSize} ${titleWeight} ${titleColor}`.trim();
  const descClass = `text-sm leading-relaxed ${descColor}`.trim();

  return { containerClass, containerStyle, titleClass, titleStyle, descClass, descStyle };
}

export interface BadgeStyleOptions {
  variant?: "live" | "navy" | "gold" | "default" | string;
  color?: string;
  bgColor?: string;
  fontFamily?: FontFamilyChoice | string;
  weight?: FontWeightChoice | string;
  isDark?: boolean;
}

export function resolveBadgeStyles(options: BadgeStyleOptions): {
  className: string;
  style: React.CSSProperties;
} {
  const inlineStyle: React.CSSProperties = {};
  const classes: string[] = [
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all select-none",
  ];

  // Custom text color
  if (options.color && options.color !== "auto") {
    if (options.color.startsWith("#") || options.color.startsWith("rgb")) {
      inlineStyle.color = options.color;
    } else {
      const p = COLLEGE_COLOR_PALETTES.find((cp) => cp.key === options.color);
      if (p) inlineStyle.color = p.hex;
      else if (options.color === "white") inlineStyle.color = "#ffffff";
      else if (options.color === "navy") inlineStyle.color = "var(--navy-900, #0b3b3c)";
      else if (options.color === "gold") inlineStyle.color = "var(--gold-500, #ff5722)";
      else if (options.color === "ink_soft") inlineStyle.color = "var(--ink-soft, #475569)";
    }
  }

  // Custom background color
  if (options.bgColor && options.bgColor !== "auto" && options.bgColor !== "default") {
    let bgHex = options.bgColor;
    if (!bgHex.startsWith("#") && !bgHex.startsWith("rgb")) {
      const p = COLLEGE_COLOR_PALETTES.find((cp) => cp.key === bgHex);
      if (p) bgHex = p.hex;
      else if (bgHex === "navy") bgHex = "var(--navy-900, #0b3b3c)";
      else if (bgHex === "white") bgHex = "#ffffff";
      else if (bgHex === "gold") bgHex = "var(--gold-500, #ff5722)";
      else if (bgHex === "paper") bgHex = "var(--paper, #f4f9f9)";
    }
    inlineStyle.backgroundColor = bgHex;
    inlineStyle.borderColor = "transparent";
    classes.push("border");
  } else {
    // Default preset variants
    switch (options.variant) {
      case "gold":
        classes.push(
          options.isDark
            ? "bg-gold-500/15 text-gold-300 border border-gold-400/30"
            : "bg-gold-50 text-gold-700 border border-gold-200"
        );
        break;
      case "live":
        classes.push("bg-emerald-50 text-emerald-800 border border-emerald-200");
        break;
      case "default":
        classes.push(
          options.isDark
            ? "bg-white/10 text-white/90 border border-white/20"
            : "bg-paper text-ink-soft border border-line"
        );
        break;
      case "navy":
      default:
        classes.push(
          options.isDark
            ? "bg-gold-500/10 text-gold-300 border border-gold-400/20"
            : "bg-navy-900/5 text-navy-900 border border-navy-900/15"
        );
        break;
    }
  }

  if (options.fontFamily === "heading") classes.push("font-heading");
  else if (options.fontFamily === "body") classes.push("font-body");
  else if (options.fontFamily === "serif") classes.push("font-serif");

  if (options.weight === "bold") classes.push("font-bold");
  else if (options.weight === "medium") classes.push("font-medium");
  else if (options.weight === "normal") classes.push("font-normal");

  return { className: classes.join(" "), style: inlineStyle };
}

export interface TrustNoteStyleOptions {
  color?: string;
  fontFamily?: FontFamilyChoice | string;
  fontSize?: FontSizeChoice | string;
  align?: "left" | "center" | "right";
  isDark?: boolean;
}

export function resolveTrustNoteStyles(options: TrustNoteStyleOptions): {
  className: string;
  style: React.CSSProperties;
} {
  const inlineStyle: React.CSSProperties = {};
  const classes: string[] = ["leading-relaxed transition-all"];

  if (options.color && options.color !== "auto") {
    if (options.color.startsWith("#") || options.color.startsWith("rgb")) {
      inlineStyle.color = options.color;
    } else {
      const p = COLLEGE_COLOR_PALETTES.find((cp) => cp.key === options.color);
      if (p) inlineStyle.color = p.hex;
      else if (options.color === "navy") inlineStyle.color = "var(--navy-900, #0b3b3c)";
      else if (options.color === "gold") inlineStyle.color = "var(--gold-500, #ff5722)";
      else if (options.color === "white") inlineStyle.color = "#ffffff";
      else if (options.color === "ink_soft") inlineStyle.color = "var(--ink-soft, #475569)";
    }
  } else {
    classes.push(options.isDark ? "text-paper/75" : "text-ink-soft");
  }

  if (options.fontFamily === "heading") classes.push("font-heading");
  else if (options.fontFamily === "serif") classes.push("font-serif");
  else classes.push("font-body");

  if (options.fontSize === "sm") classes.push("text-[11px]");
  else if (options.fontSize === "md") classes.push("text-xs");
  else if (options.fontSize === "lg") classes.push("text-sm");
  else classes.push("text-xs");

  if (options.align === "left") classes.push("text-left");
  else if (options.align === "right") classes.push("text-right");
  else classes.push("text-center");

  return { className: classes.join(" "), style: inlineStyle };
}

