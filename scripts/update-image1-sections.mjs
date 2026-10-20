import fs from "fs";
import path from "path";
let databaseUrl = process.env.DATABASE_URL;
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf-8");
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match) databaseUrl = match[1];
}

const filePath = path.resolve("./data/persisted_records.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const image1Sections = [
  {
    id: "sec-hero-01",
    type: "hero",
    name: "Hero Banner",
    enabled: true,
    headline: "Grow up your skills by accredited UK courses with Smartminds",
    subheadline:
      "Flexible, tutor-led online courses designed for working adults. Study recognised British qualifications with 0% interest monthly instalment options.",
    badgeText: "Accredited UK Qualifications",
    buttonText: "Explore Courses",
    buttonLink: "#popular-courses",
    secondaryButtonText: "Speak with an Assessor",
    secondaryButtonLink: "/book",
    bgColor: "mint",
    image: "/images/hero-student-thumbsup.jpg",
    floatingBadgeTitle: "180+ Enrolled Learners",
    floatingBadgeSubtitle: "98% Pass Rate • CQC Recognised",
    floatingBadgeIcon: "users",
    floatingBadgeEnabled: true,
  },
  {
    id: "sec-courses-06",
    type: "featured_courses",
    name: "Popular Courses",
    enabled: true,
    headline: "Popular Courses",
    subheadline:
      "Explore our most requested British diplomas. Every programme features live tutor-led sessions, continuous mentor support, and flexible instalment schedules.",
    buttonText: "Browse complete qualification catalogue",
    buttonLink: "/courses",
    bgColor: "white",
    columns: 4,
  },
  {
    id: "sec-pathway-03",
    type: "choose_path",
    name: "Courses Category",
    enabled: true,
    headline: "Courses Category",
    subheadline:
      "Online learning has revolutionized British qualifications, providing flexible accredited pathways across vital care and educational sectors.",
    bgColor: "white",
    columns: 4,
    items: [
      {
        title: "Childcare & Early Years",
        desc: "Accredited British qualifications for nursery educators, childminders, and preschool practitioners.",
        tag: "EYE Level 3",
        badge: "Licence to Practise",
        icon: "user",
        link: "/courses?category=Early+Years",
      },
      {
        title: "Healthcare & Social Care",
        desc: "From care assistant foundational certificates to Level 5 CQC Registered Manager leadership diplomas.",
        tag: "Levels 2 – 5",
        badge: "Ofqual Regulated",
        icon: "shield-check",
        link: "/courses?category=Health+%26+Social+Care",
      },
      {
        title: "Teaching Assistant & AET",
        desc: "Qualify to teach in further education colleges and support teachers in UK schools and academies.",
        tag: "AET & CAVA",
        badge: "Live Mentoring",
        icon: "graduation-cap",
        link: "/courses?category=Teaching",
      },
      {
        title: "Health & Social Care Leadership",
        desc: "Supervisory and registered management diplomas meeting CQC regulations for residential and domiciliary care.",
        tag: "Level 5 Diploma",
        badge: "CQC Approved",
        icon: "book-open",
        link: "/courses/diploma-in-leadership-health-social-care",
      },
    ],
  },
  {
    id: "sec-student-id",
    type: "student_benefits",
    name: "Student ID Card & Perks",
    enabled: true,
    headline: "Get a Free Student ID Card & Enjoy Exclusive Student Benefits!",
    subheadline:
      "Every enrolled Smartminds learner receives an official digital and physical Student ID card, unlocking discounts across retail, software, and transit.",
  },
  {
    id: "sec-staff-training",
    type: "staff_training",
    name: "Corporate & Team Staff Training",
    enabled: true,
    headline: "Are you looking to train your staff?",
    subheadline:
      "Upskill your care or education workforce with accredited British qualifications, group rates, and dedicated progress reporting.",
  },
  {
    id: "sec-coral-promo",
    type: "coral_promo",
    name: "Promotional Discount Banner",
    enabled: true,
    headline: "Limited Offer: Get Extra 15% Off with code",
    buttonText: "Browse Eligible Courses",
    buttonLink: "/courses",
  },
  {
    id: "sec-exclusive-bundles",
    type: "exclusive_bundles",
    name: "Exclusive Course Bundles",
    enabled: true,
    headline: "Our Exclusive Course Bundles",
    subheadline:
      "Save up to £350 when combining foundational certificates with advanced supervisory diplomas.",
  },
];

function buildExactOrderedSections(existingSections) {
  if (!Array.isArray(existingSections)) return image1Sections;

  const result = [...image1Sections];

  // Keep other existing sections at the bottom, disabled by default so client gets exact Image 1 view
  const handledIds = new Set(image1Sections.map((s) => s.id));
  existingSections.forEach((s) => {
    if (!handledIds.has(s.id)) {
      result.push({
        ...s,
        enabled: false,
      });
      handledIds.add(s.id);
    }
  });

  return result;
}

if (!data.cmsPagesData) data.cmsPagesData = {};
data.cmsPagesData["/"] = buildExactOrderedSections(data.cmsPagesData["/"]);

if (!data.cmsPagesDraftData) data.cmsPagesDraftData = {};
if (data.cmsPagesDraftData["/"]) {
  data.cmsPagesDraftData["/"] = {
    sections: buildExactOrderedSections(data.cmsPagesDraftData["/"]?.sections),
    updatedAt: new Date().toISOString(),
  };
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
console.log("✓ Successfully saved exact Image 1 sections into persisted_records.json");

// Sync directly to Neon PostgreSQL if DATABASE_URL is available
if (databaseUrl) {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(databaseUrl);
    const published = data.cmsPagesData["/"];
    const draft = data.cmsPagesDraftData["/"]?.sections || null;

    await sql`
      INSERT INTO cms_pages (path, sections, draft_sections, updated_at)
      VALUES ('/', ${JSON.stringify(published)}, ${draft ? JSON.stringify(draft) : null}, now())
      ON CONFLICT (path) DO UPDATE SET
        sections = EXCLUDED.sections,
        draft_sections = EXCLUDED.draft_sections,
        updated_at = now();
    `;
    console.log("✓ Successfully synced exact Image 1 sections to Neon PostgreSQL cms_pages table!");
  } catch (err) {
    console.warn("⚠️ Neon DB sync skipped/failed:", err.message);
  }
}
