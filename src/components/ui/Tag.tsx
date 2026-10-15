import React from "react";

export type TagVariant = "default" | "navy" | "gold" | "live" | "on-navy";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  variant = "default",
  children,
  className = "",
  dot = false,
  ...props
}) => {
  const variantClasses = {
    default: "bg-paper text-ink-soft border border-line",
    navy: "bg-navy-900/10 text-navy-900 border border-navy-900/20 font-medium",
    gold: "bg-gold-500/15 text-navy-900 border border-gold-500/50 font-semibold",
    live: "bg-navy-900 text-white font-medium",
    "on-navy": "bg-white/10 text-white border border-white/20 font-medium",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-semibold rounded-sm transition-colors ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {(dot || variant === "live") && (
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            variant === "live"
              ? "bg-gold-500 animate-pulse"
              : "bg-current opacity-70"
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
