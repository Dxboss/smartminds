"use client";

import React, { useState } from "react";
import { CourseLevel } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";

interface CourseUnitsListProps {
  selectedLevel: CourseLevel;
}

// Representative syllabus outcomes by unit code pattern for authentic British FE standards
const getUnitDetails = (code: string, title: string) => {
  if (code.includes("AC2") || title.toLowerCase().includes("communication")) {
    return {
      mandatory: true,
      glh: 24,
      outcomes: [
        "Identify barriers to effective communication in health and social care and apply adaptive techniques.",
        "Demonstrate confidential information handling complying with the Data Protection Act and Caldicott Principles.",
        "Utilise person-centred communication aids to support individuals with speech or sensory impairments.",
      ],
      evidence: "Workplace observation, reflective log, and supervisor witness testimony",
    };
  }

  if (code.includes("AC3-02") || title.toLowerCase().includes("safeguarding")) {
    return {
      mandatory: true,
      glh: 30,
      outcomes: [
        "Recognise indicators of physical, emotional, neglect, and financial abuse across vulnerable adult groups.",
        "Implement immediate safeguarding alert protocols in alignment with local authority Multi-Agency Safeguarding Hub (MASH) procedures.",
        "Uphold the Care Act 2014 principles of empowerment, protection, and proportional intervention.",
      ],
      evidence: "Case study evaluation, safeguarding scenario review, and oral assessor discussion",
    };
  }

  if (code.includes("AC3-03") || title.toLowerCase().includes("capacity")) {
    return {
      mandatory: true,
      glh: 28,
      outcomes: [
        "Apply the five statutory principles of the Mental Capacity Act (MCA) 2005 in day-to-day decision making.",
        "Assess the balance between individual autonomy and Deprivation of Liberty Safeguards (DoLS) / Liberty Protection Safeguards.",
        "Support best-interest decision meetings and document justifiable least-restrictive interventions.",
      ],
      evidence: "Reflective practice account and workplace policy critique",
    };
  }

  if (code.includes("AC5") || title.toLowerCase().includes("leadership")) {
    return {
      mandatory: true,
      glh: 45,
      outcomes: [
        "Evaluate leadership models and their impact on high-performing, compassionate adult care teams.",
        "Develop robust continuous quality improvement strategies mapped to CQC Single Assessment Framework quality statements.",
        "Implement robust governance, clinical audit trails, and whistleblowing protections within registered care services.",
      ],
      evidence: "Strategic quality audit report, governance review, and taped professional discussion",
    };
  }

  if (code.includes("AET") || title.toLowerCase().includes("education") || title.toLowerCase().includes("teaching")) {
    return {
      mandatory: true,
      glh: 30,
      outcomes: [
        "Understand the teaching role and legal responsibilities in education and training.",
        "Facilitate inclusive learning environments adapting to individual neurodiversity and learning needs.",
        "Design, deliver, and evaluate a structured 15-minute micro-teaching session with peer assessment.",
      ],
      evidence: "Micro-teaching session delivery (live online), session plan, and self-evaluation commentary",
    };
  }

  // Default British RQF unit structure
  return {
    mandatory: true,
    glh: 25,
    outcomes: [
      "Understand legislative frameworks, regulatory standards, and codes of professional conduct applicable to this unit.",
      "Demonstrate competent practical application of person-centred methods in direct care or educational practice.",
      "Critically evaluate personal professional practice and maintain continuing professional development (CPD) logs.",
    ],
    evidence: "Assessed coursework portfolio and recorded professional discussion with course assessor",
  };
};

export const CourseUnitsList: React.FC<CourseUnitsListProps> = ({
  selectedLevel,
}) => {
  const [expandedUnitCode, setExpandedUnitCode] = useState<string | null>(
    selectedLevel.units[0]?.code || null
  );

  const toggleUnit = (code: string) => {
    setExpandedUnitCode((prev) => (prev === code ? null : code));
  };

  const totalCredits = selectedLevel.units.reduce(
    (sum, u) => sum + (u.credits || 0),
    0
  );

  return (
    <section aria-labelledby="syllabus-units-heading" className="space-y-6">
      {/* Editorial Section Header */}
      <div className="border-b border-line pb-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-gold-700 font-bold block mb-1">
              Ofqual Regulated Qualification Framework (RQF)
            </span>
            <Heading
              level="h2"
              id="syllabus-units-heading"
              className="text-navy-900 text-2xl sm:text-3xl"
            >
              Unit-by-unit syllabus breakdown
            </Heading>
          </div>
          <div className="text-right flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-sm bg-navy-900 text-white font-mono text-xs font-bold">
              {totalCredits > 0 ? `${totalCredits} Total Credits` : `${selectedLevel.units.length} Modules`}
            </span>
            <span className="px-2.5 py-1 rounded-sm bg-paper text-navy-900 border border-line font-mono text-xs font-semibold">
              {selectedLevel.guided_learning_hours} GLH
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mt-3">
          To achieve your accredited {selectedLevel.level_label} qualification, you will complete the structured units below. Each unit is delivered through live evening lectures, tutor-guided learning materials, and portfolio evidence submissions.
        </p>
      </div>

      {/* Assessment Method Highlight Banner */}
      <div className="p-4 rounded-md bg-paper border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-navy-900 text-white flex items-center justify-center shrink-0">
            <Icon name="shield-check" size={16} />
          </div>
          <div>
            <strong className="text-navy-900 block font-semibold">
              100% Coursework & Portfolio Assessment — Zero Written Examinations
            </strong>
            <span className="text-ink-soft text-[11px]">
              Assessed through workplace evidence, reflective logs, and tutor discussions.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-navy-900 font-medium shrink-0">
          <Icon name="check-circle" size={14} className="text-emerald-700" />
          <span>Accredited Assessor Feedback within 5 Working Days</span>
        </div>
      </div>

      {/* Accordion Units List */}
      <div className="space-y-3">
        {selectedLevel.units.map((unit, idx) => {
          const fallbackDetails = getUnitDetails(unit.code, unit.title);
          const details = {
            mandatory: unit.mandatory !== undefined ? unit.mandatory : fallbackDetails.mandatory,
            glh: unit.guided_learning_hours || fallbackDetails.glh,
            outcomes:
              unit.outcomes && unit.outcomes.length > 0
                ? unit.outcomes
                : unit.learningOutcomes && unit.learningOutcomes.length > 0
                ? unit.learningOutcomes
                : fallbackDetails.outcomes,
            evidence: unit.evidence || fallbackDetails.evidence,
          };
          const isExpanded = expandedUnitCode === unit.code;

          return (
            <div
              key={unit.code + idx}
              className={`rounded-md border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? "bg-white border-navy-900 shadow-sm"
                  : "bg-white border-line hover:border-navy-700/40"
              }`}
            >
              {/* Unit Header Row / Trigger */}
              <button
                type="button"
                onClick={() => toggleUnit(unit.code)}
                aria-expanded={isExpanded}
                className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <span className="px-2.5 py-1 rounded-sm bg-paper text-navy-900 font-mono text-xs font-bold border border-line shrink-0">
                    {unit.code}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Mandatory Unit
                      </span>
                      <span className="text-[11px] text-ink-soft font-mono">
                        ~{details.glh} Guided Learning Hours
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-navy-900 truncate">
                      {unit.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {unit.credits && (
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-sm bg-paper text-navy-900 font-mono text-xs font-bold border border-line">
                      {unit.credits} Credits
                    </span>
                  )}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-navy-900 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 bg-paper" : "bg-paper/60"
                    }`}
                  >
                    <Icon name="chevron-down" size={14} />
                  </div>
                </div>
              </button>

              {/* Expanded Syllabus Breakdown */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t border-line/60 bg-paper/30 space-y-4 animate-in fade-in duration-150 text-xs">
                  <div>
                    <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                      <Icon name="check" size={13} className="text-navy-900" />
                      Key Learning Outcomes & Syllabus Criteria:
                    </h4>
                    <ul className="space-y-1.5 pl-1">
                      {details.outcomes.map((outcome, oIdx) => (
                        <li key={oIdx} className="flex items-start gap-2 text-ink">
                          <span className="text-gold-700 font-bold shrink-0 mt-0.5">
                            •
                          </span>
                          <span className="leading-relaxed">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-line/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 rounded-sm bg-white border border-line">
                      <span className="font-bold text-navy-900 block mb-0.5">
                        Assessment Evidence Required:
                      </span>
                      <span className="text-ink-soft">{details.evidence}</span>
                    </div>

                    <div className="p-2.5 rounded-sm bg-white border border-line">
                      <span className="font-bold text-navy-900 block mb-0.5">
                        Tutor Support & Delivery:
                      </span>
                      <span className="text-ink-soft">
                        Live online evening lectures, digital slide library, and 1-to-1 assessor tutorials.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
