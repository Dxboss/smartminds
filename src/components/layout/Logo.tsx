import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export interface LogoProps {
  variant?: "full-color" | "white";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "full-color",
  className = "",
}) => {
  const isWhite = variant === "white";

  const textColor = isWhite ? "text-white" : "text-navy-900";
  const subtextColor = isWhite ? "text-gold-300" : "text-navy-700";
  const arcStrokeColor = isWhite ? "stroke-gold-300" : "stroke-navy-900";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`.trim()}
      aria-label="Smartminds Training College Home"
    >
      {/* Signature emblem: Crescent arc with dual reaching figures and celestial star */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Crescent arc sweep */}
          <path
            d="M38 12C36 28 24 38 10 38C6 38 3 37 1 35C15 42 32 36 38 22C40 18 40 15 38 12Z"
            className="fill-gold-500"
          />
          {/* Dynamic inner contour arc */}
          <path
            d="M8 32C18 36 30 30 35 18"
            className={arcStrokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Left figure reaching */}
          <circle cx="16" cy="18" r="2.5" className="fill-gold-500" />
          <path
            d="M11 28C11 24 14 22 17 21L21 26"
            className={arcStrokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Right figure reaching higher */}
          <circle cx="24" cy="13" r="2.5" className="fill-gold-300" />
          <path
            d="M19 25C20 20 23 17 26 16L30 22"
            className={arcStrokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Central star shining between reaching figures */}
        <div className="absolute top-1 right-2 text-gold-500 transform group-hover:scale-110 transition-transform">
          <Icon
            name="star"
            size={14}
            className="fill-gold-500 stroke-gold-700"
          />
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-heading text-2xl font-bold tracking-tight uppercase ${textColor} transition-colors`}
        >
          Smartminds
        </span>
        <span
          className={`text-[9px] font-semibold tracking-[0.22em] uppercase ${subtextColor} transition-colors`}
        >
          Training College
        </span>
      </div>
    </Link>
  );
};
