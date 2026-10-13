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
  try {
    if (fs.existsSync(THEME_FILE_PATH)) {
      const raw = fs.readFileSync(THEME_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        headerNav: { ...defaultHeaderNavConfig, ...parsed.headerNav },
        footer: { ...defaultFooterConfig, ...parsed.footer },
      };
    }
  } catch (err) {
    console.error("Failed to read persistent site theme:", err);
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

    const dir = path.dirname(THEME_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(THEME_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to write persistent site theme:", err);
    return false;
  }
}
