"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, IconName } from "@/components/ui/Icon";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResponsiveCanvasFrame } from "./ResponsiveCanvasFrame";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import {
  BuilderSection,
  BuilderSectionType,
  BuilderSectionItem,
  BuilderTagItem,
  defaultPageBuilderSections,
  seedCompositeTemplates,
  CompositeWidget,
  CompositeColumn,
  CompositeWidgetType,
  CollegeCmsContent,
  HeaderNavConfig,
  defaultHeaderNavConfig,
  AnnouncementItem,
  defaultAnnouncements,
  FooterConfig,
  defaultFooterConfig,
  collegePagesData,
} from "@/lib/repositories/seedData";
import {
  saveVisualBuilderSectionsAction,
  saveVisualBuilderDraftAction,
  discardVisualBuilderDraftAction,
  saveSiteCmsContentAction,
  saveHeaderNavConfigAction,
  saveFooterConfigAction,
  createNewPageAction,
  deletePageAction,
  listColorSwatchesAction,
  saveColorSwatchAction,
  deleteColorSwatchAction,
} from "@/app/admin/actions";
import { DEFAULT_COLOR_SWATCHES, type ColorSwatch } from "@/lib/colorSwatches";
import { isDarkHex } from "@/components/ui/sectionBg";
import type { Course } from "@/content/types";
import { ButtonCustomizerFields } from "./ButtonCustomizerFields";
import { FocusedElementInspector, getDefaultItemsForSection } from "./FocusedElementInspector";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { CourseGridCmsControls } from "./CourseGridCmsControls";
import { ColorPalettePicker } from "./ColorPalettePicker";

interface Props {
  initialSections: BuilderSection[];
  initialPagesData?: Record<string, BuilderSection[]>;
  initialHeaderNav?: HeaderNavConfig;
  initialFooterConfig?: FooterConfig;
  initialContent: CollegeCmsContent;
  initialDrafts?: Record<string, { sections: BuilderSection[]; updatedAt: string }>;
  liveCourses?: Course[];
  userRole: string;
}

export interface PageItem {
  id: string;
  path: string;
  name: string;
  iconName: IconName;
  isSystem?: boolean;
}

const DEFAULT_PAGES: PageItem[] = [
  { id: "home", path: "/", name: "Homepage", iconName: "home", isSystem: true },
  { id: "courses", path: "/courses", name: "Qualifications Catalogue", iconName: "graduation-cap", isSystem: true },
  { id: "funding", path: "/funding", name: "Government Funded Routes", iconName: "credit-card", isSystem: true },
  { id: "about", path: "/about", name: "About Smartminds College", iconName: "building", isSystem: true },
  { id: "contact", path: "/contact", name: "Contact & Admissions", iconName: "message-square", isSystem: true },
  { id: "privacy", path: "/privacy", name: "Privacy Policy", iconName: "shield-check", isSystem: true },
  { id: "terms", path: "/terms", name: "Terms & Conditions", iconName: "file-text", isSystem: true },
  { id: "cookies", path: "/cookies", name: "Cookie Policy", iconName: "cookie", isSystem: true },
  { id: "refunds", path: "/refunds", name: "Refund & Cancellation Policy", iconName: "credit-card", isSystem: true },
  { id: "safeguarding", path: "/safeguarding-student-welfare", name: "Safeguarding & Student Welfare", iconName: "users", isSystem: true },
  { id: "cpd", path: "/cpd", name: "CPD Courses & Certificates", iconName: "shield-check", isSystem: true },
  { id: "book", path: "/book", name: "Book Free Consultation", iconName: "calendar", isSystem: true },
  { id: "private-tutoring", path: "/private-tutoring", name: "1-on-1 Academic Tutoring", iconName: "book-open", isSystem: true },
];

const AVAILABLE_IMAGES = [
  {
    path: "/images/adult-care-training.jpg",
    label: "Adult Social Care Training Suite",
  },
  {
    path: "/images/early-years-training.jpg",
    label: "Early Years & Nursery Classroom",
  },
  {
    path: "/images/teacher-training.jpg",
    label: "Teacher Education Seminar Room",
  },
  {
    path: "/images/tutor-teaching.jpg",
    label: "1-to-1 Assessor Mentoring",
  },
  {
    path: "/images/certificate-moment.jpg",
    label: "Qualification Certification",
  },
  {
    path: "/images/hero-learner.jpg",
    label: "Independent Online Study",
  },
];

const AVAILABLE_LOGO_PRESETS = [
  {
    path: "/images/logo-color.png",
    label: "Official Full-Color Logo",
  },
  {
    path: "/images/logo-white.png",
    label: "Official White / Light Logo",
  },
];

const AVAILABLE_ITEM_ICONS: { name: IconName; label: string }[] = [
  { name: "check-circle", label: "Checkmark Circle" },
  { name: "shield-check", label: "Verified Shield" },
  { name: "graduation-cap", label: "Graduation Cap" },
  { name: "book-open", label: "Curriculum Book" },
  { name: "clock", label: "Clock / Duration" },
  { name: "users", label: "Cohort / Students" },
  { name: "star", label: "Star / Rating" },
  { name: "sparkles", label: "Sparkles / Quality" },
  { name: "calendar", label: "Calendar / Dates" },
  { name: "phone", label: "Advisory Phone" },
  { name: "mail", label: "Email / Prospectus" },
  { name: "video", label: "Live Video Seminar" },
  { name: "layers", label: "Course Modules" },
  { name: "chevron-right", label: "Arrow Pathway" },
];

const WIDGET_DEFINITIONS: {
  type: BuilderSectionType;
  title: string;
  category: string;
  desc: string;
  iconName: IconName;
}[] = [
  {
    type: "hero",
    title: "Hero Banner",
    category: "Header & Lead",
    desc: "High-impact opening with headline, CTA buttons, and college photography.",
    iconName: "sparkles",
  },
  {
    type: "trust_strip",
    title: "Accreditation Strip",
    category: "Trust & Badges",
    desc: "Highlight NCFE, TQUK, Ofqual, and 100% coursework assessment standards.",
    iconName: "shield-check",
  },
  {
    type: "featured_courses",
    title: "Qualifications Grid",
    category: "Courses & Curricula",
    desc: "Showcase accredited diplomas with level choices and tuition breakdown.",
    iconName: "graduation-cap",
  },
  {
    type: "why_smartminds",
    title: "Why Smartminds Advantage",
    category: "Features & Benefits",
    desc: "4-column feature grid detailing tutor support, workplace evidence, and payment plans.",
    iconName: "check-circle",
  },
  {
    type: "stats_counter",
    title: "College Key Figures",
    category: "Social Proof",
    desc: "Verified metrics: 98% pass rate, 0% interest, 48h turnaround, 500+ practitioners.",
    iconName: "star",
  },
  {
    type: "testimonials",
    title: "Student Stories & Outcomes",
    category: "Social Proof",
    desc: "Verified practitioner quotes with star ratings and job titles.",
    iconName: "message-square",
  },
  {
    type: "cta_banner",
    title: "Advisory Call to Action",
    category: "Conversion",
    desc: "Direct telephone and WhatsApp consultation booking prompt.",
    iconName: "phone",
  },
  {
    type: "contact_block",
    title: "Fast Consultation Form",
    category: "Conversion",
    desc: "Inline lead capture for prospectus enquiries and phone callbacks.",
    iconName: "mail",
  },
  {
    type: "faq_accordion",
    title: "Frequently Asked Questions",
    category: "Information",
    desc: "Interactive accordion addressing funding, exams, and class replays.",
    iconName: "info",
  },
  {
    type: "announcement",
    title: "Regulatory / Intake Banner",
    category: "Information",
    desc: "High-visibility regulatory notice or upcoming intake deadline bar.",
    iconName: "bell",
  },
  {
    type: "video_spotlight",
    title: "Video Spotlight Showcase",
    category: "Social Proof",
    desc: "Dedicated multimedia video player with interactive thumbnail, consent guard, and responsive column split.",
    iconName: "video",
  },
  {
    type: "composite_block",
    title: "Custom Composite Block",
    category: "Custom Builder",
    desc: "Modular micro-widget block: combine icon boxes, images, text, CTA buttons, and forms in custom columns.",
    iconName: "layers",
  },
  {
    type: "choose_path",
    title: "Sector Pathways Grid",
    category: "Courses & Curricula",
    desc: "Interactive category cards guiding learners to Health & Social Care, Early Years, Education, and Business.",
    iconName: "compass",
  },
  {
    type: "exclusive_bundles",
    title: "Exclusive Bundles Carousel",
    category: "Courses & Curricula",
    desc: "Multi-qualification package offers with instant discounts, dual certifications, and fast-track completion.",
    iconName: "award",
  },
  {
    type: "staff_training",
    title: "Corporate & Staff Training",
    category: "Features & Benefits",
    desc: "Employer-focused workforce development showcase with volume pricing and custom cohort delivery.",
    iconName: "users",
  },
  {
    type: "coral_promo",
    title: "Promotional Highlight Banner",
    category: "Conversion",
    desc: "Coral-accented promotional block highlighting special tuition discounts, fast-track intakes, and bonus units.",
    iconName: "sparkles",
  },
  {
    type: "student_benefits",
    title: "Student Advantage Cards",
    category: "Features & Benefits",
    desc: "Highlight learner perks: 1-to-1 assessor support, interest-free payment, zero exams, and 24/7 portal access.",
    iconName: "check-circle",
  },
  {
    type: "pricing",
    title: "Tuition & Payment Plans",
    category: "Conversion",
    desc: "Transparent tuition fee comparison cards with upfront discounts and 0% interest monthly instalment options.",
    iconName: "credit-card",
  },
  {
    type: "how_it_works",
    title: "4-Step Study Process",
    category: "Information",
    desc: "Step-by-step learner journey: enrolment, evidence submission, live evening Zoom classes, and certification.",
    iconName: "clock",
  },
];

export const SiteCmsEditorView: React.FC<Props> = ({
  initialSections,
  initialPagesData = collegePagesData,
  initialHeaderNav = defaultHeaderNavConfig,
  initialFooterConfig = defaultFooterConfig,
  initialContent,
  initialDrafts = {},
  liveCourses,
  userRole,
}) => {
  const router = useRouter();
  // Dynamic Page list (Core system pages + any custom CMS pages created)
  const [pagesList, setPagesList] = useState<PageItem[]>(() => {
    const list: PageItem[] = [...DEFAULT_PAGES];
    if (initialPagesData) {
      Object.keys(initialPagesData).forEach((path) => {
        if (!list.some((p) => p.path === path)) {
          const rawName = path
            .replace(/^\//, "")
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          list.push({
            id: `page-${path.replace(/^\//, "")}`,
            path,
            name: rawName || "Custom Page",
            iconName: "layers",
            isSystem: false,
          });
        }
      });
    }
    return list;
  });

  // Page selector state
  const [activePagePath, setActivePagePath] = useState<string>("/");
  const [showPageDropdown, setShowPageDropdown] = useState<boolean>(false);

  // Create New Page Modal State
  const [showCreatePageModal, setShowCreatePageModal] = useState<boolean>(false);
  const [newPageName, setNewPageName] = useState<string>("");
  const [newPageSlug, setNewPageSlug] = useState<string>("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [newPageBlueprint, setNewPageBlueprint] = useState<
    "standard" | "campaign" | "blank" | "clone"
  >("standard");
  const [cloneSourcePath, setCloneSourcePath] = useState<string>("/");
  const [newAddToMenu, setNewAddToMenu] = useState<boolean>(true);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState<boolean>(false);

  // Multi-page sections store (hydrated with server drafts if available)
  const [pagesSections, setPagesSections] = useState<Record<string, BuilderSection[]>>(() => {
    const rawHome =
      initialSections && initialSections.length > 0
        ? initialSections
        : defaultPageBuilderSections;

    // Ensure all sections have their default items if missing
    const hydratedHome = rawHome.map((sec) => {
      if (!sec.items || sec.items.length === 0) {
        const def = defaultPageBuilderSections.find(
          (d) => d.id === sec.id || d.type === sec.type
        );
        if (def?.items && def.items.length > 0) {
          return { ...sec, items: def.items };
        }
      }
      return sec;
    });

    const base: Record<string, BuilderSection[]> = {
      ...(initialPagesData || {}),
      "/": hydratedHome,
    };

    // Hydrate with any active server drafts across devices!
    if (initialDrafts) {
      Object.entries(initialDrafts).forEach(([p, draft]) => {
        if (draft.sections && Array.isArray(draft.sections) && draft.sections.length > 0) {
          base[p] = draft.sections;
        }
      });
    }

    return base;
  });

  // Track published baseline per page to ensure auto-save only triggers on genuine uncommitted changes
  const publishedSnapshotsRef = useRef<Record<string, string>>({});
  const hasInitPublishedSnapshotsRef = useRef<boolean>(false);
  if (!hasInitPublishedSnapshotsRef.current) {
    hasInitPublishedSnapshotsRef.current = true;
    Object.entries(initialPagesData || {}).forEach(([p, secs]) => {
      if (Array.isArray(secs) && secs.length > 0) {
        publishedSnapshotsRef.current[p] = JSON.stringify(secs);
      }
    });
    if (initialSections && initialSections.length > 0) {
      publishedSnapshotsRef.current["/"] = JSON.stringify(initialSections);
    }
  }

  // Ref to track last saved draft payload per page to prevent duplicate saves
  const lastSavedDraftSnapshotRef = useRef<Record<string, string>>({});

  // Server-Side Cross-Device Draft System
  const [serverDrafts, setServerDrafts] = useState<
    Record<string, { sections: BuilderSection[]; updatedAt: string }>
  >(initialDrafts || {});

  const [draftStatus, setDraftStatus] = useState<{
    text: string;
    isSaving: boolean;
  }>(() => {
    const activeDraft = initialDrafts?.[activePagePath];
    if (activeDraft?.updatedAt) {
      const timeStr = new Date(activeDraft.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { text: `Draft saved to server (${timeStr})`, isSaving: false };
    }
    return { text: "Published to Live", isSaving: false };
  });

  // Undo & Redo History Management
  const [historyPast, setHistoryPast] = useState<Record<string, BuilderSection[]>[]>([]);
  const [historyFuture, setHistoryFuture] = useState<Record<string, BuilderSection[]>[]>([]);
  const lastHistorySnapshotRef = useRef<number>(0);

  const pushSnapshot = (snapshot: Record<string, BuilderSection[]>) => {
    setHistoryPast((past) => [...past.slice(-25), snapshot]);
    setHistoryFuture([]);
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);
    setHistoryFuture((fut) => [pagesSections, ...fut.slice(0, 25)]);
    setHistoryPast(newPast);
    setPagesSections(previous);
    setToastNotice("Undo applied");
    setTimeout(() => setToastNotice(null), 2500);
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);
    setHistoryPast((past) => [...past.slice(-25), pagesSections]);
    setHistoryFuture(newFuture);
    setPagesSections(next);
    setToastNotice("Redo applied");
    setTimeout(() => setToastNotice(null), 2500);
  };

  // Current active page sections
  const activeSections = pagesSections[activePagePath] || defaultPageBuilderSections;

  const setActiveSections = (
    updater: BuilderSection[] | ((prev: BuilderSection[]) => BuilderSection[]),
    recordHistory: boolean = true
  ) => {
    if (recordHistory) {
      const now = Date.now();
      if (now - lastHistorySnapshotRef.current > 400) {
        pushSnapshot(pagesSections);
        lastHistorySnapshotRef.current = now;
      }
    }
    setPagesSections((prev) => {
      const current = prev[activePagePath] || defaultPageBuilderSections;
      const next = typeof updater === "function" ? updater(current) : updater;
      return {
        ...prev,
        [activePagePath]: next,
      };
    });
  };

  // Keep draftStatus text in sync when switching pages
  useEffect(() => {
    const activeDraft = serverDrafts[activePagePath];
    if (activeDraft?.updatedAt) {
      const timeStr = new Date(activeDraft.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setDraftStatus({ text: `Draft saved to server (${timeStr})`, isSaving: false });
    } else {
      setDraftStatus({ text: "Published to Live", isSaving: false });
    }
  }, [activePagePath, serverDrafts]);

  // Debounced Auto-Save Draft to Server (2.5s debounce)
  // ONLY runs when activeSections actually differs from the published version
  const isInitialDraftMount = useRef(true);
  useEffect(() => {
    if (isInitialDraftMount.current) {
      isInitialDraftMount.current = false;
      return;
    }

    const currentSnapshot = JSON.stringify(activeSections);
    const publishedSnapshot = publishedSnapshotsRef.current[activePagePath];

    // If activeSections is identical to the published version, NO draft should be saved
    if (publishedSnapshot && currentSnapshot === publishedSnapshot) {
      setDraftStatus({ text: "Published to Live", isSaving: false });
      return;
    }

    // If activeSections is already saved as a draft, do nothing
    if (lastSavedDraftSnapshotRef.current[activePagePath] === currentSnapshot) {
      return;
    }

    setDraftStatus((prev) => ({ ...prev, isSaving: true, text: "Saving draft to server..." }));

    // Keep immediate copy in localStorage to protect user's work against tab closes or deploys
    try {
      localStorage.setItem(`smartminds_cms_draft_${activePagePath}`, currentSnapshot);
    } catch {}

    const timer = setTimeout(async () => {
      try {
        let saved = false;
        let updatedAt = new Date().toISOString();

        // 1. Try dedicated REST API route first
        try {
          const apiRes = await fetch("/api/admin/cms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_draft",
              pagePath: activePagePath,
              sections: activeSections,
            }),
          });
          if (apiRes.ok) {
            const data = await apiRes.json();
            if (data.success) {
              saved = true;
            }
          }
        } catch {}

        // 2. Fallback to server action if needed
        if (!saved) {
          const res = await saveVisualBuilderDraftAction(activePagePath, activeSections);
          if (res.success && res.updatedAt) {
            saved = true;
            updatedAt = res.updatedAt;
          } else if ((res as any)?.unauthorized || (res as any)?.sessionExpired) {
            setDraftStatus({ text: "Session expired — sign in as Director", isSaving: false });
            return;
          }
        }

        if (saved) {
          lastSavedDraftSnapshotRef.current[activePagePath] = currentSnapshot;
          const timeStr = new Date(updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          setDraftStatus({ text: `Draft saved to server (${timeStr})`, isSaving: false });
          setServerDrafts((prev) => ({
            ...prev,
            [activePagePath]: { sections: activeSections, updatedAt },
          }));
        } else {
          setDraftStatus({ text: "Draft save paused", isSaving: false });
        }
      } catch (err: any) {
        if (err?.message?.includes("Unauthorized")) {
          setDraftStatus({ text: "Session expired — sign in as Director", isSaving: false });
        } else {
          console.error("Draft auto-save notice:", err);
          setDraftStatus({ text: "Draft saved locally", isSaving: false });
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [activeSections, activePagePath]);

  // Discard working draft and revert to live published
  const handleDiscardDraft = async () => {
    if (
      !window.confirm(
        `Discard all working draft changes for "${activePagePath}" and revert to the live published site?`
      )
    ) {
      return;
    }

    try {
      const res = await discardVisualBuilderDraftAction(activePagePath);
      const reverted =
        res.publishedSections ||
        (initialPagesData && initialPagesData[activePagePath]) ||
        (activePagePath === "/" ? initialSections : defaultPageBuilderSections);

      setActiveSections(reverted, true);
      publishedSnapshotsRef.current[activePagePath] = JSON.stringify(reverted);
      delete lastSavedDraftSnapshotRef.current[activePagePath];

      setServerDrafts((prev) => {
        const next = { ...prev };
        delete next[activePagePath];
        return next;
      });
      setDraftStatus({ text: "Published to Live", isSaving: false });
      setToastNotice("Draft discarded. Reverted to live published version.");
      setTimeout(() => setToastNotice(null), 3000);
    } catch (err) {
      console.error("Failed to discard draft:", err);
      setToastNotice("Failed to discard draft.");
      setTimeout(() => setToastNotice(null), 3000);
    }
  };

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    activeSections[0]?.id || ""
  );

  // College Media Library Modal State
  const [mediaModalOpen, setMediaModalOpen] = useState<boolean>(false);
  const [mediaTargetField, setMediaTargetField] = useState<{
    type: "section" | "item" | "logo" | "videoThumbnail" | "accreditationBadge";
    itemIdx?: number;
    badgeIdx?: number;
  } | null>(null);

  // Collapsible Left Panel state (Elementor full-screen toggle)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Keyboard shortcut Ctrl+P (panel) and Ctrl+Z / Ctrl+Y (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle panel with Ctrl+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      // Undo with Ctrl+Z (without shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo with Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.ctrlKey || e.metaKey) &&
        ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyPast, historyFuture, pagesSections]);

  // Sidebar Controls: Page Content (blocks, inspect, widgets) vs Site Branding (menu, footer, contact)
  const [panelCategory, setPanelCategory] = useState<"page" | "site">("page");
  const [sidebarTab, setSidebarTab] = useState<
    "blocks" | "inspect" | "widgets" | "menu" | "footer" | "contact" | "swatches"
  >("blocks");
  const [inspectorSubTab, setInspectorSubTab] = useState<
    "content" | "style" | "items"
  >("content");

  // Global Brand Color Swatches Manager (Option C: Elementor-style Swatches Kit)
  const [swatchesList, setSwatchesList] = useState<ColorSwatch[]>(DEFAULT_COLOR_SWATCHES);
  const [newSwatchName, setNewSwatchName] = useState("");
  const [newSwatchHex, setNewSwatchHex] = useState("#13416B");
  const [newSwatchCategory, setNewSwatchCategory] = useState<"primary" | "secondary" | "accent" | "custom">("custom");
  const [isSavingSwatch, setIsSavingSwatch] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Swatch Renaming & Editing State
  const [editingSwatchId, setEditingSwatchId] = useState<string | null>(null);
  const [editingSwatchName, setEditingSwatchName] = useState("");
  const [editingSwatchHex, setEditingSwatchHex] = useState("");
  const [editingSwatchCategory, setEditingSwatchCategory] = useState<"primary" | "secondary" | "accent" | "custom">("custom");
  const [isUpdatingSwatch, setIsUpdatingSwatch] = useState(false);

  const startEditSwatch = (swatch: ColorSwatch) => {
    setEditingSwatchId(swatch.id);
    setEditingSwatchName(swatch.name);
    setEditingSwatchHex(swatch.hex);
    setEditingSwatchCategory(swatch.category || "custom");
  };

  const handleUpdateGlobalSwatch = async (swatchId: string) => {
    if (!editingSwatchName.trim() || !editingSwatchHex.trim()) return;
    setIsUpdatingSwatch(true);
    try {
      const isDark = isDarkHex(editingSwatchHex);
      const res = await saveColorSwatchAction({
        id: swatchId,
        name: editingSwatchName.trim(),
        hex: editingSwatchHex.trim(),
        category: editingSwatchCategory,
        isDark,
      });
      if (res.success && res.swatch) {
        const updatedSwatch = res.swatch;
        const updated = swatchesList.map((s) => (s.id === swatchId ? updatedSwatch : s));
        setSwatchesList(updated);
        try {
          localStorage.setItem("smartminds_saved_swatches", JSON.stringify(updated));
        } catch {}
        window.dispatchEvent(new CustomEvent("smartminds:swatches-updated", { detail: updated }));
        setEditingSwatchId(null);
        setToastNotice(`Renamed swatch to "${updatedSwatch.name}" (${updatedSwatch.hex})`);
        setTimeout(() => setToastNotice(null), 3000);
      } else {
        alert(res.error || "Failed to update swatch");
      }
    } catch (err: any) {
      alert("Error updating swatch: " + (err.message || String(err)));
    } finally {
      setIsUpdatingSwatch(false);
    }
  };

  useEffect(() => {
    // Initial fetch of persisted swatches from Neon/JSON
    listColorSwatchesAction()
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setSwatchesList(items);
        }
      })
      .catch((err) => console.warn("Failed to load color swatches:", err));

    const handleUpdate = (e: any) => {
      if (Array.isArray(e.detail)) {
        setSwatchesList(e.detail);
      }
    };
    window.addEventListener("smartminds:swatches-updated", handleUpdate);
    return () => window.removeEventListener("smartminds:swatches-updated", handleUpdate);
  }, []);

  const handleCreateGlobalSwatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSwatchName.trim() || !newSwatchHex.trim()) return;
    setIsSavingSwatch(true);
    try {
      const isDark = isDarkHex(newSwatchHex);
      const res = await saveColorSwatchAction({
        name: newSwatchName.trim(),
        hex: newSwatchHex.trim(),
        category: newSwatchCategory,
        isDark,
      });
      if (res.success && res.swatch) {
        const savedSwatch = res.swatch;
        const updated = [...swatchesList.filter((s) => s.id !== savedSwatch.id), savedSwatch];
        setSwatchesList(updated);
        try {
          localStorage.setItem("smartminds_saved_swatches", JSON.stringify(updated));
        } catch {}
        window.dispatchEvent(new CustomEvent("smartminds:swatches-updated", { detail: updated }));
        setNewSwatchName("");
        setToastNotice(`Saved "${savedSwatch.name}" (${savedSwatch.hex}) to global swatches`);
        setTimeout(() => setToastNotice(null), 3000);
      } else {
        alert(res.error || "Failed to save swatch");
      }
    } catch (err: any) {
      alert("Error saving swatch: " + (err.message || String(err)));
    } finally {
      setIsSavingSwatch(false);
    }
  };

  const handleDeleteGlobalSwatch = async (swatchId: string, name: string) => {
    if (!window.confirm(`Delete the "${name}" brand swatch?`)) return;
    try {
      const res = await deleteColorSwatchAction(swatchId);
      if (res.success) {
        const updated = swatchesList.filter((s) => s.id !== swatchId);
        setSwatchesList(updated);
        try {
          localStorage.setItem("smartminds_saved_swatches", JSON.stringify(updated));
        } catch {}
        window.dispatchEvent(new CustomEvent("smartminds:swatches-updated", { detail: updated }));
        setToastNotice(`Deleted "${name}" from global swatches`);
        setTimeout(() => setToastNotice(null), 3000);
      } else {
        alert(res.error || "Could not delete swatch");
      }
    } catch (err: any) {
      alert("Error deleting swatch: " + (err.message || String(err)));
    }
  };

  // Saved Custom Composite Templates (Super Admin Reusable Library)
  const [savedTemplates, setSavedTemplates] = useState<BuilderSection[]>(seedCompositeTemplates);
  const [activeCompositeColIdx, setActiveCompositeColIdx] = useState<number>(0);
  const [activeWidgetEditId, setActiveWidgetEditId] = useState<string | null>(null);
  const [showAddWidgetMenu, setShowAddWidgetMenu] = useState<number | null>(null);
  const [widgetSearchQuery, setWidgetSearchQuery] = useState<string>("");
  const [widgetCategoryFilter, setWidgetCategoryFilter] = useState<string>("all");

  // Viewport Switcher: Desktop | Tablet (768px) | Mobile (390px)
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  const [selectedElementKey, setSelectedElementKey] = useState<
    | "headline"
    | "subheadline"
    | "badge"
    | "tags"
    | "button"
    | "secondaryButton"
    | "image"
    | "item"
    | "bg"
    | "video"
    | "floatingBadge"
    | "sealBadge"
    | "trustNote"
    | "socialProof"
    | "reassurance"
    | null
  >(null);
  const [selectedElementItemIndex, setSelectedElementItemIndex] = useState<number | null>(null);

  // Navigator Tree Expansion State
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({
    "sec-hero-01": true,
  });

  const toggleSectionExpanded = (secId: string) => {
    setExpandedSectionIds((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  // Helper to resolve all interactive sub-elements within any section for Navigator & Quick Jump Map
  const getSectionInnerElements = (sec: BuilderSection) => {
    const list: {
      key:
        | "headline"
        | "subheadline"
        | "badge"
        | "tags"
        | "button"
        | "secondaryButton"
        | "image"
        | "item"
        | "bg"
        | "video"
        | "floatingBadge"
        | "sealBadge"
        | "trustNote"
        | "socialProof"
        | "reassurance";
      label: string;
      sublabel?: string;
      icon: IconName;
      index?: number;
    }[] = [];

    if (
      sec.badgeText ||
      sec.eyebrow ||
      sec.type === "pricing" ||
      sec.type === "cta_banner" ||
      sec.type === "testimonials" ||
      sec.type === "choose_path" ||
      sec.type === "page_header" ||
      sec.type === "about_story" ||
      sec.type === "accreditations_block" ||
      sec.type === "team_grid" ||
      sec.type === "how_it_works" ||
      sec.type === "faq_accordion" ||
      sec.type === "courses_listing" ||
      sec.type === "featured_courses" ||
      sec.type === "why_smartminds"
    ) {
      list.push({
        key: "badge",
        label: sec.type === "trust_strip" ? "Rating Eyebrow" : "Eyebrow Badge",
        sublabel:
          sec.badgeText ||
          sec.eyebrow ||
          (sec.type === "pricing"
            ? "Honest, Transparent Pricing"
            : sec.type === "cta_banner"
            ? "Personalised Guidance"
            : sec.type === "testimonials"
            ? "Learner Experiences"
            : sec.type === "choose_path"
            ? "Course Pathways"
            : sec.type === "about_story"
            ? "Our Academic Heritage"
            : sec.type === "accreditations_block"
            ? "Quality Assurance"
            : sec.type === "team_grid"
            ? "Academic Governance"
            : sec.type === "how_it_works"
            ? "Your Learning Journey"
            : sec.type === "faq_accordion"
            ? "Common Questions"
            : sec.type === "courses_listing"
            ? "Regulated UK Qualifications & CPD"
            : sec.type === "featured_courses"
            ? "Explore Courses"
            : sec.type === "why_smartminds"
            ? "Why Choose Us"
            : undefined),
        icon: "sparkles",
      });
    }

    if (sec.tags && sec.tags.length > 0) {
      list.push({
        key: "tags",
        label: "Top Benefit Badges",
        sublabel: `${sec.tags.length} badges`,
        icon: "layers",
      });
    }

    if (sec.headline) {
      list.push({
        key: "headline",
        label: "Main Headline",
        sublabel: sec.headline.slice(0, 32) + (sec.headline.length > 32 ? "..." : ""),
        icon: "file-text",
      });
    }

    if (sec.subheadline) {
      list.push({
        key: "subheadline",
        label: "Subheadline Copy",
        sublabel: sec.subheadline.slice(0, 36) + (sec.subheadline.length > 36 ? "..." : ""),
        icon: "file-text",
      });
    }

    if (sec.buttonText || sec.type === "choose_path") {
      list.push({
        key: "button",
        label: sec.type === "choose_path" ? "Bottom CTA Button" : "Primary CTA Button",
        sublabel: sec.buttonText || (sec.type === "choose_path" ? "View All Categories" : undefined),
        icon: "arrow-right",
      });
    }

    if (sec.secondaryButtonText) {
      list.push({
        key: "secondaryButton",
        label: "Secondary Button",
        sublabel: sec.secondaryButtonText,
        icon: "arrow-right",
      });
    }

    if (sec.image) {
      list.push({
        key: "image",
        label: "Showcase Photograph",
        sublabel: sec.image,
        icon: "layers",
      });
    }

    if (sec.type === "hero" && sec.floatingBadgeEnabled !== false) {
      list.push({
        key: "floatingBadge",
        label: "Live Sessions Badge",
        sublabel: sec.floatingBadgeTitle || "Live Evening Sessions",
        icon: (sec.floatingBadgeIcon as IconName) || "star",
      });
    }

    if (sec.type === "hero" && sec.sealEnabled !== false) {
      list.push({
        key: "sealBadge",
        label: "Watch Video Seal Badge",
        sublabel: sec.sealText || "• WATCH VIDEO • EXPLORE COURSES •",
        icon: "video",
      });
    }

    if (sec.type === "hero") {
      list.push({
        key: "socialProof",
        label: "Social Proof & Rating",
        sublabel: `${sec.socialProofRating || "4.9/5"} • ${sec.socialProofText || "2,500+ Working Adults Certified"}`,
        icon: "users",
      });
      list.push({
        key: "reassurance",
        label: "Reassurance Perk",
        sublabel: sec.reassuranceText || "0% Interest Monthly Plans Available",
        icon: "check-circle",
      });
    }

    if (sec.type === "staff_training") {
      list.push({
        key: "floatingBadge",
        label: "Corporate Partners Metrics Banner",
        sublabel: sec.metricsBannerTitle || "50+ UK Providers",
        icon: "award",
      });
    }

    if (sec.type === "why_smartminds") {
      list.push({
        key: "floatingBadge",
        label: "Experience Stat Card & Trust Line",
        sublabel: `${sec.floatingBadgeTitle || "26+"} • ${sec.trustNote || "24/7 Support"}`,
        icon: "star",
      });
    }

    if (sec.trustNote || sec.type === "pricing") {
      list.push({
        key: "trustNote",
        label: "Instalment Notice / Guarantee",
        sublabel: (sec.trustNote || "Smartminds instalment plans...").slice(0, 36) + "...",
        icon: "shield-check",
      });
    }

    if (sec.videoUrl || sec.videoTitle || sec.type === "testimonials") {
      list.push({
        key: "video",
        label: "Spotlight Video Player",
        sublabel: sec.videoTitle || "Learner Stories",
        icon: "video",
      });
    }

    const currentItems =
      sec.items && sec.items.length > 0
        ? sec.items
        : getDefaultItemsForSection(sec.type);

    if (currentItems && currentItems.length > 0) {
      currentItems.forEach((item, idx) => {
        const itemLabel =
          sec.type === "staff_training"
            ? item.title
              ? `Benefit: ${item.title.slice(0, 20)}`
              : `Benefit Point #${idx + 1}`
            : sec.type === "coral_promo"
            ? item.title
              ? `Bullet: ${item.title.slice(0, 20)}`
              : `Bullet #${idx + 1}`
            : sec.type === "why_smartminds"
            ? item.title
              ? `Feature: ${item.title.slice(0, 22)}`
              : `Feature Pill #${idx + 1}`
            : sec.type === "exclusive_bundles"
            ? item.title
              ? `Bundle: ${item.title.slice(0, 22)}`
              : `Bundle Card #${idx + 1}`
            : item.title
            ? item.title.slice(0, 24)
            : `Card #${idx + 1}`;

        list.push({
          key: "item",
          label: itemLabel,
          sublabel: item.tag || item.desc?.slice(0, 24),
          icon: (item.icon as IconName) || "check-circle",
          index: idx,
        });
      });
    }

    if (sec.type === "featured_courses") {
      const cols = sec.columns || 4;
      const r = sec.rows || 2;
      list.push({
        key: "item",
        label: "Course Grid Columns & Rows",
        sublabel: `${cols} cols × ${r === "all" ? "All" : `${r} rows`}`,
        icon: "layers",
      });
    }

    list.push({
      key: "bg",
      label: "Layout & Spacing",
      sublabel: `${sec.bgColor || "paper"} • ${sec.paddingDensity || "normal"}`,
      icon: "sparkles",
    });

    return list;
  };

  // Direct Click-to-Edit Selection on the Live Canvas
  const handleSelectElement = (
    sectionId: string,
    elementKey:
      | "headline"
      | "subheadline"
      | "badge"
      | "tags"
      | "button"
      | "secondaryButton"
      | "image"
      | "item"
      | "bg"
      | "video"
      | "floatingBadge"
      | "sealBadge"
      | "trustNote"
      | "socialProof"
      | "reassurance",
    itemIndex?: number
  ) => {
    setSelectedSectionId(sectionId);
    setSelectedElementKey(elementKey);
    setSelectedElementItemIndex(itemIndex ?? null);
    setIsSidebarOpen(true);
    setPanelCategory("page");
    setSidebarTab("inspect");

    if (elementKey === "item" || elementKey === "image" || elementKey === "video") {
      setInspectorSubTab("items");
    } else if (elementKey === "bg") {
      setInspectorSubTab("style");
    } else {
      setInspectorSubTab("content");
    }

    const targetSec = activeSections.find((s) => s.id === sectionId);
    const label =
      elementKey === "trustNote"
        ? "Instalment Notice / Legal Reassurance"
        : elementKey === "sealBadge"
        ? "Watch Video Seal Badge"
        : elementKey === "socialProof"
        ? "Social Proof & Rating"
        : elementKey === "reassurance"
        ? "Reassurance Perk"
        : elementKey === "floatingBadge"
        ? targetSec?.type === "staff_training"
          ? "Corporate Partners Metrics Banner"
          : "Live Evening Sessions Badge"
        : elementKey === "video"
        ? "Video Spotlight Settings"
        : elementKey === "headline"
        ? "Headline"
        : elementKey === "subheadline"
        ? "Subheadline"
        : elementKey === "tags"
        ? "Hero Tags & Badges"
        : elementKey === "badge"
        ? targetSec?.type === "trust_strip"
          ? "Google Reviews & Rating"
          : "Badge / Eyebrow"
        : elementKey === "button"
        ? "Primary CTA"
        : elementKey === "secondaryButton"
        ? "Secondary Button"
        : elementKey === "image"
        ? "Photograph"
        : elementKey === "item"
        ? targetSec?.type === "staff_training"
          ? `Benefit Point #${(itemIndex ?? 0) + 1}`
          : targetSec?.type === "coral_promo"
          ? `Bullet #${(itemIndex ?? 0) + 1}`
          : targetSec?.type === "faq_accordion"
          ? `FAQ Question #${(itemIndex ?? 0) + 1}`
          : targetSec?.type === "trust_strip"
          ? `Accreditation Body #${(itemIndex ?? 0) + 1}`
          : `Card #${(itemIndex ?? 0) + 1}`
        : "Section Style";

    setToastNotice(`Focused: ${label}`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  // Drag & Drop State
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(
    null
  );
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState<
    number | null
  >(null);
  const [canvasDropTargetIndex, setCanvasDropTargetIndex] = useState<
    number | null
  >(null);
  const [draggedWidgetType, setDraggedWidgetType] =
    useState<BuilderSectionType | null>(null);

  // Navigation Menu & Header State
  const [headerNav, setHeaderNav] = useState<HeaderNavConfig>(initialHeaderNav);

  // Footer Configuration State
  const [footerConfig, setFooterConfig] =
    useState<FooterConfig>(initialFooterConfig);

  // Global College Contact Data State
  const [globalContent, setGlobalContent] =
    useState<CollegeCmsContent>(initialContent);

  // Feedback State
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedSection = activeSections.find((s) => s.id === selectedSectionId);
  const activePageObj =
    pagesList.find((p) => p.path === activePagePath) ||
    pagesList[0] ||
    DEFAULT_PAGES[0];

  // Helper to format/sanitize URL route slugs
  const formatSlug = (val: string) => {
    let clean = val.toLowerCase().trim();
    if (!clean.startsWith("/")) {
      clean = "/" + clean;
    }
    const pathPart = clean
      .slice(1)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return "/" + pathPart;
  };

  const RESERVED_SLUGS = [
    "/admin",
    "/api",
    "/portal",
    "/staff",
    "/student",
    "/super",
    "/login",
    "/robots.txt",
    "/sitemap.xml",
    "/favicon.ico",
  ];

  const validateSlug = (slug: string): boolean => {
    const trimmed = slug.trim();
    if (!trimmed || trimmed === "/") {
      setSlugError("Please specify a valid page URL slug (e.g. /safeguarding-policy).");
      return false;
    }
    if (RESERVED_SLUGS.includes(trimmed)) {
      setSlugError(`"${trimmed}" is a reserved system route. Please choose another slug.`);
      return false;
    }
    if (pagesList.some((p) => p.path === trimmed)) {
      setSlugError(`A page with path "${trimmed}" already exists.`);
      return false;
    }
    setSlugError(null);
    return true;
  };

  const handlePageNameChange = (val: string) => {
    setNewPageName(val);
    if (!isSlugManuallyEdited) {
      const generated = formatSlug(val);
      setNewPageSlug(generated);
      if (val.trim()) {
        validateSlug(generated);
      } else {
        setSlugError(null);
      }
    }
  };

  const handlePageSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    let sanitized = val.toLowerCase().replace(/[^a-z0-9\/-]/g, "");
    if (!sanitized.startsWith("/")) sanitized = "/" + sanitized;
    setNewPageSlug(sanitized);
    validateSlug(sanitized);
  };

  // Blueprint Starter Section Generator
  const generateBlueprintSections = (
    blueprint: "standard" | "campaign" | "blank" | "clone",
    name: string,
    clonePath: string
  ): BuilderSection[] => {
    const timestamp = Date.now();
    if (blueprint === "clone") {
      const source = pagesSections[clonePath] || defaultPageBuilderSections;
      return source.map((sec, idx) => ({
        ...sec,
        id: `sec-${sec.type}-${timestamp}-${idx}`,
      }));
    }

    if (blueprint === "blank") {
      return [
        {
          id: `sec-hero-${timestamp}`,
          type: "hero",
          name: "Hero Banner",
          enabled: true,
          headline: name || "New Page",
          subheadline:
            "Start customising this page by adding sections from the left library panel.",
          badgeText: "Smartminds Training College",
          buttonText: "Explore Qualifications",
          buttonLink: "/courses",
          secondaryButtonText: "Get in Touch",
          secondaryButtonLink: "/contact",
          bgColor: "navy",
          align: "left",
          image: "/images/adult-care-training.jpg",
        },
      ];
    }

    if (blueprint === "campaign") {
      return [
        {
          id: `sec-hero-${timestamp}`,
          type: "hero",
          name: "Campaign Hero Banner",
          enabled: true,
          headline: name || "Specialist Training Campaign",
          subheadline:
            "Gain accredited qualifications with live evening Zoom sessions and fast-track tutor feedback.",
          badgeText: "2026/2027 Admissions",
          buttonText: "Register Interest",
          buttonLink: "/book",
          secondaryButtonText: "View Prospectus",
          secondaryButtonLink: "/courses",
          bgColor: "navy",
          align: "left",
          image: "/images/early-years-training.jpg",
        },
        {
          id: `sec-trust-${timestamp}`,
          type: "trust_strip",
          name: "Accreditation Strip",
          enabled: true,
          headline: "UK Regulated & Recognised",
          subheadline:
            "Awarding organisations inspected under strict Ofqual quality frameworks.",
          badgeText: "4.9/5 Student Rating",
          bgColor: "white",
          align: "center",
          items: [
            {
              title: "NCFE CACHE",
              desc: "Approved Centre",
              icon: "shield-check",
              tag: "Awarding Body",
              link: "https://www.ncfe.org.uk",
            },
            {
              title: "TQUK",
              desc: "Regulated Awarding Body",
              icon: "shield-check",
              tag: "Ofqual Regulated",
              link: "https://www.tquk.org",
            },
            {
              title: "Ofqual Regulated",
              desc: "UK Qualifications Framework",
              icon: "shield-check",
              tag: "Government Standards",
              link: "https://www.gov.uk/ofqual",
            },
            {
              title: "100% Coursework",
              desc: "No Exams Required",
              icon: "check-circle",
              tag: "Portfolio Based",
              link: "#",
            },
          ],
        },
        {
          id: `sec-stats-${timestamp}`,
          type: "stats_counter",
          name: "Key Figures & Outcomes",
          enabled: true,
          headline: "Proven Career Advancement",
          subheadline:
            "Key figures from our practicing healthcare and education cohorts.",
          badgeText: "Track Record",
          bgColor: "navy",
          align: "center",
          items: [
            {
              title: "98%",
              desc: "Student Pass & Completion Rate",
              tag: "Exam-Free",
            },
            {
              title: "0%",
              desc: "Interest Financing on Monthly Plans",
              tag: "Affordable",
            },
            {
              title: "48h",
              desc: "Average Assignment Feedback Window",
              tag: "Dedicated Tutors",
            },
            {
              title: "500+",
              desc: "Healthcare & Care Workers Qualified",
              tag: "UK Registered",
            },
          ],
        },
        {
          id: `sec-test-${timestamp}`,
          type: "testimonials",
          name: "Student Review",
          enabled: true,
          headline: "Real Practitioner Feedback",
          subheadline: "What students say about our online study model.",
          badgeText: "Verified Reviews",
          bgColor: "paper",
          align: "center",
          items: [
            {
              title: "Amara Okonjo",
              desc: "The flexible evening Zoom classes meant I could keep working full-time in my care home while finishing my Level 5 diploma. Assessor feedback was always prompt and supportive.",
              tag: "Care Home Registered Manager",
            },
            {
              title: "Marcus Davies",
              desc: "Smartminds made the portfolio submission crystal clear. No exams, just authentic workplace evidence. Finished two months ahead of schedule.",
              tag: "Senior Support Worker",
            },
          ],
        },
        {
          id: `sec-cta-${timestamp}`,
          type: "cta_banner",
          name: "Enrolment Call to Action",
          enabled: true,
          headline: "Secure your place in the upcoming cohort",
          subheadline:
            "Book a complimentary 15-minute consultation with our admissions team.",
          badgeText: "Limited Cohort Places",
          buttonText: "Book Free Consultation",
          buttonLink: "/book",
          secondaryButtonText: "Enquire via WhatsApp",
          secondaryButtonLink: "https://wa.me/447391512404",
          bgColor: "navy",
          align: "center",
        },
      ];
    }

    // Default: "standard" info / policy / partnership page
    return [
      {
        id: `sec-hero-${timestamp}`,
        type: "hero",
        name: "Page Lead & Introduction",
        enabled: true,
        headline: name || "College Information & Guidelines",
        subheadline:
          "Official standards, student guidance, and academic governance at Smartminds Training College.",
        badgeText: "Official College Information",
        buttonText: "Speak with an Advisor",
        buttonLink: "/contact",
        secondaryButtonText: "Explore Courses",
        secondaryButtonLink: "/courses",
        bgColor: "navy",
        align: "left",
        image: "/images/teacher-training.jpg",
      },
      {
        id: `sec-why-${timestamp}`,
        type: "why_smartminds",
        name: "Core Provisions & Standards",
        enabled: true,
        headline: "Our Governance & Standards",
        subheadline:
          "Transparent information explaining our teaching philosophy, governance, and student protection.",
        badgeText: "Academic Excellence",
        buttonText: "Enquire with Support",
        buttonLink: "/contact",
        bgColor: "paper",
        align: "center",
        items: [
          {
            title: "Ofqual Regulated Frameworks",
            desc: "All diploma pathways align with national qualification credit frameworks (RQF) recognized throughout England.",
            icon: "shield-check",
            tag: "Accredited",
          },
          {
            title: "One-to-One Tutor Mentorship",
            desc: "Each registered learner is paired with an experienced assessor for tailored feedback and guidance.",
            icon: "users",
            tag: "Assessor Support",
          },
          {
            title: "Equal Opportunity & Inclusion",
            desc: "Dedicated reasonable adjustments and digital accessibility for working practitioners from diverse backgrounds.",
            icon: "check-circle",
            tag: "Inclusive",
          },
        ],
      },
      {
        id: `sec-faq-${timestamp}`,
        type: "faq_accordion",
        name: "Frequently Asked Questions",
        enabled: true,
        headline: "Frequently Asked Questions",
        subheadline: "Answers to common queries regarding our provisions and policies.",
        badgeText: "Student Guidance",
        buttonText: "Ask an Advisor",
        buttonLink: "/contact",
        bgColor: "white",
        align: "center",
        items: [
          {
            title: "Who does this information apply to?",
            desc: "This guidance covers all enrolled candidates, prospective learners, and sponsoring care employers.",
            tag: "Scope",
          },
          {
            title: "How do I request formal documentation or evidence?",
            desc: "Our college administration team can issue verified letters, syllabuses, and enrolment confirmation upon request.",
            tag: "Documentation",
          },
          {
            title: "Can my employer sponsor my tuition under this provision?",
            desc: "Yes, we support direct corporate invoicing and flexible split-instalment agreements for employer-sponsored learners.",
            tag: "Employer Sponsorship",
          },
        ],
      },
      {
        id: `sec-cta-${timestamp}`,
        type: "cta_banner",
        name: "Advisory Call to Action",
        enabled: true,
        headline: "Have questions about this provision?",
        subheadline:
          "Our student advisory team is here to help you navigate your training journey.",
        badgeText: "Advisors on Hand",
        buttonText: "Schedule Free Advisory Call",
        buttonLink: "/book",
        secondaryButtonText: "Message on WhatsApp",
        secondaryButtonLink: "https://wa.me/447391512404",
        bgColor: "navy",
        align: "center",
      },
    ];
  };

  const handleCreateNewPage = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = formatSlug(newPageSlug || newPageName);
    if (!validateSlug(finalSlug)) {
      return;
    }
    if (!newPageName.trim()) {
      setSlugError("Please enter a page title.");
      return;
    }

    setIsCreatingPage(true);
    try {
      const generatedSections = generateBlueprintSections(
        newPageBlueprint,
        newPageName.trim(),
        cloneSourcePath
      );
      const newPageObj: PageItem = {
        id: `page-${finalSlug.replace(/^\//, "")}`,
        path: finalSlug,
        name: newPageName.trim(),
        iconName:
          newPageBlueprint === "campaign"
            ? "sparkles"
            : newPageBlueprint === "blank"
            ? "file-text"
            : "layers",
        isSystem: false,
      };

      const result = await createNewPageAction(
        newPageObj,
        generatedSections,
        newAddToMenu
      );
      if (result.success) {
        setPagesList((prev) => [...prev, newPageObj]);
        setPagesSections((prev) => ({
          ...prev,
          [finalSlug]: generatedSections,
        }));

        if (newAddToMenu) {
          setHeaderNav((prev) => ({
            ...prev,
            navLinks: [
              ...prev.navLinks,
              {
                id: `nav-${Date.now().toString().slice(-4)}`,
                label: newPageName.trim(),
                href: finalSlug,
              },
            ],
          }));
        }

        // Switch to the newly created page
        setActivePagePath(finalSlug);
        setSelectedSectionId(generatedSections[0]?.id || "");
        setShowCreatePageModal(false);
        setNewPageName("");
        setNewPageSlug("");
        setIsSlugManuallyEdited(false);
        setSlugError(null);
        setToastNotice(
          `Page "${newPageName.trim()}" created successfully! Now editing ${finalSlug}.`
        );
        setTimeout(() => setToastNotice(null), 5000);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create page.");
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleDeletePage = async (page: PageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (page.isSystem || page.path === "/" || page.path === "/courses") {
      alert("System core pages cannot be deleted.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${page.name}" (${page.path})? This will permanently remove the page from the website and navigation.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deletePageAction(page.path);
        if (res.success) {
          setPagesList((prev) => prev.filter((p) => p.path !== page.path));
          setPagesSections((prev) => {
            const copy = { ...prev };
            delete copy[page.path];
            return copy;
          });
          setHeaderNav((prev) => ({
            ...prev,
            navLinks: prev.navLinks.filter((l) => l.href !== page.path),
          }));

          if (activePagePath === page.path) {
            setActivePagePath("/");
            setSelectedSectionId(
              (pagesSections["/"] || defaultPageBuilderSections)[0]?.id || ""
            );
          }

          setToastNotice(`Page "${page.name}" deleted.`);
          setTimeout(() => setToastNotice(null), 4000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to delete page.");
      }
    });
  };

  // Reordering functions
  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeSections.length) return;

    const newSections = [...activeSections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    setActiveSections(newSections);
  };

  const handleDragStartSection = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", `section:${index}`);
    setDraggedSectionIndex(index);
  };

  const handleDragOverSection = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverSectionIndex !== index) {
      setDragOverSectionIndex(index);
    }
  };

  const handleDropOnSection = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if dropping a dragged widget
    const widgetType = e.dataTransfer.getData(
      "application/widget-type"
    ) as BuilderSectionType;
    if (widgetType) {
      insertWidgetAt(widgetType, targetIndex);
      setDraggedWidgetType(null);
      setDragOverSectionIndex(null);
      return;
    }

    // Dropping a reordered section
    if (draggedSectionIndex !== null && draggedSectionIndex !== targetIndex) {
      const newSections = [...activeSections];
      const [moved] = newSections.splice(draggedSectionIndex, 1);
      newSections.splice(targetIndex, 0, moved);
      setActiveSections(newSections);
      setSelectedSectionId(moved.id);
      setToastNotice(`Moved "${moved.name}" to position ${targetIndex + 1}.`);
      setTimeout(() => setToastNotice(null), 3000);
    }

    setDraggedSectionIndex(null);
    setDragOverSectionIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedSectionIndex(null);
    setDragOverSectionIndex(null);
    setCanvasDropTargetIndex(null);
    setDraggedWidgetType(null);
  };

  const toggleSectionEnabled = (id: string) => {
    setActiveSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const duplicateSection = (id: string) => {
    const idx = activeSections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const original = activeSections[idx];
    const clone: BuilderSection = {
      ...original,
      id: `sec-${original.type}-${Date.now().toString().slice(-4)}`,
      name: `${original.name} (Copy)`,
      items: original.items ? JSON.parse(JSON.stringify(original.items)) : undefined,
    };
    const newSections = [...activeSections];
    newSections.splice(idx + 1, 0, clone);
    setActiveSections(newSections);
    setSelectedSectionId(clone.id);
    setSidebarTab("inspect");
    setToastNotice(`Duplicated "${original.name}".`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const deleteSection = (id: string) => {
    if (activeSections.length <= 1) {
      alert("You must keep at least one section on this page.");
      return;
    }
    const target = activeSections.find((s) => s.id === id);
    const newSections = activeSections.filter((s) => s.id !== id);
    setActiveSections(newSections);
    if (selectedSectionId === id) {
      setSelectedSectionId(newSections[0]?.id || "");
    }
    setToastNotice(`Removed "${target?.name || "Section"}".`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const insertWidgetAt = (type: BuilderSectionType, insertIndex?: number) => {
    const def = WIDGET_DEFINITIONS.find((w) => w.type === type);
    const newSec: BuilderSection = {
      id: `sec-${type}-${Date.now().toString().slice(-4)}`,
      type,
      name: def?.title || "New Section",
      enabled: true,
      headline:
        type === "composite_block"
          ? "Custom Modular Qualification Showcase"
          : type === "stats_counter"
          ? "British FE Excellence by the Numbers"
          : type === "contact_block"
          ? "Speak with an Experienced Course Advisor"
          : type === "announcement"
          ? "Autumn / Winter 2026 Admissions Open Across All Diplomas"
          : type === "video_spotlight"
          ? "Graduate Stories & Video Assessor Mentorship"
          : type === "choose_path"
          ? "Choose Your Accredited Career Pathway"
          : type === "exclusive_bundles"
          ? "Exclusive Qualification Bundles"
          : type === "staff_training"
          ? "Upskill Your Care & Education Team"
          : type === "coral_promo"
          ? "Unlock Dual Certification at an Exclusive Rate"
          : type === "student_benefits"
          ? "Everything You Need to Succeed"
          : type === "pricing"
          ? "Affordable Tuition & 0% Payment Plans"
          : type === "how_it_works"
          ? "How You Will Study & Qualify"
          : `New ${def?.title || "Section"}`,
      subheadline:
        type === "composite_block"
          ? "Combine atomic micro-widgets including icon boxes, imagery, action CTAs, and lead forms in custom responsive columns."
          : type === "stats_counter"
          ? "Regulated diplomas inspected under strict Ofqual quality frameworks."
          : type === "contact_block"
          ? "Get non-obligatory advice on funding, prior workplace evidence, and enrolment timelines."
          : type === "announcement"
          ? "Reserve your place today with 0% interest monthly instalment financing."
          : type === "video_spotlight"
          ? "Watch practicing healthcare and education graduates describe real assessor support and study balance."
          : type === "choose_path"
          ? "Explore recognized diplomas designed for working practitioners with 100% coursework and zero exam stress."
          : type === "exclusive_bundles"
          ? "Save up to 30% when combining complementary vocational awards into a single structured programme."
          : type === "staff_training"
          ? "Bespoke workforce development for healthcare providers, care homes, and early years nurseries."
          : type === "coral_promo"
          ? "Fast-track your career with industry-recognized diplomas and dedicated one-to-one assessor mentorship."
          : type === "student_benefits"
          ? "We remove every barrier between you and your career progression with flexible, compassionate training."
          : type === "pricing"
          ? "Transparent fees with zero hidden charges. Spread your tuition across interest-free monthly instalments."
          : type === "how_it_works"
          ? "Our proven 4-step framework allows you to complete your qualification around work and family commitments."
          : "Customise this section copy directly in the Elementor inspector.",
      badgeText:
        type === "composite_block"
          ? "Modular Layout"
          : type === "video_spotlight"
          ? "Video Showcase"
          : type === "exclusive_bundles"
          ? "Limited Package Offers"
          : type === "staff_training"
          ? "Corporate Workforce"
          : type === "choose_path"
          ? "Explore Diplomas"
          : "Ofqual Regulated",
      buttonText:
        type === "contact_block"
          ? "Request Call Back"
          : type === "video_spotlight"
          ? "Browse Qualifications"
          : type === "staff_training"
          ? "Book Workforce Consultation"
          : "Explore Syllabus",
      buttonLink:
        type === "contact_block"
          ? "/book"
          : type === "video_spotlight"
          ? "/courses"
          : type === "staff_training"
          ? "/book"
          : "/courses",
      secondaryButtonText: "Book Free Consultation",
      secondaryButtonLink: "/book",
      bgColor:
        type === "composite_block"
          ? "paper"
          : type === "announcement"
          ? "navy"
          : type === "video_spotlight"
          ? "paper"
          : type === "staff_training"
          ? "paper"
          : "white",
      align: "left",
      image:
        type === "staff_training"
          ? "/images/tutor-teaching.jpg"
          : type === "coral_promo"
          ? "/images/hero-learner.jpg"
          : "/images/adult-care-training.jpg",
      columns: type === "composite_block" ? 2 : 3,
      columnRatio: "60-40",
      videoTitle: "Practitioner Qualification Journey",
      videoDesc:
        "Watch how healthcare workers achieved their Level 3 and 5 diplomas with zero exams.",
      videoThumbnail: "/images/certificate-moment.jpg",
      videoUrl: "",
      items:
        type === "stats_counter"
          ? [
              { title: "98%", desc: "Student Pass & Completion Rate", tag: "Exam-Free" },
              { title: "0%", desc: "Interest Financing on Monthly Plans", tag: "Affordable" },
              { title: "48h", desc: "Average Assignment Feedback Window", tag: "Dedicated Tutors" },
              { title: "500+", desc: "Healthcare & Care Workers Qualified", tag: "UK Registered" },
            ]
          : type === "choose_path"
          ? [
              {
                title: "Health & Social Care",
                desc: "Level 2 to Level 5 diplomas for carers, senior practitioners, and registered care home managers.",
                icon: "heart",
                tag: "Most Popular",
                link: "/courses?category=adult-care",
                image: "/images/adult-care-training.jpg",
              },
              {
                title: "Early Years & Childcare",
                desc: "Recognised early years educator pathways from nursery practitioners to room leaders and setting managers.",
                icon: "smile",
                tag: "High Demand",
                link: "/courses?category=early-years",
                image: "/images/early-years-training.jpg",
              },
              {
                title: "Teaching & Assessing (AET/TAQA)",
                desc: "Become a qualified vocational tutor, mentor, or workplace assessor with flexible evening classes.",
                icon: "book-open",
                tag: "Fast-Track",
                link: "/courses?category=teaching",
                image: "/images/teacher-training.jpg",
              },
              {
                title: "Leadership & Management",
                desc: "Strategic management qualifications for care directors, operational leads, and aspiring executives.",
                icon: "briefcase",
                tag: "Advanced",
                link: "/courses?category=leadership",
                image: "/images/certificate-moment.jpg",
              },
            ]
          : type === "exclusive_bundles"
          ? [
              {
                title: "Care Team Leadership Dual Award",
                desc: "Combine Level 3 Adult Care with Level 3 Award in Education & Training for complete clinical and mentoring mastery.",
                tag: "Save £400",
                price: "£1,450",
                originalPrice: "£1,850",
                link: "/book",
                image: "/images/adult-care-training.jpg",
              },
              {
                title: "Early Years Management Bundle",
                desc: "Early Years Educator Level 3 plus Designated Safeguarding Lead certification in one integrated pathway.",
                tag: "Save £350",
                price: "£1,650",
                originalPrice: "£2,000",
                link: "/book",
                image: "/images/early-years-training.jpg",
              },
              {
                title: "Educator & Workplace Assessor Pack",
                desc: "AET Level 3 combined with TAQA CAVA Level 3 Assessor qualification for vocational trainers.",
                tag: "Save £300",
                price: "£1,200",
                originalPrice: "£1,500",
                link: "/book",
                image: "/images/teacher-training.jpg",
              },
            ]
          : type === "staff_training"
          ? [
              {
                title: "Group Booking Discounts",
                desc: "Save up to 25% when enrolling 3 or more staff members onto matching or complementary diploma tracks.",
                icon: "users",
                tag: "Employers",
              },
              {
                title: "Flexible Cohort Timetables",
                desc: "Evening Zoom seminars and rolling admissions ensure training never disrupts active care shift rotas.",
                icon: "clock",
                tag: "Shift-Friendly",
              },
              {
                title: "Dedicated Assessor Liaison",
                desc: "A single senior assessor coordinates directly with your registered manager for evidence observation.",
                icon: "shield-check",
                tag: "Compliance",
              },
            ]
          : type === "coral_promo"
          ? [
              {
                title: "Fast-Track Registration",
                desc: "Complete induction within 24 hours and begin submitting coursework portfolios immediately.",
                icon: "zap",
              },
              {
                title: "Zero Exam Pressure",
                desc: "Demonstrate your competency through real-world work evidence, witness testimonies, and reflections.",
                icon: "check-circle",
              },
              {
                title: "0% Interest Instalments",
                desc: "Spread your investment over 3, 6, or 10 monthly payments with zero credit checks.",
                icon: "credit-card",
              },
            ]
          : type === "student_benefits"
          ? [
              {
                title: "Personal Tutor Mentorship",
                desc: "Unlimited 1-on-1 Zoom sessions with an experienced UK practitioner dedicated to your progress.",
                icon: "users",
                tag: "Mentorship",
              },
              {
                title: "100% Coursework Assessment",
                desc: "No high-stress written exams. Pass through structured modular portfolios of practical workplace evidence.",
                icon: "check-circle",
                tag: "Exam-Free",
              },
              {
                title: "0% Interest Payment Plans",
                desc: "Flexible monthly tuition split with zero finance charges, making accredited education genuinely accessible.",
                icon: "credit-card",
                tag: "Financing",
              },
              {
                title: "Live Evening Classes + Replays",
                desc: "Join interactive weekly workshops or catch up anytime through our high-definition recording library.",
                icon: "video",
                tag: "Flexible",
              },
            ]
          : type === "how_it_works"
          ? [
              {
                title: "1. Choose Your Pathway",
                desc: "Select your accredited qualification and consult with an advisor to verify career entry eligibility.",
                tag: "Step 1",
              },
              {
                title: "2. Submit Experience Evidence",
                desc: "Work with your personal assessor to map existing care or teaching experience into modular units.",
                tag: "Step 2",
              },
              {
                title: "3. Attend Evening Seminars",
                desc: "Participate in weekly tutor-led Zoom masterclasses with recordings available 24/7.",
                tag: "Step 3",
              },
              {
                title: "4. Receive Regulated Diploma",
                desc: "Graduate with an Ofqual-regulated certificate recognized across the UK healthcare and education sectors.",
                tag: "Step 4",
              },
            ]
          : [
              {
                title: "Vocational Unit Competency",
                desc: "100% coursework and evidence portfolio assessed by practicing assessors.",
                tag: "Accredited",
              },
              {
                title: "Live Online Evening Seminars",
                desc: "Interactive Zoom sessions with full video replays uploaded next day.",
                tag: "Flexible",
              },
            ],
      compositeColumns:
        type === "composite_block"
          ? [
              {
                id: "col-1",
                widgets: [
                  {
                    id: `w-txt-${Date.now()}-1`,
                    type: "text",
                    eyebrow: "Dedicated Faculty",
                    title: "Practicing Healthcare & Education Assessors",
                    content:
                      "Every learner is paired with an experienced UK tutor offering continuous coursework guidance without exam pressure.",
                  },
                  {
                    id: `w-icon-${Date.now()}-2`,
                    type: "icon_box",
                    icon: "shield-check",
                    title: "Ofqual Regulated Criteria",
                    content:
                      "Recognized national occupational standards across England and Wales.",
                    badge: "Accredited",
                  },
                  {
                    id: `w-btn-${Date.now()}-3`,
                    type: "cta_button",
                    buttonText: "Speak with an Advisor",
                    buttonLink: "/book",
                    secondaryButtonText: "Browse Syllabi",
                    secondaryButtonLink: "/courses",
                  },
                ],
              },
              {
                id: "col-2",
                widgets: [
                  {
                    id: `w-img-${Date.now()}-4`,
                    type: "image",
                    imageUrl: "/images/adult-care-training.jpg",
                    imageAlt: "Adult care vocational workshop",
                    aspectRatio: "portrait",
                    useArcMask: true,
                  },
                ],
              },
            ]
          : undefined,
    };

    const newSections = [...activeSections];
    if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= activeSections.length) {
      newSections.splice(insertIndex, 0, newSec);
    } else {
      newSections.push(newSec);
    }

    setActiveSections(newSections);
    setSelectedSectionId(newSec.id);
    setSidebarTab("inspect");
    setToastNotice(`Added "${newSec.name}" to the canvas.`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const insertTemplateAt = (tmpl: BuilderSection, insertIndex?: number) => {
    const newSec: BuilderSection = {
      ...JSON.parse(JSON.stringify(tmpl)),
      id: `sec-comp-${Date.now().toString().slice(-4)}`,
    };
    const newSections = [...activeSections];
    if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= activeSections.length) {
      newSections.splice(insertIndex, 0, newSec);
    } else {
      newSections.push(newSec);
    }
    setActiveSections(newSections);
    setSelectedSectionId(newSec.id);
    setSidebarTab("inspect");
    setToastNotice(`Inserted template "${tmpl.name}" onto canvas.`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const addMicroWidget = (colIdx: number, type: CompositeWidgetType) => {
    if (!selectedSection || selectedSection.type !== "composite_block") return;
    const currentCols = selectedSection.compositeColumns
      ? [...selectedSection.compositeColumns]
      : Array.from({ length: selectedSection.columns || 2 }).map((_, i) => ({
          id: `col-${i + 1}`,
          widgets: [],
        }));

    while (currentCols.length <= colIdx) {
      currentCols.push({ id: `col-${currentCols.length + 1}`, widgets: [] });
    }

    const defaultWidget: CompositeWidget = {
      id: `w-${type}-${Date.now().toString().slice(-4)}`,
      type,
      title:
        type === "icon_box"
          ? "New Feature Guarantee"
          : type === "lead_form"
          ? "Request Free Callback"
          : type === "stats_metric"
          ? "First-Time Pass Rate"
          : type === "quote_card"
          ? "Student Testimonial"
          : type === "checklist"
          ? "Course Key Features"
          : "New Content Element",
      eyebrow:
        type === "text"
          ? "Verified Quality"
          : type === "stats_metric"
          ? "Verified Metric"
          : undefined,
      content:
        type === "text"
          ? "Describe your course benefits, tutor mentoring, or cohort timelines."
          : type === "icon_box"
          ? "Detailed explanation of this British training credential."
          : type === "quote_card"
          ? "The tutor feedback was detailed and fast. Studying online while working 12-hour shifts made completing my Level 3 possible."
          : type === "stats_metric"
          ? "Based on 2025/2026 external qualification assessment submissions."
          : undefined,
      icon: "shield-check",
      imageUrl: "/images/adult-care-training.jpg",
      imageAlt: "College learner training",
      aspectRatio: "video",
      buttonText: "Book Free Consultation",
      buttonLink: "/book",
      secondaryButtonText: "View Diplomas",
      secondaryButtonLink: "/courses",
      videoUrl: "",
      badge: "Accredited",
      statNumber: "98%",
      statLabel: "First-Time Pass Rate",
      quoteAuthor: "Sarah Jenkins",
      quoteRole: "Senior Healthcare Assistant, NHS Trust",
      rating: 5,
      checklistItems: [
        "100% coursework assessment with no written exams",
        "Dedicated 1-on-1 certified assessor support",
        "Flexible study hours around shift rotas",
        "Spread tuition over 6 or 12 months with 0% interest",
      ],
      badgeList: [
        "NCFE CACHE Regulated",
        "TQUK Approved Centre",
        "Ofqual Regulated Framework",
        "100% Coursework Assessment",
      ],
      formFields: {
        showName: true,
        showPhone: true,
        showEmail: true,
        showCourse: true,
        buttonLabel: "Submit Consultation Request",
      },
    };

    currentCols[colIdx] = {
      ...currentCols[colIdx],
      widgets: [...(currentCols[colIdx].widgets || []), defaultWidget],
    };

    updateSelectedField("compositeColumns", currentCols);
    setActiveWidgetEditId(defaultWidget.id);
    setShowAddWidgetMenu(null);
    setToastNotice(`Added ${type.replace("_", " ")} to Column ${colIdx + 1}.`);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const updateMicroWidget = (
    colIdx: number,
    wIdx: number,
    field: string,
    value: any
  ) => {
    if (!selectedSection || selectedSection.type !== "composite_block") return;
    const currentCols = [...(selectedSection.compositeColumns || [])];
    if (!currentCols[colIdx] || !currentCols[colIdx].widgets[wIdx]) return;

    const newWidgets = [...currentCols[colIdx].widgets];
    newWidgets[wIdx] = {
      ...newWidgets[wIdx],
      [field]: value,
    };
    currentCols[colIdx] = {
      ...currentCols[colIdx],
      widgets: newWidgets,
    };
    updateSelectedField("compositeColumns", currentCols);
  };

  const removeMicroWidget = (colIdx: number, wIdx: number) => {
    if (!selectedSection || selectedSection.type !== "composite_block") return;
    const currentCols = [...(selectedSection.compositeColumns || [])];
    if (!currentCols[colIdx]) return;

    const newWidgets = currentCols[colIdx].widgets.filter((_, i) => i !== wIdx);
    currentCols[colIdx] = {
      ...currentCols[colIdx],
      widgets: newWidgets,
    };
    updateSelectedField("compositeColumns", currentCols);
  };

  const moveMicroWidget = (
    colIdx: number,
    wIdx: number,
    dir: "up" | "down"
  ) => {
    if (!selectedSection || selectedSection.type !== "composite_block") return;
    const currentCols = [...(selectedSection.compositeColumns || [])];
    if (!currentCols[colIdx]) return;

    const widgets = [...currentCols[colIdx].widgets];
    const targetIdx = dir === "up" ? wIdx - 1 : wIdx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;

    const [moved] = widgets.splice(wIdx, 1);
    widgets.splice(targetIdx, 0, moved);
    currentCols[colIdx] = {
      ...currentCols[colIdx],
      widgets,
    };
    updateSelectedField("compositeColumns", currentCols);
  };

  const setCompositeColumnsCount = (count: 1 | 2 | 3 | 4) => {
    if (!selectedSection || selectedSection.type !== "composite_block") return;
    const currentCols = [...(selectedSection.compositeColumns || [])];
    while (currentCols.length < count) {
      currentCols.push({ id: `col-${currentCols.length + 1}`, widgets: [] });
    }
    updateSelectedField("columns", count);
    updateSelectedField("compositeColumns", currentCols.slice(0, count));
  };

  const saveCurrentAsTemplate = () => {
    if (!selectedSection) return;
    const templateName = prompt(
      "Enter a name for this reusable widget template:",
      selectedSection.name || "Custom Composite Template"
    );
    if (!templateName || !templateName.trim()) return;

    const newTmpl: BuilderSection = {
      ...JSON.parse(JSON.stringify(selectedSection)),
      id: `tmpl-user-${Date.now().toString().slice(-4)}`,
      name: templateName.trim(),
      templateCategory: "Super Admin Saved",
      templateDesc: `Custom pre-assembled widget created by Super Admin with ${
        selectedSection.columns || 2
      } columns.`,
    };

    setSavedTemplates((prev) => [newTmpl, ...prev]);
    setToastNotice(`Saved "${templateName.trim()}" to reusable template library!`);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const deleteSavedTemplate = (tmplId: string) => {
    if (typeof window !== "undefined" && !window.confirm("Remove this reusable template from the library?")) {
      return;
    }
    setSavedTemplates((prev) => prev.filter((t) => t.id !== tmplId));
    setToastNotice("Template removed from library.");
    setTimeout(() => setToastNotice(null), 3000);
  };

  const updateSelectedField = (field: keyof BuilderSection, value: any) => {
    if (!selectedSectionId) return;
    setActiveSections((prev) =>
      prev.map((s) => (s.id === selectedSectionId ? { ...s, [field]: value } : s))
    );
  };

  const updateItemField = (
    index: number,
    field: keyof BuilderSectionItem,
    value: any
  ) => {
    if (!selectedSectionId || !selectedSection) return;
    const baseItems =
      selectedSection.items && selectedSection.items.length > 0
        ? [...selectedSection.items]
        : [...getDefaultItemsForSection(selectedSection.type)];
    while (baseItems.length <= index) {
      baseItems.push({
        title:
          selectedSection.type === "staff_training"
            ? `Corporate Benefit #${baseItems.length + 1}`
            : selectedSection.type === "coral_promo"
            ? `Bullet #${baseItems.length + 1}`
            : `Card #${baseItems.length + 1}`,
      });
    }
    baseItems[index] = { ...baseItems[index], [field]: value };
    updateSelectedField("items", baseItems);
  };

  const addItemToSelected = () => {
    if (!selectedSectionId) return;
    const currentItems = selectedSection?.items || [];

    if (selectedSection?.type === "faq_accordion") {
      const newItem: BuilderSectionItem = {
        title: "New Frequently Asked Question",
        desc: "Provide clear, authentic information explaining course entry criteria, lesson recordings, or accreditation.",
        tag: "General",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "trust_strip") {
      const newItem: BuilderSectionItem = {
        title: "New Awarding Body",
        desc: "Approved Centre",
        icon: "shield-check",
        tag: "Accredited",
        link: "https://www.gov.uk",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "choose_path") {
      const newItem: BuilderSectionItem = {
        title: "New Career Pathway",
        subtitle: "Career Role or Progression Level",
        desc: "Ofqual-regulated qualification preparing you for leadership and specialist roles.",
        icon: "shield-check",
        badge: "Level 3",
        tag: "Regulated",
        link: "/courses",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "how_it_works") {
      const stepNum = currentItems.length + 1;
      const newItem: BuilderSectionItem = {
        number: stepNum < 10 ? `0${stepNum}` : `${stepNum}`,
        title: `Step ${stepNum} Title`,
        subtitle: "Clear step guidance",
        desc: "Explain the admissions process, live classes, portfolio submissions, or certification.",
        badge: "Step milestone",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "pricing") {
      const optNum = currentItems.length + 1;
      const newItem: BuilderSectionItem = {
        number: optNum < 10 ? `Option 0${optNum}` : `Option ${optNum}`,
        title: "New Payment Option",
        subtitle: "Clear, transparent tuition term",
        desc: "Explain discounts, zero interest instalment terms, or funding qualification criteria.",
        badge: "Flexible Plan",
        bullets: [
          "Key feature or student saving",
          "Includes all assessment and verification fees",
        ],
        link: "/courses",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "testimonials") {
      const newItem: BuilderSectionItem = {
        title: "Graduate Name",
        subtitle: "Course Title / Current Promotion",
        desc: "Authentic student review describing their live evening teaching experience, tutor support, and career outcome.",
        image: "/images/hero-learner.jpg",
        rating: 5,
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "exclusive_bundles") {
      const newItem: BuilderSectionItem = {
        title: "New Qualification Bundle",
        desc: "Combine dual certifications with instant package savings and accelerated tutor feedback.",
        tag: "Special Offer",
        price: "£1,250",
        originalPrice: "£1,600",
        link: "/book",
        image: "/images/adult-care-training.jpg",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "staff_training") {
      const newItem: BuilderSectionItem = {
        title: "New Corporate Benefit",
        desc: "Bespoke cohort timetables and dedicated assessor liaison for registered managers.",
        tag: "Workforce",
        icon: "shield-check",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "coral_promo") {
      const newItem: BuilderSectionItem = {
        title: "New Promotional Highlight",
        desc: "Instant enrolment and 0% interest flexible payment options.",
        icon: "check-circle",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "student_benefits") {
      const newItem: BuilderSectionItem = {
        title: "New Student Perk",
        desc: "Official British college credentials and around-the-clock recorded lecture access.",
        icon: "credit-card",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    if (selectedSection?.type === "why_smartminds") {
      const pillColors = ["mint", "peach", "lavender", "sky"] as const;
      const iconColors = ["emerald", "amber", "purple", "cyan"] as const;
      const nextIndex = currentItems.length % 4;
      const newItem: BuilderSectionItem = {
        title: "New Learning Approach Feature",
        desc: "Structured qualification modules and comprehensive British curricula tailored for career progression.",
        icon: "check-circle",
        cardBg: pillColors[nextIndex],
        iconColor: iconColors[nextIndex],
        titleColor: "navy",
      };
      updateSelectedField("items", [...currentItems, newItem]);
      return;
    }

    const newItem: BuilderSectionItem = {
      title: "New Highlight / Feature Card",
      desc: "Detailed description of the requirement, benefit, or answer.",
      tag: "Feature",
      icon: "check-circle",
    };
    updateSelectedField("items", [...currentItems, newItem]);
  };

  const removeItemFromSelected = (index: number) => {
    if (!selectedSectionId || !selectedSection?.items) return;
    const newItems = selectedSection.items.filter((_, i) => i !== index);
    updateSelectedField("items", newItems);
  };

  const moveItemInSelected = (index: number, direction: "up" | "down") => {
    if (!selectedSectionId || !selectedSection?.items) return;
    const items = [...selectedSection.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    updateSelectedField("items", items);
  };

  const handlePublishPage = () => {
    startTransition(async () => {
      try {
        let success = false;
        let errorMessage = "";

        // 1. Primary: Call dedicated REST API route (immune to server action build hash mismatches)
        try {
          const apiRes = await fetch("/api/admin/cms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "publish_page",
              pagePath: activePagePath,
              sections: activeSections,
              headerNav,
              footerConfig,
            }),
          });
          const json = await apiRes.json();
          if (apiRes.ok && json.success) {
            success = true;
          } else if (apiRes.status === 401) {
            alert("Your session has expired or Director/Owner privileges are required. Please log in as College Director (Millie Davis) or Super Admin.");
            return;
          } else {
            errorMessage = json.error || "Failed to publish page via API.";
          }
        } catch (fetchErr) {
          console.warn("[CMS Editor] API route unreachable, falling back to Server Action:", fetchErr);
        }

        // 2. Secondary fallback: Server Action
        if (!success) {
          try {
            const result = await saveVisualBuilderSectionsAction(
              activeSections,
              activePagePath,
              headerNav,
              footerConfig
            );
            if (result.success) {
              success = true;
            } else if ((result as any)?.unauthorized || (result as any)?.sessionExpired) {
              alert("Your session has expired or Director/Owner privileges are required. Please log in as College Director (Millie Davis) or Super Admin.");
              return;
            } else {
              errorMessage = (result as any)?.error || errorMessage || "Failed to publish changes.";
            }
          } catch (saErr: any) {
            errorMessage = saErr?.message || errorMessage;
          }
        }

        if (success) {
          try {
            localStorage.removeItem(`smartminds_cms_draft_${activePagePath}`);
            localStorage.setItem("smartminds_last_published", Date.now().toString());
            window.dispatchEvent(new Event("smartminds_cms_published"));
          } catch {}
          publishedSnapshotsRef.current[activePagePath] = JSON.stringify(activeSections);
          delete lastSavedDraftSnapshotRef.current[activePagePath];
          setServerDrafts((prev) => {
            const next = { ...prev };
            delete next[activePagePath];
            return next;
          });
          setDraftStatus({ text: "Published to Live", isSaving: false });
          setToastNotice(`"${activePageObj.name}" and site navigation published live successfully!`);
          router.refresh();
          setTimeout(() => setToastNotice(null), 5000);
        } else {
          alert(errorMessage || "Failed to publish changes. Please refresh and try again.");
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to publish changes.");
      }
    });
  };

  const handleSaveHeaderNav = () => {
    startTransition(async () => {
      try {
        let success = false;
        try {
          const apiRes = await fetch("/api/admin/cms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_header",
              headerNav,
            }),
          });
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.success) success = true;
          }
        } catch {}

        if (!success) {
          const result = await saveHeaderNavConfigAction(headerNav);
          if (result.success) success = true;
        }

        if (success) {
          router.refresh();
          try {
            localStorage.setItem("smartminds_last_published", Date.now().toString());
            window.dispatchEvent(new Event("smartminds_cms_published"));
          } catch {}
          setToastNotice("Navigation menu and header updated successfully!");
          setTimeout(() => setToastNotice(null), 5000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to save header nav.");
      }
    });
  };

  const handleSaveGlobalContent = () => {
    startTransition(async () => {
      try {
        const result = await saveSiteCmsContentAction(globalContent);
        if (result.success) {
          router.refresh();
          try {
            localStorage.setItem("smartminds_last_published", Date.now().toString());
            window.dispatchEvent(new Event("smartminds_cms_published"));
          } catch {}
          setToastNotice("College contact details and announcements saved!");
          setTimeout(() => setToastNotice(null), 5000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to save global copy.");
      }
    });
  };

  const handleResetDefault = () => {
    if (
      confirm(
        `Reset "${activePageObj.name}" layout to standard accredited college prospectus design?`
      )
    ) {
      const resetSections = collegePagesData[activePagePath] || defaultPageBuilderSections;
      setActiveSections([...resetSections]);
      setSelectedSectionId(resetSections[0]?.id || "");
      setToastNotice(`Reset "${activePageObj.name}" to default.`);
      setTimeout(() => setToastNotice(null), 3000);
    }
  };

  // Nav menu handlers
  const moveNavLink = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= headerNav.navLinks.length) return;
    const newLinks = [...headerNav.navLinks];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);
    setHeaderNav({ ...headerNav, navLinks: newLinks });
  };

  const updateNavLink = (index: number, field: "label" | "href", val: string) => {
    const newLinks = [...headerNav.navLinks];
    newLinks[index] = { ...newLinks[index], [field]: val };
    setHeaderNav({ ...headerNav, navLinks: newLinks });
  };

  const addNavLink = () => {
    const newLink = {
      id: `nav-${Date.now().toString().slice(-4)}`,
      label: "New Link",
      href: "/courses",
    };
    setHeaderNav({ ...headerNav, navLinks: [...headerNav.navLinks, newLink] });
  };

  const removeNavLink = (index: number) => {
    const newLinks = headerNav.navLinks.filter((_, i) => i !== index);
    setHeaderNav({ ...headerNav, navLinks: newLinks });
  };

  const addNavChild = (parentIndex: number) => {
    const newLinks = [...headerNav.navLinks];
    const parent = newLinks[parentIndex];
    const children = parent.children ? [...parent.children] : [];
    children.push({
      id: `sub-${Date.now().toString().slice(-4)}`,
      label: "New Prospectus Course",
      href: "/courses",
      desc: "Accredited British qualification pathway.",
      badge: "Level 3",
    });
    newLinks[parentIndex] = { ...parent, children };
    setHeaderNav({ ...headerNav, navLinks: newLinks });
    setToastNotice(`Added dropdown sub-menu item to "${parent.label}".`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const updateNavChild = (
    parentIndex: number,
    childIndex: number,
    field: "label" | "href" | "desc" | "badge",
    val: string
  ) => {
    const newLinks = [...headerNav.navLinks];
    const parent = newLinks[parentIndex];
    if (!parent.children) return;
    const children = [...parent.children];
    children[childIndex] = { ...children[childIndex], [field]: val };
    newLinks[parentIndex] = { ...parent, children };
    setHeaderNav({ ...headerNav, navLinks: newLinks });
  };

  const removeNavChild = (parentIndex: number, childIndex: number) => {
    const newLinks = [...headerNav.navLinks];
    const parent = newLinks[parentIndex];
    if (!parent.children) return;
    const children = parent.children.filter((_, i) => i !== childIndex);
    newLinks[parentIndex] = {
      ...parent,
      children: children.length > 0 ? children : undefined,
    };
    setHeaderNav({ ...headerNav, navLinks: newLinks });
  };

  const moveNavChild = (
    parentIndex: number,
    childIndex: number,
    direction: "up" | "down"
  ) => {
    const newLinks = [...headerNav.navLinks];
    const parent = newLinks[parentIndex];
    if (!parent.children) return;
    const targetIndex = direction === "up" ? childIndex - 1 : childIndex + 1;
    if (targetIndex < 0 || targetIndex >= parent.children.length) return;
    const children = [...parent.children];
    const [moved] = children.splice(childIndex, 1);
    children.splice(targetIndex, 0, moved);
    newLinks[parentIndex] = { ...parent, children };
    setHeaderNav({ ...headerNav, navLinks: newLinks });
  };

  // Footer handlers
  const handleSaveFooter = () => {
    startTransition(async () => {
      try {
        const result = await saveFooterConfigAction(footerConfig);
        if (result.success) {
          setToastNotice("Footer settings & links published successfully!");
          setTimeout(() => setToastNotice(null), 5000);
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to save footer.");
      }
    });
  };

  const updateFooterLink = (
    type: "explore" | "college",
    index: number,
    field: "label" | "href",
    val: string
  ) => {
    if (type === "explore") {
      const newLinks = [...footerConfig.exploreLinks];
      newLinks[index] = { ...newLinks[index], [field]: val };
      setFooterConfig({ ...footerConfig, exploreLinks: newLinks });
    } else {
      const newLinks = [...footerConfig.collegeLinks];
      newLinks[index] = { ...newLinks[index], [field]: val };
      setFooterConfig({ ...footerConfig, collegeLinks: newLinks });
    }
  };

  const addFooterLink = (type: "explore" | "college") => {
    if (type === "explore") {
      const newLink = {
        id: `f-exp-${Date.now().toString().slice(-4)}`,
        label: "New Qualification",
        href: "/courses",
      };
      setFooterConfig({
        ...footerConfig,
        exploreLinks: [...footerConfig.exploreLinks, newLink],
      });
    } else {
      const newLink = {
        id: `f-col-${Date.now().toString().slice(-4)}`,
        label: "New College Link",
        href: "/about",
      };
      setFooterConfig({
        ...footerConfig,
        collegeLinks: [...footerConfig.collegeLinks, newLink],
      });
    }
  };

  const removeFooterLink = (type: "explore" | "college", index: number) => {
    if (type === "explore") {
      const newLinks = footerConfig.exploreLinks.filter((_, i) => i !== index);
      setFooterConfig({ ...footerConfig, exploreLinks: newLinks });
    } else {
      const newLinks = footerConfig.collegeLinks.filter((_, i) => i !== index);
      setFooterConfig({ ...footerConfig, collegeLinks: newLinks });
    }
  };

  // Accreditation Badges helpers
  const addAccreditationBadge = () => {
    const current = footerConfig.accreditations || [];
    const newBadge = {
      id: `acc-${Date.now().toString().slice(-4)}`,
      title: "New Body",
      desc: "Accredited",
      icon: "award",
      link: "",
    };
    setFooterConfig({
      ...footerConfig,
      accreditations: [...current, newBadge],
    });
  };

  const updateAccreditationBadge = (
    index: number,
    field: string,
    val: string
  ) => {
    const current = [...(footerConfig.accreditations || [])];
    current[index] = { ...current[index], [field]: val };
    setFooterConfig({ ...footerConfig, accreditations: current });
  };

  const removeAccreditationBadge = (index: number) => {
    const current = (footerConfig.accreditations || []).filter((_, i) => i !== index);
    setFooterConfig({ ...footerConfig, accreditations: current });
  };

  const moveAccreditationBadge = (index: number, direction: "up" | "down") => {
    const current = [...(footerConfig.accreditations || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= current.length) return;
    const [moved] = current.splice(index, 1);
    current.splice(target, 0, moved);
    setFooterConfig({ ...footerConfig, accreditations: current });
  };

  const resetAccreditationBadges = () => {
    setFooterConfig({
      ...footerConfig,
      accreditations: [
        { id: "acc-1", title: "ofqual", desc: "Regulated", icon: "ofqual" },
        { id: "acc-2", title: "TQUK", desc: "Approved Centre", icon: "tquk" },
        { id: "acc-3", title: "THE CPD GROUP", desc: "Accredited Provider", icon: "cpd" },
        { id: "acc-4", title: "Skills for Health", desc: "NOS Aligned", icon: "health" },
        { id: "acc-5", title: "UKRLP", desc: "Registered Provider", icon: "ukrlp" },
      ],
    });
    setToastNotice("Reset to 5 official UK accreditation badges.");
    setTimeout(() => setToastNotice(null), 3000);
  };

  const clearAllAccreditationBadges = () => {
    setFooterConfig({
      ...footerConfig,
      accreditations: [],
    });
    setToastNotice("Cleared all accreditation badges.");
    setTimeout(() => setToastNotice(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden fixed inset-0 z-50">
      {/* 1. Elementor / Wix Top Control Bar */}
      <header className="h-14 bg-navy-900 border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between text-white flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 shadow-xs"
            title="Exit Editor and return to Admin Dashboard"
          >
            <Icon name="arrow-left" size={14} />
            <span>Exit to Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Page Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPageDropdown(!showPageDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-navy-950/80 hover:bg-navy-950 text-white text-xs font-semibold border border-white/20 transition-all shadow-inner"
            >
              <Icon name={activePageObj.iconName || "layers"} size={14} className="text-gold-300" />
              <span className="font-heading font-bold tracking-wide">
                Page: {activePageObj.name}
              </span>
              <span className="text-[10px] text-gold-300 font-mono">
                ({activePageObj.path})
              </span>
              <Icon name="chevron-down" size={12} className="opacity-70 ml-1" />
            </button>

            {showPageDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-sm shadow-2xl border border-line py-1.5 z-50 text-navy-900 animate-fade-in max-h-[80vh] flex flex-col">
                <div className="px-3 py-1.5 text-[10px] font-mono text-ink-soft uppercase tracking-wider border-b border-line flex items-center justify-between">
                  <span>Website Pages ({pagesList.length})</span>
                  <span className="text-[9px] bg-paper px-1.5 py-0.5 rounded-sm border border-line text-ink-soft">
                    Select to Edit
                  </span>
                </div>
                <div className="overflow-y-auto max-h-64 py-1">
                  {pagesList.map((p) => {
                    const isCurrent = p.path === activePagePath;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActivePagePath(p.path);
                          setSelectedSectionId(
                            (pagesSections[p.path] || defaultPageBuilderSections)[0]?.id || ""
                          );
                          setShowPageDropdown(false);
                          setToastNotice(`Switched editor to "${p.name}".`);
                          setTimeout(() => setToastNotice(null), 2500);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors group cursor-pointer ${
                          isCurrent
                            ? "bg-navy-50 font-bold text-navy-900 border-l-4 border-navy-900"
                            : "text-ink hover:bg-paper"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span
                            className={`p-1.5 rounded-sm shrink-0 ${
                              isCurrent ? "bg-navy-900 text-gold-300" : "bg-navy-100 text-navy-900"
                            }`}
                          >
                            <Icon name={p.iconName || "layers"} size={13} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <strong className="block leading-tight truncate">{p.name}</strong>
                              {p.isSystem ? (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded-xs bg-slate-100 text-ink-soft border border-line shrink-0">
                                  Core
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded-xs bg-gold-100 text-gold-800 border border-gold-300 shrink-0">
                                  Custom
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-ink-soft font-mono block truncate">
                              {p.path}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-navy-900 text-gold-300 font-bold">
                              Active
                            </span>
                          )}
                          {!p.isSystem && (
                            <button
                              type="button"
                              onClick={(e) => handleDeletePage(p, e)}
                              title={`Delete page "${p.name}"`}
                              className="p-1 rounded-sm text-ink-soft hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Icon name="trash" size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-2 border-t border-line bg-paper/50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPageDropdown(false);
                      setShowCreatePageModal(true);
                    }}
                    className="w-full py-2 px-3 bg-navy-900 hover:bg-navy-800 text-white rounded-sm text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 group"
                  >
                    <Icon
                      name="plus"
                      size={13}
                      className="text-gold-300 group-hover:rotate-90 transition-transform"
                    />
                    <span>+ Create New Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Page Button */}
          <button
            type="button"
            onClick={() => setShowCreatePageModal(true)}
            className="px-2.5 py-1.5 rounded-sm bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 hover:text-gold-200 text-xs font-semibold flex items-center gap-1.5 border border-gold-500/30 transition-all shadow-xs"
            title="Create a new web page or campaign route"
          >
            <Icon name="plus" size={13} />
            <span className="hidden md:inline">New Page</span>
          </button>
        </div>

        {/* Viewport Switcher (Desktop, Tablet, Mobile) */}
        <div className="flex items-center bg-navy-950/80 rounded-sm p-1 border border-white/10 shadow-inner">
          <button
            onClick={() => setViewport("desktop")}
            title="Desktop View (Full Screen)"
            className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewport === "desktop"
                ? "bg-navy-700 text-white shadow-xs"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Icon name="monitor" size={13} />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewport("tablet")}
            title="Tablet View (768px iPad)"
            className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewport === "tablet"
                ? "bg-navy-700 text-white shadow-xs"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Icon name="tablet" size={13} />
            <span>Tablet (768px)</span>
          </button>
          <button
            onClick={() => setViewport("mobile")}
            title="Mobile View (390px iPhone)"
            className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewport === "mobile"
                ? "bg-navy-700 text-white shadow-xs"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Icon name="smartphone" size={13} />
            <span>Mobile (390px)</span>
          </button>
        </div>

        {/* Undo & Redo Controls */}
        <div className="flex items-center bg-navy-950/80 rounded-sm p-1 border border-white/10 shadow-inner gap-0.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyPast.length === 0}
            title="Undo last change (Ctrl+Z)"
            className="px-2.5 py-1 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Icon name="undo" size={13} />
            <span className="hidden xl:inline text-[11px]">Undo</span>
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyFuture.length === 0}
            title="Redo change (Ctrl+Y or Ctrl+Shift+Z)"
            className="px-2.5 py-1 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Icon name="redo" size={13} />
            <span className="hidden xl:inline text-[11px]">Redo</span>
          </button>
        </div>

        {/* Action Controls & Server Draft Management */}
        <div className="flex items-center gap-2">
          {/* Server Draft Status Badge */}
          {serverDrafts[activePagePath] ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-400/40 rounded-sm text-amber-300 text-[11px] font-mono shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{draftStatus.text}</span>
              </div>
              <button
                type="button"
                onClick={handleDiscardDraft}
                disabled={isPending}
                className="px-2.5 py-1 text-xs text-rose-300 hover:text-white hover:bg-rose-950/60 rounded-sm border border-rose-500/40 transition-colors disabled:opacity-50 cursor-pointer"
                title="Discard unpublished working draft and revert to live published page"
              >
                Discard Draft
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-400/30 rounded-sm text-emerald-300 text-[11px] font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{draftStatus.text}</span>
            </div>
          )}

          <button
            onClick={handleResetDefault}
            className="px-3 py-1.5 rounded-sm text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Reset Page
          </button>
          <Link
            href={activePagePath}
            target="_blank"
            className="px-3 py-1.5 rounded-sm border border-white/20 text-xs font-semibold hover:bg-white/10 transition-colors text-white inline-flex items-center gap-1"
          >
            <Icon name="external-link" size={13} />
            <span>View Live Page</span>
          </Link>
          <button
            onClick={handlePublishPage}
            disabled={isPending}
            className="px-4 py-1.5 rounded-sm bg-gold-500 hover:bg-gold-300 text-navy-900 text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="check" size={14} />
            <span>{isPending ? "Publishing..." : "Publish to Live"}</span>
          </button>
        </div>
      </header>

      {/* Toast Feedback */}
      {toastNotice && (
        <div className="absolute top-16 right-6 z-50 p-3 bg-emerald-900 text-white border border-emerald-500/50 rounded-sm text-xs flex items-center gap-2 shadow-xl animate-fade-in">
          <Icon name="check-circle" size={16} className="text-emerald-300" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Create New Page Modal Dialog */}
      {showCreatePageModal && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setShowCreatePageModal(false)}
        >
          <div
            className="bg-white rounded-md max-w-xl w-full border border-line shadow-2xl overflow-hidden flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-navy-900 px-6 py-4 border-b border-navy-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-sm bg-navy-800 text-gold-300 border border-navy-700">
                  <Icon name="plus" size={16} />
                </span>
                <div>
                  <h2 className="text-base font-bold font-heading tracking-wide text-white">
                    Create New Page
                  </h2>
                  <p className="text-[11px] text-white/70">
                    Configure route URL slug, select a starter blueprint, and publish instantly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePageModal(false)}
                className="p-1.5 text-white/60 hover:text-white rounded-sm hover:bg-white/10 transition-colors"
                title="Close dialog"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewPage} className="flex flex-col">
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* 1. Page Name */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase font-mono tracking-wider mb-1.5">
                    Page Title / Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => handlePageNameChange(e.target.value)}
                    placeholder="e.g. Safeguarding & Welfare Policy, or Employer Partnerships"
                    required
                    className="w-full px-3 py-2 text-xs border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-navy-900 text-ink bg-white font-medium"
                  />
                  <span className="text-[10px] text-ink-soft mt-1 block">
                    The public title displayed in the browser tab and page header.
                  </span>
                </div>

                {/* 2. Page URL Route Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-navy-900 uppercase font-mono tracking-wider">
                      Page URL Route (Slug) <span className="text-red-500">*</span>
                    </label>
                    {isSlugManuallyEdited && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSlugManuallyEdited(false);
                          const generated = formatSlug(newPageName);
                          setNewPageSlug(generated);
                          validateSlug(generated);
                        }}
                        className="text-[10px] text-navy-900 hover:text-gold-700 underline font-semibold cursor-pointer"
                      >
                        Reset to auto-slug
                      </button>
                    )}
                  </div>
                  <div className="flex items-center rounded-sm border border-line focus-within:ring-2 focus-within:ring-navy-900 focus-within:border-navy-900 overflow-hidden bg-white text-xs">
                    <span className="bg-paper px-3 py-2 text-ink-soft border-r border-line font-mono text-[11px] select-none shrink-0">
                      smartminds.co.uk
                    </span>
                    <input
                      type="text"
                      value={newPageSlug}
                      onChange={(e) => handlePageSlugChange(e.target.value)}
                      placeholder="/safeguarding-policy"
                      required
                      className="w-full px-3 py-2 text-xs focus:outline-none text-ink font-mono"
                    />
                  </div>
                  {slugError ? (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-[11px] font-medium">
                      <Icon name="alert-circle" size={12} />
                      <span>{slugError}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-ink-soft mt-1 block">
                      Accessible directly at <code className="text-navy-900 font-mono">{newPageSlug || "/your-slug"}</code> once published.
                    </span>
                  )}
                </div>

                {/* 3. Starter Blueprint / Template Selection */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase font-mono tracking-wider mb-2">
                    Choose Starter Layout Blueprint
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option A: Standard Information */}
                    <div
                      onClick={() => setNewPageBlueprint("standard")}
                      className={`p-3 rounded-sm border text-left cursor-pointer transition-all ${
                        newPageBlueprint === "standard"
                          ? "border-navy-900 bg-navy-50/70 ring-1 ring-navy-900 shadow-xs"
                          : "border-line bg-white hover:border-navy-900/40 hover:bg-paper"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="file-text" size={14} className="text-navy-900 shrink-0" />
                        <span className="text-xs font-bold text-navy-900">Standard Information</span>
                      </div>
                      <p className="text-[10px] text-ink-soft leading-relaxed">
                        Lead Hero, 3 Pillars of Excellence, FAQ Accordion, and Advisory CTA.
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-mono bg-navy-100 text-navy-900 px-1.5 py-0.5 rounded-xs">
                        Policies & Guides
                      </span>
                    </div>

                    {/* Option B: Campaign / Intake */}
                    <div
                      onClick={() => setNewPageBlueprint("campaign")}
                      className={`p-3 rounded-sm border text-left cursor-pointer transition-all ${
                        newPageBlueprint === "campaign"
                          ? "border-navy-900 bg-navy-50/70 ring-1 ring-navy-900 shadow-xs"
                          : "border-line bg-white hover:border-navy-900/40 hover:bg-paper"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="sparkles" size={14} className="text-gold-600 shrink-0" />
                        <span className="text-xs font-bold text-navy-900">Campaign / Lead Capture</span>
                      </div>
                      <p className="text-[10px] text-ink-soft leading-relaxed">
                        Urgent Lead Hero, Accreditation Trust Strip, Key Metrics, Reviews, and Callback Form.
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-mono bg-gold-100 text-gold-800 px-1.5 py-0.5 rounded-xs">
                        Marketing & Intake
                      </span>
                    </div>

                    {/* Option C: Blank Canvas */}
                    <div
                      onClick={() => setNewPageBlueprint("blank")}
                      className={`p-3 rounded-sm border text-left cursor-pointer transition-all ${
                        newPageBlueprint === "blank"
                          ? "border-navy-900 bg-navy-50/70 ring-1 ring-navy-900 shadow-xs"
                          : "border-line bg-white hover:border-navy-900/40 hover:bg-paper"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="layers" size={14} className="text-navy-900 shrink-0" />
                        <span className="text-xs font-bold text-navy-900">Blank Canvas</span>
                      </div>
                      <p className="text-[10px] text-ink-soft leading-relaxed">
                        Clean starter header. Build section-by-section using the Elementor widget palette.
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-mono bg-slate-100 text-ink-soft px-1.5 py-0.5 rounded-xs">
                        Custom Build
                      </span>
                    </div>

                    {/* Option D: Clone Existing */}
                    <div
                      onClick={() => setNewPageBlueprint("clone")}
                      className={`p-3 rounded-sm border text-left cursor-pointer transition-all ${
                        newPageBlueprint === "clone"
                          ? "border-navy-900 bg-navy-50/70 ring-1 ring-navy-900 shadow-xs"
                          : "border-line bg-white hover:border-navy-900/40 hover:bg-paper"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="copy" size={14} className="text-navy-900 shrink-0" />
                        <span className="text-xs font-bold text-navy-900">Clone Existing Page</span>
                      </div>
                      <p className="text-[10px] text-ink-soft leading-relaxed">
                        Duplicate all layout blocks and content from an existing published page.
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-mono bg-navy-100 text-navy-900 px-1.5 py-0.5 rounded-xs">
                        Exact Duplicate
                      </span>
                    </div>
                  </div>

                  {/* Source page selector if clone is selected */}
                  {newPageBlueprint === "clone" && (
                    <div className="mt-3 p-3 bg-paper rounded-sm border border-line">
                      <label className="block text-[11px] font-bold text-navy-900 mb-1">
                        Select Page to Clone:
                      </label>
                      <select
                        value={cloneSourcePath}
                        onChange={(e) => setCloneSourcePath(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-line rounded-sm bg-white text-navy-900 font-medium"
                      >
                        {pagesList.map((p) => (
                          <option key={p.id} value={p.path}>
                            {p.name} ({p.path})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 4. Navigation Menu Toggle */}
                <div className="pt-2 border-t border-line">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddToMenu}
                      onChange={(e) => setNewAddToMenu(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-xs border-line text-navy-900 focus:ring-navy-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-navy-900 block leading-tight">
                        Add to College Header Navigation Menu
                      </span>
                      <span className="text-[10px] text-ink-soft block leading-normal mt-0.5">
                        Automatically adds a top navigation link so students and visitors can access the page immediately.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-paper border-t border-line flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowCreatePageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPage || !!slugError}
                  className="px-5 py-2 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white rounded-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Icon name="check" size={14} className="text-gold-300" />
                  <span>{isCreatingPage ? "Creating Page..." : "Create & Open Page"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Builder Workspace: Left Elementor Sidebar + Center Live Canvas */}
      {/* Notice: min-h-0 and min-w-0 ensure flexbox activates scrolling! */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
        {/* Floating Open Panel Tab when sidebar is collapsed */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Expand Editor Controls Panel (Ctrl+P)"
            className="fixed top-16 left-3 z-40 px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-sm shadow-xl flex items-center gap-1.5 text-xs font-bold border border-gold-500/40 hover:scale-105 transition-all"
          >
            <Icon name="chevron-right" size={14} className="text-gold-500" />
            <span>Editor Panel</span>
          </button>
        )}

        {/* Left Elementor Dock Panel */}
        <aside
          className={`transition-all duration-300 ease-in-out bg-white border-r border-line flex flex-col flex-shrink-0 min-h-0 overflow-hidden z-20 shadow-md ${
            isSidebarOpen ? "w-80 sm:w-96" : "w-0 border-r-0 opacity-0 pointer-events-none"
          }`}
        >
          {/* Panel Top Header with Close Tab */}
          <div className="flex items-center justify-between p-2.5 bg-paper border-b border-line flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Icon name="layers" size={13} className="text-navy-900" />
              <span className="text-[11px] font-bold text-navy-900 uppercase font-mono tracking-wider">
                Editor Controls
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              title="Collapse Panel (Shift Canvas to Full Width)"
              className="p-1 hover:bg-slate-200/80 rounded-sm text-ink-soft hover:text-navy-900 transition-colors"
            >
              <Icon name="chevron-left" size={14} />
            </button>
          </div>
          {/* Panel Mode Switcher: Page Builder vs Global Branding */}
          <div className="p-2 bg-paper/80 border-b border-line flex-shrink-0">
            <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-sm text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setPanelCategory("page");
                  if (sidebarTab === "menu" || sidebarTab === "footer" || sidebarTab === "contact" || sidebarTab === "swatches") {
                    setSidebarTab("blocks");
                  }
                }}
                className={`py-1.5 px-2 rounded-xs transition-all flex items-center justify-center gap-1.5 ${
                  panelCategory === "page"
                    ? "bg-navy-900 text-white shadow-xs"
                    : "text-ink-soft hover:text-navy-900"
                }`}
              >
                <Icon name="layers" size={13} />
                <span>Page Layout</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanelCategory("site");
                  if (sidebarTab === "blocks" || sidebarTab === "inspect" || sidebarTab === "widgets") {
                    setSidebarTab("menu");
                  }
                }}
                className={`py-1.5 px-2 rounded-xs transition-all flex items-center justify-center gap-1.5 ${
                  panelCategory === "site"
                    ? "bg-navy-900 text-white shadow-xs"
                    : "text-ink-soft hover:text-navy-900"
                }`}
              >
                <Icon name="sparkles" size={13} />
                <span>Site Branding</span>
              </button>
            </div>
          </div>

          {/* Decluttered Sub-Tab Bar with Ample Space */}
          <div className="flex border-b border-line bg-paper text-[11px] font-semibold flex-shrink-0">
            {panelCategory === "page" ? (
              <>
                <button
                  type="button"
                  onClick={() => setSidebarTab("blocks")}
                  className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                    sidebarTab === "blocks"
                      ? "border-navy-900 text-navy-900 bg-white font-bold"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                >
                  <Icon name="menu" size={13} />
                  <span>Sections ({activeSections.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("inspect")}
                  className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                    sidebarTab === "inspect"
                      ? "border-navy-900 text-navy-900 bg-white font-bold"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                >
                  <Icon name="sparkles" size={13} />
                  <span>Inspector</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("widgets")}
                  className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                    sidebarTab === "widgets"
                      ? "border-navy-900 text-navy-900 bg-white font-bold"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                >
                  <Icon name="plus" size={13} />
                  <span>+ Add Block</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSidebarTab("menu")}
                  className={`flex-1 py-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 text-[11px] ${
                    sidebarTab === "menu"
                      ? "border-navy-900 text-navy-900 bg-white font-bold"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                  title="Header Navigation & Logo"
                >
                  <Icon name="sparkles" size={12} />
                  <span>Header</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("footer")}
                  className={`flex-1 py-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 text-[11px] ${
                    sidebarTab === "footer"
                      ? "border-navy-900 text-navy-900 bg-white font-bold"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                  title="Footer Links & Accreditations"
                >
                  <Icon name="file-text" size={12} />
                  <span>Footer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("contact")}
                  className={`flex-1 py-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 text-[11px] ${
                    sidebarTab === "contact"
                      ? "border-navy-900 text-navy-900 bg-white font-bold"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                  title="Global College Details & Legal Reference"
                >
                  <Icon name="phone" size={12} />
                  <span>Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("swatches")}
                  className={`flex-1 py-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 text-[11px] ${
                    sidebarTab === "swatches"
                      ? "border-navy-900 text-navy-900 bg-white font-bold"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                  title="Brand Color Kit & Swatches"
                >
                  <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
                  </svg>
                  <span>Color Kit</span>
                </button>
              </>
            )}
          </div>

          {/* TAB 1: Sections Navigator (Drag & Drop Hierarchy) */}
          {sidebarTab === "blocks" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-mono text-ink-soft uppercase tracking-wider block truncate">
                    {activePageObj.name} Structure
                  </span>
                  <span className="text-[10px] text-ink-soft">
                    {activeSections.length} blocks • <code className="text-navy-900 font-mono">{activePageObj.path}</code>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreatePageModal(true)}
                  className="px-2 py-1 bg-paper hover:bg-gold-50 border border-line hover:border-gold-500/60 text-navy-900 text-[10px] font-bold rounded-xs flex items-center gap-1 transition-all shadow-2xs shrink-0"
                  title="Create another new page"
                >
                  <Icon name="plus" size={11} className="text-gold-600" />
                  <span>+ New Page</span>
                </button>
              </div>

              {activeSections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;
                const isDragging = draggedSectionIndex === idx;
                const isDragOver = dragOverSectionIndex === idx;
                const isExpanded = expandedSectionIds[sec.id] ?? isSelected;
                const innerElements = getSectionInnerElements(sec);

                return (
                  <div key={sec.id} className="space-y-1">
                    <div
                      draggable
                      onDragStart={(e) => handleDragStartSection(e, idx)}
                      onDragOver={(e) => handleDragOverSection(e, idx)}
                      onDrop={(e) => handleDropOnSection(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        setSelectedSectionId(sec.id);
                        setSelectedElementKey(null);
                        setSelectedElementItemIndex(null);
                        setSidebarTab("inspect");
                      }}
                      onMouseEnter={() => setHoveredSectionId(sec.id)}
                      onMouseLeave={() => setHoveredSectionId(null)}
                      className={`p-2 rounded-sm border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-2 ${
                        isDragging
                          ? "opacity-40 border-dashed border-navy-900 bg-navy-50"
                          : isDragOver
                          ? "border-t-4 border-t-gold-500 bg-gold-50/50"
                          : isSelected
                          ? "border-navy-900 bg-navy-50/50 shadow-xs"
                          : "border-line bg-white hover:border-navy-900/40"
                      } ${!sec.enabled ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionExpanded(sec.id);
                          }}
                          className="p-1 hover:bg-navy-100 rounded text-ink-soft hover:text-navy-900 transition-colors cursor-pointer shrink-0"
                          title={isExpanded ? "Collapse block elements" : "Expand block elements"}
                        >
                          <Icon name={isExpanded ? "chevron-down" : "chevron-right"} size={11} />
                        </button>
                        <Icon
                          name="grip-vertical"
                          size={13}
                          className="text-ink-soft/40 hover:text-navy-900 flex-shrink-0"
                        />
                        <span className="font-mono text-xs text-ink-soft/70">
                          {idx + 1}.
                        </span>
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-navy-900 block truncate">
                            {sec.name}
                          </strong>
                          <span className="text-[10px] text-ink-soft uppercase font-mono">
                            {sec.type} • {innerElements.length - 1} items
                          </span>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          title="Move Up"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, "up")}
                          className="p-1 hover:bg-paper rounded-sm text-ink-soft disabled:opacity-20 text-xs"
                        >
                          <Icon name="chevron-up" size={12} />
                        </button>
                        <button
                          title="Move Down"
                          disabled={idx === activeSections.length - 1}
                          onClick={() => moveSection(idx, "down")}
                          className="p-1 hover:bg-paper rounded-sm text-ink-soft disabled:opacity-20 text-xs"
                        >
                          <Icon name="chevron-down" size={12} />
                        </button>
                        <button
                          title={sec.enabled ? "Hide Section" : "Show Section"}
                          onClick={() => toggleSectionEnabled(sec.id)}
                          className={`p-1 hover:bg-paper rounded-sm text-xs ${
                            sec.enabled ? "text-navy-900" : "text-ink-soft"
                          }`}
                        >
                          <Icon name={sec.enabled ? "eye" : "eye-off"} size={13} />
                        </button>
                        <button
                          title="Delete Section"
                          onClick={() => deleteSection(sec.id)}
                          className="p-1 hover:bg-rose-50 text-rose-700 rounded-sm text-xs"
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Nested Sub-Elements Tree View (Navigator) */}
                    {isExpanded && (
                      <div className="ml-5 pl-2.5 border-l-2 border-line/80 space-y-1 py-1">
                        {innerElements.map((el) => {
                          const isElementActive =
                            isSelected &&
                            selectedElementKey === el.key &&
                            (el.index === undefined || el.index === selectedElementItemIndex);

                          return (
                            <button
                              key={`${el.key}-${el.index ?? 0}`}
                              type="button"
                              onClick={() => {
                                setSelectedSectionId(sec.id);
                                setSelectedElementKey(el.key);
                                setSelectedElementItemIndex(el.index ?? null);
                                setSidebarTab("inspect");
                                if (el.key === "item" || el.key === "image" || el.key === "video") {
                                  setInspectorSubTab("items");
                                } else if (el.key === "bg") {
                                  setInspectorSubTab("style");
                                } else {
                                  setInspectorSubTab("content");
                                }
                              }}
                              className={`w-full px-2 py-1.5 rounded-xs text-left flex items-center justify-between gap-1 text-[11px] transition-all cursor-pointer group shadow-2xs border ${
                                isElementActive
                                  ? "bg-navy-900 text-gold-300 border-navy-900 font-bold"
                                  : "bg-white hover:bg-navy-50 text-navy-900 border-line/60"
                              }`}
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                <Icon
                                  name={el.icon}
                                  size={11}
                                  className={
                                    isElementActive
                                      ? "text-gold-400"
                                      : "text-gold-600 group-hover:text-navy-900"
                                  }
                                />
                                <span className="truncate">{el.label}</span>
                              </span>
                              {el.sublabel && (
                                <span
                                  className={`text-[9px] font-mono truncate max-w-[110px] ${
                                    isElementActive ? "text-gold-200" : "text-ink-soft group-hover:text-ink"
                                  }`}
                                >
                                  {el.sublabel}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => setSidebarTab("widgets")}
                className="w-full py-2.5 mt-4 border-2 border-dashed border-line hover:border-navy-900 text-xs font-bold text-navy-900 rounded-sm flex items-center justify-center gap-1.5 bg-paper hover:bg-white transition-all shadow-xs"
              >
                <Icon name="plus" size={14} />
                <span>Add New Block from Palette</span>
              </button>
            </div>
          )}

          {/* TAB 2: Section Inspector (Elementor Properties Panel) */}
          {sidebarTab === "inspect" && selectedSection && (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
              <div className="p-3.5 border-b border-line bg-paper flex items-center justify-between flex-shrink-0">
                <div className="flex-1 min-w-0 pr-2">
                  {selectedElementKey ? (
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedElementKey(null)}
                          className="text-[10px] font-bold text-navy-900 hover:text-gold-700 underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Icon name="arrow-left" size={10} />
                          <span>{selectedSection.name}</span>
                        </button>
                        <span className="text-[10px] text-ink-soft">/</span>
                        <span className="text-[9px] font-mono text-gold-700 bg-gold-300/30 px-1.5 py-0.5 rounded font-bold uppercase truncate">
                          Focus Mode
                        </span>
                      </div>
                      <strong className="text-xs font-bold text-navy-900 block truncate">
                        {selectedElementKey === "trustNote"
                          ? "Instalment Notice / Legal Reassurance"
                          : selectedElementKey === "sealBadge"
                          ? "Watch Video Seal Badge"
                          : selectedElementKey === "socialProof"
                          ? "Social Proof & Rating"
                          : selectedElementKey === "reassurance"
                          ? "Reassurance Perk"
                          : selectedElementKey === "floatingBadge"
                          ? selectedSection.type === "staff_training"
                            ? "Corporate Partners Metrics Banner"
                            : "Hero Live Sessions Badge"
                          : selectedElementKey === "button"
                          ? "Primary CTA Button"
                          : selectedElementKey === "secondaryButton"
                          ? "Secondary Button"
                          : selectedElementKey === "headline"
                          ? "Main Headline & Typography"
                          : selectedElementKey === "subheadline"
                          ? "Subheadline Copy & Typography"
                          : selectedElementKey === "badge"
                          ? "Eyebrow / Badge Text"
                          : selectedElementKey === "tags"
                          ? "Top Benefit Badges"
                          : selectedElementKey === "image"
                          ? "Showcase Photograph"
                          : selectedElementKey === "video"
                          ? "Spotlight Video Player"
                          : selectedElementKey === "bg"
                          ? "Layout & Section Background"
                          : selectedElementKey === "item"
                          ? selectedSection.type === "staff_training"
                            ? `Benefit Point #${(selectedElementItemIndex ?? 0) + 1}`
                            : selectedSection.type === "coral_promo"
                            ? `Bullet #${(selectedElementItemIndex ?? 0) + 1}`
                            : `Card #${(selectedElementItemIndex ?? 0) + 1}`
                          : selectedSection.name}
                      </strong>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider block">
                        Inspector • {selectedSection.type}
                      </span>
                      <strong className="text-sm font-bold text-navy-900 block truncate">
                        {selectedSection.name}
                      </strong>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedElementKey ? (
                    <button
                      type="button"
                      onClick={() => setSelectedElementKey(null)}
                      className="px-2 py-1 text-[11px] font-bold text-navy-900 bg-white hover:bg-gold-50 border border-line rounded-xs flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                    >
                      <Icon name="arrow-left" size={10} />
                      <span>All Elements</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => duplicateSection(selectedSection.id)}
                        title="Duplicate section"
                        className="px-2 py-1 text-xs border border-line rounded-sm hover:bg-white font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="copy" size={11} />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => toggleSectionEnabled(selectedSection.id)}
                        className="px-2 py-1 text-xs border border-line rounded-sm hover:bg-white font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name={selectedSection.enabled ? "eye-off" : "eye"} size={11} />
                        <span>{selectedSection.enabled ? "Disable" : "Enable"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Contextual Focused Element Inspector vs All Elements Overview */}
              {selectedElementKey ? (
                <FocusedElementInspector
                  section={selectedSection}
                  elementKey={selectedElementKey}
                  itemIndex={selectedElementItemIndex}
                  onBack={() => setSelectedElementKey(null)}
                  updateField={updateSelectedField}
                  updateItemField={updateItemField}
                />
              ) : (
                <>
                  {/* Block Element Quick-Jump Map (Elementor Outline Strip) */}
                  <div className="p-3 bg-paper border-b border-line space-y-1.5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-navy-900 uppercase tracking-wider">
                        Interactive Elements in this Block
                      </span>
                      <span className="text-[10px] text-ink-soft font-mono">
                        {getSectionInnerElements(selectedSection).length} items
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {getSectionInnerElements(selectedSection).map((el) => (
                        <button
                          key={`${el.key}-${el.index ?? 0}`}
                          type="button"
                          onClick={() => {
                            setSelectedElementKey(el.key);
                            setSelectedElementItemIndex(el.index ?? null);
                            if (el.key === "item" || el.key === "image" || el.key === "video") {
                              setInspectorSubTab("items");
                            } else if (el.key === "bg") {
                              setInspectorSubTab("style");
                            } else {
                              setInspectorSubTab("content");
                            }
                          }}
                          className="px-2 py-1 bg-white hover:bg-navy-900 hover:text-white rounded-xs border border-line text-left transition-all shadow-2xs group flex items-center gap-1.5 cursor-pointer text-[10px] font-medium"
                        >
                          <Icon name={el.icon} size={11} className="text-gold-600 group-hover:text-gold-300 shrink-0" />
                          <span className="truncate max-w-[120px]">{el.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inspector Sub-Tabs */}
                  <div className="flex border-b border-line bg-white text-[11px] font-semibold flex-shrink-0">
                <button
                  onClick={() => setInspectorSubTab("content")}
                  className={`flex-1 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    inspectorSubTab === "content"
                      ? "border-navy-900 text-navy-900"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                >
                  <Icon name="file-text" size={12} />
                  <span>Content</span>
                </button>
                <button
                  onClick={() => setInspectorSubTab("style")}
                  className={`flex-1 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    inspectorSubTab === "style"
                      ? "border-navy-900 text-navy-900"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                >
                  <Icon name="sparkles" size={12} />
                  <span>Style & Theme</span>
                </button>
                <button
                  onClick={() => setInspectorSubTab("items")}
                  className={`flex-1 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    inspectorSubTab === "items"
                      ? "border-navy-900 text-navy-900"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                >
                  <Icon name="layers" size={12} />
                  <span>Media & Items</span>
                </button>
              </div>

              {/* Sub-tab 1: Content Fields */}
              {inspectorSubTab === "content" && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                      Block Display Label
                    </label>
                    <input
                      type="text"
                      value={selectedSection.name}
                      onChange={(e) => updateSelectedField("name", e.target.value)}
                      className="w-full px-3 py-1.5 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900"
                    />
                  </div>

                  {/* SPECIALIZED UI FOR COMPOSITE BLOCKS */}
                  {selectedSection.type === "composite_block" ? (
                    <div className="space-y-4 pt-1">
                      {/* Super Admin Save As Template Bar */}
                      <div className="p-3 bg-gold-50/80 border border-gold-300 rounded-sm flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5 leading-tight">
                            <Icon name="sparkles" size={13} className="text-gold-600 shrink-0" />
                            <span>Save as Reusable Widget</span>
                          </strong>
                          <p className="text-[10px] text-ink-soft leading-tight mt-0.5 truncate">
                            Make this modular block available for all admins.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={saveCurrentAsTemplate}
                          className="px-2.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-xs rounded-xs shrink-0 flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                        >
                          <Icon name="star" size={11} />
                          <span>Save Template</span>
                        </button>
                      </div>

                      {/* Optional Section Header */}
                      <div className="p-3 bg-paper rounded-sm border border-line space-y-2.5">
                        <strong className="text-xs font-bold text-navy-900 block">
                          Section Lead Copy (Optional)
                        </strong>
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                            Eyebrow / Category Badge
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Dedicated Faculty"
                            value={selectedSection.badgeText || ""}
                            onChange={(e) => updateSelectedField("badgeText", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Learn directly from practicing assessors"
                            value={selectedSection.headline || ""}
                            onChange={(e) => updateSelectedField("headline", e.target.value)}
                            className="w-full px-2 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                            Section Subtitle
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Explanatory paragraph..."
                            value={selectedSection.subheadline || ""}
                            onChange={(e) => updateSelectedField("subheadline", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white leading-normal"
                          />
                        </div>
                      </div>

                      {/* Column Count Selector */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                            Column Architecture
                          </label>
                          <span className="text-[10px] font-mono text-ink-soft">
                            {selectedSection.columns || 2} Columns
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCompositeColumnsCount(c as any)}
                              className={`py-1.5 rounded-sm border text-xs font-bold transition-all cursor-pointer ${
                                (selectedSection.columns || 2) === c
                                  ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                  : "bg-white border-line text-ink hover:border-navy-900/40"
                              }`}
                            >
                              {c} {c === 1 ? "Col" : "Cols"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Column Selector Tabs */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                            Select Column to Edit
                          </label>
                          <span className="text-[10px] text-ink-soft">
                            Active: Column {activeCompositeColIdx + 1}
                          </span>
                        </div>
                        <div className="flex border border-line rounded-sm bg-paper p-0.5 gap-1">
                          {Array.from({ length: selectedSection.columns || 2 }).map((_, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => setActiveCompositeColIdx(cIdx)}
                              className={`flex-1 py-1.5 text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                                activeCompositeColIdx === cIdx
                                  ? "bg-navy-900 text-white shadow-xs font-bold"
                                  : "text-ink hover:bg-white"
                              }`}
                            >
                              Column {cIdx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Column Micro-Widgets List & Builder */}
                      {(() => {
                        const cols = selectedSection.compositeColumns || [];
                        const col = cols[activeCompositeColIdx] || { id: `col-${activeCompositeColIdx + 1}`, widgets: [] };
                        const widgets = col.widgets || [];

                        return (
                          <div className="p-3 bg-paper rounded-sm border border-line space-y-3">
                            <div className="flex items-center justify-between border-b border-line pb-2">
                              <div>
                                <strong className="text-xs font-bold text-navy-900 block">
                                  Column {activeCompositeColIdx + 1} Widgets ({widgets.length})
                                </strong>
                                <span className="text-[10px] text-ink-soft">
                                  Stack micro-widgets in this column
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAddWidgetMenu(
                                    showAddWidgetMenu === activeCompositeColIdx
                                      ? null
                                      : activeCompositeColIdx
                                  )
                                }
                                className="px-2 py-1 bg-navy-900 hover:bg-navy-800 text-white rounded-xs text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              >
                                <Icon name="plus" size={11} />
                                <span>+ Add Widget</span>
                              </button>
                            </div>

                            {/* Dropdown Menu for Adding Micro-Widgets */}
                            {showAddWidgetMenu === activeCompositeColIdx && (
                              <div className="p-2.5 bg-white rounded-sm border border-navy-900 shadow-md space-y-2">
                                <span className="text-[10px] font-mono font-bold text-navy-900 uppercase tracking-wider block">
                                  Choose Micro-Widget Type:
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 text-xs">
                                  {[
                                    { type: "text", label: "Text Block", icon: "file-text" },
                                    { type: "icon_box", label: "Icon Box", icon: "shield-check" },
                                    { type: "stats_metric", label: "Stat Counter", icon: "star" },
                                    { type: "quote_card", label: "Student Quote", icon: "message-square" },
                                    { type: "badge_strip", label: "Awarding Badges", icon: "shield-check" },
                                    { type: "checklist", label: "Course Checklist", icon: "check-circle" },
                                    { type: "image", label: "Image Box", icon: "layers" },
                                    { type: "cta_button", label: "Action Buttons", icon: "arrow-right" },
                                    { type: "lead_form", label: "Lead Form Box", icon: "mail" },
                                    { type: "video_player", label: "Video Player", icon: "video" },
                                    { type: "divider", label: "Divider Line", icon: "minus" },
                                  ].map((mw) => (
                                    <button
                                      key={mw.type}
                                      type="button"
                                      onClick={() =>
                                        addMicroWidget(activeCompositeColIdx, mw.type as any)
                                      }
                                      className="p-1.5 bg-paper hover:bg-gold-50 border border-line hover:border-gold-500 rounded-xs flex items-center gap-1.5 text-left font-semibold text-navy-900 cursor-pointer transition-all"
                                    >
                                      <Icon name={mw.icon as IconName} size={13} className="text-gold-600 shrink-0" />
                                      <span className="truncate">{mw.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Micro-Widgets List */}
                            {widgets.length > 0 ? (
                              <div className="space-y-2">
                                {widgets.map((widget, wIdx) => {
                                  const isEditing = activeWidgetEditId === widget.id;

                                  return (
                                    <div
                                      key={widget.id || wIdx}
                                      className="rounded-sm border border-line bg-white shadow-2xs overflow-hidden"
                                    >
                                      {/* Widget Header Strip */}
                                      <div
                                        onClick={() =>
                                          setActiveWidgetEditId(isEditing ? null : widget.id)
                                        }
                                        className="p-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-paper/60 transition-colors select-none"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-[10px] font-mono font-bold px-1 py-0.5 rounded-xs bg-navy-100 text-navy-900 uppercase">
                                            {widget.type.replace("_", " ")}
                                          </span>
                                          <strong className="text-xs font-semibold text-navy-900 truncate">
                                            {widget.title || widget.eyebrow || widget.buttonText || widget.type}
                                          </strong>
                                        </div>
                                        <div
                                          className="flex items-center gap-1 shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            type="button"
                                            disabled={wIdx === 0}
                                            onClick={() =>
                                              moveMicroWidget(activeCompositeColIdx, wIdx, "up")
                                            }
                                            className="p-1 hover:bg-paper rounded-xs text-ink-soft disabled:opacity-20 text-xs"
                                            title="Move Up"
                                          >
                                            <Icon name="chevron-up" size={12} />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={wIdx === widgets.length - 1}
                                            onClick={() =>
                                              moveMicroWidget(activeCompositeColIdx, wIdx, "down")
                                            }
                                            className="p-1 hover:bg-paper rounded-xs text-ink-soft disabled:opacity-20 text-xs"
                                            title="Move Down"
                                          >
                                            <Icon name="chevron-down" size={12} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeMicroWidget(activeCompositeColIdx, wIdx)
                                            }
                                            className="p-1 hover:bg-rose-50 text-rose-700 rounded-xs text-xs"
                                            title="Delete Widget"
                                          >
                                            <Icon name="trash" size={12} />
                                          </button>
                                          <span className="text-[10px] text-ink-soft ml-1">
                                            {isEditing ? "▲" : "▼"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Widget Editor Fields (Expanded) */}
                                      {isEditing && (
                                        <div className="p-3 border-t border-line/60 bg-paper/40 space-y-2.5 text-xs">
                                          {/* Fields for TEXT */}
                                          {widget.type === "text" && (
                                            <>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Eyebrow Text
                                                </label>
                                                <input
                                                  type="text"
                                                  value={widget.eyebrow || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "eyebrow", e.target.value)
                                                  }
                                                  className="w-full px-2 py-1 border border-line rounded-sm bg-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Title / Heading
                                                </label>
                                                <input
                                                  type="text"
                                                  value={widget.title || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "title", e.target.value)
                                                  }
                                                  className="w-full px-2 py-1 font-bold border border-line rounded-sm bg-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Paragraph Content
                                                </label>
                                                <textarea
                                                  rows={3}
                                                  value={widget.content || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "content", e.target.value)
                                                  }
                                                  className="w-full px-2 py-1 border border-line rounded-sm bg-white leading-normal"
                                                />
                                              </div>

                                              {/* Text Widget Typography Settings */}
                                              <div className="pt-2 border-t border-line/70 space-y-2 bg-paper/50 p-2 rounded-xs">
                                                <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider flex items-center gap-1">
                                                  <Icon name="sparkles" size={10} className="text-gold-600" />
                                                  <span>Micro-Widget Typography</span>
                                                </label>

                                                {/* Font Family (Heading / Body / Serif) */}
                                                <div>
                                                  <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Font Family
                                                  </label>
                                                  <div className="grid grid-cols-3 gap-1">
                                                    {[
                                                      { key: "heading", label: "Heading" },
                                                      { key: "body", label: "Body" },
                                                      { key: "serif", label: "Serif" },
                                                    ].map((f) => {
                                                      const isSelected = (widget.fontFamily || "heading") === f.key;
                                                      return (
                                                        <button
                                                          key={f.key}
                                                          type="button"
                                                          onClick={() =>
                                                            updateMicroWidget(activeCompositeColIdx, wIdx, "fontFamily", f.key)
                                                          }
                                                          className={`py-1 rounded-xs border text-[10px] font-semibold text-center transition-all ${
                                                            isSelected
                                                              ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                                              : "bg-white border-line text-ink hover:border-navy-900/40"
                                                          }`}
                                                        >
                                                          {f.label}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>

                                                {/* Font Size & Weight */}
                                                <div className="grid grid-cols-2 gap-1.5">
                                                  <div>
                                                    <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                                      Size
                                                    </label>
                                                    <select
                                                      value={widget.fontSize || "md"}
                                                      onChange={(e) =>
                                                        updateMicroWidget(activeCompositeColIdx, wIdx, "fontSize", e.target.value)
                                                      }
                                                      className="w-full px-1.5 py-1 text-[11px] border border-line rounded-xs bg-white font-medium"
                                                    >
                                                      <option value="sm">SM (Small)</option>
                                                      <option value="md">MD (Medium)</option>
                                                      <option value="lg">LG (Large)</option>
                                                      <option value="xl">XL (Extra Large)</option>
                                                      <option value="2xl">2XL (Hero)</option>
                                                    </select>
                                                  </div>
                                                  <div>
                                                    <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                                      Weight
                                                    </label>
                                                    <select
                                                      value={widget.fontWeight || "bold"}
                                                      onChange={(e) =>
                                                        updateMicroWidget(activeCompositeColIdx, wIdx, "fontWeight", e.target.value)
                                                      }
                                                      className="w-full px-1.5 py-1 text-[11px] border border-line rounded-xs bg-white font-medium"
                                                    >
                                                      <option value="normal">400 Regular</option>
                                                      <option value="medium">500 Medium</option>
                                                      <option value="semibold">600 Semi-Bold</option>
                                                      <option value="bold">700 Bold</option>
                                                      <option value="extrabold">800 Extra-Bold</option>
                                                    </select>
                                                  </div>
                                                </div>

                                                {/* Font Slant / Style */}
                                                <div className="grid grid-cols-2 gap-1.5">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "fontStyle", "normal")
                                                    }
                                                    className={`py-1 text-[10px] rounded-xs border text-center transition-all ${
                                                      (widget.fontStyle || "normal") === "normal"
                                                        ? "bg-navy-900 text-white border-navy-900 font-bold"
                                                        : "bg-white border-line text-ink"
                                                    }`}
                                                  >
                                                    Normal
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "fontStyle", "italic")
                                                    }
                                                    className={`py-1 text-[10px] rounded-xs border text-center italic transition-all ${
                                                      widget.fontStyle === "italic"
                                                        ? "bg-navy-900 text-white border-navy-900 font-bold"
                                                        : "bg-white border-line text-ink"
                                                      }`}
                                                  >
                                                    Italic
                                                  </button>
                                                </div>

                                                {/* Text Color */}
                                                <div>
                                                  <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Color
                                                  </label>
                                                  <div className="flex items-center gap-1.5">
                                                    <select
                                                      value={
                                                        widget.textColor?.startsWith("#")
                                                          ? "custom"
                                                          : widget.textColor || "auto"
                                                      }
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "custom") {
                                                          updateMicroWidget(activeCompositeColIdx, wIdx, "textColor", "#23216B");
                                                        } else {
                                                          updateMicroWidget(activeCompositeColIdx, wIdx, "textColor", val);
                                                        }
                                                      }}
                                                      className="flex-1 px-1.5 py-1 text-[11px] border border-line rounded-xs bg-white font-medium"
                                                    >
                                                      <option value="auto">Auto Contrast</option>
                                                      <option value="navy">Oxford Navy</option>
                                                      <option value="white">Pure White</option>
                                                      <option value="gold">College Gold</option>
                                                      <option value="ink_soft">Soft Slate</option>
                                                      <option value="custom">Custom HEX...</option>
                                                    </select>
                                                    {widget.textColor?.startsWith("#") && (
                                                      <div className="flex items-center gap-1">
                                                        <input
                                                          type="color"
                                                          value={widget.textColor.length === 7 ? widget.textColor : "#23216B"}
                                                          onChange={(e) =>
                                                            updateMicroWidget(activeCompositeColIdx, wIdx, "textColor", e.target.value)
                                                          }
                                                          className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer bg-white"
                                                        />
                                                        <input
                                                          type="text"
                                                          value={widget.textColor}
                                                          onChange={(e) => {
                                                            let val = e.target.value.trim();
                                                            if (val && !val.startsWith("#")) val = "#" + val;
                                                            updateMicroWidget(activeCompositeColIdx, wIdx, "textColor", val);
                                                          }}
                                                          className="w-16 px-1 py-0.5 font-mono text-[10px] border border-line rounded-xs uppercase"
                                                        />
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          )}

                                          {/* Fields for ICON BOX */}
                                          {widget.type === "icon_box" && (
                                            <>
                                              <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Icon Name
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={widget.icon || "shield-check"}
                                                    onChange={(e) =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "icon", e.target.value)
                                                    }
                                                    placeholder="shield-check, star, sparkles"
                                                    className="w-full px-2 py-1 font-mono text-[11px] border border-line rounded-sm bg-white"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Tag Badge
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={widget.badge || ""}
                                                    onChange={(e) =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "badge", e.target.value)
                                                    }
                                                    placeholder="e.g. Accredited"
                                                    className="w-full px-2 py-1 text-[11px] border border-line rounded-sm bg-white"
                                                  />
                                                </div>
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Feature Title
                                                </label>
                                                <input
                                                  type="text"
                                                  value={widget.title || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "title", e.target.value)
                                                  }
                                                  className="w-full px-2 py-1 font-bold border border-line rounded-sm bg-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Feature Description
                                                </label>
                                                <textarea
                                                  rows={2}
                                                  value={widget.content || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "content", e.target.value)
                                                  }
                                                  className="w-full px-2 py-1 border border-line rounded-sm bg-white leading-normal"
                                                />
                                              </div>
                                            </>
                                          )}

                                          {/* Fields for IMAGE */}
                                          {widget.type === "image" && (
                                            <>
                                              <ImageDropzone
                                                value={widget.imageUrl || "/images/adult-care-training.jpg"}
                                                onChange={(url) =>
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, "imageUrl", url)
                                                }
                                                label="Upload Image"
                                                helperText="High-resolution photograph"
                                                previewHeight={120}
                                              />
                                              <div className="grid grid-cols-2 gap-2 pt-1">
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Aspect Ratio
                                                  </label>
                                                  <select
                                                    value={widget.aspectRatio || "portrait"}
                                                    onChange={(e) =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "aspectRatio", e.target.value)
                                                    }
                                                    className="w-full px-2 py-1 border border-line rounded-sm bg-white"
                                                  >
                                                    <option value="portrait">Portrait (3:4)</option>
                                                    <option value="square">Square (1:1)</option>
                                                    <option value="video">Widescreen (16:9)</option>
                                                    <option value="wide">Banner (21:9)</option>
                                                  </select>
                                                </div>
                                                <div className="flex items-center gap-2 pt-4">
                                                  <input
                                                    type="checkbox"
                                                    id={`mask-${widget.id}`}
                                                    checked={widget.useArcMask || false}
                                                    onChange={(e) =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "useArcMask", e.target.checked)
                                                    }
                                                    className="rounded-xs accent-navy-900"
                                                  />
                                                  <label
                                                    htmlFor={`mask-${widget.id}`}
                                                    className="text-[11px] font-semibold text-navy-900 cursor-pointer"
                                                  >
                                                    Use Signature ArcMask
                                                  </label>
                                                </div>
                                              </div>
                                            </>
                                          )}

                                          {/* Fields for CTA BUTTON */}
                                          {widget.type === "cta_button" && (
                                            <div className="space-y-3">
                                              <ButtonCustomizerFields
                                                label="Primary CTA Button"
                                                buttonText={widget.buttonText || ""}
                                                onButtonTextChange={(val) =>
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, "buttonText", val)
                                                }
                                                buttonLink={widget.buttonLink}
                                                onButtonLinkChange={(val) =>
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, "buttonLink", val)
                                                }
                                                linkPlaceholder="/book or /courses"
                                                defaultVariant="primary"
                                                defaultSize="sm"
                                                config={{
                                                  bgColor: widget.buttonBgColor,
                                                  textColor: widget.buttonTextColor,
                                                  fontFamily: widget.buttonFontFamily,
                                                  fontWeight: widget.buttonFontWeight,
                                                  textTransform: widget.buttonTextTransform,
                                                  icon: widget.buttonIcon,
                                                  iconPosition: widget.buttonIconPosition,
                                                  radius: widget.buttonRadius,
                                                  size: widget.buttonSize,
                                                }}
                                                onChange={(key, val) => {
                                                  const fieldMap: Record<string, string> = {
                                                    bgColor: "buttonBgColor",
                                                    textColor: "buttonTextColor",
                                                    fontFamily: "buttonFontFamily",
                                                    fontWeight: "buttonFontWeight",
                                                    textTransform: "buttonTextTransform",
                                                    icon: "buttonIcon",
                                                    iconPosition: "buttonIconPosition",
                                                    radius: "buttonRadius",
                                                    size: "buttonSize",
                                                  };
                                                  const mappedField = fieldMap[key] || key;
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, mappedField, val);
                                                }}
                                              />

                                              <ButtonCustomizerFields
                                                label="Secondary Action Button (optional)"
                                                buttonText={widget.secondaryButtonText || ""}
                                                onButtonTextChange={(val) =>
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, "secondaryButtonText", val)
                                                }
                                                buttonLink={widget.secondaryButtonLink}
                                                onButtonLinkChange={(val) =>
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, "secondaryButtonLink", val)
                                                }
                                                linkPlaceholder="/courses"
                                                defaultVariant="outline"
                                                defaultSize="sm"
                                                config={{
                                                  bgColor: widget.secondaryButtonBgColor,
                                                  textColor: widget.secondaryButtonTextColor,
                                                  fontFamily: widget.secondaryButtonFontFamily,
                                                  fontWeight: widget.secondaryButtonFontWeight,
                                                  textTransform: widget.secondaryButtonTextTransform,
                                                  icon: widget.secondaryButtonIcon,
                                                  iconPosition: widget.secondaryButtonIconPosition,
                                                  radius: widget.secondaryButtonRadius,
                                                  size: widget.secondaryButtonSize,
                                                }}
                                                onChange={(key, val) => {
                                                  const fieldMap: Record<string, string> = {
                                                    bgColor: "secondaryButtonBgColor",
                                                    textColor: "secondaryButtonTextColor",
                                                    fontFamily: "secondaryButtonFontFamily",
                                                    fontWeight: "secondaryButtonFontWeight",
                                                    textTransform: "secondaryButtonTextTransform",
                                                    icon: "secondaryButtonIcon",
                                                    iconPosition: "secondaryButtonIconPosition",
                                                    radius: "secondaryButtonRadius",
                                                    size: "secondaryButtonSize",
                                                  };
                                                  const mappedField = fieldMap[key] || key;
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, mappedField, val);
                                                }}
                                              />
                                            </div>
                                          )}

                                          {/* Fields for LEAD FORM */}
                                          {widget.type === "lead_form" && (
                                            <>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Form Box Title
                                                </label>
                                                <input
                                                  type="text"
                                                  value={widget.title || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "title", e.target.value)
                                                  }
                                                  className="w-full px-2 py-1 font-bold border border-line rounded-sm bg-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Subtitle / Advice Guarantee
                                                </label>
                                                <input
                                                  type="text"
                                                  value={widget.subtitle || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "subtitle", e.target.value)
                                                  }
                                                  className="w-full px-2 py-1 border border-line rounded-sm bg-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Submit Button Label
                                                </label>
                                                <input
                                                  type="text"
                                                  value={widget.buttonText || "Request Advice Call"}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "buttonText", e.target.value)
                                                  }
                                                  className="w-full px-2 py-1 border border-line rounded-sm bg-white font-bold"
                                                />
                                              </div>
                                            </>
                                          )}

                                          {/* Fields for VIDEO PLAYER */}
                                          {widget.type === "video_player" && (
                                            <div>
                                              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                YouTube / Vimeo Embed URL
                                              </label>
                                              <input
                                                type="text"
                                                value={widget.videoUrl || ""}
                                                onChange={(e) =>
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, "videoUrl", e.target.value)
                                                }
                                                placeholder="https://www.youtube.com/embed/..."
                                                className="w-full px-2 py-1 font-mono text-[11px] border border-line rounded-sm bg-white"
                                              />
                                            </div>
                                          )}

                                          {/* Fields for STATS METRIC */}
                                          {widget.type === "stats_metric" && (
                                            <>
                                              <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Metric Number
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={widget.statNumber || ""}
                                                    onChange={(e) =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "statNumber", e.target.value)
                                                    }
                                                    placeholder="98%"
                                                    className="w-full px-2 py-1 font-bold text-sm text-gold-600 border border-line rounded-sm bg-white"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Eyebrow Tag
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={widget.eyebrow || ""}
                                                    onChange={(e) =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "eyebrow", e.target.value)
                                                    }
                                                    placeholder="Verified Result"
                                                    className="w-full px-2 py-1 border border-line rounded-sm bg-white"
                                                  />
                                                </div>
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Metric Title / Label
                                                </label>
                                                <input
                                                  type="text"
                                                  value={widget.statLabel || widget.title || ""}
                                                  onChange={(e) => {
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "statLabel", e.target.value);
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "title", e.target.value);
                                                  }}
                                                  placeholder="First-Time Pass Rate"
                                                  className="w-full px-2 py-1 font-semibold border border-line rounded-sm bg-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Footnote / Explanation
                                                </label>
                                                <textarea
                                                  rows={2}
                                                  value={widget.content || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "content", e.target.value)
                                                  }
                                                  placeholder="Across 2025/2026 assessor reviews..."
                                                  className="w-full px-2 py-1 border border-line rounded-sm bg-white text-xs"
                                                />
                                              </div>
                                            </>
                                          )}

                                          {/* Fields for QUOTE CARD */}
                                          {widget.type === "quote_card" && (
                                            <>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Star Rating (1-5)
                                                </label>
                                                <input
                                                  type="number"
                                                  min={1}
                                                  max={5}
                                                  value={widget.rating || 5}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "rating", Number(e.target.value))
                                                  }
                                                  className="w-20 px-2 py-1 font-bold border border-line rounded-sm bg-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Quote Text
                                                </label>
                                                <textarea
                                                  rows={3}
                                                  value={widget.content || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "content", e.target.value)
                                                  }
                                                  placeholder="Student testimonial..."
                                                  className="w-full px-2 py-1 italic border border-line rounded-sm bg-white text-xs"
                                                />
                                              </div>
                                              <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Student Name
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={widget.quoteAuthor || ""}
                                                    onChange={(e) =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "quoteAuthor", e.target.value)
                                                    }
                                                    placeholder="Sarah Jenkins"
                                                    className="w-full px-2 py-1 font-bold border border-line rounded-sm bg-white"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                    Role / Workplace
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={widget.quoteRole || ""}
                                                    onChange={(e) =>
                                                      updateMicroWidget(activeCompositeColIdx, wIdx, "quoteRole", e.target.value)
                                                    }
                                                    placeholder="Senior Carer, NHS Trust"
                                                    className="w-full px-2 py-1 border border-line rounded-sm bg-white text-xs"
                                                  />
                                                </div>
                                              </div>
                                            </>
                                          )}

                                          {/* Fields for BADGE STRIP */}
                                          {widget.type === "badge_strip" && (
                                            <div>
                                              <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                Accreditation Badges (comma-separated)
                                              </label>
                                              <textarea
                                                rows={3}
                                                value={(widget.badgeList || []).join(", ")}
                                                onChange={(e) => {
                                                  const list = e.target.value
                                                    .split(",")
                                                    .map((s) => s.trim())
                                                    .filter(Boolean);
                                                  updateMicroWidget(activeCompositeColIdx, wIdx, "badgeList", list);
                                                }}
                                                placeholder="NCFE CACHE Regulated, TQUK Approved Centre, Ofqual Framework, 100% Coursework"
                                                className="w-full px-2 py-1 border border-line rounded-sm bg-white text-xs"
                                              />
                                            </div>
                                          )}

                                          {/* Fields for CHECKLIST */}
                                          {widget.type === "checklist" && (
                                            <>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Checklist Title
                                                </label>
                                                <input
                                                  type="text"
                                                  value={widget.title || ""}
                                                  onChange={(e) =>
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "title", e.target.value)
                                                  }
                                                  placeholder="Key Course Benefits"
                                                  className="w-full px-2 py-1 font-bold border border-line rounded-sm bg-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                                  Checklist Items (one per line)
                                                </label>
                                                <textarea
                                                  rows={4}
                                                  value={(widget.checklistItems || []).join("\n")}
                                                  onChange={(e) => {
                                                    const items = e.target.value
                                                      .split("\n")
                                                      .map((s) => s.trim())
                                                      .filter(Boolean);
                                                    updateMicroWidget(activeCompositeColIdx, wIdx, "checklistItems", items);
                                                  }}
                                                  placeholder="No written exams&#10;1-on-1 tutor support&#10;Flexible shift study"
                                                  className="w-full px-2 py-1 border border-line rounded-sm bg-white text-xs font-mono"
                                                />
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-ink-soft italic text-center py-2">
                                No micro-widgets in Column {activeCompositeColIdx + 1} yet. Click &quot;+ Add Widget&quot; above to add one.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* STANDARD SECTION CONTENT FIELDS (Hero, Trust, Pricing, etc.) */
                    <>
                      {(selectedSection.badgeText !== undefined ||
                        selectedSection.eyebrow !== undefined ||
                        [
                          "page_header",
                          "about_story",
                          "accreditations_block",
                          "team_grid",
                          "how_it_works",
                          "faq_accordion",
                          "courses_listing",
                          "featured_courses",
                          "why_smartminds",
                          "choose_path",
                          "pricing",
                          "testimonials",
                          "cta_banner",
                        ].includes(selectedSection.type)) && (
                        <div>
                          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                            Eyebrow / Badge Text
                          </label>
                          <input
                            type="text"
                            value={selectedSection.badgeText ?? selectedSection.eyebrow ?? ""}
                            onChange={(e) => {
                              updateSelectedField("badgeText", e.target.value);
                              if (selectedSection.eyebrow !== undefined) {
                                updateSelectedField("eyebrow", e.target.value);
                              }
                            }}
                            placeholder="Enter eyebrow badge copy..."
                            className="w-full px-3 py-1.5 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900"
                          />
                        </div>
                      )}

                      {/* Qualification / Course Manager Direct Access Callout */}
                      {selectedSection.type === "featured_courses" && (
                        <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded bg-navy-900 text-gold-300 flex items-center justify-center shrink-0 mt-0.5">
                              <Icon name="graduation-cap" size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <strong className="text-xs font-bold text-navy-900 block">
                                Qualification Data & Slashed Tuition
                              </strong>
                              <p className="text-[11px] text-ink-soft leading-normal mt-0.5">
                                All course titles, RRP regular slashed prices, selling fees, syllabus modules, delivery schedules, and video previews are managed centrally in Course Manager.
                              </p>
                            </div>
                          </div>

                          <Link
                            href="/admin/courses"
                            target="_blank"
                            className="w-full py-2 px-3 bg-navy-900 hover:bg-navy-800 text-gold-300 text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          >
                            <span>Open Course Manager in New Tab</span>
                            <Icon name="arrow-right" size={11} />
                          </Link>
                        </div>
                      )}

                      {/* Course Grid Columns (2, 3, 4) & Rows / Limit Display Controls */}
                      {selectedSection.type === "featured_courses" && (
                        <CourseGridCmsControls
                          columns={selectedSection.columns || 4}
                          rows={selectedSection.rows || 2}
                          courseLimit={selectedSection.courseLimit}
                          courseCategoryFilter={selectedSection.courseCategoryFilter || "all"}
                          currentViewport={viewport}
                          onColumnsChange={(cols) => updateSelectedField("columns", cols)}
                          onRowsChange={(rows) => updateSelectedField("rows", rows)}
                          onCourseLimitChange={(limit) => updateSelectedField("courseLimit", limit)}
                          onCourseCategoryFilterChange={(cat) => updateSelectedField("courseCategoryFilter", cat)}
                        />
                      )}

                      {/* Hero Top Tags & Micro-Badges Repeater */}
                      {selectedSection.type === "hero" && (
                        <div className="p-3 bg-paper rounded-sm border border-line space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                              Top Hero Tags & Badges ({(selectedSection.tags || []).length || 3})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentTags: BuilderTagItem[] = selectedSection.tags || [
                                  { id: "tag-1", label: "Live Online Classes", variant: "live" },
                                  { id: "tag-2", label: "Regulated Qualifications", variant: "navy" },
                                  { id: "tag-3", label: "Flexible Instalments", variant: "gold" },
                                ];
                                const newTag: BuilderTagItem = {
                                  id: `tag-${Date.now()}`,
                                  label: "New Benefit Badge",
                                  variant: "navy",
                                };
                                updateSelectedField("tags", [...currentTags, newTag]);
                              }}
                              className="text-[11px] font-bold text-navy-900 hover:text-gold-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Icon name="plus" size={12} />
                              <span>Add Tag</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(selectedSection.tags || [
                              { id: "tag-1", label: "Live Online Classes", variant: "live" },
                              { id: "tag-2", label: "Regulated Qualifications", variant: "navy" },
                              { id: "tag-3", label: "Flexible Instalments", variant: "gold" },
                            ]).map((tag, tIdx, arr) => (
                              <div
                                key={tag.id || tIdx}
                                className="p-2 bg-white rounded-xs border border-line flex items-center gap-2 shadow-2xs"
                              >
                                <input
                                  type="text"
                                  value={tag.label}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[tIdx] = { ...updated[tIdx], label: e.target.value };
                                    updateSelectedField("tags", updated);
                                  }}
                                  placeholder="Tag label..."
                                  className="flex-1 px-2 py-1 text-xs border border-line rounded-xs"
                                />
                                <select
                                  value={tag.variant || "default"}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[tIdx] = {
                                      ...updated[tIdx],
                                      variant: e.target.value as any,
                                    };
                                    updateSelectedField("tags", updated);
                                  }}
                                  className="text-[11px] px-2 py-1 border border-line rounded-xs bg-paper font-medium"
                                >
                                  <option value="live">Live (Pulsing Red)</option>
                                  <option value="navy">Navy</option>
                                  <option value="gold">Gold</option>
                                  <option value="default">Default</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = arr.filter((_, idx) => idx !== tIdx);
                                    updateSelectedField("tags", updated);
                                  }}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                                  title="Delete Tag"
                                >
                                  <Icon name="trash" size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hero Floating Live Sessions Indicator Badge */}
                      {selectedSection.type === "hero" && (
                        <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-line pb-2">
                            <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                              <Icon name="sparkles" size={13} className="text-gold-500" />
                              <span>Hero Floating Live Badge</span>
                            </strong>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-navy-900">
                              <input
                                type="checkbox"
                                checked={selectedSection.floatingBadgeEnabled !== false}
                                onChange={(e) =>
                                  updateSelectedField("floatingBadgeEnabled", e.target.checked)
                                }
                                className="rounded border-line text-navy-900 focus:ring-0"
                              />
                              <span>Show on Photo</span>
                            </label>
                          </div>

                          {selectedSection.floatingBadgeEnabled !== false && (
                            <>
                              {/* Live Mini Preview Box */}
                              <div className="p-2.5 bg-white rounded-xs border border-line flex items-center gap-2.5 shadow-2xs">
                                <div className="w-8 h-8 rounded-sm bg-navy-900 text-white flex items-center justify-center shrink-0">
                                  <Icon
                                    name={(selectedSection.floatingBadgeIcon as any) || "star"}
                                    size={16}
                                    className="text-gold-500"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-heading font-bold text-xs text-navy-900 block leading-tight truncate">
                                    {selectedSection.floatingBadgeTitle || "Live Evening Sessions"}
                                  </span>
                                  <span className="text-[10px] text-ink-soft block leading-tight truncate">
                                    {selectedSection.floatingBadgeSubtitle || "Recordings available 24/7 to rewatch"}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-gold-700 bg-gold-300/30 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                                  Preview
                                </span>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                                  Badge Title
                                </label>
                                <input
                                  type="text"
                                  value={selectedSection.floatingBadgeTitle ?? "Live Evening Sessions"}
                                  onChange={(e) =>
                                    updateSelectedField("floatingBadgeTitle", e.target.value)
                                  }
                                  placeholder="e.g. Live Evening Sessions"
                                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                                  Badge Subtitle / Caption
                                </label>
                                <input
                                  type="text"
                                  value={selectedSection.floatingBadgeSubtitle ?? "Recordings available 24/7 to rewatch"}
                                  onChange={(e) =>
                                    updateSelectedField("floatingBadgeSubtitle", e.target.value)
                                  }
                                  placeholder="e.g. Recordings available 24/7 to rewatch"
                                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                                  Badge SVG Icon
                                </label>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {[
                                    { name: "star", label: "Star" },
                                    { name: "video", label: "Video" },
                                    { name: "clock", label: "Clock" },
                                    { name: "calendar", label: "Calendar" },
                                    { name: "graduation-cap", label: "Academic" },
                                    { name: "sparkles", label: "Sparkles" },
                                    { name: "users", label: "Tutors" },
                                    { name: "book-open", label: "Study" },
                                    { name: "shield-check", label: "Shield" },
                                    { name: "check-circle", label: "Check" },
                                    { name: "play", label: "Play" },
                                    { name: "bell", label: "Bell" },
                                  ].map((ic) => {
                                    const active = (selectedSection.floatingBadgeIcon || "star") === ic.name;
                                    return (
                                      <button
                                        key={ic.name}
                                        type="button"
                                        onClick={() =>
                                          updateSelectedField("floatingBadgeIcon", ic.name)
                                        }
                                        className={`flex flex-col items-center justify-center p-2 rounded-xs border text-[10px] transition-all cursor-pointer ${
                                          active
                                            ? "bg-navy-900 text-gold-300 border-navy-900 shadow-xs ring-1 ring-gold-500"
                                            : "bg-white text-ink-soft border-line hover:border-navy-900/40"
                                        }`}
                                      >
                                        <Icon
                                          name={ic.name as any}
                                          size={16}
                                          className={active ? "text-gold-500" : "text-navy-900"}
                                        />
                                        <span className="mt-1 truncate max-w-full font-medium">
                                          {ic.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                            Main Headline
                          </label>
                          <button
                            type="button"
                            onClick={() => setInspectorSubTab("style")}
                            className="text-[10px] text-navy-900 hover:text-gold-600 font-semibold flex items-center gap-1 cursor-pointer"
                            title="Open Font Style, Size, Weight and Color in Style Tab"
                          >
                            <Icon name="sparkles" size={10} className="text-gold-500" />
                            <span>Font & Style Settings →</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={selectedSection.headline}
                          onChange={(e) => updateSelectedField("headline", e.target.value)}
                          className="w-full px-3 py-1.5 border border-line rounded-sm text-xs font-semibold focus:outline-none focus:border-navy-900"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                            Subheadline / Explanatory Copy
                          </label>
                          <button
                            type="button"
                            onClick={() => setInspectorSubTab("style")}
                            className="text-[10px] text-navy-900 hover:text-gold-600 font-semibold flex items-center gap-1 cursor-pointer"
                            title="Open Font Style, Size, Weight and Color in Style Tab"
                          >
                            <Icon name="sparkles" size={10} className="text-gold-500" />
                            <span>Font & Style Settings →</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={selectedSection.subheadline}
                          onChange={(e) => updateSelectedField("subheadline", e.target.value)}
                          className="w-full px-3 py-1.5 border border-line rounded-sm text-xs focus:outline-none focus:border-navy-900 leading-relaxed"
                        />
                      </div>

                      {(selectedSection.buttonText !== undefined || selectedSection.type === "choose_path") && (
                        <ButtonCustomizerFields
                          label={selectedSection.type === "choose_path" ? "Bottom CTA Button (e.g. View All Categories)" : "Primary CTA Button"}
                          buttonText={selectedSection.buttonText !== undefined ? selectedSection.buttonText : (selectedSection.type === "choose_path" ? "View All Categories" : "")}
                          onButtonTextChange={(val) => updateSelectedField("buttonText", val)}
                          buttonLink={selectedSection.buttonLink || (selectedSection.type === "choose_path" ? "/courses" : undefined)}
                          onButtonLinkChange={(val) => updateSelectedField("buttonLink", val)}
                          linkPlaceholder="/courses or /book"
                          defaultVariant={selectedSection.type === "choose_path" ? "outline" : "primary"}
                          defaultSize={selectedSection.type === "hero" ? "lg" : "md"}
                          config={{
                            bgColor: selectedSection.buttonBgColor,
                            textColor: selectedSection.buttonTextColor,
                            fontFamily: selectedSection.buttonFontFamily,
                            fontWeight: selectedSection.buttonFontWeight,
                            textTransform: selectedSection.buttonTextTransform,
                            icon: selectedSection.buttonIcon || (selectedSection.type === "choose_path" ? "arrow-right" : undefined),
                            iconPosition: selectedSection.buttonIconPosition || (selectedSection.type === "choose_path" ? "right" : undefined),
                            radius: selectedSection.buttonRadius,
                            size: selectedSection.buttonSize,
                          }}
                          onChange={(key, val) => {
                            const fieldMap: Record<string, string> = {
                              bgColor: "buttonBgColor",
                              textColor: "buttonTextColor",
                              fontFamily: "buttonFontFamily",
                              fontWeight: "buttonFontWeight",
                              textTransform: "buttonTextTransform",
                              icon: "buttonIcon",
                              iconPosition: "buttonIconPosition",
                              radius: "buttonRadius",
                              size: "buttonSize",
                            };
                            const mappedField = fieldMap[key] || key;
                            updateSelectedField(mappedField as any, val);
                          }}
                        />
                      )}

                      {selectedSection.secondaryButtonText !== undefined && (
                        <ButtonCustomizerFields
                          label="Secondary Action Button"
                          buttonText={selectedSection.secondaryButtonText || ""}
                          onButtonTextChange={(val) => updateSelectedField("secondaryButtonText", val)}
                          buttonLink={selectedSection.secondaryButtonLink}
                          onButtonLinkChange={(val) => updateSelectedField("secondaryButtonLink", val)}
                          linkPlaceholder="/courses"
                          defaultVariant="outline"
                          defaultSize={selectedSection.type === "hero" ? "lg" : "md"}
                          config={{
                            bgColor: selectedSection.secondaryButtonBgColor,
                            textColor: selectedSection.secondaryButtonTextColor,
                            fontFamily: selectedSection.secondaryButtonFontFamily,
                            fontWeight: selectedSection.secondaryButtonFontWeight,
                            textTransform: selectedSection.secondaryButtonTextTransform,
                            icon: selectedSection.secondaryButtonIcon,
                            iconPosition: selectedSection.secondaryButtonIconPosition,
                            radius: selectedSection.secondaryButtonRadius,
                            size: selectedSection.secondaryButtonSize,
                          }}
                          onChange={(key, val) => {
                            const fieldMap: Record<string, string> = {
                              bgColor: "secondaryButtonBgColor",
                              textColor: "secondaryButtonTextColor",
                              fontFamily: "secondaryButtonFontFamily",
                              fontWeight: "secondaryButtonFontWeight",
                              textTransform: "secondaryButtonTextTransform",
                              icon: "secondaryButtonIcon",
                              iconPosition: "secondaryButtonIconPosition",
                              radius: "secondaryButtonRadius",
                              size: "secondaryButtonSize",
                            };
                            const mappedField = fieldMap[key] || key;
                            updateSelectedField(mappedField as any, val);
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Style & Layout Options (Elementor Flex & Spacing) */}
              {inspectorSubTab === "style" && (() => {
                const defaultBg =
                  selectedSection.type === "hero" ||
                  selectedSection.type === "pricing" ||
                  selectedSection.type === "featured_courses" ||
                  selectedSection.type === "testimonials" ||
                  selectedSection.type === "video_spotlight" ||
                  selectedSection.type === "contact_block" ||
                  selectedSection.type === "composite_block" ||
                  selectedSection.type === "page_header" ||
                  selectedSection.type === "about_story" ||
                  selectedSection.type === "team_grid" ||
                  selectedSection.type === "legal_notice" ||
                  selectedSection.type === "contact_split" ||
                  selectedSection.type === "funding_split" ||
                  selectedSection.type === "cpd_listing" ||
                  selectedSection.type === "tutoring_split" ||
                  selectedSection.type === "scheduler_block" ||
                  selectedSection.type === "courses_listing" ||
                  selectedSection.type === "student_benefits" ||
                  selectedSection.type === "exclusive_bundles"
                    ? "paper"
                    : selectedSection.type === "cta_banner" ||
                      selectedSection.type === "staff_training"
                    ? "navy"
                    : selectedSection.type === "why_smartminds"
                    ? "mint"
                    : selectedSection.type === "coral_promo"
                    ? "coral"
                    : "white";
                const activeBg = selectedSection.bgColor || defaultBg;

                const isSplitLayout =
                  [
                    "hero",
                    "trust_strip",
                    "video_spotlight",
                    "testimonials",
                    "about_story",
                    "contact_split",
                  ].includes(selectedSection.type) ||
                  (selectedSection.type === "composite_block" &&
                    (selectedSection.columns || 2) === 2);

                const isGridLayout =
                  [
                    "choose_path",
                    "why_smartminds",
                    "how_it_works",
                    "pricing",
                    "featured_courses",
                    "faq_accordion",
                    "stats_counter",
                    "accreditations_block",
                    "team_grid",
                    "student_benefits",
                    "staff_training",
                  ].includes(selectedSection.type) ||
                  (selectedSection.type === "composite_block" &&
                    (selectedSection.columns || 2) > 2);

                return (
                  <div className="p-4 space-y-5">
                    {/* Background Palette with Shades of Navy, Yellow, Grey & Custom Hex */}
                    <div>
                      <ColorPalettePicker
                        value={activeBg}
                        onChange={(val) => updateSelectedField("bgColor", val)}
                        label="Background Palette & Section Accent"
                        defaultColor="paper"
                        allowCustomHex={true}
                      />
                    </div>

                    {/* TYPOGRAPHY CONTROLS (Font Style, Size, Color, Weight) */}
                    <div className="pt-2 border-t border-line space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Icon name="sparkles" size={12} className="text-gold-600" />
                          <span>Typography & Font Styling</span>
                        </label>
                        <span className="text-[10px] text-ink-soft font-mono">
                          Live Responsive Scale
                        </span>
                      </div>

                      {/* 1. Main Headline Typography Card */}
                      <div className="p-3 bg-paper/70 rounded-sm border border-line space-y-3">
                        <div className="flex items-center justify-between border-b border-line pb-1.5">
                          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1">
                            <span>Main Headline</span>
                          </strong>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-navy-900/5 text-navy-900">
                            {selectedSection.headlineFontFamily || "heading"} • {selectedSection.headlineFontSize || "lg"} • {selectedSection.headlineFontWeight || "bold"}
                          </span>
                        </div>

                        {/* Font Family (Style) */}
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                            Font Family
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { key: "heading", label: "Saira Condensed", sub: "Heading (Default)" },
                              { key: "body", label: "Source Sans 3", sub: "Body Sans" },
                              { key: "serif", label: "Collegiate Serif", sub: "Academic" },
                            ].map((f) => {
                              const isSelected = (selectedSection.headlineFontFamily || "heading") === f.key;
                              return (
                                <button
                                  key={f.key}
                                  type="button"
                                  onClick={() => updateSelectedField("headlineFontFamily", f.key)}
                                  className={`p-1.5 rounded-xs border text-left transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  <div className="text-[11px] font-bold leading-tight truncate">{f.label}</div>
                                  <div className={`text-[9px] ${isSelected ? "text-gold-300" : "text-ink-soft"}`}>{f.sub}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Size Scale */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-semibold text-ink-soft uppercase">
                              Font Size
                            </label>
                            <span className="text-[9px] font-mono text-ink-soft">
                              {(selectedSection.headlineFontSize || "lg").toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {[
                              { key: "sm", label: "SM", desc: "Small ~28px" },
                              { key: "md", label: "MD", desc: "Medium ~36px" },
                              { key: "lg", label: "LG", desc: "Large ~48px (Default)" },
                              { key: "xl", label: "XL", desc: "Extra Large ~60px" },
                              { key: "2xl", label: "2XL", desc: "Hero Giant ~72px" },
                            ].map((s) => {
                              const isSelected = (selectedSection.headlineFontSize || "lg") === s.key;
                              return (
                                <button
                                  key={s.key}
                                  type="button"
                                  title={s.desc}
                                  onClick={() => updateSelectedField("headlineFontSize", s.key)}
                                  className={`py-1 rounded-xs border text-xs font-bold text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {s.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Weight */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-semibold text-ink-soft uppercase">
                              Font Weight
                            </label>
                            <span className="text-[9px] font-mono text-ink-soft">
                              {(selectedSection.headlineFontWeight || "bold").toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {[
                              { key: "normal", label: "400", title: "Regular 400" },
                              { key: "medium", label: "500", title: "Medium 500" },
                              { key: "semibold", label: "600", title: "Semi-Bold 600" },
                              { key: "bold", label: "700", title: "Bold 700 (Default)" },
                              { key: "extrabold", label: "800", title: "Extra-Bold 800" },
                            ].map((w) => {
                              const isSelected = (selectedSection.headlineFontWeight || "bold") === w.key;
                              return (
                                <button
                                  key={w.key}
                                  type="button"
                                  title={w.title}
                                  onClick={() => updateSelectedField("headlineFontWeight", w.key)}
                                  className={`py-1 rounded-xs border text-xs font-semibold text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs font-bold"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {w.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Slant / Style */}
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                            Font Slant / Style
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { key: "normal", label: "Normal (Upright)" },
                              { key: "italic", label: "Italic (Slanted)" },
                            ].map((st) => {
                              const isSelected = (selectedSection.headlineFontStyle || "normal") === st.key;
                              return (
                                <button
                                  key={st.key}
                                  type="button"
                                  onClick={() => updateSelectedField("headlineFontStyle", st.key)}
                                  className={`py-1 px-2 rounded-xs border text-xs text-center transition-all cursor-pointer ${
                                    st.key === "italic" ? "italic" : ""
                                  } ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs font-semibold"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {st.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Color */}
                        <div>
                          <ColorPalettePicker
                            value={selectedSection.headlineColor || "auto"}
                            onChange={(val) => updateSelectedField("headlineColor", val)}
                            label="Headline Text Color"
                            compact={true}
                            showAutoOption={true}
                            defaultColor="auto"
                            allowCustomHex={true}
                          />
                        </div>

                        {/* Text Alignment */}
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                            Text Alignment
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { key: "left", label: "Left Align", icon: "align-left" as IconName },
                              { key: "center", label: "Center Align", icon: "align-center" as IconName },
                              { key: "right", label: "Right Align", icon: "align-right" as IconName },
                            ].map((a) => {
                              const isSelected = (selectedSection.headlineAlign || "left") === a.key;
                              return (
                                <button
                                  key={a.key}
                                  type="button"
                                  onClick={() => updateSelectedField("headlineAlign", a.key)}
                                  className={`py-1 px-2 rounded-xs border text-xs text-center flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs font-semibold"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  <Icon name={a.icon} size={11} />
                                  <span>{a.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Letter Casing / Text Transform */}
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                            Letter Casing
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { key: "normal", label: "Sentence case (Normal)" },
                              { key: "uppercase", label: "ALL CAPS (UPPERCASE)" },
                            ].map((t) => {
                              const isSelected = (selectedSection.headlineTransform || "normal") === t.key;
                              return (
                                <button
                                  key={t.key}
                                  type="button"
                                  onClick={() => updateSelectedField("headlineTransform", t.key)}
                                  className={`py-1 px-2 rounded-xs border text-xs text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs font-semibold"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {t.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 2. Subheadline / Body Typography Card */}
                      <div className="p-3 bg-paper/70 rounded-sm border border-line space-y-3">
                        <div className="flex items-center justify-between border-b border-line pb-1.5">
                          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1">
                            <span>Subheadline / Explanatory Copy</span>
                          </strong>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-navy-900/5 text-navy-900">
                            {selectedSection.subheadlineFontFamily || "body"} • {selectedSection.subheadlineFontSize || "md"} • {selectedSection.subheadlineFontWeight || "normal"}
                          </span>
                        </div>

                        {/* Font Family (Style) */}
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                            Font Family
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { key: "body", label: "Source Sans 3", sub: "Body Sans (Default)" },
                              { key: "heading", label: "Saira Condensed", sub: "Heading" },
                              { key: "serif", label: "Collegiate Serif", sub: "Academic" },
                            ].map((f) => {
                              const isSelected = (selectedSection.subheadlineFontFamily || "body") === f.key;
                              return (
                                <button
                                  key={f.key}
                                  type="button"
                                  onClick={() => updateSelectedField("subheadlineFontFamily", f.key)}
                                  className={`p-1.5 rounded-xs border text-left transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  <div className="text-[11px] font-bold leading-tight truncate">{f.label}</div>
                                  <div className={`text-[9px] ${isSelected ? "text-gold-300" : "text-ink-soft"}`}>{f.sub}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Size Scale */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-semibold text-ink-soft uppercase">
                              Font Size
                            </label>
                            <span className="text-[9px] font-mono text-ink-soft">
                              {(selectedSection.subheadlineFontSize || "md").toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { key: "sm", label: "SM", desc: "Small ~14px" },
                              { key: "md", label: "MD", desc: "Medium ~16px (Default)" },
                              { key: "lg", label: "LG", desc: "Lead ~18px" },
                              { key: "xl", label: "XL", desc: "Large Lead ~20px" },
                            ].map((s) => {
                              const isSelected = (selectedSection.subheadlineFontSize || "md") === s.key;
                              return (
                                <button
                                  key={s.key}
                                  type="button"
                                  title={s.desc}
                                  onClick={() => updateSelectedField("subheadlineFontSize", s.key)}
                                  className={`py-1 rounded-xs border text-xs font-bold text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {s.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Weight */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-semibold text-ink-soft uppercase">
                              Font Weight
                            </label>
                            <span className="text-[9px] font-mono text-ink-soft">
                              {(selectedSection.subheadlineFontWeight || "normal").toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { key: "normal", label: "400 Regular" },
                              { key: "medium", label: "500 Medium" },
                              { key: "semibold", label: "600 Semi-Bold" },
                              { key: "bold", label: "700 Bold" },
                            ].map((w) => {
                              const isSelected = (selectedSection.subheadlineFontWeight || "normal") === w.key;
                              return (
                                <button
                                  key={w.key}
                                  type="button"
                                  onClick={() => updateSelectedField("subheadlineFontWeight", w.key)}
                                  className={`py-1 rounded-xs border text-xs text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs font-bold"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {w.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Slant / Style */}
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                            Font Slant / Style
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { key: "normal", label: "Normal (Upright)" },
                              { key: "italic", label: "Italic (Slanted)" },
                            ].map((st) => {
                              const isSelected = (selectedSection.subheadlineFontStyle || "normal") === st.key;
                              return (
                                <button
                                  key={st.key}
                                  type="button"
                                  onClick={() => updateSelectedField("subheadlineFontStyle", st.key)}
                                  className={`py-1 px-2 rounded-xs border text-xs text-center transition-all cursor-pointer ${
                                    st.key === "italic" ? "italic" : ""
                                  } ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs font-semibold"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {st.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Color */}
                        <div>
                          <ColorPalettePicker
                            value={selectedSection.subheadlineColor || "auto"}
                            onChange={(val) => updateSelectedField("subheadlineColor", val)}
                            label="Subheadline / Body Text Color"
                            compact={true}
                            showAutoOption={true}
                            defaultColor="auto"
                            allowCustomHex={true}
                          />
                        </div>

                        {/* Subheadline Alignment */}
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                            Subheadline Alignment
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { key: "left", label: "Left Align", icon: "align-left" as IconName },
                              { key: "center", label: "Center Align", icon: "align-center" as IconName },
                              { key: "right", label: "Right Align", icon: "align-right" as IconName },
                            ].map((a) => {
                              const isSelected = (selectedSection.subheadlineAlign || "left") === a.key;
                              return (
                                <button
                                  key={a.key}
                                  type="button"
                                  onClick={() => updateSelectedField("subheadlineAlign", a.key)}
                                  className={`py-1 px-2 rounded-xs border text-xs text-center flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs font-semibold"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  <Icon name={a.icon} size={11} />
                                  <span>{a.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 3. Eyebrow / Badge Color & Typography Card */}
                      <div className="p-3 bg-paper/70 rounded-sm border border-line space-y-3">
                        <div className="flex items-center justify-between border-b border-line pb-1.5">
                          <strong className="text-xs font-bold text-navy-900 flex items-center gap-1">
                            <span>Eyebrow / Badge Pill</span>
                          </strong>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-navy-900/5 text-navy-900">
                            {selectedSection.badgeFontFamily || "heading"} • {selectedSection.badgeWeight || "bold"}
                          </span>
                        </div>

                        <div>
                          <ColorPalettePicker
                            value={selectedSection.badgeColor || "auto"}
                            onChange={(val) => updateSelectedField("badgeColor", val)}
                            label="Badge Text / Icon Color"
                            compact={true}
                            showAutoOption={true}
                            defaultColor="auto"
                            allowCustomHex={true}
                          />
                        </div>

                        <div>
                          <ColorPalettePicker
                            value={selectedSection.badgeBgColor || "auto"}
                            onChange={(val) => updateSelectedField("badgeBgColor", val)}
                            label="Badge Background Pill Color"
                            compact={true}
                            showAutoOption={true}
                            defaultColor="auto"
                            allowCustomHex={true}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                              Font Family
                            </label>
                            <select
                              value={selectedSection.badgeFontFamily || "heading"}
                              onChange={(e) => updateSelectedField("badgeFontFamily", e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white font-medium"
                            >
                              <option value="heading">Saira Condensed</option>
                              <option value="body">Source Sans 3</option>
                              <option value="serif">Collegiate Serif</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-1">
                              Font Weight
                            </label>
                            <select
                              value={selectedSection.badgeWeight || "bold"}
                              onChange={(e) => updateSelectedField("badgeWeight", e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-white font-medium"
                            >
                              <option value="normal">Normal (400)</option>
                              <option value="medium">Medium (500)</option>
                              <option value="semibold">Semibold (600)</option>
                              <option value="bold">Bold (700)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Split Layout Section Options */}
                    {isSplitLayout && (
                      <>
                        {/* Layout Orientation (Media Position) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                              Column Orientation
                            </label>
                            <span className="text-[10px] text-navy-900 font-bold bg-gold-100 px-1.5 py-0.5 rounded-xs">
                              2-Column Split
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => updateSelectedField("mediaPosition", "right")}
                              className={`py-2 px-3 rounded-sm border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                (selectedSection.mediaPosition || "right") === "right"
                                  ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                  : "bg-white border-line text-ink hover:border-navy-900/40"
                              }`}
                            >
                              <Icon name="layers" size={13} />
                              <span>Media Right</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSelectedField("mediaPosition", "left")}
                              className={`py-2 px-3 rounded-sm border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                selectedSection.mediaPosition === "left"
                                  ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                  : "bg-white border-line text-ink hover:border-navy-900/40"
                              }`}
                            >
                              <Icon name="layers" size={13} />
                              <span>Media Left (Flipped)</span>
                            </button>
                          </div>
                          <span className="text-[10px] text-ink-soft block mt-1 leading-tight">
                            Reorders photograph or video column before or after the text copy.
                          </span>
                        </div>

                        {/* Column Width Division Ratio */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                              Column Division & Width
                            </label>
                            <span className="text-[10px] text-ink-soft">Desktop Grid Ratio</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[
                              { key: "50-50", label: "50:50", desc: "Equal Half Columns (6 / 6)" },
                              { key: "60-40", label: "60:40", desc: "Default Primary / Side (7 / 5)" },
                              { key: "70-30", label: "70:30", desc: "Wide Primary Column (8 / 4)" },
                              { key: "40-60", label: "40:60", desc: "Wide Media / Video Column (5 / 7)" },
                              { key: "33-67", label: "33:67", desc: "Compact Text / Broad Media (4 / 8)" },
                            ].map((r) => {
                              const isSelected =
                                (selectedSection.columnRatio || "60-40") === r.key;
                              return (
                                <button
                                  key={r.key}
                                  type="button"
                                  onClick={() => updateSelectedField("columnRatio", r.key)}
                                  title={r.desc}
                                  className={`py-1.5 px-1 rounded-sm border text-xs font-semibold text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs font-bold"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-[10px] text-ink-soft block mt-1 leading-tight">
                            Dynamically adjusts the desktop width proportion between text and media columns.
                          </span>
                        </div>
                      </>
                    )}

                    {/* Grid Layout Section Options */}
                    {isGridLayout && (
                      selectedSection.type === "featured_courses" ? (
                        <CourseGridCmsControls
                          columns={selectedSection.columns || 4}
                          rows={selectedSection.rows || 2}
                          courseLimit={selectedSection.courseLimit}
                          courseCategoryFilter={selectedSection.courseCategoryFilter || "all"}
                          currentViewport={viewport}
                          onColumnsChange={(cols) => updateSelectedField("columns", cols)}
                          onRowsChange={(rows) => updateSelectedField("rows", rows)}
                          onCourseLimitChange={(limit) => updateSelectedField("courseLimit", limit)}
                          onCourseCategoryFilterChange={(cat) => updateSelectedField("courseCategoryFilter", cat)}
                        />
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                              Grid Columns
                            </label>
                            <span className="text-[10px] text-navy-900 font-bold bg-gold-100 px-1.5 py-0.5 rounded-xs">
                              Card Grid
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[2, 3, 4].map((col) => {
                              const current =
                                selectedSection.columns ||
                                (selectedSection.type === "stats_counter" ||
                                selectedSection.type === "why_smartminds"
                                  ? 4
                                  : 3);
                              const isSelected = current === col;
                              return (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => updateSelectedField("columns", col)}
                                  className={`py-1.5 rounded-sm border text-xs font-semibold text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                      : "bg-white border-line text-ink hover:border-navy-900/40"
                                  }`}
                                >
                                  {col} Columns
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-[10px] text-ink-soft block mt-1 leading-tight">
                            Select 2, 3, or 4 columns across desktop screens.
                          </span>
                        </div>
                      )
                    )}

                    {/* Mobile Overrides Visual Banner */}
                    {viewport === "mobile" && (
                      <div className="p-3 bg-navy-950 text-white rounded-sm border border-gold-400/40 space-y-1 shadow-xs">
                        <div className="flex items-center gap-1.5 text-gold-300 font-bold text-xs">
                          <Icon name="smartphone" size={14} />
                          <span>Mobile Layout Overrides Active (390px)</span>
                        </div>
                        <p className="text-[10px] text-white/70 leading-relaxed">
                          Adjusting vertical spacing or text alignment below will apply specifically to mobile screens without changing your desktop presentation.
                        </p>
                      </div>
                    )}

                    {/* Section Padding Density */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                          Vertical Spacing (Padding)
                        </label>
                        {viewport === "mobile" && selectedSection.paddingDensityMobile && (
                          <button
                            type="button"
                            onClick={() => updateSelectedField("paddingDensityMobile", undefined)}
                            className="text-[10px] text-navy-900 hover:text-gold-700 underline cursor-pointer"
                          >
                            Reset to Desktop
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: "compact", label: "Compact" },
                          { key: "normal", label: "Standard" },
                          { key: "spacious", label: "Spacious" },
                        ].map((dens) => {
                          const isSelected =
                            viewport === "mobile"
                              ? (selectedSection.paddingDensityMobile ||
                                  selectedSection.paddingDensity ||
                                  "normal") === dens.key
                              : (selectedSection.paddingDensity || "normal") === dens.key;
                          return (
                            <button
                              key={dens.key}
                              type="button"
                              onClick={() => {
                                if (viewport === "mobile") {
                                  updateSelectedField("paddingDensityMobile", dens.key);
                                } else {
                                  updateSelectedField("paddingDensity", dens.key);
                                }
                              }}
                              className={`py-1.5 rounded-sm border text-xs font-semibold text-center transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                                  : "bg-white border-line text-ink hover:border-navy-900/40"
                              }`}
                            >
                              {dens.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                          Text Alignment
                        </label>
                        {viewport === "mobile" && selectedSection.alignMobile && (
                          <button
                            type="button"
                            onClick={() => updateSelectedField("alignMobile", undefined)}
                            className="text-[10px] text-navy-900 hover:text-gold-700 underline cursor-pointer"
                          >
                            Reset to Desktop
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (viewport === "mobile") {
                              updateSelectedField("alignMobile", "left");
                            } else {
                              updateSelectedField("align", "left");
                            }
                          }}
                          className={`py-2 rounded-sm border text-xs font-semibold cursor-pointer ${
                            (viewport === "mobile"
                              ? selectedSection.alignMobile || selectedSection.align || "left"
                              : selectedSection.align || "left") === "left"
                              ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                              : "bg-white border-line text-ink"
                          }`}
                        >
                          Left Aligned
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (viewport === "mobile") {
                              updateSelectedField("alignMobile", "center");
                            } else {
                              updateSelectedField("align", "center");
                            }
                          }}
                          className={`py-2 rounded-sm border text-xs font-semibold cursor-pointer ${
                            (viewport === "mobile"
                              ? selectedSection.alignMobile || selectedSection.align
                              : selectedSection.align) === "center"
                              ? "bg-navy-900 text-white border-navy-900 shadow-xs"
                              : "bg-white border-line text-ink"
                          }`}
                        >
                          Center Aligned
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Sub-tab 3: Media & Items Repeater */}
              {inspectorSubTab === "items" && (
                <div className="p-4 space-y-5">
                  {/* Video Spotlight Settings Card */}
                  {(selectedSection.type === "testimonials" ||
                    selectedSection.type === "video_spotlight" ||
                    selectedSection.videoTitle !== undefined) && (
                    <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-line pb-2">
                        <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                          <Icon name="video" size={14} className="text-navy-900" />
                          <span>Video Spotlight Settings</span>
                        </strong>
                        <span className="text-[10px] font-mono text-ink-soft uppercase bg-white px-1.5 py-0.5 rounded border border-line">
                          {selectedSection.type === "testimonials"
                            ? "Testimonial Player"
                            : "HD Video"}
                        </span>
                      </div>

                      {/* Video Title */}
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                          Video Headline / Title
                        </label>
                        <input
                          type="text"
                          value={selectedSection.videoTitle || ""}
                          onChange={(e) =>
                            updateSelectedField("videoTitle", e.target.value)
                          }
                          placeholder="e.g. Watch learners share their qualification journey"
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
                        />
                      </div>

                      {/* Video Description */}
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                          Video Description / Caption
                        </label>
                        <textarea
                          rows={2}
                          value={selectedSection.videoDesc || ""}
                          onChange={(e) =>
                            updateSelectedField("videoDesc", e.target.value)
                          }
                          placeholder="Real student feedback recorded on placement..."
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white leading-relaxed focus:outline-none focus:border-navy-900"
                        />
                      </div>

                      {/* Video URL (Embed or Stream) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                          Video Embed URL (YouTube / TikTok / Vimeo / MP4)
                        </label>
                        <input
                          type="text"
                          value={selectedSection.videoUrl || ""}
                          onChange={(e) =>
                            updateSelectedField("videoUrl", e.target.value)
                          }
                          placeholder="https://www.youtube.com/embed/..."
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-mono text-ink-soft focus:outline-none focus:border-navy-900"
                        />
                        <span className="text-[10px] text-ink-soft block mt-0.5">
                          Privacy Guard: Third-party video scripts only load after user cookie consent.
                        </span>
                      </div>

                      {/* Video Poster Thumbnail Picker */}
                      <div className="space-y-1.5 pt-1 border-t border-line">
                        <label className="block text-[11px] font-semibold text-navy-900">
                          Video Thumbnail Poster Image
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {AVAILABLE_IMAGES.map((img) => (
                            <button
                              key={img.path}
                              type="button"
                              onClick={() =>
                                updateSelectedField("videoThumbnail", img.path)
                              }
                              className={`relative aspect-[16/9] rounded-sm overflow-hidden border-2 transition-all cursor-pointer ${
                                (selectedSection.videoThumbnail ||
                                  "/images/certificate-moment.jpg") === img.path
                                  ? "border-gold-500 shadow-md ring-2 ring-gold-500/20"
                                  : "border-line opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={img.path}
                                alt={img.label}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={selectedSection.videoThumbnail || ""}
                          onChange={(e) =>
                            updateSelectedField("videoThumbnail", e.target.value)
                          }
                          placeholder="/images/custom-thumbnail.jpg"
                          className="w-full px-2.5 py-1 border border-line rounded-sm text-[11px] bg-white font-mono text-ink-soft mt-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTargetField({ type: "videoThumbnail" });
                            setMediaModalOpen(true);
                          }}
                          className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xs bg-paper border border-line hover:border-navy-900 text-navy-900 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Icon name="image" size={13} className="text-navy-900" />
                          <span>Choose Poster from Media Library</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedSection.image !== undefined && (
                    <div id="inspector-image-control" className="space-y-3 p-3 bg-paper rounded-sm border border-line shadow-2xs">
                      <div className="flex items-center justify-between border-b border-line pb-2">
                        <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                          <Icon name="layers" size={13} className="text-gold-600" />
                          <span>Educational Photograph</span>
                        </strong>
                        <span className="text-[10px] font-mono text-ink-soft">
                          Hero & Content Media
                        </span>
                      </div>

                      {/* Direct Drag & Drop Zone */}
                      <ImageDropzone
                        value={selectedSection.image}
                        onChange={(url) => updateSelectedField("image", url)}
                        label="Drop New Image From Desktop"
                        helperText="PNG, JPG, or WebP. Replaces image immediately in live preview."
                        previewHeight={130}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setMediaTargetField({ type: "section" });
                          setMediaModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xs bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Icon name="image" size={14} className="text-gold-400" />
                        <span>Open College Media Library & Uploads</span>
                      </button>

                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[10px] font-semibold text-ink-soft uppercase tracking-wider">
                          Or select official college stock photograph:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {AVAILABLE_IMAGES.map((img) => (
                            <button
                              key={img.path}
                              type="button"
                              onClick={() => updateSelectedField("image", img.path)}
                              className={`relative aspect-[16/9] rounded-sm overflow-hidden border-2 transition-all cursor-pointer ${
                                selectedSection.image === img.path
                                  ? "border-gold-500 shadow-md ring-2 ring-gold-500/20"
                                  : "border-line opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={img.path}
                                alt={img.label}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-ink-soft block font-mono">
                        Active: {selectedSection.image}
                      </span>
                    </div>
                  )}

                  {/* Hero Floating Live Sessions Indicator Badge (also accessible under Items/Media) */}
                  {selectedSection.type === "hero" && (
                    <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-line pb-2">
                        <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                          <Icon name="sparkles" size={13} className="text-gold-500" />
                          <span>Hero Floating Live Badge</span>
                        </strong>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-navy-900">
                          <input
                            type="checkbox"
                            checked={selectedSection.floatingBadgeEnabled !== false}
                            onChange={(e) =>
                              updateSelectedField("floatingBadgeEnabled", e.target.checked)
                            }
                            className="rounded border-line text-navy-900 focus:ring-0"
                          />
                          <span>Show on Photo</span>
                        </label>
                      </div>

                      {selectedSection.floatingBadgeEnabled !== false && (
                        <>
                          {/* Live Mini Preview Box */}
                          <div className="p-2.5 bg-white rounded-xs border border-line flex items-center gap-2.5 shadow-2xs">
                            <div className="w-8 h-8 rounded-sm bg-navy-900 text-white flex items-center justify-center shrink-0">
                              <Icon
                                name={(selectedSection.floatingBadgeIcon as any) || "star"}
                                size={16}
                                className="text-gold-500"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-heading font-bold text-xs text-navy-900 block leading-tight truncate">
                                {selectedSection.floatingBadgeTitle || "Live Evening Sessions"}
                              </span>
                              <span className="text-[10px] text-ink-soft block leading-tight truncate">
                                {selectedSection.floatingBadgeSubtitle || "Recordings available 24/7 to rewatch"}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-gold-700 bg-gold-300/30 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                              Preview
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                              Badge Title
                            </label>
                            <input
                              type="text"
                              value={selectedSection.floatingBadgeTitle ?? "Live Evening Sessions"}
                              onChange={(e) =>
                                updateSelectedField("floatingBadgeTitle", e.target.value)
                              }
                              placeholder="e.g. Live Evening Sessions"
                              className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white font-medium focus:outline-none focus:border-navy-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                              Badge Subtitle / Caption
                            </label>
                            <input
                              type="text"
                              value={selectedSection.floatingBadgeSubtitle ?? "Recordings available 24/7 to rewatch"}
                              onChange={(e) =>
                                updateSelectedField("floatingBadgeSubtitle", e.target.value)
                              }
                              placeholder="e.g. Recordings available 24/7 to rewatch"
                              className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs bg-white focus:outline-none focus:border-navy-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                              Badge SVG Icon
                            </label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[
                                { name: "star", label: "Star" },
                                { name: "video", label: "Video" },
                                { name: "clock", label: "Clock" },
                                { name: "calendar", label: "Calendar" },
                                { name: "graduation-cap", label: "Academic" },
                                { name: "sparkles", label: "Sparkles" },
                                { name: "users", label: "Tutors" },
                                { name: "book-open", label: "Study" },
                                { name: "shield-check", label: "Shield" },
                                { name: "check-circle", label: "Check" },
                                { name: "play", label: "Play" },
                                { name: "bell", label: "Bell" },
                              ].map((ic) => {
                                const active = (selectedSection.floatingBadgeIcon || "star") === ic.name;
                                return (
                                  <button
                                    key={ic.name}
                                    type="button"
                                    onClick={() =>
                                      updateSelectedField("floatingBadgeIcon", ic.name)
                                    }
                                    className={`flex flex-col items-center justify-center p-2 rounded-xs border text-[10px] transition-all cursor-pointer ${
                                      active
                                        ? "bg-navy-900 text-gold-300 border-navy-900 shadow-xs ring-1 ring-gold-500"
                                        : "bg-white text-ink-soft border-line hover:border-navy-900/40"
                                    }`}
                                  >
                                    <Icon
                                      name={ic.name as any}
                                      size={16}
                                      className={active ? "text-gold-500" : "text-navy-900"}
                                    />
                                    <span className="mt-1 truncate max-w-full font-medium">
                                      {ic.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {(() => {
                    const displayedItems =
                      selectedSection.items && selectedSection.items.length > 0
                        ? selectedSection.items
                        : getDefaultItemsForSection(selectedSection.type);

                    return (
                      <div className="space-y-3 pt-3 border-t border-line">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                            {selectedSection.type === "staff_training"
                              ? `Corporate Benefit Points (${displayedItems.length})`
                              : selectedSection.type === "coral_promo"
                              ? `Promotional Bullets (${displayedItems.length})`
                              : selectedSection.type === "why_smartminds"
                              ? `Why Choose Us Features (${displayedItems.length})`
                              : selectedSection.type === "exclusive_bundles"
                              ? `Course Bundles (${displayedItems.length})`
                              : selectedSection.type === "faq_accordion"
                              ? `Questions & Answers (${displayedItems.length})`
                              : selectedSection.type === "trust_strip"
                              ? `Accreditation Bodies (${displayedItems.length})`
                              : `Modular Cards (${displayedItems.length})`}
                          </label>
                          <button
                            type="button"
                            onClick={addItemToSelected}
                            className="text-xs font-bold text-navy-900 hover:text-gold-700 underline"
                          >
                            {selectedSection.type === "staff_training"
                              ? "+ Add Benefit Point"
                              : selectedSection.type === "coral_promo"
                              ? "+ Add Bullet"
                              : selectedSection.type === "why_smartminds"
                              ? "+ Add Feature Pill"
                              : selectedSection.type === "exclusive_bundles"
                              ? "+ Add Course Bundle"
                              : selectedSection.type === "faq_accordion"
                              ? "+ Add FAQ Question"
                              : selectedSection.type === "trust_strip"
                              ? "+ Add Awarding Body"
                              : "+ Add Card / Item"}
                          </button>
                        </div>

                        {displayedItems && displayedItems.length > 0 ? (
                          <div className="space-y-3">
                            {displayedItems.map((item, i) => (
                              <div
                                key={i}
                                className="p-3 bg-paper rounded-sm border border-line space-y-2.5 relative group shadow-2xs"
                              >
                                {/* Card Item Header with Reordering and Delete */}
                                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-line/60">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-ink-soft uppercase font-bold">
                                      #{i + 1}
                                    </span>
                                    <span className="text-[11px] font-bold text-navy-900">
                                      {selectedSection.type === "staff_training"
                                        ? `Benefit Point #${i + 1}`
                                        : selectedSection.type === "coral_promo"
                                        ? `Bullet #${i + 1}`
                                        : selectedSection.type === "why_smartminds"
                                        ? `Feature Pill #${i + 1}`
                                        : selectedSection.type === "exclusive_bundles"
                                        ? `Bundle Card #${i + 1}`
                                        : `Item #${i + 1}`}
                                    </span>
                                    {item.tag && (
                                      <span className="px-1.5 py-0.5 rounded-xs bg-navy-900/10 text-navy-900 text-[9px] font-bold">
                                        {item.tag}
                                      </span>
                                    )}
                                  </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={i === 0}
                                  onClick={() => moveItemInSelected(i, "up")}
                                  className="p-1 hover:bg-white rounded-sm text-ink-soft disabled:opacity-20 transition-colors"
                                  title="Move Up"
                                >
                                  <Icon name="chevron-up" size={11} />
                                </button>
                                <button
                                  type="button"
                                  disabled={i === (selectedSection.items?.length || 0) - 1}
                                  onClick={() => moveItemInSelected(i, "down")}
                                  className="p-1 hover:bg-white rounded-sm text-ink-soft disabled:opacity-20 transition-colors"
                                  title="Move Down"
                                >
                                  <Icon name="chevron-down" size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItemFromSelected(i)}
                                  className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-sm ml-1 transition-colors"
                                  title="Delete Item"
                                >
                                  <Icon name="trash" size={11} />
                                </button>
                              </div>
                            </div>

                            {/* SPECIALIZED UI: FAQ Accordion Item */}
                            {selectedSection.type === "faq_accordion" ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                    Question / Accordion Heading
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Are your qualifications recognized by employers?"
                                    value={item.title}
                                    onChange={(e) =>
                                      updateItemField(i, "title", e.target.value)
                                    }
                                    className="w-full px-2.5 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                    Answer Content
                                  </label>
                                  <textarea
                                    rows={3}
                                    placeholder="Clear, authentic answer for learners..."
                                    value={item.desc || ""}
                                    onChange={(e) =>
                                      updateItemField(i, "desc", e.target.value)
                                    }
                                    className="w-full px-2.5 py-1 text-xs border border-line rounded-sm bg-white leading-relaxed"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                    Category Tag
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Accreditation, Teaching, Payments, Funding"
                                    value={item.tag || ""}
                                    onChange={(e) =>
                                      updateItemField(i, "tag", e.target.value)
                                    }
                                    className="w-full px-2 py-1 text-[11px] border border-line rounded-sm bg-white"
                                  />
                                </div>
                              </div>
                            ) : selectedSection.type === "trust_strip" ? (
                              /* SPECIALIZED UI: Accreditation Body */
                              <div className="space-y-2.5">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                      Organisation Name
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Ofqual, TQUK"
                                      value={item.title}
                                      onChange={(e) =>
                                        updateItemField(i, "title", e.target.value)
                                      }
                                      className="w-full px-2 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                      Subtitle / Status
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Regulated, Approved Centre"
                                      value={item.desc || ""}
                                      onChange={(e) =>
                                        updateItemField(i, "desc", e.target.value)
                                      }
                                      className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                                    />
                                  </div>
                                </div>

                                <ImageDropzone
                                  value={item.image}
                                  onChange={(url) => updateItemField(i, "image", url)}
                                  label="Upload Body Logo (Equal Height)"
                                  helperText="SVG or PNG with transparent background"
                                  previewHeight={32}
                                />

                                <div>
                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                    Official Register Link (optional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="https://..."
                                    value={item.link || ""}
                                    onChange={(e) =>
                                      updateItemField(i, "link", e.target.value)
                                    }
                                    className="w-full px-2 py-1 text-[11px] font-mono border border-line rounded-sm bg-white"
                                  />
                                </div>
                              </div>
                            ) : (
                              /* GENERAL REPEATER CARDS (why_smartminds, stats_counter, etc.) */
                              <div className="space-y-2">
                                {/* SVG Line Icon Selector */}
                                <div>
                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                    SVG Line Icon
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-sm bg-navy-900 text-white flex items-center justify-center flex-shrink-0">
                                      <Icon
                                        name={(item.icon as IconName) || "check-circle"}
                                        size={13}
                                        className="text-gold-500"
                                      />
                                    </div>
                                    <select
                                      value={item.icon || "check-circle"}
                                      onChange={(e) =>
                                        updateItemField(i, "icon", e.target.value)
                                      }
                                      className="flex-1 px-2 py-1 text-xs border border-line rounded-sm bg-white font-medium"
                                    >
                                      {AVAILABLE_ITEM_ICONS.map((ic) => (
                                        <option key={ic.name} value={ic.name}>
                                          {ic.label} ({ic.name})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Title */}
                                <div>
                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                    Card Title / Metric Headline
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Title / Metric"
                                    value={item.title}
                                    onChange={(e) =>
                                      updateItemField(i, "title", e.target.value)
                                    }
                                    className="w-full px-2 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                                  />
                                </div>

                                {/* Subtitle / Role */}
                                <div>
                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                    Subtitle / Role
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Care Assistant to Registered Manager"
                                    value={item.subtitle || ""}
                                    onChange={(e) =>
                                      updateItemField(i, "subtitle", e.target.value)
                                    }
                                    className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                                  />
                                </div>

                                {/* Description */}
                                <div>
                                  <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                    Explanatory Copy / Details
                                  </label>
                                  <textarea
                                    rows={2}
                                    placeholder="Detailed description..."
                                    value={item.desc || ""}
                                    onChange={(e) =>
                                      updateItemField(i, "desc", e.target.value)
                                    }
                                    className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white leading-normal"
                                  />
                                </div>

                                {/* Tag & Link URL */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                      Pill Tag / Badge
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Ofqual, 0% APR"
                                      value={item.tag || ""}
                                      onChange={(e) =>
                                        updateItemField(i, "tag", e.target.value)
                                      }
                                      className="w-full px-2 py-1 text-[11px] border border-line rounded-sm bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                      Link Destination (URL)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. /courses or #apply"
                                      value={item.link || ""}
                                      onChange={(e) =>
                                        updateItemField(i, "link", e.target.value)
                                      }
                                      className="w-full px-2 py-1 text-[11px] font-mono border border-line rounded-sm bg-white"
                                    />
                                  </div>

                                  {/* Card Photograph / Logo (Optional) */}
                                  <div>
                                    <label className="block text-[10px] font-semibold text-ink-soft uppercase mb-0.5">
                                      Card Photograph / Logo (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="/images/... or /uploads/..."
                                      value={item.image || ""}
                                      onChange={(e) => updateItemField(i, "image", e.target.value)}
                                      className="w-full px-2 py-1 text-[11px] font-mono border border-line rounded-sm bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMediaTargetField({ type: "item", itemIdx: i });
                                        setMediaModalOpen(true);
                                      }}
                                      className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-1 px-2 rounded-xs bg-white border border-line hover:border-navy-900 text-navy-900 text-[10px] font-bold transition-colors cursor-pointer"
                                    >
                                      <Icon name="image" size={12} className="text-navy-900" />
                                      <span>Choose from Media Library</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Bundle Pricing Fields */}
                                {(selectedSection.type === "exclusive_bundles" || item.price !== undefined) && (
                                  <div className="p-2.5 bg-paper rounded-xs border border-line space-y-1.5 mt-2">
                                    <span className="text-[10px] font-bold text-navy-900 block uppercase tracking-wider">
                                      Bundle Pricing &amp; Savings
                                    </span>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      <div>
                                        <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                          Sale Price
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g. £1,890.00"
                                          value={item.price || ""}
                                          onChange={(e) => updateItemField(i, "price", e.target.value)}
                                          className="w-full px-2 py-1 text-xs font-bold text-emerald-800 border border-line rounded-sm bg-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                          Original Price
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g. £2,450.00"
                                          value={item.originalPrice || ""}
                                          onChange={(e) => updateItemField(i, "originalPrice", e.target.value)}
                                          className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-mono text-ink-soft"
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      <div>
                                        <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                          Savings Tag
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g. Save £560"
                                          value={item.saveAmount || ""}
                                          onChange={(e) => updateItemField(i, "saveAmount", e.target.value)}
                                          className="w-full px-2 py-1 text-xs font-bold text-[#FF5722] border border-line rounded-sm bg-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                          Monthly Rate
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g. £157.50/mo"
                                          value={item.monthly || ""}
                                          onChange={(e) => updateItemField(i, "monthly", e.target.value)}
                                          className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-mono"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Item Styling & Brand Colors */}
                                <div className="p-2.5 bg-paper rounded-xs border border-line space-y-2 mt-2">
                                  <span className="text-[10px] font-bold text-navy-900 block uppercase tracking-wider flex items-center gap-1">
                                    <Icon name="sparkles" size={11} className="text-gold-500" />
                                    <span>Item Styling & Brand Colors</span>
                                  </span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                      <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                        Title Color
                                      </label>
                                      <select
                                        value={item.titleColor || "auto"}
                                        onChange={(e) => updateItemField(i, "titleColor", e.target.value)}
                                        className="w-full px-1.5 py-1 text-[11px] border border-line rounded-xs bg-white"
                                      >
                                        <option value="auto">Adaptive Auto</option>
                                        <option value="navy">Royal Navy 900</option>
                                        <option value="gold">Gold 500</option>
                                        <option value="white">Pure White</option>
                                        <option value="ink_soft">Soft Charcoal</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                        Description Color
                                      </label>
                                      <select
                                        value={item.descColor || "auto"}
                                        onChange={(e) => updateItemField(i, "descColor", e.target.value)}
                                        className="w-full px-1.5 py-1 text-[11px] border border-line rounded-xs bg-white"
                                      >
                                        <option value="auto">Adaptive Auto</option>
                                        <option value="ink_soft">Soft Charcoal</option>
                                        <option value="navy">Royal Navy</option>
                                        <option value="white">Pure White</option>
                                        <option value="gold">Gold Accent</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                      <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                        Card Surface
                                      </label>
                                      <select
                                        value={item.cardBg || "white"}
                                        onChange={(e) => updateItemField(i, "cardBg", e.target.value)}
                                        className="w-full px-1.5 py-1 text-[11px] border border-line rounded-xs bg-white"
                                      >
                                        <option value="white">Crisp White</option>
                                        <option value="paper">Parchment Paper</option>
                                        <option value="navy">Royal Navy (Dark)</option>
                                        <option value="gold_subtle">Subtle Gold</option>
                                        <option value="transparent">Transparent</option>
                                        <option value="mint">Soft Mint (Why Choose Us)</option>
                                        <option value="peach">Warm Peach (Why Choose Us)</option>
                                        <option value="lavender">Soft Lavender (Why Choose Us)</option>
                                        <option value="sky">Soft Sky Blue (Why Choose Us)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                        Card Border
                                      </label>
                                      <select
                                        value={item.cardBorder || "line"}
                                        onChange={(e) => updateItemField(i, "cardBorder", e.target.value)}
                                        className="w-full px-1.5 py-1 text-[11px] border border-line rounded-xs bg-white"
                                      >
                                        <option value="line">Subtle Line</option>
                                        <option value="gold">Gold Accent</option>
                                        <option value="navy">Navy Border</option>
                                        <option value="none">Borderless</option>
                                      </select>
                                    </div>
                                  </div>
                                  {selectedSection.type === "why_smartminds" && (
                                    <div className="mt-1.5">
                                      <label className="block text-[9px] font-semibold text-ink-soft uppercase mb-0.5">
                                        Icon Tone
                                      </label>
                                      <select
                                        value={item.iconColor || "emerald"}
                                        onChange={(e) => updateItemField(i, "iconColor", e.target.value)}
                                        className="w-full px-1.5 py-1 text-[11px] border border-line rounded-xs bg-white"
                                      >
                                        <option value="emerald">Emerald (Mint)</option>
                                        <option value="amber">Warm Amber (Peach)</option>
                                        <option value="purple">Lavender Purple</option>
                                        <option value="cyan">Sky Cyan</option>
                                        <option value="gold">Gold</option>
                                        <option value="navy">Navy</option>
                                      </select>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedElementKey("item");
                                      setSelectedElementItemIndex(i);
                                    }}
                                    className="w-full py-1.5 px-2 mt-1 text-[10px] font-bold text-navy-900 bg-white hover:bg-gold-50 border border-line rounded-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Icon name="sparkles" size={11} className="text-gold-500" />
                                    <span>Focus & Style {selectedSection.type === "staff_training" ? "Benefit Point" : selectedSection.type === "coral_promo" ? "Bullet" : "Card"}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink-soft italic">
                        {selectedSection.type === "faq_accordion"
                          ? 'No FAQ questions configured yet. Click "+ Add FAQ Question" above to add one.'
                          : selectedSection.type === "trust_strip"
                          ? 'No accreditation bodies configured yet. Click "+ Add Awarding Body" above to add one.'
                          : 'This section has no child items. Click "+ Add Card / Item" above to add modular cards.'}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
              )}
            </>
          )}
        </div>
      )}

          {/* TAB 3: Widget Palette & Reusable Templates (Wix & Elementor Drag Elements) */}
          {sidebarTab === "widgets" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
              {/* SECTION A: Super Admin Reusable Templates */}
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-sm shadow-subtle space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold-300 flex items-center gap-1.5">
                      <Icon name="sparkles" size={12} className="text-gold-400" />
                      <span>Reusable Templates</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-white/10 text-paper font-semibold">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-paper/80 leading-snug">
                    Pre-assembled composite blocks. Insert any ready-made layout with 1 click — no manual column setup or coding required.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => insertWidgetAt("composite_block")}
                      className="px-2.5 py-1 bg-gold-500 hover:bg-gold-400 text-navy-900 rounded-xs text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Icon name="plus" size={11} />
                      <span>+ Blank Modular Block</span>
                    </button>
                  </div>
                </div>

                {/* Templates List */}
                {savedTemplates && savedTemplates.length > 0 ? (
                  <div className="space-y-2.5">
                    {savedTemplates.map((tmpl) => {
                      const totalWidgets =
                        tmpl.compositeColumns?.reduce(
                          (acc, col) => acc + (col.widgets?.length || 0),
                          0
                        ) || 0;
                      const isUserCreated = tmpl.id.startsWith("tmpl-user-");

                      return (
                        <div
                          key={tmpl.id}
                          className="p-3 rounded-sm border border-gold-300/80 bg-gold-50/40 hover:bg-white hover:border-navy-900 transition-all space-y-2 shadow-2xs group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <strong className="text-xs font-bold text-navy-900 group-hover:text-navy-700">
                                  {tmpl.name}
                                </strong>
                                {tmpl.templateCategory && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-gold-200/80 text-navy-900 font-mono font-semibold">
                                    {tmpl.templateCategory}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-ink-soft">
                                <span>{tmpl.columns || 2} Columns ({tmpl.columnRatio || "Split"})</span>
                                <span>•</span>
                                <span>{totalWidgets} Micro-Widgets</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {isUserCreated && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSavedTemplate(tmpl.id);
                                  }}
                                  className="p-1 hover:bg-rose-100 text-rose-700 rounded-xs text-xs"
                                  title="Delete custom template"
                                >
                                  <Icon name="trash" size={12} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => insertTemplateAt(tmpl)}
                                className="px-2 py-1 bg-navy-900 hover:bg-navy-800 text-gold-300 group-hover:bg-navy-950 rounded-xs text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                              >
                                <Icon name="plus" size={11} />
                                <span>Insert</span>
                              </button>
                            </div>
                          </div>

                          {tmpl.templateDesc && (
                            <p className="text-[11px] text-ink-soft leading-normal">
                              {tmpl.templateDesc}
                            </p>
                          )}

                          {/* Preview chips of micro-widgets included */}
                          {tmpl.compositeColumns && tmpl.compositeColumns.length > 0 && (
                            <div className="pt-1 flex flex-wrap gap-1">
                              {tmpl.compositeColumns.flatMap((col, cIdx) =>
                                (col.widgets || []).map((w, wIdx) => (
                                  <span
                                    key={`${cIdx}-${wIdx}`}
                                    className="text-[9px] px-1.5 py-0.5 rounded-xs bg-white border border-line text-ink-soft font-mono"
                                  >
                                    Col {cIdx + 1}: {w.type.replace("_", " ")}
                                  </span>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-ink-soft italic p-2 border border-dashed rounded-sm text-center">
                    No saved templates yet. Click &quot;Save as Reusable Widget&quot; in any composite block to add one here.
                  </p>
                )}
              </div>

              {/* SECTION B: Elementor & Webflow Widget Library */}
              <div className="space-y-3 pt-3 border-t border-line">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider block">
                      Elementor / Webflow Palette
                    </span>
                    <strong className="text-xs font-bold text-navy-900">
                      Standard Page Widgets
                    </strong>
                  </div>
                  <span className="text-[10px] text-ink-soft font-mono">
                    {WIDGET_DEFINITIONS.length} Available
                  </span>
                </div>

                {/* 1. Elementor Widget Search Filter */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search widgets (e.g. video, quote, cta)..."
                    value={widgetSearchQuery}
                    onChange={(e) => setWidgetSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-line rounded-sm bg-white focus:outline-none focus:border-navy-900"
                  />
                  {widgetSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setWidgetSearchQuery("")}
                      className="absolute right-2.5 top-2 text-ink-soft hover:text-navy-900 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 2. Category Filter Pills */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "Header & Lead", label: "Hero" },
                    { key: "Courses & Curricula", label: "Courses" },
                    { key: "Trust & Badges", label: "Trust" },
                    { key: "Social Proof", label: "Proof" },
                    { key: "Conversion", label: "Leads & CTA" },
                    { key: "Custom Builder", label: "Modular" },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setWidgetCategoryFilter(cat.key)}
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold transition-all cursor-pointer ${
                        widgetCategoryFilter === cat.key
                          ? "bg-navy-900 text-gold-300 font-bold shadow-2xs"
                          : "bg-paper hover:bg-white text-ink-soft hover:text-navy-900 border border-line"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* 3. Filtered Widgets List */}
                <div className="space-y-2">
                  {(() => {
                    const filtered = WIDGET_DEFINITIONS.filter((w) => {
                      const q = widgetSearchQuery.toLowerCase().trim();
                      const matchesSearch =
                        !q ||
                        w.title.toLowerCase().includes(q) ||
                        w.desc.toLowerCase().includes(q) ||
                        w.category.toLowerCase().includes(q) ||
                        w.type.toLowerCase().includes(q);
                      const matchesCategory =
                        widgetCategoryFilter === "all" ||
                        w.category === widgetCategoryFilter;
                      return matchesSearch && matchesCategory;
                    });

                    if (filtered.length === 0) {
                      return (
                        <p className="text-xs text-ink-soft italic p-4 text-center border border-dashed rounded-sm">
                          No widgets matching &quot;{widgetSearchQuery}&quot;.
                        </p>
                      );
                    }

                    return filtered.map((w) => (
                      <div
                        key={w.type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/widget-type", w.type);
                          setDraggedWidgetType(w.type);
                        }}
                        onDragEnd={handleDragEnd}
                        onClick={() => insertWidgetAt(w.type)}
                        className="p-3 rounded-sm border border-line bg-paper hover:bg-white hover:border-navy-900 transition-all cursor-grab active:cursor-grabbing space-y-1 shadow-xs group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-xs bg-navy-100 group-hover:bg-navy-900 text-navy-900 group-hover:text-gold-300 flex items-center justify-center transition-colors shrink-0">
                              <Icon name={w.iconName} size={13} />
                            </div>
                            <strong className="text-xs font-bold text-navy-900 group-hover:text-navy-700 truncate">
                              {w.title}
                            </strong>
                          </div>
                          <span className="text-[11px] font-bold text-navy-900 group-hover:text-gold-700 flex items-center gap-0.5 shrink-0">
                            <Icon name="plus" size={11} />
                            <span>Insert</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-soft leading-normal pl-8">
                          {w.desc}
                        </p>
                        <div className="pl-8 pt-0.5">
                          <span className="inline-block text-[9px] px-1.5 py-0.2 rounded-xs bg-line/60 font-mono text-ink-soft uppercase">
                            {w.category}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Navigation Menu, Header & Logo Editor */}
          {sidebarTab === "menu" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
              <div className="border-b border-line pb-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider block">
                    Branding & Navigation
                  </span>
                  <strong className="text-sm font-bold text-navy-900">
                    Header & Logo Customisation
                  </strong>
                </div>
                <button
                  onClick={handleSaveHeaderNav}
                  disabled={isPending}
                  className="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 text-white rounded-sm text-xs font-bold transition-all shadow-xs"
                >
                  {isPending ? "Saving..." : "Publish Header"}
                </button>
              </div>

              {/* 1. Logo Style & Brand Identity */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="sparkles" size={14} className="text-gold-500" />
                    <span>Logo & Brand Identity</span>
                  </strong>
                  <span className="text-[10px] font-mono text-ink-soft uppercase">
                    Mode: {headerNav.logoType || "vector"}
                  </span>
                </div>

                {/* Logo Style Toggle */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-sm border border-line">
                  <button
                    type="button"
                    onClick={() =>
                      setHeaderNav({ ...headerNav, logoType: "vector" })
                    }
                    className={`py-1.5 px-2 text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${
                      (headerNav.logoType || "vector") === "vector"
                        ? "bg-navy-900 text-white shadow-xs font-bold"
                        : "text-ink-soft hover:text-navy-900 hover:bg-paper"
                    }`}
                  >
                    <Icon name="shield-check" size={13} />
                    <span>Vector Crest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setHeaderNav({ ...headerNav, logoType: "image" })
                    }
                    className={`py-1.5 px-2 text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${
                      headerNav.logoType === "image"
                        ? "bg-navy-900 text-white shadow-xs font-bold"
                        : "text-ink-soft hover:text-navy-900 hover:bg-paper"
                    }`}
                  >
                    <Icon name="layers" size={13} />
                    <span>Custom Image</span>
                  </button>
                </div>

                {/* If Custom Image Logo selected */}
                {headerNav.logoType === "image" && (
                  <div className="space-y-3 pt-1 border-t border-line">
                    <ImageDropzone
                      value={headerNav.logoImageUrl}
                      onChange={(url) =>
                        setHeaderNav({
                          ...headerNav,
                          logoImageUrl: url,
                        })
                      }
                      label="Upload College Logo"
                      helperText="PNG, SVG, or WebP with transparent background (equal optical height)"
                      previewHeight={headerNav.logoHeight || 44}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setMediaTargetField({ type: "logo" });
                        setMediaModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xs bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Icon name="image" size={14} className="text-gold-400" />
                      <span>Choose Logo from Media Library</span>
                    </button>

                    {/* Quick Logo Asset Presets */}
                    <div>
                      <label className="block text-[10px] text-ink-soft mb-1">
                        Select official college logo asset:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_LOGO_PRESETS.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setHeaderNav({
                                ...headerNav,
                                logoImageUrl: img.path,
                              })
                            }
                            className={`p-1.5 rounded-sm border text-[11px] truncate text-left transition-all cursor-pointer ${
                              headerNav.logoImageUrl === img.path
                                ? "border-navy-900 bg-navy-50 font-bold text-navy-900"
                                : "border-line bg-white hover:bg-paper text-ink"
                            }`}
                          >
                            <span className="block truncate">{img.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Height Control */}
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-line">
                      <label className="text-[11px] text-navy-900 font-semibold">
                        Logo Height: {headerNav.logoHeight || 44}px
                      </label>
                      <input
                        type="range"
                        min="24"
                        max="80"
                        value={headerNav.logoHeight || 44}
                        onChange={(e) =>
                          setHeaderNav({
                            ...headerNav,
                            logoHeight: Number(e.target.value),
                          })
                        }
                        className="w-32 accent-navy-900"
                      />
                    </div>
                  </div>
                )}

                {/* Wordmark Name & Tagline */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
                  <div>
                    <label className="block text-[10px] font-bold text-navy-900 mb-0.5">
                      College Name
                    </label>
                    <input
                      type="text"
                      value={headerNav.siteName || "Smartminds"}
                      onChange={(e) =>
                        setHeaderNav({
                          ...headerNav,
                          siteName: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-navy-900 mb-0.5">
                      Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={headerNav.tagline !== undefined ? headerNav.tagline : "Training College"}
                      onChange={(e) =>
                        setHeaderNav({
                          ...headerNav,
                          tagline: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Header Navigation Styling & Appearance */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-line/60">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="sparkles" size={14} className="text-gold-500" />
                    <span>Header Styling & Typography</span>
                  </strong>
                  <span className="text-[10px] font-mono text-ink-soft uppercase">
                    Theme & Colors
                  </span>
                </div>

                {/* Header Background Color */}
                <div>
                  <ColorPalettePicker
                    value={headerNav.headerBgColor || "auto"}
                    onChange={(val) =>
                      setHeaderNav({
                        ...headerNav,
                        headerBgColor: val === "auto" ? "" : val,
                      })
                    }
                    label="Header Bar Background Color"
                    showAutoOption={true}
                    defaultColor="auto"
                    allowCustomHex={true}
                  />
                  <span className="text-[10px] text-ink-soft block mt-1">
                    Auto uses college light teal on homepage and crisp white across inner qualification pages.
                  </span>
                </div>

                {/* Nav Links Text Color & Active/Hover Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-line/60">
                  <ColorPalettePicker
                    value={headerNav.headerTextColor || "auto"}
                    onChange={(val) =>
                      setHeaderNav({
                        ...headerNav,
                        headerTextColor: val === "auto" ? "" : val,
                      })
                    }
                    label="Navigation Links Text Color"
                    compact={true}
                    showAutoOption={true}
                    defaultColor="auto"
                  />
                  <ColorPalettePicker
                    value={headerNav.headerActiveLinkColor || "auto"}
                    onChange={(val) =>
                      setHeaderNav({
                        ...headerNav,
                        headerActiveLinkColor: val === "auto" ? "" : val,
                      })
                    }
                    label="Active Link & Accent Color"
                    compact={true}
                    showAutoOption={true}
                    defaultColor="auto"
                  />
                </div>

                {/* Navigation Font Family */}
                <div className="pt-2 border-t border-line/60">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1.5">
                    Menu Font Family & Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setHeaderNav({
                          ...headerNav,
                          headerFontFamily: "body",
                        })
                      }
                      className={`py-2 px-2.5 rounded-sm border text-xs font-semibold text-left transition-all cursor-pointer ${
                        (headerNav.headerFontFamily || "body") === "body"
                          ? "border-navy-900 bg-white font-bold text-navy-900 shadow-xs"
                          : "border-line bg-paper/60 text-ink-soft hover:bg-white"
                      }`}
                    >
                      <span className="block font-sans text-xs">Humanist Sans</span>
                      <span className="text-[10px] font-normal text-ink-soft block">Source Sans 3 (Standard)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHeaderNav({
                          ...headerNav,
                          headerFontFamily: "heading",
                        })
                      }
                      className={`py-2 px-2.5 rounded-sm border text-xs font-semibold text-left transition-all cursor-pointer ${
                        headerNav.headerFontFamily === "heading"
                          ? "border-navy-900 bg-white font-bold text-navy-900 shadow-xs"
                          : "border-line bg-paper/60 text-ink-soft hover:bg-white"
                      }`}
                    >
                      <span className="block font-heading uppercase tracking-wider text-xs">Editorial Condensed</span>
                      <span className="text-[10px] font-normal text-ink-soft block">Saira Condensed (Bold)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Top Announcement Bar Settings */}
              {(() => {
                const getEffectiveAnnouncements = (): AnnouncementItem[] => {
                  if (headerNav.announcements && headerNav.announcements.length > 0) {
                    return headerNav.announcements;
                  }
                  if (headerNav.announcementText) {
                    return [
                      {
                        id: "ann-1",
                        text: headerNav.announcementText,
                        link: headerNav.announcementLink || "",
                        badge: "0% FINANCE",
                        active: headerNav.announcementActive,
                      },
                    ];
                  }
                  return defaultAnnouncements;
                };

                const currentAnnouncements = getEffectiveAnnouncements();

                const handleAddAnnouncement = () => {
                  const newAnn: AnnouncementItem = {
                    id: `ann-${Date.now().toString().slice(-4)}`,
                    text: "New upcoming cohort enrolling now — limited places available",
                    link: "/funding",
                    badge: "NEW",
                    active: true,
                  };
                  const updated = [...currentAnnouncements, newAnn];
                  setHeaderNav({
                    ...headerNav,
                    announcements: updated,
                    announcementText: updated.find((a) => a.active)?.text || updated[0]?.text || "",
                    announcementLink: updated.find((a) => a.active)?.link || updated[0]?.link || "",
                  });
                };

                const handleUpdateAnnouncement = (id: string, patch: Partial<AnnouncementItem>) => {
                  const updated = currentAnnouncements.map((a) => (a.id === id ? { ...a, ...patch } : a));
                  setHeaderNav({
                    ...headerNav,
                    announcements: updated,
                    announcementText: updated.find((a) => a.active)?.text || updated[0]?.text || "",
                    announcementLink: updated.find((a) => a.active)?.link || updated[0]?.link || "",
                  });
                };

                const handleRemoveAnnouncement = (id: string) => {
                  if (currentAnnouncements.length <= 1) {
                    alert("At least one announcement item must remain. You can uncheck 'Active' to hide it.");
                    return;
                  }
                  const updated = currentAnnouncements.filter((a) => a.id !== id);
                  setHeaderNav({
                    ...headerNav,
                    announcements: updated,
                    announcementText: updated.find((a) => a.active)?.text || updated[0]?.text || "",
                    announcementLink: updated.find((a) => a.active)?.link || updated[0]?.link || "",
                  });
                };

                const handleMoveAnnouncement = (index: number, direction: "up" | "down") => {
                  const targetIndex = direction === "up" ? index - 1 : index + 1;
                  if (targetIndex < 0 || targetIndex >= currentAnnouncements.length) return;
                  const listCopy = [...currentAnnouncements];
                  const [moved] = listCopy.splice(index, 1);
                  listCopy.splice(targetIndex, 0, moved);
                  setHeaderNav({
                    ...headerNav,
                    announcements: listCopy,
                    announcementText: listCopy.find((a) => a.active)?.text || listCopy[0]?.text || "",
                    announcementLink: listCopy.find((a) => a.active)?.link || listCopy[0]?.link || "",
                  });
                };

                return (
                  <div className="p-3 bg-paper rounded-sm border border-line space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-line/60">
                      <div>
                        <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                          <Icon name="bell" size={13} className="text-gold-700" />
                          <span>Top Announcement Bar ({currentAnnouncements.length})</span>
                        </strong>
                        <p className="text-[10px] text-ink-soft">
                          Rotating gold ticker displayed above the main header menu.
                        </p>
                      </div>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-ink-soft cursor-pointer">
                        <input
                          type="checkbox"
                          checked={headerNav.announcementActive}
                          onChange={(e) =>
                            setHeaderNav({
                              ...headerNav,
                              announcementActive: e.target.checked,
                            })
                          }
                          className="rounded-sm text-navy-900"
                        />
                        <span>Master Active</span>
                      </label>
                    </div>

                    {/* Announcement Bar Color Picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-b border-line/60 pb-3">
                      <ColorPalettePicker
                        value={headerNav.announcementBgColor || "#D9B84A"}
                        onChange={(val) => setHeaderNav({ ...headerNav, announcementBgColor: val })}
                        label="Ticker Background Color"
                        compact={true}
                        defaultColor="#D9B84A"
                      />
                      <ColorPalettePicker
                        value={headerNav.announcementTextColor || "#FFFFFF"}
                        onChange={(val) => setHeaderNav({ ...headerNav, announcementTextColor: val })}
                        label="Ticker Text Color"
                        compact={true}
                        defaultColor="#FFFFFF"
                      />
                    </div>

                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-0.5">
                      {currentAnnouncements.map((ann, idx) => (
                        <div
                          key={ann.id || idx}
                          className={`p-2.5 rounded-sm border transition-all ${
                            ann.active
                              ? "bg-white border-line shadow-2xs"
                              : "bg-paper/70 border-line/50 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-navy-900 bg-gold-300/40 px-1.5 py-0.5 rounded-xs">
                                #{idx + 1}
                              </span>
                              <label className="flex items-center gap-1 text-[10px] font-semibold text-ink cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={ann.active}
                                  onChange={(e) =>
                                    handleUpdateAnnouncement(ann.id, { active: e.target.checked })
                                  }
                                  className="rounded-sm"
                                />
                                <span>Active</span>
                              </label>
                            </div>

                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveAnnouncement(idx, "up")}
                                className="p-1 text-ink-soft hover:text-navy-900 disabled:opacity-25"
                                title="Move Announcement Up"
                              >
                                <Icon name="chevron-up" size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === currentAnnouncements.length - 1}
                                onClick={() => handleMoveAnnouncement(idx, "down")}
                                className="p-1 text-ink-soft hover:text-navy-900 disabled:opacity-25"
                                title="Move Announcement Down"
                              >
                                <Icon name="chevron-down" size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAnnouncement(ann.id)}
                                className="p-1 text-ink-soft hover:text-rose-600 ml-1"
                                title="Remove Announcement"
                              >
                                <Icon name="trash" size={11} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {/* 1. Badge Input */}
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-ink-soft mb-0.5">
                                Promotional Badge (optional)
                              </label>
                              <input
                                type="text"
                                value={ann.badge || ""}
                                onChange={(e) =>
                                  handleUpdateAnnouncement(ann.id, { badge: e.target.value })
                                }
                                placeholder="e.g. 0% FINANCE, OFFER, ACCREDITED"
                                className="w-full px-2 py-1 text-[11px] border border-line rounded-xs bg-paper focus:bg-white font-bold text-navy-900 uppercase"
                              />
                            </div>

                            {/* 2. Announcement Text / Writeup (BEFORE the Link) */}
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-ink-soft mb-0.5">
                                Announcement Text / Writeup
                              </label>
                              <textarea
                                rows={2}
                                value={ann.text}
                                onChange={(e) =>
                                  handleUpdateAnnouncement(ann.id, { text: e.target.value })
                                }
                                className="w-full px-2 py-1 text-xs border border-line rounded-xs bg-paper focus:bg-white leading-normal"
                                placeholder="e.g. Autumn & Winter 2026 Cohorts Enrolling Now..."
                              />
                            </div>

                            {/* 3. Link Destination (AFTER the Writeup) */}
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-ink-soft mb-0.5">
                                Link Destination (placed after writeup)
                              </label>
                              <input
                                type="text"
                                value={ann.link || ""}
                                onChange={(e) =>
                                  handleUpdateAnnouncement(ann.id, { link: e.target.value })
                                }
                                placeholder="/funding or /courses"
                                className="w-full px-2 py-1 text-[11px] border border-line rounded-xs bg-paper focus:bg-white font-mono"
                              />
                              <div className="flex items-center gap-1 flex-wrap pt-1">
                                <span className="text-[9px] text-ink-soft">Quick links:</span>
                                {["/funding", "/courses", "/contact", "/book"].map((qk) => (
                                  <button
                                    key={qk}
                                    type="button"
                                    onClick={() => handleUpdateAnnouncement(ann.id, { link: qk })}
                                    className="text-[9px] px-1.5 py-0.5 bg-paper rounded border border-line hover:border-navy-900 text-ink-soft font-mono cursor-pointer"
                                  >
                                    {qk}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAnnouncement}
                      className="w-full py-1.5 px-3 bg-navy-900 text-gold-300 hover:bg-navy-800 text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Icon name="plus" size={12} />
                      <span>Add Announcement Banner</span>
                    </button>
                  </div>
                );
              })()}

              {/* 3. Navigation Links Reorderable List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                    Header Menu Items ({headerNav.navLinks.length})
                  </label>
                  <button
                    onClick={addNavLink}
                    className="text-xs font-bold text-navy-900 hover:text-gold-700 underline flex items-center gap-1"
                  >
                    <Icon name="plus" size={12} />
                    <span>Add Link</span>
                  </button>
                </div>

                {headerNav.navLinks.map((link, i) => (
                  <div
                    key={link.id}
                    className="p-2.5 bg-white rounded-sm border border-line shadow-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-[10px] font-mono text-ink-soft/70">
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateNavLink(i, "label", e.target.value)}
                          className="px-2 py-0.5 text-xs font-bold border border-line rounded-sm flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={i === 0}
                          onClick={() => moveNavLink(i, "up")}
                          className="p-1 text-xs hover:bg-paper rounded-sm disabled:opacity-20"
                          title="Move Up"
                        >
                          <Icon name="chevron-up" size={12} />
                        </button>
                        <button
                          disabled={i === headerNav.navLinks.length - 1}
                          onClick={() => moveNavLink(i, "down")}
                          className="p-1 text-xs hover:bg-paper rounded-sm disabled:opacity-20"
                          title="Move Down"
                        >
                          <Icon name="chevron-down" size={12} />
                        </button>
                        <button
                          onClick={() => removeNavLink(i)}
                          className="p-1 text-xs hover:bg-rose-50 text-rose-700 rounded-sm"
                          title="Remove Link"
                        >
                          <Icon name="close" size={12} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => updateNavLink(i, "href", e.target.value)}
                        placeholder="/destination"
                        className="w-full px-2 py-0.5 text-[11px] font-mono border border-line rounded-sm text-ink-soft"
                      />
                    </div>

                    {/* Multi-Level Dropdown Sub-menu Management */}
                    <div className="pt-2 border-t border-line/60">
                      {link.children && link.children.length > 0 ? (
                        <div className="bg-paper p-2.5 rounded-sm border border-line space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-navy-900 uppercase font-mono tracking-wider flex items-center gap-1">
                              <Icon name="layers" size={11} className="text-gold-700" />
                              <span>Dropdown Menu ({link.children.length})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => addNavChild(i)}
                              className="text-[11px] font-bold text-navy-900 hover:text-gold-700 underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Icon name="plus" size={10} />
                              <span>Add Sub-Item</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {link.children.map((child, ci) => (
                              <div
                                key={child.id || ci}
                                className="bg-white p-2 rounded-xs border border-line space-y-1.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 flex-1">
                                    <span className="text-[9px] font-mono text-ink-soft">
                                      {i + 1}.{ci + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={child.label}
                                      onChange={(e) =>
                                        updateNavChild(i, ci, "label", e.target.value)
                                      }
                                      placeholder="Sub-menu Title"
                                      className="px-1.5 py-0.5 text-xs font-semibold border border-line rounded-xs flex-1"
                                    />
                                    <input
                                      type="text"
                                      value={child.badge || ""}
                                      onChange={(e) =>
                                        updateNavChild(i, ci, "badge", e.target.value)
                                      }
                                      placeholder="Badge"
                                      className="w-16 px-1.5 py-0.5 text-[10px] uppercase font-mono border border-line rounded-xs text-navy-900"
                                      title="Optional badge tag (e.g. Level 3, New)"
                                    />
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      disabled={ci === 0}
                                      onClick={() => moveNavChild(i, ci, "up")}
                                      className="p-1 hover:bg-paper rounded-xs text-ink-soft disabled:opacity-20 cursor-pointer"
                                      title="Move Sub-Item Up"
                                    >
                                      <Icon name="chevron-up" size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={ci === (link.children?.length || 0) - 1}
                                      onClick={() => moveNavChild(i, ci, "down")}
                                      className="p-1 hover:bg-paper rounded-xs text-ink-soft disabled:opacity-20 cursor-pointer"
                                      title="Move Sub-Item Down"
                                    >
                                      <Icon name="chevron-down" size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeNavChild(i, ci)}
                                      className="p-1 hover:bg-rose-50 text-rose-700 rounded-xs cursor-pointer"
                                      title="Remove Sub-Item"
                                    >
                                      <Icon name="close" size={11} />
                                    </button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  <input
                                    type="text"
                                    value={child.href}
                                    onChange={(e) =>
                                      updateNavChild(i, ci, "href", e.target.value)
                                    }
                                    placeholder="/courses/..."
                                    className="px-1.5 py-0.5 text-[10px] font-mono border border-line rounded-xs text-ink-soft"
                                  />
                                  <input
                                    type="text"
                                    value={child.desc || ""}
                                    onChange={(e) =>
                                      updateNavChild(i, ci, "desc", e.target.value)
                                    }
                                    placeholder="Brief course description..."
                                    className="px-1.5 py-0.5 text-[10px] border border-line rounded-xs text-ink-soft"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addNavChild(i)}
                          className="w-full py-1 px-2 border border-dashed border-line hover:border-navy-900 rounded-xs text-[10px] font-semibold text-ink-soft hover:text-navy-900 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Icon name="plus" size={11} />
                          <span>+ Create Dropdown Sub-menu on &quot;{link.label}&quot;</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 4. Header Action Button & Contacts */}
              <ButtonCustomizerFields
                label="Header Action CTA Button"
                buttonText={headerNav.ctaButtonText || ""}
                onButtonTextChange={(val) =>
                  setHeaderNav({ ...headerNav, ctaButtonText: val })
                }
                buttonLink={headerNav.ctaButtonLink}
                onButtonLinkChange={(val) =>
                  setHeaderNav({ ...headerNav, ctaButtonLink: val })
                }
                linkPlaceholder="/book or /courses"
                defaultVariant="primary"
                defaultSize="md"
                config={{
                  bgColor: headerNav.ctaButtonBgColor,
                  textColor: headerNav.ctaButtonTextColor,
                  fontFamily: headerNav.ctaButtonFontFamily,
                  fontWeight: headerNav.ctaButtonFontWeight,
                  textTransform: headerNav.ctaButtonTextTransform,
                  icon: headerNav.ctaButtonIcon,
                  iconPosition: headerNav.ctaButtonIconPosition,
                  radius: headerNav.ctaButtonRadius,
                  size: headerNav.ctaButtonSize,
                }}
                onChange={(key, val) => {
                  const fieldMap: Record<string, string> = {
                    bgColor: "ctaButtonBgColor",
                    textColor: "ctaButtonTextColor",
                    fontFamily: "ctaButtonFontFamily",
                    fontWeight: "ctaButtonFontWeight",
                    textTransform: "ctaButtonTextTransform",
                    icon: "ctaButtonIcon",
                    iconPosition: "ctaButtonIconPosition",
                    radius: "ctaButtonRadius",
                    size: "ctaButtonSize",
                  };
                  const mappedField = fieldMap[key] || key;
                  setHeaderNav({ ...headerNav, [mappedField]: val });
                }}
              />

              <div className="p-3 bg-paper rounded-sm border border-line space-y-2.5">
                <strong className="text-xs font-bold text-navy-900 block">
                  Support Telephone &amp; WhatsApp
                </strong>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-ink-soft mb-0.5">Telephone</label>
                    <input
                      type="text"
                      value={headerNav.supportPhone}
                      onChange={(e) =>
                        setHeaderNav({ ...headerNav, supportPhone: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-line rounded-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-ink-soft mb-0.5">WhatsApp</label>
                    <input
                      type="text"
                      value={headerNav.whatsappNumber}
                      onChange={(e) =>
                        setHeaderNav({ ...headerNav, whatsappNumber: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-line rounded-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveHeaderNav}
                disabled={isPending}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-sm text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Icon name="check" size={14} />
                <span>Save Navigation Menu & Header</span>
              </button>
            </div>
          )}

          {/* TAB 5: Footer Customiser */}
          {sidebarTab === "footer" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
              <div className="border-b border-line pb-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider block">
                    Global Footer
                  </span>
                  <strong className="text-sm font-bold text-navy-900">
                    Footer Content & Links
                  </strong>
                </div>
                <button
                  onClick={handleSaveFooter}
                  disabled={isPending}
                  className="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 text-white rounded-sm text-xs font-bold transition-all shadow-xs"
                >
                  {isPending ? "Saving..." : "Publish Footer"}
                </button>
              </div>

              {/* Footer Background & Palette Theme */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="sparkles" size={14} className="text-teal-700" />
                    <span>Footer Color & Palette</span>
                  </strong>
                  <span className="text-[10px] text-teal-800 font-semibold px-2 py-0.5 rounded-full bg-teal-100/80">
                    Matches All Pages
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] text-ink-soft">
                    Footer Palette Preset:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFooterConfig({
                          ...footerConfig,
                          footerTheme: "light",
                          footerBgColor: "#E8F4F1",
                        })
                      }
                      className={`p-2 rounded-sm border text-left flex flex-col gap-1 transition-all ${
                        (footerConfig.footerBgColor || "#E8F4F1").toLowerCase() === "#e8f4f1" &&
                        footerConfig.footerTheme !== "dark"
                          ? "border-[#0B4D4E] bg-teal-50 ring-1 ring-[#0B4D4E]"
                          : "border-line bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-full h-4 rounded-xs bg-[#E8F4F1] border border-teal-200" />
                      <span className="text-[10px] font-bold text-navy-900">Mint Green</span>
                      <span className="text-[8px] text-ink-soft">Homepage Match</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFooterConfig({
                          ...footerConfig,
                          footerTheme: "light",
                          footerBgColor: "#FFFFFF",
                        })
                      }
                      className={`p-2 rounded-sm border text-left flex flex-col gap-1 transition-all ${
                        (footerConfig.footerBgColor || "").toLowerCase() === "#ffffff" &&
                        footerConfig.footerTheme !== "dark"
                          ? "border-[#0B4D4E] bg-teal-50 ring-1 ring-[#0B4D4E]"
                          : "border-line bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-full h-4 rounded-xs bg-white border border-slate-300" />
                      <span className="text-[10px] font-bold text-navy-900">Pure White</span>
                      <span className="text-[8px] text-ink-soft">Clean Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFooterConfig({
                          ...footerConfig,
                          footerTheme: "dark",
                          footerBgColor: "#23216B",
                        })
                      }
                      className={`p-2 rounded-sm border text-left flex flex-col gap-1 transition-all ${
                        footerConfig.footerTheme === "dark"
                          ? "border-gold-500 bg-navy-900 text-white ring-1 ring-gold-500"
                          : "border-line bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-full h-4 rounded-xs bg-[#23216B] border border-navy-700" />
                      <span
                        className={`text-[10px] font-bold ${
                          footerConfig.footerTheme === "dark"
                            ? "text-gold-300"
                            : "text-navy-900"
                        }`}
                      >
                        Deep Navy
                      </span>
                      <span
                        className={`text-[8px] ${
                          footerConfig.footerTheme === "dark"
                            ? "text-white/60"
                            : "text-ink-soft"
                        }`}
                      >
                        Dark Theme
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-[10px] text-ink-soft whitespace-nowrap">
                      Custom Color:
                    </label>
                    <input
                      type="color"
                      value={footerConfig.footerBgColor || "#E8F4F1"}
                      onChange={(e) =>
                        setFooterConfig({
                          ...footerConfig,
                          footerBgColor: e.target.value,
                        })
                      }
                      className="w-8 h-7 p-0.5 border border-line rounded-xs cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={footerConfig.footerBgColor || "#E8F4F1"}
                      onChange={(e) =>
                        setFooterConfig({
                          ...footerConfig,
                          footerBgColor: e.target.value,
                        })
                      }
                      className="w-24 px-2 py-1 text-xs font-mono border border-line rounded-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Logo & Brand Identity */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="sparkles" size={14} className="text-gold-500" />
                    <span>Footer Logo & Brand</span>
                  </strong>
                  <button
                    type="button"
                    onClick={() => {
                      setFooterConfig({
                        ...footerConfig,
                        logoType: headerNav.logoType || "vector",
                        logoImageUrl: headerNav.logoImageUrl || "",
                        logoHeight: headerNav.logoHeight || 44,
                        siteName: headerNav.siteName || "Smartminds",
                        tagline: headerNav.tagline || "Training College",
                      });
                      setToastNotice("Synced footer logo with header");
                      setTimeout(() => setToastNotice(null), 2500);
                    }}
                    className="text-[10px] text-navy-900 hover:text-navy-700 underline flex items-center gap-1 font-medium"
                    title="Copy logo settings from site header"
                  >
                    <Icon name="copy" size={11} />
                    <span>Sync from Header</span>
                  </button>
                </div>

                {/* Logo Style Toggle */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-sm border border-line">
                  <button
                    type="button"
                    onClick={() =>
                      setFooterConfig({ ...footerConfig, logoType: "vector" })
                    }
                    className={`py-1.5 px-2 text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${
                      (footerConfig.logoType || "vector") === "vector"
                        ? "bg-navy-900 text-white shadow-xs font-bold"
                        : "text-ink-soft hover:text-navy-900 hover:bg-paper"
                    }`}
                  >
                    <Icon name="shield-check" size={13} />
                    <span>Vector Crest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFooterConfig({ ...footerConfig, logoType: "image" })
                    }
                    className={`py-1.5 px-2 text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${
                      footerConfig.logoType === "image"
                        ? "bg-navy-900 text-white shadow-xs font-bold"
                        : "text-ink-soft hover:text-navy-900 hover:bg-paper"
                    }`}
                  >
                    <Icon name="layers" size={13} />
                    <span>Custom Image</span>
                  </button>
                </div>

                {/* If Custom Image Logo selected */}
                {footerConfig.logoType === "image" && (
                  <div className="space-y-3 pt-1 border-t border-line">
                    <ImageDropzone
                      value={footerConfig.logoImageUrl}
                      onChange={(url) =>
                        setFooterConfig({
                          ...footerConfig,
                          logoImageUrl: url,
                        })
                      }
                      label="Upload Footer Logo"
                      helperText="PNG, SVG, or WebP (works best on dark navy background)"
                      previewHeight={footerConfig.logoHeight || 44}
                    />

                    {/* Quick Logo Asset Presets */}
                    <div>
                      <label className="block text-[10px] text-ink-soft mb-1">
                        Select official college logo asset:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_LOGO_PRESETS.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setFooterConfig({
                                ...footerConfig,
                                logoImageUrl: img.path,
                              })
                            }
                            className={`p-1.5 rounded-sm border text-[11px] truncate text-left transition-all cursor-pointer ${
                              footerConfig.logoImageUrl === img.path
                                ? "border-navy-900 bg-navy-50 font-bold text-navy-900"
                                : "border-line bg-white hover:bg-paper text-ink"
                            }`}
                          >
                            <span className="block truncate">{img.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Height Control */}
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-line">
                      <label className="text-[11px] text-navy-900 font-semibold">
                        Logo Height: {footerConfig.logoHeight || 44}px
                      </label>
                      <input
                        type="range"
                        min="24"
                        max="80"
                        value={footerConfig.logoHeight || 44}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            logoHeight: Number(e.target.value),
                          })
                        }
                        className="w-32 accent-navy-900"
                      />
                    </div>
                  </div>
                )}

                {/* Wordmark Name & Tagline */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
                  <div>
                    <label className="block text-[10px] font-bold text-navy-900 mb-0.5">
                      Footer Brand Name
                    </label>
                    <input
                      type="text"
                      value={footerConfig.siteName || "Smartminds"}
                      onChange={(e) =>
                        setFooterConfig({
                          ...footerConfig,
                          siteName: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-navy-900 mb-0.5">
                      Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={footerConfig.tagline || "Training College"}
                      onChange={(e) =>
                        setFooterConfig({
                          ...footerConfig,
                          tagline: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Bio */}
              <div className="p-3 bg-paper rounded-sm border border-line space-y-2">
                <strong className="text-xs font-bold text-navy-900 block">
                  Brand Description & Badges
                </strong>
                <div>
                  <label className="block text-[10px] text-ink-soft mb-0.5">
                    College Bio Paragraph:
                  </label>
                  <textarea
                    rows={3}
                    value={footerConfig.bioText}
                    onChange={(e) =>
                      setFooterConfig({ ...footerConfig, bioText: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white leading-normal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-ink-soft mb-0.5">Badge 1</label>
                    <input
                      type="text"
                      value={footerConfig.badge1}
                      onChange={(e) =>
                        setFooterConfig({ ...footerConfig, badge1: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-line rounded-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-ink-soft mb-0.5">Badge 2</label>
                    <input
                      type="text"
                      value={footerConfig.badge2}
                      onChange={(e) =>
                        setFooterConfig({ ...footerConfig, badge2: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-line rounded-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Newsletter Subscription Banner CMS Controls */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="mail" size={14} className="text-[#FF5722]" />
                    <span>Newsletter Subscription Banner</span>
                  </strong>
                  <button
                    type="button"
                    onClick={() =>
                      setFooterConfig({
                        ...footerConfig,
                        showNewsletter: footerConfig.showNewsletter === false ? true : false,
                      })
                    }
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      footerConfig.showNewsletter !== false
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {footerConfig.showNewsletter !== false ? "Visible (ON)" : "Hidden (OFF)"}
                  </button>
                </div>

                {footerConfig.showNewsletter !== false && (
                  <div className="space-y-2 pt-1 border-t border-line/60">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-ink-soft mb-0.5">
                          Eyebrow Tagline
                        </label>
                        <input
                          type="text"
                          value={footerConfig.newsletterEyebrow ?? "Stay Ahead in Your Career"}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, newsletterEyebrow: e.target.value })
                          }
                          className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-ink-soft mb-0.5">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={footerConfig.newsletterButtonText ?? "Subscribe Now"}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, newsletterButtonText: e.target.value })
                          }
                          className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-soft mb-0.5">
                        Main Headline
                      </label>
                      <input
                        type="text"
                        value={footerConfig.newsletterHeadline ?? "Subscribe to our Newsletter"}
                        onChange={(e) =>
                          setFooterConfig({ ...footerConfig, newsletterHeadline: e.target.value })
                        }
                        className="w-full px-2 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-soft mb-0.5">
                        Description / Value Offer
                      </label>
                      <textarea
                        rows={2}
                        value={
                          footerConfig.newsletterSubtext ??
                          "Get the latest qualification updates, exclusive fee discounts, and accredited career resources directly in your inbox."
                        }
                        onChange={(e) =>
                          setFooterConfig({ ...footerConfig, newsletterSubtext: e.target.value })
                        }
                        className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white leading-normal"
                      />
                    </div>

                    {/* Newsletter Card Color Styling */}
                    <div className="p-2.5 bg-white rounded-sm border border-line space-y-2 text-xs">
                      <span className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider">
                        Newsletter Card Colors
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-ink-soft mb-0.5">
                            Card Background
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={footerConfig.newsletterBgColor || "#FFFFFF"}
                              onChange={(e) =>
                                setFooterConfig({ ...footerConfig, newsletterBgColor: e.target.value })
                              }
                              className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="Auto theme"
                              value={footerConfig.newsletterBgColor || ""}
                              onChange={(e) =>
                                setFooterConfig({ ...footerConfig, newsletterBgColor: e.target.value })
                              }
                              className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-ink-soft mb-0.5">
                            Heading & Text
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={footerConfig.newsletterTextColor || "#0B4D4E"}
                              onChange={(e) =>
                                setFooterConfig({ ...footerConfig, newsletterTextColor: e.target.value })
                              }
                              className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="Auto theme"
                              value={footerConfig.newsletterTextColor || ""}
                              onChange={(e) =>
                                setFooterConfig({ ...footerConfig, newsletterTextColor: e.target.value })
                              }
                              className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-ink-soft mb-0.5">
                            Button Background
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={footerConfig.newsletterButtonBgColor || "#0B4D4E"}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterButtonBgColor: e.target.value,
                                })
                              }
                              className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="#0B4D4E"
                              value={footerConfig.newsletterButtonBgColor || ""}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterButtonBgColor: e.target.value,
                                })
                              }
                              className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-ink-soft mb-0.5">
                            Button Text Color
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={footerConfig.newsletterButtonTextColor || "#FFFFFF"}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterButtonTextColor: e.target.value,
                                })
                              }
                              className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="#FFFFFF"
                              value={footerConfig.newsletterButtonTextColor || ""}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterButtonTextColor: e.target.value,
                                })
                              }
                              className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-ink-soft mb-0.5">
                            Eyebrow Tagline Color
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={footerConfig.newsletterEyebrowColor || "#FF5722"}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterEyebrowColor: e.target.value,
                                })
                              }
                              className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="#FF5722"
                              value={footerConfig.newsletterEyebrowColor || ""}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterEyebrowColor: e.target.value,
                                })
                              }
                              className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-ink-soft mb-0.5">
                            Input Field Background
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={footerConfig.newsletterInputBgColor || "#E8F4F1"}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterInputBgColor: e.target.value,
                                })
                              }
                              className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="Auto theme"
                              value={footerConfig.newsletterInputBgColor || ""}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterInputBgColor: e.target.value,
                                })
                              }
                              className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-ink-soft mb-0.5">
                            Input Field Text Color
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={footerConfig.newsletterInputTextColor || "#1B1B2B"}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterInputTextColor: e.target.value,
                                })
                              }
                              className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="Auto theme"
                              value={footerConfig.newsletterInputTextColor || ""}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterInputTextColor: e.target.value,
                                })
                              }
                              className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-ink-soft mb-0.5">
                            Input Field Border Color
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={footerConfig.newsletterInputBorderColor || "#99F6E4"}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterInputBorderColor: e.target.value,
                                })
                              }
                              className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="Auto theme"
                              value={footerConfig.newsletterInputBorderColor || ""}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  newsletterInputBorderColor: e.target.value,
                                })
                              }
                              className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Column Typography & Link Styles */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <Icon name="edit" size={14} className="text-navy-900" />
                  <span>Column Titles & Links Typography</span>
                </strong>

                <div className="space-y-2.5">
                  {/* Column Title Font Family, Size & Weight */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] text-ink-soft mb-0.5">
                        Title Font Family
                      </label>
                      <select
                        value={footerConfig.columnTitleFontFamily || "heading"}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            columnTitleFontFamily: e.target.value as "heading" | "body",
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                      >
                        <option value="heading">Saira Condensed (Heading)</option>
                        <option value="body">Source Sans 3 (Body)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-ink-soft mb-0.5">
                        Title Size
                      </label>
                      <select
                        value={footerConfig.columnTitleFontSize || "lg"}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            columnTitleFontSize: e.target.value as any,
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                      >
                        <option value="sm">Small (14px)</option>
                        <option value="md">Medium (16px)</option>
                        <option value="lg">Large (18px - Default)</option>
                        <option value="xl">Extra Large (20px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-ink-soft mb-0.5">
                        Title Weight
                      </label>
                      <select
                        value={footerConfig.columnTitleFontWeight || "bold"}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            columnTitleFontWeight: e.target.value as any,
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="semibold">Semi Bold</option>
                        <option value="bold">Bold (Default)</option>
                        <option value="extrabold">Extra Bold</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-ink-soft mb-0.5">
                        Letter Case
                      </label>
                      <select
                        value={footerConfig.columnTitleTextTransform || "uppercase"}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            columnTitleTextTransform: e.target.value as any,
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                      >
                        <option value="uppercase">UPPERCASE (Default)</option>
                        <option value="capitalize">Capitalize Words</option>
                        <option value="none">Normal Case</option>
                      </select>
                    </div>
                  </div>

                  {/* Colors for Column Titles & Links */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-line/60">
                    <div>
                      <label className="block text-[9px] text-ink-soft mb-0.5">
                        Column Titles Color
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={footerConfig.columnTitleColor || "#0B4D4E"}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, columnTitleColor: e.target.value })
                          }
                          className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="Auto palette"
                          value={footerConfig.columnTitleColor || ""}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, columnTitleColor: e.target.value })
                          }
                          className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-ink-soft mb-0.5">
                        Links Text Color
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={footerConfig.linkColor || "#5A5A6E"}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, linkColor: e.target.value })
                          }
                          className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="Auto theme"
                          value={footerConfig.linkColor || ""}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, linkColor: e.target.value })
                          }
                          className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explore Links Column */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs font-bold text-navy-900">
                      Explore Column
                    </strong>
                    <span className="text-[10px] text-ink-soft">
                      ({footerConfig.exploreLinks.length} links)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFooterConfig({
                          ...footerConfig,
                          showExploreColumn:
                            footerConfig.showExploreColumn === false ? true : false,
                        })
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        footerConfig.showExploreColumn !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {footerConfig.showExploreColumn !== false ? "Visible" : "Hidden"}
                    </button>
                    <button
                      onClick={() => addFooterLink("explore")}
                      className="text-xs font-bold text-navy-900 hover:text-gold-700 underline flex items-center gap-0.5"
                    >
                      <Icon name="plus" size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {footerConfig.showExploreColumn !== false && (
                  <div className="space-y-2 pt-1 border-t border-line/60">
                    <div>
                      <label className="block text-[10px] text-ink-soft mb-0.5">
                        Column Title Header
                      </label>
                      <input
                        type="text"
                        value={footerConfig.exploreColumnTitle ?? "Explore"}
                        onChange={(e) =>
                          setFooterConfig({ ...footerConfig, exploreColumnTitle: e.target.value })
                        }
                        className="w-full px-2 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {footerConfig.exploreLinks.map((item, i) => (
                        <div
                          key={item.id}
                          className="p-2 bg-white rounded-sm border border-line shadow-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) =>
                                updateFooterLink("explore", i, "label", e.target.value)
                              }
                              className="px-2 py-0.5 text-xs font-bold border border-line rounded-sm flex-1"
                            />
                            <button
                              onClick={() => removeFooterLink("explore", i)}
                              className="p-1 text-xs hover:bg-rose-50 text-rose-700 rounded-sm"
                              title="Delete Link"
                            >
                              <Icon name="close" size={12} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.href}
                            onChange={(e) =>
                              updateFooterLink("explore", i, "href", e.target.value)
                            }
                            className="w-full px-2 py-0.5 text-[11px] font-mono border border-line rounded-sm text-ink-soft"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* College Links Column */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs font-bold text-navy-900">
                      College Links Column
                    </strong>
                    <span className="text-[10px] text-ink-soft">
                      ({footerConfig.collegeLinks.length} links)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFooterConfig({
                          ...footerConfig,
                          showCollegeColumn:
                            footerConfig.showCollegeColumn === false ? true : false,
                        })
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        footerConfig.showCollegeColumn !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {footerConfig.showCollegeColumn !== false ? "Visible" : "Hidden"}
                    </button>
                    <button
                      onClick={() => addFooterLink("college")}
                      className="text-xs font-bold text-navy-900 hover:text-gold-700 underline flex items-center gap-0.5"
                    >
                      <Icon name="plus" size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {footerConfig.showCollegeColumn !== false && (
                  <div className="space-y-2 pt-1 border-t border-line/60">
                    <div>
                      <label className="block text-[10px] text-ink-soft mb-0.5">
                        Column Title Header
                      </label>
                      <input
                        type="text"
                        value={footerConfig.collegeColumnTitle ?? "College"}
                        onChange={(e) =>
                          setFooterConfig({ ...footerConfig, collegeColumnTitle: e.target.value })
                        }
                        className="w-full px-2 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {footerConfig.collegeLinks.map((item, i) => (
                        <div
                          key={item.id}
                          className="p-2 bg-white rounded-sm border border-line shadow-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) =>
                                updateFooterLink("college", i, "label", e.target.value)
                              }
                              className="px-2 py-0.5 text-xs font-bold border border-line rounded-sm flex-1"
                            />
                            <button
                              onClick={() => removeFooterLink("college", i)}
                              className="p-1 text-xs hover:bg-rose-50 text-rose-700 rounded-sm"
                              title="Delete Link"
                            >
                              <Icon name="close" size={12} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.href}
                            onChange={(e) =>
                              updateFooterLink("college", i, "href", e.target.value)
                            }
                            className="w-full px-2 py-0.5 text-[11px] font-mono border border-line rounded-sm text-ink-soft"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details Column */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="phone" size={14} className="text-[#0B4D4E]" />
                    <span>Contact Column Details</span>
                  </strong>
                  <button
                    type="button"
                    onClick={() =>
                      setFooterConfig({
                        ...footerConfig,
                        showContactColumn:
                          footerConfig.showContactColumn === false ? true : false,
                      })
                    }
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      footerConfig.showContactColumn !== false
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {footerConfig.showContactColumn !== false ? "Visible" : "Hidden"}
                  </button>
                </div>

                {footerConfig.showContactColumn !== false && (
                  <div className="space-y-2 pt-1 border-t border-line/60">
                    <div>
                      <label className="block text-[10px] text-ink-soft mb-0.5">
                        Column Title Header
                      </label>
                      <input
                        type="text"
                        value={footerConfig.contactColumnTitle ?? "Contact"}
                        onChange={(e) =>
                          setFooterConfig({ ...footerConfig, contactColumnTitle: e.target.value })
                        }
                        className="w-full px-2 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                      />
                    </div>

                    <div className="space-y-2 text-xs pt-1">
                      {/* Phone */}
                      <div className="p-2 bg-white rounded-sm border border-line">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-navy-900">Telephone</label>
                          <label className="flex items-center gap-1 text-[9px] text-ink-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={footerConfig.showPhone !== false}
                              onChange={(e) =>
                                setFooterConfig({ ...footerConfig, showPhone: e.target.checked })
                              }
                              className="accent-navy-900"
                            />
                            <span>Show</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={footerConfig.phone}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, phone: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-line rounded-sm bg-white text-xs"
                        />
                      </div>

                      {/* Email */}
                      <div className="p-2 bg-white rounded-sm border border-line">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-navy-900">Email Address</label>
                          <label className="flex items-center gap-1 text-[9px] text-ink-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={footerConfig.showEmail !== false}
                              onChange={(e) =>
                                setFooterConfig({ ...footerConfig, showEmail: e.target.checked })
                              }
                              className="accent-navy-900"
                            />
                            <span>Show</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={footerConfig.email}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, email: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-line rounded-sm bg-white text-xs"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div className="p-2 bg-white rounded-sm border border-line">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-navy-900">WhatsApp Hotline</label>
                          <label className="flex items-center gap-1 text-[9px] text-ink-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={footerConfig.showWhatsapp !== false}
                              onChange={(e) =>
                                setFooterConfig({ ...footerConfig, showWhatsapp: e.target.checked })
                              }
                              className="accent-navy-900"
                            />
                            <span>Show</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={footerConfig.whatsappNumber}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, whatsappNumber: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-line rounded-sm bg-white text-xs"
                        />
                      </div>

                      {/* Opening Hours */}
                      <div className="p-2 bg-white rounded-sm border border-line">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-navy-900">Opening Hours</label>
                          <label className="flex items-center gap-1 text-[9px] text-ink-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={footerConfig.showOpeningHours !== false}
                              onChange={(e) =>
                                setFooterConfig({
                                  ...footerConfig,
                                  showOpeningHours: e.target.checked,
                                })
                              }
                              className="accent-navy-900"
                            />
                            <span>Show</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={footerConfig.openingHours}
                          onChange={(e) =>
                            setFooterConfig({ ...footerConfig, openingHours: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-line rounded-sm bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accredited Area - Editable, Stylable & Truly Deletable */}
              <div className="p-3.5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="award" size={14} className="text-emerald-700" />
                    <span>Accreditations & Regulated Bodies</span>
                  </strong>
                  <button
                    type="button"
                    onClick={() =>
                      setFooterConfig({
                        ...footerConfig,
                        showAccreditations:
                          footerConfig.showAccreditations === false ? true : false,
                      })
                    }
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      footerConfig.showAccreditations !== false
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {footerConfig.showAccreditations !== false ? "Visible (ON)" : "Hidden (OFF)"}
                  </button>
                </div>

                {footerConfig.showAccreditations !== false && (
                  <div className="space-y-2 pt-1 border-t border-line/60">
                    <div>
                      <label className="block text-[10px] text-ink-soft mb-0.5">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={footerConfig.accreditationHeadline}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            accreditationHeadline: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-xs font-bold border border-line rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-soft mb-0.5">
                        Subheadline / Supporting Description
                      </label>
                      <textarea
                        rows={2}
                        value={footerConfig.accreditationSubtext}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            accreditationSubtext: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white leading-normal"
                      />
                    </div>

                    {/* Headline Color & Container Style */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] text-ink-soft mb-1">
                          Headline Color:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={footerConfig.accreditationTextColor || "#0B4D4E"}
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                accreditationTextColor: e.target.value,
                              })
                            }
                            className="w-6 h-6 p-0 border border-line rounded-xs cursor-pointer"
                          />
                          <input
                            type="text"
                            placeholder="Auto theme"
                            value={footerConfig.accreditationTextColor || ""}
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                accreditationTextColor: e.target.value,
                              })
                            }
                            className="flex-1 px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-ink-soft mb-1">
                          Badge Card Shape:
                        </label>
                        <select
                          value={footerConfig.accreditationBadgeStyle || "solid-white"}
                          onChange={(e) =>
                            setFooterConfig({
                              ...footerConfig,
                              accreditationBadgeStyle: e.target.value as any,
                            })
                          }
                          className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                        >
                          <option value="solid-white">Solid White Card (Default)</option>
                          <option value="flat">Flat Outlined</option>
                          <option value="pill">Rounded Pills</option>
                        </select>
                      </div>
                    </div>

                    {/* Container Surface Style */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] text-ink-soft mb-1">
                          Container Background:
                        </label>
                        <select
                          value={footerConfig.accreditationBgStyle || "transparent"}
                          onChange={(e) =>
                            setFooterConfig({
                              ...footerConfig,
                              accreditationBgStyle: e.target.value as any,
                            })
                          }
                          className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                        >
                          <option value="transparent">Transparent / Blended</option>
                          <option value="white">White Box Card</option>
                          <option value="subtle">Subtle Mint Tint</option>
                          <option value="dark">Dark Navy Luxury Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-ink-soft mb-1">
                          Layout Alignment:
                        </label>
                        <select
                          value={footerConfig.accreditationLayout || "row"}
                          onChange={(e) =>
                            setFooterConfig({
                              ...footerConfig,
                              accreditationLayout: e.target.value as any,
                            })
                          }
                          className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                        >
                          <option value="row">Side-by-Side (Single Line)</option>
                          <option value="stacked">Stacked Centered</option>
                        </select>
                      </div>
                    </div>

                    {/* Badges List Manager + Action Buttons */}
                    <div className="pt-2 border-t border-line space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-navy-900 uppercase tracking-wider">
                          Badges ({(footerConfig.accreditations || []).length})
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={clearAllAccreditationBadges}
                            className="text-[10px] text-rose-700 hover:text-rose-900 font-semibold px-1.5 py-0.5 rounded-xs hover:bg-rose-50"
                            title="Remove all badges from the footer"
                          >
                            Delete All
                          </button>
                          <button
                            type="button"
                            onClick={resetAccreditationBadges}
                            className="text-[10px] text-ink-soft hover:text-navy-900 underline"
                            title="Reset to 5 default UK regulated bodies"
                          >
                            Reset Defaults
                          </button>
                          <button
                            type="button"
                            onClick={addAccreditationBadge}
                            className="text-xs font-bold text-navy-900 hover:text-gold-700 underline flex items-center gap-0.5"
                          >
                            <Icon name="plus" size={12} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                      {(footerConfig.accreditations || []).length === 0 ? (
                        <div className="p-3 bg-white border border-dashed border-line rounded-sm text-center">
                          <p className="text-xs text-ink-soft">
                            All badges deleted. The accreditation bar is currently empty.
                          </p>
                          <button
                            type="button"
                            onClick={resetAccreditationBadges}
                            className="mt-1.5 text-xs font-bold text-navy-900 hover:text-navy-700 underline"
                          >
                            Restore 5 UK Official Badges
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(footerConfig.accreditations || []).map((badge, idx) => (
                            <div
                              key={badge.id || idx}
                              className="p-2.5 bg-white rounded-sm border border-line shadow-xs space-y-2"
                            >
                              <div className="flex items-center justify-between gap-1 border-b border-line/60 pb-1.5">
                                <span className="text-[10px] font-bold text-navy-900 flex items-center gap-1">
                                  <span className="w-4 h-4 rounded-full bg-navy-100 text-navy-900 flex items-center justify-center text-[9px]">
                                    {idx + 1}
                                  </span>
                                  <span>{badge.title || `Badge #${idx + 1}`}</span>
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveAccreditationBadge(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-1 text-slate-500 hover:text-navy-900 disabled:opacity-30"
                                    title="Move left/up"
                                  >
                                    <Icon name="chevron-up" size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveAccreditationBadge(idx, "down")}
                                    disabled={
                                      idx === (footerConfig.accreditations?.length || 0) - 1
                                    }
                                    className="p-1 text-slate-500 hover:text-navy-900 disabled:opacity-30"
                                    title="Move right/down"
                                  >
                                    <Icon name="chevron-down" size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeAccreditationBadge(idx)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-xs"
                                    title="Delete badge"
                                  >
                                    <Icon name="close" size={12} />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="block text-[9px] text-ink-soft mb-0.5">
                                    Main Title:
                                  </label>
                                  <input
                                    type="text"
                                    value={badge.title}
                                    onChange={(e) =>
                                      updateAccreditationBadge(idx, "title", e.target.value)
                                    }
                                    className="w-full px-1.5 py-0.5 text-xs font-bold border border-line rounded-sm bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] text-ink-soft mb-0.5">
                                    Subtitle / Tag:
                                  </label>
                                  <input
                                    type="text"
                                    value={badge.desc || ""}
                                    onChange={(e) =>
                                      updateAccreditationBadge(idx, "desc", e.target.value)
                                    }
                                    className="w-full px-1.5 py-0.5 text-xs border border-line rounded-sm bg-white"
                                    placeholder="e.g. Regulated"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="block text-[9px] text-ink-soft mb-0.5">
                                    Logo Vector Preset:
                                  </label>
                                  <select
                                    value={badge.icon || "award"}
                                    onChange={(e) =>
                                      updateAccreditationBadge(idx, "icon", e.target.value)
                                    }
                                    className="w-full px-1.5 py-0.5 text-xs border border-line rounded-sm bg-white"
                                  >
                                    <option value="ofqual">Ofqual (Crown)</option>
                                    <option value="tquk">TQUK (Diamond)</option>
                                    <option value="cpd">The CPD Group (Shield)</option>
                                    <option value="health">Skills for Health (Cross)</option>
                                    <option value="ukrlp">UKRLP (Checkbox Stamp)</option>
                                    <option value="award">Standard Award / Star</option>
                                    <option value="custom">Custom Uploaded Logo</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] text-ink-soft mb-0.5">
                                    Verification Link (Optional):
                                  </label>
                                  <input
                                    type="text"
                                    value={badge.link || ""}
                                    onChange={(e) =>
                                      updateAccreditationBadge(idx, "link", e.target.value)
                                    }
                                    className="w-full px-1.5 py-0.5 text-[11px] font-mono border border-line rounded-sm bg-white"
                                    placeholder="https://..."
                                  />
                                </div>
                              </div>

                              {badge.icon === "custom" && (
                                <div className="pt-1 flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={badge.image || ""}
                                    onChange={(e) =>
                                      updateAccreditationBadge(idx, "image", e.target.value)
                                    }
                                    placeholder="Image URL (/images/...)"
                                    className="flex-1 px-1.5 py-0.5 text-[11px] border border-line rounded-sm bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMediaTargetField({
                                        type: "accreditationBadge",
                                        badgeIdx: idx,
                                      });
                                      setMediaModalOpen(true);
                                    }}
                                    className="px-2 py-0.5 bg-navy-900 text-white rounded-sm text-[10px] font-bold whitespace-nowrap"
                                  >
                                    Choose Media
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Legal Line & Copyright */}
              <div className="p-3 bg-paper rounded-sm border border-line space-y-2">
                <strong className="text-xs font-bold text-navy-900 block">
                  Legal Line & Copyright Notice
                </strong>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-ink-soft">
                      Company Registered Legal Line
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={footerConfig.legalLineTextColor || "#1B1B2B"}
                        onChange={(e) =>
                          setFooterConfig({ ...footerConfig, legalLineTextColor: e.target.value })
                        }
                        className="w-4 h-4 p-0 border border-line rounded-xs cursor-pointer"
                        title="Text Color"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={footerConfig.legalLine}
                    onChange={(e) =>
                      setFooterConfig({ ...footerConfig, legalLine: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white leading-normal"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-ink-soft">
                      Copyright Notice
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={footerConfig.copyrightTextColor || "#5A5A6E"}
                        onChange={(e) =>
                          setFooterConfig({ ...footerConfig, copyrightTextColor: e.target.value })
                        }
                        className="w-4 h-4 p-0 border border-line rounded-xs cursor-pointer"
                        title="Text Color"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={footerConfig.copyrightText}
                    onChange={(e) =>
                      setFooterConfig({ ...footerConfig, copyrightText: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs border border-line rounded-sm bg-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveFooter}
                disabled={isPending}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-sm text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Icon name="check" size={14} />
                <span>Save & Publish Footer</span>
              </button>
            </div>
          )}

          {/* TAB 5: Global College Contact Data */}
          {sidebarTab === "contact" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              <div className="border-b border-line pb-2">
                <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider block">
                  College Contact & Regulations
                </span>
                <strong className="text-sm font-bold text-navy-900">
                  Global Public Details
                </strong>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Enquiry Telephone
                </label>
                <input
                  type="text"
                  value={globalContent.supportPhone}
                  onChange={(e) =>
                    setGlobalContent({ ...globalContent, supportPhone: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Admissions WhatsApp
                </label>
                <input
                  type="text"
                  value={globalContent.whatsappNumber}
                  onChange={(e) =>
                    setGlobalContent({ ...globalContent, whatsappNumber: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  UKPRN Learning Provider Ref
                </label>
                <input
                  type="text"
                  value={globalContent.ukprn}
                  onChange={(e) =>
                    setGlobalContent({ ...globalContent, ukprn: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Centre Reference Number
                </label>
                <input
                  type="text"
                  value={globalContent.centreNumber}
                  onChange={(e) =>
                    setGlobalContent({ ...globalContent, centreNumber: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Head Office Address
                </label>
                <input
                  type="text"
                  value={globalContent.headOfficeAddress}
                  onChange={(e) =>
                    setGlobalContent({ ...globalContent, headOfficeAddress: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-line rounded-sm text-xs"
                />
              </div>

              <button
                onClick={handleSaveGlobalContent}
                disabled={isPending}
                className="w-full py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-sm text-xs font-bold transition-all shadow-sm"
              >
                Save College Global Information
              </button>
            </div>
          )}

          {/* TAB 6: Global Color Swatches & Brand Kit (Option C: Elementor-style Global Swatches) */}
          {sidebarTab === "swatches" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              <div className="border-b border-line pb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-soft uppercase tracking-wider mb-1">
                  <svg className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
                  </svg>
                  <span>Brand Palette & Color Kit</span>
                </div>
                <strong className="text-sm font-bold text-navy-900 block">
                  Global Color Swatches
                </strong>
                <p className="text-[11px] text-ink-soft mt-0.5 leading-snug">
                  Save reusable brand colors once. They instantly appear in the color picker on every section, card, button, and widget across the entire website.
                </p>
              </div>

              {/* Client-Requested Smart blue Spotlight */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    Client Brand Color
                  </span>
                  <span className="text-[9px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-xs font-bold">
                    Active & Ready
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-sm shadow-xs border border-blue-300 flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#13416B" }}
                    title="#13416B"
                  >
                    <span className="text-[9px] font-bold text-white uppercase font-mono">
                      #13416B
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-navy-900 truncate">
                      Smart blue (Client Brand)
                    </div>
                    <div className="text-[10px] text-ink-soft">
                      Available in section backgrounds, button colors, and widget inspectors site-wide.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText("#13416B");
                      setCopiedHex("#13416B");
                      setTimeout(() => setCopiedHex(null), 2000);
                    }}
                    className="px-2 py-1 text-[10px] font-bold bg-white text-navy-900 border border-blue-200 rounded-sm hover:bg-blue-100/50 shadow-2xs"
                  >
                    {copiedHex === "#13416B" ? "Copied!" : "Copy Hex"}
                  </button>
                </div>
              </div>

              {/* Form: Add New Global Swatch */}
              <div className="p-3 bg-white rounded-sm border border-line shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-1.5">
                  <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="plus" size={13} className="text-navy-900" />
                    <span>Add New Swatch</span>
                  </span>
                  <span className="text-[9px] text-ink-soft font-mono">
                    Elementor Style
                  </span>
                </div>

                <form onSubmit={handleCreateGlobalSwatch} className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider mb-0.5">
                      Swatch Name
                    </label>
                    <input
                      type="text"
                      value={newSwatchName}
                      onChange={(e) => setNewSwatchName(e.target.value)}
                      placeholder="e.g. Royal Emerald, Sunset Gold, Deep Navy"
                      className="w-full px-2.5 py-1.5 text-xs border border-line rounded-sm bg-paper focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider mb-0.5">
                        Color Hex
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={newSwatchHex}
                          onChange={(e) => setNewSwatchHex(e.target.value)}
                          className="w-8 h-8 rounded-sm border border-line cursor-pointer p-0.5 bg-white"
                          title="Click to pick visually"
                        />
                        <input
                          type="text"
                          value={newSwatchHex}
                          onChange={(e) => setNewSwatchHex(e.target.value)}
                          placeholder="#13416B"
                          className="flex-1 px-2 py-1.5 text-xs font-mono border border-line rounded-sm bg-paper focus:bg-white uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-navy-900 uppercase tracking-wider mb-0.5">
                        Category
                      </label>
                      <select
                        value={newSwatchCategory}
                        onChange={(e) => setNewSwatchCategory(e.target.value as any)}
                        className="w-full px-2 py-1.5 text-xs border border-line rounded-sm bg-paper focus:bg-white cursor-pointer"
                      >
                        <option value="custom">Custom (User Created)</option>
                        <option value="primary">Primary Brand</option>
                        <option value="secondary">Secondary Accent</option>
                        <option value="accent">Call to Action</option>
                      </select>
                    </div>
                  </div>

                  {/* Real-time WCAG Contrast Preview */}
                  <div
                    className="p-2.5 rounded-sm border transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: newSwatchHex,
                      borderColor: "rgba(0,0,0,0.15)",
                    }}
                  >
                    <span
                      className={`text-xs font-bold ${
                        isDarkHex(newSwatchHex) ? "text-white" : "text-ink"
                      }`}
                    >
                      {newSwatchName.trim() || "Preview Swatch"}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${
                        isDarkHex(newSwatchHex)
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-black/10 text-ink border border-black/20"
                      }`}
                    >
                      {isDarkHex(newSwatchHex) ? "WCAG: White text" : "WCAG: Dark text"}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSwatch || !newSwatchName.trim()}
                    className="w-full py-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-40 text-white rounded-sm text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Icon name="plus" size={13} />
                    <span>{isSavingSwatch ? "Saving Swatch..." : "Save Swatch to Global Kit"}</span>
                  </button>
                </form>
              </div>

              {/* Swatches List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900">
                    Saved Brand Swatches ({swatchesList.length})
                  </span>
                  <span className="text-[10px] text-ink-soft">
                    Synchronized across CMS
                  </span>
                </div>

                <div className="space-y-1.5">
                  {swatchesList.map((swatch) => {
                    const isSystem = swatch.category !== "custom" && swatch.id !== "swatch-oceanic-blue";
                    const isClientRequested = swatch.id === "swatch-oceanic-blue" || swatch.hex.toLowerCase() === "#13416b";
                    const isDark = swatch.isDark ?? isDarkHex(swatch.hex);

                    return (
                      <div
                        key={swatch.id}
                        className={`p-2 bg-white rounded-sm border transition-all shadow-2xs ${
                          isClientRequested ? "border-blue-400 bg-blue-50/20" : "border-line hover:border-slate-300"
                        }`}
                      >
                        {editingSwatchId === swatch.id ? (
                          <div className="space-y-2 animate-fade-in p-1">
                            <div className="flex items-center justify-between border-b border-line pb-1">
                              <span className="text-[11px] font-bold text-navy-900 uppercase">
                                Edit Swatch: {swatch.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingSwatchId(null)}
                                className="text-ink-soft hover:text-navy-900 text-xs font-bold p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-ink-soft mb-0.5">
                                Swatch Name
                              </label>
                              <input
                                type="text"
                                value={editingSwatchName}
                                onChange={(e) => setEditingSwatchName(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-line rounded-xs focus:outline-none focus:border-navy-900 bg-white font-medium"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-ink-soft mb-0.5">
                                  Hex Code
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={editingSwatchHex.length === 7 ? editingSwatchHex : "#13416B"}
                                    onChange={(e) => setEditingSwatchHex(e.target.value)}
                                    className="w-7 h-7 rounded-xs border border-line cursor-pointer p-0 bg-white shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={editingSwatchHex}
                                    onChange={(e) => setEditingSwatchHex(e.target.value)}
                                    className="w-full px-1.5 py-1 text-xs font-mono font-bold uppercase border border-line rounded-xs bg-white text-navy-900"
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-ink-soft mb-0.5">
                                  Category
                                </label>
                                <select
                                  value={editingSwatchCategory}
                                  onChange={(e) => setEditingSwatchCategory(e.target.value as any)}
                                  className="w-full px-1.5 py-1 text-xs border border-line rounded-xs bg-white cursor-pointer"
                                >
                                  <option value="custom">Custom (User Created)</option>
                                  <option value="primary">Primary Brand</option>
                                  <option value="secondary">Secondary Accent</option>
                                  <option value="accent">Call to Action</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-line">
                              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                <span
                                  className="h-3 w-3 rounded-full border border-black/20"
                                  style={{ backgroundColor: editingSwatchHex }}
                                />
                                <span className="text-ink font-bold">{editingSwatchHex}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingSwatchId(null)}
                                  className="px-2 py-0.5 text-[10px] font-semibold text-ink-soft hover:text-navy-900 bg-white border border-line rounded-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateGlobalSwatch(swatch.id)}
                                  disabled={isUpdatingSwatch || !editingSwatchName.trim()}
                                  className="px-2.5 py-0.5 text-[10px] font-bold bg-navy-900 text-gold-300 rounded-xs hover:bg-navy-800 disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                  {isUpdatingSwatch ? "Saving..." : "Save Changes"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-7 h-7 rounded-sm shadow-2xs flex-shrink-0 border border-black/10 flex items-center justify-center text-[8px] font-bold"
                                style={{
                                  backgroundColor: swatch.hex,
                                  color: isDark ? "#ffffff" : "#1B1B2B",
                                }}
                              >
                                Aa
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-navy-900 truncate">
                                    {swatch.name}
                                  </span>
                                  {isClientRequested && (
                                    <span className="text-[8px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-1 py-0.2 rounded-xs">
                                      Client
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-ink-soft">
                                  <span>{swatch.hex}</span>
                                  <span className="text-[9px] uppercase px-1 py-0.1 bg-slate-100 rounded-xs">
                                    {swatch.category || "custom"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditSwatch(swatch)}
                                className="px-1.5 py-1 text-[10px] text-ink-soft hover:text-navy-900 hover:bg-slate-100 rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                                title={`Edit / Rename ${swatch.name}`}
                              >
                                <Icon name="edit" size={11} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(swatch.hex);
                                  setCopiedHex(swatch.id);
                                  setTimeout(() => setCopiedHex(null), 1800);
                                }}
                                className="px-1.5 py-1 text-[10px] text-ink-soft hover:text-navy-900 hover:bg-slate-100 rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                                title={`Copy ${swatch.hex}`}
                              >
                                <Icon name={copiedHex === swatch.id ? "check" : "copy"} size={11} />
                                <span>{copiedHex === swatch.id ? "Copied" : "Copy"}</span>
                              </button>

                              {swatch.category === "custom" && !isClientRequested ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGlobalSwatch(swatch.id, swatch.name)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                                  title={`Delete ${swatch.name}`}
                                >
                                  <Icon name="close" size={12} />
                                </button>
                              ) : (
                                <span
                                  className="p-1 text-slate-300"
                                  title="Core College Protected Token"
                                >
                                  <Icon name="shield-check" size={12} />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* College Accredited Typography Style Guide */}
              <div className="p-3 bg-paper rounded-sm border border-line space-y-2">
                <div className="flex items-center justify-between border-b border-line pb-1">
                  <strong className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <Icon name="file-text" size={12} className="text-gold-500" />
                    <span>College Typography Standards</span>
                  </strong>
                  <span className="text-[9px] font-mono text-ink-soft">PRD §7.4</span>
                </div>
                <p className="text-[10px] text-ink-soft leading-normal">
                  Typography is strictly coupled with Next.js humanist font tokens to guarantee accreditation compliance and eliminate generic AI-generated aesthetics.
                </p>
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="p-2 bg-white rounded-sm border border-line/80">
                    <span className="text-[9px] uppercase tracking-wider text-ink-soft block font-mono">
                      Headings & Display
                    </span>
                    <span className="font-heading font-bold text-navy-900 text-sm tracking-wide">
                      Saira Condensed (600 / 700 Bold)
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-sm border border-line/80">
                    <span className="text-[9px] uppercase tracking-wider text-ink-soft block font-mono">
                      Body & Editorial
                    </span>
                    <span className="font-sans text-ink text-xs">
                      Source Sans 3 (Humanist Sans 400 / 600)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* 3. Live WYSIWYG Canvas with Isolated Responsive Sandbox & Direct Click-to-Edit */}
        <ResponsiveCanvasFrame
          viewport={viewport}
          onViewportChange={setViewport}
        >
          <div className="bg-white min-h-screen flex flex-col relative pb-32">
            {/* 1:1 Live WYSIWYG Header Mirror (Clickable & Editable) */}
            <div
              onClick={() => {
                setSidebarTab("menu");
                setIsSidebarOpen(true);
                setToastNotice("Editing: Header Navigation & Logo");
                setTimeout(() => setToastNotice(null), 3000);
              }}
              className="relative group cursor-pointer flex-shrink-0"
              title="Click to edit site header and logo"
            >
              <div className="absolute top-2 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-900 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md border border-gold-500/40 pointer-events-none flex items-center gap-1">
                <Icon name="edit" size={10} />
                <span>Header & Logo ✎</span>
              </div>
              <div className="group-hover:ring-2 group-hover:ring-dashed group-hover:ring-gold-500/80 transition-all">
                <Header config={headerNav} isEditor={true} />
              </div>
            </div>

            {/* Render Canvas Sections for Selected Page */}
            <div className="divide-y divide-line/40 flex-1">
              {activeSections.map((sec, idx) => {
                if (!sec.enabled) return null;
                const isSelected = sec.id === selectedSectionId;
                const isHovered = sec.id === hoveredSectionId;

                return (
                  <React.Fragment key={sec.id}>
                    {/* Elementor Inter-Section Drop Zone & Insert Divider */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setCanvasDropTargetIndex(idx);
                      }}
                      onDragLeave={() => setCanvasDropTargetIndex(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const wType = e.dataTransfer.getData(
                          "application/widget-type"
                        ) as BuilderSectionType;
                        if (wType) {
                          insertWidgetAt(wType, idx);
                        } else if (draggedSectionIndex !== null) {
                          handleDropOnSection(e, idx);
                        }
                        setCanvasDropTargetIndex(null);
                      }}
                      className={`h-4 hover:h-9 relative transition-all group/divider flex items-center justify-center ${
                        canvasDropTargetIndex === idx
                          ? "h-10 bg-gold-100 border-2 border-dashed border-gold-500"
                          : ""
                      }`}
                    >
                      <div className="absolute inset-x-0 h-0.5 bg-transparent group-hover/divider:bg-gold-500/50 transition-colors" />
                      <button
                        type="button"
                        onClick={() => {
                          setSidebarTab("widgets");
                          setIsSidebarOpen(true);
                          setToastNotice("Pick a widget from the palette to insert above this block.");
                        }}
                        className="opacity-0 group-hover/divider:opacity-100 px-3 py-1 bg-navy-900 text-white text-[10px] font-bold rounded-full shadow-md flex items-center gap-1 z-20 hover:scale-105 transition-all"
                      >
                        <span>+ Add Section Here</span>
                      </button>
                    </div>

                    {/* Section Box */}
                    <div
                      onClick={() => {
                        setSelectedSectionId(sec.id);
                        setSelectedElementKey(null);
                        setSelectedElementItemIndex(null);
                        setSidebarTab("inspect");
                      }}
                      onMouseEnter={() => setHoveredSectionId(sec.id)}
                      onMouseLeave={() => setHoveredSectionId(null)}
                      className={`relative transition-all group ${
                        isSelected
                          ? "ring-2 ring-navy-900 z-10"
                          : isHovered
                          ? "ring-1 ring-navy-700/50"
                          : ""
                      }`}
                    >
                      {/* Floating Elementor Canvas Action Bar on Hover/Select */}
                      {(isSelected || isHovered) && (
                        <div className="absolute top-2 left-4 z-20 flex items-center gap-1.5 bg-navy-900 text-white px-2.5 py-1 rounded-sm text-[10px] font-bold shadow-lg">
                          <Icon name="grip-vertical" size={12} className="text-gold-300" />
                          <span className="ml-1 uppercase tracking-wider">{sec.name}</span>
                          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/20">
                            <button
                              type="button"
                              title="Move Up"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSection(idx, "up");
                              }}
                              className="hover:text-gold-300 disabled:opacity-20 px-1"
                            >
                              <Icon name="chevron-up" size={11} />
                            </button>
                            <button
                              type="button"
                              title="Move Down"
                              disabled={idx === activeSections.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSection(idx, "down");
                              }}
                              className="hover:text-gold-300 disabled:opacity-20 px-1"
                            >
                              <Icon name="chevron-down" size={11} />
                            </button>
                            <button
                              type="button"
                              title="Duplicate Block"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSection(sec.id);
                              }}
                              className="hover:text-gold-300 px-1"
                            >
                              <Icon name="copy" size={11} />
                            </button>
                            <button
                              type="button"
                              title="Delete Block"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSection(sec.id);
                              }}
                              className="hover:text-rose-400 px-1"
                            >
                              <Icon name="trash" size={11} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Live Authentic High-Fidelity Section with Direct Click-to-Edit */}
                      <SectionRenderer
                        section={sec}
                        isEditor={true}
                        courses={liveCourses}
                        selectedElementKey={sec.id === selectedSectionId ? selectedElementKey : null}
                        selectedElementItemIndex={sec.id === selectedSectionId ? selectedElementItemIndex : null}
                        onSelectElement={(elementKey, itemIndex) =>
                          handleSelectElement(sec.id, elementKey, itemIndex)
                        }
                      />
                    </div>
                  </React.Fragment>
                );
              })}

              {/* End of Page Elementor-Style Quick Insert Bar */}
              <div className="p-8 text-center bg-paper/60 border-2 border-dashed border-line/80 m-4 rounded-sm hover:border-gold-500/80 transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setSidebarTab("widgets");
                    setIsSidebarOpen(true);
                    setToastNotice(`Choose a widget from the palette to add to ${activePageObj.name}.`);
                  }}
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-sm text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <Icon name="plus" size={14} className="text-gold-300" />
                  <span>Add Section to {activePageObj.name}</span>
                </button>
              </div>
            </div>

            {/* 1:1 Live WYSIWYG Footer Mirror (Clickable & Editable) */}
            <div
              onClick={() => {
                setSidebarTab("footer");
                setIsSidebarOpen(true);
                setToastNotice("Editing: Footer & Quick Links");
                setTimeout(() => setToastNotice(null), 3000);
              }}
              className="relative group cursor-pointer flex-shrink-0 border-t border-navy-800/40"
              title="Click to edit site footer and links"
            >
              <div className="absolute top-2 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-900 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md border border-gold-500/40 pointer-events-none flex items-center gap-1">
                <Icon name="edit" size={10} />
                <span>Footer & Links ✎</span>
              </div>
              <div className="group-hover:ring-2 group-hover:ring-dashed group-hover:ring-gold-500/80 transition-all">
                <Footer
                  config={footerConfig}
                  headerConfig={headerNav}
                  isEditor={true}
                />
              </div>
            </div>
          </div>
        </ResponsiveCanvasFrame>
      </div>

      {/* College Media Library & Upload Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        currentValue={
          mediaTargetField?.type === "section"
            ? selectedSection?.image
            : mediaTargetField?.type === "logo"
            ? headerNav.logoImageUrl
            : mediaTargetField?.type === "videoThumbnail"
            ? selectedSection?.videoThumbnail
            : mediaTargetField?.type === "item" && typeof mediaTargetField.itemIdx === "number"
            ? selectedSection?.items?.[mediaTargetField.itemIdx]?.image
            : mediaTargetField?.type === "accreditationBadge" && typeof mediaTargetField.badgeIdx === "number"
            ? footerConfig.accreditations?.[mediaTargetField.badgeIdx]?.image
            : ""
        }
        onSelect={(url) => {
          if (mediaTargetField?.type === "section") {
            updateSelectedField("image", url);
            setToastNotice("Updated block image from Media Library.");
          } else if (mediaTargetField?.type === "logo") {
            setHeaderNav((prev) => ({ ...prev, logoImageUrl: url, logoType: "image" }));
            setToastNotice("Updated college logo from Media Library.");
          } else if (mediaTargetField?.type === "videoThumbnail") {
            updateSelectedField("videoThumbnail", url);
            setToastNotice("Updated video poster thumbnail from Media Library.");
          } else if (mediaTargetField?.type === "item" && typeof mediaTargetField.itemIdx === "number") {
            updateItemField(mediaTargetField.itemIdx, "image", url);
            setToastNotice("Updated card photo from Media Library.");
          } else if (mediaTargetField?.type === "accreditationBadge" && typeof mediaTargetField.badgeIdx === "number") {
            updateAccreditationBadge(mediaTargetField.badgeIdx, "image", url);
            setToastNotice("Updated awarding body logo from Media Library.");
          }
          setTimeout(() => setToastNotice(null), 3000);
          setMediaModalOpen(false);
        }}
      />
    </div>
  );
};
