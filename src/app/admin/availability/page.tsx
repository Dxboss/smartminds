import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getBookingRepo } from "@/lib/repositories";
import { AvailabilityManagerView } from "@/components/admin/AvailabilityManagerView";

export const instant = false;

export const metadata: Metadata = {
  title: "Admissions Availability & Days Off | Smartminds Administration",
  description:
    "Manage weekly telephone consultation schedule, blackout days, and bank holidays.",
};

export default async function AdminAvailabilityPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/admin/availability");
  }

  if (session.role !== "owner_admin" && session.role !== "super_admin") {
    redirect("/login");
  }

  const bookingRepo = getBookingRepo();
  const { getCohortSchedule } = await import("@/lib/persistedData");
  const [rules, blockedDays, cohortSchedule] = await Promise.all([
    bookingRepo.getAvailabilityRules(),
    bookingRepo.getBlockedDays(),
    Promise.resolve(getCohortSchedule()),
  ]);

  return (
    <AvailabilityManagerView
      initialRules={rules}
      initialBlockedDays={blockedDays}
      initialCohortSchedule={cohortSchedule}
      userRole={session.role}
    />
  );
}
