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
} from "@/lib/repositories/types";

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

export interface PersistedRecordsStore {
  learners: Learner[];
  enrolments: Enrolment[];
  paymentRecords: PaymentRecord[];
  paymentSchedules?: PaymentScheduleItem[];
  userCredentials?: PersistedUserRecord[];
  cmsPagesData?: Record<string, any>;
  courseOverrides?: Record<string, any>;
  cohorts?: any[];
  classSessions?: any[];
  blockedDays?: BlockedDay[];
  availabilityRules?: AvailabilityRule[];
  bookings?: Booking[];
  globalGraceDays?: number;
  cohortSchedule?: CohortScheduleConfig;
}

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
      cmsPagesData:
        parsed.cmsPagesData && typeof parsed.cmsPagesData === "object"
          ? parsed.cmsPagesData
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
      globalGraceDays: typeof parsed.globalGraceDays === "number" ? parsed.globalGraceDays : undefined,
      cohortSchedule:
        parsed.cohortSchedule && typeof parsed.cohortSchedule === "object"
          ? parsed.cohortSchedule
          : undefined,
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
    };
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

export function savePersistedCmsPage(pagePath: string, sections: any[]): void {
  try {
    const store = loadPersistedRecords();
    if (!store.cmsPagesData) store.cmsPagesData = {};
    store.cmsPagesData[pagePath] = sections;
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
  } catch (err) {
    console.error("[persistedData] Failed to save CMS page:", err);
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
    }
  } catch (err) {
    console.error("[persistedData] Failed to delete course override:", err);
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
    } = require("@/lib/repositories/seedData");

    const store = loadPersistedRecords();
    if (store.learners && store.learners.length > 0) {
      for (const pl of store.learners) {
        if (!seedLearners.some((l: Learner) => l.id === pl.id)) {
          seedLearners.push(pl);
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

    if (store.enrolments && store.enrolments.length > 0) {
      for (const pe of store.enrolments) {
        if (!seedEnrolments.some((e: Enrolment) => e.id === pe.id)) {
          seedEnrolments.push(pe);
        }
      }
    }
    if (store.paymentRecords && store.paymentRecords.length > 0) {
      for (const pp of store.paymentRecords) {
        if (!seedPaymentRecords.some((p: PaymentRecord) => p.id === pp.id)) {
          seedPaymentRecords.unshift(pp);
        }
      }
    }
    if (store.paymentSchedules && store.paymentSchedules.length > 0) {
      for (const ps of store.paymentSchedules) {
        const existingIdx = seedPaymentSchedules.findIndex((s: PaymentScheduleItem) => s.id === ps.id);
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
      return true;
    }
    return false;
  } catch (err) {
    console.error("[persistedData] Failed to delete user:", err);
    return false;
  }
}

export function cleanDemoUsersFromStore(): {
  cleanedUsers: number;
  cleanedLearners: number;
  cleanedEnrolments: number;
} {
  try {
    const store = loadPersistedRecords();
    const demoEmails = [
      "maya.lin@example.com",
      "kemi.adeleke@smartmindstraining.co.uk",
      "sarah.jenkins@smartmindstraining.co.uk",
      "eleanor.vance@smartmindstraining.co.uk",
      "marcus.vance@smartmindstraining.co.uk",
      "super.admin@smartmindstraining.co.uk",
      "david.ross@example.com",
      "aisha.patel@example.com",
      "james.wilson@example.com",
      "fatima.al-mansoor@example.com",
    ];

    const initialUsers = store.userCredentials?.length || 0;
    const initialLearners = store.learners.length;
    const initialEnrolments = store.enrolments.length;

    // Filter out demo records
    if (store.userCredentials) {
      store.userCredentials = store.userCredentials.filter(
        (u) => !demoEmails.includes(u.email.toLowerCase())
      );
    }

    store.learners = store.learners.filter(
      (l) => !demoEmails.includes(l.email.toLowerCase()) && !l.id.startsWith("learner-00")
    );

    store.enrolments = store.enrolments.filter(
      (e) => !e.learnerId.startsWith("learner-00")
    );

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    syncPersistedRecords(true);

    return {
      cleanedUsers: initialUsers - (store.userCredentials?.length || 0),
      cleanedLearners: initialLearners - store.learners.length,
      cleanedEnrolments: initialEnrolments - store.enrolments.length,
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
    if (store.userCredentials) {
      store.userCredentials = store.userCredentials.filter((u) => u.role !== "student");
    }

    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const seedData = require("@/lib/repositories/seedData");
      if (Array.isArray(seedData.seedLearners)) seedData.seedLearners.length = 0;
      if (Array.isArray(seedData.seedEnrolments)) seedData.seedEnrolments.length = 0;
      if (Array.isArray(seedData.seedPaymentRecords)) seedData.seedPaymentRecords.length = 0;
      if (Array.isArray(seedData.seedPaymentSchedules)) seedData.seedPaymentSchedules.length = 0;
      if (Array.isArray(seedData.seedBookings)) seedData.seedBookings.length = 0;
      if (Array.isArray(seedData.demoOutbox)) seedData.demoOutbox.length = 0;
      if (Array.isArray(seedData.seedUsers)) {
        const staffOnly = seedData.seedUsers.filter((u: any) => u.role !== "student");
        seedData.seedUsers.length = 0;
        seedData.seedUsers.push(...staffOnly);
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

