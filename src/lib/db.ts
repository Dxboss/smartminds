import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(
  databaseUrl && databaseUrl.trim().length > 0
);

export const sql = isDbConfigured
  ? neon(databaseUrl!)
  : (neon(
      "postgresql://postgres:postgres@localhost:5432/smartminds_placeholder"
    ) as ReturnType<typeof neon>);

/**
 * Ensures all core tables exist in Neon PostgreSQL.
 * Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).
 */
export async function ensureDbTablesExist(): Promise<boolean> {
  if (!isDbConfigured) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS system_store (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cms_pages (
        path TEXT PRIMARY KEY,
        sections JSONB NOT NULL,
        draft_sections JSONB,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS blog_articles (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        read_time TEXT,
        published_at TEXT,
        excerpt TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS course_catalog (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS learners (
        id TEXT PRIMARY KEY,
        email TEXT,
        name TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS enrolments (
        id TEXT PRIMARY KEY,
        learner_id TEXT,
        course_id TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        enrolment_id TEXT,
        learner_id TEXT,
        amount NUMERIC,
        status TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        email TEXT,
        name TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        type TEXT,
        name TEXT,
        email TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_credentials (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    return true;
  } catch (err) {
    console.warn("[Neon DB] Notice: ensureDbTablesExist check:", err);
    return false;
  }
}
