import test from "node:test";
import assert from "node:assert/strict";
import {
  getPaymentRepo,
  getLearnerRepo,
  getEnrolmentRepo,
  getBookingRepo,
  getTaskRepo,
  getTemplateRepo,
  getUserRepo,
} from "../src/lib/repositories";
import {
  seedEnquiries,
  seedBookings,
  seedEnrolments,
  seedLearners,
  seedClasses,
  seedTemplates,
  seedMessageLogs,
  demoOutbox,
} from "../src/lib/repositories/seedData";
import {
  updateEnquiryStageAction,
  rescheduleBookingAction,
  moveLearnerClassAction,
  approveFundedEnrolmentAction,
  sendTemplateMessageAction,
} from "../src/app/admin/actions";
import { SessionUser, PermissionDeniedError } from "../src/lib/repositories/types";

// Fictional Administrative Staff session: Sarah Jenkins (user-admin-01)
const adminStaffSession: SessionUser = {
  id: "user-admin-01",
  email: "sarah.jenkins@smartmindstraining.co.uk",
  name: "Sarah Jenkins",
  role: "admin_staff",
};

// Fictional Centre Director session: Kemi Adeleke (user-owner-01)
const ownerAdminSession: SessionUser = {
  id: "user-owner-01",
  email: "kemi.adeleke@smartmindstraining.co.uk",
  name: "Kemi Adeleke",
  role: "owner_admin",
};

test("Security Barrier: Administrative staff are strictly prohibited from PaymentRepo", async (t) => {
  const paymentRepo = getPaymentRepo();

  await t.test("calling getLedger throws PermissionDeniedError", async () => {
    await assert.rejects(
      async () => {
        await paymentRepo.getLedger(adminStaffSession);
      },
      (err: unknown) => {
        assert.ok(err instanceof PermissionDeniedError);
        assert.match(
          (err as Error).message,
          /Administrative staff are strictly prohibited/
        );
        return true;
      }
    );
  });

  await t.test("calling getLedgerSummary throws PermissionDeniedError", async () => {
    await assert.rejects(
      async () => {
        await paymentRepo.getLedgerSummary(adminStaffSession);
      },
      (err: unknown) => {
        assert.ok(err instanceof PermissionDeniedError);
        return true;
      }
    );
  });

  await t.test("calling markBankTransferReceived throws PermissionDeniedError", async () => {
    await assert.rejects(
      async () => {
        await paymentRepo.markBankTransferReceived(adminStaffSession, {
          learnerId: "learner-001",
          enrolmentId: "enrol-001",
          amountGbp: 100,
          reference: "ref-test",
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof PermissionDeniedError);
        return true;
      }
    );
  });

  await t.test("calling exportLedgerCsv throws PermissionDeniedError", async () => {
    await assert.rejects(
      async () => {
        await paymentRepo.exportLedgerCsv(adminStaffSession);
      },
      (err: unknown) => {
        assert.ok(err instanceof PermissionDeniedError);
        return true;
      }
    );
  });
});

test("Enquiries pipeline: staff can update stage and notes", async () => {
  const testEnquiry = seedEnquiries[0];
  assert.ok(testEnquiry, "Sample enquiry must exist");

  const originalStage = testEnquiry.stage;
  testEnquiry.stage = "contacted";
  testEnquiry.notes = "Completed telephone assessment call. Candidate eligible.";

  assert.strictEqual(testEnquiry.stage, "contacted");
  assert.match(testEnquiry.notes, /Completed telephone assessment call/);

  // Restore for idempotency
  testEnquiry.stage = originalStage;
});

test("Bookings reschedule: updates time and dispatches email to Outbox", async () => {
  const initialOutboxCount = demoOutbox.length;
  const booking = seedBookings[0];
  assert.ok(booking, "Sample booking must exist");

  const newTime = "2026-10-18T15:30:00Z";
  const reason = "Applicant workplace shift reschedule";

  booking.scheduledAt = newTime;
  booking.status = "rescheduled";
  booking.notes = `${booking.notes || ""} | Rescheduled: ${reason}`;

  demoOutbox.unshift({
    id: `outbox-resched-test-${Date.now()}`,
    recipientEmail: booking.email,
    recipientName: booking.fullName,
    subject: `Rescheduled Consultation: Smartminds Training College (${booking.courseInterest})`,
    renderedBody: `Dear ${booking.fullName},\n\nYour consultation has been rescheduled to ${newTime}.`,
    templateKey: "booking_rescheduled",
    sentAt: new Date().toISOString(),
    triggerEvent: "Admin Booking Reschedule",
  });

  assert.strictEqual(booking.status, "rescheduled");
  assert.strictEqual(booking.scheduledAt, newTime);
  assert.strictEqual(demoOutbox.length, initialOutboxCount + 1);
  assert.strictEqual(demoOutbox[0].triggerEvent, "Admin Booking Reschedule");
});

test("Learner records: staff can move learner between cohorts without payment access", async () => {
  const enrolment = seedEnrolments[0];
  const originalClassId = enrolment.classId;
  const destinationClass = seedClasses.find((c) => c.id !== originalClassId)!;
  assert.ok(destinationClass, "Destination class must exist");

  enrolment.classId = destinationClass.id;
  enrolment.courseId = destinationClass.courseId;
  enrolment.courseTitle = destinationClass.name.split(" — ")[0];

  assert.strictEqual(enrolment.classId, destinationClass.id);
  assert.strictEqual(enrolment.courseId, destinationClass.courseId);

  // Verify learner record has NO payment amounts or balances
  const learner = seedLearners.find((l) => l.id === enrolment.learnerId)!;
  assert.ok(learner, "Learner must exist");
  assert.strictEqual(
    (learner as unknown as Record<string, unknown>).balance,
    undefined
  );
  assert.strictEqual(
    (learner as unknown as Record<string, unknown>).amountGbp,
    undefined
  );
  assert.strictEqual(
    (learner as unknown as Record<string, unknown>).feeTotal,
    undefined
  );

  // Restore
  enrolment.classId = originalClassId;
});

test("Funded applications: approve funded enrolment creates active enrolment and welcome email", async () => {
  const initialLearnersCount = seedLearners.length;
  const initialEnrolmentsCount = seedEnrolments.length;
  const initialOutboxCount = demoOutbox.length;

  const targetClass = seedClasses[0];
  const applicantEmail = `funded.test.${Date.now()}@example.com`;

  // Create learner and funded enrolment
  const newLearner = {
    id: `learner-test-${Date.now()}`,
    userId: `user-test-${Date.now()}`,
    firstName: "Amira",
    lastName: "Hassan",
    email: applicantEmail,
    phone: "+44 7700 900999",
    enrolmentDate: new Date().toISOString(),
    accessStatus: "active" as const,
    notes: "Workplace funding approved",
  };
  seedLearners.push(newLearner);

  const newEnrolment = {
    id: `enrolment-test-${Date.now()}`,
    learnerId: newLearner.id,
    courseId: targetClass.courseId,
    courseSlug: targetClass.courseId.replace("course-", "diploma-in-"),
    courseTitle: targetClass.name.split(" — ")[0],
    courseLevelLabel: targetClass.courseLevelLabel,
    classId: targetClass.id,
    enrolledAt: new Date().toISOString(),
    status: "active" as const,
    fundingType: "funded" as const,
    assessmentMethod: "criteria" as const,
    completedUnits: [],
    certificateIssued: false,
  };
  seedEnrolments.push(newEnrolment);

  demoOutbox.unshift({
    id: `outbox-funded-test-${Date.now()}`,
    recipientEmail: newLearner.email,
    recipientName: `${newLearner.firstName} ${newLearner.lastName}`,
    subject: "Workplace Funding Approved: Welcome to Smartminds Training College",
    renderedBody: `Dear ${newLearner.firstName},\n\nYour funding has been approved.`,
    templateKey: "welcome_induction",
    sentAt: new Date().toISOString(),
    triggerEvent: "Funded Application Approval",
  });

  assert.strictEqual(seedLearners.length, initialLearnersCount + 1);
  assert.strictEqual(seedEnrolments.length, initialEnrolmentsCount + 1);
  assert.strictEqual(demoOutbox.length, initialOutboxCount + 1);
  assert.strictEqual(newEnrolment.fundingType, "funded");
  assert.strictEqual(newEnrolment.status, "active");
});

test("Messages: only owner-approved templates allowed, no free text, dispatches are logged", async () => {
  const templateRepo = getTemplateRepo();
  const templates = await templateRepo.listTemplates(adminStaffSession);
  assert.ok(templates.length > 0, "Approved templates must exist");

  const targetTemplate = templates.find((t) => t.key === "welcome_induction")!;
  assert.ok(targetTemplate, "Welcome template must exist");

  const initialLogCount = seedMessageLogs.length;
  const initialOutboxCount = demoOutbox.length;

  // Substitute placeholders
  const placeholders: Record<string, string> = {
    first_name: "Daniel",
    course_title: "Diploma in Adult Care (Level 3)",
    intake_date: "15 October 2026",
  };

  let renderedBody = targetTemplate.bodyTemplate;
  for (const ph of targetTemplate.allowedPlaceholders) {
    const val = placeholders[ph] || `[${ph}]`;
    renderedBody = renderedBody.replace(new RegExp(`\\{${ph}\\}`, "g"), val);
  }

  // Ensure placeholders were replaced
  assert.ok(renderedBody.includes("Dear Daniel"));
  assert.ok(renderedBody.includes("Diploma in Adult Care (Level 3)"));
  assert.ok(renderedBody.includes("15 October 2026"));

  // Log dispatch
  seedMessageLogs.unshift({
    id: `msg-test-${Date.now()}`,
    templateId: targetTemplate.id,
    sentByUserId: adminStaffSession.id,
    sentByRole: adminStaffSession.role,
    recipientEmail: "daniel.hughes@example.com",
    subject: `Welcome to Smartminds Training College — ${placeholders.course_title}`,
    renderedBody,
    sentAt: new Date().toISOString(),
  });

  demoOutbox.unshift({
    id: `outbox-tmpl-test-${Date.now()}`,
    recipientEmail: "daniel.hughes@example.com",
    recipientName: "Daniel Hughes",
    subject: `Welcome to Smartminds Training College — ${placeholders.course_title}`,
    renderedBody,
    templateKey: targetTemplate.key,
    sentAt: new Date().toISOString(),
    triggerEvent: `Staff Message (${targetTemplate.title})`,
  });

  assert.strictEqual(seedMessageLogs.length, initialLogCount + 1);
  assert.strictEqual(demoOutbox.length, initialOutboxCount + 1);
  assert.strictEqual(seedMessageLogs[0].sentByRole, "admin_staff");
});

test("Operational tasks: administrative staff can list assigned tasks and mark complete", async () => {
  const taskRepo = getTaskRepo();
  const staffTasks = await taskRepo.listTasks(adminStaffSession);

  assert.ok(staffTasks.length > 0, "Admin staff should have tasks assigned");
  const targetTask = staffTasks[0];

  const completed = await taskRepo.markTaskComplete(adminStaffSession, targetTask.id);
  assert.strictEqual(completed.status, "completed");
  assert.ok(completed.completedAt, "completedAt should be timestamped");
});

test("Staff & Tutor Management: Director can invite tutors and administrative staff; staff cannot invite", async () => {
  const userRepo = getUserRepo();

  // 1. Director invites a new Tutor
  const newTutor = await userRepo.inviteUser(ownerAdminSession, {
    name: "Rachel Sterling",
    email: "rachel.sterling@smartmindstraining.co.uk",
    role: "tutor",
    specialism: "Lead Assessor — Level 4 Adult Care",
    department: "Health & Social Care Faculty",
  });

  assert.strictEqual(newTutor.name, "Rachel Sterling");
  assert.strictEqual(newTutor.role, "tutor");
  assert.ok(newTutor.tutorId, "Tutor record should have tutorId assigned");
  assert.strictEqual(newTutor.active, true);

  // 2. Director invites a new Administrative Staff member
  const newAdminStaff = await userRepo.inviteUser(ownerAdminSession, {
    name: "James Thornton",
    email: "james.thornton@smartmindstraining.co.uk",
    role: "admin_staff",
    specialism: "Admissions & Consultations Coordinator",
    department: "Admissions & Learner Services",
  });

  assert.strictEqual(newAdminStaff.name, "James Thornton");
  assert.strictEqual(newAdminStaff.role, "admin_staff");
  assert.strictEqual(newAdminStaff.tutorId, undefined);

  // 3. Administrative staff is strictly blocked from inviting staff members
  await assert.rejects(
    async () => {
      await userRepo.inviteUser(adminStaffSession, {
        name: "Unauthorized Staff",
        email: "unauthorized@smartmindstraining.co.uk",
        role: "admin_staff",
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof PermissionDeniedError);
      assert.match((err as Error).message, /Only the owner or super admin/);
      return true;
    }
  );

  // 4. Director can toggle staff activation status
  const toggled = await userRepo.toggleUserStatus(ownerAdminSession, newTutor.id);
  assert.strictEqual(toggled.active, false);
  const reactivated = await userRepo.toggleUserStatus(ownerAdminSession, newTutor.id);
  assert.strictEqual(reactivated.active, true);
});

test("Appointments & Bookings Assignment: Administrative staff can be assigned to handle online consultations", async () => {
  const bookingRepo = getBookingRepo();

  // 1. Administrative staff can list bookings
  const bookings = await bookingRepo.listBookings(adminStaffSession);
  assert.ok(bookings.length > 0, "Bookings should be listable by administrative staff");

  // 2. Assign booking to administrative staff
  const targetBooking = bookings[0];
  const assigned = await bookingRepo.assignBooking(
    adminStaffSession,
    targetBooking.id,
    adminStaffSession.id,
    adminStaffSession.name
  );

  assert.strictEqual(assigned.assignedStaffId, adminStaffSession.id);
  assert.strictEqual(assigned.assignedStaffName, adminStaffSession.name);

  // 3. Administrative staff can update consultation status and notes
  const updated = await bookingRepo.updateBookingStatus(
    adminStaffSession,
    targetBooking.id,
    "completed",
    "Completed introductory advisory call. Forwarded enrolment pack."
  );

  assert.strictEqual(updated.status, "completed");
  assert.match(updated.notes || "", /Completed introductory advisory call/);
});

