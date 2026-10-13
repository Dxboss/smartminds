"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BuilderSection,
  CompositeWidget,
  CompositeColumn,
} from "@/lib/repositories/seedData";
import { Container } from "@/components/ui/Container";
import { Icon, IconName } from "@/components/ui/Icon";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { ArcMask } from "@/components/ui/ArcMask";
import { ConsentGuard } from "@/components/consent/ConsentGuard";

interface Props {
  section: BuilderSection;
  isEditor?: boolean;
  onSelectElement?: (elementKey: any, itemIndex?: number) => void;
}

export const CompositeBlockRenderer: React.FC<Props> = ({
  section,
  isEditor = false,
  onSelectElement,
}) => {
  const isNavy = section.bgColor === "navy";
  const isPaper = section.bgColor === "paper";
  const isCream = section.bgColor === "cream";

  const bgClass = isNavy
    ? "bg-navy-900 text-white"
    : isCream
    ? "bg-gold-50/70 text-ink border-y border-gold-200"
    : isPaper
    ? "bg-paper text-ink"
    : "bg-white text-ink";

  const paddingClass =
    section.paddingDensity === "compact"
      ? "py-8 sm:py-10"
      : section.paddingDensity === "spacious"
      ? "py-16 sm:py-24"
      : "py-12 sm:py-16";

  const columns = section.columns || 2;
  const ratio = section.columnRatio || "60-40";

  // Compute column spans for 2-column layouts
  const get2ColSpans = (colIdx: number) => {
    if (ratio === "50-50") return "lg:col-span-6";
    if (ratio === "70-30") return colIdx === 0 ? "lg:col-span-8" : "lg:col-span-4";
    if (ratio === "40-60") return colIdx === 0 ? "lg:col-span-5" : "lg:col-span-7";
    if (ratio === "33-67") return colIdx === 0 ? "lg:col-span-4" : "lg:col-span-8";
    // Default 60-40
    return colIdx === 0 ? "lg:col-span-7" : "lg:col-span-5";
  };

  // Safe fallback if compositeColumns is empty
  const rawColumns: CompositeColumn[] =
    section.compositeColumns && section.compositeColumns.length > 0
      ? section.compositeColumns
      : Array.from({ length: columns }).map((_, i) => ({
          id: `col-${i + 1}`,
          widgets: [],
        }));

  return (
    <section className={`${bgClass} ${paddingClass} relative transition-colors`}>
      <Container>
        {/* Section Header (Optional) */}
        {(section.headline || section.badgeText) && (
          <div
            className={`max-w-3xl mb-10 ${
              section.align === "center" ? "mx-auto text-center" : ""
            }`}
          >
            {section.badgeText && (
              <div
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("badge");
                  }
                }}
                className={`inline-block mb-2 ${
                  isEditor
                    ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500"
                    : ""
                }`}
              >
                <Eyebrow tone={isNavy ? "gold" : "navy"}>
                  {section.badgeText}
                </Eyebrow>
              </div>
            )}

            {section.headline && (
              <Heading
                level="h2"
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("headline");
                  }
                }}
                className={`mb-3 ${isNavy ? "text-white" : "text-navy-900"} ${
                  isEditor
                    ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500"
                    : ""
                }`}
              >
                {section.headline}
              </Heading>
            )}

            {section.subheadline && (
              <p
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("subheadline");
                  }
                }}
                className={`text-sm sm:text-base leading-relaxed ${
                  isNavy ? "text-paper/85" : "text-ink-soft"
                } ${
                  isEditor
                    ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500"
                    : ""
                }`}
              >
                {section.subheadline}
              </p>
            )}
          </div>
        )}

        {/* Dynamic Responsive Columns Grid */}
        <div
          className={`grid gap-8 items-start ${
            columns === 1
              ? "grid-cols-1"
              : columns === 2
              ? "grid-cols-1 lg:grid-cols-12"
              : columns === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {rawColumns.map((col, colIdx) => {
            const colSpanClass =
              columns === 2 ? get2ColSpans(colIdx) : "w-full";

            return (
              <div
                key={col.id || colIdx}
                className={`${colSpanClass} space-y-5 flex flex-col justify-start`}
              >
                {col.widgets && col.widgets.length > 0 ? (
                  col.widgets.map((widget, wIdx) => (
                    <MicroWidgetRenderer
                      key={widget.id || wIdx}
                      widget={widget}
                      isDark={isNavy}
                      isEditor={isEditor}
                      onSelect={() => {
                        if (isEditor && onSelectElement) {
                          onSelectElement(`composite_widget_${colIdx}_${wIdx}`);
                        }
                      }}
                    />
                  ))
                ) : (
                  <div
                    className={`p-6 border-2 border-dashed rounded-md text-center ${
                      isDarkBorder(isNavy)
                    }`}
                  >
                    <p className="text-xs text-ink-soft">
                      Empty Column {colIdx + 1}
                    </p>
                    {isEditor && (
                      <span className="text-[10px] text-navy-900 font-bold underline mt-1 block">
                        + Add Micro-Widget in Inspector
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

function isDarkBorder(isNavy: boolean) {
  return isNavy
    ? "border-white/20 bg-white/5 text-paper/70"
    : "border-line bg-white/50 text-ink-soft";
}

// ============================================================================
// Micro-Widget Components (Atomic Elements)
// ============================================================================

interface MicroWidgetProps {
  widget: CompositeWidget;
  isDark: boolean;
  isEditor?: boolean;
  onSelect?: () => void;
}

const MicroWidgetRenderer: React.FC<MicroWidgetProps> = ({
  widget,
  isDark,
  isEditor = false,
  onSelect,
}) => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const wrapperClass = isEditor
    ? "cursor-pointer group/mw relative rounded-sm hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500 transition-all p-1 -m-1"
    : "";

  return (
    <div onClick={onSelect} className={wrapperClass}>
      {/* Editor Badge */}
      {isEditor && (
        <span className="hidden group-hover/mw:inline-flex absolute -top-3.5 right-2 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap uppercase">
          {widget.type} ✎
        </span>
      )}

      {/* 1. TEXT BLOCK */}
      {widget.type === "text" && (
        <div className={`space-y-2 text-${widget.align || "left"}`}>
          {widget.eyebrow && (
            <Eyebrow tone={isDark ? "gold" : "navy"}>{widget.eyebrow}</Eyebrow>
          )}
          {widget.title && (
            <h3
              className={`font-heading text-xl sm:text-2xl font-bold ${
                isDark ? "text-white" : "text-navy-900"
              }`}
            >
              {widget.title}
            </h3>
          )}
          {widget.content && (
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? "text-paper/85" : "text-ink-soft"
              }`}
            >
              {widget.content}
            </p>
          )}
        </div>
      )}

      {/* 2. ICON BOX */}
      {widget.type === "icon_box" && (
        <div
          className={`p-4 sm:p-5 rounded-md border transition-all ${
            isDark
              ? "bg-white/5 border-white/10 text-white shadow-xs"
              : "bg-white border-line shadow-subtle text-ink"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-sm shrink-0 ${
                isDark ? "bg-white/10 text-gold-300" : "bg-gold-50 text-navy-900"
              }`}
            >
              <Icon
                name={(widget.icon as IconName) || "shield-check"}
                size={20}
              />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <strong
                  className={`text-sm sm:text-base font-bold leading-tight block ${
                    isDark ? "text-white" : "text-navy-900"
                  }`}
                >
                  {widget.title || "Accredited Qualification Standard"}
                </strong>
                {widget.badge && (
                  <Tag variant={isDark ? "gold" : "navy"}>
                    {widget.badge}
                  </Tag>
                )}
              </div>
              {widget.content && (
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? "text-paper/80" : "text-ink-soft"
                  }`}
                >
                  {widget.content}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. IMAGE BOX */}
      {widget.type === "image" && (
        <div className="relative overflow-hidden rounded-lg group">
          {widget.useArcMask ? (
            <ArcMask>
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={widget.imageUrl || "/images/adult-care-training.jpg"}
                  alt={widget.imageAlt || "Smartminds College training"}
                  fill
                  className="object-cover"
                />
              </div>
            </ArcMask>
          ) : (
            <div
              className={`relative w-full rounded-md overflow-hidden border ${
                isDark ? "border-white/10" : "border-line"
              } ${
                widget.aspectRatio === "portrait"
                  ? "aspect-[3/4]"
                  : widget.aspectRatio === "square"
                  ? "aspect-square"
                  : widget.aspectRatio === "wide"
                  ? "aspect-[21/9]"
                  : "aspect-video"
              }`}
            >
              <Image
                src={widget.imageUrl || "/images/adult-care-training.jpg"}
                alt={widget.imageAlt || "Smartminds training"}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. ACTION CTA BUTTONS */}
      {widget.type === "cta_button" && (
        <div className="flex flex-wrap gap-3 items-center pt-1">
          {widget.buttonText && (
            <Link
              href={widget.buttonLink || "/book"}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-sm text-xs font-bold transition-all ${
                isDark
                  ? "bg-gold-500 hover:bg-gold-300 text-navy-900 shadow-xs"
                  : "bg-navy-900 hover:bg-navy-800 text-white shadow-xs"
              }`}
            >
              <span>{widget.buttonText}</span>
              <Icon name="arrow-right" size={13} className="ml-1.5" />
            </Link>
          )}

          {widget.secondaryButtonText && (
            <Link
              href={widget.secondaryButtonLink || "/courses"}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-sm text-xs font-semibold border transition-all ${
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-line text-navy-900 hover:bg-paper"
              }`}
            >
              <span>{widget.secondaryButtonText}</span>
            </Link>
          )}
        </div>
      )}

      {/* 5. LEAD FORM BOX */}
      {widget.type === "lead_form" && (
        <div
          className={`p-6 rounded-lg border shadow-subtle space-y-4 ${
            isDark ? "bg-navy-950/80 border-navy-800" : "bg-white border-line"
          }`}
        >
          <div>
            <span
              className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                isDark ? "text-gold-300" : "text-gold-700"
              }`}
            >
              Fast Admissions Enquiry
            </span>
            <h4
              className={`font-heading text-lg sm:text-xl font-bold mt-0.5 ${
                isDark ? "text-white" : "text-navy-900"
              }`}
            >
              {widget.title || "Speak with an Academic Advisor"}
            </h4>
            {widget.subtitle && (
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isDark ? "text-paper/75" : "text-ink-soft"
                }`}
              >
                {widget.subtitle}
              </p>
            )}
          </div>

          {formSubmitted ? (
            <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-center space-y-1">
              <Icon name="check-circle" size={20} className="mx-auto text-emerald-600" />
              <strong className="block font-bold">Enquiry Received</strong>
              <p>An adviser will contact you within 24 hours.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isEditor) setFormSubmitted(true);
              }}
              className="space-y-3 text-xs"
            >
              {widget.formFields?.showName !== false && (
                <div>
                  <label
                    className={`block text-[11px] font-semibold mb-1 ${
                      isDark ? "text-paper/90" : "text-ink"
                    }`}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    disabled={isEditor}
                    className={`w-full px-3 py-2 rounded-sm border ${
                      isDark
                        ? "bg-navy-900 border-navy-700 text-white placeholder-white/40"
                        : "bg-paper border-line text-ink"
                    }`}
                  />
                </div>
              )}

              {widget.formFields?.showPhone !== false && (
                <div>
                  <label
                    className={`block text-[11px] font-semibold mb-1 ${
                      isDark ? "text-paper/90" : "text-ink"
                    }`}
                  >
                    UK Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="07700 900..."
                    disabled={isEditor}
                    className={`w-full px-3 py-2 rounded-sm border ${
                      isDark
                        ? "bg-navy-900 border-navy-700 text-white placeholder-white/40"
                        : "bg-paper border-line text-ink"
                    }`}
                  />
                </div>
              )}

              {widget.formFields?.showEmail !== false && (
                <div>
                  <label
                    className={`block text-[11px] font-semibold mb-1 ${
                      isDark ? "text-paper/90" : "text-ink"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    disabled={isEditor}
                    className={`w-full px-3 py-2 rounded-sm border ${
                      isDark
                        ? "bg-navy-900 border-navy-700 text-white placeholder-white/40"
                        : "bg-paper border-line text-ink"
                    }`}
                  />
                </div>
              )}

              {widget.formFields?.showCourse !== false && (
                <div>
                  <label
                    className={`block text-[11px] font-semibold mb-1 ${
                      isDark ? "text-paper/90" : "text-ink"
                    }`}
                  >
                    Course of Interest
                  </label>
                  <select
                    disabled={isEditor}
                    className={`w-full px-3 py-2 rounded-sm border ${
                      isDark
                        ? "bg-navy-900 border-navy-700 text-white"
                        : "bg-paper border-line text-ink"
                    }`}
                  >
                    <option>Diploma in Adult Care (Level 3)</option>
                    <option>Leadership in Adult Care (Level 5)</option>
                    <option>Early Years Educator (Level 3)</option>
                    <option>Education & Training (Level 3/4/5)</option>
                    <option>CPD Mandatory Training</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isEditor}
                className="w-full py-2.5 px-4 rounded-sm bg-gold-500 hover:bg-gold-400 text-navy-900 font-heading font-bold text-sm transition-colors mt-2"
              >
                {widget.buttonText || widget.formFields?.buttonLabel || "Request Advice Call"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 6. VIDEO PLAYER */}
      {widget.type === "video_player" && (
        <div className="rounded-lg overflow-hidden border border-line bg-navy-900 aspect-video relative">
          <ConsentGuard
            category="marketing"
            fallbackTitle="Video Consent Required"
            fallbackDescription="Cookie consent required for video player embed."
          >
            <iframe
              src={widget.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
              title={widget.title || "Video Player"}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </ConsentGuard>
        </div>
      )}

      {/* 7. DIVIDER */}
      {widget.type === "divider" && (
        <div className="py-2">
          <hr
            className={`border-t ${
              isDark ? "border-white/15" : "border-line"
            }`}
          />
        </div>
      )}
    </div>
  );
};
