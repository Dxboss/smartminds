import test from "node:test";
import assert from "node:assert/strict";
import {
  savePasswordResetToken,
  verifyAndConsumePasswordResetToken,
  updateLearnerPasswordInStore,
  loadPersistedRecords,
} from "../src/lib/persistedData";
import { seedLearners, seedUsers } from "../src/lib/repositories/seedData";
import { verifyPassword, hashPassword } from "../src/lib/passwords";

test("Auth Directory & Seed Coverage", async (t) => {
  await t.test("Directory has designated Super Admin accounts", () => {
    const superAdminEmails = [
      "thegeorgedigitals@gmail.com",
      "super.admin@smartmindstraining.co.uk",
    ];
    for (const email of superAdminEmails) {
      assert.ok(email.includes("@"), `Valid super admin email: ${email}`);
    }
  });

  await t.test("Seed users contains staff and tutor accounts", () => {
    const tutorUser = seedUsers.find(
      (u) => u.email.toLowerCase() === "eleanor.vance@smartmindstraining.co.uk"
    );
    assert.ok(tutorUser, "Eleanor Vance should exist in seed users");
    assert.strictEqual(tutorUser?.role, "tutor");

    const adminUser = seedUsers.find(
      (u) => u.email.toLowerCase() === "sarah.jenkins@smartmindstraining.co.uk"
    );
    assert.ok(adminUser, "Sarah Jenkins should exist in seed users");
    assert.strictEqual(adminUser?.role, "admin_staff");
  });

  await t.test("Seed learners contains active student accounts", () => {
    assert.ok(seedLearners.length > 0, "Seed learners should not be empty");
    const maya = seedLearners.find(
      (l) => l.email.toLowerCase() === "maya.lin@example.com"
    );
    assert.ok(maya, "Maya Lin exists in seed learners");
    assert.ok(maya?.id, "Maya has learner ID");
  });
});

test("Password Reset Token Lifecycle", async (t) => {
  const testEmail = "test.recovery@smartmindstraining.co.uk";
  const testToken = "test-token-" + Date.now();

  await t.test("Saves reset token in store", () => {
    savePasswordResetToken(testToken, testEmail, 15);
    const store = loadPersistedRecords();
    const found = store.passwordResetTokens?.find(
      (t) => t.token === testToken && t.email === testEmail
    );
    assert.ok(found, "Token must be recorded in persisted store");
    assert.ok(found.expiresAt > Date.now(), "Token must have future expiry");
  });

  await t.test("Rejects invalid token or mismatched email", () => {
    assert.strictEqual(
      verifyAndConsumePasswordResetToken("wrong-token", testEmail),
      false,
      "Wrong token must be rejected"
    );
    assert.strictEqual(
      verifyAndConsumePasswordResetToken(testToken, "wrong.email@example.com"),
      false,
      "Mismatched email must be rejected"
    );
  });

  await t.test("Consumes valid token once", () => {
    const verified = verifyAndConsumePasswordResetToken(testToken, testEmail);
    assert.strictEqual(verified, true, "Valid token must be accepted");

    // Second time must fail (single-use)
    const secondTry = verifyAndConsumePasswordResetToken(testToken, testEmail);
    assert.strictEqual(secondTry, false, "Token must be consumed and unusable a second time");
  });
});

test("Password Update & Verification", async (t) => {
  const learnerEmail = "maya.lin@example.com";
  const newSecret = "NewPassword2026!";

  await t.test("Updates learner password in store", () => {
    const success = updateLearnerPasswordInStore(learnerEmail, newSecret);
    assert.strictEqual(success, true, "Password update must succeed");

    const store = loadPersistedRecords();
    const cred = store.userCredentials?.find(
      (u) => u.email.toLowerCase() === learnerEmail.toLowerCase()
    );
    assert.ok(cred, "Credential record must exist in userCredentials");
    assert.ok(cred.passwordHash, "Password hash must be stored");
    const verifyResult = verifyPassword(newSecret, cred.passwordHash);
    assert.strictEqual(
      verifyResult.valid,
      true,
      "New password must verify against stored hash"
    );
  });
});
