import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(
  databaseUrl && databaseUrl.trim().length > 0
);

export function sanitizeDbError(err: unknown): string {
  if (!err) return "Unknown database error";
  const msg = err instanceof Error ? err.message : String(err);
  return msg
    .replace(/postgres(?:ql)?:\/\/[^@\s]+@/gi, "postgresql://[REDACTED]@")
    .replace(/(?:password|pwd|secret)=([^\s&]+)/gi, "password=[REDACTED]");
}

const dummySql = ((..._args: any[]) => {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.DEMO_MODE !== "true" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    const errorMsg =
      "[Neon DB] Error: DATABASE_URL is not configured in production. Database query aborted to prevent data loss or silent fallback.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return Promise.resolve([]);
}) as unknown as ReturnType<typeof neon>;

const rawNeon = isDbConfigured ? neon(databaseUrl!) : null;

export const sql = (isDbConfigured && rawNeon
  ? (async (strings: TemplateStringsArray | string, ...values: any[]) => {
      try {
        return await (rawNeon as any)(strings, ...values);
      } catch (err) {
        const safeMsg = sanitizeDbError(err);
        console.error("[Neon DB] Query Error:", safeMsg);
        throw new Error(safeMsg);
      }
    })
  : dummySql) as unknown as ReturnType<typeof neon>;

let tablesInitialized = false;
let initializingPromise: Promise<boolean> | null = null;

/**
 * Ensures all core tables exist in Neon PostgreSQL.
 * Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).
 * Cached in-memory so it only executes once per server process.
 */
export async function ensureDbTablesExist(): Promise<boolean> {
  if (!isDbConfigured || process.env.NEXT_PHASE === "phase-production-build") return false;
  if (tablesInitialized) return true;
  if (initializingPromise) return initializingPromise;

  initializingPromise = (async () => {
    try {
      const queries = [
        sql`CREATE TABLE IF NOT EXISTS system_store (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS cms_pages (path TEXT PRIMARY KEY, sections JSONB NOT NULL, draft_sections JSONB, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS blog_articles (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, read_time TEXT, published_at TEXT, excerpt TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS course_catalog (id TEXT PRIMARY KEY, slug TEXT, title TEXT NOT NULL, category TEXT, type TEXT, published BOOLEAN NOT NULL DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, user_id TEXT, first_name TEXT, last_name TEXT, email TEXT, name TEXT, phone TEXT, access_status TEXT NOT NULL DEFAULT 'active', archive_reason TEXT, archived_at TIMESTAMPTZ, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS classes (id TEXT PRIMARY KEY, course_id TEXT NOT NULL, course_level_label TEXT, tutor_id TEXT, tutor_name TEXT, name TEXT NOT NULL, intake_label TEXT, schedule_description TEXT, next_session_date TIMESTAMPTZ, zoom_link TEXT, data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS class_sessions (id TEXT PRIMARY KEY, class_id TEXT NOT NULL, title TEXT NOT NULL, scheduled_at TIMESTAMPTZ NOT NULL, duration_minutes INTEGER NOT NULL DEFAULT 60, zoom_link TEXT, recording_url TEXT, attendance_tracked BOOLEAN NOT NULL DEFAULT false, data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS enrolments (id TEXT PRIMARY KEY, learner_id TEXT, course_id TEXT, course_slug TEXT, course_title TEXT, course_level_label TEXT, class_id TEXT, status TEXT NOT NULL DEFAULT 'active', funding_type TEXT NOT NULL DEFAULT 'self_pay', assessment_method TEXT NOT NULL DEFAULT 'criteria', completed_units JSONB NOT NULL DEFAULT '[]'::jsonb, certificate_issued BOOLEAN NOT NULL DEFAULT false, enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(), data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, enrolment_id TEXT, learner_id TEXT, amount NUMERIC, currency TEXT NOT NULL DEFAULT 'GBP', status TEXT, payment_method TEXT NOT NULL DEFAULT 'stripe', reference TEXT, notes TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS payment_schedules (id TEXT PRIMARY KEY, enrolment_id TEXT NOT NULL, learner_id TEXT NOT NULL, instalment_number INTEGER NOT NULL, due_date TIMESTAMPTZ NOT NULL, amount NUMERIC(10, 2) NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'pending', paid_at TIMESTAMPTZ, payment_reference TEXT, grace_expiry_date TIMESTAMPTZ, data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, assigned_to_id TEXT NOT NULL, assigned_to_name TEXT NOT NULL, assigned_by_role TEXT NOT NULL DEFAULT 'owner_admin', deadline TIMESTAMPTZ NOT NULL DEFAULT now(), status TEXT NOT NULL DEFAULT 'pending', is_overdue BOOLEAN NOT NULL DEFAULT false, satisfaction TEXT, feedback TEXT, data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, full_name TEXT, email TEXT, name TEXT, phone TEXT, course_interest TEXT, scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(), time_zone TEXT NOT NULL DEFAULT 'Europe/London', status TEXT NOT NULL DEFAULT 'confirmed', meeting_platform TEXT NOT NULL DEFAULT 'google_meet', meeting_link TEXT, assigned_staff_id TEXT, assigned_staff_name TEXT, notes TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS availability_rules (id TEXT PRIMARY KEY, day_of_week INTEGER NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, slot_duration_minutes INTEGER NOT NULL DEFAULT 30, data JSONB NOT NULL DEFAULT '{}'::jsonb);`,
        sql`CREATE TABLE IF NOT EXISTS blocked_days (date TEXT PRIMARY KEY, reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS message_templates (id TEXT PRIMARY KEY, key TEXT UNIQUE NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, subject TEXT NOT NULL, body_template TEXT NOT NULL, allowed_placeholders JSONB NOT NULL DEFAULT '[]'::jsonb, data JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS message_logs (id TEXT PRIMARY KEY, template_key TEXT NOT NULL, recipient_email TEXT NOT NULL, recipient_name TEXT, subject TEXT NOT NULL, rendered_body TEXT NOT NULL, sent_by_user_id TEXT, sent_by_role TEXT, status TEXT NOT NULL DEFAULT 'sent', sent_at TIMESTAMPTZ NOT NULL DEFAULT now(), data JSONB NOT NULL DEFAULT '{}'::jsonb);`,
        sql`CREATE TABLE IF NOT EXISTS feature_entitlements (module_key TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, enabled BOOLEAN NOT NULL DEFAULT false, enabled_by TEXT, enabled_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, actor_user_id TEXT, actor_email TEXT, actor_role TEXT, action TEXT NOT NULL, details TEXT, timestamp TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, page_url TEXT, reviewer_name TEXT, user_id TEXT, role TEXT, rating INTEGER, comment TEXT, status TEXT NOT NULL DEFAULT 'new', data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, type TEXT, name TEXT, email TEXT, phone TEXT, status TEXT NOT NULL DEFAULT 'new', course_id TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS user_credentials (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, role TEXT NOT NULL, active BOOLEAN NOT NULL DEFAULT true, tutor_id TEXT, learner_id TEXT, specialism TEXT, department TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS subscribers (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, status TEXT NOT NULL DEFAULT 'active', data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
      ];

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Neon DB tables init timeout")), 5000)
      );

      await Promise.race([Promise.all(queries), timeout]);
      tablesInitialized = true;
      return true;
    } catch (err) {
      console.warn("[Neon DB] Notice: ensureDbTablesExist check:", err);
      return false;
    } finally {
      initializingPromise = null;
    }
  })();

  return initializingPromise;
}
