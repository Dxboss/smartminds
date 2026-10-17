"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost, BlogSection, BlogFaq, BlogAuthor } from "@/content/blog";
import { Course } from "@/content/types";
import { Icon } from "@/components/ui/Icon";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { saveBlogPostAction, deleteBlogPostAction } from "@/app/admin/actions";

interface BlogManagerViewProps {
  initialPosts: BlogPost[];
  liveCourses: Course[];
  userRole: string;
}

const CATEGORIES: BlogPost["category"][] = [
  "Health & Social Care",
  "Teacher Training",
  "Career Pathways",
  "Funding & Advice",
];

const PRESET_IMAGES = [
  { label: "Adult Care & Healthcare", url: "/images/adult-care-training.jpg" },
  { label: "Early Years & Nursery", url: "/images/early-years-training.jpg" },
  { label: "Teacher Education", url: "/images/teacher-training.jpg" },
  { label: "Assessor & Mentoring", url: "/images/tutor-teaching.jpg" },
  { label: "Graduation & Certification", url: "/images/certificate-moment.jpg" },
  { label: "Independent Study", url: "/images/hero-learner.jpg" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function BlogManagerView({
  initialPosts,
  liveCourses,
  userRole,
}: BlogManagerViewProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<
    "general" | "author" | "takeaways" | "sections" | "faqs" | "seo"
  >("general");

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<BlogPost["category"]>("Health & Social Care");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState("/images/adult-care-training.jpg");
  const [imageAlt, setImageAlt] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [relatedCourseId, setRelatedCourseId] = useState<string>("");

  // Author Fields
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [authorCredentials, setAuthorCredentials] = useState("");

  // Key Takeaways
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [newTakeawayText, setNewTakeawayText] = useState("");

  // Content Sections
  const [sections, setSections] = useState<
    {
      subheading: string;
      paragraphsText: string;
      hasCallout: boolean;
      calloutTitle: string;
      calloutText: string;
      calloutVariant: "highlight" | "info" | "tip";
      bulletsText: string;
    }[]
  >([]);

  // FAQs
  const [faqs, setFaqs] = useState<BlogFaq[]>([]);

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isOwner = userRole === "owner_admin" || userRole === "super_admin";

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openNewPostEditor = () => {
    setEditingPostId(null);
    setTitle("");
    setSlug("");
    setCategory("Health & Social Care");
    setReadTimeMinutes(5);
    setFeatured(false);
    setImage("/images/adult-care-training.jpg");
    setImageAlt("");
    setExcerpt("");
    setRelatedCourseId("");

    setAuthorName("Centre Academic Advisory Lead");
    setAuthorRole("Vocational Assessor & Healthcare Curriculum Specialist");
    setAuthorCredentials("CAVA, Level 5 Leadership & Management");

    setKeyTakeaways([
      "Recognised Ofqual-regulated benchmark required for UK career progression.",
      "100% coursework assessment portfolio with zero exam pressure.",
      "Flexible evening live webinars with 24/7 access to seminar replays.",
    ]);
    setNewTakeawayText("");

    setSections([
      {
        subheading: "Overview & Qualification Benchmark",
        paragraphsText:
          "In England and Wales, completing a recognised British qualification provides the legal and professional benchmark needed for advanced career appointments.\n\nStudying with dedicated tutor guidance ensures your portfolio evidence meets all national occupational standards.",
        hasCallout: true,
        calloutTitle: "Official Regulatory Guidance",
        calloutText:
          "Always verify that your qualification is registered under the Ofqual Regulated Qualifications Framework (RQF) to guarantee UK-wide recognition.",
        calloutVariant: "highlight",
        bulletsText:
          "National occupational standards alignment\n1-on-1 dedicated assessor reviews\nRecognised by CQC and education authorities",
      },
    ]);

    setFaqs([
      {
        question: "Are these qualifications recognised by UK employers?",
        answer:
          "Yes. All diplomas are regulated by Ofqual and awarded by premier British awarding bodies including TQUK and NCFE.",
      },
    ]);

    setMetaTitle("");
    setMetaDescription("");
    setEditorTab("general");
    setIsEditorOpen(true);
  };

  const openEditPostEditor = (post: BlogPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setReadTimeMinutes(post.readTimeMinutes || 5);
    setFeatured(Boolean(post.featured));
    setImage(post.image || "/images/adult-care-training.jpg");
    setImageAlt(post.imageAlt || "");
    setExcerpt(post.excerpt || "");
    setRelatedCourseId(post.relatedCourseId || "");

    setAuthorName(post.author.name || "");
    setAuthorRole(post.author.role || "");
    setAuthorCredentials(post.author.credentials || "");

    setKeyTakeaways(post.keyTakeaways ? [...post.keyTakeaways] : []);
    setNewTakeawayText("");

    setSections(
      (post.sections || []).map((sec) => ({
        subheading: sec.subheading || "",
        paragraphsText: (sec.paragraphs || []).join("\n\n"),
        hasCallout: Boolean(sec.callout),
        calloutTitle: sec.callout?.title || "",
        calloutText: sec.callout?.text || "",
        calloutVariant: sec.callout?.variant || "highlight",
        bulletsText: (sec.bulletPoints || []).join("\n"),
      }))
    );

    setFaqs(post.faqs ? [...post.faqs] : []);

    setMetaTitle(post.metaTitle || "");
    setMetaDescription(post.metaDescription || "");
    setEditorTab("general");
    setIsEditorOpen(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingPostId) {
      setSlug(slugify(newTitle));
    }
    if (!metaTitle || metaTitle.startsWith("Article |")) {
      setMetaTitle(`${newTitle} | Smartminds Training College`);
    }
  };

  const handleAddTakeaway = () => {
    if (newTakeawayText.trim()) {
      setKeyTakeaways([...keyTakeaways, newTakeawayText.trim()]);
      setNewTakeawayText("");
    }
  };

  const handleRemoveTakeaway = (idx: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== idx));
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        subheading: "New Section Subheading",
        paragraphsText: "Enter the educational narrative and guidance here.",
        hasCallout: false,
        calloutTitle: "",
        calloutText: "",
        calloutVariant: "highlight",
        bulletsText: "",
      },
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleMoveSection = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx > 0) {
      const copy = [...sections];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      setSections(copy);
    } else if (direction === "down" && idx < sections.length - 1) {
      const copy = [...sections];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      setSections(copy);
    }
  };

  const handleAddFaq = () => {
    setFaqs([
      ...faqs,
      {
        question: "Frequently Asked Question?",
        answer: "Provide clear, factual regulatory guidance here.",
      },
    ]);
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleSavePost = () => {
    if (!title.trim()) {
      alert("Please provide an article title.");
      return;
    }
    const finalSlug = slug.trim() || slugify(title);
    const now = new Date().toISOString().split("T")[0];

    const formattedSections: BlogSection[] = sections.map((sec) => {
      const s: BlogSection = {
        subheading: sec.subheading.trim(),
        paragraphs: sec.paragraphsText
          .split("\n\n")
          .map((p) => p.trim())
          .filter(Boolean),
      };
      if (sec.hasCallout && sec.calloutText.trim()) {
        s.callout = {
          title: sec.calloutTitle.trim() || "Important Note",
          text: sec.calloutText.trim(),
          variant: sec.calloutVariant,
        };
      }
      if (sec.bulletsText.trim()) {
        s.bulletPoints = sec.bulletsText
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean);
      }
      return s;
    });

    const newPost: BlogPost = {
      id: editingPostId || `post-${Date.now().toString(36)}`,
      slug: finalSlug,
      title: title.trim(),
      metaTitle:
        metaTitle.trim() || `${title.trim()} | Smartminds Training College`,
      metaDescription:
        metaDescription.trim() ||
        excerpt.trim() ||
        `Authoritative qualification guidance from Smartminds Training College.`,
      publishedAt: editingPostId
        ? posts.find((p) => p.id === editingPostId)?.publishedAt || now
        : now,
      updatedAt: now,
      category,
      readTimeMinutes: Number(readTimeMinutes) || 5,
      featured,
      author: {
        name: authorName.trim() || "Smartminds Academic Advisory Team",
        role: authorRole.trim() || "Healthcare & Education Assessor Faculty",
        credentials: authorCredentials.trim() || undefined,
      },
      image: image.trim() || "/images/adult-care-training.jpg",
      imageAlt:
        imageAlt.trim() || `${title.trim()} article illustrative imagery`,
      excerpt:
        excerpt.trim() ||
        "Expert British vocational guidance and regulatory pathways from practicing assessors.",
      keyTakeaways: keyTakeaways.filter((t) => t.trim().length > 0),
      relatedCourseId: relatedCourseId || undefined,
      sections: formattedSections,
      faqs: faqs.filter((f) => f.question.trim().length > 0),
    };

    startTransition(async () => {
      try {
        const res = await saveBlogPostAction(newPost);
        if (res.success) {
          setPosts((prev) => {
            const idx = prev.findIndex((p) => p.id === newPost.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = newPost;
              return updated;
            }
            return [newPost, ...prev];
          });
          setSaveStatus({
            type: "success",
            message: `Article "${newPost.title}" successfully published and live on the website!`,
          });
          setIsEditorOpen(false);
          setTimeout(() => setSaveStatus({ type: null, message: "" }), 5000);
        } else {
          setSaveStatus({
            type: "error",
            message: "Failed to save article. Please try again.",
          });
        }
      } catch (err: any) {
        setSaveStatus({
          type: "error",
          message: err?.message || "An unexpected error occurred while saving.",
        });
      }
    });
  };

  const handleDeletePost = (postId: string) => {
    startTransition(async () => {
      try {
        const res = await deleteBlogPostAction(postId);
        if (res.success) {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          setDeleteConfirmId(null);
          setSaveStatus({
            type: "success",
            message: "Article successfully deleted.",
          });
          setTimeout(() => setSaveStatus({ type: null, message: "" }), 5000);
        } else {
          setSaveStatus({
            type: "error",
            message: "Failed to delete article.",
          });
        }
      } catch (err: any) {
        setSaveStatus({
          type: "error",
          message: err?.message || "Failed to delete article.",
        });
      }
    });
  };

  if (!isOwner) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <Icon name="shield-check" className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-navy-900">
          Director Access Required
        </h2>
        <p className="text-sm text-ink-soft">
          Blog publishing and editorial controls are restricted to the Training
          Centre Director and College Administrator. Operational staff do not
          have permissions to publish public articles.
        </p>
        <Link
          href="/admin"
          className="inline-block px-4 py-2 bg-navy-900 text-white rounded text-sm font-semibold hover:bg-navy-700 transition"
        >
          Return to Operations Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {saveStatus.type && (
        <div
          className={`p-4 rounded-md border flex items-center justify-between text-sm ${
            saveStatus.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={saveStatus.type === "success" ? "check-circle" : "shield-check"}
              className="w-5 h-5 flex-shrink-0"
            />
            <span>{saveStatus.message}</span>
          </div>
          <button
            onClick={() => setSaveStatus({ type: null, message: "" })}
            className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-navy-900 text-white tracking-wide uppercase">
              Centre Director CMS
            </span>
            <span className="text-xs text-ink-soft">Live Public Articles</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 tracking-tight mt-1 font-heading">
            Blog &amp; Article Manager
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Publish, edit, and curate regulatory guidance, healthcare career
            pathways, and student insights without writing code.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded border border-line bg-white text-navy-900 hover:bg-paper transition"
          >
            <Icon name="chevron-right" className="w-4 h-4" />
            <span>View Public Blog</span>
          </Link>
          <button
            onClick={openNewPostEditor}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded bg-gold-500 text-navy-900 hover:bg-gold-300 transition shadow-sm"
          >
            <Icon name="check-circle" className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white border border-line shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Total Articles
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1 font-heading">
            {posts.length}
          </p>
          <p className="text-xs text-ink-soft mt-0.5">Published &amp; Live</p>
        </div>
        <div className="p-4 rounded-lg bg-white border border-line shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Featured Articles
          </p>
          <p className="text-2xl font-bold text-gold-700 mt-1 font-heading">
            {posts.filter((p) => p.featured).length}
          </p>
          <p className="text-xs text-ink-soft mt-0.5">Hero spotlight</p>
        </div>
        <div className="p-4 rounded-lg bg-white border border-line shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Active Topics
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1 font-heading">
            {new Set(posts.map((p) => p.category)).size}
          </p>
          <p className="text-xs text-ink-soft mt-0.5">Healthcare &amp; Education</p>
        </div>
        <div className="p-4 rounded-lg bg-white border border-line shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Avg Read Time
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1 font-heading">
            {Math.round(
              posts.reduce((acc, p) => acc + (p.readTimeMinutes || 5), 0) /
                (posts.length || 1)
            )}{" "}
            min
          </p>
          <p className="text-xs text-ink-soft mt-0.5">Engaging guides</p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-line">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, excerpt, or author..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900"
          />
          <div className="absolute left-3 top-2.5 text-ink-soft">
            <Icon name="book-open" className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              selectedCategory === "all"
                ? "bg-navy-900 text-white"
                : "bg-paper text-ink-soft hover:bg-slate-200"
            }`}
          >
            All Topics ({posts.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-navy-900 text-white"
                  : "bg-paper text-ink-soft hover:bg-slate-200"
              }`}
            >
              {cat} ({posts.filter((p) => p.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table / List */}
      <div className="bg-white rounded-lg border border-line shadow-subtle overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-paper border border-line flex items-center justify-center mx-auto text-ink-soft">
              <Icon name="book-open" className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-navy-900">
              No articles match your criteria
            </p>
            <p className="text-sm text-ink-soft max-w-sm mx-auto">
              Try adjusting your search query or topic filter, or write a new
              article.
            </p>
            <button
              onClick={openNewPostEditor}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-navy-900 text-white hover:bg-navy-700 transition"
            >
              <Icon name="check-circle" className="w-4 h-4" />
              <span>Write New Article</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-paper/40 transition"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-20 h-16 sm:w-24 sm:h-20 rounded overflow-hidden bg-slate-100 flex-shrink-0 border border-line">
                    <Image
                      src={post.image || "/images/adult-care-training.jpg"}
                      alt={post.imageAlt || post.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-navy-900/10 text-navy-900">
                        {post.category}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gold-500/20 text-gold-700 flex items-center gap-1">
                          <Icon name="star" className="w-3 h-3 text-gold-700" />
                          Featured Hero
                        </span>
                      )}
                      <span className="text-xs text-ink-soft">
                        {post.readTimeMinutes} min read
                      </span>
                      <span className="text-xs text-ink-soft">•</span>
                      <span className="text-xs text-ink-soft">
                        Published {post.publishedAt}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-navy-900 leading-snug truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-ink-soft pt-0.5">
                      <span className="font-medium text-navy-900">
                        By {post.author.name}
                      </span>
                      {post.author.role && (
                        <span>— {post.author.role}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 text-xs font-semibold rounded border border-line bg-white text-navy-900 hover:bg-paper transition flex items-center gap-1.5"
                    title="View public page"
                  >
                    <Icon name="chevron-right" className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </Link>
                  <button
                    onClick={() => openEditPostEditor(post)}
                    className="px-3 py-2 text-xs font-semibold rounded bg-navy-900 text-white hover:bg-navy-700 transition flex items-center gap-1.5"
                  >
                    <Icon name="file-text" className="w-4 h-4" />
                    <span>Edit Article</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(post.id)}
                    className="p-2 text-xs font-semibold rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
                    title="Delete article"
                  >
                    <Icon name="shield-check" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-line animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="shield-check" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">
                Confirm Article Deletion
              </h3>
            </div>
            <p className="text-sm text-ink-soft">
              Are you sure you want to remove this article from the public college
              blog? This action immediately deletes it from the live site.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-line bg-white text-navy-900 hover:bg-paper transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirmId)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Yes, Delete Article"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Editor Modal (Drawer / Full Overlay) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-line overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-300">
                  {editingPostId ? "Edit Existing Article" : "Write New Article"}
                </span>
                <h2 className="text-lg font-bold font-heading truncate max-w-xl">
                  {title || "Untitled Article"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded border border-white/20 text-white hover:bg-white/10 transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={isPending}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-gold-500 text-navy-900 hover:bg-gold-300 transition font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Icon name="check-circle" className="w-4 h-4" />
                  <span>
                    {isPending ? "Publishing..." : "Save & Publish Article"}
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-6 border-b border-line bg-paper flex items-center gap-2 overflow-x-auto flex-shrink-0">
              {[
                { id: "general", label: "General & Hero" },
                { id: "author", label: "Author Details" },
                { id: "takeaways", label: "Key Takeaways" },
                { id: "sections", label: `Body Sections (${sections.length})` },
                { id: "faqs", label: `Q&A FAQs (${faqs.length})` },
                { id: "seo", label: "SEO & Recommendation" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEditorTab(tab.id as any)}
                  className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                    editorTab === tab.id
                      ? "border-navy-900 text-navy-900"
                      : "border-transparent text-ink-soft hover:text-navy-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: General & Hero */}
              {editorTab === "general" && (
                <div className="space-y-5 max-w-3xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      Article Headline / Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. How to Become a Registered Care Home Manager in the UK"
                      className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="how-to-become-registered-care-manager"
                        className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900 font-mono text-xs"
                      />
                      <p className="text-[11px] text-ink-soft">
                        Public URL: smartmindstraining.co.uk/blog/{slug || "slug"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                        Article Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as BlogPost["category"])
                        }
                        className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                        Estimated Read Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={readTimeMinutes}
                        onChange={(e) =>
                          setReadTimeMinutes(parseInt(e.target.value) || 5)
                        }
                        className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="featured-toggle"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-navy-900 focus:ring-navy-900"
                      />
                      <label
                        htmlFor="featured-toggle"
                        className="text-xs font-bold text-navy-900 cursor-pointer"
                      >
                        Feature on Public Blog Hero (Spotlight Article)
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      Summary / Teaser Excerpt
                    </label>
                    <textarea
                      rows={3}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="A short 2-3 sentence overview shown in article listings and social sharing cards..."
                      className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900 leading-relaxed"
                    />
                  </div>

                  {/* Image Picker */}
                  <div className="space-y-2 pt-2 border-t border-line">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      Hero Cover Image
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          type="button"
                          key={preset.url}
                          onClick={() => setImage(preset.url)}
                          className={`p-2 rounded border text-left text-xs transition flex items-center gap-2 ${
                            image === preset.url
                              ? "border-navy-900 bg-navy-900/5 font-bold text-navy-900 ring-1 ring-navy-900"
                              : "border-line bg-white text-ink-soft hover:bg-paper"
                          }`}
                        >
                          <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                            <Image
                              src={preset.url}
                              alt={preset.label}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <ImageDropzone
                        value={image}
                        onChange={(url: string) => setImage(url)}
                        label="Or upload a custom article cover image"
                      />
                    </div>

                    <div className="space-y-1 pt-2">
                      <label className="text-xs font-semibold text-ink-soft">
                        Image Accessibility Description (Alt Text)
                      </label>
                      <input
                        type="text"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Descriptive explanation of what is shown in the image"
                        className="w-full px-3 py-1.5 text-xs border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Author Details */}
              {editorTab === "author" && (
                <div className="space-y-5 max-w-2xl">
                  <div className="p-4 rounded bg-paper border border-line text-xs text-ink-soft leading-relaxed">
                    Under the college editorial standards, every article must be
                    attributed to a verified assessor or senior healthcare/education
                    lead.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      Author Full Name *
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Dr. Eleanor Vance"
                      className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      Author Professional Role *
                    </label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="e.g. Lead Healthcare Assessor & Former Registered Care Manager"
                      className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      Author Credentials &amp; Registrations
                    </label>
                    <input
                      type="text"
                      value={authorCredentials}
                      onChange={(e) => setAuthorCredentials(e.target.value)}
                      placeholder="e.g. RN, BSc (Hons), CAVA, Level 5 Leadership & Management"
                      className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Key Takeaways */}
              {editorTab === "takeaways" && (
                <div className="space-y-5 max-w-3xl">
                  <div className="p-4 rounded bg-paper border border-line text-xs text-ink-soft leading-relaxed">
                    Key takeaways appear in a prominent gold-accented callout box at
                    the very top of the article, allowing busy professionals to
                    digest the core insights immediately.
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      Current Takeaways ({keyTakeaways.length})
                    </label>
                    {keyTakeaways.map((takeaway, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded bg-white border border-line"
                      >
                        <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={takeaway}
                          onChange={(e) => {
                            const copy = [...keyTakeaways];
                            copy[idx] = e.target.value;
                            setKeyTakeaways(copy);
                          }}
                          className="flex-1 text-sm border-0 focus:outline-none focus:ring-0 p-0 text-navy-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTakeaway(idx)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newTakeawayText}
                      onChange={(e) => setNewTakeawayText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTakeaway();
                        }
                      }}
                      placeholder="Type a new takeaway bullet and press enter or click add..."
                      className="flex-1 px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddTakeaway}
                      className="px-4 py-2 text-xs font-semibold rounded bg-navy-900 text-white hover:bg-navy-700 transition"
                    >
                      + Add Takeaway
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Body Sections */}
              {editorTab === "sections" && (
                <div className="space-y-6 max-w-4xl">
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <p className="text-xs text-ink-soft">
                      Build your article with structured headings, multi-paragraph
                      guidance, regulatory callouts, and bullet checklists.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-navy-900 text-white hover:bg-navy-700 transition"
                    >
                      <Icon name="check-circle" className="w-3.5 h-3.5" />
                      <span>Add Section</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-lg border border-line bg-paper/30 space-y-4"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-navy-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                              Content Section
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 text-xs border border-line rounded bg-white disabled:opacity-40"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, "down")}
                              disabled={idx === sections.length - 1}
                              className="p-1 text-xs border border-line rounded bg-white disabled:opacity-40"
                              title="Move down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(idx)}
                              className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded ml-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Subheading */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-navy-900">
                            Section Subheading (H2 / H3)
                          </label>
                          <input
                            type="text"
                            value={sec.subheading}
                            onChange={(e) => {
                              const copy = [...sections];
                              copy[idx].subheading = e.target.value;
                              setSections(copy);
                            }}
                            placeholder="e.g. What Does a Registered Care Manager Actually Do?"
                            className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white font-semibold"
                          />
                        </div>

                        {/* Paragraphs */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-navy-900">
                            Paragraphs (Separate paragraphs with a blank double-enter)
                          </label>
                          <textarea
                            rows={4}
                            value={sec.paragraphsText}
                            onChange={(e) => {
                              const copy = [...sections];
                              copy[idx].paragraphsText = e.target.value;
                              setSections(copy);
                            }}
                            placeholder="Enter the detailed educational guidance..."
                            className="w-full px-3 py-2 text-sm border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white leading-relaxed"
                          />
                        </div>

                        {/* Callout Box Settings */}
                        <div className="p-3 rounded bg-white border border-line space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-navy-900 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={sec.hasCallout}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  copy[idx].hasCallout = e.target.checked;
                                  setSections(copy);
                                }}
                                className="rounded text-navy-900 focus:ring-navy-900"
                              />
                              Include Highlight Callout Box in this section
                            </label>
                            {sec.hasCallout && (
                              <select
                                value={sec.calloutVariant}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  copy[idx].calloutVariant = e.target.value as any;
                                  setSections(copy);
                                }}
                                className="text-xs border border-line rounded px-2 py-1 bg-paper"
                              >
                                <option value="highlight">Gold Highlight</option>
                                <option value="info">Navy Info Box</option>
                                <option value="tip">Advisor Tip</option>
                              </select>
                            )}
                          </div>

                          {sec.hasCallout && (
                            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-line">
                              <input
                                type="text"
                                value={sec.calloutTitle}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  copy[idx].calloutTitle = e.target.value;
                                  setSections(copy);
                                }}
                                placeholder="Callout box title (e.g. CQC Benchmark)"
                                className="w-full px-2.5 py-1.5 text-xs border border-line rounded font-semibold"
                              />
                              <textarea
                                rows={2}
                                value={sec.calloutText}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  copy[idx].calloutText = e.target.value;
                                  setSections(copy);
                                }}
                                placeholder="Callout regulatory quote or advisory text..."
                                className="w-full px-2.5 py-1.5 text-xs border border-line rounded leading-relaxed"
                              />
                            </div>
                          )}
                        </div>

                        {/* Bullet Points */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-navy-900">
                            Checklist Bullets (Optional — one bullet per line)
                          </label>
                          <textarea
                            rows={3}
                            value={sec.bulletsText}
                            onChange={(e) => {
                              const copy = [...sections];
                              copy[idx].bulletsText = e.target.value;
                              setSections(copy);
                            }}
                            placeholder="Safeguarding protocols&#10;Medication compliance&#10;Quality audit frameworks"
                            className="w-full px-3 py-2 text-xs border border-line rounded focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white font-mono"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="w-full py-3 rounded-lg border-2 border-dashed border-line hover:border-navy-900 text-ink-soft hover:text-navy-900 text-xs font-semibold transition"
                    >
                      + Add Another Section
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: FAQs */}
              {editorTab === "faqs" && (
                <div className="space-y-5 max-w-3xl">
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <p className="text-xs text-ink-soft">
                      In-article FAQs target specific questions asked by adult learners
                      and improve Google Search Rich Snippet indexing.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-navy-900 text-white hover:bg-navy-700 transition"
                    >
                      + Add FAQ Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-white border border-line space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                            FAQ Question #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const copy = [...faqs];
                            copy[idx].question = e.target.value;
                            setFaqs(copy);
                          }}
                          placeholder="e.g. Do I need to sit timed exams?"
                          className="w-full px-3 py-1.5 text-sm border border-line rounded font-semibold"
                        />
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const copy = [...faqs];
                            copy[idx].answer = e.target.value;
                            setFaqs(copy);
                          }}
                          placeholder="Factual answer explaining regulatory requirements..."
                          className="w-full px-3 py-1.5 text-xs border border-line rounded leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SEO & Course Recommendation */}
              {editorTab === "seo" && (
                <div className="space-y-5 max-w-2xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      Recommended Course CTA Band
                    </label>
                    <select
                      value={relatedCourseId}
                      onChange={(e) => setRelatedCourseId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-line rounded bg-white"
                    >
                      <option value="">-- No specific course link --</option>
                      {liveCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.category})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-ink-soft">
                      When selected, a high-converting course spotlight card is
                      automatically rendered at the base of the article.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-4 border-t border-line">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      SEO Meta Title (Target: 50–60 characters)
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="e.g. How to Become a Registered Care Manager UK (2026 Guide)"
                      className="w-full px-3 py-2 text-sm border border-line rounded font-mono text-xs"
                    />
                    <div className="flex items-center justify-between text-[11px] text-ink-soft">
                      <span>Length: {metaTitle.length} characters</span>
                      <span>
                        {metaTitle.length >= 40 && metaTitle.length <= 65
                          ? "✓ Optimal length"
                          : "Recommended: 40–65 characters"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      SEO Meta Description (Target: 140–160 characters)
                    </label>
                    <textarea
                      rows={3}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Authoritative summary for Google search result snippets..."
                      className="w-full px-3 py-2 text-xs border border-line rounded font-mono leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px] text-ink-soft">
                      <span>Length: {metaDescription.length} characters</span>
                      <span>
                        {metaDescription.length >= 130 &&
                        metaDescription.length <= 165
                          ? "✓ Optimal length"
                          : "Recommended: 130–165 characters"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-line bg-paper flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-ink-soft">
                Changes will be published immediately upon saving.
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded border border-line bg-white text-navy-900 hover:bg-paper transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold rounded bg-gold-500 text-navy-900 hover:bg-gold-300 transition shadow-sm disabled:opacity-50"
                >
                  {isPending ? "Publishing..." : "Save & Publish Article"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
