import { Metadata } from "next";
import {
  HeroSection,
  TrustStrip,
  ChooseYourPath,
  HowItWorksTimeline,
  PricingFlexibility,
  FeaturedCourses,
  ReviewsAndTestimonials,
  HomeFAQ,
  FinalCTABand,
} from "@/components/home";

export const metadata: Metadata = {
  title: "Smartminds Training College | Live Classes with Real Tutors",
  description:
    "Study recognised UK qualifications with live online evening classes led by expert tutors. Flexible monthly instalment plans and funded options in health, social care, and education.",
  openGraph: {
    title: "Smartminds Training College | Live Classes with Real Tutors",
    description:
      "Study recognised UK qualifications with live online evening classes led by expert tutors. Flexible monthly instalments with zero interest.",
    type: "website",
    locale: "en_GB",
  },
};

export default function HomePage() {
  return (
    <main className="bg-paper text-ink min-h-screen">
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Trust strip directly beneath hero */}
      <TrustStrip />

      {/* 3. Choose your path by outcome */}
      <ChooseYourPath />

      {/* 4. How it works (4-step timeline + recordings callout) */}
      <HowItWorksTimeline />

      {/* 5. Pricing flexibility (split layout: pay in full / instalments / funded) */}
      <PricingFlexibility />

      {/* 6. Featured courses */}
      <FeaturedCourses />

      {/* 7. Reviews and photos (click-to-load TikTok embed guarded by consent) */}
      <ReviewsAndTestimonials />

      {/* 8. FAQ (accessible accordion) */}
      <HomeFAQ />

      {/* 9. Final CTA band on navy */}
      <FinalCTABand />
    </main>
  );
}
