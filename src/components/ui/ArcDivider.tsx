import React from "react";

export type ArcDividerPosition = "top" | "bottom";

export interface ArcDividerProps {
  position?: ArcDividerPosition;
  fillColorClass?: string; // e.g. "fill-paper", "fill-white", "fill-navy-900"
  accentLine?: boolean; // Subtle gold accent stroke following the curve
  className?: string;
  inverted?: boolean;
}

/**
 * ArcDivider: Section transition component implementing PRD 7.3 crescent arc motif.
 * Pure SVG, zero raster images, responsive and smoothly scaled.
 */
export const ArcDivider: React.FC<ArcDividerProps> = ({
  position = "bottom",
  fillColorClass = "fill-paper",
  accentLine = false,
  className = "",
  inverted = false,
}) => {
  const isTop = position === "top";
  const transform =
    `${isTop ? "rotate-180" : ""} ${inverted ? "scale-x-[-1]" : ""}`.trim();

  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`.trim()}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className={`w-full h-10 sm:h-14 md:h-18 lg:h-20 block ${transform}`}
      >
        {/* Crescent curve following the logo's dynamic upward sweep */}
        <path
          d="M0,0 C380,75 1060,75 1440,0 L1440,80 L0,80 Z"
          className={fillColorClass}
        />
        {accentLine && (
          <path
            d="M0,0 C380,75 1060,75 1440,0"
            className="stroke-gold-500/40"
            strokeWidth="1.5"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
};
