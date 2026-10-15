import React from "react";

export interface AccreditationLogoProps {
  variant?: "light" | "dark" | "compact";
  className?: string;
}

/**
 * High-fidelity vector logo badges for UK accredited awarding organisations
 * and regulatory frameworks (Ofqual, TQUK, Focus Awards, CPD Group, Skills for Health, UKRLP).
 */
export const OfqualLogo: React.FC<{ variant?: "light" | "dark" | "compact" }> = ({
  variant = "light",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm border transition-all ${
        isDark
          ? "bg-white/5 border-white/10 hover:border-gold-500/40 text-white"
          : "bg-white border-line shadow-xs hover:border-navy-900/30 text-navy-900"
      }`}
      title="Ofqual Regulated - Office of Qualifications and Examinations Regulation"
    >
      {/* Royal Crown insignia */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-gold-300" : "text-navy-900"}`}
        aria-hidden="true"
      >
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-black text-xs sm:text-sm tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          ofqual
        </span>
        <span
          className={`font-mono text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-gold-300" : "text-navy-700"
          }`}
        >
          Regulated
        </span>
      </div>
    </div>
  );
};

export const TqukLogo: React.FC<{ variant?: "light" | "dark" | "compact" }> = ({
  variant = "light",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm border transition-all ${
        isDark
          ? "bg-white/5 border-white/10 hover:border-gold-500/40 text-white"
          : "bg-white border-line shadow-xs hover:border-navy-900/30 text-navy-900"
      }`}
      title="Training Qualifications UK (TQUK) - Recognised Awarding Organisation"
    >
      {/* TQUK Quad-Diamond Geometric Emblem */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-gold-300" : "text-navy-900"}`}
        aria-hidden="true"
      >
        <path d="M12 2L6 8l6 6 6-6-6-6zM6 10l-4 4 4 4 4-4-4-4zm12 0l-4 4 4 4 4-4-4-4zm-6 6l-4 4 4 4 4-4-4-4z" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-black text-xs sm:text-sm tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          TQUK
        </span>
        <span
          className={`font-mono text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-white/70" : "text-ink-soft"
          }`}
        >
          Approved Centre
        </span>
      </div>
    </div>
  );
};

export const CpdGroupLogo: React.FC<{ variant?: "light" | "dark" | "compact" }> = ({
  variant = "light",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm border transition-all ${
        isDark
          ? "bg-white/5 border-white/10 hover:border-gold-500/40 text-white"
          : "bg-white border-line shadow-xs hover:border-navy-900/30 text-navy-900"
      }`}
      title="The CPD Group - Accredited Continuing Professional Development"
    >
      {/* CPD Star Shield */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-gold-300" : "text-navy-900"}`}
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-black text-xs sm:text-sm tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          THE CPD GROUP
        </span>
        <span
          className={`font-mono text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-gold-300" : "text-navy-800"
          }`}
        >
          Accredited Provider
        </span>
      </div>
    </div>
  );
};

export const SkillsForHealthLogo: React.FC<{ variant?: "light" | "dark" | "compact" }> = ({
  variant = "light",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm border transition-all ${
        isDark
          ? "bg-white/5 border-white/10 hover:border-gold-500/40 text-white"
          : "bg-white border-line shadow-xs hover:border-navy-900/30 text-navy-900"
      }`}
      title="Skills for Health - National Occupational Standards Mapped"
    >
      {/* Healthcare Cross in Circle */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" strokeWidth="2.5" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-bold text-xs sm:text-sm tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          Skills for Health
        </span>
        <span
          className={`font-mono text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-white/70" : "text-ink-soft"
          }`}
        >
          NOS Aligned
        </span>
      </div>
    </div>
  );
};

export const UkrlpLogo: React.FC<{ variant?: "light" | "dark" | "compact" }> = ({
  variant = "light",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm border transition-all ${
        isDark
          ? "bg-white/5 border-white/10 hover:border-gold-500/40 text-white"
          : "bg-white border-line shadow-xs hover:border-navy-900/30 text-navy-900"
      }`}
      title="UK Register of Learning Providers (UKRLP) - Verified Provider Status"
    >
      {/* UKRLP Stamp */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-gold-300" : "text-navy-900"}`}
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-black text-xs sm:text-sm tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          UKRLP
        </span>
        <span
          className={`font-mono text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-gold-300" : "text-navy-700"
          }`}
        >
          Registered Provider
        </span>
      </div>
    </div>
  );
};

export interface AccreditationBadgeItem {
  title: string;
  desc?: string;
  icon?: string;
  tag?: string;
  image?: string;
  link?: string;
}

export const DynamicAccreditationBadge: React.FC<{
  item: AccreditationBadgeItem;
  variant?: "light" | "dark";
  isEditor?: boolean;
  onSelect?: () => void;
  index?: number;
}> = ({ item, variant = "light", isEditor, onSelect, index }) => {
  const isDark = variant === "dark";
  const iconLower = (item.icon || item.title || "").toLowerCase();

  // If item matches one of the standard UK awarding vectors and has no custom image override
  if (!item.image) {
    if (iconLower.includes("ofqual")) {
      return (
        <div onClick={onSelect} className={`relative ${isEditor ? "cursor-pointer group" : ""}`}>
          <OfqualLogo variant={variant} />
          {isEditor && (
            <span className="hidden group-hover:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
              Badge #{index !== undefined ? index + 1 : ""} ✎
            </span>
          )}
        </div>
      );
    }
    if (iconLower.includes("tquk")) {
      return (
        <div onClick={onSelect} className={`relative ${isEditor ? "cursor-pointer group" : ""}`}>
          <TqukLogo variant={variant} />
          {isEditor && (
            <span className="hidden group-hover:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
              Badge #{index !== undefined ? index + 1 : ""} ✎
            </span>
          )}
        </div>
      );
    }
    if (iconLower.includes("cpd")) {
      return (
        <div onClick={onSelect} className={`relative ${isEditor ? "cursor-pointer group" : ""}`}>
          <CpdGroupLogo variant={variant} />
          {isEditor && (
            <span className="hidden group-hover:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
              Badge #{index !== undefined ? index + 1 : ""} ✎
            </span>
          )}
        </div>
      );
    }
    if (iconLower.includes("health") || iconLower.includes("skills")) {
      return (
        <div onClick={onSelect} className={`relative ${isEditor ? "cursor-pointer group" : ""}`}>
          <SkillsForHealthLogo variant={variant} />
          {isEditor && (
            <span className="hidden group-hover:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
              Badge #{index !== undefined ? index + 1 : ""} ✎
            </span>
          )}
        </div>
      );
    }
    if (iconLower.includes("ukrlp")) {
      return (
        <div onClick={onSelect} className={`relative ${isEditor ? "cursor-pointer group" : ""}`}>
          <UkrlpLogo variant={variant} />
          {isEditor && (
            <span className="hidden group-hover:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
              Badge #{index !== undefined ? index + 1 : ""} ✎
            </span>
          )}
        </div>
      );
    }
  }

  // Otherwise, render custom uploaded company logo with standard EQUAL HEIGHT bounding box:
  return (
    <div
      onClick={onSelect}
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 h-10 rounded-sm border transition-all ${
        isDark
          ? "bg-white/5 border-white/10 hover:border-gold-500/40 text-white"
          : "bg-white border-line shadow-xs hover:border-navy-900/30 text-navy-900"
      } ${
        isEditor
          ? "cursor-pointer group relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
          : ""
      }`}
      title={item.title}
    >
      {item.image ? (
        <div className="h-6 w-auto max-w-[80px] flex items-center justify-center flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title}
            className="max-h-6 max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-navy-900">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="w-5 h-5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )}

      {item.title && (
        <div className="text-left leading-none">
          <span
            className={`font-heading font-black text-xs sm:text-sm tracking-tight block ${
              isDark ? "text-white" : "text-navy-900"
            }`}
          >
            {item.title}
          </span>
          {item.desc && (
            <span
              className={`font-mono text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
                isDark ? "text-gold-300" : "text-navy-700"
              }`}
            >
              {item.desc}
            </span>
          )}
        </div>
      )}

      {isEditor && (
        <span className="hidden group-hover:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
          Badge #{index !== undefined ? index + 1 : ""} ✎
        </span>
      )}
    </div>
  );
};

/**
 * Composite accreditation strip presenting authentic organisation logo badges
 */
export const AccreditationBadgeRow: React.FC<{
  items?: AccreditationBadgeItem[];
  variant?: "light" | "dark";
  className?: string;
  isEditor?: boolean;
  onSelectBadge?: (index: number) => void;
}> = ({ items, variant = "light", className = "", isEditor, onSelectBadge }) => {
  if (items && items.length > 0) {
    return (
      <div className={`flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}>
        {items.map((item, idx) => (
          <DynamicAccreditationBadge
            key={idx}
            item={item}
            variant={variant}
            isEditor={isEditor}
            index={idx}
            onSelect={() => onSelectBadge?.(idx)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}>
      <OfqualLogo variant={variant} />
      <TqukLogo variant={variant} />
      <CpdGroupLogo variant={variant} />
      <SkillsForHealthLogo variant={variant} />
      <UkrlpLogo variant={variant} />
    </div>
  );
};
