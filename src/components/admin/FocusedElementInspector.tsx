import React, { useState } from "react";
import { BuilderSection, BuilderSectionItem } from "@/lib/repositories/seedData";
import { Icon, IconName } from "@/components/ui/Icon";
import { ButtonCustomizerFields } from "@/components/admin/ButtonCustomizerFields";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { CourseGridCmsControls } from "./CourseGridCmsControls";
import { ColorPalettePicker } from "./ColorPalettePicker";

export const COLLEGE_STOCK_IMAGES = [
  {
    path: "/images/adult-care-training.jpg",
    label: "Adult Social Care Training Suite",
  },
  {
    path: "/images/early-years-training.jpg",
    label: "Early Years & Nursery Classroom",
  },
  {
    path: "/images/teacher-training.jpg",
    label: "Teacher Education Seminar Room",
  },
  {
    path: "/images/tutor-teaching.jpg",
    label: "1-to-1 Assessor Mentoring",
  },
  {
    path: "/images/certificate-moment.jpg",
    label: "Qualification Certification",
  },
  {
    path: "/images/hero-learner.jpg",
    label: "Adult Learner with Laptop",
  },
];

/* =========================================================================
   UNIVERSAL TEXT DESIGN CONTROLS (Brand Tokens, Hierarchy, Alignment)
   ========================================================================= */
interface UniversalTextDesignControlsProps {
  label: string;
  fontFamily?: string;
  onFontFamilyChange?: (val: any) => void;
  fontSize?: string;
  onFontSizeChange?: (val: any) => void;
  fontWeight?: string;
  onFontWeightChange?: (val: any) => void;
  color?: string;
  onColorChange?: (val: any) => void;
  align?: string;
  onAlignChange?: (val: any) => void;
  transform?: string;
  onTransformChange?: (val: any) => void;
  showFamily?: boolean;
  showTransform?: boolean;
}

const UniversalTextDesignControls: React.FC<UniversalTextDesignControlsProps> = ({
  label,
  fontFamily = "heading",
  onFontFamilyChange,
  fontSize = "lg",
  onFontSizeChange,
  fontWeight = "bold",
  onFontWeightChange,
  color = "auto",
  onColorChange,
  align = "left",
  onAlignChange,
  transform = "normal",
  onTransformChange,
  showFamily = true,
  showTransform = true,
}) => {
  return (
    <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
      <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
        <Icon name="sparkles" size={13} className="text-gold-500" />
        <span>{label} Design & Typography</span>
      </strong>

      {/* Brand Color Token Selector */}
      {onColorChange && (
        <div>
          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
            Brand Color Token
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: "auto", label: "Adaptive Auto", desc: "Matches section theme" },
              { key: "navy", label: "Royal Navy 900", desc: "#23216B" },
              { key: "ink_soft", label: "Soft Charcoal", desc: "#5A5A6E" },
              { key: "gold", label: "Refined Gold", desc: "#D9B84A" },
              { key: "white", label: "Pure White", desc: "For dark backgrounds" },
            ].map((col) => (
              <button
                key={col.key}
                type="button"
                onClick={() => onColorChange(col.key)}
                className={`p-2 rounded-xs border text-left transition-all cursor-pointer ${
                  color === col.key
                    ? "border-navy-900 bg-white shadow-xs font-bold ring-1 ring-navy-900"
                    : "border-line bg-white/70 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3 h-3 rounded-full border border-black/10 shrink-0 ${
                      col.key === "navy"
                        ? "bg-navy-900"
                        : col.key === "gold"
                        ? "bg-gold-500"
                        : col.key === "white"
                        ? "bg-white"
                        : col.key === "ink_soft"
                        ? "bg-ink-soft"
                        : "bg-gradient-to-tr from-navy-900 to-gold-500"
                    }`}
                  />
                  <span className="text-[11px] font-medium leading-none truncate">{col.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Typography Hierarchy & Scale */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
        {showFamily && onFontFamilyChange && (
          <div>
            <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
            >
              <option value="heading">Saira Condensed (Heading)</option>
              <option value="body">Source Sans 3 (Body)</option>
            </select>
          </div>
        )}
        {onFontSizeChange && (
          <div>
            <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
              Scale / Size
            </label>
            <select
              value={fontSize}
              onChange={(e) => onFontSizeChange(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
            >
              <option value="sm">Small (Compact)</option>
              <option value="md">Medium (Standard)</option>
              <option value="lg">Large (Emphasized)</option>
              <option value="xl">Extra Large (Headline)</option>
              <option value="2xl">Hero Mega (Display)</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {onFontWeightChange && (
          <div>
            <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
              Font Weight
            </label>
            <select
              value={fontWeight}
              onChange={(e) => onFontWeightChange(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
            >
              <option value="normal">Normal (400)</option>
              <option value="medium">Medium (500)</option>
              <option value="semibold">Semibold (600)</option>
              <option value="bold">Bold (700)</option>
              <option value="extrabold">Extrabold (800)</option>
            </select>
          </div>
        )}

        {/* Text Alignment */}
        {onAlignChange && (
          <div>
            <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
              Alignment
            </label>
            <div className="flex border border-line rounded-xs bg-white overflow-hidden p-0.5">
              {[
                { key: "left", label: "Left" },
                { key: "center", label: "Center" },
                { key: "right", label: "Right" },
              ].map((al) => (
                <button
                  key={al.key}
                  type="button"
                  onClick={() => onAlignChange(al.key)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                    align === al.key ? "bg-navy-900 text-white shadow-2xs" : "text-ink-soft hover:text-navy-900"
                  }`}
                >
                  {al.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showTransform && onTransformChange && (
        <div className="pt-2 border-t border-line">
          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
            Text Transform
          </label>
          <div className="flex border border-line rounded-xs bg-white overflow-hidden p-0.5">
            <button
              type="button"
              onClick={() => onTransformChange("normal")}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                transform !== "uppercase" ? "bg-navy-900 text-white shadow-2xs" : "text-ink-soft hover:text-navy-900"
              }`}
            >
              Sentence Case
            </button>
            <button
              type="button"
              onClick={() => onTransformChange("uppercase")}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                transform === "uppercase" ? "bg-navy-900 text-white shadow-2xs" : "text-ink-soft hover:text-navy-900"
              }`}
            >
              UPPERCASE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const getDefaultItemsForSection = (type: string): BuilderSectionItem[] => {
  if (type === "staff_training") {
    return [
      {
        title: "Group Discounts & Bulk Onboarding",
        desc: "Tiered corporate tuition rates for residential care homes, nursery groups, and schools training cohorts of 3 to 50+ staff simultaneously.",
        icon: "users",
        tag: "Employers",
        cardBg: "white",
        cardBorder: "line",
        titleColor: "navy",
        descColor: "ink_soft",
      },
      {
        title: "Dedicated Account Manager & Progress Dashboard",
        desc: "Real-time manager visibility into employee attendance, assignment submissions, guided learning hours, and expected completion dates.",
        icon: "shield-check",
        tag: "Management",
        cardBg: "white",
        cardBorder: "line",
        titleColor: "navy",
        descColor: "ink_soft",
      },
      {
        title: "30-Day Corporate Invoicing & Flexible Billing",
        desc: "Structured payment plans aligned to your institutional training budget with zero interest or setup costs.",
        icon: "credit-card",
        tag: "Billing",
        cardBg: "white",
        cardBorder: "line",
        titleColor: "navy",
        descColor: "ink_soft",
      },
    ];
  }
  if (type === "coral_promo") {
    return [
      {
        title: "100% Coursework & Portfolio Assessment",
        desc: "Zero closed-book exams. You are assessed on workplace portfolio evidence.",
        icon: "check",
        titleColor: "white",
        descColor: "white",
      },
      {
        title: "0% Interest Monthly Fee Spread",
        desc: "Divide tuition into 3 to 12 interest-free monthly instalments.",
        icon: "check",
        titleColor: "white",
        descColor: "white",
      },
      {
        title: "Dedicated British 1-to-1 Assessor",
        desc: "Direct mentor guidance, unlimited draft feedback, and live tutor workshops.",
        icon: "check",
        titleColor: "white",
        descColor: "white",
      },
    ];
  }
  if (type === "student_benefits") {
    return [
      {
        title: "Official Student Discount ID",
        desc: "Access verified student discounts with TOTUM / NUS Extra on high-street tech, textbooks, and daily travel.",
        icon: "credit-card",
        tag: "TOTUM Card",
        cardBg: "white",
      },
      {
        title: "Live Assessor Guidance & Feedback",
        desc: "Direct contact with qualified British subject assessors for continuous draft portfolio appraisals.",
        icon: "users",
        tag: "Mentorship",
        cardBg: "white",
      },
      {
        title: "24/7 Digital Student Portal",
        desc: "Re-watch live evening lectures, upload assignments, and track regulated module milestones anytime.",
        icon: "monitor",
        tag: "Online Campus",
        cardBg: "white",
      },
      {
        title: "0% Interest Tuition Spread",
        desc: "Transparent monthly instalments with no third-party credit check or hidden verification fees.",
        icon: "shield-check",
        tag: "Fee Support",
        cardBg: "white",
      },
    ];
  }
  if (type === "why_smartminds") {
    return [
      {
        title: "Course Management",
        desc: "Structured qualification modules and comprehensive British curricula tailored for career progression.",
        icon: "check-circle",
        cardBg: "mint",
        iconColor: "emerald",
        titleColor: "navy",
      },
      {
        title: "Students Progress Tracking",
        desc: "Real-time guided learning hours monitoring, portfolio milestones, and assessor feedback.",
        icon: "check-circle",
        cardBg: "peach",
        iconColor: "amber",
        titleColor: "navy",
      },
      {
        title: "Interactive Live Class",
        desc: "Weekly evening Zoom seminars led by experienced UK subject-specialist practitioners.",
        icon: "check-circle",
        cardBg: "lavender",
        iconColor: "purple",
        titleColor: "navy",
      },
      {
        title: "Quiz and Assignments",
        desc: "100% coursework assessments with continuous mentor guidance and zero exam stress.",
        icon: "check-circle",
        cardBg: "sky",
        iconColor: "cyan",
        titleColor: "navy",
      },
    ];
  }
  if (type === "exclusive_bundles") {
    return [
      {
        title: "Healthcare Leadership Pathway",
        subtitle: "Lead Adult Care Worker (Level 3) + Leadership & Management (Level 5)",
        desc: "Lead Adult Care Worker (Level 3) + Leadership & Management (Level 5)",
        tag: "Highest Career Progression",
        badge: "12 – 18 Months",
        price: "£1,890.00",
        originalPrice: "£2,450.00",
        saveAmount: "Save £560",
        monthly: "£157.50/mo",
        image: "/images/adult-care-training.jpg",
        link: "/enrol?course=diploma-in-adult-care&level=Level%205",
      },
      {
        title: "Dual Educator & Assessor Masterclass",
        subtitle: "Level 3 Award in Education & Training (AET) + Level 3 Assessor (CAVA)",
        desc: "Level 3 Award in Education & Training (AET) + Level 3 Assessor (CAVA)",
        tag: "Most Popular Dual Track",
        badge: "6 – 9 Months",
        price: "£1,250.00",
        originalPrice: "£1,590.00",
        saveAmount: "Save £340",
        monthly: "£104.17/mo",
        image: "/images/teacher-training.jpg",
        link: "/enrol?course=award-in-education-and-training-aet",
      },
      {
        title: "Early Years Educator & SENCO Bundle",
        subtitle: "Level 3 Early Years Educator (EYE) + Advanced SENCO Specialism",
        desc: "Level 3 Early Years Educator (EYE) + Advanced SENCO Specialism",
        tag: "Nursery & School Ready",
        badge: "9 – 12 Months",
        price: "£1,620.00",
        originalPrice: "£2,100.00",
        saveAmount: "Save £480",
        monthly: "£135.00/mo",
        image: "/images/early-years-training.jpg",
        link: "/enrol?course=diploma-early-years-educator",
      },
      {
        title: "Care Governance & Compliance Dual Award",
        subtitle: "Level 4 Care Management + Mandatory Quality & CQC Audit Specialist",
        desc: "Level 4 Care Management + Mandatory Quality & CQC Audit Specialist",
        tag: "Care Home Compliance",
        badge: "8 – 12 Months",
        price: "£1,420.00",
        originalPrice: "£1,850.00",
        saveAmount: "Save £430",
        monthly: "£118.33/mo",
        image: "/images/tutor-teaching.jpg",
        link: "/enrol?course=diploma-in-adult-care&level=Level%204",
      },
      {
        title: "Higher Education & School Leadership",
        subtitle: "Level 5 Diploma in Education & Training + Academic Department Head",
        desc: "Level 5 Diploma in Education & Training + Academic Department Head",
        tag: "Further Education Track",
        badge: "12 – 18 Months",
        price: "£1,980.00",
        originalPrice: "£2,600.00",
        saveAmount: "Save £620",
        monthly: "£165.00/mo",
        image: "/images/certificate-moment.jpg",
        link: "/enrol?course=award-in-education-and-training-aet",
      },
    ];
  }
  return [];
};

/* =========================================================================
   UNIVERSAL CARD DESIGN CONTROLS (Surfaces, Borders, Radii, Typography)
   ========================================================================= */
interface UniversalCardDesignControlsProps {
  item: BuilderSectionItem;
  idx: number;
  updateItemField: (index: number, field: keyof BuilderSectionItem, value: any) => void;
}

const UniversalCardDesignControls: React.FC<UniversalCardDesignControlsProps> = ({
  item,
  idx,
  updateItemField,
}) => {
  return (
    <div className="p-3.5 bg-paper rounded-sm border border-line space-y-4 shadow-2xs">
      <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
        <Icon name="sparkles" size={13} className="text-gold-500" />
        <span>Card Container Design & Styling</span>
      </strong>

      {/* 1. Card Surface Fill */}
      <div>
        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
          Card Surface Fill
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { key: "mint", label: "Soft Mint Pill", class: "bg-[#dff5ec] text-emerald-950" },
            { key: "peach", label: "Warm Peach Pill", class: "bg-[#faedd9] text-amber-950" },
            { key: "lavender", label: "Soft Lavender Pill", class: "bg-[#eeeaf8] text-purple-950" },
            { key: "sky", label: "Soft Sky Blue Pill", class: "bg-[#e2f3fa] text-sky-950" },
            { key: "white", label: "Crisp White", class: "bg-white border-line" },
            { key: "paper", label: "Parchment Paper", class: "bg-paper border-line" },
            { key: "navy", label: "Royal Navy (Dark)", class: "bg-navy-900 text-white" },
            { key: "gold_subtle", label: "Subtle Gold Fill", class: "bg-gold-50 border-gold-300" },
            { key: "transparent", label: "Transparent", class: "bg-transparent border-dashed" },
          ].map((surf) => (
            <button
              key={surf.key}
              type="button"
              onClick={() => updateItemField(idx, "cardBg", surf.key)}
              className={`p-2 rounded-xs border text-left transition-all cursor-pointer ${
                (item.cardBg || "white") === surf.key
                  ? "border-navy-900 bg-white shadow-xs font-bold ring-1 ring-navy-900"
                  : "border-line bg-white/70 hover:bg-white"
              }`}
            >
              <span className="text-[11px] font-semibold block">{surf.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Card Border Style */}
      <div className="pt-2 border-t border-line">
        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
          Card Border & Accent
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { key: "line", label: "Subtle Line (Default)" },
            { key: "gold", label: "Gold Highlight Border" },
            { key: "navy", label: "Navy Border" },
            { key: "none", label: "Borderless (Clean)" },
          ].map((bor) => (
            <button
              key={bor.key}
              type="button"
              onClick={() => updateItemField(idx, "cardBorder", bor.key)}
              className={`p-1.5 rounded-xs border text-left text-xs transition-all cursor-pointer ${
                (item.cardBorder || "line") === bor.key
                  ? "border-navy-900 bg-white font-bold ring-1 ring-navy-900"
                  : "border-line bg-white/70 hover:bg-white"
              }`}
            >
              {bor.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Corner Radius (Strictly PRD 2 radii rule: 6px vs 16px) */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
        <div>
          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
            Border Radius (PRD)
          </label>
          <select
            value={item.cardRadius || "xl"}
            onChange={(e) => updateItemField(idx, "cardRadius", e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
          >
            <option value="xl">16px (Signature Card)</option>
            <option value="sm">6px (Compact Modern)</option>
            <option value="none">0px (Sharp Square)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
            Card Padding
          </label>
          <select
            value={item.cardPadding || "normal"}
            onChange={(e) => updateItemField(idx, "cardPadding", e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
          >
            <option value="compact">Compact (p-4)</option>
            <option value="normal">Standard (p-6)</option>
            <option value="spacious">Spacious (p-8)</option>
          </select>
        </div>
      </div>

      {/* 4. Text Alignment */}
      <div className="pt-2 border-t border-line">
        <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
          Content Alignment
        </label>
        <div className="flex border border-line rounded-xs bg-white overflow-hidden p-0.5">
          <button
            type="button"
            onClick={() => updateItemField(idx, "textAlign", "left")}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
              (item.textAlign || "left") === "left" ? "bg-navy-900 text-white shadow-2xs" : "text-ink-soft hover:text-navy-900"
            }`}
          >
            Left-Aligned
          </button>
          <button
            type="button"
            onClick={() => updateItemField(idx, "textAlign", "center")}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
              item.textAlign === "center" ? "bg-navy-900 text-white shadow-2xs" : "text-ink-soft hover:text-navy-900"
            }`}
          >
            Center-Aligned
          </button>
        </div>
      </div>

      {/* 5. Title & Heading Typography */}
      <div className="pt-2 border-t border-line space-y-2">
        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
          Card Title Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-ink-soft mb-0.5">Title Color</label>
            <select
              value={item.titleColor || "auto"}
              onChange={(e) => updateItemField(idx, "titleColor", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
            >
              <option value="auto">Adaptive Auto</option>
              <option value="navy">Royal Navy 900</option>
              <option value="gold">Gold 500</option>
              <option value="white">White</option>
              <option value="ink_soft">Soft Charcoal</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-ink-soft mb-0.5">Title Size</label>
            <select
              value={item.titleSize || "lg"}
              onChange={(e) => updateItemField(idx, "titleSize", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large (Default)</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Description Typography */}
      <div className="pt-2 border-t border-line space-y-2">
        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
          Card Description Color
        </label>
        <select
          value={item.descColor || "auto"}
          onChange={(e) => updateItemField(idx, "descColor", e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
        >
          <option value="auto">Adaptive Auto (Muted ink / Light)</option>
          <option value="ink_soft">Soft Charcoal</option>
          <option value="navy">Royal Navy</option>
          <option value="white">White</option>
          <option value="gold">Gold Accent</option>
        </select>
      </div>

      {/* 7. Badge Variant Pill */}
      {item.badge && (
        <div className="pt-2 border-t border-line space-y-2">
          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
            Badge Pill Variant
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: "default", label: "Light Gray" },
              { key: "gold", label: "Luxury Gold" },
              { key: "navy", label: "Royal Navy" },
              { key: "live", label: "Live Green" },
            ].map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => updateItemField(idx, "badgeVariant", v.key)}
                className={`p-1.5 rounded-xs border text-left text-xs transition-all cursor-pointer ${
                  (item.badgeVariant || "default") === v.key
                    ? "border-navy-900 bg-white font-bold ring-1 ring-navy-900"
                    : "border-line bg-white/70 hover:bg-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 8. Icon Accent & Color Tone */}
      <div className="pt-2 border-t border-line space-y-2">
        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
          Icon Accent Tone
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { key: "emerald", label: "Emerald (Mint)" },
            { key: "amber", label: "Warm Amber" },
            { key: "purple", label: "Lavender Purple" },
            { key: "cyan", label: "Sky Cyan" },
            { key: "gold", label: "Gold Accent" },
            { key: "navy", label: "Navy" },
            { key: "teal", label: "Teal Brand" },
            { key: "blue", label: "Sky Blue" },
            { key: "white", label: "Pure White" },
          ].map((icCol) => (
            <button
              key={icCol.key}
              type="button"
              onClick={() => updateItemField(idx, "iconColor" as any, icCol.key)}
              className={`p-1.5 rounded-xs border text-left text-xs transition-all cursor-pointer ${
                ((item as any).iconColor || "gold") === icCol.key
                  ? "border-navy-900 bg-white font-bold ring-1 ring-navy-900"
                  : "border-line bg-white/70 hover:bg-white"
              }`}
            >
              {icCol.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LINE_ICONS: { name: IconName; label: string }[] = [
  { name: "shield-check", label: "Shield Check" },
  { name: "graduation-cap", label: "Graduation Cap" },
  { name: "book-open", label: "Open Book" },
  { name: "users", label: "Users Team" },
  { name: "user", label: "User / Student" },
  { name: "clock", label: "Clock / Duration" },
  { name: "calendar", label: "Calendar Timetable" },
  { name: "award", label: "Award Ribbon" },
  { name: "star", label: "Star Quality" },
  { name: "sparkles", label: "Sparkles Accredited" },
  { name: "video", label: "Live Video" },
  { name: "check", label: "Checkmark" },
  { name: "check-circle", label: "Check Circle" },
  { name: "phone", label: "Phone Advisory" },
  { name: "mail", label: "Admissions Email" },
  { name: "globe", label: "Online Campus" },
  { name: "building", label: "Training Centre" },
  { name: "home", label: "Home Study" },
  { name: "credit-card", label: "Payment Plan" },
  { name: "file-text", label: "Portfolio / Course" },
  { name: "monitor", label: "Virtual Classroom" },
  { name: "compass", label: "Career Direction" },
  { name: "download", label: "Prospectus Download" },
  { name: "bell", label: "Intake Alert" },
];

/* =========================================================================
   MAIN FOCUSED ELEMENT INSPECTOR
   ========================================================================= */
interface FocusedElementInspectorProps {
  section: BuilderSection;
  elementKey:
    | "headline"
    | "subheadline"
    | "badge"
    | "tags"
    | "button"
    | "secondaryButton"
    | "image"
    | "item"
    | "bg"
    | "video"
    | "floatingBadge"
    | "sealBadge";
  itemIndex?: number | null;
  onBack: () => void;
  updateField: (field: keyof BuilderSection, value: any) => void;
  updateItemField: (index: number, field: keyof BuilderSectionItem, value: any) => void;
}

export const FocusedElementInspector: React.FC<FocusedElementInspectorProps> = ({
  section,
  elementKey,
  itemIndex = 0,
  onBack,
  updateField,
  updateItemField,
}) => {
  const [tab, setTab] = useState<"content" | "style">("content");
  const [activeWhyPhoto, setActiveWhyPhoto] = useState<1 | 2 | 3>(1);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<{ type: "section" | "item"; itemIdx?: number } | null>(null);
  const isDark = section.bgColor === "navy";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
      {/* Return Navigation & Context Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <button
          type="button"
          onClick={onBack}
          className="px-2.5 py-1 text-xs font-bold text-navy-900 bg-white hover:bg-gold-50 border border-line hover:border-gold-500 rounded-sm flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <Icon name="arrow-left" size={11} />
          <span>Back to {section.name} Overview</span>
        </button>
        <span className="text-[10px] font-mono text-gold-700 bg-gold-300/30 px-2 py-0.5 rounded font-bold uppercase">
          Focus: {elementKey}
        </span>
      </div>

      {/* Unified 2-Tab Navigation: Content vs Design & Style */}
      <div className="flex bg-white rounded-xs border border-line p-0.5 text-xs font-semibold shadow-2xs">
        <button
          type="button"
          onClick={() => setTab("content")}
          className={`flex-1 py-1.5 rounded-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === "content"
              ? "bg-navy-900 text-white shadow-xs font-bold"
              : "text-ink-soft hover:text-navy-900 hover:bg-paper"
          }`}
        >
          <Icon name="file-text" size={12} />
          <span>Content</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("style")}
          className={`flex-1 py-1.5 rounded-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === "style"
              ? "bg-navy-900 text-white shadow-xs font-bold"
              : "text-ink-soft hover:text-navy-900 hover:bg-paper"
          }`}
        >
          <Icon name="sparkles" size={12} className={tab === "style" ? "text-gold-300" : "text-gold-600"} />
          <span>Design & Style</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CONTENT
          ========================================================================= */}
      {tab === "content" && (
        <div className="space-y-4">
          {/* 1. HERO FLOATING LIVE SESSIONS BADGE OR CORPORATE METRICS BANNER */}
          {elementKey === "floatingBadge" && (
            section.type === "staff_training" ? (
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="award" size={13} className="text-gold-500" />
                    <span>Corporate Partners Trust Metrics Banner</span>
                  </strong>
                  <span className="text-[10px] font-mono text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded uppercase font-bold">
                    Bottom Banner
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Banner Title / Stat Headline
                  </label>
                  <input
                    type="text"
                    value={section.metricsBannerTitle ?? "50+ UK Care & Education Providers Trust Smartminds"}
                    onChange={(e) => updateField("metricsBannerTitle", e.target.value)}
                    placeholder="e.g. 50+ UK Care & Education Providers Trust Smartminds"
                    className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-bold focus:outline-none focus:border-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Banner Subtitle / Regulatory Benchmark
                  </label>
                  <input
                    type="text"
                    value={
                      section.metricsBannerSubtitle ??
                      "Compliant with CQC regulations & Ofsted workforce benchmarks"
                    }
                    onChange={(e) => updateField("metricsBannerSubtitle", e.target.value)}
                    placeholder="e.g. Compliant with CQC regulations & Ofsted workforce benchmarks"
                    className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
                  />
                </div>
              </div>
            ) : section.type === "why_smartminds" ? (
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="star" size={13} className="text-gold-500" />
                    <span>Experience Floating Stat & Support Line</span>
                  </strong>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-navy-900">
                    <input
                      type="checkbox"
                      checked={section.floatingBadgeEnabled !== false}
                      onChange={(e) => updateField("floatingBadgeEnabled", e.target.checked)}
                      className="rounded border-line text-navy-900 focus:ring-0"
                    />
                    <span>Show Floating Card</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Stat Number
                    </label>
                    <input
                      type="text"
                      value={section.floatingBadgeTitle ?? "26+"}
                      onChange={(e) => updateField("floatingBadgeTitle", e.target.value)}
                      placeholder="e.g. 26+"
                      className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-bold text-navy-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Stat Subtitle / Label
                    </label>
                    <input
                      type="text"
                      value={section.floatingBadgeSubtitle ?? "Years of Experiences"}
                      onChange={(e) => updateField("floatingBadgeSubtitle", e.target.value)}
                      placeholder="e.g. Years of Experiences"
                      className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Support Trust Note (Below Checklist Pills)
                  </label>
                  <input
                    type="text"
                    value={section.trustNote ?? "24/7 Hrs Ready to our support team"}
                    onChange={(e) => updateField("trustNote", e.target.value)}
                    placeholder="e.g. 24/7 Hrs Ready to our support team"
                    className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="sparkles" size={13} className="text-gold-500" />
                    <span>Hero Floating Live Sessions Badge</span>
                  </strong>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-navy-900">
                    <input
                      type="checkbox"
                      checked={section.floatingBadgeEnabled !== false}
                      onChange={(e) => updateField("floatingBadgeEnabled", e.target.checked)}
                      className="rounded border-line text-navy-900 focus:ring-0"
                    />
                    <span>Show on Photo</span>
                  </label>
                </div>

                {section.floatingBadgeEnabled !== false && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Badge Title
                      </label>
                      <input
                        type="text"
                        value={section.floatingBadgeTitle ?? "Live Evening Sessions"}
                        onChange={(e) => updateField("floatingBadgeTitle", e.target.value)}
                        placeholder="e.g. Live Evening Sessions"
                        className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Badge Subtitle / Detail
                      </label>
                      <input
                        type="text"
                        value={section.floatingBadgeSubtitle ?? "Recordings available 24/7 to rewatch"}
                        onChange={(e) => updateField("floatingBadgeSubtitle", e.target.value)}
                        placeholder="e.g. Recordings available 24/7 to rewatch"
                        className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
                      />
                    </div>
                  </>
                )}
              </div>
            )
          )}

          {/* 1B. WATCH VIDEO & EXPLORE COURSES SEAL BADGE */}
          {elementKey === "sealBadge" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <Icon name="video" size={13} className="text-gold-500" />
                  <span>Watch Video • Explore Courses Seal</span>
                </strong>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-navy-900">
                  <input
                    type="checkbox"
                    checked={section.sealEnabled !== false}
                    onChange={(e) => updateField("sealEnabled", e.target.checked)}
                    className="rounded border-line text-navy-900 focus:ring-0"
                  />
                  <span>Show Seal</span>
                </label>
              </div>

              {section.sealEnabled !== false && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Rotating Circular Text
                    </label>
                    <input
                      type="text"
                      value={section.sealText ?? "• WATCH VIDEO • EXPLORE COURSES •"}
                      onChange={(e) => updateField("sealText", e.target.value)}
                      placeholder="• WATCH VIDEO • EXPLORE COURSES •"
                      className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-bold focus:outline-none focus:border-navy-900 font-mono"
                    />
                    <span className="text-[10px] text-ink-soft block mt-0.5">
                      Rotates continuously along circular SVG perimeter path.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Video Modal Link (YouTube / Vimeo / MP4)
                    </label>
                    <input
                      type="text"
                      value={section.sealVideoUrl ?? ""}
                      onChange={(e) => updateField("sealVideoUrl", e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                      className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-mono focus:outline-none focus:border-navy-900"
                    />
                    <span className="text-[10px] text-ink-soft block mt-0.5">
                      When provided, clicking the rotating badge opens an interactive video player modal!
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Fallback Destination URL (if no video modal)
                    </label>
                    <input
                      type="text"
                      value={section.sealLink ?? "/courses"}
                      onChange={(e) => updateField("sealLink", e.target.value)}
                      placeholder="/courses"
                      className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-mono focus:outline-none focus:border-navy-900"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 2. PRIMARY CTA BUTTON CONTENT */}
          {elementKey === "button" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="external-link" size={13} className="text-navy-900" />
                <span>Primary Button Content & Link</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Button Text Label
                </label>
                <input
                  type="text"
                  value={section.buttonText || ""}
                  onChange={(e) => updateField("buttonText", e.target.value)}
                  placeholder="e.g. Book a Free Consultation"
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs bg-white font-bold focus:outline-none focus:border-navy-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Destination URL / Path
                </label>
                <input
                  type="text"
                  value={section.buttonLink || ""}
                  onChange={(e) => updateField("buttonLink", e.target.value)}
                  placeholder="/book or /courses"
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs bg-white font-mono focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>
          )}

          {/* 3. SECONDARY CTA BUTTON CONTENT */}
          {elementKey === "secondaryButton" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="external-link" size={13} className="text-navy-900" />
                <span>Secondary Button Content & Link</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Button Text Label
                </label>
                <input
                  type="text"
                  value={section.secondaryButtonText || ""}
                  onChange={(e) => updateField("secondaryButtonText", e.target.value)}
                  placeholder="e.g. Explore Courses"
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs bg-white font-bold focus:outline-none focus:border-navy-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Destination URL / Path
                </label>
                <input
                  type="text"
                  value={section.secondaryButtonLink || ""}
                  onChange={(e) => updateField("secondaryButtonLink", e.target.value)}
                  placeholder="/courses or /funding"
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs bg-white font-mono focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>
          )}

          {/* 4. MAIN HEADLINE CONTENT */}
          {elementKey === "headline" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="file-text" size={13} className="text-navy-900" />
                <span>Main Headline Copy</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Headline Text
                </label>
                <textarea
                  rows={4}
                  value={section.headline}
                  onChange={(e) => updateField("headline", e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold focus:outline-none focus:border-navy-900 bg-white leading-snug"
                  placeholder="Enter section headline..."
                />
              </div>
            </div>
          )}

          {/* 5. SUBHEADLINE CONTENT */}
          {elementKey === "subheadline" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="file-text" size={13} className="text-navy-900" />
                <span>Subheadline Copy</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Subheadline Text
                </label>
                <textarea
                  rows={4}
                  value={section.subheadline}
                  onChange={(e) => updateField("subheadline", e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-xs leading-relaxed focus:outline-none focus:border-navy-900 bg-white"
                  placeholder="Enter explanatory subheadline..."
                />
              </div>
            </div>
          )}

          {/* 6. EYEBROW BADGE CONTENT */}
          {elementKey === "badge" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>Eyebrow / Badge Text</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Badge Copy
                </label>
                <input
                  type="text"
                  value={section.badgeText || ""}
                  onChange={(e) => updateField("badgeText", e.target.value)}
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
                  placeholder="e.g. British Accredited Training"
                />
              </div>
            </div>
          )}

          {/* 7. TOP TAGS CONTENT */}
          {elementKey === "tags" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <Icon name="layers" size={13} className="text-navy-900" />
                  <span>Benefit Badges ({(section.tags || []).length})</span>
                </strong>
                <button
                  type="button"
                  onClick={() => {
                    const currentTags = section.tags || [];
                    const newTag = {
                      id: `tag-${Date.now()}`,
                      label: "New Benefit Badge",
                      variant: "navy" as const,
                    };
                    updateField("tags", [...currentTags, newTag]);
                  }}
                  className="text-[11px] font-bold text-navy-900 hover:text-gold-700 flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="plus" size={12} />
                  <span>Add Badge</span>
                </button>
              </div>
              <div className="space-y-2">
                {(section.tags || []).map((tag, tIdx, arr) => (
                  <div
                    key={tag.id || tIdx}
                    className="p-2 bg-white rounded-xs border border-line flex items-center gap-2 shadow-2xs"
                  >
                    <input
                      type="text"
                      value={tag.label}
                      onChange={(e) => {
                        const updated = [...arr];
                        updated[tIdx] = { ...updated[tIdx], label: e.target.value };
                        updateField("tags", updated);
                      }}
                      placeholder="Tag label..."
                      className="flex-1 px-2 py-1 text-xs border border-line rounded-xs"
                    />
                    <select
                      value={tag.variant || "default"}
                      onChange={(e) => {
                        const updated = [...arr];
                        updated[tIdx] = {
                          ...updated[tIdx],
                          variant: e.target.value as any,
                        };
                        updateField("tags", updated);
                      }}
                      className="px-2 py-1 text-xs border border-line rounded-xs bg-white"
                    >
                      <option value="navy">Navy Pill</option>
                      <option value="gold">Gold Pill</option>
                      <option value="live">Live Green</option>
                      <option value="default">Neutral Gray</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = arr.filter((_, idx) => idx !== tIdx);
                        updateField("tags", updated);
                      }}
                      className="p-1 text-ink-soft hover:text-red-600 rounded-xs transition-colors"
                      title="Remove Badge"
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. IMAGE CONTENT */}
          {elementKey === "image" && (
            section.type === "why_smartminds" ? (
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="monitor" size={13} className="text-navy-900" />
                    <span>Why Choose Us 3-Photo Overlapping Composition</span>
                  </strong>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                    Photo #{activeWhyPhoto}
                  </span>
                </div>

                {/* 3 Circular Photo Switcher */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-white rounded-xs border border-line">
                  {[
                    { num: 1 as const, label: "Photo 1 (Amber)", ring: "border-amber-500", key: "image" as const, val: section.image },
                    { num: 2 as const, label: "Photo 2 (Emerald)", ring: "border-emerald-500", key: "image2" as const, val: section.image2 },
                    { num: 3 as const, label: "Photo 3 (Sky)", ring: "border-sky-400", key: "image3" as const, val: section.image3 },
                  ].map((p) => (
                    <button
                      key={p.num}
                      type="button"
                      onClick={() => setActiveWhyPhoto(p.num)}
                      className={`p-2 rounded-xs border text-left transition-all cursor-pointer ${
                        activeWhyPhoto === p.num
                          ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                          : "bg-paper text-navy-900 border-line hover:border-gold-500"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-3 h-3 rounded-full border-2 ${p.ring} bg-white`} />
                        <span className="text-[10px] font-bold block truncate">{p.label}</span>
                      </div>
                      <div className="text-[9px] opacity-75 font-mono truncate">
                        {p.val ? "Custom" : "Default"}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active Photo Editor */}
                {(() => {
                  const currentField: "image" | "image2" | "image3" =
                    activeWhyPhoto === 1 ? "image" : activeWhyPhoto === 2 ? "image2" : "image3";
                  const currentVal =
                    activeWhyPhoto === 1
                      ? section.image || "/images/hero-student-thumbsup.jpg"
                      : activeWhyPhoto === 2
                      ? section.image2 || "/images/promo-woman-card.jpg"
                      : section.image3 || "/images/hero-learner.jpg";

                  return (
                    <div className="space-y-3 pt-1">
                      <ImageDropzone
                        value={section[currentField]}
                        onChange={(url) => updateField(currentField, url)}
                        label={`Drop Photo ${activeWhyPhoto} From Desktop`}
                        helperText="PNG, JPG, or WebP format."
                        previewHeight={130}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTargetField({ type: "section" });
                          setMediaModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xs bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Icon name="image" size={14} className="text-gold-500" />
                        <span>Choose From Media Library</span>
                      </button>
                      <div className="pt-2 border-t border-line">
                        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-2">
                          Pick From College Library for Photo {activeWhyPhoto}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {COLLEGE_STOCK_IMAGES.map((img) => (
                            <button
                              key={img.path}
                              type="button"
                              onClick={() => updateField(currentField, img.path)}
                              className={`relative aspect-[4/3] rounded-xs overflow-hidden border transition-all cursor-pointer ${
                                currentVal === img.path
                                  ? "ring-2 ring-gold-500 border-navy-900"
                                  : "border-line hover:border-navy-900 opacity-80 hover:opacity-100"
                              }`}
                              title={img.label}
                            >
                              <img
                                src={img.path}
                                alt={img.label}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
                <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                  <Icon name="monitor" size={13} className="text-navy-900" />
                  <span>Section Media Image</span>
                </strong>
                <ImageDropzone
                  value={section.image}
                  onChange={(url) => updateField("image", url)}
                  label="Drop Featured Photo From Desktop"
                  helperText="PNG, JPG, or WebP format."
                  previewHeight={140}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaTargetField({ type: "section" });
                    setMediaModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xs bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Icon name="image" size={15} className="text-gold-500" />
                  <span>Open College Media Library & Uploads</span>
                </button>
                <div className="pt-2 border-t border-line">
                  <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-2">
                    Or Pick From Verified College Photos
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLLEGE_STOCK_IMAGES.map((img) => (
                      <button
                        key={img.path}
                        type="button"
                        onClick={() => updateField("image", img.path)}
                        className={`relative aspect-[4/3] rounded-xs overflow-hidden border transition-all cursor-pointer ${
                          section.image === img.path
                            ? "ring-2 ring-gold-500 border-navy-900"
                            : "border-line hover:border-navy-900 opacity-80 hover:opacity-100"
                        }`}
                        title={img.label}
                      >
                        <img
                          src={img.path}
                          alt={img.label}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}

          {/* 9. VIDEO SPOTLIGHT CONTENT */}
          {elementKey === "video" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="video" size={13} className="text-navy-900" />
                <span>Spotlight Video Player</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  Video Headline / Title
                </label>
                <input
                  type="text"
                  value={section.videoTitle || ""}
                  onChange={(e) => updateField("videoTitle", e.target.value)}
                  placeholder="e.g. Watch learners share their qualification journey"
                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  Video Description / Caption
                </label>
                <textarea
                  rows={2}
                  value={section.videoDesc || ""}
                  onChange={(e) => updateField("videoDesc", e.target.value)}
                  placeholder="Real student feedback..."
                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  Video Embed URL (YouTube / TikTok / Vimeo / MP4)
                </label>
                <input
                  type="text"
                  value={section.videoUrl || ""}
                  onChange={(e) => updateField("videoUrl", e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-mono focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>
          )}

          {/* 10. BACKGROUND & LAYOUT CONTENT */}
          {elementKey === "bg" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="layers" size={13} className="text-gold-500" />
                <span>Section Information</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  Section Name / Internal Label
                </label>
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-bold"
                />
              </div>
            </div>
          )}

          {/* 11. INDIVIDUAL CHILD CARD ITEM CONTENT */}
          {elementKey === "item" && section.type === "featured_courses" && (
            <CourseGridCmsControls
              columns={section.columns || 4}
              rows={section.rows || 2}
              courseLimit={section.courseLimit}
              courseCategoryFilter={section.courseCategoryFilter || "all"}
              onColumnsChange={(cols) => updateField("columns", cols)}
              onRowsChange={(rows) => updateField("rows", rows)}
              onCourseLimitChange={(limit) => updateField("courseLimit", limit)}
              onCourseCategoryFilterChange={(cat) => updateField("courseCategoryFilter", cat)}
            />
          )}

          {elementKey === "item" && section.type !== "featured_courses" && (
            (() => {
              const idx = itemIndex ?? 0;
              const items =
                section.items && section.items.length > 0
                  ? section.items
                  : getDefaultItemsForSection(section.type);
              const item =
                items[idx] || {
                  title:
                    section.type === "staff_training"
                      ? `Corporate Benefit #${idx + 1}`
                      : section.type === "coral_promo"
                      ? `Promotional Bullet #${idx + 1}`
                      : section.type === "why_smartminds"
                      ? `Why Choose Us Feature #${idx + 1}`
                      : `Card #${idx + 1}`,
                  desc: "",
                  icon: "shield-check",
                };

              return (
                <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                      <Icon name="check-circle" size={13} className="text-gold-500" />
                      <span>
                        {section.type === "staff_training"
                          ? `Corporate Benefit Point #${idx + 1}`
                          : section.type === "coral_promo"
                          ? `Promotional Bullet #${idx + 1}`
                          : section.type === "why_smartminds"
                          ? `Why Choose Us Feature #${idx + 1}`
                          : section.type === "exclusive_bundles"
                          ? `Course Bundle Card #${idx + 1}`
                          : section.type === "choose_path"
                          ? `Pathway Card #${idx + 1}`
                          : section.type === "how_it_works"
                          ? `Timeline Step #${idx + 1}`
                          : section.type === "pricing"
                          ? `Pricing Option #${idx + 1}`
                          : section.type === "testimonials"
                          ? `Student Review #${idx + 1}`
                          : section.type === "trust_strip"
                          ? `Awarding Body #${idx + 1}`
                          : `Card Item #${idx + 1}`}
                      </span>
                    </strong>
                    <span className="text-[10px] font-mono text-ink-soft bg-white px-2 py-0.5 rounded border border-line">
                      {section.name}
                    </span>
                  </div>

                  {/* Step / Option Number */}
                  {(item.number !== undefined || section.type === "how_it_works" || section.type === "pricing") && (
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                        Step / Option Identifier
                      </label>
                      <input
                        type="text"
                        value={item.number || ""}
                        onChange={(e) => updateItemField(idx, "number", e.target.value)}
                        placeholder="e.g. 01, Step 01, Option 01"
                        className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-mono"
                      />
                    </div>
                  )}

                  {/* Primary Title */}
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                      {section.type === "testimonials"
                        ? "Student / Graduate Name"
                        : section.type === "faq_accordion"
                        ? "Question"
                        : section.type === "exclusive_bundles"
                        ? "Bundle Title (e.g. Healthcare Leadership Pathway)"
                        : "Card Title / Heading"}
                    </label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => updateItemField(idx, "title", e.target.value)}
                      placeholder="Card title..."
                      className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-bold"
                    />
                  </div>

                  {/* Subtitle / Role */}
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                      {section.type === "testimonials"
                        ? "Course Completed / Current Job Title"
                        : section.type === "choose_path"
                        ? "Target Role / Career Destination"
                        : section.type === "exclusive_bundles"
                        ? "Included Qualifications (Subtitle)"
                        : "Subtitle / Explanatory Tagline"}
                    </label>
                    <input
                      type="text"
                      value={item.subtitle || ""}
                      onChange={(e) => updateItemField(idx, "subtitle", e.target.value)}
                      placeholder="e.g. Deputy Manager to Registered Manager"
                      className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white"
                    />
                  </div>

                  {/* Description / Quote */}
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                      {section.type === "testimonials"
                        ? "Student Review Quote"
                        : section.type === "faq_accordion"
                        ? "Answer Content"
                        : section.type === "exclusive_bundles"
                        ? "Bundle Description / Included Courses Summary"
                        : "Card Description / Explanatory Text"}
                    </label>
                    <textarea
                      rows={3}
                      value={item.desc || ""}
                      onChange={(e) => updateItemField(idx, "desc", e.target.value)}
                      placeholder="Detailed description..."
                      className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white leading-relaxed"
                    />
                  </div>

                  {/* Badges and Tags */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                        {section.type === "exclusive_bundles" ? "Duration (e.g. 12 – 18 Months)" : "Pill Badge / Level"}
                      </label>
                      <input
                        type="text"
                        value={item.badge || ""}
                        onChange={(e) => updateItemField(idx, "badge", e.target.value)}
                        placeholder="e.g. Levels 2–5, 12 – 18 Months"
                        className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                        {section.type === "exclusive_bundles" ? "Top Tag (e.g. Highest Progression)" : "Category Tag / Status"}
                      </label>
                      <input
                        type="text"
                        value={item.tag || ""}
                        onChange={(e) => updateItemField(idx, "tag", e.target.value)}
                        placeholder="e.g. Funded, Accredited, Top Track"
                        className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Bundle Pricing Controls (For Exclusive Bundles or Pricing sections) */}
                  {(section.type === "exclusive_bundles" || item.price !== undefined || item.originalPrice !== undefined) && (
                    <div className="p-3 bg-white rounded-xs border border-line space-y-2">
                      <strong className="text-[11px] font-bold text-navy-900 block uppercase tracking-wider">
                        Bundle Pricing &amp; Savings
                      </strong>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                            Sale Price (GBP)
                          </label>
                          <input
                            type="text"
                            value={item.price || ""}
                            onChange={(e) => updateItemField(idx, "price", e.target.value)}
                            placeholder="e.g. £1,890.00"
                            className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-mono font-bold text-emerald-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                            Regular / Original Price
                          </label>
                          <input
                            type="text"
                            value={item.originalPrice || ""}
                            onChange={(e) => updateItemField(idx, "originalPrice", e.target.value)}
                            placeholder="e.g. £2,450.00"
                            className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-mono text-ink-soft"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                            Savings Tag
                          </label>
                          <input
                            type="text"
                            value={item.saveAmount || ""}
                            onChange={(e) => updateItemField(idx, "saveAmount", e.target.value)}
                            placeholder="e.g. Save £560"
                            className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-bold text-[#FF5722]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                            Monthly Rate
                          </label>
                          <input
                            type="text"
                            value={item.monthly || ""}
                            onChange={(e) => updateItemField(idx, "monthly", e.target.value)}
                            placeholder="e.g. £157.50/mo"
                            className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Star Rating */}
                  {(section.type === "testimonials" || item.rating !== undefined) && (
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                        Star Rating (1–5)
                      </label>
                      <select
                        value={item.rating || 5}
                        onChange={(e) => updateItemField(idx, "rating", Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-bold"
                      >
                        <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                        <option value={4}>★★★★☆ (4 Stars - Great)</option>
                        <option value={3}>★★★☆☆ (3 Stars - Satisfactory)</option>
                      </select>
                    </div>
                  )}

                  {/* Visual Line Icon Picker Grid */}
                  {section.type !== "testimonials" && section.type !== "faq_accordion" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                          Card Line Icon ({item.icon || "shield-check"})
                        </label>
                        <span className="text-[10px] text-ink-soft">Click any icon to assign</span>
                      </div>

                      {/* Currently selected icon preview */}
                      <div className="p-2 bg-white rounded-xs border border-line flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center shrink-0">
                            <Icon
                              name={(item.icon as IconName) || "shield-check"}
                              size={18}
                              className="text-gold-500"
                            />
                          </div>
                          <div>
                            <strong className="text-xs font-bold text-navy-900 block font-mono">
                              {item.icon || "shield-check"}
                            </strong>
                            <span className="text-[10px] text-ink-soft">Current active icon</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded uppercase font-bold">
                          Active
                        </span>
                      </div>

                      {/* Clickable Line Icon Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-white rounded-xs border border-line">
                        {LINE_ICONS.map((ic) => {
                          const isSelected = (item.icon || "shield-check") === ic.name;
                          return (
                            <button
                              key={ic.name}
                              type="button"
                              onClick={() => updateItemField(idx, "icon", ic.name)}
                              className={`p-2 rounded-xs border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-navy-900 text-gold-300 border-navy-900 shadow-xs ring-1 ring-navy-900 scale-105"
                                  : "bg-paper hover:bg-gold-50 text-navy-900 border-line hover:border-gold-500/60"
                              }`}
                              title={ic.label}
                            >
                              <Icon
                                name={ic.name}
                                size={16}
                                className={isSelected ? "text-gold-400" : "text-navy-900"}
                              />
                              <span className="text-[8px] truncate max-w-full font-mono leading-none">
                                {ic.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Link Destination */}
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                      Link Destination (URL / Path)
                    </label>
                    <input
                      type="text"
                      value={item.link || ""}
                      onChange={(e) => updateItemField(idx, "link", e.target.value)}
                      placeholder="e.g. /courses or /cpd or /funding"
                      className="w-full px-2.5 py-1.5 font-mono text-xs border border-line rounded-sm bg-white"
                    />
                  </div>

                  {/* Photo / Avatar / Logo */}
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                      {section.type === "testimonials"
                        ? "Graduate Photo / Avatar"
                        : section.type === "trust_strip"
                        ? "Awarding Body Logo"
                        : "Card Photograph (Optional)"}
                    </label>
                    <ImageDropzone
                      value={item.image}
                      onChange={(url) => updateItemField(idx, "image", url)}
                      label="Drop Photo / Logo From Desktop"
                      helperText="PNG, JPG, or WebP format."
                      previewHeight={90}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTargetField({ type: "item", itemIdx: idx });
                        setMediaModalOpen(true);
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xs bg-paper border border-line hover:border-navy-900 text-navy-900 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <Icon name="image" size={13} className="text-navy-900" />
                      <span>Choose from Media Library</span>
                    </button>
                  </div>

                  {/* Bullet Points */}
                  {(section.type === "pricing" || item.bullets !== undefined) && (
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                        Checklist Highlights (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={(item.bullets || []).join("\n")}
                        onChange={(e) => {
                          const bullets = e.target.value
                            .split("\n")
                            .map((b) => b.trim())
                            .filter(Boolean);
                          updateItemField(idx, "bullets", bullets);
                        }}
                        placeholder="Instant 10% discount&#10;Immediate portal access&#10;Zero ongoing debits"
                        className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-mono leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Immediate Styling & Brand Color Controls for this Item */}
                  <div className="pt-3 border-t border-line space-y-3">
                    <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                      <Icon name="sparkles" size={13} className="text-gold-500" />
                      <span>{section.type === "staff_training" ? "Benefit Point" : section.type === "coral_promo" ? "Bullet" : "Card"} Styling & Colors</span>
                    </strong>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                          Title Color
                        </label>
                        <select
                          value={item.titleColor || "auto"}
                          onChange={(e) => updateItemField(idx, "titleColor", e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
                        >
                          <option value="auto">Adaptive Auto</option>
                          <option value="navy">Royal Navy 900</option>
                          <option value="gold">Gold 500</option>
                          <option value="white">Pure White</option>
                          <option value="ink_soft">Soft Charcoal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                          Description Color
                        </label>
                        <select
                          value={item.descColor || "auto"}
                          onChange={(e) => updateItemField(idx, "descColor", e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
                        >
                          <option value="auto">Adaptive Auto</option>
                          <option value="ink_soft">Soft Charcoal</option>
                          <option value="navy">Royal Navy</option>
                          <option value="white">Pure White</option>
                          <option value="gold">Gold Accent</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                          Surface Fill
                        </label>
                        <select
                          value={item.cardBg || "white"}
                          onChange={(e) => updateItemField(idx, "cardBg", e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
                        >
                          <option value="mint">Soft Mint (Why Choose Us)</option>
                          <option value="peach">Warm Peach (Why Choose Us)</option>
                          <option value="lavender">Soft Lavender (Why Choose Us)</option>
                          <option value="sky">Soft Sky Blue (Why Choose Us)</option>
                          <option value="white">Crisp White</option>
                          <option value="paper">Parchment Paper</option>
                          <option value="navy">Royal Navy (Dark)</option>
                          <option value="gold_subtle">Subtle Gold</option>
                          <option value="transparent">Transparent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                          Border Style
                        </label>
                        <select
                          value={item.cardBorder || "line"}
                          onChange={(e) => updateItemField(idx, "cardBorder", e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
                        >
                          <option value="line">Subtle Line</option>
                          <option value="gold">Gold Accent</option>
                          <option value="navy">Navy Border</option>
                          <option value="none">Borderless</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Icon Tone
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: "emerald", label: "Emerald (Mint)" },
                          { key: "amber", label: "Warm Amber" },
                          { key: "purple", label: "Lavender Purple" },
                          { key: "cyan", label: "Sky Cyan" },
                          { key: "gold", label: "Gold" },
                          { key: "navy", label: "Navy" },
                          { key: "teal", label: "Teal" },
                          { key: "blue", label: "Blue" },
                          { key: "white", label: "White" },
                        ].map((ic) => (
                          <button
                            key={ic.key}
                            type="button"
                            onClick={() => updateItemField(idx, "iconColor" as any, ic.key)}
                            className={`p-1.5 rounded-xs border text-xs text-center font-medium transition-all cursor-pointer ${
                              ((item as any).iconColor || "gold") === ic.key
                                ? "border-navy-900 bg-white font-bold ring-1 ring-navy-900"
                                : "border-line bg-white/70 hover:bg-white"
                            }`}
                          >
                            {ic.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: DESIGN & STYLE (Universal System Controls)
          ========================================================================= */}
      {tab === "style" && (
        <div className="space-y-4">
          {/* A. HEADLINE TYPOGRAPHY & DESIGN */}
          {elementKey === "headline" && (
            <UniversalTextDesignControls
              label="Main Headline"
              fontFamily={section.headlineFontFamily || "heading"}
              onFontFamilyChange={(val) => updateField("headlineFontFamily", val)}
              fontSize={section.headlineFontSize || "lg"}
              onFontSizeChange={(val) => updateField("headlineFontSize", val)}
              fontWeight={section.headlineFontWeight || "bold"}
              onFontWeightChange={(val) => updateField("headlineFontWeight", val)}
              color={section.headlineColor || "auto"}
              onColorChange={(val) => updateField("headlineColor", val)}
              align={section.headlineAlign || "left"}
              onAlignChange={(val) => updateField("headlineAlign", val)}
              transform={section.headlineTransform || "normal"}
              onTransformChange={(val) => updateField("headlineTransform", val)}
            />
          )}

          {/* B. SUBHEADLINE TYPOGRAPHY & DESIGN */}
          {elementKey === "subheadline" && (
            <UniversalTextDesignControls
              label="Subheadline"
              fontFamily={section.subheadlineFontFamily || "body"}
              onFontFamilyChange={(val) => updateField("subheadlineFontFamily", val)}
              fontSize={section.subheadlineFontSize || "md"}
              onFontSizeChange={(val) => updateField("subheadlineFontSize", val)}
              fontWeight={section.subheadlineFontWeight || "normal"}
              onFontWeightChange={(val) => updateField("subheadlineFontWeight", val)}
              color={section.subheadlineColor || "auto"}
              onColorChange={(val) => updateField("subheadlineColor", val)}
              align={section.subheadlineAlign || "left"}
              onAlignChange={(val) => updateField("subheadlineAlign", val)}
              showTransform={false}
            />
          )}

          {/* C. EYEBROW BADGE DESIGN */}
          {elementKey === "badge" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>Eyebrow Badge Style & Variant</span>
              </strong>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                  Badge Style Variant
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: "navy", label: "Navy Pill", desc: "Dark background with gold/white" },
                    { key: "gold", label: "Luxury Gold", desc: "Gold accent tone" },
                    { key: "live", label: "Live Green", desc: "Accredited / Live indicator" },
                    { key: "default", label: "Light Neutral", desc: "Subtle bordered pill" },
                  ].map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => updateField("badgeVariant", v.key)}
                      className={`p-2 rounded-xs border text-left transition-all cursor-pointer ${
                        (section.badgeVariant || "navy") === v.key
                          ? "border-navy-900 bg-white shadow-xs font-bold ring-1 ring-navy-900"
                          : "border-line bg-white/70 hover:bg-white"
                      }`}
                    >
                      <span className="text-[11px] font-bold block">{v.label}</span>
                      <span className="text-[9px] text-ink-soft block leading-tight">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-line">
                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                  Font Weight
                </label>
                <select
                  value={section.badgeWeight || "semibold"}
                  onChange={(e) => updateField("badgeWeight", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
                >
                  <option value="normal">Normal (400)</option>
                  <option value="medium">Medium (500)</option>
                  <option value="semibold">Semibold (600)</option>
                  <option value="bold">Bold (700)</option>
                </select>
              </div>
            </div>
          )}

          {/* D. PRIMARY BUTTON DESIGN */}
          {elementKey === "button" && (
            <ButtonCustomizerFields
              label="Primary CTA Button Styling"
              buttonText={section.buttonText || ""}
              onButtonTextChange={(val) => updateField("buttonText", val)}
              buttonLink={section.buttonLink}
              onButtonLinkChange={(val) => updateField("buttonLink", val)}
              linkPlaceholder="/book or /courses"
              defaultVariant="primary"
              defaultSize={section.type === "hero" ? "lg" : "md"}
              isDarkContainer={isDark}
              config={{
                bgColor: section.buttonBgColor,
                textColor: section.buttonTextColor,
                fontFamily: section.buttonFontFamily,
                fontWeight: section.buttonFontWeight,
                textTransform: section.buttonTextTransform,
                icon: section.buttonIcon,
                iconPosition: section.buttonIconPosition,
                radius: section.buttonRadius,
                size: section.buttonSize,
              }}
              onChange={(key, val) => {
                const fieldMap: Record<string, keyof BuilderSection> = {
                  bgColor: "buttonBgColor",
                  textColor: "buttonTextColor",
                  fontFamily: "buttonFontFamily",
                  fontWeight: "buttonFontWeight",
                  textTransform: "buttonTextTransform",
                  icon: "buttonIcon",
                  iconPosition: "buttonIconPosition",
                  radius: "buttonRadius",
                  size: "buttonSize",
                };
                if (fieldMap[key]) updateField(fieldMap[key], val);
              }}
            />
          )}

          {/* E. SECONDARY BUTTON DESIGN */}
          {elementKey === "secondaryButton" && (
            <ButtonCustomizerFields
              label="Secondary CTA Button Styling"
              buttonText={section.secondaryButtonText || ""}
              onButtonTextChange={(val) => updateField("secondaryButtonText", val)}
              buttonLink={section.secondaryButtonLink}
              onButtonLinkChange={(val) => updateField("secondaryButtonLink", val)}
              linkPlaceholder="/courses or /funding"
              defaultVariant="outline"
              defaultSize={section.type === "hero" ? "lg" : "md"}
              isDarkContainer={isDark}
              config={{
                bgColor: section.secondaryButtonBgColor,
                textColor: section.secondaryButtonTextColor,
                fontFamily: section.secondaryButtonFontFamily,
                fontWeight: section.secondaryButtonFontWeight,
                textTransform: section.secondaryButtonTextTransform,
                icon: section.secondaryButtonIcon,
                iconPosition: section.secondaryButtonIconPosition,
                radius: section.secondaryButtonRadius,
                size: section.secondaryButtonSize,
              }}
              onChange={(key, val) => {
                const fieldMap: Record<string, keyof BuilderSection> = {
                  bgColor: "secondaryButtonBgColor",
                  textColor: "secondaryButtonTextColor",
                  fontFamily: "secondaryButtonFontFamily",
                  fontWeight: "secondaryButtonFontWeight",
                  textTransform: "secondaryButtonTextTransform",
                  icon: "secondaryButtonIcon",
                  iconPosition: "secondaryButtonIconPosition",
                  radius: "secondaryButtonRadius",
                  size: "secondaryButtonSize",
                };
                if (fieldMap[key]) updateField(fieldMap[key], val);
              }}
            />
          )}

          {/* F. INDIVIDUAL CARD ITEM DESIGN */}
          {elementKey === "item" && section.type === "featured_courses" && (
            <CourseGridCmsControls
              columns={section.columns || 4}
              rows={section.rows || 2}
              courseLimit={section.courseLimit}
              courseCategoryFilter={section.courseCategoryFilter || "all"}
              onColumnsChange={(cols) => updateField("columns", cols)}
              onRowsChange={(rows) => updateField("rows", rows)}
              onCourseLimitChange={(limit) => updateField("courseLimit", limit)}
              onCourseCategoryFilterChange={(cat) => updateField("courseCategoryFilter", cat)}
            />
          )}

          {elementKey === "item" && section.type !== "featured_courses" && (
            (() => {
              const idx = itemIndex ?? 0;
              const items =
                section.items && section.items.length > 0
                  ? section.items
                  : getDefaultItemsForSection(section.type);
              const item =
                items[idx] || {
                  title:
                    section.type === "staff_training"
                      ? `Corporate Benefit #${idx + 1}`
                      : section.type === "coral_promo"
                      ? `Promotional Bullet #${idx + 1}`
                      : `Card #${idx + 1}`,
                  desc: "",
                  icon: "shield-check",
                };

              return (
                <UniversalCardDesignControls
                  item={item}
                  idx={idx}
                  updateItemField={updateItemField}
                />
              );
            })()
          )}

          {/* G. SECTION BACKGROUND & PALETTE */}
          {elementKey === "bg" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>Layout, Palette & Spacing</span>
              </strong>
              <div>
                <ColorPalettePicker
                  value={section.bgColor || "paper"}
                  onChange={(pal) => updateField("bgColor", pal as any)}
                  label="Background Palette & Custom Hue"
                  defaultColor="paper"
                  allowCustomHex={true}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
                <div>
                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                    Column Ratio
                  </label>
                  <select
                    value={section.columnRatio || "60-40"}
                    onChange={(e) => updateField("columnRatio", e.target.value as any)}
                    className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
                  >
                    <option value="60-40">60% Copy / 40% Media</option>
                    <option value="50-50">50% / 50% Equal Split</option>
                    <option value="70-30">70% Copy / 30% Media</option>
                    <option value="40-60">40% Copy / 60% Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                    Vertical Padding
                  </label>
                  <select
                    value={section.paddingDensity || "normal"}
                    onChange={(e) => updateField("paddingDensity", e.target.value as any)}
                    className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
                  >
                    <option value="compact">Compact (py-10)</option>
                    <option value="normal">Normal (py-16)</option>
                    <option value="spacious">Spacious (py-24)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* H. TAGS & BENEFIT BADGES STYLE */}
          {elementKey === "tags" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>Benefit Badges Styling</span>
              </strong>
              <p className="text-xs text-ink-soft">
                Each badge can be individually customized under the Content tab with Navy, Gold, Live Green, or Neutral styling variants.
              </p>
            </div>
          )}

          {/* I. IMAGE STYLE */}
          {elementKey === "image" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>Media Frame & Corner Styling</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Corner Radius (PRD Section 7)
                </label>
                <p className="text-xs text-ink-soft">
                  Images follow the standard 16px signature curvature with subtle shadow for crisp presentation.
                </p>
              </div>
            </div>
          )}

          {/* J. VIDEO STYLE */}
          {elementKey === "video" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>Spotlight Video Player Styling</span>
              </strong>
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Player Frame
                </label>
                <p className="text-xs text-ink-soft">
                  The spotlight player dynamically switches between high-performance click-to-load thumbnail cards and live interactive streaming overlays.
                </p>
              </div>
            </div>
          )}

          {/* K. FLOATING BADGE STYLE */}
          {elementKey === "floatingBadge" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>
                  {section.type === "staff_training"
                    ? "Corporate Metrics Banner Appearance"
                    : "Floating Badge Appearance"}
                </span>
              </strong>
              <div className="p-2.5 bg-white rounded-xs border border-line flex items-center gap-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-white flex items-center justify-center shrink-0">
                  <Icon
                    name={
                      section.type === "staff_training"
                        ? ((section.metricsBannerIcon as any) || "award")
                        : ((section.floatingBadgeIcon as any) || "star")
                    }
                    size={16}
                    className="text-gold-500"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-heading font-bold text-xs text-navy-900 block leading-tight truncate">
                    {section.type === "staff_training"
                      ? section.metricsBannerTitle || "50+ UK Care & Education Providers"
                      : section.floatingBadgeTitle || "Live Evening Sessions"}
                  </span>
                  <span className="text-[10px] text-ink-soft block leading-tight truncate">
                    {section.type === "staff_training"
                      ? section.metricsBannerSubtitle || "Compliant with CQC regulations & Ofsted"
                      : section.floatingBadgeSubtitle || "Recordings available 24/7 to rewatch"}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-gold-700 bg-gold-300/30 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                  Live Preview
                </span>
              </div>
            </div>
          )}

          {/* L. WATCH VIDEO SEAL BADGE STYLING */}
          {elementKey === "sealBadge" && (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-4 shadow-2xs">
              <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
                <Icon name="sparkles" size={13} className="text-gold-500" />
                <span>Seal Badge Colors & Typography</span>
              </strong>

              {/* Circle Fill Palette */}
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                  Seal Circle Background
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: "#074C4E", label: "Signature Teal", bg: "bg-[#074C4E]" },
                    { key: "#23216B", label: "Royal Navy 900", bg: "bg-navy-900" },
                    { key: "#D9B84A", label: "Luxury Gold", bg: "bg-gold-500" },
                    { key: "#FF5722", label: "Coral Vibrant", bg: "bg-[#FF5722]" },
                    { key: "#1B1B2B", label: "Dark Ink", bg: "bg-ink" },
                    { key: "#FFFFFF", label: "Crisp White", bg: "bg-white" },
                  ].map((col) => (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => updateField("sealBgColor", col.key)}
                      className={`p-2 rounded-xs border text-left transition-all cursor-pointer ${
                        (section.sealBgColor || "#074C4E") === col.key
                          ? "border-navy-900 bg-white shadow-xs font-bold ring-1 ring-navy-900"
                          : "border-line bg-white/70 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          style={{ backgroundColor: col.key }}
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                        />
                        <span className="text-[11px] font-medium leading-none">{col.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Tone */}
              <div className="pt-2 border-t border-line">
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                  Rotating Text Tone
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: "#ffffff", label: "Pure White" },
                    { key: "#D9B84A", label: "Gold 500" },
                    { key: "#23216B", label: "Navy 900" },
                  ].map((tc) => (
                    <button
                      key={tc.key}
                      type="button"
                      onClick={() => updateField("sealTextColor", tc.key)}
                      className={`p-1.5 rounded-xs border text-xs text-center transition-all cursor-pointer ${
                        (section.sealTextColor || "#ffffff") === tc.key
                          ? "border-navy-900 bg-white font-bold ring-1 ring-navy-900"
                          : "border-line bg-white/70 hover:bg-white"
                      }`}
                    >
                      {tc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Play Icon Tone */}
              <div className="pt-2 border-t border-line">
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                  Center Play Icon Color
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: "#074C4E", label: "Teal (Default)" },
                    { key: "#FF5722", label: "Coral Accent" },
                    { key: "#23216B", label: "Navy 900" },
                  ].map((pc) => (
                    <button
                      key={pc.key}
                      type="button"
                      onClick={() => updateField("sealPlayColor", pc.key)}
                      className={`p-1.5 rounded-xs border text-xs text-center transition-all cursor-pointer ${
                        (section.sealPlayColor || "#074C4E") === pc.key
                          ? "border-navy-900 bg-white font-bold ring-1 ring-navy-900"
                          : "border-line bg-white/70 hover:bg-white"
                      }`}
                    >
                      {pc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Scale */}
              <div className="pt-2 border-t border-line">
                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                  Circular Font Size Scale
                </label>
                <select
                  value={section.sealFontSize || "7"}
                  onChange={(e) => updateField("sealFontSize", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-line rounded-xs bg-white font-medium"
                >
                  <option value="6">6px (Compact)</option>
                  <option value="7">7px (Standard Balanced)</option>
                  <option value="8">8px (Emphasized)</option>
                  <option value="9">9px (Large Bold)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Done Editing Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 bg-navy-900 hover:bg-navy-800 text-gold-300 rounded-sm text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icon name="check" size={13} />
          <span>Done Editing — Return to Block Overview</span>
        </button>
      </div>

      {/* College Media Library & Upload Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        currentValue={
          mediaTargetField?.type === "section"
            ? section.image
            : mediaTargetField?.type === "item" && typeof mediaTargetField.itemIdx === "number"
            ? section.items?.[mediaTargetField.itemIdx]?.image
            : ""
        }
        onSelect={(url) => {
          if (mediaTargetField?.type === "section") {
            updateField("image", url);
          } else if (mediaTargetField?.type === "item" && typeof mediaTargetField.itemIdx === "number") {
            updateItemField(mediaTargetField.itemIdx, "image", url);
          }
          setMediaModalOpen(false);
        }}
      />
    </div>
  );
};
