import React from "react";

export interface OrangeWaveAccentProps {
  className?: string;
  width?: number;
  height?: number;
}

export const OrangeWaveAccent: React.FC<OrangeWaveAccentProps> = ({
  className = "text-[#FF5722]",
  width = 130,
  height = 14,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 130 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M3 8C23 2 43 2 65 8C87 14 107 14 127 8"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
