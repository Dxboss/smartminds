import React from "react";

export type IconName =
  | "star"
  | "check"
  | "arrow-right"
  | "arrow-left"
  | "phone"
  | "mail"
  | "calendar"
  | "clock"
  | "graduation-cap"
  | "book-open"
  | "shield-check"
  | "whatsapp"
  | "chevron-down"
  | "chevron-right"
  | "chevron-left"
  | "menu"
  | "close"
  | "user"
  | "info"
  | "sparkles"
  | "external-link";

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.75, // Uniform stroke width across the entire site
  ...props
}) => {
  const renderPath = () => {
    switch (name) {
      // Signature star element from PRD 7.3
      case "star":
        return (
          <path
            d="M12 2L14.6 8.8L21.5 11.5L14.6 14.2L12 21L9.4 14.2L2.5 11.5L9.4 8.8L12 2Z"
            strokeLinejoin="round"
          />
        );

      case "check":
        return (
          <path
            d="M4.5 12.75l6 6 9-13.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "arrow-right":
        return (
          <path
            d="M4.5 12h15m-6-6l6 6-6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "arrow-left":
        return (
          <path
            d="M19.5 12h-15m6-6l-6 6 6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "phone":
        return (
          <path
            d="M3.75 5.25a2.25 2.25 0 012.25-2.25h2.182a1.5 1.5 0 011.455 1.136l.758 3.03a1.5 1.5 0 01-.43 1.488l-1.32 1.32a13.5 13.5 0 005.65 5.65l1.32-1.32a1.5 1.5 0 011.488-.43l3.03.758a1.5 1.5 0 011.136 1.455V18a2.25 2.25 0 01-2.25 2.25c-8.7 0-15.75-7.05-15.75-15.75v-.75z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "mail":
        return (
          <>
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 7l9 6 9-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "calendar":
        return (
          <>
            <rect
              x="3"
              y="4"
              width="18"
              height="17"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 2v4M8 2v4M3 10h18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "clock":
        return (
          <>
            <circle
              cx="12"
              cy="12"
              r="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 7v5l3 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "graduation-cap":
        return (
          <>
            <path
              d="M2.5 9.5L12 4.5l9.5 5-9.5 5-9.5-5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 11.5v5c0 2.5 3 4.5 6 4.5s6-2 6-4.5v-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.5 9.5v6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "book-open":
        return (
          <path
            d="M3 6.5A3.5 3.5 0 016.5 3H12v17H6.5A3.5 3.5 0 003 23.5V6.5zm18 0A3.5 3.5 0 0017.5 3H12v17h5.5A3.5 3.5 0 0121 23.5V6.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "shield-check":
        return (
          <>
            <path
              d="M12 2.5l7.5 3.5v5.5c0 5-3.5 9.5-7.5 10.5C8 21 4.5 16.5 4.5 11.5V6L12 2.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12l2 2 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "whatsapp":
        return (
          <path
            d="M17.5 14.5c-.3-.15-1.75-.85-2.02-.95-.27-.1-.47-.15-.67.15-.2.3-.77.95-.94 1.15-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35zM12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "chevron-down":
        return (
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        );

      case "chevron-right":
        return (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        );

      case "chevron-left":
        return (
          <path
            d="M15 18l-6-6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "menu":
        return (
          <path
            d="M4 6h16M4 12h16M4 18h16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "close":
        return (
          <path
            d="M6 6l12 12M6 18L18 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "user":
        return (
          <>
            <circle
              cx="12"
              cy="8"
              r="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 20c0-4 4-6 8-6s8 2 8 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "info":
        return (
          <>
            <circle
              cx="12"
              cy="12"
              r="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16v-4M12 8h.01"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "sparkles":
        return (
          <path
            d="M9.5 3L11 7.5L15.5 9L11 10.5L9.5 15L8 10.5L3.5 9L8 7.5L9.5 3zm8.5 11l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "external-link":
        return (
          <path
            d="M13.5 4.5H19.5V10.5M10.5 13.5L19.5 4.5M16.5 13.5V18a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5V9A1.5 1.5 0 016 7.5h4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={`inline-block flex-shrink-0 align-middle ${className}`.trim()}
      aria-hidden="true"
      {...props}
    >
      {renderPath()}
    </svg>
  );
};
