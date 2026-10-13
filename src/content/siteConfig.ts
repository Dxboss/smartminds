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
    "UK professional training provider delivering 100% online distance learning with certified tutors and assessors for Ofqual-regulated qualifications, CPD courses, and private tutoring.",
  contact: {
    phone: "+441452225225",
    phoneDisplay: "01452 225 225",
    email: "help@smartmindstraining.co.uk",
    whatsappNumber: "447932034548",
    whatsappDisplay: "07932 034 548",
    whatsappUrl:
      "https://wa.me/447932034548?text=Hello%20Smartminds%2C%20I%20would%20like%20course%20advice",
    address: "62 High Street, Aveley, South Ockendon, RM15 4BX",
    openingHours:
      "Mon – Thurs: 9:30 AM – 5:30 PM | Fri: Online Live Training Sessions | Sat – Sun: Closed",
  },
  booking: {
    calLink: "smartminds-training/15min",
    embedUrl: "https://cal.com/smartminds-training/15min",
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
  accreditations: [
    {
      name: "Training Qualifications UK",
      acronym: "TQUK",
      description:
        "Ofqual-regulated awarding organisation offering RQF qualifications across Health, Care, Education and IT.",
      confirmed: true,
    },
    {
      name: "NCFE",
      acronym: "NCFE",
      description:
        "Ofqual-regulated national awarding organisation recognized across UK further education and vocational sectors.",
      confirmed: true,
    },
    {
      name: "The CPD Group",
      acronym: "CPD Group",
      description:
        "Accredited continuing professional development provider for healthcare, IT, and workplace competencies.",
      confirmed: true,
    },
    {
      name: "Skills for Health",
      acronym: "Skills for Health",
      description:
        "Curriculum mapped to National Occupational Standards (CHS132 Venous Blood Sampling).",
      confirmed: true,
    },
  ],
  team: [
    {
      name: "Smartminds Academic Faculty",
      role: "Health, Care & Teacher Training Team",
      credentials:
        "Qualified sector practitioners and NHS-trained tutors delivering interactive live instruction.",
      image: "/images/tutor-teaching.jpg",
      isPlaceholder: false,
    },
    {
      name: "Vocational Assessors & IQA Leads",
      role: "Quality Assurance & Assessment Faculty",
      credentials:
        "Experienced CAVA assessors and internal quality assurers providing portfolio feedback and placement guidance.",
      image: "/images/certificate-moment.jpg",
      isPlaceholder: false,
    },
    {
      name: "Admissions & Support Team",
      role: "Learner Guidance & Funding Advisory",
      credentials:
        "Dedicated student advisors providing 1-to-1 funding checks, CV guidance, and course placement support.",
      image: "/images/hero-learner.jpg",
      isPlaceholder: false,
    },
  ],
  reviews: {
    ratingValue: "5.0 / 5.0",
    ratingCountText: "Verified Google reviews from genuine learners",
    sourceText: "Google Reviews",
    isPlaceholder: false,
  },
  testimonials: [
    {
      name: "Abisola G.",
      roleOrCourse: "NVQ Level 3 & Functional Skills",
      quote:
        "Smartminds training, I'm glad I met them. They're the best at what they do and are extremely supportive all through my learning period. I have done 3 courses with them including my NVQ Level 3, functional skills maths and English and all was completed with ease and maximum support. Thanks for being amazing always.",
      rating: 5,
      image: "/images/hero-learner.jpg",
      isPlaceholder: false,
    },
    {
      name: "Sarah White",
      roleOrCourse: "Career Pathway & Guidance",
      quote:
        "I was confused on where to start but the team supported me to identify the right pathway and start at the right level. I am now in work. Highly recommend Smartminds to anyone looking to upskill.",
      rating: 5,
      image: "/images/certificate-moment.jpg",
      isPlaceholder: false,
    },
    {
      name: "Noordin L.",
      roleOrCourse: "Level 5 Diploma in Health & Social Care",
      quote:
        "I would like to thank Smartminds for the excellent support and guidance I received while studying the Level 5 Diploma in Health and Social Care (Children and Young People). The course has been very helpful to my professional development and has supported me in gaining a promotion to a Senior role at work.",
      rating: 5,
      image: "/images/tutor-teaching.jpg",
      isPlaceholder: false,
    },
  ],
  funding: {
    eligibilityHeadline:
      "Government Funded Routes (AEB & NSF) & 0% Interest Instalments",
    eligibilityNote:
      "Access free funding routes through AEB (Adult Education Budget) and NSF (National Skills Fund), or 18-month employer apprenticeships. Alternatively, spread course costs over 12 months with 0% interest.",
    lowWageThresholdText:
      "Free funding criteria are based on location (e.g. London & Essex schemes), age, prior qualification levels, and residency/visa status.",
    complianceWarning:
      "All funding allocations are confirmed during your free consultation call with an admissions advisor.",
    isPlaceholder: false,
  },
};
