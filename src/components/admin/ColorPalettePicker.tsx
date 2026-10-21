"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  COLLEGE_COLOR_PALETTES,
  isDarkHex,
  type ColorOption,
} from "@/components/ui/sectionBg";
import { DEFAULT_COLOR_SWATCHES, type ColorSwatch } from "@/lib/colorSwatches";
import {
  saveColorSwatchAction,
  listColorSwatchesAction,
} from "@/app/admin/actions";

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
  { label: "Oceanic Blue", hex: "#13416B", key: "#13416B" },
  { label: "Indigo Collegiate", hex: "#34318F", key: "navy_indigo" },
  { label: "College Gold", hex: "#D9B84A", key: "gold" },
  { label: "Warm Honey", hex: "#E8A938", key: "gold_honey" },
  { label: "Gold Cream", hex: "#FBF6E2", key: "cream" },
  { label: "Emerald Green", hex: "#059669", key: "emerald" },
  { label: "Fresh Mint", hex: "#E8F4F1", key: "mint" },
  { label: "Vibrant Coral", hex: "#E53935", key: "coral" },
  { label: "Sunset Amber", hex: "#F97316", key: "amber_sunset" },
  { label: "Royal Purple", hex: "#581C87", key: "royal_purple" },
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
  // Global Saved Swatches state (synchronized across all page pickers and tabs)
  const [swatches, setSwatches] = useState<ColorSwatch[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("smartminds_saved_swatches");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_COLOR_SWATCHES;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSwatchName, setNewSwatchName] = useState("");
  const [newSwatchHex, setNewSwatchHex] = useState("#13416B");
  const [isSavingSwatch, setIsSavingSwatch] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Swatch Renaming & Editing State
  const [editingSwatch, setEditingSwatch] = useState<ColorSwatch | null>(null);
  const [editName, setEditName] = useState("");
  const [editHex, setEditHex] = useState("");
  const [isUpdatingSwatch, setIsUpdatingSwatch] = useState(false);

  const startEditSwatch = (s: ColorSwatch) => {
    setEditingSwatch(s);
    setEditName(s.name);
    setEditHex(s.hex);
    setShowAddForm(false);
  };

  const handleUpdateSwatch = async () => {
    if (!editingSwatch) return;
    let cleanHex = editHex.trim();
    if (!cleanHex.startsWith("#")) cleanHex = "#" + cleanHex;
    if (!/^#[0-9A-Fa-f]{3,8}$/.test(cleanHex)) {
      alert("Please enter a valid hex color code like #13416B");
      return;
    }
    const name = editName.trim() || editingSwatch.name;
    setIsUpdatingSwatch(true);
    try {
      const res = await saveColorSwatchAction({
        id: editingSwatch.id,
        name,
        hex: cleanHex,
        category: editingSwatch.category || "custom",
        isDark: isDarkHex(cleanHex),
      });
      if (res.success && res.swatch) {
        const nextList = swatches.map((s) => (s.id === editingSwatch.id ? res.swatch! : s));
        setSwatches(nextList);
        try {
          localStorage.setItem("smartminds_saved_swatches", JSON.stringify(nextList));
          window.dispatchEvent(new CustomEvent("smartminds:swatches-updated", { detail: nextList }));
        } catch {}
        if (value.toLowerCase() === editingSwatch.hex.toLowerCase() || value === editingSwatch.id) {
          onChange(cleanHex);
        }
        setEditingSwatch(null);
        setSaveSuccessNotice(`Renamed to "${name}" (${cleanHex})!`);
        setTimeout(() => setSaveSuccessNotice(null), 4000);
      } else {
        alert(res.error || "Failed to update color swatch.");
      }
    } catch (err: any) {
      alert(`Could not update color: ${err?.message || "Unknown error"}`);
    } finally {
      setIsUpdatingSwatch(false);
    }
  };

  useEffect(() => {
    const handleSwatchesUpdated = (e: any) => {
      if (Array.isArray(e.detail)) {
        setSwatches(e.detail);
      }
    };
    window.addEventListener("smartminds:swatches-updated", handleSwatchesUpdated);

    // Fetch latest from server
    listColorSwatchesAction()
      .then((serverSwatches) => {
        if (Array.isArray(serverSwatches) && serverSwatches.length > 0) {
          setSwatches(serverSwatches);
          try {
            localStorage.setItem("smartminds_saved_swatches", JSON.stringify(serverSwatches));
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("smartminds:swatches-updated", handleSwatchesUpdated);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<
    "swatches" | "navy" | "yellow" | "grey" | "greens" | "warm" | "royal" | "classic" | "custom"
  >(() => {
    if (value && value.startsWith("#")) {
      const matchInSwatches = DEFAULT_COLOR_SWATCHES.some(s => s.hex.toLowerCase() === value.toLowerCase());
      if (matchInSwatches) return "swatches";
      return "custom";
    }
    const found = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
    return found ? found.category : "swatches";
  });

  const [customHexInput, setCustomHexInput] = useState(() => {
    if (value && value.startsWith("#")) return value;
    const found = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
    return found ? found.hex : "#13416B";
  });

  const isAuto = value === "auto";
  const isCustomHex = Boolean(value && value.startsWith("#"));
  const activePreset = COLLEGE_COLOR_PALETTES.find((p) => p.key === value);
  const activeSwatch = swatches.find((s) => s.hex.toLowerCase() === (value || "").toLowerCase() || s.id === value);
  
  const activeHex = isCustomHex
    ? value
    : activePreset
    ? activePreset.hex
    : activeSwatch
    ? activeSwatch.hex
    : isAuto
    ? "transparent"
    : "#FAF8F3";

  const activeIsDark = isCustomHex
    ? isDarkHex(value)
    : activePreset
    ? activePreset.isDark
    : activeSwatch
    ? activeSwatch.isDark
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

  const handleSaveNewSwatch = async () => {
    let cleanHex = newSwatchHex.trim();
    if (!cleanHex.startsWith("#")) cleanHex = "#" + cleanHex;
    if (!/^#[0-9A-Fa-f]{3,8}$/.test(cleanHex)) {
      alert("Please enter a valid hex color code like #13416B");
      return;
    }
    const name = newSwatchName.trim() || `Custom Brand Color (${cleanHex})`;
    setIsSavingSwatch(true);
    try {
      const res = await saveColorSwatchAction({ name, hex: cleanHex, category: "custom" });
      if (res.success && res.swatch) {
        const nextList = [...swatches.filter(s => s.id !== res.swatch!.id), res.swatch];
        setSwatches(nextList);
        try {
          localStorage.setItem("smartminds_saved_swatches", JSON.stringify(nextList));
          window.dispatchEvent(new CustomEvent("smartminds:swatches-updated", { detail: nextList }));
        } catch {}
        onChange(cleanHex);
        setShowAddForm(false);
        setNewSwatchName("");
        setSaveSuccessNotice(`"${name}" saved to global palette & applied!`);
        setTimeout(() => setSaveSuccessNotice(null), 4000);
      } else {
        alert(res.error || "Failed to save swatch. Please check your privileges.");
      }
    } catch (err: any) {
      alert(`Could not save color: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSavingSwatch(false);
    }
  };

  // ----------------------------------------------------
  // COMPACT MODE (for Headlines, Subheadlines, Buttons)
  // ----------------------------------------------------
  if (compact) {
    return (
      <div className="space-y-2 rounded-xs border border-line bg-paper/50 p-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1">
            <span>{label}</span>
          </label>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span
              className="inline-block h-3 w-3 rounded-full border border-black/20"
              style={{ backgroundColor: activeHex }}
            />
            <span className="font-bold text-navy-900">
              {isAuto
                ? "Auto Contrast"
                : activeSwatch
                ? activeSwatch.name
                : activePreset
                ? activePreset.label
                : value}
            </span>
          </div>
        </div>

        {/* Global Saved Brand Swatches Bar with Inline Add Option */}
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1">
              <Icon name="sparkles" size={10} className="text-gold-500" />
              <span>Brand Kit Swatches</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[10px] font-bold text-navy-900 hover:text-gold-600 inline-flex items-center gap-0.5 cursor-pointer underline"
            >
              <Icon name="plus" size={10} />
              <span>{showAddForm ? "Cancel" : "Add Color"}</span>
            </button>
          </div>

          {/* Inline Quick Swatch Add Popover */}
          {showAddForm && (
            <div className="p-2 bg-white rounded-xs border border-navy-900 shadow-sm space-y-1.5 animate-fade-in">
              <span className="block text-[10px] font-bold text-navy-900 uppercase">Save New Color Swatch</span>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Oceanic Blue"
                  value={newSwatchName}
                  onChange={(e) => setNewSwatchName(e.target.value)}
                  className="px-2 py-1 text-xs border border-line rounded-xs focus:outline-none focus:border-navy-900 font-semibold"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={newSwatchHex.length === 7 ? newSwatchHex : "#13416B"}
                    onChange={(e) => setNewSwatchHex(e.target.value)}
                    className="h-6 w-7 rounded-xs border border-line cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={newSwatchHex}
                    onChange={(e) => setNewSwatchHex(e.target.value)}
                    placeholder="#13416B"
                    className="w-full px-1.5 py-1 text-xs font-mono font-bold uppercase border border-line rounded-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-line">
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="h-2.5 w-2.5 rounded-full border border-black/20" style={{ backgroundColor: newSwatchHex }} />
                  <span className="text-ink-soft text-[9px]">{isDarkHex(newSwatchHex) ? "Dark BG" : "Light BG"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveNewSwatch}
                  disabled={isSavingSwatch}
                  className="px-2.5 py-0.5 text-[10px] font-bold bg-navy-900 text-gold-300 rounded-xs hover:bg-navy-800 transition-colors cursor-pointer"
                >
                  {isSavingSwatch ? "Saving..." : "Save & Use"}
                </button>
              </div>
            </div>
          )}

          {/* Inline Swatch Edit / Rename Popover */}
          {editingSwatch && (
            <div className="p-2 bg-white rounded-xs border-2 border-navy-900 shadow-sm space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-bold text-navy-900 uppercase">
                  Rename / Edit Swatch
                </span>
                <button
                  type="button"
                  onClick={() => setEditingSwatch(null)}
                  className="text-ink-soft hover:text-navy-900 text-xs font-bold p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Swatch Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-2 py-1 text-xs border border-line rounded-xs focus:outline-none focus:border-navy-900 font-semibold"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={editHex.length === 7 ? editHex : "#13416B"}
                    onChange={(e) => setEditHex(e.target.value)}
                    className="h-6 w-7 rounded-xs border border-line cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={editHex}
                    onChange={(e) => setEditHex(e.target.value)}
                    placeholder="#13416B"
                    className="w-full px-1.5 py-1 text-xs font-mono font-bold uppercase border border-line rounded-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-line">
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="h-2.5 w-2.5 rounded-full border border-black/20" style={{ backgroundColor: editHex }} />
                  <span className="text-ink-soft text-[9px]">{isDarkHex(editHex) ? "Dark BG" : "Light BG"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingSwatch(null)}
                    className="px-2 py-0.5 text-[10px] text-ink-soft hover:text-navy-900 border border-line rounded-xs bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateSwatch}
                    disabled={isUpdatingSwatch || !editName.trim()}
                    className="px-2.5 py-0.5 text-[10px] font-bold bg-navy-900 text-gold-300 rounded-xs hover:bg-navy-800 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {isUpdatingSwatch ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Brand Swatches Pills with inline edit capability */}
          <div className="flex flex-wrap items-center gap-1 max-h-24 overflow-y-auto p-1 bg-white rounded-xs border border-line">
            {swatches.map((swatch) => {
              const isSelected = value.toLowerCase() === swatch.hex.toLowerCase() || value === swatch.id;
              return (
                <div
                  key={swatch.id}
                  className={`group/pill inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs border text-[10px] font-medium transition-all ${
                    isSelected
                      ? "ring-1 ring-navy-900 border-navy-900 bg-navy-50 font-bold shadow-2xs"
                      : "bg-paper hover:bg-white border-line hover:border-navy-900"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChange(swatch.hex)}
                    className="flex items-center gap-1 cursor-pointer"
                    title={`${swatch.name} (${swatch.hex})`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="truncate max-w-[85px] text-navy-900 text-[10px]">{swatch.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditSwatch(swatch);
                    }}
                    className="opacity-0 group-hover/pill:opacity-100 hover:text-navy-900 text-ink-soft p-0.5 cursor-pointer transition-opacity"
                    title={`Rename / Edit ${swatch.name}`}
                  >
                    <Icon name="edit" size={9} />
                  </button>
                </div>
              );
            })}
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

          {QUICK_SPECTRUM_SWATCHES.slice(0, 15).map((swatch) => {
            const isSelected = value === swatch.key || value.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={swatch.label}
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
              value={customHexInput.startsWith("#") && customHexInput.length === 7 ? customHexInput : "#13416B"}
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
            placeholder="#13416B or color"
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
            Pick from your saved brand swatches, college presets, or enter any custom hex.
          </span>
        </div>

        {/* Active Pill Preview + Quick Pipette Wheel */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              value={customHexInput.startsWith("#") && customHexInput.length === 7 ? customHexInput : "#13416B"}
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
              {activeSwatch ? activeSwatch.name : activePreset ? activePreset.label : value}
            </span>
            <span className="block font-mono text-[9px] text-ink-soft uppercase">
              {activeHex} • {activeIsDark ? "Dark" : "Light"}
            </span>
          </div>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xs text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5 animate-fade-in">
          <Icon name="check-circle" size={13} className="text-emerald-600" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* 1. Global Saved Brand Swatches (1-Click Application) */}
      <div className="space-y-1.5 p-2 bg-white rounded-xs border border-line">
        <div className="flex items-center justify-between border-b border-line/60 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1">
            <Icon name="sparkles" size={11} className="text-gold-500" />
            <span>Saved Brand Swatches ({swatches.length})</span>
          </span>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[10px] font-bold text-navy-900 hover:text-gold-600 flex items-center gap-1 cursor-pointer bg-paper px-2 py-0.5 rounded-xs border border-line"
          >
            <Icon name="plus" size={10} />
            <span>{showAddForm ? "Close" : "+ Add New Swatch"}</span>
          </button>
        </div>

        {/* Inline Add New Swatch Form */}
        {showAddForm && (
          <div className="p-2.5 bg-paper rounded-xs border border-navy-900 shadow-sm space-y-2 animate-fade-in">
            <span className="block text-[11px] font-bold text-navy-900 uppercase">
              Add Color to Global Brand Kit
            </span>
            <p className="text-[10px] text-ink-soft leading-tight">
              Give this color a name (e.g. &quot;Oceanic Blue&quot;) and hex code. Once saved, it stays available across every section on the site.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold uppercase text-ink-soft mb-0.5">Swatch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Oceanic Blue"
                  value={newSwatchName}
                  onChange={(e) => setNewSwatchName(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-line rounded-xs focus:outline-none focus:border-navy-900 bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-ink-soft mb-0.5">Hex Code</label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={newSwatchHex.length === 7 ? newSwatchHex : "#13416B"}
                    onChange={(e) => setNewSwatchHex(e.target.value)}
                    className="h-7 w-8 rounded-xs border border-line cursor-pointer p-0 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={newSwatchHex}
                    onChange={(e) => setNewSwatchHex(e.target.value)}
                    placeholder="#13416B"
                    className="w-full px-2 py-1 text-xs font-mono font-bold uppercase border border-line rounded-xs bg-white text-navy-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-line">
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="h-3 w-3 rounded-full border border-black/20" style={{ backgroundColor: newSwatchHex }} />
                <span className="text-ink font-bold">{newSwatchHex}</span>
                <span className="text-ink-soft">({isDarkHex(newSwatchHex) ? "Dark" : "Light"})</span>
              </div>
              <button
                type="button"
                onClick={handleSaveNewSwatch}
                disabled={isSavingSwatch}
                className="px-3 py-1 text-[11px] font-bold bg-navy-900 text-gold-300 rounded-xs hover:bg-navy-800 transition-colors cursor-pointer"
              >
                {isSavingSwatch ? "Saving..." : "Save Swatch & Apply"}
              </button>
            </div>
          </div>
        )}

        {/* Inline Swatch Edit / Rename Popover in Full Mode */}
        {editingSwatch && (
          <div className="p-2.5 bg-paper rounded-xs border-2 border-navy-900 shadow-sm space-y-2 animate-fade-in">
            <div className="flex items-center justify-between border-b border-line pb-1">
              <span className="block text-[11px] font-bold text-navy-900 uppercase">
                Rename / Edit Swatch: {editingSwatch.name}
              </span>
              <button
                type="button"
                onClick={() => setEditingSwatch(null)}
                className="text-ink-soft hover:text-navy-900 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold uppercase text-ink-soft mb-0.5">Swatch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Oceanic Blue"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-line rounded-xs focus:outline-none focus:border-navy-900 bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-ink-soft mb-0.5">Hex Code</label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={editHex.length === 7 ? editHex : "#13416B"}
                    onChange={(e) => setEditHex(e.target.value)}
                    className="h-7 w-8 rounded-xs border border-line cursor-pointer p-0 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={editHex}
                    onChange={(e) => setEditHex(e.target.value)}
                    placeholder="#13416B"
                    className="w-full px-2 py-1 text-xs font-mono font-bold uppercase border border-line rounded-xs bg-white text-navy-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-line">
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="h-3 w-3 rounded-full border border-black/20" style={{ backgroundColor: editHex }} />
                <span className="text-ink font-bold">{editHex}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingSwatch(null)}
                  className="px-2.5 py-1 text-[10px] font-semibold text-ink-soft hover:text-navy-900 bg-white border border-line rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSwatch}
                  disabled={isUpdatingSwatch || !editName.trim()}
                  className="px-3 py-1 text-[11px] font-bold bg-navy-900 text-gold-300 rounded-xs hover:bg-navy-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {isUpdatingSwatch ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Swatches Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1">
          {swatches.map((swatch) => {
            const isSelected = value.toLowerCase() === swatch.hex.toLowerCase() || value === swatch.id;
            return (
              <div
                key={swatch.id}
                className={`group/card flex items-center justify-between p-1.5 rounded-xs border text-left transition-all ${
                  isSelected
                    ? "border-navy-900 bg-navy-50 ring-1 ring-navy-900 shadow-xs"
                    : "border-line bg-paper/60 hover:bg-paper hover:border-navy-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onChange(swatch.hex)}
                  className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                  title={`Apply ${swatch.name} (${swatch.hex})`}
                >
                  <div
                    className="h-5 w-5 rounded-full border border-black/20 shrink-0 flex items-center justify-center shadow-2xs"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && (
                      <Icon
                        name="check"
                        size={10}
                        className={swatch.isDark ? "text-white" : "text-navy-900"}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-[10px] font-bold text-navy-900 truncate leading-tight">
                      {swatch.name}
                    </strong>
                    <span className="block font-mono text-[8px] text-ink-soft uppercase leading-none mt-0.5">
                      {swatch.hex}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditSwatch(swatch);
                  }}
                  className="opacity-0 group-hover/card:opacity-100 hover:text-navy-900 text-ink-soft p-1 cursor-pointer transition-opacity"
                  title={`Rename / Edit ${swatch.name}`}
                >
                  <Icon name="edit" size={11} />
                </button>
              </div>
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
          ...(allowCustomHex ? [{ id: "custom", label: "Custom Hex", color: "#13416B" }] : []),
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
      {activeTab !== "custom" && activeTab !== "swatches" && (
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
                    : "#13416B"
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
                  placeholder="#13416B"
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
