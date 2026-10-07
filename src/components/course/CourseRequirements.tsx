import React from "react";
import { CourseLevel } from "@/content/types";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";

interface CourseRequirementsProps {
  selectedLevel: CourseLevel;
}

export const CourseRequirements: React.FC<CourseRequirementsProps> = ({
  selectedLevel,
}) => {
  return (
    <section aria-labelledby="requirements-heading" className="space-y-4">
      <Heading
        level="h2"
        id="requirements-heading"
        className="text-navy-900 text-2xl"
      >
        Entry Requirements ({selectedLevel.level_label})
      </Heading>

      <div className="bg-paper rounded-lg border border-line p-6 space-y-3">
        {selectedLevel.entry_requirements.map((req, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm text-ink">
            <span className="w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="check" size={12} className="text-gold-500" />
            </span>
            <span className="leading-relaxed">{req}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-soft leading-relaxed italic">
        Unsure if your prior work experience meets these criteria? Our
        admissions team can evaluate equivalent qualifications on your free
        advice call.
      </p>
    </section>
  );
};
