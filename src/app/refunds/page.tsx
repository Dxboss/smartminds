import { Metadata } from "next";
import { siteConfig } from "@/content/siteConfig";
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

export default function RefundsPage() {
  return (
    <main className="bg-paper min-h-screen py-10 md:py-16">
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
            Last Updated: 07 October 2026 • Version 1.0 (PLACEHOLDER)
          </p>

          <LegalDraftBanner />

          <div className="bg-white rounded-lg border border-line p-6 sm:p-10 shadow-subtle space-y-8 text-sm text-ink-soft leading-relaxed">
            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                1. 14-Day Statutory Cooling-Off Period
              </Heading>
              <p>
                In accordance with the Consumer Contracts (Information,
                Cancellation and Additional Charges) Regulations 2013, distance
                learners have the right to cancel their enrolment within 14
                calendar days from the date of initial payment without giving
                any reason.
              </p>
              <p>
                If you cancel within this 14-day cooling-off window before your
                scheduled live course intake has begun, you will receive a full
                refund of all payments made, including any initial deposit.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                2. Commenced Services & Digital Content Waiver
              </Heading>
              <p>
                If you request to begin your course immediately within the
                14-day period (for example, by attending live classes, accessing
                proprietary digital course units, or registering with an
                external awarding body), you acknowledge that your statutory
                right to cancel will be adjusted to reflect the proportionate
                cost of services already delivered.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                3. Cancellations After 14 Days
              </Heading>
              <p>
                After the 14-day cooling-off period has expired, refunds are
                generally not permitted, as cohort class seats, mentor
                allocations, and external awarding body registration costs are
                committed on your behalf.
              </p>
              <p>
                <strong>Exceptional Circumstances:</strong> If you face
                unexpected medical or personal hardship, you may request to
                pause your studies and resume with a later intake cohort at no
                additional cost, subject to approval by the College Principal.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                4. How to Request a Cancellation
              </Heading>
              <p>
                To exercise your right to cancel, you must notify our admissions
                department in writing by emailing:{" "}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-navy-900 underline font-semibold"
                >
                  {siteConfig.contact.email}
                </a>
                . Please include your full name, enrolled course title, and
                payment date. Refunds will be issued to the original payment
                method within 14 days of receiving your cancellation notice.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
