"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Course, PaymentPlanTemplate } from "@/content/types";
import {
  defaultPlan6Months,
  defaultPlan3Months,
  defaultPlan10Months,
  defaultPlan12Months,
} from "@/content/plans";
import { calculatePricing, formatCurrency } from "@/content/pricing";
import { globalSettings } from "@/content/globals";
import {
  processSelfEnrolmentAction,
  createStripeCheckoutAction,
  verifyExistingStudentAction,
} from "@/app/actions/enrolmentActions";
import {
  validateCoupon,
  calculateDiscountedPricing,
  Coupon,
} from "@/lib/coupons";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PaymentCardTrustIcons, CheckoutTrustBanner } from "@/components/ui/PaymentTrustLogos";

interface CurrentUserProps {
  id: string;
  name: string;
  email: string;
  role: string;
  learnerId?: string;
}

import { CohortScheduleConfig } from "@/lib/repositories/types";

interface Props {
  courses: Course[];
  initialCourseId?: string;
  currentUser?: CurrentUserProps;
  cohortSchedule?: CohortScheduleConfig;
}

const fullPayPlanTemplate: PaymentPlanTemplate = {
  name: "Pay in Full",
  months: 1,
  deposit_type: "percent",
  deposit_value: 100,
  grace_days: 0,
  after_grace: "pause_access",
};

export const EnrolmentClient: React.FC<Props> = ({
  courses,
  initialCourseId,
  currentUser,
  cohortSchedule,
}) => {
  const afternoonTimeLabel = cohortSchedule?.afternoon?.timeLabel || "14:00 – 16:00";
  const eveningTimeLabel = cohortSchedule?.evening?.timeLabel || "18:30 – 20:30";
  const router = useRouter();
  const { loginAs } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Selected course & level
  const defaultCourse = courses.find((c) => c.id === initialCourseId) || courses[0];
  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourse?.id || "");
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const [selectedLevelLabel, setSelectedLevelLabel] = useState<string>(
    currentCourse?.levels[0]?.level_label || ""
  );

  // Auto-redirect countdown state
  const [redirectSeconds, setRedirectSeconds] = useState<number>(3);
  const [autoRedirectCancelled, setAutoRedirectCancelled] = useState<boolean>(false);
  const currentLevel =
    currentCourse?.levels.find((l) => l.level_label === selectedLevelLabel) ||
    currentCourse?.levels[0];

  // Payment plan selection
  const [paymentOption, setPaymentOption] = useState<"full" | "instalments">("full");
  const [planMonths, setPlanMonths] = useState<string>("6");
  const [preferredSession, setPreferredSession] = useState<"evening" | "afternoon">("evening");

  // Form Fields
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Existing student verification state
  const [accountType, setAccountType] = useState<"new" | "existing">(
    currentUser ? "existing" : "new"
  );
  const [existingStudentIdInput, setExistingStudentIdInput] = useState("");
  const [isVerifyingStudent, setIsVerifyingStudent] = useState(false);
  const [verifyStudentError, setVerifyStudentError] = useState<string | null>(null);
  const [verifiedStudent, setVerifiedStudent] = useState<{
    id: string;
    fullName: string;
    studentId: string;
    email: string;
    phone: string;
  } | null>(
    currentUser
      ? {
          id: currentUser.learnerId || currentUser.id,
          fullName: currentUser.name,
          studentId: currentUser.id,
          email: currentUser.email,
          phone: "",
        }
      : null
  );

  // Coupon / Birthday voucher state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponBoxOpen, setIsCouponBoxOpen] = useState(false);

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    const result = validateCoupon(couponCodeInput);
    if (!result.valid || !result.coupon) {
      setCouponError(result.error || "Invalid coupon code.");
      return;
    }
    setAppliedCoupon(result.coupon);
    setCouponError(null);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError(null);
  };

  const handleVerifyExistingStudent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerifyStudentError(null);
    if (!existingStudentIdInput.trim()) {
      setVerifyStudentError("Please enter your Student ID or registered email.");
      return;
    }

    setIsVerifyingStudent(true);
    try {
      const res = await verifyExistingStudentAction(existingStudentIdInput);
      if (!res.success || !res.learner) {
        setVerifyStudentError(
          res.error || "No student record found. Please verify details."
        );
      } else {
        setVerifiedStudent(res.learner);
        setFullName(res.learner.fullName);
        setEmail(res.learner.email);
        if (res.learner.phone) setPhone(res.learner.phone);
        setVerifyStudentError(null);
      }
    } catch {
      setVerifyStudentError("Unable to verify student record right now.");
    } finally {
      setIsVerifyingStudent(false);
    }
  };

  // Card Simulation Details
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("•••");

  // State & Outcome
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedResult, setConfirmedResult] = useState<{
    studentId: string;
    studentEmail: string;
    studentName: string;
    courseTitle: string;
    levelName: string;
    amountCharged: number;
    receiptRef: string;
    portalUrl: string;
  } | null>(null);

  // Pricing calculations
  const activePlan: PaymentPlanTemplate =
    paymentOption === "full"
      ? fullPayPlanTemplate
      : planMonths === "3"
      ? defaultPlan3Months
      : planMonths === "10"
      ? defaultPlan10Months
      : planMonths === "12"
      ? defaultPlan12Months
      : defaultPlan6Months;

  const basePricing = currentLevel
    ? calculatePricing(currentLevel, activePlan, globalSettings)
    : null;

  const pricing = basePricing
    ? calculateDiscountedPricing(basePricing, appliedCoupon)
    : null;

  const amountToChargeNow =
    paymentOption === "full" ? pricing?.fullPayPrice || 0 : pricing?.deposit || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAccepted) {
      setErrorMsg("Please accept the terms and conditions to proceed with enrolment.");
      return;
    }

    if (accountType === "existing") {
      if (!verifiedStudent) {
        setErrorMsg("Please verify your existing student record using your Student ID or email before proceeding.");
        return;
      }
    } else {
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setErrorMsg("Please complete all personal details (Full Legal Name, Email, and Telephone).");
        return;
      }
      if (!dob.trim()) {
        setErrorMsg("Date of birth is compulsory for official awarding body registration.");
        return;
      }
      if (!address.trim()) {
        setErrorMsg("Home address and postcode are compulsory for official student records.");
        return;
      }
    }

    const effectiveName =
      accountType === "existing" && verifiedStudent
        ? verifiedStudent.fullName
        : fullName.trim();
    const effectiveEmail =
      accountType === "existing" && verifiedStudent
        ? verifiedStudent.email
        : email.trim();
    const effectivePhone =
      accountType === "existing" && verifiedStudent
        ? verifiedStudent.phone || phone.trim() || "07000000000"
        : phone.trim();

    startTransition(async () => {
      try {
        // 1. Check if live Stripe Checkout is available
        const stripeRes = await createStripeCheckoutAction({
          courseId: currentCourse.id,
          levelLabel: currentLevel?.level_label,
          planId: paymentOption === "full" ? "full" : planMonths,
          fullName: effectiveName,
          email: effectiveEmail,
          phone: effectivePhone,
          dob: accountType === "existing" ? undefined : dob,
          address: accountType === "existing" ? undefined : address,
          postcode: accountType === "existing" ? undefined : postcode,
          preferredSession,
          couponCode: appliedCoupon?.code,
          paymentOption,
          origin: window.location.origin,
        });

        if (stripeRes.hasStripe && stripeRes.checkoutUrl) {
          window.location.href = stripeRes.checkoutUrl;
          return;
        }

        // 2. Otherwise process instant enrolment simulation
        const result = await processSelfEnrolmentAction({
          courseId: currentCourse.id,
          levelLabel: currentLevel?.level_label,
          planId: paymentOption === "full" ? "full" : planMonths,
          fullName: effectiveName,
          email: effectiveEmail,
          phone: effectivePhone,
          dob: accountType === "existing" ? undefined : dob,
          address: accountType === "existing" ? undefined : address,
          postcode: accountType === "existing" ? undefined : postcode,
          preferredSession,
          paymentOption,
          cardNumberLast4: cardNumber.replace(/\D/g, "").slice(-4) || "4242",
          couponCode: appliedCoupon?.code,
          termsAccepted,
        });

        if (result.success) {
          setConfirmedResult(result);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Enrolment failed. Please check details.");
      }
    });
  };

  // Auto-redirect to /student upon confirmed enrolment (NEW students only)
  useEffect(() => {
    if (!confirmedResult || autoRedirectCancelled) return;
    const isReturning = Boolean((confirmedResult as Record<string, unknown>).isReturningStudent);
    if (isReturning) return; // Existing students must never be auto-logged in or redirected

    // Automatically synchronize client auth state for new student onboarding
    loginAs("student");

    if (redirectSeconds <= 0) {
      router.push("/student");
      return;
    }

    const timer = setTimeout(() => {
      setRedirectSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [confirmedResult, redirectSeconds, autoRedirectCancelled, router, loginAs]);

  // SUCCESS CONFIRMATION SCREEN
  if (confirmedResult) {
    const isReturning = (confirmedResult as Record<string, unknown>).isReturningStudent;

    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-md border border-line p-8 sm:p-10 shadow-sm space-y-8 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Icon name="check" size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-sm border border-emerald-200">
              {isReturning ? "Additional Qualification Activated" : "Registration & Payment Confirmed"}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              {isReturning ? "Welcome Back to Smartminds College!" : "Welcome to Smartminds Training College!"}
            </h1>
            <p className="text-ink-soft text-base max-w-lg mx-auto">
              {isReturning
                ? "Your new course has been successfully linked to your existing student portal."
                : "Your official student profile has been created and your enrolment is now active."}
            </p>
          </div>

          {/* Security Notice for Existing Students vs Auto-redirect for New */}
          {isReturning ? (
            <div className="p-3.5 bg-paper rounded-sm border border-line max-w-xl mx-auto flex items-center justify-between gap-3 text-xs text-navy-900 font-semibold text-left">
              <div className="flex items-center gap-2">
                <Icon name="shield-check" size={16} className="text-navy-900 shrink-0" />
                <span>Security Notice: For your account protection, please sign in with your college password to access your newly linked qualification.</span>
              </div>
            </div>
          ) : !autoRedirectCancelled ? (
            <div className="p-3.5 bg-paper rounded-sm border border-line max-w-xl mx-auto flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-navy-900 font-semibold">
                <span className="w-3.5 h-3.5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span>Redirecting to your student dashboard in {redirectSeconds}s...</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoRedirectCancelled(true)}
                className="text-ink-soft hover:text-navy-900 underline font-medium"
              >
                Stay on this page
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-paper rounded-sm border border-line max-w-xl mx-auto text-xs text-ink-soft">
              Auto-redirect paused. You can review your receipt details below.
            </div>
          )}

          {/* Registration Details Card */}
          <div className="bg-paper rounded-sm border border-line p-6 text-left space-y-4 max-w-xl mx-auto">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <span className="text-xs font-semibold text-ink-soft">Official Student ID</span>
              <span className="font-mono font-bold text-navy-900 text-sm bg-white px-2.5 py-1 rounded-sm border border-line">
                {confirmedResult.studentId}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-line pb-3">
              <span className="text-xs font-semibold text-ink-soft">Student Name</span>
              <span className="font-semibold text-navy-900 text-sm">{confirmedResult.studentName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-line pb-3">
              <span className="text-xs font-semibold text-ink-soft">Enrolled Course</span>
              <span className="font-semibold text-navy-900 text-sm text-right">
                {confirmedResult.courseTitle} ({confirmedResult.levelName})
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-line pb-3">
              <span className="text-xs font-semibold text-ink-soft">Payment Collected</span>
              <span className="font-bold text-navy-900 text-sm">{formatCurrency(confirmedResult.amountCharged)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-ink-soft">Receipt Reference</span>
              <span className="font-mono text-xs text-ink-soft">{confirmedResult.receiptRef}</span>
            </div>
          </div>

          {/* Email Notification Notice */}
          <div className="p-4 rounded-sm bg-navy-900/5 border border-navy-900/10 text-xs text-ink-soft flex items-start gap-3 max-w-xl mx-auto text-left">
            <Icon name="mail" size={18} className="text-navy-900 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-navy-900">
                Confirmation dispatched to {confirmedResult.studentEmail}
              </p>
              <p className="text-white/70">
                {isReturning
                  ? "We have emailed your additional course confirmation and updated induction timetable."
                  : "We have emailed your portal credentials, official payment receipt, and induction webinar timetable."}
              </p>
            </div>
          </div>

          {/* Direct Student Portal CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push(isReturning ? "/login" : "/student")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-navy-900 hover:bg-navy-700 text-white font-semibold text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>{isReturning ? "Sign in to Student Portal" : "Access Your Student Portal Now"}</span>
              <Icon name="arrow-right" size={16} />
            </button>
            <Link
              href="/courses"
              className="w-full sm:w-auto px-6 py-3.5 rounded-sm border border-line bg-white hover:bg-paper text-navy-900 font-semibold text-sm transition-colors inline-flex items-center justify-center min-h-[44px]"
            >
              <span>Browse Prospectus</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-navy-900 text-gold-300 text-xs font-semibold">
          <Icon name="shield-check" size={14} />
          <span>Official College Enrolment</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-navy-900">
          Enrol & Activate Your Qualification
        </h1>
        <p className="text-ink-soft text-base sm:text-lg">
          Complete your registration in minutes. Join live online classes led by certified UK tutors with zero interest instalment options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Enrolment Form */}
        <div className="lg:col-span-7 space-y-8 bg-white rounded-md border border-line p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Course & Plan Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-300 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Select Your Qualification & Plan
                </h2>
              </div>

              {/* Course Dropdown */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  Accredited Programme
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    const c = courses.find((x) => x.id === e.target.value);
                    if (c && c.levels[0]) setSelectedLevelLabel(c.levels[0].level_label);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-sm border border-line bg-paper text-sm text-navy-900 font-medium focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.type === "regulated" ? "Ofqual RQF" : "CPD"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Selection if multiple */}
              {currentCourse.levels.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Qualification Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {currentCourse.levels.map((lvl) => (
                      <button
                        key={lvl.level_label}
                        type="button"
                        onClick={() => setSelectedLevelLabel(lvl.level_label)}
                        className={`p-3 rounded-sm border text-left transition-all ${
                          selectedLevelLabel === lvl.level_label
                            ? "border-navy-900 bg-navy-50 font-bold"
                            : "border-line bg-white hover:bg-paper"
                        }`}
                      >
                        <span className="block text-xs font-bold text-navy-900">{lvl.level_label}</span>
                        <span className="text-[11px] text-ink-soft">{formatCurrency(lvl.price_gbp)} standard</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Type Selection */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-navy-900 mb-2">
                  Payment Method & Terms
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pay in full */}
                  <button
                    type="button"
                    onClick={() => setPaymentOption("full")}
                    className={`p-4 rounded-sm border text-left transition-all relative ${
                      paymentOption === "full"
                        ? "border-navy-900 bg-navy-50/60 ring-2 ring-navy-900"
                        : "border-line bg-white hover:bg-paper"
                    }`}
                  >
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-gold-500 text-navy-900 uppercase">
                      Save 10%
                    </span>
                    <strong className="block text-sm font-bold text-navy-900">
                      Pay in Full
                    </strong>
                    <span className="text-xs text-ink-soft block mt-1">
                      {pricing ? formatCurrency(pricing.fullPayPrice) : ""} upfront
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                      Save {pricing ? formatCurrency(pricing.saving) : ""} instantly
                    </span>
                  </button>

                  {/* Monthly instalments */}
                  <button
                    type="button"
                    onClick={() => setPaymentOption("instalments")}
                    className={`p-4 rounded-sm border text-left transition-all relative ${
                      paymentOption === "instalments"
                        ? "border-navy-900 bg-navy-50/60 ring-2 ring-navy-900"
                        : "border-line bg-white hover:bg-paper"
                    }`}
                  >
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-navy-900 text-gold-300 uppercase">
                      0% Interest
                    </span>
                    <strong className="block text-sm font-bold text-navy-900">
                      Monthly Instalments
                    </strong>
                    <span className="text-xs text-ink-soft block mt-1">
                      Pay initial deposit, balance split equally
                    </span>
                    <span className="text-[11px] text-navy-900 font-semibold mt-1 block">
                      Zero finance fees or APR
                    </span>
                  </button>
                </div>

                {/* Instalment Month Selector */}
                {paymentOption === "instalments" && (
                  <div className="mt-3 p-3 rounded-sm bg-paper border border-line space-y-2">
                    <label className="block text-xs font-semibold text-navy-900">
                      Choose Monthly Schedule:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "3", label: "3 Months" },
                        { id: "6", label: "6 Months" },
                        { id: "10", label: "10 Months" },
                        { id: "12", label: "12 Months" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPlanMonths(p.id)}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-xs border text-center transition-colors ${
                            planMonths === p.id
                              ? "bg-navy-900 text-gold-300 border-navy-900"
                              : "bg-white text-ink-soft border-line hover:border-navy-700"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Student Details & Study Schedule */}
            <div className="space-y-4 pt-4 border-t border-line">
              <div className="flex items-center gap-2.5 pb-2 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-300 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Learner Personal Details & Study Session
                </h2>
              </div>

              {/* Account Type Selector: New Learner vs Existing Student */}
              <div className="flex border border-line rounded-sm overflow-hidden bg-paper p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAccountType("new");
                    if (!currentUser) {
                      setVerifiedStudent(null);
                      setExistingStudentIdInput("");
                      setFullName("");
                      setEmail("");
                      setPhone("");
                      setDob("");
                      setAddress("");
                    }
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xs transition-all cursor-pointer ${
                    accountType === "new"
                      ? "bg-navy-900 text-gold-300 shadow-xs"
                      : "text-ink-soft hover:text-navy-900"
                  }`}
                >
                  New Learner Registration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountType("existing");
                    setVerifyStudentError(null);
                    if (!verifiedStudent && !currentUser) {
                      setFullName("");
                      setEmail("");
                      setPhone("");
                      setDob("");
                      setAddress("");
                    }
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xs transition-all cursor-pointer ${
                    accountType === "existing"
                      ? "bg-navy-900 text-gold-300 shadow-xs"
                      : "text-ink-soft hover:text-navy-900"
                  }`}
                >
                  Existing College Student
                </button>
              </div>

              {/* EXISTING STUDENT TAB VIEW */}
              {accountType === "existing" && (
                <div className="space-y-4">
                  {!verifiedStudent ? (
                    <div className="p-4 rounded-sm bg-paper border border-line space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon name="user" size={16} className="text-navy-900" />
                        <span className="text-xs font-bold text-navy-900">
                          Verify Your Smartminds Student Record
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft">
                        Enter your Student ID (e.g. <code>STU-000000</code>) or registered email address to link this qualification directly to your student portal:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={existingStudentIdInput}
                          onChange={(e) => setExistingStudentIdInput(e.target.value)}
                          placeholder="e.g. STU-000000 or student@example.co.uk"
                          className="flex-1 px-3 py-1.5 rounded-sm border border-line text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 min-h-[38px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyExistingStudent()}
                          disabled={isVerifyingStudent}
                          className="px-4 py-1.5 text-xs font-bold rounded-sm bg-navy-900 text-gold-300 hover:bg-navy-700 transition-colors disabled:opacity-50 min-h-[38px] cursor-pointer"
                        >
                          {isVerifyingStudent ? "Verifying..." : "Verify Record"}
                        </button>
                      </div>
                      {verifyStudentError && (
                        <p className="text-[11px] font-semibold text-red-600">
                          {verifyStudentError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Verified Badge */}
                      <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start justify-between gap-3 shadow-xs">
                        <div className="flex items-start gap-2.5">
                          <Icon name="check-circle" size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <strong className="block text-emerald-950 font-bold text-sm">
                              {verifiedStudent.fullName}
                            </strong>
                            <div className="text-xs text-emerald-800 flex flex-wrap gap-x-3 gap-y-0.5">
                              <span>Student ID: <strong className="font-mono">{verifiedStudent.studentId}</strong></span>
                              <span>Email: <strong>{verifiedStudent.email}</strong></span>
                            </div>
                            <p className="text-[11px] text-emerald-700 pt-0.5">
                              Your identity and contact details are already verified on file. Choose your preferred study session below to complete enrolment.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVerifiedStudent(null);
                            setExistingStudentIdInput("");
                            setFullName("");
                            setEmail("");
                            setPhone("");
                          }}
                          className="text-[11px] text-ink-soft hover:text-navy-900 underline shrink-0 font-semibold cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      {/* Study Timing / Cohort Selection for Existing Student */}
                      <div>
                        <label className="block text-xs font-bold text-navy-900 mb-1.5">
                          Live Cohort Teaching Schedule *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPreferredSession("afternoon")}
                            className={`p-3.5 rounded-sm border text-left transition-all relative cursor-pointer ${
                              preferredSession === "afternoon"
                                ? "border-navy-900 bg-navy-50/60 ring-2 ring-navy-900"
                                : "border-line bg-white hover:bg-paper"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-navy-900">
                                Afternoon Session
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-paper border border-line text-navy-900 font-semibold">
                                {afternoonTimeLabel}
                              </span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPreferredSession("evening")}
                            className={`p-3.5 rounded-sm border text-left transition-all relative cursor-pointer ${
                              preferredSession === "evening"
                                ? "border-navy-900 bg-navy-50/60 ring-2 ring-navy-900"
                                : "border-line bg-white hover:bg-paper"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-navy-900">
                                Evening Session
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-paper border border-line text-navy-900 font-semibold">
                                {eveningTimeLabel}
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NEW LEARNER REGISTRATION TAB VIEW */}
              {accountType === "new" && (
                <div className="space-y-4">
                  {/* Study Timing / Cohort Selection for New Student */}
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Live Cohort Teaching Schedule *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPreferredSession("afternoon")}
                        className={`p-3.5 rounded-sm border text-left transition-all relative cursor-pointer ${
                          preferredSession === "afternoon"
                            ? "border-navy-900 bg-navy-50/60 ring-2 ring-navy-900"
                            : "border-line bg-white hover:bg-paper"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy-900">
                            Afternoon Session
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-paper border border-line text-navy-900 font-semibold">
                            {afternoonTimeLabel}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreferredSession("evening")}
                        className={`p-3.5 rounded-sm border text-left transition-all relative cursor-pointer ${
                          preferredSession === "evening"
                            ? "border-navy-900 bg-navy-50/60 ring-2 ring-navy-900"
                            : "border-line bg-white hover:bg-paper"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy-900">
                            Evening Session
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-paper border border-line text-navy-900 font-semibold">
                            {eveningTimeLabel}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Personal KYC Details (Compulsory) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        readOnly={Boolean(currentUser)}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.co.uk"
                        className={`w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] ${
                          currentUser ? "bg-paper text-ink-soft cursor-not-allowed" : ""
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Telephone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07000 000000"
                        className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Home Address & Postcode *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House number, Street name, City, Postcode"
                        className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Card Details */}
            <div className="space-y-4 pt-4 border-t border-line">
              <div className="flex items-center gap-2.5 pb-2 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-300 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Payment & Activation
                </h2>
              </div>

              {/* Secure Payment Review Panel */}
              <div className="p-5 rounded-sm bg-paper border border-line space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center">
                      <Icon name="shield-check" size={15} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy-900 block leading-tight">
                        Secured by Stripe
                      </span>
                      <span className="text-[10px] text-ink-soft">
                        256-bit SSL encrypted • Apple Pay • Google Pay • Debit/Credit Card
                      </span>
                    </div>
                  </div>
                  <PaymentCardTrustIcons />
                </div>

                <div className="bg-white p-4 rounded-xs border border-line space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ink-soft">Enrolment Plan:</span>
                    <span className="font-bold text-navy-900">
                      {paymentOption === "full"
                        ? "Full Tuition (10% Upfront Discount Applied)"
                        : `${pricing?.months || 6}-Month Instalment Plan (0% APR)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-line/60">
                    <span className="font-bold text-navy-900">Amount Due Today:</span>
                    <span className="font-heading text-xl font-bold text-navy-900">
                      {formatCurrency(amountToChargeNow)}
                    </span>
                  </div>
                  {paymentOption === "instalments" && pricing && (
                    <p className="text-[11px] text-ink-soft pt-1 leading-relaxed">
                      Your initial deposit of <strong>{formatCurrency(pricing.deposit)}</strong> is charged today. Remaining tuition is divided into {pricing.months} monthly payments of {formatCurrency(pricing.monthly)}.
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xs bg-navy-50/60 border border-navy-900/10 text-xs text-navy-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-navy-900">
                    <Icon name="shield-check" size={13} className="text-navy-900 shrink-0" />
                    <span>How your payment is completed:</span>
                  </p>
                  <p className="text-[11px] text-ink-soft leading-relaxed pl-5">
                    Clicking the button below connects to Stripe’s secure payment checkout. You can pay using your preferred method—including Apple Pay, Google Pay, or any UK/international bank card. Your student account activates immediately upon confirmation.
                  </p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded-xs border-line text-navy-900 focus:ring-gold-500"
                />
                <span className="text-xs text-ink-soft leading-relaxed">
                  I agree to the Smartminds Training College enrolment terms, course induction policy, and understand that my registration activates immediate access to accredited course materials.
                </span>
              </label>

              {errorMsg && (
                <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isPending}
                className="w-full font-bold text-base py-3.5 cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="clock" size={16} className="animate-spin" />
                    <span>Connecting to Secure Checkout...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="shield-check" size={16} />
                    <span>
                      Pay {formatCurrency(amountToChargeNow)} Securely via Stripe &rarr;
                    </span>
                  </span>
                )}
              </Button>

              <CheckoutTrustBanner className="mt-3" />
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & College Guarantees */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-md border border-line p-6 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-heading text-lg font-bold text-navy-900 border-b border-line pb-3">
              Enrolment Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <strong className="block text-navy-900">{currentCourse.title}</strong>
                  <span className="text-xs text-ink-soft">{currentLevel.level_label}</span>
                </div>
                <span className="font-bold text-navy-900">
                  {formatCurrency(currentLevel.price_gbp)}
                </span>
              </div>

              {paymentOption === "full" && basePricing && basePricing.saving > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold border-t border-line/60 pt-2">
                  <span>Upfront 10% Discount</span>
                  <span>- {formatCurrency(basePricing.saving)}</span>
                </div>
              )}

              {appliedCoupon && pricing && pricing.discountAmount > 0 && (
                <div className="border-t border-line/60 pt-2 space-y-1">
                  <div className="flex justify-between items-center text-xs bg-emerald-50 border border-emerald-200 p-2 rounded-xs">
                    <div>
                      <span className="font-bold text-emerald-950 block">{appliedCoupon.label}</span>
                      <span className="text-[10px] text-emerald-700">{appliedCoupon.description}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] font-bold text-red-600 hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700 font-semibold pt-1">
                    <span>Coupon Deduction</span>
                    <span>- {formatCurrency(pricing.discountAmount)}</span>
                  </div>
                </div>
              )}

              {paymentOption === "instalments" && pricing && (
                <div className="space-y-1.5 border-t border-line/60 pt-2 text-xs text-ink-soft">
                  <div className="flex justify-between">
                    <span>Initial Deposit (Due today)</span>
                    <span className="font-semibold text-navy-900">{formatCurrency(pricing.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instalment Schedule</span>
                    <span className="font-semibold text-navy-900">
                      {pricing.months} payments of {formatCurrency(pricing.monthly)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-ink-soft">
                    <span>Finance Charges / APR</span>
                    <span className="font-bold text-emerald-700">£0.00 (0% Interest)</span>
                  </div>
                </div>
              )}

              {/* Expandable Voucher / Birthday Coupon Box */}
              <div className="border-t border-line/60 pt-2.5">
                {!appliedCoupon ? (
                  <div>
                    {!isCouponBoxOpen ? (
                      <button
                        type="button"
                        onClick={() => setIsCouponBoxOpen(true)}
                        className="text-xs font-bold text-navy-900 hover:text-navy-700 underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon name="sparkles" size={13} className="text-gold-500" />
                        <span>Insert birthday coupon</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5 bg-paper p-2.5 rounded-sm border border-line">
                        <label className="block text-[11px] font-bold text-navy-900">
                          Birthday Coupon Code
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value)}
                            placeholder="Enter coupon code"
                            className="flex-1 px-2.5 py-1 text-xs font-mono uppercase rounded-xs border border-line bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 min-h-[34px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon()}
                            className="px-3 py-1 text-xs font-bold rounded-xs bg-navy-900 text-gold-300 hover:bg-navy-700 transition-colors min-h-[34px] cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] font-semibold text-red-600">
                            {couponError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="border-t border-line pt-3 flex justify-between items-center text-base">
                <span className="font-bold text-navy-900">Due Today</span>
                <span className="font-heading text-2xl font-bold text-navy-900">
                  {formatCurrency(amountToChargeNow)}
                </span>
              </div>
            </div>

            {/* Guarantees List */}
            <div className="pt-4 border-t border-line space-y-2.5 text-xs text-ink-soft">
              <div className="flex items-center gap-2">
                <Icon name="shield-check" size={16} className="text-navy-900 flex-shrink-0" />
                <span>Ofqual Regulated British Qualification</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="video" size={16} className="text-navy-900 flex-shrink-0" />
                <span>Live Interactive Teaching with Real Tutors</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="clock" size={16} className="text-navy-900 flex-shrink-0" />
                <span>24/7 Access to Class Recordings & Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size={16} className="text-emerald-700 flex-shrink-0" />
                <span>Immediate Student Portal Activation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
