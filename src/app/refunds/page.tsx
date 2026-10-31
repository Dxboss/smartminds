import { Metadata } from "next";
import { siteConfig } from "@/content/siteConfig";
import { getPublishedCmsPageSections, pullLatestFromNeon } from "@/lib/persistedData";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LegalDraftBanner } from "@/components/layout/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy | Smartminds Training College",
  description:
    "Statutory cancellation rights, cooling-off periods, and refund policy for courses at Smartminds Training College.",
  alternates: {
    canonical: "/refunds",
  },
};

export const revalidate = 300;

export default async function RefundsPage() {
  pullLatestFromNeon().catch(() => {});
  const sections = getPublishedCmsPageSections("/refunds");

  if (sections && sections.length > 0) {
    return (
      <div className="bg-paper min-h-screen">
        {sections
          .filter((sec) => sec.enabled)
          .map((sec) => (
            <SectionRenderer key={sec.id} section={sec} />
          ))}
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen py-10 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow tone="navy" className="mb-2">
            Consumer Rights & Policies
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl mb-4"
          >
            Refund & Cancellation Policy
          </Heading>
          <p className="text-xs text-ink-soft mb-8 font-mono">
            Last Updated: 10 October 2026 • Version 1.0
          </p>

          <LegalDraftBanner />

          <div className="bg-white rounded-lg border border-line p-6 sm:p-10 shadow-subtle space-y-8 text-sm text-ink-soft leading-relaxed">
            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                1. 7-Day Statutory Cooling-Off Period
              </Heading>
              <p>
                Under the Consumer Contracts (Information, Cancellation and Additional
                Charges) Regulations 2013 and our college admissions framework, distance
                learners have a 7-calendar-day cooling-off period from the date of initial
                payment to cancel their enrolment, provided their live course intake and induction
                have not yet commenced.
              </p>
              <p>
                If you submit a cancellation request within this 7-day window prior to the start of
                your scheduled induction or live classes, you will receive a full refund of payments made.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                2. Non-Refundable Deposit Once Classes & Induction Commence
              </Heading>
              <p>
                Our course intakes begin quickly (typically within 7 days of initial deposit payment).
                Prior to your first live lesson, you will attend a formal induction to introduce the curriculum
                and platform tools.
              </p>
              <p className="bg-paper p-4 rounded-md border border-line text-ink font-medium">
                <strong>Important Policy Term:</strong> Once your scheduled induction or first live class
                takes place, your course deposit is strictly non-refundable. At this milestone, the college
                immediately commits registration fees to external awarding bodies (e.g. TQUK, NCFE, City & Guilds)
                to register your student candidate record, and allocates dedicated tutor teaching hours.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                3. Cancellations After Course Commencement
              </Heading>
              <p>
                After your first live class has occurred, course fees and instalment obligations remain active,
                as cohort class allocations, bespoke mentor assignments, and awarding organisation candidate registrations
                cannot be retrieved or reassigned.
              </p>
              <p>
                <strong>Exceptional Mitigating Circumstances:</strong> If you face unexpected, severe hardship
                (such as sudden certified medical incapacity), you may apply to pause your studies and resume
                with a subsequent intake cohort without penalty, subject to review by the College Principal.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                4. How to Submit a Refund or Cancellation Request
              </Heading>
              <p>
                All cancellation and refund requests must be submitted in writing directly to our finance office:{" "}
                <a
                  href="mailto:finance@smartminds.co.uk"
                  className="text-navy-900 underline font-bold"
                >
                  finance@smartminds.co.uk
                </a>
                .
              </p>
              <p>
                Please include your full legal name, enrolled course title, student reference, and date of payment.
                Eligible refunds are processed to the original payment method within 14 business days of written confirmation.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
