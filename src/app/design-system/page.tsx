import type { Metadata } from "next";
import {
  Button,
  Container,
  Section,
  Heading,
  Eyebrow,
  Tag,
  Icon,
  ArcDivider,
  ArcMask,
} from "@/components/ui";
import { BookingCTAButton } from "@/components/booking";
import { ConsentGuard } from "@/components/consent/ConsentGuard";

export const metadata: Metadata = {
  title: "Design System Showcase",
  description:
    "Internal design system documentation and component library for Smartminds Training College.",
  robots: {
    index: false,
    follow: false,
  },
};

const COLOR_TOKENS = [
  {
    name: "Navy 900",
    cssVar: "--navy-900",
    twClass: "bg-navy-900",
    textClass: "text-white",
    hex: "#23216B",
    role: "Primary: nav, headings, primary buttons, footer",
  },
  {
    name: "Navy 700",
    cssVar: "--navy-700",
    twClass: "bg-navy-700",
    textClass: "text-white",
    hex: "#34318F",
    role: "Hover / secondary navy",
  },
  {
    name: "Gold 500",
    cssVar: "--gold-500",
    twClass: "bg-gold-500",
    textClass: "text-navy-900",
    hex: "#D9B84A",
    role: "Accent: rules, star, badges, icons (not body text)",
  },
  {
    name: "Gold 300",
    cssVar: "--gold-300",
    twClass: "bg-gold-300",
    textClass: "text-navy-900",
    hex: "#F3E58A",
    role: "Gold gradient start, hover on navy",
  },
  {
    name: "Gold 700",
    cssVar: "--gold-700",
    twClass: "bg-gold-700",
    textClass: "text-white",
    hex: "#B78A2E",
    role: "Gold gradient end, dark borders",
  },
  {
    name: "Paper",
    cssVar: "--paper",
    twClass: "bg-paper border border-line",
    textClass: "text-ink",
    hex: "#FAF8F3",
    role: "Page background (warm off-white, never pure white)",
  },
  {
    name: "White",
    cssVar: "--white",
    twClass: "bg-white border border-line",
    textClass: "text-ink",
    hex: "#FFFFFF",
    role: "Cards and alternating sections",
  },
  {
    name: "Ink",
    cssVar: "--ink",
    twClass: "bg-ink",
    textClass: "text-white",
    hex: "#1B1B2B",
    role: "Primary body text",
  },
  {
    name: "Ink Soft",
    cssVar: "--ink-soft",
    twClass: "bg-ink-soft",
    textClass: "text-white",
    hex: "#5A5A6E",
    role: "Secondary text and descriptions",
  },
  {
    name: "Line",
    cssVar: "--line",
    twClass: "bg-line",
    textClass: "text-ink",
    hex: "#E6E1D5",
    role: "Dividers and subtle borders",
  },
];

const ICONS_LIST = [
  "star",
  "check",
  "arrow-right",
  "arrow-left",
  "phone",
  "mail",
  "calendar",
  "clock",
  "graduation-cap",
  "book-open",
  "shield-check",
  "whatsapp",
  "chevron-down",
  "chevron-right",
  "chevron-left",
  "menu",
  "close",
  "user",
  "info",
  "sparkles",
  "external-link",
] as const;

export default function DesignSystemPage() {
  return (
    <div className="bg-paper text-ink pb-24">
      {/* Internal Sub-Bar */}
      <div className="border-b border-line bg-white/80 backdrop-blur py-3">
        <Container>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Icon name="star" className="text-gold-500 w-4 h-4" />
              <span className="font-heading text-lg font-bold tracking-tight text-navy-900">
                Design System Preview
              </span>
              <Tag variant="navy">PRD Section 7 &amp; 8</Tag>
              <Tag variant="gold">noindex</Tag>
            </div>
            <div className="flex items-center gap-3">
              <Button href="/" variant="outline" size="sm">
                Return to Site
              </Button>
              <BookingCTAButton variant="primary" size="sm">
                Test Booking Modal
              </BookingCTAButton>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Intro */}
      <Section variant="white" className="border-b border-line">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow tone="navy" className="mb-3">
              Design Foundations
            </Eyebrow>
            <Heading level="h1" className="text-navy-900 mb-4">
              Design System & Primitives
            </Heading>
            <p className="text-lg text-ink-soft leading-relaxed">
              Every token, primitive component, and signature motif conforms
              strictly to PRD Section 7. Includes restrained gold accents, Saira
              Condensed headings, Source Sans 3 body typography, exactly two
              border radii (6px and 16px), 44px touch targets, and the signature
              crescent arc.
            </p>
          </div>
        </Container>
      </Section>

      {/* 1. Colour Tokens */}
      <Section variant="paper">
        <Container>
          <div className="mb-8">
            <Eyebrow tone="navy" className="mb-2">
              PRD 7.1
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Colour Tokens & Palettes
            </Heading>
            <p className="text-ink-soft max-w-2xl">
              Strict rules: Gold is a sparing accent. Gold text is never used on
              light backgrounds to ensure WCAG 2.2 AA contrast compliance. No
              raw hex values are written directly in components.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {COLOR_TOKENS.map((token) => (
              <div
                key={token.cssVar}
                className="bg-white rounded-lg border border-line p-4 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-full h-20 rounded-sm mb-3 flex items-center justify-center font-mono text-xs ${token.twClass} ${token.textClass}`}
                  >
                    {token.hex}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-navy-900">
                    {token.name}
                  </h3>
                  <code className="block text-xs font-mono text-ink-soft mb-2">
                    {token.cssVar}
                  </code>
                </div>
                <p className="text-xs text-ink-soft border-t border-line pt-2">
                  {token.role}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 2. Typography Hierarchy */}
      <Section variant="white" className="border-y border-line">
        <Container>
          <div className="mb-8">
            <Eyebrow tone="navy" className="mb-2">
              PRD 7.2
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Typography & Scale
            </Heading>
            <p className="text-ink-soft max-w-2xl">
              Headings use Saira Condensed (600/700) in sentence case. Body text
              uses Source Sans 3 (400/600) with 17-18px base size and 1.6 line
              height. Inter, Poppins, and Roboto are strictly forbidden.
            </p>
          </div>

          <div className="space-y-8 bg-paper p-6 sm:p-8 rounded-lg border border-line">
            <div className="border-b border-line pb-6">
              <span className="text-xs font-mono text-ink-soft block mb-1">
                Heading 1 (Saira Condensed 700 / 40px to 64px)
              </span>
              <Heading level="h1" className="text-navy-900">
                Live classes with real tutors. Qualifications that move your
                career forward.
              </Heading>
            </div>

            <div className="border-b border-line pb-6">
              <span className="text-xs font-mono text-ink-soft block mb-1">
                Heading 2 (Saira Condensed 700 / 30px to 44px)
              </span>
              <Heading level="h2" className="text-navy-900">
                Choose your path to regulated qualifications and accredited
                training
              </Heading>
            </div>

            <div className="border-b border-line pb-6">
              <span className="text-xs font-mono text-ink-soft block mb-1">
                Heading 3 (Saira Condensed 600 / 22px to 28px)
              </span>
              <Heading level="h3" className="text-navy-900">
                Level 3 Diploma in Adult Care (RQF)
              </Heading>
            </div>

            <div className="border-b border-line pb-6">
              <span className="text-xs font-mono text-ink-soft block mb-1">
                Heading 4 (Saira Condensed 600 / 18px to 22px)
              </span>
              <Heading level="h4" className="text-navy-900">
                Course overview and guided learning hours
              </Heading>
            </div>

            <div className="border-b border-line pb-6">
              <span className="text-xs font-mono text-ink-soft block mb-1">
                Body text (Source Sans 3 / 17px base, 1.6 line-height)
              </span>
              <p className="text-base text-ink max-w-3xl leading-relaxed">
                Smartminds Training College delivers interactive live classes
                led by experienced industry tutors. Unlike pre-recorded courses,
                learners receive real-time feedback, dedicated tutoring, and
                on-demand access to class recordings throughout their study.
              </p>
            </div>

            <div>
              <span className="text-xs font-mono text-ink-soft block mb-1">
                Eyebrow labels (Uppercase, 14px, tracking-wider)
              </span>
              <div className="flex flex-wrap gap-4 items-center">
                <Eyebrow tone="navy">Accredited qualification</Eyebrow>
                <Eyebrow tone="gold">Flexible monthly plans</Eyebrow>
                <Eyebrow tone="muted">Classroom recording</Eyebrow>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. Buttons & CTAs */}
      <Section variant="paper">
        <Container>
          <div className="mb-8">
            <Eyebrow tone="navy" className="mb-2">
              PRD 7.4 & 7.5
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Buttons & Action Primitives
            </Heading>
            <p className="text-ink-soft max-w-2xl">
              Every button satisfies the 44px minimum touch target requirement,
              uses a 6px border radius, and displays action-oriented verbs.
              Primary navy for light backgrounds, on-navy gold for dark
              sections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* On Light Section */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-line shadow-subtle">
              <h3 className="font-heading text-xl font-bold text-navy-900 mb-4">
                On Light Backgrounds
              </h3>
              <div className="flex flex-col gap-4 items-start">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Get free advice</Button>
                  <Button variant="primary" size="lg">
                    Book a free call
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline">View all courses</Button>
                  <Button variant="outline" size="sm">
                    Course syllabus
                  </Button>
                </div>
                <div>
                  <Button variant="text-link" href="#!">
                    Download full specification &rarr;
                  </Button>
                </div>
                <div className="pt-2">
                  <Button variant="primary" disabled>
                    Enrolment opens soon (Disabled)
                  </Button>
                </div>
              </div>
            </div>

            {/* On Navy Section */}
            <div className="bg-navy-900 text-white p-6 sm:p-8 rounded-lg shadow-subtle">
              <h3 className="font-heading text-xl font-bold text-white mb-4">
                On Navy Sections (PRD 7.1)
              </h3>
              <div className="flex flex-col gap-4 items-start">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="on-navy-gold">Get free advice</Button>
                  <Button variant="on-navy-gold" size="lg">
                    Book your free consultation
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Explore payment plans
                  </Button>
                </div>
                <div>
                  <Button
                    variant="text-link"
                    href="#!"
                    className="text-gold-300 hover:text-white decoration-gold-300"
                  >
                    Speak with an adviser &rarr;
                  </Button>
                </div>
                <div className="pt-2">
                  <Eyebrow tone="on-navy-gold">
                    Gold is an accent on navy
                  </Eyebrow>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. Tags & Badges */}
      <Section variant="white" className="border-y border-line">
        <Container>
          <div className="mb-8">
            <Eyebrow tone="navy" className="mb-2">
              Status & Metadata
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Tags & Badges
            </Heading>
            <p className="text-ink-soft max-w-2xl">
              Consistent 6px radius pills for qualification tiers, course
              delivery formats, and funding availability.
            </p>
          </div>

          <div className="bg-paper p-6 sm:p-8 rounded-lg border border-line flex flex-wrap gap-3 items-center">
            <Tag variant="live">Live online classes</Tag>
            <Tag variant="navy">Regulated qualification</Tag>
            <Tag variant="gold">Funding available</Tag>
            <Tag variant="default">Level 3 RQF</Tag>
            <Tag variant="default" dot>
              Rolling intake
            </Tag>
            <Tag variant="navy" dot>
              TQUK Accredited
            </Tag>
          </div>
        </Container>
      </Section>

      {/* 5. Consistent Line-Icon Set */}
      <Section variant="paper">
        <Container>
          <div className="mb-8">
            <Eyebrow tone="navy" className="mb-2">
              PRD 7.4 Brief
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Line Icons (Uniform 1.75 Stroke Width)
            </Heading>
            <p className="text-ink-soft max-w-2xl">
              No emojis used as icons. All icons share an exact 1.75 stroke
              width with clean geometric lines. The four-point celestial star is
              the signature element from the Smartminds logo.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ICONS_LIST.map((name) => (
              <div
                key={name}
                className="bg-white p-4 rounded-sm border border-line flex flex-col items-center justify-center text-center shadow-subtle hover:border-navy-900/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-sm bg-paper flex items-center justify-center mb-2 text-navy-900">
                  <Icon
                    name={name}
                    size={22}
                    className={name === "star" ? "text-gold-500" : ""}
                  />
                </div>
                <span className="text-xs font-mono text-ink-soft break-all">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 6. Signature Crescent Arc Elements */}
      <Section variant="white" className="border-t border-line">
        <Container>
          <div className="mb-8">
            <Eyebrow tone="navy" className="mb-2">
              PRD 7.3 Signature Motif
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Signature Crescent Arc Divider & Mask
            </Heading>
            <p className="text-ink-soft max-w-2xl">
              Derived from the Smartminds logo crescent arc. Rendered as crisp
              vector SVG components for section transitions and image masks
              without raster pixelation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* ArcMask Demo */}
            <div className="bg-paper p-6 rounded-lg border border-line">
              <h3 className="font-heading text-lg font-bold text-navy-900 mb-3">
                ArcMask Image Component
              </h3>
              <p className="text-sm text-ink-soft mb-4">
                Masks hero and course imagery with the crescent arc and subtle
                gold outline.
              </p>
              <div className="max-w-md mx-auto">
                <ArcMask accentBorder={true} curvePosition="bottom">
                  <div className="w-full h-64 bg-navy-900 flex flex-col items-center justify-center text-center p-6 text-white">
                    <Icon
                      name="star"
                      size={36}
                      className="text-gold-500 mb-2"
                    />
                    <span className="font-heading text-2xl font-bold">
                      Learner Photo Masked with Arc
                    </span>
                    <span className="text-sm text-gold-300 mt-1">
                      SVG clipPath with gold accent stroke
                    </span>
                  </div>
                </ArcMask>
              </div>
            </div>

            {/* ArcDivider Demo */}
            <div className="bg-paper p-6 rounded-lg border border-line">
              <h3 className="font-heading text-lg font-bold text-navy-900 mb-3">
                ArcDivider Section Transition
              </h3>
              <p className="text-sm text-ink-soft mb-4">
                Used to transition gracefully between Paper, White, and Navy
                sections.
              </p>
              <div className="rounded-lg overflow-hidden border border-line shadow-subtle">
                <div className="bg-white p-6">
                  <span className="font-semibold text-navy-900 text-sm">
                    White Section
                  </span>
                </div>
                <ArcDivider fillColorClass="fill-navy-900" accentLine={true} />
                <div className="bg-navy-900 p-6 text-white">
                  <span className="font-semibold text-gold-300 text-sm">
                    Navy Section
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7. Section Variants Demonstration */}
      <div className="border-t border-line">
        <Section variant="paper">
          <Container>
            <div className="flex items-center justify-between">
              <div>
                <Eyebrow tone="navy">Section Variant: Paper</Eyebrow>
                <Heading level="h3" className="text-navy-900 mt-1">
                  Warm off-white background (#FAF8F3)
                </Heading>
              </div>
              <Tag variant="default">64px mobile / 96px desktop</Tag>
            </div>
          </Container>
        </Section>

        <Section variant="white" className="border-y border-line">
          <Container>
            <div className="flex items-center justify-between">
              <div>
                <Eyebrow tone="navy">Section Variant: White</Eyebrow>
                <Heading level="h3" className="text-navy-900 mt-1">
                  Clean crisp contrast for structured cards
                </Heading>
              </div>
              <Tag variant="navy">Alternating rhythm</Tag>
            </div>
          </Container>
        </Section>

        <Section variant="navy">
          <Container>
            <div className="flex items-center justify-between">
              <div>
                <Eyebrow tone="on-navy-gold">Section Variant: Navy</Eyebrow>
                <Heading level="h3" className="text-white mt-1">
                  High-impact navy (#23216B) with gold accents
                </Heading>
              </div>
              <Button variant="on-navy-gold" size="sm">
                Get free advice
              </Button>
            </div>
          </Container>
        </Section>
      </div>

      {/* 8. Mobile 360px Viewport Preview */}
      <Section variant="paper" className="border-t border-line">
        <Container>
          <div className="mb-8">
            <Eyebrow tone="navy" className="mb-2">
              PRD 7.4 Mobile First
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              Mobile Viewport Test (360px Frame)
            </Heading>
            <p className="text-ink-soft max-w-2xl">
              All primitives verified within a strict 360px viewport simulation
              to ensure zero horizontal overflow, accessible tap targets, and
              legible typography before testing on desktop.
            </p>
          </div>

          <div className="mx-auto max-w-[360px] bg-white rounded-lg border-2 border-line shadow-subtle overflow-hidden">
            {/* Simulated Phone Header */}
            <div className="bg-navy-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-heading font-bold text-lg tracking-wide">
                SMARTMINDS
              </span>
              <Icon name="menu" size={20} />
            </div>

            {/* Simulated Mobile Content */}
            <div className="p-4 space-y-4">
              <div>
                <Eyebrow tone="navy">Regulated courses</Eyebrow>
                <Heading level="h2" className="text-navy-900 text-2xl mt-1">
                  Live classes with real tutors
                </Heading>
                <p className="text-sm text-ink-soft mt-1">
                  Pay in full and save, or spread the cost across flexible
                  monthly instalments.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Tag variant="live">Live online</Tag>
                <Tag variant="gold">Funded options</Tag>
              </div>

              <div className="pt-2">
                <Button variant="primary" fullWidth>
                  Get free advice
                </Button>
              </div>

              <div className="text-center">
                <Button variant="text-link" href="#!" className="text-sm">
                  View all courses &rarr;
                </Button>
              </div>
            </div>

            {/* Persistent Mobile Bottom Bar per PRD 8 */}
            <div className="border-t border-line bg-white p-3 flex items-center gap-2">
              <Button variant="primary" size="sm" className="flex-1">
                Get free advice
              </Button>
              <a
                href="#whatsapp"
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-sm bg-navy-900 text-white flex items-center justify-center hover:bg-navy-700 transition-colors"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" size={20} className="text-gold-500" />
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* 9. Cookie Consent & Third-Party Protection */}
      <Section variant="white" className="border-t border-line">
        <Container>
          <div className="mb-8">
            <Eyebrow tone="navy" className="mb-2">
              PRD Section 16 Compliance
            </Eyebrow>
            <Heading level="h2" className="text-navy-900 mb-2">
              ConsentGuard &amp; Script Isolation
            </Heading>
            <p className="text-ink-soft max-w-2xl">
              Strict privacy rule: No third-party tracking scripts, analytics,
              or interactive embeds load before explicit user consent. Test
              below by toggling cookie consent in the banner or footer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConsentGuard
              category="embeds"
              fallbackTitle="Interactive Video Embed Blocked"
              fallbackDescription="Video embeds from third parties are held until interactive media cookies are permitted."
            >
              <div className="p-6 rounded-lg bg-navy-900 text-white text-center">
                <Tag variant="live" className="mb-2">
                  Embeds Allowed
                </Tag>
                <p className="text-sm">
                  Video and interactive appointment embeds are active.
                </p>
              </div>
            </ConsentGuard>

            <ConsentGuard
              category="analytics"
              fallbackTitle="Analytics Tracking Inactive"
              fallbackDescription="Analytics cookies are currently blocked. No user metrics or telemetry will fire."
            >
              <div className="p-6 rounded-lg bg-paper border border-line text-center">
                <Tag variant="navy" className="mb-2">
                  Analytics Active
                </Tag>
                <p className="text-sm text-navy-900">
                  GA4 telemetry permitted by user consent.
                </p>
              </div>
            </ConsentGuard>
          </div>
        </Container>
      </Section>
    </div>
  );
}
