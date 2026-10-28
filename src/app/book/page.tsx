import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { NativeScheduler } from "@/components/booking/NativeScheduler";
import { getLiveCourses, getPublishedCmsPageSections, pullLatestFromNeon } from "@/lib/persistedData";
import { SectionRenderer } from "@/components/cms/SectionRenderer";

export const metadata: Metadata = {
  title: "Book Free Course Advice Call | Smartminds Training College",
  description:
    "Schedule a free 15-minute 1-on-1 advice call with an academic tutor. Discuss course entry requirements, government funding eligibility, and flexible instalment plans.",
  openGraph: {
    title: "Book Free Course Advice Call | Smartminds Training College",
    description:
      "Schedule a free 15-minute 1-on-1 advice call with an academic tutor. No sales pressure, no obligation.",
    type: "website",
  },
};

export default async function BookPage() {
  await pullLatestFromNeon();
  const liveCourses = getLiveCourses();
  const customSections = getPublishedCmsPageSections("/book");
  if (customSections && customSections.length > 0) {
    return (
      <div className="bg-paper text-ink min-h-screen">
        {customSections
          .filter((sec) => sec.enabled)
          .map((sec) => (
            <SectionRenderer key={sec.id} section={sec} courses={liveCourses} />
          ))}
      </div>
    );
  }

  const courseOptions = liveCourses.map((c) => ({
    id: c.id,
    title: c.title,
    published: c.published,
  }));

  return (
    <div className="bg-paper py-12 md:py-20 min-h-screen">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2">
              <Tag variant="gold">15-Minute Consultation</Tag>
              <Tag variant="live">Live With A Tutor</Tag>
            </div>

            <Eyebrow tone="navy" className="block tracking-widest pt-2">
              Academic Admissions
            </Eyebrow>

            <Heading level="h1" className="text-navy-900 text-3xl sm:text-4xl">
              Book Your Free Consultation
            </Heading>

            <p className="text-sm sm:text-base text-ink-soft max-w-xl mx-auto leading-relaxed">
              Choose a time that works for you. We will discuss your background,
              verify entry criteria, and check whether your qualification can be
              funded through government schemes.
            </p>
          </div>

          {/* College Consultation Scheduler Card */}
          <div className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle">
            <NativeScheduler coursesList={courseOptions} />
          </div>

          {/* Consultation Reassurance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border border-line text-xs space-y-1">
              <strong className="font-heading font-bold text-sm text-navy-900 block">
                15 Minutes
              </strong>
              <span className="text-ink-soft">Short, focused discussion</span>
            </div>
            <div className="p-4 bg-white rounded-lg border border-line text-xs space-y-1">
              <strong className="font-heading font-bold text-sm text-navy-900 block">
                Real Tutors
              </strong>
              <span className="text-ink-soft">Speak to subject teachers</span>
            </div>
            <div className="p-4 bg-white rounded-lg border border-line text-xs space-y-1">
              <strong className="font-heading font-bold text-sm text-navy-900 block">
                Zero Obligation
              </strong>
              <span className="text-ink-soft">Purely informational advice</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
