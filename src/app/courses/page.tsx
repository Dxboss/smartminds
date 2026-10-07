import { Metadata } from "next";
import { courses } from "@/content";
import { CoursesListingView } from "@/components/course/CoursesListingView";

export const metadata: Metadata = {
  title: "All Qualifications & Courses | Smartminds Training College",
  description:
    "Explore our accredited British qualifications and CPD courses. Live online evening classes with expert tutors, recognised awarding bodies, and interest-free instalment plans.",
  openGraph: {
    title: "All Qualifications & Courses | Smartminds Training College",
    description:
      "Explore our accredited British qualifications and CPD courses. Live online evening classes with expert tutors.",
    type: "website",
  },
};

export default function CoursesPage() {
  const publishedCourses = courses.filter((c) => c.published);

  return (
    <main>
      <CoursesListingView initialCourses={publishedCourses} />
    </main>
  );
}
