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
  initialLevelLabel?: string;
  initialPaymentOption?: "full" | "instalments";
  initialPlanId?: string;
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
  initialLevelLabel,
  initialPaymentOption,
  initialPlanId,
  currentUser,
  cohortSchedule,
}) => {
  const afternoonTimeLabel = cohortSchedule?.afternoon?.timeLabel || "14:00 – 16:00";
  const eveningTimeLabel = cohortSchedule?.evening?.timeLabel || "18:30 – 20:30";
  const router = useRouter();
  const { loginAs, updateUserSession } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Selected course & level
  const defaultCourse = courses.find((c) => c.id === initialCourseId) || courses[0];
  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourse?.id || "");
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const defaultLevelLabel =
    (initialLevelLabel &&
      defaultCourse?.levels.find(
        (l) => l.level_label.toLowerCase() === initialLevelLabel.toLowerCase()
      )?.level_label) ||
    currentCourse?.levels[0]?.level_label ||
    "";

  const [selectedLevelLabel, setSelectedLevelLabel] = useState<string>(defaultLevelLabel);

  // Auto-redirect countdown state
  const [redirectSeconds, setRedirectSeconds] = useState<number>(3);
  const [autoRedirectCancelled, setAutoRedirectCancelled] = useState<boolean>(false);
  const currentLevel =
    currentCourse?.levels.find((l) => l.level_label === selectedLevelLabel) ||
    currentCourse?.levels[0];

  // Course-specific payment plans
  const availablePlans: PaymentPlanTemplate[] =
    currentLevel?.plans && currentLevel.plans.length > 0
      ? currentLevel.plans
      : [defaultPlan3Months, defaultPlan6Months, defaultPlan10Months, defaultPlan12Months];

  const getPlanIdentifier = (p: PaymentPlanTemplate): string => p.id || p.months.toString();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (initialPlanId) {
      const match = availablePlans.find(
        (p) => getPlanIdentifier(p) === initialPlanId || p.months.toString() === initialPlanId
      );
      if (match) return getPlanIdentifier(match);
    }
    return availablePlans[0] ? getPlanIdentifier(availablePlans[0]) : "plan-6m";
  });

  // Keep plan ID synchronized if level or available plans change
  useEffect(() => {
    if (availablePlans.length > 0 && !availablePlans.some((p) => getPlanIdentifier(p) === selectedPlanId)) {
      setSelectedPlanId(getPlanIdentifier(availablePlans[0]));
    }
  }, [availablePlans, selectedPlanId]);

  // Payment plan selection
  const [paymentOption, setPaymentOption] = useState<"full" | "instalments">(
    initialPaymentOption === "instalments" || initialPaymentOption === "full"
      ? initialPaymentOption
      : "full"
  );
  const [preferredSession, setPreferredSession] = useState<"evening" | "afternoon">("evening");

  // Course audience checks: Adult vocational (18+) vs Minor/Child Tutoring vs All
  const isMinorCourse =
    currentCourse?.target_audience === "minor_tutoring" ||
    (Boolean(currentCourse?.is_private_tutoring) && currentCourse?.target_audience !== "adult");
  const isAllAudience = currentCourse?.target_audience === "all";
  const isAdultOnly = !isMinorCourse && !isAllAudience;
  const isTutoringCourse = currentCourse?.type === "tutoring" || currentCourse?.is_private_tutoring === true;
  const [selectedTutoringSlot, setSelectedTutoringSlot] = useState<string>(
    currentCourse?.tutoring_slots?.[0] || ""
  );

  // Learner profile type: Independent Adult (19+) vs Parent/Guardian registering Child
  const [learnerType, setLearnerType] = useState<"myself" | "child">(
    isMinorCourse ? "child" : "myself"
  );
  const [childName, setChildName] = useState("");
  const [childYearGroup, setChildYearGroup] = useState("Year 7 - 9 (KS3)");
  const [childConcerns, setChildConcerns] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Campus practical location for blended practical qualifications
  const [selectedLocation, setSelectedLocation] = useState<string>(
    currentCourse?.training_locations?.[0] || ""
  );

  // Synchronize when currentCourse changes
  useEffect(() => {
    if (isMinorCourse) {
      setLearnerType("child");
    } else if (isAdultOnly) {
      setLearnerType("myself");
    }
    if (currentCourse?.training_locations && currentCourse.training_locations.length > 0) {
      if (!selectedLocation || !currentCourse.training_locations.includes(selectedLocation)) {
        setSelectedLocation(currentCourse.training_locations[0]);
      }
    } else {
      setSelectedLocation("");
    }
    setSelectedTutoringSlot(currentCourse?.tutoring_slots?.[0] || "");
  }, [currentCourse, isMinorCourse, isAdultOnly, selectedLocation]);

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
    isReturningStudent?: boolean;
    learnerType?: "myself" | "child";
    childName?: string;
    trainingLocation?: string;
    preferredTimeSlot?: string;
  } | null>(null);

  // Pricing calculations
  const activePlan: PaymentPlanTemplate =
    paymentOption === "full"
      ? fullPayPlanTemplate
      : availablePlans.find((p) => getPlanIdentifier(p) === selectedPlanId) ||
        availablePlans[0] ||
        defaultPlan6Months;

  const basePricing = currentLevel
    ? calculatePricing(currentLevel, activePlan, globalSettings)
    : null;

  const pricing = basePricing
    ? calculateDiscountedPricing(basePricing, appliedCoupon)
    : null;

  const amountToChargeNow =
    paymentOption === "full" ? pricing?.fullPayPrice || 0 : pricing?.deposit || 0;

  const discountPercent =
    basePricing?.hasPriceSlash
      ? 0
      : currentLevel?.full_pay_discount_percent !== null &&
    currentLevel?.full_pay_discount_percent !== undefined
      ? currentLevel.full_pay_discount_percent
      : globalSettings.default_full_pay_discount_percent;

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
      if (learnerType === "child") {
        if (!childName.trim()) {
          setErrorMsg("Please enter the child/student's full legal name.");
          return;
        }
        if (!childYearGroup.trim()) {
          setErrorMsg("Please specify the child's school year or key stage.");
          return;
        }
        if (!dob.trim()) {
          setErrorMsg("Child's date of birth is required for school enrolment records.");
          return;
        }
        if (!fullName.trim() || !email.trim() || !phone.trim()) {
          setErrorMsg("Please complete parent/guardian contact details (Full Name, Email, and Phone).");
          return;
        }
        if (!address.trim()) {
          setErrorMsg("Residential home address and postcode are required for official records.");
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
    }

    if (currentCourse?.training_locations && currentCourse.training_locations.length > 0) {
      if (!selectedLocation) {
        setErrorMsg("Please select your preferred practical training campus location.");
        return;
      }
    }
    if (isTutoringCourse && !selectedTutoringSlot) {
      setErrorMsg("Please select a preferred tutoring day and time.");
      return;
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
          planId: paymentOption === "full" ? "full" : (activePlan?.id || activePlan?.months?.toString() || "plan-6m"),
          fullName: effectiveName,
          email: effectiveEmail,
          phone: effectivePhone,
          dob: accountType === "existing" ? undefined : dob,
          address: accountType === "existing" ? undefined : address,
          postcode: accountType === "existing" ? undefined : postcode,
          preferredSession,
          preferredTimeSlot: isTutoringCourse ? selectedTutoringSlot : undefined,
          couponCode: appliedCoupon?.code,
          paymentOption,
          learnerType,
          childName: learnerType === "child" ? childName.trim() : undefined,
          childYearGroup: learnerType === "child" ? childYearGroup.trim() : undefined,
          trainingLocation: currentCourse?.training_locations?.length ? selectedLocation : undefined,
          origin: window.location.origin,
        });

        if (stripeRes.hasStripe && stripeRes.checkoutUrl) {
          window.location.href = stripeRes.checkoutUrl;
          return;
        }

        if (stripeRes.error) {
          setErrorMsg(`Payment Gateway: ${stripeRes.error}`);
          return;
        }

        // 2. Otherwise process instant enrolment simulation
        const result = await processSelfEnrolmentAction({
          courseId: currentCourse.id,
          levelLabel: currentLevel?.level_label,
          planId: paymentOption === "full" ? "full" : (activePlan?.id || activePlan?.months?.toString() || "plan-6m"),
          fullName: effectiveName,
          email: effectiveEmail,
          phone: effectivePhone,
          dob: accountType === "existing" ? undefined : dob,
          address: accountType === "existing" ? undefined : address,
          postcode: accountType === "existing" ? undefined : postcode,
          preferredSession,
          preferredTimeSlot: isTutoringCourse ? selectedTutoringSlot : undefined,
          paymentOption,
          cardNumberLast4: cardNumber.replace(/\D/g, "").slice(-4) || "4242",
          couponCode: appliedCoupon?.code,
          termsAccepted,
          learnerType,
          childName: learnerType === "child" ? childName.trim() : undefined,
          childYearGroup: learnerType === "child" ? childYearGroup.trim() : undefined,
          guardianName: learnerType === "child" ? effectiveName : undefined,
          guardianPhone: learnerType === "child" ? effectivePhone : undefined,
          guardianEmail: learnerType === "child" ? effectiveEmail : undefined,
          trainingLocation: currentCourse?.training_locations?.length ? selectedLocation : undefined,
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
    updateUserSession({
      id: confirmedResult.studentId,
      name: confirmedResult.studentName,
      email: confirmedResult.studentEmail,
      role: "student",
      learnerId: confirmedResult.studentId,
      enrolledCourse: `${confirmedResult.courseTitle} (${confirmedResult.levelName})`,
      enrolledCourseTitle: confirmedResult.courseTitle,
      enrolledLevelLabel: confirmedResult.levelName,
      accountType: confirmedResult.learnerType === "child" ? "parent_guardian" : "adult_learner",
      childName: confirmedResult.childName,
      childYearGroup: learnerType === "child" ? childYearGroup : undefined,
      trainingLocation: confirmedResult.trainingLocation,
      totalFee: pricing?.total,
      depositPaid: pricing?.deposit,
      balanceRemaining: pricing ? pricing.total - pricing.deposit : undefined,
      instalmentPlanMonths: activePlan.months,
      safeguardingCompleted: false,
    });

    if (redirectSeconds <= 0) {
      router.push("/student");
      return;
    }

    const timer = setTimeout(() => {
      setRedirectSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [confirmedResult, redirectSeconds, autoRedirectCancelled, router, updateUserSession, learnerType, childYearGroup, pricing, activePlan.months]);

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
                : confirmedResult.learnerType === "child"
                ? `Enrolment for ${confirmedResult.childName || "your child"} is confirmed. Your parent/guardian portal is now active.`
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
                className="text-ink-soft hover:text-navy-900 underline font-medium cursor-pointer"
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
            {confirmedResult.childName && (
              <div className="flex justify-between items-center border-b border-line pb-3">
                <span className="text-xs font-semibold text-ink-soft">Registered Child</span>
                <span className="font-semibold text-navy-900 text-sm">{confirmedResult.childName}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-line pb-3">
              <span className="text-xs font-semibold text-ink-soft">
                {confirmedResult.learnerType === "child" ? "Parent / Guardian Name" : "Student Name"}
              </span>
              <span className="font-semibold text-navy-900 text-sm">{confirmedResult.studentName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-line pb-3">
              <span className="text-xs font-semibold text-ink-soft">Enrolled Course</span>
              <span className="font-semibold text-navy-900 text-sm text-right">
                {confirmedResult.courseTitle} ({confirmedResult.levelName})
              </span>
            </div>
            {confirmedResult.trainingLocation && (
              <div className="flex justify-between items-center border-b border-line pb-3">
                <span className="text-xs font-semibold text-ink-soft">Practical Campus Hub</span>
                <span className="font-semibold text-navy-900 text-sm bg-white px-2 py-0.5 rounded-xs border border-line">
                  {confirmedResult.trainingLocation} Centre
                </span>
              </div>
            )}
            {confirmedResult.preferredTimeSlot && (
              <div className="flex justify-between items-center border-b border-line pb-3">
                <span className="text-xs font-semibold text-ink-soft">Preferred tutoring time</span>
                <span className="font-semibold text-navy-900 text-sm">{confirmedResult.preferredTimeSlot}</span>
              </div>
            )}
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
              <p className="text-ink-soft">
                {isReturning
                  ? "We have emailed your additional course confirmation and updated induction timetable."
                  : confirmedResult.learnerType === "child"
                  ? "We have emailed your parent credentials, tuition schedule, and the pre-session safeguarding confirmation."
                  : "We have emailed your portal credentials, official payment receipt, and induction webinar timetable."}
              </p>
            </div>
          </div>

          {/* Direct Student Portal CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push(isReturning ? "/login" : "/student")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-navy-900 hover:bg-navy-700 text-white font-semibold text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
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
                    const newId = e.target.value;
                    setSelectedCourseId(newId);
                    const c = courses.find((x) => x.id === newId);
                    if (c && c.levels[0]) {
                      setSelectedLevelLabel(c.levels[0].level_label);
                      if (c.levels[0].plans && c.levels[0].plans.length > 0) {
                        setSelectedPlanId(getPlanIdentifier(c.levels[0].plans[0]));
                      }
                    }
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
                        onClick={() => {
                          setSelectedLevelLabel(lvl.level_label);
                          if (lvl.plans && lvl.plans.length > 0) {
                            setSelectedPlanId(getPlanIdentifier(lvl.plans[0]));
                          }
                        }}
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
                    {discountPercent > 0 && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-gold-500 text-navy-900 uppercase">
                        Save {discountPercent}%
                      </span>
                    )}
                    <strong className="block text-sm font-bold text-navy-900">
                      Pay in Full
                    </strong>
                    <span className="text-xs text-ink-soft block mt-1">
                      {pricing ? formatCurrency(pricing.fullPayPrice) : ""} upfront
                    </span>
                    {discountPercent > 0 && pricing && pricing.saving > 0 && (
                      <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                        Save {formatCurrency(pricing.saving)} instantly
                      </span>
                    )}
                  </button>

                  {/* Instalment plan */}
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
                      No interest
                    </span>
                    <strong className="block text-sm font-bold text-navy-900">
                      {isTutoringCourse ? "Split payments" : "Monthly instalments"}
                    </strong>
                    <span className="text-xs text-ink-soft block mt-1">
                      Pay initial deposit, balance split equally
                    </span>
                    <span className="text-[11px] text-navy-900 font-semibold mt-1 block">
                      {isTutoringCourse ? "Choose a payment interval" : "No finance fees"}
                    </span>
                  </button>
                </div>

                {/* Instalment schedule selector */}
                {paymentOption === "instalments" && (
                  <div className="mt-3 p-3 rounded-sm bg-paper border border-line space-y-2">
                    <label className="block text-xs font-semibold text-navy-900">
                      {isTutoringCourse ? "Choose payment interval:" : "Choose monthly schedule:"}
                    </label>
                    <div
                      className={`grid gap-2 ${
                        availablePlans.length > 2
                          ? "grid-cols-2 sm:grid-cols-4"
                          : "grid-cols-1 sm:grid-cols-2"
                      }`}
                    >
                      {availablePlans.map((p) => {
                        const pId = getPlanIdentifier(p);
                        return (
                          <button
                            key={pId}
                            type="button"
                            onClick={() => setSelectedPlanId(pId)}
                            className={`py-2 px-2.5 text-xs font-semibold rounded-xs border text-center transition-colors cursor-pointer ${
                              selectedPlanId === pId
                                ? "bg-navy-900 text-gold-300 border-navy-900 shadow-xs"
                                : "bg-white text-ink-soft border-line hover:border-navy-700"
                            }`}
                          >
                            <span className="block font-bold">
                              {p.interval_weeks ? p.name : `${p.months} Month${p.months > 1 ? "s" : ""}`}
                            </span>
                            <span className="text-[10px] block opacity-85 mt-0.5">
                              {p.deposit_value > 0 ? `£${p.deposit_value} dep` : "£0 dep"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Student Details & Study Schedule */}
            <div className="space-y-5 pt-4 border-t border-line">
              <div className="flex items-center gap-2.5 pb-2 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-navy-900 text-gold-300 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  Learner Personal Details & Study Session
                </h2>
              </div>

              {/* Who is this enrolment for? Rendered ONLY if the course is marked for all audiences (both Adult & Child) */}
              {isAllAudience && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-navy-900">
                    Who is this enrolment for? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLearnerType("myself")}
                      className={`p-3.5 rounded-sm border text-left transition-all relative cursor-pointer ${
                        learnerType === "myself"
                          ? "border-navy-900 bg-navy-50/60 ring-2 ring-navy-900"
                          : "border-line bg-white hover:bg-paper"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-navy-900">
                          Adult Learner (19+) — Myself
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-xs bg-paper border border-line text-navy-900">
                          Independent
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft mt-1">
                        Enrolling on my own behalf; I will study, submit coursework, and manage tuition independently.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLearnerType("child")}
                      className={`p-3.5 rounded-sm border text-left transition-all relative cursor-pointer ${
                        learnerType === "child"
                          ? "border-navy-900 bg-navy-50/60 ring-2 ring-navy-900"
                          : "border-line bg-white hover:bg-paper"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-navy-900">
                          Parent / Guardian — My Child
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-xs bg-gold-300 text-navy-900">
                          Parent Account
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft mt-1">
                        Registering a child or student under 19 for tuition, private tutoring, or extra GCSE/A-Level classes.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Informational notice when course is strictly for minors/tutoring */}
              {isMinorCourse && (
                <div className="p-3.5 rounded-sm bg-navy-50 border border-navy-900/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-navy-900 text-gold-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="users" size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-navy-900">
                        Parent / Legal Guardian Registration Required
                      </strong>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gold-300/40 text-navy-900 px-2 py-0.5 rounded-xs border border-gold-500/30">
                        Under 18 Tutoring
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-soft">
                      This programme is designed for primary, secondary or GCSE students. A parent or legal guardian must complete registration and provide emergency contact details.
                    </p>
                  </div>
                </div>
              )}

              {/* Practical Training Campus Venue (Only for Blended Practical Courses like Phlebotomy and L4 CET) */}
              {currentCourse?.training_locations && currentCourse.training_locations.length > 0 ? (
                <div className="p-4 rounded-sm bg-paper border border-line space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="map-pin" size={16} className="text-navy-900" />
                      <label className="text-xs font-bold text-navy-900">
                        {currentCourse.attendance_type === "physical_venue"
                          ? "Campus Venue & Training Centre *"
                          : "Practical Assessment & Clinical Training Hub *"}
                      </label>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gold-300/30 text-navy-900 px-2 py-0.5 rounded-xs border border-gold-500/30">
                      {currentCourse.attendance_type === "physical_venue"
                        ? "Campus Venue Attendance"
                        : "Mandatory Practical Sessions"}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-soft">
                    {currentCourse.attendance_type === "physical_venue"
                      ? "This qualification is delivered at our approved UK training campuses. Please choose your preferred campus location:"
                      : "This accredited qualification includes hands-on clinical and practical assessments. Please choose your preferred training centre:"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {currentCourse.training_locations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setSelectedLocation(loc)}
                        className={`p-3 rounded-xs border text-left transition-all cursor-pointer ${
                          selectedLocation === loc
                            ? "bg-navy-900 text-gold-300 border-navy-900 shadow-xs"
                            : "bg-white text-ink-soft border-line hover:border-navy-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold block">{loc}</span>
                          {selectedLocation === loc && (
                            <Icon name="check" size={14} className="text-gold-300 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] block opacity-80 mt-0.5">
                          Smartminds Approved Centre
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xs bg-navy-50/60 border border-navy-900/10 flex items-center gap-2 text-xs text-navy-900">
                  <Icon name="globe" size={14} className="text-navy-900 shrink-0" />
                  <span>
                    <strong>Blended &amp; Online Study:</strong> Flexible tutor-led online seminars and supported assessment guided by qualified assessors.
                  </span>
                </div>
              )}

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
                              Your identity and contact details are already verified on file. Choose your preferred lesson time below to complete enrolment.
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
                          {isTutoringCourse ? "Choose a tutoring day and time *" : "Live Cohort Teaching Schedule *"}
                        </label>
                        {isTutoringCourse && (
                          <select
                            value={selectedTutoringSlot}
                            onChange={(event) => setSelectedTutoringSlot(event.target.value)}
                            required
                            className="w-full min-h-[44px] rounded-sm border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy-900"
                          >
                            {(currentCourse.tutoring_slots || []).map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        )}
                        <div hidden={isTutoringCourse} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      {isTutoringCourse ? "Choose a tutoring day and time *" : "Live Cohort Teaching Schedule *"}
                    </label>
                    {isTutoringCourse && (
                      <select
                        value={selectedTutoringSlot}
                        onChange={(event) => setSelectedTutoringSlot(event.target.value)}
                        required
                        className="w-full min-h-[44px] rounded-sm border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy-900"
                      >
                        {(currentCourse.tutoring_slots || []).map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    )}
                    <div hidden={isTutoringCourse} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  {/* BRANCH: PARENT REGISTERING CHILD VS INDEPENDENT ADULT */}
                  {learnerType === "child" ? (
                    <div className="space-y-4">
                      {/* 1. Child Details */}
                      <div className="p-4 rounded-sm bg-navy-50/50 border border-navy-900/10 space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-navy-900/10">
                          <Icon name="user" size={16} className="text-navy-900" />
                          <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                            1. Child / Student Information
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-navy-900 mb-1">
                              Child's Full Legal Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={childName}
                              onChange={(e) => setChildName(e.target.value)}
                              placeholder="e.g. Leo Smith"
                              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-navy-900 mb-1">
                              School Year / Key Stage *
                            </label>
                            <select
                              value={childYearGroup}
                              onChange={(e) => setChildYearGroup(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white"
                            >
                              <option value="Year 1 - 3 (KS1 Primary)">Year 1 – 3 (KS1 Primary)</option>
                              <option value="Year 4 - 6 (KS2 / 11+ Preparation)">Year 4 – 6 (KS2 / 11+ Preparation)</option>
                              <option value="Year 7 - 9 (KS3 Secondary)">Year 7 – 9 (KS3 Secondary)</option>
                              <option value="Year 10 - 11 (GCSE Examinations)">Year 10 – 11 (GCSE Examinations)</option>
                              <option value="Year 12 - 13 (A-Level / Sixth Form)">Year 12 – 13 (A-Level / Sixth Form)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-navy-900 mb-1">
                              Child's Date of Birth *
                            </label>
                            <input
                              type="date"
                              required
                              value={dob}
                              onChange={(e) => setDob(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-navy-900 mb-1">
                              Learning Needs / Focus Subjects (Optional)
                            </label>
                            <input
                              type="text"
                              value={childConcerns}
                              onChange={(e) => setChildConcerns(e.target.value)}
                              placeholder="e.g. Maths GCSE booster, Dyslexia, or None"
                              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. Parent / Guardian Details */}
                      <div className="p-4 rounded-sm bg-paper border border-line space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-line">
                          <Icon name="shield-check" size={16} className="text-navy-900" />
                          <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                            2. Parent / Legal Guardian Contact & Billing
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-navy-900 mb-1">
                              Parent / Guardian Full Legal Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="e.g. Sarah Smith"
                              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-navy-900 mb-1">
                              Parent Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              readOnly={Boolean(currentUser)}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="parent@example.co.uk"
                              className={`w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white ${
                                currentUser ? "bg-paper text-ink-soft cursor-not-allowed" : ""
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-navy-900 mb-1">
                              Primary Mobile Telephone *
                            </label>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="07000 000000"
                              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-navy-900 mb-1">
                              Emergency / Secondary Phone (Optional)
                            </label>
                            <input
                              type="tel"
                              value={emergencyPhone}
                              onChange={(e) => setEmergencyPhone(e.target.value)}
                              placeholder="07000 111111"
                              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white"
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
                              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px] bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ADULT LEARNER KYC DETAILS */
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
                  )}
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
                        ? discountPercent > 0
                          ? `Full Tuition (${discountPercent}% Upfront Discount Applied)`
                          : "Full Tuition (Single Payment)"
                        : activePlan.interval_weeks
                          ? activePlan.name
                          : `${pricing?.months || activePlan.months}-Month Instalment Plan (no interest)`}
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
                      Your initial deposit of <strong>{formatCurrency(pricing.deposit)}</strong> is charged today. Remaining tuition is divided into {activePlan.interval_weeks ? `${pricing.months} payments every ${activePlan.interval_weeks} weeks` : `${pricing.months} monthly payments`}, at {formatCurrency(pricing.monthly)} per payment.
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

              {paymentOption === "full" && basePricing && basePricing.saving > 0 && discountPercent > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold border-t border-line/60 pt-2">
                  <span>Upfront {discountPercent}% Discount</span>
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
                      {activePlan.interval_weeks
                        ? `${pricing.months} payments every ${activePlan.interval_weeks} weeks`
                        : `${pricing.months} monthly payments`} of {formatCurrency(pricing.monthly)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-ink-soft">
                    <span>{isTutoringCourse ? "Interest or finance charges" : "Finance charges / APR"}</span>
                    <span className="font-bold text-emerald-700">None</span>
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
