import { Booking, AvailabilityRule, BlockedDay } from "@/lib/repositories/types";
import { BookingRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";
import { sql, isDbConfigured } from "@/lib/db";
import { sanitizeDbError } from "@/lib/migrations";

export class PostgresBookingRepo implements BookingRepo {
  async listBookings(actor: SessionUser): Promise<Booking[]> {
    if (actor.role === "student") {
      throw new PermissionDeniedError("Students cannot view other booking consultations.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      let query;
      if (actor.role === "tutor") {
        query = sql`
          SELECT data FROM bookings
          WHERE assigned_staff_id = ${actor.id} OR assigned_staff_name = ${actor.name}
          ORDER BY scheduled_at DESC;
        `;
      } else {
        query = sql`SELECT data FROM bookings ORDER BY scheduled_at DESC;`;
      }

      const rows = (await query) as { data: Booking }[];
      return rows.map((r) => r.data);
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresBookingRepo] listBookings error:", sanitizeDbError(err));
      throw new Error(`Failed to list bookings: ${sanitizeDbError(err)}`);
    }
  }

  async createBooking(
    booking: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<Booking> {
    const id = `book-${Date.now()}`;
    const newBooking: Booking = {
      ...booking,
      id,
      status: "confirmed",
      timeZone: booking.timeZone || "Europe/London",
      createdAt: new Date().toISOString(),
    };

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      await sql`
        INSERT INTO bookings (
          id, full_name, email, phone, course_interest, scheduled_at, time_zone,
          status, meeting_platform, meeting_link, assigned_staff_id, assigned_staff_name,
          notes, data, created_at
        ) VALUES (
          ${newBooking.id},
          ${newBooking.fullName},
          ${newBooking.email},
          ${newBooking.phone || null},
          ${newBooking.courseInterest},
          ${newBooking.scheduledAt},
          ${newBooking.timeZone},
          ${newBooking.status},
          ${newBooking.meetingPlatform || "google_meet"},
          ${newBooking.meetingLink || null},
          ${newBooking.assignedStaffId || null},
          ${newBooking.assignedStaffName || null},
          ${newBooking.notes || null},
          ${JSON.stringify(newBooking)}::jsonb,
          now()
        );
      `;
      return newBooking;
    } catch (err) {
      console.error("[PostgresBookingRepo] createBooking error:", sanitizeDbError(err));
      throw new Error(`Failed to create booking: ${sanitizeDbError(err)}`);
    }
  }

  async rescheduleBooking(
    actor: SessionUser,
    id: string,
    newDate: string
  ): Promise<Booking> {
    if (actor.role !== "admin_staff" && actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Administrative privileges required to reschedule consultations.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT data FROM bookings WHERE id = ${id} LIMIT 1;
      `) as { data: Booking }[];

      const booking = rows[0]?.data;
      if (!booking) throw new Error(`Booking ${id} not found.`);

      booking.scheduledAt = newDate;
      booking.status = "rescheduled";

      await sql`
        UPDATE bookings
        SET scheduled_at = ${newDate},
            status = 'rescheduled',
            data = ${JSON.stringify(booking)}::jsonb
        WHERE id = ${id};
      `;

      return booking;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresBookingRepo] rescheduleBooking(${id}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to reschedule booking: ${sanitizeDbError(err)}`);
    }
  }

  async assignBooking(
    actor: SessionUser,
    bookingId: string,
    staffId: string,
    staffName: string
  ): Promise<Booking> {
    if (actor.role !== "admin_staff" && actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Administrative privileges required to assign consultations.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT data FROM bookings WHERE id = ${bookingId} LIMIT 1;
      `) as { data: Booking }[];

      const booking = rows[0]?.data;
      if (!booking) throw new Error(`Booking ${bookingId} not found.`);

      booking.assignedStaffId = staffId;
      booking.assignedStaffName = staffName;

      await sql`
        UPDATE bookings
        SET assigned_staff_id = ${staffId},
            assigned_staff_name = ${staffName},
            data = ${JSON.stringify(booking)}::jsonb
        WHERE id = ${bookingId};
      `;

      return booking;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresBookingRepo] assignBooking(${bookingId}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to assign booking: ${sanitizeDbError(err)}`);
    }
  }

  async updateBookingStatus(
    actor: SessionUser,
    bookingId: string,
    status: Booking["status"],
    notes?: string
  ): Promise<Booking> {
    if (actor.role !== "admin_staff" && actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Administrative privileges required to update booking status.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT data FROM bookings WHERE id = ${bookingId} LIMIT 1;
      `) as { data: Booking }[];

      const booking = rows[0]?.data;
      if (!booking) throw new Error(`Booking ${bookingId} not found.`);

      booking.status = status;
      if (notes) booking.notes = notes;

      await sql`
        UPDATE bookings
        SET status = ${status},
            notes = ${notes || booking.notes || null},
            data = ${JSON.stringify(booking)}::jsonb
        WHERE id = ${bookingId};
      `;

      return booking;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresBookingRepo] updateBookingStatus(${bookingId}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to update booking status: ${sanitizeDbError(err)}`);
    }
  }

  async getAvailabilityRules(): Promise<AvailabilityRule[]> {
    if (!isDbConfigured) {
      return [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
        { dayOfWeek: 5, startTime: "09:00", endTime: "16:00", slotDurationMinutes: 30 },
      ];
    }

    try {
      const rows = (await sql`
        SELECT day_of_week, start_time, end_time, slot_duration_minutes
        FROM availability_rules
        ORDER BY day_of_week ASC;
      `) as { day_of_week: number; start_time: string; end_time: string; slot_duration_minutes: number }[];

      if (rows.length === 0) {
        return [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
          { dayOfWeek: 5, startTime: "09:00", endTime: "16:00", slotDurationMinutes: 30 },
        ];
      }

      return rows.map((r) => ({
        dayOfWeek: r.day_of_week,
        startTime: r.start_time,
        endTime: r.end_time,
        slotDurationMinutes: r.slot_duration_minutes,
      }));
    } catch (err) {
      console.error("[PostgresBookingRepo] getAvailabilityRules error:", sanitizeDbError(err));
      return [];
    }
  }

  async updateAvailabilityRules(
    actor: SessionUser,
    rules: AvailabilityRule[]
  ): Promise<AvailabilityRule[]> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only the College Owner can update baseline availability hours.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      await sql`DELETE FROM availability_rules;`;
      for (const rule of rules) {
        const id = `avail-${rule.dayOfWeek}`;
        await sql`
          INSERT INTO availability_rules (id, day_of_week, start_time, end_time, slot_duration_minutes)
          VALUES (${id}, ${rule.dayOfWeek}, ${rule.startTime}, ${rule.endTime}, ${rule.slotDurationMinutes || 30});
        `;
      }
      return rules;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresBookingRepo] updateAvailabilityRules error:", sanitizeDbError(err));
      throw new Error(`Failed to update availability rules: ${sanitizeDbError(err)}`);
    }
  }

  async getBlockedDays(): Promise<BlockedDay[]> {
    if (!isDbConfigured) {
      return [
        { date: "2026-12-25", reason: "Christmas Day" },
        { date: "2026-12-26", reason: "Boxing Day" },
      ];
    }

    try {
      const rows = (await sql`
        SELECT date, reason FROM blocked_days ORDER BY date ASC;
      `) as { date: string; reason: string }[];
      return rows;
    } catch (err) {
      console.error("[PostgresBookingRepo] getBlockedDays error:", sanitizeDbError(err));
      return [];
    }
  }

  async toggleBlockedDay(
    actor: SessionUser,
    date: string,
    reason?: string
  ): Promise<BlockedDay[]> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only the College Owner can modify blocked calendar dates.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const existing = (await sql`SELECT date FROM blocked_days WHERE date = ${date} LIMIT 1;`) as { date: string }[];
      if (existing.length > 0) {
        await sql`DELETE FROM blocked_days WHERE date = ${date};`;
      } else {
        await sql`
          INSERT INTO blocked_days (date, reason, created_at)
          VALUES (${date}, ${reason || "Director unavailable"}, now());
        `;
      }
      return await this.getBlockedDays();
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresBookingRepo] toggleBlockedDay(${date}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to toggle blocked day: ${sanitizeDbError(err)}`);
    }
  }
}
