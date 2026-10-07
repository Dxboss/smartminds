import {
  Container,
  Section,
  Heading,
  Button,
  Tag,
  Icon,
} from "@/components/ui";
import { BookingCTAButton } from "@/components/booking";

export default function Home() {
  return (
    <div className="bg-paper text-ink">
      <Section variant="paper">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Icon name="star" className="text-gold-500 w-6 h-6" />
              <Tag variant="navy">Smartminds Training College</Tag>
              <Tag variant="gold">Phase 1a Preview</Tag>
            </div>

            <Heading level="h1" className="text-navy-900 mb-4">
              Live classes with real tutors.
            </Heading>

            <p className="text-lg text-ink-soft mb-8 leading-relaxed">
              Qualifications that move your career forward. Pay in full and
              save, or spread the cost at no extra charge with flexible monthly
              instalments.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <BookingCTAButton variant="primary" size="lg">
                Get free advice
              </BookingCTAButton>
              <Button href="/design-system" variant="outline" size="lg">
                View Design System Showcase &rarr;
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
