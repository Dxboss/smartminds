import { BookingRepo } from "../interfaces";
import {
  AvailabilityRule,
  BlockedDay,
  Booking,
  PermissionDeniedError,
  SessionUser,
} from "../types";
import {
  seedBookings,
  seedAvailabilityRules,
  seedBlockedDays,
} from "../seedData";

export class MemoryBookingRepo implements BookingRepo {
  private bookings: Booking[] = [...seedBookings];
  private availabilityRules: AvailabilityRule[] = [...seedAvailabilityRules];
  private blockedDays: BlockedDay[] = [...seedBlockedDays];

  async listBookings(actor: SessionUser): Promise<Booking[]> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only administrative staff and owner admin can access booked calls."
      );
    }
    return this.bookings.map((b) => ({ ...b }));
  }

  async createBooking(
    booking: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: `book-${(this.bookings.length + 1).toString().padStart(3, "0")}`,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(newBooking);
    return { ...newBooking };
  }

  async rescheduleBooking(
    actor: SessionUser,
    id: string,
    newDate: string
  ): Promise<Booking> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only administrative staff and owner admin can reschedule appointments."
      );
    }
    const found = this.bookings.find((b) => b.id === id);
    if (!found) throw new Error(`Booking ${id} not found.`);
    found.scheduledAt = newDate;
    found.status = "rescheduled";
    return { ...found };
  }

  async getAvailabilityRules(): Promise<AvailabilityRule[]> {
    return [...this.availabilityRules];
  }

  async updateAvailabilityRules(
    actor: SessionUser,
    rules: AvailabilityRule[]
  ): Promise<AvailabilityRule[]> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can modify college weekly booking availability."
      );
    }
    this.availabilityRules = [...rules];
    return [...this.availabilityRules];
  }

  async getBlockedDays(): Promise<BlockedDay[]> {
    return [...this.blockedDays];
  }

  async toggleBlockedDay(
    actor: SessionUser,
    date: string,
    reason?: string
  ): Promise<BlockedDay[]> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can block or unblock booking calendar days."
      );
    }
    const existingIndex = this.blockedDays.findIndex((b) => b.date === date);
    if (existingIndex >= 0) {
      this.blockedDays.splice(existingIndex, 1);
    } else {
      this.blockedDays.push({ date, reason: reason || "Owner blocked date" });
    }
    return [...this.blockedDays];
  }
}
