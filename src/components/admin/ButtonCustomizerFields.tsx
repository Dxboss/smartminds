"use client";

import React, { useState } from "react";
import { Icon, IconName } from "@/components/ui/Icon";
import {
  ButtonCustomConfig,
  ButtonBgPreset,
  ButtonTextColorPreset,
  ButtonFontFamily,
  ButtonFontWeight,
  ButtonTextTransform,
  ButtonIconPosition,
  ButtonRadius,
  ButtonSizePreset,
  BUTTON_COLOR_PRESETS,
  AVAILABLE_BUTTON_ICONS,
  resolveCustomButtonClasses,
} from "@/components/ui/buttonCustomizer";
import { ColorPalettePicker } from "./ColorPalettePicker";

export interface ButtonCustomizerFieldsProps {
  label: string;
  buttonText: string;
  onButtonTextChange: (val: string) => void;
  buttonLink?: string;
  onButtonLinkChange?: (val: string) => void;
  linkPlaceholder?: string;
  config: ButtonCustomConfig;
  onChange: (key: keyof ButtonCustomConfig, value: any) => void;
  defaultVariant?: "primary" | "on-navy-gold" | "outline";
  defaultSize?: "sm" | "md" | "lg";
  isDarkContainer?: boolean;
}

export const ButtonCustomizerFields: React.FC<ButtonCustomizerFieldsProps> = ({
  label,
  buttonText,
  onButtonTextChange,
  buttonLink,
  onButtonLinkChange,
  linkPlaceholder = "/courses or /book",
  config,
  onChange,
  defaultVariant = "primary",
  defaultSize = "md",
  isDarkContainer = false,
}) => {
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showCustomHex, setShowCustomHex] = useState(
    Boolean(config.bgColor && config.bgColor.startsWith("#"))
  );

  const preview = resolveCustomButtonClasses(
    config,
    defaultVariant,
    config.size || defaultSize,
    isDarkContainer
  );

  return (
    <div className="p-3 bg-paper rounded-sm border border-line space-y-3">
      {/* Header with expand toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold-500" />
          <strong className="text-xs font-bold text-navy-900">{label}</strong>
        </div>
        <button
          type="button"
          onClick={() => setShowStylePanel(!showStylePanel)}
          className="text-[11px] font-bold text-navy-900 hover:text-gold-700 flex items-center gap-1 cursor-pointer"
        >
          <span>{showStylePanel ? "Hide Styling ▴" : "Customize Style & Icon ▾"}</span>
        </button>
      </div>

      {/* Live Preview Widget */}
      <div className="p-3 rounded-sm bg-white border border-line/80 flex flex-col items-center justify-center gap-1.5 text-center shadow-xs">
        <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">
          Live Button Preview (Hover with cursor to test hover color)
        </span>
        <div className="pt-1">
          <button
            type="button"
            className={preview.className}
            style={preview.style}
          >
            {preview.icon && preview.iconPosition === "left" && (
              <Icon name={preview.icon} size={15} />
            )}
            <span>{buttonText || "Button Label"}</span>
            {preview.icon && preview.iconPosition === "right" && (
              <Icon name={preview.icon} size={15} />
            )}
          </button>
        </div>
      </div>

      {/* Button Text & Destination Link */}
      <div className="space-y-2">
        <div>
          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
            Button Label / Writeup
          </label>
          <input
            type="text"
            value={buttonText || ""}
            onChange={(e) => onButtonTextChange(e.target.value)}
            placeholder="e.g. Book a free consultation"
            className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900 font-bold"
          />
        </div>

        {onButtonLinkChange && (
          <div>
            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
              Destination URL (placed after writeup)
            </label>
            <input
              type="text"
              value={buttonLink || ""}
              onChange={(e) => onButtonLinkChange(e.target.value)}
              placeholder={linkPlaceholder}
              className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs font-mono bg-white focus:outline-none focus:border-navy-900"
            />
          </div>
        )}
      </div>

      {/* Collapsible Styling Panel */}
      {showStylePanel && (
        <div className="pt-3 border-t border-line space-y-3.5 animate-in fade-in-50 duration-150">
          {/* Normal State Colors */}
          <div className="p-2.5 bg-paper/60 rounded-xs border border-line space-y-3">
            <span className="text-[10px] font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-navy-900" />
              <span>Normal State Colors</span>
            </span>

            {/* 1. Button Background Palette & Custom Hue */}
            <div>
              <ColorPalettePicker
                value={config.bgColor || (defaultVariant === "outline" ? "outline-navy" : "navy")}
                onChange={(val) => onChange("bgColor", val)}
                label="Button Surface Fill"
                compact={true}
                defaultColor={defaultVariant === "outline" ? "outline-navy" : "navy"}
                allowCustomHex={true}
              />
            </div>

            {/* 2. Button Text Color Override */}
            <div>
              <ColorPalettePicker
                value={config.textColor || "auto"}
                onChange={(val) => onChange("textColor", val === "auto" ? undefined : val)}
                label="Button Text Color"
                compact={true}
                showAutoOption={true}
                defaultColor="auto"
                allowCustomHex={true}
              />
            </div>
          </div>

          {/* Hover State Colors (Client Choice) */}
          <div className="p-2.5 bg-gold-50/40 rounded-xs border border-gold-300/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="sparkles" size={11} className="text-gold-500" />
                <span>Hover State Colors (Client Choice)</span>
              </span>
              <span className="text-[9px] text-gold-700 font-semibold bg-gold-200/50 px-1.5 py-0.5 rounded">
                Interactive State
              </span>
            </div>

            <div>
              <ColorPalettePicker
                value={config.hoverBgColor || "auto"}
                onChange={(val) => onChange("hoverBgColor", val === "auto" ? undefined : val)}
                label="Hover Background Fill"
                compact={true}
                showAutoOption={true}
                defaultColor="auto"
                allowCustomHex={true}
              />
            </div>

            <div>
              <ColorPalettePicker
                value={config.hoverTextColor || "auto"}
                onChange={(val) => onChange("hoverTextColor", val === "auto" ? undefined : val)}
                label="Hover Text Color"
                compact={true}
                showAutoOption={true}
                defaultColor="auto"
                allowCustomHex={true}
              />
            </div>
          </div>

          {/* 3. Typography: Font Family & Text Transform */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Font Family
              </label>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => onChange("fontFamily", "heading")}
                  className={`py-1 px-1.5 rounded-sm border text-center transition-all cursor-pointer ${
                    config.fontFamily !== "body"
                      ? "bg-navy-900 text-white font-heading font-bold tracking-wider"
                      : "bg-white text-ink border-line hover:border-navy-900/30"
                  }`}
                >
                  Saira (Heading)
                </button>
                <button
                  type="button"
                  onClick={() => onChange("fontFamily", "body")}
                  className={`py-1 px-1.5 rounded-sm border text-center transition-all cursor-pointer ${
                    config.fontFamily === "body"
                      ? "bg-navy-900 text-white font-sans font-bold"
                      : "bg-white text-ink border-line hover:border-navy-900/30"
                  }`}
                >
                  Source Sans
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Letter Case
              </label>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => onChange("textTransform", "normal")}
                  className={`py-1 px-1.5 rounded-sm border text-center transition-all cursor-pointer ${
                    config.textTransform !== "uppercase"
                      ? "bg-navy-900 text-white font-bold"
                      : "bg-white text-ink border-line hover:border-navy-900/30"
                  }`}
                >
                  Sentence (Aa)
                </button>
                <button
                  type="button"
                  onClick={() => onChange("textTransform", "uppercase")}
                  className={`py-1 px-1.5 rounded-sm border text-center transition-all cursor-pointer ${
                    config.textTransform === "uppercase"
                      ? "bg-navy-900 text-white font-bold uppercase tracking-wider"
                      : "bg-white text-ink border-line hover:border-navy-900/30"
                  }`}
                >
                  UPPER (AA)
                </button>
              </div>
            </div>
          </div>

          {/* 4. Font Weight */}
          <div>
            <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Font Weight
            </label>
            <div className="grid grid-cols-5 gap-1 text-[10px]">
              {[
                { key: "normal", label: "Normal" },
                { key: "medium", label: "Medium" },
                { key: "semibold", label: "Semibold" },
                { key: "bold", label: "Bold" },
                { key: "extrabold", label: "Heavy" },
              ].map((wt) => (
                <button
                  key={wt.key}
                  type="button"
                  onClick={() => onChange("fontWeight", wt.key as ButtonFontWeight)}
                  className={`py-1 rounded-sm border text-center transition-all cursor-pointer ${
                    (config.fontWeight === wt.key || (!config.fontWeight && wt.key === "bold"))
                      ? "bg-navy-900 text-white font-bold border-navy-900 shadow-xs"
                      : "bg-white text-ink border-line hover:border-navy-900/30"
                  }`}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Icon Selection & Placement */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                Button Icon
              </label>
              {config.icon && config.icon !== "none" && (
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-ink-soft">Position:</span>
                  <button
                    type="button"
                    onClick={() => onChange("iconPosition", "left")}
                    className={`px-1.5 py-0.5 rounded-xs border cursor-pointer ${
                      config.iconPosition === "left"
                        ? "bg-navy-900 text-white font-bold"
                        : "bg-white text-ink border-line"
                    }`}
                  >
                    Left ⇥
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange("iconPosition", "right")}
                    className={`px-1.5 py-0.5 rounded-xs border cursor-pointer ${
                      config.iconPosition !== "left"
                        ? "bg-navy-900 text-white font-bold"
                        : "bg-white text-ink border-line"
                    }`}
                  >
                    ⇤ Right
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
              {AVAILABLE_BUTTON_ICONS.map((ico) => {
                const isSelected =
                  (!config.icon && ico.name === "none") ||
                  config.icon === ico.name;

                return (
                  <button
                    key={ico.name}
                    type="button"
                    title={ico.label}
                    onClick={() =>
                      onChange("icon", ico.name === "none" ? undefined : ico.name)
                    }
                    className={`h-9 rounded-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-navy-900 text-gold-300 border-navy-900 shadow-xs ring-1 ring-gold-500"
                        : "bg-white text-ink border-line hover:border-navy-900/30 hover:bg-paper"
                    }`}
                  >
                    {ico.name === "none" ? (
                      <span className="text-[10px] font-bold">∅ None</span>
                    ) : (
                      <Icon name={ico.name as IconName} size={15} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Corner Radius & Button Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Corner Radius
              </label>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                {[
                  { key: "none", label: "Sharp" },
                  { key: "sm", label: "6px" },
                  { key: "md", label: "12px" },
                  { key: "full", label: "Pill" },
                ].map((rad) => (
                  <button
                    key={rad.key}
                    type="button"
                    onClick={() => onChange("radius", rad.key as ButtonRadius)}
                    className={`py-1 rounded-sm border text-center transition-all cursor-pointer ${
                      (config.radius === rad.key || (!config.radius && rad.key === "sm"))
                        ? "bg-navy-900 text-white font-bold border-navy-900 shadow-xs"
                        : "bg-white text-ink border-line hover:border-navy-900/30"
                    }`}
                  >
                    {rad.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Button Scale / Size
              </label>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                {[
                  { key: "sm", label: "Small" },
                  { key: "md", label: "Standard" },
                  { key: "lg", label: "Large" },
                ].map((sz) => (
                  <button
                    key={sz.key}
                    type="button"
                    onClick={() => onChange("size", sz.key as ButtonSizePreset)}
                    className={`py-1 rounded-sm border text-center transition-all cursor-pointer ${
                      (config.size === sz.key || (!config.size && sz.key === defaultSize))
                        ? "bg-navy-900 text-white font-bold border-navy-900 shadow-xs"
                        : "bg-white text-ink border-line hover:border-navy-900/30"
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
