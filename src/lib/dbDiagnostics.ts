import { isDbConfigured, sql, sanitizeDbError } from "./db";

export interface DatabaseDiagnosticsResult {
  isConfigured: boolean;
  canConnect: boolean;
  latencyMs: number | null;
  migrationVersion: string | null;
  migrationCount: number;
  tablesFound: string[];
  environment: string;
  isDemoMode: boolean;
  errorMessage?: string;
  checkedAt: string;
}

/**
 * Runs non-destructive connection and schema diagnostics.
 * Never outputs credentials, passwords, or connection strings.
 */
export async function runDatabaseDiagnostics(): Promise<DatabaseDiagnosticsResult> {
  const result: DatabaseDiagnosticsResult = {
    isConfigured: isDbConfigured,
    canConnect: false,
    latencyMs: null,
    migrationVersion: null,
    migrationCount: 0,
    tablesFound: [],
    environment: process.env.NODE_ENV || "development",
    isDemoMode: process.env.DEMO_MODE === "true",
    checkedAt: new Date().toISOString(),
  };

  if (!isDbConfigured) {
    result.errorMessage = "DATABASE_URL is not configured in this environment.";
    return result;
  }

  const start = Date.now();
  try {
    // 1. Ping connection
    const pingRes = (await sql`SELECT 1 as ping;`) as any[];
    result.latencyMs = Date.now() - start;
    if (pingRes && pingRes[0]?.ping === 1) {
      result.canConnect = true;
    }

    // 2. Check migrations
    try {
      const migrationRows = (await sql`
        SELECT version, name, applied_at
        FROM schema_migrations
        ORDER BY version DESC;
      `) as any[];
      if (migrationRows && migrationRows.length > 0) {
        result.migrationCount = migrationRows.length;
        result.migrationVersion = migrationRows[0].version;
      }
    } catch {
      // schema_migrations table might not exist yet before first migrate run
      result.migrationVersion = "none (unmigrated)";
    }

    // 3. Check essential tables
    try {
      const tableRows = (await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name ASC;
      `) as any[];
      result.tablesFound = (tableRows || []).map((t) => t.table_name);
    } catch {
      // Ignore if permission limited
    }
  } catch (err: unknown) {
    result.canConnect = false;
    result.latencyMs = Date.now() - start;
    result.errorMessage = sanitizeDbError(err);
    console.error("[DatabaseDiagnostics] Connection test failed:", result.errorMessage);
  }

  return result;
}
