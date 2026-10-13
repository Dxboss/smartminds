import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getTemplateRepo, getLearnerRepo } from "@/lib/repositories";
import { seedMessageLogs } from "@/lib/repositories/seedData";
import { getEmailSettings } from "@/lib/emailSettings";
import { AdminCommunicationsHub } from "@/components/admin/AdminCommunicationsHub";

export const instant = false;

export default async function AdminMessagesPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin/messages");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const templateRepo = getTemplateRepo();
  const learnerRepo = getLearnerRepo();

  const templates = await templateRepo.listTemplates(session);
  const learners = await learnerRepo.listLearners(session);
  const emailSettings = getEmailSettings();

  const canManageSettings =
    session.role === "owner_admin" || session.role === "super_admin";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy-900 tracking-tight">
          Approved communications centre
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Compose official college notices, configure departmental email senders, and manage automated student promotions.
        </p>
      </div>

      <AdminCommunicationsHub
        templates={templates}
        initialLogs={seedMessageLogs}
        learners={learners}
        emailSettings={emailSettings}
        canManageSettings={canManageSettings}
      />
    </div>
  );
}
