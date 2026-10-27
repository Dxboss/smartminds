import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

async function main() {
  const coursesPath = path.join(process.cwd(), "src", "content", "courses.ts");
  let content = fs.readFileSync(coursesPath, "utf-8");

  // Replace old ad-hoc category names with the canonical 7 faculty names
  content = content.replace(/category:\s*"Childcare & Education"/g, 'category: "Childcare & Early Years"');
  content = content.replace(/category:\s*"Education & Teaching"/g, 'category: "Education & Training"');
  content = content.replace(/category:\s*"Business & Management"/g, 'category: "Business & Office Administration"');
  content = content.replace(/category:\s*"Continuing Professional Development"/g, 'category: "Department of CPD & Compliance"');

  fs.writeFileSync(coursesPath, content, "utf-8");
  console.log("✓ Updated src/content/courses.ts to use canonical 7 faculties");

  // Also update persisted_records.json courseOverrides if present
  const storePath = path.join(process.cwd(), "data", "persisted_records.json");
  if (fs.existsSync(storePath)) {
    const raw = fs.readFileSync(storePath, "utf-8");
    let store = JSON.parse(raw);
    if (store.courseOverrides) {
      for (const [id, c] of Object.entries(store.courseOverrides)) {
        if (c.category === "Childcare & Education") c.category = "Childcare & Early Years";
        if (c.category === "Education & Teaching") c.category = "Education & Training";
        if (c.category === "Business & Management") c.category = "Business & Office Administration";
        if (c.category === "Continuing Professional Development") c.category = "Department of CPD & Compliance";
      }
    }
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
    console.log("✓ Updated data/persisted_records.json courseOverrides");
  }

  // Update Neon course_catalog
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl && fs.existsSync(".env.example")) {
    const env = fs.readFileSync(".env.example", "utf8");
    const m = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (m) dbUrl = m[1];
  }
  if (dbUrl) {
    const sql = neon(dbUrl);
    await sql`UPDATE course_catalog SET category = 'Childcare & Early Years' WHERE category = 'Childcare & Education';`;
    await sql`UPDATE course_catalog SET category = 'Education & Training' WHERE category = 'Education & Teaching';`;
    await sql`UPDATE course_catalog SET category = 'Business & Office Administration' WHERE category = 'Business & Management';`;
    await sql`UPDATE course_catalog SET category = 'Department of CPD & Compliance' WHERE category = 'Continuing Professional Development';`;
    console.log("✓ Updated Neon course_catalog table categories");
  }
}

main().catch(console.error);
