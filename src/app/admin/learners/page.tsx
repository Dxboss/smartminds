import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getLearnerRepo, getEnrolmentRepo, getUserRepo } from "@/lib/repositories";
import { getPersistedCohorts } from "@/lib/persistedData";
import { LearnersDirectory } from "@/components/admin/LearnersDirectory";


export default async function AdminLearnersPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin/learners");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const learnerRepo = getLearnerRepo();
  const enrolmentRepo = getEnrolmentRepo();
  const userRepo = getUserRepo();
  const { getCourseRepo } = await import("@/lib/repositories");
  const courseRepo = getCourseRepo();

  const [learners, enrolments, allCourses, staffAndTutors] = await Promise.all([
    learnerRepo.listLearners(session),
    enrolmentRepo.listEnrolments(session),
    courseRepo.listCourses(),
    userRepo.listStaffAndTutors(session),
  ]);

  const cohorts = getPersistedCohorts();
  const tutors = staffAndTutors.filter((u) => u.role === "tutor" && u.active !== false);

  let paymentPlans: any[] = [];
  if (session.role === "owner_admin" || session.role === "super_admin") {
    try {
      const { getPaymentRepo } = await import("@/lib/repositories");
      const paymentRepo = getPaymentRepo();
      paymentPlans = await paymentRepo.getAllLearnerPaymentPlans(session);
    } catch (err) {
      console.warn("[AdminLearnersPage] Could not load payment plans:", err);
    }
  }

  const availableCourses = (allCourses || []).filter((c) => c && c.published !== false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy-900 tracking-tight">
          Learner records & cohort assignments
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Directory of enrolled learners, course progress, cohort groupings, and funding classifications.
        </p>
      </div>

      <LearnersDirectory
        initialLearners={learners}
        initialEnrolments={enrolments}
        initialPaymentPlans={paymentPlans}
        classes={cohorts}
        tutors={tutors}
        availableCourses={availableCourses}
        userRole={session.role}
      />
    </div>
  );
}
