import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LegalDraftBanner } from "@/components/layout/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Cookie Policy | Smartminds Training College",
  description:
    "Information about cookies used on the Smartminds website, including consent controls and privacy protection.",
  alternates: {
    canonical: "/cookies",
  },
};

export default function CookiesPage() {
  return (
    <main className="bg-paper min-h-screen py-10 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow tone="navy" className="mb-2">
            Cookies & Tracking
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl mb-4"
          >
            Cookie Policy
          </Heading>
          <p className="text-xs text-ink-soft mb-8 font-mono">
            Last Updated: 07 October 2026 • Version 1.0 (PLACEHOLDER)
          </p>

          <LegalDraftBanner />

          <div className="bg-white rounded-lg border border-line p-6 sm:p-10 shadow-subtle space-y-8 text-sm text-ink-soft leading-relaxed">
            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                1. What Are Cookies?
              </Heading>
              <p>
                Cookies are small text files placed on your device by websites
                you visit. They are widely used to make websites work
                efficiently, enhance navigation, and provide reporting
                information to website administrators.
              </p>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                2. Categories of Cookies We Use
              </Heading>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-sm bg-paper border border-line space-y-1">
                  <strong className="text-navy-900 block font-heading text-base">
                    Strictly Necessary Cookies (Always Active)
                  </strong>
                  <p className="text-xs">
                    Required for core website operations, security verification,
                    and remembering your cookie consent choices. These cannot be
                    disabled.
                  </p>
                </div>

                <div className="p-4 rounded-sm bg-paper border border-line space-y-1">
                  <strong className="text-navy-900 block font-heading text-base">
                    Analytics & Performance Cookies (Optional)
                  </strong>
                  <p className="text-xs">
                    Help us understand which qualification pages are most
                    visited and identify technical loading issues. These cookies
                    only activate after you grant explicit consent.
                  </p>
                </div>

                <div className="p-4 rounded-sm bg-paper border border-line space-y-1">
                  <strong className="text-navy-900 block font-heading text-base">
                    Marketing & External Embed Cookies (Optional)
                  </strong>
                  <p className="text-xs">
                    Used to embed external video players (e.g. TikTok, YouTube)
                    and interactive appointment schedulers (e.g. Cal.com). These
                    external scripts will not run without your explicit consent.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <Heading level="h2" className="text-navy-900 text-xl font-bold">
                3. Managing Your Preferences
              </Heading>
              <p>
                You can change your cookie preferences at any time by clicking
                the &ldquo;Cookie settings&rdquo; link situated in the footer of
                every page. You can also block cookies through your browser
                settings.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
