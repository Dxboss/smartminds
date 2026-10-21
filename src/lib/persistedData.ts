import fs from "fs";
import path from "path";
import {
  Learner,
  Enrolment,
  PaymentRecord,
  PaymentScheduleItem,
  BlockedDay,
  AvailabilityRule,
  Booking,
  CohortScheduleConfig,
  EnquiryLead,
  PaymentGatewaySettings,
} from "@/lib/repositories/types";
import type { Course } from "@/content/types";
import type { BlogPost } from "@/content/blog";

export interface PersistedUserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  learnerId?: string;
  temporaryPassword?: string;
  passwordHash?: string;
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface PasswordResetTokenRecord {
  token: string;
  email: string;
  expiresAt: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  subscribedAt: string;
  source?: string;
}

export interface PersistedRecordsStore {
  learners: Learner[];
  enrolments: Enrolment[];
  paymentRecords: PaymentRecord[];
  paymentSchedules?: PaymentScheduleItem[];
  userCredentials?: PersistedUserRecord[];
  passwordResetTokens?: PasswordResetTokenRecord[];
  cmsPagesData?: Record<string, any>;
  cmsPagesDraftData?: Record<string, { sections: any[]; updatedAt: string }>;
  courseOverrides?: Record<string, any>;
  cohorts?: any[];
  classSessions?: any[];
  blockedDays?: BlockedDay[];
  availabilityRules?: AvailabilityRule[];
  bookings?: Booking[];
  enquiries?: EnquiryLead[];
  globalGraceDays?: number;
  cohortSchedule?: CohortScheduleConfig;
  paymentGatewaySettings?: PaymentGatewaySettings;
  blogPosts?: BlogPost[];
  faculties?: FacultyRecord[];
  subscribers?: NewsletterSubscriber[];
  colorSwatches?: ColorSwatch[];
}

import { type ColorSwatch, DEFAULT_COLOR_SWATCHES } from "./colorSwatches";
export { type ColorSwatch, DEFAULT_COLOR_SWATCHES };

import { type FacultyRecord, DEFAULT_COLLEGE_FACULTIES } from "@/content/faculties";
export { type FacultyRecord, DEFAULT_COLLEGE_FACULTIES };

function getStoreFilePath(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "persisted_records.json");
}

export function loadPersistedRecords(): PersistedRecordsStore {
  try {
    const filePath = getStoreFilePath();
    if (!fs.existsSync(filePath)) {
      return {
        learners: [],
        enrolments: [],
        paymentRecords: [],
        paymentSchedules: [],
        userCredentials: [],
        cmsPagesData: {},
        courseOverrides: {},
        cohorts: [],
        classSessions: [],
      };
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      learners: Array.isArray(parsed.learners) ? parsed.learners : [],
      enrolments: Array.isArray(parsed.enrolments) ? parsed.enrolments : [],
      paymentRecords: Array.isArray(parsed.paymentRecords)
        ? parsed.paymentRecords
        : [],
      paymentSchedules: Array.isArray(parsed.paymentSchedules)
        ? parsed.paymentSchedules
        : [],
      userCredentials: Array.isArray(parsed.userCredentials)
        ? parsed.userCredentials
        : [],
      passwordResetTokens: Array.isArray(parsed.passwordResetTokens)
        ? parsed.passwordResetTokens
        : [],
      cmsPagesData:
        parsed.cmsPagesData && typeof parsed.cmsPagesData === "object"
          ? parsed.cmsPagesData
          : {},
      cmsPagesDraftData:
        parsed.cmsPagesDraftData && typeof parsed.cmsPagesDraftData === "object"
          ? parsed.cmsPagesDraftData
          : {},
      courseOverrides:
        parsed.courseOverrides && typeof parsed.courseOverrides === "object"
          ? parsed.courseOverrides
          : {},
      cohorts: Array.isArray(parsed.cohorts) ? parsed.cohorts : [],
      classSessions: Array.isArray(parsed.classSessions)
        ? parsed.classSessions
        : [],
      blockedDays: Array.isArray(parsed.blockedDays) ? parsed.blockedDays : undefined,
      availabilityRules: Array.isArray(parsed.availabilityRules) ? parsed.availabilityRules : undefined,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : undefined,
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
      globalGraceDays: typeof parsed.globalGraceDays === "number" ? parsed.globalGraceDays : undefined,
      cohortSchedule:
        parsed.cohortSchedule && typeof parsed.cohortSchedule === "object"
          ? parsed.cohortSchedule
          : undefined,
      paymentGatewaySettings:
        parsed.paymentGatewaySettings && typeof parsed.paymentGatewaySettings === "object"
          ? parsed.paymentGatewaySettings
          : undefined,
      blogPosts: Array.isArray(parsed.blogPosts) ? parsed.blogPosts : undefined,
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
    };
  } catch (err) {
    console.error("[persistedData] Failed to load store:", err);
    return {
      learners: [],
      enrolments: [],
      paymentRecords: [],
      paymentSchedules: [],
      userCredentials: [],
      cmsPagesData: {},
      courseOverrides: {},
      cohorts: [],
      classSessions: [],
      subscribers: [],
    };
  }
}

/**
 * Asynchronously synchronizes the full state snapshot into Neon PostgreSQL system_store.
 * Acts as an immutable cloud backup whenever changes occur.
 */
export async function syncStoreSnapshotToNeon(store: PersistedRecordsStore): Promise<boolean> {
  if (
    typeof window !== "undefined" ||
    !process.env.DATABASE_URL ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return false;
  }

  try {
    const { isDbConfigured, sql, ensureDbTablesExist } = await import("@/lib/db");
    if (!isDbConfigured) return false;

    await ensureDbTablesExist();
    await sql`
      INSERT INTO system_store (key, value, updated_at)
      VALUES ('master_records_store', ${JSON.stringify(store)}, now())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = now();
    `;
    return true;
  } catch (err) {
    console.warn("[Neon DB] Notice: system_store sync:", err);
    return false;
  }
}

/**
 * Pulls master snapshot from Neon PostgreSQL if local file is missing/empty or out of sync.
 * Guarantees that Hostinger deployments and local environments restore instantly after git push.
 */
export async function pullLatestFromNeon(): Promise<boolean> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return false;
  }

  try {
    const { isDbConfigured, sql, ensureDbTablesExist } = await import("@/lib/db");
    if (!isDbConfigured) return false;

    await ensureDbTablesExist();

    const rows: any = await sql`
      SELECT value FROM system_store WHERE key = 'master_records_store' LIMIT 1
    `;

    if (rows && rows.length > 0 && rows[0]?.value) {
      const dbStore = rows[0].value as PersistedRecordsStore;
      const store = loadPersistedRecords();

      const mergedStore: PersistedRecordsStore = {
        ...store,
        ...dbStore,
        courseOverrides: {
          ...(store.courseOverrides || {}),
          ...(dbStore.courseOverrides || {}),
        },
        cmsPagesData: {
          ...(store.cmsPagesData || {}),
          ...(dbStore.cmsPagesData || {}),
        },
        cmsPagesDraftData: {
          ...(store.cmsPagesDraftData || {}),
          ...(dbStore.cmsPagesDraftData || {}),
        },
        faculties:
          Array.isArray(dbStore.faculties)
            ? dbStore.faculties
            : store.faculties,
        learners:
          Array.isArray(dbStore.learners)
            ? dbStore.learners
            : store.learners,
        subscribers:
          Array.isArray(dbStore.subscribers)
            ? dbStore.subscribers
            : store.subscribers,
        cohorts:
          Array.isArray(dbStore.cohorts)
            ? dbStore.cohorts
            : store.cohorts,
        classSessions:
          Array.isArray(dbStore.classSessions)
            ? dbStore.classSessions
            : store.classSessions,
        paymentRecords:
          Array.isArray(dbStore.paymentRecords)
            ? dbStore.paymentRecords
            : store.paymentRecords,
        paymentSchedules:
          Array.isArray(dbStore.paymentSchedules)
            ? dbStore.paymentSchedules
            : store.paymentSchedules,
        enrolments:
          Array.isArray(dbStore.enrolments)
            ? dbStore.enrolments
            : store.enrolments,
        enquiries:
          Array.isArray(dbStore.enquiries)
            ? dbStore.enquiries
            : store.enquiries,
        bookings:
          Array.isArray(dbStore.bookings)
            ? dbStore.bookings
            : store.bookings,
        blogPosts:
          Array.isArray(dbStore.blogPosts)
            ? dbStore.blogPosts
            : store.blogPosts,
        userCredentials:
          Array.isArray(dbStore.userCredentials)
            ? dbStore.userCredentials
            : store.userCredentials,
        colorSwatches:
          Array.isArray(dbStore.colorSwatches) && dbStore.colorSwatches.length > 0
            ? dbStore.colorSwatches
            : store.colorSwatches || DEFAULT_COLOR_SWATCHES,
      };

      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(mergedStore, null, 2));
      syncPersistedRecords(true);
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[Neon DB] Notice: pullLatestFromNeon:", err);
    return false;
  }
}

export function savePersistedRecord(data: {
  learner?: Learner;
  enrolment?: Enrolment;
  paymentRecord?: PaymentRecord;
  paymentSchedules?: PaymentScheduleItem[];
  tempPassword?: string;
  mustChangePassword?: boolean;
}): void {
  try {
    const store = loadPersistedRecords();
    const filePath = getStoreFilePath();

    if (data.learner) {
      const idx = store.learners.findIndex((l) => l.id === data.learner!.id);
      if (idx >= 0) {
        store.learners[idx] = data.learner;
      } else {
        store.learners.unshift(data.learner);
      }

      if (!store.userCredentials) store.userCredentials = [];
      const userIdx = store.userCredentials.findIndex(
        (u) => u.email.toLowerCase() === data.learner!.email.toLowerCase()
      );
      const userRec: PersistedUserRecord = {
        id: data.learner.userId,
        email: data.learner.email,
        name: `${data.learner.firstName} ${data.learner.lastName}`,
        role: "student",
        learnerId: data.learner.id,
        temporaryPassword: data.tempPassword,
        mustChangePassword: data.mustChangePassword ?? true,
        createdAt: data.learner.enrolmentDate,
      };

      if (userIdx >= 0) {
        store.userCredentials[userIdx] = {
          ...store.userCredentials[userIdx],
          ...userRec,
          temporaryPassword: data.tempPassword || store.userCredentials[userIdx].temporaryPassword,
        };
      } else {
        store.userCredentials.unshift(userRec);
      }
    }

    if (data.enrolment) {
      const idx = store.enrolments.findIndex((e) => e.id === data.enrolment!.id);
      if (idx >= 0) {
        store.enrolments[idx] = data.enrolment;
      } else {
        store.enrolments.unshift(data.enrolment);
      }
    }

    if (data.paymentRecord) {
      const idx = store.paymentRecords.findIndex(
        (p) => p.id === data.paymentRecord!.id
      );
      if (idx >= 0) {
        store.paymentRecords[idx] = data.paymentRecord;
      } else {
        store.paymentRecords.unshift(data.paymentRecord);
      }
    }

    if (data.paymentSchedules && data.paymentSchedules.length > 0) {
      if (!store.paymentSchedules) store.paymentSchedules = [];
      for (const sched of data.paymentSchedules) {
        const idx = store.paymentSchedules.findIndex((s) => s.id === sched.id);
        if (idx >= 0) {
          store.paymentSchedules[idx] = sched;
        } else {
          store.paymentSchedules.push(sched);
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));

    // Force memory sync immediately
    syncPersistedRecords(true);

    // Continuous Neon Cloud synchronization
    syncStoreSnapshotToNeon(store);

    if (process.env.DATABASE_URL) {
      import("@/lib/db")
        .then(({ sql }) => {
          if (data.learner) {
            sql`
              INSERT INTO learners (id, email, name, data, created_at, updated_at)
              VALUES (
                ${data.learner.id},
                ${data.learner.email},
                ${data.learner.firstName + ' ' + data.learner.lastName},
                ${JSON.stringify(data.learner)},
                now(),
                now()
              )
              ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                data = EXCLUDED.data,
                updated_at = now();
            `.catch((err) => console.warn("[Neon DB] learners sync error:", err));
          }

          if (data.enrolment) {
            sql`
              INSERT INTO enrolments (id, learner_id, course_id, data, created_at, updated_at)
              VALUES (
                ${data.enrolment.id},
                ${data.enrolment.learnerId},
                ${data.enrolment.courseId},
                ${JSON.stringify(data.enrolment)},
                now(),
                now()
              )
              ON CONFLICT (id) DO UPDATE SET
                learner_id = EXCLUDED.learner_id,
                course_id = EXCLUDED.course_id,
                data = EXCLUDED.data,
                updated_at = now();
            `.catch((err) => console.warn("[Neon DB] enrolments sync error:", err));
          }

          if (data.paymentRecord) {
            sql`
              INSERT INTO payments (id, enrolment_id, learner_id, amount, status, data, created_at)
              VALUES (
                ${data.paymentRecord.id},
                ${data.paymentRecord.enrolmentId || null},
                ${data.paymentRecord.learnerId || null},
                ${data.paymentRecord.amountGbp || 0},
                ${data.paymentRecord.status || "paid"},
                ${JSON.stringify(data.paymentRecord)},
                now()
              )
              ON CONFLICT (id) DO UPDATE SET
                amount = EXCLUDED.amount,
                status = EXCLUDED.status,
                data = EXCLUDED.data;
            `.catch((err) => console.warn("[Neon DB] payments sync error:", err));
          }
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error("[persistedData] Failed to save store:", err);
  }
}

export function updatePaymentScheduleStatusInStore(
  scheduleId: string,
  updates: Partial<PaymentScheduleItem>
): boolean {
  try {
    const store = loadPersistedRecords();
    if (!store.paymentSchedules) store.paymentSchedules = [];
    const idx = store.paymentSchedules.findIndex((s) => s.id === scheduleId);
    if (idx >= 0) {
      store.paymentSchedules[idx] = { ...store.paymentSchedules[idx], ...updates };
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      syncPersistedRecords(true);
      return true;
    }
    return false;
  } catch (err) {
    console.error("[persistedData] Failed to update schedule status:", err);
    return false;
  }
}

export function updateLearnerPasswordInStore(email: string, newPassword: string): boolean {
  try {
    const store = loadPersistedRecords();
    if (!store.userCredentials) store.userCredentials = [];
    const cleanEmail = email.toLowerCase().trim();
    let user = store.userCredentials.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (!user) {
      let role = "student";
      let name = cleanEmail.split("@")[0];
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { seedUsers } = require("@/lib/repositories/seedData");
        const su = seedUsers.find((x: any) => x.email.toLowerCase() === cleanEmail);
        if (su) {
          role = su.role;
          name = su.name;
        }
      } catch {}

      user = {
        id: `user-${Date.now().toString(36)}`,
        email: cleanEmail,
        name,
        role,
        passwordHash: newPassword,
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
      };
      store.userCredentials.push(user);
    } else {
      user.passwordHash = newPassword;
      user.temporaryPassword = undefined;
      user.mustChangePassword = false;
    }

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    return true;
  } catch (err) {
    console.error("[persistedData] Failed to update password:", err);
    return false;
  }
}

export async function savePersistedCmsPage(pagePath: string, sections: any[]): Promise<boolean> {
  try {
    const store = loadPersistedRecords();
    if (!store.cmsPagesData) store.cmsPagesData = {};
    store.cmsPagesData[pagePath] = sections;
    if (store.cmsPagesDraftData && store.cmsPagesDraftData[pagePath]) {
      delete store.cmsPagesDraftData[pagePath];
    }
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);

    // Continuous Neon Cloud synchronization - fully awaited
    await syncStoreSnapshotToNeon(store);

    if (process.env.DATABASE_URL) {
      try {
        const { isDbConfigured, sql } = await import("@/lib/db");
        if (isDbConfigured) {
          await sql`
            INSERT INTO cms_pages (path, sections, draft_sections, updated_at)
            VALUES (${pagePath}, ${JSON.stringify(sections)}, null, now())
            ON CONFLICT (path) DO UPDATE SET
              sections = EXCLUDED.sections,
              draft_sections = null,
              updated_at = now();
          `;
        }
      } catch (err) {
        console.warn("[Neon DB] cms_pages sync error:", err);
      }
    }
    return true;
  } catch (err) {
    console.error("[persistedData] Failed to save CMS page:", err);
    return false;
  }
}

export function getPublishedCmsPageSections(pagePath: string): any[] {
  try {
    const store = loadPersistedRecords();
    if (
      store.cmsPagesData &&
      store.cmsPagesData[pagePath] &&
      Array.isArray(store.cmsPagesData[pagePath]) &&
      store.cmsPagesData[pagePath].length > 0
    ) {
      return store.cmsPagesData[pagePath];
    }
  } catch (err) {
    console.error(`[persistedData] Failed to load published CMS page for "${pagePath}":`, err);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { collegePagesData, defaultPageBuilderSections } = require("@/lib/repositories/seedData");
  return collegePagesData?.[pagePath] || (pagePath === "/" ? defaultPageBuilderSections : []);
}

export function getAllPublishedCmsPages(): Record<string, any[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { collegePagesData } = require("@/lib/repositories/seedData");
  try {
    const store = loadPersistedRecords();
    if (store.cmsPagesData) {
      return {
        ...(collegePagesData || {}),
        ...store.cmsPagesData,
      };
    }
  } catch (err) {
    console.error("[persistedData] Failed to load all published CMS pages:", err);
  }
  return collegePagesData || {};
}

export function deletePersistedCmsPage(pagePath: string): boolean {
  try {
    const store = loadPersistedRecords();
    let changed = false;
    if (store.cmsPagesData && store.cmsPagesData[pagePath]) {
      delete store.cmsPagesData[pagePath];
      changed = true;
    }
    if (store.cmsPagesDraftData && store.cmsPagesDraftData[pagePath]) {
      delete store.cmsPagesDraftData[pagePath];
      changed = true;
    }
    if (changed) {
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      syncPersistedRecords(true);
      syncStoreSnapshotToNeon(store);

      if (process.env.DATABASE_URL) {
        import("@/lib/db")
          .then(({ sql }) => {
            sql`DELETE FROM cms_pages WHERE path = ${pagePath}`.catch((err) =>
              console.warn("[Neon DB] cms_pages delete error:", err)
            );
          })
          .catch(() => {});
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error("[persistedData] Failed to delete CMS page:", err);
    return false;
  }
}

export function getLiveBlogPosts(): BlogPost[] {
  try {
    const store = loadPersistedRecords();
    if (Array.isArray(store.blogPosts) && store.blogPosts.length > 0) {
      return store.blogPosts;
    }
  } catch (err) {
    console.error("[persistedData] Failed to load live blog posts:", err);
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { blogPosts } = require("@/content/blog");
    return blogPosts || [];
  } catch {
    return [];
  }
}

export function savePersistedBlogPost(post: BlogPost): void {
  try {
    const store = loadPersistedRecords();
    const current = Array.isArray(store.blogPosts) && store.blogPosts.length > 0
      ? [...store.blogPosts]
      : [...getLiveBlogPosts()];

    const existingIdx = current.findIndex(
      (p) => p.id === post.id || p.slug === post.slug
    );
    if (existingIdx >= 0) {
      current[existingIdx] = post;
    } else {
      current.unshift(post);
    }

    store.blogPosts = current;
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);

    // Asynchronous synchronization directly to Neon PostgreSQL
    if (process.env.DATABASE_URL) {
      import("@/lib/db")
        .then(({ sql }) => {
          sql`
            INSERT INTO blog_articles (
              id, slug, title, category, read_time, published_at, excerpt, data, updated_at
            ) VALUES (
              ${post.id},
              ${post.slug},
              ${post.title},
              ${post.category},
              ${post.readTimeMinutes ? `${post.readTimeMinutes} min read` : "5 min read"},
              ${post.publishedAt},
              ${post.excerpt},
              ${JSON.stringify(post)},
              now()
            )
            ON CONFLICT (id) DO UPDATE SET
              slug = EXCLUDED.slug,
              title = EXCLUDED.title,
              category = EXCLUDED.category,
              read_time = EXCLUDED.read_time,
              published_at = EXCLUDED.published_at,
              excerpt = EXCLUDED.excerpt,
              data = EXCLUDED.data,
              updated_at = now();
          `.catch((dbErr) =>
            console.error("[Neon DB] Failed to sync blog post to PostgreSQL:", dbErr)
          );
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error("[persistedData] Failed to save blog post:", err);
    throw err;
  }
}

export function deletePersistedBlogPost(postIdOrSlug: string): void {
  try {
    const store = loadPersistedRecords();
    const current = Array.isArray(store.blogPosts) && store.blogPosts.length > 0
      ? [...store.blogPosts]
      : [...getLiveBlogPosts()];

    store.blogPosts = current.filter(
      (p) => p.id !== postIdOrSlug && p.slug !== postIdOrSlug
    );
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);

    // Asynchronous deletion from Neon PostgreSQL
    if (process.env.DATABASE_URL) {
      import("@/lib/db")
        .then(({ sql }) => {
          sql`DELETE FROM blog_articles WHERE id = ${postIdOrSlug} OR slug = ${postIdOrSlug}`.catch((dbErr) =>
            console.error("[Neon DB] Failed to delete blog post from PostgreSQL:", dbErr)
          );
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error("[persistedData] Failed to delete blog post:", err);
    throw err;
  }
}

export function savePersistedCmsDraft(
  pagePath: string,
  sections: any[]
): { success: boolean; updatedAt: string } {
  try {
    const store = loadPersistedRecords();
    if (!store.cmsPagesDraftData) store.cmsPagesDraftData = {};
    const updatedAt = new Date().toISOString();
    store.cmsPagesDraftData[pagePath] = {
      sections,
      updatedAt,
    };
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    return { success: true, updatedAt };
  } catch (err) {
    console.error("[persistedData] Failed to save CMS draft:", err);
    return { success: false, updatedAt: new Date().toISOString() };
  }
}

export function discardPersistedCmsDraft(pagePath: string): boolean {
  try {
    const store = loadPersistedRecords();
    if (store.cmsPagesDraftData && store.cmsPagesDraftData[pagePath]) {
      delete store.cmsPagesDraftData[pagePath];
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      return true;
    }
    return false;
  } catch (err) {
    console.error("[persistedData] Failed to discard CMS draft:", err);
    return false;
  }
}

export function getPersistedCmsDraft(
  pagePath: string
): { sections: any[]; updatedAt: string } | null {
  try {
    const store = loadPersistedRecords();
    return store.cmsPagesDraftData?.[pagePath] || null;
  } catch (err) {
    return null;
  }
}

export function savePersistedCourse(course: any): void {
  try {
    const store = loadPersistedRecords();
    if (!store.courseOverrides) store.courseOverrides = {};
    store.courseOverrides[course.id] = course;
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);

    // Continuous Neon Cloud synchronization
    syncStoreSnapshotToNeon(store);

    if (process.env.DATABASE_URL) {
      import("@/lib/db")
        .then(({ sql }) => {
          sql`
            INSERT INTO course_catalog (id, title, data, updated_at)
            VALUES (
              ${course.id},
              ${course.title || course.id},
              ${JSON.stringify(course)},
              now()
            )
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              data = EXCLUDED.data,
              updated_at = now();
          `.catch((err) => console.warn("[Neon DB] course_catalog sync error:", err));
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error("[persistedData] Failed to save course override:", err);
  }
}

export function deletePersistedCourse(courseId: string): void {
  try {
    const store = loadPersistedRecords();
    if (store.courseOverrides && store.courseOverrides[courseId]) {
      delete store.courseOverrides[courseId];
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      syncPersistedRecords(true);

      // Continuous Neon Cloud synchronization
      syncStoreSnapshotToNeon(store);

      if (process.env.DATABASE_URL) {
        import("@/lib/db")
          .then(({ sql }) => {
            sql`DELETE FROM course_catalog WHERE id = ${courseId}`.catch((err) =>
              console.warn("[Neon DB] course_catalog delete error:", err)
            );
          })
          .catch(() => {});
      }
    }
  } catch (err) {
    console.error("[persistedData] Failed to delete course override:", err);
  }
}

export function getLiveCourses(): Course[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { courses } = require("@/content/courses");
    const store = loadPersistedRecords();
    if (store.courseOverrides && Object.keys(store.courseOverrides).length > 0) {
      const merged: Course[] = courses.map((c: Course) => {
        if (store.courseOverrides?.[c.id]) {
          return { ...c, ...store.courseOverrides[c.id] };
        }
        return c;
      });
      Object.values(store.courseOverrides).forEach((custom: any) => {
        if (!merged.some((c) => c.id === custom.id)) {
          merged.push(custom);
        }
      });
      return merged;
    }
    return courses;
  } catch (err) {
    console.error("[persistedData] Failed to get live courses:", err);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { courses } = require("@/content/courses");
    return courses;
  }
}

export function savePersistedCohort(cohort: any): void {
  try {
    const store = loadPersistedRecords();
    if (!store.cohorts) store.cohorts = [];
    const idx = store.cohorts.findIndex((c) => c.id === cohort.id);
    if (idx >= 0) {
      store.cohorts[idx] = cohort;
    } else {
      store.cohorts.push(cohort);
    }
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
  } catch (err) {
    console.error("[persistedData] Failed to save cohort:", err);
  }
}

export function savePersistedClassSession(session: any): void {
  try {
    const store = loadPersistedRecords();
    if (!store.classSessions) store.classSessions = [];
    const idx = store.classSessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      store.classSessions[idx] = session;
    } else {
      store.classSessions.push(session);
    }
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
  } catch (err) {
    console.error("[persistedData] Failed to save class session:", err);
  }
}

export function saveBlockedDays(blockedDays: BlockedDay[]): void {
  try {
    const store = loadPersistedRecords();
    store.blockedDays = [...blockedDays];
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
  } catch (err) {
    console.error("[persistedData] Failed to save blocked days:", err);
  }
}

export function saveAvailabilityRules(rules: AvailabilityRule[]): void {
  try {
    const store = loadPersistedRecords();
    store.availabilityRules = [...rules];
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
  } catch (err) {
    console.error("[persistedData] Failed to save availability rules:", err);
  }
}

export function saveBookings(bookings: Booking[]): void {
  try {
    const store = loadPersistedRecords();
    store.bookings = [...bookings];
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
  } catch (err) {
    console.error("[persistedData] Failed to save bookings:", err);
  }
}

export function saveGlobalGraceDays(graceDays: number): void {
  try {
    const store = loadPersistedRecords();
    store.globalGraceDays = graceDays;
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("[persistedData] Failed to save global grace days:", err);
  }
}

export function savePersistedPaymentGatewaySettings(
  settings: PaymentGatewaySettings
): void {
  try {
    const store = loadPersistedRecords();
    store.paymentGatewaySettings = { ...settings };
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
  } catch (err) {
    console.error("[persistedData] Failed to save payment gateway settings:", err);
  }
}

export function syncPersistedRecords(force: boolean = false): void {
  if (typeof window !== "undefined") return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {
      seedLearners,
      seedUsers,
      seedEnrolments,
      seedPaymentRecords,
      seedPaymentSchedules,
      seedClasses,
      seedSessions,
      seedBlockedDays,
      seedAvailabilityRules,
      seedBookings,
      collegePagesData,
      collegePageBuilderSections,
      collegePaymentGatewaySettings,
    } = require("@/lib/repositories/seedData");

    const store = loadPersistedRecords();
    seedLearners.length = 0;
    if (store.learners && Array.isArray(store.learners)) {
      seedLearners.push(...store.learners);
    }

    if (store.userCredentials && store.userCredentials.length > 0) {
      for (const pu of store.userCredentials) {
        const existingIdx = seedUsers.findIndex(
          (u: { email: string }) => u.email.toLowerCase() === pu.email.toLowerCase()
        );
        const userObj = {
          id: pu.id,
          email: pu.email,
          name: pu.name,
          role: pu.role,
          learnerId: pu.learnerId,
          active: true,
          mustChangePassword: pu.mustChangePassword,
          temporaryPassword: pu.temporaryPassword,
          createdAt: pu.createdAt,
        };
        if (existingIdx >= 0) {
          seedUsers[existingIdx] = { ...seedUsers[existingIdx], ...userObj };
        } else {
          seedUsers.push(userObj);
        }
      }
    }

    seedEnrolments.length = 0;
    if (store.enrolments && Array.isArray(store.enrolments)) {
      seedEnrolments.push(...store.enrolments);
    }

    seedPaymentRecords.length = 0;
    if (store.paymentRecords && Array.isArray(store.paymentRecords)) {
      seedPaymentRecords.push(...store.paymentRecords);
    }

    seedPaymentSchedules.length = 0;
    if (store.paymentSchedules && Array.isArray(store.paymentSchedules)) {
      seedPaymentSchedules.push(...store.paymentSchedules);
    }

    if (store.blockedDays && Array.isArray(store.blockedDays)) {
      seedBlockedDays.length = 0;
      seedBlockedDays.push(...store.blockedDays);
    }

    if (store.availabilityRules && Array.isArray(store.availabilityRules)) {
      seedAvailabilityRules.length = 0;
      seedAvailabilityRules.push(...store.availabilityRules);
    }

    if (store.bookings && Array.isArray(store.bookings)) {
      for (const pb of store.bookings) {
        const existingIdx = seedBookings.findIndex((b: Booking) => b.id === pb.id);
        if (existingIdx >= 0) {
          seedBookings[existingIdx] = { ...seedBookings[existingIdx], ...pb };
        } else {
          seedBookings.push(pb);
        }
      }
    }

    // Sync CMS Pages
    if (store.cmsPagesData && collegePagesData) {
      Object.entries(store.cmsPagesData).forEach(([pathKey, sections]) => {
        collegePagesData[pathKey] = sections;
      });
      if (store.cmsPagesData["/"] && collegePageBuilderSections) {
        collegePageBuilderSections.length = 0;
        collegePageBuilderSections.push(...store.cmsPagesData["/"]);
      }
    }

    // Sync Cohorts
    if (store.cohorts && seedClasses) {
      for (const pc of store.cohorts) {
        const idx = seedClasses.findIndex((c: any) => c.id === pc.id);
        if (idx >= 0) {
          seedClasses[idx] = { ...seedClasses[idx], ...pc };
        } else {
          seedClasses.push(pc);
        }
      }
    }

    // Sync Sessions
    if (store.classSessions && seedSessions) {
      for (const ps of store.classSessions) {
        const idx = seedSessions.findIndex((s: any) => s.id === ps.id);
        if (idx >= 0) {
          seedSessions[idx] = { ...seedSessions[idx], ...ps };
        } else {
          seedSessions.push(ps);
        }
      }
    }

    // Sync Payment Gateway & Bank Settings
    if (store.paymentGatewaySettings && collegePaymentGatewaySettings) {
      Object.assign(collegePaymentGatewaySettings, store.paymentGatewaySettings);
    }

    // Sync Course Overrides directly into in-memory courses array
    if (store.courseOverrides && Object.keys(store.courseOverrides).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { courses } = require("@/content/courses");
      if (Array.isArray(courses)) {
        Object.entries(store.courseOverrides).forEach(([id, override]: [string, any]) => {
          const idx = courses.findIndex((c: any) => c.id === id);
          if (idx >= 0) {
            courses[idx] = { ...courses[idx], ...override };
          } else {
            courses.push(override);
          }
        });
      }
    }
  } catch (err) {
    console.error("[persistedData] Failed to sync records into memory:", err);
  }
}

export function listAllPlatformUsers(): PersistedUserRecord[] {
  const store = loadPersistedRecords();
  const users: PersistedUserRecord[] = store.userCredentials ? [...store.userCredentials] : [];

  // Include superadmin George if not present
  if (!users.some((u) => u.email.toLowerCase() === "thegeorgedigitals@gmail.com")) {
    users.unshift({
      id: "user-super-george",
      email: "thegeorgedigitals@gmail.com",
      name: "David George",
      role: "super_admin",
      createdAt: new Date().toISOString(),
    });
  }

  // Include seed staff if not present
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedUsers } = require("@/lib/repositories/seedData");
    for (const su of seedUsers) {
      if (!users.some((u) => u.email.toLowerCase() === su.email.toLowerCase())) {
        users.push({
          id: su.id,
          email: su.email,
          name: su.name,
          role: su.role,
          learnerId: su.learnerId,
          createdAt: su.createdAt || new Date().toISOString(),
        });
      }
    }
  } catch {}

  return users;
}

export function createPlatformUserInStore(data: {
  name: string;
  email: string;
  role: string;
  password?: string;
  department?: string;
  specialism?: string;
}): PersistedUserRecord {
  const store = loadPersistedRecords();
  if (!store.userCredentials) store.userCredentials = [];

  const existingIdx = store.userCredentials.findIndex(
    (u) => u.email.toLowerCase() === data.email.toLowerCase().trim()
  );

  const newUser: PersistedUserRecord = {
    id: `user-custom-${Date.now().toString(36)}`,
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
    role: data.role,
    passwordHash: data.password ? data.password.trim() : "Smartminds2026!",
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.userCredentials[existingIdx] = {
      ...store.userCredentials[existingIdx],
      ...newUser,
      id: store.userCredentials[existingIdx].id,
    };
  } else {
    store.userCredentials.unshift(newUser);
  }

  const filePath = getStoreFilePath();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  syncPersistedRecords(true);

  return newUser;
}

export function deleteUserFromStore(userIdOrEmail: string): boolean {
  try {
    const store = loadPersistedRecords();
    if (!store.userCredentials) return false;

    const initialLen = store.userCredentials.length;
    store.userCredentials = store.userCredentials.filter(
      (u) =>
        u.id !== userIdOrEmail &&
        u.email.toLowerCase() !== userIdOrEmail.toLowerCase()
    );

    if (store.userCredentials.length !== initialLen) {
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      syncPersistedRecords(true);
      syncStoreSnapshotToNeon(store).catch(() => {});
      return true;
    }
    return false;
  } catch (err) {
    console.error("[persistedData] Failed to delete user:", err);
    return false;
  }
}

export function deletePaymentRecordFromStore(paymentId: string): boolean {
  try {
    const store = loadPersistedRecords();
    const initialLen = store.paymentRecords?.length || 0;
    store.paymentRecords = (store.paymentRecords || []).filter((p) => p.id !== paymentId);

    // Also remove in-memory reference
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { seedPaymentRecords } = require("@/lib/repositories/seedData");
      if (Array.isArray(seedPaymentRecords)) {
        const idx = seedPaymentRecords.findIndex((p: any) => p.id === paymentId);
        if (idx >= 0) seedPaymentRecords.splice(idx, 1);
      }
    } catch {}

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => {});
    return true;
  } catch (err) {
    console.error("[persistedData] Failed to delete payment:", err);
    return false;
  }
}

export function updateUserRoleInStore(
  userIdOrEmail: string,
  newRole: string
): { success: boolean; user?: PersistedUserRecord } {
  try {
    const store = loadPersistedRecords();
    if (!store.userCredentials) store.userCredentials = [];

    const cleanQuery = userIdOrEmail.toLowerCase().trim();
    let user = store.userCredentials.find(
      (u) => u.id === userIdOrEmail || u.email.toLowerCase() === cleanQuery
    );

    if (!user) {
      // Check seedUsers if not yet persisted in userCredentials
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { seedUsers } = require("@/lib/repositories/seedData");
        const seedMatch = seedUsers.find(
          (u: any) => u.id === userIdOrEmail || u.email.toLowerCase() === cleanQuery
        );
        if (seedMatch) {
          user = {
            id: seedMatch.id,
            email: seedMatch.email,
            name: seedMatch.name,
            role: newRole,
            learnerId: seedMatch.learnerId,
            createdAt: seedMatch.createdAt || new Date().toISOString(),
          };
          store.userCredentials.push(user);
        }
      } catch {}
    }

    if (!user) {
      return { success: false };
    }

    user.role = newRole;

    // If Millie, guarantee proper ID
    if (user.email.toLowerCase() === "millie@smartmindstraining.co.uk") {
      user.id = "user-owner-01";
    }

    // Also update seedUsers in-memory
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { seedUsers } = require("@/lib/repositories/seedData");
      if (Array.isArray(seedUsers)) {
        const seedMatch = seedUsers.find(
          (u: any) => u.id === user!.id || u.email.toLowerCase() === user!.email.toLowerCase()
        );
        if (seedMatch) {
          seedMatch.role = newRole as any;
          if (user.email.toLowerCase() === "millie@smartmindstraining.co.uk") {
            seedMatch.id = "user-owner-01";
          }
        }
      }
    } catch {}

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    return { success: true, user };
  } catch (err) {
    console.error("[persistedData] Failed to update user role:", err);
    return { success: false };
  }
}

export function purgeAllTestRecordsFromStore(): {
  deletedPayments: number;
  deletedSchedules: number;
  deletedLearners: number;
  deletedEnrolments: number;
  cleanedUsers: number;
} {
  try {
    const store = loadPersistedRecords();
    const initialPayments = store.paymentRecords?.length || 0;
    const initialSchedules = store.paymentSchedules?.length || 0;
    const initialLearners = store.learners?.length || 0;
    const initialEnrolments = store.enrolments?.length || 0;
    const initialUsers = store.userCredentials?.length || 0;

    // Purge test transactional records
    store.paymentRecords = [];
    store.paymentSchedules = [];
    store.learners = [];
    store.enrolments = [];

    // Filter out student accounts from userCredentials, preserve real staff/admins
    if (store.userCredentials) {
      store.userCredentials = store.userCredentials.filter(
        (u) =>
          u.role !== "student" &&
          !u.email.includes("example.com") &&
          u.email.toLowerCase() !== "maya.lin@example.com"
      );

      // Clean Millie Davis account ID & role, strictly preserve password
      const millie = store.userCredentials.find(
        (u) => u.email.toLowerCase() === "millie@smartmindstraining.co.uk"
      );
      if (millie) {
        millie.id = "user-owner-01";
        millie.role = "owner_admin";
      }
    }

    // Clear in-memory seed records
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const seedData = require("@/lib/repositories/seedData");
      if (Array.isArray(seedData.seedLearners)) seedData.seedLearners.length = 0;
      if (Array.isArray(seedData.seedEnrolments)) seedData.seedEnrolments.length = 0;
      if (Array.isArray(seedData.seedPaymentRecords)) seedData.seedPaymentRecords.length = 0;
      if (Array.isArray(seedData.seedPaymentSchedules)) seedData.seedPaymentSchedules.length = 0;
      if (Array.isArray(seedData.seedAssignments)) seedData.seedAssignments.length = 0;
      if (Array.isArray(seedData.seedSubmissions)) seedData.seedSubmissions.length = 0;

      // Ensure Millie in seedUsers
      if (Array.isArray(seedData.seedUsers)) {
        const millieSeed = seedData.seedUsers.find(
          (u: any) => u.email.toLowerCase() === "millie@smartmindstraining.co.uk"
        );
        if (millieSeed) {
          millieSeed.id = "user-owner-01";
          millieSeed.role = "owner_admin";
        }
      }
    } catch {}

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => {});

    return {
      deletedPayments: initialPayments,
      deletedSchedules: initialSchedules,
      deletedLearners: initialLearners,
      deletedEnrolments: initialEnrolments,
      cleanedUsers: initialUsers - (store.userCredentials?.length || 0),
    };
  } catch (err) {
    console.error("[persistedData] Failed to purge all test records:", err);
    throw err;
  }
}

export function cleanDemoUsersFromStore(): {
  cleanedUsers: number;
  cleanedLearners: number;
  cleanedEnrolments: number;
} {
  try {
    const res = purgeAllTestRecordsFromStore();
    return {
      cleanedUsers: res.cleanedUsers,
      cleanedLearners: res.deletedLearners,
      cleanedEnrolments: res.deletedEnrolments,
    };
  } catch (err) {
    console.error("[persistedData] Failed to clean demo users:", err);
    return { cleanedUsers: 0, cleanedLearners: 0, cleanedEnrolments: 0 };
  }
}

export function generatePlatformBackupData(): Record<string, unknown> {
  const store = loadPersistedRecords();
  let themeData = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getPersistentSiteTheme } = require("@/lib/siteTheme");
    themeData = getPersistentSiteTheme();
  } catch {}

  let entitlementsData = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedEntitlements } = require("@/lib/repositories/seedData");
    entitlementsData = seedEntitlements;
  } catch {}

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    college: "Smartminds Training College",
    environment: "Smartminds Enterprise Governance",
    data: {
      userCredentials: store.userCredentials || [],
      learners: store.learners || [],
      enrolments: store.enrolments || [],
      paymentRecords: store.paymentRecords || [],
      theme: themeData,
      entitlements: entitlementsData,
    },
  };
}

export function restorePlatformBackupData(backupData: any): {
  success: boolean;
  message: string;
} {
  try {
    if (!backupData || !backupData.data) {
      return { success: false, message: "Invalid backup format. Missing 'data' object." };
    }

    const { userCredentials, learners, enrolments, paymentRecords, theme } = backupData.data;

    const store: PersistedRecordsStore = {
      learners: Array.isArray(learners) ? learners : [],
      enrolments: Array.isArray(enrolments) ? enrolments : [],
      paymentRecords: Array.isArray(paymentRecords) ? paymentRecords : [],
      userCredentials: Array.isArray(userCredentials) ? userCredentials : [],
    };

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));

    // Restore theme if present
    if (theme) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { savePersistentSiteTheme } = require("@/lib/siteTheme");
        savePersistentSiteTheme(theme);
      } catch {}
    }

    syncPersistedRecords(true);

    return {
      success: true,
      message: `Successfully restored backup generated on ${backupData.generatedAt || "unknown date"}. Loaded ${store.learners.length} learners, ${store.userCredentials?.length || 0} users, and ${store.enrolments.length} enrolments.`,
    };
  } catch (err: any) {
    console.error("[persistedData] Failed to restore backup:", err);
    return { success: false, message: err?.message || "Failed to parse and restore backup file." };
  }
}

export const defaultCohortSchedule: CohortScheduleConfig = {
  afternoon: {
    timeLabel: "14:00 – 16:00",
    startTime: "14:00",
    endTime: "16:00",
    description: "Interactive live tutor seminar. Ideal for flexible daytime learners.",
    zoomUrl: "https://zoom.us/j/smartminds-afternoon-cohort",
  },
  evening: {
    timeLabel: "18:30 – 20:30",
    startTime: "18:30",
    endTime: "20:30",
    description: "Interactive live tutor seminar. Ideal for working professionals.",
    zoomUrl: "https://zoom.us/j/smartminds-evening-cohort",
  },
};

export function getCohortSchedule(): CohortScheduleConfig {
  try {
    const store = loadPersistedRecords();
    if (store.cohortSchedule) {
      return {
        afternoon: {
          ...defaultCohortSchedule.afternoon,
          ...store.cohortSchedule.afternoon,
        },
        evening: {
          ...defaultCohortSchedule.evening,
          ...store.cohortSchedule.evening,
        },
      };
    }
  } catch {}
  return { ...defaultCohortSchedule };
}

export function saveCohortSchedule(schedule: CohortScheduleConfig): void {
  try {
    const store = loadPersistedRecords();
    store.cohortSchedule = schedule;
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("[persistedData] Failed to save cohort schedule:", err);
  }
}

export function wipeAllDemoData(): { success: boolean; message: string } {
  try {
    const store = loadPersistedRecords();
    store.learners = [];
    store.enrolments = [];
    store.paymentRecords = [];
    store.paymentSchedules = [];
    store.bookings = [];
    store.enquiries = [];
    if (store.userCredentials) {
      store.userCredentials = store.userCredentials.filter(
        (u) => u.role === "super_admin" || u.role === "owner_admin"
      );
    }

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncStoreSnapshotToNeon(store).catch(() => {});

    try {
      const devLeadsPath = path.join(process.cwd(), "data", "dev_leads.json");
      fs.writeFileSync(devLeadsPath, JSON.stringify([], null, 2));
      const devEmailsPath = path.join(process.cwd(), "data", "dev_emails.json");
      fs.writeFileSync(devEmailsPath, JSON.stringify([], null, 2));
    } catch {}

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const seedData = require("@/lib/repositories/seedData");
      if (Array.isArray(seedData.seedLearners)) seedData.seedLearners.length = 0;
      if (Array.isArray(seedData.seedEnrolments)) seedData.seedEnrolments.length = 0;
      if (Array.isArray(seedData.seedPaymentRecords)) seedData.seedPaymentRecords.length = 0;
      if (Array.isArray(seedData.seedPaymentSchedules)) seedData.seedPaymentSchedules.length = 0;
      if (Array.isArray(seedData.seedBookings)) seedData.seedBookings.length = 0;
      if (Array.isArray(seedData.seedEnquiries)) seedData.seedEnquiries.length = 0;
      if (Array.isArray(seedData.demoOutbox)) seedData.demoOutbox.length = 0;
      if (Array.isArray(seedData.seedUsers)) {
        const allowed = seedData.seedUsers.filter(
          (u: any) => u.role === "super_admin" || u.role === "owner_admin"
        );
        seedData.seedUsers.length = 0;
        seedData.seedUsers.push(...allowed);
      }
    } catch {}

    return {
      success: true,
      message: "Transactional demo data wiped successfully. System is now ready for production.",
    };
  } catch (err) {
    console.error("[persistedData] Failed to wipe demo data:", err);
    throw new Error(err instanceof Error ? err.message : "Failed to wipe demo data");
  }
}

export function saveEnquiryToStore(enquiry: EnquiryLead): void {
  try {
    const store = loadPersistedRecords();
    if (!store.enquiries) store.enquiries = [];
    const existingIdx = store.enquiries.findIndex((e) => e.id === enquiry.id);
    if (existingIdx >= 0) {
      store.enquiries[existingIdx] = { ...store.enquiries[existingIdx], ...enquiry };
    } else {
      store.enquiries.unshift(enquiry);
    }
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const seedData = require("@/lib/repositories/seedData");
      if (Array.isArray(seedData.seedEnquiries)) {
        const sIdx = seedData.seedEnquiries.findIndex((e: any) => e.id === enquiry.id);
        if (sIdx >= 0) {
          seedData.seedEnquiries[sIdx] = { ...seedData.seedEnquiries[sIdx], ...enquiry };
        } else {
          seedData.seedEnquiries.unshift(enquiry);
        }
      }
    } catch {}
  } catch (err) {
    console.error("[persistedData] Failed to save enquiry to store:", err);
  }
}

export function updateEnquiryInStore(enquiryId: string, updates: Partial<EnquiryLead>): void {
  try {
    const store = loadPersistedRecords();
    if (!store.enquiries) store.enquiries = [];
    const idx = store.enquiries.findIndex((e) => e.id === enquiryId);
    if (idx >= 0) {
      store.enquiries[idx] = { ...store.enquiries[idx], ...updates };
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const seedData = require("@/lib/repositories/seedData");
      if (Array.isArray(seedData.seedEnquiries)) {
        const sIdx = seedData.seedEnquiries.findIndex((e: any) => e.id === enquiryId);
        if (sIdx >= 0) {
          seedData.seedEnquiries[sIdx] = { ...seedData.seedEnquiries[sIdx], ...updates };
        }
      }
    } catch {}
  } catch (err) {
    console.error("[persistedData] Failed to update enquiry in store:", err);
  }
}

export function listAllEnquiries(): EnquiryLead[] {
  const store = loadPersistedRecords();
  const list: EnquiryLead[] = store.enquiries ? [...store.enquiries] : [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const seedData = require("@/lib/repositories/seedData");
    if (Array.isArray(seedData.seedEnquiries)) {
      for (const se of seedData.seedEnquiries) {
        if (!list.some((e) => e.id === se.id)) {
          list.push(se);
        }
      }
    }
  } catch {}

  return list.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}


export function savePasswordResetToken(
  token: string,
  email: string,
  expiresMinutes: number = 60
): void {
  try {
    const store = loadPersistedRecords();
    if (!store.passwordResetTokens) store.passwordResetTokens = [];
    
    const now = Date.now();
    // Purge expired tokens
    store.passwordResetTokens = store.passwordResetTokens.filter((t) => t.expiresAt > now);

    // Save active token
    store.passwordResetTokens.push({
      token,
      email: email.trim().toLowerCase(),
      expiresAt: now + expiresMinutes * 60 * 1000,
    });

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("[persistedData] Failed to save reset token:", err);
  }
}

export function verifyAndConsumePasswordResetToken(
  token: string,
  email: string
): boolean {
  try {
    if (!token || !email) return false;
    const store = loadPersistedRecords();
    if (!store.passwordResetTokens || store.passwordResetTokens.length === 0) return false;

    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();

    const tokenIdx = store.passwordResetTokens.findIndex(
      (t) => t.token === token && t.email.toLowerCase() === cleanEmail && t.expiresAt > now
    );

    if (tokenIdx === -1) {
      return false;
    }

    // Single-use token: remove upon verification
    store.passwordResetTokens.splice(tokenIdx, 1);
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    return true;
  } catch (err) {
    console.error("[persistedData] Failed to verify and consume reset token:", err);
    return false;
  }
}



export function getPersistedFaculties(): FacultyRecord[] {
  try {
    const store = loadPersistedRecords();
    if (store.faculties && Array.isArray(store.faculties) && store.faculties.length > 0) {
      return store.faculties;
    }
    return DEFAULT_COLLEGE_FACULTIES;
  } catch (err) {
    console.error("[persistedData] Failed to load faculties:", err);
    return DEFAULT_COLLEGE_FACULTIES;
  }
}

export async function saveFacultyToStore(faculty: FacultyRecord): Promise<FacultyRecord[]> {
  try {
    const store = loadPersistedRecords();
    if (!store.faculties || !Array.isArray(store.faculties) || store.faculties.length === 0) {
      store.faculties = [...DEFAULT_COLLEGE_FACULTIES];
    }

    const existingIdx = store.faculties.findIndex(
      (f) => f.id === faculty.id || f.name.toLowerCase() === faculty.name.toLowerCase()
    );
    if (existingIdx >= 0) {
      const oldName = store.faculties[existingIdx].name;
      store.faculties[existingIdx] = {
        ...store.faculties[existingIdx],
        ...faculty,
      };

      // If the faculty name changed, keep associated courses updated in courseOverrides
      if (oldName && faculty.name && oldName.toLowerCase() !== faculty.name.toLowerCase()) {
        if (store.courseOverrides) {
          for (const [cId, override] of Object.entries(store.courseOverrides)) {
            if (override && (override as any).category === oldName) {
              (store.courseOverrides as any)[cId] = {
                ...override,
                category: faculty.name,
              };
            }
          }
        }
      }
    } else {
      store.faculties.push({
        ...faculty,
        createdAt: new Date().toISOString(),
      });
    }

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    await syncStoreSnapshotToNeon(store);
    return store.faculties;
  } catch (err) {
    console.error("[persistedData] Failed to save faculty:", err);
    return DEFAULT_COLLEGE_FACULTIES;
  }
}

export async function deleteFacultyFromStore(facultyId: string): Promise<FacultyRecord[]> {
  try {
    const store = loadPersistedRecords();
    if (!store.faculties || !Array.isArray(store.faculties) || store.faculties.length === 0) {
      store.faculties = [...DEFAULT_COLLEGE_FACULTIES];
    }

    store.faculties = store.faculties.filter((f) => f.id !== facultyId);
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    await syncStoreSnapshotToNeon(store);
    return store.faculties;
  } catch (err) {
    console.error("[persistedData] Failed to delete faculty:", err);
    return DEFAULT_COLLEGE_FACULTIES;
  }
}

export function listNewsletterSubscribers(): NewsletterSubscriber[] {
  try {
    const store = loadPersistedRecords();
    return (store.subscribers || []).slice().reverse();
  } catch (err) {
    console.error("[persistedData] Failed to list newsletter subscribers:", err);
    return [];
  }
}

export function saveNewsletterSubscriber(
  email: string,
  source: string = "website_footer"
): { success: boolean; isNew: boolean; reActivated?: boolean; subscriber: NewsletterSubscriber } {
  try {
    const store = loadPersistedRecords();
    if (!store.subscribers) {
      store.subscribers = [];
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = store.subscribers.find(
      (s) => s.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        existing.subscribedAt = new Date().toISOString();
        if (source) existing.source = source;
        const filePath = getStoreFilePath();
        fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
        return { success: true, isNew: false, reActivated: true, subscriber: existing };
      }
      return { success: true, isNew: false, subscriber: existing };
    }

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      status: "active",
      subscribedAt: new Date().toISOString(),
      source,
    };

    store.subscribers.push(newSub);
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));

    // Continuous Neon Cloud synchronization
    syncStoreSnapshotToNeon(store);

    if (process.env.DATABASE_URL) {
      import("@/lib/db")
        .then(({ sql }) => {
          sql`
            INSERT INTO subscribers (id, email, status, data, created_at)
            VALUES (
              ${newSub.id},
              ${newSub.email},
              ${newSub.status},
              ${JSON.stringify(newSub)},
              now()
            )
            ON CONFLICT (id) DO UPDATE SET
              status = EXCLUDED.status,
              data = EXCLUDED.data;
          `.catch((err) => console.warn("[Neon DB] subscribers sync error:", err));
        })
        .catch(() => {});
    }

    return { success: true, isNew: true, subscriber: newSub };
  } catch (err) {
    console.error("[persistedData] Failed to save newsletter subscriber:", err);
    throw err;
  }
}

export function deleteNewsletterSubscriber(idOrEmail: string): boolean {
  try {
    const store = loadPersistedRecords();
    if (!store.subscribers || store.subscribers.length === 0) return false;

    const clean = idOrEmail.trim().toLowerCase();
    const initialLen = store.subscribers.length;
    store.subscribers = store.subscribers.filter(
      (s) => s.id !== idOrEmail && s.email.toLowerCase() !== clean
    );

    if (store.subscribers.length !== initialLen) {
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      syncStoreSnapshotToNeon(store);

      if (process.env.DATABASE_URL) {
        import("@/lib/db")
          .then(({ sql }) => {
            sql`DELETE FROM subscribers WHERE id = ${idOrEmail} OR email = ${clean}`.catch((err) =>
              console.warn("[Neon DB] subscribers delete error:", err)
            );
          })
          .catch(() => {});
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error("[persistedData] Failed to delete subscriber:", err);
    return false;
  }
}

export function toggleNewsletterSubscriberStatus(
  idOrEmail: string
): { success: boolean; newStatus?: "active" | "unsubscribed" } {
  try {
    const store = loadPersistedRecords();
    if (!store.subscribers) return { success: false };

    const clean = idOrEmail.trim().toLowerCase();
    const sub = store.subscribers.find(
      (s) => s.id === idOrEmail || s.email.toLowerCase() === clean
    );

    if (!sub) return { success: false };

    sub.status = sub.status === "active" ? "unsubscribed" : "active";
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncStoreSnapshotToNeon(store);

    if (process.env.DATABASE_URL) {
      import("@/lib/db")
        .then(({ sql }) => {
          sql`
            UPDATE subscribers SET status = ${sub.status}, data = ${JSON.stringify(sub)}
            WHERE id = ${sub.id} OR email = ${sub.email};
          `.catch((err) => console.warn("[Neon DB] subscribers toggle error:", err));
        })
        .catch(() => {});
    }

    return { success: true, newStatus: sub.status };
  } catch (err) {
    console.error("[persistedData] Failed to toggle subscriber status:", err);
    return { success: false };
  }
}

/**
 * Returns a full JSON backup of the current database state
 * for 1-click admin download.
 */
export function exportFullDatabaseBackup(): string {
  const store = loadPersistedRecords();
  return JSON.stringify(store, null, 2);
}

function computeIsDark(hex: string): boolean {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }
  return false;
}

export function listColorSwatches(): ColorSwatch[] {
  const store = loadPersistedRecords();
  if (!store.colorSwatches || !Array.isArray(store.colorSwatches) || store.colorSwatches.length === 0) {
    return DEFAULT_COLOR_SWATCHES;
  }
  // Normalize legacy Oceanic Blue naming to client requested "Smart blue"
  return store.colorSwatches.map((s) => {
    if ((s.id === "swatch-oceanic-blue" || s.hex.toLowerCase() === "#13416b") && s.name.toLowerCase().includes("oceanic")) {
      return { ...s, name: "Smart blue" };
    }
    return s;
  });
}

export async function saveColorSwatch(swatch: {
  id?: string;
  name: string;
  hex: string;
  category?: "primary" | "secondary" | "accent" | "custom";
  isDark?: boolean;
}): Promise<ColorSwatch> {
  const store = loadPersistedRecords();
  if (!store.colorSwatches || !Array.isArray(store.colorSwatches) || store.colorSwatches.length === 0) {
    store.colorSwatches = [...DEFAULT_COLOR_SWATCHES];
  }

  let cleanHex = swatch.hex.trim();
  if (!cleanHex.startsWith("#")) cleanHex = "#" + cleanHex;

  const id =
    swatch.id ||
    `swatch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const isDark = typeof swatch.isDark === "boolean" ? swatch.isDark : computeIsDark(cleanHex);

  const existingIdx = swatch.id
    ? store.colorSwatches.findIndex((s) => s.id === swatch.id)
    : store.colorSwatches.findIndex((s) => s.name.toLowerCase() === swatch.name.trim().toLowerCase());

  const newSwatch: ColorSwatch = {
    id: existingIdx >= 0 ? store.colorSwatches[existingIdx].id : id,
    name: swatch.name.trim(),
    hex: cleanHex,
    category: swatch.category || (existingIdx >= 0 ? store.colorSwatches[existingIdx].category : "custom"),
    isDark,
    createdAt: existingIdx >= 0 ? store.colorSwatches[existingIdx].createdAt : new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.colorSwatches[existingIdx] = newSwatch;
  } else {
    store.colorSwatches.push(newSwatch);
  }

  const filePath = getStoreFilePath();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  await syncStoreSnapshotToNeon(store);
  return newSwatch;
}

export async function deleteColorSwatch(swatchId: string): Promise<boolean> {
  const store = loadPersistedRecords();
  if (!store.colorSwatches) return false;
  const initialLen = store.colorSwatches.length;
  store.colorSwatches = store.colorSwatches.filter((s) => s.id !== swatchId);
  if (store.colorSwatches.length !== initialLen) {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    await syncStoreSnapshotToNeon(store);
    return true;
  }
  return false;
}



