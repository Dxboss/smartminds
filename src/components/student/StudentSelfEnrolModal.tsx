"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Course } from "@/content/types";
import { Icon } from "@/components/ui/Icon";
import { studentSelfAddCourseAction } from "@/app/actions/studentPaymentActions";

interface Props {
  availableCourses: Course[];
  existingCourseIds?: string[];
  collegeBankDetails?: {
    bankName: string;
    accountName: string;
    sortCode: string;
    accountNumber: string;
    bacsReferencePrefix: string;
  };
}

function isLevelFiveOrAbove(levelLabel: string): boolean {
  if (!levelLabel) return false;
  const match = levelLabel.match(/(?:level|lvl|\bl)\s*(\d+)/i);
  if (match && parseInt(match[1], 10) >= 5) return true;
  return /\b([5-8])\b/.test(levelLabel);
}

export function StudentSelfEnrolModal({
  availableCourses,
  existingCourseIds = [],
  collegeBankDetails,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectableCourses = availableCourses.filter((c) => c && c.published !== false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    selectableCourses[0]?.id || ""
  );

  const selectedCourse =
    selectableCourses.find((c) => c.id === selectedCourseId) || selectableCourses[0];
  const courseLevels = selectedCourse?.levels || [];

  const [selectedLevelLabel, setSelectedLevelLabel] = useState<string>(
    courseLevels[0]?.level_label || "Level 3"
  );

  const currentLevelObj =
    courseLevels.find((l) => l.level_label === selectedLevelLabel) || courseLevels[0];

  const [paymentOption, setPaymentOption] = useState<"full" | "instalments">("instalments");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bacs">("card");

  // Level 5+ fallback: [6, 10, 12, 14] vs Level 2-4: [3, 6, 10, 12]
  const isL5Plus = isLevelFiveOrAbove(selectedLevelLabel);
  const allowedMonths = isL5Plus ? [6, 10, 12, 14] : [3, 6, 10, 12];
  const [selectedMonths, setSelectedMonths] = useState<number>(allowedMonths[0]);

  // Tutoring options
  const isOneToOne =
    selectedCourse?.id === "course-tutoring-children" ||
    Boolean(selectedCourse?.is_private_tutoring);
  const [tutoringSlot, setTutoringSlot] = useState("Saturday, 10:00am");
  const [tutoringDeliveryMode, setTutoringDeliveryMode] = useState<
    "online" | "physical_centre" | "room_home_request"
  >("physical_centre");
  const [tutoringAddress, setTutoringAddress] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{
    courseTitle: string;
    levelLabel: string;
    paymentRef: string;
    amountPaid: number;
    isCard: boolean;
  } | null>(null);

  // Sync selected level when course changes
  useEffect(() => {
    if (courseLevels.length > 0) {
      setSelectedLevelLabel(courseLevels[0].level_label);
    }
  }, [selectedCourseId]);

  // Sync allowed months when level changes
  useEffect(() => {
    if (!allowedMonths.includes(selectedMonths)) {
      setSelectedMonths(allowedMonths[0]);
    }
  }, [selectedLevelLabel, allowedMonths, selectedMonths]);

  const rawPrice = currentLevelObj?.price_gbp || 1250;
  const fullPayDiscount = currentLevelObj?.full_pay_discount_percent ?? 10;
  const fullPayPrice = Math.round(rawPrice * (1 - fullPayDiscount / 100));
  const deposit = Math.round(rawPrice * 0.15); // 15% deposit
  const remaining = Math.max(0, rawPrice - deposit);
  const monthlyRate =
    selectedMonths > 1 ? (remaining / (selectedMonths - 1)).toFixed(2) : "0.00";

  const handleEnrolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      try {
        const res = await studentSelfAddCourseAction({
          courseId: selectedCourse.id,
          levelLabel: selectedLevelLabel,
          paymentOption,
          planMonths: paymentOption === "instalments" ? selectedMonths : 1,
          paymentMethod,
          tutoringSlot: isOneToOne ? tutoringSlot : undefined,
          tutoringDeliveryMode: isOneToOne ? tutoringDeliveryMode : undefined,
          tutoringRoomOrAddress: isOneToOne ? tutoringAddress.trim() : undefined,
        });

        if (res.success && res.enrolment) {
          setSuccessData({
            courseTitle: res.enrolment.courseTitle,
            levelLabel: res.enrolment.courseLevelLabel,
            paymentRef: res.paymentRef,
            amountPaid: res.amountPaid,
            isCard: res.isCard,
          });
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to process enrolment.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setSuccessData(null);
          setErrorMsg("");
        }}
        className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
      >
        <Icon name="plus" size={14} className="text-gold-300" />
        <span>Enrol in Another Qualification</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center font-bold">
                  <Icon name="graduation-cap" size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-navy-900">
                    Enrol in Another Qualification
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Add an additional accredited diploma or certificate to your active student profile.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (successData) router.refresh();
                }}
                className="text-ink-soft hover:text-navy-900 text-lg font-bold px-2"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successData ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <h4 className="font-heading text-xl font-bold text-navy-900">
                  Enrolment Confirmed!
                </h4>
                <p className="text-xs text-ink-soft max-w-md mx-auto">
                  You are now enrolled on{" "}
                  <strong className="text-navy-900">
                    {successData.courseTitle} ({successData.levelLabel})
                  </strong>
                  . It has been immediately linked to your student dashboard classroom view.
                </p>

                <div className="p-4 bg-paper rounded-sm border border-line text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Payment Reference:</span>
                    <strong className="font-mono text-navy-900">{successData.paymentRef}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Amount Recorded:</span>
                    <strong className="font-mono text-emerald-700">£{successData.amountPaid.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Payment Method:</span>
                    <strong className="text-navy-900">
                      {successData.isCard ? "Card Payment Recorded" : "BACS Bank Transfer (Pending)"}
                    </strong>
                  </div>
                </div>

                {!successData.isCard && collegeBankDetails && (
                  <div className="p-4 bg-navy-900/5 rounded-sm border border-navy-900/15 text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                      College Bank Transfer Instructions
                    </div>
                    <p className="text-[11px] text-ink-soft">
                      Please send your transfer from your banking app using reference{" "}
                      <strong className="font-mono text-navy-900">{successData.paymentRef}</strong>:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-ink-soft block">Bank:</span>
                        <span className="font-semibold">{collegeBankDetails.bankName}</span>
                      </div>
                      <div>
                        <span className="text-ink-soft block">Sort Code:</span>
                        <span className="font-mono font-semibold">{collegeBankDetails.sortCode}</span>
                      </div>
                      <div>
                        <span className="text-ink-soft block">Account Number:</span>
                        <span className="font-mono font-semibold">{collegeBankDetails.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-ink-soft block">Payee:</span>
                        <span className="font-semibold">{collegeBankDetails.accountName}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.refresh();
                    }}
                    className="px-6 py-2.5 bg-navy-900 text-white rounded-sm text-xs font-bold hover:bg-navy-700 transition-colors shadow-sm"
                  >
                    Go to My New Classroom View
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnrolSubmit} className="space-y-4 text-xs">
                {/* Course Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Select Accredited Programme
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-xs font-semibold bg-white text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
                  >
                    {selectableCourses.map((c) => {
                      const isAlreadyEnrolled = existingCourseIds.includes(c.id);
                      return (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.category}) {isAlreadyEnrolled ? "— [Already Enrolled]" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Level Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Qualification Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {courseLevels.map((lvl) => {
                      const isSelected = selectedLevelLabel === lvl.level_label;
                      return (
                        <button
                          key={lvl.level_label}
                          type="button"
                          onClick={() => setSelectedLevelLabel(lvl.level_label)}
                          className={`p-2.5 rounded-sm border text-left transition-all ${
                            isSelected
                              ? "border-navy-900 bg-navy-50 font-bold"
                              : "border-line bg-white hover:bg-paper"
                          }`}
                        >
                          <span className="block text-navy-900 font-bold">{lvl.level_label}</span>
                          <span className="text-[11px] text-ink-soft">£{lvl.price_gbp} standard</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tutoring specific inputs */}
                {isOneToOne && (
                  <div className="p-3 bg-navy-900/5 rounded-sm border border-navy-900/15 space-y-3">
                    <span className="text-[11px] font-bold text-navy-900 uppercase tracking-wider block">
                      1-on-1 Tutoring Logistics
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-navy-900 mb-0.5">
                          Preferred Weekly Slot
                        </label>
                        <select
                          value={tutoringSlot}
                          onChange={(e) => setTutoringSlot(e.target.value)}
                          className="w-full px-2 py-1.5 border border-line bg-white rounded-sm text-xs"
                        >
                          <option value="Saturday, 10:00am">Saturday, 10:00am</option>
                          <option value="Saturday, 12:00pm">Saturday, 12:00pm</option>
                          <option value="Saturday, 2:00pm">Saturday, 2:00pm</option>
                          <option value="Weekday After-School (16:30)">Weekday After-School (16:30)</option>
                          <option value="Weekday Evening (18:00)">Weekday Evening (18:00)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-navy-900 mb-0.5">
                          Delivery Mode
                        </label>
                        <select
                          value={tutoringDeliveryMode}
                          onChange={(e) => setTutoringDeliveryMode(e.target.value as any)}
                          className="w-full px-2 py-1.5 border border-line bg-white rounded-sm text-xs"
                        >
                          <option value="physical_centre">Physical Centre (Ilford Campus)</option>
                          <option value="online">Interactive Online (Zoom Classroom)</option>
                          <option value="room_home_request">Home / Special Request</option>
                        </select>
                      </div>
                    </div>
                    {tutoringDeliveryMode === "room_home_request" && (
                      <div>
                        <label className="block text-[10px] font-semibold text-navy-900 mb-0.5">
                          Address or Room Requirements
                        </label>
                        <input
                          type="text"
                          value={tutoringAddress}
                          onChange={(e) => setTutoringAddress(e.target.value)}
                          placeholder="e.g. 12 High Street, Ilford IG1"
                          className="w-full px-2.5 py-1.5 border border-line bg-white rounded-sm text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Option */}
                <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                      Payment Schedule
                    </span>
                    <span className="text-[10px] text-ink-soft">
                      {isL5Plus ? "Level 5+ Plan: 6 to 14 Months" : "Standard Plan: 3 to 12 Months"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentOption("instalments")}
                      className={`p-2.5 rounded-sm border text-left transition-all ${
                        paymentOption === "instalments"
                          ? "border-navy-900 bg-white font-bold shadow-xs"
                          : "border-line bg-paper hover:bg-white"
                      }`}
                    >
                      <span className="block text-navy-900 font-bold">Monthly 0% Instalments</span>
                      <span className="text-[11px] text-ink-soft">Spread tuition over time</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOption("full")}
                      className={`p-2.5 rounded-sm border text-left transition-all ${
                        paymentOption === "full"
                          ? "border-navy-900 bg-white font-bold shadow-xs"
                          : "border-line bg-paper hover:bg-white"
                      }`}
                    >
                      <span className="block text-navy-900 font-bold">Pay in Full Upfront</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        Save {fullPayDiscount}% (Pay £{fullPayPrice})
                      </span>
                    </button>
                  </div>

                  {paymentOption === "instalments" && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-semibold text-navy-900">
                        Choose Number of Monthly Instalments:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {allowedMonths.map((m) => {
                          const isSel = selectedMonths === m;
                          const monthly = m > 1 ? (remaining / (m - 1)).toFixed(2) : "0.00";
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setSelectedMonths(m)}
                              className={`p-2 rounded-sm border text-center transition-all ${
                                isSel
                                  ? "border-navy-900 bg-navy-900 text-white font-bold"
                                  : "border-line bg-white hover:bg-paper text-navy-900"
                              }`}
                            >
                              <div className="text-xs font-bold">{m} Mo</div>
                              <div className={`text-[10px] ${isSel ? "text-gold-300" : "text-ink-soft"}`}>
                                £{monthly}/mo
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pricing Breakdown Summary */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-sm border border-line text-center text-xs">
                    <div>
                      <span className="text-[10px] text-ink-soft block">Tuition Fee</span>
                      <strong className="font-mono text-navy-900">£{rawPrice.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-soft block">Due Today</span>
                      <strong className="font-mono text-emerald-700">
                        £{(paymentOption === "full" ? fullPayPrice : deposit).toFixed(2)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-soft block">
                        {paymentOption === "full" ? "Savings" : "Monthly Spread"}
                      </span>
                      <strong className="font-mono text-navy-900">
                        {paymentOption === "full"
                          ? `£${(rawPrice - fullPayPrice).toFixed(2)}`
                          : `£${monthlyRate}/mo (${selectedMonths - 1}x)`}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-2.5 rounded-sm border text-left transition-all ${
                        paymentMethod === "card"
                          ? "border-navy-900 bg-navy-50 font-bold"
                          : "border-line bg-white hover:bg-paper"
                      }`}
                    >
                      <span className="block text-navy-900 font-bold">Credit / Debit Card</span>
                      <span className="text-[10px] text-ink-soft">Instant online activation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bacs")}
                      className={`p-2.5 rounded-sm border text-left transition-all ${
                        paymentMethod === "bacs"
                          ? "border-navy-900 bg-navy-50 font-bold"
                          : "border-line bg-white hover:bg-paper"
                      }`}
                    >
                      <span className="block text-navy-900 font-bold">BACS Bank Transfer</span>
                      <span className="text-[10px] text-ink-soft">Direct bank payment</span>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-line rounded-sm text-xs font-semibold hover:bg-paper transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 bg-navy-900 text-white rounded-sm text-xs font-bold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isPending ? (
                      "Confirming Enrolment..."
                    ) : (
                      <>
                        <span>Confirm Enrolment & Add to Dashboard</span>
                        <Icon name="arrow-right" size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
