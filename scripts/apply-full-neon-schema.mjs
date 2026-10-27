import { neon } from "@neondatabase/serverless";
import fs from "fs";
import { hashPassword } from "../src/lib/passwords";
import { courses } from "../src/content/courses";

async function main() {
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl && fs.existsSync(".env.example")) {
    const env = fs.readFileSync(".env.example", "utf8");
    const m = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (m) dbUrl = m[1];
  }
  if (!dbUrl) {
    console.error("No DATABASE_URL available.");
    return;
  }
  const sql = neon(dbUrl);

  console.log("=== STEP 1: ADDING MISSING COLUMNS TO EXISTING TABLES ===");

  // 1. course_catalog
  console.log("Updating course_catalog columns...");
  await sql`ALTER TABLE course_catalog ADD COLUMN IF NOT EXISTS slug TEXT;`;
  await sql`ALTER TABLE course_catalog ADD COLUMN IF NOT EXISTS category TEXT;`;
  await sql`ALTER TABLE course_catalog ADD COLUMN IF NOT EXISTS type TEXT;`;
  await sql`ALTER TABLE course_catalog ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true;`;
  await sql`ALTER TABLE course_catalog ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();`;
  await sql`CREATE INDEX IF NOT EXISTS idx_course_catalog_slug ON course_catalog (slug);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_course_catalog_category ON course_catalog (category);`;

  // 2. learners
  console.log("Updating learners columns...");
  await sql`ALTER TABLE learners ADD COLUMN IF NOT EXISTS user_id TEXT;`;
  await sql`ALTER TABLE learners ADD COLUMN IF NOT EXISTS first_name TEXT;`;
  await sql`ALTER TABLE learners ADD COLUMN IF NOT EXISTS last_name TEXT;`;
  await sql`ALTER TABLE learners ADD COLUMN IF NOT EXISTS phone TEXT;`;
  await sql`ALTER TABLE learners ADD COLUMN IF NOT EXISTS access_status TEXT NOT NULL DEFAULT 'active';`;
  await sql`ALTER TABLE learners ADD COLUMN IF NOT EXISTS archive_reason TEXT;`;
  await sql`ALTER TABLE learners ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;`;

  // 3. enrolments
  console.log("Updating enrolments columns...");
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS course_slug TEXT;`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS course_title TEXT;`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS course_level_label TEXT;`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS class_id TEXT;`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS funding_type TEXT NOT NULL DEFAULT 'self_pay';`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS assessment_method TEXT NOT NULL DEFAULT 'criteria';`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS completed_units JSONB NOT NULL DEFAULT '[]'::jsonb;`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN NOT NULL DEFAULT false;`;
  await sql`ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now();`;

  // 4. payments
  console.log("Updating payments columns...");
  await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'GBP';`;
  await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'stripe';`;
  await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference TEXT;`;
  await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;`;

  // 5. bookings
  console.log("Updating bookings columns...");
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS full_name TEXT;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS phone TEXT;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS course_interest TEXT;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now();`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_zone TEXT NOT NULL DEFAULT 'Europe/London';`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed';`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_platform TEXT NOT NULL DEFAULT 'google_meet';`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_link TEXT;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_staff_id TEXT;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_staff_name TEXT;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;`;

  // 6. leads
  console.log("Updating leads columns...");
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS course_id TEXT;`;

  // 7. user_credentials
  console.log("Updating user_credentials columns...");
  await sql`ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS name TEXT;`;
  await sql`ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;`;
  await sql`ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS tutor_id TEXT;`;
  await sql`ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS learner_id TEXT;`;
  await sql`ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS specialism TEXT;`;
  await sql`ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS department TEXT;`;
  await sql`ALTER TABLE user_credentials ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();`;

  console.log("=== STEP 2: CREATING MISSING CORE TABLES ===");

  // classes (cohorts)
  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      course_level_label TEXT,
      tutor_id TEXT,
      tutor_name TEXT,
      name TEXT NOT NULL,
      intake_label TEXT,
      schedule_description TEXT,
      next_session_date TIMESTAMPTZ,
      zoom_link TEXT,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  console.log("Table classes created or verified.");

  // class_sessions
  await sql`
    CREATE TABLE IF NOT EXISTS class_sessions (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      title TEXT NOT NULL,
      scheduled_at TIMESTAMPTZ NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      zoom_link TEXT,
      recording_url TEXT,
      attendance_tracked BOOLEAN NOT NULL DEFAULT false,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  console.log("Table class_sessions created or verified.");

  // payment_schedules
  await sql`
    CREATE TABLE IF NOT EXISTS payment_schedules (
      id TEXT PRIMARY KEY,
      enrolment_id TEXT NOT NULL,
      learner_id TEXT NOT NULL,
      instalment_number INTEGER NOT NULL,
      due_date TIMESTAMPTZ NOT NULL,
      amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      paid_at TIMESTAMPTZ,
      payment_reference TEXT,
      grace_expiry_date TIMESTAMPTZ,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  console.log("Table payment_schedules created or verified.");

  // tasks
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to_id TEXT NOT NULL,
      assigned_to_name TEXT NOT NULL,
      assigned_by_role TEXT NOT NULL DEFAULT 'owner_admin',
      deadline TIMESTAMPTZ NOT NULL DEFAULT now(),
      status TEXT NOT NULL DEFAULT 'pending',
      is_overdue BOOLEAN NOT NULL DEFAULT false,
      satisfaction TEXT,
      feedback TEXT,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  console.log("Table tasks created or verified.");

  // availability_rules & blocked_days
  await sql`
    CREATE TABLE IF NOT EXISTS availability_rules (
      id TEXT PRIMARY KEY,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS blocked_days (
      date TEXT PRIMARY KEY,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  console.log("Tables availability_rules & blocked_days created or verified.");

  // message_templates & message_logs
  await sql`
    CREATE TABLE IF NOT EXISTS message_templates (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_template TEXT NOT NULL,
      allowed_placeholders JSONB NOT NULL DEFAULT '[]'::jsonb,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS message_logs (
      id TEXT PRIMARY KEY,
      template_key TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      recipient_name TEXT,
      subject TEXT NOT NULL,
      rendered_body TEXT NOT NULL,
      sent_by_user_id TEXT,
      sent_by_role TEXT,
      status TEXT NOT NULL DEFAULT 'sent',
      sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `;
  console.log("Tables message_templates & message_logs created or verified.");

  // feature_entitlements
  await sql`
    CREATE TABLE IF NOT EXISTS feature_entitlements (
      module_key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      enabled BOOLEAN NOT NULL DEFAULT false,
      enabled_by TEXT,
      enabled_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  console.log("Table feature_entitlements created or verified.");

  // feedback
  await sql`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      page_url TEXT,
      reviewer_name TEXT,
      user_id TEXT,
      role TEXT,
      rating INTEGER,
      comment TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  console.log("Table feedback created or verified.");

  console.log("=== STEP 3: SEEDING/SYNCING ESSENTIAL DEFAULTS ===");
  // Seed all 16 courses with columns
  for (const c of courses) {
    await sql`
      INSERT INTO course_catalog (id, slug, title, category, type, published, data, updated_at)
      VALUES (${c.id}, ${c.slug}, ${c.title}, ${c.category || ''}, ${c.type}, ${c.published ?? true}, ${JSON.stringify(c)}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        type = EXCLUDED.type,
        published = EXCLUDED.published,
        data = EXCLUDED.data,
        updated_at = now();
    `;
  }
  console.log(`Seeded/synchronized ${courses.length} courses with full columns in course_catalog!`);

  // Seed default feature entitlements
  const defaultEntitlements = [
    { key: "finance_ledger", name: "Finance & Payments Ledger", desc: "Access to student fee records and Stripe settlements", enabled: true },
    { key: "online_consultations", name: "Online Video Consultations", desc: "Booking consultation engine with Google Meet/Zoom", enabled: true },
    { key: "cohort_schedules", name: "Cohort Class Schedules", desc: "2-cohort Zoom live streaming classes", enabled: true },
    { key: "cms_editor", name: "CMS Page & Section Editor", desc: "Live front-end page customizer", enabled: true },
    { key: "blog_manager", name: "Article & News Manager", desc: "Publishing blog posts and editorial content", enabled: true },
  ];
  for (const e of defaultEntitlements) {
    await sql`
      INSERT INTO feature_entitlements (module_key, name, description, enabled, updated_at)
      VALUES (${e.key}, ${e.name}, ${e.desc}, ${e.enabled}, now())
      ON CONFLICT (module_key) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        updated_at = now();
    `;
  }
  console.log("Seeded feature entitlements!");

  // Verify final list of tables in Neon
  const allTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log("\n=== ALL TABLES CURRENTLY IN NEON ===");
  console.log(allTables.map(t => t.table_name));
}

main().catch(console.error);
