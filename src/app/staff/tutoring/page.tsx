import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import {
  pullLatestFromNeon,
  syncPersistedRecords,
  getOneToOneTutoringStudentsForSession,
  listTutoringAttendanceRecords,
} from "@/lib/persistedData";
import { OneToOneTutoringManager } from "@/components/staff/OneToOneTutoringManager";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function StaffOneToOneTutoringPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/staff/tutoring");
  }

  await pullLatestFromNeon();
  syncPersistedRecords(false);

  const myOneToOneStudents = getOneToOneTutoringStudentsForSession(session);
  const myAttendance = listTutoringAttendanceRecords(session);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="users" size={14} />
            <span>1-on-1 Private Tutoring</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            1-on-1 Tutoring Attendance &amp; Spreadsheet
          </h1>
          <p className="text-sm text-ink-soft">
            Mark 1-on-1 pupil attendance, track delivery modes (Gloucester Centre room, Live Online, or Home/Room tutoring), and export your session hours spreadsheet.
          </p>
        </div>

        <Link
          href="/staff"
          className="px-3.5 py-2 rounded-sm border border-line text-navy-900 text-xs font-semibold hover:bg-paper transition-colors inline-flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>&larr; Back to My Classes</span>
        </Link>
      </div>

      <OneToOneTutoringManager
        initialStudents={myOneToOneStudents}
        initialAttendance={myAttendance}
        currentTutorId={session.tutorId || session.id}
        currentTutorName={session.name}
        isAdminView={false}
      />
    </div>
  );
}

