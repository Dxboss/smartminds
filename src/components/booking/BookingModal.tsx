"use client";

import React, { useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import { siteConfig } from "@/content/siteConfig";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

export const BookingModal: React.FC = () => {
  const { isOpen, courseInterest, closeBooking } = useBooking();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeBooking();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeBooking]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-900/60 backdrop-blur-sm transition-opacity"
    >
      {/* Backdrop click area */}
      <div
        className="absolute inset-0"
        onClick={closeBooking}
        aria-hidden="true"
      />

      {/* Sheet on mobile, centered modal on desktop */}
      <div className="relative z-10 w-full sm:max-w-2xl bg-white sm:rounded-lg shadow-2xl border border-line flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-slide-up sm:animate-fade-in">
        {/* Header */}
        <div className="bg-paper border-b border-line p-5 sm:p-6 flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon name="star" size={18} className="text-gold-500" />
              <span className="text-xs font-semibold tracking-wider uppercase text-navy-700">
                1-on-1 Academic Consultation
              </span>
              {courseInterest && (
                <Tag variant="navy" className="text-xs">
                  {courseInterest}
                </Tag>
              )}
            </div>
            <Heading
              level="h2"
              id="booking-modal-title"
              className="text-2xl sm:text-3xl text-navy-900"
            >
              Get Free Course Advice
            </Heading>
            <p className="text-sm text-ink-soft mt-1">
              Speak directly with an experienced course tutor to check funding
              eligibility, entry requirements, and flexible instalment options.
            </p>
          </div>

          <button
            type="button"
            onClick={closeBooking}
            aria-label="Close booking modal"
            className="p-2 text-ink-soft hover:text-navy-900 rounded-sm hover:bg-white border border-transparent hover:border-line transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        {/* Content Body: External Scheduler Placeholder Shell (Cal.com embed integration in Prompt 6) */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          <div className="rounded-lg border-2 border-dashed border-line bg-paper/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-sm bg-navy-900/10 text-navy-900 flex items-center justify-center mb-4">
              <Icon name="calendar" size={28} />
            </div>
            <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
              Appointment Scheduler
            </h3>
            <p className="text-sm text-ink-soft max-w-md mb-6 leading-relaxed">
              Our interactive scheduling calendar loads here. Choose a 15-minute
              slot that fits your schedule for a phone or video consultation.
            </p>
            <Tag variant="live">
              Live consultation calendar (Prompt 6 integration slot)
            </Tag>
          </div>

          {/* Consultation highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-paper rounded-sm border border-line text-xs">
              <span className="font-semibold text-navy-900 block mb-0.5">
                Duration
              </span>
              <span className="text-ink-soft">15-minute 1-on-1 call</span>
            </div>
            <div className="p-3 bg-paper rounded-sm border border-line text-xs">
              <span className="font-semibold text-navy-900 block mb-0.5">
                Expertise
              </span>
              <span className="text-ink-soft">Subject-specialist tutor</span>
            </div>
            <div className="p-3 bg-paper rounded-sm border border-line text-xs">
              <span className="font-semibold text-navy-900 block mb-0.5">
                Commitment
              </span>
              <span className="text-ink-soft">No obligation or pressure</span>
            </div>
          </div>
        </div>

        {/* Footer with WhatsApp Fallback per PRD 10.8 */}
        <div className="bg-paper border-t border-line p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left flex-shrink-0">
          <span className="text-xs text-ink-soft">
            Prefer instant messaging over a call?
          </span>
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 decoration-gold-500 hover:decoration-navy-700 min-h-[44px]"
          >
            <Icon name="whatsapp" size={18} className="text-gold-500" />
            Prefer WhatsApp? Message us
          </a>
        </div>
      </div>
    </div>
  );
};
