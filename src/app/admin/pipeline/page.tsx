import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { seedClasses } from "@/lib/repositories/seedData";
import { listAllEnquiries } from "@/lib/persistedData";
import { EnquiryPipelineBoard } from "@/components/admin/EnquiryPipelineBoard";

export const instant = false;

export default async function AdminPipelinePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin/pipeline");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const enquiries = listAllEnquiries();

  const availableCohorts = seedClasses.map((c) => ({
    id: c.id,
    name: `${c.name} (${c.intakeLabel})`,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy-900 tracking-tight">
          Admissions enquiries pipeline
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Track prospect enquiries from initial website contact through qualification, consultation calls, and cohort enrolment.
        </p>
      </div>

      <EnquiryPipelineBoard
        initialEnquiries={enquiries}
        availableCohorts={availableCohorts}
      />
    </div>
  );
}
