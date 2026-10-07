import React from "react";
import Link from "next/link";

export type ButtonVariant =
  "primary" | "on-navy-gold" | "text-link" | "outline";
export type ButtonSize = "md" | "lg" | "sm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  isExternal?: boolean;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      isExternal = false,
      children,
      className = "",
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const sizeClasses =
      variant === "text-link"
        ? "p-0 min-h-[44px] inline-flex items-center"
        : size === "sm"
          ? "min-h-[44px] px-4 py-2 text-sm rounded-sm"
          : size === "lg"
            ? "min-h-[52px] px-8 py-3.5 text-lg rounded-sm"
            : "min-h-[44px] px-6 py-2.5 text-base rounded-sm";

    const variantClasses = {
      primary:
        "bg-navy-900 text-white hover:bg-navy-700 active:bg-navy-900 focus-visible:ring-gold-500 shadow-subtle",
      "on-navy-gold":
        "bg-gold-500 text-navy-900 hover:bg-gold-300 active:bg-gold-700 focus-visible:ring-white shadow-subtle",
      outline:
        "border border-navy-900 text-navy-900 hover:bg-navy-900/5 active:bg-navy-900/10 focus-visible:ring-navy-900",
      "text-link":
        "text-navy-900 hover:text-navy-700 underline underline-offset-4 decoration-gold-500 hover:decoration-navy-700",
    }[variant];

    const widthClass = fullWidth ? "w-full" : "";
    const combinedClasses =
      `${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`.trim();

    if (href) {
      if (isExternal) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={combinedClasses}
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClasses}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled}
        className={combinedClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
