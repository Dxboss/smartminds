import React from "react";

export type EyebrowTone = "navy" | "gold" | "muted" | "on-navy-gold";

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  tone?: EyebrowTone;
  className?: string;
  as?: React.ElementType;
}

export const Eyebrow: React.FC<EyebrowProps> = ({
  children,
  tone = "navy",
  className = "",
  as: Component = "span",
  ...props
}) => {
  const toneClasses = {
    navy: "text-navy-700",
    gold: "text-navy-900 border-l-2 border-gold-500 pl-2",
    "on-navy-gold": "text-gold-300", // Light gold on navy background
    muted: "text-ink-soft",
  }[tone];

  return (
    <Component
      className={`inline-block text-sm font-semibold tracking-wider uppercase ${toneClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
};
