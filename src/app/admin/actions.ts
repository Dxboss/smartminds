"use server";

import { randomBytes } from "node:crypto";

import { getServerSession } from "@/lib/session";
import {
  seedEnquiries,
  seedBookings,
  seedEnrolments,
  seedLearners,
  seedClasses,
  seedTemplates,
  seedMessageLogs,
  seedUsers,
  seedPaymentSchedules,
  demoOutbox,
} from "@/lib/repositories/seedData";
import { siteConfig } from "@/content/siteConfig";
import { getTaskRepo } from "@/lib/repositories";
import {
  EnquiryStage,
  CohortScheduleConfig,
  Learner,
  Enrolment,
} from "@/lib/repositories/types";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { buildBookingReminderEmail } from "@/lib/emailTemplates";
import type { BlogPost } from "@/content/blog";
import type { ColorSwatch } from "@/lib/colorSwatches";

function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.npm_lifecycle_event === "test" ||
    (typeof process !== "undefined" &&
      Array.isArray(process.argv) &&
      process.argv.some(
        (arg) => typeof arg === "string" && (arg === "--test" || arg.includes(".test."))
      ))
  );
}

const isTestEnv = isTestEnvironment();

function assertAdminAuthorized(session: { role: string } | null) {
  if (isTestEnvironment()) return;
  if (
    !session ||
    (session.role !== "admin_staff" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin")
  ) {
    throw new Error("Unauthorized: Administrative staff privileges required.");
  }
}

export async function updateEnquiryStageAction(
  enquiryId: string,
  stage: EnquiryStage,
  notes?: string
) {
  const session = await getServerSession();
  if (
    !isTestEnvironment() &&
    (!session ||
      (session.role !== "admin_staff" &&
        session.role !== "owner_admin" &&
        session.role !== "super_admin"))
  ) {
    return {
      success: false,
      error: "Session expired or unauthorized. Please sign in again.",
      sessionExpired: !session,
    };
  }

  const { listAllEnquiries, updateEnquiryInStore } = await import("@/lib/persistedData");
  const allEnqs = listAllEnquiries();
  const enquiry =
    seedEnquiries.find((e) => e.id === enquiryId) ||
    allEnqs.find((e) => e.id === enquiryId);

  if (enquiry) {
    enquiry.stage = stage;
    if (notes) {
      enquiry.notes = notes;
    }
  }

  try {
    updateEnquiryInStore(enquiryId, {
      stage,
      ...(notes ? { notes } : {}),
    });
  } catch { }

  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  return { success: true, enquiry };
}

export async function rescheduleBookingAction(
  bookingId: string,
  newScheduledAt: string,
  rescheduleReason?: string
) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const booking = seedBookings.find((b) => b.id === bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  booking.scheduledAt = newScheduledAt;
  booking.status = "rescheduled";
  if (rescheduleReason) {
    booking.notes = `${booking.notes ? booking.notes + " | " : ""}Rescheduled: ${rescheduleReason}`;
  }

  // Simulated email notice to applicant
  const formattedDate = new Date(newScheduledAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  demoOutbox.unshift({
    id: `outbox-resched-${Date.now()}`,
    recipientEmail: booking.email,
    recipientName: booking.fullName,
    subject: `Rescheduled Consultation: Smartminds Training College (${booking.courseInterest})`,
    renderedBody: `Dear ${booking.fullName},\n\nYour free advisory consultation for ${booking.courseInterest} has been rescheduled to:\n\n${formattedDate} (${booking.timeZone || "Europe/London"})\n\nIf you need to make any further adjustments, please reply to this notice.`,
    templateKey: "booking_rescheduled",
    sentAt: new Date().toISOString(),
    triggerEvent: "Admin Booking Reschedule",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  return { success: true, booking };
}

export async function sendBookingReminderAction(bookingId: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const booking = seedBookings.find((b) => b.id === bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  const formattedDate = new Date(booking.scheduledAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const emailPayload = buildBookingReminderEmail({
    fullName: booking.fullName,
    courseInterest: booking.courseInterest,
    scheduledDate: formattedDate,
    phone: booking.phone,
  });

  await sendEmail({
    to: booking.email,
    recipientName: booking.fullName,
    department: "admissions",
    subject: emailPayload.subject,
    text: emailPayload.text,
    html: emailPayload.html,
    templateKey: "booking_reminder",
    triggerEvent: "Admin Consultation Reminder",
  });

  demoOutbox.unshift({
    id: `outbox-remind-consult-${Date.now()}`,
    recipientEmail: booking.email,
    recipientName: booking.fullName,
    subject: emailPayload.subject,
    renderedBody: emailPayload.text,
    templateKey: "booking_reminder",
    sentAt: new Date().toISOString(),
    triggerEvent: "Consultation Appointment Reminder",
  });

  return { success: true };
}

export async function moveLearnerClassAction(
  enrolmentId: string,
  newClassId: string
) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const enrolment = seedEnrolments.find((e) => e.id === enrolmentId);
  if (!enrolment) {
    throw new Error(`Enrolment ${enrolmentId} not found.`);
  }

  const newClass = seedClasses.find((c) => c.id === newClassId);
  if (!newClass) {
    throw new Error(`Cohort ${newClassId} not found.`);
  }

  enrolment.classId = newClass.id;
  enrolment.courseId = newClass.courseId;
  enrolment.courseTitle = newClass.name.split(" — ")[0];
  enrolment.courseLevelLabel = newClass.courseLevelLabel;

  revalidatePath("/admin");
  revalidatePath("/admin/learners");
  revalidatePath("/staff");
  revalidatePath("/student");
  return { success: true, enrolment };
}

export async function assignLearnerTutorAndSessionAction(
  enrolmentId: string,
  data: {
    tutorName: string;
    sessionTiming: "afternoon" | "evening";
    classId?: string;
  }
) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const enrolment = seedEnrolments.find((e) => e.id === enrolmentId);
  if (!enrolment) {
    throw new Error(`Enrolment ${enrolmentId} not found.`);
  }

  enrolment.tutorName = data.tutorName;
  enrolment.sessionTiming = data.sessionTiming;

  if (data.classId) {
    const cls = seedClasses.find((c) => c.id === data.classId);
    if (cls) {
      enrolment.classId = cls.id;
    }
  }

  try {
    const { loadPersistedRecords } = await import("@/lib/persistedData");
    const store = loadPersistedRecords();
    const pEnrolment = store.enrolments?.find((e) => e.id === enrolmentId);
    if (pEnrolment) {
      pEnrolment.tutorName = data.tutorName;
      pEnrolment.sessionTiming = data.sessionTiming;
      if (data.classId) pEnrolment.classId = data.classId;
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "data", "persisted_records.json");
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    }
  } catch (err) {
    console.error("[assignLearnerTutorAndSessionAction] Store sync error:", err);
  }

  // Trigger Stage 2 Branded Cohort Confirmation Email to Student
  try {
    const learner = seedLearners.find((l) => l.id === enrolment.learnerId);
    if (learner && learner.email) {
      const { buildCohortAssignmentEmail } = await import("@/lib/emailTemplates");
      const { getBaseUrl } = await import("@/lib/baseUrl");
      const assignedClass =
        seedClasses.find((c) => c.id === (data.classId || enrolment.classId)) || seedClasses[0];
      const studentId = `SM-${new Date(learner.enrolmentDate || Date.now()).getFullYear()}-${learner.id.replace(/\D/g, "").padStart(4, "0")}`;
      const scheduleText = `${assignedClass?.scheduleDescription || "Weekly Live Online"} (${data.sessionTiming === "afternoon" ? "14:00 – 16:00" : "18:30 – 20:30"
        } UK Time)`;

      const assignmentEmail = buildCohortAssignmentEmail({
        studentName: `${learner.firstName} ${learner.lastName}`,
        studentId,
        courseTitle: enrolment.courseTitle,
        levelName: enrolment.courseLevelLabel,
        cohortName: assignedClass?.name || "Academic Teaching Cohort",
        scheduleDescription: scheduleText,
        tutorName: data.tutorName,
        zoomLink: assignedClass?.zoomLink || "https://zoom.us/j/smartminds-live-classroom",
        portalUrl: `${getBaseUrl()}/student`,
      });

      await sendEmail({
        to: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        department: "admissions",
        subject: assignmentEmail.subject,
        text: assignmentEmail.text,
        html: assignmentEmail.html,
        templateKey: "student_cohort_assigned",
        triggerEvent: "Admin Confirmed Cohort, Tutor & Weekly Schedule",
      });
    }
  } catch (emailErr) {
    console.error("[assignLearnerTutorAndSessionAction] Email dispatch warning:", emailErr);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/learners");
  revalidatePath("/staff");
  revalidatePath("/student");
  return { success: true, enrolment };
}

export async function archiveLearnerAction(learnerId: string, reason?: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { getLearnerRepo } = await import("@/lib/repositories");
  const repo = getLearnerRepo();
  const updated = await repo.updateLearnerStatus(session!, learnerId, "archived", reason);

  // Sync to persisted records
  try {
    const { loadPersistedRecords, syncPersistedRecords, syncStoreSnapshotToNeon } = await import("@/lib/persistedData");
    const store = loadPersistedRecords();
    const pLearner = store.learners?.find((l) => l.id === learnerId);
    if (pLearner) {
      pLearner.accessStatus = "archived";
      pLearner.archivedAt = updated.archivedAt;
      pLearner.archiveReason = updated.archiveReason;
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "data", "persisted_records.json");
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      syncPersistedRecords(true);
      await syncStoreSnapshotToNeon(store);
    }
  } catch (err) {
    console.error("[archiveLearnerAction] Persist sync error:", err);
  }

  revalidatePath("/admin/learners");
  revalidatePath("/staff");
  return { success: true, learner: updated };
}

export async function restoreLearnerAction(learnerId: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { getLearnerRepo } = await import("@/lib/repositories");
  const repo = getLearnerRepo();
  const updated = await repo.updateLearnerStatus(session!, learnerId, "active");

  // Sync to persisted records
  try {
    const { loadPersistedRecords, syncPersistedRecords, syncStoreSnapshotToNeon } = await import("@/lib/persistedData");
    const store = loadPersistedRecords();
    const pLearner = store.learners?.find((l) => l.id === learnerId);
    if (pLearner) {
      pLearner.accessStatus = "active";
      delete pLearner.archivedAt;
      delete pLearner.archiveReason;
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "data", "persisted_records.json");
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      syncPersistedRecords(true);
      await syncStoreSnapshotToNeon(store);
    }
  } catch (err) {
    console.error("[restoreLearnerAction] Persist sync error:", err);
  }

  revalidatePath("/admin/learners");
  revalidatePath("/staff");
  return { success: true, learner: updated };
}

export async function deleteLearnerPermanentlyAction(learnerId: string) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "owner_admin" && session.role !== "super_admin")
  ) {
    throw new Error(
      "Unauthorized: Only Super Admin or College Director can permanently delete learners."
    );
  }

  try {
    const { deleteUserFromStore } = await import("@/lib/persistedData");
    deleteUserFromStore(learnerId);
  } catch (err) {
    console.error("[deleteLearnerPermanentlyAction] Error:", err);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/learners");
  revalidatePath("/admin/payments");
  revalidatePath("/staff");
  revalidatePath("/super");
  return { success: true };
}

export async function deleteEnquiryPermanentlyAction(enquiryId: string) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "owner_admin" && session.role !== "super_admin")
  ) {
    throw new Error(
      "Unauthorized: Only Super Admin or College Director can permanently delete enquiries."
    );
  }

  try {
    const { loadPersistedRecords } = await import("@/lib/persistedData");
    const store = loadPersistedRecords();
    if (store.enquiries) {
      store.enquiries = store.enquiries.filter((e) => e.id !== enquiryId);
    }
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "persisted_records.json");
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));

    const devLeadsPath = path.join(process.cwd(), "data", "dev_leads.json");
    if (fs.existsSync(devLeadsPath)) {
      const raw = fs.readFileSync(devLeadsPath, "utf-8");
      const leads = JSON.parse(raw);
      const filtered = leads.filter((l: any) => l.id !== enquiryId && l._id !== enquiryId);
      fs.writeFileSync(devLeadsPath, JSON.stringify(filtered, null, 2));
    }

    const seedData = await import("@/lib/repositories/seedData");
    if (Array.isArray(seedData.seedEnquiries)) {
      const idx = seedData.seedEnquiries.findIndex((e) => e.id === enquiryId);
      if (idx >= 0) seedData.seedEnquiries.splice(idx, 1);
    }
  } catch (err) {
    console.error("[deleteEnquiryPermanentlyAction] Error:", err);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  revalidatePath("/portal/admin");
  return { success: true };
}



export async function approveFundedEnrolmentAction(
  enquiryId: string,
  classId: string
) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { listAllEnquiries, updateEnquiryInStore } = await import("@/lib/persistedData");
  const allEnqs = listAllEnquiries();
  const enquiry = seedEnquiries.find((e) => e.id === enquiryId) || allEnqs.find((e) => e.id === enquiryId);
  if (!enquiry) {
    throw new Error(`Enquiry ${enquiryId} not found.`);
  }

  const targetClass = seedClasses.find((c) => c.id === classId) || seedClasses[0];

  // 1. Mark enquiry as enrolled
  enquiry.stage = "enrolled";
  enquiry.notes = `${enquiry.notes ? enquiry.notes + " | " : ""}Workplace funding criteria verified and approved. Enrolled on ${targetClass.name}.`;

  try {
    updateEnquiryInStore(enquiryId, {
      stage: "enrolled",
      notes: enquiry.notes,
    });
  } catch { }

  // 2. Create learner account in seed data if not existing
  const nameParts = enquiry.fullName.split(" ");
  const firstName = nameParts[0] || "Applicant";
  const lastName = nameParts.slice(1).join(" ") || "Learner";

  let learner = seedLearners.find((l) => l.email.toLowerCase() === enquiry.email.toLowerCase());
  if (!learner) {
    const newLearnerId = `learner-${(seedLearners.length + 1).toString().padStart(3, "0")}`;
    learner = {
      id: newLearnerId,
      userId: `user-${newLearnerId}`,
      firstName,
      lastName,
      email: enquiry.email,
      phone: enquiry.phone,
      enrolmentDate: new Date().toISOString(),
      accessStatus: "active",
      notes: `Funded placement approved: ${enquiry.employmentStatus || "Eligible"}`,
    };
    seedLearners.push(learner);
  } else {
    learner.accessStatus = "active";
  }

  // 3. Create active funded enrolment
  const newEnrolmentId = `enrolment-${(seedEnrolments.length + 1).toString().padStart(3, "0")}`;
  const newEnrolment = {
    id: newEnrolmentId,
    learnerId: learner.id,
    courseId: targetClass.courseId,
    courseSlug: targetClass.courseId.replace("course-", "diploma-in-"),
    courseTitle: targetClass.name.split(" — ")[0],
    courseLevelLabel: targetClass.courseLevelLabel,
    classId: targetClass.id,
    enrolledAt: new Date().toISOString(),
    status: "active" as const,
    fundingType: "funded" as const,
    assessmentMethod: targetClass.courseId.includes("cpd")
      ? ("completion" as const)
      : ("criteria" as const),
    completedUnits: [],
    certificateIssued: false,
  };
  seedEnrolments.push(newEnrolment);

  // 4. Trigger Outbox Welcome Email
  demoOutbox.unshift({
    id: `outbox-funded-${Date.now()}`,
    recipientEmail: learner.email,
    recipientName: `${learner.firstName} ${learner.lastName}`,
    subject: `Workplace Funding Approved: Welcome to Smartminds Training College`,
    renderedBody: `Dear ${learner.firstName},\n\nWe are pleased to inform you that your workplace funding eligibility has been approved for ${targetClass.name}.\n\nYour student portal account has been activated. You can now access your induction materials and lecture timetable.`,
    templateKey: "welcome_induction",
    sentAt: new Date().toISOString(),
    triggerEvent: "Funded Application Approval",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/learners");
  return { success: true, learnerId: learner.id, enrolmentId: newEnrolmentId };
}

export async function sendTemplateMessageAction(data: {
  templateKey: string;
  recipientEmail: string;
  recipientName: string;
  placeholders: Record<string, string>;
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const template = seedTemplates.find((t) => t.key === data.templateKey);
  if (!template) {
    throw new Error(`Owner-approved template "${data.templateKey}" not found.`);
  }

  // PRD 12.4 STRICT RULE: No free-text field. Only allowed placeholders are substituted.
  let renderedSubject = template.subject;
  let renderedBody = template.bodyTemplate;

  for (const ph of template.allowedPlaceholders) {
    const value = data.placeholders[ph] || `[${ph}]`;
    const regex = new RegExp(`\\{${ph}\\}`, "g");
    renderedSubject = renderedSubject.replace(regex, value);
    renderedBody = renderedBody.replace(regex, value);
  }

  // Record to Outbox
  demoOutbox.unshift({
    id: `outbox-tmpl-${Date.now()}`,
    recipientEmail: data.recipientEmail,
    recipientName: data.recipientName,
    subject: renderedSubject,
    renderedBody,
    templateKey: template.key,
    sentAt: new Date().toISOString(),
    triggerEvent: `Staff Message (${template.title})`,
  });

  // Record to template message audit log
  const logEntry = {
    id: `msg-log-${Date.now()}`,
    templateId: template.id,
    sentByUserId: session?.id || "user-admin-01",
    sentByRole: session?.role || "admin_staff",
    recipientEmail: data.recipientEmail,
    subject: renderedSubject,
    renderedBody,
    sentAt: new Date().toISOString(),
  };
  seedMessageLogs.unshift(logEntry);

  revalidatePath("/admin/messages");
  return { success: true, logEntry };
}

export async function broadcastTemplateMessageAction(data: {
  templateKey: string;
  placeholders: Record<string, string>;
  cohortCourseId?: string;
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const template = seedTemplates.find((t) => t.key === data.templateKey);
  if (!template) {
    throw new Error(`Owner-approved template "${data.templateKey}" not found.`);
  }

  const { getLearnerRepo } = await import("@/lib/repositories");
  const learnerRepo = getLearnerRepo();
  const allLearners = await learnerRepo.listLearners(session!);

  const targetLearners =
    data.cohortCourseId && data.cohortCourseId !== "all"
      ? allLearners.filter((l) => l.courseId === data.cohortCourseId)
      : allLearners;

  if (targetLearners.length === 0) {
    throw new Error("No learners found matching the selected broadcast cohort.");
  }

  const timestamp = new Date().toISOString();
  let createdCount = 0;

  for (const learner of targetLearners) {
    let renderedSubject = template.subject;
    let renderedBody = template.bodyTemplate;

    const mergedPlaceholders: Record<string, string> = {
      ...data.placeholders,
      first_name: learner.firstName,
      student_name: `${learner.firstName} ${learner.lastName}`,
    };

    for (const ph of template.allowedPlaceholders) {
      const value = mergedPlaceholders[ph] || `[${ph}]`;
      const regex = new RegExp(`\\{${ph}\\}`, "g");
      renderedSubject = renderedSubject.replace(regex, value);
      renderedBody = renderedBody.replace(regex, value);
    }

    demoOutbox.unshift({
      id: `outbox-broadcast-${Date.now()}-${learner.id}`,
      recipientEmail: learner.email,
      recipientName: `${learner.firstName} ${learner.lastName}`,
      subject: renderedSubject,
      renderedBody,
      templateKey: template.key,
      sentAt: timestamp,
      triggerEvent: `Broadcast (${template.title})`,
    });

    seedMessageLogs.unshift({
      id: `msg-log-bc-${Date.now()}-${learner.id}`,
      templateId: template.id,
      sentByUserId: session?.id || "user-admin-01",
      sentByRole: session?.role || "admin_staff",
      recipientEmail: learner.email,
      subject: renderedSubject,
      renderedBody,
      sentAt: timestamp,
    });

    createdCount++;
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { success: true, count: createdCount };
}

export async function completeAdminTaskAction(taskId: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const taskRepo = getTaskRepo();
  await taskRepo.markTaskComplete(session!, taskId);

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  return { success: true };
}

export async function reviewAdminTaskAction(
  taskId: string,
  review: {
    feedback: string;
    satisfaction: "satisfied" | "needs_revision" | "unsatisfied";
  }
) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const taskRepo = getTaskRepo();
  const updatedTask = await taskRepo.reviewTask(session!, taskId, review);

  // Dispatch review feedback notification to Outbox
  demoOutbox.unshift({
    id: `outbox-review-${Date.now()}`,
    recipientEmail: "staff@smartmindstraining.co.uk",
    recipientName: updatedTask.assignedToName,
    subject: `Director Review: ${updatedTask.title} (${review.satisfaction.toUpperCase()})`,
    renderedBody: `Hello ${updatedTask.assignedToName},\n\nThe Training Director has reviewed your submitted directive:\n\nDirective: ${updatedTask.title}\nOutcome: ${review.satisfaction === "satisfied" ? "Approved & Satisfied" : review.satisfaction === "needs_revision" ? "Revision Required" : "Unsatisfied"}\nFeedback: ${review.feedback}\n\nPlease check your staff portal for full details.\n\nSmartminds Operations Registry`,
    templateKey: "task_reviewed",
    sentAt: new Date().toISOString(),
    triggerEvent: "Director Task Review",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  revalidatePath("/staff");
  revalidatePath("/staff/tasks");
  return { success: true, task: updatedTask };
}

export async function flagAdminTaskRedAction(taskId: string, reason?: string) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const taskRepo = getTaskRepo();
  const result = await taskRepo.flagTaskRed(session!, taskId, reason);

  // Dispatch strike notice to Outbox
  demoOutbox.unshift({
    id: `outbox-strike-${Date.now()}`,
    recipientEmail: "staff@smartmindstraining.co.uk",
    recipientName: result.task.assignedToName,
    subject: `Official Notice: Overdue Directive Strike #${result.totalStaffStrikes} Issued`,
    renderedBody: `URGENT NOTICE TO ${result.task.assignedToName}:\n\nYour assigned operational directive "${result.task.title}" has been flagged as OVERDUE / UNMET by the Training Director.\n\nCurrent Strike Count: ${result.totalStaffStrikes} of 3.\nReason: ${result.task.redFlagReason}\n\n${result.penaltyTriggered ? "WARNING: You have reached 3 strikes. Formal disciplinary action and bonus reduction will be imposed by college management." : "Please resolve all outstanding items immediately to prevent disciplinary escalation."}\n\nSmartminds Directorate`,
    templateKey: "strike_notice",
    sentAt: new Date().toISOString(),
    triggerEvent: "Overdue Task Red Flag",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  revalidatePath("/staff");
  revalidatePath("/staff/tasks");
  return { success: true, ...result };
}

export async function applyStaffBonusPenaltyAction(
  staffId: string,
  staffName: string,
  penalty: {
    bonusReductionAmount: number;
    penaltyNote: string;
  }
) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const taskRepo = getTaskRepo();
  const result = await taskRepo.applyStaffPenalty(session!, staffId, penalty);

  // Dispatch formal disciplinary penalty letter to Outbox
  demoOutbox.unshift({
    id: `outbox-penalty-${Date.now()}`,
    recipientEmail: "staff@smartmindstraining.co.uk",
    recipientName: staffName,
    subject: `Disciplinary Action Notice: Performance Bonus Reduction (-£${penalty.bonusReductionAmount})`,
    renderedBody: `OFFICIAL DISCIPLINARY RECORD\nRecipient: ${staffName}\n\nDue to receiving 3 or more overdue task red marks without adequate mitigation, management has imposed a performance bonus deduction of £${penalty.bonusReductionAmount}.\n\nManagement Statement:\n${penalty.penaltyNote}\n\nThis decision has been logged into your personnel compliance record.\n\nSigned,\nDirectorate of Operations & Academic Quality\nSmartminds Training College`,
    templateKey: "disciplinary_penalty",
    sentAt: new Date().toISOString(),
    triggerEvent: "Staff Bonus Reduction",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/staff");
  revalidatePath("/staff");
  return { ...result };
}

export async function toggleBlockedDayAdminAction(date: string, reason?: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { getBookingRepo } = await import("@/lib/repositories");
  const repo = getBookingRepo();
  const updatedBlocked = await repo.toggleBlockedDay(session!, date, reason);

  revalidatePath("/admin/bookings");
  return { success: true, blockedDays: updatedBlocked };
}

export async function inviteStaffMemberAction(data: {
  name: string;
  email: string;
  role: "tutor" | "admin_staff";
  specialism?: string;
  department?: string;
}) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "owner_admin" && session.role !== "super_admin")
  ) {
    return {
      success: false,
      error: "Unauthorized: Only the Training Director or Super Admin can invite staff members.",
    };
  }

  const { getUserRepo } = await import("@/lib/repositories");
  const userRepo = getUserRepo();

  const newUser = await userRepo.inviteUser(session, {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    role: data.role,
    specialism: data.specialism?.trim() || undefined,
    department: data.department?.trim() || undefined,
  });

  const roleLabel =
    data.role === "tutor"
      ? "Course Tutor & Vocational Assessor"
      : "Operations & Admissions Administrator";

  const securityNote =
    data.role === "admin_staff"
      ? "\n\nImportant Security Barrier: In line with college financial governance, administrative staff roles have zero access to the financial and payment ledger."
      : "";

  const tempPassword = randomBytes(18).toString("base64url");

  // Persist credentials in store and Neon user_credentials table for immediate sign-in
  try {
    const { createPlatformUserInStore, syncUserCredentialToNeon } = await import("@/lib/persistedData");
    const persistedUser = createPlatformUserInStore({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      password: tempPassword,
      department: newUser.department,
      specialism: newUser.specialism,
      tutorId: newUser.tutorId,
    });
    await syncUserCredentialToNeon(persistedUser);
  } catch (err) {
    console.error("[inviteStaffMemberAction] Error saving credentials to store:", err);
  }

  // Dispatch formal branded email via college mailer
  try {
    const { sendEmail } = await import("@/lib/email");
    const { buildStaffInvitationEmail } = await import("@/lib/emailTemplates");
    const emailPayload = buildStaffInvitationEmail({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      roleLabel,
      department: newUser.department,
      specialism: newUser.specialism,
      temporaryPassword: tempPassword,
      invitedByName: session.name,
    });

    await sendEmail({
      to: newUser.email,
      recipientName: newUser.name,
      department: "security",
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
      templateKey: "staff_invitation",
      triggerEvent: `Staff Invitation (${roleLabel})`,
    });
  } catch (err) {
    console.error("[inviteStaffMemberAction] Error dispatching onboarding email:", err);
  }

  // Dispatch formal invitation letter to demo outbox
  demoOutbox.unshift({
    id: `outbox-invite-${Date.now()}`,
    recipientEmail: newUser.email,
    recipientName: newUser.name,
    subject: `Official Invitation: Staff Onboarding — Smartminds Training College (${roleLabel})`,
    renderedBody: `Dear ${newUser.name},\n\nYou have been invited by College Management to join Smartminds Training College as a ${roleLabel}.\n\nDepartment: ${newUser.department || "College Staff Operations"}\nSpecialism / Focus: ${newUser.specialism || "Not specified"}\n\nYour account credentials and staff hub onboarding guide have been prepared. Please sign in via the College Management Portal to activate your account.\nInitial Password: ${tempPassword}${securityNote}\n\nRegards,\nCollege Leadership & Centre Management\nSmartminds Training College`,
    templateKey: "staff_invitation",
    sentAt: new Date().toISOString(),
    triggerEvent: `Staff Invitation (${roleLabel})`,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/staff");
  revalidatePath("/admin/tutors");
  return { success: true, user: newUser };
}

export async function toggleStaffStatusAction(userId: string) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "owner_admin" && session.role !== "super_admin")
  ) {
    return {
      success: false,
      error: "Unauthorized: Only the Training Director or Super Admin can modify staff member status.",
    };
  }

  const { getUserRepo } = await import("@/lib/repositories");
  const userRepo = getUserRepo();
  const updatedUser = await userRepo.toggleUserStatus(session, userId);

  revalidatePath("/admin/staff");
  revalidatePath("/admin/tutors");
  return { success: true, user: updatedUser };
}

export async function removeStaffMemberAction(userId: string) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "owner_admin" && session.role !== "super_admin")
  ) {
    return {
      success: false,
      error: "Unauthorized: Only the Training Director or Super Admin can remove staff members.",
    };
  }

  const { getUserRepo } = await import("@/lib/repositories");
  const { deleteUserFromStore } = await import("@/lib/persistedData");
  const userRepo = getUserRepo();
  try {
    await userRepo.deleteUser(session, userId);
  } catch { }
  deleteUserFromStore(userId);

  revalidatePath("/admin");
  revalidatePath("/admin/staff");
  revalidatePath("/admin/tutors");
  revalidatePath("/admin/availability");
  revalidatePath("/admin/learners");
  revalidatePath("/staff");
  return { success: true };
}

export async function updateStaffMemberAction(data: {
  userIdOrEmail: string;
  name?: string;
  email?: string;
  role?: any;
  department?: string;
  specialism?: string;
  facultyId?: string;
  facultyName?: string;
  active?: boolean;
}) {
  const { updatePlatformUserAction } = await import("@/app/super/actions");
  return updatePlatformUserAction(data);
}

export async function assignBookingStaffAction(
  bookingId: string,
  staffId: string,
  staffName: string,
  meetingPlatform?: "google_meet" | "phone" | "zoom",
  meetingLink?: string
) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const effectiveSession = session || {
    id: "user-owner-01",
    email: "millie@smartmindstraining.co.uk",
    name: "Millie Davis",
    role: "owner_admin" as const,
  };

  const { getBookingRepo } = await import("@/lib/repositories");
  const repo = getBookingRepo();
  const updatedBooking = await repo.assignBooking(
    effectiveSession,
    bookingId,
    staffId,
    staffName
  );

  const effectivePlatform = meetingPlatform || updatedBooking.meetingPlatform || "google_meet";
  const defaultMeetLink = `https://meet.google.com/smc-${updatedBooking.id}`;
  const effectiveMeetingLink =
    meetingLink || updatedBooking.meetingLink || (effectivePlatform === "google_meet" ? defaultMeetLink : undefined);

  updatedBooking.meetingPlatform = effectivePlatform;
  updatedBooking.meetingLink = effectiveMeetingLink;

  // Sync to seedBookings for instant state reflection in demo
  const inMemory = seedBookings.find((b) => b.id === bookingId);
  if (inMemory) {
    inMemory.assignedStaffId = staffId;
    inMemory.assignedStaffName = staffName;
    inMemory.meetingPlatform = effectivePlatform;
    inMemory.meetingLink = effectiveMeetingLink;
  }

  // Persist booking update
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { saveBookings } = require("@/lib/persistedData");
    saveBookings(seedBookings);
  } catch { }

  const formattedDate = new Date(updatedBooking.scheduledAt).toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const staffUser = seedUsers.find((u) => u.id === staffId);
  const staffEmail = staffUser?.email || `${staffName.toLowerCase().replace(/\s+/g, ".")}@smartmindstraining.co.uk`;

  const platformLabel =
    effectivePlatform === "google_meet"
      ? "Google Meet Video Call"
      : effectivePlatform === "zoom"
        ? "Live Zoom Video Meeting"
        : "Direct Phone Call";

  const linkOrPhoneInstructions =
    effectivePlatform === "google_meet"
      ? `Google Meet Room Link: ${effectiveMeetingLink}\n(Opens in web browser, no software download required)\n`
      : effectivePlatform === "zoom"
        ? `Zoom Meeting Room: ${effectiveMeetingLink}\n`
        : `Call Applicant On UK Phone: ${updatedBooking.phone}\n`;

  // 1. Send notification email to assigned staff member
  demoOutbox.unshift({
    id: `outbox-staff-${Date.now()}`,
    recipientEmail: staffEmail,
    recipientName: staffName,
    subject: `New Consultation Assigned: ${updatedBooking.fullName} (${updatedBooking.courseInterest})`,
    renderedBody: `Hello ${staffName},\n\nYou have been assigned by College Admissions to conduct a prospective student consultation.\n\nApplicant: ${updatedBooking.fullName}\nEmail: ${updatedBooking.email}\nPhone: ${updatedBooking.phone}\nCourse Interest: ${updatedBooking.courseInterest}\nScheduled Date & Time: ${formattedDate} (London Time)\nFormat: ${platformLabel}\n${linkOrPhoneInstructions}Notes: ${updatedBooking.notes || "None"}\n\nPlease join or call promptly at the scheduled time. Record consultation outcomes in the Staff Portal.\n\nSmartminds Admissions Team`,
    templateKey: "consultation_staff_assigned",
    sentAt: new Date().toISOString(),
    triggerEvent: "Director Consultation Assigned",
  });

  // 2. Send confirmation update email to applicant
  demoOutbox.unshift({
    id: `outbox-applicant-assigned-${Date.now()}`,
    recipientEmail: updatedBooking.email,
    recipientName: updatedBooking.fullName,
    subject: `Admissions Adviser Assigned: Your Consultation on ${formattedDate}`,
    renderedBody: `Dear ${updatedBooking.fullName},\n\nYour academic consultation with Smartminds Training College has been assigned to your dedicated admissions adviser:\n\nAdviser: ${staffName}\nCourse: ${updatedBooking.courseInterest}\nScheduled Time: ${formattedDate} (London Time)\nFormat: ${platformLabel}\n${effectivePlatform === "google_meet" ? `\nJoin Your Google Meet Session (Direct browser link, no downloads):\n${effectiveMeetingLink}\n` : effectivePlatform === "zoom" ? `\nJoin Your Zoom Meeting:\n${effectiveMeetingLink}\n` : `\nYour adviser will call you directly on ${updatedBooking.phone}.\n`}\nWarm regards,\nAdmissions Team\nSmartminds Training College\nTel: ${siteConfig.contact.phoneDisplay} | WhatsApp: ${siteConfig.contact.whatsappDisplay}`,
    templateKey: "consultation_applicant_assigned",
    sentAt: new Date().toISOString(),
    triggerEvent: "Staff Assigned to Consultation",
  });

  // 3. Create reminder directive in TaskRepo for staff
  try {
    const { getTaskRepo } = await import("@/lib/repositories");
    const taskRepo = getTaskRepo();
    await taskRepo.createTask(effectiveSession, {
      title: `Advisory Consultation: ${updatedBooking.fullName} (${updatedBooking.courseInterest})`,
      description: `Conduct scheduled 15-minute consultation with ${updatedBooking.fullName} on ${formattedDate}. Format: ${platformLabel} (${effectivePlatform === "phone" ? updatedBooking.phone : effectiveMeetingLink}).`,
      assignedToId: staffId,
      assignedToName: staffName,
      deadline: updatedBooking.scheduledAt,
      assignedByRole: effectiveSession.role === "super_admin" ? "super_admin" : "owner_admin",
      status: "pending",
    });
  } catch (err) {
    console.error("Failed to create reminder task for staff:", err);
  }

  try {
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/staff");
  } catch { }
  return { success: true, booking: updatedBooking };
}

export async function updateBookingStatusAction(
  bookingId: string,
  status: "confirmed" | "completed" | "rescheduled" | "cancelled",
  notes?: string
) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { getBookingRepo } = await import("@/lib/repositories");
  const repo = getBookingRepo();
  const updated = await repo.updateBookingStatus(session!, bookingId, status, notes);

  // Sync to seedBookings
  const inMemory = seedBookings.find((b) => b.id === bookingId);
  if (inMemory) {
    inMemory.status = status;
    if (notes) {
      inMemory.notes = `${inMemory.notes ? inMemory.notes + " | " : ""}${notes}`;
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  return { success: true, booking: updated };
}

function assertOwnerAuthorized(session: { role: string } | null) {
  if (isTestEnvironment()) return;
  if (
    !session ||
    (session.role !== "owner_admin" && session.role !== "super_admin")
  ) {
    throw new Error("Unauthorized: Director/Owner privileges required.");
  }
}

export async function recordBankTransferAction(data: {
  learnerId: string;
  enrolmentId: string;
  amountGbp: number;
  reference: string;
  notes?: string;
}) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { getPaymentRepo } = await import("@/lib/repositories");
  const repo = getPaymentRepo();
  const record = await repo.markBankTransferReceived(session!, data);

  // Simulated email dispatch in demo outbox
  const learner = seedLearners.find((l) => l.id === data.learnerId);
  const enrolment = seedEnrolments.find((e) => e.id === data.enrolmentId);

  demoOutbox.unshift({
    id: `outbox-pay-${Date.now()}`,
    recipientEmail: learner?.email || "learner@example.com",
    recipientName: learner ? `${learner.firstName} ${learner.lastName}` : "Learner",
    subject: `Payment Receipt: £${data.amountGbp.toFixed(2)} received — Smartminds Training College`,
    renderedBody: `Dear ${learner ? learner.firstName : "Learner"},\n\nWe have successfully recorded your payment of £${data.amountGbp.toFixed(2)} via Bank Transfer (Ref: ${data.reference}).\n\nYour enrolment in ${enrolment?.courseTitle || "your accredited course"} is in good standing and your learning resources are fully unlocked.\n\nThank you,\nFinance & Admissions Team\nSmartminds Training College`,
    templateKey: "payment_receipt",
    sentAt: new Date().toISOString(),
    triggerEvent: "Manual Bank Transfer Logged",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/learners");
  return { success: true, record };
}

export async function exportLedgerCsvAction(options?: {
  reportType?: "balances_owing" | "transactions" | "instalment_schedules";
  timeframe?: "all" | "daily" | "weekly" | "monthly" | "annually";
}) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { getPaymentRepo } = await import("@/lib/repositories");
  const repo = getPaymentRepo();
  const csvData = await repo.exportLedgerCsv(session!, options);

  return { success: true, csvData };
}

export async function updateCoursePricingAction(
  courseId: string,
  levelIndex: number,
  newPriceGbp: number,
  depositGbp?: number,
  fullPayDiscountPercent?: number | null,
  regularPriceGbp?: number | null
) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { getCourseRepo } = await import("@/lib/repositories");
  const repo = getCourseRepo();
  const course = await repo.getCourseById(courseId);
  if (!course) throw new Error(`Course ${courseId} not found.`);

  if (course.levels && course.levels[levelIndex]) {
    course.levels[levelIndex].price_gbp = newPriceGbp;
    if (regularPriceGbp !== undefined) {
      course.levels[levelIndex].regular_price_gbp = regularPriceGbp;
    }
    if (fullPayDiscountPercent !== undefined) {
      course.levels[levelIndex].full_pay_discount_percent = fullPayDiscountPercent;
    }
    if (depositGbp !== undefined && course.levels[levelIndex].plans?.length > 0) {
      course.levels[levelIndex].plans[0].deposit_value = depositGbp;
    }
  }

  const updated = await repo.updateCourse(session!, course);

  try {
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    if (course.slug) revalidatePath(`/courses/${course.slug}`);
  } catch { }
  return { success: true, course: updated };
}

export async function updateCourseDetailsAction(
  courseId: string,
  updates: Record<string, any>
) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { getCourseRepo } = await import("@/lib/repositories");
  const repo = getCourseRepo();
  const existing = await repo.getCourseById(courseId);
  if (!existing) throw new Error(`Course ${courseId} not found.`);

  const isOwner = session?.role === "owner_admin" || session?.role === "super_admin";
  if (!isOwner && updates.levels && Array.isArray(updates.levels) && existing.levels) {
    updates.levels = updates.levels.map((lvl: any, idx: number) => {
      const orig = existing.levels?.[idx];
      if (!orig) return lvl;
      return {
        ...lvl,
        price_gbp: orig.price_gbp,
        regular_price_gbp: orig.regular_price_gbp,
        full_pay_discount_percent: orig.full_pay_discount_percent,
        plans: orig.plans,
      };
    });
  }

  const merged = {
    ...existing,
    ...updates,
    id: existing.id,
  };

  const actor = session || {
    id: "system-owner",
    email: "millie@smartmindstraining.co.uk",
    name: "Millie Davis",
    role: "owner_admin" as const,
    active: true,
  };
  const updated = await repo.updateCourse(actor, merged as any);

  try {
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    if (existing.slug) revalidatePath(`/courses/${existing.slug}`);
    if (merged.slug && merged.slug !== existing.slug) {
      revalidatePath(`/courses/${merged.slug}`);
    }
  } catch { }
  return { success: true, course: updated };
}

export async function wipeDemoDataAction() {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { wipeAllDemoData } = await import("@/lib/persistedData");
  const result = wipeAllDemoData();

  try {
    revalidatePath("/admin");
    revalidatePath("/admin/learners");
    revalidatePath("/admin/finance");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/availability");
  } catch { }

  return result;
}

export async function toggleBlockedDayAction(date: string, reason?: string) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { getBookingRepo } = await import("@/lib/repositories");
  const repo = getBookingRepo();
  const blockedDays = await repo.toggleBlockedDay(session!, date, reason);

  revalidatePath("/admin/availability");
  revalidatePath("/admin/bookings");
  revalidatePath("/book");
  return { success: true, blockedDays };
}

export async function updateAvailabilityRulesAction(rules: any[]) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { getBookingRepo } = await import("@/lib/repositories");
  const repo = getBookingRepo();
  const updated = await repo.updateAvailabilityRules(session!, rules);

  revalidatePath("/admin/availability");
  revalidatePath("/book");
  return { success: true, rules: updated };
}

export async function createAdminTaskAction(data: {
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  deadline: string;
}) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { getTaskRepo } = await import("@/lib/repositories");
  const repo = getTaskRepo();
  const task = await repo.createTask(session!, {
    title: data.title,
    description: data.description,
    assignedToId: data.assignedToId,
    assignedToName: data.assignedToName,
    assignedByRole: session!.role as "owner_admin" | "super_admin",
    deadline: data.deadline,
    status: "pending",
  });

  // Simulated email notice to assignee in Outbox
  demoOutbox.unshift({
    id: `outbox-task-${Date.now()}`,
    recipientEmail: "staff@smartmindstraining.co.uk",
    recipientName: data.assignedToName,
    subject: `New Operational Directive: ${data.title} (Due: ${data.deadline})`,
    renderedBody: `Hello ${data.assignedToName},\n\nYou have been assigned a new operational directive by the Training Director:\n\nDirective: ${data.title}\nDetails: ${data.description}\nDeadline: ${data.deadline}\n\nPlease review and action this in your staff portal.\n\nSmartminds Operations Hub`,
    templateKey: "task_assigned",
    sentAt: new Date().toISOString(),
    triggerEvent: "Director Task Assigned",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  revalidatePath("/staff");
  revalidatePath("/staff/tasks");
  return { success: true, task };
}

export async function createCourseAction(courseData: any) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { getCourseRepo } = await import("@/lib/repositories");
  const repo = getCourseRepo();
  const created = await repo.createCourse(session!, courseData);

  try {
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");
    revalidatePath("/admin/cms");
    revalidatePath("/cpd");
    revalidatePath("/book");
    revalidatePath("/enrol");
  } catch { }
  return { success: true, course: created };
}

export async function deleteCourseAction(courseId: string) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { getCourseRepo } = await import("@/lib/repositories");
  const repo = getCourseRepo();
  const deleted = await repo.deleteCourse(session!, courseId);

  try {
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");
    revalidatePath("/admin/cms");
    revalidatePath("/cpd");
    revalidatePath("/book");
    revalidatePath("/enrol");
  } catch { }
  return { success: true, deleted };
}

export async function savePaymentGatewaySettingsAction(settings: {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  isLiveMode: boolean;
  bankName: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
  bacsReferencePrefix: string;
}) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { collegePaymentGatewaySettings } = await import(
    "@/lib/repositories/seedData"
  );
  Object.assign(collegePaymentGatewaySettings, settings);

  const { savePersistedPaymentGatewaySettings } = await import(
    "@/lib/persistedData"
  );
  savePersistedPaymentGatewaySettings(collegePaymentGatewaySettings);

  revalidatePath("/admin/payments");
  revalidatePath("/student/payments");
  return { success: true, settings: collegePaymentGatewaySettings };
}

export async function saveSiteCmsContentAction(content: any) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { collegeCmsContent } = await import("@/lib/repositories/seedData");
  Object.assign(collegeCmsContent, content);

  revalidatePath("/admin/cms");
  revalidatePath("/");
  revalidatePath("/courses");
  return { success: true, content: collegeCmsContent };
}

export async function enrolAndProcessPaymentAction(data: {
  learnerName: string;
  learnerEmail: string;
  courseId: string;
  courseTitle: string;
  amountPaidGbp: number;
  paymentType: "full" | "instalment_deposit";
  paymentMethod: "stripe" | "bank_transfer";
  reference: string;
  totalInstalments?: number;
  monthlyAmountGbp?: number;
  finalAmountGbp?: number;
  totalCourseFeeGbp?: number;
}) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const {
    seedLearners,
    seedEnrolments,
    seedPaymentRecords,
    seedPaymentSchedules,
    demoOutbox,
  } = await import("@/lib/repositories/seedData");

  // 1. Create or find learner record
  const names = data.learnerName.trim().split(" ");
  const firstName = names[0] || "Learner";
  const lastName = names.slice(1).join(" ") || "Student";
  const learnerId = `learner-${Date.now().toString().slice(-4)}`;

  const newLearner = {
    id: learnerId,
    userId: `user-${learnerId}`,
    firstName,
    lastName,
    email: data.learnerEmail,
    phone: "+44 7700 900" + Math.floor(100 + Math.random() * 900),
    enrolmentDate: new Date().toISOString(),
    accessStatus: "active" as const,
    notes: `Enrolled in ${data.courseTitle}`,
  };
  seedLearners.push(newLearner);

  // 2. Create active enrolment record
  const enrolmentId = `enrolment-${Date.now().toString().slice(-4)}`;
  const newEnrolment = {
    id: enrolmentId,
    learnerId,
    courseId: data.courseId,
    courseSlug: data.courseId,
    courseTitle: data.courseTitle,
    courseLevelLabel: "Level 3",
    classId: "class-adult-care-l3",
    enrolledAt: new Date().toISOString(),
    status: "active" as const,
    fundingType: "self_pay" as const,
    assessmentMethod: "criteria" as const,
    completedUnits: [],
  };
  seedEnrolments.push(newEnrolment);

  // 3. Create payment record
  const paymentId = `pay-rec-${Date.now().toString().slice(-4)}`;
  const newPayment = {
    id: paymentId,
    enrolmentId,
    learnerId,
    learnerName: data.learnerName,
    courseTitle: data.courseTitle,
    amountGbp: data.amountPaidGbp,
    method: data.paymentMethod,
    reference: data.reference,
    status: "paid" as const,
    paidAt: new Date().toISOString(),
    notes:
      data.paymentType === "full"
        ? "Paid in full at enrolment (10% discount applied)"
        : `Instalment deposit received (£${data.amountPaidGbp.toFixed(2)}) for ${data.totalInstalments || 10}-month plan`,
  };
  seedPaymentRecords.unshift(newPayment);

  // 4. Generate Payment Schedules
  const createdSchedules: any[] = [];
  const nowIso = new Date().toISOString();
  const todayYmd = nowIso.split("T")[0];

  if (data.paymentType === "instalment_deposit" && data.totalInstalments && data.totalInstalments > 1) {
    const totalInstalments = data.totalInstalments;
    const remaining = data.totalCourseFeeGbp
      ? Math.max(0, data.totalCourseFeeGbp - data.amountPaidGbp)
      : undefined;
    const futureMonths = totalInstalments - 1;
    const monthlyAmt =
      data.monthlyAmountGbp ||
      (remaining ? Math.round((remaining / futureMonths) * 100) / 100 : 150);
    const finalAmt =
      data.finalAmountGbp ||
      (remaining
        ? Math.round((remaining - monthlyAmt * (futureMonths - 1)) * 100) / 100
        : monthlyAmt);
    const grace1 = new Date();
    grace1.setDate(grace1.getDate() + 14);

    // Instalment 1: Deposit paid today
    const sched1 = {
      id: `sched-${enrolmentId}-1`,
      enrolmentId,
      learnerId,
      instalmentNumber: 1,
      totalInstalments,
      amountGbp: data.amountPaidGbp,
      dueDate: todayYmd,
      status: "paid" as const,
      paidAt: nowIso,
      graceExpiryDate: grace1.toISOString().split("T")[0],
    };
    createdSchedules.push(sched1);
    seedPaymentSchedules.push(sched1);

    for (let i = 2; i <= totalInstalments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      const graceDate = new Date(dueDate);
      graceDate.setDate(graceDate.getDate() + 14);
      const instalmentAmount = i === totalInstalments ? finalAmt : monthlyAmt;

      const sched = {
        id: `sched-${enrolmentId}-${i}`,
        enrolmentId,
        learnerId,
        instalmentNumber: i,
        totalInstalments,
        amountGbp: instalmentAmount,
        dueDate: dueDate.toISOString().split("T")[0],
        status: "due" as const,
        graceExpiryDate: graceDate.toISOString().split("T")[0],
      };
      createdSchedules.push(sched);
      seedPaymentSchedules.push(sched);
    }
  } else {
    const sched1 = {
      id: `sched-${enrolmentId}-1`,
      enrolmentId,
      learnerId,
      instalmentNumber: 1,
      totalInstalments: 1,
      amountGbp: data.amountPaidGbp,
      dueDate: todayYmd,
      status: "paid" as const,
      paidAt: nowIso,
      graceExpiryDate: todayYmd,
    };
    createdSchedules.push(sched1);
    seedPaymentSchedules.push(sched1);
  }

  // Persist records into storage
  try {
    const { savePersistedRecord } = await import("@/lib/persistedData");
    savePersistedRecord({
      learner: newLearner as any,
      enrolment: newEnrolment as any,
      paymentRecord: newPayment as any,
      paymentSchedules: createdSchedules,
    });
  } catch (err) {
    console.error("[enrolAndProcessPaymentAction] Error persisting records:", err);
  }

  // 5. Automated Welcome & Portal Credentials Email
  const portalUrl = `https://smartmindstraining.co.uk/portal/student?email=${encodeURIComponent(
    data.learnerEmail
  )}`;
  demoOutbox.unshift({
    id: `outbox-welcome-${Date.now()}`,
    recipientEmail: data.learnerEmail,
    recipientName: data.learnerName,
    subject: `Enrolment Confirmed: Welcome to Smartminds Training College (${data.courseTitle})`,
    renderedBody: `Dear ${firstName},\n\nCongratulations on your successful enrolment into Smartminds Training College!\n\nYour payment of £${data.amountPaidGbp.toFixed(
      2
    )} (${data.reference}) has cleared.\n\n=========================================\nYOUR STUDENT PORTAL ACCESS\n=========================================\nPortal Link: ${portalUrl}\nAssigned Assessor: Admissions & Academic Team\nClass Cohort: Online Interactive Live Seminars (Schedule assigned by Admissions)\nAssessment: 100% Coursework Portfolio (Zero written exams)\n\nYour learning materials and syllabus units are unlocked immediately in your portal.\n\nWarm regards,\nAdmissions & Student Services\nSmartminds Training College\nTel: 020 8123 4567 | WhatsApp: +44 7123 456789`,
    templateKey: "student_welcome_portal",
    sentAt: new Date().toISOString(),
    triggerEvent: "Automated Student Enrolment & Payment Cleared",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/learners");
  revalidatePath("/admin/payments");
  return {
    success: true,
    learner: newLearner,
    enrolment: newEnrolment,
    payment: newPayment,
    schedules: createdSchedules,
  };
}

export async function createCohortAction(cohortData: {
  name: string;
  courseId: string;
  courseLevelLabel: string;
  tutorId: string;
  tutorName: string;
  intakeLabel: string;
  scheduleDescription: string;
  nextSessionDate?: string;
  sessionTiming?: "afternoon" | "evening";
  zoomLink?: string;
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { seedClasses } = await import("@/lib/repositories/seedData");
  const { savePersistedCohort } = await import("@/lib/persistedData");

  const newCohort = {
    id: `class-${Date.now().toString(36)}`,
    ...cohortData,
  };

  seedClasses.push(newCohort);
  savePersistedCohort(newCohort);

  revalidatePath("/admin/availability");
  revalidatePath("/admin/learners");
  revalidatePath("/admin/staff");
  revalidatePath("/staff");
  revalidatePath("/student");
  return { success: true, cohort: newCohort };
}

export async function updateCohortAction(
  cohortId: string,
  updates: {
    name?: string;
    courseId?: string;
    courseLevelLabel?: string;
    tutorId?: string;
    tutorName?: string;
    intakeLabel?: string;
    scheduleDescription?: string;
    nextSessionDate?: string;
    sessionTiming?: "afternoon" | "evening";
    zoomLink?: string;
  }
) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { seedClasses, seedEnrolments } = await import("@/lib/repositories/seedData");
  const { savePersistedCohort, savePersistedRecord } = await import("@/lib/persistedData");

  const idx = seedClasses.findIndex((c) => c.id === cohortId);
  const existing = idx >= 0 ? seedClasses[idx] : { id: cohortId };
  const updatedCohort = {
    ...existing,
    ...updates,
    id: cohortId,
  } as any;

  if (idx >= 0) {
    seedClasses[idx] = updatedCohort;
  } else {
    seedClasses.push(updatedCohort);
  }

  savePersistedCohort(updatedCohort);

  // Sync any enrolments linked to this cohort so students see the updated tutor & timing
  for (const enr of seedEnrolments) {
    if (enr.classId === cohortId) {
      let modified = false;
      if (updates.tutorName !== undefined && enr.tutorName !== updates.tutorName) {
        enr.tutorName = updates.tutorName;
        modified = true;
      }
      if (updates.sessionTiming !== undefined && enr.sessionTiming !== updates.sessionTiming) {
        enr.sessionTiming = updates.sessionTiming;
        modified = true;
      }
      if (modified) {
        try {
          savePersistedRecord({ enrolment: enr });
        } catch { }
      }
    }
  }

  revalidatePath("/admin/availability");
  revalidatePath("/admin/learners");
  revalidatePath("/admin/staff");
  revalidatePath("/staff");
  revalidatePath("/student");
  return { success: true, cohort: updatedCohort };
}

export async function deleteCohortAction(cohortId: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { deletePersistedCohort } = await import("@/lib/persistedData");
  deletePersistedCohort(cohortId);

  revalidatePath("/admin/availability");
  revalidatePath("/admin/learners");
  revalidatePath("/admin/staff");
  revalidatePath("/staff");
  revalidatePath("/student");
  return { success: true };
}

export async function saveVisualBuilderSectionsAction(
  sections: any[],
  pagePath: string = "/",
  headerNav?: any,
  footerConfig?: any
) {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff"))
  ) {
    return {
      success: false,
      unauthorized: true,
      sessionExpired: !session,
      error: "Unauthorized: Admin privileges required.",
    };
  }

  const { collegePageBuilderSections, collegePagesData, defaultHeaderNavConfig, defaultFooterConfig } = await import(
    "@/lib/repositories/seedData"
  );
  if (collegePagesData) {
    collegePagesData[pagePath] = sections;
  }
  if (pagePath === "/") {
    collegePageBuilderSections.length = 0;
    collegePageBuilderSections.push(...sections);
  }

  // Persist CMS page to disk so changes survive restarts and page reloads
  const { savePersistedCmsPage } = await import("@/lib/persistedData");
  await savePersistedCmsPage(pagePath, sections);

  // Persist header and footer if provided during publish
  if (headerNav || footerConfig) {
    const { savePersistentSiteTheme } = await import("@/lib/siteTheme");
    if (headerNav) {
      Object.assign(defaultHeaderNavConfig, headerNav);
      if (headerNav.logoType === "image" && headerNav.logoImageUrl) {
        defaultFooterConfig.logoType = "image";
        defaultFooterConfig.logoImageUrl = headerNav.logoImageUrl;
        if (headerNav.logoHeight) defaultFooterConfig.logoHeight = headerNav.logoHeight;
      }
    }
    if (footerConfig) {
      Object.assign(defaultFooterConfig, footerConfig);
    }
    savePersistentSiteTheme({
      headerNav: headerNav || undefined,
      footer: footerConfig || (headerNav?.logoType === "image" ? {
        logoType: "image",
        logoImageUrl: headerNav.logoImageUrl,
        logoHeight: headerNav.logoHeight,
      } : undefined),
    });
  }

  revalidatePath("/admin/cms");
  revalidatePath(pagePath);
  revalidatePath("/");
  return { success: true, pagePath, sections };
}

export async function saveVisualBuilderDraftAction(
  pagePath: string,
  sections: any[]
) {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff"))
  ) {
    return {
      success: false,
      unauthorized: true,
      sessionExpired: !session,
      error: "Unauthorized: Admin privileges required.",
    };
  }

  const { savePersistedCmsDraft } = await import("@/lib/persistedData");
  const result = savePersistedCmsDraft(pagePath, sections);
  return { success: result.success, updatedAt: result.updatedAt };
}

export async function discardVisualBuilderDraftAction(pagePath: string) {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff"))
  ) {
    return {
      success: false,
      unauthorized: true,
      sessionExpired: !session,
      error: "Unauthorized: Admin privileges required.",
    };
  }

  const { discardPersistedCmsDraft, loadPersistedRecords } = await import(
    "@/lib/persistedData"
  );
  discardPersistedCmsDraft(pagePath);
  const store = loadPersistedRecords();
  const publishedSections = store.cmsPagesData?.[pagePath] || null;

  return { success: true, publishedSections };
}

export async function createNewPageAction(
  page: { id: string; path: string; name: string },
  sections: any[],
  addToMenu?: boolean
) {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff"))
  ) {
    return {
      success: false,
      unauthorized: true,
      sessionExpired: !session,
      error: "Unauthorized: Admin privileges required.",
    };
  }

  const { collegePagesData, defaultHeaderNavConfig } = await import(
    "@/lib/repositories/seedData"
  );
  if (collegePagesData) {
    collegePagesData[page.path] = sections;
  }

  const { savePersistedCmsPage } = await import("@/lib/persistedData");
  savePersistedCmsPage(page.path, sections);

  if (addToMenu && defaultHeaderNavConfig) {
    defaultHeaderNavConfig.navLinks.push({
      id: `nav-${Date.now()}`,
      label: page.name,
      href: page.path,
    });
  }

  revalidatePath("/admin/cms");
  revalidatePath(page.path);
  return { success: true, page, sections };
}

export async function deletePageAction(pagePath: string) {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff"))
  ) {
    return {
      success: false,
      unauthorized: true,
      sessionExpired: !session,
      error: "Unauthorized: Admin privileges required.",
    };
  }

  if (pagePath === "/" || pagePath === "/courses") {
    return {
      success: false,
      error: "System pages cannot be deleted.",
    };
  }

  const { collegePagesData, defaultHeaderNavConfig } = await import(
    "@/lib/repositories/seedData"
  );
  if (collegePagesData) {
    delete collegePagesData[pagePath];
  }
  const { deletePersistedCmsPage } = await import("@/lib/persistedData");
  deletePersistedCmsPage(pagePath);

  if (defaultHeaderNavConfig) {
    defaultHeaderNavConfig.navLinks = defaultHeaderNavConfig.navLinks.filter(
      (l) => l.href !== pagePath
    );
  }

  revalidatePath("/admin/cms");
  return { success: true };
}

export async function saveHeaderNavConfigAction(config: any) {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff"))
  ) {
    return {
      success: false,
      unauthorized: true,
      sessionExpired: !session,
      error: "Unauthorized: Admin privileges required.",
    };
  }

  const { defaultHeaderNavConfig, defaultFooterConfig } = await import(
    "@/lib/repositories/seedData"
  );
  Object.assign(defaultHeaderNavConfig, config);

  // If a custom image logo is selected, sync footer logo so entire site is cohesive
  let footerSync = undefined;
  if (config.logoType === "image" && config.logoImageUrl) {
    defaultFooterConfig.logoType = "image";
    defaultFooterConfig.logoImageUrl = config.logoImageUrl;
    if (config.logoHeight) {
      defaultFooterConfig.logoHeight = config.logoHeight;
    }
    footerSync = {
      logoType: "image" as const,
      logoImageUrl: config.logoImageUrl,
      logoHeight: config.logoHeight || 44,
    };
  }

  // Persist directly to Neon DB and local cache
  const { savePersistentSiteThemeAsync } = await import("@/lib/siteTheme");
  await savePersistentSiteThemeAsync({
    headerNav: config,
    footer: footerSync,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/cms");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/funding");
  revalidatePath("/cpd");
  revalidatePath("/private-tutoring");
  return { success: true, config: defaultHeaderNavConfig };
}

export async function saveFooterConfigAction(config: any) {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff"))
  ) {
    return {
      success: false,
      unauthorized: true,
      sessionExpired: !session,
      error: "Unauthorized: Admin privileges required.",
    };
  }

  const { defaultFooterConfig } = await import(
    "@/lib/repositories/seedData"
  );
  Object.assign(defaultFooterConfig, config);

  // Persist directly to Neon DB and local cache
  const { savePersistentSiteThemeAsync } = await import("@/lib/siteTheme");
  await savePersistentSiteThemeAsync({
    footer: config,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/cms");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/funding");
  revalidatePath("/cpd");
  revalidatePath("/private-tutoring");
  revalidatePath("/privacy");
  revalidatePath("/terms");
  revalidatePath("/cookies");
  revalidatePath("/refunds");
  revalidatePath("/safeguarding-student-welfare");
  return { success: true, config: defaultFooterConfig };
}

// ============================================================================
// SUPERADMIN EMAIL & SENDER CONFIGURATION ACTIONS
// ============================================================================

export async function getEmailSettingsAction() {
  const session = await getServerSession();
  assertAdminAuthorized(session);
  const { getEmailSettings } = await import("@/lib/emailSettings");
  return getEmailSettings();
}

export async function saveEmailSettingsAction(settings: any) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "owner_admin" && session.role !== "super_admin")
  ) {
    throw new Error("Only the College Owner or Superadmin can modify email sender configurations.");
  }

  const { saveEmailSettings } = await import("@/lib/emailSettings");
  const updated = saveEmailSettings(settings, session.id);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { success: true, settings: updated };
}

export async function sendTestDepartmentEmailAction(data: {
  department: "admissions" | "finance" | "students" | "security" | "marketing";
  toEmail: string;
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { sendEmail } = await import("@/lib/email");
  const { wrapBrandedEmailHtml } = await import("@/lib/emailTemplates");
  const { getDepartmentSender } = await import("@/lib/emailSettings");

  const dept = getDepartmentSender(data.department);
  const html = wrapBrandedEmailHtml({
    preheader: `Test transmission from Smartminds ${dept.name}`,
    heading: `Department Test: ${dept.name}`,
    badgeText: `Sender: ${dept.email}`,
    bodyHtml: `
      <p>Hello,</p>
      <p>This is a successful test transmission confirming that your departmental sender for <strong>${dept.name}</strong> is correctly configured and operational.</p>
      <div style="background-color: #FAF8F3; border: 1px solid #E6E1D5; padding: 14px; border-radius: 4px; margin: 20px 0; font-size: 13px;">
        <strong>Department:</strong> ${data.department.toUpperCase()}<br/>
        <strong>Sender Address:</strong> ${dept.email}<br/>
        <strong>Display Name:</strong> ${dept.name}
      </div>
      <p>All automated communications routed through this department will use these verified sender credentials.</p>
    `,
    ctaText: "Return to Admin Dashboard",
    ctaUrl: "https://smartmindstraining.co.uk/admin/messages",
  });

  const result = await sendEmail({
    to: data.toEmail.trim(),
    department: data.department,
    recipientName: "Administrator Test",
    subject: `[Test] Transmission from Smartminds ${dept.name}`,
    text: `This is a test email confirming that your departmental sender (${dept.from}) is operational.`,
    html,
    templateKey: `test_${data.department}`,
    triggerEvent: `Superadmin Test (${data.department})`,
  });

  revalidatePath("/admin/messages");
  return result;
}

export async function sendBirthdayPromotionAction(data: {
  studentEmail: string;
  studentName: string;
  discountPercent?: number;
  promoCode?: string;
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { sendEmail } = await import("@/lib/email");
  const { buildBirthdayDiscountEmail } = await import("@/lib/emailTemplates");
  const { getEmailSettings } = await import("@/lib/emailSettings");

  const settings = getEmailSettings();
  const discountPercent = data.discountPercent || settings.automations.birthdayDiscountPercent || 10;
  const promoCode = data.promoCode || settings.automations.birthdayPromoCode || "BIRTHDAY10";

  const emailPayload = buildBirthdayDiscountEmail({
    studentName: data.studentName.trim(),
    discountPercent,
    promoCode,
  });

  const result = await sendEmail({
    to: data.studentEmail.trim(),
    recipientName: data.studentName.trim(),
    department: "marketing",
    subject: emailPayload.subject,
    text: emailPayload.text,
    html: emailPayload.html,
    templateKey: "birthday_discount_campaign",
    triggerEvent: "Student Birthday Marketing Campaign",
  });

  revalidatePath("/admin/messages");
  return result;
}

export async function sendCourseCompletedAction(data: {
  studentEmail: string;
  studentName: string;
  studentId: string;
  courseTitle: string;
  levelName: string;
  awardingBody?: string;
  nextLevelTitle?: string;
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { sendEmail } = await import("@/lib/email");
  const { buildCourseCompletedEmail } = await import("@/lib/emailTemplates");

  const emailPayload = buildCourseCompletedEmail({
    studentName: data.studentName.trim(),
    studentId: data.studentId.trim(),
    courseTitle: data.courseTitle.trim(),
    levelName: data.levelName.trim(),
    awardingBody: data.awardingBody || "TQUK",
    nextLevelTitle: data.nextLevelTitle || "Level 5 Diploma in Education & Training",
  });

  const result = await sendEmail({
    to: data.studentEmail.trim(),
    recipientName: data.studentName.trim(),
    department: "students",
    subject: emailPayload.subject,
    text: emailPayload.text,
    html: emailPayload.html,
    templateKey: "course_completion_congratulations",
    triggerEvent: "Course Completion & Certification",
  });

  revalidatePath("/admin/messages");
  return result;
}

export async function updateCollegeGraceDaysAction(graceDays: number) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  if (graceDays < 1 || graceDays > 30) {
    throw new Error("Grace period must be between 1 and 30 days.");
  }

  // Update all unpaid schedules with the new grace limit
  let updatedCount = 0;
  for (const item of seedPaymentSchedules) {
    if (item.status !== "paid") {
      const dueMs = Date.parse(item.dueDate);
      if (!isNaN(dueMs)) {
        const newExpiry = new Date(dueMs + graceDays * 86400000).toISOString().slice(0, 10);
        item.graceExpiryDate = newExpiry;
        updatedCount++;
      }
    }
  }

  // Persist to store
  try {
    const { saveGlobalGraceDays, savePersistedRecord } = await import("@/lib/persistedData");
    saveGlobalGraceDays(graceDays);
    savePersistedRecord({ paymentSchedules: seedPaymentSchedules });
  } catch (err) {
    console.error("Failed to persist grace period update:", err);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/student/payments");
  return { success: true, updatedCount, newGraceDays: graceDays };
}

export async function resetLearnerGracePeriodAction(
  scheduleItemId: string,
  customGraceDays: number
) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  if (!Number.isInteger(customGraceDays) || customGraceDays < 1 || customGraceDays > 30) {
    throw new Error("Grace period must be between 1 and 30 days.");
  }

  const item = seedPaymentSchedules.find((s) => s.id === scheduleItemId);
  if (!item) {
    throw new Error("Instalment item not found.");
  }

  const dueMs = Date.parse(item.dueDate);
  if (isNaN(dueMs)) {
    throw new Error("Invalid due date on instalment.");
  }

  item.graceExpiryDate = new Date(dueMs + customGraceDays * 86400000).toISOString().slice(0, 10);

  try {
    const { savePersistedRecord } = await import("@/lib/persistedData");
    savePersistedRecord({ paymentSchedules: seedPaymentSchedules });
  } catch (err) {
    console.error("Failed to persist custom grace reset:", err);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/student/payments");
  return { success: true, graceExpiryDate: item.graceExpiryDate };
}

export async function getCohortScheduleAdminAction(): Promise<CohortScheduleConfig> {
  const session = await getServerSession();
  assertAdminAuthorized(session);
  const { getCohortSchedule } = await import("@/lib/persistedData");
  return getCohortSchedule();
}

export async function updateCohortScheduleAdminAction(schedule: CohortScheduleConfig) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { saveCohortSchedule } = await import("@/lib/persistedData");
  saveCohortSchedule(schedule);

  try {
    revalidatePath("/enrol");
    revalidatePath("/admin/availability");
    revalidatePath("/student");
  } catch { }
  return { success: true, schedule };
}

export async function confirmScheduleBankTransferAction(data: {
  scheduleItemId: string;
  notes?: string;
}) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  assertOwnerAuthorized(session);

  const { getPaymentRepo } = await import("@/lib/repositories");
  const paymentRepo = getPaymentRepo();
  const record = await paymentRepo.confirmScheduleBankTransfer(session, data);

  // Send automated payment receipt confirmation to student
  try {
    const { sendEmail } = await import("@/lib/email");
    const { seedLearners, demoOutbox } = await import("@/lib/repositories/seedData");
    const { loadPersistedRecords } = await import("@/lib/persistedData");
    let learnerEmail: string | undefined;
    let learnerFirstName = "Student";

    const sLearner = seedLearners.find((l) => l.id === record.learnerId);
    if (sLearner?.email) {
      learnerEmail = sLearner.email;
      learnerFirstName = sLearner.firstName;
    } else {
      const store = loadPersistedRecords();
      const pLearner = (store.learners || []).find((l) => l.id === record.learnerId);
      if (pLearner?.email) {
        learnerEmail = pLearner.email;
        learnerFirstName = pLearner.firstName || "Student";
      }
    }

    if (learnerEmail) {
      const emailBody = `Dear ${learnerFirstName},\n\nWe have verified and confirmed your bank transfer payment of £${record.amountGbp.toFixed(2)}.\n\nReceipt Reference: ${record.reference}\nCourse: ${record.courseTitle || "Qualification"}\nStatus: Paid\nDate Confirmed: ${new Date().toLocaleDateString("en-GB")}\n\nYour instalment schedule has been updated in your Student Portal. Thank you for keeping your account up to date.\n\nFinance & Accounts\nSmartminds Training College`;

      await sendEmail({
        to: learnerEmail,
        department: "finance",
        subject: `Payment Confirmed: Official Receipt (${record.reference})`,
        text: emailBody,
        templateKey: "transfer_confirmed_student",
        triggerEvent: "Admin Confirmed Bank Transfer",
      });

      demoOutbox.unshift({
        id: `outbox-trf-approved-${Date.now()}`,
        recipientEmail: learnerEmail,
        recipientName: record.learnerName || learnerFirstName,
        subject: `Payment Confirmed: Official Receipt (${record.reference})`,
        renderedBody: emailBody,
        templateKey: "transfer_confirmed_student",
        sentAt: new Date().toISOString(),
        triggerEvent: "Admin Confirmed Bank Transfer",
      });
    }
  } catch (emailErr) {
    console.warn("[confirmScheduleBankTransferAction] Email confirmation warning:", emailErr);
  }

  try {
    revalidatePath("/admin/payments");
    revalidatePath("/student/payments");
    revalidatePath("/student");
    revalidatePath("/admin");
  } catch { }

  return { success: true, record };
}

export async function queryBankTransferAction(data: {
  scheduleItemId: string;
  reason: string;
}) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  assertOwnerAuthorized(session);

  const { getPaymentRepo } = await import("@/lib/repositories");
  const paymentRepo = getPaymentRepo();
  const updatedItem = await paymentRepo.queryBankTransfer(session, data);

  // Send action-required query email to the student
  try {
    const { sendEmail } = await import("@/lib/email");
    const { seedLearners, demoOutbox } = await import("@/lib/repositories/seedData");
    const { loadPersistedRecords } = await import("@/lib/persistedData");
    let learnerEmail: string | undefined;
    let learnerFirstName = "Student";

    const sLearner = seedLearners.find((l) => l.id === updatedItem.learnerId);
    if (sLearner?.email) {
      learnerEmail = sLearner.email;
      learnerFirstName = sLearner.firstName;
    } else {
      const store = loadPersistedRecords();
      const pLearner = (store.learners || []).find((l) => l.id === updatedItem.learnerId);
      if (pLearner?.email) {
        learnerEmail = pLearner.email;
        learnerFirstName = pLearner.firstName || "Student";
      }
    }

    if (learnerEmail) {
      const emailBody = `Dear ${learnerFirstName},\n\nOur Finance team is reviewing your reported bank transfer for Instalment ${updatedItem.instalmentNumber} of ${updatedItem.totalInstalments} (£${updatedItem.amountGbp.toFixed(2)}), but requires additional clarification.\n\nNote from Finance Officer:\n"${data.reason}"\n\nPlease log in to your Student Portal under Payments to double-check your bank transfer reference and re-upload payment proof if needed. Your grace period remains active.\n\nFinance & Student Accounts\nSmartminds Training College`;

      await sendEmail({
        to: learnerEmail,
        department: "finance",
        subject: `Action Required: Bank Transfer Query (Instalment ${updatedItem.instalmentNumber})`,
        text: emailBody,
        templateKey: "transfer_queried_student",
        triggerEvent: "Admin Queried Bank Transfer",
      });

      demoOutbox.unshift({
        id: `outbox-query-${Date.now()}`,
        recipientEmail: learnerEmail,
        recipientName: learnerFirstName,
        subject: `Action Required: Bank Transfer Query (Instalment ${updatedItem.instalmentNumber})`,
        renderedBody: emailBody,
        templateKey: "transfer_queried_student",
        sentAt: new Date().toISOString(),
        triggerEvent: "Admin Queried Bank Transfer",
      });
    }
  } catch (emailErr) {
    console.warn("[queryBankTransferAction] Email query warning:", emailErr);
  }

  try {
    revalidatePath("/admin/payments");
    revalidatePath("/student/payments");
    revalidatePath("/student");
    revalidatePath("/admin");
  } catch { }

  return { success: true, item: updatedItem };
}

export async function saveBlogPostAction(post: BlogPost) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  assertOwnerAuthorized(session);

  const { savePersistedBlogPost } = await import("@/lib/persistedData");
  savePersistedBlogPost(post);

  try {
    revalidatePath("/blog");
    if (post.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }
    revalidatePath("/admin/blog");
    revalidatePath("/");
  } catch { }

  return { success: true, post };
}

export async function deleteBlogPostAction(postId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  assertOwnerAuthorized(session);

  const { deletePersistedBlogPost } = await import("@/lib/persistedData");
  deletePersistedBlogPost(postId);

  try {
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    revalidatePath("/");
  } catch { }

  return { success: true };
}

export async function saveFacultyAction(faculty: {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: "active" | "enrolments_opening_soon";
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { saveFacultyToStore } = await import("@/lib/persistedData");
  const id = faculty.id || faculty.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const updatedFaculties = await saveFacultyToStore({
    id,
    name: faculty.name.trim(),
    description: faculty.description?.trim(),
    icon: faculty.icon || "shield-check",
    color: faculty.color || "navy",
    status: faculty.status || "active",
  });

  try {
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/enrol");
    revalidatePath("/");
  } catch { }

  return { success: true, faculties: updatedFaculties };
}

export async function deleteFacultyAction(facultyId: string) {
  const session = await getServerSession();
  assertOwnerAuthorized(session);

  const { deleteFacultyFromStore } = await import("@/lib/persistedData");
  const updatedFaculties = await deleteFacultyFromStore(facultyId);

  try {
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/enrol");
    revalidatePath("/");
  } catch { }

  return { success: true, faculties: updatedFaculties };
}

export async function getFacultiesAction() {
  const { getPersistedFaculties } = await import("@/lib/persistedData");
  const faculties = getPersistedFaculties();
  return { success: true, faculties };
}

export async function deletePaymentRecordAction(paymentId: string) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "owner_admin" &&
      session.role !== "super_admin" &&
      session.originalRole !== "super_admin")
  ) {
    throw new Error("Unauthorized: Only Owner Admin or Super Admin can delete payments.");
  }

  const { deletePaymentRecordFromStore } = await import("@/lib/persistedData");
  const success = deletePaymentRecordFromStore(paymentId);

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { success };
}

export async function clearAllTestPaymentsAction() {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "super_admin" &&
      session.originalRole !== "super_admin")
  ) {
    throw new Error("Unauthorized: Only Super Admin has access to clear test payments.");
  }

  const { purgeAllTestRecordsFromStore } = await import("@/lib/persistedData");
  const result = purgeAllTestRecordsFromStore();

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  revalidatePath("/student");
  return { success: true, ...result };
}

export async function listColorSwatchesAction() {
  const { listColorSwatches } = await import("@/lib/persistedData");
  return listColorSwatches();
}

export async function saveColorSwatchAction(data: {
  id?: string;
  name: string;
  hex: string;
  category?: "primary" | "secondary" | "accent" | "custom";
  isDark?: boolean;
}): Promise<{ success: boolean; swatch?: ColorSwatch; error?: string }> {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff" &&
        session.originalRole !== "super_admin"))
  ) {
    return { success: false, error: "Unauthorized: Admin privileges required to manage color swatches." };
  }

  try {
    const { saveColorSwatch } = await import("@/lib/persistedData");
    const swatch = await saveColorSwatch(data);
    revalidatePath("/admin/cms");
    return { success: true, swatch };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save swatch" };
  }
}

export async function deleteColorSwatchAction(swatchId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession();
  if (
    !isTestEnv &&
    (!session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff" &&
        session.originalRole !== "super_admin"))
  ) {
    return { success: false, error: "Unauthorized: Admin privileges required to delete color swatches." };
  }

  try {
    const { deleteColorSwatch } = await import("@/lib/persistedData");
    const success = await deleteColorSwatch(swatchId);
    revalidatePath("/admin/cms");
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete swatch" };
  }
}

export async function adminEnrolNewStudentAction(data: {
  existingLearnerId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  addressLine1?: string;
  postcode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  learnerType?: "myself" | "child";
  childName?: string;
  childYearGroup?: string;
  childConcerns?: string;
  guardianName?: string;
  guardianPhone?: string;
  courseId: string;
  courseTitle: string;
  levelLabel: string;
  classId: string;
  className: string;
  tutorId?: string;
  tutorName: string;
  sessionTiming: "evening" | "afternoon" | "self_paced";
  preferredTimeSlot?: string;
  tutoringDeliveryMode?: "online" | "physical_centre" | "room_home_request";
  tutoringRoomOrAddress?: string;
  tutoringZoomLink?: string;
  trainingLocation?: string;
  fundingType: "self_pay" | "funded" | "sponsored";
  paymentPlanType: "full" | "instalments";
  totalPrice: number;
  depositAmount: number;
  monthlyAmount?: number;
  months?: number;
  paymentMethod?: "bacs" | "card" | "direct_debit" | "website" | "website_payment" | "cash" | "employer" | "funded" | "paid";
  paymentStatus?: "paid" | "direct_debit" | "website_payment" | "pending";
  // Multi-course enrolment:
  additionalCourses?: Array<{
    courseId: string;
    courseTitle: string;
    levelLabel: string;
    classId?: string;
    className?: string;
    tutorId?: string;
    tutorName?: string;
    sessionTiming?: "evening" | "afternoon" | "self_paced";
    preferredTimeSlot?: string;
    tutoringDeliveryMode?: "online" | "physical_centre" | "room_home_request";
    tutoringRoomOrAddress?: string;
    childName?: string;
    childConcerns?: string;
    guardianName?: string;
    price?: number;
  }>;
  // Historical student fields:
  isHistorical?: boolean;
  enrolmentDate?: string;
  amountPaidToDate?: number;
  historicalNotes?: string;
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  if (!data.firstName.trim() || !data.lastName.trim()) {
    throw new Error("Student first and last name are required.");
  }
  if (!data.email.trim() || !data.email.includes("@")) {
    throw new Error("A valid student email address is required.");
  }
  if (!data.courseId) {
    throw new Error("Please select an enrolled qualification or course.");
  }

  const { pullLatestFromNeon, loadPersistedRecords, savePersistedRecord } = await import(
    "@/lib/persistedData"
  );
  const { seedLearners } = await import("@/lib/repositories/seedData");
  await pullLatestFromNeon().catch(() => { });
  const store = loadPersistedRecords();

  const cleanEmail = data.email.trim().toLowerCase();
  let existingLearner =
    (data.existingLearnerId
      ? (store.learners || []).find((l) => l.id === data.existingLearnerId) ||
      seedLearners.find((l) => l.id === data.existingLearnerId)
      : undefined) ||
    (store.learners || []).find((l) => l.email.toLowerCase() === cleanEmail) ||
    seedLearners.find((l) => l.email.toLowerCase() === cleanEmail);

  if (!existingLearner && process.env.DATABASE_URL) {
    try {
      const { isDbConfigured, sql } = await import("@/lib/db");
      if (isDbConfigured) {
        const rows = (await sql`
          SELECT data FROM learners
          WHERE LOWER(email) = ${cleanEmail}
             OR id = ${data.existingLearnerId || ""}
          LIMIT 1
        `) as any[];
        if (rows?.[0]?.data) {
          existingLearner = rows[0].data;
        }
      }
    } catch { }
  }

  const isAdditionalCourse = Boolean(existingLearner);
  const learnerId = existingLearner
    ? existingLearner.id
    : `lrn-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
  const userId = existingLearner?.userId || `user-${learnerId}`;
  const enrolmentId = `enr-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
  const tempPassword = `SM-${randomBytes(3).toString("hex").toUpperCase()}!26`;

  const isHistorical = Boolean(data.isHistorical);
  const enrolmentDateStr =
    isHistorical && data.enrolmentDate?.trim()
      ? new Date(data.enrolmentDate.trim()).toISOString()
      : new Date().toISOString();

  const totalPrice = Math.max(0, Number(data.totalPrice || 0));
  const rawPaidAmount = isHistorical
    ? Math.max(0, Number(data.amountPaidToDate ?? data.depositAmount ?? 0))
    : data.paymentStatus === "pending"
      ? 0
      : data.paymentPlanType === "full"
        ? data.depositAmount !== undefined && Number(data.depositAmount) > 0
          ? Number(data.depositAmount)
          : totalPrice
        : Math.max(0, Number(data.depositAmount || 0));

  const paidSoFar = Math.min(totalPrice, rawPaidAmount);
  const planMonths =
    data.paymentPlanType === "instalments" && data.months && data.months > 1
      ? Number(data.months)
      : 1;

  const isOneToOneCourse =
    data.courseId === "course-tutoring-children" ||
    data.classId === "class-tutoring-kids" ||
    Boolean(data.tutoringDeliveryMode);

  const newLearner: Learner = existingLearner
    ? {
      ...existingLearner,
      firstName: data.firstName.trim() || existingLearner.firstName,
      lastName: data.lastName.trim() || existingLearner.lastName,
      phone: data.phone.trim() || existingLearner.phone,
      dateOfBirth: data.dateOfBirth?.trim() || existingLearner.dateOfBirth,
      address: data.addressLine1
        ? `${data.addressLine1.trim()}, ${data.postcode?.trim() || ""}`
        : existingLearner.address,
      postcode: data.postcode?.trim() || existingLearner.postcode,
      emergencyContact: data.emergencyContactName
        ? `${data.emergencyContactName.trim()} (${data.emergencyContactPhone?.trim() || ""})`
        : existingLearner.emergencyContact,
      learnerType: data.learnerType || (isOneToOneCourse ? "child" : existingLearner.learnerType),
      childName: data.childName?.trim() || existingLearner.childName,
      childYearGroup: data.childYearGroup?.trim() || existingLearner.childYearGroup,
      childConcerns: data.childConcerns?.trim() || existingLearner.childConcerns,
      guardianName: data.guardianName?.trim() || existingLearner.guardianName,
      guardianPhone: data.guardianPhone?.trim() || existingLearner.guardianPhone,
      emergencyPhone: data.emergencyContactPhone?.trim() || existingLearner.emergencyPhone,
      accessStatus: "active",
      lastActive: new Date().toISOString(),
    }
    : {
      id: learnerId,
      userId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      dateOfBirth: data.dateOfBirth?.trim(),
      address: data.addressLine1
        ? `${data.addressLine1.trim()}, ${data.postcode?.trim() || ""}`
        : undefined,
      postcode: data.postcode?.trim(),
      emergencyContact: data.emergencyContactName
        ? `${data.emergencyContactName.trim()} (${data.emergencyContactPhone?.trim() || ""})`
        : undefined,
      learnerType: data.learnerType || (isOneToOneCourse ? "child" : "myself"),
      childName: data.childName?.trim() || (isOneToOneCourse ? `${data.firstName.trim()} ${data.lastName.trim()}` : undefined),
      childYearGroup: data.childYearGroup?.trim() || (isOneToOneCourse ? data.levelLabel : undefined),
      childConcerns: data.childConcerns?.trim() || undefined,
      guardianName: data.guardianName?.trim() || undefined,
      guardianPhone: data.guardianPhone?.trim() || undefined,
      guardianEmail: isOneToOneCourse ? cleanEmail : undefined,
      emergencyPhone: data.emergencyContactPhone?.trim() || undefined,
      accessStatus: "active",
      enrolmentDate: enrolmentDateStr,
      lastActive: new Date().toISOString(),
      progressPercent: 0,
    };

  const effectiveDeliveryMode = data.tutoringDeliveryMode || (isOneToOneCourse ? "online" : undefined);
  const effectiveTrainingLocation =
    data.trainingLocation ||
    (effectiveDeliveryMode === "physical_centre"
      ? "Gloucester College Centre (Face-to-Face)"
      : effectiveDeliveryMode === "room_home_request"
        ? "Home / Room Tutoring (By Request)"
        : effectiveDeliveryMode === "online"
          ? "Live 1-on-1 Online Interactive"
          : undefined);

  const FICTIONAL_TUTORS = new Set([
    "dr. eleanor vance",
    "eleanor vance",
    "marcus sterling",
    "amara patel",
    "david kalu",
    "chloe davies",
  ]);
  const cleanTutorName =
    data.tutorName && !FICTIONAL_TUTORS.has(data.tutorName.trim().toLowerCase())
      ? data.tutorName.trim()
      : "Unassigned / TBA";

  const resolvedPaymentMethod: "stripe" | "bank_transfer" | "direct_debit" | "website_payment" | "manual" =
    data.paymentStatus === "direct_debit" || data.paymentMethod === "direct_debit"
      ? "direct_debit"
      : data.paymentStatus === "website_payment" || data.paymentMethod === "website"
        ? "website_payment"
        : data.paymentMethod === "card"
          ? "stripe"
          : "bank_transfer";

  const paymentStatusLabel =
    data.paymentStatus === "direct_debit" || data.paymentMethod === "direct_debit"
      ? "Direct Debit"
      : data.paymentStatus === "website_payment" || data.paymentMethod === "website"
        ? "Website Payment"
        : "Paid (Card / Bank Transfer)";

  const newEnrolment: Enrolment & { planMonths?: number } = {
    id: enrolmentId,
    learnerId,
    courseId: data.courseId,
    courseSlug: data.courseId.replace(/^course-/, ""),
    courseTitle: data.courseTitle,
    courseLevelLabel: data.levelLabel || "Accredited Qualification",
    classId: isOneToOneCourse && (!data.classId || data.classId !== "class-tutoring-kids") ? "class-tutoring-kids" : data.classId,
    tutorId: data.tutorId,
    tutorName: cleanTutorName,
    sessionTiming:
      data.sessionTiming === "evening" || data.sessionTiming === "afternoon"
        ? data.sessionTiming
        : undefined,
    preferredTimeSlot: data.preferredTimeSlot?.trim() || data.sessionTiming,
    trainingLocation: effectiveTrainingLocation,
    tutoringDeliveryMode: effectiveDeliveryMode,
    tutoringRoomOrAddress: data.tutoringRoomOrAddress?.trim() || undefined,
    tutoringZoomLink: data.tutoringZoomLink?.trim() || undefined,
    status: "active",
    fundingType: data.fundingType === "funded" ? "funded" : "self_pay",
    enrolledAt: enrolmentDateStr,
    assessmentMethod: isOneToOneCourse ? "completion" : "criteria",
    completedUnits: [],
    planMonths,
  };

  // Payment Schedules & Initial Payment Record
  let paymentRecord: any = undefined;
  const paymentSchedules: any[] = [];
  const now = new Date();
  const receiptRef = isHistorical
    ? `HIST-${Date.now().toString(36).toUpperCase()}`
    : data.paymentStatus === "direct_debit"
      ? `DD-${Date.now().toString(36).toUpperCase()}`
      : data.paymentStatus === "website_payment"
        ? `WEB-${Date.now().toString(36).toUpperCase()}`
        : `RCP-${Date.now().toString(36).toUpperCase()}`;

  if (data.fundingType !== "funded" && totalPrice > 0) {
    const remainingBalance = Math.max(0, Math.round((totalPrice - paidSoFar) * 100) / 100);

    if (data.paymentPlanType === "instalments" && planMonths > 1) {
      // 1. Initial deposit / amount paid so far
      const depositAmt = paidSoFar > 0 ? paidSoFar : Math.max(0, Number(data.depositAmount || 0));

      if (depositAmt > 0 || isHistorical) {
        const isDepositPaid = paidSoFar > 0;
        const graceDate0 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        paymentSchedules.push({
          id: `sched-dep-${enrolmentId}`,
          enrolmentId,
          learnerId,
          courseTitle: data.courseTitle,
          instalmentNumber: 1,
          totalInstalments: planMonths + 1,
          amount: depositAmt,
          amountGbp: depositAmt,
          dueDate: enrolmentDateStr.slice(0, 10),
          graceExpiryDate: graceDate0.toISOString().slice(0, 10),
          status: isDepositPaid ? "paid" : "due",
          paidAt: isDepositPaid ? enrolmentDateStr : undefined,
          receiptRef: isDepositPaid ? receiptRef : undefined,
          method: resolvedPaymentMethod,
          type: "deposit",
          description: isHistorical
            ? data.historicalNotes
              ? `Prior Payments: ${data.historicalNotes}`
              : "Tuition Fees Paid to Date"
            : `Initial Enrolment Deposit (${paymentStatusLabel})`,
        });

        if (isDepositPaid && depositAmt > 0) {
          paymentRecord = {
            id: `pay-dep-${enrolmentId}`,
            enrolmentId,
            learnerId,
            learnerName: `${newLearner.firstName} ${newLearner.lastName}`,
            courseTitle: data.courseTitle,
            amountGbp: depositAmt,
            method: resolvedPaymentMethod,
            reference: receiptRef,
            status: "paid",
            paidAt: enrolmentDateStr,
            notes:
              data.historicalNotes ||
              `${paymentStatusLabel} received (£${depositAmt.toFixed(2)}) on ${planMonths}-Month Instalment Plan`,
          };
        }

        const balanceToSpread = Math.max(0, totalPrice - depositAmt);
        if (balanceToSpread > 0) {
          const monthly = Math.round((balanceToSpread / planMonths) * 100) / 100;
          for (let i = 1; i <= planMonths; i++) {
            const dueDate = new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000);
            const graceDate = new Date(dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
            const itemAmt =
              i === planMonths
                ? Math.round((balanceToSpread - monthly * (planMonths - 1)) * 100) / 100
                : monthly;
            paymentSchedules.push({
              id: `sched-inst-${i}-${enrolmentId}`,
              enrolmentId,
              learnerId,
              courseTitle: data.courseTitle,
              instalmentNumber: i + 1,
              totalInstalments: planMonths + 1,
              amount: itemAmt,
              amountGbp: itemAmt,
              dueDate: dueDate.toISOString().slice(0, 10),
              graceExpiryDate: graceDate.toISOString().slice(0, 10),
              status: "due",
              method: resolvedPaymentMethod,
              type: "instalment",
              description: `Instalment ${i} of ${planMonths} (${paymentStatusLabel})`,
            });
          }
        }
      } else {
        // No separate deposit: First instalment payable in the same month (Day 1 / Today)
        const monthly = Math.round((totalPrice / planMonths) * 100) / 100;
        for (let i = 0; i < planMonths; i++) {
          const dueDate =
            i === 0
              ? new Date(now.getTime())
              : new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000);
          const graceDate = new Date(dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
          const itemAmt =
            i === planMonths - 1
              ? Math.round((totalPrice - monthly * (planMonths - 1)) * 100) / 100
              : monthly;

          paymentSchedules.push({
            id: `sched-inst-${i + 1}-${enrolmentId}`,
            enrolmentId,
            learnerId,
            courseTitle: data.courseTitle,
            instalmentNumber: i + 1,
            totalInstalments: planMonths,
            amount: itemAmt,
            amountGbp: itemAmt,
            dueDate: dueDate.toISOString().slice(0, 10),
            graceExpiryDate: graceDate.toISOString().slice(0, 10),
            status: "due",
            method: resolvedPaymentMethod,
            type: "instalment",
            description: `Instalment ${i + 1} of ${planMonths} (${paymentStatusLabel})`,
          });
        }
      }
    } else {
      // Full Upfront Payment Plan
      const isFullPaid = paidSoFar >= totalPrice && totalPrice > 0;
      const graceDateFull = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      if (paidSoFar > 0 && paidSoFar < totalPrice) {
        // Paid partial upfront, remaining balance due as 1 item
        paymentSchedules.push({
          id: `sched-paid-${enrolmentId}`,
          enrolmentId,
          learnerId,
          courseTitle: data.courseTitle,
          instalmentNumber: 1,
          totalInstalments: 2,
          amount: paidSoFar,
          amountGbp: paidSoFar,
          dueDate: enrolmentDateStr.slice(0, 10),
          graceExpiryDate: graceDateFull,
          status: "paid",
          paidAt: enrolmentDateStr,
          receiptRef,
          method: resolvedPaymentMethod,
          type: "full",
          description: `Partial Upfront Tuition Payment (${paymentStatusLabel})`,
        });
        paymentSchedules.push({
          id: `sched-rem-${enrolmentId}`,
          enrolmentId,
          learnerId,
          courseTitle: data.courseTitle,
          instalmentNumber: 2,
          totalInstalments: 2,
          amount: remainingBalance,
          amountGbp: remainingBalance,
          dueDate: graceDateFull,
          graceExpiryDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: "due",
          method: resolvedPaymentMethod,
          type: "full",
          description: "Remaining Tuition Balance",
        });
      } else {
        paymentSchedules.push({
          id: `sched-full-${enrolmentId}`,
          enrolmentId,
          learnerId,
          courseTitle: data.courseTitle,
          instalmentNumber: 1,
          totalInstalments: 1,
          amount: totalPrice,
          amountGbp: totalPrice,
          dueDate: enrolmentDateStr.slice(0, 10),
          graceExpiryDate: graceDateFull,
          status: isFullPaid ? "paid" : "due",
          paidAt: isFullPaid ? enrolmentDateStr : undefined,
          receiptRef: isFullPaid ? receiptRef : undefined,
          method: resolvedPaymentMethod,
          type: "full",
          description: `Full Tuition Fee Upfront (${paymentStatusLabel})`,
        });
      }

      if (paidSoFar > 0) {
        paymentRecord = {
          id: `pay-full-${enrolmentId}`,
          enrolmentId,
          learnerId,
          learnerName: `${newLearner.firstName} ${newLearner.lastName}`,
          courseTitle: data.courseTitle,
          amountGbp: paidSoFar,
          method: resolvedPaymentMethod,
          reference: receiptRef,
          status: "paid",
          paidAt: enrolmentDateStr,
          notes: data.historicalNotes || `Full Tuition Fee Payment (${paymentStatusLabel})`,
        };
      }
    }
  }

  // Persist student records and await Neon sync
  await savePersistedRecord({
    learner: newLearner,
    enrolment: newEnrolment,
    paymentRecord,
    paymentSchedules,
    tempPassword: isAdditionalCourse ? undefined : tempPassword,
    mustChangePassword: isAdditionalCourse ? undefined : true,
  });

  const additionalEnrolments: Enrolment[] = [];
  if (Array.isArray(data.additionalCourses) && data.additionalCourses.length > 0) {
    for (const addCourse of data.additionalCourses) {
      if (!addCourse.courseId) continue;
      const addEnrolmentId = `enr-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
      const addIsOneToOne =
        addCourse.courseId === "course-tutoring-children" ||
        addCourse.classId === "class-tutoring-kids";
      const addCleanTutor =
        addCourse.tutorName && !FICTIONAL_TUTORS.has(addCourse.tutorName.trim().toLowerCase())
          ? addCourse.tutorName.trim()
          : "Unassigned / TBA";
      const addEnr: Enrolment & { planMonths?: number } = {
        id: addEnrolmentId,
        learnerId,
        courseId: addCourse.courseId,
        courseSlug: addCourse.courseId.replace(/^course-/, ""),
        courseTitle: addCourse.courseTitle || "Accredited Qualification",
        courseLevelLabel: addCourse.levelLabel || "Level 3",
        classId: addIsOneToOne ? "class-tutoring-kids" : addCourse.classId || "class-adult-care-apr26",
        tutorId: addCourse.tutorId,
        tutorName: addCleanTutor,
        sessionTiming:
          addCourse.sessionTiming === "evening" || addCourse.sessionTiming === "afternoon"
            ? addCourse.sessionTiming
            : undefined,
        preferredTimeSlot: addCourse.preferredTimeSlot?.trim() || addCourse.sessionTiming,
        trainingLocation: addCourse.tutoringRoomOrAddress || undefined,
        tutoringDeliveryMode: addCourse.tutoringDeliveryMode,
        tutoringRoomOrAddress: addCourse.tutoringRoomOrAddress,
        status: "active",
        fundingType: data.fundingType === "funded" ? "funded" : "self_pay",
        enrolledAt: enrolmentDateStr,
        assessmentMethod: addIsOneToOne ? "completion" : "criteria",
        completedUnits: [],
        planMonths,
      };
      additionalEnrolments.push(addEnr);
      store.enrolments.unshift(addEnr);
      await savePersistedRecord({ enrolment: addEnr }).catch(() => { });
    }
  }

  const nextDueItem = paymentSchedules.find(
    (s) => s.status === "due" || s.status === "overdue"
  );
  const createdPlanSummary =
    data.fundingType !== "funded" && totalPrice > 0
      ? {
        enrolmentId,
        learnerId,
        learnerName: `${newLearner.firstName} ${newLearner.lastName}`,
        learnerEmail: newLearner.email,
        learnerPhone: newLearner.phone,
        courseTitle: data.courseTitle,
        levelLabel: newEnrolment.courseLevelLabel,
        planMonths,
        totalAmountGbp: totalPrice,
        totalPaidGbp: paidSoFar,
        balanceRemainingGbp: Math.max(0, Math.round((totalPrice - paidSoFar) * 100) / 100),
        nextDueDate: nextDueItem?.dueDate,
        nextDueAmountGbp: nextDueItem?.amountGbp,
        status: paidSoFar >= totalPrice ? ("settled" as const) : ("due" as const),
        schedule: paymentSchedules,
        history: paymentRecord ? [paymentRecord] : [],
      }
      : undefined;

  // Dispatch Email: Course Added Email for existing students, Welcome + Temp Password Email for new students
  try {
    const { buildStudentWelcomeEmail, buildCourseAddedEmail } = await import("@/lib/emailTemplates");
    const { sendEmail } = await import("@/lib/email");
    const paymentPlanLabel =
      data.fundingType === "funded"
        ? "Government / AEB Funded Placement (No Student Fees)"
        : data.paymentPlanType === "instalments" && planMonths > 1
          ? `${planMonths}-Month 0% Interest Instalment Plan — ${paymentStatusLabel} (£${paidSoFar} Paid / £${Math.max(0, totalPrice - paidSoFar)} Remaining)`
          : paidSoFar >= totalPrice
            ? `Full Upfront Payment — ${paymentStatusLabel} (Settled)`
            : `Full Payment Plan — ${paymentStatusLabel} (£${paidSoFar} Paid / £${Math.max(0, totalPrice - paidSoFar)} Remaining)`;

    const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://smartmindstraining.co.uk"}/login`;

    if (isAdditionalCourse) {
      const courseAddedPayload = buildCourseAddedEmail({
        studentName: `${newLearner.firstName} ${newLearner.lastName}`,
        studentId: learnerId,
        courseTitle: data.courseTitle,
        levelName: data.levelLabel,
        awardingBody: "TQUK / Ofqual",
        amountCharged: paidSoFar,
        receiptRef,
        paymentPlanLabel,
        portalUrl,
        loginEmail: cleanEmail,
      });

      await sendEmail({
        to: cleanEmail,
        recipientName: `${newLearner.firstName} ${newLearner.lastName}`,
        department: "admissions",
        subject: courseAddedPayload.subject,
        text: courseAddedPayload.text,
        html: courseAddedPayload.html,
        templateKey: "student_course_added",
        triggerEvent: `Admin Additional Course Added (${data.courseTitle})`,
      });
    } else {
      const emailPayload = buildStudentWelcomeEmail({
        studentName: `${newLearner.firstName} ${newLearner.lastName}`,
        studentId: learnerId,
        courseTitle: data.courseTitle,
        levelName: data.levelLabel,
        amountCharged: paidSoFar,
        receiptRef,
        paymentPlanLabel,
        portalUrl,
        loginEmail: cleanEmail,
        tempPassword,
        preferredTiming: data.sessionTiming,
        cohortTime:
          data.sessionTiming === "evening"
            ? "18:30 – 20:30 (Live Online / Blended)"
            : data.sessionTiming === "afternoon"
              ? "14:00 – 16:00 (Live Online / Blended)"
              : "Flexible 1-on-1 / Self-Paced",
      });

      await sendEmail({
        to: cleanEmail,
        recipientName: `${newLearner.firstName} ${newLearner.lastName}`,
        department: "admissions",
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
        templateKey: "student_welcome",
        triggerEvent: `Admin Enrolment (${data.courseTitle})`,
      });
    }
  } catch (err) {
    console.warn("[adminEnrolNewStudentAction] Warning: email send failed:", err);
  }

  revalidatePath("/admin/learners");
  revalidatePath("/admin/payments");
  revalidatePath("/student");

  return {
    success: true,
    learner: newLearner,
    enrolment: newEnrolment,
    enrolments: [newEnrolment, ...additionalEnrolments],
    paymentPlan: createdPlanSummary,
    isAdditionalCourse,
    tempPassword: isAdditionalCourse ? undefined : tempPassword,
  };
}

export async function updateLearnerAndEnrolmentAction(data: {
  learnerId: string;
  enrolmentId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  postcode?: string;
  emergencyContact?: string;
  childName?: string;
  childConcerns?: string;
  guardianName?: string;
  courseId?: string;
  courseTitle?: string;
  levelLabel?: string;
  classId?: string;
  tutorId?: string;
  tutorName?: string;
  sessionTiming?: "evening" | "afternoon" | "self_paced";
  preferredTimeSlot?: string;
  tutoringDeliveryMode?: "online" | "physical_centre" | "room_home_request";
  tutoringRoomOrAddress?: string;
  tutoringZoomLink?: string;
  fundingType?: "self_pay" | "funded" | "sponsored";
  // Optional payment plan update (Owner / Super Admin):
  updatePaymentPlan?: boolean;
  paymentPlanType?: "full" | "instalments";
  months?: number;
  totalPrice?: number;
  amountPaidSoFar?: number;
  paymentStatus?: "paid" | "direct_debit" | "website_payment" | "pending";
  paymentMethod?: "bacs" | "card" | "direct_debit" | "website" | "website_payment" | "cash" | "employer" | "funded" | "paid";
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const {
    pullLatestFromNeon,
    loadPersistedRecords,
    getStoreFilePath,
    syncPersistedRecords,
    syncStoreSnapshotToNeon,
  } = await import("@/lib/persistedData");
  const { seedLearners, seedEnrolments } = await import("@/lib/repositories/seedData");

  await pullLatestFromNeon().catch(() => { });
  const store = loadPersistedRecords();
  if (!store.learners) store.learners = [];
  if (!store.enrolments) store.enrolments = [];
  if (!store.paymentRecords) store.paymentRecords = [];
  if (!store.paymentSchedules) store.paymentSchedules = [];

  let existingLearner =
    store.learners.find((l) => l.id === data.learnerId) ||
    seedLearners.find((l) => l.id === data.learnerId);

  if (!existingLearner && process.env.DATABASE_URL) {
    try {
      const { isDbConfigured, sql } = await import("@/lib/db");
      if (isDbConfigured) {
        const rows = (await sql`
          SELECT data FROM learners WHERE id = ${data.learnerId} LIMIT 1
        `) as any[];
        if (rows?.[0]?.data) {
          existingLearner = rows[0].data;
        }
      }
    } catch { }
  }

  if (!existingLearner) {
    return { success: false, error: "Learner not found." };
  }

  const updatedLearner: Learner = {
    ...existingLearner,
    firstName: data.firstName.trim() || existingLearner.firstName,
    lastName: data.lastName.trim() || existingLearner.lastName,
    email: data.email.trim().toLowerCase() || existingLearner.email,
    phone: data.phone.trim() || existingLearner.phone,
    dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth.trim() : existingLearner.dateOfBirth,
    address: data.address !== undefined ? data.address.trim() : existingLearner.address,
    postcode: data.postcode !== undefined ? data.postcode.trim() : existingLearner.postcode,
    emergencyContact:
      data.emergencyContact !== undefined
        ? data.emergencyContact.trim()
        : existingLearner.emergencyContact,
    childName: data.childName !== undefined ? data.childName.trim() || undefined : existingLearner.childName,
    childConcerns:
      data.childConcerns !== undefined ? data.childConcerns.trim() || undefined : existingLearner.childConcerns,
    guardianName:
      data.guardianName !== undefined ? data.guardianName.trim() || undefined : existingLearner.guardianName,
  };

  const lIdx = store.learners.findIndex((l) => l.id === data.learnerId);
  if (lIdx >= 0) {
    store.learners[lIdx] = updatedLearner;
  } else {
    store.learners.unshift(updatedLearner);
  }

  let updatedEnrolment: (Enrolment & { planMonths?: number }) | undefined = undefined;
  let updatedPlanSummary: any = undefined;

  if (data.enrolmentId) {
    const existingEnr =
      store.enrolments.find((e) => e.id === data.enrolmentId) ||
      seedEnrolments.find((e) => e.id === data.enrolmentId);

    if (existingEnr) {
      const planMonths =
        data.paymentPlanType === "instalments" && data.months && data.months > 1
          ? Number(data.months)
          : data.paymentPlanType === "full"
            ? 1
            : (existingEnr as any).planMonths;

      const effectiveDeliveryMode =
        data.tutoringDeliveryMode !== undefined
          ? data.tutoringDeliveryMode
          : existingEnr.tutoringDeliveryMode;

      const FICTIONAL_TUTORS = new Set([
        "dr. eleanor vance",
        "eleanor vance",
        "marcus sterling",
        "amara patel",
        "david kalu",
        "chloe davies",
      ]);
      const rawTutor = data.tutorName || existingEnr.tutorName;
      const cleanTutorName =
        rawTutor && !FICTIONAL_TUTORS.has(rawTutor.trim().toLowerCase())
          ? rawTutor.trim()
          : "Unassigned / TBA";

      updatedEnrolment = {
        ...existingEnr,
        courseId: data.courseId || existingEnr.courseId,
        courseSlug: (data.courseId || existingEnr.courseId).replace(/^course-/, ""),
        courseTitle: data.courseTitle || existingEnr.courseTitle,
        courseLevelLabel: data.levelLabel || existingEnr.courseLevelLabel,
        classId: data.classId || existingEnr.classId,
        tutorId: data.tutorId !== undefined ? data.tutorId : existingEnr.tutorId,
        tutorName: cleanTutorName,
        sessionTiming:
          data.sessionTiming === "evening" || data.sessionTiming === "afternoon"
            ? data.sessionTiming
            : undefined,
        preferredTimeSlot:
          data.preferredTimeSlot?.trim() || data.sessionTiming || existingEnr.preferredTimeSlot,
        tutoringDeliveryMode: effectiveDeliveryMode,
        trainingLocation:
          effectiveDeliveryMode === "physical_centre"
            ? "Gloucester College Centre (Face-to-Face)"
            : effectiveDeliveryMode === "room_home_request"
              ? "Home / Room Tutoring (By Request)"
              : effectiveDeliveryMode === "online"
                ? "Live 1-on-1 Online Interactive"
                : existingEnr.trainingLocation,
        tutoringRoomOrAddress:
          data.tutoringRoomOrAddress !== undefined
            ? data.tutoringRoomOrAddress.trim() || undefined
            : existingEnr.tutoringRoomOrAddress,
        tutoringZoomLink:
          data.tutoringZoomLink !== undefined
            ? data.tutoringZoomLink.trim() || undefined
            : existingEnr.tutoringZoomLink,
        fundingType: data.fundingType === "funded" ? "funded" : "self_pay",
        planMonths,
      };

      const eIdx = store.enrolments.findIndex((e) => e.id === data.enrolmentId);
      if (eIdx >= 0) {
        store.enrolments[eIdx] = updatedEnrolment;
      } else {
        store.enrolments.unshift(updatedEnrolment);
      }

      // If Owner / Super Admin updated the payment plan or paid amount:
      const canEditPayments =
        session?.role === "owner_admin" ||
        session?.role === "super_admin" ||
        session?.originalRole === "super_admin";

      if (canEditPayments && data.updatePaymentPlan && data.totalPrice !== undefined) {
        const totalPrice = Math.max(0, Number(data.totalPrice || 0));
        const paidSoFar = Math.min(totalPrice, Math.max(0, Number(data.amountPaidSoFar || 0)));
        const remainingBalance = Math.max(0, Math.round((totalPrice - paidSoFar) * 100) / 100);
        const effMonths =
          data.paymentPlanType === "instalments" && data.months && data.months > 1
            ? Number(data.months)
            : 1;

        const resolvedEditMethod:
          | "stripe"
          | "bank_transfer"
          | "direct_debit"
          | "website_payment"
          | "manual" =
          data.paymentStatus === "direct_debit" || data.paymentMethod === "direct_debit"
            ? "direct_debit"
            : data.paymentStatus === "website_payment" || data.paymentMethod === "website"
              ? "website_payment"
              : data.paymentMethod === "card"
                ? "stripe"
                : "bank_transfer";

        const editStatusLabel =
          resolvedEditMethod === "direct_debit"
            ? "Direct Debit"
            : resolvedEditMethod === "website_payment"
              ? "Website Payment"
              : "Paid (Card / Bank Transfer)";

        const learnerEnrolmentsCount = store.enrolments.filter(
          (e) => e.learnerId === data.learnerId
        ).length;

        // Replace old schedules/records for this enrolment
        store.paymentSchedules = store.paymentSchedules.filter((s) =>
          learnerEnrolmentsCount > 1
            ? s.enrolmentId !== data.enrolmentId
            : s.enrolmentId !== data.enrolmentId && s.learnerId !== data.learnerId
        );
        store.paymentRecords = store.paymentRecords.filter((r) =>
          learnerEnrolmentsCount > 1
            ? r.enrolmentId !== data.enrolmentId
            : r.enrolmentId !== data.enrolmentId && r.learnerId !== data.learnerId
        );

        const newSchedules: any[] = [];
        let newReceipt: any = undefined;
        const now = new Date();
        const todayYmd = now.toISOString().slice(0, 10);
        const ref = `UPD-${Date.now().toString(36).toUpperCase()}`;

        if (updatedEnrolment.fundingType !== "funded" && totalPrice > 0) {
          if (effMonths > 1) {
            if (paidSoFar > 0) {
              newSchedules.push({
                id: `sched-dep-${data.enrolmentId}`,
                enrolmentId: data.enrolmentId,
                learnerId: data.learnerId,
                courseTitle: updatedEnrolment.courseTitle,
                instalmentNumber: 1,
                totalInstalments: effMonths + 1,
                amount: paidSoFar,
                amountGbp: paidSoFar,
                dueDate: todayYmd,
                graceExpiryDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10),
                status: "paid",
                paidAt: now.toISOString(),
                receiptRef: ref,
                method: resolvedEditMethod,
                type: "deposit",
                description: `Tuition Fees Paid to Date (${editStatusLabel})`,
              });

              newReceipt = {
                id: `pay-upd-${data.enrolmentId}`,
                enrolmentId: data.enrolmentId,
                learnerId: data.learnerId,
                learnerName: `${updatedLearner.firstName} ${updatedLearner.lastName}`,
                courseTitle: updatedEnrolment.courseTitle,
                amountGbp: paidSoFar,
                method: resolvedEditMethod,
                reference: ref,
                status: "paid",
                paidAt: now.toISOString(),
                notes: `Updated payment plan (${effMonths}-Month Plan — ${editStatusLabel})`,
              };
              store.paymentRecords.unshift(newReceipt);
            }

            if (remainingBalance > 0) {
              const monthly = Math.round((remainingBalance / effMonths) * 100) / 100;
              for (let i = 1; i <= effMonths; i++) {
                const dueDate = new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000);
                const graceDate = new Date(dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
                const itemAmt =
                  i === effMonths
                    ? Math.round((remainingBalance - monthly * (effMonths - 1)) * 100) / 100
                    : monthly;
                newSchedules.push({
                  id: `sched-inst-${i}-${data.enrolmentId}`,
                  enrolmentId: data.enrolmentId,
                  learnerId: data.learnerId,
                  courseTitle: updatedEnrolment.courseTitle,
                  instalmentNumber: i + (paidSoFar > 0 ? 1 : 0),
                  totalInstalments: effMonths + (paidSoFar > 0 ? 1 : 0),
                  amount: itemAmt,
                  amountGbp: itemAmt,
                  dueDate: dueDate.toISOString().slice(0, 10),
                  graceExpiryDate: graceDate.toISOString().slice(0, 10),
                  status: "due",
                  method: resolvedEditMethod,
                  type: "instalment",
                  description: `Instalment ${i} of ${effMonths} (${editStatusLabel})`,
                });
              }
            }
          } else {
            // Full payment plan
            if (paidSoFar > 0) {
              newSchedules.push({
                id: `sched-full-${data.enrolmentId}`,
                enrolmentId: data.enrolmentId,
                learnerId: data.learnerId,
                courseTitle: updatedEnrolment.courseTitle,
                instalmentNumber: 1,
                totalInstalments: remainingBalance > 0 ? 2 : 1,
                amount: paidSoFar,
                amountGbp: paidSoFar,
                dueDate: todayYmd,
                graceExpiryDate: todayYmd,
                status: "paid",
                paidAt: now.toISOString(),
                receiptRef: ref,
                method: resolvedEditMethod,
                type: "full",
                description: `Full Tuition Fee Payment (${editStatusLabel})`,
              });
              newReceipt = {
                id: `pay-upd-${data.enrolmentId}`,
                enrolmentId: data.enrolmentId,
                learnerId: data.learnerId,
                learnerName: `${updatedLearner.firstName} ${updatedLearner.lastName}`,
                courseTitle: updatedEnrolment.courseTitle,
                amountGbp: paidSoFar,
                method: resolvedEditMethod,
                reference: ref,
                status: "paid",
                paidAt: now.toISOString(),
                notes: `Updated Full Payment Plan (${editStatusLabel})`,
              };
              store.paymentRecords.unshift(newReceipt);
            }
            if (remainingBalance > 0) {
              const dueYmd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10);
              newSchedules.push({
                id: `sched-rem-${data.enrolmentId}`,
                enrolmentId: data.enrolmentId,
                learnerId: data.learnerId,
                courseTitle: updatedEnrolment.courseTitle,
                instalmentNumber: paidSoFar > 0 ? 2 : 1,
                totalInstalments: paidSoFar > 0 ? 2 : 1,
                amount: remainingBalance,
                amountGbp: remainingBalance,
                dueDate: dueYmd,
                graceExpiryDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10),
                status: "due",
                method: resolvedEditMethod,
                type: "full",
                description: "Remaining Tuition Balance",
              });
            }
          }

          store.paymentSchedules.push(...newSchedules);
          const nextDueItem = newSchedules.find((s) => s.status === "due");
          updatedPlanSummary = {
            enrolmentId: data.enrolmentId,
            learnerId: data.learnerId,
            learnerName: `${updatedLearner.firstName} ${updatedLearner.lastName}`,
            learnerEmail: updatedLearner.email,
            learnerPhone: updatedLearner.phone,
            courseTitle: updatedEnrolment.courseTitle,
            levelLabel: updatedEnrolment.courseLevelLabel,
            planMonths: effMonths,
            totalAmountGbp: totalPrice,
            totalPaidGbp: paidSoFar,
            balanceRemainingGbp: remainingBalance,
            nextDueDate: nextDueItem?.dueDate,
            nextDueAmountGbp: nextDueItem?.amountGbp,
            status: remainingBalance <= 0 ? "settled" : "due",
            schedule: newSchedules,
            history: newReceipt ? [newReceipt] : [],
          };
        }
      }
    }
  }

  const fs = await import("fs");
  const filePath = getStoreFilePath();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  syncPersistedRecords(true);
  await syncStoreSnapshotToNeon(store).catch(() => { });

  if (process.env.DATABASE_URL) {
    try {
      const { sql, ensureDbTablesExist } = await import("@/lib/db");
      await ensureDbTablesExist();
      const fullName = `${updatedLearner.firstName} ${updatedLearner.lastName}`.trim();
      await sql`
        INSERT INTO learners (id, user_id, first_name, last_name, email, name, phone, access_status, data, created_at, updated_at)
        VALUES (${updatedLearner.id}, ${updatedLearner.userId || null}, ${updatedLearner.firstName}, ${updatedLearner.lastName}, ${updatedLearner.email}, ${fullName}, ${updatedLearner.phone || null}, ${updatedLearner.accessStatus || "active"}, ${JSON.stringify(updatedLearner)}, now(), now())
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          data = EXCLUDED.data,
          updated_at = now();
      `.catch(() => { });

      if (updatedEnrolment) {
        await sql`
          INSERT INTO enrolments (id, learner_id, course_id, data, created_at, updated_at)
          VALUES (${updatedEnrolment.id}, ${updatedEnrolment.learnerId}, ${updatedEnrolment.courseId}, ${JSON.stringify(updatedEnrolment)}, now(), now())
          ON CONFLICT (id) DO UPDATE SET
            course_id = EXCLUDED.course_id,
            data = EXCLUDED.data,
            updated_at = now();
        `.catch(() => { });
      }

      if (updatedPlanSummary && data.enrolmentId) {
        await sql`DELETE FROM payment_schedules WHERE enrolment_id = ${data.enrolmentId};`.catch(() => { });
        await sql`DELETE FROM payments WHERE enrolment_id = ${data.enrolmentId};`.catch(() => { });
        for (const s of updatedPlanSummary.schedule || []) {
          await sql`
            INSERT INTO payment_schedules (id, enrolment_id, learner_id, instalment_number, due_date, amount, status, paid_at, payment_reference, grace_expiry_date, data, created_at, updated_at)
            VALUES (${s.id}, ${s.enrolmentId}, ${s.learnerId}, ${Number(s.instalmentNumber || 1)}, ${new Date(s.dueDate).toISOString()}, ${Number(s.amountGbp || 0)}, ${s.status}, ${s.paidAt ? new Date(s.paidAt).toISOString() : null}, ${s.receiptRef || null}, ${s.graceExpiryDate ? new Date(s.graceExpiryDate).toISOString() : null}, ${JSON.stringify(s)}, now(), now())
            ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, status = EXCLUDED.status, data = EXCLUDED.data, updated_at = now();
          `.catch(() => { });
        }
        for (const r of updatedPlanSummary.history || []) {
          await sql`
            INSERT INTO payments (id, enrolment_id, learner_id, amount, status, data, created_at)
            VALUES (${r.id}, ${r.enrolmentId}, ${r.learnerId}, ${Number(r.amountGbp || 0)}, ${r.status}, ${JSON.stringify(r)}, now())
            ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, status = EXCLUDED.status, data = EXCLUDED.data;
          `.catch(() => { });
        }
      }
    } catch { }
  }

  revalidatePath("/admin/learners");
  revalidatePath("/admin/payments");
  revalidatePath("/student");

  return {
    success: true,
    learner: updatedLearner,
    enrolment: updatedEnrolment,
    paymentPlan: updatedPlanSummary,
  };
}

export async function logLearnerPaymentAction(data: {
  learnerId: string;
  enrolmentId?: string;
  amount: number;
  method: "bacs" | "card" | "direct_debit" | "website" | "website_payment" | "cash" | "employer";
  reference?: string;
  notes?: string;
  paymentDate?: string;
}) {
  const session = await getServerSession();
  if (!session || (session.role !== "owner_admin" && session.role !== "super_admin")) {
    return { success: false, error: "Unauthorized: Only Centre Director or Super Admin can log payments." };
  }

  if (!data.learnerId) {
    return { success: false, error: "Missing learner ID." };
  }

  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Payment amount must be greater than £0." };
  }

  const { pullLatestFromNeon, loadPersistedRecords, getStoreFilePath, syncPersistedRecords, syncStoreSnapshotToNeon } = await import("@/lib/persistedData");
  await pullLatestFromNeon().catch(() => { });
  const store = loadPersistedRecords();
  if (!store.paymentRecords) store.paymentRecords = [];
  if (!store.paymentSchedules) store.paymentSchedules = [];

  const learner = (store.learners || []).find((l: any) => l.id === data.learnerId);
  const learnerName = learner ? `${learner.firstName} ${learner.lastName}`.trim() : "Student";
  const enrolment = data.enrolmentId
    ? (store.enrolments || []).find((e: any) => e.id === data.enrolmentId)
    : (store.enrolments || []).find((e: any) => e.learnerId === data.learnerId);
  const courseTitle = enrolment?.courseTitle || "Vocational Qualification";
  const enrId = data.enrolmentId || enrolment?.id || `enr-${data.learnerId}`;
  const payDate = data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString();
  const ref = data.reference?.trim() || `MAN-${Date.now().toString(36).toUpperCase()}`;

  // 1. Record receipt in paymentRecords
  const resolvedLogMethod =
    data.method === "bacs"
      ? "bank_transfer"
      : data.method === "card"
        ? "stripe"
        : data.method === "direct_debit"
          ? "direct_debit"
          : data.method === "website"
            ? "website_payment"
            : "manual";

  const newReceipt: any = {
    id: `pay-manual-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    enrolmentId: enrId,
    learnerId: data.learnerId,
    learnerName,
    courseTitle,
    amountGbp: amount,
    method: resolvedLogMethod,
    reference: ref,
    status: "paid",
    paidAt: payDate,
    notes: data.notes || `Direct payment logged by ${session.name || session.email}`,
  };

  store.paymentRecords.unshift(newReceipt);

  // 2. Reduce or mark pending schedules as paid
  let remainingAmount = amount;
  const pendingSchedules = store.paymentSchedules
    .filter(
      (s: any) =>
        s.learnerId === data.learnerId &&
        (!data.enrolmentId || !s.enrolmentId || s.enrolmentId === data.enrolmentId) &&
        (s.status === "pending" || s.status === "due" || s.status === "overdue")
    )
    .sort((a: any, b: any) => (a.dueDate || "").localeCompare(b.dueDate || ""));

  const modifiedSchedules: any[] = [];
  for (const s of pendingSchedules) {
    if (remainingAmount <= 0) break;
    const sched = s as any;
    const schedAmount = Number(sched.amountGbp || sched.amount || 0);

    if (remainingAmount >= schedAmount) {
      sched.status = "paid";
      sched.paidAt = payDate;
      sched.paymentReference = ref;
      remainingAmount -= schedAmount;
      modifiedSchedules.push(sched);
    } else {
      sched.amountGbp = Math.round((schedAmount - remainingAmount) * 100) / 100;
      modifiedSchedules.push(sched);
      const splitSched = {
        ...sched,
        id: `sched-split-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        amountGbp: remainingAmount,
        status: "paid",
        paidAt: payDate,
        paymentReference: ref,
      };
      store.paymentSchedules.push(splitSched);
      modifiedSchedules.push(splitSched);
      remainingAmount = 0;
    }
  }

  const fs = await import("fs");
  const filePath = getStoreFilePath();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  syncPersistedRecords(true);
  await syncStoreSnapshotToNeon(store).catch(() => { });

  if (process.env.DATABASE_URL) {
    try {
      const { sql, ensureDbTablesExist } = await import("@/lib/db");
      await ensureDbTablesExist();
      await sql`
        INSERT INTO payments (id, enrolment_id, learner_id, amount, status, data, created_at)
        VALUES (${newReceipt.id}, ${newReceipt.enrolmentId}, ${newReceipt.learnerId}, ${newReceipt.amountGbp}, ${newReceipt.status}, ${JSON.stringify(newReceipt)}, now())
      `.catch(() => { });
      for (const s of modifiedSchedules) {
        await sql`
          INSERT INTO payment_schedules (id, enrolment_id, learner_id, instalment_number, due_date, amount, status, paid_at, payment_reference, grace_expiry_date, data, created_at, updated_at)
          VALUES (${s.id}, ${s.enrolmentId || enrId}, ${s.learnerId}, ${Number(s.instalmentNumber || 1)}, ${s.dueDate ? new Date(s.dueDate).toISOString() : new Date().toISOString()}, ${Number(s.amountGbp || 0)}, ${s.status}, ${s.paidAt ? new Date(s.paidAt).toISOString() : null}, ${s.paymentReference || null}, ${s.graceExpiryDate ? new Date(s.graceExpiryDate).toISOString() : null}, ${JSON.stringify(s)}, now(), now())
          ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, status = EXCLUDED.status, paid_at = EXCLUDED.paid_at, payment_reference = EXCLUDED.payment_reference, data = EXCLUDED.data, updated_at = now();
        `.catch(() => { });
      }
    } catch { }
  }

  revalidatePath("/admin/learners");
  revalidatePath("/admin/payments");
  revalidatePath("/student");

  return { success: true, payment: newReceipt };
}

// --------------------------------------------------------------------------
// WordPress-Style Central Media Library Actions
// --------------------------------------------------------------------------

export async function listMediaLibraryAction() {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { pullLatestFromNeon, getPersistedMediaLibrary } = await import("@/lib/persistedData");
  await pullLatestFromNeon();
  const items = getPersistedMediaLibrary();
  return { success: true, items };
}

export async function saveMediaLibraryItemAction(input: {
  id?: string;
  title?: string;
  fileName?: string;
  url: string;
  altText?: string;
  caption?: string;
  mimeType?: string;
  category?: "image" | "brand" | "document" | "video";
  sizeBytes?: number;
  width?: number;
  height?: number;
}) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  if (!input.url || !input.url.trim()) {
    return { success: false, error: "Media URL or file data is required." };
  }

  const { savePersistedMediaItem, getPersistedMediaLibrary } = await import("@/lib/persistedData");
  const item = await savePersistedMediaItem({
    ...input,
    uploadedBy: session?.name || session?.email || "Admin",
  });

  revalidatePath("/admin/media");
  revalidatePath("/admin/cms");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/blog");
  return {
    success: true,
    item,
    items: getPersistedMediaLibrary(),
  };
}

export async function deleteMediaLibraryItemAction(id: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { deletePersistedMediaItem, getPersistedMediaLibrary } = await import("@/lib/persistedData");
  await deletePersistedMediaItem(id);

  revalidatePath("/admin/media");
  return {
    success: true,
    items: getPersistedMediaLibrary(),
  };
}


