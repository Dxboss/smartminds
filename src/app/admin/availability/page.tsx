import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getBookingRepo, getCourseRepo, getUserRepo } from "@/lib/repositories";
import { AvailabilityManagerView } from "@/components/admin/AvailabilityManagerView";


export const metadata: Metadata = {
  title: "Cohorts, Class Schedules & Availability | Smartminds Administration",
  description:
    "Manage course cohorts, live class dates and times, tutor assignments, and telephone consultation hours.",
};

export default async function AdminAvailabilityPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/admin/availability");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const bookingRepo = getBookingRepo();
  const courseRepo = getCourseRepo();
  const userRepo = getUserRepo();
  const { getCohortSchedule, getPersistedCohorts } = await import("@/lib/persistedData");

  const [rules, blockedDays, cohortSchedule, courses, staffAndTutors] = await Promise.all([
    bookingRepo.getAvailabilityRules(),
    bookingRepo.getBlockedDays(),
    Promise.resolve(getCohortSchedule()),
    courseRepo.listCourses(),
    userRepo.listStaffAndTutors(session),
  ]);

  const cohorts = getPersistedCohorts();
  const tutors = staffAndTutors.filter((u) => u.role === "tutor" && u.active !== false);

  return (
    <AvailabilityManagerView
      initialRules={rules}
      initialBlockedDays={blockedDays}
      initialCohortSchedule={cohortSchedule}
      initialCohorts={cohorts}
      courses={courses}
      tutors={tutors}
      userRole={session.role}
    />
  );
}
