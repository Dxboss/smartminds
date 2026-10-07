"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Course } from "@/content/types";
import { globalSettings } from "@/content/globals";
import { defaultPlan6Months } from "@/content/plans";
import { calculatePricing } from "@/content/pricing";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
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

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialCourses.forEach((c) => set.add(c.category));
    return ["All", ...Array.from(set)];
  }, [initialCourses]);

  const types = ["All", "regulated", "cpd", "tutoring"];

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

  return (
    <div className="bg-paper py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <Eyebrow tone="navy" className="mb-2">
            Course Directory
          </Eyebrow>
          <Heading level="h1" className="text-navy-900 mb-3">
            British Regulated Qualifications & CPD
          </Heading>
          <p className="text-ink-soft text-base sm:text-lg leading-relaxed">
            All courses feature live evening classes with dedicated tutors,
            accredited awarding bodies, and interest-free instalment options.
          </p>
        </div>

        {/* Filters Controls Panel */}
        <div className="bg-white rounded-lg border border-line p-5 md:p-6 mb-10 shadow-subtle space-y-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-ink-soft pointer-events-none">
                <Icon name="book-open" size={16} />
              </span>
              <input
                type="text"
                placeholder="Search courses by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-navy-900"
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
                className="text-xs font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 self-start md:self-auto min-h-[44px] flex items-center"
              >
                Reset all filters ({filteredCourses.length} results)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-line">
            {/* Category Dropdown/Selector */}
            <div>
              <label
                htmlFor="filter-category"
                className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Subject Area
              </label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label
                htmlFor="filter-type"
                className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Course Type
              </label>
              <select
                id="filter-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-2 px-3 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 capitalize min-h-[44px]"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t === "All"
                      ? "All Types"
                      : t === "cpd"
                        ? "CPD Certificates"
                        : t === "regulated"
                          ? "Regulated Qualifications (RQF)"
                          : "Private Tutoring"}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label
                htmlFor="filter-level"
                className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Level Range
              </label>
              <select
                id="filter-level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full py-2 px-3 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl === "All" ? "All Levels" : lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-ink-soft">
          <span>
            Showing{" "}
            <strong className="text-navy-900">{filteredCourses.length}</strong>{" "}
            of <strong>{initialCourses.length}</strong> qualifications
          </span>
          {isFiltered && (
            <span className="font-mono text-gold-700">Filtered view</span>
          )}
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const lowestLevel = course.levels[0];
              const primaryPlan = lowestLevel?.plans[0] || defaultPlan6Months;
              const pricing = lowestLevel
                ? calculatePricing(lowestLevel, primaryPlan, globalSettings)
                : null;

              const levelLabels = course.levels.map((l) => l.level_label);
              const levelRange =
                levelLabels.length > 1
                  ? `${levelLabels[0]} – ${levelLabels[levelLabels.length - 1]}`
                  : levelLabels[0] || "Certificate";

              return (
                <article
                  key={course.id}
                  className="group bg-white rounded-lg border border-line p-6 shadow-subtle hover:border-navy-900/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                        {course.category}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {course.funding === "funded" ||
                        course.funding === "both" ? (
                          <Tag variant="gold" className="text-xs">
                            Funding Eligible
                          </Tag>
                        ) : null}
                        <Tag variant="live" className="text-xs">
                          Live Online
                        </Tag>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="font-heading text-xl font-bold text-navy-900 group-hover:text-navy-700 transition-colors mb-2 line-clamp-2">
                      <Link href={`/courses/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-ink-soft leading-relaxed line-clamp-3 mb-6">
                      {course.summary}
                    </p>
                  </div>

                  {/* Card Footer Block */}
                  <div className="pt-4 border-t border-line space-y-4">
                    {/* Metadata line */}
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          name="graduation-cap"
                          size={14}
                          className="text-navy-900"
                        />
                        <span className="font-semibold text-navy-900">
                          {levelRange}
                        </span>
                      </div>

                      {course.awarding_body && (
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <span>Awarding body:</span>
                          <strong className="text-navy-900">
                            {course.awarding_body}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Price display per PRD 10.2: From £X */}
                    {pricing && (
                      <div className="bg-paper rounded-sm border border-line p-3 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                            From (Pay in Full)
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-heading font-bold text-lg text-navy-900">
                              £{pricing.fullPayPrice}
                            </span>
                            <span className="text-xs line-through text-ink-soft">
                              £{pricing.total}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                            Or spread
                          </span>
                          <span className="font-heading font-bold text-sm text-navy-700">
                            £{pricing.monthly}/mo
                          </span>
                        </div>
                      </div>
                    )}

                    {/* CTA link */}
                    <Link
                      href={`/courses/${course.slug}`}
                      className="w-full inline-flex items-center justify-center min-h-[44px] px-4 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-bold text-sm transition-colors"
                    >
                      <span>View details & pricing</span>
                      <Icon name="arrow-right" size={15} className="ml-1.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State per PRD 10.2 */
          <div className="bg-white rounded-lg border border-line p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-sm bg-paper text-navy-900 mx-auto flex items-center justify-center">
              <Icon name="info" size={24} />
            </div>
            <h3 className="font-heading text-xl font-bold text-navy-900">
              No matching courses found
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              We couldn&apos;t find any qualifications matching your selected
              filters. Try broadening your search criteria or reset filters to
              browse all options.
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
