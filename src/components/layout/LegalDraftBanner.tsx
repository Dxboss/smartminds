import React from "react";
import { Icon } from "@/components/ui/Icon";
import { globalSettings } from "@/content/globals";

export const LegalDraftBanner: React.FC = () => {
  if (!globalSettings.is_staging) {
    return null;
  }

  return (
    <aside
      aria-label="Legal draft status notice"
      className="p-4 rounded-lg bg-amber-500/10 border-2 border-dashed border-amber-500/40 text-navy-900 mb-8 flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-sm bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-navy-900 mt-0.5">
        <Icon name="info" size={18} />
      </div>
      <div className="text-xs leading-relaxed">
        <strong className="block text-sm font-heading font-bold text-navy-900 mb-0.5">
          Draft: Pending Legal Review (PLACEHOLDER)
        </strong>
        <span>
          This document represents standard preliminary draft copy prepared for
          the website launch preview. Final statutory terms, privacy
          disclosures, and cancellation policies must be formally reviewed and
          verified by the college owner&apos;s legal and accounting advisers
          before production launch.
        </span>
      </div>
    </aside>
  );
};
