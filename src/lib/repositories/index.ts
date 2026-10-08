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

// Singleton instances for demo in-memory storage.
// In later phases, these getters will return Supabase-backed implementations
// without requiring any changes to screens or components.

let courseRepo: CourseRepo;
let learnerRepo: LearnerRepo;
let enrolmentRepo: EnrolmentRepo;
let paymentRepo: PaymentRepo;
let taskRepo: TaskRepo;
let bookingRepo: BookingRepo;
let templateRepo: TemplateRepo;
let entitlementRepo: EntitlementRepo;
let feedbackRepo: FeedbackRepo;
let userRepo: UserRepo;

export function getCourseRepo(): CourseRepo {
  if (!courseRepo) courseRepo = new MemoryCourseRepo();
  return courseRepo;
}

export function getLearnerRepo(): LearnerRepo {
  if (!learnerRepo) learnerRepo = new MemoryLearnerRepo();
  return learnerRepo;
}

export function getEnrolmentRepo(): EnrolmentRepo {
  if (!enrolmentRepo) enrolmentRepo = new MemoryEnrolmentRepo();
  return enrolmentRepo;
}

export function getPaymentRepo(): PaymentRepo {
  if (!paymentRepo) paymentRepo = new MemoryPaymentRepo();
  return paymentRepo;
}

export function getTaskRepo(): TaskRepo {
  if (!taskRepo) taskRepo = new MemoryTaskRepo();
  return taskRepo;
}

export function getBookingRepo(): BookingRepo {
  if (!bookingRepo) bookingRepo = new MemoryBookingRepo();
  return bookingRepo;
}

export function getTemplateRepo(): TemplateRepo {
  if (!templateRepo) templateRepo = new MemoryTemplateRepo();
  return templateRepo;
}

export function getEntitlementRepo(): EntitlementRepo {
  if (!entitlementRepo) entitlementRepo = new MemoryEntitlementRepo();
  return entitlementRepo;
}

export function getFeedbackRepo(): FeedbackRepo {
  if (!feedbackRepo) feedbackRepo = new MemoryFeedbackRepo();
  return feedbackRepo;
}

export function getUserRepo(): UserRepo {
  if (!userRepo) userRepo = new MemoryUserRepo();
  return userRepo;
}

export * from "./types";
export * from "./interfaces";
