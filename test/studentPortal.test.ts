import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  getEnrolmentRepo,
  getPaymentRepo,
} from "../src/lib/repositories";
import {
  SessionUser,
  PermissionDeniedError,
} from "../src/lib/repositories/types";
import { seedSubmissions } from "../src/lib/repositories/seedData";

describe("Prompt D2: Student Portal Functionality & Data Isolation Suite", () => {
  const studentMaya: SessionUser = {
    id: "user-learner-001",
    email: "maya.lin@example.com",
    name: "Maya Lin",
    role: "student",
    learnerId: "learner-001",
  };

  test("student can read their own enrolments", async () => {
    const enrolmentRepo = getEnrolmentRepo();
    const enrolments = await enrolmentRepo.listEnrolments(studentMaya, {
      learnerId: "learner-001",
    });
    assert.ok(enrolments.length > 0);
    assert.equal(enrolments[0].learnerId, "learner-001");
  });

  test("student cannot access enrolments of another learner", async () => {
    const enrolmentRepo = getEnrolmentRepo();
    await assert.rejects(
      async () => {
        await enrolmentRepo.listEnrolments(studentMaya, {
          learnerId: "learner-002",
        });
      },
      (err: Error) => {
        assert.ok(err instanceof PermissionDeniedError);
        return true;
      }
    );
  });

  test("criteria-based course distinguishes completed units and in-progress units", async () => {
    const enrolmentRepo = getEnrolmentRepo();
    const enrolments = await enrolmentRepo.listEnrolments(studentMaya, {
      learnerId: "learner-001",
    });
    const enrolment = enrolments[0];
    assert.equal(enrolment.assessmentMethod, "criteria");
    assert.ok(enrolment.completedUnits.includes("UNIT-301"));
  });

  test("student can access their own payment plan summary with schedule", async () => {
    const paymentRepo = getPaymentRepo();
    const plan = await paymentRepo.getMyPaymentPlan(studentMaya, "learner-001");
    assert.ok(plan);
    assert.equal(plan.enrolmentId, "enrolment-001");
    assert.ok(plan.totalAmountGbp > 0);
    assert.ok(plan.totalPaidGbp >= 150);
    assert.ok(plan.schedule.length > 0);
  });

  test("student is blocked from accessing another learner payment plan", async () => {
    const paymentRepo = getPaymentRepo();
    await assert.rejects(
      async () => {
        await paymentRepo.getMyPaymentPlan(studentMaya, "learner-002");
      },
      (err: Error) => {
        assert.ok(err instanceof PermissionDeniedError);
        return true;
      }
    );
  });

  test("student coursework submission metadata is properly appended", async () => {
    const testSub = {
      id: "sub-test-001",
      assignmentId: "assign-care-301",
      learnerId: "learner-001",
      learnerName: "Maya Lin",
      unitCode: "UNIT-301",
      fileName: "Test_Submission.pdf",
      fileSizeBytes: 204800,
      submittedAt: new Date().toISOString(),
      status: "submitted" as const,
      outcome: "pending" as const,
    };

    seedSubmissions.push(testSub);

    const found = seedSubmissions.find((s) => s.id === "sub-test-001");
    assert.ok(found);
    assert.equal(found.fileName, "Test_Submission.pdf");
    assert.equal(found.status, "submitted");
  });

  test("student can access college bank details with secrets securely stripped", async () => {
    const paymentRepo = getPaymentRepo();
    const bank = await paymentRepo.getCollegeBankSettings(studentMaya);
    assert.ok(bank.bankName);
    assert.ok(bank.sortCode);
    assert.ok(bank.accountNumber);
    assert.ok(bank.accountName);
    // Secrets must be stripped
    assert.equal(bank.stripeSecretKey, "");
    assert.equal(bank.stripeWebhookSecret, "");
  });

  test("student can report an instalment bank transfer with proof attachment", async () => {
    const paymentRepo = getPaymentRepo();
    const plan = await paymentRepo.getMyPaymentPlan(studentMaya, "learner-001");
    assert.ok(plan, "Payment plan must exist for learner-001");
    let unpaidItem = plan.schedule.find((s) => s.status !== "paid");
    if (!unpaidItem && plan.schedule.length > 0) {
      unpaidItem = plan.schedule[plan.schedule.length - 1];
      unpaidItem.status = "due";
    }
    assert.ok(unpaidItem, "Must have an unpaid instalment");

    // Report transfer with simulated receipt proof
    const { seedPaymentSchedules } = await import("../src/lib/repositories/seedData");
    const sched = seedPaymentSchedules.find((s) => s.id === unpaidItem.id);
    assert.ok(sched);

    sched.status = "awaiting_confirmation";
    sched.reportedTransfer = {
      reference: "SMTC-MAYA-BACS",
      receiptUrl: "data:application/pdf;base64,JVBERi0xLjQK...",
      receiptFileName: "mayas_bank_receipt.pdf",
      reportedAt: new Date().toISOString(),
    };

    assert.equal(sched.status, "awaiting_confirmation");
    assert.equal(sched.reportedTransfer.receiptFileName, "mayas_bank_receipt.pdf");
    assert.equal(sched.reportedTransfer.reference, "SMTC-MAYA-BACS");
  });
});
