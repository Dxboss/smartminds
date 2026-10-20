"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";

export interface CourseGridCmsControlsProps {
  columns?: 1 | 2 | 3 | 4;
  rows?: 1 | 2 | 3 | 4 | "all";
  courseLimit?: number;
  onColumnsChange: (columns: 2 | 3 | 4) => void;
  onRowsChange: (rows: 1 | 2 | 3 | 4 | "all") => void;
  onCourseLimitChange?: (limit: number | undefined) => void;
  currentViewport?: "desktop" | "tablet" | "mobile";
  className?: string;
}

export const CourseGridCmsControls: React.FC<CourseGridCmsControlsProps> = ({
  columns = 4,
  rows = 2,
  courseLimit,
  onColumnsChange,
  onRowsChange,
  onCourseLimitChange,
  currentViewport = "desktop",
  className = "",
}) => {
  const effectiveCols = (columns === 1 ? 2 : columns) as 2 | 3 | 4;
  const effectiveRows = rows ?? 2;

  const totalCalculated =
    typeof effectiveRows === "number" ? effectiveCols * effectiveRows : null;

  return (
    <div className={`p-4 bg-paper rounded-sm border border-line space-y-4 shadow-2xs ${className}`}>
      {/* Title & Quick Stats */}
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-navy-900 text-gold-300 flex items-center justify-center shrink-0">
            <Icon name="layers" size={14} />
          </div>
          <div>
            <strong className="text-xs font-bold text-navy-900 block leading-tight">
              Course Grid Layout &amp; Card Display
            </strong>
            <span className="text-[10px] text-ink-soft">
              Responsive columns &amp; row limits across devices
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gold-100/70 text-navy-900 border border-gold-300">
          {effectiveRows === "all" ? "All Courses" : `${totalCalculated} Cards Total`}
        </span>
      </div>

      {/* 1. Desktop Columns Selector (2, 3, 4) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
            Desktop Grid Columns (lg:grid-cols-X)
          </label>
          <span className="text-[10px] text-ink-soft font-mono">
            Active: {effectiveCols} Columns
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { col: 2 as const, label: "2 Columns", desc: "Large Split Cards" },
            { col: 3 as const, label: "3 Columns", desc: "Classic Editorial" },
            { col: 4 as const, label: "4 Columns", desc: "Compact Showcase" },
          ].map((item) => {
            const isSelected = effectiveCols === item.col;
            return (
              <button
                key={item.col}
                type="button"
                onClick={() => onColumnsChange(item.col)}
                className={`p-2 rounded-xs border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-navy-900 text-white border-navy-900 shadow-xs ring-1 ring-navy-900"
                    : "bg-white border-line text-ink hover:border-navy-900/40"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold leading-tight">{item.label}</span>
                  {isSelected && (
                    <span className="text-gold-300 text-[11px] font-bold">✓</span>
                  )}
                </div>
                <span
                  className={`text-[9px] block leading-tight ${
                    isSelected ? "text-gold-200" : "text-ink-soft"
                  }`}
                >
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Rows / Limit Selector (1, 2, 3, 4, All) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
            Display Rows / Maximum Limit
          </label>
          <span className="text-[10px] text-ink-soft font-mono">
            {effectiveRows === "all"
              ? "All Published Courses"
              : `${effectiveRows} ${effectiveRows === 1 ? "Row" : "Rows"}`}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[
            { val: 1 as const, label: "1 Row", sub: `${effectiveCols * 1} cards` },
            { val: 2 as const, label: "2 Rows", sub: `${effectiveCols * 2} cards` },
            { val: 3 as const, label: "3 Rows", sub: `${effectiveCols * 3} cards` },
            { val: 4 as const, label: "4 Rows", sub: `${effectiveCols * 4} cards` },
            { val: "all" as const, label: "Show All", sub: "Uncapped" },
          ].map((rowItem) => {
            const isSelected = effectiveRows === rowItem.val;
            return (
              <button
                key={rowItem.val}
                type="button"
                onClick={() => {
                  onRowsChange(rowItem.val);
                  if (onCourseLimitChange) onCourseLimitChange(undefined);
                }}
                className={`py-1.5 px-1 rounded-xs border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-navy-900 text-white border-navy-900 shadow-xs font-bold"
                    : "bg-white border-line text-ink hover:border-navy-900/40"
                }`}
              >
                <div className="text-[11px] leading-tight font-semibold">{rowItem.label}</div>
                <div
                  className={`text-[8.5px] mt-0.5 leading-none ${
                    isSelected ? "text-gold-300 font-normal" : "text-ink-soft"
                  }`}
                >
                  {rowItem.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Live Breakdown & Responsive Device Behavior */}
      <div className="pt-2 border-t border-line space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-navy-900 uppercase tracking-wider">
            Device Responsive Adaptation
          </span>
          <span className="text-[9px] font-mono text-ink-soft">
            Tailwind Grid Breakpoints
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center">
          {/* Desktop Preview */}
          <div
            className={`p-2 rounded-xs border transition-all ${
              currentViewport === "desktop"
                ? "bg-navy-900 text-white border-navy-900 ring-1 ring-gold-400/50"
                : "bg-white border-line text-ink"
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Icon
                name="monitor"
                size={11}
                className={currentViewport === "desktop" ? "text-gold-300" : "text-ink-soft"}
              />
              <span className="text-[10px] font-bold uppercase">Desktop</span>
            </div>
            <div className="text-[11px] font-extrabold text-gold-500 font-mono">
              {effectiveCols} Columns
            </div>
            <div
              className={`text-[8.5px] mt-0.5 ${
                currentViewport === "desktop" ? "text-white/70" : "text-ink-soft"
              }`}
            >
              lg:grid-cols-{effectiveCols}
            </div>
          </div>

          {/* Tablet Preview */}
          <div
            className={`p-2 rounded-xs border transition-all ${
              currentViewport === "tablet"
                ? "bg-navy-900 text-white border-navy-900 ring-1 ring-gold-400/50"
                : "bg-white border-line text-ink"
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Icon
                name="tablet"
                size={11}
                className={currentViewport === "tablet" ? "text-gold-300" : "text-ink-soft"}
              />
              <span className="text-[10px] font-bold uppercase">Tablet</span>
            </div>
            <div className="text-[11px] font-extrabold text-gold-500 font-mono">
              2 Columns
            </div>
            <div
              className={`text-[8.5px] mt-0.5 ${
                currentViewport === "tablet" ? "text-white/70" : "text-ink-soft"
              }`}
            >
              sm:grid-cols-2
            </div>
          </div>

          {/* Mobile Preview */}
          <div
            className={`p-2 rounded-xs border transition-all ${
              currentViewport === "mobile"
                ? "bg-navy-900 text-white border-navy-900 ring-1 ring-gold-400/50"
                : "bg-white border-line text-ink"
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Icon
                name="smartphone"
                size={11}
                className={currentViewport === "mobile" ? "text-gold-300" : "text-ink-soft"}
              />
              <span className="text-[10px] font-bold uppercase">Mobile</span>
            </div>
            <div className="text-[11px] font-extrabold text-gold-500 font-mono">
              1 Column
            </div>
            <div
              className={`text-[8.5px] mt-0.5 ${
                currentViewport === "mobile" ? "text-white/70" : "text-ink-soft"
              }`}
            >
              grid-cols-1 (360/390px)
            </div>
          </div>
        </div>

        <p className="text-[9.5px] text-ink-soft leading-tight mt-1">
          {effectiveRows === "all" ? (
            <span>
              All published qualifications will be displayed in <strong>{effectiveCols} columns</strong> on desktop, <strong>2 columns</strong> on tablet, and stacked single column on mobile.
            </span>
          ) : (
            <span>
              Configured for <strong>{effectiveCols} columns × {effectiveRows} rows ({totalCalculated} cards total)</strong> on desktop. Automatically reflows to 2 columns on tablets and 1 column on phones.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
