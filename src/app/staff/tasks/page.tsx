import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getTaskRepo } from "@/lib/repositories";
import { TutorTasksList } from "@/components/staff/TutorTasksList";

export default async function TutorTasksPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (
    session.role !== "tutor" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const taskRepo = getTaskRepo();
  const tasks = await taskRepo.listTasks(session);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--navy-900)] tracking-tight">
          Assigned tasks
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">
          Operational directives and marking actions assigned by college management.
        </p>
      </div>

      <TutorTasksList initialTasks={tasks} />
    </div>
  );
}
