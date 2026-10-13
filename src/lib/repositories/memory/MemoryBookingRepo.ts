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

  constructor() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { loadPersistedRecords } = require("@/lib/persistedData");
      const store = loadPersistedRecords();
      if (store.blockedDays && Array.isArray(store.blockedDays)) {
        this.blockedDays = [...store.blockedDays];
      }
      if (store.availabilityRules && Array.isArray(store.availabilityRules)) {
        this.availabilityRules = [...store.availabilityRules];
      }
      if (store.bookings && Array.isArray(store.bookings) && store.bookings.length > 0) {
        for (const pb of store.bookings) {
          if (!this.bookings.some((b) => b.id === pb.id)) {
            this.bookings.push(pb);
          }
        }
      }
    } catch {
      // Ignore in non-node environment
    }
  }

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
    seedBookings.push(newBooking);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { saveBookings } = require("@/lib/persistedData");
      saveBookings(this.bookings);
    } catch {}
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
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { saveBookings } = require("@/lib/persistedData");
      saveBookings(this.bookings);
    } catch {}
    return { ...found };
  }

  async assignBooking(
    actor: SessionUser,
    bookingId: string,
    staffId: string,
    staffName: string
  ): Promise<Booking> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only administrative staff and owner admin can assign bookings."
      );
    }
    const found = this.bookings.find((b) => b.id === bookingId);
    if (!found) throw new Error(`Booking ${bookingId} not found.`);
    found.assignedStaffId = staffId;
    found.assignedStaffName = staffName;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { saveBookings } = require("@/lib/persistedData");
      saveBookings(this.bookings);
    } catch {}
    return { ...found };
  }

  async updateBookingStatus(
    actor: SessionUser,
    bookingId: string,
    status: Booking["status"],
    notes?: string
  ): Promise<Booking> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only administrative staff and owner admin can update booking status."
      );
    }
    const found = this.bookings.find((b) => b.id === bookingId);
    if (!found) throw new Error(`Booking ${bookingId} not found.`);
    found.status = status;
    if (notes) {
      found.notes = `${found.notes ? found.notes + " | " : ""}${notes}`;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { saveBookings } = require("@/lib/persistedData");
      saveBookings(this.bookings);
    } catch {}
    return { ...found };
  }

  async getAvailabilityRules(): Promise<AvailabilityRule[]> {
    return [...this.availabilityRules];
  }

  async updateAvailabilityRules(
    actor: SessionUser,
    rules: AvailabilityRule[]
  ): Promise<AvailabilityRule[]> {
    if (
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin" &&
      actor.role !== "admin_staff"
    ) {
      throw new PermissionDeniedError(
        "Only the owner or administrative staff can modify college weekly booking availability."
      );
    }
    this.availabilityRules = [...rules];
    seedAvailabilityRules.length = 0;
    seedAvailabilityRules.push(...this.availabilityRules);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { saveAvailabilityRules } = require("@/lib/persistedData");
      saveAvailabilityRules(this.availabilityRules);
    } catch {}
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
    if (
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin" &&
      actor.role !== "admin_staff"
    ) {
      throw new PermissionDeniedError(
        "Only the owner or administrative staff can block or unblock booking calendar days."
      );
    }
    const existingIndex = this.blockedDays.findIndex((b) => b.date === date);
    if (existingIndex >= 0) {
      this.blockedDays.splice(existingIndex, 1);
    } else {
      this.blockedDays.push({ date, reason: reason || "Blocked date" });
    }
    seedBlockedDays.length = 0;
    seedBlockedDays.push(...this.blockedDays);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { saveBlockedDays } = require("@/lib/persistedData");
      saveBlockedDays(this.blockedDays);
    } catch {}
    return [...this.blockedDays];
  }
}
