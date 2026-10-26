"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Course } from "@/content/types";
import { CourseCard } from "@/components/course/CourseCard";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

import { type FacultyRecord, DEFAULT_COLLEGE_FACULTIES } from "@/content/faculties";

interface CoursesListingViewProps {
  initialCourses: Course[];
  initialFaculties?: FacultyRecord[];
  customHeadline?: string;
  customSubheadline?: string;
  isEditor?: boolean;
  onSelectElement?: (elementKey: "headline" | "subheadline") => void;
}

/**
 * Intelligent category matcher that bridges faculty names (from CMS/faculties.ts)
 * with course category labels (from courses.ts).
 */
export function matchesCategory(course: Course, targetCategory: string): boolean {
  if (!targetCategory || targetCategory === "All" || targetCategory === "all") return true;

  const target = targetCategory.toLowerCase().trim();
  const cat = (course.category || "").toLowerCase().trim();
  const title = (course.title || "").toLowerCase().trim();

  // 1. Direct equality
  if (cat === target) return true;

  // 2. Childcare & Early Years (Check before Health Care so "childcare" isn't miscaught by generic "care")
  if (
    target.includes("child") ||
    target.includes("early years") ||
    target.includes("nursery")
  ) {
    return (
      cat.includes("child") ||
      cat.includes("early years") ||
      cat.includes("nursery") ||
      title.includes("early years") ||
      title.includes("children")
    );
  }

  // 3. Education, Teaching & Training (AET, CAVA, Assessor, IQA, Education)
  if (
    target.includes("education") ||
    target.includes("teach") ||
    target.includes("train") ||
    target.includes("assessor")
  ) {
    return (
      !cat.includes("child") &&
      (cat.includes("education") ||
        cat.includes("teach") ||
        cat.includes("train") ||
        cat.includes("assessor") ||
        title.includes("aet") ||
        title.includes("cava") ||
        title.includes("functional skills"))
    );
  }

  // 4. Business, Administration & Management
  if (
    target.includes("business") ||
    target.includes("admin") ||
    target.includes("office") ||
    target.includes("management")
  ) {
    return (
      !cat.includes("health") &&
      !cat.includes("care") &&
      (cat.includes("business") ||
        cat.includes("admin") ||
        cat.includes("management") ||
        cat.includes("office") ||
        cat.includes("it user") ||
        title.includes("business") ||
        title.includes("it user"))
    );
  }

  // 5. CPD & Compliance / Short Courses
  if (
    target.includes("cpd") ||
    target.includes("compliance") ||
    target.includes("continuing professional")
  ) {
    return (
      course.type === "cpd" ||
      cat.includes("cpd") ||
      cat.includes("compliance") ||
      cat.includes("continuing professional")
    );
  }

  // 6. Academic Tutoring / Private Tutoring
  if (
    target.includes("tutor") ||
    target.includes("academic") ||
    target.includes("gcse") ||
    target.includes("kids")
  ) {
    return (
      course.type === "tutoring" ||
      cat.includes("tutor") ||
      cat.includes("academic") ||
      cat.includes("gcse") ||
      title.includes("tutoring")
    );
  }

  // 7. Health & Social Care (Adult Care, Healthcare, Social Care)
  if (
    target.includes("health") ||
    target.includes("social care") ||
    (target.includes("care") && !target.includes("child"))
  ) {
    return (
      !cat.includes("child") &&
      (cat.includes("health") ||
        cat.includes("care") ||
        cat.includes("social") ||
        cat.includes("adult") ||
        title.includes("care") ||
        title.includes("health"))
    );
  }

  return cat.includes(target) || target.includes(cat);
}

const CoursesListingContent: React.FC<CoursesListingViewProps> = ({
  initialCourses,
  initialFaculties,
  customHeadline,
  customSubheadline,
  isEditor,
  onSelectElement,
}) => {
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categories list sourced directly from faculties configured on Course & Prices
  const categories = useMemo(() => {
    const result: string[] = ["All"];

    // 1. Primary source: Academic Faculties from Course & Prices
    const sourceFaculties =
      initialFaculties && initialFaculties.length > 0
        ? initialFaculties
        : DEFAULT_COLLEGE_FACULTIES;

    sourceFaculties.forEach((f) => {
      if (!f?.name) return;
      const name = f.name.trim();
      if (!result.some((r) => r.toLowerCase() === name.toLowerCase())) {
        result.push(name);
      }
    });

    // 2. Extra course categories that are not covered by any existing faculty
    (initialCourses || []).forEach((c) => {
      if (!c?.category) return;
      const cat = c.category.trim();
      const matchesAnyFaculty = result.some(
        (r) => r !== "All" && matchesCategory(c, r)
      );
      if (!matchesAnyFaculty && !result.some((r) => r.toLowerCase() === cat.toLowerCase())) {
        result.push(cat);
      }
    });

    return result;
  }, [initialCourses, initialFaculties]);

  // Sync with URL query parameters (e.g. /courses?category=Health+%26+Social+Care&level=Level+3)
  useEffect(() => {
    if (!searchParams) return;
    const catParam = searchParams.get("category");
    const typeParam = searchParams.get("type");
    const levelParam = searchParams.get("level");
    const queryParam = searchParams.get("q") || searchParams.get("search");

    if (catParam) {
      const matched = categories.find(
        (c) =>
          c.toLowerCase() === catParam.toLowerCase() ||
          (c !== "All" && matchesCategory({ category: catParam, title: "", type: "regulated" } as any, c))
      );
      setSelectedCategory(matched || catParam);
    }
    if (typeParam) setSelectedType(typeParam);
    if (levelParam) setSelectedLevel(levelParam);
    if (queryParam) setSearchQuery(queryParam);
  }, [searchParams, categories]);

  const levels = useMemo(() => ["All", "Level 2", "Level 3", "Level 4", "Level 5"], []);

  const frameworkTypes = useMemo(
    () => [
      { id: "All", label: "All Frameworks" },
      { id: "regulated", label: "Regulated (Ofqual RQF)" },
      { id: "cpd", label: "CPD Professional" },
      { id: "tutoring", label: "1-on-1 Tutoring" },
    ],
    []
  );

  // 1. Courses matching current Category & Search Query (the base dataset for cascading dependent counts)
  const categoryCourses = useMemo(() => {
    return (initialCourses || []).filter((course) => {
      if (!course) return false;
      if (selectedCategory !== "All" && !matchesCategory(course, selectedCategory)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (course.title || "").toLowerCase().includes(query);
        const matchesSummary = (course.summary || "").toLowerCase().includes(query);
        const matchesCategoryName = (course.category || "").toLowerCase().includes(query);
        const matchesAwarding = (course.awarding_body || "").toLowerCase().includes(query);
        const matchesLevel = (course.levels || []).some((l) =>
          (l?.level_label || "").toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesSummary && !matchesCategoryName && !matchesAwarding && !matchesLevel) {
          return false;
        }
      }
      return true;
    });
  }, [initialCourses, selectedCategory, searchQuery]);

  // 2. Cascading Level counts: how many courses in this category & framework type have each level
  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { All: categoryCourses.length };
    levels.forEach((lvl) => {
      if (lvl === "All") return;
      const count = categoryCourses.filter((c) => {
        if (selectedType !== "All" && c.type !== selectedType) return false;
        return (c.levels || []).some((l) =>
          (l?.level_label || "").toLowerCase().includes(lvl.toLowerCase())
        );
      }).length;
      counts[lvl] = count;
    });
    return counts;
  }, [categoryCourses, selectedType, levels]);

  // 3. Cascading Framework Type counts: how many courses in this category & level have each framework type
  const frameworkCounts = useMemo(() => {
    const counts: Record<string, number> = { All: categoryCourses.length };
    frameworkTypes.forEach((t) => {
      if (t.id === "All") return;
      const count = categoryCourses.filter((c) => {
        if (selectedLevel !== "All") {
          const hasLevel = (c.levels || []).some((l) =>
            (l?.level_label || "").toLowerCase().includes(selectedLevel.toLowerCase())
          );
          if (!hasLevel) return false;
        }
        return c.type === t.id;
      }).length;
      counts[t.id] = count;
    });
    return counts;
  }, [categoryCourses, selectedLevel, frameworkTypes]);

  // Auto-safety check: If active level has 0 available courses in this combination, auto-reset to "All"
  useEffect(() => {
    if (selectedLevel !== "All" && (levelCounts[selectedLevel] ?? 0) === 0) {
      setSelectedLevel("All");
    }
  }, [selectedLevel, levelCounts]);

  // Auto-safety check: If active framework has 0 available courses in this combination, auto-reset to "All"
  useEffect(() => {
    if (selectedType !== "All" && (frameworkCounts[selectedType] ?? 0) === 0) {
      setSelectedType("All");
    }
  }, [selectedType, frameworkCounts]);

  // Handler for category selection with smart reset of dependent child filters
  const handleCategorySelect = (cat: string) => {
    const newCat = selectedCategory === cat && cat !== "All" ? "All" : cat;
    setSelectedCategory(newCat);
    // Smart reset: reset level and framework to "All" so the user starts with clean valid choices
    setSelectedLevel("All");
    setSelectedType("All");
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      // Category filter with intelligent matching
      if (selectedCategory !== "All" && !matchesCategory(course, selectedCategory)) {
        return false;
      }

      // Framework Type filter
      if (selectedType !== "All" && course.type !== selectedType) {
        return false;
      }

      // Qualification Level filter
      if (selectedLevel !== "All") {
        const hasLevel = (course.levels || []).some((l) =>
          (l?.level_label || "").toLowerCase().includes(selectedLevel.toLowerCase())
        );
        if (!hasLevel) return false;
      }

      // Search query filter (matches title, summary, category, awarding body, and level labels)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (course.title || "").toLowerCase().includes(query);
        const matchesSummary = (course.summary || "").toLowerCase().includes(query);
        const matchesCategoryName = (course.category || "").toLowerCase().includes(query);
        const matchesAwarding = (course.awarding_body || "").toLowerCase().includes(query);
        const matchesLevel = (course.levels || []).some((l) =>
          (l?.level_label || "").toLowerCase().includes(query)
        );

        if (!matchesTitle && !matchesSummary && !matchesCategoryName && !matchesAwarding && !matchesLevel) {
          return false;
        }
      }

      return true;
    });
  }, [
    initialCourses,
    selectedCategory,
    selectedType,
    selectedLevel,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedType("All");
    setSelectedLevel("All");
    setSearchQuery("");
  };

  const isFiltered =
    selectedCategory !== "All" ||
    selectedType !== "All" ||
    selectedLevel !== "All" ||
    searchQuery.trim().length > 0;

  return (
    <div className="bg-paper py-10 md:py-16">
      <Container>
        {/* Breadcrumb & Topic Pills Header */}
        <div className="mb-8 space-y-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-soft">
            <Link href="/" className="hover:text-navy-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-navy-900 font-medium">Courses</span>
            <span>/</span>
            <span className="text-gold-500 font-semibold">{selectedCategory === "All" ? "All Programmes" : selectedCategory}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("headline");
                  }
                }}
                className={`font-heading text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight ${
                  isEditor ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500 rounded-xs" : ""
                }`}
              >
                {customHeadline || "British Regulated Qualifications & Diplomas"}
              </h1>
              <p
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement("subheadline");
                  }
                }}
                className={`text-ink-soft text-sm sm:text-base max-w-2xl mt-1 ${
                  isEditor ? "cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-gold-500 rounded-xs" : ""
                }`}
              >
                {customSubheadline ||
                  "Explore Ofqual-regulated frameworks with live tutor seminars, coursework assessments, and 0% interest monthly payment plans."}
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full md:w-72 flex-shrink-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-ink-soft pointer-events-none">
                <Icon name="search" size={16} />
              </span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-line bg-white text-ink text-xs sm:text-sm placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-navy-700 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-2.5 flex items-center text-ink-soft hover:text-navy-900"
                  aria-label="Clear search"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Topic Pills */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-ink-soft font-semibold mr-1 flex-shrink-0">Topics:</span>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-navy-900 text-white shadow-xs font-bold"
                      : "bg-white text-ink-soft border border-line hover:border-navy-700 hover:text-navy-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Catalogue Layout (Left Multi-facet Sidebar + Right 3-Col Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Multi-Facet Filter Sidebar */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-line p-5 shadow-subtle space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <span className="font-heading font-bold text-base text-navy-900">Filters</span>
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-gold-500 hover:underline"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-navy-900">
                Categories
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const count = cat === "All"
                    ? initialCourses.length
                    : initialCourses.filter((c) => matchesCategory(c, cat)).length;
                  const isChecked = selectedCategory === cat;
                  return (
                    <label
                      key={cat}
                      className="flex items-center justify-between text-xs text-ink-soft hover:text-navy-900 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCategorySelect(cat)}
                          className="rounded text-navy-900 focus:ring-navy-700 w-3.5 h-3.5 cursor-pointer accent-navy-900"
                        />
                        <span className={isChecked ? "font-semibold text-navy-900" : ""}>{cat}</span>
                      </div>
                      <span className="text-[11px] text-ink-soft/70">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Qualification Level (Cascades based on Category & Framework) */}
            <div className="space-y-3 pt-4 border-t border-line/70">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-navy-900">
                  Level
                </h3>
                {selectedCategory !== "All" && (
                  <span className="text-[10px] text-ink-soft/60 italic">In this category</span>
                )}
              </div>
              <div className="space-y-2">
                {levels.map((lvl) => {
                  const isChecked = selectedLevel === lvl;
                  const count = levelCounts[lvl] ?? 0;
                  const isDisabled = lvl !== "All" && count === 0;

                  return (
                    <label
                      key={lvl}
                      className={`flex items-center justify-between text-xs select-none transition-all ${
                        isDisabled
                          ? "opacity-35 cursor-not-allowed text-ink-soft/40"
                          : "cursor-pointer text-ink-soft hover:text-navy-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => {
                            if (isDisabled) return;
                            setSelectedLevel(isChecked && lvl !== "All" ? "All" : lvl);
                          }}
                          className={`rounded text-navy-900 focus:ring-navy-700 w-3.5 h-3.5 ${
                            isDisabled
                              ? "cursor-not-allowed opacity-30"
                              : "cursor-pointer accent-navy-900"
                          }`}
                        />
                        <span className={isChecked ? "font-semibold text-navy-900" : ""}>{lvl}</span>
                      </div>
                      <span className={`text-[11px] ${isDisabled ? "text-ink-soft/30" : "text-ink-soft/70"}`}>
                        ({count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Framework Type (Cascades based on Category & Level) */}
            <div className="space-y-3 pt-4 border-t border-line/70">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-navy-900">
                  Framework Type
                </h3>
                {selectedCategory !== "All" && (
                  <span className="text-[10px] text-ink-soft/60 italic">In this category</span>
                )}
              </div>
              <div className="space-y-2">
                {frameworkTypes.map((t) => {
                  const isChecked = selectedType === t.id;
                  const count = frameworkCounts[t.id] ?? 0;
                  const isDisabled = t.id !== "All" && count === 0;

                  return (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between text-xs select-none transition-all ${
                        isDisabled
                          ? "opacity-35 cursor-not-allowed text-ink-soft/40"
                          : "cursor-pointer text-ink-soft hover:text-navy-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => {
                            if (isDisabled) return;
                            setSelectedType(isChecked && t.id !== "All" ? "All" : t.id);
                          }}
                          className={`rounded text-navy-900 focus:ring-navy-700 w-3.5 h-3.5 ${
                            isDisabled
                              ? "cursor-not-allowed opacity-30"
                              : "cursor-pointer accent-navy-900"
                          }`}
                        />
                        <span className={isChecked ? "font-semibold text-navy-900" : ""}>{t.label}</span>
                      </div>
                      <span className={`text-[11px] ${isDisabled ? "text-ink-soft/30" : "text-ink-soft/70"}`}>
                        ({count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Clear Filter CTA */}
            {isFiltered && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-700 text-white font-heading font-bold text-xs transition-colors shadow-xs"
                >
                  Clear Filters ({filteredCourses.length})
                </button>
              </div>
            )}
          </aside>

          {/* Right Courses Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Results Bar */}
            <div className="flex items-center justify-between pb-2 text-xs text-ink-soft">
              <span>
                Showing <strong className="text-navy-900 font-bold">{filteredCourses.length}</strong> of {initialCourses.length} Courses
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span>Sorted by:</span>
                <span className="font-bold text-navy-900">Most Popular</span>
              </div>
            </div>

            {/* Course Cards Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    headingLevel="h2"
                    priority={index < 3}
                  />
                ))}
              </div>
            ) : selectedCategory !== "All" && initialCourses.filter((c) => matchesCategory(c, selectedCategory)).length === 0 ? (
              /* Dedicated Faculty Opening Soon Empty State */
              <div className="bg-white rounded-2xl border border-line p-10 md:p-14 text-center max-w-lg mx-auto space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-gold-50 text-gold-700 mx-auto flex items-center justify-center border border-gold-200 shadow-2xs">
                  <Icon name="graduation-cap" size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold-700 bg-gold-100/60 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                    Faculty Enrolments Opening Soon
                  </span>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-navy-900">
                    {selectedCategory}
                  </h3>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto">
                  New accredited British qualifications and specialist cohorts for this academic department are currently being finalized. You can pre-register your interest or speak with an admissions advisor today.
                </p>
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/book"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-heading font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Icon name="phone" size={14} className="text-gold-500" />
                    <span>Speak with an Advisor</span>
                  </Link>
                  <Button variant="outline" size="md" onClick={resetFilters}>
                    View All Programmes
                  </Button>
                </div>
              </div>
            ) : (
              /* General Empty State */
              <div className="bg-white rounded-2xl border border-line p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-navy-900 mx-auto flex items-center justify-center border border-teal-100">
                  <Icon name="info" size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  No matching qualifications found
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  We couldn&apos;t find any qualifications matching your selected criteria. Try resetting your filters to explore all British regulated programmes.
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="md" onClick={resetFilters}>
                    Reset All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export const CoursesListingView: React.FC<CoursesListingViewProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="bg-paper min-h-[50vh] flex items-center justify-center text-ink-soft text-sm">
          Loading courses...
        </div>
      }
    >
      <CoursesListingContent {...props} />
    </Suspense>
  );
};
