"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { MessageTemplate, MessageLogEntry, Learner, Coupon } from "@/lib/repositories/types";
import { EmailSettings } from "@/lib/emailSettings";
import { TemplateMessageComposer } from "@/components/admin/TemplateMessageComposer";
import { EmailSettingsManager } from "@/components/admin/EmailSettingsManager";
import { CouponsManager } from "@/components/admin/CouponsManager";

interface Props {
  templates: MessageTemplate[];
  initialLogs: MessageLogEntry[];
  learners: Learner[];
  emailSettings: EmailSettings;
  canManageSettings: boolean;
  coupons?: Coupon[];
}

export const AdminCommunicationsHub: React.FC<Props> = ({
  templates,
  initialLogs,
  learners,
  emailSettings,
  canManageSettings,
  coupons = [],
}) => {
  const [activeTab, setActiveTab] = useState<"composer" | "vouchers" | "senders">("composer");
  const [presetTemplateKey, setPresetTemplateKey] = useState<string | undefined>(undefined);
  const [presetPlaceholders, setPresetPlaceholders] = useState<Record<string, string> | undefined>(undefined);

  const handleSelectCouponForMessage = (c: Coupon) => {
    setPresetTemplateKey("alumni_progression_coupon");
    setPresetPlaceholders({
      coupon_code: c.code,
      discount_text: c.discountType === "percent" ? `${c.discountValue}% off` : `£${c.discountValue} off`,
      expiry_date: c.validUntil
        ? new Date(c.validUntil).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Next 60 Days",
      course_recommendation:
        c.appliesTo === "tutoring"
          ? "1-on-1 Academic Tutoring (Term Booking)"
          : "Level 5 Leadership & Management or CYPW Diploma",
    });
    setActiveTab("composer");
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-line gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("composer")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "composer"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="mail" className="w-4 h-4" />
          <span>Notice Composer &amp; Broadcast</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vouchers")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "vouchers"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="tag" className="w-4 h-4 text-gold-700" />
          <span>Alumni Vouchers &amp; Coupons</span>
          <span className="text-[10px] bg-navy-900/10 text-navy-900 font-bold px-1.5 py-0.5 rounded ml-1 font-mono">
            {coupons.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("senders")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "senders"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="edit" className="w-4 h-4" />
          <span>Departmental Senders &amp; Automations</span>
          {canManageSettings && (
            <span className="text-[10px] bg-navy-900 text-gold-400 font-bold px-1.5 py-0.5 rounded ml-1">
              Superadmin
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "composer" ? (
        <TemplateMessageComposer
          templates={templates}
          initialLogs={initialLogs}
          learners={learners}
          presetTemplateKey={presetTemplateKey}
          presetPlaceholders={presetPlaceholders}
        />
      ) : activeTab === "vouchers" ? (
        <CouponsManager
          initialCoupons={coupons}
          onSelectCouponForMessage={handleSelectCouponForMessage}
        />
      ) : (
        <EmailSettingsManager
          initialSettings={emailSettings}
          canEdit={canManageSettings}
        />
      )}
    </div>
  );
};
