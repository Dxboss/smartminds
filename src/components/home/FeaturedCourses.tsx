import React from "react";
import Link from "next/link";
import {
  courses,
  globalSettings,
  defaultPlan6Months,
  calculatePricing,
} from "@/content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

export const FeaturedCourses: React.FC = () => {
  // Select top 6 featured courses
  const featured = courses.slice(0, 6);

  return (
    <Section variant="white" className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow tone="navy" className="mb-2">
              Featured Programmes
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Popular live-taught qualifications
            </Heading>
            <p className="text-ink-soft text-base sm:text-lg max-w-xl leading-relaxed">
              Explore our most requested British diplomas. Every programme
              features live tutor-led sessions, continuous mentor support, and
              flexible instalment schedules.
            </p>
          </div>

          <Link
            href="/courses"
            className="text-sm font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 decoration-gold-500 hover:decoration-navy-700 whitespace-nowrap min-h-[44px] inline-flex items-center"
          >
            View all courses &rarr;
          </Link>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((course) => {
            const lowestLevel = course.levels[0];
            const primaryPlan = lowestLevel?.plans[0] || defaultPlan6Months;
            const pricing = lowestLevel
              ? calculatePricing(lowestLevel, primaryPlan, globalSettings)
              : null;

            // Formulate level range string (e.g. "Levels 2 – 4" or "Level 3")
            const levelLabels = course.levels.map((l) => l.level_label);
            const levelRange =
              levelLabels.length > 1
                ? `${levelLabels[0]} – ${levelLabels[levelLabels.length - 1]}`
                : levelLabels[0] || "Certificate";

            return (
              <article
                key={course.id}
                className="group bg-paper rounded-lg border border-line p-6 shadow-subtle hover:border-navy-900/30 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Tags Bar */}
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

                  {/* Course Title */}
                  <h3 className="font-heading text-xl font-bold text-navy-900 group-hover:text-navy-700 transition-colors mb-2 line-clamp-2">
                    <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                  </h3>

                  {/* Short summary */}
                  <p className="text-sm text-ink-soft leading-relaxed line-clamp-3 mb-6">
                    {course.summary}
                  </p>
                </div>

                {/* Bottom Card Block: Pricing & Action */}
                <div className="pt-4 border-t border-line space-y-4">
                  {/* Key metadata line */}
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
                        <span>Awarded by:</span>
                        <strong className="text-navy-900">
                          {course.awarding_body}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Pricing snippet */}
                  {pricing && (
                    <div className="bg-white rounded-sm border border-line p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                          Pay in full
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

                  {/* View Details CTA */}
                  <Link
                    href={`/courses/${course.slug}`}
                    className="w-full inline-flex items-center justify-center min-h-[44px] px-4 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-bold text-sm transition-colors group-hover:shadow-sm"
                  >
                    <span>View course & pricing</span>
                    <Icon name="arrow-right" size={15} className="ml-1.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-sm border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white font-heading font-bold text-base transition-colors"
          >
            Explore all qualifications &rarr;
          </Link>
        </div>
      </Container>
    </Section>
  );
};
