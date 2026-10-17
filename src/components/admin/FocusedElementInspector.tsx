"use client";

import React from "react";
import { BuilderSection, BuilderSectionItem } from "@/lib/repositories/seedData";
import { Icon, IconName } from "@/components/ui/Icon";
import { ButtonCustomizerFields } from "@/components/admin/ButtonCustomizerFields";
import { ImageDropzone } from "@/components/ui/ImageDropzone";

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
    | "floatingBadge";
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
          Focus Mode
        </span>
      </div>

      {/* 1. HERO FLOATING LIVE SESSIONS BADGE */}
      {elementKey === "floatingBadge" && (
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
              {/* Live Mini Preview Box */}
              <div className="p-2.5 bg-white rounded-xs border border-line flex items-center gap-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-white flex items-center justify-center shrink-0">
                  <Icon
                    name={(section.floatingBadgeIcon as any) || "star"}
                    size={16}
                    className="text-gold-500"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-heading font-bold text-xs text-navy-900 block leading-tight truncate">
                    {section.floatingBadgeTitle || "Live Evening Sessions"}
                  </span>
                  <span className="text-[10px] text-ink-soft block leading-tight truncate">
                    {section.floatingBadgeSubtitle || "Recordings available 24/7 to rewatch"}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-gold-700 bg-gold-300/30 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                  Live Preview
                </span>
              </div>

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
                  Badge Subtitle / Caption
                </label>
                <input
                  type="text"
                  value={section.floatingBadgeSubtitle ?? "Recordings available 24/7 to rewatch"}
                  onChange={(e) => updateField("floatingBadgeSubtitle", e.target.value)}
                  placeholder="e.g. Recordings available 24/7 to rewatch"
                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                  Badge SVG Line Icon
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { name: "star", label: "Star" },
                    { name: "video", label: "Video" },
                    { name: "clock", label: "Clock" },
                    { name: "calendar", label: "Calendar" },
                    { name: "graduation-cap", label: "Academic" },
                    { name: "sparkles", label: "Sparkles" },
                    { name: "users", label: "Tutors" },
                    { name: "book-open", label: "Study" },
                    { name: "shield-check", label: "Shield" },
                    { name: "check-circle", label: "Check" },
                    { name: "play", label: "Play" },
                    { name: "bell", label: "Bell" },
                  ].map((ic) => {
                    const active = (section.floatingBadgeIcon || "star") === ic.name;
                    return (
                      <button
                        key={ic.name}
                        type="button"
                        onClick={() => updateField("floatingBadgeIcon", ic.name)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xs border text-[10px] transition-all cursor-pointer ${
                          active
                            ? "bg-navy-900 text-gold-300 border-navy-900 shadow-xs ring-1 ring-gold-500"
                            : "bg-white text-ink-soft border-line hover:border-navy-900/40"
                        }`}
                      >
                        <Icon
                          name={ic.name as any}
                          size={16}
                          className={active ? "text-gold-500" : "text-navy-900"}
                        />
                        <span className="mt-1 truncate max-w-full font-medium">
                          {ic.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. PRIMARY CTA BUTTON */}
      {elementKey === "button" && (
        <ButtonCustomizerFields
          label="Primary CTA Button"
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

      {/* 3. SECONDARY CTA BUTTON */}
      {elementKey === "secondaryButton" && (
        <ButtonCustomizerFields
          label="Secondary CTA Button"
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

      {/* 4. MAIN HEADLINE & TYPOGRAPHY */}
      {elementKey === "headline" && (
        <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
            <Icon name="file-text" size={13} className="text-navy-900" />
            <span>Main Headline & Typography</span>
          </strong>
          <div>
            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
              Headline Copy
            </label>
            <textarea
              rows={3}
              value={section.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold focus:outline-none focus:border-navy-900 bg-white leading-snug"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line">
            <div>
              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                Font Family
              </label>
              <select
                value={section.headlineFontFamily || "heading"}
                onChange={(e) => updateField("headlineFontFamily", e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white font-medium"
              >
                <option value="heading">Saira Condensed (Heading)</option>
                <option value="body">Source Sans 3 (Body)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                Font Size
              </label>
              <select
                value={section.headlineFontSize || "lg"}
                onChange={(e) => updateField("headlineFontSize", e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large (Default)</option>
                <option value="xl">Extra Large</option>
                <option value="2xl">Hero Mega</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                Font Weight
              </label>
              <select
                value={section.headlineFontWeight || "bold"}
                onChange={(e) => updateField("headlineFontWeight", e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold (700)</option>
                <option value="extrabold">Extrabold</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                Color Preset
              </label>
              <select
                value={section.headlineColor || "auto"}
                onChange={(e) => updateField("headlineColor", e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
              >
                <option value="auto">Adaptive Auto</option>
                <option value="navy">Navy 900</option>
                <option value="gold">Gold 500</option>
                <option value="white">White</option>
                <option value="ink_soft">Soft Charcoal</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBHEADLINE & TYPOGRAPHY */}
      {elementKey === "subheadline" && (
        <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
            <Icon name="file-text" size={13} className="text-navy-900" />
            <span>Subheadline Copy & Typography</span>
          </strong>
          <div>
            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
              Subheadline Copy
            </label>
            <textarea
              rows={3}
              value={section.subheadline}
              onChange={(e) => updateField("subheadline", e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm text-xs leading-relaxed focus:outline-none focus:border-navy-900 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line">
            <div>
              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                Font Family
              </label>
              <select
                value={section.subheadlineFontFamily || "body"}
                onChange={(e) => updateField("subheadlineFontFamily", e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
              >
                <option value="body">Source Sans 3 (Body Default)</option>
                <option value="heading">Saira Condensed (Heading Style)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                Font Size
              </label>
              <select
                value={section.subheadlineFontSize || "md"}
                onChange={(e) => updateField("subheadlineFontSize", e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
              >
                <option value="sm">Small</option>
                <option value="md">Medium (Default)</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                Font Weight
              </label>
              <select
                value={section.subheadlineFontWeight || "normal"}
                onChange={(e) => updateField("subheadlineFontWeight", e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
              >
                <option value="normal">Normal (400)</option>
                <option value="medium">Medium (500)</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                Color Preset
              </label>
              <select
                value={section.subheadlineColor || "auto"}
                onChange={(e) => updateField("subheadlineColor", e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white"
              >
                <option value="auto">Adaptive Auto</option>
                <option value="navy">Navy 900</option>
                <option value="gold">Gold 500</option>
                <option value="white">White</option>
                <option value="ink_soft">Soft Charcoal</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 6. EYEBROW BADGE */}
      {elementKey === "badge" && (
        <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
            <Icon name="sparkles" size={13} className="text-gold-500" />
            <span>Eyebrow / Badge Text</span>
          </strong>
          <div>
            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
              Eyebrow Copy
            </label>
            <input
              type="text"
              value={section.badgeText || ""}
              onChange={(e) => updateField("badgeText", e.target.value)}
              className="w-full px-3 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
            />
          </div>
        </div>
      )}

      {/* 7. TOP TAGS & BENEFIT BADGES */}
      {elementKey === "tags" && (
        <div className="p-3.5 bg-paper rounded-sm border border-line space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
              <Icon name="layers" size={13} className="text-navy-900" />
              <span>Top Hero Benefit Badges ({(section.tags || []).length})</span>
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
                  className="text-[11px] px-2 py-1 border border-line rounded-xs bg-paper font-medium"
                >
                  <option value="live">Live (Pulsing Red)</option>
                  <option value="navy">Navy</option>
                  <option value="gold">Gold</option>
                  <option value="default">Default</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const updated = arr.filter((_, idx) => idx !== tIdx);
                    updateField("tags", updated);
                  }}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                  title="Delete Tag"
                >
                  <Icon name="trash" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PHOTOGRAPH / SHOWCASE IMAGE */}
      {elementKey === "image" && (
        <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
            <Icon name="layers" size={13} className="text-navy-900" />
            <span>Photograph / Image Showcase</span>
          </strong>
          <ImageDropzone
            value={section.image}
            onChange={(url) => updateField("image", url)}
            label="Drop New Image From Desktop"
            helperText="PNG, JPG, or WebP. Replaces image immediately."
            previewHeight={130}
          />
          <div className="space-y-1.5 pt-1">
            <label className="block text-[10px] font-semibold text-ink-soft uppercase tracking-wider">
              Official college stock photographs:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLLEGE_STOCK_IMAGES.map((img) => (
                <button
                  key={img.path}
                  type="button"
                  onClick={() => updateField("image", img.path)}
                  className={`relative aspect-[16/9] rounded-sm overflow-hidden border-2 transition-all cursor-pointer ${
                    section.image === img.path
                      ? "border-gold-500 shadow-md ring-2 ring-gold-500/20"
                      : "border-line opacity-70 hover:opacity-100"
                  }`}
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
      )}

      {/* 9. VIDEO SPOTLIGHT */}
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

      {/* 10. BACKGROUND PALETTE & LAYOUT */}
      {elementKey === "bg" && (
        <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 border-b border-line pb-2">
            <Icon name="sparkles" size={13} className="text-gold-500" />
            <span>Layout, Palette & Spacing</span>
          </strong>
          <div>
            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
              Background Palette
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "paper", label: "Parchment Paper" },
                { key: "white", label: "Crisp White" },
                { key: "navy", label: "Royal Navy" },
                { key: "slate", label: "Deep Slate" },
                { key: "cream", label: "Warm Cream" },
                { key: "sage", label: "Muted Sage" },
              ].map((pal) => (
                <button
                  key={pal.key}
                  type="button"
                  onClick={() => updateField("bgColor", pal.key as any)}
                  className={`p-2 rounded-xs border text-xs font-medium text-left transition-all cursor-pointer ${
                    (section.bgColor || "paper") === pal.key
                      ? "border-navy-900 bg-white shadow-xs font-bold ring-1 ring-navy-900"
                      : "border-line bg-white/70 hover:bg-white"
                  }`}
                >
                  {pal.label}
                </button>
              ))}
            </div>
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

      {/* 11. INDIVIDUAL CHILD ITEM (Cards, FAQs, Accreditations, Pathways, Timeline Steps, Reviews, Pricing) */}
      {elementKey === "item" && section.items && (
        (() => {
          const idx = itemIndex ?? 0;
          const item = section.items[idx];
          if (!item) return <p className="text-xs text-ink-soft">Item not found</p>;

          return (
            <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <Icon name="check-circle" size={13} className="text-gold-500" />
                  <span>
                    {section.type === "choose_path"
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

              {/* Number / Step Identifier (if applicable) */}
              {(item.number !== undefined || section.type === "how_it_works" || section.type === "pricing") && (
                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                    Step / Option Number
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

              {/* Primary Title / Name */}
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  {section.type === "testimonials"
                    ? "Student / Graduate Name"
                    : section.type === "faq_accordion"
                    ? "Question"
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

              {/* Subtitle / Role / Status */}
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  {section.type === "testimonials"
                    ? "Course Completed / Current Job Title"
                    : section.type === "choose_path"
                    ? "Target Role / Career Destination"
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

              {/* Description / Feedback Quote / Details */}
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  {section.type === "testimonials"
                    ? "Student Review Quote"
                    : section.type === "faq_accordion"
                    ? "Answer Content"
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
                    Pill Badge / Level
                  </label>
                  <input
                    type="text"
                    value={item.badge || ""}
                    onChange={(e) => updateItemField(idx, "badge", e.target.value)}
                    placeholder="e.g. Levels 2–5, Best Value"
                    className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                    Category Tag / Status
                  </label>
                  <input
                    type="text"
                    value={item.tag || ""}
                    onChange={(e) => updateItemField(idx, "tag", e.target.value)}
                    placeholder="e.g. Funded, Accredited"
                    className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                  />
                </div>
              </div>

              {/* Star Rating (For Testimonials/Reviews) */}
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

              {/* SVG Line Icon Selector (for Choose Your Path, Timeline, Feature cards) */}
              {section.type !== "testimonials" && section.type !== "faq_accordion" && (
                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                    Card Line Icon
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center shrink-0">
                      <Icon
                        name={(item.icon as IconName) || "shield-check"}
                        size={16}
                        className="text-gold-500"
                      />
                    </div>
                    <select
                      value={item.icon || "shield-check"}
                      onChange={(e) => updateItemField(idx, "icon", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium"
                    >
                      <option value="shield-check">Shield Check (Regulated / Accreditation)</option>
                      <option value="graduation-cap">Graduation Cap (Higher Degree / AET)</option>
                      <option value="book-open">Open Book (Curriculum / Administration)</option>
                      <option value="user">User / Learner (Early Years / Care)</option>
                      <option value="clock">Clock (Fast Track / 1-Day CPD)</option>
                      <option value="star">Star (Tutoring / Premium)</option>
                      <option value="check-circle">Check Circle (Standard Feature)</option>
                      <option value="sparkles">Sparkles (Accredited)</option>
                      <option value="video">Video (Online Live Sessions)</option>
                      <option value="calendar">Calendar (Flexible Schedule)</option>
                      <option value="phone">Phone (Free Advisory Call)</option>
                      <option value="award">Award Ribbon (Accredited)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Link Destination URL */}
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

              {/* Photo / Avatar / Logo Dropzone */}
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
              </div>

              {/* Bullet Points List (For Pricing Cards & Feature Highlights) */}
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
            </div>
          );
        })()
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
    </div>
  );
};
