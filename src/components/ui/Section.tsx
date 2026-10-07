import React from "react";

export type SectionVariant = "paper" | "white" | "navy";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Section: React.FC<SectionProps> = ({
  variant = "paper",
  children,
  className = "",
  id,
  ...props
}) => {
  const variantClasses = {
    paper: "bg-paper text-ink",
    white: "bg-white text-ink",
    navy: "bg-navy-900 text-white",
  }[variant];

  // 64px mobile (py-16 = 4rem = 64px), 96px desktop (md:py-24 = 6rem = 96px)
  return (
    <section
      id={id}
      className={`relative py-16 md:py-24 ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
};
