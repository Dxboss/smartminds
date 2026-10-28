import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import {
  pullLatestFromNeon,
  syncPersistedRecords,
  getOneToOneTutoringStudentsForSession,
  listTutoringAttendanceRecords,
  listAllPlatformUsers,
} from "@/lib/persistedData";
import { OneToOneTutoringManager } from "@/components/staff/OneToOneTutoringManager";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function AdminOneToOneTutoringPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/admin/tutoring");
  }
  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  await pullLatestFromNeon();
  syncPersistedRecords(false);

  const allOneToOneStudents = getOneToOneTutoringStudentsForSession(session);
  const allAttendance = listTutoringAttendanceRecords(session);
  const allUsers = listAllPlatformUsers();
  const tutors = allUsers
    .filter((u) => u.role === "tutor" && u.active !== false)
    .map((u) => ({
      id: u.tutorId || u.id,
      name: u.name,
      email: u.email,
      specialism: u.specialism,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="clock" size={14} />
            <span>1-on-1 Private Tutoring Management</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            1-on-1 Tutoring Roster, Rooms &amp; Attendance Spreadsheet
          </h1>
          <p className="text-sm text-ink-soft">
            Assign 1-on-1 tutors, allocate Gloucester Centre rooms or home/online delivery, and review the master tutor attendance &amp; payroll hours spreadsheet.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/admin/learners"
            className="px-3.5 py-2 rounded-sm border border-line text-navy-900 text-xs font-semibold hover:bg-paper transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="graduation-cap" size={14} />
            <span>Learners Directory</span>
          </Link>
        </div>
      </div>

      <OneToOneTutoringManager
        initialStudents={allOneToOneStudents}
        initialAttendance={allAttendance}
        currentTutorId={session.tutorId || session.id}
        currentTutorName={session.name}
        isAdminView={true}
        tutors={tutors}
      />
    </div>
  );
}

