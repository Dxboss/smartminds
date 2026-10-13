"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { globalSettings } from "@/content/globals";
import { Icon } from "@/components/ui/Icon";

/**
 * StagingBanner: Displays a visible banner on staging/preview environments
 * per PRD 11 & Prompt 3 to guarantee placeholder prices are never mistaken for live data.
 */
export const StagingBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  if (
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/super") ||
    !globalSettings.is_staging ||
    dismissed
  ) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-label="Staging environment notice"
      className="bg-navy-900 text-gold-300 border-b border-gold-500/30 px-4 py-2 text-xs font-medium relative z-50 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2 max-w-[1200px] mx-auto w-full">
        <Icon name="info" size={16} className="text-gold-500 flex-shrink-0" />
        <span className="leading-tight">
          <strong className="text-white font-semibold uppercase tracking-wider text-[11px] mr-1.5 px-1.5 py-0.5 rounded-sm bg-gold-500/20 border border-gold-500/40">
            Preview
          </strong>
          Prices and some content are placeholders.
        </span>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss staging preview banner"
        className="text-gold-300/80 hover:text-white p-1 rounded-sm transition-colors flex-shrink-0"
      >
        <Icon name="close" size={16} />
      </button>
    </aside>
  );
};
