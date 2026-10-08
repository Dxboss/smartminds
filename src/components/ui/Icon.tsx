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
  | "external-link"
  | "log-out"
  | "file-text"
  | "video"
  | "users"
  | "credit-card"
  | "download"
  | "search"
  | "bell"
  | "check-circle"
  | "alert-circle"
  | "plus";

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

      case "log-out":
        return (
          <>
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="16 17 21 12 16 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="21"
              y1="12"
              x2="9"
              y2="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "file-text":
        return (
          <>
            <path
              d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="14 2 14 8 20 8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="16"
              y1="13"
              x2="8"
              y2="13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="16"
              y1="17"
              x2="8"
              y2="17"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="10 9 9 9 8 9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "video":
        return (
          <>
            <polygon
              points="23 7 16 12 23 17 23 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="1"
              y="5"
              width="15"
              height="14"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "users":
        return (
          <>
            <path
              d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 21v-2a4 4 0 00-3-3.87"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3.13a4 4 0 010 7.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "credit-card":
        return (
          <>
            <rect
              x="1"
              y="4"
              width="22"
              height="16"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="1"
              y1="10"
              x2="23"
              y2="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "download":
        return (
          <>
            <path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="7 10 12 15 17 10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "search":
        return (
          <>
            <circle
              cx="11"
              cy="11"
              r="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "bell":
        return (
          <>
            <path
              d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 01-3.46 0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "check-circle":
        return (
          <>
            <path
              d="M22 11.08V12a10 10 0 11-5.93-9.14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="22 4 12 14.01 9 11.01"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "alert-circle":
        return (
          <>
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="16"
              x2="12.01"
              y2="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "plus":
        return (
          <>
            <line
              x1="12"
              y1="5"
              x2="12"
              y2="19"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
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
