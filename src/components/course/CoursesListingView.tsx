"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Course } from "@/content/types";
import { CourseCard } from "@/components/course/CourseCard";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface CoursesListingViewProps {
  initialCourses: Course[];
}

export const CoursesListingView: React.FC<CoursesListingViewProps> = ({
  initialCourses,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialCourses.forEach((c) => set.add(c.category));
    return ["All", ...Array.from(set)];
  }, [initialCourses]);

  const levels = ["All", "Level 2", "Level 3", "Level 4", "Level 5"];

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      // Category filter
      if (selectedCategory !== "All" && course.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== "All" && course.type !== selectedType) {
        return false;
      }

      // Level filter
      if (selectedLevel !== "All") {
        const hasLevel = course.levels.some((l) =>
          l.level_label.toLowerCase().includes(selectedLevel.toLowerCase())
        );
        if (!hasLevel) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesSummary = course.summary.toLowerCase().includes(query);
        const matchesCategory = course.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSummary && !matchesCategory) return false;
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

  // Flagship featured course (e.g. Diploma in Adult Care)
  const flagshipCourse = initialCourses.find(
    (c) => c.id === "course-adult-care"
  );

  return (
    <div className="bg-paper py-10 md:py-16">
      <Container>
        {/* Editorial Prospectus Hero Section with Authentic Photography */}
        <div className="mb-14 rounded-md border border-line bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-navy-900 text-white text-xs font-semibold">
                  <Icon name="shield-check" size={14} className="text-gold-300" />
                  <span>Ofqual Regulated British Frameworks • Centre Accreditation</span>
                </div>

                <Heading level="h1" className="text-navy-900 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  British Accredited Qualifications & Professional Diplomas
                </Heading>

                <p className="text-ink-soft text-base sm:text-lg leading-relaxed">
                  Smartminds Training College delivers recognised RQF vocational diplomas and healthcare CPD accredited by NCFE, TQUK, and Pearson. Every programme features live weekly interactive evening seminars led by practicing healthcare specialists, zero written exams, and 0% interest instalment plans.
                </p>
              </div>

              {/* Quality Indicators Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-line text-xs">
                <div className="p-3 bg-paper rounded-sm border border-line">
                  <strong className="text-navy-900 block font-heading text-sm font-bold">NCFE & TQUK</strong>
                  <span className="text-ink-soft text-[11px]">Approved Awarding Bodies</span>
                </div>
                <div className="p-3 bg-paper rounded-sm border border-line">
                  <strong className="text-navy-900 block font-heading text-sm font-bold">100% Coursework</strong>
                  <span className="text-ink-soft text-[11px]">Portfolio Based (No Exams)</span>
                </div>
                <div className="p-3 bg-paper rounded-sm border border-line">
                  <strong className="text-navy-900 block font-heading text-sm font-bold">Live Zoom Seminars</strong>
                  <span className="text-ink-soft text-[11px]">Evenings + Portal Replays</span>
                </div>
                <div className="p-3 bg-paper rounded-sm border border-line">
                  <strong className="text-emerald-700 block font-heading text-sm font-bold">0% Interest Spread</strong>
                  <span className="text-ink-soft text-[11px]">3, 6, 10 & 12 Month Plans</span>
                </div>
              </div>
            </div>

            {/* Right Educational Photography Column */}
            <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-navy-900 border-t lg:border-t-0 lg:border-l border-line overflow-hidden">
              <img
                src="/images/adult-care-training.jpg"
                alt="Adult social care learners during clinical skills seminar at Smartminds Training College"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent pointer-events-none" />

              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/20 shadow-sm flex items-center gap-2 text-xs font-bold text-navy-900">
                <Icon name="graduation-cap" size={15} className="text-navy-900" />
                <span>UKPRN Verified Centre</span>
              </div>

              <div className="absolute bottom-4 inset-x-4 text-white">
                <span className="text-[11px] font-mono text-gold-300 uppercase tracking-wider block">
                  Autumn & Winter 2026 Cohorts
                </span>
                <p className="font-heading font-bold text-base text-white leading-snug">
                  Rolling weekly intake with 1-to-1 personal assessor support
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EDITORIAL SHOWCASE ROW: Flagship Adult Care Pathway (shown when no specific search is active) */}
        {!isFiltered && flagshipCourse && (
          <div className="mb-14 rounded-md border border-navy-900/20 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Visual & Badge Panel */}
              <div className="lg:col-span-5 bg-navy-900 text-white p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gold-300 border border-white/15 mb-4">
                    <Icon name="star" size={12} className="text-gold-300" />
                    Featured Qualification Pathway
                  </span>

                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-3">
                    Diploma in Adult Care (RQF Levels 2, 3 & 5)
                  </h2>

                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6">
                    Mandatory regulated qualifications required by the Care Quality Commission (CQC) for adult care workers, senior carers, team leaders, and registered service managers in England.
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/15 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Awarding Organisation:</span>
                    <strong className="text-white">TQUK & NCFE</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Class Delivery:</span>
                    <strong className="text-gold-300">Live Zoom (Evening, Afternoon & Weekend Cohorts)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Study Pack:</span>
                    <strong className="text-white">Printed Physical Textbook Included</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Level Options, Tuition & Direct Action */}
              <div className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between bg-white space-y-6">
                <div>
                  <h3 className="font-heading text-lg font-bold text-navy-900 mb-3">
                    Choose Your Target Qualification Level:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {flagshipCourse.levels.map((lvl) => (
                      <div
                        key={lvl.level_label}
                        className="p-3.5 rounded-sm border border-line bg-paper flex flex-col justify-between space-y-2 hover:border-navy-900/40 transition-colors"
                      >
                        <div>
                          <span className="font-heading font-bold text-navy-900 text-base block">
                            {lvl.level_label}
                          </span>
                          <span className="text-[11px] text-ink-soft block">
                            {lvl.duration_text} ({lvl.guided_learning_hours} GLH)
                          </span>
                        </div>
                        <div className="pt-2 border-t border-line/60">
                          <span className="text-xs font-bold text-navy-900 block font-mono">
                            £{lvl.price_gbp.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gold-700 font-semibold block">
                            or spread across 12 months
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="text-xs text-ink-soft">
                    <span className="block font-medium text-navy-900">
                      Admissions Open: Rolling Monthly Enrolments
                    </span>
                    <span>1-to-1 Assessor Assigned within 48 Hours</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/courses/${flagshipCourse.slug}`}
                      className="px-4 py-2.5 rounded-sm bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold transition-colors text-center shadow-xs"
                    >
                      View Syllabus & Units
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prospectus Filter & Search Strip */}
        <div className="bg-white rounded-md border border-line p-5 mb-8 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-ink-soft pointer-events-none">
                <Icon name="search" size={16} />
              </span>
              <input
                type="text"
                placeholder="Search qualifications, units, or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-sm border border-line bg-paper text-ink text-xs sm:text-sm placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-navy-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-ink-soft hover:text-navy-900"
                  aria-label="Clear search"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            {/* Clear filters shortcut */}
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 self-start md:self-auto min-h-[40px] flex items-center"
              >
                Reset filters ({filteredCourses.length} results)
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="pt-3 border-t border-line flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-soft font-semibold mr-1">Subject Area:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-sm font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-navy-900 text-white shadow-xs"
                    : "bg-paper text-ink-soft hover:text-ink border border-line"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-soft font-semibold mr-1">Qualification Level:</span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-colors ${
                  selectedLevel === lvl
                    ? "bg-navy-700 text-white"
                    : "bg-paper text-ink-soft hover:text-ink border border-line"
                }`}
              >
                {lvl}
              </button>
            ))}

            {/* Type selector */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-ink-soft font-semibold text-[11px]">Type:</span>
              {[
                { id: "All", label: "All" },
                { id: "regulated", label: "Regulated (RQF)" },
                { id: "cpd", label: "CPD Certificates" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-colors ${
                    selectedType === t.id
                      ? "bg-navy-900 text-white"
                      : "bg-paper text-ink-soft hover:text-ink border border-line"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-ink-soft">
          <span>
            Showing <strong className="text-navy-900 font-semibold">{filteredCourses.length}</strong> qualifications
          </span>
          {isFiltered && (
            <span className="font-mono text-gold-700 font-semibold">Active filter view</span>
          )}
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
        ) : (
          /* Empty State */
          <div className="bg-white rounded-md border border-line p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-sm bg-paper text-navy-900 mx-auto flex items-center justify-center border border-line">
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
                Reset all filters
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
