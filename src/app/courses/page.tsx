import { Metadata } from "next";
import { getCourseRepo } from "@/lib/repositories";
import { CoursesListingView } from "@/components/course/CoursesListingView";
import { getPersistedFaculties, getPublishedCmsPageSections } from "@/lib/persistedData";
import { SectionRenderer } from "@/components/cms/SectionRenderer";

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

export default async function CoursesPage() {
  try {
    const { pullLatestFromNeon } = await import("@/lib/persistedData");
    await pullLatestFromNeon();
  } catch {}

  const customSections = getPublishedCmsPageSections("/courses");
  const courseRepo = getCourseRepo();
  const allCourses = await courseRepo.listCourses();
  const publishedCourses = allCourses.filter((c) => c.published);
  const faculties = getPersistedFaculties();

  if (customSections && customSections.length > 0) {
    return (
      <main className="bg-paper text-ink min-h-screen">
        {customSections
          .filter((sec) => sec.enabled)
          .map((sec) => (
            <SectionRenderer key={sec.id} section={sec} courses={publishedCourses} />
          ))}
      </main>
    );
  }

  return (
    <main>
      <CoursesListingView initialCourses={publishedCourses} initialFaculties={faculties} />
    </main>
  );
}
