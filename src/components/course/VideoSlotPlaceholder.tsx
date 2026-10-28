import React from "react";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/content/siteConfig";

interface VideoSlotPlaceholderProps {
  courseTitle: string;
}

export const VideoSlotPlaceholder: React.FC<VideoSlotPlaceholderProps> = ({
  courseTitle,
}) => {
  return (
    <div
      aria-label="Course delivery and qualification overview"
      className="relative w-full rounded-lg bg-navy-900 text-white overflow-hidden p-6 sm:p-8 border border-navy-800 shadow-md"
    >
      {/* Decorative hairline gold accent rule */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />

      {/* Decorative crescent background geometry */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 pointer-events-none opacity-[0.06] text-white"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
          />
        </svg>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-gold-300 font-semibold">
              British Accredited Delivery Model
            </span>
          </div>
          <span className="text-xs text-white/70 font-mono">
            Smartminds Training College • Blended &amp; Online Distance Learning
          </span>
        </div>

        <div>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-wide">
            How Your Qualification is Delivered
          </h3>
          <p className="text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
            Every learner enrolled in <strong className="text-white font-semibold">{courseTitle}</strong> receives a structured, supported learning journey guided by qualified UK assessors and internal verifiers.
          </p>
        </div>

        {/* 4 Delivery Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-sm bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-9 h-9 rounded-sm bg-gold-500/20 text-gold-300 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="video" size={18} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-white">
                Live Evening Webinars (Zoom)
              </h4>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Interactive weekly evening classes with qualified assessors. Ask questions live with session replays saved for revision.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-9 h-9 rounded-sm bg-gold-500/20 text-gold-300 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="user" size={18} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-white">
                1-to-1 Dedicated Assessor
              </h4>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Personal tutor assigned from day one. Written coursework feedback returned within 5 working days with phone/WhatsApp support.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-9 h-9 rounded-sm bg-gold-500/20 text-gold-300 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="check-circle" size={18} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-white">
                Workplace Observations
              </h4>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Practical competency demonstrated in your current care/workplace role, or verified through remote portfolio evidence and assessor observations.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-9 h-9 rounded-sm bg-gold-500/20 text-gold-300 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="graduation-cap" size={18} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-white">
                Direct Ofqual Certification
              </h4>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Nationally recognised British qualification certificate awarded directly by our regulated awarding organisations (TQUK / Highfield).
              </p>
            </div>
          </div>
        </div>

        {/* Footer Contact Strip */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <Icon name="phone" size={14} className="text-gold-300" />
            <span>Admissions line: <strong className="text-white">{siteConfig.contact.phoneDisplay}</strong></span>
          </div>
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gold-300 hover:text-white font-semibold transition-colors"
          >
            <Icon name="whatsapp" size={14} />
            <span>Ask questions on WhatsApp ({siteConfig.contact.whatsappDisplay})</span>
          </a>
        </div>
      </div>
    </div>
  );
};
