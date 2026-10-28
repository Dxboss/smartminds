import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import {
  getCohortsForTutor,
  listLearningMaterials,
  pullLatestFromNeon,
  syncPersistedRecords,
} from "@/lib/persistedData";
import { TutorMaterialsManager } from "@/components/staff/TutorMaterialsManager";
import { Icon } from "@/components/ui/Icon";


export const metadata: Metadata = {
  title: "Learning Materials & Document Cabinet | Tutor Console",
  description: "Upload and publish course documents, lecture presentations, and revision guides for your cohort.",
};

export default async function StaffMaterialsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/staff/materials");
  }

  await pullLatestFromNeon();
  syncPersistedRecords(false);

  const tutorId = session.tutorId || session.id || "tutor-001";
  const isOwnerOrSuper = session.role === "owner_admin" || session.role === "super_admin";

  const assignedCohorts = getCohortsForTutor(session);
  const tutorClasses = assignedCohorts.map((c) => ({ id: c.id, name: c.name }));

  const materials = listLearningMaterials(
    undefined,
    isOwnerOrSuper ? undefined : tutorId,
    isOwnerOrSuper ? undefined : session.name
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="book-open" size={14} />
            <span>Curriculum Resources</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Learning materials cabinet
          </h1>
          <p className="text-sm text-ink-soft">
            Manage official study guides, statutory framework references, and coursework resources for your assigned cohorts.
          </p>
        </div>
      </div>

      <TutorMaterialsManager
        initialMaterials={materials}
        tutorClasses={tutorClasses}
        currentTutorName={session.name || "Course Tutor"}
      />
    </div>
  );
}
