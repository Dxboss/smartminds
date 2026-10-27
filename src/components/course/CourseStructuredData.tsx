import React from "react";
import { Course } from "@/content/types";

interface CourseStructuredDataProps {
  course: Course;
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export const CourseStructuredData: React.FC<CourseStructuredDataProps> = ({
  course,
}) => {
  const levels = Array.isArray(course.levels) ? course.levels : [];
  const faqs = Array.isArray(course.faqs) ? course.faqs : [];
  const primaryLevel = levels[0];

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary,
    provider: {
      "@type": "EducationalOrganization",
      name: "Smartminds Training College",
      url: "https://smartmindstraining.co.uk",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: primaryLevel ? primaryLevel.duration_text : "4-6 months",
    },
    offers: primaryLevel
      ? {
          "@type": "Offer",
          price: primaryLevel.price_gbp,
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          category:
            course.funding === "funded" ? "Government Funded" : "Tuition Fee",
        }
      : undefined,
  };

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(courseSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
        />
      )}
    </>
  );
};
