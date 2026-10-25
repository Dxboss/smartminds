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

export function getPersistentSiteTheme(): SiteThemeData {
  // 1. Primary Priority: Check persistent database store (Neon DB / data/persisted_records.json)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadPersistedRecords } = require("@/lib/persistedData");
    const store = loadPersistedRecords();
    if (store && store.siteTheme && (store.siteTheme.headerNav || store.siteTheme.footer)) {
      return {
        headerNav: { ...defaultHeaderNavConfig, ...(store.siteTheme.headerNav || {}) },
        footer: { ...defaultFooterConfig, ...(store.siteTheme.footer || {}) },
      };
    }
  } catch (err) {
    // Fallback to local static file if database store isn't available
  }

  // 2. Secondary Fallback: Read static JSON file (src/content/siteTheme.json)
  try {
    if (fs.existsSync(THEME_FILE_PATH)) {
      const raw = fs.readFileSync(THEME_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        headerNav: { ...defaultHeaderNavConfig, ...(parsed.headerNav || {}) },
        footer: { ...defaultFooterConfig, ...(parsed.footer || {}) },
      };
    }
  } catch (err) {
    console.error("Failed to read persistent site theme from file:", err);
  }

  return {
    headerNav: defaultHeaderNavConfig,
    footer: defaultFooterConfig,
  };
}

export function savePersistentSiteTheme(theme: Partial<SiteThemeData>): boolean {
  try {
    const current = getPersistentSiteTheme();
    const merged: SiteThemeData = {
      headerNav: { ...current.headerNav, ...(theme.headerNav || {}) },
      footer: { ...current.footer, ...(theme.footer || {}) },
    };

    // 1. Primary Save: Write into persistent database store and sync to Neon PostgreSQL
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { loadPersistedRecords, getStoreFilePath, syncStoreSnapshotToNeon } = require("@/lib/persistedData");
      const store = loadPersistedRecords();
      store.siteTheme = merged;
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
      syncStoreSnapshotToNeon(store).catch((err: any) => {
        console.warn("[SiteTheme] Neon cloud backup notice:", err?.message || err);
      });
    } catch (storeErr) {
      console.warn("[SiteTheme] Failed to write into database store:", storeErr);
    }

    // 2. Secondary Save: Write to local static JSON file as a local fallback
    try {
      const dir = path.dirname(THEME_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(THEME_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
    } catch (fileErr) {
      console.warn("[SiteTheme] Notice writing local siteTheme.json:", fileErr);
    }

    return true;
  } catch (err) {
    console.error("Failed to write persistent site theme:", err);
    return false;
  }
}
