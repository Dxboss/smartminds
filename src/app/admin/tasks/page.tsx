import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getTaskRepo, getUserRepo } from "@/lib/repositories";
import { AdminTasksList } from "@/components/admin/AdminTasksList";


export default async function AdminTasksPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin/tasks");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const isOwner =
    session.role === "owner_admin" || session.role === "super_admin";

  const taskRepo = getTaskRepo();
  const userRepo = getUserRepo();

  const [tasks, staffAndTutors] = await Promise.all([
    taskRepo.listTasks(session),
    userRepo.listStaffAndTutors(session),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy-900 tracking-tight">
          Operational directives & tasks
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Directives assigned to administrative staff and tutors by the Training Director with compliance deadlines.
        </p>
      </div>

      <AdminTasksList
        initialTasks={tasks}
        staffAndTutors={staffAndTutors}
        isOwner={isOwner}
      />
    </div>
  );
}
