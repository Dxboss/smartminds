import React, { useId } from "react";

export interface ArcMaskProps {
  children: React.ReactNode;
  className?: string;
  accentBorder?: boolean;
  curvePosition?: "top" | "bottom";
}

/**
 * ArcMask: Wraps hero and course imagery with the PRD 7.3 crescent arc signature mask.
 * Uses SVG clipPath for crisp rendering across all screen densities.
 */
export const ArcMask: React.FC<ArcMaskProps> = ({
  children,
  className = "",
  accentBorder = true,
  curvePosition = "bottom",
}) => {
  const clipId = useId().replace(/:/g, "_");

  // Normalized 0..1 coordinate paths for SVG clipPath
  // Top curve arches downward into the frame; bottom curve sweeps upward
  const clipPathD =
    curvePosition === "bottom"
      ? "M0,0 L1,0 L1,0.92 C0.72,0.98 0.28,0.98 0,0.92 Z"
      : "M0,0.08 C0.28,0.02 0.72,0.02 1,0.08 L1,1 L0,1 Z";

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      {/* Hidden SVG defining the clipPath with objectBoundingBox */}
      <svg
        className="absolute w-0 h-0 pointer-events-none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={clipPathD} />
          </clipPath>
        </defs>
      </svg>

      {/* Clipped content container */}
      <div
        className="w-full h-full relative overflow-hidden"
        style={{ clipPath: `url(#${clipId})` }}
      >
        {children}
      </div>

      {/* Optional subtle gold crescent accent outline tracing the arc */}
      {accentBorder && (
        <div
          className={`absolute inset-x-0 pointer-events-none z-10 ${
            curvePosition === "bottom" ? "bottom-0" : "top-0"
          }`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 8"
            preserveAspectRatio="none"
            className="w-full h-3 md:h-4 stroke-gold-500/50 fill-none"
          >
            <path
              d={
                curvePosition === "bottom"
                  ? "M0,2 C28,7.5 72,7.5 100,2"
                  : "M0,6 C28,0.5 72,0.5 100,6"
              }
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
