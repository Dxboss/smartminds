"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Course, CourseLevel, PaymentPlanTemplate } from "@/content/types";
import { globalSettings } from "@/content/globals";
import { defaultPlan6Months } from "@/content/plans";
import { calculatePricing, formatCurrency } from "@/content/pricing";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";

interface CoursePricingPanelProps {
  course: Course;
  selectedLevel: CourseLevel;
}

export const CoursePricingPanel: React.FC<CoursePricingPanelProps> = ({
  course,
  selectedLevel,
}) => {
  const plans =
    selectedLevel.plans.length > 0 ? selectedLevel.plans : [defaultPlan6Months];
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [paymentMode, setPaymentMode] = useState<"full" | "instalments">(
    "full"
  );
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const activePlan: PaymentPlanTemplate =
    plans[selectedPlanIndex] || plans[0] || defaultPlan6Months;
  const pricing = calculatePricing(selectedLevel, activePlan, globalSettings);

  const isFundedOnly = course.funding === "funded";
  const hasFundingOption =
    course.funding === "both" || course.funding === "funded";

  const renderContent = () => {
    // 1. If Funded Only: NO pay buttons per PRD 10.4 & Done When criteria
    if (isFundedOnly) {
      return (
        <div className="space-y-6">
          <div className="p-4 rounded-sm bg-navy-900/5 border border-line space-y-2">
            <Tag variant="gold">Government Funded</Tag>
            <h4 className="font-heading font-bold text-xl text-navy-900">
              100% Fully Funded Tuition
            </h4>
            <p className="text-xs text-ink-soft leading-relaxed">
              This qualification is supported by UK government adult skills
              funding (AEB / Free Courses for Jobs). Eligible learners pay £0
              tuition fees.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-ink">
            <div className="flex items-center gap-2">
              <Icon
                name="check"
                size={15}
                className="text-navy-900 flex-shrink-0"
              />
              <span>Full course materials & live tutor access included</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                name="check"
                size={15}
                className="text-navy-900 flex-shrink-0"
              />
              <span>No tuition fees, loans, or repayments</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                name="check"
                size={15}
                className="text-navy-900 flex-shrink-0"
              />
              <span>Subject to UK residency and eligibility check</span>
            </div>
          </div>

          <div className="pt-4 border-t border-line space-y-3">
            <Link
              href="/funding"
              className="w-full inline-flex items-center justify-center min-h-[44px] px-5 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-bold text-sm transition-colors text-center shadow-sm"
            >
              Check funding eligibility &rarr;
            </Link>

            <BookingCTAButton variant="outline" size="md" className="w-full">
              Talk to an adviser
            </BookingCTAButton>
          </div>
        </div>
      );
    }

    // 2. Self-pay or Both: Show Pay in Full and Instalment breakdowns
    return (
      <div className="space-y-6">
        {/* Funded notification pill if course has both routes */}
        {hasFundingOption && (
          <div className="p-2.5 rounded-sm bg-gold-300/30 border border-gold-500/40 flex items-center justify-between text-xs text-navy-900">
            <span className="font-semibold">Funded spaces available</span>
            <Link
              href="/funding"
              className="underline font-bold hover:text-navy-700 decoration-gold-700"
            >
              Check eligibility &rarr;
            </Link>
          </div>
        )}

        {/* Main Hero Price Box with Regular Price Strikethrough & Selling Price */}
        <div className="p-4 sm:p-5 rounded-md bg-paper border border-line space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft">
              {selectedLevel.level_label} Tuition Fee
            </span>
            {pricing.hasPriceSlash && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                <Icon name="sparkles" size={12} className="text-emerald-700" />
                <span>Save {formatCurrency(pricing.regularSaving)} ({pricing.regularDiscountPercent}% OFF)</span>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="font-heading font-bold text-3xl sm:text-4xl text-navy-900 leading-tight">
                {formatCurrency(paymentMode === "full" ? pricing.fullPayPrice : pricing.sellingPrice)}
              </span>
              {pricing.hasPriceSlash ? (
                <div className="inline-flex items-baseline gap-1 text-ink-soft">
                  <span className="text-xs">Regular:</span>
                  <span className="text-base sm:text-lg line-through font-semibold text-ink-soft/80">
                    {formatCurrency(pricing.regularPrice)}
                  </span>
                </div>
              ) : pricing.saving > 0 && paymentMode === "full" ? (
                <div className="inline-flex items-baseline gap-1 text-ink-soft">
                  <span className="text-xs">Standard:</span>
                  <span className="text-base line-through font-semibold text-ink-soft/80">
                    {formatCurrency(pricing.total)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="text-xs text-ink-soft flex items-center justify-between pt-1">
              <span>
                {paymentMode === "full"
                  ? "Pay in full upfront (Includes 10% cash discount)"
                  : "Selling price (Spread over 0% interest monthly plans)"}
              </span>
              <span className="text-[11px] font-mono text-navy-900 font-bold uppercase">
                {selectedLevel.level_label}
              </span>
            </div>
          </div>
        </div>

        {/* Payment mode switcher tabs */}
        <div className="grid grid-cols-2 p-1 bg-paper rounded-lg border border-line gap-1">
          <button
            type="button"
            onClick={() => setPaymentMode("full")}
            className={`py-2 px-3 rounded-sm text-xs font-heading font-bold transition-all min-h-[38px] ${
              paymentMode === "full"
                ? "bg-navy-900 text-white shadow-sm"
                : "text-navy-900 hover:bg-white"
            }`}
          >
            Pay in full
            {(selectedLevel.full_pay_discount_percent ??
              globalSettings.default_full_pay_discount_percent) > 0
              ? ` (Save ${selectedLevel.full_pay_discount_percent ?? globalSettings.default_full_pay_discount_percent}%)`
              : ""}
          </button>

          <button
            type="button"
            onClick={() => setPaymentMode("instalments")}
            className={`py-2 px-3 rounded-sm text-xs font-heading font-bold transition-all min-h-[38px] ${
              paymentMode === "instalments"
                ? "bg-navy-900 text-white shadow-sm"
                : "text-navy-900 hover:bg-white"
            }`}
          >
            Spread the cost
          </button>
        </div>

        {/* Breakdown for Pay in full */}
        {paymentMode === "full" ? (
          <div className="space-y-4">
            <div className="p-4 rounded-sm bg-white border border-line space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft block">
                Total tuition (Pay in full)
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-heading font-bold text-3xl text-navy-900">
                  {formatCurrency(pricing.fullPayPrice)}
                </span>
                {pricing.hasPriceSlash && (
                  <span className="text-sm line-through text-ink-soft/70">
                    Regular: {formatCurrency(pricing.regularPrice)}
                  </span>
                )}
                {pricing.saving > 0 && (
                  <span className="text-xs line-through text-ink-soft">
                    Selling: {formatCurrency(pricing.total)}
                  </span>
                )}
              </div>
              {(pricing.hasPriceSlash || pricing.saving > 0) && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-gold-300/40 text-xs font-bold text-navy-900">
                  <Icon name="check" size={13} className="text-navy-900" />
                  <span>
                    {pricing.hasPriceSlash
                      ? `Total saving: ${formatCurrency(pricing.regularPrice - pricing.fullPayPrice)} with special price & upfront discount`
                      : `You save ${formatCurrency(pricing.saving)} with upfront settlement`}
                  </span>
                </div>
              )}
            </div>

            <ul className="space-y-2 text-xs text-ink-soft">
              <li className="flex items-center gap-2">
                <Icon
                  name="check"
                  size={14}
                  className="text-navy-900 flex-shrink-0"
                />
                <span>Instant enrolment confirmation</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon
                  name="check"
                  size={14}
                  className="text-navy-900 flex-shrink-0"
                />
                <span>Full access to live classes and stream replays</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon
                  name="check"
                  size={14}
                  className="text-navy-900 flex-shrink-0"
                />
                <span>All awarding body registration fees included</span>
              </li>
            </ul>
          </div>
        ) : (
          /* Breakdown for Instalments */
          <div className="space-y-4">
            <div>
              <label
                htmlFor="plan-select"
                className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Choose plan duration:
              </label>
              <select
                id="plan-select"
                value={selectedPlanIndex}
                onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-sm border border-line bg-paper text-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
              >
                {plans.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.months > 1 ? `${p.months} monthly instalments` : "Single full payment"}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-sm bg-paper border border-line space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-soft">Deposit required today:</span>
                <span className="font-heading font-bold text-sm text-navy-900">
                  {formatCurrency(pricing.deposit)}
                </span>
              </div>

              {/* Hide instalment line when months = 1 (PRD Item 1) */}
              {pricing.months > 1 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-soft">
                    Monthly payment ({pricing.months} months):
                  </span>
                  <span className="font-heading font-bold text-sm text-navy-900">
                    {formatCurrency(pricing.monthly)}/mo
                  </span>
                </div>
              )}

              {pricing.months > 1 && pricing.finalPayment !== pricing.monthly && (
                <div className="flex justify-between items-center text-xs text-ink-soft pt-1 border-t border-line/60">
                  <span>Final payment (absorbs remainder):</span>
                  <span className="font-mono text-navy-900 font-semibold">
                    {formatCurrency(pricing.finalPayment)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-line flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-navy-900 block">
                    Total course fee:
                  </span>
                  {pricing.hasPriceSlash && (
                    <span className="text-[11px] text-ink-soft line-through block">
                      Regular: {formatCurrency(pricing.regularPrice)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-heading font-bold text-xl text-navy-900 block">
                    {formatCurrency(pricing.total)}
                  </span>
                  {pricing.hasPriceSlash && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                      Slashed by {formatCurrency(pricing.regularSaving)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-ink-soft leading-tight">
              Spread the cost at no extra charge. No credit agreements, no
              finance uplift, and no hidden fees.
            </p>
          </div>
        )}

        {/* Open Enrolment CTA Button */}
        <div className="pt-4 border-t border-line space-y-3">
          {(() => {
            const enrolParams = new URLSearchParams({
              course: course.id,
              level: selectedLevel.level_label,
              mode: paymentMode,
            });
            if (activePlan?.id) {
              enrolParams.set("plan", activePlan.id);
            }
            const enrolHref = `/enrol?${enrolParams.toString()}`;
            const discountPercent =
              selectedLevel.full_pay_discount_percent !== null &&
              selectedLevel.full_pay_discount_percent !== undefined
                ? selectedLevel.full_pay_discount_percent
                : globalSettings.default_full_pay_discount_percent;

            return (
              <>
                <Link
                  href={enrolHref}
                  className="w-full inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl bg-gold-500 hover:bg-gold-700 text-white font-heading font-extrabold text-base tracking-wide transition-all text-center shadow-subtle hover:shadow-card"
                >
                  Enrol &amp; Secure Your Place &rarr;
                </Link>

                <BookingCTAButton variant="outline" size="md" className="w-full">
                  Talk to an adviser
                </BookingCTAButton>

                <p className="text-center text-[11px] text-ink-soft">
                  Online enrolment is open. Secure your place now
                  {discountPercent > 0
                    ? ` with ${discountPercent}% upfront savings or 0% interest instalments.`
                    : " with flexible 0% interest instalments."}
                </p>
              </>
            );
          })()}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Panel */}
      <aside
        aria-label="Course pricing and enrolment options"
        className="hidden lg:block bg-white rounded-lg border border-line p-6 shadow-subtle sticky top-24 space-y-4"
      >
        <div className="border-b border-line pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-ink-soft block">
              Level Selected:
            </span>
            <strong className="font-heading text-lg text-navy-900">
              {selectedLevel.level_label}
            </strong>
          </div>
          <Tag variant="navy">{course.type.toUpperCase()}</Tag>
        </div>

        {renderContent()}
      </aside>

      {/* Mobile Sticky Bottom Bar per PRD 10.3 */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line p-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono text-ink-soft block">
            {selectedLevel.level_label} Pricing
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-heading font-bold text-lg text-navy-900 leading-none">
              {isFundedOnly ? "Funded (£0.00)" : formatCurrency(pricing.fullPayPrice)}
            </span>
            {!isFundedOnly && pricing.hasPriceSlash && (
              <span className="text-xs line-through text-ink-soft">
                {formatCurrency(pricing.regularPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className="min-h-[44px] px-5 rounded-sm bg-navy-900 text-white font-heading font-bold text-sm flex items-center gap-1.5 shadow-sm"
        >
          <span>View pricing & plans</span>
          <Icon name="chevron-down" size={15} />
        </button>
      </div>

      {/* Mobile Bottom Sheet Modal */}
      {mobileSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Course pricing panel"
          className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-t-lg border-t border-line w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-ink-soft block">
                  {selectedLevel.level_label}
                </span>
                <strong className="font-heading text-lg text-navy-900">
                  {course.title}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="w-10 h-10 rounded-sm flex items-center justify-center text-ink hover:bg-paper"
                aria-label="Close pricing panel"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};
