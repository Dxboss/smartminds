import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  freeAdviceSchema,
  fundedEligibilitySchema,
  privateTutoringSchema,
  generalContactSchema,
} from "../src/lib/validation/leadSchemas";
import { submitLeadAction } from "../src/app/actions/leadActions";

describe("Prompt 7: Forms and Leads Validation Suite", () => {
  test("submitting without consent is blocked across all 4 form schemas", () => {
    // 1. Free advice without consent
    assert.throws(
      () => {
        freeAdviceSchema.parse({
          name: "John Doe",
          email: "john@example.com",
          consent: false,
        });
      },
      (err: Error) => {
        return err.message.includes("You must consent to our Privacy Policy");
      }
    );

    // 2. Funded eligibility without consent
    assert.throws(
      () => {
        fundedEligibilitySchema.parse({
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "07123456789",
          course_interest: "Level 3 Adult Care",
          employment_status: "Employed",
          prior_qualification: "Below Level 3",
          postcode: "SW1A 1AA",
          consent: false,
        });
      },
      (err: Error) => {
        return err.message.includes("You must consent to our Privacy Policy");
      }
    );

    // 3. Private tutoring without parent consent
    assert.throws(
      () => {
        privateTutoringSchema.parse({
          name: "Parent Name",
          email: "parent@example.com",
          student_name: "Student Name",
          student_year_group: "Year 10",
          subject_interest: "Maths",
          parent_consent: false,
          consent: true,
        });
      },
      (err: Error) => {
        return err.message.includes(
          "Parent or legal guardian consent is required"
        );
      }
    );

    // 4. General contact without consent
    assert.throws(
      () => {
        generalContactSchema.parse({
          name: "Alice",
          email: "alice@example.com",
          subject: "Course inquiry",
          message: "A detailed message exceeding ten characters",
          consent: false,
        });
      },
      (err: Error) => {
        return err.message.includes("You must consent to our Privacy Policy");
      }
    );
  });

  test("server action blocks submission when consent is false", async () => {
    const result = await submitLeadAction({
      type: "free_advice",
      name: "Marcus Aurelius",
      email: "marcus@example.com",
      consent: false,
    });

    assert.equal(result.success, false);
    assert.ok(result.fieldErrors?.consent);
  });

  test("valid submission creates a row and records lead in storage", async () => {
    const testEmail = `test_${Date.now()}@example.co.uk`;
    const result = await submitLeadAction({
      type: "free_advice",
      name: "Elizabeth Bennet",
      email: testEmail,
      phone: "07987654321",
      course_interest: "Award in Education and Training (AET)",
      consent: true,
      utm_source: "google_search",
      utm_campaign: "autumn_intake",
    });

    assert.equal(result.success, true);
    assert.ok(result.leadId);
    assert.ok(result.leadId.startsWith("lead_"));

    // Verify row was written to data/dev_leads.json
    const leadsPath = path.join(process.cwd(), "data", "dev_leads.json");
    assert.ok(fs.existsSync(leadsPath));
    const leads = JSON.parse(fs.readFileSync(leadsPath, "utf-8"));
    const createdLead = leads.find(
      (l: { email: string }) => l.email === testEmail
    );
    assert.ok(createdLead);
    assert.equal(createdLead.name, "Elizabeth Bennet");
    assert.equal(createdLead.utm_source, "google_search");
    assert.equal(createdLead.utm_campaign, "autumn_intake");
    assert.ok(createdLead.consent_at);
  });

  test("valid submission generates and sends both emails (owner alert + visitor auto-reply)", async () => {
    const testEmail = `visitor_${Date.now()}@example.co.uk`;
    const result = await submitLeadAction({
      type: "general_contact",
      name: "Robert Frost",
      email: testEmail,
      subject: "Evening class schedule inquiry",
      message:
        "Could you please clarify the specific timing for weekday evening webinars?",
      consent: true,
    });

    assert.equal(result.success, true);

    // Verify outbox in data/dev_emails.json
    const emailsPath = path.join(process.cwd(), "data", "dev_emails.json");
    assert.ok(fs.existsSync(emailsPath));
    const emails = JSON.parse(fs.readFileSync(emailsPath, "utf-8"));

    // 1. Check visitor auto-reply exists
    const visitorEmail = emails.find((e: { to: string }) => e.to === testEmail);
    assert.ok(visitorEmail, "Auto-reply to visitor was not dispatched");
    assert.ok(visitorEmail.subject.includes("Smartminds Training College"));
    assert.ok(visitorEmail.body.includes("Hello Robert Frost"));

    // 2. Check owner alert email exists
    const ownerEmail = emails.find(
      (e: { subject: string }) =>
        e.subject.includes("[New Lead: general_contact]") &&
        e.subject.includes("Robert Frost")
    );
    assert.ok(ownerEmail, "Owner alert email was not dispatched");
  });

  test("honeypot bot submission is silently trapped without creating real lead", async () => {
    const botEmail = "spambot@automated.xyz";
    const result = await submitLeadAction({
      type: "free_advice",
      name: "Spam Bot",
      email: botEmail,
      consent: true,
      botCheck: "I am a malicious scraper bot",
    });

    assert.equal(result.success, true);
    assert.equal(result.leadId, "bot-filtered");
  });
});
