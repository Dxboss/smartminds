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
  ...props
}) => {
  const Component = as || level;

  // PRD 7.2 Type scale:
  // H1: 40px to 64px
  // H2: 30px to 44px
  // H3: 22px to 28px
  // Sentence case, not all caps per PRD 7.2
  const levelStyles: Record<HeadingLevel, string> = {
    h1: "text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] font-bold tracking-tight leading-[1.05]",
    h2: "text-[1.875rem] sm:text-[2.375rem] lg:text-[2.75rem] font-bold tracking-tight leading-[1.1]",
    h3: "text-[1.375rem] sm:text-[1.625rem] lg:text-[1.75rem] font-semibold leading-[1.2]",
    h4: "text-lg sm:text-xl font-semibold leading-[1.3]",
    h5: "text-base sm:text-lg font-semibold leading-[1.4]",
    h6: "text-sm sm:text-base font-semibold leading-[1.4]",
  };

  return (
    <Component
      className={`font-heading ${levelStyles[level]} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
};
