export interface NavItem {
  label: string;
  href: string;
}

export interface AccreditationItem {
  name: string;
  acronym: string;
  description: string;
  confirmed: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  credentials: string;
  image: string;
  isPlaceholder: boolean;
}

export interface ReviewSummary {
  ratingValue: string;
  ratingCountText: string;
  sourceText: string;
  isPlaceholder: boolean;
}

export interface TestimonialItem {
  name: string;
  roleOrCourse: string;
  quote: string;
  rating: number;
  image?: string;
  isPlaceholder: boolean;
}

export interface FundingConfig {
  eligibilityHeadline: string;
  eligibilityNote: string;
  lowWageThresholdText: string;
  complianceWarning: string;
  isPlaceholder: boolean;
}

export interface SiteConfig {
  name: string;
  tradingName: string;
  companyNumber: string;
  legalLine: string;
  description: string;
  contact: {
    phone: string;
    phoneDisplay: string;
    email: string;
    whatsappNumber: string;
    whatsappDisplay: string;
    whatsappUrl: string;
    address: string;
    openingHours: string;
  };
  booking: {
    calLink: string;
    embedUrl: string;
    durationMinutes: number;
  };
  navigation: NavItem[];
  legalLinks: NavItem[];
  accreditations: AccreditationItem[];
  team: TeamMember[];
  reviews: ReviewSummary;
  testimonials: TestimonialItem[];
  funding: FundingConfig;
}

export const siteConfig: SiteConfig = {
  name: "Smartminds Training College",
  tradingName: "Smartminds Empire Ltd",
  companyNumber: "13492661",
  legalLine:
    "Smartminds Training College is a trading name of Smartminds Empire Ltd, Company No. 13492661",
  description:
    "UK college delivering live online classes with real tutors for regulated qualifications, CPD courses, and private tutoring.",
  contact: {
    phone: "+442080000000",
    phoneDisplay: "[PLACEHOLDER] +44 (0) 20 8000 0000",
    email: "info@smartmindstraining.co.uk [PLACEHOLDER]",
    whatsappNumber: "447000000000",
    whatsappDisplay: "[PLACEHOLDER] +44 7000 000000",
    whatsappUrl:
      "https://wa.me/447000000000?text=Hello%20Smartminds%2C%20I%20would%20like%20free%20course%20advice",
    address: "[PLACEHOLDER] London, United Kingdom",
    openingHours: "Monday to Friday: 9:00 AM – 6:00 PM GMT",
  },
  booking: {
    calLink: "smartminds-training/15min", // PLACEHOLDER
    embedUrl: "https://cal.com/smartminds-training/15min", // PLACEHOLDER
    durationMinutes: 15,
  },
  navigation: [
    { label: "Courses", href: "/courses" },
    { label: "CPD", href: "/cpd" },
    { label: "Private Tutoring", href: "/private-tutoring" },
    { label: "Funding", href: "/funding" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Refund Policy", href: "/refunds" },
  ],
  // PRD Item 5: Accreditation descriptions visibly marked as PLACEHOLDER
  accreditations: [
    {
      name: "Training Qualifications UK",
      acronym: "TQUK",
      description:
        "[PLACEHOLDER: Description to be confirmed by awarding body agreement; Ofqual-regulated awarding organisation]",
      confirmed: true,
    },
    {
      name: "The CPD Group",
      acronym: "CPD Group",
      description:
        "[PLACEHOLDER: Pending provider accreditation documentation; accredited professional development]",
      confirmed: true,
    },
    {
      name: "UK Register of Learning Providers",
      acronym: "UKRLP",
      description:
        "[PLACEHOLDER: Provider reference number pending verification on official register]",
      confirmed: true,
    },
  ],
  // PRD Item 5: Team members and credentials visibly marked as PLACEHOLDER (no invented claims)
  team: [
    {
      name: "[PLACEHOLDER] Lead Academic Tutor",
      role: "[PLACEHOLDER] Health & Social Care Faculty",
      credentials:
        "[PLACEHOLDER: Real tutor biography and verified qualifications to be supplied by college]",
      image: "/images/tutor-teaching.jpg",
      isPlaceholder: true,
    },
    {
      name: "[PLACEHOLDER] Head of Teacher Training",
      role: "[PLACEHOLDER] Education & AET Faculty",
      credentials:
        "[PLACEHOLDER: Real tutor biography and verified qualifications to be supplied by college]",
      image: "/images/hero-learner.jpg",
      isPlaceholder: true,
    },
    {
      name: "[PLACEHOLDER] Student Admissions Lead",
      role: "[PLACEHOLDER] Admissions & Enrolment Support",
      credentials:
        "[PLACEHOLDER: Real staff profile and contact details to be supplied by college]",
      image: "/images/certificate-moment.jpg",
      isPlaceholder: true,
    },
  ],
  // PRD Item 5: Review ratings visibly marked as PLACEHOLDER (no invented statistics)
  reviews: {
    ratingValue: "[PLACEHOLDER] 4.9 / 5.0",
    ratingCountText: "[PLACEHOLDER] Rated by learners (count to be confirmed)",
    sourceText: "[PLACEHOLDER] Google Reviews (Pending verification)",
    isPlaceholder: true,
  },
  // PRD Item 5: Review quotes visibly marked as PLACEHOLDER (no invented reviews)
  testimonials: [
    {
      name: "[PLACEHOLDER] Abigail M.",
      roleOrCourse: "Level 3 Diploma in Adult Care (PLACEHOLDER)",
      quote:
        "[PLACEHOLDER: Sample testimonial quote — real student review to be supplied by college upon launch.]",
      rating: 5,
      image: "/images/hero-learner.jpg",
      isPlaceholder: true,
    },
    {
      name: "[PLACEHOLDER] David K.",
      roleOrCourse: "Level 3 Award in Education & Training (PLACEHOLDER)",
      quote:
        "[PLACEHOLDER: Sample testimonial quote — real student review to be supplied by college upon launch.]",
      rating: 5,
      image: "/images/tutor-teaching.jpg",
      isPlaceholder: true,
    },
    {
      name: "[PLACEHOLDER] Grace O.",
      roleOrCourse: "Level 3 Early Years Educator (PLACEHOLDER)",
      quote:
        "[PLACEHOLDER: Sample testimonial quote — real student review to be supplied by college upon launch.]",
      rating: 5,
      image: "/images/certificate-moment.jpg",
      isPlaceholder: true,
    },
  ],
  // PRD Item 5: Funding eligibility wording visibly marked as PLACEHOLDER
  funding: {
    eligibilityHeadline:
      "[PLACEHOLDER: Funding eligibility criteria to be confirmed by college]",
    eligibilityNote:
      "[PLACEHOLDER: Funding is subject to residency, age (19+), prior qualification levels, and verified local authority budget allocations.]",
    lowWageThresholdText:
      "[PLACEHOLDER: £25,000 low-wage threshold pending verification with awarding body]",
    complianceWarning:
      "Important Compliance Note (PLACEHOLDER): Funding spaces are allocated on a regional basis and depend on verified local authority budgets.",
    isPlaceholder: true,
  },
};
