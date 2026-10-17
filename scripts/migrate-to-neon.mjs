import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv?.config?.({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ Error: DATABASE_URL is not set in environment or .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);


async function runMigration() {
  console.log("🚀 Starting Smartminds PostgreSQL Database Migration on Neon...");

  // 1. Create Tables
  console.log("📦 Creating database tables...");
  
  await sql`
    CREATE TABLE IF NOT EXISTS system_store (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_pages (
      path TEXT PRIMARY KEY,
      sections JSONB NOT NULL,
      draft_sections JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blog_articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      read_time TEXT,
      published_at TEXT,
      excerpt TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS course_catalog (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS learners (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS enrolments (
      id TEXT PRIMARY KEY,
      learner_id TEXT,
      course_id TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      enrolment_id TEXT,
      learner_id TEXT,
      amount NUMERIC,
      status TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      type TEXT,
      name TEXT,
      email TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_credentials (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("✅ Tables created successfully!");

  // 2. Read local persisted data to migrate
  const persistedPath = path.join(process.cwd(), "data", "persisted_records.json");
  let localData = {};
  if (fs.existsSync(persistedPath)) {
    try {
      localData = JSON.parse(fs.readFileSync(persistedPath, "utf8"));
    } catch (e) {
      console.warn("Could not parse persisted_records.json", e);
    }
  }

  // 3. Migrate CMS Pages
  if (localData.cmsPagesData) {
    console.log("📄 Migrating CMS Pages...");
    for (const [pagePath, sections] of Object.entries(localData.cmsPagesData)) {
      const draft = localData.cmsPagesDraftData?.[pagePath]?.sections || null;
      await sql`
        INSERT INTO cms_pages (path, sections, draft_sections, updated_at)
        VALUES (${pagePath}, ${JSON.stringify(sections)}, ${draft ? JSON.stringify(draft) : null}, now())
        ON CONFLICT (path) DO UPDATE SET
          sections = EXCLUDED.sections,
          draft_sections = EXCLUDED.draft_sections,
          updated_at = now();
      `;
      console.log(`  ✓ Migrated CMS page: ${pagePath}`);
    }
  }

  // 4. Migrate Courses
  if (localData.courseOverrides) {
    console.log("🎓 Migrating Course Overrides...");
    for (const [courseId, courseData] of Object.entries(localData.courseOverrides)) {
      await sql`
        INSERT INTO course_catalog (id, title, data, updated_at)
        VALUES (${courseId}, ${courseData.title || courseId}, ${JSON.stringify(courseData)}, now())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          data = EXCLUDED.data,
          updated_at = now();
      `;
    }
  }

  // 5. Migrate Blog Posts
  if (localData.blogPosts && Array.isArray(localData.blogPosts)) {
    console.log("✍️ Migrating Blog Posts...");
    for (const post of localData.blogPosts) {
      await sql`
        INSERT INTO blog_articles (id, slug, title, category, read_time, published_at, excerpt, data, updated_at)
        VALUES (${post.id}, ${post.slug}, ${post.title}, ${post.category}, ${post.readTime}, ${post.publishedAt}, ${post.excerpt}, ${JSON.stringify(post)}, now())
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          read_time = EXCLUDED.read_time,
          published_at = EXCLUDED.published_at,
          excerpt = EXCLUDED.excerpt,
          data = EXCLUDED.data,
          updated_at = now();
      `;
      console.log(`  ✓ Migrated article: ${post.title}`);
    }
  }

  // 6. Migrate Payment Records
  if (localData.paymentRecords && Array.isArray(localData.paymentRecords)) {
    console.log("💳 Migrating Payment Records...");
    for (const rec of localData.paymentRecords) {
      await sql`
        INSERT INTO payments (id, enrolment_id, learner_id, amount, status, data, created_at)
        VALUES (${rec.id}, ${rec.enrolmentId || null}, ${rec.learnerId || null}, ${rec.amountGbp || 0}, ${rec.status || "paid"}, ${JSON.stringify(rec)}, now())
        ON CONFLICT (id) DO UPDATE SET
          amount = EXCLUDED.amount,
          status = EXCLUDED.status,
          data = EXCLUDED.data;
      `;
    }
  }

  // 7. Migrate Full Snapshot into system_store for instant sync
  console.log("💾 Storing master store backup in PostgreSQL system_store...");
  await sql`
    INSERT INTO system_store (key, value, updated_at)
    VALUES ('master_records_store', ${JSON.stringify(localData)}, now())
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = now();
  `;

  console.log("🎉 Migration Complete! All tables and data are LIVE in Neon PostgreSQL (London).");
}

runMigration().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
