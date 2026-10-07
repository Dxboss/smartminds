import React from "react";
import { CourseLevel } from "@/content/types";
import { Heading } from "@/components/ui/Heading";

interface CourseUnitsListProps {
  selectedLevel: CourseLevel;
}

export const CourseUnitsList: React.FC<CourseUnitsListProps> = ({
  selectedLevel,
}) => {
  return (
    <section aria-labelledby="units-heading" className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <Heading
          level="h2"
          id="units-heading"
          className="text-navy-900 text-2xl"
        >
          Qualification Units ({selectedLevel.level_label})
        </Heading>
        <span className="text-xs font-mono text-ink-soft">
          {selectedLevel.units.length} Core & Optional Units
        </span>
      </div>

      <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
        To achieve the {selectedLevel.level_label} qualification, you will
        complete the following accredited units under the guidance of your
        course tutor.
      </p>

      <div className="space-y-3">
        {selectedLevel.units.map((unit, idx) => (
          <div
            key={unit.code + idx}
            className="p-4 rounded-lg bg-white border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle hover:border-navy-900/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 rounded-sm bg-paper text-navy-900 font-mono text-xs font-bold flex-shrink-0 border border-line">
                {unit.code}
              </span>
              <div>
                <h4 className="font-heading font-bold text-base text-navy-900 leading-snug">
                  {unit.title}
                </h4>
                <span className="text-[11px] text-ink-soft">
                  Assessed via coursework portfolio
                </span>
              </div>
            </div>

            <div className="sm:text-right flex-shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-sm bg-navy-900/5 text-navy-900 font-mono text-xs font-bold">
                {unit.credits} Credits
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
