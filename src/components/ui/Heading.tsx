import React from "react";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  as?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  level = "h2",
  as,
  children,
  className = "",
  style,
  ...props
}) => {
  const Component = as || level;

  // PRD 7.2 Type scale:
  // H1: 40px to 64px
  // H2: 30px to 44px
  // H3: 22px to 28px
  // Sentence case, not all caps per PRD 7.2
  const levelStyles: Record<HeadingLevel, { size: string; weight: string; leading: string }> = {
    h1: { size: "text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem]", weight: "font-bold tracking-tight", leading: "leading-[1.05]" },
    h2: { size: "text-[1.875rem] sm:text-[2.375rem] lg:text-[2.75rem]", weight: "font-bold tracking-tight", leading: "leading-[1.1]" },
    h3: { size: "text-[1.375rem] sm:text-[1.625rem] lg:text-[1.75rem]", weight: "font-semibold", leading: "leading-[1.2]" },
    h4: { size: "text-lg sm:text-xl", weight: "font-semibold", leading: "leading-[1.3]" },
    h5: { size: "text-base sm:text-lg", weight: "font-semibold", leading: "leading-[1.4]" },
    h6: { size: "text-sm sm:text-base", weight: "font-semibold", leading: "leading-[1.4]" },
  };

  const hasCustomSize = /\btext-(xs|sm|base|lg|xl|[2-9]xl|\[[^\]]+\])\b/.test(className);
  const hasCustomWeight = /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/.test(className);
  const hasCustomTracking = /\btracking-(tighter|tight|normal|wide|wider|widest)\b/.test(className);

  const defaultStyle = levelStyles[level];
  const sizeClass = hasCustomSize ? "" : defaultStyle.size;
  const weightClass = hasCustomWeight ? "" : hasCustomTracking ? defaultStyle.weight.replace(/tracking-\w+/, "") : defaultStyle.weight;

  return (
    <Component
      style={style}
      className={`font-heading ${sizeClass} ${weightClass} ${defaultStyle.leading} ${className}`.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </Component>
  );
};

