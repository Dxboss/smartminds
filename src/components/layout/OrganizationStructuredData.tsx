import React from "react";
import { siteConfig } from "@/content/siteConfig";

export const OrganizationStructuredData: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://smartmindstraining.co.uk/#organization",
    name: siteConfig.name,
    legalName: siteConfig.tradingName,
    url: "https://smartmindstraining.co.uk",
    logo: {
      "@type": "ImageObject",
      url: "https://smartmindstraining.co.uk/images/logo-color.png",
      width: 512,
      height: 192,
      caption: `${siteConfig.name} Official Logo`,
    },
    image: "https://smartmindstraining.co.uk/images/logo-color.png",
    description: siteConfig.description,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kemp House, 152 - 160 City Road",
      addressLocality: "London",
      postalCode: "EC1V 2NX",
      addressCountry: "GB",
    },
    sameAs: [
      siteConfig.contact.whatsappUrl,
      "https://smartmindstraining.co.uk",
    ],
    knowsAbout: [
      "Health and Social Care Qualifications (RQF)",
      "Level 5 Diploma in Leadership and Management for Adult Care",
      "Level 3 Diploma in Adult Care",
      "Level 3 Diploma for the Early Years Educator",
      "Level 3 Award in Education and Training (AET)",
      "Level 3 Certificate in Assessing Vocational Achievement (CAVA)",
      "Functional Skills English and Maths Level 2",
      "TQUK & NCFE CACHE Regulated Qualifications",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
