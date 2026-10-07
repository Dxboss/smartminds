"use client";

import React from "react";
import { CourseLevel } from "@/content/types";

interface LevelSelectorProps {
  levels: CourseLevel[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  selectedIndex,
  onSelectIndex,
}) => {
  if (levels.length <= 1) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-paper border border-line text-xs font-bold uppercase tracking-wider text-navy-900">
        <span>Qualification Level:</span>
        <span className="text-gold-700">
          {levels[0]?.level_label || "Certificate"}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold uppercase tracking-wider text-ink-soft">
        Select Qualification Level:
      </span>
      <div
        role="tablist"
        aria-label="Course qualification levels"
        className="inline-flex p-1 bg-paper rounded-lg border border-line gap-1 flex-wrap"
      >
        {levels.map((level, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={level.level_label}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`level-panel-${idx}`}
              id={`level-tab-${idx}`}
              onClick={() => onSelectIndex(idx)}
              className={`px-4 py-2 rounded-sm text-sm font-heading font-bold transition-all min-h-[44px] flex items-center gap-2 ${
                isSelected
                  ? "bg-navy-900 text-white shadow-sm"
                  : "text-navy-900 hover:bg-white/80"
              }`}
            >
              <span>{level.level_label}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-sm font-mono ${
                  isSelected
                    ? "bg-white/20 text-gold-300"
                    : "bg-navy-900/10 text-ink-soft"
                }`}
              >
                £{level.price_gbp}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
