import { Metadata } from "next";
import { Suspense } from "react";
import { getCourseRepo } from "@/lib/repositories";
import { courses } from "@/content/courses";
import type { Course } from "@/content/types";
import { CoursesListingView } from "@/components/course/CoursesListingView";
import {
  getPersistedFaculties,
  getPublishedCmsPageSections,
  pullLatestFromNeon,
  type FacultyRecord,
  DEFAULT_COLLEGE_FACULTIES,
} from "@/lib/persistedData";
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
    await pullLatestFromNeon();
  } catch (err) {
    console.warn("[courses/page] Notice: pullLatestFromNeon warning:", err);
  }

  let customSections: any[] = [];
  try {
    customSections = getPublishedCmsPageSections("/courses") || [];
  } catch {
    customSections = [];
  }

  let publishedCourses: Course[] = [];
  try {
    const courseRepo = getCourseRepo();
    const allCourses = await courseRepo.listCourses();
    publishedCourses = (allCourses || []).filter((c) => c && c.published);
  } catch (err) {
    console.error("[courses/page] Failed to list courses from repo, falling back to static:", err);
    publishedCourses = (courses || []).filter((c) => c && c.published);
  }

  if (publishedCourses.length === 0) {
    publishedCourses = (courses || []).filter((c) => c && c.published);
  }

  let faculties: FacultyRecord[] = [];
  try {
    faculties = getPersistedFaculties() || [];
  } catch {
    faculties = [...DEFAULT_COLLEGE_FACULTIES];
  }
  if (!faculties || faculties.length === 0) {
    faculties = [...DEFAULT_COLLEGE_FACULTIES];
  }

  if (customSections && customSections.length > 0) {
    return (
      <div className="bg-paper text-ink min-h-screen">
        <Suspense
          fallback={
            <div className="bg-paper min-h-[50vh] flex items-center justify-center text-ink-soft text-sm">
              Loading qualifications catalogue...
            </div>
          }
        >
          {customSections
            .filter((sec) => sec.enabled)
            .map((sec) => (
              <SectionRenderer
                key={sec.id}
                section={sec}
                courses={publishedCourses}
                faculties={faculties}
              />
            ))}
        </Suspense>
      </div>
    );
  }

  return (
    <div>
      <Suspense
        fallback={
          <div className="bg-paper min-h-[50vh] flex items-center justify-center text-ink-soft text-sm">
            Loading qualifications catalogue...
          </div>
        }
      >
        <CoursesListingView initialCourses={publishedCourses} initialFaculties={faculties} />
      </Suspense>
    </div>
  );
}
