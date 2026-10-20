import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { PrivateTutoringForm } from "@/components/forms/PrivateTutoringForm";
import { getPublishedCmsPageSections, getLiveCourses } from "@/lib/persistedData";
import { SectionRenderer } from "@/components/cms/SectionRenderer";

export const metadata: Metadata = {
  title: "1-on-1 Private Tutoring (KS3 & GCSE) | Smartminds Training College",
  description:
    "Expert 1-on-1 online tutoring for KS3 and GCSE students in Mathematics and English. Enhanced DBS-checked educators, tailored study plans, and regular parental progress updates.",
  openGraph: {
    title: "1-on-1 Private Tutoring (KS3 & GCSE) | Smartminds",
    description:
      "Expert 1-on-1 online tutoring for KS3 and GCSE students in Mathematics and English. Enhanced DBS-checked tutors.",
    type: "website",
  },
  alternates: {
    canonical: "/private-tutoring",
  },
};

export default function PrivateTutoringPage() {
  const customSections = getPublishedCmsPageSections("/private-tutoring");
  if (customSections && customSections.length > 0) {
    const liveCourses = getLiveCourses();
    return (
      <main className="bg-paper text-ink min-h-screen">
        {customSections
          .filter((sec) => sec.enabled)
          .map((sec) => (
            <SectionRenderer key={sec.id} section={sec} courses={liveCourses} />
          ))}
      </main>
    );
  }

  return (
    <main className="bg-paper min-h-screen py-10 md:py-16">
      <Container>
        {/* Header Block */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Tag variant="gold">KS3 & GCSE Support</Tag>
            <Tag variant="live">1-on-1 Live Sessions</Tag>
            <Tag variant="navy">Enhanced DBS Checked</Tag>
          </div>
          <Eyebrow tone="navy" className="mb-2">
            Academic Excellence
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl md:text-5xl mb-4"
          >
            Dedicated 1-on-1 Private Tutoring
          </Heading>
          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Personalised weekly online tutoring in Mathematics and English
            Language & Literature, designed to boost confidence, master exam
            technique, and accelerate academic achievement.
          </p>
        </div>

        {/* 2-Column Split: Offer & Safeguarding on Left, Parent Enquiry Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Tutoring Information */}
          <div className="lg:col-span-7 space-y-8">
            {/* What is Offered */}
            <section className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle space-y-4">
              <Heading level="h2" className="text-navy-900 text-2xl">
                What We Offer
              </Heading>
              <p className="text-sm text-ink-soft leading-relaxed">
                Every child learns at a different pace. Our 1-on-1 tutoring
                pairs your child with a patient, qualified educator who tailors
                each 60-minute lesson to target areas where your child needs the
                most reinforcement.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-sm bg-paper border border-line space-y-1.5">
                  <h3 className="font-heading font-bold text-base text-navy-900">
                    Mathematics (KS3 & GCSE)
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Foundation & Higher tiers. Number work, algebra, ratio,
                    geometry, and past paper step-by-step problem solving.
                  </p>
                </div>

                <div className="p-4 rounded-sm bg-paper border border-line space-y-1.5">
                  <h3 className="font-heading font-bold text-base text-navy-900">
                    English Language & Lit
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Creative writing, reading comprehension, textual analysis,
                    poetry comparison, and structured essay writing.
                  </p>
                </div>
              </div>
            </section>

            {/* How Sessions Run */}
            <section className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle space-y-4">
              <Heading level="h2" className="text-navy-900 text-2xl">
                How Sessions Run
              </Heading>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-ink">
                  <span className="w-6 h-6 rounded-sm bg-navy-900 text-white font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-navy-900 block font-heading">
                      Diagnostic Assessment
                    </strong>
                    <span className="text-ink-soft text-xs">
                      We identify strengths and knowledge gaps before beginning
                      structured lessons.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-ink">
                  <span className="w-6 h-6 rounded-sm bg-navy-900 text-white font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-navy-900 block font-heading">
                      Weekly 60-Minute Interactive Online Lessons
                    </strong>
                    <span className="text-ink-soft text-xs">
                      Interactive virtual whiteboard with real-time feedback and
                      guided practice.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-ink">
                  <span className="w-6 h-6 rounded-sm bg-navy-900 text-white font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-navy-900 block font-heading">
                      Parental Progress Feedback
                    </strong>
                    <span className="text-ink-soft text-xs">
                      Written lesson summaries and milestone updates sent
                      directly to parents after every session.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Safeguarding Statement per PRD Section 10.6 & 16 */}
            <section className="p-6 rounded-lg bg-navy-900 text-white space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="shield-check" size={20} className="text-gold-500" />
                <Heading level="h3" className="text-white text-lg">
                  Safeguarding & Student Welfare
                </Heading>
              </div>

              <p className="text-xs text-paper/85 leading-relaxed">
                The safety of young learners is our highest priority. All
                private tutors are subject to an Enhanced Disclosure and Barring
                Service (DBS) check, identity verification, and regular
                safeguarding training.
              </p>

              <div className="pt-2 border-t border-white/20 text-xs text-white/80">
                All tutoring sessions adhere strictly to our{" "}
                <Link
                  href="/safeguarding-student-welfare"
                  className="text-gold-300 underline hover:text-white"
                >
                  Safeguarding & Student Welfare Policy
                </Link>
                .
              </div>
            </section>
          </div>

          {/* Right Column: Private Tutoring Enquiry Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <PrivateTutoringForm sourcePage="/private-tutoring" />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
