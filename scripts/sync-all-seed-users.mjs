import { neon } from "@neondatabase/serverless";
import fs from "fs";
import { hashPassword } from "../src/lib/passwords";
import { seedUsers } from "../src/lib/repositories/seedData";

async function main() {
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl && fs.existsSync(".env.example")) {
    const env = fs.readFileSync(".env.example", "utf8");
    const m = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (m) dbUrl = m[1];
  }
  const sql = neon(dbUrl);

  const defaultPw = "Smartminds2026!";
  const pwHash = hashPassword(defaultPw);

  console.log(`Seeding/updating ${seedUsers.length} staff & admin users into user_credentials...`);

  for (const u of seedUsers) {
    const email = u.email.toLowerCase().trim();
    const dataObj = {
      id: u.id,
      name: u.name,
      email: email,
      role: u.role,
      tutorId: u.tutorId,
      learnerId: u.learnerId,
      specialism: u.specialism,
      department: u.department,
      temporaryPassword: defaultPw,
      passwordHash: pwHash,
      mustChangePassword: false,
    };

    await sql`
      INSERT INTO user_credentials (
        id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at, updated_at
      )
      VALUES (
        ${u.id},
        ${email},
        ${u.name},
        ${u.role},
        ${u.active ?? true},
        ${u.tutorId || null},
        ${u.learnerId || null},
        ${u.specialism || null},
        ${u.department || null},
        ${JSON.stringify(dataObj)}::jsonb,
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        active = EXCLUDED.active,
        tutor_id = EXCLUDED.tutor_id,
        learner_id = EXCLUDED.learner_id,
        specialism = EXCLUDED.specialism,
        department = EXCLUDED.department,
        data = EXCLUDED.data,
        updated_at = now();
    `;
    console.log(`  ✓ Synced ${u.role}: ${u.name} (${email})`);
  }

  const allInDb = await sql`SELECT id, email, name, role, active FROM user_credentials ORDER BY role, name;`;
  console.log(`\nSuccessfully verified ${allInDb.length} users in Neon user_credentials!`);
}

main().catch(console.error);
