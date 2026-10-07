import React from "react";
import { siteConfig } from "@/content/siteConfig";
import { Icon } from "@/components/ui/Icon";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";

export const CourseTrustRow: React.FC = () => {
  return (
    <section
      aria-label="Accreditations and advisory"
      className="bg-paper rounded-lg border border-line p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-navy-900 mb-1">
            Talk to someone before you enrol
          </h3>
          <p className="text-xs text-ink-soft max-w-md">
            Our advisers can review your past qualifications, confirm entry
            criteria, and guide you through funding eligibility.
          </p>
        </div>

        <BookingCTAButton variant="primary" size="md">
          Talk to someone first
        </BookingCTAButton>
      </div>

      <div className="pt-4 border-t border-line flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-mono uppercase text-ink-soft mr-2">
          Accredited by:
        </span>
        {siteConfig.accreditations.map((acc) => (
          <div
            key={acc.acronym}
            className="px-2.5 py-1 rounded-sm bg-white border border-line text-xs font-heading font-bold text-navy-900 flex items-center gap-1.5"
          >
            <Icon name="shield-check" size={13} className="text-navy-900" />
            <span>{acc.acronym}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
