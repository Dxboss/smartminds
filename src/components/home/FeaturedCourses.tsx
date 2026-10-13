import React from "react";
import Link from "next/link";
import { courses } from "@/content";
import { CourseCard } from "@/components/course/CourseCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";

export interface FeaturedCoursesProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: "white" | "paper" | "navy" | "cream";
  columns?: 2 | 3 | 4;
}

export const FeaturedCourses: React.FC<FeaturedCoursesProps> = ({
  headline = "Popular live-taught qualifications",
  subheadline = "Explore our most requested British diplomas. Every programme features live tutor-led sessions, continuous mentor support, and flexible instalment schedules.",
  buttonText = "View all courses",
  buttonLink = "/courses",
  bgColor = "white",
  columns = 3,
}) => {
  // Select top 6 featured published courses
  const featured = courses.filter((c) => c.published).slice(0, 6);
  const isDark = bgColor === "navy";

  const colClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <Section variant={bgColor} className="border-b border-line">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow tone={isDark ? "gold" : "navy"} className="mb-2">
              Featured Programmes
            </Eyebrow>
            <Heading level="h2" className={`mb-2 ${isDark ? "text-white" : "text-navy-900"}`}>
              {headline}
            </Heading>
            <p className={`text-base sm:text-lg max-w-xl leading-relaxed ${isDark ? "text-paper/85" : "text-ink-soft"}`}>
              {subheadline}
            </p>
          </div>

          <Link
            href={buttonLink || "/courses"}
            className={`text-sm font-semibold underline underline-offset-4 decoration-gold-500 whitespace-nowrap min-h-[44px] inline-flex items-center ${
              isDark ? "text-gold-300 hover:text-white" : "text-navy-900 hover:text-navy-700"
            }`}
          >
            {buttonText || "View all courses"} &rarr;
          </Link>
        </div>

        {/* Dynamic Course Cards Grid */}
        <div className={`grid ${colClass} gap-6`}>
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
            className={`inline-flex items-center justify-center min-h-[44px] px-6 rounded-sm border font-heading font-bold text-base transition-colors ${
              isDark
                ? "border-gold-300 text-gold-300 hover:bg-gold-500 hover:text-navy-900"
                : "border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
            }`}
          >
            Explore all qualifications &rarr;
          </Link>
        </div>
      </Container>
    </Section>
  );
};
