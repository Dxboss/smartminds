import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getEnrolmentRepo, getLearnerRepo } from "@/lib/repositories";
import { seedClasses } from "@/lib/repositories/seedData";
import { listLearningMaterials } from "@/lib/persistedData";
import { StudentMaterialsView } from "@/components/student/StudentMaterialsView";
import { Icon } from "@/components/ui/Icon";


export const metadata: Metadata = {
  title: "Course Materials & Study Packs | Student Portal",
  description: "Download official lecture slides, curriculum study packs, and revision papers for your course.",
};

export default async function StudentMaterialsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/student/materials");
  }

  let learnerId = session.learnerId;
  if (!learnerId) {
    const { seedLearners } = await import("@/lib/repositories/seedData");
    const found = seedLearners.find(
      (l) => l.email.toLowerCase() === session.email.toLowerCase()
    );
    learnerId = found?.id || "learner-001";
  }

  const enrolmentRepo = getEnrolmentRepo();
  const enrolments = await enrolmentRepo.listEnrolments(session, { learnerId });
  const primaryEnrolment = enrolments[0];

  const assignedClass = seedClasses.find((c) => c.id === primaryEnrolment?.classId);
  const enrolledCohortId = primaryEnrolment?.classId;
  const enrolledCohortName = assignedClass?.name || primaryEnrolment?.courseTitle;
  const tutorName = assignedClass?.tutorName;

  // Retrieve materials matching student's enrolled cohort, or cohortId is empty (accessible to all)
  const allMaterials = listLearningMaterials();
  const studentMaterials = allMaterials.filter(
    (m) => !m.cohortId || m.cohortId === enrolledCohortId
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="download" size={14} />
            <span>Learning Resources</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Course materials & study packs
          </h1>
          <p className="text-sm text-ink-soft">
            Access and download your cohort study guides, lecture slides, statutory frameworks, and revision materials.
          </p>
        </div>
      </div>

      <StudentMaterialsView
        materials={studentMaterials}
        enrolledCohortName={enrolledCohortName}
        tutorName={tutorName}
      />
    </div>
  );
}
