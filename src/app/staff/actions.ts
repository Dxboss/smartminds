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

// In-memory attendance map: `${sessionId}_${learnerId}` -> boolean
const sessionAttendance: Record<string, boolean> = {};

export async function updateSessionScheduleAction(
  sessionId: string,
  data: { scheduledAt?: string; zoomLink?: string }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "tutor" && session.role !== "owner_admin" && session.role !== "super_admin")) {
    throw new Error("Unauthorized: Tutor session required.");
  }

  const s = seedSessions.find((item) => item.id === sessionId);
  if (!s) throw new Error(`Session ${sessionId} not found.`);

  if (data.scheduledAt) s.scheduledAt = data.scheduledAt;
  if (data.zoomLink !== undefined) s.zoomLink = data.zoomLink;

  revalidatePath("/staff");
  revalidatePath(`/staff/classes/${s.classId}`);
  return { success: true };
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

  revalidatePath("/staff/recordings");
  revalidatePath("/student/recordings");
  return { success: true };
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
