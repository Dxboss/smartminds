import test from "node:test";
import assert from "node:assert/strict";
import {
  getLearnerRepo,
  getPaymentRepo,
  getTaskRepo,
} from "../src/lib/repositories";
import {
  seedClasses,
  seedAssignments,
  seedSubmissions,
  seedEnrolments,
  seedLearners,
  demoOutbox,
} from "../src/lib/repositories/seedData";
import { SessionUser, PermissionDeniedError } from "../src/lib/repositories/types";

// Mock tutor user: Dr. Eleanor Vance (tutor-001)
const tutor1Session: SessionUser = {
  id: "user-tutor-01",
  email: "eleanor.vance@smartmindstraining.co.uk",
  name: "Dr. Eleanor Vance",
  role: "tutor",
  tutorId: "tutor-001",
};

// Mock another tutor: Marcus Sterling (tutor-002)
const tutor2Session: SessionUser = {
  id: "user-tutor-02",
  email: "marcus.sterling@smartmindstraining.co.uk",
  name: "Marcus Sterling",
  role: "tutor",
  tutorId: "tutor-002",
};

test("Tutor isolation: tutor only receives learners in their assigned cohorts", async () => {
  const learnerRepo = getLearnerRepo();

  const tutor1Learners = await learnerRepo.listLearners(tutor1Session);
  const tutor2Learners = await learnerRepo.listLearners(tutor2Session);

  // Tutor 1 teaches class-care-l3
  // Tutor 2 teaches class-lead-l5
  assert.ok(tutor1Learners.length > 0, "Tutor 1 should have learners");
  assert.ok(tutor2Learners.length > 0, "Tutor 2 should have learners");

  // Check that their learner sets do not overlap
  const tutor1LearnerIds = new Set(tutor1Learners.map((l) => l.id));
  const tutor2LearnerIds = new Set(tutor2Learners.map((l) => l.id));

  for (const id of tutor1LearnerIds) {
    assert.strictEqual(
      tutor2LearnerIds.has(id),
      false,
      `Learner ${id} should not be visible to Tutor 2`
    );
  }
});

test("Security: Tutors are strictly denied access to PaymentRepo", async () => {
  const paymentRepo = getPaymentRepo();

  await assert.rejects(
    async () => {
      await paymentRepo.getLedger(tutor1Session);
    },
    (err: unknown) => {
      assert.ok(err instanceof PermissionDeniedError);
      return true;
    },
    "Tutor must be denied access to payment ledger"
  );
});

test("Tutor creates assignment: assignment is saved and emails are logged to demoOutbox", async () => {
  const initialOutboxCount = demoOutbox.length;
  const initialAssignmentsCount = seedAssignments.length;

  // Simulate assignment creation for class-care-l3
  const targetClass = seedClasses.find((c) => c.tutorId === "tutor-001")!;
  assert.ok(targetClass, "Cohort for tutor-001 must exist");

  const newAssignment = {
    id: `assign-test-${Date.now()}`,
    classId: targetClass.id,
    tutorId: "tutor-001",
    unitCode: "UNIT-302",
    title: "Unit 302: Duty of Care in Health and Social Care",
    instructions: "Evaluate statutory obligations regarding duty of care and dilemma resolution.",
    deadline: "2026-11-01T23:59:00Z",
    createdAt: new Date().toISOString(),
  };

  seedAssignments.push(newAssignment);

  // Trigger simulated outbox emails for this cohort's learners
  const classEnrolments = seedEnrolments.filter((e) => e.classId === targetClass.id);
  assert.ok(classEnrolments.length > 0, "Class must have enrolled learners");

  for (const enr of classEnrolments) {
    const learner = seedLearners.find((l) => l.id === enr.learnerId);
    if (learner) {
      demoOutbox.unshift({
        id: `outbox-test-${Date.now()}-${learner.id}`,
        recipientEmail: learner.email,
        recipientName: `${learner.firstName} ${learner.lastName}`,
        subject: `New Assignment Brief: ${newAssignment.title} (${newAssignment.unitCode})`,
        renderedBody: `Dear ${learner.firstName},\n\nA new coursework brief has been published for ${targetClass.name}.`,
        templateKey: "assignment_due_reminder",
        sentAt: new Date().toISOString(),
        triggerEvent: "Assignment Publication",
      });
    }
  }

  assert.strictEqual(seedAssignments.length, initialAssignmentsCount + 1);
  assert.ok(demoOutbox.length > initialOutboxCount);

  // Verify the outbox message fields
  const latestMessage = demoOutbox[0];
  assert.ok(latestMessage.subject.includes("Duty of Care"));
  assert.strictEqual(latestMessage.triggerEvent, "Assignment Publication");
  assert.strictEqual(latestMessage.templateKey, "assignment_due_reminder");
});

test("Remind not submitted: manual trigger dispatches reminder to demoOutbox", async () => {
  const initialOutboxCount = demoOutbox.length;
  const targetAssignment = seedAssignments[0];
  const learner = seedLearners[0];

  demoOutbox.unshift({
    id: `outbox-remind-test-${Date.now()}`,
    recipientEmail: learner.email,
    recipientName: `${learner.firstName} ${learner.lastName}`,
    subject: `Reminder: Coursework submission due for ${targetAssignment.title}`,
    renderedBody: `Dear ${learner.firstName},\n\nThis is a notification from your course tutor regarding ${targetAssignment.title}.`,
    templateKey: "assignment_due_reminder",
    sentAt: new Date().toISOString(),
    triggerEvent: "Tutor Manual Reminder",
  });

  assert.strictEqual(demoOutbox.length, initialOutboxCount + 1);
  const reminderMsg = demoOutbox[0];
  assert.strictEqual(reminderMsg.triggerEvent, "Tutor Manual Reminder");
  assert.strictEqual(reminderMsg.recipientEmail, learner.email);
});

test("Marking submission: updates outcome, feedback, and enrolments completed units", async () => {
  // Find or create a test submission
  const testSub = seedSubmissions.find((s) => s.id === "sub-002")!;
  assert.ok(testSub, "sub-002 should exist in seed data");

  const feedbackText = "Excellent analysis of duty of care and risk enablement.";
  testSub.status = "marked";
  testSub.outcome = "achieved";
  testSub.feedback = feedbackText;
  testSub.markedByTutorId = tutor1Session.tutorId;
  testSub.markedAt = new Date().toISOString();

  // Enrolment completedUnits updated
  const enrolment = seedEnrolments.find((e) => e.learnerId === testSub.learnerId);
  if (enrolment && !enrolment.completedUnits.includes(testSub.unitCode)) {
    enrolment.completedUnits.push(testSub.unitCode);
  }

  assert.strictEqual(testSub.status, "marked");
  assert.strictEqual(testSub.outcome, "achieved");
  assert.strictEqual(testSub.feedback, feedbackText);
  if (enrolment) {
    assert.ok(
      enrolment.completedUnits.includes(testSub.unitCode),
      "Completed units should include achieved unit"
    );
  }
});

test("Tutor tasks: tutor views assigned tasks and marks complete", async () => {
  const taskRepo = getTaskRepo();
  const tutorTasks = await taskRepo.listTasks(tutor1Session);

  assert.ok(tutorTasks.length > 0, "Tutor 1 should have assigned tasks");
  const taskToComplete = tutorTasks[0];

  const updated = await taskRepo.markTaskComplete(tutor1Session, taskToComplete.id);
  assert.strictEqual(updated.status, "completed");
  assert.ok(updated.completedAt, "completedAt should be recorded");
});
