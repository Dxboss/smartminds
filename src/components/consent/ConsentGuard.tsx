"use client";

import React from "react";
import { useConsent, ConsentPreferences } from "@/context/ConsentContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface ConsentGuardProps {
  category: keyof Omit<ConsentPreferences, "necessary">;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

/**
 * ConsentGuard: Prevents third-party scripts, iframes, social embeds,
 * or tracking widgets from loading before explicit user consent per PRD Section 16.
 */
export const ConsentGuard: React.FC<ConsentGuardProps> = ({
  category,
  children,
  fallbackTitle = "External Content Blocked",
  fallbackDescription = "This content requires third-party cookies to display. Please accept cookie preferences to view it.",
}) => {
  const { preferences, openManage } = useConsent();

  const isAllowed = preferences[category];

  if (!isAllowed) {
    return (
      <div className="rounded-lg border border-line bg-paper p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-sm bg-navy-900/10 text-navy-900 mx-auto flex items-center justify-center">
          <Icon name="shield-check" size={20} />
        </div>
        <h4 className="font-heading text-lg font-bold text-navy-900">
          {fallbackTitle}
        </h4>
        <p className="text-xs text-ink-soft max-w-sm mx-auto leading-relaxed">
          {fallbackDescription}
        </p>
        <Button variant="outline" size="sm" onClick={openManage}>
          Adjust cookie settings
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
