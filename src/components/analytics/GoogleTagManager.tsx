"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { useConsent } from "@/context/ConsentContext";

interface GoogleTagManagerProps {
  gtmId?: string;
}

/**
 * GoogleTagManager: Injects GTM / GA4 container script strictly AFTER
 * explicit cookie consent is granted by the user per PRD Section 16 & Prompt 8.
 */
export const GoogleTagManager: React.FC<GoogleTagManagerProps> = ({
  gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-SMARTMINDS",
}) => {
  const { preferences } = useConsent();

  // Listen for custom lead_submitted and call_booked events
  useEffect(() => {
    const handleCallBooked = (e: Event) => {
      const customEvent = e as CustomEvent;
      interface WindowWithDataLayer extends Window {
        dataLayer?: Array<Record<string, unknown>>;
      }
      const win = window as unknown as WindowWithDataLayer;
      if (win.dataLayer) {
        win.dataLayer.push({
          event: "call_booked",
          ...customEvent.detail,
        });
      }
    };

    window.addEventListener("call_booked", handleCallBooked);
    return () => window.removeEventListener("call_booked", handleCallBooked);
  }, []);

  // Strict check: if analytics cookie consent is not granted, DO NOT render or load scripts
  if (!preferences.analytics) {
    return null;
  }

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  );
};
