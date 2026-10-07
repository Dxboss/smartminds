import { Metadata } from "next";
import { siteConfig } from "@/content/siteConfig";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LegalDraftBanner } from "@/components/layout/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Privacy Policy | Smartminds Training College",
  description:
    "Privacy Policy and UK GDPR data handling principles for Smartminds Training College (Smartminds Empire Ltd).",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="bg-paper min-h-screen py-10 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow tone="navy" className="mb-2">
            Compliance & Transparency
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl mb-4"
          >
            Privacy Policy
          </Heading>
          <p className="text-xs text-ink-soft mb-8 font-mono">
            Last Updated: 07 October 2026 • Effective Version 1.0 (PLACEHOLDER)
          </p>

          <LegalDraftBanner />

          <div className="bg-white rounded-lg border border-line p-6 sm:p-10 shadow-subtle space-y-8 text-sm text-ink-soft leading-relaxed">
            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                1. Data Controller Information
              </Heading>
              <p>
                Smartminds Training College is a trading name of{" "}
                <strong>Smartminds Empire Ltd</strong>, a private limited
                company registered in England and Wales under Company No.
                13492661. Our registered address is London, United Kingdom
                (PLACEHOLDER).
              </p>
              <p>
                We are committed to protecting the privacy and confidentiality
                of our learners, tutors, and website visitors in compliance with
                the UK General Data Protection Regulation (UK GDPR) and the Data
                Protection Act 2018.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                2. Information We Collect
              </Heading>
              <p>
                We may collect and process the following categories of personal
                data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Contact details:</strong> Name, email address, phone
                  number, and postal address.
                </li>
                <li>
                  <strong>Academic & enrolment data:</strong> Chosen
                  qualification level, prior educational attainment, employment
                  status, and learning preferences.
                </li>
                <li>
                  <strong>Class participation records:</strong> Attendance in
                  live online sessions and coursework portfolio submissions.
                </li>
                <li>
                  <strong>Technical data:</strong> IP address, device type, and
                  UTM campaign parameters captured on first visit.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                3. Lawful Basis for Processing
              </Heading>
              <p>
                We process your personal information under the following lawful
                bases:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Consent:</strong> When you submit an enquiry form or
                  opt into marketing cookies.
                </li>
                <li>
                  <strong>Contractual necessity:</strong> To deliver scheduled
                  live classes, evaluate coursework, and register you with
                  awarding bodies.
                </li>
                <li>
                  <strong>Legal obligation:</strong> To comply with UK statutory
                  awarding body reporting, safeguarding legislation, and
                  financial accounting standards.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                4. Class Recording Notice
              </Heading>
              <p>
                Live online classes are recorded for academic revision purposes
                and made available to enrolled learners in the class cohort. By
                participating in live webinars, you acknowledge that session
                audio, video, and text chat will be recorded.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                5. Your Data Rights
              </Heading>
              <p>
                Under UK GDPR, you have the right to request access to your
                personal data (Subject Access Request), rectification of
                inaccurate details, erasure where applicable, and restriction of
                processing. To exercise these rights, please contact{" "}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-navy-900 underline font-semibold"
                >
                  {siteConfig.contact.email}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
