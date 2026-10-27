import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getUserRepo, getBookingRepo, getTaskRepo } from "@/lib/repositories";
import { seedClasses } from "@/lib/repositories/seedData";
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

  const [staffUsers, bookings, tasks] = await Promise.all([
    userRepo.listStaffAndTutors(session),
    bookingRepo.listBookings(session),
    taskRepo.listTasks(session),
  ]);

  const { getPersistedFaculties, listImpersonationAuditLogs } = await import("@/lib/persistedData");
  const faculties = getPersistedFaculties();
  const impersonationLogs = listImpersonationAuditLogs();

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
        classes={seedClasses}
        bookings={bookings}
        tasks={tasks}
        userRole={session.role}
        faculties={faculties}
        initialImpersonationLogs={impersonationLogs}
      />
    </div>
  );
}
