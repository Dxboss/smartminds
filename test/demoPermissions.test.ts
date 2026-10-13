import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  getLearnerRepo,
  getEnrolmentRepo,
  getPaymentRepo,
  getEntitlementRepo,
} from "../src/lib/repositories";
import {
  PermissionDeniedError,
  SessionUser,
} from "../src/lib/repositories/types";
import { signSession, verifySession } from "../src/lib/session";

describe("Prompt D1: Demo Permissions & Data Layer Security Suite", () => {
  // Test Actors
  const studentMaya: SessionUser = {
    id: "user-learner-001",
    email: "maya.lin@example.com",
    name: "Maya Lin",
    role: "student",
    learnerId: "learner-001",
  };

  const tutorEleanor: SessionUser = {
    id: "user-tutor-01",
    email: "eleanor.vance@smartmindstraining.co.uk",
    name: "Dr. Eleanor Vance",
    role: "tutor",
    tutorId: "tutor-001",
  };

  const adminStaffSarah: SessionUser = {
    id: "user-admin-01",
    email: "sarah.jenkins@smartmindstraining.co.uk",
    name: "Sarah Jenkins",
    role: "admin_staff",
  };

  const ownerKemi: SessionUser = {
    id: "user-owner-01",
    email: "kemi.adeleke@smartmindstraining.co.uk",
    name: "Kemi Adeleke",
    role: "owner_admin",
  };

  const superAdminDev: SessionUser = {
    id: "user-super-01",
    email: "super.admin@smartmindstraining.co.uk",
    name: "Dev Super Admin",
    role: "super_admin",
  };

  // --------------------------------------------------------------------------
  // 1. Student Permissions
  // --------------------------------------------------------------------------
  describe("Student Data Isolation", () => {
    const learnerRepo = getLearnerRepo();

    test("student can read their own learner profile", async () => {
      const self = await learnerRepo.getLearnerById(studentMaya, "learner-001");
      assert.ok(self);
      assert.equal(self.id, "learner-001");
      assert.equal(self.firstName, "Maya");
    });

    test("student cannot read another learner profile", async () => {
      await assert.rejects(
        async () => {
          await learnerRepo.getLearnerById(studentMaya, "learner-002");
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });

    test("student cannot list all learners", async () => {
      await assert.rejects(
        async () => {
          await learnerRepo.listLearners(studentMaya);
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });

    test("student cannot access another learner's payment plan", async () => {
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
  });

  // --------------------------------------------------------------------------
  // 2. Tutor Cohort Isolation
  // --------------------------------------------------------------------------
  describe("Tutor Cohort & Learner Isolation", () => {
    const learnerRepo = getLearnerRepo();
    const enrolmentRepo = getEnrolmentRepo();

    test("tutor can only list learners enrolled in their assigned classes", async () => {
      const myLearners = await learnerRepo.listLearners(tutorEleanor);
      assert.ok(myLearners.length > 0);
      // Dr. Eleanor Vance teaches class-care-l3
      for (const learner of myLearners) {
        const enrolments = await enrolmentRepo.listEnrolments(
          superAdminDev,
          { learnerId: learner.id }
        );
        const inEleanorClass = enrolments.some((e) => e.classId === "class-care-l3");
        assert.ok(inEleanorClass, `Learner ${learner.id} should be in Eleanor's class`);
      }
    });

    test("tutor cannot read a learner enrolled under a different tutor", async () => {
      // Learner 10 is in class-lead-l5 (Marcus Sterling's cohort)
      await assert.rejects(
        async () => {
          await learnerRepo.getLearnerById(tutorEleanor, "learner-010");
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });

    test("tutor cannot view enrolments for classes they do not teach", async () => {
      await assert.rejects(
        async () => {
          await enrolmentRepo.listEnrolments(tutorEleanor, {
            classId: "class-lead-l5",
          });
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------------
  // 3. Administrative Staff Payment Barrier (Strict Denial)
  // --------------------------------------------------------------------------
  describe("Administrative Staff Payment Barrier", () => {
    const paymentRepo = getPaymentRepo();

    test("administrative staff calling getLedger gets PermissionDeniedError", async () => {
      await assert.rejects(
        async () => {
          await paymentRepo.getLedger(adminStaffSarah);
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });

    test("administrative staff calling getLedgerSummary gets PermissionDeniedError", async () => {
      await assert.rejects(
        async () => {
          await paymentRepo.getLedgerSummary(adminStaffSarah);
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });

    test("administrative staff calling markBankTransferReceived gets PermissionDeniedError", async () => {
      await assert.rejects(
        async () => {
          await paymentRepo.markBankTransferReceived(adminStaffSarah, {
            learnerId: "learner-001",
            enrolmentId: "enrolment-001",
            amountGbp: 100,
            reference: "BACS-TEST",
          });
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });

    test("administrative staff calling exportLedgerCsv gets PermissionDeniedError", async () => {
      await assert.rejects(
        async () => {
          await paymentRepo.exportLedgerCsv(adminStaffSarah);
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------------
  // 4. Owner Admin Financial Capabilities
  // --------------------------------------------------------------------------
  describe("Owner Admin Financial Access", () => {
    const paymentRepo = getPaymentRepo();

    test("owner admin can read full payment ledger", async () => {
      const ledger = await paymentRepo.getLedger(ownerKemi);
      assert.ok(Array.isArray(ledger));
      assert.ok(ledger.length > 0);
    });

    test("owner admin can view college ledger summary", async () => {
      const summary = await paymentRepo.getLedgerSummary(ownerKemi);
      assert.ok(summary);
      assert.ok(summary.receivedThisMonthGbp > 0);
      assert.ok(summary.totalOutstandingGbp > 0);
    });

    test("owner admin can mark a bank transfer as received and activate learner", async () => {
      const transfer = await paymentRepo.markBankTransferReceived(ownerKemi, {
        learnerId: "learner-005", // Aisha Bello (starts paused)
        enrolmentId: "enrolment-005",
        amountGbp: 192.5,
        reference: "BACS-OWNER-TEST",
        notes: "Bank transfer reconciled by Centre Director",
      });

      assert.equal(transfer.amountGbp, 192.5);
      assert.equal(transfer.status, "paid");
      assert.equal(transfer.method, "bank_transfer");

      // Verify learner status has been updated to active
      const learnerRepo = getLearnerRepo();
      const aisha = await learnerRepo.getLearnerById(ownerKemi, "learner-005");
      assert.equal(aisha?.accessStatus, "active");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Feature Entitlements Security (Super Admin Only)
  // --------------------------------------------------------------------------
  describe("Feature Entitlements Modification Authority", () => {
    const entitlementRepo = getEntitlementRepo();

    test("super admin can toggle feature entitlement and writes audit log", async () => {
      const updated = await entitlementRepo.updateEntitlement(
        superAdminDev,
        "student_portal",
        true
      );
      assert.equal(updated.module_key, "student_portal");
      assert.equal(updated.enabled, true);

      const logs = await entitlementRepo.getAuditLog(superAdminDev);
      const lastLog = logs[logs.length - 1];
      assert.equal(lastLog.actorRole, "super_admin");
      assert.ok(lastLog.details.includes("student_portal"));
    });

    test("owner admin cannot change feature entitlements", async () => {
      await assert.rejects(
        async () => {
          await entitlementRepo.updateEntitlement(
            ownerKemi,
            "evidence_packs",
            true
          );
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });

    test("administrative staff cannot change feature entitlements", async () => {
      await assert.rejects(
        async () => {
          await entitlementRepo.updateEntitlement(
            adminStaffSarah,
            "recordings",
            true
          );
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });

    test("tutor cannot change feature entitlements", async () => {
      await assert.rejects(
        async () => {
          await entitlementRepo.updateEntitlement(
            tutorEleanor,
            "assignments_grading",
            true
          );
        },
        (err: Error) => {
          assert.ok(err instanceof PermissionDeniedError);
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------------
  // 6. Signed Session Cryptographic Verification
  // --------------------------------------------------------------------------
  describe("Cryptographically Signed Session Verification", () => {
    test("signs and verifies valid session user token", async () => {
      const token = await signSession(studentMaya);
      assert.ok(typeof token === "string");
      assert.ok(token.includes("."));

      const verified = await verifySession(token);
      assert.ok(verified);
      assert.equal(verified.email, studentMaya.email);
      assert.equal(verified.role, "student");
    });

    test("rejects tampered session token", async () => {
      const validToken = await signSession(studentMaya);
      const [payload] = validToken.split(".");
      // Tamper signature with arbitrary bytes
      const tamperedToken = `${payload}.invalidsignature1234567890`;

      const result = await verifySession(tamperedToken);
      assert.equal(result, null);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Route Guards: /admin unauthenticated access redirects to /login
  // --------------------------------------------------------------------------
  describe("Server Route Guards", () => {
    test("unauthenticated access to /admin without a session redirects to /login", async () => {
      const { middleware } = await import("../src/middleware");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest("http://localhost:3000/admin");
      const res = await middleware(req);
      assert.ok(res);
      // Status 307 or 308 or location header directing to /login
      const location = res.headers.get("location");
      assert.ok(location);
      assert.ok(location.includes("/login"));
    });
  });
});
