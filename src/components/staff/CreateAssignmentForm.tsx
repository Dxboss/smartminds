"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createAssignmentAction } from "@/app/staff/actions";
import { ClassCohort } from "@/lib/repositories/types";

interface Props {
  classes: ClassCohort[];
}

export const CreateAssignmentForm: React.FC<Props> = ({ classes }) => {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [unitCode, setUnitCode] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState("2026-10-31");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !unitCode || !title || !instructions || !deadline) {
      setError("Please complete all required assignment fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createAssignmentAction({
        classId,
        unitCode,
        title,
        instructions,
        deadline: new Date(deadline).toISOString(),
      });
      if (result.success && result.assignmentId) {
        router.push(`/staff/assignments/${result.assignmentId}`);
      } else {
        router.push("/staff/assignments");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assignment");
      setIsSubmitting(false);
    }
  };

  const selectedClass = classes.find((c) => c.id === classId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-sm text-xs text-red-800 flex items-center gap-2">
          <Icon name="alert-circle" size={16} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5">
          <label htmlFor="assign-class" className="font-semibold text-navy-900 block">
            Target Class Cohort
          </label>
          <select
            id="assign-class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900 font-medium"
            required
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.courseLevelLabel})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-ink-soft">
            Only cohorts assigned to your instructor profile are listed.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="assign-unit" className="font-semibold text-navy-900 block">
            Unit Code
          </label>
          <input
            id="assign-unit"
            type="text"
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
            placeholder="e.g. UNIT-302 or CPD-01"
            className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900 uppercase font-mono"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="assign-title" className="font-semibold text-navy-900 block">
            Assignment Title
          </label>
          <input
            id="assign-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Unit 302: Safeguarding and Duty of Care Portfolio"
            className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="assign-instructions" className="font-semibold text-navy-900 block">
            Brief Instructions & Assessment Criteria
          </label>
          <textarea
            id="assign-instructions"
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Specify assignment scope, required workplace evidence, and assessment criteria guidelines..."
            className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="assign-deadline" className="font-semibold text-navy-900 block">
            Submission Deadline
          </label>
          <input
            id="assign-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 rounded-sm border border-line bg-paper focus:bg-white text-navy-900"
            required
          />
        </div>
      </div>

      <div className="p-3.5 rounded-sm bg-paper border border-line text-xs text-ink-soft flex items-center gap-2">
        <Icon name="mail" size={15} className="text-navy-900 shrink-0" />
        <span>
          Enrolled students in <strong>{selectedClass?.name || "the selected cohort"}</strong> will receive an email notification as soon as this assignment is published.
        </span>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-sm border border-line text-ink-soft hover:text-navy-900 text-xs font-semibold"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors disabled:opacity-50 min-h-[44px] shadow-sm"
        >
          {isSubmitting ? "Creating & Notifying..." : "Publish assignment & notify cohort"}
        </button>
      </div>
    </form>
  );
};
