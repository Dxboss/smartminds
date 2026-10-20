import React from "react";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";

export interface AccreditationLogoProps {
  variant?: "light" | "dark" | "compact";
  badgeStyle?: "solid-white" | "flat" | "pill";
  className?: string;
}

function getBadgeContainerClasses(
  variant: "light" | "dark" | "compact" = "light",
  badgeStyle: "solid-white" | "flat" | "pill" = "solid-white",
  extraClass: string = ""
) {
  const isDark = variant === "dark";
  const roundedClass =
    badgeStyle === "pill"
      ? "rounded-full px-3 sm:px-3.5"
      : "rounded-sm px-2.5 sm:px-3";

  let bgBorder = "";
  if (isDark) {
    bgBorder =
      badgeStyle === "flat"
        ? "bg-transparent border-white/20 hover:border-gold-500/50 text-white"
        : "bg-white/5 border-white/10 hover:border-gold-500/40 text-white";
  } else {
    bgBorder =
      badgeStyle === "flat"
        ? "bg-transparent border-teal-300/80 hover:bg-white/40 text-navy-900"
        : "bg-white border-line shadow-xs hover:border-navy-900/30 text-navy-900";
  }

  return `inline-flex items-center gap-2 sm:gap-2.5 py-1.5 border transition-all flex-shrink-0 whitespace-nowrap select-none ${roundedClass} ${bgBorder} ${extraClass}`.trim();
}

/**
 * High-fidelity vector logo badges for UK accredited awarding organisations
 * and regulatory frameworks (Ofqual, TQUK, CPD Group, Skills for Health, UKRLP).
 */
export const OfqualLogo: React.FC<AccreditationLogoProps> = ({
  variant = "light",
  badgeStyle = "solid-white",
  className = "",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={getBadgeContainerClasses(variant, badgeStyle, className)}
      title="Ofqual Regulated - Office of Qualifications and Examinations Regulation"
    >
      {/* Royal Crown insignia */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
          isDark ? "text-gold-300" : "text-navy-900"
        }`}
        aria-hidden="true"
      >
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-black text-xs sm:text-xs tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          ofqual
        </span>
        <span
          className={`font-mono text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-gold-300" : "text-navy-700"
          }`}
        >
          Regulated
        </span>
      </div>
    </div>
  );
};

export const TqukLogo: React.FC<AccreditationLogoProps> = ({
  variant = "light",
  badgeStyle = "solid-white",
  className = "",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={getBadgeContainerClasses(variant, badgeStyle, className)}
      title="Training Qualifications UK (TQUK) - Recognised Awarding Organisation"
    >
      {/* TQUK Quad-Diamond Geometric Emblem */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
          isDark ? "text-gold-300" : "text-navy-900"
        }`}
        aria-hidden="true"
      >
        <path d="M12 2L6 8l6 6 6-6-6-6zM6 10l-4 4 4 4 4-4-4-4zm12 0l-4 4 4 4 4-4-4-4zm-6 6l-4 4 4 4 4-4-4-4z" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-black text-xs sm:text-xs tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          TQUK
        </span>
        <span
          className={`font-mono text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-white/70" : "text-ink-soft"
          }`}
        >
          Approved Centre
        </span>
      </div>
    </div>
  );
};

export const CpdGroupLogo: React.FC<AccreditationLogoProps> = ({
  variant = "light",
  badgeStyle = "solid-white",
  className = "",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={getBadgeContainerClasses(variant, badgeStyle, className)}
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
        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
          isDark ? "text-gold-300" : "text-navy-900"
        }`}
        aria-hidden="true"
      >
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-black text-xs sm:text-xs tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          THE CPD GROUP
        </span>
        <span
          className={`font-mono text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-gold-300" : "text-navy-800"
          }`}
        >
          Accredited Provider
        </span>
      </div>
    </div>
  );
};

export const SkillsForHealthLogo: React.FC<AccreditationLogoProps> = ({
  variant = "light",
  badgeStyle = "solid-white",
  className = "",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={getBadgeContainerClasses(variant, badgeStyle, className)}
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
        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
          isDark ? "text-emerald-400" : "text-emerald-700"
        }`}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" strokeWidth="2.5" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-bold text-xs sm:text-xs tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          Skills for Health
        </span>
        <span
          className={`font-mono text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
            isDark ? "text-white/70" : "text-ink-soft"
          }`}
        >
          NOS Aligned
        </span>
      </div>
    </div>
  );
};

export const UkrlpLogo: React.FC<AccreditationLogoProps> = ({
  variant = "light",
  badgeStyle = "solid-white",
  className = "",
}) => {
  const isDark = variant === "dark";
  return (
    <div
      className={getBadgeContainerClasses(variant, badgeStyle, className)}
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
        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
          isDark ? "text-gold-300" : "text-navy-900"
        }`}
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <div className="text-left leading-none">
        <span
          className={`font-heading font-black text-xs sm:text-xs tracking-tight block ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          UKRLP
        </span>
        <span
          className={`font-mono text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
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
  id?: string;
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
  badgeStyle?: "solid-white" | "flat" | "pill";
  isEditor?: boolean;
  onSelect?: () => void;
  index?: number;
}> = ({
  item,
  variant = "light",
  badgeStyle = "solid-white",
  isEditor,
  onSelect,
  index,
}) => {
  const isDark = variant === "dark";
  const iconLower = (item.icon || item.title || "").toLowerCase();

  let badgeNode: React.ReactNode = null;

  // If item matches one of the standard UK awarding vectors and has no custom image override
  if (!item.image) {
    if (iconLower.includes("ofqual")) {
      badgeNode = <OfqualLogo variant={variant} badgeStyle={badgeStyle} />;
    } else if (iconLower.includes("tquk")) {
      badgeNode = <TqukLogo variant={variant} badgeStyle={badgeStyle} />;
    } else if (iconLower.includes("cpd")) {
      badgeNode = <CpdGroupLogo variant={variant} badgeStyle={badgeStyle} />;
    } else if (iconLower.includes("health") || iconLower.includes("skills")) {
      badgeNode = <SkillsForHealthLogo variant={variant} badgeStyle={badgeStyle} />;
    } else if (iconLower.includes("ukrlp")) {
      badgeNode = <UkrlpLogo variant={variant} badgeStyle={badgeStyle} />;
    }
  }

  // Fallback custom card
  if (!badgeNode) {
    badgeNode = (
      <div
        className={getBadgeContainerClasses(
          variant,
          badgeStyle,
          isEditor
            ? "cursor-pointer group relative hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500"
            : ""
        )}
        title={item.title}
      >
        {item.image ? (
          <div className="h-5 w-auto max-w-[80px] flex items-center justify-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              className="max-h-5 max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0 text-navy-900">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="w-4 h-4 sm:w-5 sm:h-5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}

        {item.title && (
          <div className="text-left leading-none">
            <span
              className={`font-heading font-black text-xs sm:text-xs tracking-tight block ${
                isDark ? "text-white" : "text-navy-900"
              }`}
            >
              {item.title}
            </span>
            {item.desc && (
              <span
                className={`font-mono text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
                  isDark ? "text-gold-300" : "text-navy-700"
                }`}
              >
                {item.desc}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Wrap in external link if defined and not editing
  if (item.link && !isEditor) {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block flex-shrink-0 hover:opacity-90 transition-opacity"
        title={`${item.title} - Official Verification`}
      >
        {badgeNode}
      </a>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`relative inline-block flex-shrink-0 ${
        isEditor ? "cursor-pointer group" : ""
      }`}
    >
      {badgeNode}
      {isEditor && (
        <span className="hidden group-hover:inline-flex absolute -top-4 right-0 z-30 px-1 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[8px] font-bold shadow-xs whitespace-nowrap">
          Badge #{index !== undefined ? index + 1 : ""} ✎
        </span>
      )}
    </div>
  );
};

/**
 * Composite accreditation strip presenting authentic organisation logo badges.
 * By default (wrap=false), renders strictly in ONE SINGLE LINE with horizontal swipe on mobile.
 */
export const AccreditationBadgeRow: React.FC<{
  items?: AccreditationBadgeItem[];
  variant?: "light" | "dark";
  badgeStyle?: "solid-white" | "flat" | "pill";
  wrap?: boolean;
  className?: string;
  isEditor?: boolean;
  selectedIndex?: number | null;
  onSelectBadge?: (index: number) => void;
}> = ({
  items,
  variant = "light",
  badgeStyle = "solid-white",
  wrap = false,
  className = "",
  isEditor,
  selectedIndex,
  onSelectBadge,
}) => {
  const containerClass = wrap
    ? `flex flex-wrap items-center gap-2 sm:gap-2.5 ${className}`
    : `flex items-center gap-2 sm:gap-2.5 flex-nowrap overflow-x-auto scrollbar-none py-1 ${className}`;

  if (items && items.length > 0) {
    return (
      <div className={containerClass}>
        {items.map((item, idx) => (
          <EditableElementWrapper
            key={item.id || idx}
            isEditor={isEditor}
            isSelected={isEditor && selectedIndex === idx}
            label={`Badge #${idx + 1}`}
            onClick={() => onSelectBadge?.(idx)}
            className="inline-block flex-shrink-0"
          >
            <DynamicAccreditationBadge
              item={item}
              variant={variant}
              badgeStyle={badgeStyle}
              index={idx}
            />
          </EditableElementWrapper>
        ))}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <OfqualLogo variant={variant} badgeStyle={badgeStyle} />
      <TqukLogo variant={variant} badgeStyle={badgeStyle} />
      <CpdGroupLogo variant={variant} badgeStyle={badgeStyle} />
      <SkillsForHealthLogo variant={variant} badgeStyle={badgeStyle} />
      <UkrlpLogo variant={variant} badgeStyle={badgeStyle} />
    </div>
  );
};
