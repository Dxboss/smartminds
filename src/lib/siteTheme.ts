import fs from "fs";
import path from "path";
import {
  HeaderNavConfig,
  FooterConfig,
  defaultHeaderNavConfig,
  defaultFooterConfig,
} from "@/lib/repositories/seedData";

const THEME_FILE_PATH = path.join(process.cwd(), "src", "content", "siteTheme.json");

export interface SiteThemeData {
  headerNav: Partial<HeaderNavConfig>;
  footer: Partial<FooterConfig>;
}

// Global in-memory cache to avoid repeated DB queries on every request
let inMemoryCachedTheme: SiteThemeData | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

export function getCachedSiteTheme(): SiteThemeData | null {
  if (!inMemoryCachedTheme) return null;
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return inMemoryCachedTheme;
  }
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  if (now - lastCacheTimestamp < CACHE_TTL_MS) {
    return inMemoryCachedTheme;
  }
  return null;
}

export function setCachedSiteTheme(theme: SiteThemeData): void {
  inMemoryCachedTheme = theme;
  lastCacheTimestamp = typeof performance !== "undefined" ? performance.now() : 0;
}

function sanitizeFooterTheme(footer: Partial<FooterConfig>): Partial<FooterConfig> {
  const result = { ...defaultFooterConfig, ...footer };
  if (result.bioText && /100%\s*online/i.test(result.bioText)) {
    result.bioText = result.bioText.replace(
      /100%\s*online\s*distance\s*learning/gi,
      "blended learning and live online distance learning"
    ).replace(/100%\s*online/gi, "blended learning and live online");
  }
  return result;
}

/**
 * Asynchronously fetch site theme from Neon PostgreSQL system_store table.
 * Primary source of truth: Database ALWAYS wins over static disk files.
 */
export async function getPersistentSiteThemeAsync(): Promise<SiteThemeData> {
  // During static page generation / build phase, use synchronous fallback
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return getPersistentSiteTheme();
  }

  // 1. Fast path: Memory cache
  const cached = getCachedSiteTheme();
  if (cached) return cached;

  // 2. Neon Database Query (System Store)
  if (
    typeof window === "undefined" &&
    process.env.DATABASE_URL &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    try {
      const { isDbConfigured, sql, ensureDbTablesExist } = await import("@/lib/db");
      if (isDbConfigured) {
        await ensureDbTablesExist();
        const rows: any = await sql`
          SELECT value FROM system_store WHERE key = 'site_theme' LIMIT 1
        `;
        if (rows && rows.length > 0 && rows[0]?.value) {
          const rawVal = rows[0].value;
          const dbTheme = (typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal) as Partial<SiteThemeData>;
          const resolved: SiteThemeData = {
            headerNav: { ...defaultHeaderNavConfig, ...(dbTheme.headerNav || {}) },
            footer: sanitizeFooterTheme(dbTheme.footer || {}),
          };
          setCachedSiteTheme(resolved);
          return resolved;
        }
      }
    } catch (dbErr) {
      console.warn("[SiteTheme] Notice loading theme from database:", dbErr);
    }
  }

  // 3. Fallback to synchronous file/memory
  const syncFallback = getPersistentSiteTheme();
  setCachedSiteTheme(syncFallback);
  return syncFallback;
}

/**
 * Synchronous fallback reader (for non-async callers or build phases)
 */
export function getPersistentSiteTheme(): SiteThemeData {
  // If memory cache exists, return it
  if (inMemoryCachedTheme) {
    return inMemoryCachedTheme;
  }

  // Check data/persisted_records.json
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadPersistedRecords } = require("@/lib/persistedData");
    const store = loadPersistedRecords();
    if (store && store.siteTheme && (store.siteTheme.headerNav || store.siteTheme.footer)) {
      return {
        headerNav: { ...defaultHeaderNavConfig, ...(store.siteTheme.headerNav || {}) },
        footer: sanitizeFooterTheme(store.siteTheme.footer || {}),
      };
    }
  } catch {}

  // Check static siteTheme.json
  try {
    if (fs.existsSync(THEME_FILE_PATH)) {
      const raw = fs.readFileSync(THEME_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        headerNav: { ...defaultHeaderNavConfig, ...(parsed.headerNav || {}) },
        footer: sanitizeFooterTheme(parsed.footer || {}),
      };
    }
  } catch (err) {
    console.error("Failed to read persistent site theme from file:", err);
  }

  return {
    headerNav: defaultHeaderNavConfig,
    footer: sanitizeFooterTheme(defaultFooterConfig),
  };
}

/**
 * Persists theme changes to Neon PostgreSQL database and local cache.
 */
export async function savePersistentSiteThemeAsync(theme: Partial<SiteThemeData>): Promise<boolean> {
  try {
    const current = await getPersistentSiteThemeAsync();
    const merged: SiteThemeData = {
      headerNav: { ...current.headerNav, ...(theme.headerNav || {}) },
      footer: { ...current.footer, ...(theme.footer || {}) },
    };

    // Update in-memory cache immediately
    setCachedSiteTheme(merged);

    // 1. Direct write to Neon PostgreSQL system_store
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      try {
        const { isDbConfigured, sql, ensureDbTablesExist } = await import("@/lib/db");
        if (isDbConfigured) {
          await ensureDbTablesExist();
          await sql`
            INSERT INTO system_store (key, value, updated_at)
            VALUES ('site_theme', ${JSON.stringify(merged)}, now())
            ON CONFLICT (key) DO UPDATE SET
              value = EXCLUDED.value,
              updated_at = now();
          `;
        }
      } catch (dbErr) {
        console.warn("[SiteTheme] Error saving to Neon DB:", dbErr);
      }
    }

    // 2. Also write to local store and file as backups
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { loadPersistedRecords, getStoreFilePath, syncStoreSnapshotToNeon } = require("@/lib/persistedData");
      const store = loadPersistedRecords();
      store.siteTheme = merged;
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
      syncStoreSnapshotToNeon(store).catch(() => {});
    } catch {}

    try {
      const dir = path.dirname(THEME_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(THEME_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
    } catch {}

    return true;
  } catch (err) {
    console.error("Failed to save persistent site theme:", err);
    return false;
  }
}

export function savePersistentSiteTheme(theme: Partial<SiteThemeData>): boolean {
  savePersistentSiteThemeAsync(theme).catch(() => {});
  return true;
}
