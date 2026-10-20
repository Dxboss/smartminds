import React from "react";
import Link from "next/link";

export interface LogoProps {
  variant?: "full-color" | "white" | "mark-only";
  className?: string;
  logoType?: "vector" | "crest" | "image";
  logoImageUrl?: string;
  logoHeight?: number;
  siteName?: string;
  tagline?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "full-color",
  className = "",
  logoImageUrl,
  logoHeight = 42,
  siteName = "Smartminds",
  tagline = "Training College",
}) => {
  const isWhite = variant === "white";
  const defaultLogoSrc = isWhite ? "/images/logo-white.png" : "/images/logo-color.png";
  const isPhotoAsset =
    logoImageUrl &&
    (logoImageUrl.includes("hero-learner") ||
      logoImageUrl.includes("teacher-training") ||
      logoImageUrl.includes("adult-care") ||
      logoImageUrl.includes("early-years") ||
      logoImageUrl.includes("tutor-teaching") ||
      logoImageUrl.includes("certificate-moment"));
  const logoSrc = logoImageUrl && !isPhotoAsset ? logoImageUrl : defaultLogoSrc;

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`.trim()}
      aria-label={`${siteName} ${tagline} Home`}
    >
      <div className="relative flex items-center justify-center flex-shrink-0">
        <img
          src={logoSrc}
          alt={`${siteName} ${tagline}`}
          style={{ height: `${logoHeight}px`, width: "auto" }}
          className="object-contain max-h-[56px] transition-transform group-hover:scale-[1.02]"
        />
      </div>

      {variant !== "mark-only" && !logoSrc.includes("logo-color") && !logoSrc.includes("logo-white") && (
        <div className="flex flex-col justify-center leading-none select-none">
          <span
            className={`font-heading text-lg sm:text-xl font-bold tracking-tight uppercase transition-colors ${
              isWhite
                ? "text-white group-hover:text-gold-300"
                : "text-navy-900 group-hover:text-navy-700"
            }`}
          >
            {siteName}
          </span>
          <span
            className={`text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase mt-0.5 ${
              isWhite ? "text-gold-300" : "text-ink-soft"
            }`}
          >
            {tagline}
          </span>
        </div>
      )}
    </Link>
  );
};
