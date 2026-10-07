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
  navigation: NavItem[];
  legalLinks: NavItem[];
  accreditations: AccreditationItem[];
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
    phone: "+442080000000", // PLACEHOLDER
    phoneDisplay: "+44 (0) 20 8000 0000",
    email: "info@smartmindstraining.co.uk", // PLACEHOLDER
    whatsappNumber: "447000000000", // PLACEHOLDER
    whatsappDisplay: "+44 7000 000000",
    whatsappUrl:
      "https://wa.me/447000000000?text=Hello%20Smartminds%2C%20I%20would%20like%20free%20course%20advice",
    address: "London, United Kingdom", // PLACEHOLDER
    openingHours: "Monday to Friday: 9:00 AM – 6:00 PM GMT",
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
      description: "Ofqual-regulated awarding organisation",
      confirmed: true,
    },
    {
      name: "The CPD Group",
      acronym: "CPD Group",
      description: "Accredited continuing professional development",
      confirmed: true,
    },
    {
      name: "UK Register of Learning Providers",
      acronym: "UKRLP",
      description: "Verified UK provider reference",
      confirmed: true,
    },
  ],
};
