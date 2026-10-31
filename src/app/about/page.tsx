import { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/content/siteConfig";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { getPublishedCmsPageSections, pullLatestFromNeon } from "@/lib/persistedData";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import { WhyChooseUsSection } from "@/components/home";

export const metadata: Metadata = {
  title: "About Us | Smartminds Training College",
  description:
    "Learn about Smartminds Training College. British accredited qualifications with live online evening classes, dedicated mentor support, and flexible instalment payment options.",
  openGraph: {
    title: "About Us | Smartminds Training College",
    description:
      "British accredited qualifications with live online evening classes and dedicated tutor support.",
    type: "website",
  },
  alternates: {
    canonical: "/about",
  },
};

export const revalidate = 60;

export default async function AboutPage() {
  pullLatestFromNeon().catch(() => { });
  const customSections = getPublishedCmsPageSections("/about");
  if (customSections && customSections.length > 0) {
    return (
      <div className="bg-paper text-ink min-h-screen">
        {customSections
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
        {/* Header Block */}
        <div className="max-w-3xl mb-14">
          <Eyebrow tone="navy" className="mb-2">
            Our Purpose & Heritage
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl md:text-5xl mb-4"
          >
            About Smartminds Training College
          </Heading>
          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            We provide recognised British vocational qualifications and
            professional development through interactive live evening classes
            led by expert tutors — making career advancement accessible,
            flexible, and supportive for working adults.
          </p>
        </div>

        {/* Story & Differentiators Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          <div className="lg:col-span-7 space-y-5">
            <Tag variant="navy">Our Ethos</Tag>
            <Heading level="h2" className="text-navy-900 text-2xl sm:text-3xl">
              Real Tutors, Not Automated Slide Decks
            </Heading>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              Smartminds was founded to solve a major problem in distance
              learning: isolation. Too many learners enrol in online courses
              only to receive automated slides and no teacher interaction.
            </p>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              At Smartminds, our classes are delivered live by experienced UK
              tutors. You can ask questions, debate real workplace scenarios
              with classmates, and receive structured mentor guidance throughout
              your portfolio submission.
            </p>
            <div className="pt-2">
              <Button href="/courses" variant="primary" size="md">
                Browse our qualifications
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-line shadow-subtle bg-line">
              <Image
                src="/images/tutor-teaching.jpg"
                alt="Subject-specialist tutor teaching online vocational class"
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Why Choose Us Feature Showcase */}
        <div className="mb-16 -mx-4 sm:-mx-6 lg:-mx-8 rounded-xl overflow-hidden border border-line shadow-subtle">
          <WhyChooseUsSection />
        </div>

        {/* Accredited UK Awarding Bodies */}
        <section
          aria-labelledby="accreditation-heading"
          className="bg-white rounded-lg border border-line p-8 mb-16 shadow-subtle space-y-6"
        >
          <div className="max-w-2xl">
            <Eyebrow tone="navy" className="mb-1">
              Recognised Standards
            </Eyebrow>
            <Heading
              level="h2"
              id="accreditation-heading"
              className="text-navy-900 text-2xl"
            >
              Accredited by Leading Awarding Organisations
            </Heading>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mt-2">
              Our qualifications are recognised across the NHS, private
              healthcare providers, care homes, and education authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {siteConfig.accreditations.map((acc) => (
              <div
                key={acc.acronym}
                className="p-5 rounded-sm bg-paper border border-line space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    name="shield-check"
                    size={18}
                    className="text-navy-900"
                  />
                  <strong className="font-heading font-bold text-lg text-navy-900">
                    {acc.acronym}
                  </strong>
                </div>
                <h3 className="text-xs font-semibold text-gold-700">
                  {acc.name}
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  {acc.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Photo Slots per PRD 10.7 */}
        <section aria-labelledby="team-heading" className="mb-16 space-y-8">
          <div className="max-w-2xl">
            <Eyebrow tone="navy" className="mb-1">
              Leadership & Teaching
            </Eyebrow>
            <Heading
              level="h2"
              id="team-heading"
              className="text-navy-900 text-2xl"
            >
              Meet Our Academic Team
            </Heading>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mt-1">
              Experienced healthcare professionals, qualified teachers, and
              dedicated learner support coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {siteConfig.team.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-line p-6 shadow-subtle space-y-4"
              >
                <div className="relative aspect-square rounded-sm overflow-hidden bg-line">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <strong className="font-heading font-bold text-lg text-navy-900 block">
                    {member.name}
                  </strong>
                  <span className="text-xs font-semibold text-gold-700 block mb-1">
                    {member.role}
                  </span>
                  <p className="text-xs text-ink-soft leading-relaxed font-mono text-[11px]">
                    {member.credentials}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Legal Line Banner per PRD Section 10.7 */}
        <div className="p-6 rounded-lg bg-paper border border-line text-center text-xs text-ink-soft leading-relaxed">
          <p className="font-semibold text-navy-900 mb-1">
            Company Legal Registration
          </p>
          <p>{siteConfig.legalLine}</p>
        </div>
      </Container>
    </div>
  );
}
