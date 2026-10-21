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
  compact?: boolean;
  showAutoOption?: boolean;
}

const QUICK_SPECTRUM_SWATCHES = [
  { label: "Royal Navy", hex: "#23216B", key: "navy" },
  { label: "Indigo Collegiate", hex: "#34318F", key: "navy_indigo" },
  { label: "Twilight Sapphire", hex: "#282570", key: "navy_twilight" },
  { label: "College Gold", hex: "#D9B84A", key: "gold" },
  { label: "Warm Honey", hex: "#E8A938", key: "gold_honey" },
  { label: "Gold Cream", hex: "#FBF6E2", key: "cream" },
  { label: "Emerald Green", hex: "#059669", key: "emerald" },
  { label: "Deep Forest", hex: "#064E3B", key: "forest" },
  { label: "Fresh Mint", hex: "#E8F4F1", key: "mint" },
  { label: "Vibrant Coral", hex: "#E53935", key: "coral" },
  { label: "Ruby Crimson", hex: "#991B1B", key: "crimson" },
  { label: "Sunset Amber", hex: "#F97316", key: "amber_sunset" },
  { label: "Royal Purple", hex: "#581C87", key: "royal_purple" },
  { label: "Amethyst Violet", hex: "#7E22CE", key: "amethyst" },
  { label: "Electric Cobalt", hex: "#1D4ED8", key: "cobalt" },
  { label: "Slate Charcoal", hex: "#334155", key: "grey_charcoal" },
  { label: "Midnight Slate", hex: "#0B132B", key: "slate" },
  { label: "Light Pearl", hex: "#F8FAFC", key: "grey_pearl" },
  { label: "Parchment Paper", hex: "#FAF8F3", key: "paper" },
  { label: "Pure White", hex: "#FFFFFF", key: "white" },
];

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  value = "paper",
  onChange,
  label = "Color Palette",
  defaultColor = "paper",
  allowCustomHex = true,
  compact = false,
  showAutoOption = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "navy" | "yellow" | "grey" | "greens" | "warm" | "royal" | "classic" | "custom"
  >(() => {
    if (value && value.startsWith("#")) return "custom";
    const found = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
    return found ? found.category : "navy";
  });

  const [customHexInput, setCustomHexInput] = useState(() => {
    if (value && value.startsWith("#")) return value;
    const found = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
    return found ? found.hex : "#23216B";
  });

  const isAuto = value === "auto";
  const isCustomHex = Boolean(value && value.startsWith("#"));
  const activePreset = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
  const activeHex = isCustomHex
    ? value
    : activePreset
    ? activePreset.hex
    : isAuto
    ? "transparent"
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

  // ----------------------------------------------------
  // COMPACT MODE (for Headlines, Subheadlines, Buttons)
  // ----------------------------------------------------
  if (compact) {
    return (
      <div className="space-y-2 rounded-xs border border-line bg-paper/50 p-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-navy-900">
            {label}
          </label>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span
              className="inline-block h-3 w-3 rounded-full border border-black/20"
              style={{ backgroundColor: activeHex }}
            />
            <span className="font-bold text-navy-900">
              {isAuto ? "Auto Contrast" : activePreset ? activePreset.label : value}
            </span>
          </div>
        </div>

        {/* Quick Swatch Bar */}
        <div className="flex flex-wrap items-center gap-1">
          {showAutoOption && (
            <button
              type="button"
              onClick={() => onChange("auto")}
              className={`px-2 py-1 text-[10px] font-bold rounded-xs border transition-all cursor-pointer ${
                isAuto
                  ? "bg-navy-900 text-gold-300 border-navy-900"
                  : "bg-white text-ink border-line hover:border-navy-900"
              }`}
              title="Automatic smart contrast"
            >
              Auto
            </button>
          )}

          {QUICK_SPECTRUM_SWATCHES.slice(0, 14).map((swatch) => {
            const isSelected = value === swatch.key || value === swatch.hex;
            return (
              <button
                key={swatch.key}
                type="button"
                onClick={() => onChange(swatch.key)}
                className={`h-5 w-5 rounded-xs border transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-navy-900 ring-offset-1 scale-110 shadow-xs border-white"
                    : "border-black/20 hover:scale-105"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.label} (${swatch.hex})`}
              >
                {isSelected && (
                  <Icon
                    name="check"
                    size={10}
                    className={isDarkHex(swatch.hex) ? "text-white" : "text-navy-900"}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Native Color Picker + Hex Input */}
        <div className="flex items-center gap-2 pt-1 border-t border-line/60">
          <div className="relative flex items-center">
            <input
              type="color"
              value={customHexInput.startsWith("#") && customHexInput.length === 7 ? customHexInput : "#23216B"}
              onChange={(e) => {
                setCustomHexInput(e.target.value);
                onChange(e.target.value);
              }}
              className="h-7 w-8 cursor-pointer rounded-xs border border-line bg-white p-0.5"
              title="Open full interactive color wheel"
            />
          </div>
          <input
            type="text"
            placeholder="#23216B or color"
            value={isCustomHex ? value : customHexInput}
            onChange={(e) => {
              let val = e.target.value.trim();
              setCustomHexInput(val);
              if (val.startsWith("#") && (val.length === 4 || val.length === 7)) {
                onChange(val);
              }
            }}
            onBlur={() => handleCustomHexSubmit()}
            className="flex-1 px-2 py-1 font-mono text-[11px] font-bold border border-line rounded-xs bg-white text-navy-900 focus:outline-none focus:border-navy-900 uppercase"
          />
          {value && value !== defaultColor && (
            <button
              type="button"
              onClick={() => onChange(defaultColor)}
              className="px-2 py-1 text-[10px] text-ink-soft hover:text-navy-900 border border-line rounded-xs bg-white cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL EXPANDED MODE (for Section Backgrounds, Hero, etc.)
  // ----------------------------------------------------
  return (
    <div className="space-y-3 rounded-sm border border-line bg-paper/60 p-3.5 shadow-2xs">
      {/* Header & Active Color Summary */}
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
            <Icon name="sparkles" size={12} className="text-gold-500" />
            <span>{label}</span>
          </label>
          <span className="text-[10px] text-ink-soft">
            Pick from college shades or click the color wheel for any custom hue.
          </span>
        </div>

        {/* Active Pill Preview + Quick Pipette Wheel */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              value={customHexInput.startsWith("#") && customHexInput.length === 7 ? customHexInput : "#23216B"}
              onChange={(e) => {
                setCustomHexInput(e.target.value);
                onChange(e.target.value);
                setActiveTab("custom");
              }}
              className="h-7 w-8 rounded-xs border border-line p-0.5 bg-white cursor-pointer"
              title="Click to open color wheel"
            />
          </div>
          <div className="text-right">
            <span className="block font-mono text-[11px] font-bold text-navy-900 truncate max-w-[120px]">
              {activePreset ? activePreset.label : value}
            </span>
            <span className="block font-mono text-[9px] text-ink-soft uppercase">
              {activeHex} • {activeIsDark ? "Dark" : "Light"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Visual Spectrum Row (Direct 1-Click Access) */}
      <div className="space-y-1">
        <span className="block text-[10px] font-bold uppercase text-ink-soft">
          Quick Swatch Bar (1-Click)
        </span>
        <div className="grid grid-cols-10 gap-1 p-1 bg-white rounded-xs border border-line">
          {QUICK_SPECTRUM_SWATCHES.map((swatch) => {
            const isSelected = value === swatch.key || value === swatch.hex;
            return (
              <button
                key={swatch.key}
                type="button"
                onClick={() => onChange(swatch.key)}
                className={`h-6 rounded-xs border transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-navy-900 scale-110 shadow-xs border-white z-10"
                    : "border-black/20 hover:scale-105"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.label} (${swatch.hex})`}
              >
                {isSelected && (
                  <Icon
                    name="check"
                    size={11}
                    className={isDarkHex(swatch.hex) ? "text-white" : "text-navy-900"}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-line/70 pb-2">
        {[
          { id: "navy", label: "Navy (7)", color: "#23216B" },
          { id: "yellow", label: "Yellow (6)", color: "#D9B84A" },
          { id: "grey", label: "Grey (6)", color: "#94A3B8" },
          { id: "greens", label: "Greens (6)", color: "#059669" },
          { id: "warm", label: "Warm (6)", color: "#E53935" },
          { id: "royal", label: "Royal (6)", color: "#7E22CE" },
          { id: "classic", label: "Classic (4)", color: "#FAF8F3" },
          ...(allowCustomHex ? [{ id: "custom", label: "Custom Hex", color: "#F59E0B" }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1 rounded-xs px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-navy-900 text-gold-300 shadow-2xs font-bold"
                : "bg-white text-ink-soft hover:bg-paper hover:text-navy-900 border border-line"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: tab.color }}
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Preset Swatches Grid */}
      {activeTab !== "custom" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-0.5">
          {currentTabItems.map((item) => {
            const isSelected = value === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange(item.key)}
                className={`flex items-start gap-2 p-1.5 rounded-xs border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-navy-900 bg-white ring-2 ring-navy-900 shadow-xs"
                    : "border-line bg-white/80 hover:bg-white hover:border-ink-soft/40"
                }`}
              >
                <div
                  className="h-7 w-7 rounded-xs border border-black/15 shrink-0 flex items-center justify-center shadow-2xs"
                  style={{ backgroundColor: item.hex }}
                >
                  {isSelected && (
                    <Icon
                      name="check"
                      size={12}
                      className={item.isDark ? "text-gold-300" : "text-navy-900"}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-[11px] font-bold text-navy-900 truncate leading-tight">
                    {item.label}
                  </strong>
                  <span className="block font-mono text-[9px] text-ink-soft uppercase leading-none mt-0.5">
                    {item.hex}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Color Tab (Precision Input + Real-time Contrast Preview) */}
      {activeTab === "custom" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xs border border-line">
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
                  className="w-full px-2.5 py-1.5 border border-line rounded-xs text-xs font-mono font-bold text-navy-900 focus:outline-none focus:border-navy-900 uppercase"
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
      <div className="flex items-center justify-between pt-1 border-t border-line/60">
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
