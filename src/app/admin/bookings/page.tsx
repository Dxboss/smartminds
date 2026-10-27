import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getBookingRepo } from "@/lib/repositories";
import { BookingsManager } from "@/components/admin/BookingsManager";


export default async function AdminBookingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin/bookings");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const bookingRepo = getBookingRepo();
  const bookings = await bookingRepo.listBookings(session);
  const blockedDays = await bookingRepo.getBlockedDays();
  const availabilityRules = await bookingRepo.getAvailabilityRules();

  const { getUserRepo } = await import("@/lib/repositories");
  const staffList = await getUserRepo().listStaffAndTutors(session);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy-900 tracking-tight">
          Advisory consultations & bookings
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Review scheduled advisory phone consultations, assign follow-up advisors, and manage appointment calendar availability.
        </p>
      </div>

      <BookingsManager
        initialBookings={bookings}
        initialBlockedDays={blockedDays}
        initialAvailabilityRules={availabilityRules}
        userRole={session.role}
        currentUserId={session.id}
        staffList={staffList}
      />
    </div>
  );
}
