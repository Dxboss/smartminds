import {
  SessionUser,
  Course,
  Learner,
  Enrolment,
  PaymentRecord,
  LearnerPaymentPlanSummary,
  LedgerSummary,
  Task,
  Booking,
  AvailabilityRule,
  BlockedDay,
  MessageTemplate,
  MessageLogEntry,
  FeatureEntitlement,
  FeatureModuleKey,
  AuditLogEntry,
  FeedbackItem,
  UserProfile,
  UserRole,
} from "./types";

export interface CourseRepo {
  listCourses(): Promise<Course[]>;
  getCourseBySlug(slug: string): Promise<Course | null>;
  getCourseById(id: string): Promise<Course | null>;
  updateCourse(actor: SessionUser, course: Course): Promise<Course>;
  createCourse(actor: SessionUser, course: Course): Promise<Course>;
}

export interface LearnerRepo {
  listLearners(actor: SessionUser): Promise<Learner[]>;
  getLearnerById(actor: SessionUser, id: string): Promise<Learner | null>;
  updateLearnerStatus(
    actor: SessionUser,
    id: string,
    status: "active" | "paused"
  ): Promise<Learner>;
}

export interface EnrolmentRepo {
  listEnrolments(
    actor: SessionUser,
    filter?: { learnerId?: string; classId?: string }
  ): Promise<Enrolment[]>;
  getEnrolmentById(actor: SessionUser, id: string): Promise<Enrolment | null>;
  createEnrolment(
    actor: SessionUser,
    enrolment: Omit<Enrolment, "id">
  ): Promise<Enrolment>;
  moveLearnerClass(
    actor: SessionUser,
    enrolmentId: string,
    newClassId: string
  ): Promise<Enrolment>;
  updateStatus(
    actor: SessionUser,
    enrolmentId: string,
    status: Enrolment["status"]
  ): Promise<Enrolment>;
}

export interface PaymentRepo {
  getLedger(
    actor: SessionUser,
    filter?: { status?: string; learnerId?: string }
  ): Promise<PaymentRecord[]>;
  getLedgerSummary(actor: SessionUser): Promise<LedgerSummary>;
  getMyPaymentPlan(
    actor: SessionUser,
    learnerId: string
  ): Promise<LearnerPaymentPlanSummary | null>;
  markBankTransferReceived(
    actor: SessionUser,
    data: {
      learnerId: string;
      enrolmentId: string;
      amountGbp: number;
      reference: string;
      notes?: string;
    }
  ): Promise<PaymentRecord>;
  exportLedgerCsv(actor: SessionUser): Promise<string>;
}

export interface TaskRepo {
  listTasks(actor: SessionUser): Promise<Task[]>;
  createTask(
    actor: SessionUser,
    task: Omit<Task, "id" | "createdAt" | "isOverdue">
  ): Promise<Task>;
  markTaskComplete(actor: SessionUser, taskId: string): Promise<Task>;
}

export interface BookingRepo {
  listBookings(actor: SessionUser): Promise<Booking[]>;
  createBooking(
    booking: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<Booking>;
  rescheduleBooking(
    actor: SessionUser,
    id: string,
    newDate: string
  ): Promise<Booking>;
  getAvailabilityRules(): Promise<AvailabilityRule[]>;
  updateAvailabilityRules(
    actor: SessionUser,
    rules: AvailabilityRule[]
  ): Promise<AvailabilityRule[]>;
  getBlockedDays(): Promise<BlockedDay[]>;
  toggleBlockedDay(
    actor: SessionUser,
    date: string,
    reason?: string
  ): Promise<BlockedDay[]>;
}

export interface TemplateRepo {
  listTemplates(actor: SessionUser): Promise<MessageTemplate[]>;
  createTemplate(
    actor: SessionUser,
    template: Omit<MessageTemplate, "id">
  ): Promise<MessageTemplate>;
  updateTemplate(
    actor: SessionUser,
    id: string,
    template: Partial<MessageTemplate>
  ): Promise<MessageTemplate>;
  sendMessage(
    actor: SessionUser,
    payload: {
      templateKey: string;
      recipientEmail: string;
      replacements: Record<string, string>;
    }
  ): Promise<MessageLogEntry>;
  getMessageLog(actor: SessionUser): Promise<MessageLogEntry[]>;
}

export interface EntitlementRepo {
  listEntitlements(): Promise<FeatureEntitlement[]>;
  isModuleEnabled(moduleKey: FeatureModuleKey): Promise<boolean>;
  updateEntitlement(
    actor: SessionUser,
    moduleKey: FeatureModuleKey,
    enabled: boolean
  ): Promise<FeatureEntitlement>;
  getAuditLog(actor: SessionUser): Promise<AuditLogEntry[]>;
}

export interface FeedbackRepo {
  submitFeedback(
    item: Omit<FeedbackItem, "id" | "createdAt" | "status">
  ): Promise<FeedbackItem>;
  listFeedback(actor: SessionUser): Promise<FeedbackItem[]>;
  updateFeedbackStatus(
    actor: SessionUser,
    id: string,
    status: FeedbackItem["status"]
  ): Promise<FeedbackItem>;
}

export interface UserRepo {
  getUserById(actor: SessionUser, id: string): Promise<UserProfile | null>;
  listStaffAndTutors(actor: SessionUser): Promise<UserProfile[]>;
  inviteUser(
    actor: SessionUser,
    data: { email: string; name: string; role: UserRole }
  ): Promise<UserProfile>;
  deactivateUser(actor: SessionUser, id: string): Promise<UserProfile>;
}
