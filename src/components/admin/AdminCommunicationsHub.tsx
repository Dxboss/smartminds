"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { MessageTemplate, MessageLogEntry, Learner, Enrolment, ClassCohort, Coupon } from "@/lib/repositories/types";
import { EmailSettings } from "@/lib/emailSettings";
import { TemplateMessageComposer } from "@/components/admin/TemplateMessageComposer";
import { EmailSettingsManager } from "@/components/admin/EmailSettingsManager";
import { CouponsManager } from "@/components/admin/CouponsManager";

interface Props {
  templates: MessageTemplate[];
  initialLogs: MessageLogEntry[];
  learners: Learner[];
  enrolments?: Enrolment[];
  classes?: ClassCohort[];
  emailSettings: EmailSettings;
  canManageSettings: boolean;
  coupons?: Coupon[];
  defaultEventCoupons?: {
    defaultBirthdayCouponCode?: string;
    defaultAlumniCouponCode?: string;
  };
}

export const AdminCommunicationsHub: React.FC<Props> = ({
  templates,
  initialLogs,
  learners,
  enrolments = [],
  classes = [],
  emailSettings,
  canManageSettings,
  coupons = [],
  defaultEventCoupons,
}) => {
  const [activeTab, setActiveTab] = useState<"composer" | "vouchers" | "senders">("composer");
  const [presetTemplateKey, setPresetTemplateKey] = useState<string | undefined>(undefined);
  const [presetPlaceholders, setPresetPlaceholders] = useState<Record<string, string> | undefined>(undefined);

  // Compute Upcoming Birthdays (Within the next 14 days)
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const results: Array<{
      learner: Learner;
      formattedDob: string;
      daysUntil: number;
      isToday: boolean;
    }> = [];

    learners.forEach((l) => {
      if (!l.dateOfBirth) return;
      const dob = new Date(l.dateOfBirth);
      if (isNaN(dob.getTime())) return;

      const birthMonth = dob.getMonth();
      const birthDay = dob.getDate();

      // Check birthday in this year
      let bdayThisYear = new Date(today.getFullYear(), birthMonth, birthDay);
      if (bdayThisYear < new Date(today.getFullYear(), currentMonth, currentDay)) {
        bdayThisYear = new Date(today.getFullYear() + 1, birthMonth, birthDay);
      }

      const diffTime = bdayThisYear.getTime() - new Date(today.getFullYear(), currentMonth, currentDay).getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 14) {
        results.push({
          learner: l,
          formattedDob: dob.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
          daysUntil: diffDays,
          isToday: diffDays === 0,
        });
      }
    });

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [learners]);

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

  const handleSendBirthdayWish = (learner: Learner) => {
    const birthdayCode = defaultEventCoupons?.defaultBirthdayCouponCode || "BDAY15";
    const matchedCoupon = coupons.find((c) => c.code.toUpperCase() === birthdayCode.toUpperCase());
    const discountText = matchedCoupon
      ? matchedCoupon.discountType === "percent"
        ? `${matchedCoupon.discountValue}% discount`
        : `£${matchedCoupon.discountValue} voucher`
      : "15% birthday discount";

    const expiry = matchedCoupon?.validUntil
      ? new Date(matchedCoupon.validUntil).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Next 30 Days";

    setPresetTemplateKey("student_birthday_greeting");
    setPresetPlaceholders({
      first_name: learner.firstName,
      coupon_code: birthdayCode === "none" ? "SMTC-BIRTHDAY" : birthdayCode,
      discount_text: birthdayCode === "none" ? "Complimentary congratulations" : discountText,
      expiry_date: expiry,
    });
    setActiveTab("composer");
  };

  return (
    <div className="space-y-6">
      {/* 🎂 Birthdays Around the Corner Alert Banner */}
      {upcomingBirthdays.length > 0 && (
        <div className="p-4 rounded-md border border-gold-500/40 bg-gradient-to-r from-paper via-white to-amber-50/40 space-y-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎂</span>
              <h2 className="font-heading font-bold text-sm text-navy-900 uppercase tracking-wider">
                Birthdays Around the Corner ({upcomingBirthdays.length})
              </h2>
            </div>
            <span className="text-[10px] text-ink-soft">
              Active learners celebrating birthdays in the next 14 days
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {upcomingBirthdays.map(({ learner, formattedDob, daysUntil, isToday }) => (
              <div
                key={learner.id}
                className={`p-3 rounded-sm border flex items-center justify-between gap-3 text-xs ${
                  isToday
                    ? "bg-amber-100/60 border-amber-300 text-amber-950 font-semibold"
                    : "bg-white border-line text-navy-900"
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>{learner.firstName} {learner.lastName}</span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-xs text-[9px] uppercase font-bold animate-pulse">
                        Today!
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-soft mt-0.5">
                    {formattedDob} • {isToday ? "Celebrating today!" : `In ${daysUntil} day${daysUntil === 1 ? "" : "s"}`}
                  </div>
                  {learner.courseTitle && (
                    <div className="text-[10px] text-ink-soft truncate max-w-[170px]">
                      {learner.courseTitle}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSendBirthdayWish(learner)}
                  className="px-2.5 py-1.5 rounded-sm bg-navy-900 text-gold-300 font-bold text-[11px] hover:bg-navy-800 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Icon name="mail" size={12} />
                  <span>Wish Happy Birthday</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
          enrolments={enrolments}
          classes={classes}
          coupons={coupons}
          presetTemplateKey={presetTemplateKey}
          presetPlaceholders={presetPlaceholders}
        />
      ) : activeTab === "vouchers" ? (
        <CouponsManager
          initialCoupons={coupons}
          defaultEventCoupons={defaultEventCoupons}
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
