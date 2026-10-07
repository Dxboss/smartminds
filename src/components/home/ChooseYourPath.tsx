import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, IconName } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

interface Pathway {
  title: string;
  targetRole: string;
  description: string;
  icon: IconName;
  levelBadge: string;
  href: string;
  fundingEligible: boolean;
}

const PATHWAYS: Pathway[] = [
  {
    title: "Work in Adult Care",
    targetRole: "Care Assistant to Registered Manager",
    description:
      "Ofqual-regulated Level 2 to Level 5 diplomas preparing you for direct care, supervisory, and CQC registered management roles.",
    icon: "shield-check",
    levelBadge: "Levels 2 – 5",
    href: "/courses?category=Health+%26+Social+Care",
    fundingEligible: true,
  },
  {
    title: "Teach & Train Adults",
    targetRole: "College Lecturer or Corporate Trainer",
    description:
      "Qualify to teach in further education colleges and training organisations with the Level 3 Award in Education & Training (AET).",
    icon: "graduation-cap",
    levelBadge: "Level 3",
    href: "/courses/award-in-education-and-training-aet",
    fundingEligible: false,
  },
  {
    title: "Business & Office Administration",
    targetRole: "Administrative Officer to Office Manager",
    description:
      "Master organisational workflows, commercial communication, and executive administration with regulated Level 2 & 3 diplomas.",
    icon: "book-open",
    levelBadge: "Levels 2 – 3",
    href: "/courses/diploma-in-business-administration",
    fundingEligible: true,
  },
  {
    title: "Early Years & Nursery Practice",
    targetRole: "Early Years Educator / Nursery Practitioner",
    description:
      "Full licence-to-practise qualification enabling you to work in pre-schools, nurseries, and reception classes across the UK.",
    icon: "user",
    levelBadge: "Level 3 EYE",
    href: "/courses/diploma-early-years-educator",
    fundingEligible: true,
  },
  {
    title: "CPD for Your Current Job",
    targetRole: "Mandatory Healthcare & Compliance Refreshers",
    description:
      "Fast 1-day accredited certificates in Safeguarding, Medication Administration, and Equality & Diversity to keep your records compliant.",
    icon: "clock",
    levelBadge: "Certificates",
    href: "/cpd",
    fundingEligible: false,
  },
  {
    title: "1-on-1 Tutoring for Your Child",
    targetRole: "KS3 & GCSE Academic Grade Boost",
    description:
      "Dedicated weekly sessions in English and Mathematics delivered by verified DBS-checked educators to build confidence and exam technique.",
    icon: "star",
    levelBadge: "KS3 & GCSE",
    href: "/private-tutoring",
    fundingEligible: false,
  },
];

export const ChooseYourPath: React.FC = () => {
  return (
    <Section variant="paper">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow tone="navy" className="mb-2">
              Career Pathways
            </Eyebrow>
            <Heading level="h2" className="text-navy-900">
              Choose your path by outcome
            </Heading>
            <p className="text-ink-soft text-base sm:text-lg max-w-xl mt-2 leading-relaxed">
              Whether you are entering healthcare, advancing to leadership,
              teaching adults, or seeking focused academic tutoring for your
              child, select your goal below.
            </p>
          </div>

          <Link
            href="/courses"
            className="text-sm font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 decoration-gold-500 hover:decoration-navy-700 whitespace-nowrap min-h-[44px] inline-flex items-center"
          >
            Explore all qualifications &rarr;
          </Link>
        </div>

        {/* Varied Grid: 2 columns on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PATHWAYS.map((pathway) => (
            <Link
              key={pathway.title}
              href={pathway.href}
              className="group bg-white rounded-lg border border-line p-6 shadow-subtle hover:border-navy-900/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-sm bg-navy-900/5 group-hover:bg-navy-900 group-hover:text-white text-navy-900 flex items-center justify-center transition-colors">
                    <Icon
                      name={pathway.icon}
                      size={24}
                      className={pathway.icon === "star" ? "text-gold-500" : ""}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pathway.fundingEligible && (
                      <Tag variant="gold" className="text-xs">
                        Funded
                      </Tag>
                    )}
                    <Tag variant="default" className="text-xs">
                      {pathway.levelBadge}
                    </Tag>
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold text-navy-900 group-hover:text-navy-700 transition-colors mb-1">
                  {pathway.title}
                </h3>
                <span className="text-xs font-semibold text-gold-700 block mb-2.5">
                  {pathway.targetRole}
                </span>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {pathway.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-line flex items-center justify-between text-xs font-bold text-navy-900 group-hover:text-navy-700">
                <span>View course details</span>
                <Icon
                  name="arrow-right"
                  size={16}
                  className="transform group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
};
