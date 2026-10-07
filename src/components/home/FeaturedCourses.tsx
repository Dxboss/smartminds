import React from "react";
import Link from "next/link";
import { courses } from "@/content";
import { CourseCard } from "@/components/course/CourseCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";

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
          {featured.map((course, index) => {
            return (
              <CourseCard
                key={course.id}
                course={course}
                headingLevel="h3"
                priority={index < 3}
              />
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
