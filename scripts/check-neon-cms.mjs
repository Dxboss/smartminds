import { neon } from "@neondatabase/serverless";
import fs from "fs";

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync(".env.local")) {
  const env = fs.readFileSync(".env.local", "utf8");
  const m = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (m) dbUrl = m[1];
}

async function main() {
  const sql = neon(dbUrl);
  const rows = await sql`SELECT path, jsonb_array_length(sections) as section_count FROM cms_pages`;
  console.log("CMS Pages in Neon:", rows);
}

main().catch(console.error);
