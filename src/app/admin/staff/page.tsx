import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getUserRepo, getBookingRepo, getTaskRepo, getCourseRepo } from "@/lib/repositories";
import { StaffDirectory } from "@/components/admin/StaffDirectory";


export default async function AdminStaffPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin/staff");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const userRepo = getUserRepo();
  const bookingRepo = getBookingRepo();
  const taskRepo = getTaskRepo();
  const courseRepo = getCourseRepo();

  const [staffUsers, bookings, tasks, allCourses] = await Promise.all([
    userRepo.listStaffAndTutors(session),
    bookingRepo.listBookings(session),
    taskRepo.listTasks(session),
    courseRepo.listCourses(),
  ]);

  const { getPersistedFaculties, getPersistedCohorts, listImpersonationAuditLogs } = await import("@/lib/persistedData");
  const faculties = getPersistedFaculties();
  const cohorts = getPersistedCohorts();
  const impersonationLogs = listImpersonationAuditLogs();
  const availableCourses = (allCourses || []).filter((c) => c && c.published !== false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy-900 tracking-tight">
          Staff & Tutor Management
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          College academic faculty, vocational assessors, and operational staff directory.
        </p>
      </div>

      <StaffDirectory
        initialUsers={staffUsers}
        classes={cohorts}
        bookings={bookings}
        tasks={tasks}
        userRole={session.role}
        faculties={faculties}
        availableCourses={availableCourses}
        initialImpersonationLogs={impersonationLogs}
      />
    </div>
  );
}
