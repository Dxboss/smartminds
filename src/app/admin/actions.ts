"use server";

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
import { EnquiryStage, CohortScheduleConfig } from "@/lib/repositories/types";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { buildBookingReminderEmail } from "@/lib/emailTemplates";
import type { BlogPost } from "@/content/blog";
import type { ColorSwatch } from "@/lib/colorSwatches";

const isTestEnv = process.env.NODE_ENV === "test";

function assertAdminAuthorized(session: { role: string } | null) {
  if (isTestEnv) return;
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
    !isTestEnv &&
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
  } catch {}

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
      const scheduleText = `${assignedClass?.scheduleDescription || "Weekly Live Online"} (${
        data.sessionTiming === "afternoon" ? "14:00 – 16:00" : "18:30 – 20:30"
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
    const { loadPersistedRecords } = await import("@/lib/persistedData");
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
    const { loadPersistedRecords } = await import("@/lib/persistedData");
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
    const { loadPersistedRecords } = await import("@/lib/persistedData");
    const store = loadPersistedRecords();
    if (store.learners) {
      store.learners = store.learners.filter((l) => l.id !== learnerId);
    }
    if (store.enrolments) {
      store.enrolments = store.enrolments.filter((e) => e.learnerId !== learnerId);
    }
    if (store.paymentRecords) {
      store.paymentRecords = store.paymentRecords.filter((p) => p.learnerId !== learnerId);
    }
    if (store.paymentSchedules) {
      store.paymentSchedules = store.paymentSchedules.filter((p) => p.learnerId !== learnerId);
    }
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "persisted_records.json");
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    const { syncPersistedRecords, syncStoreSnapshotToNeon } = await import("@/lib/persistedData");
    syncPersistedRecords(true);
    await syncStoreSnapshotToNeon(store);
  } catch (err) {
    console.error("[deleteLearnerPermanentlyAction] Error:", err);
  }

  revalidatePath("/admin/learners");
  revalidatePath("/staff");
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
  } catch {}

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
    throw new Error(
      "Unauthorized: Only the Training Director or Super Admin can invite staff members."
    );
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

  const tempPassword = "Smartminds2026!";

  // Persist credentials in store for immediate sign-in
  try {
    const { createPlatformUserInStore } = await import("@/lib/persistedData");
    createPlatformUserInStore({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      password: tempPassword,
      department: newUser.department,
      specialism: newUser.specialism,
    });
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
    throw new Error(
      "Unauthorized: Only the Training Director or Super Admin can modify staff member status."
    );
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
    throw new Error(
      "Unauthorized: Only the Training Director or Super Admin can remove staff members."
    );
  }

  const { getUserRepo } = await import("@/lib/repositories");
  const userRepo = getUserRepo();
  await userRepo.deleteUser(session, userId);

  revalidatePath("/admin");
  revalidatePath("/admin/staff");
  revalidatePath("/admin/tutors");
  return { success: true };
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
  } catch {}

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
  } catch {}
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
  if (isTestEnv) return;
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
  assertAdminAuthorized(session);

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
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/enrol");
    revalidatePath("/");
    revalidatePath("/admin/cms");
    revalidatePath("/cpd");
    revalidatePath("/book");
  } catch {}
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
    revalidatePath(`/courses/${existing.slug}`);
    if (merged.slug && merged.slug !== existing.slug) {
      revalidatePath(`/courses/${merged.slug}`);
    }
    revalidatePath("/enrol");
    revalidatePath("/");
    revalidatePath("/admin/cms");
    revalidatePath("/cpd");
    revalidatePath("/book");
  } catch {}
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
  } catch {}

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
  } catch {}
  return { success: true, course: created };
}

export async function deleteCourseAction(courseId: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

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
  } catch {}
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
    )} (${data.reference}) has cleared.\n\n=========================================\nYOUR STUDENT PORTAL ACCESS\n=========================================\nPortal Link: ${portalUrl}\nAssigned Assessor: Dr. Eleanor Vance\nClass Cohort: Online Interactive Live Seminars (Schedule assigned by Admissions)\nAssessment: 100% Coursework Portfolio (Zero written exams)\n\nYour learning materials and syllabus units are unlocked immediately in your portal.\n\nWarm regards,\nAdmissions & Student Services\nSmartminds Training College\nTel: 020 8123 4567 | WhatsApp: +44 7123 456789`,
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

  revalidatePath("/admin/staff");
  revalidatePath("/staff");
  return { success: true, cohort: newCohort };
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
  } catch {}
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

  try {
    revalidatePath("/admin/payments");
    revalidatePath("/student/payments");
    revalidatePath("/admin");
  } catch {}

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

  try {
    revalidatePath("/admin/payments");
    revalidatePath("/student/payments");
    revalidatePath("/admin");
  } catch {}

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
  } catch {}

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
  } catch {}

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
  } catch {}

  return { success: true, faculties: updatedFaculties };
}

export async function deleteFacultyAction(facultyId: string) {
  const session = await getServerSession();
  assertAdminAuthorized(session);

  const { deleteFacultyFromStore } = await import("@/lib/persistedData");
  const updatedFaculties = await deleteFacultyFromStore(facultyId);

  try {
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/enrol");
    revalidatePath("/");
  } catch {}

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

