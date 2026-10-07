"use client";

import React from "react";
import { siteConfig } from "@/content/siteConfig";
import { useBooking } from "@/context/BookingContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * MobileBottomBar: Persistent bottom action bar on mobile viewports per PRD 8 & 16.
 * Contains primary "Get free advice" CTA and a direct WhatsApp shortcut.
 */
export const MobileBottomBar: React.FC = () => {
  const { openBooking } = useBooking();

  return (
    <aside
      aria-label="Quick action bar"
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-line px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform"
    >
      <div className="flex items-center gap-3 max-w-md mx-auto">
        <Button
          variant="primary"
          size="md"
          className="flex-1 font-bold"
          onClick={() => openBooking()}
        >
          Get free advice
        </Button>

        <a
          href={siteConfig.contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-sm bg-navy-900 text-white flex items-center justify-center hover:bg-navy-700 active:bg-navy-900 transition-colors shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          aria-label="Message Smartminds on WhatsApp"
        >
          <Icon name="whatsapp" size={20} className="text-gold-500" />
        </a>
      </div>
    </aside>
  );
};
