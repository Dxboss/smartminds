import React from "react";
import { resolveSectionBg, SectionBgColor } from "./sectionBg";

export type SectionVariant = SectionBgColor;

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const Section: React.FC<SectionProps> = ({
  variant = "paper",
  children,
  className = "",
  id,
  style,
  ...props
}) => {
  const { bgClass, style: resolvedStyle } = resolveSectionBg(variant, "paper");

  // 64px mobile (py-16 = 4rem = 64px), 96px desktop (md:py-24 = 6rem = 96px)
  return (
    <section
      id={id}
      style={{ ...resolvedStyle, ...style }}
      className={`relative py-16 md:py-24 ${bgClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
};
