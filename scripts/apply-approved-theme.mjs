import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

const persistedPath = path.join(process.cwd(), "data", "persisted_records.json");
const data = JSON.parse(fs.readFileSync(persistedPath, "utf8"));

if (!data.cmsPagesData) data.cmsPagesData = {};
if (!data.cmsPagesData["/"]) {
  console.error("No homepage sections found in persisted_records.json");
  process.exit(1);
}

const sections = data.cmsPagesData["/"];

// Apply the approved design tokens, copy, and alternating rhythmic color cadence
for (const sec of sections) {
  if (sec.id === "sec-hero-01") {
    sec.bgColor = "paper";
    sec.badgeText = "OFQUAL REGULATED BRITISH QUALIFICATIONS";
    sec.headline = "Regulated British Qualifications for Healthcare & Education Leaders";
    sec.subheadline =
      "Achieve nationally recognised RQF diplomas with dedicated 1-on-1 assessor support. Study at your own pace to become a CQC Registered Manager or Senior Educator.";
    sec.buttonText = "Explore Diplomas";
    sec.buttonLink = "#courses";
    sec.secondaryButtonText = "Speak with an Assessor";
    sec.secondaryButtonLink = "/book";
    sec.floatingBadgeTitle = "Level 5 Registered Manager";
    sec.floatingBadgeSubtitle = "98% Pass Rate • CQC Recognized";
    sec.floatingBadgeIcon = "shield-check";
    sec.floatingBadgeEnabled = true;
  } else if (sec.id === "sec-trust-02") {
    sec.bgColor = "navy";
    sec.headline = "OFFICIAL AWARDING & REGULATED BODIES";
    sec.subheadline = "Rated 4.9/5 by 300+ UK Healthcare & Education Professionals";
  } else if (sec.id === "sec-pathway-03") {
    sec.bgColor = "white";
    sec.headline = "Specialist Career Pathways";
    sec.subheadline = "Select your sector to discover regulated qualifications and salary outcomes.";
  } else if (sec.id === "sec-courses-06") {
    sec.bgColor = "paper";
    sec.headline = "Explore Regulated Qualifications & Diplomas";
    sec.subheadline =
      "Ofqual regulated RQF diplomas with transparent fees and 0% interest monthly instalment options. Every programme includes your dedicated personal assessor.";
  } else if (sec.id === "sec-journey-04") {
    sec.bgColor = "white";
    sec.headline = "Your 4-Step Pathway to Awarding Body Certification";
    sec.subheadline =
      "From initial induction to receiving your official certificate, your assessor guides you through workplace evidence with zero exam pressure.";
  } else if (sec.id === "sec-pricing-05") {
    sec.bgColor = "navy";
    sec.headline = "Transparent Tuition with Institutional Guarantees";
    sec.subheadline =
      "Spread fees over 12 months with 0% interest, or pay in full and save. Awarding body registration and certificate fees are always included.";
  } else if (sec.id === "sec-testimonials-07") {
    sec.bgColor = "paper";
    sec.headline = "Taught & Mentored by Senior Qualified Assessors";
    sec.subheadline =
      "Our tutors are active CQC Registered Managers and Early Years inspectors dedicated to mentoring working adults with empathy, not bureaucracy.";
  } else if (sec.id === "sec-faqs-08") {
    sec.bgColor = "white";
  } else if (sec.id === "sec-cta-09") {
    sec.bgColor = "navy";
  }
}

// Save locally
fs.writeFileSync(persistedPath, JSON.stringify(data, null, 2), "utf8");
console.log("✅ Updated persisted_records.json with approved rhythmic theme!");

// Sync directly to Neon PostgreSQL
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync(".env.local")) {
  const env = fs.readFileSync(".env.local", "utf8");
  const m = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (m) dbUrl = m[1];
}

if (dbUrl) {
  const sql = neon(dbUrl);
  await sql`
    INSERT INTO cms_pages (path, sections, updated_at)
    VALUES ('/', ${JSON.stringify(sections)}, now())
    ON CONFLICT (path) DO UPDATE SET
      sections = EXCLUDED.sections,
      updated_at = now();
  `;
  console.log("✅ Synced updated homepage directly to Neon PostgreSQL!");
}
