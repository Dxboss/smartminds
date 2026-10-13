import React from "react";
import { Icon } from "@/components/ui/Icon";

export const VisaLogo: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <svg
    viewBox="0 0 38 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Visa"
  >
    <rect width="38" height="24" rx="4" fill="var(--white)" stroke="var(--line)" />
    <path
      d="M15.42 16.5H13.26L14.61 7.5H16.77L15.42 16.5ZM21.94 7.69C21.51 7.53 20.85 7.37 20.02 7.37C17.84 7.37 16.3 8.52 16.29 10.15C16.27 11.36 17.38 12.03 18.22 12.44C19.08 12.86 19.37 13.14 19.37 13.51C19.37 14.08 18.68 14.33 18.03 14.33C17.22 14.33 16.76 14.21 16.14 13.93L15.88 13.81L15.6 15.65C16.18 15.91 17.25 16.14 18.36 16.15C20.65 16.15 22.14 15.03 22.16 13.31C22.17 12.28 21.52 11.5 20.12 10.82C19.27 10.39 18.75 10.14 18.75 9.72C18.76 9.35 19.17 8.95 20.03 8.95C20.73 8.93 21.28 9.09 21.72 9.29L21.94 7.69ZM26.79 7.5H25.12C24.6 7.5 24.21 7.65 23.98 8.19L20.49 16.5H22.76L23.21 15.26H25.99L26.25 16.5H28.25L26.79 7.5ZM23.83 13.56L24.97 10.45L25.63 13.56H23.83ZM11.66 7.5L9.56 13.65L9.33 12.5C8.94 11.16 7.75 9.69 6.42 9L8.35 16.5H10.63L13.94 7.5H11.66Z"
      fill="var(--brand-visa)"
    />
    <path
      d="M7.94 7.5H4.5L4.47 7.67C7.14 8.35 9.17 10.16 9.9 12.16L9.17 8.3C9.04 7.75 8.64 7.52 7.94 7.5Z"
      fill="var(--gold-700)"
    />
  </svg>
);

export const MastercardLogo: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <svg
    viewBox="0 0 38 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Mastercard"
  >
    <rect width="38" height="24" rx="4" fill="var(--white)" stroke="var(--line)" />
    <circle cx="15" cy="12" r="7" fill="var(--brand-mc-red)" />
    <circle cx="23" cy="12" r="7" fill="var(--brand-mc-amber)" />
    <path
      d="M19 6.96C20.25 8.28 21 10.05 21 12C21 13.95 20.25 15.72 19 17.04C17.75 15.72 17 13.95 17 12C17 10.05 17.75 8.28 19 6.96Z"
      fill="var(--brand-mc-amber)"
      fillOpacity="0.85"
    />
  </svg>
);

export const AmexLogo: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <svg
    viewBox="0 0 38 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="American Express"
  >
    <rect width="38" height="24" rx="4" fill="var(--brand-amex)" />
    <text
      x="19"
      y="15.5"
      textAnchor="middle"
      fill="var(--white)"
      fontSize="8.5"
      fontWeight="900"
      letterSpacing="0.8"
      fontFamily="sans-serif"
    >
      AMEX
    </text>
  </svg>
);

export const ApplePayLogo: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <svg
    viewBox="0 0 38 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Apple Pay"
  >
    <rect width="38" height="24" rx="4" fill="var(--white)" stroke="var(--line)" />
    <g fill="var(--ink)">
      {/* Apple glyph */}
      <path d="M12.8 7.3c-.6.7-1.5 1.2-2.3 1.1-.1-.8.2-1.7.8-2.3.6-.7 1.5-1.1 2.3-1.1.1.8-.2 1.6-.8 2.3zm.8 1.2c-1.3 0-2.3.8-2.9.8-.6 0-1.6-.8-2.6-.8-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 0.7 1 1.5 2.1 2.6 2 1-.1 1.5-.7 2.7-.7s1.6.7 2.7.6c1.1-.1 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.1-3.2 0-2 1.6-3 1.7-3.1-1-1.3-2.3-1.3-2.5-1.3z" transform="matrix(0.55 0 0 0.55 7.5 3.5)" />
      {/* Pay text */}
      <text
        x="22.5"
        y="15"
        fontSize="8"
        fontWeight="600"
        fontFamily="sans-serif"
        letterSpacing="-0.2"
      >
        Pay
      </text>
    </g>
  </svg>
);

export const StripeTrustBadge: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <div
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-white border border-line text-[10px] font-semibold text-ink ${className}`}
    title="Secured and Processed by Stripe"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
    <span className="font-mono text-[9px] uppercase tracking-wider text-ink-soft">Stripe</span>
    <span className="text-emerald-700 font-bold text-[9px]">Verified</span>
  </div>
);

/**
 * Compact row of trusted payment card logos for the payment card header
 */
export const PaymentCardTrustIcons: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex items-center gap-1.5 ${className}`}
    aria-label="Accepted Payment Methods: Visa, Mastercard, American Express, Apple Pay"
  >
    <VisaLogo className="h-5 w-8 shadow-2xs" />
    <MastercardLogo className="h-5 w-8 shadow-2xs" />
    <AmexLogo className="h-5 w-8 shadow-2xs" />
    <ApplePayLogo className="h-5 w-8 shadow-2xs" />
  </div>
);

/**
 * Full checkout security guarantee banner placed near the payment action
 */
export const CheckoutTrustBanner: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`p-3 rounded-sm bg-white border border-line flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
  >
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
        <Icon name="shield-check" size={15} />
      </div>
      <div>
        <p className="text-xs font-bold text-navy-900 leading-tight">
          Guaranteed Safe & Secure Checkout
        </p>
        <p className="text-[10px] text-ink-soft">
          Bank-grade encryption • Protected by Stripe
        </p>
      </div>
    </div>

    <div className="flex items-center gap-1.5 shrink-0">
      <VisaLogo className="h-5 w-8" />
      <MastercardLogo className="h-5 w-8" />
      <AmexLogo className="h-5 w-8" />
      <ApplePayLogo className="h-5 w-8" />
    </div>
  </div>
);
