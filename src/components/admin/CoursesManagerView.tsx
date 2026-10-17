"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Course, CourseLevel, Unit, FAQ, DeliveryMode } from "@/content/types";
import { formatCurrency } from "@/content/pricing";
import { Icon } from "@/components/ui/Icon";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import {
  updateCoursePricingAction,
  updateCourseDetailsAction,
  createCourseAction,
  deleteCourseAction,
} from "@/app/admin/actions";

interface CoursesManagerViewProps {
  courses: Course[];
  userRole: string;
}

export function CoursesManagerView({
  courses: initialCourses,
  userRole,
}: CoursesManagerViewProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editTab, setEditTab] = useState<
    "general" | "pricing" | "curriculum" | "outcomes" | "specs" | "faqs"
  >("general");
  const [selectedLevelIdx, setSelectedLevelIdx] = useState(0);
  const [editLevels, setEditLevels] = useState<CourseLevel[]>([]);
  const [editLevelLabel, setEditLevelLabel] = useState("");

  // Wix-style Media Library State
  const [mediaLibrary, setMediaLibrary] = useState<{ label: string; url: string }[]>([
    { label: "Healthcare & Adult Care (Default)", url: "/images/adult-care-training.jpg" },
    { label: "Childcare & Early Years", url: "/images/early-years-training.jpg" },
    { label: "Teacher Training & Education", url: "/images/teacher-training.jpg" },
    { label: "Vocational Assessor & Tutoring", url: "/images/tutor-teaching.jpg" },
    { label: "Accredited Certificate / Graduation", url: "/images/certificate-moment.jpg" },
    { label: "Online Distance Learner", url: "/images/hero-learner.jpg" },
  ]);

  // General fields
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Health & Social Care");
  const [editAwardingBody, setEditAwardingBody] = useState("");
  const [editAwardingRef, setEditAwardingRef] = useState("");
  const [editDelivery, setEditDelivery] = useState<DeliveryMode>("live_online");
  const [editCustomDeliveryText, setEditCustomDeliveryText] = useState("");
  const [editImage, setEditImage] = useState("/images/adult-care-training.jpg");
  const [editIntroVideoUrl, setEditIntroVideoUrl] = useState("");
  const [editIntroVideoPoster, setEditIntroVideoPoster] = useState("");
  const [editTrainingLocations, setEditTrainingLocations] = useState<string[]>([]);
  const [editAttendanceType, setEditAttendanceType] = useState<"online_only" | "blended_practical">("online_only");

  // Career Opportunities & Progression
  const [editJobProspects, setEditJobProspects] = useState<string[]>([]);
  const [editProgression, setEditProgression] = useState<string[]>([]);

  // Workplace Assessment Guide & Inclusions
  const [editWorkplaceEvidenceText, setEditWorkplaceEvidenceText] = useState("");
  const [editObservationMethodsText, setEditObservationMethodsText] = useState("");
  const [editTuitionIncludes, setEditTuitionIncludes] = useState<string[]>([]);
  const [editFreeTextbook, setEditFreeTextbook] = useState(true);

  // Header Spec Bar Customizations
  const [editIntakeText, setEditIntakeText] = useState("");
  const [editAssessmentModelText, setEditAssessmentModelText] = useState("");
  const [editSupportModelText, setEditSupportModelText] = useState("");

  // Active Level fields & Curriculum
  const [expandedUnitIdx, setExpandedUnitIdx] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editRegularPrice, setEditRegularPrice] = useState("");
  const [editDiscountPercent, setEditDiscountPercent] = useState("10");
  const [editDeposit, setEditDeposit] = useState("");
  const [editDuration, setEditDuration] = useState("4 – 6 months");
  const [editGlh, setEditGlh] = useState("320");
  const [editUnits, setEditUnits] = useState<Unit[]>([]);
  const [editRequirements, setEditRequirements] = useState<string[]>([]);
  const [editFaqs, setEditFaqs] = useState<FAQ[]>([]);

  const handleImageUpload = (url: string, fileName?: string) => {
    setEditImage(url);
    const label = fileName
      ? `Uploaded: ${fileName}`
      : `Custom Image (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;
    setMediaLibrary((prev) => {
      if (prev.some((m) => m.url === url)) return prev;
      return [{ label, url }, ...prev];
    });
  };

  // Add Course Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Health & Social Care");
  const [newAwardingBody, setNewAwardingBody] = useState("TQUK & NCFE");
  const [newAwardingRef, setNewAwardingRef] = useState("");
  const [newDelivery, setNewDelivery] = useState<DeliveryMode>("live_online");
  const [newCustomDeliveryText, setNewCustomDeliveryText] = useState("");
  const [newIntroVideoUrl, setNewIntroVideoUrl] = useState("");
  const [newLevelLabel, setNewLevelLabel] = useState("Level 3");
  const [newPrice, setNewPrice] = useState("1250");
  const [newRegularPrice, setNewRegularPrice] = useState("1650");
  const [newDiscountPercent, setNewDiscountPercent] = useState("10");
  const [newDeposit, setNewDeposit] = useState("150");
  const [newDuration, setNewDuration] = useState("4 – 6 months");
  const [newGlh, setNewGlh] = useState("320");
  const [newSummary, setNewSummary] = useState("");
  const [newImage, setNewImage] = useState("/images/adult-care-training.jpg");

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [modalError, setModalError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const isOwner = userRole === "owner_admin" || userRole === "super_admin";

  const categories = [
    "all",
    ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.awarding_body &&
        c.awarding_body.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setSelectedLevelIdx(0);
    setEditTitle(course.title);
    setEditSummary(course.summary);
    setEditDescription(course.description || course.summary);
    setEditCategory(course.category);
    setEditAwardingBody(course.awarding_body || "");
    setEditAwardingRef(course.awarding_reference || "");
    setEditDelivery(course.delivery || "live_online");
    setEditIntroVideoUrl(course.intro_video_url || "");
    setEditIntroVideoPoster(course.intro_video_poster || "");
    setEditImage(course.image || "/images/adult-care-training.jpg");
    setEditTrainingLocations(course.training_locations ? [...course.training_locations] : []);
    setEditAttendanceType(
      course.attendance_type ||
        (course.training_locations && course.training_locations.length > 0
          ? "blended_practical"
          : "online_only")
    );
    setEditFaqs(course.faqs ? course.faqs.map((f) => ({ ...f })) : []);

    const loadedLevels: CourseLevel[] =
      course.levels && course.levels.length > 0
        ? course.levels.map((l) => ({
            ...l,
            units: l.units ? l.units.map((u) => ({ ...u })) : [],
            entry_requirements: l.entry_requirements ? [...l.entry_requirements] : [],
            plans: l.plans ? l.plans.map((p) => ({ ...p })) : [],
          }))
        : [
            {
              course_id: course.id,
              level_label: "Level 1",
              price_gbp: 450,
              full_pay_discount_percent: 10,
              duration_text: "4 – 6 months",
              guided_learning_hours: 150,
              entry_requirements: ["Open to all"],
              units: [],
              plans: [],
            },
          ];

    setEditLevels(loadedLevels);

    const lvl = loadedLevels[0];
    setEditLevelLabel(lvl?.level_label || "Level 1");
    setEditPrice(lvl ? lvl.price_gbp.toString() : "0");
    setEditRegularPrice(lvl?.regular_price_gbp ? lvl.regular_price_gbp.toString() : "");
    setEditDiscountPercent(
      lvl?.full_pay_discount_percent !== null && lvl?.full_pay_discount_percent !== undefined
        ? lvl.full_pay_discount_percent.toString()
        : "10"
    );
    setEditDuration(lvl ? lvl.duration_text : "4 – 6 months");
    setEditGlh(lvl ? lvl.guided_learning_hours.toString() : "320");
    setEditUnits(lvl?.units ? lvl.units.map((u) => ({ ...u })) : []);
    setEditRequirements(lvl?.entry_requirements ? [...lvl.entry_requirements] : []);
    const dep = lvl?.plans?.[0]?.deposit_value;
    setEditDeposit(dep !== undefined ? dep.toString() : "150");

    // Course Detail Page Specs & Outcomes
    setEditJobProspects(course.job_prospects ? [...course.job_prospects] : []);
    setEditProgression(course.progression ? [...course.progression] : []);
    setEditWorkplaceEvidenceText(course.workplace_evidence_text || "");
    setEditObservationMethodsText(course.observation_methods_text || "");
    setEditTuitionIncludes(
      course.tuition_includes && course.tuition_includes.length > 0
        ? [...course.tuition_includes]
        : [
            "Weekly live online evening lectures delivered via Zoom with qualified assessors",
            "24/7 access to the Smartminds Learner Portal and recorded lecture streams",
            "Dedicated named tutor providing individual written feedback within 5 working days",
            "Official awarding organisation registration fees and Ofqual certificate issuance",
            "One-to-one academic mentoring, assignment planning, and study skills guidance",
          ]
    );
    setEditFreeTextbook(course.free_textbook !== undefined ? course.free_textbook : true);
    setEditIntakeText(course.intake_text || "Rolling Admissions");
    setEditAssessmentModelText(course.assessment_model_text || "100% Portfolio Based");
    setEditSupportModelText(course.support_model_text || "Named British Assessor");
    setExpandedUnitIdx(null);

    if (course.image) {
      setMediaLibrary((prev) => {
        if (prev.some((m) => m.url === course.image)) return prev;
        return [{ label: `Course Photo: ${course.title.slice(0, 24)}`, url: course.image }, ...prev];
      });
    }

    setEditTab("general");
    setModalError("");
    setIsEditModalOpen(true);
  };

  const syncCurrentLevel = (levelsArr: CourseLevel[], idx: number): CourseLevel[] => {
    if (!levelsArr[idx]) return levelsArr;
    const parsedPrice = parseFloat(editPrice) || levelsArr[idx].price_gbp;
    const parsedRegular = parseFloat(editRegularPrice);
    const regular_price_gbp = !isNaN(parsedRegular) && parsedRegular > 0 ? parsedRegular : null;
    const parsedDeposit = parseFloat(editDeposit);
    const parsedDiscount = parseFloat(editDiscountPercent);
    const parsedGlh = parseInt(editGlh, 10) || levelsArr[idx].guided_learning_hours;

    return levelsArr.map((lvl, i) => {
      if (i !== idx) return lvl;
      return {
        ...lvl,
        level_label: editLevelLabel.trim() || lvl.level_label || `Level ${i + 1}`,
        price_gbp: parsedPrice,
        regular_price_gbp,
        full_pay_discount_percent: isNaN(parsedDiscount) ? null : Math.max(0, Math.min(100, parsedDiscount)),
        duration_text: editDuration,
        guided_learning_hours: parsedGlh,
        units: editUnits,
        entry_requirements: editRequirements,
        plans:
          lvl.plans && lvl.plans.length > 0
            ? lvl.plans.map((p, pIdx) =>
                pIdx === 0 && !isNaN(parsedDeposit)
                  ? { ...p, deposit_value: parsedDeposit }
                  : p
              )
            : [
                {
                  id: "plan-6m",
                  name: "6 Monthly Instalments",
                  months: 6,
                  deposit_type: "fixed" as const,
                  deposit_value: isNaN(parsedDeposit) ? 150 : parsedDeposit,
                  grace_days: 7,
                  after_grace: "pause_access" as const,
                },
              ],
      };
    });
  };

  const handleLevelChange = (idx: number) => {
    if (idx === selectedLevelIdx) return;
    const updated = syncCurrentLevel(editLevels, selectedLevelIdx);
    setEditLevels(updated);
    setSelectedLevelIdx(idx);

    const lvl = updated[idx];
    if (lvl) {
      setEditLevelLabel(lvl.level_label);
      setEditPrice(lvl.price_gbp.toString());
      setEditRegularPrice(lvl.regular_price_gbp ? lvl.regular_price_gbp.toString() : "");
      setEditDiscountPercent(
        lvl.full_pay_discount_percent !== null && lvl.full_pay_discount_percent !== undefined
          ? lvl.full_pay_discount_percent.toString()
          : "10"
      );
      setEditDuration(lvl.duration_text);
      setEditGlh(lvl.guided_learning_hours.toString());
      setEditUnits(lvl.units ? lvl.units.map((u) => ({ ...u })) : []);
      setEditRequirements(lvl.entry_requirements ? [...lvl.entry_requirements] : []);
      const dep = lvl.plans?.[0]?.deposit_value;
      setEditDeposit(dep !== undefined ? dep.toString() : "150");
    }
  };

  const handleAddLevel = () => {
    if (!selectedCourse) return;
    const updated = syncCurrentLevel(editLevels, selectedLevelIdx);
    const nextNum = updated.length + 1;
    const newLvlLabel = `Level ${nextNum}`;
    const newLvl: CourseLevel = {
      course_id: selectedCourse.id,
      level_label: newLvlLabel,
      price_gbp: 495,
      regular_price_gbp: 695,
      full_pay_discount_percent: 10,
      duration_text: "4 – 6 months",
      guided_learning_hours: 180,
      entry_requirements: [
        "Minimum 16 years of age",
        "Access to a computer or laptop with internet connection",
      ],
      units: [
        { code: `MOD-${nextNum.toString().padStart(2, "0")}`, title: "Core Principles and Practical Applications" },
      ],
      plans: [
        {
          id: `plan-${Date.now().toString().slice(-4)}`,
          name: "6 Monthly Instalments",
          months: 6,
          deposit_type: "fixed",
          deposit_value: 150,
          grace_days: 7,
          after_grace: "pause_access",
        },
      ],
    };

    const newLevelsList = [...updated, newLvl];
    setEditLevels(newLevelsList);
    const newIdx = newLevelsList.length - 1;
    setSelectedLevelIdx(newIdx);

    setEditLevelLabel(newLvl.level_label);
    setEditPrice(newLvl.price_gbp.toString());
    setEditRegularPrice(newLvl.regular_price_gbp ? newLvl.regular_price_gbp.toString() : "");
    setEditDiscountPercent("10");
    setEditDuration(newLvl.duration_text);
    setEditGlh(newLvl.guided_learning_hours.toString());
    setEditUnits([...newLvl.units]);
    setEditRequirements([...newLvl.entry_requirements]);
    setEditDeposit("150");
    setToastMessage(`Added qualification level "${newLvlLabel}". You can now customize its details.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRemoveLevel = (idxToRemove: number) => {
    if (editLevels.length <= 1) {
      setModalError("A course must have at least one qualification level. You cannot remove the only remaining level.");
      return;
    }

    const targetLabel = editLevels[idxToRemove]?.level_label || `Level ${idxToRemove + 1}`;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete qualification level "${targetLabel}" from this course?`
    );
    if (!confirmDelete) return;

    const currentSynced = syncCurrentLevel(editLevels, selectedLevelIdx);
    const filtered = currentSynced.filter((_, i) => i !== idxToRemove);
    setEditLevels(filtered);

    let newIdx = selectedLevelIdx;
    if (idxToRemove === selectedLevelIdx) {
      newIdx = Math.max(0, idxToRemove - 1);
    } else if (selectedLevelIdx > idxToRemove) {
      newIdx = selectedLevelIdx - 1;
    }
    if (newIdx >= filtered.length) {
      newIdx = filtered.length - 1;
    }

    setSelectedLevelIdx(newIdx);
    const activeLvl = filtered[newIdx];
    if (activeLvl) {
      setEditLevelLabel(activeLvl.level_label);
      setEditPrice(activeLvl.price_gbp.toString());
      setEditRegularPrice(activeLvl.regular_price_gbp ? activeLvl.regular_price_gbp.toString() : "");
      setEditDiscountPercent(
        activeLvl.full_pay_discount_percent !== null && activeLvl.full_pay_discount_percent !== undefined
          ? activeLvl.full_pay_discount_percent.toString()
          : "10"
      );
      setEditDuration(activeLvl.duration_text);
      setEditGlh(activeLvl.guided_learning_hours.toString());
      setEditUnits(activeLvl.units ? activeLvl.units.map((u) => ({ ...u })) : []);
      setEditRequirements(activeLvl.entry_requirements ? [...activeLvl.entry_requirements] : []);
      const dep = activeLvl.plans?.[0]?.deposit_value;
      setEditDeposit(dep !== undefined ? dep.toString() : "150");
    }

    setToastMessage(`Removed qualification level "${targetLabel}".`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveCourse = () => {
    if (!selectedCourse) return;
    setModalError("");

    if (!editTitle.trim()) {
      setModalError("Please enter a valid course title.");
      return;
    }

    const finalLevels = syncCurrentLevel(editLevels, selectedLevelIdx);

    if (finalLevels.length === 0) {
      setModalError("The course must have at least one qualification level.");
      return;
    }

    for (const lvl of finalLevels) {
      if (!lvl.level_label.trim()) {
        setModalError("All qualification levels must have a valid title/label.");
        return;
      }
      if (isNaN(lvl.price_gbp) || lvl.price_gbp <= 0) {
        setModalError(`Please provide a valid tuition price for level "${lvl.level_label}".`);
        return;
      }
    }

    startTransition(async () => {
      try {
        const result = await updateCourseDetailsAction(selectedCourse.id, {
          title: editTitle.trim(),
          summary: editSummary.trim(),
          description: editDescription.trim() || editSummary.trim(),
          category: editCategory,
          awarding_body: editAwardingBody.trim() || null,
          awarding_reference: editAwardingRef.trim() || null,
          delivery: editDelivery,
          custom_delivery_text: editCustomDeliveryText.trim() || undefined,
          intro_video_url: editIntroVideoUrl.trim() || null,
          intro_video_poster: editIntroVideoPoster.trim() || null,
          training_locations:
            editAttendanceType === "blended_practical" ? editTrainingLocations : undefined,
          attendance_type: editAttendanceType,
          image: editImage.trim() || "/images/adult-care-training.jpg",
          levels: finalLevels,
          faqs: editFaqs,
          job_prospects: editJobProspects.filter(Boolean),
          progression: editProgression.filter(Boolean),
          workplace_evidence_text: editWorkplaceEvidenceText.trim() || undefined,
          observation_methods_text: editObservationMethodsText.trim() || undefined,
          tuition_includes: editTuitionIncludes.filter(Boolean),
          free_textbook: editFreeTextbook,
          intake_text: editIntakeText.trim() || undefined,
          assessment_model_text: editAssessmentModelText.trim() || undefined,
          support_model_text: editSupportModelText.trim() || undefined,
        });

        if (result.success && result.course) {
          setCourses((prev) =>
            prev.map((c) => (c.id === result.course.id ? result.course : c))
          );
          setIsEditModalOpen(false);
          setToastMessage(
            `Qualification details for "${result.course.title}" updated successfully.`
          );
          setTimeout(() => setToastMessage(null), 5000);
        }
      } catch (err: unknown) {
        setModalError(
          err instanceof Error ? err.message : "Failed to update course details."
        );
      }
    });
  };

  const handleAddCourse = () => {
    setModalError("");
    if (!newTitle.trim()) {
      setModalError("Please enter a qualification title.");
      return;
    }
    if (!newSummary.trim()) {
      setModalError("Please enter a short summary of the syllabus.");
      return;
    }

    const price = parseFloat(newPrice);
    const regular = parseFloat(newRegularPrice);
    const parsedRegular = !isNaN(regular) && regular > 0 ? regular : null;
    const deposit = parseFloat(newDeposit);
    const discount = parseFloat(newDiscountPercent);
    const glh = parseInt(newGlh, 10);

    if (isNaN(price) || price <= 0) {
      setModalError("Please enter a valid upfront price in GBP.");
      return;
    }

    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newCourseObj: Course = {
      id: `course-${Date.now().toString().slice(-4)}`,
      slug,
      title: newTitle.trim(),
      summary: newSummary.trim(),
      description: newSummary.trim(),
      category: newCategory,
      type: "regulated",
      delivery: newDelivery,
      custom_delivery_text: newCustomDeliveryText.trim() || undefined,
      start_mode: "rolling",
      start_dates: ["Every Monday", "First of each month"],
      awarding_body: newAwardingBody.trim() || null,
      awarding_reference: newAwardingRef.trim() || null,
      assessment_method: "criteria",
      funding: "both",
      funding_notes: "Eligible learners can access 0% interest monthly instalment plans.",
      intro_video_url: newIntroVideoUrl.trim() || null,
      free_textbook: true,
      faqs: [],
      job_prospects: ["Practitioner", "Senior Carer", "Team Leader"],
      progression: ["Higher National Diploma", "University Degree"],
      workplace_evidence_text:
        "You will build a professional portfolio using real workplace evidence gathered during your employment or voluntary care placement, including care plan reviews, risk assessments, and reflective accounts.",
      observation_methods_text:
        "Workplace observations can be conducted remotely via recorded video session or in-person with a registered Expert Witness (such as your registered manager or clinical lead).",
      tuition_includes: [
        "Weekly live online evening lectures delivered via Zoom with qualified assessors",
        "24/7 access to the Smartminds Learner Portal and recorded lecture streams",
        "Dedicated named tutor providing individual written feedback within 5 working days",
        "Official awarding organisation registration fees and Ofqual certificate issuance",
        "One-to-one academic mentoring, assignment planning, and study skills guidance",
      ],
      intake_text: "Rolling Admissions",
      assessment_model_text: "100% Portfolio Based",
      support_model_text: "Named British Assessor",
      image: newImage.trim() || "/images/adult-care-training.jpg",
      imageAlt: `${newTitle} training at Smartminds College`,
      seo_title: `${newTitle} | Smartminds Training College`,
      seo_description: newSummary.trim(),
      published: true,
      levels: [
        {
          course_id: `course-${Date.now().toString().slice(-4)}`,
          level_label: newLevelLabel,
          price_gbp: price,
          regular_price_gbp: parsedRegular,
          full_pay_discount_percent: isNaN(discount) ? 10 : Math.max(0, Math.min(100, discount)),
          duration_text: newDuration,
          guided_learning_hours: isNaN(glh) ? 300 : glh,
          entry_requirements: [
            "Minimum 16 years of age",
            "Proficiency in spoken and written English",
          ],
          units: [
            {
              code: "UNIT-01",
              title: "Core Principles and Professional Practice",
              credits: 4,
            },
          ],
          plans: [
            {
              id: `plan-${Date.now()}`,
              name: "Spread over 12 Months (0% Interest)",
              months: 12,
              deposit_type: "fixed",
              deposit_value: isNaN(deposit) ? 150 : deposit,
              grace_days: 7,
              after_grace: "pause_access",
            },
          ],
        },
      ],
    };

    startTransition(async () => {
      try {
        const result = await createCourseAction(newCourseObj);
        if (result.success && result.course) {
          setCourses((prev) => [result.course, ...prev]);
          setIsAddModalOpen(false);
          setNewTitle("");
          setNewSummary("");
          setNewRegularPrice("1650");
          setToastMessage(`Course "${newCourseObj.title}" added to catalogue.`);
          setTimeout(() => setToastMessage(null), 5000);
        }
      } catch (err: unknown) {
        setModalError(
          err instanceof Error ? err.message : "Failed to add course."
        );
      }
    });
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to remove "${courseTitle}" from the active college curriculum?`
      )
    ) {
      return;
    }

    setDeletingId(courseId);
    startTransition(async () => {
      try {
        const result = await deleteCourseAction(courseId);
        if (result.success) {
          setCourses((prev) => prev.filter((c) => c.id !== courseId));
          setToastMessage(`"${courseTitle}" removed from catalogue.`);
          setTimeout(() => setToastMessage(null), 5000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to remove course.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Title Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-xs font-semibold">
            <Icon name="book-open" size={14} />
            <span>Curriculum & Fee Schedule</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Regulated Courses & Curriculum Management
          </h1>
          <p className="text-sm text-ink-soft">
            Add new accredited qualifications, adjust tuition fees and instalment deposits, or remove discontinued courses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isOwner && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-sm bg-navy-900 text-white text-sm font-bold hover:bg-navy-700 transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Icon name="plus" size={16} />
              <span>Add New Qualification</span>
            </button>
          )}
          <Link
            href="/courses"
            target="_blank"
            className="px-4 py-2.5 rounded-sm border border-line bg-paper text-navy-900 text-sm font-semibold hover:bg-white hover:border-navy-700 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <Icon name="external-link" size={16} />
            <span>Public Prospectus</span>
          </Link>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon name="check" size={16} className="text-emerald-700" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold text-emerald-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
            Accredited Courses
          </span>
          <span className="font-heading text-3xl font-bold text-navy-900 block">
            {courses.length}
          </span>
          <span className="text-xs text-ink-soft">Active in College Prospectus</span>
        </div>

        <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
            Awarding Bodies
          </span>
          <span className="font-heading text-3xl font-bold text-navy-900 block">
            NCFE & TQUK
          </span>
          <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
            <Icon name="shield-check" size={12} />
            <span>Ofqual Registered</span>
          </span>
        </div>

        <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
            Delivery Mode
          </span>
          <span className="font-heading text-3xl font-bold text-navy-900 block">
            Live Online
          </span>
          <span className="text-xs text-ink-soft">Interactive Zoom + Portfolios</span>
        </div>

        <div className="p-5 rounded-md bg-white border border-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
            Instalments Config
          </span>
          <span className="font-heading text-3xl font-bold text-emerald-700 block">
            0% Interest
          </span>
          <span className="text-xs text-ink-soft">3, 6, 10 & 12 Month Plans</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-md border border-line flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search qualification title or awarding body..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
          />
          <Icon
            name="search"
            size={16}
            className="absolute left-3 top-2.5 text-ink-soft"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-navy-900 text-white"
                  : "bg-paper text-ink-soft hover:text-navy-900 border border-line"
              }`}
            >
              {cat === "all" ? "All Faculties" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-md border border-line overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-navy-900 border-b border-line font-semibold">
              <tr>
                <th className="py-3 px-4">Qualification Title</th>
                <th className="py-3 px-4">Faculty & Awarding Body</th>
                <th className="py-3 px-4">Level & Pricing Schedule</th>
                <th className="py-3 px-4">Delivery Mode</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Director Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-soft">
                    No courses found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-paper/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-navy-900 max-w-xs">
                      <div>{c.title}</div>
                      <span className="text-xs font-mono text-ink-soft font-normal">
                        slug: /{c.slug}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="block text-xs font-semibold text-navy-900">
                        {c.category}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {c.awarding_body || "Smartminds Accredited"}
                        {c.awarding_reference ? ` (${c.awarding_reference})` : ""}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {c.levels.map((lvl, idx) => {
                          const discount = lvl.full_pay_discount_percent ?? 10;
                          return (
                            <div
                              key={idx}
                              className="text-xs flex items-center gap-2 flex-wrap"
                            >
                              <span className="px-1.5 py-0.5 rounded-sm bg-paper border border-line font-semibold text-navy-900">
                                {lvl.level_label}
                              </span>
                              <span className="font-bold text-navy-900">
                                {formatCurrency(lvl.price_gbp)}
                              </span>
                              {lvl.regular_price_gbp && lvl.regular_price_gbp > lvl.price_gbp && (
                                <span className="line-through text-ink-soft text-[11px]" title="Regular / slashed price">
                                  {formatCurrency(lvl.regular_price_gbp)}
                                </span>
                              )}
                              {discount > 0 && (
                                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.5 rounded-sm border border-emerald-100">
                                  -{discount}% upfront
                                </span>
                              )}
                              {lvl.plans?.[0] && (
                                <span className="text-ink-soft">
                                  (£{lvl.plans[0].deposit_value} dep + {lvl.plans[0].months}mo)
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-800 text-xs font-semibold">
                        {c.custom_delivery_text ||
                          (c.delivery === "live_online"
                            ? "Live Online (Zoom)"
                            : "Blended Learning")}
                      </span>
                      {c.custom_delivery_text && (
                        <span className="block text-[10px] text-ink-soft">
                          Custom: {c.custom_delivery_text}
                        </span>
                      )}
                      {c.training_locations && c.training_locations.length > 0 && (
                        <span className="block text-[10px] font-semibold text-emerald-700 mt-0.5">
                          📍 {c.training_locations.length} Practical Venues
                        </span>
                      )}
                      <span className="block text-xs text-ink-soft mt-0.5">
                        {c.start_mode === "rolling"
                          ? "Rolling Intake"
                          : "Fixed Cohorts"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-emerald-50 text-emerald-700">
                        Enrolling Now
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isOwner && (
                          <>
                            <button
                              onClick={() => openEditModal(c)}
                              className="px-2.5 py-1 text-xs font-semibold text-navy-900 bg-paper hover:bg-gold-300 rounded-sm border border-line transition-colors flex items-center gap-1.5"
                            >
                              <Icon name="file-text" size={13} />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id, c.title)}
                              disabled={deletingId === c.id}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-sm border border-rose-200 transition-colors"
                            >
                              {deletingId === c.id ? "Removing..." : "Remove"}
                            </button>
                          </>
                        )}
                        <Link
                          href={`/courses/${c.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 text-xs font-semibold text-ink-soft hover:text-navy-900 hover:bg-paper rounded-sm border border-transparent hover:border-line transition-colors"
                        >
                          View ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Course Details Editor Modal */}
      {isEditModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-2xl max-w-3xl w-full p-6 space-y-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-line pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center">
                  <Icon name="graduation-cap" size={16} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-navy-900">
                    Edit Qualification & Curriculum Details
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Changes save to the college database and update public course pages immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-ink-soft hover:text-navy-900 p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs shrink-0">
                {modalError}
              </div>
            )}

            {/* Sub-Tabs Navigation */}
            <div className="flex items-center gap-1 border-b border-line pb-2 shrink-0 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEditTab("general")}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  editTab === "general"
                    ? "bg-navy-900 text-white"
                    : "text-ink-soft hover:bg-paper hover:text-navy-900"
                }`}
              >
                <Icon name="file-text" size={14} />
                <span>Overview & Metadata</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab("pricing")}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  editTab === "pricing"
                    ? "bg-navy-900 text-white"
                    : "text-ink-soft hover:bg-paper hover:text-navy-900"
                }`}
              >
                <Icon name="credit-card" size={14} />
                <span>Levels, Tuition & Plans</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab("curriculum")}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  editTab === "curriculum"
                    ? "bg-navy-900 text-white"
                    : "text-ink-soft hover:bg-paper hover:text-navy-900"
                }`}
              >
                <Icon name="book-open" size={14} />
                <span>Units & Curriculum ({editUnits.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab("outcomes")}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  editTab === "outcomes"
                    ? "bg-navy-900 text-white"
                    : "text-ink-soft hover:bg-paper hover:text-navy-900"
                }`}
              >
                <Icon name="user" size={14} />
                <span>Careers & Outcomes ({editJobProspects.length + editProgression.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab("specs")}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  editTab === "specs"
                    ? "bg-navy-900 text-white"
                    : "text-ink-soft hover:bg-paper hover:text-navy-900"
                }`}
              >
                <Icon name="shield-check" size={14} />
                <span>Assessment & Inclusions</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab("faqs")}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  editTab === "faqs"
                    ? "bg-navy-900 text-white"
                    : "text-ink-soft hover:bg-paper hover:text-navy-900"
                }`}
              >
                <Icon name="info" size={14} />
                <span>Requirements & FAQs ({editFaqs.length})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="overflow-y-auto pr-1 space-y-4 text-xs flex-1">
              {/* TAB 1: GENERAL & OVERVIEW */}
              {editTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Qualification Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900 bg-paper focus:bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Category / Faculty
                      </label>
                      <input
                        type="text"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Awarding Organisation
                      </label>
                      <input
                        type="text"
                        value={editAwardingBody}
                        onChange={(e) => setEditAwardingBody(e.target.value)}
                        placeholder="e.g. TQUK & NCFE"
                        className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Ofqual Qualification Number (QN)
                      </label>
                      <input
                        type="text"
                        value={editAwardingRef}
                        onChange={(e) => setEditAwardingRef(e.target.value)}
                        placeholder="e.g. 603/0382/3"
                        className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* UNIFIED DELIVERY FORMAT & PRACTICAL ATTENDANCE */}
                  <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider">
                        Delivery Mode & Practical Attendance
                      </label>
                      <span className="text-[10px] text-ink-soft">
                        Configures student timetable and campus venue selection
                      </span>
                    </div>

                    {/* Segmented 3-Pill Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditDelivery("live_online");
                          setEditAttendanceType("online_only");
                        }}
                        className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer ${
                          editDelivery === "live_online" && editAttendanceType === "online_only"
                            ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                            : "bg-white text-ink-soft border-line hover:border-navy-900"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                          <Icon
                            name="video"
                            size={13}
                            className={
                              editDelivery === "live_online" && editAttendanceType === "online_only"
                                ? "text-gold-300"
                                : "text-navy-900"
                            }
                          />
                          <span>Live Online</span>
                        </div>
                        <span className="text-[10px] opacity-80 block leading-tight">
                          100% distance via weekly Zoom seminars
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditDelivery("blended");
                          setEditAttendanceType("blended_practical");
                          if (editTrainingLocations.length === 0) {
                            setEditTrainingLocations([
                              "London Stratford",
                              "Birmingham Central",
                            ]);
                          }
                        }}
                        className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer ${
                          editAttendanceType === "blended_practical"
                            ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                            : "bg-white text-ink-soft border-line hover:border-emerald-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                          <Icon
                            name="map-pin"
                            size={13}
                            className={
                              editAttendanceType === "blended_practical"
                                ? "text-gold-300"
                                : "text-emerald-700"
                            }
                          />
                          <span>Blended Practical</span>
                        </div>
                        <span className="text-[10px] opacity-80 block leading-tight">
                          Online theory + physical campus practicals
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditDelivery("self_paced");
                          setEditAttendanceType("online_only");
                        }}
                        className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer ${
                          editDelivery === "self_paced"
                            ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                            : "bg-white text-ink-soft border-line hover:border-navy-900"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                          <Icon
                            name="clock"
                            size={13}
                            className={
                              editDelivery === "self_paced"
                                ? "text-gold-300"
                                : "text-navy-900"
                            }
                          />
                          <span>Distance / Self-Paced</span>
                        </div>
                        <span className="text-[10px] opacity-80 block leading-tight">
                          Flexible self-study with 1-to-1 assessor
                        </span>
                      </button>
                    </div>

                    {/* Custom Delivery Schedule Input */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                        Custom Schedule Label / Times (Optional override)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tuesday & Thursday 6:30pm – 8:30pm (Replays Included)"
                        value={editCustomDeliveryText}
                        onChange={(e) => setEditCustomDeliveryText(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                      />
                    </div>

                    {/* Embedded UK Campus Venues (Only when Blended Practical) */}
                    {editAttendanceType === "blended_practical" && (
                      <div className="pt-2.5 border-t border-line space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950">
                            Select Practical Training & Assessment Venues:
                          </span>
                          <span className="text-[10px] text-emerald-800 font-semibold font-mono">
                            {editTrainingLocations.length} locations selected
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            "London Stratford",
                            "Birmingham Central",
                            "Manchester Piccadilly",
                            "Leeds City Centre",
                            "Bristol Harbourside",
                            "Milton Keynes",
                            "Southampton",
                            "Portsmouth",
                          ].map((loc) => {
                            const isChecked = editTrainingLocations.includes(loc);
                            return (
                              <label
                                key={loc}
                                className={`flex items-center gap-2 p-2 rounded-sm border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? "bg-emerald-50 border-emerald-400 font-bold text-emerald-900"
                                    : "bg-white border-line text-ink-soft hover:border-navy-900"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setEditTrainingLocations(
                                        editTrainingLocations.filter((l) => l !== loc)
                                      );
                                    } else {
                                      setEditTrainingLocations([...editTrainingLocations, loc]);
                                    }
                                  }}
                                  className="accent-emerald-600"
                                />
                                <span>{loc}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Featured Course Cover Photo with Dynamic Media Library */}
                  <div className="p-3 bg-paper rounded-sm border border-line space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-0.5">
                        Course Cover Photo
                      </label>
                      <p className="text-[10px] text-ink-soft">
                        Upload a bespoke photograph from your device or select from the accredited college media library.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                      <div>
                        <ImageDropzone
                          value={editImage}
                          onChange={handleImageUpload}
                          label="Drag & Drop Course Photo"
                          helperText="JPG, PNG, WebP (auto-optimized)"
                          previewHeight={90}
                          showUrlInput={false}
                        />
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-0.5">
                            Select from College Media Library
                          </label>
                          <select
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900 font-medium"
                          >
                            {mediaLibrary.map((item, idx) => (
                              <option key={idx} value={item.url}>
                                {item.label}
                              </option>
                            ))}
                            {!mediaLibrary.some((m) => m.url === editImage) && (
                              <option value={editImage}>
                                Custom Photo ({editImage.startsWith("data:") ? "Uploaded image" : editImage.slice(0, 24)}...)
                              </option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-0.5">
                            Or Enter Photo URL / Path
                          </label>
                          <input
                            type="text"
                            placeholder="/images/adult-care-training.jpg"
                            value={editImage}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditImage(val);
                              if (val.trim()) {
                                setMediaLibrary((prev) => {
                                  if (prev.some((m) => m.url === val)) return prev;
                                  return [{ label: `Custom URL: ${val.slice(0, 24)}`, url: val }, ...prev];
                                });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 font-mono bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Intro / Preview Video URL */}
                  <div className="p-3 bg-paper rounded-sm border border-line space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider">
                        Course Intro / Preview Video URL (YouTube, Vimeo, or MP4)
                      </label>
                      {editIntroVideoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditIntroVideoUrl("")}
                          className="text-[10px] text-rose-700 hover:underline font-bold"
                        >
                          Clear Video
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or /videos/intro.mp4"
                      value={editIntroVideoUrl}
                      onChange={(e) => setEditIntroVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-white font-mono"
                    />
                    <p className="text-[10px] text-ink-soft">
                      Powers the video preview showcase on the public qualification prospectus. Leave blank to display the silent induction briefing walkthrough.
                    </p>

                    {editIntroVideoUrl && (
                      <div className="p-2.5 bg-white rounded border border-line/80 flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-navy-900 text-gold-300 flex items-center justify-center shrink-0">
                          <Icon name="video" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <strong className="text-xs font-bold text-navy-900 block truncate">
                            Active Preview Video Configured
                          </strong>
                          <span className="text-[11px] font-mono text-ink-soft truncate block">
                            {editIntroVideoUrl}
                          </span>
                        </div>
                        <a
                          href={editIntroVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-bold text-navy-900 bg-paper hover:bg-gold-300/40 border border-line rounded-xs shrink-0 flex items-center gap-1"
                        >
                          <span>Test Link</span>
                          <Icon name="arrow-right" size={10} />
                        </a>
                      </div>
                    )}

                    {/* Video Fallback / Poster Cover Image */}
                    <div className="pt-3 border-t border-line space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-900">
                          Video Slot Cover / Fallback Poster Image
                        </label>
                        {editIntroVideoPoster && (
                          <button
                            type="button"
                            onClick={() => setEditIntroVideoPoster("")}
                            className="text-[10px] text-rose-700 hover:underline font-bold"
                          >
                            Reset to Default
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-ink-soft">
                        Upload or enter a custom poster/thumbnail image that covers the video player before the user presses play.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                        <ImageDropzone
                          value={editIntroVideoPoster}
                          onChange={(url) => setEditIntroVideoPoster(url)}
                          label="Upload Video Poster"
                          helperText="JPG, PNG, WebP"
                          previewHeight={70}
                          showUrlInput={false}
                        />
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono uppercase text-ink-soft">
                            Or Enter Poster Image URL:
                          </label>
                          <input
                            type="text"
                            placeholder="https://... or /images/..."
                            value={editIntroVideoPoster}
                            onChange={(e) => setEditIntroVideoPoster(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs font-mono bg-white focus:outline-none focus:border-navy-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Short Course Overview / Summary
                    </label>
                    <textarea
                      rows={3}
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Full Prospectus Description
                    </label>
                    <textarea
                      rows={5}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white leading-relaxed font-sans"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING, LEVELS & PLANS */}
              {editTab === "pricing" && (
                <div className="space-y-4">
                  <div className="bg-paper p-3.5 rounded-sm border border-line space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                          Qualification Levels & Stages
                        </label>
                        <p className="text-[11px] text-ink-soft">
                          Manage course levels (e.g. Level 2, Level 3, Level 5, CPD Certificate).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddLevel}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-navy-900 text-white hover:bg-navy-700 text-xs font-bold shadow-subtle transition-colors"
                      >
                        <Icon name="plus" size={13} />
                        <span>Add Level</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {editLevels.map((lvl, idx) => (
                        <div
                          key={idx}
                          className={`inline-flex items-center rounded-sm overflow-hidden border transition-colors ${
                            selectedLevelIdx === idx
                              ? "border-navy-900 shadow-sm"
                              : "border-line"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleLevelChange(idx)}
                            className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                              selectedLevelIdx === idx
                                ? "bg-navy-900 text-white"
                                : "bg-white text-ink hover:bg-paper"
                            }`}
                          >
                            {lvl.level_label || `Level ${idx + 1}`}
                          </button>
                          {editLevels.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveLevel(idx);
                              }}
                              title={`Remove ${lvl.level_label}`}
                              className={`px-2 py-1.5 text-xs border-l transition-colors ${
                                selectedLevelIdx === idx
                                  ? "bg-navy-900 text-red-200 hover:text-white hover:bg-red-700 border-navy-700"
                                  : "bg-white text-ink-soft hover:text-red-600 hover:bg-red-50 border-line"
                              }`}
                            >
                              <Icon name="close" size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-line/60">
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Active Level Title / Label
                      </label>
                      <input
                        type="text"
                        value={editLevelLabel}
                        onChange={(e) => setEditLevelLabel(e.target.value)}
                        placeholder="e.g. Level 2, Level 3, CPD Certificate"
                        className="w-full sm:w-72 px-3 py-1.5 border border-line rounded-sm text-xs font-bold bg-white focus:outline-none focus:border-navy-900"
                        required
                      />
                      <p className="text-[11px] text-ink-soft mt-1">
                        Display name shown on public syllabus cards, qualification selector, and invoices.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-line">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Regular Price / RRP (£)
                      </label>
                      <input
                        type="number"
                        step="10"
                        value={editRegularPrice}
                        onChange={(e) => setEditRegularPrice(e.target.value)}
                        placeholder="e.g. 1450 (Optional)"
                        className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900 bg-paper focus:bg-white font-bold"
                      />
                      <p className="text-[11px] text-ink-soft mt-1">
                        Original reference price (slashed out with strikethrough).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Selling Tuition Fee (£)
                      </label>
                      <input
                        type="number"
                        step="10"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900 bg-paper focus:bg-white font-bold text-navy-900"
                        required
                      />
                      <p className="text-[11px] text-ink-soft mt-1">
                        Current discounted price learners actually pay.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Upfront Discount (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={editDiscountPercent}
                        onChange={(e) => setEditDiscountPercent(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900 bg-paper focus:bg-white font-bold"
                      />
                      <p className="text-[11px] text-ink-soft mt-1">
                        {parseFloat(editDiscountPercent) > 0
                          ? `Learners save ${editDiscountPercent}% when paying upfront.`
                          : "Set to 0% for no extra upfront discount."}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Instalment Deposit (£)
                      </label>
                      <input
                        type="number"
                        step="5"
                        value={editDeposit}
                        onChange={(e) => setEditDeposit(e.target.value)}
                        className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900 bg-paper focus:bg-white font-bold"
                        required
                      />
                      <p className="text-[11px] text-ink-soft mt-1">
                        Deposit paid at enrolment before monthly instalments.
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const reg = parseFloat(editRegularPrice);
                    const sel = parseFloat(editPrice);
                    if (!isNaN(reg) && !isNaN(sel) && reg > sel) {
                      const diff = reg - sel;
                      const pct = Math.round((diff / reg) * 100);
                      return (
                        <div className="p-3 bg-amber-50/70 border border-gold-300 rounded-sm text-xs flex items-center justify-between gap-3 text-navy-900">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-amber-900">Price Slashed Preview:</span>
                            <span className="line-through text-ink-soft">£{reg.toLocaleString()}</span>
                            <span className="font-bold text-navy-900 text-sm">£{sel.toLocaleString()}</span>
                            <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-sm text-[11px]">
                              Save £{diff.toLocaleString()} ({pct}% OFF)
                            </span>
                          </div>
                          <span className="text-[11px] text-ink-soft hidden sm:inline">Featured on course page & syllabus cards</span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Study Duration Text
                      </label>
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="e.g. 4 – 6 months"
                        className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Guided Learning Hours (GLH)
                      </label>
                      <input
                        type="number"
                        value={editGlh}
                        onChange={(e) => setEditGlh(e.target.value)}
                        placeholder="e.g. 320"
                        className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Pricing Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-paper p-3.5 rounded-sm border border-line">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900 block mb-1">
                        Upfront Full Payment (Single Charge)
                      </span>
                      {(() => {
                        const fee = parseFloat(editPrice) || 0;
                        const disc = parseFloat(editDiscountPercent) || 0;
                        const fullPay = Math.round(fee * (1 - disc / 100));
                        const saving = fee - fullPay;
                        return (
                          <div className="bg-white p-3 border border-line rounded-sm">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xl font-bold font-heading text-navy-900">
                                {formatCurrency(fullPay)}
                              </span>
                              {disc > 0 ? (
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">
                                  Save {formatCurrency(saving)} ({disc}%)
                                </span>
                              ) : (
                                <span className="text-xs text-ink-soft">Standard Price (0% Off)</span>
                              )}
                            </div>
                            <span className="text-[11px] text-ink-soft block mt-1">
                              Charge applied to students opting for single payment at checkout.
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-paper p-3.5 rounded-sm border border-line">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900 block mb-1">
                        Instalment Plan Deposit Required
                      </span>
                      <div className="bg-white p-3 border border-line rounded-sm">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-bold font-heading text-navy-900">
                            {formatCurrency(parseFloat(editDeposit) || 0)}
                          </span>
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-100">
                            Due at Enrolment
                          </span>
                        </div>
                        <span className="text-[11px] text-ink-soft block mt-1">
                          Remaining balance divided across months at 0% interest.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly instalment preview table */}
                  <div className="bg-paper p-4 rounded-sm border border-line space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900 block">
                      Instalment Schedule Options (Calculated for {editLevelLabel || "Tuition"})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[3, 6, 10, 12].map((m) => {
                        const fee = parseFloat(editPrice) || 0;
                        const dep = parseFloat(editDeposit) || 0;
                        const rem = Math.max(0, fee - dep);
                        const monthly = Math.round(rem / m);
                        return (
                          <div key={m} className="p-2.5 bg-white border border-line rounded-sm text-center">
                            <span className="block font-semibold text-ink-soft">{m} Months</span>
                            <strong className="block text-navy-900 text-sm">{formatCurrency(monthly)}/mo</strong>
                            <span className="text-[10px] text-emerald-700 font-semibold">0% Interest</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: UNITS & CURRICULUM */}
              {editTab === "curriculum" && (
                <div className="space-y-4">
                  <div className="bg-paper p-3 rounded-sm border border-line">
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Select Qualification Level for Curriculum
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {editLevels.map((lvl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleLevelChange(idx)}
                          className={`px-3 py-1 rounded-sm text-xs font-semibold transition-colors border ${
                            selectedLevelIdx === idx
                              ? "bg-navy-900 text-white border-navy-900"
                              : "bg-white text-ink-soft border-line hover:text-navy-900"
                          }`}
                        >
                          {lvl.level_label || `Level ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading text-sm font-bold text-navy-900">
                        Units for {editLevelLabel || "Active Level"}
                      </h4>
                      <p className="text-[11px] text-ink-soft">
                        Accredited curriculum modules displayed on the public qualification details syllabus.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditUnits([
                          ...editUnits,
                          {
                            code: `U${editUnits.length + 1}`,
                            title: "New Unit Title",
                            credits: 4,
                            mandatory: true,
                          },
                        ]);
                      }}
                      className="px-2.5 py-1 bg-navy-900 text-white rounded-sm text-xs font-semibold hover:bg-navy-700 transition-colors flex items-center gap-1"
                    >
                      <Icon name="plus" size={12} />
                      <span>Add Unit</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editUnits.length === 0 ? (
                      <p className="text-center py-6 text-ink-soft italic bg-paper rounded-sm border border-line">
                        No units added for this qualification level yet.
                      </p>
                    ) : (
                      editUnits.map((unit, uIdx) => (
                        <div
                          key={uIdx}
                          className="p-3 bg-paper rounded-sm border border-line space-y-2"
                        >
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-2">
                              <label className="text-[10px] uppercase font-bold text-ink-soft block mb-0.5">
                                Code
                              </label>
                              <input
                                type="text"
                                value={unit.code}
                                onChange={(e) => {
                                  const next = [...editUnits];
                                  next[uIdx].code = e.target.value;
                                  setEditUnits(next);
                                }}
                                className="w-full px-2 py-1 bg-white border border-line rounded-xs text-xs font-mono"
                              />
                            </div>

                            <div className="col-span-5">
                              <label className="text-[10px] uppercase font-bold text-ink-soft block mb-0.5">
                                Unit Title
                              </label>
                              <input
                                type="text"
                                value={unit.title}
                                onChange={(e) => {
                                  const next = [...editUnits];
                                  next[uIdx].title = e.target.value;
                                  setEditUnits(next);
                                }}
                                className="w-full px-2 py-1 bg-white border border-line rounded-xs text-xs font-semibold text-navy-900"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="text-[10px] uppercase font-bold text-ink-soft block mb-0.5">
                                Credits
                              </label>
                              <input
                                type="number"
                                value={unit.credits || 0}
                                onChange={(e) => {
                                  const next = [...editUnits];
                                  next[uIdx].credits = parseInt(e.target.value, 10) || 0;
                                  setEditUnits(next);
                                }}
                                className="w-full px-2 py-1 bg-white border border-line rounded-xs text-xs"
                              />
                            </div>

                            <div className="col-span-3 text-right pt-4 flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedUnitIdx(expandedUnitIdx === uIdx ? null : uIdx)
                                }
                                className="px-2 py-1 text-xs font-semibold text-navy-900 hover:bg-white rounded-xs border border-line transition-colors flex items-center gap-1"
                              >
                                <span>{expandedUnitIdx === uIdx ? "Close Details" : "Syllabus Details"}</span>
                                <Icon
                                  name="chevron-down"
                                  size={11}
                                  className={expandedUnitIdx === uIdx ? "rotate-180" : ""}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditUnits(editUnits.filter((_, i) => i !== uIdx));
                                }}
                                className="text-rose-700 hover:text-rose-900 text-xs font-semibold px-2 py-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Expandable Unit Learning Outcomes & Evidence */}
                          {expandedUnitIdx === uIdx && (
                            <div className="p-3 bg-white border border-line rounded-sm space-y-3 pt-3 animate-in fade-in duration-150">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                                  Learning Outcomes (One bullet point per line):
                                </label>
                                <textarea
                                  rows={3}
                                  value={(unit.outcomes || unit.learningOutcomes || []).join("\n")}
                                  onChange={(e) => {
                                    const next = [...editUnits];
                                    const lines = e.target.value
                                      .split("\n")
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    next[uIdx].outcomes = lines;
                                    next[uIdx].learningOutcomes = lines;
                                    setEditUnits(next);
                                  }}
                                  placeholder="Understand legislative frameworks and statutory care standards&#10;Apply person-centred principles in direct care practice&#10;Evaluate continuous professional development logs"
                                  className="w-full px-2.5 py-1.5 border border-line rounded-xs text-xs bg-paper focus:bg-white focus:outline-none focus:border-navy-900 leading-relaxed font-sans"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                                    Assessment Evidence Required:
                                  </label>
                                  <input
                                    type="text"
                                    value={unit.evidence || ""}
                                    onChange={(e) => {
                                      const next = [...editUnits];
                                      next[uIdx].evidence = e.target.value;
                                      setEditUnits(next);
                                    }}
                                    placeholder="e.g. Workplace observation, reflective log, and supervisor witness testimony"
                                    className="w-full px-2.5 py-1.5 border border-line rounded-xs text-xs bg-paper focus:bg-white focus:outline-none focus:border-navy-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                                    Guided Learning Hours (GLH):
                                  </label>
                                  <input
                                    type="number"
                                    value={unit.guided_learning_hours || 25}
                                    onChange={(e) => {
                                      const next = [...editUnits];
                                      next[uIdx].guided_learning_hours = parseInt(e.target.value, 10) || 0;
                                      setEditUnits(next);
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-line rounded-xs text-xs bg-paper focus:bg-white focus:outline-none focus:border-navy-900"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CAREER OPPORTUNITIES & PROGRESSION */}
              {editTab === "outcomes" && (
                <div className="space-y-4">
                  <div className="p-3 bg-paper rounded-sm border border-line">
                    <h4 className="font-heading text-sm font-bold text-navy-900 mb-0.5">
                      Career Opportunities & Educational Progression
                    </h4>
                    <p className="text-[11px] text-ink-soft">
                      Configure the target employment roles and subsequent educational pathways displayed on the course prospectus page.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Target Roles & Careers (One role per line)
                    </label>
                    <textarea
                      rows={5}
                      value={editJobProspects.join("\n")}
                      onChange={(e) =>
                        setEditJobProspects(
                          e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="Senior Care Worker&#10;Care Coordinator&#10;Registered Manager&#10;Community Healthcare Assistant"
                      className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white leading-relaxed font-sans"
                    />
                    <p className="text-[10px] text-ink-soft">
                      Displayed under the &quot;Target Roles & Careers&quot; section on the public course details page.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Next Progression Routes (One route per line)
                    </label>
                    <textarea
                      rows={5}
                      value={editProgression.join("\n")}
                      onChange={(e) =>
                        setEditProgression(
                          e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="Level 5 Diploma in Leadership for Health and Social Care&#10;Higher National Diploma (HND) in Healthcare Practice&#10;Direct University Entry into Nursing (BSc Hons)"
                      className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white leading-relaxed font-sans"
                    />
                    <p className="text-[10px] text-ink-soft">
                      Displayed under the &quot;Next Progression Routes&quot; section on the public course details page.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: ASSESSMENT SPECIFICATIONS & TUITION INCLUSIONS */}
              {editTab === "specs" && (
                <div className="space-y-4">
                  <div className="p-3 bg-paper rounded-sm border border-line">
                    <h4 className="font-heading text-sm font-bold text-navy-900 mb-0.5">
                      Workplace Assessment Model, Header Badges & Inclusions
                    </h4>
                    <p className="text-[11px] text-ink-soft">
                      Customize how tuition inclusions, workplace evidence protocols, and hero banner specifications appear to prospective students.
                    </p>
                  </div>

                  {/* Header Spec Bar Badges */}
                  <div className="p-3 bg-paper rounded-sm border border-line space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
                      Header Prospectus Feature Bar (Hero Spec Badges)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                          Intake & Admissions Text
                        </label>
                        <input
                          type="text"
                          value={editIntakeText}
                          onChange={(e) => setEditIntakeText(e.target.value)}
                          placeholder="e.g. Rolling Admissions"
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                          Assessment Model Text
                        </label>
                        <input
                          type="text"
                          value={editAssessmentModelText}
                          onChange={(e) => setEditAssessmentModelText(e.target.value)}
                          placeholder="e.g. 100% Portfolio Based"
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                          Dedicated Support Text
                        </label>
                        <input
                          type="text"
                          value={editSupportModelText}
                          onChange={(e) => setEditSupportModelText(e.target.value)}
                          placeholder="e.g. Named British Assessor"
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Workplace Evidence & Observation Text */}
                  <div className="p-3 bg-paper rounded-sm border border-line space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
                      Workplace Evidence & Observation Guide
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                          Direct Workplace Evidence Card Content
                        </label>
                        <textarea
                          rows={3}
                          value={editWorkplaceEvidenceText}
                          onChange={(e) => setEditWorkplaceEvidenceText(e.target.value)}
                          placeholder="You will build a professional portfolio using real workplace evidence gathered during your employment or voluntary care placement, including care plan reviews, risk assessments, and reflective accounts."
                          className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900 leading-relaxed font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                          Flexible Observation Methods Card Content
                        </label>
                        <textarea
                          rows={3}
                          value={editObservationMethodsText}
                          onChange={(e) => setEditObservationMethodsText(e.target.value)}
                          placeholder="Workplace observations can be conducted remotely via recorded video session or in-person with a registered Expert Witness (such as your registered manager or clinical lead)."
                          className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900 leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* What is Included with Tuition Fees */}
                  <div className="p-3 bg-paper rounded-sm border border-line space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
                        What is Included with Tuition Fees (One perk per line)
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-navy-900">
                        <input
                          type="checkbox"
                          checked={editFreeTextbook}
                          onChange={(e) => setEditFreeTextbook(e.target.checked)}
                          className="accent-navy-900"
                        />
                        <span>Free Physical Printed Textbook Perk</span>
                      </label>
                    </div>

                    <textarea
                      rows={5}
                      value={editTuitionIncludes.join("\n")}
                      onChange={(e) =>
                        setEditTuitionIncludes(
                          e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="Weekly live online evening lectures delivered via Zoom with qualified assessors&#10;24/7 access to the Smartminds Learner Portal and recorded lecture streams&#10;Dedicated named tutor providing individual written feedback within 5 working days&#10;Official awarding organisation registration fees and Ofqual certificate issuance&#10;One-to-one academic mentoring, assignment planning, and study skills guidance"
                      className="w-full px-3 py-2 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900 leading-relaxed font-sans"
                    />
                    <p className="text-[10px] text-ink-soft">
                      Learners see this checklist directly on the course details page and in the enrolment confirmation summary.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: REQUIREMENTS & FAQS */}
              {editTab === "faqs" && (
                <div className="space-y-6">
                  {/* Entry Requirements */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Entry Requirements (One bullet point per line)
                    </label>
                    <textarea
                      rows={4}
                      value={editRequirements.join("\n")}
                      onChange={(e) => {
                        setEditRequirements(
                          e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        );
                      }}
                      placeholder="Must be aged 19+&#10;Working or volunteering in a health & social care setting&#10;Competent written and spoken English"
                      className="w-full px-3 py-2 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 bg-paper focus:bg-white leading-relaxed"
                    />
                  </div>

                  {/* Frequently Asked Questions */}
                  <div className="space-y-3 pt-4 border-t border-line">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-sm font-bold text-navy-900">
                          Course-Specific Frequently Asked Questions
                        </h4>
                        <p className="text-[11px] text-ink-soft">
                          Displayed in the FAQ accordion on the qualification page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditFaqs([
                            ...editFaqs,
                            {
                              question: "New Question?",
                              answer: "Detailed answer explaining the policy or syllabus.",
                            },
                          ]);
                        }}
                        className="px-2.5 py-1 bg-navy-900 text-white rounded-sm text-xs font-semibold hover:bg-navy-700 transition-colors flex items-center gap-1"
                      >
                        <Icon name="plus" size={12} />
                        <span>Add FAQ</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editFaqs.length === 0 ? (
                        <p className="text-center py-4 text-ink-soft italic bg-paper rounded-sm border border-line">
                          No FAQs entered for this qualification yet.
                        </p>
                      ) : (
                        editFaqs.map((faq, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-3 bg-paper rounded-sm border border-line space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={faq.question}
                                onChange={(e) => {
                                  const next = [...editFaqs];
                                  next[fIdx].question = e.target.value;
                                  setEditFaqs(next);
                                }}
                                placeholder="Question?"
                                className="w-full px-2.5 py-1 bg-white border border-line rounded-xs text-xs font-semibold text-navy-900"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setEditFaqs(editFaqs.filter((_, i) => i !== fIdx));
                                }}
                                className="text-rose-700 hover:text-rose-900 text-xs font-semibold px-2 shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={faq.answer}
                              onChange={(e) => {
                                const next = [...editFaqs];
                                next[fIdx].answer = e.target.value;
                                setEditFaqs(next);
                              }}
                              placeholder="Answer explanation..."
                              className="w-full px-2.5 py-1 bg-white border border-line rounded-xs text-xs"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-line shrink-0">
              <span className="text-[11px] text-ink-soft">
                All changes reflect across the student catalogue and admissions portal immediately.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-line rounded-sm text-xs font-semibold text-ink-soft hover:bg-paper transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCourse}
                  disabled={isPending}
                  className="px-5 py-2 bg-navy-900 text-white rounded-sm text-xs font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Icon name="check-circle" size={14} className="text-gold-300" />
                  <span>{isPending ? "Saving Changes..." : "Save Course Details"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Qualification Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center">
                  <Icon name="plus" size={16} />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Add New Qualification to Catalogue
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-ink-soft hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Qualification Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diploma in Leadership and Management for Residential Childcare (RQF)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Faculty / Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
                  >
                    <option value="Health & Social Care">Health & Social Care</option>
                    <option value="Childcare & Early Years">Childcare & Early Years</option>
                    <option value="Education & Training">Education & Training</option>
                    <option value="Private Tutoring">Private Tutoring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Awarding Organisation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TQUK & NCFE"
                    value={newAwardingBody}
                    onChange={(e) => setNewAwardingBody(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Delivery Mode
                  </label>
                  <select
                    value={newDelivery}
                    onChange={(e) => setNewDelivery(e.target.value as DeliveryMode)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm bg-white focus:outline-none focus:border-navy-900"
                  >
                    <option value="live_online">Live Online (Zoom Seminars)</option>
                    <option value="blended">Blended Learning (Online + Clinical)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Custom Delivery Schedule (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Evening Zoom Classes + Weekend Assessor Mentoring"
                    value={newCustomDeliveryText}
                    onChange={(e) => setNewCustomDeliveryText(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              {/* Featured Course Cover Photo with ImageDropzone */}
              <div className="p-3 bg-paper rounded-sm border border-line space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-0.5">
                    Featured Course Cover Photo
                  </label>
                  <p className="text-[10px] text-ink-soft">
                    Upload a high-resolution photo from your device or pick a preset.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  <div>
                    <ImageDropzone
                      value={newImage}
                      onChange={(url: string, fileName?: string) => {
                        setNewImage(url);
                        const label = fileName
                          ? `Uploaded: ${fileName}`
                          : `Custom Image (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;
                        setMediaLibrary((prev) => {
                          if (prev.some((m) => m.url === url)) return prev;
                          return [{ label, url }, ...prev];
                        });
                      }}
                      label="Drag & Drop Course Photo"
                      helperText="JPG, PNG, WebP (auto-optimized)"
                      previewHeight={85}
                      showUrlInput={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-0.5">
                        Select from College Library
                      </label>
                      <select
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                      >
                        {mediaLibrary.map((item, idx) => (
                          <option key={idx} value={item.url}>
                            {item.label}
                          </option>
                        ))}
                        {!mediaLibrary.some((m) => m.url === newImage) && (
                          <option value={newImage}>
                            Custom Photo ({newImage.startsWith("data:") ? "Uploaded image" : newImage.slice(0, 24)}...)
                          </option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-0.5">
                        Or Enter Photo URL / Path
                      </label>
                      <input
                        type="text"
                        placeholder="/images/adult-care-training.jpg"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Intro Video URL */}
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Course Intro Video URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  value={newIntroVideoUrl}
                  onChange={(e) => setNewIntroVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Level
                  </label>
                  <input
                    type="text"
                    value={newLevelLabel}
                    onChange={(e) => setNewLevelLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Regular (£)
                  </label>
                  <input
                    type="number"
                    value={newRegularPrice}
                    onChange={(e) => setNewRegularPrice(e.target.value)}
                    placeholder="e.g. 1650"
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Tuition (£)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Upfront Disc (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDiscountPercent}
                    onChange={(e) => setNewDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Deposit (£)
                  </label>
                  <input
                    type="number"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Duration Text
                  </label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Guided Learning (GLH)
                  </label>
                  <input
                    type="number"
                    value={newGlh}
                    onChange={(e) => setNewGlh(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Ofqual QN Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 601/7721/0"
                  value={newAwardingRef}
                  onChange={(e) => setNewAwardingRef(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Syllabus Summary & Career Outcomes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the qualification outcomes, target roles, and delivery structure..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-navy-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-line rounded-sm text-sm font-semibold text-ink-soft hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCourse}
                disabled={isPending}
                className="px-5 py-2 bg-navy-900 text-white rounded-sm text-sm font-semibold hover:bg-navy-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Adding..." : "Add to Catalogue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
