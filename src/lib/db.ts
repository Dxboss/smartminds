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
        sql`CREATE TABLE IF NOT EXISTS course_catalog (id TEXT PRIMARY KEY, title TEXT NOT NULL, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, email TEXT, name TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS enrolments (id TEXT PRIMARY KEY, learner_id TEXT, course_id TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, enrolment_id TEXT, learner_id TEXT, amount NUMERIC, status TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, email TEXT, name TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, type TEXT, name TEXT, email TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
        sql`CREATE TABLE IF NOT EXISTS user_credentials (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`,
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
