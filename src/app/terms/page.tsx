import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LegalDraftBanner } from "@/components/layout/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Terms and Conditions | Smartminds Training College",
  description:
    "Terms and Conditions of enrolment, live class attendance, and qualification delivery for Smartminds Training College.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="bg-paper min-h-screen py-10 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow tone="navy" className="mb-2">
            Contractual Agreement
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl mb-4"
          >
            Terms and Conditions
          </Heading>
          <p className="text-xs text-ink-soft mb-8 font-mono">
            Last Updated: 07 October 2026 • Version 1.0 (PLACEHOLDER)
          </p>

          <LegalDraftBanner />

          <div className="bg-white rounded-lg border border-line p-6 sm:p-10 shadow-subtle space-y-8 text-sm text-ink-soft leading-relaxed">
            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                1. Enrolment & Agreement
              </Heading>
              <p>
                These Terms and Conditions govern your relationship with
                Smartminds Training College (&ldquo;the College&rdquo;), a
                trading name of Smartminds Empire Ltd (Company No. 13492661). By
                registering for an advice call, course enrolment, or tuition
                plan, you agree to these terms.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                2. Live Online Teaching & Attendance
              </Heading>
              <p>
                Courses are delivered through scheduled live interactive online
                evening webinars. Learners are expected to attend scheduled
                sessions. Where a learner cannot attend, recorded sessions are
                made available through the student portal for personal study
                only.
              </p>
              <p>
                <strong>Stream-Only Recordings:</strong> Lesson recordings are
                stream-only. Downloading, screen capturing, re-uploading, or
                sharing class recordings with third parties is strictly
                prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                3. Fees & Instalment Payment Plans
              </Heading>
              <p>
                Course fees are payable in full with an upfront discount or in
                agreed monthly instalments at no extra charge. Instalment plans
                are direct payment schedules with the College; they are not
                consumer credit agreements.
              </p>
              <p>
                Failure to maintain monthly payments following the automatic
                grace period may result in temporary suspension of student
                portal access until the account balance is restored.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                4. Awarding Body Certification
              </Heading>
              <p>
                Final qualification certification is subject to successful
                assessment and moderation by external awarding organisations
                (such as TQUK or The CPD Group). The College does not guarantee
                employment or promotion, which remain dependent upon individual
                merit and employer requirements.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                5. Governing Law
              </Heading>
              <p>
                These terms are governed by and construed in accordance with the
                laws of England and Wales. Any disputes shall be subject to the
                exclusive jurisdiction of the English courts.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
