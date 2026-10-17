import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Read from process.env or parse .env.local
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match) databaseUrl = match[1];
}

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

async function main() {
  console.log("Connecting to Neon PostgreSQL...");
  const sql = neon(databaseUrl);
  const result =
    await sql`SELECT version(), current_database(), current_user, now()`;
  console.log("✅ Neon PostgreSQL Connection Successful!");
  console.log(result);
}

main().catch((err) => {
  console.error("❌ Database connection error:", err);
  process.exit(1);
});
