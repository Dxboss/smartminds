"use server";

import { getBookingRepo } from "@/lib/repositories";
import { siteConfig } from "@/content/siteConfig";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { getEmailSettings } from "@/lib/emailSettings";
import {
  buildBookingConfirmationEmail,
  buildBookingAdminAlertEmail,
} from "@/lib/emailTemplates";

export interface CreateBookingInput {
  fullName: string;
  email: string;
  phone: string;
  courseInterest: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  meetingPlatform?: "google_meet" | "phone" | "zoom";
}

export interface DaySlotInfo {
  dateString: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon"
  dateLabel: string; // e.g. "12 Oct"
  isBlocked: boolean;
  blockedReason?: string;
  availableTimes: string[];
}

export async function getPublicAvailableSlotsAction(): Promise<DaySlotInfo[]> {
  const repo = getBookingRepo();
  const rules = await repo.getAvailabilityRules();
  const blocked = await repo.getBlockedDays();
  const blockedDatesMap = new Map(blocked.map((b) => [b.date, b.reason]));

  const days: DaySlotInfo[] = [];
  const today = new Date();

  // Generate the next 14 days (excluding weekends)
  let count = 0;
  let offset = 1;

  while (count < 10 && offset < 20) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + offset);
    offset++;

    const dayOfWeek = candidate.getDay(); // 0 is Sun, 6 is Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const y = candidate.getFullYear();
    const m = String(candidate.getMonth() + 1).padStart(2, "0");
    const d = String(candidate.getDate()).padStart(2, "0");
    const dateString = `${y}-${m}-${d}`;
    const dayRule = rules.find((r) => r.dayOfWeek === dayOfWeek);

    const isBlocked = blockedDatesMap.has(dateString);
    const blockedReason = blockedDatesMap.get(dateString);

    const dayLabel = candidate.toLocaleDateString("en-GB", { weekday: "short" });
    const dateLabel = candidate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    let availableTimes: string[] = [];
    if (!isBlocked && dayRule) {
      // Standard consulting slots based on college rule
      availableTimes = ["09:30", "11:00", "12:30", "14:00", "15:30", "16:30"];
    }

    days.push({
      dateString,
      dayLabel,
      dateLabel,
      isBlocked,
      blockedReason,
      availableTimes,
    });
    count++;
  }

  return days;
}

export async function createPublicBookingAction(input: CreateBookingInput) {
  if (!input.fullName?.trim() || !input.email?.trim() || !input.phone?.trim()) {
    throw new Error("Please enter your name, email, and UK phone number.");
  }
  if (!input.date || !input.time) {
    throw new Error("Please choose an appointment date and time slot.");
  }

  const repo = getBookingRepo();
  const scheduledIso = new Date(`${input.date}T${input.time}:00Z`).toISOString();
  const platform: "google_meet" | "phone" =
    input.meetingPlatform === "phone" ? "phone" : "google_meet";

  // Generate clean Google Meet link for video consultation
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const meetRoomId = `smc-${input.date.replace(/-/g, "").slice(4)}-${randomSuffix}`;
  const googleMeetLink = `https://meet.google.com/${meetRoomId}`;

  const meetingLink = platform === "google_meet" ? googleMeetLink : undefined;

  const created = await repo.createBooking({
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    courseInterest: input.courseInterest || "General Course Advice",
    scheduledAt: scheduledIso,
    timeZone: "Europe/London",
    notes: input.notes?.trim() || undefined,
    meetingPlatform: platform,
    meetingLink,
  });

  const formattedDate = new Date(scheduledIso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const platformDescription =
    platform === "google_meet"
      ? `Google Meet Video Call (${googleMeetLink})`
      : `Phone Consultation (Adviser calls ${input.phone})`;

  // 1. Dispatch branded confirmation email to Applicant with Google Meet / Phone format
  const applicantEmail = buildBookingConfirmationEmail({
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    courseInterest: input.courseInterest || "General Course Advice",
    formattedDate,
    meetingPlatform: platform,
    meetingLink,
    notes: input.notes?.trim(),
  });

  await sendEmail({
    to: input.email.trim().toLowerCase(),
    recipientName: input.fullName.trim(),
    department: "admissions",
    subject: applicantEmail.subject,
    text: applicantEmail.text,
    html: applicantEmail.html,
    templateKey: "booking_confirmation",
    triggerEvent: "Public Consultation Booking Confirmation",
  });

  // 2. Dispatch branded alert email to College Admissions / Admin
  const settings = getEmailSettings();
  const adminRecipient =
    settings.adminNotificationEmail ||
    process.env.OWNER_EMAIL ||
    siteConfig.contact.email;

  const adminEmail = buildBookingAdminAlertEmail({
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    courseInterest: input.courseInterest || "General Course Advice",
    formattedDate,
    meetingPlatform: platform,
    meetingLink,
    notes: input.notes?.trim(),
  });

  await sendEmail({
    to: adminRecipient,
    recipientName: "Admissions Team",
    department: "admissions",
    subject: adminEmail.subject,
    text: adminEmail.text,
    html: adminEmail.html,
    templateKey: "booking_admin_alert",
    triggerEvent: "New Public Consultation Booking Alert",
  });

  try {
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
  } catch {}

  return {
    success: true,
    bookingId: created.id,
    formattedDate,
    meetingPlatform: platform,
    meetingLink,
  };
}
