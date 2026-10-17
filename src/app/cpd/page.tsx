import { Metadata } from "next";
import Link from "next/link";
import { formatCurrency } from "@/content";
import { getLiveCourses } from "@/lib/persistedData";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { BookingCTAButton } from "@/components/booking/BookingCTAButton";

export const metadata: Metadata = {
  title:
    "Accredited CPD Courses & Mandatory Training | Smartminds Training College",
  description:
    "Fast, accredited CPD courses for healthcare, social care, and education professionals. Safeguarding, Medication Administration, and Equality training with same-week certification.",
  openGraph: {
    title: "Accredited CPD Courses | Smartminds Training College",
    description:
      "Accredited continuing professional development courses with fast UK certification.",
    type: "website",
  },
  alternates: {
    canonical: "/cpd",
  },
};

export default function CPDPage() {
  const allCourses = getLiveCourses();
  const cpdCourses = allCourses.filter((c) => c.type === "cpd" && c.published);

  return (
    <main className="bg-paper min-h-screen py-10 md:py-16">
      <Container>
        {/* Header Block */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Tag variant="gold">Accredited by The CPD Group</Tag>
            <Tag variant="live">Fast Certification</Tag>
          </div>
          <Eyebrow tone="navy" className="mb-2">
            Professional Development
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl md:text-5xl mb-4"
          >
            Continuing Professional Development (CPD)
          </Heading>
          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Essential mandatory compliance refresher and skills certificates for
            healthcare assistants, support workers, nurses, and nursery
            practitioners.
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg bg-white border border-line shadow-subtle space-y-2">
            <div className="w-10 h-10 rounded-sm bg-navy-900/10 text-navy-900 flex items-center justify-center">
              <Icon name="clock" size={20} />
            </div>
            <strong className="font-heading font-bold text-lg text-navy-900 block">
              1-Day Study Options
            </strong>
            <p className="text-xs text-ink-soft leading-relaxed">
              Designed to fit easily around work rotas with evening or intensive
              weekend webinar sessions.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white border border-line shadow-subtle space-y-2">
            <div className="w-10 h-10 rounded-sm bg-navy-900/10 text-navy-900 flex items-center justify-center">
              <Icon name="shield-check" size={20} />
            </div>
            <strong className="font-heading font-bold text-lg text-navy-900 block">
              CQC & Care Compliant
            </strong>
            <p className="text-xs text-ink-soft leading-relaxed">
              Mapped against the Care Certificate standards and regulatory
              inspection expectations.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white border border-line shadow-subtle space-y-2">
            <div className="w-10 h-10 rounded-sm bg-navy-900/10 text-navy-900 flex items-center justify-center">
              <Icon name="star" size={20} className="text-gold-500" />
            </div>
            <strong className="font-heading font-bold text-lg text-navy-900 block">
              Immediate Digital Diploma
            </strong>
            <p className="text-xs text-ink-soft leading-relaxed">
              Download your verified certificate of completion immediately upon
              tutor sign-off.
            </p>
          </div>
        </div>

        {/* CPD Courses Grid */}
        <div className="space-y-6 mb-16">
          <Heading level="h2" className="text-navy-900 text-2xl">
            Available CPD Programmes
          </Heading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cpdCourses.map((course) => {
              const level = course.levels[0];
              return (
                <article
                  key={course.id}
                  className="bg-white rounded-lg border border-line p-6 shadow-subtle flex flex-col justify-between hover:border-navy-900/30 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase text-gold-700 tracking-wider">
                        {course.category}
                      </span>
                      <Tag variant="default" className="text-xs">
                        {level?.level_label || "CPD"}
                      </Tag>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-navy-900">
                      <Link href={`/courses/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-3">
                      {course.summary}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-line flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase text-ink-soft font-mono block">
                        Fee
                      </span>
                      <strong className="font-heading font-bold text-xl text-navy-900">
                        {formatCurrency(level?.price_gbp || 95)}
                      </strong>
                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-navy-900 text-white hover:bg-navy-700 font-heading font-bold text-xs transition-colors"
                    >
                      <span>Enrol & details</span>
                      <Icon name="arrow-right" size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Corporate / Group Bookings CTA */}
        <div className="bg-navy-900 text-white rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              Group Bookings for Care Homes & Schools
            </h3>
            <p className="text-xs sm:text-sm text-paper/85 max-w-xl leading-relaxed">
              Do you have a team of staff who need mandatory refresher training?
              We offer custom in-house cohort deliveries with dedicated tutors
              and multi-seat billing.
            </p>
          </div>

          <div className="flex-shrink-0">
            <BookingCTAButton variant="on-navy-gold" size="md">
              Enquire about team training
            </BookingCTAButton>
          </div>
        </div>
      </Container>
    </main>
  );
}
