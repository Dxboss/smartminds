"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import {
  Learner,
  Enrolment,
  ClassCohort,
  LearnerPaymentPlanSummary,
  UserProfile,
} from "@/lib/repositories/types";
import {
  moveLearnerClassAction,
  assignLearnerTutorAndSessionAction,
  archiveLearnerAction,
  restoreLearnerAction,
  deleteLearnerPermanentlyAction,
  adminEnrolNewStudentAction,
  updateLearnerAndEnrolmentAction,
  logLearnerPaymentAction,
  adminDeleteOrCancelEnrolmentAction,
} from "@/app/admin/actions";
import { impersonateUserAction } from "@/app/super/actions";
import type { Course } from "@/content/types";

function isLevelFiveOrAbove(levelLabel: string): boolean {
  if (!levelLabel) return false;
  const match = levelLabel.match(/(?:level|lvl|\bl)\s*(\d+)/i);
  if (match && parseInt(match[1], 10) >= 5) return true;
  return /\b([5-8])\b/.test(levelLabel);
}

function getInstalmentMonthsForLevel(levelLabel: string): number[] {
  return isLevelFiveOrAbove(levelLabel) ? [6, 10, 12, 14] : [3, 6, 10, 12];
}

function getInstalmentMonthsForCourseSelections(courses: Array<{ levelLabel?: string }>): number[] {
  const hasLevelFiveOrAbove = courses.some((c) => isLevelFiveOrAbove(c.levelLabel || ""));
  return hasLevelFiveOrAbove ? [6, 10, 12, 14] : [3, 6, 10, 12];
}

const FICTIONAL_TUTOR_NAMES = new Set([
  "dr. eleanor vance",
  "eleanor vance",
  "marcus sterling",
  "amara patel",
  "david kalu",
  "chloe davies",
]);

function isFictionalTutorName(name?: string | null): boolean {
  if (!name) return false;
  return FICTIONAL_TUTOR_NAMES.has(name.trim().toLowerCase());
}

function sanitizeTutorName(name: string | undefined | null, fallback = "Unassigned / TBA"): string {
  if (!name || !name.trim() || isFictionalTutorName(name)) {
    return fallback;
  }
  return name;
}

async function postLearnerApi(action: string, payload: Record<string, any>) {
  const response = await fetch("/api/admin/learners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json();
  if (!response.ok && !data?.error) {
    throw new Error(`Request failed (${response.status})`);
  }
  return data;
}

interface Props {
  initialLearners: Learner[];
  initialEnrolments: Enrolment[];
  initialPaymentPlans?: LearnerPaymentPlanSummary[];
  classes: ClassCohort[];
  tutors?: UserProfile[];
  availableCourses?: Course[];
  userRole?: string;
}

export const LearnersDirectory: React.FC<Props> = ({
  initialLearners,
  initialEnrolments,
  initialPaymentPlans = [],
  classes,
  tutors = [],
  availableCourses = [],
  userRole = "owner_admin",
}) => {
  const [learners, setLearners] = useState<Learner[]>(initialLearners);
  const [enrolments, setEnrolments] = useState<Enrolment[]>(initialEnrolments);
  const [paymentPlans, setPaymentPlans] = useState<LearnerPaymentPlanSummary[]>(initialPaymentPlans);
  const router = useRouter();

  useEffect(() => setLearners(initialLearners), [initialLearners]);
  useEffect(() => setEnrolments(initialEnrolments), [initialEnrolments]);
  useEffect(() => setPaymentPlans(initialPaymentPlans), [initialPaymentPlans]);
  const canManagePayments = userRole === "owner_admin" || userRole === "super_admin";
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "funded" | "archived">("all");
  const [search, setSearch] = useState("");

  const realTutors = tutors.filter((t) => !isFictionalTutorName(t.name));
  const defaultTutorName = realTutors[0]?.name || "Unassigned / TBA";

  // Tutor & Cohort Allocation Modal State
  const [movingEnrolment, setMovingEnrolment] = useState<Enrolment | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>(classes[0]?.id || "");
  const [selectedTutor, setSelectedTutor] = useState<string>(defaultTutorName);
  const [selectedTiming, setSelectedTiming] = useState<"afternoon" | "evening">("evening");
  const [isMoving, setIsMoving] = useState(false);

  // Archive & Safe Removal Modal State
  const [archivingLearner, setArchivingLearner] = useState<Learner | null>(null);
  const [archiveReason, setArchiveReason] = useState<string>("Course Completed / Graduated");
  const [isArchiving, setIsArchiving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // View Details Modal State
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);

  // Impersonation state
  const [isImpersonatingId, setIsImpersonatingId] = useState<string | null>(null);

  // Enrol New Student / Add Course Modal State
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [enrolExistingLearner, setEnrolExistingLearner] = useState<Learner | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolFirstName, setEnrolFirstName] = useState("");
  const [enrolLastName, setEnrolLastName] = useState("");
  const [enrolEmail, setEnrolEmail] = useState("");
  const [enrolPhone, setEnrolPhone] = useState("");
  const [enrolDob, setEnrolDob] = useState("");
  const [enrolAddress, setEnrolAddress] = useState("");
  const [enrolPostcode, setEnrolPostcode] = useState("");
  const [enrolEmergencyName, setEnrolEmergencyName] = useState("");
  const [enrolEmergencyPhone, setEnrolEmergencyPhone] = useState("");

  interface EnrolmentCourseSelection {
    courseId: string;
    levelLabel: string;
    classId: string;
    tutorName: string;
    sessionTiming: "evening" | "afternoon" | "self_paced";
    tutoringSlot: string;
    tutoringDeliveryMode: "online" | "physical_centre" | "room_home_request";
    tutoringRoomOrAddress: string;
    childName: string;
    childConcerns: string;
    guardianName: string;
    price: number;
  }

  const createDefaultCourseSelection = (courseObj?: Course): EnrolmentCourseSelection => {
    const c = courseObj || availableCourses[0];
    const lvl = c?.levels?.[0]?.level_label || "Level 3";
    const price = c?.levels?.[0]?.price_gbp || 1250;
    const isOneToOne = c?.id === "course-tutoring-children" || Boolean(c?.is_private_tutoring);
    return {
      courseId: c?.id || "course-adult-care",
      levelLabel: lvl,
      classId: isOneToOne ? "class-tutoring-kids" : classes[0]?.id || "class-adult-care-apr26",
      tutorName: defaultTutorName,
      sessionTiming: isOneToOne ? "self_paced" : "evening",
      tutoringSlot: "Saturday, 10:00am",
      tutoringDeliveryMode: "physical_centre",
      tutoringRoomOrAddress: "",
      childName: "",
      childConcerns: "",
      guardianName: "",
      price,
    };
  };

  const [enrolCourses, setEnrolCourses] = useState<EnrolmentCourseSelection[]>([
    createDefaultCourseSelection(),
  ]);
  const [enrolFundingType, setEnrolFundingType] = useState<"self_pay" | "funded" | "sponsored">("self_pay");
  const [enrolPlanType, setEnrolPlanType] = useState<"full" | "instalments">("instalments");
  const [enrolPrice, setEnrolPrice] = useState("1250");
  const [enrolDeposit, setEnrolDeposit] = useState("150");
  const [enrolMonths, setEnrolMonths] = useState("6");
  const [enrolPaymentMethod, setEnrolPaymentMethod] = useState<
    "paid" | "direct_debit" | "website_payment"
  >("paid");
  const [enrolCreatedSuccess, setEnrolCreatedSuccess] = useState<{
    name: string;
    email: string;
    tempPass?: string;
    studentId: string;
    isAdditionalCourse?: boolean;
  } | null>(null);

  // Sync valid instalment months when courses change (Level 2-4: [3,6,10,12], Level 5+: [6,10,12,14])
  useEffect(() => {
    const allowed = getInstalmentMonthsForCourseSelections(enrolCourses);
    const currentM = parseInt(enrolMonths, 10);
    if (!allowed.includes(currentM)) {
      if (currentM < allowed[0]) {
        setEnrolMonths(allowed[0].toString());
      } else if (currentM > allowed[allowed.length - 1]) {
        setEnrolMonths(allowed[allowed.length - 1].toString());
      } else {
        setEnrolMonths(allowed[0].toString());
      }
    }
  }, [enrolCourses, enrolMonths]);

  // Historical Enrolment State
  const [enrolIsHistorical, setEnrolIsHistorical] = useState(false);
  const [enrolHistoricalDate, setEnrolHistoricalDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [enrolAmountPaidToDate, setEnrolAmountPaidToDate] = useState("0");
  const [enrolHistoricalNotes, setEnrolHistoricalNotes] = useState("");

  // Edit Learner & Enrolment Modal State
  const [editingLearner, setEditingLearner] = useState<Learner | null>(null);
  const [editEnrolmentId, setEditEnrolmentId] = useState<string>("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPostcode, setEditPostcode] = useState("");
  const [editEmergencyContact, setEditEmergencyContact] = useState("");
  const [editCourseId, setEditCourseId] = useState("");
  const [editLevelLabel, setEditLevelLabel] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [editTutorName, setEditTutorName] = useState("");
  const [editTiming, setEditTiming] = useState<"evening" | "afternoon" | "self_paced">("evening");
  const [editChildName, setEditChildName] = useState("");
  const [editChildConcerns, setEditChildConcerns] = useState("");
  const [editGuardianName, setEditGuardianName] = useState("");
  const [editTutoringSlot, setEditTutoringSlot] = useState("Saturday, 10:00am");
  const [editTutoringDeliveryMode, setEditTutoringDeliveryMode] = useState<
    "online" | "physical_centre" | "room_home_request"
  >("physical_centre");
  const [editTutoringRoomOrAddress, setEditTutoringRoomOrAddress] = useState("");
  const [editFundingType, setEditFundingType] = useState<"self_pay" | "funded" | "sponsored">("self_pay");
  const [editPlanType, setEditPlanType] = useState<"full" | "instalments">("instalments");
  const [editMonths, setEditMonths] = useState<string>("6");
  const [editTotalPrice, setEditTotalPrice] = useState<string>("1250");
  const [editAmountPaid, setEditAmountPaid] = useState<string>("0");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openNewEnrolModal = () => {
    setEnrolExistingLearner(null);
    setEnrolCreatedSuccess(null);
    setEnrolFirstName("");
    setEnrolLastName("");
    setEnrolEmail("");
    setEnrolPhone("");
    setEnrolDob("");
    setEnrolAddress("");
    setEnrolPostcode("");
    setEnrolEmergencyName("");
    setEnrolEmergencyPhone("");
    const defaultCourse = createDefaultCourseSelection();
    setEnrolCourses([defaultCourse]);
    setEnrolPrice(defaultCourse.price.toString());
    setEnrolDeposit("150");
    setEnrolPaymentMethod("paid");
    setEnrolIsHistorical(false);
    setIsEnrolModalOpen(true);
  };

  const openAddCourseModal = (learner: Learner) => {
    setEnrolExistingLearner(learner);
    setEnrolCreatedSuccess(null);
    setEnrolFirstName(learner.firstName);
    setEnrolLastName(learner.lastName);
    setEnrolEmail(learner.email);
    setEnrolPhone(learner.phone || "");
    setEnrolDob(learner.dateOfBirth || "");
    setEnrolAddress(learner.address || "");
    setEnrolPostcode(learner.postcode || "");

    const existingEnrs = enrolments.filter(
      (e) => e.learnerId === learner.id && e.status !== "cancelled"
    );
    const existingPlan = paymentPlans.find((p) => p.learnerId === learner.id);
    const usedCourseIds = new Set(existingEnrs.map((e) => e.courseId));
    const nextCourse = availableCourses.find((c) => !usedCourseIds.has(c.id)) || availableCourses[0];
    const newBlock = createDefaultCourseSelection(nextCourse);
    if (learner.childName) newBlock.childName = learner.childName;
    if (learner.guardianName) newBlock.guardianName = learner.guardianName;
    setEnrolCourses([newBlock]);

    // Calculate current fee and amount already paid by student
    const currentFee = existingPlan
      ? existingPlan.totalAmountGbp
      : existingEnrs.reduce((acc, enr) => {
          const cObj = availableCourses.find((c) => c.id === enr.courseId);
          const lvlObj = cObj?.levels?.find((l) => l.level_label === enr.courseLevelLabel) || cObj?.levels?.[0];
          return acc + (lvlObj?.price_gbp || 1250);
        }, 0);
    const currentPaid = existingPlan ? existingPlan.totalPaidGbp : 0;
    const mergedTotal = currentFee + newBlock.price;

    setEnrolPrice(mergedTotal.toString());
    setEnrolDeposit(currentPaid > 0 ? currentPaid.toString() : "0");
    setEnrolAmountPaidToDate(currentPaid.toString());
    setEnrolIsHistorical(currentPaid > 0);
    setEnrolHistoricalNotes(`Multi-Course Merged Plan (Original Paid: £${currentPaid.toFixed(2)})`);
    setEnrolPaymentMethod("paid");

    const allLevels = [
      ...existingEnrs.map((e) => e.courseLevelLabel || "Level 3"),
      newBlock.levelLabel || "Level 3",
    ];
    const hasL5 = allLevels.some((l) => isLevelFiveOrAbove(l));
    const allowedMonths = hasL5 ? [6, 10, 12, 14] : [3, 6, 10, 12];
    setEnrolMonths(allowedMonths.includes(parseInt(enrolMonths, 10)) ? enrolMonths : allowedMonths[0].toString());
    setIsEnrolModalOpen(true);
  };

  const populateEditEnrolmentFields = (learnerId: string, enr?: Enrolment) => {
    if (!enr) {
      setEditEnrolmentId("");
      return;
    }
    setEditEnrolmentId(enr.id);
    setEditCourseId(enr.courseId);
    const lvl = enr.courseLevelLabel || "Level 3";
    setEditLevelLabel(lvl);
    setEditClassId(enr.classId);
    setEditTutorName(
      sanitizeTutorName(
        enr.tutorName ||
        classes.find((c) => c.id === enr.classId)?.tutorName,
        defaultTutorName
      )
    );
    setEditTiming(
      (enr.sessionTiming as any) ||
      (enr.courseId === "course-tutoring-children" ? "self_paced" : "evening")
    );
    setEditTutoringSlot(enr.preferredTimeSlot || "Saturday, 10:00am");
    const loc = (enr.trainingLocation || "").toLowerCase();
    setEditTutoringDeliveryMode(
      enr.tutoringDeliveryMode ||
      (loc.includes("home") || loc.includes("room") || loc.includes("request")
        ? "room_home_request"
        : loc.includes("gloucester") || loc.includes("centre") || loc.includes("face")
          ? "physical_centre"
          : "online")
    );
    setEditTutoringRoomOrAddress(enr.tutoringRoomOrAddress || "");
    setEditFundingType((enr.fundingType as any) || "self_pay");

    const plan = paymentPlans.find(
      (p) => p.enrolmentId === enr.id || p.learnerId === learnerId
    );
    const allowedMonths = getInstalmentMonthsForLevel(lvl);
    if (plan) {
      setEditTotalPrice(plan.totalAmountGbp.toString());
      setEditAmountPaid(plan.totalPaidGbp.toString());
      const pm = plan.planMonths || (enr as any).planMonths;
      if (pm && pm > 1) {
        setEditPlanType("instalments");
        setEditMonths(
          allowedMonths.includes(pm) ? pm.toString() : allowedMonths[0].toString()
        );
      } else {
        setEditPlanType("full");
        setEditMonths(allowedMonths[0].toString());
      }
    } else {
      const courseObj = availableCourses.find((c) => c.id === enr.courseId);
      const lvlObj =
        courseObj?.levels?.find((l) => l.level_label === lvl) ||
        courseObj?.levels?.[0];
      setEditTotalPrice(lvlObj ? lvlObj.price_gbp.toString() : "1250");
      setEditAmountPaid("0");
      setEditPlanType("instalments");
      setEditMonths(allowedMonths[0].toString());
    }
  };

  const openEditLearnerModal = (learner: Learner, specificEnr?: Enrolment) => {
    setEditingLearner(learner);
    setEditFirstName(learner.firstName);
    setEditLastName(learner.lastName);
    setEditEmail(learner.email);
    setEditPhone(learner.phone || "");
    setEditDob(learner.dateOfBirth || "");
    setEditAddress(learner.address || "");
    setEditPostcode(learner.postcode || "");
    setEditEmergencyContact(learner.emergencyContact || "");
    setEditChildName(learner.childName || "");
    setEditChildConcerns(learner.childConcerns || "");
    setEditGuardianName(learner.guardianName || "");

    const learnerEnrs = enrolments.filter((e) => e.learnerId === learner.id);
    const targetEnr = specificEnr || learnerEnrs[0];
    populateEditEnrolmentFields(learner.id, targetEnr);
  };

  const handleSaveEditedLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLearner) return;
    setIsSavingEdit(true);
    try {
      const editCourseObj = availableCourses.find((c) => c.id === editCourseId);
      const isEditOneToOne =
        editCourseId === "course-tutoring-children" || editClassId === "class-tutoring-kids";
      const matchedTutor = tutors.find((t) => t.name === editTutorName);
      const updatePayload = {
        learnerId: editingLearner.id,
        enrolmentId: editEnrolmentId || undefined,
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        dateOfBirth: editDob,
        address: editAddress,
        postcode: editPostcode,
        emergencyContact: editEmergencyContact,
        childName: isEditOneToOne ? editChildName : undefined,
        childConcerns: isEditOneToOne ? editChildConcerns : undefined,
        guardianName: isEditOneToOne ? editGuardianName : undefined,
        courseId: editCourseId || undefined,
        courseTitle: editCourseObj?.title || undefined,
        levelLabel: editLevelLabel || undefined,
        classId: editClassId || undefined,
        tutorId: matchedTutor?.id || undefined,
        tutorName: editTutorName || undefined,
        sessionTiming: editTiming,
        preferredTimeSlot: isEditOneToOne ? editTutoringSlot : undefined,
        tutoringDeliveryMode: isEditOneToOne ? editTutoringDeliveryMode : undefined,
        tutoringRoomOrAddress: isEditOneToOne ? editTutoringRoomOrAddress : undefined,
        fundingType: editFundingType,
        updatePaymentPlan: canManagePayments,
        paymentPlanType: editPlanType,
        months: editPlanType === "instalments" ? parseInt(editMonths, 10) : 1,
        totalPrice: parseFloat(editTotalPrice) || 0,
        amountPaidSoFar: parseFloat(editAmountPaid) || 0,
      };

      let res: any;
      try {
        res = await postLearnerApi("update", updatePayload);
      } catch {
        res = await updateLearnerAndEnrolmentAction(updatePayload);
      }

      if (res.success && res.learner) {
        setLearners((prev) =>
          prev.map((l) => (l.id === editingLearner.id ? res.learner! : l))
        );
        if (res.enrolment) {
          setEnrolments((prev) =>
            prev.map((enr) => (enr.id === res.enrolment!.id ? res.enrolment! : enr))
          );
        }
        if (res.paymentPlan) {
          setPaymentPlans((prev) => {
            const exists = prev.some(
              (p) =>
                p.enrolmentId === res.paymentPlan.enrolmentId ||
                (p.learnerId === editingLearner.id && !p.enrolmentId)
            );
            if (exists) {
              return prev.map((p) =>
                p.enrolmentId === res.paymentPlan.enrolmentId
                  ? res.paymentPlan
                  : p
              );
            }
            return [res.paymentPlan, ...prev];
          });
        }
        if (selectedLearner?.id === editingLearner.id) {
          setSelectedLearner(res.learner);
        }
        setEditingLearner(null);
        setFeedback(
          `Updated learner record and payment plan for ${res.learner.firstName} ${res.learner.lastName}.`
        );
        setTimeout(() => setFeedback(null), 5000);
      } else {
        alert((res as any).error || "Failed to update learner.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving learner changes.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Direct Log Payment Modal State
  const [paymentModalLearner, setPaymentModalLearner] = useState<Learner | null>(null);
  const [paymentModalEnrolment, setPaymentModalEnrolment] = useState<Enrolment | null>(null);
  const [paymentModalPlan, setPaymentModalPlan] = useState<LearnerPaymentPlanSummary | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "bacs" | "card" | "cash" | "employer" | "direct_debit" | "website_payment"
  >("bacs");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [isLoggingPayment, setIsLoggingPayment] = useState(false);

  const openLogPaymentModal = (learner: Learner, enr?: Enrolment, plan?: LearnerPaymentPlanSummary) => {
    setPaymentModalLearner(learner);
    setPaymentModalEnrolment(enr || null);
    setPaymentModalPlan(plan || null);
    const suggested = plan?.nextDueAmountGbp || (plan?.balanceRemainingGbp ? Math.min(plan.balanceRemainingGbp, 250) : 100);
    setPaymentAmount(suggested > 0 ? suggested.toString() : "100");
    setPaymentMethod("bacs");
    setPaymentReference(`BACS-${Date.now().toString(36).toUpperCase()}`);
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentNotes("");
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalLearner) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid payment amount greater than £0.");
      return;
    }

    setIsLoggingPayment(true);
    try {
      const paymentPayload = {
        learnerId: paymentModalLearner.id,
        enrolmentId: paymentModalEnrolment?.id,
        amount: amt,
        method: paymentMethod,
        reference: paymentReference || undefined,
        notes: paymentNotes || undefined,
        paymentDate: paymentDate || undefined,
      };

      let res: any;
      try {
        res = await postLearnerApi("log_payment", paymentPayload);
      } catch {
        res = await logLearnerPaymentAction(paymentPayload);
      }

      if (res.success) {
        setPaymentPlans((prev) =>
          prev.map((p) => {
            if (p.learnerId === paymentModalLearner.id || p.enrolmentId === paymentModalEnrolment?.id) {
              const newPaid = p.totalPaidGbp + amt;
              const newBalance = Math.max(0, p.totalAmountGbp - newPaid);
              return {
                ...p,
                totalPaidGbp: newPaid,
                balanceRemainingGbp: newBalance,
                status: newBalance <= 0 ? "settled" : p.status,
              };
            }
            return p;
          })
        );

        setFeedback(`Payment of £${amt.toFixed(2)} recorded for ${paymentModalLearner.firstName} ${paymentModalLearner.lastName}. Receipt reference: ${res.payment?.reference || paymentReference}`);
        setTimeout(() => setFeedback(null), 6000);
        setPaymentModalLearner(null);
      } else {
        alert(res.error || "Failed to record payment.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error logging payment.");
    } finally {
      setIsLoggingPayment(false);
    }
  };

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleImpersonate = async (userIdOrEmail: string, name: string) => {
    setIsImpersonatingId(userIdOrEmail);
    try {
      const res = await impersonateUserAction(userIdOrEmail);
      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        alert(res.error || "Failed to impersonate student");
        setIsImpersonatingId(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to impersonate student");
      setIsImpersonatingId(null);
    }
  };

  const openMoveModal = (enr: Enrolment) => {
    setMovingEnrolment(enr);
    setTargetClassId(enr.classId);
    setSelectedTutor(
      sanitizeTutorName(
        enr.tutorName ||
        classes.find((c) => c.id === enr.classId)?.tutorName,
        defaultTutorName
      )
    );
    setSelectedTiming(enr.sessionTiming || "evening");
  };

  const handleArchiveLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivingLearner) return;

    setIsArchiving(true);
    try {
      const res = await archiveLearnerAction(archivingLearner.id, archiveReason);
      setLearners((prev) =>
        prev.map((l) => (l.id === archivingLearner.id ? res.learner : l))
      );
      setArchivingLearner(null);
      setFeedback(
        `Learner ${archivingLearner.firstName} ${archivingLearner.lastName} has been archived. Their academic records, submissions, and payments remain legally preserved.`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive learner");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestoreLearner = async (learner: Learner) => {
    setIsRestoring(true);
    try {
      const res = await restoreLearnerAction(learner.id);
      setLearners((prev) =>
        prev.map((l) => (l.id === learner.id ? res.learner : l))
      );
      setFeedback(
        `Learner ${learner.firstName} ${learner.lastName} has been restored to active student status.`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to restore learner");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRemoveCourse = async (learner: Learner, enr: Enrolment) => {
    if (
      !confirm(
        `Are you sure you want to remove the course "${enr.courseTitle}" from ${learner.firstName} ${learner.lastName}'s enrolments? If this was entered by mistake, this will remove the course and its enrolment record immediately.`
      )
    ) {
      return;
    }

    try {
      const res = await adminDeleteOrCancelEnrolmentAction({
        enrolmentId: enr.id,
        learnerId: learner.id,
      });
      if (res && res.success) {
        setEnrolments((prev) => prev.filter((e) => e.id !== enr.id));
        setFeedback(
          `Removed "${enr.courseTitle}" from ${learner.firstName} ${learner.lastName}'s record.`
        );
        router.refresh();
        if (selectedLearner && selectedLearner.id === learner.id) {
          const remaining = enrolments.filter(
            (e) => e.learnerId === learner.id && e.id !== enr.id
          );
          if (remaining.length === 0) {
            setSelectedLearner(null);
          }
        }
        setTimeout(() => setFeedback(null), 5000);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to remove course.");
    }
  };

  const handleMoveCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingEnrolment || !targetClassId) return;

    setIsMoving(true);
    try {
      const payload = {
        enrolmentId: movingEnrolment.id,
        tutorName: selectedTutor,
        sessionTiming: selectedTiming,
        classId: targetClassId,
      };
      try {
        await postLearnerApi("assign_tutor", payload);
      } catch {
        await assignLearnerTutorAndSessionAction(movingEnrolment.id, {
          tutorName: selectedTutor,
          sessionTiming: selectedTiming,
          classId: targetClassId,
        });
      }
      const targetClass = classes.find((c) => c.id === targetClassId);

      setEnrolments((prev) =>
        prev.map((enr) =>
          enr.id === movingEnrolment.id
            ? {
              ...enr,
              classId: targetClassId,
              tutorName: selectedTutor,
              sessionTiming: selectedTiming,
              courseId: targetClass?.courseId || enr.courseId,
              courseTitle: targetClass?.name.split(" — ")[0] || enr.courseTitle,
              courseLevelLabel: targetClass?.courseLevelLabel || enr.courseLevelLabel,
            }
            : enr
        )
      );

      const learner = learners.find((l) => l.id === movingEnrolment.learnerId);
      setMovingEnrolment(null);
      setFeedback(
        `Learner ${learner?.firstName || ""} assigned to ${selectedTutor} (${selectedTiming === "afternoon" ? "Afternoon session 14:00–16:00" : "Evening session 18:30–20:30"}).`
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to allocate tutor and session");
    } finally {
      setIsMoving(false);
    }
  };

  const filteredLearners = learners.filter((learner) => {
    const learnerEnrs = enrolments.filter((e) => e.learnerId === learner.id);

    // Filter tab
    if (filter === "archived") {
      if (learner.accessStatus !== "archived") return false;
    } else if (filter === "all") {
      if (learner.accessStatus === "archived" && !search.trim()) return false;
    } else if (filter === "active") {
      if (learner.accessStatus !== "active") return false;
    } else if (filter === "paused") {
      if (learner.accessStatus !== "paused") return false;
    } else if (filter === "funded") {
      if (!learnerEnrs.some((e) => e.fundingType === "funded")) return false;
      if (learner.accessStatus === "archived") return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = `${learner.firstName} ${learner.lastName}`.toLowerCase().includes(q);
      const matchEmail = learner.email.toLowerCase().includes(q);
      const matchCourse = learnerEnrs.some(
        (e) =>
          e.courseTitle.toLowerCase().includes(q) ||
          (e.courseLevelLabel || "").toLowerCase().includes(q)
      );
      return matchName || matchEmail || matchCourse;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          role="status"
          className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2"
        >
          <Icon name="check-circle" size={16} className="text-emerald-700" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Controls: Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b border-line pb-2 sm:pb-0 sm:border-none flex-wrap">
          {(["all", "active", "paused", "funded", "archived"] as const).map((tab) => {
            const count =
              tab === "archived"
                ? learners.filter((l) => l.accessStatus === "archived").length
                : tab === "active"
                  ? learners.filter((l) => l.accessStatus === "active").length
                  : tab === "paused"
                    ? learners.filter((l) => l.accessStatus === "paused").length
                    : undefined;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 cursor-pointer ${filter === tab
                    ? "bg-navy-900 text-white"
                    : "bg-paper text-ink-soft hover:text-ink border border-line"
                  }`}
              >
                <span>{tab === "funded" ? "Workplace funded" : tab}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filter === tab ? "bg-white/20 text-white" : "bg-line text-ink"
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by learner name, email, or course..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-line bg-white text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
            />
            <span className="absolute left-2.5 top-2 text-ink-soft">
              <Icon name="search" size={14} />
            </span>
          </div>

          <button
            type="button"
            onClick={openNewEnrolModal}
            className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-700 text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm cursor-pointer shrink-0"
          >
            <Icon name="plus" size={14} />
            <span>Enrol New Student</span>
          </button>
        </div>
      </div>

      {/* Learners Directory Table */}
      <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-soft font-semibold bg-paper/60">
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4">Course &amp; Cohort</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4">Funding Stream</th>
                {canManagePayments && <th className="py-3 px-4">Plan, Fee &amp; Balance</th>}
                <th className="py-3 px-4">Enrolment Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={canManagePayments ? 7 : 6} className="py-8 text-center text-ink-soft">
                    No learners found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredLearners.map((learner) => {
                  const learnerEnrs = enrolments.filter((e) => e.learnerId === learner.id);
                  const enr = learnerEnrs[0];
                  const isPaused = learner.accessStatus === "paused";
                  const isArchived = learner.accessStatus === "archived";
                  const learnerPlans = paymentPlans.filter(
                    (p) =>
                      p.learnerId === learner.id ||
                      learnerEnrs.some((e) => e.id === p.enrolmentId)
                  );
                  const primaryPlan = learnerPlans[0];

                  return (
                    <tr
                      key={learner.id}
                      className={`hover:bg-paper/40 transition-colors ${isArchived ? "bg-slate-50/50 opacity-80" : ""
                        }`}
                    >
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-navy-900 block text-sm">
                            {learner.childName
                              ? `${learner.childName}`
                              : `${learner.firstName} ${learner.lastName}`}
                          </span>
                          {learner.childName && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-gold-300/40 border border-gold-500/40 text-navy-900 text-[9px] font-bold uppercase tracking-wider">
                              1-on-1 Pupil
                            </span>
                          )}
                          {learnerEnrs.length > 1 && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold uppercase tracking-wider">
                              {learnerEnrs.length} Courses
                            </span>
                          )}
                          {isArchived && (
                            <span className="px-1.5 py-0.2 rounded-xs bg-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider">
                              Archived
                            </span>
                          )}
                        </div>
                        {learner.childName && (
                          <div className="text-[11px] font-medium text-navy-900 mt-0.5">
                            Parent/Guardian: {learner.guardianName || `${learner.firstName} ${learner.lastName}`}
                          </div>
                        )}
                        <div className="text-[11px] text-ink-soft">
                          <span>{learner.email}</span> · <span>{learner.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top space-y-2">
                        {learnerEnrs.length === 0 ? (
                          <span className="text-ink-soft italic">No active course</span>
                        ) : (
                          learnerEnrs.map((itemEnr, idx) => {
                            const assignedClass = classes.find((c) => c.id === itemEnr.classId);
                            const isOneToOneEnr =
                              itemEnr.courseId === "course-tutoring-children" ||
                              itemEnr.classId === "class-tutoring-kids" ||
                              Boolean(itemEnr.tutoringDeliveryMode);
                            const locLower = (itemEnr.trainingLocation || "").toLowerCase();
                            const deliveryModeLabel =
                              itemEnr.tutoringDeliveryMode === "room_home_request" ||
                                locLower.includes("home") ||
                                locLower.includes("room")
                                ? "Home / Room Tutoring"
                                : itemEnr.tutoringDeliveryMode === "physical_centre" ||
                                  locLower.includes("gloucester") ||
                                  locLower.includes("centre")
                                  ? "Gloucester Centre (In-Person)"
                                  : "Live 1-on-1 Online";
                            return (
                              <div
                                key={itemEnr.id}
                                className={
                                  idx > 0
                                    ? "pt-2 border-t border-line/70 space-y-0.5"
                                    : "space-y-0.5"
                                }
                              >
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-navy-900">
                                    {itemEnr.courseTitle}
                                  </span>
                                  {itemEnr.courseLevelLabel && (
                                    <span className="px-1.5 py-0.2 rounded-xs bg-gold-300/30 border border-gold-500/40 text-navy-900 font-bold text-[10px]">
                                      {itemEnr.courseLevelLabel}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-ink-soft">
                                  Cohort: <strong>{assignedClass?.name || itemEnr.classId || "—"}</strong>
                                </div>
                                <div className="text-[11px] flex flex-wrap items-center gap-1.5 pt-0.5">
                                  <span className="font-medium text-navy-900">
                                    Tutor: {itemEnr.tutorName || assignedClass?.tutorName || "Unassigned / TBA"}
                                  </span>
                                  <span>·</span>
                                  <span className="capitalize font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                                    {isOneToOneEnr && itemEnr.preferredTimeSlot && itemEnr.preferredTimeSlot !== "self_paced"
                                      ? itemEnr.preferredTimeSlot
                                      : itemEnr.sessionTiming === "afternoon"
                                        ? "Afternoon (14:00–16:00)"
                                        : itemEnr.sessionTiming === "evening"
                                          ? "Evening (18:30–20:30)"
                                          : "Flexible / 1-on-1"}
                                  </span>
                                  {isOneToOneEnr && (
                                    <span className="px-1.5 py-0.5 rounded-xs bg-navy-900/10 text-navy-900 font-semibold text-[10px]">
                                      {deliveryModeLabel}
                                      {itemEnr.tutoringRoomOrAddress ? ` — ${itemEnr.tutoringRoomOrAddress}` : ""}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 pt-1 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => openEditLearnerModal(learner, itemEnr)}
                                    className="text-navy-900 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Edit course details, cohort or payment plan"
                                  >
                                    <Icon name="edit" size={10} />
                                    <span>Edit Course</span>
                                  </button>
                                  <span className="text-line">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCourse(learner, itemEnr)}
                                    className="text-rose-700 hover:text-rose-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Remove or cancel this mistaken course enrolment"
                                  >
                                    <Icon name="trash" size={10} />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span
                          className={`px-2 py-0.5 rounded-sm font-semibold text-[10px] capitalize border ${isArchived
                              ? "bg-slate-100 text-slate-700 border-slate-300"
                              : isPaused
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                        >
                          {learner.accessStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${enr?.fundingType === "funded"
                              ? "bg-gold-500/20 text-navy-900 border border-gold-500/40"
                              : "bg-paper text-ink-soft border border-line"
                            }`}
                        >
                          {enr?.fundingType === "funded" ? "Funded" : "Self-Pay"}
                        </span>
                      </td>
                      {canManagePayments && (
                        <td className="py-3 px-4 align-top space-y-2">
                          {learnerEnrs.length > 1 && (() => {
                            const totalAgreed = learnerPlans.reduce((sum, p) => sum + (p.totalAmountGbp || 0), 0);
                            const totalPaid = learnerPlans.reduce((sum, p) => sum + (p.totalPaidGbp || 0), 0);
                            const totalBal = Math.max(0, totalAgreed - totalPaid);
                            return (
                              <div className="p-2.5 bg-navy-900/5 rounded-xs border border-navy-900/15 mb-2 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-navy-900 uppercase text-[9px] tracking-wider">
                                    Combined ({learnerEnrs.length} Courses)
                                  </span>
                                  <span className="font-mono text-[10px] font-bold text-emerald-800">
                                    £{totalPaid.toLocaleString("en-GB")} Paid
                                  </span>
                                </div>
                                <div className="flex items-center justify-between font-mono text-[11px]">
                                  <span className="text-ink-soft">Total: £{totalAgreed.toLocaleString("en-GB")}</span>
                                  <span className={totalBal <= 0 ? "text-emerald-700 font-bold" : "text-amber-800 font-bold"}>
                                    {totalBal <= 0 ? "All Settled (£0)" : `Bal: £${totalBal.toLocaleString("en-GB")}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                          {learnerEnrs.map((itemEnr, idx) => {
                            const itemPlan =
                              learnerPlans.find((p) => p.enrolmentId === itemEnr.id) ||
                              (idx === 0 ? primaryPlan : undefined);
                            const pm =
                              itemPlan?.planMonths || (itemEnr as any)?.planMonths || 1;
                            return (
                              <div
                                key={itemEnr.id}
                                className={
                                  idx > 0
                                    ? "pt-2 border-t border-line/70 space-y-1"
                                    : "space-y-1"
                                }
                              >
                                {itemPlan ? (
                                  <>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider border ${pm > 1
                                            ? "bg-navy-900/10 text-navy-900 border-navy-900/20"
                                            : "bg-emerald-50 text-emerald-900 border-emerald-200"
                                          }`}
                                      >
                                        {pm > 1 ? `${pm}-Month Plan` : "Full Payment"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 font-mono text-xs">
                                      <span className="font-bold text-navy-900">
                                        £{itemPlan.totalPaidGbp.toLocaleString("en-GB")}
                                      </span>
                                      <span className="text-ink-soft text-[10px]">
                                        / £{itemPlan.totalAmountGbp.toLocaleString("en-GB")}
                                      </span>
                                    </div>
                                    <div>
                                      {itemPlan.balanceRemainingGbp <= 0 ? (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                          Settled (£0 bal)
                                        </span>
                                      ) : itemPlan.status === "overdue" ? (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                          Overdue: £{itemPlan.balanceRemainingGbp.toLocaleString("en-GB")}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                          Bal: £{itemPlan.balanceRemainingGbp.toLocaleString("en-GB")}
                                        </span>
                                      )}
                                    </div>
                                    {itemPlan.nextDueDate && itemPlan.balanceRemainingGbp > 0 && (
                                      <div className="text-[10px] text-ink-soft">
                                        Next: {new Date(itemPlan.nextDueDate).toLocaleDateString("en-GB")} (£
                                        {itemPlan.nextDueAmountGbp || 0})
                                      </div>
                                    )}
                                  </>
                                ) : itemEnr.fundingType === "funded" ? (
                                  <span className="text-ink-soft italic text-[11px]">Fully funded</span>
                                ) : (
                                  <span className="text-ink-soft text-[11px]">—</span>
                                )}
                              </div>
                            );
                          })}
                        </td>
                      )}
                      <td className="py-3 px-4 align-top text-ink-soft font-mono text-[11px]">
                        {new Date(learner.enrolmentDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {canManagePayments &&
                            !isArchived &&
                            learnerPlans.some((p) => p.balanceRemainingGbp > 0) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const owingPlan =
                                    learnerPlans.find((p) => p.balanceRemainingGbp > 0) ||
                                    primaryPlan;
                                  const owingEnr =
                                    learnerEnrs.find((e) => e.id === owingPlan?.enrolmentId) ||
                                    enr;
                                  openLogPaymentModal(learner, owingEnr, owingPlan);
                                }}
                                className="px-2 py-1 rounded-sm border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                title="Log offline or bank payment receipt"
                              >
                                <Icon name="credit-card" size={12} />
                                <span>Log Pay</span>
                              </button>
                            )}

                          {!isArchived && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditLearnerModal(learner, enr)}
                                className="px-2 py-1 rounded-sm border border-navy-900/30 bg-paper hover:bg-navy-900 hover:text-white text-navy-900 text-xs font-semibold transition-colors cursor-pointer"
                                title="Edit learner personal details, course level, or payment plan"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => openAddCourseModal(learner)}
                                className="px-2 py-1 rounded-sm border border-navy-900/30 bg-white hover:bg-navy-900 hover:text-white text-navy-900 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                title="Enrol this learner in a second or additional course"
                              >
                                <Icon name="plus" size={11} />
                                <span>Course</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            disabled={isImpersonatingId === learner.id || isImpersonatingId === learner.email}
                            onClick={() => handleImpersonate(learner.email || learner.id, `${learner.firstName} ${learner.lastName}`)}
                            className="px-2 py-1 rounded-sm border border-gold-500 bg-gold-300/20 hover:bg-gold-500 hover:text-navy-900 text-navy-900 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="View Student Portal as this learner"
                          >
                            <Icon name="eye" size={12} />
                            <span>{isImpersonatingId === learner.id || isImpersonatingId === learner.email ? "Loading..." : "View as Student"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedLearner(learner)}
                            className="px-2.5 py-1 text-xs text-navy-900 font-semibold hover:underline cursor-pointer"
                          >
                            Details
                          </button>
                          {isArchived ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreLearner(learner)}
                              disabled={isRestoring}
                              className="px-2.5 py-1 rounded-sm border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              title="Restore learner account to active student roster"
                            >
                              <Icon name="undo" size={12} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <>
                              {enr && (
                                <button
                                  type="button"
                                  onClick={() => openMoveModal(enr)}
                                  className="px-2.5 py-1 rounded-sm border border-navy-900 text-navy-900 text-xs font-semibold hover:bg-navy-900 hover:text-white transition-colors cursor-pointer"
                                >
                                  Assign Tutor / Session
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setArchivingLearner(learner);
                                  setArchiveReason("Course Completed / Graduated");
                                }}
                                className="px-2.5 py-1 rounded-sm border border-line text-ink-soft hover:text-red-700 hover:border-red-300 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                                title="Safely remove or archive learner while preserving records"
                              >
                                Archive
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!confirm(`Are you sure you want to permanently delete learner ${learner.firstName} ${learner.lastName}? This will permanently remove all associated enrolment and payment records.`)) return;
                                  try {
                                    const res = await deleteLearnerPermanentlyAction(learner.id);
                                    if (res.success) {
                                      setLearners((prev) => prev.filter((l) => l.id !== learner.id));
                                      setEnrolments((prev) => prev.filter((e) => e.learnerId !== learner.id));
                                    } else {
                                      alert("Failed to delete learner.");
                                    }
                                  } catch (e) {
                                    alert("Error deleting learner.");
                                  }
                                }}
                                className="p-1 rounded text-ink-soft hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Permanently Delete Learner Record"
                              >
                                <Icon name="trash" size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tutor & Session Allocation Modal */}
      {movingEnrolment && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Allocate Tutor & Study Session
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Allocate student to a tutor and choose afternoon or evening session timetable.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMovingEnrolment(null)}
                className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleMoveCohort} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Assigned Certified Tutor
                </label>
                <select
                  value={selectedTutor}
                  onChange={(e) => setSelectedTutor(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                >
                  <option value="Unassigned / TBA">Unassigned / TBA</option>
                  {realTutors.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                  {selectedTutor &&
                    selectedTutor !== "Unassigned / TBA" &&
                    !isFictionalTutorName(selectedTutor) &&
                    !realTutors.some((t) => t.name === selectedTutor) && (
                      <option value={selectedTutor}>{selectedTutor}</option>
                    )}
                </select>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Study Session Timing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTiming("afternoon")}
                    className={`p-2.5 rounded-sm border text-left transition-all ${selectedTiming === "afternoon"
                        ? "border-navy-900 bg-navy-50 font-bold"
                        : "border-line bg-white hover:bg-paper"
                      }`}
                  >
                    <span className="block font-bold text-navy-900">Afternoon Session</span>
                    <span className="text-[11px] text-ink-soft">14:00 – 16:00 UK Time</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTiming("evening")}
                    className={`p-2.5 rounded-sm border text-left transition-all ${selectedTiming === "evening"
                        ? "border-navy-900 bg-navy-50 font-bold"
                        : "border-line bg-white hover:bg-paper"
                      }`}
                  >
                    <span className="block font-bold text-navy-900">Evening Session</span>
                    <span className="text-[11px] text-ink-soft">18:30 – 20:30 UK Time</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Cohort / Class Group
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setTargetClassId(cid);
                    const matchedCohort = classes.find((c) => c.id === cid);
                    if (matchedCohort?.tutorName) {
                      setSelectedTutor(matchedCohort.tutorName);
                    }
                    if (matchedCohort?.sessionTiming) {
                      setSelectedTiming(matchedCohort.sessionTiming);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.scheduleDescription || cls.intakeLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-sm bg-paper border border-line text-[11px] text-ink-soft space-y-1">
                <span className="font-bold text-navy-900 block">Allocation Notes:</span>
                <p>
                  The learner&apos;s timetable and portal sessions will update immediately based on this tutor allocation and session timing.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setMovingEnrolment(null)}
                  className="px-3 py-1.5 rounded-sm border border-line text-ink-soft hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMoving}
                  className="px-4 py-1.5 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors disabled:opacity-50"
                >
                  {isMoving ? "Allocating..." : "Save Tutor & Session Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Safe Removal Modal */}
      {archivingLearner && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Archive Learner Record
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Safely remove {archivingLearner.firstName} {archivingLearner.lastName} from active roster.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setArchivingLearner(null)}
                className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3 rounded-sm bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Icon name="info" size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Why Archive Instead of Permanent Delete?</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  To comply with awarding body regulations (e.g. NCFE / Pearson) and financial auditing laws, student grades, assignments, and payment receipts are retained permanently. The student will lose portal access immediately, but their historical records can be viewed or restored at any time.
                </p>
              </div>
            </div>

            <form onSubmit={handleArchiveLearner} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Reason for Archival / Removal
                </label>
                <select
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                >
                  <option value="Course Completed / Graduated">
                    Course Completed / Graduated
                  </option>
                  <option value="Learner Withdrew from Study">
                    Learner Withdrew from Study
                  </option>
                  <option value="Non-Attendance / Inactive Account">
                    Non-Attendance / Inactive Account
                  </option>
                  <option value="Transferred to Another Institution">
                    Transferred to Another Institution
                  </option>
                  <option value="Duplicate Record / Administrative Cleanup">
                    Duplicate Record / Administrative Cleanup
                  </option>
                  <option value="Other / Special Circumstances">
                    Other / Special Circumstances
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setArchivingLearner(null)}
                  className="px-3.5 py-2 rounded-sm border border-line text-ink-soft hover:text-navy-900 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isArchiving}
                  className="px-4 py-2 rounded-sm bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Icon name="trash" size={14} />
                  <span>{isArchiving ? "Archiving..." : "Confirm Archival"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Learner Details Modal (Protected Payment Access) */}
      {selectedLearner && (() => {
        const learnerEnrs = enrolments.filter((e) => e.learnerId === selectedLearner.id);
        const enr = learnerEnrs[0];
        const learnerPlans = paymentPlans.filter(
          (p) =>
            p.learnerId === selectedLearner.id ||
            learnerEnrs.some((e) => e.id === p.enrolmentId)
        );

        return (
          <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-md border border-line p-6 max-w-lg w-full space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-line pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                      Learner Record
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded-sm text-[10px] font-semibold border ${selectedLearner.accessStatus === "active"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : selectedLearner.accessStatus === "archived"
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                    >
                      {selectedLearner.accessStatus}
                    </span>
                    {learnerEnrs.length > 1 && (
                      <span className="px-2 py-0.2 rounded-sm text-[10px] font-bold bg-navy-900 text-gold-300">
                        {learnerEnrs.length} Enrolled Courses
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-navy-900">
                    {selectedLearner.firstName} {selectedLearner.lastName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLearner(null)}
                  className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {selectedLearner.accessStatus === "archived" && (
                <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                  <Icon name="info" size={16} className="text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Account Archived &amp; Removed from Active Roster</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Archived on {selectedLearner.archivedAt ? new Date(selectedLearner.archivedAt).toLocaleDateString("en-GB") : "Recorded"}:{" "}
                      <span className="italic font-medium">{selectedLearner.archiveReason || "Administrative archival"}</span>. All qualification records, coursework submissions, and payment receipts remain permanently preserved.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-3 bg-paper p-3 rounded-sm border border-line">
                  <div>
                    <span className="text-ink-soft block text-[11px]">Email Address</span>
                    <strong className="text-navy-900">{selectedLearner.email}</strong>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[11px]">Telephone</span>
                    <strong className="text-navy-900">{selectedLearner.phone}</strong>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[11px]">Enrolment Date</span>
                    <strong className="text-navy-900 font-mono">
                      {new Date(selectedLearner.enrolmentDate).toLocaleDateString("en-GB")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-ink-soft block text-[11px]">Funding Stream</span>
                    <strong className="text-navy-900 capitalize">
                      {enr?.fundingType === "funded" ? "Workplace Funded" : "Self-Pay"}
                    </strong>
                  </div>
                </div>

                {/* Course History & Cohort Allocation (All Enrolled Courses) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                      Enrolled Qualifications ({learnerEnrs.length})
                    </h4>
                    {selectedLearner.accessStatus !== "archived" && (
                      <button
                        type="button"
                        onClick={() => {
                          const target = selectedLearner;
                          setSelectedLearner(null);
                          openAddCourseModal(target);
                        }}
                        className="text-navy-900 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="plus" size={12} />
                        <span>Add Another Course</span>
                      </button>
                    )}
                  </div>

                  {canManagePayments && learnerEnrs.length > 1 && (() => {
                    const totalAgreed = learnerPlans.reduce((sum, p) => sum + (p.totalAmountGbp || 0), 0);
                    const totalPaid = learnerPlans.reduce((sum, p) => sum + (p.totalPaidGbp || 0), 0);
                    const totalBal = Math.max(0, totalAgreed - totalPaid);
                    return (
                      <div className="p-3 bg-navy-900/5 rounded-sm border border-navy-900/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy-900 uppercase text-[11px] tracking-wider">
                            Combined Across All {learnerEnrs.length} Enrolments
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-800">
                            Total Paid: £{totalPaid.toLocaleString("en-GB")}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-white p-2 rounded border border-line">
                            <span className="text-[10px] text-ink-soft block">Combined Fees</span>
                            <strong className="text-navy-900 font-mono">£{totalAgreed.toLocaleString("en-GB")}</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-line">
                            <span className="text-[10px] text-ink-soft block">Total Paid</span>
                            <strong className="text-emerald-700 font-mono">£{totalPaid.toLocaleString("en-GB")}</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-line">
                            <span className="text-[10px] text-ink-soft block">Combined Balance</span>
                            <strong className={`font-mono ${totalBal <= 0 ? "text-emerald-700" : "text-amber-800"}`}>
                              £{totalBal.toLocaleString("en-GB")}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {learnerEnrs.map((itemEnr, idx) => {
                    const assignedClass = classes.find((c) => c.id === itemEnr.classId);
                    const itemPlan =
                      learnerPlans.find((p) => p.enrolmentId === itemEnr.id) ||
                      (idx === 0 ? learnerPlans[0] : undefined);
                    const pm = itemPlan?.planMonths || (itemEnr as any)?.planMonths || 1;

                    return (
                      <div
                        key={itemEnr.id}
                        className="p-3 rounded-sm border border-line bg-white space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-navy-900">
                                {itemEnr.courseTitle}
                              </span>
                              {itemEnr.courseLevelLabel && (
                                <span className="px-1.5 py-0.5 rounded-xs bg-gold-300/30 border border-gold-500/40 text-navy-900 font-bold text-[10px]">
                                  {itemEnr.courseLevelLabel}
                                </span>
                              )}
                            </div>
                            <div className="text-ink-soft mt-0.5">
                              Cohort: <strong>{assignedClass?.name || itemEnr.classId}</strong> · Tutor:{" "}
                              {itemEnr.tutorName || assignedClass?.tutorName || "Unassigned"}
                            </div>
                            <div className="text-[11px] text-ink-soft">
                              Schedule: {assignedClass?.scheduleDescription || "Evening / Afternoon Blended"}
                            </div>
                          </div>
                          {selectedLearner.accessStatus !== "archived" && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const target = selectedLearner;
                                  setSelectedLearner(null);
                                  openEditLearnerModal(target, itemEnr);
                                }}
                                className="px-2 py-1 rounded-sm border border-line bg-paper hover:bg-navy-900 hover:text-white text-navy-900 font-semibold text-[11px] cursor-pointer"
                              >
                                Edit Course
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleRemoveCourse(selectedLearner, itemEnr);
                                }}
                                className="px-2 py-1 rounded-sm border border-rose-300 bg-rose-50 hover:bg-rose-700 hover:text-white text-rose-700 font-semibold text-[11px] cursor-pointer"
                                title="Remove or cancel this mistaken course enrolment"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        {canManagePayments && (
                          <div className="pt-2 border-t border-line/70 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-navy-900 text-[11px] flex items-center gap-1.5">
                                <span>Payment Plan:</span>
                                <span className="px-1.5 py-0.5 rounded-xs bg-navy-900/10 text-navy-900 font-bold text-[10px]">
                                  {itemEnr.fundingType === "funded"
                                    ? "Funded"
                                    : pm > 1
                                      ? `${pm}-Month Instalment Plan`
                                      : "Full Upfront Payment"}
                                </span>
                              </span>
                              {itemPlan &&
                                itemPlan.balanceRemainingGbp > 0 &&
                                selectedLearner.accessStatus !== "archived" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openLogPaymentModal(selectedLearner, itemEnr, itemPlan);
                                    }}
                                    className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] underline cursor-pointer"
                                  >
                                    + Record Payment
                                  </button>
                                )}
                            </div>

                            {itemPlan ? (
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-paper p-2 rounded border border-line">
                                  <span className="text-ink-soft block text-[10px]">Agreed Fee</span>
                                  <strong className="text-navy-900 font-mono">
                                    £{itemPlan.totalAmountGbp.toLocaleString("en-GB")}
                                  </strong>
                                </div>
                                <div className="bg-paper p-2 rounded border border-line">
                                  <span className="text-ink-soft block text-[10px]">Paid to Date</span>
                                  <strong className="text-emerald-700 font-mono">
                                    £{itemPlan.totalPaidGbp.toLocaleString("en-GB")}
                                  </strong>
                                </div>
                                <div className="bg-paper p-2 rounded border border-line">
                                  <span className="text-ink-soft block text-[10px]">Balance Due</span>
                                  <strong
                                    className={`font-mono ${itemPlan.balanceRemainingGbp > 0
                                        ? "text-amber-800"
                                        : "text-emerald-700"
                                      }`}
                                  >
                                    £{itemPlan.balanceRemainingGbp.toLocaleString("en-GB")}
                                  </strong>
                                </div>
                              </div>
                            ) : (
                              <p className="text-ink-soft italic text-[11px]">
                                {itemEnr.fundingType === "funded"
                                  ? "Government / Employer Funded Placement."
                                  : "No payment plan on file."}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Administrative Notes */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                    Office Notes
                  </h4>
                  <p className="p-2.5 rounded-sm bg-paper border border-line text-ink leading-relaxed">
                    {selectedLearner.notes || "No operational notes recorded."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-line">
                {selectedLearner.accessStatus !== "archived" ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedLearner;
                      setSelectedLearner(null);
                      openEditLearnerModal(target, enr);
                    }}
                    className="px-3.5 py-2 rounded-sm border border-navy-900 text-navy-900 font-bold hover:bg-navy-900 hover:text-white transition-colors text-xs cursor-pointer"
                  >
                    Edit Learner &amp; Payment Plan
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={() => setSelectedLearner(null)}
                  className="px-4 py-2 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors text-xs cursor-pointer"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Enrol New Student / Add Course Modal */}
      {isEnrolModalOpen && (
        <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-navy-900 text-white flex items-center justify-center font-bold">
                  <Icon name={enrolExistingLearner ? "plus" : "user"} size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-navy-900">
                    {enrolExistingLearner
                      ? `Enrol ${enrolExistingLearner.firstName} ${enrolExistingLearner.lastName} in an Additional Course`
                      : "Enrol New Student & Issue Portal Credentials"}
                  </h3>
                  <p className="text-xs text-ink-soft">
                    {enrolExistingLearner
                      ? "Links this new qualification and its level-based payment plan to the student's existing account."
                      : "Creates the student profile, registers qualification enrolment, and dispatches the welcome induction email."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEnrolExistingLearner(null);
                  setIsEnrolModalOpen(false);
                }}
                className="text-ink-soft hover:text-navy-900 text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {enrolCreatedSuccess ? (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-xs space-y-2">
                  <strong className="text-sm font-bold text-emerald-900 block flex items-center gap-1.5">
                    <Icon name="check-circle" size={16} className="text-emerald-700" />
                    <span>
                      {enrolCreatedSuccess.isAdditionalCourse
                        ? "Additional Course Added to Student Account!"
                        : "Student Onboarded & Induction Dispatched!"}
                    </span>
                  </strong>
                  <p className="text-emerald-800 leading-relaxed">
                    {enrolCreatedSuccess.isAdditionalCourse ? (
                      <>
                        The new qualification and payment plan have been linked to{" "}
                        <strong>{enrolCreatedSuccess.name}</strong>&apos;s existing Student Portal account.
                      </>
                    ) : (
                      <>
                        Student account for <strong>{enrolCreatedSuccess.name}</strong> has been created. A welcome email containing induction materials and portal access instructions has been dispatched.
                      </>
                    )}
                  </p>
                  <div className="p-3 bg-white rounded border border-emerald-300/60 font-mono text-xs space-y-1">
                    <div><strong>Student ID:</strong> {enrolCreatedSuccess.studentId}</div>
                    <div><strong>Portal Login:</strong> {enrolCreatedSuccess.email}</div>
                    {enrolCreatedSuccess.tempPass && (
                      <div>
                        <strong>Temporary Password:</strong>{" "}
                        <span className="bg-gold-300/40 px-1.5 py-0.5 rounded font-bold text-navy-900">
                          {enrolCreatedSuccess.tempPass}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEnrolCreatedSuccess(null);
                      setEnrolExistingLearner(null);
                      setIsEnrolModalOpen(false);
                    }}
                    className="px-4 py-2 bg-navy-900 text-white rounded-sm font-semibold text-xs hover:bg-navy-700 cursor-pointer"
                  >
                    Done &amp; View in Directory
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!enrolFirstName.trim() || !enrolLastName.trim() || !enrolEmail.trim()) {
                    alert("Please provide the student's name and email address.");
                    return;
                  }

                  setIsEnrolling(true);
                  try {
                    const priceNum = parseFloat(enrolPrice) || 1250;
                    const depNum = enrolIsHistorical
                      ? parseFloat(enrolAmountPaidToDate) || 0
                      : parseFloat(enrolDeposit) || 0;
                    const monthsNum =
                      enrolPlanType === "instalments" ? parseInt(enrolMonths, 10) || 6 : 1;
                    const remainingToSpread = Math.max(0, priceNum - depNum);
                    const monthlyNum =
                      monthsNum > 1
                        ? Math.round((remainingToSpread / monthsNum) * 100) / 100
                        : remainingToSpread;

                    const firstCourse = enrolCourses[0] || createDefaultCourseSelection();
                    const firstCourseObj = availableCourses.find((c) => c.id === firstCourse.courseId) || availableCourses[0];
                    const isFirstOneToOne =
                      firstCourse.courseId === "course-tutoring-children" ||
                      firstCourse.classId === "class-tutoring-kids" ||
                      Boolean(firstCourseObj?.is_private_tutoring);
                    const matchedFirstTutor = realTutors.find((t) => t.name === firstCourse.tutorName);

                    const extraCourses = enrolCourses.slice(1).map((c) => {
                      const cObj = availableCourses.find((x) => x.id === c.courseId);
                      const isO2O = c.courseId === "course-tutoring-children" || c.classId === "class-tutoring-kids" || Boolean(cObj?.is_private_tutoring);
                      const matchedT = realTutors.find((t) => t.name === c.tutorName);
                      return {
                        courseId: c.courseId,
                        courseTitle: cObj?.title || "Accredited Qualification",
                        levelLabel: c.levelLabel,
                        classId: isO2O ? "class-tutoring-kids" : c.classId,
                        className: isO2O ? "1-on-1 Academic Tutoring" : classes.find((cls) => cls.id === c.classId)?.name || "Evening Cohort",
                        tutorId: matchedT?.id,
                        tutorName: c.tutorName,
                        sessionTiming: isO2O ? ("self_paced" as const) : c.sessionTiming,
                        preferredTimeSlot: isO2O ? c.tutoringSlot : c.sessionTiming,
                        tutoringDeliveryMode: isO2O ? c.tutoringDeliveryMode : undefined,
                        tutoringRoomOrAddress: isO2O ? c.tutoringRoomOrAddress.trim() || undefined : undefined,
                        childName: isO2O ? c.childName.trim() || undefined : undefined,
                        childConcerns: isO2O ? c.childConcerns.trim() || undefined : undefined,
                        guardianName: isO2O ? c.guardianName.trim() || undefined : undefined,
                        price: c.price,
                      };
                    });

                    const enrolPayload = {
                      existingLearnerId: enrolExistingLearner?.id,
                      firstName: enrolFirstName,
                      lastName: enrolLastName,
                      email: enrolEmail,
                      phone: enrolPhone,
                      dateOfBirth: enrolDob || undefined,
                      addressLine1: enrolAddress || undefined,
                      postcode: enrolPostcode || undefined,
                      emergencyContactName: enrolEmergencyName || undefined,
                      emergencyContactPhone: enrolEmergencyPhone || undefined,
                      learnerType: (isFirstOneToOne ? "child" : "myself") as "child" | "myself",
                      childName: isFirstOneToOne
                        ? firstCourse.childName.trim() || `${enrolFirstName.trim()} ${enrolLastName.trim()}`
                        : undefined,
                      childYearGroup: isFirstOneToOne ? firstCourse.levelLabel : undefined,
                      childConcerns: isFirstOneToOne ? firstCourse.childConcerns.trim() || undefined : undefined,
                      guardianName: isFirstOneToOne ? firstCourse.guardianName.trim() || undefined : undefined,
                      guardianPhone: isFirstOneToOne ? enrolPhone : undefined,
                      courseId: firstCourse.courseId,
                      courseTitle: firstCourseObj?.title || "Accredited Qualification",
                      levelLabel: firstCourse.levelLabel,
                      classId: isFirstOneToOne ? "class-tutoring-kids" : firstCourse.classId,
                      className: isFirstOneToOne
                        ? "1-on-1 Academic Tutoring"
                        : classes.find((c) => c.id === firstCourse.classId)?.name || "Evening Cohort",
                      tutorId: matchedFirstTutor?.id,
                      tutorName: firstCourse.tutorName,
                      sessionTiming: isFirstOneToOne ? "self_paced" : firstCourse.sessionTiming,
                      preferredTimeSlot: isFirstOneToOne ? firstCourse.tutoringSlot : firstCourse.sessionTiming,
                      tutoringDeliveryMode: isFirstOneToOne ? firstCourse.tutoringDeliveryMode : undefined,
                      tutoringRoomOrAddress: isFirstOneToOne
                        ? firstCourse.tutoringRoomOrAddress.trim() || undefined
                        : undefined,
                      additionalCourses: extraCourses,
                      fundingType: enrolFundingType,
                      paymentPlanType: enrolPlanType,
                      totalPrice: priceNum,
                      depositAmount: depNum,
                      monthlyAmount: monthlyNum,
                      months: monthsNum,
                      paymentMethod: enrolPaymentMethod,
                      paymentStatus: enrolPaymentMethod,
                      isHistorical: enrolIsHistorical,
                      enrolmentDate:
                        enrolIsHistorical && enrolHistoricalDate
                          ? new Date(enrolHistoricalDate).toISOString()
                          : undefined,
                      amountPaidToDate: enrolIsHistorical ? depNum : undefined,
                      historicalNotes: enrolIsHistorical ? enrolHistoricalNotes : undefined,
                    };

                    let res: any;
                    try {
                      res = await postLearnerApi("enrol", enrolPayload);
                    } catch {
                      res = await adminEnrolNewStudentAction(enrolPayload);
                    }

                    if (res.success && res.learner && res.enrolment) {
                      setLearners((prev) => {
                        const exists = prev.some((l) => l.id === res.learner.id);
                        if (exists) {
                          return prev.map((l) => (l.id === res.learner.id ? res.learner : l));
                        }
                        return [res.learner, ...prev];
                      });
                      if (Array.isArray(res.enrolments) && res.enrolments.length > 0) {
                        setEnrolments((prev) => [...res.enrolments, ...prev]);
                      } else {
                        setEnrolments((prev) => [res.enrolment, ...prev]);
                      }

                      if (canManagePayments && res.paymentPlan) {
                        setPaymentPlans((prev) => [res.paymentPlan as any, ...prev]);
                      }

                      setEnrolCreatedSuccess({
                        name: `${res.learner.firstName} ${res.learner.lastName}`,
                        email: res.learner.email,
                        tempPass: res.tempPassword,
                        studentId: res.learner.id,
                        isAdditionalCourse: res.isAdditionalCourse,
                      });
                      setFeedback(
                        res.isAdditionalCourse
                          ? `Added ${res.enrolment.courseTitle} (${res.enrolment.courseLevelLabel}) to ${res.learner.firstName} ${res.learner.lastName}'s courses.`
                          : `Student ${res.learner.firstName} ${res.learner.lastName} enrolled successfully.`
                      );
                    }
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Failed to enrol student.");
                  } finally {
                    setIsEnrolling(false);
                  }
                }}
                className="overflow-y-auto pr-1 space-y-4 text-xs flex-1"
              >
                {/* 1. Student Personal Details */}
                <div className="space-y-3 p-3.5 bg-paper rounded-sm border border-line">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Icon name="user" size={13} className="text-gold-700" />
                    <span>1. Student Identity &amp; Contact Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={enrolFirstName}
                        onChange={(e) => setEnrolFirstName(e.target.value)}
                        placeholder="e.g. Sarah"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={enrolLastName}
                        onChange={(e) => setEnrolLastName(e.target.value)}
                        placeholder="e.g. Jenkins"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={enrolEmail}
                        onChange={(e) => setEnrolEmail(e.target.value)}
                        placeholder="sarah.jenkins@example.com"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={enrolPhone}
                        onChange={(e) => setEnrolPhone(e.target.value)}
                        placeholder="+44 7700 900123"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={enrolDob}
                        onChange={(e) => setEnrolDob(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Postcode (Ofqual Cert)</label>
                      <input
                        type="text"
                        value={enrolPostcode}
                        onChange={(e) => setEnrolPostcode(e.target.value)}
                        placeholder="GL1 1UG"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">Home / Postal Address</label>
                    <input
                      type="text"
                      value={enrolAddress}
                      onChange={(e) => setEnrolAddress(e.target.value)}
                      placeholder="Flat 3B, Brunswick Square, Gloucester"
                      className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                    />
                  </div>
                </div>

                {/* 2. Course & Cohort Assignment */}
                {(() => {
                  const existingEnrolmentsForLearner = enrolExistingLearner
                    ? enrolments.filter(
                        (e) => e.learnerId === enrolExistingLearner.id && e.status !== "cancelled"
                      )
                    : [];
                  const existingPlan = enrolExistingLearner
                    ? paymentPlans.find((p) => p.learnerId === enrolExistingLearner.id)
                    : null;
                  const currentTotalFee = existingPlan
                    ? existingPlan.totalAmountGbp
                    : existingEnrolmentsForLearner.reduce((acc, enr) => {
                        const cObj = availableCourses.find((c) => c.id === enr.courseId);
                        const lvlObj = cObj?.levels?.find((l) => l.level_label === enr.courseLevelLabel) || cObj?.levels?.[0];
                        return acc + (lvlObj?.price_gbp || 1250);
                      }, 0);
                  const currentPaidToDate = existingPlan ? existingPlan.totalPaidGbp : 0;
                  const additionalCoursesPrice = enrolCourses.reduce((s, it) => s + it.price, 0);
                  const mergedTotalPrice = enrolExistingLearner
                    ? currentTotalFee + additionalCoursesPrice
                    : additionalCoursesPrice;
                  const mergedBalanceRemaining = Math.max(
                    0,
                    mergedTotalPrice - (enrolExistingLearner ? currentPaidToDate : (parseFloat(enrolDeposit) || 0))
                  );

                  const allCourseSelections = enrolExistingLearner
                    ? [
                        ...existingEnrolmentsForLearner.map((e) => ({ levelLabel: e.courseLevelLabel })),
                        ...enrolCourses,
                      ]
                    : enrolCourses;
                  const hasAnyLevelFiveOrAbove = allCourseSelections.some((c) => isLevelFiveOrAbove(c.levelLabel || ""));
                  const allowedInstalmentMonths = hasAnyLevelFiveOrAbove
                    ? [6, 10, 12, 14]
                    : [3, 6, 10, 12];

                  return (
                    <div className="space-y-4">
                      <div className="space-y-4 p-3.5 bg-paper rounded-sm border border-line">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <Icon name="book-open" size={13} className="text-gold-700" />
                            <span>2. Qualification &amp; Academic Cohort Assignment</span>
                          </h4>
                          <span className="text-[10px] font-bold text-navy-900 bg-navy-900/10 px-2 py-0.5 rounded-xs">
                            {enrolExistingLearner
                              ? `${enrolCourses.length} Additional Course${enrolCourses.length > 1 ? "s" : ""} to Add`
                              : enrolCourses.length === 1
                              ? "1 Course Selected"
                              : `${enrolCourses.length} Courses Selected`}
                          </span>
                        </div>

                        {/* Current Enrolled Courses for Existing Learner */}
                        {enrolExistingLearner && existingEnrolmentsForLearner.length > 0 && (
                          <div className="p-3 bg-white rounded-sm border border-emerald-300 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                              <span className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
                                <Icon name="check-circle" size={13} className="text-emerald-700" />
                                <span>Current Active Course(s) for {enrolExistingLearner.firstName} {enrolExistingLearner.lastName}</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Already Enrolled ({existingEnrolmentsForLearner.length})
                              </span>
                            </div>
                            <div className="space-y-2">
                              {existingEnrolmentsForLearner.map((currEnr) => {
                                const cObj = availableCourses.find((c) => c.id === currEnr.courseId);
                                const lvlObj = cObj?.levels?.find((l) => l.level_label === currEnr.courseLevelLabel) || cObj?.levels?.[0];
                                const fee = lvlObj?.price_gbp || 1250;
                                return (
                                  <div key={currEnr.id} className="p-2.5 rounded-xs bg-paper border border-line text-xs flex items-center justify-between gap-3">
                                    <div>
                                      <strong className="text-navy-900 block">{currEnr.courseTitle}</strong>
                                      <span className="text-[11px] text-ink-soft">
                                        Level: <strong>{currEnr.courseLevelLabel}</strong> · Cohort: {classes.find((c) => c.id === currEnr.classId)?.name || "Evening Cohort"} · Tutor: {currEnr.tutorName || "Assigned"}
                                      </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-[11px] font-mono font-bold text-navy-900 block">
                                        £{fee.toFixed(2)}
                                      </span>
                                      <span className="text-[10px] text-emerald-700 font-semibold block">
                                        Current Active
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {enrolCourses.map((cItem, cIdx) => {
                            const cObj = availableCourses.find((c) => c.id === cItem.courseId) || availableCourses[0];
                            const levelsList = cObj?.levels || [];
                            const isOneToOne =
                              cItem.courseId === "course-tutoring-children" ||
                              cItem.classId === "class-tutoring-kids" ||
                              Boolean(cObj?.is_private_tutoring);

                            return (
                              <div
                                key={cIdx}
                                className="p-3 bg-white rounded-sm border border-line space-y-3 shadow-2xs"
                              >
                                <div className="flex items-center justify-between pb-1 border-b border-line/60">
                                  <span className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-navy-900 text-white text-[10px] flex items-center justify-center font-bold">
                                      {cIdx + 1}
                                    </span>
                                    <span>
                                      {enrolExistingLearner
                                        ? `Additional Qualification to Add (Course #${cIdx + 1})`
                                        : `Course #${cIdx + 1}`}
                                    </span>
                                  </span>
                                  {enrolCourses.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = enrolCourses.filter((_, i) => i !== cIdx);
                                        setEnrolCourses(updated);
                                        const sum = updated.reduce((s, it) => s + it.price, 0);
                                        setEnrolPrice((enrolExistingLearner ? currentTotalFee + sum : sum).toString());
                                      }}
                                      className="text-red-700 hover:text-red-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Icon name="trash" size={12} />
                                      <span>Remove</span>
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">Qualification *</label>
                                    <select
                                      value={cItem.courseId}
                                      onChange={(e) => {
                                        const newCid = e.target.value;
                                        const courseObj = availableCourses.find((x) => x.id === newCid);
                                        const isO2O = newCid === "course-tutoring-children" || Boolean(courseObj?.is_private_tutoring);
                                        const newLvl = courseObj?.levels?.[0]?.level_label || "Level 3";
                                        const newPrice = courseObj?.levels?.[0]?.price_gbp || 1250;
                                        const updated = enrolCourses.map((item, i) =>
                                          i === cIdx
                                            ? {
                                                ...item,
                                                courseId: newCid,
                                                levelLabel: newLvl,
                                                price: newPrice,
                                                classId: isO2O ? "class-tutoring-kids" : classes[0]?.id || item.classId,
                                                sessionTiming: isO2O ? ("self_paced" as const) : ("evening" as const),
                                              }
                                            : item
                                        );
                                        setEnrolCourses(updated);
                                        const sum = updated.reduce((s, it) => s + it.price, 0);
                                        setEnrolPrice((enrolExistingLearner ? currentTotalFee + sum : sum).toString());
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                                    >
                                      {availableCourses.map((c) => {
                                        const levelSummary = (c.levels || [])
                                          .map((l) => `${l.level_label}: £${l.price_gbp}`)
                                          .join(", ");
                                        return (
                                          <option key={c.id} value={c.id}>
                                            {c.title} ({c.category}){levelSummary ? ` — [${levelSummary}]` : ""}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">Qualification Level &amp; Fee</label>
                                    <select
                                      value={cItem.levelLabel}
                                      onChange={(e) => {
                                        const newLvl = e.target.value;
                                        const courseObj = availableCourses.find((x) => x.id === cItem.courseId);
                                        const lvlObj = courseObj?.levels?.find((l) => l.level_label === newLvl);
                                        const newPrice = lvlObj?.price_gbp || cItem.price;
                                        const updated = enrolCourses.map((item, i) =>
                                          i === cIdx ? { ...item, levelLabel: newLvl, price: newPrice } : item
                                        );
                                        setEnrolCourses(updated);
                                        const sum = updated.reduce((s, it) => s + it.price, 0);
                                        setEnrolPrice((enrolExistingLearner ? currentTotalFee + sum : sum).toString());
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                                    >
                                      {levelsList.length > 0 ? (
                                        levelsList.map((lvl) => (
                                          <option key={lvl.level_label} value={lvl.level_label}>
                                            {lvl.level_label} (£{lvl.price_gbp})
                                          </option>
                                        ))
                                      ) : (
                                        <option value={cItem.levelLabel || "Level 3"}>
                                          {cItem.levelLabel || "Level 3"}
                                        </option>
                                      )}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">Class Cohort Group</label>
                                    <select
                                      value={cItem.classId}
                                      onChange={(e) => {
                                        const newClassId = e.target.value;
                                        const cl = classes.find((c) => c.id === newClassId);
                                        const updated = enrolCourses.map((item, i) =>
                                          i === cIdx
                                            ? {
                                                ...item,
                                                classId: newClassId,
                                                tutorName: cl?.tutorName && !isFictionalTutorName(cl.tutorName) ? cl.tutorName : item.tutorName,
                                              }
                                            : item
                                        );
                                        setEnrolCourses(updated);
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                    >
                                      {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                          {c.name} ({c.scheduleDescription || c.intakeLabel})
                                        </option>
                                      ))}
                                      <option value="class-tutoring-kids">1-on-1 Academic Tutoring (After-School / Sat)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">Assigned Tutor</label>
                                    <select
                                      value={cItem.tutorName}
                                      onChange={(e) => {
                                        const newTutor = e.target.value;
                                        setEnrolCourses((prev) =>
                                          prev.map((item, i) => (i === cIdx ? { ...item, tutorName: newTutor } : item))
                                        );
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                    >
                                      <option value="Unassigned / TBA">Unassigned / TBA</option>
                                      {realTutors.map((t) => (
                                        <option key={t.id} value={t.name}>
                                          {t.name} ({t.email})
                                        </option>
                                      ))}
                                      {cItem.tutorName &&
                                        cItem.tutorName !== "Unassigned / TBA" &&
                                        !isFictionalTutorName(cItem.tutorName) &&
                                        !realTutors.some((t) => t.name === cItem.tutorName) && (
                                          <option value={cItem.tutorName}>{cItem.tutorName}</option>
                                        )}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">Session Timing</label>
                                    <select
                                      value={cItem.sessionTiming}
                                      onChange={(e) => {
                                        const newTiming = e.target.value as "evening" | "afternoon" | "self_paced";
                                        setEnrolCourses((prev) =>
                                          prev.map((item, i) => (i === cIdx ? { ...item, sessionTiming: newTiming } : item))
                                        );
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                    >
                                      <option value="evening">Evening Session (18:30 – 20:30)</option>
                                      <option value="afternoon">Afternoon Session (14:00 – 16:00)</option>
                                      <option value="self_paced">Flexible / 1-on-1 Tutoring</option>
                                    </select>
                                  </div>

                                  {isOneToOne && (
                                    <div className="sm:col-span-2 p-3 rounded-sm bg-navy-900/5 border border-navy-900/15 space-y-3 mt-1">
                                      <span className="text-[11px] font-bold text-navy-900 uppercase tracking-wider block">
                                        1-on-1 Tutoring Setup for this Course
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[11px] font-semibold text-navy-900 mb-1">Pupil Name</label>
                                          <input
                                            type="text"
                                            value={cItem.childName}
                                            onChange={(e) => {
                                              const v = e.target.value;
                                              setEnrolCourses((prev) =>
                                                prev.map((item, i) => (i === cIdx ? { ...item, childName: v } : item))
                                              );
                                            }}
                                            placeholder="Leave blank to use student name"
                                            className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] font-semibold text-navy-900 mb-1">Parent / Guardian</label>
                                          <input
                                            type="text"
                                            value={cItem.guardianName}
                                            onChange={(e) => {
                                              const v = e.target.value;
                                              setEnrolCourses((prev) =>
                                                prev.map((item, i) => (i === cIdx ? { ...item, guardianName: v } : item))
                                              );
                                            }}
                                            placeholder="e.g. Parent Name"
                                            className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] font-semibold text-navy-900 mb-1">Tutoring Slot</label>
                                          <input
                                            type="text"
                                            value={cItem.tutoringSlot}
                                            onChange={(e) => {
                                              const v = e.target.value;
                                              setEnrolCourses((prev) =>
                                                prev.map((item, i) => (i === cIdx ? { ...item, tutoringSlot: v } : item))
                                              );
                                            }}
                                            placeholder="e.g. Saturday, 10:00am"
                                            className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] font-semibold text-navy-900 mb-1">Delivery Mode</label>
                                          <select
                                            value={cItem.tutoringDeliveryMode}
                                            onChange={(e) => {
                                              const v = e.target.value as any;
                                              setEnrolCourses((prev) =>
                                                prev.map((item, i) => (i === cIdx ? { ...item, tutoringDeliveryMode: v } : item))
                                              );
                                            }}
                                            className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                                          >
                                            <option value="physical_centre">Gloucester College Centre</option>
                                            <option value="online">Live 1-on-1 Online</option>
                                            <option value="room_home_request">Home / Room Request</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => {
                              const usedIds = new Set(enrolCourses.map((c) => c.courseId));
                              const nextUnused = availableCourses.find((c) => !usedIds.has(c.id)) || availableCourses[0];
                              const newCourseBlock = createDefaultCourseSelection(nextUnused);
                              const updated = [...enrolCourses, newCourseBlock];
                              setEnrolCourses(updated);
                              const sumPrice = updated.reduce((s, item) => s + item.price, 0);
                              setEnrolPrice((enrolExistingLearner ? currentTotalFee + sumPrice : sumPrice).toString());
                            }}
                            className="w-full py-2.5 border-2 border-dashed border-navy-900/40 hover:border-navy-900 rounded-sm text-xs font-bold text-navy-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white hover:bg-navy-50"
                          >
                            <Icon name="plus" size={14} />
                            <span>+ Add Another Course to this Enrolment</span>
                          </button>
                        </div>
                      </div>

                      {/* 3. Tuition Fee & Payment Plan */}
                      <div className="space-y-3 p-3.5 bg-paper rounded-sm border border-line">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <Icon name="credit-card" size={13} className="text-gold-700" />
                            <span>3. Tuition Fee &amp; Level-Based Instalment Plan</span>
                          </h4>
                          <span className="px-2 py-0.5 rounded-xs bg-navy-900/10 text-navy-900 font-bold text-[10px]">
                            {hasAnyLevelFiveOrAbove
                              ? "Level 5+: 6, 10, 12 & 14 Month Plans Available"
                              : "Level 2–4: 3, 6, 10 & 12 Month Plans Available"}
                          </span>
                        </div>

                        {/* Merged Tuition Overview if Adding to Existing Student */}
                        {enrolExistingLearner && (
                          <div className="p-3 bg-white rounded-sm border border-line space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-line/60 pb-1.5">
                              <span className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                                Merged Tuition &amp; Multi-Course Balance
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${hasAnyLevelFiveOrAbove ? "bg-gold-300 text-navy-900 font-bold" : "bg-navy-900/10 text-navy-900"}`}>
                                {hasAnyLevelFiveOrAbove
                                  ? "Level 5+ Rule Active (6, 10, 12, 14 Months)"
                                  : "Level 2–4 Rule Active (3, 6, 10, 12 Months)"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="p-2 bg-paper rounded-xs border border-line">
                                <span className="text-[10px] text-ink-soft block uppercase font-semibold">Current Course(s)</span>
                                <span className="font-bold text-navy-900 text-xs">£{currentTotalFee.toFixed(2)}</span>
                              </div>
                              <div className="p-2 bg-paper rounded-xs border border-line">
                                <span className="text-[10px] text-ink-soft block uppercase font-semibold">Paid to Date</span>
                                <span className="font-bold text-emerald-700 text-xs">£{currentPaidToDate.toFixed(2)}</span>
                              </div>
                              <div className="p-2 bg-paper rounded-xs border border-line">
                                <span className="text-[10px] text-ink-soft block uppercase font-semibold">New Course(s)</span>
                                <span className="font-bold text-navy-900 text-xs">+£{additionalCoursesPrice.toFixed(2)}</span>
                              </div>
                              <div className="p-2 bg-navy-900/5 rounded-xs border border-navy-900/20">
                                <span className="text-[10px] text-navy-900 block uppercase font-bold">Merged Balance</span>
                                <span className="font-bold text-navy-900 text-xs">£{mergedBalanceRemaining.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Historical Student / Previous Enrolment */}
                        <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-sm space-y-2.5">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={enrolIsHistorical}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEnrolIsHistorical(checked);
                                if (checked && (!enrolAmountPaidToDate || enrolAmountPaidToDate === "0")) {
                                  setEnrolAmountPaidToDate(enrolDeposit);
                                }
                              }}
                              className="rounded text-navy-900 focus:ring-navy-900"
                            />
                            <span className="text-xs font-bold text-navy-900">
                              Existing / Historical Student (Record Original Enrolment Date &amp; Notes)
                            </span>
                          </label>

                          {enrolIsHistorical && (
                            <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                  Original Enrolment Date *
                                </label>
                                <input
                                  type="date"
                                  required={enrolIsHistorical}
                                  value={enrolHistoricalDate}
                                  onChange={(e) => setEnrolHistoricalDate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                  Payment Reference / Notes
                                </label>
                                <input
                                  type="text"
                                  value={enrolHistoricalNotes}
                                  onChange={(e) => setEnrolHistoricalNotes(e.target.value)}
                                  placeholder="e.g. Paid via BACS in Sept (Receipts #402)"
                                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-navy-900 mb-1">Funding Classification</label>
                            <select
                              value={enrolFundingType}
                              onChange={(e) => setEnrolFundingType(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                            >
                              <option value="self_pay">Self-Pay Student</option>
                              <option value="funded">Government / AEB Funded</option>
                              <option value="sponsored">Workplace / Employer Sponsored</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-navy-900 mb-1">Payment Structure</label>
                            <select
                              value={enrolPlanType}
                              onChange={(e) => {
                                const pt = e.target.value as "full" | "instalments";
                                setEnrolPlanType(pt);
                                if (pt === "full") {
                                  if (enrolIsHistorical) {
                                    setEnrolAmountPaidToDate(enrolPrice);
                                  } else {
                                    setEnrolDeposit(enrolPrice);
                                  }
                                } else {
                                  if (!allowedInstalmentMonths.includes(parseInt(enrolMonths, 10))) {
                                    setEnrolMonths(allowedInstalmentMonths[0].toString());
                                  }
                                }
                              }}
                              className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-semibold"
                            >
                              <option value="instalments">Monthly 0% Instalments</option>
                              <option value="full">Full Upfront Payment</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                              Total Tuition Fee (£) {enrolCourses.length > 1 && `(${enrolCourses.length} Courses)`}
                            </label>
                            <input
                              type="number"
                              value={enrolPrice}
                              onChange={(e) => setEnrolPrice(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono font-bold text-navy-900"
                            />
                          </div>

                          {enrolPlanType === "instalments" && (
                            <div>
                              <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                Instalment Plan
                              </label>
                              <select
                                value={enrolMonths}
                                onChange={(e) => setEnrolMonths(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono font-bold text-navy-900"
                              >
                                {allowedInstalmentMonths.map((m) => {
                                  const totalNum = parseFloat(enrolPrice) || 0;
                                  const paidNum = enrolIsHistorical
                                    ? parseFloat(enrolAmountPaidToDate) || 0
                                    : parseFloat(enrolDeposit) || 0;
                                  const rem = Math.max(0, totalNum - paidNum);
                                  const perMonth = m > 0 ? (rem / m).toFixed(2) : "0.00";
                                  return (
                                    <option key={m} value={m.toString()}>
                                      {m} Months (£{perMonth}/mo)
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                        {enrolIsHistorical
                          ? "Amount Paid to Date (£)"
                          : enrolPlanType === "full"
                            ? "Amount Paid Today (£)"
                            : "Deposit / Amount Paid (£)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={enrolPrice}
                        value={enrolIsHistorical ? enrolAmountPaidToDate : enrolDeposit}
                        onChange={(e) => {
                          if (enrolIsHistorical) {
                            setEnrolAmountPaidToDate(e.target.value);
                          } else {
                            setEnrolDeposit(e.target.value);
                          }
                        }}
                        placeholder="0.00"
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono font-bold text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                        Payment Method *
                      </label>
                      <select
                        value={enrolPaymentMethod}
                        onChange={(e) => {
                          const m = e.target.value as "paid" | "direct_debit" | "website_payment";
                          setEnrolPaymentMethod(m);
                          if (m === "direct_debit") {
                            setEnrolDeposit("0");
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-semibold text-navy-900"
                      >
                        <option value="paid">Paid (Card / Bank Transfer)</option>
                        <option value="direct_debit">Direct Debit</option>
                        <option value="website_payment">Website Payment</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Payment Tracking Breakdown */}
                  {enrolFundingType !== "funded" && (() => {
                    const total = parseFloat(enrolPrice) || 0;
                    const paid = enrolIsHistorical
                      ? parseFloat(enrolAmountPaidToDate) || 0
                      : parseFloat(enrolDeposit) || 0;
                    const bal = Math.max(0, total - paid);
                    const mCount = enrolPlanType === "instalments" ? parseInt(enrolMonths, 10) || 6 : 1;
                    const monthlyAmt = mCount > 1 ? Math.round((bal / mCount) * 100) / 100 : bal;

                    return (
                      <div className="space-y-2">
                        <div className="p-3 rounded-sm bg-white border border-line grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div>
                            <span className="text-[10px] text-ink-soft block">Selected Plan</span>
                            <strong className="text-navy-900 font-bold text-xs">
                              {enrolPlanType === "instalments" ? `${mCount}-Month Plan` : "Full Payment"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-ink-soft block">Amount Paid</span>
                            <strong className="text-emerald-700 font-mono text-xs">
                              £{paid.toFixed(2)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-ink-soft block">Balance Remaining</span>
                            <strong className="text-amber-800 font-mono text-xs">
                              £{bal.toFixed(2)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-ink-soft block">
                              {enrolPlanType === "instalments" ? `Monthly (${mCount}x)` : "Status"}
                            </span>
                            <strong className="text-navy-900 font-mono text-xs">
                              {bal <= 0
                                ? "Settled (£0)"
                                : enrolPlanType === "instalments"
                                  ? `£${monthlyAmt.toFixed(2)}/mo`
                                  : `£${bal.toFixed(2)} Due`}
                            </strong>
                          </div>
                        </div>

                        {enrolPlanType === "instalments" && mCount > 1 && bal > 0 && (
                          <div className="p-3 bg-white rounded-sm border border-line space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-navy-900 text-[11px] uppercase tracking-wider">
                                Projected Instalment Schedule ({mCount} Months)
                              </span>
                              <span className="text-[10px] text-ink-soft">
                                £{monthlyAmt.toFixed(2)}/month across {mCount} months
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                              {Array.from({ length: mCount }).map((_, i) => {
                                const d = new Date();
                                d.setMonth(d.getMonth() + i + 1);
                                return (
                                  <div key={i} className="p-1.5 rounded-xs bg-paper border border-line text-[10px]">
                                    <div className="flex items-center justify-between font-semibold text-navy-900">
                                      <span>Instalment #{i + 1}</span>
                                      <span className="font-mono">£{monthlyAmt.toFixed(2)}</span>
                                    </div>
                                    <div className="text-ink-soft text-[9px] mt-0.5">
                                      Due: {d.toLocaleDateString("en-GB")}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => {
                      setEnrolExistingLearner(null);
                      setIsEnrolModalOpen(false);
                    }}
                    className="px-3.5 py-2 rounded-sm border border-line bg-paper text-ink-soft hover:text-ink font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEnrolling}
                    className="px-4 py-2 rounded-sm bg-navy-900 hover:bg-navy-700 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Icon name="check" size={14} />
                    <span>
                      {isEnrolling
                        ? "Saving Enrolment..."
                        : enrolExistingLearner
                          ? "Add Course & Save Payment Plan"
                          : "Confirm & Send Welcome Email"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Learner & Enrolment Modal */}
      {editingLearner && (() => {
        const learnerEnrs = enrolments.filter((e) => e.learnerId === editingLearner.id);
        const editCourseObj = availableCourses.find((c) => c.id === editCourseId) || availableCourses[0];
        const editCourseLevels = editCourseObj?.levels || [];
        const allowedEditMonths = getInstalmentMonthsForLevel(editLevelLabel);

        return (
          <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md border border-line shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <h3 className="font-heading font-bold text-lg text-navy-900">
                    Edit Learner Record &amp; Payment Plan
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Update student profile details, qualification level, cohort allocation, and instalment tracking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLearner(null)}
                  className="text-ink-soft hover:text-navy-900 text-lg font-bold p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form
                onSubmit={handleSaveEditedLearner}
                className="overflow-y-auto pr-1 space-y-4 text-xs flex-1"
              >
                {/* Personal Details */}
                <div className="space-y-3 p-3.5 bg-paper rounded-sm border border-line">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                    1. Student Personal Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-900 mb-1">Postcode</label>
                      <input
                        type="text"
                        value={editPostcode}
                        onChange={(e) => setEditPostcode(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 mb-1">Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Course & Level Selection */}
                {editEnrolmentId && (
                  <div className="space-y-3 p-3.5 bg-paper rounded-sm border border-line">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                        2. Enrolled Course, Level &amp; Cohort
                      </h4>
                      {learnerEnrs.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-ink-soft">Editing Course:</span>
                          <select
                            value={editEnrolmentId}
                            onChange={(e) => {
                              const target = learnerEnrs.find((x) => x.id === e.target.value);
                              if (target) populateEditEnrolmentFields(editingLearner.id, target);
                            }}
                            className="px-2 py-1 rounded-sm border border-navy-900 bg-white text-navy-900 font-bold text-xs"
                          >
                            {learnerEnrs.map((enrItem, i) => (
                              <option key={enrItem.id} value={enrItem.id}>
                                Course #{i + 1}: {enrItem.courseTitle} ({enrItem.courseLevelLabel})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">Qualification</label>
                        <select
                          value={editCourseId}
                          onChange={(e) => {
                            const cid = e.target.value;
                            setEditCourseId(cid);
                            const c = availableCourses.find((x) => x.id === cid);
                            if (c && c.levels && c.levels.length > 0) {
                              const firstLvl = c.levels[0].level_label;
                              setEditLevelLabel(firstLvl);
                              setEditTotalPrice(c.levels[0].price_gbp.toString());
                              const allowed = getInstalmentMonthsForLevel(firstLvl);
                              if (!allowed.includes(parseInt(editMonths, 10))) {
                                setEditMonths(allowed[0].toString());
                              }
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                        >
                          {availableCourses.map((c) => {
                            const levelSummary = (c.levels || [])
                              .map((l) => `${l.level_label}: £${l.price_gbp}`)
                              .join(", ");
                            return (
                              <option key={c.id} value={c.id}>
                                {c.title} ({c.category}){levelSummary ? ` — [${levelSummary}]` : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">Qualification Level</label>
                        <select
                          value={editLevelLabel}
                          onChange={(e) => {
                            const lvl = e.target.value;
                            setEditLevelLabel(lvl);
                            const found = editCourseLevels.find((l) => l.level_label === lvl);
                            if (found) {
                              setEditTotalPrice(found.price_gbp.toString());
                            }
                            const allowed = getInstalmentMonthsForLevel(lvl);
                            if (!allowed.includes(parseInt(editMonths, 10))) {
                              setEditMonths(allowed[0].toString());
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                        >
                          {editCourseLevels.length > 0 ? (
                            editCourseLevels.map((lvl) => (
                              <option key={lvl.level_label} value={lvl.level_label}>
                                {lvl.level_label} (£{lvl.price_gbp})
                              </option>
                            ))
                          ) : (
                            <option value={editLevelLabel || "Level 3"}>
                              {editLevelLabel || "Level 3"}
                            </option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">Cohort Group</label>
                        <select
                          value={editClassId}
                          onChange={(e) => setEditClassId(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                        >
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.scheduleDescription || c.intakeLabel})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">Assigned Tutor</label>
                        <select
                          value={editTutorName}
                          onChange={(e) => setEditTutorName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                        >
                          <option value="Unassigned / TBA">Unassigned / TBA</option>
                          {realTutors.map((t) => (
                            <option key={t.id} value={t.name}>
                              {t.name} ({t.email})
                            </option>
                          ))}
                          {editTutorName &&
                            editTutorName !== "Unassigned / TBA" &&
                            !isFictionalTutorName(editTutorName) &&
                            !realTutors.some((t) => t.name === editTutorName) && (
                              <option value={editTutorName}>{editTutorName}</option>
                            )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">Session Timing</label>
                        <select
                          value={editTiming}
                          onChange={(e) => setEditTiming(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                        >
                          <option value="evening">Evening Session (18:30 – 20:30)</option>
                          <option value="afternoon">Afternoon Session (14:00 – 16:00)</option>
                          <option value="self_paced">Flexible / 1-on-1 Tutoring</option>
                        </select>
                      </div>

                      {(editCourseId === "course-tutoring-children" ||
                        editClassId === "class-tutoring-kids") && (
                          <div className="sm:col-span-2 p-3 rounded-sm bg-navy-900/5 border border-navy-900/15 space-y-3 mt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-navy-900 uppercase tracking-wider">
                                1-on-1 Tutoring — Child, Parent &amp; Delivery Assignment
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-gold-300 text-navy-900">
                                1-on-1 Tutoring
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                  Child / Pupil Full Name
                                </label>
                                <input
                                  type="text"
                                  value={editChildName}
                                  onChange={(e) => setEditChildName(e.target.value)}
                                  placeholder="e.g. Leo Smith"
                                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                  Parent / Guardian Full Name
                                </label>
                                <input
                                  type="text"
                                  value={editGuardianName}
                                  onChange={(e) => setEditGuardianName(e.target.value)}
                                  placeholder="e.g. Sarah Smith"
                                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                  Weekly Tutoring Day &amp; Time Slot
                                </label>
                                <select
                                  value={editTutoringSlot}
                                  onChange={(e) => setEditTutoringSlot(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                                >
                                  {[
                                    "Thursday, 4:00pm",
                                    "Thursday, 5:00pm",
                                    "Friday, 4:00pm",
                                    "Friday, 5:00pm",
                                    "Saturday, 9:00am",
                                    "Saturday, 10:00am",
                                    "Saturday, 11:00am",
                                    "Saturday, 12:00pm",
                                    "Saturday, 1:00pm",
                                    "Saturday, 2:00pm",
                                    "Saturday, 3:00pm",
                                    "Saturday, 4:00pm",
                                    "Saturday, 5:00pm",
                                  ].map((slot) => (
                                    <option key={slot} value={slot}>
                                      {slot}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                  1-on-1 Delivery Mode
                                </label>
                                <select
                                  value={editTutoringDeliveryMode}
                                  onChange={(e) =>
                                    setEditTutoringDeliveryMode(
                                      e.target.value as
                                      | "online"
                                      | "physical_centre"
                                      | "room_home_request"
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-medium"
                                >
                                  <option value="physical_centre">
                                    Gloucester College Centre (In-Person Room)
                                  </option>
                                  <option value="online">
                                    Live 1-on-1 Online (Zoom Classroom)
                                  </option>
                                  <option value="room_home_request">
                                    Home / Room Tutoring (Requested Location)
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                  {editTutoringDeliveryMode === "physical_centre"
                                    ? "Assigned Centre Room / Bay"
                                    : editTutoringDeliveryMode === "room_home_request"
                                      ? "Requested Home / Room Address"
                                      : "1-on-1 Zoom Classroom Link"}
                                </label>
                                <input
                                  type="text"
                                  value={editTutoringRoomOrAddress}
                                  onChange={(e) => setEditTutoringRoomOrAddress(e.target.value)}
                                  placeholder={
                                    editTutoringDeliveryMode === "physical_centre"
                                      ? "e.g. Tutoring Room 2, Gloucester Centre"
                                      : editTutoringDeliveryMode === "room_home_request"
                                        ? "e.g. 14 Brunswick Square, Gloucester GL1 1UG"
                                        : "e.g. https://zoom.us/j/1to1-classroom"
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                                  Focus Subjects / Learning Notes
                                </label>
                                <input
                                  type="text"
                                  value={editChildConcerns}
                                  onChange={(e) => setEditChildConcerns(e.target.value)}
                                  placeholder="e.g. Maths & English SATs / GCSE Exam Prep"
                                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Payment Plan & Fee Structure (Owner / Super Admin) */}
                {canManagePayments && editEnrolmentId && (
                  <div className="space-y-3 p-3.5 bg-paper rounded-sm border border-line">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                        3. Payment Plan &amp; Amount Paid ({editLevelLabel})
                      </h4>
                      <span className="px-2 py-0.5 rounded-xs bg-navy-900/10 text-navy-900 font-bold text-[10px]">
                        {isLevelFiveOrAbove(editLevelLabel)
                          ? "Level 5+: 6, 10, 12 & 14 Month Plans"
                          : "Level 2–4: 3, 6, 10 & 12 Month Plans"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">Payment Structure</label>
                        <select
                          value={editPlanType}
                          onChange={(e) => {
                            const pt = e.target.value as "full" | "instalments";
                            setEditPlanType(pt);
                            if (pt === "instalments") {
                              const allowed = getInstalmentMonthsForLevel(editLevelLabel);
                              if (!allowed.includes(parseInt(editMonths, 10))) {
                                setEditMonths(allowed[0].toString());
                              }
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-semibold"
                        >
                          <option value="instalments">Monthly 0% Instalments</option>
                          <option value="full">Full Upfront Payment</option>
                        </select>
                      </div>

                      {editPlanType === "instalments" && (
                        <div>
                          <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                            Instalment Plan ({editLevelLabel})
                          </label>
                          <select
                            value={editMonths}
                            onChange={(e) => setEditMonths(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono font-bold text-navy-900"
                          >
                            {allowedEditMonths.map((m) => {
                              const tot = parseFloat(editTotalPrice) || 0;
                              const pd = parseFloat(editAmountPaid) || 0;
                              const rem = Math.max(0, tot - pd);
                              return (
                                <option key={m} value={m.toString()}>
                                  {m} Months (£{(rem / m).toFixed(2)}/mo remaining)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                          Total Course Fee (£)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editTotalPrice}
                          onChange={(e) => setEditTotalPrice(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono font-bold text-navy-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                          Amount Paid So Far (£)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={editTotalPrice}
                          value={editAmountPaid}
                          onChange={(e) => setEditAmountPaid(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono font-bold text-emerald-800"
                        />
                      </div>
                    </div>

                    {(() => {
                      const tot = parseFloat(editTotalPrice) || 0;
                      const pd = parseFloat(editAmountPaid) || 0;
                      const bal = Math.max(0, tot - pd);
                      const mCount = editPlanType === "instalments" ? parseInt(editMonths, 10) || 6 : 1;
                      const monthly = mCount > 1 ? bal / mCount : bal;
                      return (
                        <div className="p-2.5 rounded-sm bg-white border border-line flex items-center justify-between text-xs">
                          <div>
                            <span className="text-ink-soft text-[10px] block">Updated Plan &amp; Balance</span>
                            <strong className="text-navy-900 font-mono">
                              {editPlanType === "instalments" ? `${mCount}-Month Plan` : "Full Payment"} · £{bal.toFixed(2)} Remaining
                            </strong>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono font-bold text-[11px]">
                            {bal <= 0
                              ? "Settled (£0)"
                              : editPlanType === "instalments"
                                ? `£${monthly.toFixed(2)} / month`
                                : `£${bal.toFixed(2)} Due`}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setEditingLearner(null)}
                    className="px-3.5 py-2 rounded-sm border border-line bg-paper text-ink-soft hover:text-ink font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-4 py-2 rounded-sm bg-navy-900 hover:bg-navy-700 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingEdit ? "Saving Changes..." : "Save Learner & Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Quick Record Payment Modal */}
      {paymentModalLearner && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
                  <Icon name="credit-card" size={14} />
                  <span>Record Offline / Bank Payment</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-navy-900 mt-0.5">
                  {paymentModalLearner.firstName} {paymentModalLearner.lastName}
                </h3>
                <p className="text-xs text-ink-soft">
                  {paymentModalEnrolment?.courseTitle || "Accredited Qualification"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalLearner(null)}
                className="text-ink-soft hover:text-navy-900 text-lg leading-none p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {paymentModalPlan && (
              <div className="p-3 bg-paper rounded border border-line grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-ink-soft block">Course Fee</span>
                  <strong className="text-navy-900 font-mono">£{paymentModalPlan.totalAmountGbp}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-ink-soft block">Already Paid</span>
                  <strong className="text-emerald-700 font-mono">£{paymentModalPlan.totalPaidGbp}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-ink-soft block">Outstanding</span>
                  <strong className="text-amber-800 font-mono">£{paymentModalPlan.balanceRemainingGbp}</strong>
                </div>
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Payment Amount (£) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 150.00"
                  className="w-full px-3 py-2 rounded-sm border border-line bg-white font-mono font-bold text-sm text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-sm border border-line bg-white font-medium focus:outline-none focus:ring-1 focus:ring-navy-900"
                  >
                    <option value="bacs">BACS / Bank Transfer</option>
                    <option value="card">Card Terminal / POS</option>
                    <option value="direct_debit">Direct Debit</option>
                    <option value="website_payment">Website Payment</option>
                    <option value="cash">Cash in Person</option>
                    <option value="employer">Employer / Sponsor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Payment Reference / Receipt ID
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. BACS-TRANS-901 or CASH-041"
                  className="w-full px-3 py-1.5 rounded-sm border border-line bg-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Internal Note
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Received over counter by Millie"
                  className="w-full px-3 py-1.5 rounded-sm border border-line bg-white text-xs focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setPaymentModalLearner(null)}
                  className="px-3.5 py-2 rounded-sm border border-line bg-paper text-ink-soft hover:text-ink font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingPayment}
                  className="px-4 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Icon name="check" size={14} />
                  <span>{isLoggingPayment ? "Recording Payment..." : "Confirm & Issue Receipt"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
