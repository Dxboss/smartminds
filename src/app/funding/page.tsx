import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { FundedEligibilityForm } from "@/components/forms/FundedEligibilityForm";

export const metadata: Metadata = {
  title:
    "Government Funded Qualifications (AEB & NSF) | Smartminds Training College",
  description:
    "Check your eligibility for UK government-funded adult qualifications. Fully funded training in health, adult social care, and education through AEB and Free Courses for Jobs.",
  openGraph: {
    title: "Government Funded Qualifications | Smartminds Training College",
    description:
      "Check your eligibility for UK government-funded adult qualifications. Zero tuition fees for qualifying learners.",
    type: "website",
  },
  alternates: {
    canonical: "/funding",
  },
};

export default function FundingPage() {
  return (
    <main className="bg-paper min-h-screen py-10 md:py-16">
      <Container>
        {/* Header Block */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Tag variant="gold">Government Funded Routes</Tag>
            <Tag variant="navy">Adult Skills Funding</Tag>
          </div>
          <Eyebrow tone="navy" className="mb-2">
            Funding & Grants
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl md:text-5xl mb-4"
          >
            Government-Funded Qualifications
          </Heading>
          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Eligible adult learners living in England can access fully funded
            accredited training through government-backed initiatives, including
            the Adult Education Budget (AEB) and the Free Courses for Jobs
            scheme.
          </p>
        </div>

        {/* 2-Column Split: Explanation & Criteria on Left, Enquiry Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Plain-language funding explanation */}
          <div className="lg:col-span-7 space-y-8">
            {/* How Government Funding Works */}
            <section className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle space-y-4">
              <Heading level="h2" className="text-navy-900 text-2xl">
                How does funding work?
              </Heading>
              <p className="text-sm text-ink-soft leading-relaxed">
                UK government funding is designed to upskill adults in vital
                sectors including adult social care, education, and early years
                nurseries. If you meet residency and eligibility thresholds, the
                government covers 100% of your course fees — you pay zero
                tuition.
              </p>
              <div className="p-4 rounded-sm bg-paper border border-line space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-navy-900 font-bold block">
                  Important Compliance Note (PLACEHOLDER)
                </span>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Funding spaces are allocated on a regional basis and depend on
                  verified local authority budgets. All submissions undergo
                  initial administrative pre-screening before official funding
                  registration.
                </p>
              </div>
            </section>

            {/* Core Funded Initiatives */}
            <section className="space-y-4">
              <Heading level="h2" className="text-navy-900 text-2xl">
                Funded Programmes Available
              </Heading>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-lg bg-white border border-line space-y-2 shadow-subtle">
                  <div className="w-8 h-8 rounded-sm bg-navy-900/10 text-navy-900 flex items-center justify-center font-bold font-mono text-xs">
                    AEB
                  </div>
                  <h3 className="font-heading font-bold text-lg text-navy-900">
                    Adult Education Budget
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Aimed at adults aged 19+ who are unemployed or earning below
                    the low-wage threshold. Covers Level 2 diplomas and select
                    Level 3 pathways.
                  </p>
                </div>

                <div className="p-5 rounded-lg bg-white border border-line space-y-2 shadow-subtle">
                  <div className="w-8 h-8 rounded-sm bg-gold-500/20 text-navy-900 flex items-center justify-center font-bold font-mono text-xs">
                    FCFJ
                  </div>
                  <h3 className="font-heading font-bold text-lg text-navy-900">
                    Free Courses for Jobs
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Also known as the National Skills Fund. Enables eligible
                    adults who do not already hold a full Level 3 qualification
                    to gain one for free.
                  </p>
                </div>
              </div>
            </section>

            {/* Typical Eligibility Checklist */}
            <section className="bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle space-y-4">
              <Heading level="h2" className="text-navy-900 text-2xl">
                General Eligibility Checklist
              </Heading>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                While final verification is completed by our admissions
                officers, you are likely to be eligible if:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-ink">
                  <Icon
                    name="check"
                    size={16}
                    className="text-navy-900 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    You are aged 19 or older on 31 August of the current
                    academic year.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-ink">
                  <Icon
                    name="check"
                    size={16}
                    className="text-navy-900 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    You are a UK/EEA citizen or have lived legally in the UK for
                    the past 3 years.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-ink">
                  <Icon
                    name="check"
                    size={16}
                    className="text-navy-900 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    You are unemployed and in receipt of low-income benefits, OR
                    earning below the annual low-wage threshold.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-ink">
                  <Icon
                    name="check"
                    size={16}
                    className="text-navy-900 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    You live in an eligible local authority catchment area.
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Embedded Funded Eligibility Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <FundedEligibilityForm sourcePage="/funding" />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
