import type { Metadata } from "next";
import { getPublishedCmsPageSections, getLiveCourses, pullLatestFromNeon } from "@/lib/persistedData";
import { SectionRenderer } from "@/components/cms/SectionRenderer";

export const metadata: Metadata = {
  title: "Smartminds Training College | Live Classes with Real Tutors",
  description:
    "Study recognised UK qualifications with live online evening classes led by expert tutors. Flexible monthly instalment plans and funded options in health, social care, and education.",
  openGraph: {
    title: "Smartminds Training College | Live Classes with Real Tutors",
    description:
      "Study recognised UK qualifications with live online evening classes led by expert tutors. Flexible monthly instalments with zero interest.",
    type: "website",
    locale: "en_GB",
  },
};

export default async function HomePage() {
  try {
    await pullLatestFromNeon();
  } catch {}

  const sections = getPublishedCmsPageSections("/");
  const liveCourses = getLiveCourses();

  return (
    <div className="bg-paper text-ink min-h-screen">
      {sections
        .filter((sec) => sec.enabled)
        .map((sec) => (
          <SectionRenderer key={sec.id} section={sec} courses={liveCourses} />
        ))}
    </div>
  );
}
