"use server";

import { getServerSession } from "@/lib/session";
import {
  seedClasses,
  seedSessions,
  seedAssignments,
  seedSubmissions,
  seedEnrolments,
  seedLearners,
  demoOutbox,
} from "@/lib/repositories/seedData";
import { getTaskRepo } from "@/lib/repositories";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/baseUrl";
import {
  buildZoomClassScheduledEmail,
  buildZoomClassReminderEmail,
  buildZoomClassRecordingReadyEmail,
} from "@/lib/emailTemplates";

import {
  savePersistedCohort,
  savePersistedClassSession,
  saveLearningMaterial,
  deleteLearningMaterial,
} from "@/lib/persistedData";
import { createZoomMeetingForClass, isZoomConfigured } from "@/lib/zoom";
import { getCloudflareStreamAdminDownloadUrl } from "@/lib/cloudflareStream";

// In-memory attendance map: `${sessionId}_${learnerId}` -> boolean
const sessionAttendance: Record<string, boolean> = {};

export async function updateSessionScheduleAction(
  sessionId: string,
  data: {
    scheduledAt?: string;
    zoomLink?: string;
    title?: string;
    recordingUrl?: string;
    updateCohortRecurringLink?: boolean;
    updateReason?: string;
  }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "tutor" && session.role !== "owner_admin" && session.role !== "super_admin")) {
    throw new Error("Unauthorized: Tutor session required.");
  }

  const s = seedSessions.find((item) => item.id === sessionId);
  if (!s) throw new Error(`Session ${sessionId} not found.`);

  if (data.scheduledAt) s.scheduledAt = data.scheduledAt;
  if (data.zoomLink !== undefined) s.zoomLink = data.zoomLink;
  if (data.title) s.title = data.title;
  if (data.recordingUrl !== undefined) s.recordingUrl = data.recordingUrl;

  const cls = seedClasses.find((c) => c.id === s.classId);

  // If recurring link update requested, update the cohort's recurring Zoom link
  if (data.updateCohortRecurringLink && data.zoomLink && cls) {
    cls.zoomLink = data.zoomLink;
    savePersistedCohort(cls);
  }

  // Persist session to disk
  savePersistedClassSession(s);

  // Automatically inform College Admin / Leadership of schedule adjustment
  if (data.updateReason) {
    try {
      const taskRepo = getTaskRepo();
      await taskRepo.createTask(session, {
        title: `Cohort Timetable Update: ${cls?.name || s.title}`,
        description: `Tutor ${cls?.tutorName || session.name} updated timetable/link. Reason: ${data.updateReason}`,
        assignedToId: "user-admin-001",
        assignedToName: "College Administration",
        assignedByRole: "owner_admin",
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        status: "pending",
      });
    } catch (taskErr) {
      console.warn("[Admin alert creation warning]:", taskErr);
    }
  }

  // If a recording was attached, dispatch recording notifications
  if (data.recordingUrl && data.recordingUrl.trim().length > 0) {
    await updateSessionRecordingAction(sessionId, data.recordingUrl);
  }

  // Trigger automated email dispatch to all enrolled learners in this cohort
  const classEnrolments = seedEnrolments.filter((e) => e.classId === s.classId);
  const baseUrl = getBaseUrl();

  const formattedDate = new Date(s.scheduledAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(s.scheduledAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  for (const enr of classEnrolments) {
    const learner = seedLearners.find((l) => l.id === enr.learnerId);
    if (learner) {
      const emailPayload = buildZoomClassScheduledEmail({
        studentName: `${learner.firstName} ${learner.lastName}`,
        courseTitle: cls?.name || "Accredited Programme",
        sessionTitle: s.title,
        scheduledDate: formattedDate,
        scheduledTime: formattedTime,
        tutorName: cls?.tutorName || session.name || "Dr. Eleanor Vance",
        portalUrl: `${baseUrl}/student`,
      });

      // Dispatch via central email service
      await sendEmail({
        to: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        department: "students",
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
        templateKey: "zoom_class_scheduled",
        triggerEvent: "Tutor Live Zoom Class Scheduled",
      });

      // Record in system outbox
      demoOutbox.unshift({
        id: `outbox-zoom-${Date.now()}-${learner.id}`,
        recipientEmail: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        subject: emailPayload.subject,
        renderedBody: emailPayload.text,
        templateKey: "zoom_class_scheduled",
        sentAt: new Date().toISOString(),
        triggerEvent: "Tutor Live Zoom Class Notification",
      });
    }
  }

  revalidatePath("/staff");
  revalidatePath(`/staff/classes/${s.classId}`);
  revalidatePath("/student");
  return { success: true, notifiedCount: classEnrolments.length };
}

export async function updateSessionRecordingAction(
  sessionId: string,
  recordingUrl: string
) {
  const session = await getServerSession();
  if (!session || (session.role !== "tutor" && session.role !== "owner_admin" && session.role !== "super_admin")) {
    throw new Error("Unauthorized: Tutor session required.");
  }

  const s = seedSessions.find((item) => item.id === sessionId);
  if (!s) throw new Error(`Session ${sessionId} not found.`);

  s.recordingUrl = recordingUrl;

  // Dispatch immediate recording ready email to enrolled cohort learners
  const cls = seedClasses.find((c) => c.id === s.classId);
  const classEnrolments = seedEnrolments.filter((e) => e.classId === s.classId);
  const baseUrl = getBaseUrl();

  const formattedDate = new Date(s.scheduledAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  for (const enr of classEnrolments) {
    const learner = seedLearners.find((l) => l.id === enr.learnerId);
    if (learner) {
      const emailPayload = buildZoomClassRecordingReadyEmail({
        studentName: `${learner.firstName} ${learner.lastName}`,
        courseTitle: cls?.name || "Accredited Programme",
        sessionTitle: s.title,
        sessionDate: formattedDate,
        tutorName: cls?.tutorName || session.name || "Dr. Eleanor Vance",
        recordingsUrl: `${baseUrl}/student/recordings`,
      });

      await sendEmail({
        to: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        department: "students",
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
        templateKey: "zoom_class_recording_ready",
        triggerEvent: "Class Session Recording Ready",
      });

      demoOutbox.unshift({
        id: `outbox-rec-${Date.now()}-${learner.id}`,
        recipientEmail: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        subject: emailPayload.subject,
        renderedBody: emailPayload.text,
        templateKey: "zoom_class_recording_ready",
        sentAt: new Date().toISOString(),
        triggerEvent: "Catch-up Class Recording Published",
      });
    }
  }

  revalidatePath("/staff/recordings");
  revalidatePath("/student/recordings");
  return { success: true, notifiedCount: classEnrolments.length };
}

export async function sendClassSessionReminderAction(sessionId: string) {
  const session = await getServerSession();
  if (!session || (session.role !== "tutor" && session.role !== "owner_admin" && session.role !== "super_admin")) {
    throw new Error("Unauthorized: Tutor session required.");
  }

  const s = seedSessions.find((item) => item.id === sessionId);
  if (!s) throw new Error(`Session ${sessionId} not found.`);

  const cls = seedClasses.find((c) => c.id === s.classId);
  const classEnrolments = seedEnrolments.filter((e) => e.classId === s.classId);
  const baseUrl = getBaseUrl();

  const formattedTime = new Date(s.scheduledAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  for (const enr of classEnrolments) {
    const learner = seedLearners.find((l) => l.id === enr.learnerId);
    if (learner) {
      const emailPayload = buildZoomClassReminderEmail({
        studentName: `${learner.firstName} ${learner.lastName}`,
        courseTitle: cls?.name || "Accredited Programme",
        sessionTitle: s.title,
        scheduledTime: formattedTime,
        tutorName: cls?.tutorName || session.name || "Dr. Eleanor Vance",
        zoomLink: s.zoomLink,
        portalUrl: `${baseUrl}/student`,
      });

      await sendEmail({
        to: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        department: "students",
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
        templateKey: "zoom_class_20min_reminder",
        triggerEvent: "20-Minute Live Zoom Class Reminder",
      });

      demoOutbox.unshift({
        id: `outbox-remind-${Date.now()}-${learner.id}`,
        recipientEmail: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        subject: emailPayload.subject,
        renderedBody: emailPayload.text,
        templateKey: "zoom_class_20min_reminder",
        sentAt: new Date().toISOString(),
        triggerEvent: "20-Min Live Class Reminder",
      });
    }
  }

  return { success: true, remindedCount: classEnrolments.length };
}

export async function toggleAttendanceAction(
  sessionId: string,
  learnerId: string,
  present: boolean
) {
  const session = await getServerSession();
  if (!session || (session.role !== "tutor" && session.role !== "owner_admin" && session.role !== "super_admin")) {
    throw new Error("Unauthorized: Tutor session required.");
  }

  const key = `${sessionId}_${learnerId}`;
  sessionAttendance[key] = present;

  return { success: true, present };
}

export async function createAssignmentAction(data: {
  classId: string;
  unitCode: string;
  title: string;
  instructions: string;
  deadline: string;
}) {
  const session = await getServerSession();
  if (!session || (session.role !== "tutor" && session.role !== "owner_admin" && session.role !== "super_admin")) {
    throw new Error("Unauthorized: Tutor session required.");
  }

  const tutorId = session.tutorId || "tutor-001";
  const cls = seedClasses.find((c) => c.id === data.classId);
  if (!cls) throw new Error(`Cohort ${data.classId} not found.`);

  const newAssignment = {
    id: `assign-demo-${Date.now()}`,
    classId: data.classId,
    tutorId,
    unitCode: data.unitCode,
    title: data.title,
    instructions: data.instructions,
    deadline: data.deadline,
    createdAt: new Date().toISOString(),
  };

  seedAssignments.push(newAssignment);

  // Trigger simulated email notifications to all enrolled learners in this cohort
  const classEnrolments = seedEnrolments.filter((e) => e.classId === data.classId);
  for (const enr of classEnrolments) {
    const learner = seedLearners.find((l) => l.id === enr.learnerId);
    if (learner) {
      demoOutbox.unshift({
        id: `outbox-${Date.now()}-${learner.id}`,
        recipientEmail: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        subject: `New Assignment Brief: ${data.title} (${data.unitCode})`,
        renderedBody: `Dear ${learner.firstName},\n\nA new coursework brief has been published for ${cls.name}.\n\nUnit: ${data.unitCode}\nTitle: ${data.title}\nDeadline: ${data.deadline}\n\nPlease review instructions and submit your work through your student portal.`,
        templateKey: "assignment_due_reminder",
        sentAt: new Date().toISOString(),
        triggerEvent: "Assignment Publication",
      });
    }
  }

  revalidatePath("/staff");
  revalidatePath("/staff/assignments");
  revalidatePath("/student/assignments");
  return { success: true, assignmentId: newAssignment.id };
}

export async function remindNotSubmittedAction(
  assignmentId: string,
  learnerId: string
) {
  const session = await getServerSession();
  if (!session || (session.role !== "tutor" && session.role !== "owner_admin" && session.role !== "super_admin")) {
    throw new Error("Unauthorized: Tutor session required.");
  }

  const assignment = seedAssignments.find((a) => a.id === assignmentId);
  const learner = seedLearners.find((l) => l.id === learnerId);
  if (!assignment || !learner) {
    throw new Error("Invalid assignment or learner reference.");
  }

  demoOutbox.unshift({
    id: `outbox-remind-${Date.now()}`,
    recipientEmail: learner.email,
    recipientName: `${learner.firstName} ${learner.lastName}`,
    subject: `Reminder: Coursework submission due for ${assignment.title}`,
    renderedBody: `Dear ${learner.firstName},\n\nThis is a notification from your course tutor regarding ${assignment.title} (${assignment.unitCode}).\n\nYour coursework has not yet been received. The submission deadline is ${new Date(assignment.deadline).toLocaleDateString("en-GB")}. Please log in to your student portal and upload your submission file.`,
    templateKey: "assignment_due_reminder",
    sentAt: new Date().toISOString(),
    triggerEvent: "Tutor Manual Reminder",
  });

  return { success: true };
}

export async function markSubmissionAction(
  submissionId: string,
  data: { outcome: "achieved" | "not_yet_achieved"; feedback: string }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "tutor" && session.role !== "owner_admin" && session.role !== "super_admin")) {
    throw new Error("Unauthorized: Tutor session required.");
  }

  const sub = seedSubmissions.find((s) => s.id === submissionId);
  if (!sub) throw new Error(`Submission ${submissionId} not found.`);

  sub.status = "marked";
  sub.outcome = data.outcome;
  sub.feedback = data.feedback;
  sub.markedAt = new Date().toISOString();
  sub.markedByTutorId = session.tutorId || "tutor-001";

  // If achieved, update enrolment completed units
  if (data.outcome === "achieved") {
    const enrolment = seedEnrolments.find((e) => e.learnerId === sub.learnerId);
    if (enrolment && !enrolment.completedUnits.includes(sub.unitCode)) {
      enrolment.completedUnits.push(sub.unitCode);
    }
  }

  revalidatePath("/staff");
  revalidatePath(`/staff/assignments/${sub.assignmentId}`);
  revalidatePath("/student");
  revalidatePath("/student/courses");
  return { success: true };
}

export async function completeTutorTaskAction(taskId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const taskRepo = getTaskRepo();
  await taskRepo.markTaskComplete(session, taskId);

  revalidatePath("/staff");
  revalidatePath("/staff/tasks");
  return { success: true };
}

/**
 * Creates an automated Zoom meeting for a class session using the dual-account pool.
 * Automatically enables cloud recording, generates student join link and tutor start link.
 */
export async function createAutomatedZoomMeetingAction(sessionId: string) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "tutor" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin")
  ) {
    throw new Error("Unauthorized: Staff session required.");
  }

  const s = seedSessions.find((item) => item.id === sessionId);
  if (!s) throw new Error(`Session ${sessionId} not found.`);

  const cls = seedClasses.find((c) => c.id === s.classId);

  if (!isZoomConfigured()) {
    return {
      success: false,
      isConfigured: false,
      message:
        "Zoom API credentials are not yet configured on the server. Please paste a meeting URL manually.",
    };
  }

  const meetingTopic = `${cls?.name || "Smartminds Cohort"} — ${s.title}`;
  const meeting = await createZoomMeetingForClass({
    topic: meetingTopic,
    startTime: s.scheduledAt,
    durationMinutes: s.durationMinutes || 60,
    sessionTiming: cls?.sessionTiming,
  });

  if (!meeting) {
    return {
      success: false,
      isConfigured: true,
      message:
        "Failed to generate Zoom meeting via Zoom API. Please verify account permissions or paste URL manually.",
    };
  }

  // Update session record
  s.zoomLink = meeting.joinUrl;
  savePersistedClassSession(s);

  // Update cohort recurring link if applicable
  if (cls) {
    cls.zoomLink = meeting.joinUrl;
    savePersistedCohort(cls);
  }

  revalidatePath("/staff");
  revalidatePath(`/staff/classes/${s.classId}`);
  revalidatePath("/student");
  revalidatePath("/student/courses");

  return {
    success: true,
    isConfigured: true,
    meetingId: meeting.meetingId,
    joinUrl: meeting.joinUrl,
    startUrl: meeting.startUrl,
    message: `Zoom meeting generated successfully on ${meeting.accountId}. Cloud recording enabled.`,
  };
}

/**
 * Superadmin-only action to generate a direct MP4 backup download link for college archiving.
 */
export async function getRecordingAdminDownloadUrlAction(sessionId: string) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "owner_admin" && session.role !== "super_admin")
  ) {
    throw new Error("Unauthorized: Superadmin access required to download raw archives.");
  }

  const s = seedSessions.find((item) => item.id === sessionId);
  if (!s) throw new Error(`Session ${sessionId} not found.`);

  const streamUid = (s as any).cloudflareStreamUid;

  if (streamUid) {
    const downloadUrl = await getCloudflareStreamAdminDownloadUrl(streamUid);
    if (downloadUrl) {
      return { success: true, downloadUrl };
    }
  }

  // Fallback to recordingUrl
  return {
    success: true,
    downloadUrl: s.recordingUrl || null,
  };
}

export async function saveMaterialAction(data: {
  id?: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "ppt" | "docx" | "link";
  fileSizeBytes?: number;
  cohortId?: string;
  cohortName?: string;
  unitCode?: string;
  published?: boolean;
}) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "tutor" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin")
  ) {
    throw new Error("Unauthorized: Tutor access required to manage materials.");
  }

  const tutorId = session.tutorId || session.id || "user-tutor-eleanor";
  const tutorName = session.name || "Dr. Eleanor Vance";

  let cohortName = data.cohortName;
  if (data.cohortId && !cohortName) {
    const cls = seedClasses.find((c) => c.id === data.cohortId);
    cohortName = cls ? cls.name : "Assigned Cohort";
  }

  const saved = await saveLearningMaterial({
    ...data,
    cohortName,
    tutorId,
    tutorName,
    published: data.published ?? true,
  });

  revalidatePath("/staff/materials");
  revalidatePath("/student/materials");
  revalidatePath("/student");

  return { success: true, material: saved };
}

export async function deleteMaterialAction(materialId: string) {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "tutor" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin")
  ) {
    throw new Error("Unauthorized: Tutor access required to delete materials.");
  }

  const deleted = await deleteLearningMaterial(materialId);

  revalidatePath("/staff/materials");
  revalidatePath("/student/materials");
  revalidatePath("/student");

  return { success: deleted };
}


