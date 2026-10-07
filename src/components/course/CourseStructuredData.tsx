import React from "react";
import { Course } from "@/content/types";

interface CourseStructuredDataProps {
  course: Course;
}

export const CourseStructuredData: React.FC<CourseStructuredDataProps> = ({
  course,
}) => {
  const primaryLevel = course.levels[0];

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
    course.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: course.faqs.map((faq) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
};
