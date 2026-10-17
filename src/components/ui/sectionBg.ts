import React from "react";

export type SectionBgPreset =
  | "paper"
  | "white"
  | "navy"
  | "cream"
  | "slate"
  | "sage"
  | "sand"
  | "navy_gradient";

export type SectionBgColor = SectionBgPreset | (string & {});

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
  fallback: "paper" | "white" | "navy" = "paper"
): ResolvedSectionBg {
  const effective = (bgColor || fallback).trim();
  const isCustomHex = Boolean(effective.startsWith("#"));
  const isSlate = effective === "slate";
  const isSage = effective === "sage";
  const isSand = effective === "sand";
  const isNavyGradient = effective === "navy_gradient";
  const isNavy = effective === "navy" || isSlate || isNavyGradient;
  const isCream = effective === "cream";
  const isPaper = effective === "paper";
  const isWhite = effective === "white";

  let isDark = isNavy;
  if (isCustomHex) {
    isDark = isDarkHex(effective);
  }

  let bgClass = "bg-paper text-ink";
  if (isNavyGradient) {
    bgClass = "bg-gradient-to-br from-[#1C1A57] via-[#23216B] to-[#34318F] text-white";
  } else if (isSlate) {
    bgClass = "bg-[#0B132B] text-white";
  } else if (effective === "navy") {
    bgClass = "bg-navy-900 text-white";
  } else if (isCream) {
    bgClass = "bg-gold-50/70 text-ink border-y border-gold-200";
  } else if (isSage) {
    bgClass = "bg-[#EFF5F2] text-ink";
  } else if (isSand) {
    bgClass = "bg-[#F7F4EE] text-ink";
  } else if (isWhite) {
    bgClass = "bg-white text-ink";
  } else if (isCustomHex) {
    bgClass = isDark ? "text-white" : "text-ink";
  }

  return {
    bgClass,
    isDark,
    isNavy,
    style: isCustomHex ? { backgroundColor: effective } : undefined,
  };
}
