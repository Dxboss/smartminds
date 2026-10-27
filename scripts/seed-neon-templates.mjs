import { neon } from "@neondatabase/serverless";
import fs from "fs";

const seedTemplates = [
  {
    id: "tmpl-welcome",
    key: "welcome_induction",
    title: "Course Welcome & Induction Pack",
    category: "enrolment",
    subject: "Welcome to Smartminds Training College — {course_title}",
    allowedPlaceholders: ["first_name", "course_title", "intake_date"],
    bodyTemplate:
      "Dear {first_name},\n\nWelcome to Smartminds Training College. Your enrolment on {course_title} starting {intake_date} is now active. Your induction materials and study timetable are available on your student portal.",
  },
  {
    id: "tmpl-zoom-link",
    key: "zoom_session_link",
    title: "Live Class Zoom Access Link",
    category: "attendance",
    subject: "Live Class Link: {class_name} ({session_date})",
    allowedPlaceholders: ["first_name", "class_name", "session_date", "zoom_link"],
    bodyTemplate:
      "Dear {first_name},\n\nYour upcoming interactive live class for {class_name} will take place on {session_date}.\n\nPlease join the meeting using this link: {zoom_link}\n\nPlease join 5 minutes prior to start.",
  },
  {
    id: "tmpl-assignment-due",
    key: "assignment_due_reminder",
    title: "Assignment Deadline Reminder",
    category: "assignment",
    subject: "Reminder: {assignment_title} due on {deadline_date}",
    allowedPlaceholders: ["first_name", "assignment_title", "deadline_date"],
    bodyTemplate:
      "Dear {first_name},\n\nThis is a friendly reminder that your submission for {assignment_title} is due on {deadline_date}. Please upload your completed work via your portal.",
  },
  {
    id: "tmpl-payment-reminder",
    key: "payment_instalment_due",
    title: "Payment Plan Instalment Notice",
    category: "payment",
    subject: "Notice: Instalment of £{amount_due} due on {due_date}",
    allowedPlaceholders: ["first_name", "amount_due", "due_date"],
    bodyTemplate:
      "Dear {first_name},\n\nThis is a notification regarding your payment plan with Smartminds Training College. Your next instalment of £{amount_due} is due on {due_date}.",
  },
];

async function main() {
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl && fs.existsSync(".env.example")) {
    const env = fs.readFileSync(".env.example", "utf8");
    const m = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (m) dbUrl = m[1];
  }
  if (!dbUrl) {
    console.error("No DATABASE_URL found");
    return;
  }
  const sql = neon(dbUrl);

  console.log(`Seeding ${seedTemplates.length} approved templates into Neon message_templates...`);

  for (const t of seedTemplates) {
    await sql`
      INSERT INTO message_templates (id, key, title, category, subject, body_template, allowed_placeholders, data, updated_at)
      VALUES (
        ${t.id},
        ${t.key},
        ${t.title},
        ${t.category},
        ${t.subject},
        ${t.bodyTemplate},
        ${JSON.stringify(t.allowedPlaceholders)},
        ${JSON.stringify({ id: t.id, key: t.key, title: t.title, category: t.category, subject: t.subject, bodyTemplate: t.bodyTemplate, allowedPlaceholders: t.allowedPlaceholders })},
        now()
      )
      ON CONFLICT (key) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        subject = EXCLUDED.subject,
        body_template = EXCLUDED.body_template,
        allowed_placeholders = EXCLUDED.allowed_placeholders,
        updated_at = now();
    `;
    console.log(`  ✓ Seeded template: ${t.key} - ${t.title}`);
  }

  const count = await sql`SELECT count(*) FROM message_templates;`;
  console.log("Total message_templates in Neon:", count[0]?.count);
}

main().catch(console.error);
