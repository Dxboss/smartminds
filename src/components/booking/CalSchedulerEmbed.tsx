"use client";

import React, { useState, useEffect } from "react";
import { siteConfig } from "@/content/siteConfig";
import { useConsent } from "@/context/ConsentContext";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface CalSchedulerEmbedProps {
  courseInterest?: string;
  onBooked?: () => void;
}

export const CalSchedulerEmbed: React.FC<CalSchedulerEmbedProps> = ({
  courseInterest,
  onBooked,
}) => {
  const { preferences, openManage } = useConsent();
  const [isBooked, setIsBooked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Cal.com URL with prefilled parameters
  const calBaseUrl = siteConfig.booking.embedUrl;
  const calParams = new URLSearchParams();
  calParams.set("embed", "true");
  if (courseInterest) {
    calParams.set("notes", `Interested in: ${courseInterest}`);
  }
  const fullSchedulerUrl = `${calBaseUrl}?${calParams.toString()}`;

  // Direct external booking URL fallback
  const directBookingUrl = `${calBaseUrl}${
    courseInterest
      ? `?notes=${encodeURIComponent(`Interested in: ${courseInterest}`)}`
      : ""
  }`;

  // Listen for Cal.com booking completion postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Cal.com emits { origin: "CAL", action: "bookingSuccessful", data: ... }
      if (
        event.data?.origin === "CAL" ||
        event.data?.action === "bookingSuccessful" ||
        (typeof event.data === "string" &&
          event.data.includes("bookingSuccessful"))
      ) {
        setIsBooked(true);

        // Fire custom call_booked DOM event
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("call_booked", {
              detail: {
                course: courseInterest,
                timestamp: new Date().toISOString(),
              },
            })
          );

          // Push to dataLayer if present (GA4/GTM)
          interface WindowWithDataLayer extends Window {
            dataLayer?: Array<Record<string, unknown>>;
          }
          const win = window as unknown as WindowWithDataLayer;
          if (win.dataLayer) {
            win.dataLayer.push({
              event: "call_booked",
              course_interest: courseInterest,
            });
          }
        }

        if (onBooked) {
          onBooked();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [courseInterest, onBooked]);

  // If already booked successfully
  if (isBooked) {
    return (
      <div className="p-8 text-center space-y-4 bg-paper rounded-lg border border-line">
        <div className="w-14 h-14 rounded-full bg-navy-900 text-white flex items-center justify-center mx-auto shadow-md">
          <Icon name="check" size={28} className="text-gold-500" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-navy-900">
          Consultation Booked Successfully!
        </h3>
        <p className="text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
          Thank you. A calendar invitation and video link have been sent to your
          email. Our academic adviser looks forward to speaking with you.
        </p>
        <div className="pt-2">
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            <Icon name="whatsapp" size={14} className="text-gold-500" />
            Have questions before your call? Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // Check consent: If marketing/third-party cookies are not consented, show graceful fallback per PRD Section 16
  const hasEmbedConsent = preferences.marketing;

  if (!hasEmbedConsent) {
    return (
      <div className="rounded-lg border border-line bg-paper p-6 sm:p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-sm bg-navy-900/10 text-navy-900 mx-auto flex items-center justify-center">
          <Icon name="calendar" size={24} />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-heading text-xl font-bold text-navy-900">
            Book Your Free 15-Minute Consultation
          </h3>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
            To view the live scheduling calendar directly inside this window,
            please allow external cookies. Alternatively, book directly on our
            external scheduler or message us on WhatsApp.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={directBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>Open booking calendar in new tab</span>
            <Icon name="external-link" size={15} />
          </a>

          <Button
            variant="outline"
            size="md"
            onClick={openManage}
            className="w-full sm:w-auto"
          >
            Manage cookie preferences
          </Button>
        </div>

        {/* WhatsApp Link under scheduler per PRD 10.8 */}
        <div className="pt-4 border-t border-line">
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 decoration-gold-500 min-h-[44px]"
          >
            <Icon name="whatsapp" size={16} className="text-gold-500" />
            Prefer WhatsApp? Message us directly
          </a>
        </div>
      </div>
    );
  }

  // When consented: Render responsive Cal.com iframe embed
  return (
    <div className="space-y-4">
      <div className="relative w-full rounded-lg overflow-hidden border border-line bg-white min-h-[460px] sm:min-h-[520px]">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper text-ink-soft space-y-3 p-6 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-navy-900 border-t-transparent animate-spin" />
            <span className="text-xs font-mono">
              Loading calendar available slots...
            </span>
          </div>
        )}

        <iframe
          src={fullSchedulerUrl}
          title="Book Free Course Consultation Calendar"
          className="w-full h-[520px] border-0"
          onLoad={() => setIframeLoaded(true)}
          allow="camera; microphone; autoplay"
        />
      </div>

      {/* Reassurance & WhatsApp Link under scheduler per PRD 10.8 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft pt-1">
        <div className="flex items-center gap-1.5">
          <Icon name="clock" size={14} className="text-navy-900" />
          <span>Times shown in your local time zone</span>
        </div>

        <a
          href={siteConfig.contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 decoration-gold-500 min-h-[44px] inline-flex items-center gap-1.5"
        >
          <Icon name="whatsapp" size={15} className="text-gold-500" />
          Prefer WhatsApp? Message us
        </a>
      </div>
    </div>
  );
};
