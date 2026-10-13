(process.env as Record<string, string | undefined>).NODE_ENV = "test";

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createPublicBookingAction } from "../src/app/actions/bookingActions";
import {
  getCohortScheduleAdminAction,
  updateCohortScheduleAdminAction,
  assignBookingStaffAction,
} from "../src/app/admin/actions";
import { demoOutbox } from "../src/lib/repositories/seedData";
import { getBookingRepo } from "../src/lib/repositories";

describe("Public Booking & 2-Cohort Zoom Schedule Test Suite", () => {
  test("createPublicBookingAction: Google Meet video consultation generates Google Meet URL and notifies both applicant and admin", async () => {
    const initialOutboxCount = demoOutbox.length;

    const res = await createPublicBookingAction({
      fullName: "Jane Test Applicant",
      email: "jane.test@example.com",
      phone: "07932000111",
      courseInterest: "Diploma in Adult Care (RQF)",
      date: "2026-10-20",
      time: "14:00",
      notes: "Looking to start next month",
      meetingPlatform: "google_meet",
    });

    assert.equal(res.success, true);
    assert.equal(res.meetingPlatform, "google_meet");
    assert.ok(res.meetingLink && res.meetingLink.startsWith("https://meet.google.com/smc-"));

    // Verify outbox received 2 notifications: 1 for applicant, 1 for admin
    assert.ok(demoOutbox.length >= initialOutboxCount + 2);
    const applicantMsg = demoOutbox.find(
      (m) => m.recipientEmail === "jane.test@example.com" && m.templateKey === "booking_confirmation"
    );
    assert.ok(applicantMsg, "Applicant booking confirmation email should be dispatched");
    assert.ok(applicantMsg.renderedBody.includes("Google Meet"), "Email must state Google Meet");
    assert.ok(applicantMsg.renderedBody.includes(res.meetingLink!), "Email must include meeting link");

    const adminMsg = demoOutbox.find(
      (m) => m.templateKey === "booking_admin_alert" && m.renderedBody.includes("Jane Test Applicant")
    );
    assert.ok(adminMsg, "Admin alert email should be dispatched for assignment");
  });

  test("createPublicBookingAction: Phone consultation registers phone platform without video URL", async () => {
    const res = await createPublicBookingAction({
      fullName: "Mark Phone Lead",
      email: "mark.lead@example.com",
      phone: "07111222333",
      courseInterest: "Level 5 Leadership in Care",
      date: "2026-10-21",
      time: "11:00",
      meetingPlatform: "phone",
    });

    assert.equal(res.success, true);
    assert.equal(res.meetingPlatform, "phone");
    assert.equal(res.meetingLink, undefined);

    const applicantMsg = demoOutbox.find(
      (m) => m.recipientEmail === "mark.lead@example.com" && m.templateKey === "booking_confirmation"
    );
    assert.ok(applicantMsg, "Applicant phone consultation confirmation should be dispatched");
    assert.ok(applicantMsg.renderedBody.includes("07111222333"));
  });

  test("Cohort schedule: get and update live cohort schedules and Zoom account URLs", async () => {
    const schedule = await getCohortScheduleAdminAction();
    assert.ok(schedule.afternoon, "Must have afternoon cohort configuration");
    assert.ok(schedule.evening, "Must have evening cohort configuration");
    assert.ok(schedule.afternoon.zoomUrl, "Must have afternoon Zoom account URL");
    assert.ok(schedule.evening.zoomUrl, "Must have evening Zoom account URL");

    // Update with custom timings and zoom links
    const updated = await updateCohortScheduleAdminAction({
      afternoon: {
        timeLabel: "13:30 – 15:30",
        startTime: "13:30",
        endTime: "15:30",
        description: "Updated afternoon daytime seminar.",
        zoomUrl: "https://zoom.us/j/smartminds-pro-afternoon-account-1",
      },
      evening: {
        timeLabel: "19:00 – 21:00",
        startTime: "19:00",
        endTime: "21:00",
        description: "Updated evening professional seminar.",
        zoomUrl: "https://zoom.us/j/smartminds-pro-evening-account-2",
      },
    });

    assert.equal(updated.success, true);
    assert.equal(updated.schedule.afternoon.timeLabel, "13:30 – 15:30");
    assert.equal(updated.schedule.evening.zoomUrl, "https://zoom.us/j/smartminds-pro-evening-account-2");

    // Fetch again to confirm persistence
    const reloaded = await getCohortScheduleAdminAction();
    assert.equal(reloaded.afternoon.startTime, "13:30");
    assert.equal(reloaded.evening.startTime, "19:00");
    assert.equal(reloaded.afternoon.zoomUrl, "https://zoom.us/j/smartminds-pro-afternoon-account-1");
    assert.equal(reloaded.evening.zoomUrl, "https://zoom.us/j/smartminds-pro-evening-account-2");
  });

  test("assignBookingStaffAction: assigns staff member, creates task, and dispatches Google Meet instructions", async () => {
    // 1. Create a booking
    const bookingRes = await createPublicBookingAction({
      fullName: "Assigned Lead Student",
      email: "assigned.lead@example.com",
      phone: "07888999000",
      courseInterest: "Certificate in Education & Training",
      date: "2026-10-22",
      time: "15:30",
      meetingPlatform: "google_meet",
    });

    // 2. Assign to staff
    const staffId = "user-admin-01";
    const staffName = "Sarah Davies";

    const assignRes = await assignBookingStaffAction(
      bookingRes.bookingId,
      staffId,
      staffName,
      "google_meet",
      bookingRes.meetingLink
    );

    assert.equal(assignRes.success, true);
    assert.equal(assignRes.booking.assignedStaffId, staffId);
    assert.equal(assignRes.booking.assignedStaffName, staffName);

    // Verify staff was notified with Google Meet link in outbox
    const staffMsg = demoOutbox.find(
      (m) =>
        m.templateKey === "consultation_staff_assigned" &&
        m.recipientName === staffName &&
        m.renderedBody.includes("Assigned Lead Student")
    );
    assert.ok(staffMsg, "Staff member should receive consultation assignment notification");
    assert.ok(staffMsg.renderedBody.includes("Google Meet"), "Must specify Google Meet");
    assert.ok(staffMsg.renderedBody.includes(bookingRes.meetingLink!), "Must include Google Meet link");
  });
});
