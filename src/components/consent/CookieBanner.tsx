"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConsent } from "@/context/ConsentContext";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";

export const CookieBanner: React.FC = () => {
  const pathname = usePathname();
  const {
    hasResponded,
    isManageOpen,
    preferences,
    acceptAll,
    rejectAll,
    savePreferences,
    openManage,
    closeManage,
  } = useConsent();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Temporary local state while in the Manage modal
  const [tempAnalytics, setTempAnalytics] = useState(preferences.analytics);
  const [tempMarketing, setTempMarketing] = useState(preferences.marketing);
  const [tempEmbeds, setTempEmbeds] = useState(preferences.embeds);

  // Sync temp state when opening manage modal
  const handleOpenManage = () => {
    setTempAnalytics(preferences.analytics);
    setTempMarketing(preferences.marketing);
    setTempEmbeds(preferences.embeds);
    openManage();
  };

  const handleSaveCustom = () => {
    savePreferences({
      analytics: tempAnalytics,
      marketing: tempMarketing,
      embeds: tempEmbeds,
    });
  };

  const isPortal =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/super");

  if (!mounted || isPortal) {
    return null;
  }

  return (
    <>
      {/* 1. Main Cookie Banner (Equal-weight Accept / Reject / Manage) */}
      {!hasResponded && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white border-t border-line shadow-2xl animate-fade-in"
        >
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="shield-check" className="text-navy-900 w-5 h-5" />
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Your Privacy & Cookie Choices
                </h2>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">
                Smartminds Training College respects your privacy. We use
                essential cookies to make our site work. With your explicit
                consent, we also use analytics and third-party interactive media
                to improve your learning experience. No non-essential cookies or
                trackers are set before you choose.{" "}
                <Link
                  href="/cookies"
                  className="text-navy-900 font-semibold underline underline-offset-2 hover:text-navy-700"
                >
                  Read our Cookie Policy
                </Link>
                .
              </p>
            </div>

            {/* Equal-weight action buttons per PRD 16 */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={acceptAll}
                className="w-full sm:w-auto flex-1 whitespace-nowrap"
              >
                Accept all
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
                className="w-full sm:w-auto flex-1 whitespace-nowrap"
              >
                Reject non-essential
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenManage}
                className="w-full sm:w-auto flex-1 whitespace-nowrap"
              >
                Manage choices
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Floating Cookie Settings Icon (Bottom Left Corner) */}
      {hasResponded && (
        <button
          type="button"
          onClick={handleOpenManage}
          aria-label="Manage cookie preferences"
          title="Cookie preferences"
          className="fixed bottom-20 lg:bottom-5 left-4 lg:left-5 z-40 w-11 h-11 rounded-full bg-navy-900 text-white shadow-lg border border-gold-500/40 hover:border-gold-500 hover:bg-navy-800 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-paper group cursor-pointer animate-fade-in"
        >
          <Icon
            name="cookie"
            size={22}
            className="text-gold-300 group-hover:text-gold-500 transition-colors"
          />
          <span className="sr-only">Cookie preferences</span>
          {/* Tooltip on hover */}
          <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-sm bg-navy-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md border border-white/10 hidden sm:block">
            Cookie preferences
          </span>
        </button>
      )}

      {/* 3. Granular Manage Preferences Modal */}
      {isManageOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl border border-line p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
              <Heading
                level="h2"
                id="cookie-preferences-title"
                className="text-2xl text-navy-900"
              >
                Cookie Preferences
              </Heading>
              <button
                type="button"
                onClick={closeManage}
                aria-label="Close preferences"
                className="p-2 text-ink-soft hover:text-navy-900 rounded-sm hover:bg-paper transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <p className="text-sm text-ink-soft mb-6">
              Manage how cookies are used on Smartminds Training College. You
              can adjust your preferences at any time via the &quot;Cookie
              settings&quot; link in our website footer.
            </p>

            <div className="space-y-4">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-sm border border-line bg-paper flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy-900 text-sm">
                      Strictly Necessary
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-navy-900/10 text-navy-900">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                    Essential for website security, page routing, form token
                    security, and remembering your consent preferences.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  aria-label="Strictly necessary cookies always enabled"
                  className="w-5 h-5 accent-navy-900 mt-1 cursor-not-allowed opacity-80"
                />
              </div>

              {/* Category 2: Performance & Analytics */}
              <label className="p-4 rounded-sm border border-line hover:border-navy-900/30 transition-colors flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <span className="font-semibold text-navy-900 text-sm block">
                    Analytics & Performance
                  </span>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                    Aggregated, anonymous metrics (such as Google Analytics 4)
                    to understand how visitors use our course pages.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={tempAnalytics}
                  onChange={(e) => setTempAnalytics(e.target.checked)}
                  aria-label="Allow analytics and performance cookies"
                  className="w-5 h-5 accent-navy-900 mt-1 cursor-pointer"
                />
              </label>

              {/* Category 3: Interactive Media & Video Embeds */}
              <label className="p-4 rounded-sm border border-line hover:border-navy-900/30 transition-colors flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <span className="font-semibold text-navy-900 text-sm block">
                    Interactive Media & Embeds
                  </span>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                    Enables embedded course preview videos, appointment
                    schedulers, and live support chat.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={tempEmbeds}
                  onChange={(e) => setTempEmbeds(e.target.checked)}
                  aria-label="Allow media and interactive embeds"
                  className="w-5 h-5 accent-navy-900 mt-1 cursor-pointer"
                />
              </label>

              {/* Category 4: Marketing & Social */}
              <label className="p-4 rounded-sm border border-line hover:border-navy-900/30 transition-colors flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <span className="font-semibold text-navy-900 text-sm block">
                    Marketing & Social Channels
                  </span>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                    Used to measure course awareness campaigns and display
                    social media content such as TikTok learner testimonials.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={tempMarketing}
                  onChange={(e) => setTempMarketing(e.target.checked)}
                  aria-label="Allow marketing cookies"
                  className="w-5 h-5 accent-navy-900 mt-1 cursor-pointer"
                />
              </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-line">
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
                className="w-full sm:w-auto"
              >
                Reject all
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveCustom}
                  className="w-full sm:w-auto flex-1"
                >
                  Save preferences
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={acceptAll}
                  className="w-full sm:w-auto flex-1"
                >
                  Accept all
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
