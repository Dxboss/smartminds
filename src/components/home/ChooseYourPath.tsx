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

import { BuilderSectionItem } from "@/lib/repositories/seedData";
import { EditableElementWrapper } from "@/components/admin/EditableElementWrapper";

export interface ChooseYourPathProps {
  headline?: string;
  subheadline?: string;
  bgColor?: "white" | "paper" | "navy" | "cream";
  columns?: 2 | 3 | 4;
  items?: BuilderSectionItem[];
  isEditor?: boolean;
  selectedElementKey?: string | null;
  selectedElementItemIndex?: number | null;
  onSelectElement?: (
    elementKey:
      | "headline"
      | "subheadline"
      | "badge"
      | "button"
      | "secondaryButton"
      | "image"
      | "item"
      | "bg"
      | "video",
    itemIndex?: number
  ) => void;
}

export const ChooseYourPath: React.FC<ChooseYourPathProps> = ({
  headline = "Choose your path by outcome",
  subheadline = "Whether you are entering healthcare, advancing to leadership, teaching adults, or seeking focused academic tutoring for your child, select your goal below.",
  bgColor = "paper",
  columns = 3,
  items,
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const isDark = bgColor === "navy";

  const colClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  // Use dynamic editable items if configured; fallback to default pathways
  const renderedCards =
    items && items.length > 0
      ? items.map((it) => ({
          title: it.title,
          targetRole: it.subtitle || it.tag || "",
          description: it.desc || "",
          icon: (it.icon as IconName) || "shield-check",
          levelBadge: it.badge || it.tag || "Regulated",
          href: it.link || "/courses",
          fundingEligible: Boolean(it.tag?.toLowerCase().includes("fund") || it.badge?.toLowerCase().includes("fund")),
        }))
      : PATHWAYS;

  return (
    <Section variant={bgColor}>
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow tone={isDark ? "gold" : "navy"} className="mb-2">
              Career Pathways
            </Eyebrow>
            <Heading level="h2" className={isDark ? "text-white" : "text-navy-900"}>
              {headline}
            </Heading>
            <p className={`text-base sm:text-lg max-w-xl mt-2 leading-relaxed ${isDark ? "text-paper/85" : "text-ink-soft"}`}>
              {subheadline}
            </p>
          </div>

          <Link
            href="/courses"
            className={`text-sm font-semibold underline underline-offset-4 decoration-gold-500 whitespace-nowrap min-h-[44px] inline-flex items-center ${
              isDark ? "text-gold-300 hover:text-white" : "text-navy-900 hover:text-navy-700"
            }`}
          >
            Explore all qualifications &rarr;
          </Link>
        </div>

        {/* Dynamic Grid by configured columns */}
        <div className={`grid ${colClass} gap-6`}>
          {renderedCards.map((pathway, idx) => (
            <EditableElementWrapper
              key={pathway.title + idx}
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx}
              label={`Pathway #${idx + 1}`}
              onClick={() => onSelectElement?.("item", idx)}
              className="h-full rounded-lg"
            >
              <Link
                href={pathway.href}
                onClick={(e) => {
                  if (isEditor) {
                    e.preventDefault();
                  }
                }}
                className={`group rounded-lg border p-6 transition-all flex flex-col justify-between h-full ${
                  isDark
                    ? "bg-white/5 border-white/10 hover:border-gold-500/50 text-white"
                    : "bg-white border-line shadow-subtle hover:border-navy-900/40 hover:-translate-y-0.5 text-ink"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-sm flex items-center justify-center transition-colors ${
                        isDark
                          ? "bg-gold-500/10 text-gold-300 group-hover:bg-gold-500 group-hover:text-navy-900"
                          : "bg-navy-900/5 text-navy-900 group-hover:bg-navy-900 group-hover:text-white"
                      }`}
                    >
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
                      {pathway.levelBadge && (
                        <Tag variant={isDark ? "gold" : "default"} className="text-xs">
                          {pathway.levelBadge}
                        </Tag>
                      )}
                    </div>
                  </div>

                  <h3
                    className={`font-heading text-xl font-bold mb-1 transition-colors ${
                      isDark
                        ? "text-white group-hover:text-gold-300"
                        : "text-navy-900 group-hover:text-navy-700"
                    }`}
                  >
                    {pathway.title}
                  </h3>
                  {pathway.targetRole && (
                    <span
                      className={`text-xs font-semibold block mb-2.5 ${
                        isDark ? "text-gold-300" : "text-navy-700"
                      }`}
                    >
                      {pathway.targetRole}
                    </span>
                  )}
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? "text-paper/80" : "text-ink-soft"
                    }`}
                  >
                    {pathway.description}
                  </p>
                </div>

                <div
                  className={`pt-6 mt-4 border-t flex items-center justify-between text-xs font-bold ${
                    isDark
                      ? "border-white/10 text-gold-300 group-hover:text-white"
                      : "border-line text-navy-900 group-hover:text-navy-700"
                  }`}
                >
                  <span>View course details</span>
                  <Icon
                    name="arrow-right"
                    size={16}
                    className="transform group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            </EditableElementWrapper>
          ))}
        </div>
      </Container>
    </Section>
  );
};
