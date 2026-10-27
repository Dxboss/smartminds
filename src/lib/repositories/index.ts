import {
  BookingRepo,
  CourseRepo,
  EnrolmentRepo,
  EntitlementRepo,
  FeedbackRepo,
  LearnerRepo,
  PaymentRepo,
  TaskRepo,
  TemplateRepo,
  UserRepo,
} from "./interfaces";
import { isDbConfigured } from "@/lib/db";
import { MemoryCourseRepo } from "./memory/MemoryCourseRepo";
import { MemoryLearnerRepo } from "./memory/MemoryLearnerRepo";
import { MemoryEnrolmentRepo } from "./memory/MemoryEnrolmentRepo";
import { MemoryPaymentRepo } from "./memory/MemoryPaymentRepo";
import { MemoryTaskRepo } from "./memory/MemoryTaskRepo";
import { MemoryBookingRepo } from "./memory/MemoryBookingRepo";
import { MemoryTemplateRepo } from "./memory/MemoryTemplateRepo";
import { MemoryEntitlementRepo } from "./memory/MemoryEntitlementRepo";
import { MemoryFeedbackRepo } from "./memory/MemoryFeedbackRepo";
import { MemoryUserRepo } from "./memory/MemoryUserRepo";

import { PostgresCourseRepo } from "./postgres/PostgresCourseRepo";
import { PostgresLearnerRepo } from "./postgres/PostgresLearnerRepo";
import { PostgresEnrolmentRepo } from "./postgres/PostgresEnrolmentRepo";
import { PostgresPaymentRepo } from "./postgres/PostgresPaymentRepo";
import { PostgresTaskRepo } from "./postgres/PostgresTaskRepo";
import { PostgresBookingRepo } from "./postgres/PostgresBookingRepo";
import { PostgresTemplateRepo } from "./postgres/PostgresTemplateRepo";
import { PostgresEntitlementRepo } from "./postgres/PostgresEntitlementRepo";
import { PostgresFeedbackRepo } from "./postgres/PostgresFeedbackRepo";
import { PostgresUserRepo } from "./postgres/PostgresUserRepo";

/**
 * Determines whether the repository layer should target Neon PostgreSQL.
 *
 * Rules:
 * 1. DEMO_MODE=true always runs against sample in-memory / JSON storage.
 * 2. When configured, Neon is the production single source of truth.
 * 3. In production, if DATABASE_URL is missing, silent local fallback is rejected.
 */
function shouldUsePostgres(): boolean {
  if (process.env.DEMO_MODE === "true") {
    return false;
  }
  if (isDbConfigured) {
    return true;
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    const errorMsg =
      "[Neon DB] Fatal Production Error: DATABASE_URL is not configured. Neon PostgreSQL is the required production source of truth. Silent local fallback is disabled in production.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return false;
}

let courseRepo: CourseRepo | null = null;
let learnerRepo: LearnerRepo | null = null;
let enrolmentRepo: EnrolmentRepo | null = null;
let paymentRepo: PaymentRepo | null = null;
let taskRepo: TaskRepo | null = null;
let bookingRepo: BookingRepo | null = null;
let templateRepo: TemplateRepo | null = null;
let entitlementRepo: EntitlementRepo | null = null;
let feedbackRepo: FeedbackRepo | null = null;
let userRepo: UserRepo | null = null;

export function resetRepositoriesForTest(): void {
  courseRepo = null;
  learnerRepo = null;
  enrolmentRepo = null;
  paymentRepo = null;
  taskRepo = null;
  bookingRepo = null;
  templateRepo = null;
  entitlementRepo = null;
  feedbackRepo = null;
  userRepo = null;
}

export function getCourseRepo(): CourseRepo {
  if (!courseRepo) {
    courseRepo = shouldUsePostgres()
      ? new PostgresCourseRepo()
      : new MemoryCourseRepo();
  }
  return courseRepo;
}

export function getLearnerRepo(): LearnerRepo {
  if (!learnerRepo) {
    if (shouldUsePostgres()) {
      learnerRepo = new PostgresLearnerRepo();
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { syncPersistedRecords } = require("@/lib/persistedData");
        syncPersistedRecords();
      } catch {
        // Ignore in non-Node environments
      }
      learnerRepo = new MemoryLearnerRepo();
    }
  }
  return learnerRepo;
}

export function getEnrolmentRepo(): EnrolmentRepo {
  if (!enrolmentRepo) {
    if (shouldUsePostgres()) {
      enrolmentRepo = new PostgresEnrolmentRepo();
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { syncPersistedRecords } = require("@/lib/persistedData");
        syncPersistedRecords();
      } catch {
        // Ignore in non-Node environments
      }
      enrolmentRepo = new MemoryEnrolmentRepo();
    }
  }
  return enrolmentRepo;
}

export function getPaymentRepo(): PaymentRepo {
  if (!paymentRepo) {
    if (shouldUsePostgres()) {
      paymentRepo = new PostgresPaymentRepo();
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { syncPersistedRecords } = require("@/lib/persistedData");
        syncPersistedRecords();
      } catch {
        // Ignore in non-Node environments
      }
      paymentRepo = new MemoryPaymentRepo();
    }
  }
  return paymentRepo;
}

export function getTaskRepo(): TaskRepo {
  if (!taskRepo) {
    taskRepo = shouldUsePostgres()
      ? new PostgresTaskRepo()
      : new MemoryTaskRepo();
  }
  return taskRepo;
}

export function getBookingRepo(): BookingRepo {
  if (!bookingRepo) {
    if (shouldUsePostgres()) {
      bookingRepo = new PostgresBookingRepo();
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { syncPersistedRecords } = require("@/lib/persistedData");
        syncPersistedRecords();
      } catch {
        // Ignore in non-Node environments
      }
      bookingRepo = new MemoryBookingRepo();
    }
  }
  return bookingRepo;
}

export function getTemplateRepo(): TemplateRepo {
  if (!templateRepo) {
    templateRepo = shouldUsePostgres()
      ? new PostgresTemplateRepo()
      : new MemoryTemplateRepo();
  }
  return templateRepo;
}

export function getEntitlementRepo(): EntitlementRepo {
  if (!entitlementRepo) {
    entitlementRepo = shouldUsePostgres()
      ? new PostgresEntitlementRepo()
      : new MemoryEntitlementRepo();
  }
  return entitlementRepo;
}

export function getFeedbackRepo(): FeedbackRepo {
  if (!feedbackRepo) {
    feedbackRepo = shouldUsePostgres()
      ? new PostgresFeedbackRepo()
      : new MemoryFeedbackRepo();
  }
  return feedbackRepo;
}

export function getUserRepo(): UserRepo {
  if (!userRepo) {
    userRepo = shouldUsePostgres()
      ? new PostgresUserRepo()
      : new MemoryUserRepo();
  }
  return userRepo;
}

export * from "./types";
export * from "./interfaces";
