import { Course, CourseLevel, PaymentPlanTemplate } from "@/content/types";

export type UserRole =
  | "student"
  | "tutor"
  | "admin_staff"
  | "owner_admin"
  | "super_admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  learnerId?: string;
  tutorId?: string;
  mustChangePassword?: boolean;
  isImpersonating?: boolean;
  impersonatorEmail?: string;
  originalRole?: UserRole;
}

export class PermissionDeniedError extends Error {
  constructor(message: string = "Access denied: insufficient permissions.") {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export interface Learner {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enrolmentDate: string;
  accessStatus: "active" | "paused" | "archived";
  notes?: string;
  courseId?: string;
  courseTitle?: string;
  archivedAt?: string;
  archiveReason?: string;
  learnerType?: "myself" | "child";
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  childName?: string;
  childYearGroup?: string;
  safeguardingCompleted?: boolean;
  parentSignature?: string;
  childConcerns?: string;
  emergencyPhone?: string;
  dateOfBirth?: string;
  address?: string;
  postcode?: string;
  emergencyContact?: string;
  lastActive?: string;
  progressPercent?: number;
}

export interface ClassCohort {
  id: string;
  name: string;
  courseId: string;
  courseLevelLabel: string;
  tutorId: string;
  tutorName: string;
  intakeLabel: string;
  scheduleDescription: string;
  sessionTiming?: "afternoon" | "evening";
  nextSessionDate?: string;
  zoomLink?: string;
}

export interface ClassSession {
  id: string;
  classId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  zoomLink?: string;
  recordingUrl?: string;
  cloudflareStreamUid?: string;
  attendanceTracked?: boolean;
}

export type EnrolmentStatus = "active" | "paused" | "completed" | "cancelled";
export type FundingStatus = "self_pay" | "funded";

export type TutoringDeliveryMode = "online" | "physical_centre" | "room_home_request";
export type TutoringAttendanceStatus =
  | "present"
  | "late"
  | "absent_unexcused"
  | "excused_rescheduled";

export interface TutoringAttendanceRecord {
  id: string;
  enrolmentId: string;
  learnerId: string;
  studentName: string;
  parentName?: string;
  yearGroupOrLevel: string;
  tutorId: string;
  tutorName: string;
  sessionDate: string; // YYYY-MM-DD
  timeSlot: string;
  durationMinutes: number;
  deliveryMode: TutoringDeliveryMode;
  locationOrRoom: string;
  status: TutoringAttendanceStatus;
  topicCovered: string;
  homeworkOrNotes?: string;
  recordedAt: string;
  updatedAt?: string;
}

export interface Enrolment {
  id: string;
  learnerId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  courseLevelLabel: string;
  classId: string;
  sessionTiming?: "afternoon" | "evening";
  preferredTimeSlot?: string;
  tutorId?: string;
  tutorName?: string;
  trainingLocation?: string;
  tutoringDeliveryMode?: TutoringDeliveryMode;
  tutoringRoomOrAddress?: string;
  tutoringZoomLink?: string;
  enrolledAt: string;
  status: EnrolmentStatus;
  fundingType: FundingStatus;
  assessmentMethod: "criteria" | "completion" | "quiz";
  completedUnits: string[];
  certificateIssued?: boolean;
}

export type PaymentMethod =
  | "stripe"
  | "bank_transfer"
  | "bacs"
  | "card"
  | "cash"
  | "employer"
  | "direct_debit"
  | "website"
  | "website_payment"
  | "manual"
  | "funded";
export type PaymentStatus =
  | "paid"
  | "due"
  | "overdue"
  | "cancelled"
  | "awaiting_confirmation"
  | "action_required";

export interface PaymentRecord {
  id: string;
  enrolmentId: string;
  learnerId: string;
  learnerName: string;
  courseTitle: string;
  amountGbp: number;
  method: PaymentMethod;
  reference: string;
  status: "paid" | "refunded";
  paidAt: string;
  notes?: string;
  stripeSessionId?: string;
  receiptUrl?: string;
  receiptFileName?: string;
}

export interface PaymentScheduleItem {
  id: string;
  enrolmentId: string;
  learnerId: string;
  instalmentNumber: number;
  totalInstalments: number;
  amountGbp: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt?: string;
  paymentReference?: string;
  graceExpiryDate: string;
  description?: string;
  method?: string;
  type?: "deposit" | "instalment" | "full";
  courseTitle?: string;
  reportedTransfer?: {
    reference: string;
    amountGbp?: number;
    receiptUrl?: string;
    receiptFileName?: string;
    reportedAt: string;
  };
  adminQuery?: {
    note: string;
    queriedAt: string;
    queriedBy: string;
  };
}

export interface LearnerCoursePaymentBreakdown {
  enrolmentId: string;
  courseTitle: string;
  levelLabel?: string;
  courseLevelLabel?: string;
  planMonths?: number;
  totalAmountGbp: number;
  totalPaidGbp: number;
  balanceRemainingGbp: number;
}

export interface LearnerPaymentPlanSummary {
  enrolmentId: string;
  learnerId?: string;
  learnerName?: string;
  learnerEmail?: string;
  learnerPhone?: string;
  courseTitle: string;
  levelLabel?: string;
  planMonths?: number;
  totalAmountGbp: number;
  totalPaidGbp: number;
  balanceRemainingGbp: number;
  nextDueDate?: string;
  nextDueAmountGbp?: number;
  status: "up_to_date" | "due" | "overdue" | "settled";
  schedule: PaymentScheduleItem[];
  history: PaymentRecord[];
  courses?: LearnerCoursePaymentBreakdown[];
}

export interface LedgerSummary {
  receivedThisMonthGbp: number;
  totalOutstandingGbp: number;
  overdueLearnersCount: number;
  upcomingInstalmentsCount: number;
}

export interface Assignment {
  id: string;
  classId: string;
  tutorId: string;
  unitCode: string;
  title: string;
  instructions: string;
  deadline: string;
  createdAt: string;
}

export type SubmissionStatus = "submitted" | "not_submitted" | "marked";
export type UnitResultOutcome = "achieved" | "not_yet_achieved" | "pending";

export interface Submission {
  id: string;
  assignmentId: string;
  learnerId: string;
  learnerName: string;
  unitCode: string;
  fileName?: string;
  fileSizeBytes?: number;
  submittedAt?: string;
  status: SubmissionStatus;
  outcome?: UnitResultOutcome;
  feedback?: string;
  markedByTutorId?: string;
  markedAt?: string;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed" | "reviewed";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  assignedByRole: "owner_admin" | "super_admin";
  deadline: string;
  status: TaskStatus;
  isOverdue: boolean;
  createdAt: string;
  completedAt?: string;
  // Admin review and satisfaction
  adminFeedback?: string;
  adminSatisfaction?: "satisfied" | "needs_revision" | "unsatisfied";
  reviewedAt?: string;
  reviewedByAdminName?: string;
  // Overdue red flag & disciplinary penalty
  isRedFlagged?: boolean;
  redFlagReason?: string;
  redFlaggedAt?: string;
  penaltyApplied?: boolean;
  penaltyNote?: string;
  bonusReductionAmount?: number;
}

export type EnquiryStage = "new" | "contacted" | "enrolled" | "lost";

export interface EnquiryLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  courseInterest: string;
  formType:
    | "free_advice"
    | "funding_check"
    | "private_tutoring"
    | "contact"
    | "consultation_booking"
    | "general_contact"
    | string;
  stage: EnquiryStage;
  notes?: string;
  employmentStatus?: string;
  workplaceLocation?: string;
  submittedAt: string;
}

export interface Booking {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  courseInterest: string;
  scheduledAt: string;
  status: "confirmed" | "completed" | "rescheduled" | "cancelled";
  timeZone: string;
  notes?: string;
  createdAt: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  meetingPlatform?: "google_meet" | "phone" | "zoom";
  meetingLink?: string;
}

export interface CohortSessionTimingConfig {
  timeLabel: string;
  startTime: string;
  endTime: string;
  description: string;
  zoomUrl: string;
}

export interface CohortScheduleConfig {
  afternoon: CohortSessionTimingConfig;
  evening: CohortSessionTimingConfig;
}

export interface AvailabilityRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface BlockedDay {
  date: string;
  reason?: string;
}

export interface MessageTemplate {
  id: string;
  key: string;
  title: string;
  subject: string;
  bodyTemplate: string;
  allowedPlaceholders: string[];
  category: "enrolment" | "attendance" | "assignment" | "payment" | "general";
}

export interface MessageLogEntry {
  id: string;
  templateId: string;
  sentByUserId: string;
  sentByRole: UserRole;
  recipientEmail: string;
  subject: string;
  renderedBody: string;
  sentAt: string;
}

export type FeatureModuleKey =
  | "payments_ledger"
  | "booking_native"
  | "tutors_management"
  | "tasks"
  | "student_portal"
  | "assignments_grading"
  | "recordings"
  | "evidence_packs"
  | "ai_submission_checks"
  | "advanced_reports"
  | "mobile_app";

export interface FeatureEntitlement {
  module_key: FeatureModuleKey;
  name: string;
  description: string;
  enabled: boolean;
  enabled_by: string;
  enabled_at: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface FeedbackItem {
  id: string;
  pageUrl: string;
  role: UserRole;
  reviewerName: string;
  note: string;
  status: "new" | "accepted" | "done";
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  tutorId?: string;
  learnerId?: string;
  specialism?: string;
  department?: string;
}

export interface PaymentGatewaySettings {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  isLiveMode: boolean;
  bankName: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
  bacsReferencePrefix: string;
}

export type { Course, CourseLevel, PaymentPlanTemplate };
