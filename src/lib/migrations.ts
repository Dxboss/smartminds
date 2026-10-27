import fs from "fs";
import path from "path";
import { sql, isDbConfigured } from "@/lib/db";

export interface MigrationRecord {
  version: number;
  name: string;
  applied: boolean;
  appliedAt?: string;
}

/**
 * Strips credentials, tokens, or database URLs from error messages
 * before logging or exposing to diagnostics.
 */
export function sanitizeDbError(err: unknown): string {
  if (!err) return "Unknown database error";
  const message = err instanceof Error ? err.message : String(err);
  return message
    .replace(/postgres(?:ql)?:\/\/[^@\s]+@[^\s/]+/gi, "postgres://[REDACTED_CREDENTIALS]@[HOST]")
    .replace(/password=[^\s&]+/gi, "password=[REDACTED]")
    .replace(/key=[^\s&]+/gi, "key=[REDACTED]");
}

/**
 * Returns the list of discovered SQL migration files in /migrations
 */
export function getAvailableMigrationFiles(): { version: number; name: string; fullPath: string }[] {
  const migrationsDir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) return [];

  const files = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  return files.map((file) => {
    const match = file.match(/^(\d+)_(.+)\.sql$/);
    const version = match ? parseInt(match[1], 10) : 0;
    return {
      version,
      name: file,
      fullPath: path.join(migrationsDir, file),
    };
  });
}

/**
 * Returns current migration status against the database.
 */
export async function getMigrationStatus(): Promise<{
  configured: boolean;
  status: MigrationRecord[];
  error?: string;
}> {
  if (!isDbConfigured) {
    return {
      configured: false,
      status: getAvailableMigrationFiles().map((m) => ({
        version: m.version,
        name: m.name,
        applied: false,
      })),
      error: "DATABASE_URL is not configured.",
    };
  }

  try {
    // Ensure migrations table exists
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    const appliedRows = (await sql`
      SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC;
    `) as { version: number; name: string; applied_at: string }[];

    const appliedMap = new Map<number, string>();
    for (const row of appliedRows) {
      appliedMap.set(row.version, row.applied_at);
    }

    const available = getAvailableMigrationFiles();
    const status: MigrationRecord[] = available.map((m) => ({
      version: m.version,
      name: m.name,
      applied: appliedMap.has(m.version),
      appliedAt: appliedMap.get(m.version),
    }));

    return { configured: true, status };
  } catch (err) {
    const safeError = sanitizeDbError(err);
    console.error("[DATABASE DIAGNOSTICS] Migration status check failed:", safeError);
    return { configured: true, status: [], error: safeError };
  }
}

/**
 * Runs all pending migrations sequentially.
 * Safe, idempotent, and version-tracked.
 */
export async function runMigrations(): Promise<{
  success: boolean;
  appliedCount: number;
  appliedNames: string[];
  error?: string;
}> {
  if (!isDbConfigured) {
    const errorMsg = "Cannot run migrations: DATABASE_URL is not configured.";
    console.error(`[DATABASE ERROR] ${errorMsg}`);
    return { success: false, appliedCount: 0, appliedNames: [], error: errorMsg };
  }

  try {
    // 1. Ensure migrations table exists
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    // 2. Fetch applied migrations
    const appliedRows = (await sql`
      SELECT version FROM schema_migrations;
    `) as { version: number }[];
    const appliedSet = new Set<number>(appliedRows.map((r) => r.version));

    const files = getAvailableMigrationFiles();
    const pending = files.filter((f) => !appliedSet.has(f.version));

    if (pending.length === 0) {
      return { success: true, appliedCount: 0, appliedNames: [] };
    }

    const appliedNames: string[] = [];

    for (const migration of pending) {
      console.log(`[DATABASE MIGRATION] Applying ${migration.name}...`);
      const sqlContent = fs.readFileSync(migration.fullPath, "utf-8");

      // Execute SQL content against Neon serverless
      // Execute each statement or split by semicolon comments where needed
      const statements = sqlContent
        .split(/;\s*(?:\r?\n|$)/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      for (const statement of statements) {
        if (statement.trim()) {
          // Use raw query execution via neon sql
          await (sql as any)(statement);
        }
      }

      // Record successful application
      await sql`
        INSERT INTO schema_migrations (version, name, applied_at)
        VALUES (${migration.version}, ${migration.name}, now())
        ON CONFLICT (version) DO NOTHING;
      `;

      appliedNames.push(migration.name);
      console.log(`[DATABASE MIGRATION] Successfully applied ${migration.name}`);
    }

    return {
      success: true,
      appliedCount: appliedNames.length,
      appliedNames,
    };
  } catch (err) {
    const safeError = sanitizeDbError(err);
    console.error("[DATABASE MIGRATION ERROR] Failed to run migrations:", safeError);
    return {
      success: false,
      appliedCount: 0,
      appliedNames: [],
      error: safeError,
    };
  }
}
