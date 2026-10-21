import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const DEFAULT_COLOR_SWATCHES = [
  { id: "swatch-navy-900", name: "Deep Royal Navy", hex: "#23216B", category: "primary", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-oceanic-blue", name: "Oceanic Blue (Client Brand)", hex: "#13416B", category: "custom", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-navy-700", name: "Classic Navy", hex: "#34318F", category: "primary", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-gold-500", name: "British Academic Gold", hex: "#D9B84A", category: "accent", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-gold-700", name: "Muted Antique Gold", hex: "#B78A2E", category: "accent", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-mint", name: "Fresh Mint", hex: "#E8F4F1", category: "secondary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-peach", name: "Warm Peach", hex: "#FFEDD5", category: "secondary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-lavender", name: "Soft Lavender Mist", hex: "#F3E8FF", category: "secondary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-sky", name: "Sky Mist", hex: "#EBF5FB", category: "secondary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-coral", name: "Coral Promotional", hex: "#E53935", category: "accent", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-paper", name: "Parchment Paper", hex: "#FAF8F3", category: "primary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-white", name: "Pure White", hex: "#FFFFFF", category: "primary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
];

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync(".env.local")) {
  const env = fs.readFileSync(".env.local", "utf8");
  const m = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (m) dbUrl = m[1];
}

async function main() {
  const filePath = path.join(process.cwd(), "data", "persisted_records.json");
  let store = {};
  if (fs.existsSync(filePath)) {
    store = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  // Preserve existing swatches if present, but ensure default ones including Oceanic Blue are present
  const existingSwatches = Array.isArray(store.colorSwatches) ? store.colorSwatches : [];
  const mergedSwatches = [...DEFAULT_COLOR_SWATCHES];
  for (const s of existingSwatches) {
    if (!mergedSwatches.some((m) => m.id === s.id || m.hex.toLowerCase() === s.hex.toLowerCase())) {
      mergedSwatches.push(s);
    }
  }

  store.colorSwatches = mergedSwatches;
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf8");
  console.log(`[Local] Successfully saved ${mergedSwatches.length} color swatches to data/persisted_records.json`);

  if (dbUrl) {
    const sql = neon(dbUrl);
    await sql`
      INSERT INTO system_store (key, value, updated_at)
      VALUES ('master_records_store', ${JSON.stringify(store)}, now())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = now();
    `;
    console.log(`[Neon DB] Successfully synchronized master_records_store with colorSwatches to cloud system_store`);
  } else {
    console.log(`[Neon DB] No DATABASE_URL found, skipped cloud sync.`);
  }
}

main().catch((err) => {
  console.error("Failed to seed swatches:", err);
  process.exit(1);
});
