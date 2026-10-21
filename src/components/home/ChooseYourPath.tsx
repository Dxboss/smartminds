import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, IconName } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { OrangeWaveAccent } from "@/components/ui/OrangeWaveAccent";
import { resolveItemColor } from "@/components/ui/sectionBg";

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
import {
  resolveCardContainerStyles,
  resolveTypography,
  resolveSubheadlineTypography,
  type FontFamilyChoice,
  type FontSizeChoice,
  type FontWeightChoice,
  type FontStyleChoice,
  type FontColorChoice,
} from "@/components/ui/typographyUtils";

export interface ChooseYourPathProps {
  headline?: string;
  subheadline?: string;
  bgColor?: "white" | "paper" | "navy" | "cream";
  columns?: 2 | 3 | 4;
  items?: BuilderSectionItem[];
  headlineFontFamily?: FontFamilyChoice;
  headlineFontSize?: FontSizeChoice;
  headlineFontWeight?: FontWeightChoice;
  headlineFontStyle?: FontStyleChoice;
  headlineColor?: FontColorChoice;
  headlineTransform?: "normal" | "uppercase";
  headlineAlign?: "left" | "center" | "right";
  subheadlineFontFamily?: FontFamilyChoice;
  subheadlineFontSize?: FontSizeChoice;
  subheadlineFontWeight?: FontWeightChoice;
  subheadlineFontStyle?: FontStyleChoice;
  subheadlineColor?: FontColorChoice;
  subheadlineAlign?: "left" | "center" | "right";
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
  headlineFontFamily,
  headlineFontSize,
  headlineFontWeight,
  headlineFontStyle,
  headlineColor,
  headlineTransform,
  headlineAlign,
  subheadlineFontFamily,
  subheadlineFontSize,
  subheadlineFontWeight,
  subheadlineFontStyle,
  subheadlineColor,
  subheadlineAlign,
  isEditor = false,
  selectedElementKey,
  selectedElementItemIndex,
  onSelectElement,
}) => {
  const isDark = bgColor === "navy";

  const { className: hlClass, style: hlStyle } = resolveTypography({
    fontFamily: headlineFontFamily,
    fontSize: headlineFontSize,
    fontWeight: headlineFontWeight,
    fontStyle: headlineFontStyle,
    color: headlineColor,
    transform: headlineTransform,
    align: headlineAlign || "center",
    isDark,
    defaultFamily: "heading",
    defaultSize: "xl",
    defaultWeight: "bold",
  });

  const { className: subClass, style: subStyle } = resolveSubheadlineTypography({
    fontFamily: subheadlineFontFamily,
    fontSize: subheadlineFontSize,
    fontWeight: subheadlineFontWeight,
    fontStyle: subheadlineFontStyle,
    color: subheadlineColor,
    align: subheadlineAlign || "center",
    isDark,
    defaultFamily: "body",
    defaultSize: "md",
    defaultWeight: "normal",
  });

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
    <Section variant={bgColor} className="py-20 border-b border-line">
      <Container>
        {/* Centered Heading with Image 1 Orange Wave Accent */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "badge"}
            label="Badge"
            onClick={() => onSelectElement?.("badge")}
            inline
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-[#0B4D4E] border border-teal-200/70 mb-3 shadow-xs">
              Explore Sector Pathways
            </span>
          </EditableElementWrapper>

          <div className="inline-flex flex-col items-center relative w-full">
            <EditableElementWrapper
              isEditor={isEditor}
              isSelected={isEditor && selectedElementKey === "headline"}
              label="Headline"
              onClick={() => onSelectElement?.("headline")}
              className="w-full"
            >
              <Heading
                level="h2"
                style={hlStyle}
                className={hlClass}
              >
                {headline}
              </Heading>
            </EditableElementWrapper>
            <div className="flex justify-center mt-2">
              <OrangeWaveAccent width={130} height={14} className="text-[#FF5722]" />
            </div>
          </div>

          <EditableElementWrapper
            isEditor={isEditor}
            isSelected={isEditor && selectedElementKey === "subheadline"}
            label="Subheadline"
            onClick={() => onSelectElement?.("subheadline")}
            className="w-full mt-4"
          >
            <p
              style={subStyle}
              className={`max-w-xl mx-auto leading-relaxed ${subClass}`}
            >
              {subheadline ||
                "Online learning has revolutionized British qualifications, providing flexible accredited pathways across vital care and educational sectors."}
            </p>
          </EditableElementWrapper>
        </div>

        {/* Category Cards Grid */}
        <div className={`grid ${colClass} gap-6`}>
          {renderedCards.map((pathway, idx) => {
            const themes = [
              {
                iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100",
                buttonBg: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20",
                cardBorder: "hover:border-cyan-400",
                buttonText: "View Pathway",
              },
              {
                iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
                buttonBg: "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20",
                cardBorder: "hover:border-purple-400",
                buttonText: "View Pathway",
              },
              {
                iconBg: "bg-orange-50 text-[#FF5722] border border-orange-100",
                buttonBg: "bg-[#FF5722] hover:bg-[#e64a19] text-white shadow-md shadow-orange-500/20",
                cardBorder: "hover:border-orange-400",
                buttonText: "Explore Courses",
              },
              {
                iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
                buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20",
                cardBorder: "hover:border-emerald-400",
                buttonText: "View Pathway",
              },
            ];
            const theme = themes[idx % themes.length];

            const rawItem = items?.[idx];
            const resolvedCardBg = resolveItemColor(rawItem?.cardBg);
            const resolvedTitleColor = resolveItemColor(rawItem?.titleColor);
            const resolvedDescColor = resolveItemColor(rawItem?.descColor);

            return (
              <EditableElementWrapper
                key={pathway.title + idx}
                isEditor={isEditor}
                isSelected={isEditor && selectedElementKey === "item" && selectedElementItemIndex === idx}
                label={`Category #${idx + 1}`}
                onClick={() => onSelectElement?.("item", idx)}
                className="h-full"
              >
                <div
                  style={resolvedCardBg ? { backgroundColor: resolvedCardBg, borderColor: "transparent" } : undefined}
                  className={`group flex flex-col justify-between h-full p-6 sm:p-7 rounded-2xl bg-white border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl ${theme.cardBorder} transition-all duration-300 text-center`}
                >
                  <div>
                    {/* Glowing Circular Pastel Icon matching color */}
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5 shadow-xs group-hover:scale-110 transition-transform ${theme.iconBg}`}>
                      <Icon
                        name={pathway.icon}
                        size={28}
                      />
                    </div>

                    <h3
                      style={resolvedTitleColor ? { color: resolvedTitleColor } : undefined}
                      className="font-heading text-xl font-bold text-navy-900 group-hover:text-[#0B4D4E] transition-colors mb-2 min-h-[3rem] flex items-center justify-center"
                    >
                      {pathway.title}
                    </h3>

                    <p
                      style={resolvedDescColor ? { color: resolvedDescColor } : undefined}
                      className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-6 min-h-[3.75rem] line-clamp-3 flex items-center justify-center"
                    >
                      {pathway.description}
                    </p>
                  </div>

                  {/* Button matching icon color */}
                  <div className="pt-2">
                    <Link
                      href={pathway.href}
                      className={`w-full py-2.5 px-4 rounded-full ${theme.buttonBg} font-heading font-bold text-xs sm:text-sm tracking-wide inline-flex items-center justify-center gap-1.5 transition-all group-hover:scale-[1.02]`}
                    >
                      <span>{theme.buttonText}</span>
                      <Icon name="arrow-right" size={14} className="text-white" />
                    </Link>
                  </div>
                </div>
              </EditableElementWrapper>
            );
          })}
        </div>

        {/* View All Categories Pill Button (Image 1 style) */}
        <div className="text-center mt-12">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-teal-300 text-[#0B4D4E] hover:bg-teal-50 hover:border-teal-500 font-heading font-bold text-sm tracking-wide transition-all shadow-xs"
          >
            <span>View All Categories</span>
            <Icon name="arrow-right" size={15} className="ml-2 text-teal-700" />
          </Link>
        </div>
      </Container>
    </Section>
  );
};
