"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  COLLEGE_COLOR_PALETTES,
  isDarkHex,
  type ColorOption,
} from "@/components/ui/sectionBg";

export interface ColorPalettePickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
  defaultColor?: string;
  allowCustomHex?: boolean;
}

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  value = "paper",
  onChange,
  label = "Background Palette & Accent",
  defaultColor = "paper",
  allowCustomHex = true,
}) => {
  const [activeTab, setActiveTab] = useState<
    "navy" | "yellow" | "grey" | "classic" | "custom"
  >(() => {
    if (value.startsWith("#")) return "custom";
    const found = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
    return found ? found.category : "navy";
  });

  const [customHexInput, setCustomHexInput] = useState(() => {
    if (value.startsWith("#")) return value;
    const found = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
    return found ? found.hex : "#23216B";
  });

  const isCustomHex = Boolean(value.startsWith("#"));
  const activePreset = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
  const activeHex = isCustomHex
    ? value
    : activePreset
    ? activePreset.hex
    : "#FAF8F3";
  const activeIsDark = isCustomHex
    ? isDarkHex(value)
    : activePreset
    ? activePreset.isDark
    : false;

  const currentTabItems = COLLEGE_COLOR_PALETTES.filter(
    (p) => p.category === activeTab
  );

  const handleCustomHexSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let clean = customHexInput.trim();
    if (!clean.startsWith("#")) clean = "#" + clean;
    if (/^#[0-9A-Fa-f]{3,8}$/.test(clean)) {
      onChange(clean);
    }
  };

  return (
    <div className="space-y-3 rounded-sm border border-line bg-paper/60 p-3.5 shadow-2xs">
      {/* Header & Active Color Summary */}
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-900">
            {label}
          </label>
          <span className="text-[10px] text-ink-soft">
            Select college-calibrated shades or apply your own custom hue.
          </span>
        </div>

        {/* Active Pill Preview */}
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-xs border border-line shadow-2xs"
            style={{ backgroundColor: activeHex }}
            title={`Active: ${activeHex}`}
          />
          <div className="text-right">
            <span className="block font-mono text-[11px] font-bold text-navy-900">
              {activePreset ? activePreset.label : value}
            </span>
            <span className="block font-mono text-[9px] text-ink-soft uppercase">
              {activeHex} • {activeIsDark ? "Dark Theme" : "Light Theme"}
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line/70 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("navy")}
          className={`flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "navy"
              ? "bg-navy-900 text-gold-300 shadow-2xs"
              : "bg-white text-ink-soft hover:bg-paper hover:text-navy-900 border border-line"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#23216B]" />
          <span>Shades of Navy (6)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("yellow")}
          className={`flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "yellow"
              ? "bg-navy-900 text-gold-300 shadow-2xs"
              : "bg-white text-ink-soft hover:bg-paper hover:text-navy-900 border border-line"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#D9B84A]" />
          <span>Shades of Yellow (6)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("grey")}
          className={`flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "grey"
              ? "bg-navy-900 text-gold-300 shadow-2xs"
              : "bg-white text-ink-soft hover:bg-paper hover:text-navy-900 border border-line"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#94A3B8]" />
          <span>Shades of Grey (6)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("classic")}
          className={`flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "classic"
              ? "bg-navy-900 text-gold-300 shadow-2xs"
              : "bg-white text-ink-soft hover:bg-paper hover:text-navy-900 border border-line"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#FAF8F3] border border-line" />
          <span>Classic Bases (4)</span>
        </button>

        {allowCustomHex && (
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-navy-900 text-gold-300 shadow-2xs"
                : "bg-white text-ink-soft hover:bg-paper hover:text-navy-900 border border-line"
            }`}
          >
            <Icon name="sparkles" size={12} className="text-gold-500" />
            <span>Custom Color (Hex)</span>
          </button>
        )}
      </div>

      {/* Preset Swatches Grid */}
      {activeTab !== "custom" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {currentTabItems.map((item) => {
            const isSelected = value === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange(item.key)}
                className={`flex items-start gap-2.5 p-2 rounded-xs border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-navy-900 bg-white ring-2 ring-navy-900 shadow-xs"
                    : "border-line bg-white/80 hover:bg-white hover:border-ink-soft/40"
                }`}
              >
                <div
                  className="h-8 w-8 rounded-xs border border-line shrink-0 flex items-center justify-center shadow-2xs"
                  style={{ backgroundColor: item.hex }}
                >
                  {isSelected && (
                    <Icon
                      name="check"
                      size={14}
                      className={item.isDark ? "text-gold-300" : "text-navy-900"}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <strong className="block text-xs font-bold text-navy-900 truncate">
                      {item.label}
                    </strong>
                  </div>
                  <span className="block font-mono text-[10px] text-ink-soft uppercase mt-0.5">
                    {item.hex}
                  </span>
                  {item.description && (
                    <p className="text-[10px] text-ink-soft/80 truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Color Eyedropper & Hex Section */}
      {activeTab === "custom" && (
        <div className="p-3 bg-white rounded-xs border border-line space-y-3">
          <div className="flex items-center gap-3">
            {/* Native OS Color Wheel */}
            <div className="relative">
              <input
                type="color"
                value={
                  customHexInput.startsWith("#") && customHexInput.length === 7
                    ? customHexInput
                    : "#23216B"
                }
                onChange={(e) => {
                  setCustomHexInput(e.target.value);
                  onChange(e.target.value);
                }}
                className="h-10 w-14 rounded-xs border border-line cursor-pointer p-0.5 bg-white"
                title="Open interactive colour wheel"
              />
            </div>

            {/* Hex Text Input */}
            <div className="flex-1 space-y-1">
              <label className="block text-[10px] font-bold text-navy-900 uppercase">
                Custom Hex Code
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="#23216B"
                  value={customHexInput}
                  onChange={(e) => setCustomHexInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-line rounded-xs text-xs font-mono font-bold text-navy-900 focus:outline-none focus:border-navy-900"
                />
                <button
                  type="button"
                  onClick={() => handleCustomHexSubmit()}
                  className="px-3 py-1.5 bg-navy-900 text-gold-300 font-bold text-xs rounded-xs hover:bg-navy-800 transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Accessibility Contrast Preview */}
          <div
            className="p-3 rounded-xs border border-line flex items-center justify-between shadow-2xs"
            style={{ backgroundColor: customHexInput }}
          >
            <span
              className={`text-xs font-bold ${
                isDarkHex(customHexInput) ? "text-white" : "text-ink"
              }`}
            >
              Smartminds Sample Text Heading
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                isDarkHex(customHexInput)
                  ? "bg-white/20 text-white"
                  : "bg-navy-900/10 text-navy-900"
              }`}
            >
              {isDarkHex(customHexInput) ? "Dark BG (White Text)" : "Light BG (Ink Text)"}
            </span>
          </div>
        </div>
      )}

      {/* Reset / Default Action */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-ink-soft">
          Need standard college styling?
        </span>
        <button
          type="button"
          onClick={() => {
            onChange(defaultColor);
            setActiveTab("classic");
          }}
          className="text-[10px] font-semibold text-navy-900 hover:text-gold-600 underline cursor-pointer"
        >
          Reset to Default ({defaultColor})
        </button>
      </div>
    </div>
  );
};
