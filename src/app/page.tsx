import {
  Container,
  Section,
  Heading,
  Button,
  Tag,
  Icon,
} from "@/components/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col justify-center">
      <Section variant="paper">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Icon name="star" className="text-gold-500 w-6 h-6" />
              <Tag variant="navy">Smartminds Training College</Tag>
              <Tag variant="gold">Phase 1a Preview</Tag>
            </div>

            <Heading level="h1" className="text-navy-900 mb-4">
              Live classes with real tutors.
            </Heading>

            <p className="text-lg text-ink-soft mb-8 leading-relaxed">
              Welcome to the Smartminds Training College website build. The
              design system, tokens, and UI primitives have been scaffolded per
              PRD Section 7.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/design-system" variant="primary" size="lg">
                View Design System Showcase &rarr;
              </Button>
              <Button href="/design-system" variant="outline" size="lg">
                Explore Primitives
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
