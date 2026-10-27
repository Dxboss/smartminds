import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

async function main() {
  const filePath = path.join(process.cwd(), "data", "persisted_records.json");
  if (!fs.existsSync(filePath)) {
    console.log("No persisted_records.json found");
    return;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  console.log(`Initial file size: ${(Buffer.byteLength(raw, "utf8") / 1024 / 1024).toFixed(2)} MB`);

  let parsed = JSON.parse(raw);

  // Recursively sanitize any object with base64 data URLs
  let strippedCount = 0;
  function sanitizeNode(obj) {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "string" && val.startsWith("data:image/")) {
        console.log(`Found base64 image at key "${key}" (length ${val.length})`);
        // Replace with fallback static asset
        if (key === "image" || key === "heroImage" || key === "banner") {
          obj[key] = "/images/adult-care-training.jpg";
        } else {
          obj[key] = "/images/certificate-moment.jpg";
        }
        strippedCount++;
      } else if (typeof val === "object") {
        sanitizeNode(val);
      }
    }
  }

  sanitizeNode(parsed);

  const cleanJson = JSON.stringify(parsed, null, 2);
  fs.writeFileSync(filePath, cleanJson, "utf-8");
  console.log(`Stripped ${strippedCount} base64 image strings.`);
  console.log(`Optimized file size: ${(Buffer.byteLength(cleanJson, "utf8") / 1024).toFixed(2)} KB`);

  // Sync optimized snapshot to Neon system_store
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl && fs.existsSync(".env.example")) {
    const env = fs.readFileSync(".env.example", "utf8");
    const m = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (m) dbUrl = m[1];
  }

  if (dbUrl) {
    const sql = neon(dbUrl);
    console.log("Syncing optimized master state to Neon system_store...");
    await sql`
      INSERT INTO system_store (key, value, updated_at)
      VALUES ('master_records_store', ${cleanJson}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = now();
    `;
    console.log("✓ Neon system_store updated with optimized lightweight payload.");
  }
}

main().catch(console.error);
