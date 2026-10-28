import fs from "fs";
import path from "path";
import { hashPassword } from "@/lib/passwords";
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
  TutoringAttendanceRecord,
  TutoringDeliveryMode,
  TutoringAttendanceStatus,
} from "@/lib/repositories/types";
import type { Course } from "@/content/types";
import type { BlogPost } from "@/content/blog";

export interface PersistedUserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  learnerId?: string;
  tutorId?: string;
  department?: string;
  specialism?: string;
  facultyId?: string;
  facultyName?: string;
  active?: boolean;
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

export interface ImpersonationAuditLog {
  id: string;
  actorEmail: string;
  actorRole: string;
  targetUserId?: string;
  targetEmail: string;
  targetName: string;
  targetRole: string;
  action: "impersonation_started" | "impersonation_ended";
  timestamp: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "ppt" | "docx" | "link";
  fileSizeBytes?: number;
  cohortId?: string;
  cohortName?: string;
  unitCode?: string;
  tutorId: string;
  tutorName: string;
  published: boolean;
  createdAt: string;
}

export interface MediaLibraryItem {
  id: string;
  title: string;
  fileName: string;
  url: string;
  altText?: string;
  caption?: string;
  mimeType: string;
  category: "image" | "brand" | "document" | "video";
  sizeBytes?: number;
  width?: number;
  height?: number;
  uploadedBy?: string;
  createdAt: string;
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
  siteTheme?: any;
  impersonationLogs?: ImpersonationAuditLog[];
  learningMaterials?: LearningMaterial[];
  mediaLibrary?: MediaLibraryItem[];
  deletedMediaIds?: string[];
  assignments?: any[];
  submissions?: any[];
  deletedCohortIds?: string[];
  tutoringAttendance?: TutoringAttendanceRecord[];
  deletedTutoringAttendanceIds?: string[];
}

import { type ColorSwatch, DEFAULT_COLOR_SWATCHES } from "./colorSwatches";
export { type ColorSwatch, DEFAULT_COLOR_SWATCHES };

import { type FacultyRecord, DEFAULT_COLLEGE_FACULTIES } from "@/content/faculties";
export { type FacultyRecord, DEFAULT_COLLEGE_FACULTIES };

export function getStoreFilePath(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "persisted_records.json");
}

function sanitizeCmsPages(data: any): any {
  if (!data || typeof data !== "object") return {};
  try {
    const jsonStr = JSON.stringify(data);
    if (jsonStr.includes("1792616860201") || jsonStr.includes("cpd-logo")) {
      const cleaned = jsonStr.replace(/\/uploads\/1792616860201-cpd-logo\.png/g, "");
      return JSON.parse(cleaned);
    }
  } catch { }
  return data;
}

let cachedStore: PersistedRecordsStore | null = null;
let cachedStoreMtimeMs = 0;

function writeStoreToDisk(filePath: string, store: PersistedRecordsStore): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    try {
      cachedStoreMtimeMs = fs.statSync(filePath).mtimeMs;
    } catch {
      cachedStoreMtimeMs = Date.now();
    }
    cachedStore = store;
  } catch (err) {
    console.warn("[persistedData] Write store warning:", err);
    cachedStore = store;
  }
}

export function loadPersistedRecords(): PersistedRecordsStore {
  try {
    const filePath = getStoreFilePath();
    if (!fs.existsSync(filePath)) {
      cachedStore = null;
      cachedStoreMtimeMs = 0;
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
        faculties: [...DEFAULT_COLLEGE_FACULTIES],
      };
    }

    try {
      const stat = fs.statSync(filePath);
      if (cachedStore && stat.mtimeMs === cachedStoreMtimeMs && stat.mtimeMs > 0) {
        return cachedStore;
      }
      cachedStoreMtimeMs = stat.mtimeMs;
    } catch { }

    let parsed: any = null;
    for (let i = 0; i < 3; i++) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        parsed = JSON.parse(raw);
        break;
      } catch (e) {
        if (i === 2) throw e;
        try {
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 15);
        } catch { }
      }
    }
    const isTest = isAutomatedTestEnv();
    const stripDemo = <T>(arr: T[]): T[] =>
      isTest ? arr : arr.filter((item) => !isFictionalDemoRecord(item));

    const loaded: PersistedRecordsStore = {
      learners: Array.isArray(parsed.learners) ? stripDemo(parsed.learners) : [],
      enrolments: Array.isArray(parsed.enrolments) ? stripDemo(parsed.enrolments) : [],
      paymentRecords: Array.isArray(parsed.paymentRecords)
        ? stripDemo(parsed.paymentRecords)
        : [],
      paymentSchedules: Array.isArray(parsed.paymentSchedules)
        ? stripDemo(parsed.paymentSchedules)
        : [],
      userCredentials: Array.isArray(parsed.userCredentials)
        ? stripDemo(parsed.userCredentials)
        : [],
      passwordResetTokens: Array.isArray(parsed.passwordResetTokens)
        ? parsed.passwordResetTokens
        : [],
      cmsPagesData:
        parsed.cmsPagesData && typeof parsed.cmsPagesData === "object"
          ? sanitizeCmsPages(parsed.cmsPagesData)
          : {},
      cmsPagesDraftData:
        parsed.cmsPagesDraftData && typeof parsed.cmsPagesDraftData === "object"
          ? sanitizeCmsPages(parsed.cmsPagesDraftData)
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
      siteTheme:
        parsed.siteTheme && typeof parsed.siteTheme === "object"
          ? parsed.siteTheme
          : undefined,
      faculties:
        Array.isArray(parsed.faculties)
          ? sanitizeFaculties(parsed.faculties)
          : [...DEFAULT_COLLEGE_FACULTIES],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      deletedCohortIds: Array.isArray(parsed.deletedCohortIds) ? parsed.deletedCohortIds : [],
      colorSwatches: Array.isArray(parsed.colorSwatches) ? parsed.colorSwatches : undefined,
      impersonationLogs: Array.isArray(parsed.impersonationLogs) ? parsed.impersonationLogs : undefined,
      learningMaterials: Array.isArray(parsed.learningMaterials) ? parsed.learningMaterials : undefined,
      mediaLibrary: Array.isArray(parsed.mediaLibrary) ? parsed.mediaLibrary : undefined,
      deletedMediaIds: Array.isArray(parsed.deletedMediaIds) ? parsed.deletedMediaIds : undefined,
    };
    cachedStore = loaded;
    return loaded;
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

function mergeArrayById<T extends { id?: string }>(...lists: (T[] | undefined)[]): T[] {
  const map = new Map<string, T>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || !item.id) continue;
      const existing = map.get(item.id);
      map.set(item.id, existing ? { ...existing, ...item } : item);
    }
  }
  return Array.from(map.values());
}

function mergeUsersByEmail(...lists: (PersistedUserRecord[] | undefined)[]): PersistedUserRecord[] {
  const map = new Map<string, PersistedUserRecord>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const u of list) {
      if (!u || !u.email) continue;
      const key = u.email.toLowerCase().trim();
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          ...u,
          id: u.id || existing.id,
          passwordHash: u.passwordHash || existing.passwordHash,
          temporaryPassword:
            u.passwordHash && !u.temporaryPassword
              ? undefined
              : u.temporaryPassword || existing.temporaryPassword,
          tutorId: u.tutorId || existing.tutorId,
          learnerId: u.learnerId || existing.learnerId,
          department: u.department || existing.department,
          specialism: u.specialism || existing.specialism,
        });
      } else {
        map.set(key, u);
      }
    }
  }
  return Array.from(map.values());
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
    // Keep system_store payload lean by omitting large transient draft blobs (published CMS pages live in cms_pages table)
    const { cmsPagesDraftData: _drafts, ...leanStore } = store;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Neon syncStoreSnapshot timeout")), 10000)
    );
    await Promise.race([
      sql`
        INSERT INTO system_store (key, value, updated_at)
        VALUES ('master_records_store', ${JSON.stringify(leanStore)}, now())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = now();
      `,
      timeout,
    ]);
    return true;
  } catch (err) {
    console.warn("[Neon DB] Notice: system_store sync:", err);
    return false;
  }
}

/**
 * Pulls master snapshot and dedicated entity tables from Neon PostgreSQL.
 * Guarantees that Hostinger deployments and local environments restore instantly after git push
 * without ever overwriting records created in dedicated PostgreSQL tables.
 */
let lastNeonPullPerf = 0;
let lastNeonPullTimestamp = 0;
let pullingPromise: Promise<boolean> | null = null;
let fictionalDemoPurgedFromNeon = false;
const NEON_PULL_TTL_MS = 30000; // 30 seconds cache to avoid DB storming across concurrent components

export function isAutomatedTestEnv(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    (typeof process !== "undefined" &&
      Array.isArray(process.argv) &&
      process.argv.some((a) => a.includes("--test") || a.includes(".test.")))
  );
}

export const FICTIONAL_DEMO_NAMES = new Set([
  "dr. eleanor vance",
  "eleanor vance",
  "marcus sterling",
  "amara patel",
  "david kalu",
  "chloe davies",
]);

const FICTIONAL_DEMO_EMAILS = new Set([
  "sarah.jenkins@smartmindstraining.co.uk",
  "brian.miller@smartmindstraining.co.uk",
  "fatima.almansoor@smartmindstraining.co.uk",
  "eleanor.vance@smartmindstraining.co.uk",
  "marcus.sterling@smartmindstraining.co.uk",
  "amara.patel@smartmindstraining.co.uk",
  "david.kalu@smartmindstraining.co.uk",
  "chloe.davies@smartmindstraining.co.uk",
  "super.admin@smartmindstraining.co.uk",
]);

const FICTIONAL_DEMO_IDS = new Set([
  "user-admin-01",
  "user-admin-02",
  "user-admin-03",
  "user-tutor-01",
  "user-tutor-02",
  "user-tutor-03",
  "user-tutor-04",
  "user-tutor-05",
  "user-tutor-eleanor",
  "tutor-01",
  "tutor-02",
  "tutor-03",
  "tutor-04",
  "tutor-05",
  "tutor-001",
  "tutor-002",
  "tutor-003",
  "tutor-004",
  "tutor-005",
  "user-super-01",
  ...Array.from({ length: 24 }, (_, i) => `user-learner-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 24 }, (_, i) => `learner-${String(i + 1).padStart(3, "0")}`),
]);

export function isFictionalDemoRecord(item: any): boolean {
  if (!item || typeof item !== "object") return false;
  const name = typeof item.name === "string" ? item.name.toLowerCase().trim() : "";
  if (name && FICTIONAL_DEMO_NAMES.has(name)) return true;
  const fullName = typeof item.fullName === "string" ? item.fullName.toLowerCase().trim() : "";
  if (fullName && FICTIONAL_DEMO_NAMES.has(fullName)) return true;
  const email = typeof item.email === "string" ? item.email.toLowerCase().trim() : "";
  if (email && (email.endsWith("@example.com") || FICTIONAL_DEMO_EMAILS.has(email))) {
    return true;
  }
  const idsToCheck = [item.id, item.userId, item.learnerId, item.tutorId];
  for (const rawId of idsToCheck) {
    if (typeof rawId === "string" && FICTIONAL_DEMO_IDS.has(rawId.trim())) {
      return true;
    }
  }
  return false;
}

async function purgeFictionalDemoRecordsFromNeonOnce(): Promise<void> {
  if (fictionalDemoPurgedFromNeon || isAutomatedTestEnv()) return;
  fictionalDemoPurgedFromNeon = true;
  try {
    const { isDbConfigured, sql } = await import("@/lib/db");
    if (!isDbConfigured) return;
    const demoEmails = Array.from(FICTIONAL_DEMO_EMAILS);
    const demoIds = Array.from(FICTIONAL_DEMO_IDS);
    await Promise.all([
      sql`
        DELETE FROM user_credentials
        WHERE LOWER(email) LIKE '%@example.com'
           OR LOWER(email) = ANY(${demoEmails}::text[])
           OR LOWER(name) LIKE '%eleanor vance%'
           OR LOWER(name) LIKE '%marcus sterling%'
           OR LOWER(name) LIKE '%amara patel%'
           OR id = ANY(${demoIds}::text[])
           OR id = 'user-tutor-eleanor'
           OR learner_id = ANY(${demoIds}::text[])
           OR tutor_id = ANY(${demoIds}::text[])
      `.catch(() => {}),
      sql`
        DELETE FROM learners
        WHERE LOWER(email) LIKE '%@example.com'
           OR id = ANY(${demoIds}::text[])
           OR user_id = ANY(${demoIds}::text[])
      `.catch(() => {}),
      sql`
        DELETE FROM enrolments
        WHERE learner_id = ANY(${demoIds}::text[])
      `.catch(() => {}),
      sql`
        DELETE FROM payments
        WHERE learner_id = ANY(${demoIds}::text[])
      `.catch(() => {}),
      sql`
        DELETE FROM payment_schedules
        WHERE learner_id = ANY(${demoIds}::text[])
      `.catch(() => {}),
    ]);
  } catch {}
}

export async function pullLatestFromNeon(force = false): Promise<boolean> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return false;
  }

  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (!force && lastNeonPullPerf > 0 && now - lastNeonPullPerf < NEON_PULL_TTL_MS) {
    return true;
  }

  if (!force && pullingPromise) {
    return pullingPromise;
  }

  pullingPromise = (async () => {
    try {
      const { isDbConfigured, sql, ensureDbTablesExist } = await import("@/lib/db");
      if (!isDbConfigured) return false;

      await ensureDbTablesExist();
      purgeFictionalDemoRecordsFromNeonOnce().catch(() => {});

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Neon pullLatest timeout")), 8000)
      );
      const [
        storeRows,
        cmsRows,
        learnerRows,
        enrolmentRows,
        paymentRows,
        scheduleRows,
        userRows,
        mediaRows,
      ]: [any, any, any, any, any, any, any, any] = await Promise.race([
        Promise.all([
          sql`SELECT value FROM system_store WHERE key = 'master_records_store' LIMIT 1`.catch(() => []),
          sql`SELECT path, sections FROM cms_pages`.catch(() => []),
          sql`SELECT data FROM learners ORDER BY created_at DESC`.catch(() => []),
          sql`SELECT data FROM enrolments ORDER BY created_at DESC`.catch(() =>
            sql`SELECT data FROM enrolments`.catch(() => [])
          ),
          sql`SELECT data FROM payments ORDER BY created_at DESC`.catch(() => []),
          sql`SELECT data FROM payment_schedules ORDER BY due_date ASC`.catch(() => []),
          sql`SELECT id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at FROM user_credentials`.catch(() => []),
          sql`SELECT data FROM media_library ORDER BY created_at DESC`.catch(() => []),
        ]),
        timeout,
      ]);

      const mediaFromTable: MediaLibraryItem[] = Array.isArray(mediaRows)
        ? mediaRows.map((r: any) => r?.data).filter(Boolean)
        : [];

      const cmsPagesFromDb: Record<string, any[]> = {};
      if (Array.isArray(cmsRows)) {
        for (const row of cmsRows) {
          if (row?.path && Array.isArray(row?.sections) && row.sections.length > 0) {
            cmsPagesFromDb[row.path] = row.sections;
          }
        }
      }

      const isTest = isAutomatedTestEnv();
      const filterFictional = <T>(arr: T[] | undefined): T[] => {
        if (!Array.isArray(arr)) return [];
        if (isTest) return arr;
        return arr.filter((item) => !isFictionalDemoRecord(item));
      };

      const learnersFromTable: Learner[] = filterFictional(
        Array.isArray(learnerRows)
          ? learnerRows.map((r: any) => r?.data).filter(Boolean)
          : []
      );
      const enrolmentsFromTable: Enrolment[] = filterFictional(
        Array.isArray(enrolmentRows)
          ? enrolmentRows.map((r: any) => r?.data).filter(Boolean)
          : []
      );
      const paymentsFromTable: PaymentRecord[] = filterFictional(
        Array.isArray(paymentRows)
          ? paymentRows.map((r: any) => r?.data).filter(Boolean)
          : []
      );
      const schedulesFromTable: PaymentScheduleItem[] = filterFictional(
        Array.isArray(scheduleRows)
          ? scheduleRows.map((r: any) => r?.data).filter(Boolean)
          : []
      );
      const usersFromTable: PersistedUserRecord[] = filterFictional(
        Array.isArray(userRows)
          ? (userRows
            .map((r: any) => {
              if (!r?.email) return null;
              const extra = r.data && typeof r.data === "object" ? r.data : {};
              return {
                ...extra,
                id: r.id || extra.id,
                email: r.email,
                name: r.name || extra.name || r.email.split("@")[0],
                role: r.role || extra.role || "student",
                active: r.active ?? extra.active ?? true,
                tutorId: r.tutor_id || extra.tutorId,
                learnerId: r.learner_id || extra.learnerId,
                specialism: r.specialism || extra.specialism,
                department: r.department || extra.department,
                passwordHash: extra.passwordHash,
                temporaryPassword: extra.temporaryPassword,
                mustChangePassword: extra.mustChangePassword,
                createdAt: r.created_at ? new Date(r.created_at).toISOString() : extra.createdAt || new Date().toISOString(),
              } as PersistedUserRecord;
            })
            .filter(Boolean) as PersistedUserRecord[])
          : []
      );

      const hasData =
        (storeRows && storeRows.length > 0 && storeRows[0]?.value) ||
        Object.keys(cmsPagesFromDb).length > 0 ||
        learnersFromTable.length > 0 ||
        usersFromTable.length > 0 ||
        mediaFromTable.length > 0;

      if (hasData) {
        const dbStore = ((storeRows?.[0]?.value || {}) as Partial<PersistedRecordsStore>) || {};
        const store = loadPersistedRecords();

        const mergedLearners = mergeArrayById<Learner>(
          filterFictional(store.learners),
          filterFictional(dbStore.learners),
          learnersFromTable
        );

        // Also ensure every learner has a corresponding user credential record for lookup/impersonation
        const learnerDerivedUsers: PersistedUserRecord[] = mergedLearners
          .filter((l) => Boolean(l?.email))
          .map((l) => ({
            id: l.userId || `user-${l.id}`,
            email: l.email,
            name: `${l.firstName || ""} ${l.lastName || ""}`.trim() || l.email,
            role: "student",
            learnerId: l.id,
            active: l.accessStatus !== "archived",
            createdAt: l.enrolmentDate || new Date().toISOString(),
          }));

        const mergedUsers = mergeUsersByEmail(
          learnerDerivedUsers,
          filterFictional(store.userCredentials),
          filterFictional(dbStore.userCredentials),
          usersFromTable
        );

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
            ...cmsPagesFromDb,
          },
          cmsPagesDraftData: {
            ...(store.cmsPagesDraftData || {}),
            ...(dbStore.cmsPagesDraftData || {}),
          },
          faculties:
            Array.isArray(dbStore.faculties)
              ? sanitizeFaculties(dbStore.faculties)
              : Array.isArray(store.faculties)
                ? sanitizeFaculties(store.faculties)
                : [...DEFAULT_COLLEGE_FACULTIES],
          learners: mergedLearners,
          subscribers: mergeArrayById(store.subscribers, dbStore.subscribers),
          cohorts: mergeArrayById(store.cohorts, dbStore.cohorts),
          classSessions: mergeArrayById(store.classSessions, dbStore.classSessions),
          paymentRecords: mergeArrayById<PaymentRecord>(
            filterFictional(store.paymentRecords),
            filterFictional(dbStore.paymentRecords),
            paymentsFromTable
          ),
          paymentSchedules: mergeArrayById<PaymentScheduleItem>(
            filterFictional(store.paymentSchedules),
            filterFictional(dbStore.paymentSchedules),
            schedulesFromTable
          ),
          enrolments: mergeArrayById<Enrolment>(
            filterFictional(store.enrolments),
            filterFictional(dbStore.enrolments),
            enrolmentsFromTable
          ),
          enquiries: mergeArrayById(store.enquiries, dbStore.enquiries),
          bookings: mergeArrayById(store.bookings, dbStore.bookings),
          blogPosts: Array.isArray(dbStore.blogPosts) ? dbStore.blogPosts : store.blogPosts,
          userCredentials: mergedUsers,
          colorSwatches:
            Array.isArray(dbStore.colorSwatches) && dbStore.colorSwatches.length > 0
              ? dbStore.colorSwatches
              : store.colorSwatches || DEFAULT_COLOR_SWATCHES,
          siteTheme: dbStore.siteTheme || store.siteTheme,
          assignments: mergeArrayById(store.assignments, dbStore.assignments),
          submissions: mergeArrayById(store.submissions, dbStore.submissions),
          mediaLibrary: mergeArrayById<MediaLibraryItem>(
            store.mediaLibrary,
            dbStore.mediaLibrary,
            mediaFromTable
          ),
          deletedMediaIds: Array.from(
            new Set([...(store.deletedMediaIds || []), ...(dbStore.deletedMediaIds || [])])
          ),
          deletedCohortIds: Array.from(
            new Set([...(store.deletedCohortIds || []), ...(dbStore.deletedCohortIds || [])])
          ),
          deletedTutoringAttendanceIds: Array.from(
            new Set([
              ...(store.deletedTutoringAttendanceIds || []),
              ...(dbStore.deletedTutoringAttendanceIds || []),
            ])
          ),
          tutoringAttendance: mergeArrayById<TutoringAttendanceRecord>(
            store.tutoringAttendance,
            dbStore.tutoringAttendance
          ).filter(
            (r) =>
              !(store.deletedTutoringAttendanceIds || []).includes(r.id) &&
              !(dbStore.deletedTutoringAttendanceIds || []).includes(r.id)
          ),
        };

        const filePath = getStoreFilePath();
        writeStoreToDisk(filePath, mergedStore);
        syncPersistedRecords(true);
        lastNeonPullPerf = typeof performance !== "undefined" ? performance.now() : Date.now();
        lastNeonPullTimestamp = Date.now();
        return true;
      }
      return false;
    } catch (err) {
      console.warn("[Neon DB] Notice: pullLatestFromNeon:", err);
      return false;
    } finally {
      pullingPromise = null;
    }
  })();

  return pullingPromise;
}

export function savePersistedRecord(data: {
  learner?: Learner;
  enrolment?: Enrolment;
  paymentRecord?: PaymentRecord;
  paymentSchedules?: PaymentScheduleItem[];
  tempPassword?: string;
  mustChangePassword?: boolean;
}): Promise<void> {
  let syncedUserRec: PersistedUserRecord | undefined;
  let updatedStore: PersistedRecordsStore | undefined;

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
      const cleanTempPw = data.tempPassword?.trim();
      const existingUser = userIdx >= 0 ? store.userCredentials[userIdx] : undefined;
      const userRec: PersistedUserRecord = {
        id: data.learner.userId || existingUser?.id || `user-${data.learner.id}`,
        email: data.learner.email.toLowerCase().trim(),
        name: `${data.learner.firstName} ${data.learner.lastName}`.trim(),
        role: "student",
        learnerId: data.learner.id,
        active: data.learner.accessStatus !== "archived",
        passwordHash: cleanTempPw ? hashPassword(cleanTempPw) : existingUser?.passwordHash,
        temporaryPassword: cleanTempPw || existingUser?.temporaryPassword,
        mustChangePassword: data.mustChangePassword ?? existingUser?.mustChangePassword ?? true,
        createdAt: data.learner.enrolmentDate || existingUser?.createdAt || new Date().toISOString(),
      };

      if (userIdx >= 0) {
        store.userCredentials[userIdx] = {
          ...existingUser,
          ...userRec,
        };
        syncedUserRec = store.userCredentials[userIdx];
      } else {
        store.userCredentials.unshift(userRec);
        syncedUserRec = userRec;
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

    writeStoreToDisk(filePath, store);
    syncPersistedRecords(true);
    updatedStore = store;
  } catch (err) {
    console.error("[persistedData] Failed to save store:", err);
  }

  return (async () => {
    if (!updatedStore || !process.env.DATABASE_URL) return;
    try {
      const { isDbConfigured, sql, ensureDbTablesExist } = await import("@/lib/db");
      if (!isDbConfigured) return;
      await ensureDbTablesExist();

      const dbTasks: Promise<any>[] = [syncStoreSnapshotToNeon(updatedStore)];

      if (data.learner) {
        const l = data.learner as any;
        const firstName = l.firstName || (l.name ? l.name.split(" ")[0] : "");
        const lastName = l.lastName || (l.name ? l.name.slice(firstName.length).trim() : "");
        const fullName = `${firstName} ${lastName}`.trim() || l.name || l.email;

        dbTasks.push(
          sql`
            INSERT INTO learners (
              id,
              user_id,
              first_name,
              last_name,
              email,
              name,
              phone,
              access_status,
              data,
              created_at,
              updated_at
            )
            VALUES (
              ${l.id},
              ${l.userId || null},
              ${firstName},
              ${lastName},
              ${l.email.toLowerCase().trim()},
              ${fullName},
              ${l.phone || null},
              ${l.accessStatus || "active"},
              ${JSON.stringify(l)},
              now(),
              now()
            )
            ON CONFLICT (id) DO UPDATE SET
              user_id = EXCLUDED.user_id,
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              email = EXCLUDED.email,
              name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              access_status = EXCLUDED.access_status,
              data = EXCLUDED.data,
              updated_at = now();
          `.catch((err) => console.warn("[Neon DB] learners sync error:", err))
        );
      }

      if (syncedUserRec) {
        const u = syncedUserRec;
        dbTasks.push(
          sql`
            INSERT INTO user_credentials (
              id, email, name, role, active, learner_id, data, created_at, updated_at
            )
            VALUES (
              ${u.id},
              ${u.email.toLowerCase().trim()},
              ${u.name},
              ${u.role || "student"},
              ${u.active ?? true},
              ${u.learnerId || null},
              ${JSON.stringify(u)}::jsonb,
              now(),
              now()
            )
            ON CONFLICT (email) DO UPDATE SET
              name = EXCLUDED.name,
              role = EXCLUDED.role,
              active = EXCLUDED.active,
              learner_id = COALESCE(EXCLUDED.learner_id, user_credentials.learner_id),
              data = user_credentials.data || EXCLUDED.data,
              updated_at = now();
          `.catch((err) => console.warn("[Neon DB] user_credentials learner sync error:", err))
        );
      }

      if (data.enrolment) {
        const e = data.enrolment;
        dbTasks.push(
          sql`
            INSERT INTO enrolments (
              id, learner_id, course_id, course_slug, course_title, course_level_label,
              class_id, status, funding_type, data, created_at, updated_at
            )
            VALUES (
              ${e.id},
              ${e.learnerId},
              ${e.courseId},
              ${e.courseSlug || e.courseId},
              ${e.courseTitle || ""},
              ${e.courseLevelLabel || null},
              ${e.classId || null},
              ${e.status || "active"},
              ${e.fundingType || "self_pay"},
              ${JSON.stringify(e)},
              now(),
              now()
            )
            ON CONFLICT (id) DO UPDATE SET
              learner_id = EXCLUDED.learner_id,
              course_id = EXCLUDED.course_id,
              course_slug = EXCLUDED.course_slug,
              course_title = EXCLUDED.course_title,
              course_level_label = EXCLUDED.course_level_label,
              class_id = EXCLUDED.class_id,
              status = EXCLUDED.status,
              funding_type = EXCLUDED.funding_type,
              data = EXCLUDED.data,
              updated_at = now();
          `.catch(async () => {
            await sql`
              INSERT INTO enrolments (id, learner_id, course_id, data, created_at, updated_at)
              VALUES (${e.id}, ${e.learnerId}, ${e.courseId}, ${JSON.stringify(e)}, now(), now())
              ON CONFLICT (id) DO UPDATE SET
                learner_id = EXCLUDED.learner_id,
                course_id = EXCLUDED.course_id,
                data = EXCLUDED.data,
                updated_at = now();
            `.catch((err) => console.warn("[Neon DB] enrolments fallback sync error:", err));
          })
        );
      }

      if (data.paymentRecord) {
        dbTasks.push(
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
          `.catch((err) => console.warn("[Neon DB] payments sync error:", err))
        );
      }

      if (data.paymentSchedules && data.paymentSchedules.length > 0) {
        for (const sched of data.paymentSchedules) {
          const s = sched as any;
          dbTasks.push(
            sql`
              INSERT INTO payment_schedules (
                id,
                enrolment_id,
                learner_id,
                instalment_number,
                due_date,
                amount,
                status,
                paid_at,
                payment_reference,
                grace_expiry_date,
                data,
                created_at,
                updated_at
              )
              VALUES (
                ${s.id},
                ${s.enrolmentId || "enr-unknown"},
                ${s.learnerId || "lrn-unknown"},
                ${Number(s.instalmentNumber || 1)},
                ${s.dueDate ? new Date(s.dueDate).toISOString() : new Date().toISOString()},
                ${Number(s.amountGbp ?? s.amount ?? 0)},
                ${s.status || "due"},
                ${s.paidAt ? new Date(s.paidAt).toISOString() : null},
                ${s.receiptRef || s.paymentReference || null},
                ${s.graceExpiryDate ? new Date(s.graceExpiryDate).toISOString() : null},
                ${JSON.stringify(s)},
                now(),
                now()
              )
              ON CONFLICT (id) DO UPDATE SET
                enrolment_id = EXCLUDED.enrolment_id,
                learner_id = EXCLUDED.learner_id,
                instalment_number = EXCLUDED.instalment_number,
                due_date = EXCLUDED.due_date,
                amount = EXCLUDED.amount,
                status = EXCLUDED.status,
                paid_at = EXCLUDED.paid_at,
                payment_reference = EXCLUDED.payment_reference,
                grace_expiry_date = EXCLUDED.grace_expiry_date,
                data = EXCLUDED.data,
                updated_at = now();
            `.catch((err) => console.warn("[Neon DB] payment_schedules sync error:", err))
          );
        }
      }

      await Promise.all(dbTasks);
      lastNeonPullPerf = typeof performance !== "undefined" ? performance.now() : Date.now();
    } catch (err) {
      console.warn("[Neon DB] savePersistedRecord async sync warning:", err);
    }
  })();
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
    } else {
      const { seedPaymentSchedules } = require("@/lib/repositories/seedData");
      const seedItem = seedPaymentSchedules.find((s: any) => s.id === scheduleId);
      if (seedItem) {
        store.paymentSchedules.push({ ...seedItem, ...updates });
      } else {
        store.paymentSchedules.push({ id: scheduleId, ...updates } as any);
      }
    }
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);

    try {
      const { seedPaymentSchedules } = require("@/lib/repositories/seedData");
      const seedIdx = seedPaymentSchedules.findIndex((s: any) => s.id === scheduleId);
      if (seedIdx >= 0) {
        seedPaymentSchedules[seedIdx] = { ...seedPaymentSchedules[seedIdx], ...updates };
      }
    } catch {
      // In-memory update optional
    }

    if (process.env.DATABASE_URL) {
      (async () => {
        try {
          const { isDbConfigured, sql } = await import("@/lib/db");
          if (!isDbConfigured) return;
          const updatedItem = (store.paymentSchedules || []).find((s) => s.id === scheduleId);
          if (updatedItem) {
            await sql`
              UPDATE payment_schedules
              SET status = ${updatedItem.status || "due"},
                  paid_at = ${updatedItem.paidAt ? new Date(updatedItem.paidAt).toISOString() : null},
                  data = ${JSON.stringify(updatedItem)}::jsonb,
                  updated_at = now()
              WHERE id = ${scheduleId};
            `;
          }
        } catch (dbErr) {
          console.warn("[Neon DB] updatePaymentScheduleStatusInStore warning:", dbErr);
        }
      })();
    }

    return true;
  } catch (err) {
    console.error("[persistedData] Failed to update schedule status:", err);
    return false;
  }
}

export async function syncUserCredentialToNeon(user: PersistedUserRecord): Promise<void> {
  if (!process.env.DATABASE_URL || !user?.email) return;
  try {
    const { isDbConfigured, sql, ensureDbTablesExist } = await import("@/lib/db");
    if (!isDbConfigured) return;
    await ensureDbTablesExist();
    const cleanEmail = user.email.toLowerCase().trim();
    await sql`
      INSERT INTO user_credentials (
        id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at, updated_at
      )
      VALUES (
        ${user.id},
        ${cleanEmail},
        ${user.name || cleanEmail.split("@")[0]},
        ${user.role || "student"},
        ${user.active ?? true},
        ${user.tutorId || null},
        ${user.learnerId || null},
        ${user.specialism || null},
        ${user.department || null},
        ${JSON.stringify(user)}::jsonb,
        now(),
        now()
      )
      ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, user_credentials.name),
        role = COALESCE(EXCLUDED.role, user_credentials.role),
        active = EXCLUDED.active,
        tutor_id = COALESCE(EXCLUDED.tutor_id, user_credentials.tutor_id),
        learner_id = COALESCE(EXCLUDED.learner_id, user_credentials.learner_id),
        specialism = COALESCE(EXCLUDED.specialism, user_credentials.specialism),
        department = COALESCE(EXCLUDED.department, user_credentials.department),
        data = COALESCE(user_credentials.data, '{}'::jsonb) || EXCLUDED.data,
        updated_at = now();
    `;
  } catch (err) {
    console.warn("[Neon DB] user_credentials sync error:", err);
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
      let learnerId: string | undefined;
      let tutorId: string | undefined;

      const matchedLearner = store.learners?.find(
        (l) => l.email.toLowerCase() === cleanEmail
      );
      if (matchedLearner) {
        name = `${matchedLearner.firstName} ${matchedLearner.lastName}`.trim() || name;
        learnerId = matchedLearner.id;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { seedUsers, seedLearners } = require("@/lib/repositories/seedData");
        const su = seedUsers.find((x: any) => x.email.toLowerCase() === cleanEmail);
        if (su) {
          role = su.role;
          name = su.name;
          tutorId = su.tutorId;
          learnerId = su.learnerId || learnerId;
        } else if (!matchedLearner) {
          const sl = seedLearners.find((x: any) => x.email.toLowerCase() === cleanEmail);
          if (sl) {
            name = `${sl.firstName} ${sl.lastName}`.trim() || name;
            learnerId = sl.id;
          }
        }
      } catch { }

      user = {
        id: matchedLearner?.userId || `user-${Date.now().toString(36)}`,
        email: cleanEmail,
        name,
        role,
        learnerId,
        tutorId,
        passwordHash: hashPassword(newPassword),
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
      };
      store.userCredentials.push(user);
    } else {
      user.passwordHash = hashPassword(newPassword);
      user.temporaryPassword = undefined;
      user.mustChangePassword = false;
    }

    const filePath = getStoreFilePath();
    writeStoreToDisk(filePath, store);
    syncPersistedRecords(true);

    // Continuous Neon Cloud synchronization
    syncStoreSnapshotToNeon(store).catch(() => { });
    syncUserCredentialToNeon(user).catch(() => { });

    return true;
  } catch (err) {
    console.error("[persistedData] Failed to update password:", err);
    return false;
  }
}

export async function updateLearnerPasswordInStoreAsync(
  email: string,
  newPassword: string
): Promise<boolean> {
  const ok = updateLearnerPasswordInStore(email, newPassword);
  if (!ok) return false;
  const store = loadPersistedRecords();
  const cleanEmail = email.toLowerCase().trim();
  const user = store.userCredentials?.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    await Promise.all([
      syncUserCredentialToNeon(user),
      syncStoreSnapshotToNeon(store),
    ]);
  }
  return true;
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
          .catch(() => { });
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
        .catch(() => { });
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
        .catch(() => { });
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

export async function savePersistedCourse(course: any): Promise<void> {
  try {
    const store = loadPersistedRecords();
    if (!store.courseOverrides) store.courseOverrides = {};
    store.courseOverrides[course.id] = course;
    const filePath = getStoreFilePath();
    try {
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    } catch (fileErr) {
      console.warn("[persistedData] Local file write warning:", fileErr);
    }
    syncPersistedRecords(true);
    lastNeonPullTimestamp = Date.now();

    // Continuous Neon Cloud synchronization - fully awaited
    await syncStoreSnapshotToNeon(store);

    if (process.env.DATABASE_URL) {
      try {
        const { isDbConfigured, sql } = await import("@/lib/db");
        if (isDbConfigured) {
          await sql`
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
          `;
        }
      } catch (err) {
        console.warn("[Neon DB] course_catalog sync error:", err);
      }
    }
  } catch (err) {
    console.error("[persistedData] Failed to save course override:", err);
  }
}

export async function deletePersistedCourse(courseId: string): Promise<void> {
  try {
    const store = loadPersistedRecords();
    if (store.courseOverrides && store.courseOverrides[courseId]) {
      delete store.courseOverrides[courseId];
      const filePath = getStoreFilePath();
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
      syncPersistedRecords(true);
      lastNeonPullTimestamp = Date.now();

      // Continuous Neon Cloud synchronization
      await syncStoreSnapshotToNeon(store);

      if (process.env.DATABASE_URL) {
        try {
          const { isDbConfigured, sql } = await import("@/lib/db");
          if (isDbConfigured) {
            await sql`DELETE FROM course_catalog WHERE id = ${courseId}`;
          }
        } catch (err) {
          console.warn("[Neon DB] course_catalog delete error:", err);
        }
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
      return merged.map(normalizeLiveCourse);
    }
    return courses.map(normalizeLiveCourse);
  } catch (err) {
    console.error("[persistedData] Failed to get live courses:", err);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { courses } = require("@/content/courses");
    return courses.map(normalizeLiveCourse);
  }
}

/** Keep editable catalogue records safe for public pages, even when older
 * admin saves omit fields introduced in a later version of the site. */
function normalizeLiveCourse(course: Course): Course {
  const record = (course || {}) as Course;
  return {
    ...record,
    start_dates: Array.isArray(record.start_dates) ? record.start_dates : [],
    faqs: Array.isArray(record.faqs) ? record.faqs : [],
    job_prospects: Array.isArray(record.job_prospects) ? record.job_prospects : [],
    progression: Array.isArray(record.progression) ? record.progression : [],
    tutoring_slots: Array.isArray(record.tutoring_slots) ? record.tutoring_slots : [],
    training_locations: Array.isArray(record.training_locations) ? record.training_locations : [],
    tuition_includes: Array.isArray(record.tuition_includes) ? record.tuition_includes : [],
    levels: Array.isArray(record.levels)
      ? record.levels
        .filter((level) =>
          Boolean(level) &&
          level.price_gbp !== null &&
          level.price_gbp !== undefined &&
          String(level.price_gbp).trim() !== "" &&
          Number.isFinite(Number(level.price_gbp))
        )
        .map((level) => ({
          ...level,
          course_id: level.course_id || record.id,
          level_label: level.level_label || "Course level",
          price_gbp: Number(level.price_gbp),
          regular_price_gbp:
            level.regular_price_gbp !== undefined && level.regular_price_gbp !== null
              ? Number(level.regular_price_gbp)
              : undefined,
          full_pay_discount_percent:
            level.full_pay_discount_percent !== undefined && level.full_pay_discount_percent !== null
              ? Number(level.full_pay_discount_percent)
              : null,
          entry_requirements: Array.isArray(level.entry_requirements) ? level.entry_requirements : [],
          units: Array.isArray(level.units) ? level.units : [],
          plans: Array.isArray(level.plans) ? level.plans : [],
        }))
      : [],
  };
}

export function savePersistedCohort(cohort: any): void {
  try {
    const store = loadPersistedRecords();
    if (!store.cohorts) store.cohorts = [];
    if (store.deletedCohortIds) {
      store.deletedCohortIds = store.deletedCohortIds.filter((id) => id !== cohort.id);
    }
    const idx = store.cohorts.findIndex((c) => c.id === cohort.id);
    if (idx >= 0) {
      store.cohorts[idx] = { ...store.cohorts[idx], ...cohort };
    } else {
      store.cohorts.push(cohort);
    }

    // Keep the cohort's primary live ClassSession in sync when nextSessionDate or zoomLink changes
    if (cohort.nextSessionDate) {
      if (!store.classSessions) store.classSessions = [];
      const startIso = new Date(cohort.nextSessionDate).toISOString();
      const endIso = new Date(new Date(cohort.nextSessionDate).getTime() + 90 * 60 * 1000).toISOString();
      const existingSessionIdx = store.classSessions.findIndex(
        (s) => s.cohortId === cohort.id || s.classId === cohort.id
      );
      if (existingSessionIdx >= 0) {
        store.classSessions[existingSessionIdx] = {
          ...store.classSessions[existingSessionIdx],
          classId: cohort.id,
          cohortId: cohort.id,
          scheduledAt: startIso,
          startsAt: startIso,
          endsAt: endIso,
          zoomLink:
            cohort.zoomLink ||
            store.classSessions[existingSessionIdx].zoomLink ||
            "https://zoom.us/j/smartminds-live",
        };
      } else {
        store.classSessions.push({
          id: `sess-${cohort.id}-primary`,
          classId: cohort.id,
          cohortId: cohort.id,
          title: `${cohort.courseTitle || cohort.name || "Live Cohort"} — Live Seminar`,
          topic: cohort.scheduleDescription || "Interactive tutor-led live session",
          scheduledAt: startIso,
          startsAt: startIso,
          endsAt: endIso,
          durationMinutes: 90,
          zoomLink: cohort.zoomLink || "https://zoom.us/j/smartminds-live",
          status: "scheduled",
        });
      }
    }

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });
  } catch (err) {
    console.error("[persistedData] Failed to save cohort:", err);
  }
}

export function deletePersistedCohort(cohortId: string): boolean {
  try {
    const store = loadPersistedRecords();
    if (!store.cohorts) store.cohorts = [];
    if (!store.deletedCohortIds) store.deletedCohortIds = [];
    if (!store.deletedCohortIds.includes(cohortId)) {
      store.deletedCohortIds.push(cohortId);
    }
    store.cohorts = store.cohorts.filter((c) => c.id !== cohortId);
    if (store.classSessions) {
      store.classSessions = store.classSessions.filter((s) => s.cohortId !== cohortId);
    }

    // Also remove immediately from in-memory seedClasses & seedSessions
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { seedClasses, seedSessions } = require("@/lib/repositories/seedData");
      if (Array.isArray(seedClasses)) {
        const idx = seedClasses.findIndex((c: any) => c.id === cohortId);
        if (idx >= 0) seedClasses.splice(idx, 1);
      }
      if (Array.isArray(seedSessions)) {
        for (let i = seedSessions.length - 1; i >= 0; i--) {
          if (seedSessions[i].cohortId === cohortId) {
            seedSessions.splice(i, 1);
          }
        }
      }
    } catch { }

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });
    return true;
  } catch (err) {
    console.error("[persistedData] Failed to delete cohort:", err);
    return false;
  }
}

export function getPersistedCohorts(): any[] {
  syncPersistedRecords(false);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedClasses } = require("@/lib/repositories/seedData");
    const store = loadPersistedRecords();
    const deletedSet = new Set(store.deletedCohortIds || []);
    return (seedClasses || []).filter((c: any) => !deletedSet.has(c.id));
  } catch {
    return [];
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
    syncStoreSnapshotToNeon(store).catch(() => { });
  } catch (err) {
    console.error("[persistedData] Failed to save class session:", err);
  }
}

export function savePersistedAssignment(assignment: any): void {
  try {
    const store = loadPersistedRecords();
    if (!store.assignments) store.assignments = [];
    const idx = store.assignments.findIndex((a) => a.id === assignment.id);
    if (idx >= 0) {
      store.assignments[idx] = { ...store.assignments[idx], ...assignment };
    } else {
      store.assignments.push(assignment);
    }
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });
  } catch (err) {
    console.error("[persistedData] Failed to save assignment:", err);
  }
}

export function deletePersistedAssignment(assignmentId: string): boolean {
  try {
    const store = loadPersistedRecords();
    if (!store.assignments) store.assignments = [];
    store.assignments = store.assignments.filter((a) => a.id !== assignmentId);
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });
    return true;
  } catch (err) {
    console.error("[persistedData] Failed to delete assignment:", err);
    return false;
  }
}

export function savePersistedSubmission(submission: any): void {
  try {
    const store = loadPersistedRecords();
    if (!store.submissions) store.submissions = [];
    const idx = store.submissions.findIndex((s) => s.id === submission.id);
    if (idx >= 0) {
      store.submissions[idx] = { ...store.submissions[idx], ...submission };
    } else {
      store.submissions.push(submission);
    }
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });
  } catch (err) {
    console.error("[persistedData] Failed to save submission:", err);
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
    syncStoreSnapshotToNeon(store).catch((err) => {
      console.warn("[persistedData] Background sync paymentGatewaySettings to Neon:", err);
    });
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
      seedAssignments,
      seedSubmissions,
      seedBlockedDays,
      seedAvailabilityRules,
      seedBookings,
      collegePagesData,
      collegePageBuilderSections,
      collegePaymentGatewaySettings,
    } = require("@/lib/repositories/seedData");

    const store = loadPersistedRecords();
    if (store.learners && Array.isArray(store.learners) && store.learners.length > 0) {
      for (const sl of store.learners) {
        const existingIdx = seedLearners.findIndex((l: any) => l.id === sl.id);
        if (existingIdx >= 0) {
          seedLearners[existingIdx] = { ...seedLearners[existingIdx], ...sl };
        } else {
          seedLearners.push(sl);
        }
      }
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

    if (store.enrolments && Array.isArray(store.enrolments) && store.enrolments.length > 0) {
      for (const se of store.enrolments) {
        const existingIdx = seedEnrolments.findIndex((e: any) => e.id === se.id);
        if (existingIdx >= 0) {
          seedEnrolments[existingIdx] = { ...seedEnrolments[existingIdx], ...se };
        } else {
          seedEnrolments.push(se);
        }
      }
    }

    if (store.paymentRecords && Array.isArray(store.paymentRecords) && store.paymentRecords.length > 0) {
      for (const pr of store.paymentRecords) {
        const existingIdx = seedPaymentRecords.findIndex((r: any) => r.id === pr.id);
        if (existingIdx >= 0) {
          seedPaymentRecords[existingIdx] = { ...seedPaymentRecords[existingIdx], ...pr };
        } else {
          seedPaymentRecords.push(pr);
        }
      }
    }

    if (store.paymentSchedules && Array.isArray(store.paymentSchedules) && store.paymentSchedules.length > 0) {
      for (const ps of store.paymentSchedules) {
        const existingIdx = seedPaymentSchedules.findIndex((s: any) => s.id === ps.id);
        if (existingIdx >= 0) {
          seedPaymentSchedules[existingIdx] = { ...seedPaymentSchedules[existingIdx], ...ps };
        } else {
          seedPaymentSchedules.push(ps);
        }
      }
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
    if (seedClasses) {
      if (store.deletedCohortIds && store.deletedCohortIds.length > 0) {
        const deletedSet = new Set(store.deletedCohortIds);
        for (let i = seedClasses.length - 1; i >= 0; i--) {
          if (deletedSet.has(seedClasses[i].id)) {
            seedClasses.splice(i, 1);
          }
        }
      }
      if (store.cohorts) {
        for (const pc of store.cohorts) {
          if (store.deletedCohortIds?.includes(pc.id)) continue;
          const idx = seedClasses.findIndex((c: any) => c.id === pc.id);
          if (idx >= 0) {
            seedClasses[idx] = { ...seedClasses[idx], ...pc };
          } else {
            seedClasses.push(pc);
          }
        }
      }
    }

    // Sync Assignments, Submissions & Sessions (Outside automated test runs, only real created items exist)
    const isTestEnv = isAutomatedTestEnv();

    if (!isTestEnv) {
      const FICTIONAL_DEMO_NAMES = new Set([
        "dr. eleanor vance",
        "eleanor vance",
        "marcus sterling",
        "amara patel",
        "david kalu",
        "chloe davies",
      ]);
      const DEMO_SESSION_IDS = new Set([
        "session-care-01",
        "session-lead-01",
        "session-ey-01",
        "session-mh-01",
      ]);
      const DEMO_ASSIGNMENT_IDS = new Set([
        "assign-care-301",
        "assign-lead-501",
        "assign-ey-302",
      ]);
      const DEMO_SUBMISSION_IDS = new Set([
        "sub-001",
        "sub-002",
        "sub-003",
      ]);

      if (Array.isArray(seedSessions)) {
        seedSessions.length = 0;
        if (Array.isArray(store.classSessions) && store.classSessions.length > 0) {
          const cleanSessions = store.classSessions.filter(
            (s: any) =>
              !DEMO_SESSION_IDS.has(s.id) &&
              !(typeof s.recordingUrl === "string" && s.recordingUrl.includes("stream.smartmindstraining.co.uk/sessions/"))
          );
          seedSessions.push(...cleanSessions);
        }
      }
      if (Array.isArray(seedLearners)) {
        for (let i = seedLearners.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedLearners[i])) seedLearners.splice(i, 1);
        }
      }
      if (Array.isArray(seedUsers)) {
        for (let i = seedUsers.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedUsers[i])) seedUsers.splice(i, 1);
        }
      }
      if (Array.isArray(seedEnrolments)) {
        for (let i = seedEnrolments.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedEnrolments[i])) {
            seedEnrolments.splice(i, 1);
          } else if (
            seedEnrolments[i]?.tutorName &&
            FICTIONAL_DEMO_NAMES.has(String(seedEnrolments[i].tutorName).trim().toLowerCase())
          ) {
            seedEnrolments[i].tutorName = "Unassigned / TBA";
          }
        }
      }
      if (Array.isArray(seedClasses)) {
        for (let i = 0; i < seedClasses.length; i++) {
          const cls = seedClasses[i];
          if (
            cls?.tutorName &&
            FICTIONAL_DEMO_NAMES.has(String(cls.tutorName).trim().toLowerCase())
          ) {
            cls.tutorName = "Unassigned / TBA";
            cls.tutorId = "";
          }
        }
      }
      if (Array.isArray(seedPaymentRecords)) {
        for (let i = seedPaymentRecords.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedPaymentRecords[i])) seedPaymentRecords.splice(i, 1);
        }
      }
      if (Array.isArray(seedPaymentSchedules)) {
        for (let i = seedPaymentSchedules.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedPaymentSchedules[i])) seedPaymentSchedules.splice(i, 1);
        }
      }
      if (Array.isArray(seedAssignments)) {
        seedAssignments.length = 0;
        if (Array.isArray(store.assignments) && store.assignments.length > 0) {
          const cleanAssignments = store.assignments.filter(
            (a: any) => !DEMO_ASSIGNMENT_IDS.has(a.id)
          );
          seedAssignments.push(...cleanAssignments);
        }
      }
      if (Array.isArray(seedSubmissions)) {
        seedSubmissions.length = 0;
        if (Array.isArray(store.submissions) && store.submissions.length > 0) {
          const cleanSubmissions = store.submissions.filter(
            (s: any) =>
              !DEMO_SUBMISSION_IDS.has(s.id) &&
              !DEMO_ASSIGNMENT_IDS.has(s.assignmentId) &&
              !isFictionalDemoRecord(s)
          );
          seedSubmissions.push(...cleanSubmissions);
        }
      }
    } else {
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
      if (Array.isArray(store.assignments) && Array.isArray(seedAssignments)) {
        for (const pa of store.assignments) {
          const idx = seedAssignments.findIndex((a: any) => a.id === pa.id);
          if (idx >= 0) seedAssignments[idx] = { ...seedAssignments[idx], ...pa };
          else seedAssignments.push(pa);
        }
      }
      if (Array.isArray(store.submissions) && Array.isArray(seedSubmissions)) {
        for (const ps of store.submissions) {
          const idx = seedSubmissions.findIndex((s: any) => s.id === ps.id);
          if (idx >= 0) seedSubmissions[idx] = { ...seedSubmissions[idx], ...ps };
          else seedSubmissions.push(ps);
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
  const isTest = isAutomatedTestEnv();
  const rawUsers: PersistedUserRecord[] = store.userCredentials ? [...store.userCredentials] : [];
  const users: PersistedUserRecord[] = isTest
    ? rawUsers
    : rawUsers.filter((u) => !isFictionalDemoRecord(u));

  // Include superadmin George if not present
  if (!users.some((u) => u.email.toLowerCase() === "thegeorgedigitals@gmail.com")) {
    users.unshift({
      id: "user-super-george",
      email: "thegeorgedigitals@gmail.com",
      name: "David George",
      role: "super_admin",
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Ensure Centre Owner Millie Davis is always present
  if (!users.some((u) => u.email.toLowerCase() === "millie@smartmindstraining.co.uk")) {
    users.push({
      id: "user-owner-01",
      email: "millie@smartmindstraining.co.uk",
      name: "Millie Davis",
      role: "owner_admin",
      department: "Executive Leadership",
      specialism: "Centre Director & Quality Lead",
      active: true,
      createdAt: "2026-09-01T09:00:00Z",
    });
  }

  // Ensure any real enrolled learners in store.learners are represented in the user directory
  if (Array.isArray(store.learners)) {
    for (const l of store.learners) {
      if (!l?.email) continue;
      if (!isTest && isFictionalDemoRecord(l)) continue;
      const existing = users.find((u) => u.email.toLowerCase() === l.email.toLowerCase());
      if (!existing) {
        users.push({
          id: l.userId || `user-${l.id}`,
          email: l.email,
          name: `${l.firstName || ""} ${l.lastName || ""}`.trim() || l.email,
          role: "student",
          learnerId: l.id,
          active: l.accessStatus !== "archived",
          createdAt: l.enrolmentDate || new Date().toISOString(),
        });
      } else if (!existing.learnerId) {
        existing.learnerId = l.id;
      }
    }
  }

  // Include seed staff only in automated test runs
  if (isTest) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { seedUsers } = require("@/lib/repositories/seedData");
      for (const su of seedUsers) {
        const existing = users.find((u) => u.email.toLowerCase() === su.email.toLowerCase());
        if (!existing) {
          users.push({
            id: su.id,
            email: su.email,
            name: su.name,
            role: su.role,
            learnerId: su.learnerId,
            tutorId: su.tutorId,
            department: su.department,
            specialism: su.specialism,
            active: su.active ?? true,
            createdAt: su.createdAt || new Date().toISOString(),
          });
        } else {
          if (!existing.department && su.department) existing.department = su.department;
          if (!existing.specialism && su.specialism) existing.specialism = su.specialism;
          if (existing.active === undefined && su.active !== undefined) existing.active = su.active;
          if (!existing.tutorId && su.tutorId) existing.tutorId = su.tutorId;
        }
      }
    } catch { }
  }

  return users;
}

export function createPlatformUserInStore(data: {
  id?: string;
  name: string;
  email: string;
  role: string;
  password: string;
  department?: string;
  specialism?: string;
  tutorId?: string;
  learnerId?: string;
}): PersistedUserRecord {
  const store = loadPersistedRecords();
  if (!store.userCredentials) store.userCredentials = [];

  const cleanEmail = data.email.toLowerCase().trim();
  const cleanPw = data.password.trim();

  const existingIdx = store.userCredentials.findIndex(
    (u) => u.email.toLowerCase() === cleanEmail || (data.id && u.id === data.id)
  );
  const existing = existingIdx >= 0 ? store.userCredentials[existingIdx] : undefined;

  const newUser: PersistedUserRecord = {
    id: data.id || existing?.id || `user-custom-${Date.now().toString(36)}`,
    email: cleanEmail,
    name: data.name.trim(),
    role: data.role,
    tutorId:
      data.tutorId ||
      existing?.tutorId ||
      (data.role === "tutor" ? `tutor-${Date.now()}` : undefined),
    learnerId: data.learnerId || existing?.learnerId,
    department: data.department?.trim() || existing?.department,
    specialism: data.specialism?.trim() || existing?.specialism,
    active: true,
    passwordHash: hashPassword(cleanPw),
    temporaryPassword: cleanPw,
    mustChangePassword: true,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.userCredentials[existingIdx] = {
      ...existing,
      ...newUser,
    };
  } else {
    store.userCredentials.unshift(newUser);
  }

  const filePath = getStoreFilePath();
  writeStoreToDisk(filePath, store);
  syncPersistedRecords(true);
  syncStoreSnapshotToNeon(store).catch(() => { });
  syncUserCredentialToNeon(newUser).catch(() => { });

  return newUser;
}

export function deleteUserFromStore(userIdOrEmail: string): boolean {
  try {
    const store = loadPersistedRecords();
    if (!store.userCredentials) store.userCredentials = [];

    const cleanQuery = userIdOrEmail.toLowerCase().trim();
    const matchedUser = store.userCredentials.find(
      (u) =>
        u.id === userIdOrEmail ||
        u.learnerId === userIdOrEmail ||
        u.tutorId === userIdOrEmail ||
        u.email.toLowerCase() === cleanQuery
    );
    const matchedLearner = (store.learners || []).find(
      (l) =>
        l.id === userIdOrEmail ||
        l.userId === userIdOrEmail ||
        l.email?.toLowerCase() === cleanQuery
    );

    const targetEmail =
      matchedUser?.email?.toLowerCase() ||
      matchedLearner?.email?.toLowerCase() ||
      cleanQuery;
    const targetUserId = matchedUser?.id || matchedLearner?.userId || userIdOrEmail;
    const targetLearnerId = matchedUser?.learnerId || matchedLearner?.id || userIdOrEmail;
    const targetTutorId = matchedUser?.tutorId || userIdOrEmail;
    const targetNameLower = (
      matchedUser?.name ||
      (matchedLearner ? `${matchedLearner.firstName} ${matchedLearner.lastName}` : "")
    )
      .trim()
      .toLowerCase();

    const initialLen = store.userCredentials.length;
    store.userCredentials = store.userCredentials.filter(
      (u) =>
        u.id !== userIdOrEmail &&
        u.id !== targetUserId &&
        u.learnerId !== targetLearnerId &&
        u.email.toLowerCase() !== cleanQuery &&
        u.email.toLowerCase() !== targetEmail
    );

    if (Array.isArray(store.learners)) {
      store.learners = store.learners.filter(
        (l) =>
          l.id !== userIdOrEmail &&
          l.id !== targetLearnerId &&
          l.userId !== userIdOrEmail &&
          l.userId !== targetUserId &&
          l.email?.toLowerCase() !== cleanQuery &&
          l.email?.toLowerCase() !== targetEmail
      );
    }

    // Remove student enrolments, payment schedules, payment records, and submissions
    if (Array.isArray(store.enrolments)) {
      store.enrolments = store.enrolments
        .filter((e) => e.learnerId !== targetLearnerId && e.learnerId !== userIdOrEmail)
        .map((e) => {
          // If the deleted user was a tutor assigned to this student enrolment, unassign cleanly
          if (
            e.tutorId === targetTutorId ||
            e.tutorId === targetUserId ||
            (targetNameLower && e.tutorName?.trim().toLowerCase() === targetNameLower)
          ) {
            return {
              ...e,
              tutorId: "unassigned",
              tutorName: "Unassigned / TBA",
            };
          }
          return e;
        });
    }

    if (Array.isArray(store.paymentRecords)) {
      store.paymentRecords = store.paymentRecords.filter(
        (p) => p.learnerId !== targetLearnerId && p.learnerId !== userIdOrEmail
      );
    }

    if (Array.isArray(store.paymentSchedules)) {
      store.paymentSchedules = store.paymentSchedules.filter(
        (p) => p.learnerId !== targetLearnerId && p.learnerId !== userIdOrEmail
      );
    }

    if (Array.isArray(store.submissions)) {
      store.submissions = store.submissions.filter(
        (s) => s.learnerId !== targetLearnerId && s.learnerId !== userIdOrEmail
      );
    }

    // If the deleted user was a tutor, unassign them from any cohorts
    if (Array.isArray(store.cohorts)) {
      store.cohorts = store.cohorts.map((c) => {
        if (
          c.tutorId === targetTutorId ||
          c.tutorId === targetUserId ||
          c.tutorId === userIdOrEmail ||
          (targetNameLower && c.tutorName?.trim().toLowerCase() === targetNameLower)
        ) {
          return {
            ...c,
            tutorId: "unassigned",
            tutorName: "Unassigned / TBA",
          };
        }
        return c;
      });
    }

    // If the deleted user was assigned to any consultation bookings, unassign them
    if (Array.isArray(store.bookings)) {
      store.bookings = store.bookings.map((b) => {
        if (
          b.assignedStaffId === targetUserId ||
          b.assignedStaffId === userIdOrEmail ||
          (targetNameLower && b.assignedStaffName?.trim().toLowerCase() === targetNameLower)
        ) {
          return {
            ...b,
            assignedStaffId: undefined,
            assignedStaffName: undefined,
          };
        }
        return b;
      });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        seedUsers,
        seedLearners,
        seedEnrolments,
        seedPaymentRecords,
        seedPaymentSchedules,
        seedSubmissions,
        seedClasses,
        seedBookings,
      } = require("@/lib/repositories/seedData");
      if (Array.isArray(seedUsers)) {
        for (let i = seedUsers.length - 1; i >= 0; i--) {
          if (
            seedUsers[i].id === userIdOrEmail ||
            seedUsers[i].id === targetUserId ||
            seedUsers[i].learnerId === targetLearnerId ||
            seedUsers[i].email?.toLowerCase() === cleanQuery ||
            seedUsers[i].email?.toLowerCase() === targetEmail
          ) {
            seedUsers.splice(i, 1);
          }
        }
      }
      if (Array.isArray(seedLearners)) {
        for (let i = seedLearners.length - 1; i >= 0; i--) {
          if (
            seedLearners[i].id === userIdOrEmail ||
            seedLearners[i].id === targetLearnerId ||
            seedLearners[i].userId === targetUserId ||
            seedLearners[i].email?.toLowerCase() === cleanQuery ||
            seedLearners[i].email?.toLowerCase() === targetEmail
          ) {
            seedLearners.splice(i, 1);
          }
        }
      }
      if (Array.isArray(seedEnrolments)) {
        for (let i = seedEnrolments.length - 1; i >= 0; i--) {
          if (
            seedEnrolments[i].learnerId === targetLearnerId ||
            seedEnrolments[i].learnerId === userIdOrEmail
          ) {
            seedEnrolments.splice(i, 1);
          } else if (
            seedEnrolments[i].tutorId === targetTutorId ||
            seedEnrolments[i].tutorId === targetUserId ||
            (targetNameLower &&
              seedEnrolments[i].tutorName?.trim().toLowerCase() === targetNameLower)
          ) {
            seedEnrolments[i].tutorId = "unassigned";
            seedEnrolments[i].tutorName = "Unassigned / TBA";
          }
        }
      }
      if (Array.isArray(seedPaymentRecords)) {
        for (let i = seedPaymentRecords.length - 1; i >= 0; i--) {
          if (
            seedPaymentRecords[i].learnerId === targetLearnerId ||
            seedPaymentRecords[i].learnerId === userIdOrEmail
          ) {
            seedPaymentRecords.splice(i, 1);
          }
        }
      }
      if (Array.isArray(seedPaymentSchedules)) {
        for (let i = seedPaymentSchedules.length - 1; i >= 0; i--) {
          if (
            seedPaymentSchedules[i].learnerId === targetLearnerId ||
            seedPaymentSchedules[i].learnerId === userIdOrEmail
          ) {
            seedPaymentSchedules.splice(i, 1);
          }
        }
      }
      if (Array.isArray(seedSubmissions)) {
        for (let i = seedSubmissions.length - 1; i >= 0; i--) {
          if (
            seedSubmissions[i].learnerId === targetLearnerId ||
            seedSubmissions[i].learnerId === userIdOrEmail
          ) {
            seedSubmissions.splice(i, 1);
          }
        }
      }
      if (Array.isArray(seedClasses)) {
        for (const cls of seedClasses) {
          if (
            cls.tutorId === targetTutorId ||
            cls.tutorId === targetUserId ||
            cls.tutorId === userIdOrEmail ||
            (targetNameLower && cls.tutorName?.trim().toLowerCase() === targetNameLower)
          ) {
            cls.tutorId = "unassigned";
            cls.tutorName = "Unassigned / TBA";
          }
        }
      }
      if (Array.isArray(seedBookings)) {
        for (const b of seedBookings) {
          if (
            b.assignedStaffId === targetUserId ||
            b.assignedStaffId === userIdOrEmail ||
            (targetNameLower &&
              b.assignedStaffName?.trim().toLowerCase() === targetNameLower)
          ) {
            b.assignedStaffId = undefined;
            b.assignedStaffName = undefined;
          }
        }
      }
    } catch { }

    const filePath = getStoreFilePath();
    writeStoreToDisk(filePath, store);
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });

    try {
      import("@/lib/db").then(async ({ isDbConfigured, sql }) => {
        if (isDbConfigured) {
          await sql`
            DELETE FROM payment_schedules
            WHERE learner_id = ${targetLearnerId}
               OR learner_id = ${userIdOrEmail}
          `.catch(() => { });
          await sql`
            DELETE FROM payments
            WHERE learner_id = ${targetLearnerId}
               OR learner_id = ${userIdOrEmail}
          `.catch(() => { });
          await sql`
            DELETE FROM enrolments
            WHERE learner_id = ${targetLearnerId}
               OR learner_id = ${userIdOrEmail}
          `.catch(() => { });
          await sql`
            DELETE FROM learners
            WHERE id = ${userIdOrEmail}
               OR id = ${targetLearnerId}
               OR user_id = ${userIdOrEmail}
               OR user_id = ${targetUserId}
               OR LOWER(email) = ${cleanQuery}
               OR LOWER(email) = ${targetEmail}
          `.catch(() => { });
          await sql`
            DELETE FROM user_credentials
            WHERE id = ${userIdOrEmail}
               OR id = ${targetUserId}
               OR learner_id = ${targetLearnerId}
               OR LOWER(email) = ${cleanQuery}
               OR LOWER(email) = ${targetEmail}
          `.catch(() => { });
        }
      });
    } catch { }

    return (
      store.userCredentials.length !== initialLen ||
      Boolean(matchedUser) ||
      Boolean(matchedLearner)
    );
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
    } catch { }

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });
    return true;
  } catch (err) {
    console.error("[persistedData] Failed to delete payment:", err);
    return false;
  }
}

export interface UpdatePlatformUserInput {
  userIdOrEmail: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  specialism?: string;
  facultyId?: string;
  facultyName?: string;
  active?: boolean;
}

export function updatePlatformUserInStore(
  input: UpdatePlatformUserInput
): { success: boolean; user?: PersistedUserRecord; error?: string } {
  try {
    const store = loadPersistedRecords();
    if (!store.userCredentials) store.userCredentials = [];

    const cleanQuery = input.userIdOrEmail.toLowerCase().trim();
    let user = store.userCredentials.find(
      (u) => u.id === input.userIdOrEmail || u.email.toLowerCase() === cleanQuery
    );

    if (!user) {
      // Check seedUsers if not yet persisted in userCredentials
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { seedUsers } = require("@/lib/repositories/seedData");
        const seedMatch = seedUsers.find(
          (u: any) => u.id === input.userIdOrEmail || u.email.toLowerCase() === cleanQuery
        );
        if (seedMatch) {
          user = {
            id: seedMatch.id,
            email: seedMatch.email,
            name: seedMatch.name,
            role: seedMatch.role,
            learnerId: seedMatch.learnerId,
            tutorId: seedMatch.tutorId,
            department: seedMatch.department,
            specialism: seedMatch.specialism,
            active: seedMatch.active ?? true,
            createdAt: seedMatch.createdAt || new Date().toISOString(),
          };
          store.userCredentials.push(user);
        }
      } catch { }
    }

    if (!user) {
      return { success: false, error: `User '${input.userIdOrEmail}' was not found in directory.` };
    }

    if (input.name && input.name.trim()) user.name = input.name.trim();
    if (input.email && input.email.trim()) user.email = input.email.toLowerCase().trim();
    if (input.role) user.role = input.role;
    if (input.department !== undefined) user.department = input.department.trim();
    if (input.specialism !== undefined) user.specialism = input.specialism.trim();
    if (input.facultyId !== undefined) user.facultyId = input.facultyId;
    if (input.facultyName !== undefined) user.facultyName = input.facultyName;
    if (input.active !== undefined) user.active = Boolean(input.active);

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
          (u: any) =>
            u.id === user!.id ||
            u.email.toLowerCase() === cleanQuery ||
            u.email.toLowerCase() === user!.email.toLowerCase()
        );
        if (seedMatch) {
          if (input.name && input.name.trim()) seedMatch.name = input.name.trim();
          if (input.email && input.email.trim()) seedMatch.email = input.email.toLowerCase().trim();
          if (input.role) seedMatch.role = input.role as any;
          if (input.department !== undefined) seedMatch.department = input.department.trim();
          if (input.specialism !== undefined) seedMatch.specialism = input.specialism.trim();
          if (input.active !== undefined) seedMatch.active = Boolean(input.active);
          if (user.email.toLowerCase() === "millie@smartmindstraining.co.uk") {
            seedMatch.id = "user-owner-01";
          }
        }
      }
    } catch { }

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });

    // Also sync to Neon user_credentials table if configured
    try {
      import("@/lib/db").then(({ isDbConfigured, sql }) => {
        if (isDbConfigured) {
          sql`
            UPDATE user_credentials
            SET name = ${user!.name},
                email = ${user!.email},
                role = ${user!.role},
                department = ${user!.department || null},
                specialism = ${user!.specialism || null},
                active = ${user!.active !== false}
            WHERE id = ${user!.id} OR LOWER(email) = ${user!.email.toLowerCase()}
          `.catch(() => { });
        }
      });
    } catch { }

    return { success: true, user };
  } catch (err) {
    console.error("[persistedData] Failed to update user:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Internal storage error",
    };
  }
}

export function updateUserRoleInStore(
  userIdOrEmail: string,
  newRole: string
): { success: boolean; user?: PersistedUserRecord } {
  const res = updatePlatformUserInStore({ userIdOrEmail, role: newRole });
  return { success: res.success, user: res.user };
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

    // Purge only fictional demo records, preserving real enrolled learners & staff
    store.paymentRecords = (store.paymentRecords || []).filter((p) => !isFictionalDemoRecord(p));
    store.paymentSchedules = (store.paymentSchedules || []).filter((s) => !isFictionalDemoRecord(s));
    store.learners = (store.learners || []).filter((l) => !isFictionalDemoRecord(l));
    store.enrolments = (store.enrolments || []).filter((e) => !isFictionalDemoRecord(e));

    if (store.userCredentials) {
      store.userCredentials = store.userCredentials.filter((u) => !isFictionalDemoRecord(u));

      // Clean Millie Davis account ID & role, strictly preserve password
      const millie = store.userCredentials.find(
        (u) => u.email.toLowerCase() === "millie@smartmindstraining.co.uk"
      );
      if (millie) {
        millie.id = "user-owner-01";
        millie.role = "owner_admin";
      }
    }

    // Clear fictional in-memory seed records
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const seedData = require("@/lib/repositories/seedData");
      if (Array.isArray(seedData.seedLearners)) {
        for (let i = seedData.seedLearners.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedData.seedLearners[i])) seedData.seedLearners.splice(i, 1);
        }
      }
      if (Array.isArray(seedData.seedEnrolments)) {
        for (let i = seedData.seedEnrolments.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedData.seedEnrolments[i])) seedData.seedEnrolments.splice(i, 1);
        }
      }
      if (Array.isArray(seedData.seedPaymentRecords)) {
        for (let i = seedData.seedPaymentRecords.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedData.seedPaymentRecords[i])) seedData.seedPaymentRecords.splice(i, 1);
        }
      }
      if (Array.isArray(seedData.seedPaymentSchedules)) {
        for (let i = seedData.seedPaymentSchedules.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedData.seedPaymentSchedules[i])) seedData.seedPaymentSchedules.splice(i, 1);
        }
      }
      if (Array.isArray(seedData.seedUsers)) {
        for (let i = seedData.seedUsers.length - 1; i >= 0; i--) {
          if (isFictionalDemoRecord(seedData.seedUsers[i])) seedData.seedUsers.splice(i, 1);
        }
        const millieSeed = seedData.seedUsers.find(
          (u: any) => u.email.toLowerCase() === "millie@smartmindstraining.co.uk"
        );
        if (millieSeed) {
          millieSeed.id = "user-owner-01";
          millieSeed.role = "owner_admin";
        }
      }
    } catch { }

    const filePath = getStoreFilePath();
    writeStoreToDisk(filePath, store);
    syncPersistedRecords(true);
    syncStoreSnapshotToNeon(store).catch(() => { });
    fictionalDemoPurgedFromNeon = false;
    purgeFictionalDemoRecordsFromNeonOnce().catch(() => { });

    return {
      deletedPayments: initialPayments - (store.paymentRecords?.length || 0),
      deletedSchedules: initialSchedules - (store.paymentSchedules?.length || 0),
      deletedLearners: initialLearners - (store.learners?.length || 0),
      deletedEnrolments: initialEnrolments - (store.enrolments?.length || 0),
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
  } catch { }

  let entitlementsData = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedEntitlements } = require("@/lib/repositories/seedData");
    entitlementsData = seedEntitlements;
  } catch { }

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
      } catch { }
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
  } catch { }
  return { ...defaultCohortSchedule };
}

export function saveCohortSchedule(schedule: CohortScheduleConfig): void {
  try {
    const store = loadPersistedRecords();
    store.cohortSchedule = schedule;
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncStoreSnapshotToNeon(store).catch(() => { });
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
    syncStoreSnapshotToNeon(store).catch(() => { });

    try {
      const devLeadsPath = path.join(process.cwd(), "data", "dev_leads.json");
      fs.writeFileSync(devLeadsPath, JSON.stringify([], null, 2));
      const devEmailsPath = path.join(process.cwd(), "data", "dev_emails.json");
      fs.writeFileSync(devEmailsPath, JSON.stringify([], null, 2));
    } catch { }

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
    } catch { }

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
    } catch { }
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
    } catch { }
  } catch (err) {
    console.error("[persistedData] Failed to update enquiry in store:", err);
  }
}

export function listAllEnquiries(): EnquiryLead[] {
  const store = loadPersistedRecords();
  const list: EnquiryLead[] = (store.enquiries || []).filter(
    (e) => !/^enq-00[1-9]/.test(e.id) && !e.email?.endsWith("@example.com")
  );

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
    syncStoreSnapshotToNeon(store);
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
    syncStoreSnapshotToNeon(store);
    return true;
  } catch (err) {
    console.error("[persistedData] Failed to verify and consume reset token:", err);
    return false;
  }
}



export function sanitizeFaculties(raw?: FacultyRecord[]): FacultyRecord[] {
  if (!raw || !Array.isArray(raw)) {
    return [...DEFAULT_COLLEGE_FACULTIES];
  }

  const result: FacultyRecord[] = [];
  const seenIds = new Set<string>();

  for (const item of raw) {
    if (!item?.name || !item.name.trim()) continue;
    const cleanId = (
      item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    ).trim();
    if (!cleanId || seenIds.has(cleanId)) continue;
    seenIds.add(cleanId);

    result.push({
      ...item,
      id: cleanId,
      name: item.name.trim(),
      description: item.description?.trim() || "",
      icon: item.icon || "shield-check",
      color: item.color || "navy",
      status: item.status || "active",
      createdAt: item.createdAt || new Date().toISOString(),
    });
  }

  return result;
}

export function getPersistedFaculties(): FacultyRecord[] {
  try {
    const store = loadPersistedRecords();
    return sanitizeFaculties(store.faculties);
  } catch (err) {
    console.error("[persistedData] Failed to load faculties:", err);
    return DEFAULT_COLLEGE_FACULTIES;
  }
}

export async function saveFacultyToStore(faculty: FacultyRecord): Promise<FacultyRecord[]> {
  try {
    try {
      await pullLatestFromNeon();
    } catch { }
    const store = loadPersistedRecords();
    if (!store.faculties || !Array.isArray(store.faculties)) {
      store.faculties = [...DEFAULT_COLLEGE_FACULTIES];
    }

    const targetId = (
      faculty.id || faculty.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    ).trim();

    const existingIdx = store.faculties.findIndex((f) => {
      if (faculty.id && f.id === faculty.id) return true;
      if (!faculty.id && f.name.toLowerCase() === faculty.name.toLowerCase()) return true;
      return false;
    });

    if (existingIdx >= 0) {
      const oldName = store.faculties[existingIdx].name;
      store.faculties[existingIdx] = {
        ...store.faculties[existingIdx],
        ...faculty,
        id: targetId,
        name: faculty.name.trim(),
      };

      // If the faculty name changed, keep associated courses updated in courseOverrides and Neon DB
      if (oldName && faculty.name && oldName.toLowerCase() !== faculty.name.trim().toLowerCase()) {
        const newName = faculty.name.trim();
        if (!store.courseOverrides) store.courseOverrides = {};

        for (const [cId, override] of Object.entries(store.courseOverrides)) {
          if (override && (override as any).category === oldName) {
            (store.courseOverrides as any)[cId] = {
              ...override,
              category: newName,
            };
          }
        }

        try {
          const { getLiveCourses } = await import("@/lib/persistedData");
          const liveCourses = getLiveCourses();
          for (const c of liveCourses) {
            if (c.category === oldName && !(store.courseOverrides as any)[c.id]?.category) {
              (store.courseOverrides as any)[c.id] = {
                ...((store.courseOverrides as any)[c.id] || {}),
                category: newName,
              };
            }
          }
        } catch { }

        try {
          const { isDbConfigured, sql } = await import("@/lib/db");
          if (isDbConfigured) {
            await sql`UPDATE course_catalog SET category = ${newName} WHERE category = ${oldName};`;
          }
        } catch { }
      }
    } else {
      store.faculties.push({
        ...faculty,
        id: targetId,
        name: faculty.name.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const filePath = getStoreFilePath();
    try {
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    } catch (fileErr) {
      console.warn("[persistedData] Local file write warning:", fileErr);
    }
    await syncStoreSnapshotToNeon(store);
    return sanitizeFaculties(store.faculties);
  } catch (err) {
    console.error("[persistedData] Failed to save faculty:", err);
    return getPersistedFaculties();
  }
}

export async function deleteFacultyFromStore(facultyId: string): Promise<FacultyRecord[]> {
  try {
    try {
      await pullLatestFromNeon();
    } catch { }
    const store = loadPersistedRecords();
    if (!store.faculties || !Array.isArray(store.faculties)) {
      store.faculties = [...DEFAULT_COLLEGE_FACULTIES];
    }

    store.faculties = store.faculties.filter(
      (f) => f.id !== facultyId && f.name.toLowerCase() !== facultyId.toLowerCase()
    );
    const filePath = getStoreFilePath();
    try {
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    } catch (fileErr) {
      console.warn("[persistedData] Local file write warning:", fileErr);
    }
    await syncStoreSnapshotToNeon(store);
    return sanitizeFaculties(store.faculties);
  } catch (err) {
    console.error("[persistedData] Failed to delete faculty:", err);
    return getPersistedFaculties();
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
        .catch(() => { });
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
          .catch(() => { });
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
        .catch(() => { });
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

// --------------------------------------------------------------------------
// Impersonation Audit Logs & Security
// --------------------------------------------------------------------------

export async function recordImpersonationAuditLog(log: ImpersonationAuditLog): Promise<void> {
  const store = loadPersistedRecords();
  if (!store.impersonationLogs) {
    store.impersonationLogs = [];
  }
  store.impersonationLogs.unshift(log);

  // Keep last 250 log entries to prevent unbound growth
  if (store.impersonationLogs.length > 250) {
    store.impersonationLogs = store.impersonationLogs.slice(0, 250);
  }

  const filePath = getStoreFilePath();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  await syncStoreSnapshotToNeon(store);
}

export function listImpersonationAuditLogs(): ImpersonationAuditLog[] {
  const store = loadPersistedRecords();
  return store.impersonationLogs || [];
}

export function getAuditLogsFromStore(): any[] {
  const store = loadPersistedRecords();
  const raw = store.impersonationLogs || [];
  return raw.map((r: any) => ({
    id: r.id || `audit-${Date.now()}`,
    actorUserId: r.actorId || r.actorUserId || "sys",
    actorEmail: r.actorEmail || "system",
    actorRole: r.actorRole || "super_admin",
    action: r.action || "IMPERSONATE",
    details: r.details || `Impersonated ${r.targetName || r.targetEmail || ""}`,
    timestamp: r.timestamp || new Date().toISOString(),
  }));
}

export function findUserForImpersonation(userIdOrEmail: string): PersistedUserRecord | null {
  const raw = userIdOrEmail.trim();
  const target = raw.toLowerCase();
  const allUsers = listAllPlatformUsers();

  // 1. Direct match in platform users (by id, email, tutorId, or learnerId)
  const direct = allUsers.find(
    (u) =>
      u.id === raw ||
      u.id.toLowerCase() === target ||
      u.email.toLowerCase() === target ||
      (u.tutorId && u.tutorId.toLowerCase() === target) ||
      (u.learnerId && u.learnerId.toLowerCase() === target)
  );

  // 2. Check learners repository
  const store = loadPersistedRecords();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { seedLearners } = require("@/lib/repositories/seedData");
  const allLearners = [...(store.learners || []), ...seedLearners];
  const matchedLearner = allLearners.find(
    (l) =>
      l.id === raw ||
      l.id.toLowerCase() === target ||
      (l.userId && l.userId.toLowerCase() === target) ||
      l.email.toLowerCase() === target
  );

  if (direct) {
    if (direct.role === "student" && !direct.learnerId && matchedLearner) {
      return { ...direct, learnerId: matchedLearner.id };
    }
    return direct;
  }

  if (matchedLearner) {
    return {
      id: matchedLearner.userId || matchedLearner.id,
      email: matchedLearner.email,
      name: `${matchedLearner.firstName} ${matchedLearner.lastName}`.trim(),
      role: "student",
      learnerId: matchedLearner.id,
      createdAt: matchedLearner.enrolmentDate || matchedLearner.createdAt || new Date().toISOString(),
    };
  }

  return null;
}

export async function findUserForImpersonationAsync(
  userIdOrEmail: string
): Promise<PersistedUserRecord | null> {
  const raw = userIdOrEmail.trim();
  const target = raw.toLowerCase();

  // 1. Query Neon PostgreSQL directly when configured so records in user_credentials or learners are always found
  if (process.env.DATABASE_URL) {
    try {
      const { isDbConfigured, sql } = await import("@/lib/db");
      if (isDbConfigured) {
        const [userRows, learnerRows]: [any, any] = await Promise.all([
          sql`
            SELECT id, email, name, role, active, tutor_id, learner_id, specialism, department, data, created_at
            FROM user_credentials
            WHERE id = ${raw}
               OR LOWER(email) = ${target}
               OR tutor_id = ${raw}
               OR learner_id = ${raw}
            LIMIT 1
          `.catch(() => []),
          sql`
            SELECT id, user_id, first_name, last_name, email, name, data, created_at
            FROM learners
            WHERE id = ${raw}
               OR user_id = ${raw}
               OR LOWER(email) = ${target}
            LIMIT 1
          `.catch(() => []),
        ]);

        const dbLearner: Learner | undefined = learnerRows?.[0]?.data;
        if (dbLearner && dbLearner.id) {
          // Ensure learner is present in memory & local store so /student works immediately
          try {
            const store = loadPersistedRecords();
            if (!store.learners.some((l) => l.id === dbLearner.id)) {
              store.learners.unshift(dbLearner);
              writeStoreToDisk(getStoreFilePath(), store);
              syncPersistedRecords(true);
            }
          } catch { }
        }

        if (userRows && userRows.length > 0) {
          const r = userRows[0];
          const extra = r.data && typeof r.data === "object" ? r.data : {};
          const foundUser: PersistedUserRecord = {
            ...extra,
            id: r.id || extra.id,
            email: r.email,
            name:
              r.name ||
              extra.name ||
              (dbLearner ? `${dbLearner.firstName} ${dbLearner.lastName}`.trim() : r.email),
            role: r.role || extra.role || "student",
            active: r.active ?? extra.active ?? true,
            tutorId: r.tutor_id || extra.tutorId,
            learnerId: r.learner_id || extra.learnerId || dbLearner?.id,
            specialism: r.specialism || extra.specialism,
            department: r.department || extra.department,
            createdAt: r.created_at
              ? new Date(r.created_at).toISOString()
              : extra.createdAt || new Date().toISOString(),
          };
          return foundUser;
        }

        if (dbLearner) {
          return {
            id: dbLearner.userId || dbLearner.id,
            email: dbLearner.email,
            name: `${dbLearner.firstName || ""} ${dbLearner.lastName || ""}`.trim() || dbLearner.email,
            role: "student",
            learnerId: dbLearner.id,
            createdAt: dbLearner.enrolmentDate || new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn("[impersonation] Neon lookup fallback:", err);
    }
  }

  // 2. Fallback to local store & seed data
  const localMatch = findUserForImpersonation(userIdOrEmail);
  if (localMatch) return localMatch;

  // 3. Final attempt: force a Neon pull and re-check
  await pullLatestFromNeon(true).catch(() => { });
  return findUserForImpersonation(userIdOrEmail);
}

// --------------------------------------------------------------------------
// Tutor File Cabinet & Student Learning Materials
// --------------------------------------------------------------------------

export const DEFAULT_LEARNING_MATERIALS: LearningMaterial[] = [
  {
    id: "mat-safeguarding-guide",
    title: "Unit 1: Mandatory Safeguarding & Duty of Care Study Guide",
    description: "Core lecture slides, statutory legal definitions, Care Act 2014 summaries, and case study critique guidance.",
    fileName: "Unit_1_Safeguarding_Adult_Care_2026.pdf",
    fileUrl: "/documents/sample-safeguarding-guide.pdf",
    fileType: "pdf",
    fileSizeBytes: 2450000,
    cohortId: "class-adult-care-apr26",
    cohortName: "Diploma in Adult Care - Evening Cohort",
    unitCode: "MOD-01",
    tutorId: "user-tutor-eleanor",
    tutorName: "Dr. Eleanor Vance",
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mat-gcse-maths-pack",
    title: "GCSE Maths Foundation & Higher Tier Revision Pack (Paper 2)",
    description: "Official mark scheme breakdown, algebra formula sheets, and 20 practice questions with step-by-step solutions.",
    fileName: "GCSE_Maths_Mastery_Pack_AQA_Edexcel.docx",
    fileUrl: "/documents/sample-gcse-maths-pack.docx",
    fileType: "docx",
    fileSizeBytes: 1250000,
    cohortId: "class-tutoring-kids",
    cohortName: "Academic Tutoring (Kids & GCSE)",
    unitCode: "TUT-GCSE",
    tutorId: "user-tutor-eleanor",
    tutorName: "Dr. Eleanor Vance",
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mat-eyfs-observations",
    title: "Early Years Educator: EYFS Statutory Framework & Workplace Observation Checklist",
    description: "Assessor guidance on building direct observation testimonies and portfolio evidence across nursery environments.",
    fileName: "EYFS_Observation_Witness_Guidance.pptx",
    fileUrl: "/documents/sample-eyfs-observation.pptx",
    fileType: "ppt",
    fileSizeBytes: 3800000,
    cohortId: "class-cypw-apr26",
    cohortName: "Early Years & Childcare Cohort",
    unitCode: "EYFS-02",
    tutorId: "user-tutor-eleanor",
    tutorName: "Dr. Eleanor Vance",
    published: true,
    createdAt: new Date().toISOString(),
  },
];

const DEMO_MATERIAL_IDS = new Set([
  "mat-safeguarding-guide",
  "mat-gcse-maths-pack",
  "mat-eyfs-observations",
]);

function isDemoMaterial(m: LearningMaterial): boolean {
  if (!m) return false;
  if (DEMO_MATERIAL_IDS.has(m.id)) return true;
  if (m.tutorId === "user-tutor-eleanor" || m.tutorName === "Dr. Eleanor Vance") return true;
  return false;
}

export function listLearningMaterials(cohortId?: string, tutorId?: string, tutorName?: string): LearningMaterial[] {
  const store = loadPersistedRecords();
  const isTest = isAutomatedTestEnv();
  let materials = isTest
    ? store.learningMaterials && store.learningMaterials.length > 0
      ? [...store.learningMaterials]
      : [...DEFAULT_LEARNING_MATERIALS]
    : (store.learningMaterials || []).filter((m) => !isDemoMaterial(m));

  if (cohortId && cohortId !== "all") {
    materials = materials.filter((m) => !m.cohortId || m.cohortId === cohortId);
  }
  if (tutorId && tutorId !== "all") {
    const cleanName = (tutorName || "").trim().toLowerCase();
    const firstName = cleanName.split(" ")[0] || "";
    materials = materials.filter((m) => {
      if (m.tutorId === tutorId) return true;
      const mTutor = (m.tutorName || "").trim().toLowerCase();
      if (cleanName && mTutor) {
        if (mTutor === cleanName || (firstName.length >= 3 && mTutor === firstName)) return true;
      }
      return false;
    });
  }

  return materials;
}

export async function saveLearningMaterial(
  material: Omit<LearningMaterial, "id" | "createdAt"> & { id?: string }
): Promise<LearningMaterial> {
  const store = loadPersistedRecords();
  if (!store.learningMaterials) {
    store.learningMaterials = [];
  } else if (!isAutomatedTestEnv()) {
    store.learningMaterials = store.learningMaterials.filter((m) => !isDemoMaterial(m));
  }

  const id = material.id || `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const record: LearningMaterial = {
    ...material,
    id,
    createdAt: new Date().toISOString(),
  };

  const existingIdx = store.learningMaterials.findIndex((m) => m.id === id);
  if (existingIdx >= 0) {
    store.learningMaterials[existingIdx] = record;
  } else {
    store.learningMaterials.unshift(record);
  }

  const filePath = getStoreFilePath();
  writeStoreToDisk(filePath, store);
  await syncStoreSnapshotToNeon(store);
  return record;
}

export async function deleteLearningMaterial(id: string): Promise<boolean> {
  const store = loadPersistedRecords();
  if (!store.learningMaterials) {
    store.learningMaterials = [];
  }

  const initialLen = store.learningMaterials.length;
  store.learningMaterials = store.learningMaterials.filter((m) => m.id !== id && !isDemoMaterial(m));
  if (store.learningMaterials.length !== initialLen) {
    const filePath = getStoreFilePath();
    writeStoreToDisk(filePath, store);
    await syncStoreSnapshotToNeon(store);
    return true;
  }
  return false;
}

export function getCohortsForTutor(session: {
  id?: string;
  tutorId?: string;
  name?: string;
  role?: string;
}): any[] {
  syncPersistedRecords(false);
  const allCohorts = getPersistedCohorts();
  if (
    session.role === "owner_admin" ||
    session.role === "super_admin" ||
    session.role === "admin_staff"
  ) {
    return allCohorts;
  }

  const tutorId = session.tutorId || session.id || "";
  const cleanName = (session.name || "").trim().toLowerCase();
  const firstName = cleanName.split(" ")[0] || "";

  // Also check enrolments where this tutor is assigned to a student in that cohort
  const store = loadPersistedRecords();
  const enrolmentCohortIds = new Set<string>();
  const allEnrolments = [...(store.enrolments || [])];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedEnrolments } = require("@/lib/repositories/seedData");
    if (Array.isArray(seedEnrolments)) {
      allEnrolments.push(...seedEnrolments);
    }
  } catch {}

  for (const e of allEnrolments) {
    if (!e?.classId) continue;
    const eTutorId = (e as any).tutorId || "";
    const eTutorName = ((e as any).tutorName || "").trim().toLowerCase();
    if (
      (tutorId && (eTutorId === tutorId || eTutorId === session.id)) ||
      (cleanName &&
        eTutorName &&
        (eTutorName === cleanName ||
          (firstName.length >= 3 && (eTutorName === firstName || eTutorName.startsWith(firstName + " ")))))
    ) {
      enrolmentCohortIds.add(e.classId);
    }
  }

  return allCohorts.filter((c: any) => {
    if (tutorId && (c.tutorId === tutorId || c.tutorId === session.id)) return true;
    if (enrolmentCohortIds.has(c.id)) return true;
    const cTutor = (c.tutorName || "").trim().toLowerCase();
    if (!cTutor || !cleanName) return false;
    return (
      cTutor === cleanName ||
      (firstName.length >= 3 && (cTutor === firstName || cTutor.startsWith(firstName + " ")))
    );
  });
}

// --------------------------------------------------------------------------
// WordPress-Style Central Media Library
// --------------------------------------------------------------------------

export const DEFAULT_MEDIA_LIBRARY_ITEMS: MediaLibraryItem[] = [
  {
    id: "media-adult-care",
    title: "Adult Care & Healthcare Training",
    fileName: "adult-care-training.jpg",
    url: "/images/adult-care-training.jpg",
    altText: "Healthcare and adult social care training environment",
    mimeType: "image/jpeg",
    category: "image",
    createdAt: "2026-09-01T09:00:00Z",
  },
  {
    id: "media-early-years",
    title: "Early Years & Childcare Educator",
    fileName: "early-years-training.jpg",
    url: "/images/early-years-training.jpg",
    altText: "Early years educator working with children",
    mimeType: "image/jpeg",
    category: "image",
    createdAt: "2026-09-01T09:00:00Z",
  },
  {
    id: "media-teacher-training",
    title: "Further Education & Teacher Training",
    fileName: "teacher-training.jpg",
    url: "/images/teacher-training.jpg",
    altText: "Further education teacher delivering classroom session",
    mimeType: "image/jpeg",
    category: "image",
    createdAt: "2026-09-01T09:00:00Z",
  },
  {
    id: "media-tutor-teaching",
    title: "Vocational Assessor & Live Evening Seminar",
    fileName: "tutor-teaching.jpg",
    url: "/images/tutor-teaching.jpg",
    altText: "Smartminds tutor leading a live evening cohort seminar",
    mimeType: "image/jpeg",
    category: "image",
    createdAt: "2026-09-01T09:00:00Z",
  },
  {
    id: "media-certificate-moment",
    title: "Regulated Qualification Graduation & Certification",
    fileName: "certificate-moment.jpg",
    url: "/images/certificate-moment.jpg",
    altText: "Graduate holding accredited British diploma certificate",
    mimeType: "image/jpeg",
    category: "image",
    createdAt: "2026-09-01T09:00:00Z",
  },
  {
    id: "media-hero-learner",
    title: "Adult Distance Learner Studying Online",
    fileName: "hero-learner.jpg",
    url: "/images/hero-learner.jpg",
    altText: "Adult learner studying online from home",
    mimeType: "image/jpeg",
    category: "image",
    createdAt: "2026-09-01T09:00:00Z",
  },
  {
    id: "media-smartminds-logo",
    title: "Smartminds Training College Official Crest",
    fileName: "smartminds-logo.png",
    url: "/brand/smartminds-logo.png",
    altText: "Smartminds Training College official crest logo",
    mimeType: "image/png",
    category: "brand",
    createdAt: "2026-09-01T09:00:00Z",
  },
];

function inferMediaCategory(url: string, mimeType?: string): MediaLibraryItem["category"] {
  const lower = (url || "").toLowerCase();
  const mime = (mimeType || "").toLowerCase();
  if (mime.includes("pdf") || mime.includes("word") || mime.includes("presentation") || lower.endsWith(".pdf") || lower.endsWith(".docx") || lower.endsWith(".pptx")) {
    return "document";
  }
  if (mime.includes("video") || lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.includes("youtube.com") || lower.includes("vimeo.com") || lower.includes("cloudflarestream.com")) {
    return "video";
  }
  if (lower.includes("/brand/") || lower.includes("logo") || lower.endsWith(".svg")) {
    return "brand";
  }
  return "image";
}

export function getPersistedMediaLibrary(): MediaLibraryItem[] {
  const store = loadPersistedRecords();
  const deletedSet = new Set(store.deletedMediaIds || []);
  const customItems = Array.isArray(store.mediaLibrary) ? store.mediaLibrary : [];
  const map = new Map<string, MediaLibraryItem>();

  for (const item of customItems) {
    if (!item || !item.url || deletedSet.has(item.id)) continue;
    map.set(item.url, item);
  }

  // Also harvest any custom images already referenced in courses or blog posts so nothing is missing
  if (store.courseOverrides && typeof store.courseOverrides === "object") {
    Object.values(store.courseOverrides).forEach((c: any) => {
      if (c?.image && typeof c.image === "string" && !map.has(c.image)) {
        const id = `media-course-${c.id || "img"}`;
        if (!deletedSet.has(id)) {
          map.set(c.image, {
            id,
            title: c.title ? `${c.title} Cover` : "Course Cover Image",
            fileName: c.image.startsWith("data:") ? "uploaded-course-cover.webp" : c.image.split("/").pop() || "course-image.jpg",
            url: c.image,
            altText: c.title || "Course image",
            mimeType: c.image.startsWith("data:image/webp") ? "image/webp" : "image/jpeg",
            category: "image",
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
  }

  if (Array.isArray(store.blogPosts)) {
    for (const post of store.blogPosts) {
      if (post?.image && typeof post.image === "string" && !map.has(post.image)) {
        const id = `media-blog-${post.id}`;
        if (!deletedSet.has(id)) {
          map.set(post.image, {
            id,
            title: post.title ? `${post.title} Cover` : "Article Cover Image",
            fileName: post.image.startsWith("data:") ? "uploaded-article-cover.webp" : post.image.split("/").pop() || "article-image.jpg",
            url: post.image,
            altText: post.imageAlt || post.title || "Article image",
            mimeType: post.image.startsWith("data:image/webp") ? "image/webp" : "image/jpeg",
            category: "image",
            createdAt: post.publishedAt || new Date().toISOString(),
          });
        }
      }
    }
  }

  for (const def of DEFAULT_MEDIA_LIBRARY_ITEMS) {
    if (!deletedSet.has(def.id) && !map.has(def.url)) {
      map.set(def.url, def);
    }
  }

  return Array.from(map.values());
}

export async function savePersistedMediaItem(input: {
  id?: string;
  title?: string;
  fileName?: string;
  url: string;
  altText?: string;
  caption?: string;
  mimeType?: string;
  category?: MediaLibraryItem["category"];
  sizeBytes?: number;
  width?: number;
  height?: number;
  uploadedBy?: string;
}): Promise<MediaLibraryItem> {
  const store = loadPersistedRecords();
  if (!store.mediaLibrary) store.mediaLibrary = [];

  const cleanUrl = input.url.trim();
  const existingIdx = store.mediaLibrary.findIndex(
    (m) => (input.id && m.id === input.id) || m.url === cleanUrl
  );
  const existing = existingIdx >= 0 ? store.mediaLibrary[existingIdx] : undefined;

  const rawFileName =
    input.fileName?.trim() ||
    existing?.fileName ||
    (cleanUrl.startsWith("data:")
      ? `upload-${Date.now()}.webp`
      : cleanUrl.split("/").pop()?.split("?")[0] || `asset-${Date.now()}.jpg`);

  const cleanTitle =
    input.title?.trim() ||
    existing?.title ||
    rawFileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  const mimeType =
    input.mimeType ||
    existing?.mimeType ||
    (cleanUrl.startsWith("data:image/svg") || cleanUrl.endsWith(".svg")
      ? "image/svg+xml"
      : cleanUrl.startsWith("data:image/png") || cleanUrl.endsWith(".png")
        ? "image/png"
        : cleanUrl.startsWith("data:image/webp") || cleanUrl.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg");

  const item: MediaLibraryItem = {
    id: input.id || existing?.id || `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    fileName: rawFileName,
    url: cleanUrl,
    altText: input.altText !== undefined ? input.altText.trim() : existing?.altText || cleanTitle,
    caption: input.caption !== undefined ? input.caption.trim() : existing?.caption || "",
    mimeType,
    category: input.category || existing?.category || inferMediaCategory(cleanUrl, mimeType),
    sizeBytes: input.sizeBytes || existing?.sizeBytes,
    width: input.width || existing?.width,
    height: input.height || existing?.height,
    uploadedBy: input.uploadedBy || existing?.uploadedBy,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.mediaLibrary[existingIdx] = item;
  } else {
    store.mediaLibrary.unshift(item);
  }

  if (store.deletedMediaIds) {
    store.deletedMediaIds = store.deletedMediaIds.filter((id) => id !== item.id);
  }

  const filePath = getStoreFilePath();
  writeStoreToDisk(filePath, store);
  syncStoreSnapshotToNeon(store).catch(() => {});

  try {
    const { isDbConfigured, sql, ensureDbTablesExist } = await import("@/lib/db");
    if (isDbConfigured) {
      await ensureDbTablesExist();
      await sql`
        INSERT INTO media_library (id, title, file_name, url, alt_text, mime_type, category, data, created_at)
        VALUES (
          ${item.id},
          ${item.title},
          ${item.fileName},
          ${item.url},
          ${item.altText || null},
          ${item.mimeType},
          ${item.category},
          ${JSON.stringify(item)}::jsonb,
          ${item.createdAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          file_name = EXCLUDED.file_name,
          url = EXCLUDED.url,
          alt_text = EXCLUDED.alt_text,
          mime_type = EXCLUDED.mime_type,
          category = EXCLUDED.category,
          data = EXCLUDED.data;
      `.catch(() => {});
    }
  } catch {}

  return item;
}

export async function deletePersistedMediaItem(id: string): Promise<boolean> {
  const store = loadPersistedRecords();
  if (!store.mediaLibrary) store.mediaLibrary = [];
  if (!store.deletedMediaIds) store.deletedMediaIds = [];

  if (!store.deletedMediaIds.includes(id)) {
    store.deletedMediaIds.push(id);
  }
  store.mediaLibrary = store.mediaLibrary.filter((m) => m.id !== id);

  const filePath = getStoreFilePath();
  writeStoreToDisk(filePath, store);
  syncStoreSnapshotToNeon(store).catch(() => {});

  try {
    const { isDbConfigured, sql } = await import("@/lib/db");
    if (isDbConfigured) {
      await sql`DELETE FROM media_library WHERE id = ${id}`.catch(() => {});
    }
  } catch {}

  return true;
}

export function inferTutoringDeliveryMode(
  trainingLocation?: string,
  explicitMode?: TutoringDeliveryMode
): TutoringDeliveryMode {
  if (
    explicitMode === "online" ||
    explicitMode === "physical_centre" ||
    explicitMode === "room_home_request"
  ) {
    return explicitMode;
  }
  const loc = (trainingLocation || "").toLowerCase();
  if (loc.includes("home") || loc.includes("room") || loc.includes("request") || loc.includes("visit")) {
    return "room_home_request";
  }
  if (loc.includes("gloucester") || loc.includes("centre") || loc.includes("center") || loc.includes("face") || loc.includes("physical")) {
    return "physical_centre";
  }
  return "online";
}

export interface OneToOneStudentAssignmentView {
  enrolmentId: string;
  learnerId: string;
  studentName: string;
  parentName?: string;
  parentEmail: string;
  parentPhone: string;
  emergencyPhone?: string;
  yearGroupOrLevel: string;
  focusSubjects?: string;
  dateOfBirth?: string;
  address?: string;
  postcode?: string;
  tutorId?: string;
  tutorName: string;
  preferredTimeSlot: string;
  deliveryMode: TutoringDeliveryMode;
  trainingLocation: string;
  roomOrAddress: string;
  zoomLink?: string;
  enrolledAt: string;
  status: string;
}

export function getOneToOneTutoringStudentsForSession(session?: {
  id: string;
  tutorId?: string;
  name: string;
  role: string;
}): OneToOneStudentAssignmentView[] {
  const store = loadPersistedRecords();
  const isTest = isAutomatedTestEnv();
  const learners = (store.learners || []).filter((l) => isTest || !isFictionalDemoRecord(l));
  const enrolments = (store.enrolments || []).filter((e) => isTest || !isFictionalDemoRecord(e));
  const learnerMap = new Map(learners.map((l) => [l.id, l]));

  const cleanName = (session?.name || "").trim().toLowerCase();
  const firstName = cleanName.split(" ")[0] || "";
  const isTutorOnly = session?.role === "tutor";

  const results: OneToOneStudentAssignmentView[] = [];

  for (const enr of enrolments) {
    const isOneToOne =
      enr.courseId === "course-tutoring-children" ||
      enr.classId === "class-tutoring-kids" ||
      Boolean(enr.tutoringDeliveryMode) ||
      (enr.courseTitle || "").toLowerCase().includes("1-on-1") ||
      (enr.courseTitle || "").toLowerCase().includes("private tutoring");

    if (!isOneToOne) continue;

    const learner = learnerMap.get(enr.learnerId);
    if (!learner || learner.accessStatus === "archived") continue;

    if (isTutorOnly && session) {
      const enrTutorName = (enr.tutorName || "").trim().toLowerCase();
      const matchesTutor =
        (session.tutorId && enr.tutorId === session.tutorId) ||
        enr.tutorId === session.id ||
        (cleanName && enrTutorName === cleanName) ||
        (firstName.length >= 3 && enrTutorName === firstName);
      if (!matchesTutor) continue;
    }

    const deliveryMode = inferTutoringDeliveryMode(
      enr.trainingLocation,
      enr.tutoringDeliveryMode
    );
    const studentFullName =
      learner.childName?.trim() ||
      `${learner.firstName || ""} ${learner.lastName || ""}`.trim() ||
      learner.email;
    const parentFullName =
      learner.guardianName?.trim() ||
      (learner.learnerType === "child"
        ? `${learner.firstName || ""} ${learner.lastName || ""}`.trim()
        : undefined);

    const defaultRoomOrAddress =
      enr.tutoringRoomOrAddress?.trim() ||
      (deliveryMode === "physical_centre"
        ? "Gloucester College Centre (Room TBA)"
        : deliveryMode === "room_home_request"
          ? [learner.address, learner.postcode].filter(Boolean).join(", ") || "Home / Requested Room (Address on file)"
          : enr.tutoringZoomLink || "Live 1-on-1 Zoom Classroom");

    results.push({
      enrolmentId: enr.id,
      learnerId: learner.id,
      studentName: studentFullName,
      parentName: parentFullName,
      parentEmail: learner.guardianEmail || learner.email,
      parentPhone: learner.guardianPhone || learner.phone,
      emergencyPhone: learner.emergencyPhone || learner.emergencyContact,
      yearGroupOrLevel: enr.courseLevelLabel || learner.childYearGroup || "Year 7",
      focusSubjects: learner.childConcerns || learner.notes,
      dateOfBirth: learner.dateOfBirth,
      address: learner.address,
      postcode: learner.postcode,
      tutorId: enr.tutorId,
      tutorName: enr.tutorName || "Unassigned / TBA",
      preferredTimeSlot: enr.preferredTimeSlot || "Saturday, 10:00am",
      deliveryMode,
      trainingLocation:
        enr.trainingLocation ||
        (deliveryMode === "physical_centre"
          ? "Gloucester College Centre (Face-to-Face)"
          : deliveryMode === "room_home_request"
            ? "Home / Room Tutoring (By Request)"
            : "Live 1-on-1 Online Interactive"),
      roomOrAddress: defaultRoomOrAddress,
      zoomLink: enr.tutoringZoomLink,
      enrolledAt: enr.enrolledAt,
      status: enr.status,
    });
  }

  return results;
}

export function listTutoringAttendanceRecords(session?: {
  id: string;
  tutorId?: string;
  name: string;
  role: string;
}): TutoringAttendanceRecord[] {
  const store = loadPersistedRecords();
  const deletedIds = new Set(store.deletedTutoringAttendanceIds || []);
  const records = (store.tutoringAttendance || []).filter((r) => !deletedIds.has(r.id));

  if (session?.role === "tutor") {
    const cleanName = (session.name || "").trim().toLowerCase();
    const firstName = cleanName.split(" ")[0] || "";
    const myStudents = new Set(
      getOneToOneTutoringStudentsForSession(session).map((s) => s.enrolmentId)
    );
    return records.filter((r) => {
      const recTutorName = (r.tutorName || "").trim().toLowerCase();
      return (
        (session.tutorId && r.tutorId === session.tutorId) ||
        r.tutorId === session.id ||
        (cleanName && recTutorName === cleanName) ||
        (firstName.length >= 3 && recTutorName === firstName) ||
        myStudents.has(r.enrolmentId)
      );
    });
  }

  return records;
}

export async function saveTutoringAttendanceRecord(
  input: Omit<TutoringAttendanceRecord, "id" | "recordedAt"> & { id?: string }
): Promise<TutoringAttendanceRecord> {
  const store = loadPersistedRecords();
  if (!store.tutoringAttendance) store.tutoringAttendance = [];
  if (!store.deletedTutoringAttendanceIds) store.deletedTutoringAttendanceIds = [];

  const nowIso = new Date().toISOString();
  const recordId =
    input.id?.trim() || `att-1to1-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const existingIdx = store.tutoringAttendance.findIndex((r) => r.id === recordId);
  const existing = existingIdx >= 0 ? store.tutoringAttendance[existingIdx] : undefined;

  const saved: TutoringAttendanceRecord = {
    id: recordId,
    enrolmentId: input.enrolmentId,
    learnerId: input.learnerId,
    studentName: input.studentName.trim(),
    parentName: input.parentName?.trim() || undefined,
    yearGroupOrLevel: input.yearGroupOrLevel.trim(),
    tutorId: input.tutorId,
    tutorName: input.tutorName.trim(),
    sessionDate: input.sessionDate,
    timeSlot: input.timeSlot.trim(),
    durationMinutes: Number(input.durationMinutes) || 60,
    deliveryMode: input.deliveryMode,
    locationOrRoom: input.locationOrRoom.trim(),
    status: input.status,
    topicCovered: input.topicCovered.trim(),
    homeworkOrNotes: input.homeworkOrNotes?.trim() || undefined,
    recordedAt: existing?.recordedAt || nowIso,
    updatedAt: nowIso,
  };

  if (existingIdx >= 0) {
    store.tutoringAttendance[existingIdx] = saved;
  } else {
    store.tutoringAttendance.unshift(saved);
  }

  store.deletedTutoringAttendanceIds = store.deletedTutoringAttendanceIds.filter(
    (id) => id !== recordId
  );

  const filePath = getStoreFilePath();
  writeStoreToDisk(filePath, store);
  await syncStoreSnapshotToNeon(store).catch(() => {});

  return saved;
}

export async function deleteTutoringAttendanceRecord(recordId: string): Promise<boolean> {
  const store = loadPersistedRecords();
  if (!store.tutoringAttendance) store.tutoringAttendance = [];
  if (!store.deletedTutoringAttendanceIds) store.deletedTutoringAttendanceIds = [];

  if (!store.deletedTutoringAttendanceIds.includes(recordId)) {
    store.deletedTutoringAttendanceIds.push(recordId);
  }
  store.tutoringAttendance = store.tutoringAttendance.filter((r) => r.id !== recordId);

  const filePath = getStoreFilePath();
  writeStoreToDisk(filePath, store);
  await syncStoreSnapshotToNeon(store).catch(() => {});
  return true;
}

export async function updateOneToOneEnrolmentAssignment(input: {
  enrolmentId: string;
  learnerId?: string;
  tutorId?: string;
  tutorName?: string;
  preferredTimeSlot?: string;
  deliveryMode?: TutoringDeliveryMode;
  roomOrAddress?: string;
  zoomLink?: string;
  focusSubjects?: string;
}): Promise<boolean> {
  const store = loadPersistedRecords();
  if (!store.enrolments) store.enrolments = [];
  if (!store.learners) store.learners = [];

  const enr = store.enrolments.find((e) => e.id === input.enrolmentId);
  if (!enr) return false;

  if (input.tutorId !== undefined) enr.tutorId = input.tutorId;
  if (input.tutorName !== undefined) enr.tutorName = input.tutorName;
  if (input.preferredTimeSlot !== undefined) enr.preferredTimeSlot = input.preferredTimeSlot;
  if (input.deliveryMode !== undefined) {
    enr.tutoringDeliveryMode = input.deliveryMode;
    enr.trainingLocation =
      input.deliveryMode === "physical_centre"
        ? "Gloucester College Centre (Face-to-Face)"
        : input.deliveryMode === "room_home_request"
          ? "Home / Room Tutoring (By Request)"
          : "Live 1-on-1 Online Interactive";
  }
  if (input.roomOrAddress !== undefined) enr.tutoringRoomOrAddress = input.roomOrAddress;
  if (input.zoomLink !== undefined) enr.tutoringZoomLink = input.zoomLink;

  const learner = store.learners.find((l) => l.id === (input.learnerId || enr.learnerId));
  if (learner && input.focusSubjects !== undefined) {
    learner.childConcerns = input.focusSubjects;
  }

  const filePath = getStoreFilePath();
  writeStoreToDisk(filePath, store);
  syncPersistedRecords(true);
  await savePersistedRecord({
    learner,
    enrolment: enr,
  }).catch(() => {});
  await syncStoreSnapshotToNeon(store).catch(() => {});
  return true;
}






