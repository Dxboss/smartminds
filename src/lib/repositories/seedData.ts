import {
  UserProfile,
  Learner,
  ClassCohort,
  ClassSession,
  Enrolment,
  PaymentRecord,
  PaymentScheduleItem,
  Assignment,
  Submission,
  Task,
  Booking,
  AvailabilityRule,
  BlockedDay,
  MessageTemplate,
  FeatureEntitlement,
  AuditLogEntry,
  FeedbackItem,
  EnquiryLead,
  MessageLogEntry,
} from "./types";

export const isDemoModeActive =
  process.env.NODE_ENV !== "production" &&
  (process.env.DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.NODE_ENV === "test");

// ============================================================================
// 1. Staff, Tutors & Administrative Profiles
// ============================================================================

export const seedUsers: UserProfile[] = [
  // Super Admin (Agency / Developer)
  {
    id: "user-super-01",
    email: "super.admin@smartmindstraining.co.uk",
    name: "Dev Super Admin",
    role: "super_admin",
    active: true,
    createdAt: "2026-09-01T08:00:00Z",
  },
  // Super Administrator (Platform Governance)
  {
    id: "user-super-george",
    email: "thegeorgedigitals@gmail.com",
    name: "David George",
    role: "super_admin",
    department: "George Digitals",
    specialism: "Platform Architecture & Master Governance",
    active: true,
    createdAt: "2026-09-01T08:00:00Z",
  },
  // Owner Admin (College Director & Owner)
  {
    id: "user-owner-01",
    email: "millie@smartmindstraining.co.uk",
    name: "Millie Davis",
    role: "owner_admin",
    department: "Executive Leadership",
    specialism: "College Owner & Centre Director",
    active: true,
    createdAt: "2026-09-01T08:30:00Z",
  },
];

// ============================================================================
// 2. 24 Fictional Learners
// ============================================================================

const learnerNames = [
  { first: "Maya", last: "Lin", status: "active" as const },
  { first: "Jordan", last: "Lee", status: "active" as const },
  { first: "Priya", last: "Sharma", status: "active" as const },
  { first: "Sam", last: "Taylor", status: "active" as const },
  { first: "Aisha", last: "Bello", status: "paused" as const }, // Overdue instalment
  { first: "Marcus", last: "O'Connor", status: "active" as const },
  { first: "Zoe", last: "Campbell", status: "active" as const },
  { first: "Liam", last: "Walker", status: "active" as const },
  { first: "Chloe", last: "Bennett", status: "completed" as const }, // Completed
  { first: "Daniel", last: "Hughes", status: "active" as const },
  { first: "Fatima", last: "Zahra", status: "paused" as const }, // Paused
  { first: "Ethan", last: "Brooks", status: "active" as const },
  { first: "Nadia", last: "Hussain", status: "active" as const },
  { first: "Oliver", last: "Wright", status: "active" as const },
  { first: "Grace", last: "Okafor", status: "active" as const },
  { first: "Benjamin", last: "Scott", status: "active" as const },
  { first: "Hannah", last: "Kelly", status: "paused" as const }, // Paused
  { first: "Lucas", last: "Evans", status: "active" as const },
  { first: "Leila", last: "Moradi", status: "active" as const },
  { first: "Noah", last: "Phillips", status: "active" as const },
  { first: "Ella", last: "Murphy", status: "completed" as const }, // Completed
  { first: "Callum", last: "Murray", status: "active" as const },
  { first: "Rhea", last: "Chopra", status: "paused" as const }, // Paused
  { first: "Tariq", last: "Al-Sayed", status: "active" as const },
];

export const seedLearners: Learner[] = [];

// Student profiles will be added dynamically when real learners enrol.

// ============================================================================
// 3. 4 Classes Across Courses
// ============================================================================

export const seedClasses: ClassCohort[] = [
  {
    id: "class-care-l3",
    name: "Diploma in Adult Care L3 — Autumn Cohort 2026",
    courseId: "course-adult-care",
    courseLevelLabel: "Level 3",
    tutorId: "tutor-001",
    tutorName: "Dr. Eleanor Vance",
    intakeLabel: "Autumn 2026",
    scheduleDescription: "Tuesdays 18:30 – 20:30 (Live Online)",
    nextSessionDate: "2026-10-13T18:30:00Z",
    zoomLink: "https://zoom.us/j/sample-smartminds-care",
  },
  {
    id: "class-lead-l5",
    name: "Leadership in Adult Care L5 — Cohort A",
    courseId: "course-adult-care",
    courseLevelLabel: "Level 5",
    tutorId: "tutor-002",
    tutorName: "Marcus Sterling",
    intakeLabel: "Autumn 2026",
    scheduleDescription: "Thursdays 19:00 – 21:00 (Live Online)",
    nextSessionDate: "2026-10-15T19:00:00Z",
    zoomLink: "https://zoom.us/j/sample-smartminds-lead",
  },
  {
    id: "class-ey-l3",
    name: "Early Years Educator L3 — Evening Cohort",
    courseId: "course-childcare-ey",
    courseLevelLabel: "Level 3",
    tutorId: "tutor-003",
    tutorName: "Amara Patel",
    intakeLabel: "Autumn 2026",
    scheduleDescription: "Mondays 18:00 – 20:00 (Live Online)",
    nextSessionDate: "2026-10-12T18:00:00Z",
    zoomLink: "https://zoom.us/j/sample-smartminds-ey",
  },
  {
    id: "class-mh-cpd",
    name: "Mental Health Awareness CPD — Oct 2026",
    courseId: "course-mental-health-cpd",
    courseLevelLabel: "CPD Certificate",
    tutorId: "tutor-004",
    tutorName: "David Kalu",
    intakeLabel: "October 2026",
    scheduleDescription: "Wednesdays 18:00 – 19:30 (Live Online)",
    nextSessionDate: "2026-10-14T18:00:00Z",
    zoomLink: "https://zoom.us/j/sample-smartminds-mh",
  },
];

export const seedSessions: ClassSession[] = [
  {
    id: "session-care-01",
    classId: "class-care-l3",
    title: "Session 4: Person-Centred Assessment & Duty of Care",
    scheduledAt: "2026-10-13T18:30:00Z",
    durationMinutes: 120,
    zoomLink: "https://zoom.us/j/sample-smartminds-care",
    recordingUrl: "https://stream.smartmindstraining.co.uk/sessions/care-s03-archive",
    attendanceTracked: true,
  },
  {
    id: "session-lead-01",
    classId: "class-lead-l5",
    title: "Session 3: Strategic Governance and CQC Compliance",
    scheduledAt: "2026-10-15T19:00:00Z",
    durationMinutes: 120,
    zoomLink: "https://zoom.us/j/sample-smartminds-lead",
    recordingUrl: "https://stream.smartmindstraining.co.uk/sessions/lead-s02-archive",
    attendanceTracked: true,
  },
  {
    id: "session-ey-01",
    classId: "class-ey-l3",
    title: "Session 5: EYFS Framework Observation Techniques",
    scheduledAt: "2026-10-12T18:00:00Z",
    durationMinutes: 120,
    zoomLink: "https://zoom.us/j/sample-smartminds-ey",
    recordingUrl: "https://stream.smartmindstraining.co.uk/sessions/ey-s04-archive",
    attendanceTracked: true,
  },
  {
    id: "session-mh-01",
    classId: "class-mh-cpd",
    title: "Session 2: Psychological First Aid in Care Workplaces",
    scheduledAt: "2026-10-14T18:00:00Z",
    durationMinutes: 90,
    zoomLink: "https://zoom.us/j/sample-smartminds-mh",
    recordingUrl: "https://stream.smartmindstraining.co.uk/sessions/mh-s01-archive",
    attendanceTracked: true,
  },
];

// ============================================================================
// 4. Enrolments (24 learners allocated 6 per class)
// ============================================================================

export const seedEnrolments: Enrolment[] = seedLearners.map((learner, idx) => {
  const classIndex = Math.floor(idx / 6); // 0, 1, 2, 3
  const assignedClass = seedClasses[classIndex];
  const num = (idx + 1).toString().padStart(3, "0");

  let status: Enrolment["status"] = "active";
  if (learner.accessStatus === "paused") {
    status = "paused";
  } else if (idx === 8 || idx === 20) {
    status = "completed";
  }

  return {
    id: `enrolment-${num}`,
    learnerId: learner.id,
    courseId: assignedClass.courseId,
    courseSlug: assignedClass.courseId.replace("course-", "diploma-in-"),
    courseTitle: assignedClass.name.split(" — ")[0],
    courseLevelLabel: assignedClass.courseLevelLabel,
    classId: assignedClass.id,
    enrolledAt: "2026-09-15T09:00:00Z",
    status,
    fundingType: idx % 5 === 0 ? "funded" : "self_pay",
    assessmentMethod: assignedClass.courseId.includes("cpd")
      ? "completion"
      : "criteria",
    completedUnits:
      status === "completed"
        ? ["UNIT-301", "UNIT-302", "UNIT-303", "UNIT-304"]
        : ["UNIT-301"],
    certificateIssued: status === "completed",
  };
});

// ============================================================================
// 5. Payment Records & Schedules (Paid, Due, Overdue)
// ============================================================================

export const seedPaymentRecords: PaymentRecord[] = isDemoModeActive
  ? [
  {
    id: "pay-rec-001",
    enrolmentId: "enrolment-001",
    learnerId: "learner-001",
    learnerName: "Maya Lin",
    courseTitle: "Diploma in Adult Care L3",
    amountGbp: 150.0,
    method: "stripe",
    reference: "ch_demo_lin_deposit_001",
    status: "paid",
    paidAt: "2026-09-15T09:30:00Z",
    notes: "Deposit paid at enrolment",
  },
  {
    id: "pay-rec-002",
    enrolmentId: "enrolment-002",
    learnerId: "learner-002",
    learnerName: "Jordan Lee",
    courseTitle: "Diploma in Adult Care L3",
    amountGbp: 1174.5,
    method: "bank_transfer",
    reference: "BT-2026-09-LEE",
    status: "paid",
    paidAt: "2026-09-16T11:00:00Z",
    notes: "Paid in full via BACS transfer (verified by College Finance)",
  },
  {
    id: "pay-rec-003",
    enrolmentId: "enrolment-003",
    learnerId: "learner-003",
    learnerName: "Priya Sharma",
    courseTitle: "Diploma in Adult Care L3",
    amountGbp: 150.0,
    method: "stripe",
    reference: "ch_demo_sharma_001",
    status: "paid",
    paidAt: "2026-09-15T14:20:00Z",
  },
  {
    id: "pay-rec-004",
    enrolmentId: "enrolment-005",
    learnerId: "learner-005",
    learnerName: "Aisha Bello",
    courseTitle: "Diploma in Adult Care L3",
    amountGbp: 150.0,
    method: "stripe",
    reference: "ch_demo_bello_001",
    status: "paid",
    paidAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "pay-rec-005",
    enrolmentId: "enrolment-009",
    learnerId: "learner-009",
    learnerName: "Chloe Bennett",
    courseTitle: "Leadership in Adult Care L5",
    amountGbp: 1620.0,
    method: "stripe",
    reference: "ch_demo_bennett_full",
    status: "paid",
    paidAt: "2026-05-01T10:00:00Z",
    notes: "Course completed and full balance settled",
  },
]
  : [];

export const seedPaymentSchedules: PaymentScheduleItem[] = isDemoModeActive
  ? [
  // Maya Lin (Active, next instalment due soon)
  {
    id: "sched-001-1",
    enrolmentId: "enrolment-001",
    learnerId: "learner-001",
    instalmentNumber: 1,
    totalInstalments: 6,
    amountGbp: 150.0,
    dueDate: "2026-09-15",
    status: "paid",
    paidAt: "2026-09-15T09:30:00Z",
    graceExpiryDate: "2026-09-29",
  },
  {
    id: "sched-001-2",
    enrolmentId: "enrolment-001",
    learnerId: "learner-001",
    instalmentNumber: 2,
    totalInstalments: 6,
    amountGbp: 192.5,
    dueDate: "2026-10-15",
    status: "due",
    graceExpiryDate: "2026-10-29",
  },
  {
    id: "sched-001-3",
    enrolmentId: "enrolment-001",
    learnerId: "learner-001",
    instalmentNumber: 3,
    totalInstalments: 6,
    amountGbp: 192.5,
    dueDate: "2026-11-15",
    status: "due",
    graceExpiryDate: "2026-11-29",
  },

  // Aisha Bello (Paused due to overdue instalment past grace period)
  {
    id: "sched-005-1",
    enrolmentId: "enrolment-005",
    learnerId: "learner-005",
    instalmentNumber: 1,
    totalInstalments: 6,
    amountGbp: 150.0,
    dueDate: "2026-08-10",
    status: "paid",
    paidAt: "2026-08-10T10:00:00Z",
    graceExpiryDate: "2026-08-24",
  },
  {
    id: "sched-005-2",
    enrolmentId: "enrolment-005",
    learnerId: "learner-005",
    instalmentNumber: 2,
    totalInstalments: 6,
    amountGbp: 192.5,
    dueDate: "2026-09-10",
    status: "overdue",
    graceExpiryDate: "2026-09-24",
  },
]
  : [];

// ============================================================================
// 6. Assignments, Submissions & Unit Results
// ============================================================================

export const seedAssignments: Assignment[] = [
  {
    id: "assign-care-301",
    classId: "class-care-l3",
    tutorId: "tutor-001",
    unitCode: "UNIT-301",
    title: "Unit 301: Principles of Person-Centred Practice",
    instructions:
      "Submit your reflective practice account exploring person-centred values, individual rights, and collaborative care planning in your workplace context.",
    deadline: "2026-10-20T23:59:00Z",
    createdAt: "2026-09-20T10:00:00Z",
  },
  {
    id: "assign-lead-501",
    classId: "class-lead-l5",
    tutorId: "tutor-002",
    unitCode: "UNIT-501",
    title: "Unit 501: Leadership & Strategic Governance Report",
    instructions:
      "Evaluate regulatory governance structures against current CQC Key Lines of Enquiry, with recommendations for continuous service quality improvement.",
    deadline: "2026-10-25T23:59:00Z",
    createdAt: "2026-09-22T11:00:00Z",
  },
  {
    id: "assign-ey-302",
    classId: "class-ey-l3",
    tutorId: "tutor-003",
    unitCode: "UNIT-EY-302",
    title: "Unit EY-302: Safeguarding & Child Protection Case Study",
    instructions:
      "Analyze a multi-agency safeguarding scenario adhering to Working Together to Safeguard Children statutory guidance.",
    deadline: "2026-10-18T23:59:00Z",
    createdAt: "2026-09-21T09:30:00Z",
  },
];

export const seedSubmissions: Submission[] = isDemoModeActive
  ? [
  {
    id: "sub-001",
    assignmentId: "assign-care-301",
    learnerId: "learner-001",
    learnerName: "Maya Lin",
    unitCode: "UNIT-301",
    fileName: "Maya_Lin_Unit301_Reflective_Account.pdf",
    fileSizeBytes: 421000,
    submittedAt: "2026-10-02T16:45:00Z",
    status: "marked",
    outcome: "achieved",
    feedback:
      "Comprehensive demonstration of person-centred planning. Clear workplace evidence linking duty of care with learner empowerment.",
    markedByTutorId: "tutor-001",
    markedAt: "2026-10-04T11:15:00Z",
  },
  {
    id: "sub-002",
    assignmentId: "assign-care-301",
    learnerId: "learner-002",
    learnerName: "Jordan Lee",
    unitCode: "UNIT-301",
    fileName: "Jordan_Lee_Unit301_Submission.docx",
    fileSizeBytes: 285000,
    submittedAt: "2026-10-03T18:20:00Z",
    status: "submitted",
    outcome: "pending",
  },
  {
    id: "sub-003",
    assignmentId: "assign-care-301",
    learnerId: "learner-003",
    learnerName: "Priya Sharma",
    unitCode: "UNIT-301",
    status: "not_submitted",
  },
]
  : [];

// ============================================================================
// 7. Tasks Assigned by Owner
// ============================================================================

export const seedTasks: Task[] = isDemoModeActive
  ? [
  {
    id: "task-001",
    title: "Verify BACS bank transfer for Jordan Lee",
    description: "Confirm £1,174.50 payment against bank statement and check enrolment status.",
    assignedToId: "user-admin-01",
    assignedToName: "Sarah Jenkins",
    assignedByRole: "owner_admin",
    deadline: "2026-10-10T17:00:00Z",
    status: "completed",
    isOverdue: false,
    createdAt: "2026-10-01T09:00:00Z",
    completedAt: "2026-10-02T11:00:00Z",
  },
  {
    id: "task-002",
    title: "Contact Aisha Bello regarding paused payment instalment",
    description: "Follow up via telephone and approved template email regarding second payment instalment.",
    assignedToId: "user-admin-02",
    assignedToName: "Brian Miller",
    assignedByRole: "owner_admin",
    deadline: "2026-10-05T17:00:00Z",
    status: "pending",
    isOverdue: true,
    createdAt: "2026-09-28T09:00:00Z",
  },
  {
    id: "task-003",
    title: "Mark Unit 301 draft submissions for Adult Care Class",
    description: "Provide developmental criteria feedback on submitted reflective accounts.",
    assignedToId: "user-tutor-01",
    assignedToName: "Dr. Eleanor Vance",
    assignedByRole: "owner_admin",
    deadline: "2026-10-14T17:00:00Z",
    status: "in_progress",
    isOverdue: false,
    createdAt: "2026-10-04T08:30:00Z",
  },
]
  : [];

// ============================================================================
// 8. Approved Message Templates
// ============================================================================

export const seedTemplates: MessageTemplate[] = [
  {
    id: "tmpl-welcome",
    key: "welcome_induction",
    title: "Course Welcome & Induction Pack",
    category: "enrolment",
    subject: "Welcome to Smartminds Training College — {course_title}",
    allowedPlaceholders: ["first_name", "course_title", "intake_date"],
    bodyTemplate:
      "Dear {first_name},\n\nWelcome to Smartminds Training College. Your enrolment on {course_title} starting {intake_date} is now active. Your induction materials and study timetable are available on your student portal.",
  },
  {
    id: "tmpl-zoom-link",
    key: "zoom_session_link",
    title: "Live Class Zoom Access Link",
    category: "attendance",
    subject: "Live Class Link: {class_name} ({session_date})",
    allowedPlaceholders: ["first_name", "class_name", "session_date", "zoom_link"],
    bodyTemplate:
      "Dear {first_name},\n\nYour upcoming interactive live class for {class_name} will take place on {session_date}.\n\nPlease join the meeting using this link: {zoom_link}\n\nPlease join 5 minutes prior to start.",
  },
  {
    id: "tmpl-assignment-due",
    key: "assignment_due_reminder",
    title: "Assignment Deadline Reminder",
    category: "assignment",
    subject: "Reminder: {assignment_title} due on {deadline_date}",
    allowedPlaceholders: ["first_name", "assignment_title", "deadline_date"],
    bodyTemplate:
      "Dear {first_name},\n\nThis is a friendly reminder that your submission for {assignment_title} is due on {deadline_date}. Please upload your completed work via your portal.",
  },
  {
    id: "tmpl-payment-reminder",
    key: "payment_instalment_due",
    title: "Payment Plan Instalment Notice",
    category: "payment",
    subject: "Notice: Instalment of £{amount_due} due on {due_date}",
    allowedPlaceholders: ["first_name", "amount_due", "due_date"],
    bodyTemplate:
      "Dear {first_name},\n\nThis is a notification regarding your payment plan with Smartminds Training College. Your next instalment of £{amount_due} is due on {due_date}.",
  },
];

// ============================================================================
// 9. Bookings & Availability
// ============================================================================

export const seedBookings: Booking[] = isDemoModeActive
  ? [
  {
    id: "book-001",
    fullName: "Claire Jenkins",
    email: "claire.jenkins@example.com",
    phone: "+44 7911 123456",
    courseInterest: "Diploma in Adult Care (Level 3)",
    scheduledAt: "2026-10-14T14:00:00Z",
    status: "confirmed",
    timeZone: "Europe/London",
    notes: "Wants to know if workplace funding is available.",
    createdAt: "2026-10-05T10:00:00Z",
    assignedStaffId: "user-admin-01",
    assignedStaffName: "Sarah Jenkins",
  },
  {
    id: "book-002",
    fullName: "Adebayo Ogun",
    email: "adebayo.ogun@example.com",
    phone: "+44 7922 654321",
    courseInterest: "Leadership in Adult Care (Level 5)",
    scheduledAt: "2026-10-15T11:00:00Z",
    status: "confirmed",
    timeZone: "Europe/London",
    notes: "Deputy manager preparing for registered manager promotion.",
    createdAt: "2026-10-06T14:30:00Z",
    assignedStaffId: "user-admin-02",
    assignedStaffName: "Brian Miller",
  },
  {
    id: "book-003",
    fullName: "Miriam O'Connor",
    email: "miriam.oconnor@example.com",
    phone: "+44 7700 900112",
    courseInterest: "Award in Education and Training (Level 3 AET)",
    scheduledAt: "2026-10-16T15:30:00Z",
    status: "confirmed",
    timeZone: "Europe/London",
    notes: "Care home trainer transitioning into accredited vocational teaching.",
    createdAt: "2026-10-07T09:15:00Z",
    assignedStaffId: "user-admin-01",
    assignedStaffName: "Sarah Jenkins",
  },
  {
    id: "book-004",
    fullName: "Tariq Mahmood",
    email: "tariq.mahmood@example.com",
    phone: "+44 7700 900334",
    courseInterest: "Diploma in Adult Care (Level 4)",
    scheduledAt: "2026-10-12T10:00:00Z",
    status: "completed",
    timeZone: "Europe/London",
    notes: "Assessment completed. Candidate eligible for instalment plan.",
    createdAt: "2026-10-04T11:00:00Z",
    assignedStaffId: "user-admin-03",
    assignedStaffName: "Fatima Al-Mansoor",
  },
  {
    id: "book-005",
    fullName: "Hannah Ross",
    email: "hannah.ross@example.com",
    phone: "+44 7700 900556",
    courseInterest: "Understanding Autism (Level 3 CPD)",
    scheduledAt: "2026-10-17T13:00:00Z",
    status: "confirmed",
    timeZone: "Europe/London",
    notes: "Direct booking via course detail page.",
    createdAt: "2026-10-08T16:20:00Z",
  },
]
  : [];

export const seedAvailabilityRules: AvailabilityRule[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 5, startTime: "09:00", endTime: "16:00", slotDurationMinutes: 30 },
];

export const seedBlockedDays: BlockedDay[] = [
  { date: "2026-12-25", reason: "Christmas Day" },
  { date: "2026-12-26", reason: "Boxing Day" },
  { date: "2026-10-23", reason: "Annual College Staff Inset Day" },
];

// ============================================================================
// 10. Feature Entitlements (PRD Section 6)
// ============================================================================

export const seedEntitlements: FeatureEntitlement[] = [
  {
    module_key: "payments_ledger",
    name: "Payments Ledger",
    description: "Financial tracking and bank transfer reconciliation (Owner only)",
    enabled: true,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "booking_native",
    name: "Native Booking & Availability",
    description: "Calendar slots, hours, and blocked days management",
    enabled: true,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "tutors_management",
    name: "Tutor & Staff Management",
    description: "Invite and assign roles to instructors and office staff",
    enabled: true,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "tasks",
    name: "Task Board",
    description: "Task delegation and deadline tracking",
    enabled: true,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "student_portal",
    name: "Student Portal (Phase 2)",
    description: "Self-service student course viewer and timetable",
    enabled: false,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "assignments_grading",
    name: "Assignments & Marking (Phase 2)",
    description: "Unit criteria grading and feedback workflow",
    enabled: false,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "recordings",
    name: "Stream-only Recordings (Phase 2)",
    description: "Protected stream player with watermark",
    enabled: false,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "evidence_packs",
    name: "Evidence Packs & Authority Docs (Phase 3)",
    description: "Awarding body audit compilations and signed dossiers",
    enabled: false,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "ai_submission_checks",
    name: "AI Submission Integrity Checks (Phase 3)",
    description: "Academic honesty screening for assignment submissions",
    enabled: false,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "advanced_reports",
    name: "Advanced Analytics & Reports (Phase 3)",
    description: "Detailed cohort completion rates and financial forecasting",
    enabled: false,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
  {
    module_key: "mobile_app",
    name: "Mobile App Access (Phase 3)",
    description: "Dedicated iOS and Android student app endpoints",
    enabled: false,
    enabled_by: "super_admin",
    enabled_at: "2026-09-01T00:00:00Z",
  },
];

export const seedAuditLog: AuditLogEntry[] = isDemoModeActive
  ? [
  {
    id: "audit-001",
    actorUserId: "user-super-01",
    actorEmail: "super.admin@smartmindstraining.co.uk",
    actorRole: "super_admin",
    action: "SEED_INIT",
    details: "Demo prototype initialized with initial sample dataset and entitlements",
    timestamp: "2026-09-01T00:00:00Z",
  },
]
  : [];

export const seedFeedback: FeedbackItem[] = [];

export interface OutboxMessage {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  renderedBody: string;
  templateKey?: string;
  sentAt: string;
  triggerEvent: string;
}

export const demoOutbox: OutboxMessage[] = isDemoModeActive
  ? [
  {
    id: "outbox-init-01",
    recipientEmail: "maya.lin@example.com",
    recipientName: "Maya Lin",
    subject: "Welcome to Smartminds Training College — Diploma in Adult Care (Level 3)",
    renderedBody:
      "Dear Maya,\n\nWelcome to Smartminds Training College. Your enrolment on Diploma in Adult Care (Level 3) starting Autumn 2026 is now active. Your induction materials and study timetable are available on your student portal.",
    templateKey: "welcome_induction",
    sentAt: "2026-09-15T09:05:00Z",
    triggerEvent: "Course Enrolment Induction",
  },
]
  : [];

export const seedEnquiries: EnquiryLead[] = [];

export const seedMessageLogs: MessageLogEntry[] = isDemoModeActive
  ? [
  {
    id: "msg-log-001",
    templateId: "tmpl-welcome",
    sentByUserId: "user-admin-01",
    sentByRole: "admin_staff",
    recipientEmail: "maya.lin@example.com",
    subject: "Welcome to Smartminds Training College — Diploma in Adult Care (Level 3)",
    renderedBody:
      "Dear Maya,\n\nWelcome to Smartminds Training College. Your enrolment on Diploma in Adult Care (Level 3) starting Autumn 2026 is now active. Your induction materials and study timetable are available on your student portal.",
    sentAt: "2026-09-15T09:05:00Z",
  },
]
  : [];

// ============================================================================
// 12. College Payment Gateway & Banking Configuration
// ============================================================================

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

export const collegePaymentGatewaySettings: PaymentGatewaySettings = {
  stripePublishableKey: "pk_test_51MzSmartmindsDemo2026Key9810",
  stripeSecretKey: "sk_test_••••••••••••••••••••••••••••",
  stripeWebhookSecret: "whsec_••••••••••••••••••••••••••••",
  isLiveMode: false,
  bankName: "Barclays Bank UK PLC",
  accountName: "Smartminds Training College Ltd",
  sortCode: "20-04-15",
  accountNumber: "43928104",
  bacsReferencePrefix: "SMTC",
};

// ============================================================================
// 13. College Visual Site CMS Content
// ============================================================================

export interface CollegeCmsContent {
  heroHeadline: string;
  heroSubtitle: string;
  noticeBannerText: string;
  noticeBannerActive: boolean;
  centreNumber: string;
  ukprn: string;
  supportPhone: string;
  whatsappNumber: string;
  headOfficeAddress: string;
  refundDaysGuarantee: number;
}

export const collegeCmsContent: CollegeCmsContent = {
  heroHeadline: "British Accredited Qualifications & Professional Diplomas",
  heroSubtitle:
    "Smartminds Training College delivers recognised RQF vocational diplomas and healthcare CPD accredited by NCFE, TQUK, and Pearson. Every programme features live weekly interactive evening seminars led by practicing healthcare specialists, zero written exams, and 0% interest instalment plans.",
  noticeBannerText:
    "Autumn & Winter 2026 Cohorts Enrolling Now — Spread Fees over 12 Months with 0% Interest",
  noticeBannerActive: true,
  centreNumber: "042-881",
  ukprn: "10094821",
  supportPhone: "020 8123 4567",
  whatsappNumber: "+44 7123 456789",
  headOfficeAddress: "Suite 4, College House, London, United Kingdom",
  refundDaysGuarantee: 14,
};

// ============================================================================
// 14. Visual Drag-and-Drop Page Builder Sections (Elementor/Wix Engine)
// ============================================================================

export type BuilderSectionType =
  | "hero"
  | "trust_strip"
  | "choose_path"
  | "how_it_works"
  | "pricing"
  | "featured_courses"
  | "why_smartminds"
  | "testimonials"
  | "cta_banner"
  | "faq_accordion"
  | "stats_counter"
  | "contact_block"
  | "announcement"
  | "video_spotlight"
  | "composite_block";

export type CompositeWidgetType =
  | "text"
  | "icon_box"
  | "image"
  | "cta_button"
  | "lead_form"
  | "video_player"
  | "divider";

export interface CompositeWidget {
  id: string;
  type: CompositeWidgetType;
  title?: string;
  subtitle?: string;
  content?: string;
  eyebrow?: string;
  icon?: string;
  imageUrl?: string;
  imageAlt?: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
  useArcMask?: boolean;
  buttonText?: string;
  buttonLink?: string;
  buttonVariant?: "primary" | "secondary" | "gold" | "outline";
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  videoUrl?: string;
  align?: "left" | "center" | "right";
  badge?: string;
  formFields?: {
    showName?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showCourse?: boolean;
    showNotes?: boolean;
    buttonLabel?: string;
  };
}

export interface CompositeColumn {
  id: string;
  widgets: CompositeWidget[];
}

export interface BuilderSectionItem {
  title: string;
  desc?: string;
  icon?: string;
  tag?: string;
  rating?: number;
  link?: string;
  image?: string;
}

export interface BuilderSection {
  id: string;
  type: BuilderSectionType;
  name: string;
  enabled: boolean;
  headline: string;
  subheadline: string;
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image?: string;
  bgColor?: "white" | "paper" | "navy" | "cream";
  align?: "left" | "center";
  mediaPosition?: "left" | "right";
  columns?: 1 | 2 | 3 | 4;
  columnRatio?: "50-50" | "60-40" | "70-30" | "40-60" | "33-67";
  paddingDensity?: "compact" | "normal" | "spacious";
  videoUrl?: string;
  videoThumbnail?: string;
  videoTitle?: string;
  videoDesc?: string;
  items?: BuilderSectionItem[];
  compositeColumns?: CompositeColumn[];
  templateCategory?: string;
  templateDesc?: string;
}

export const defaultPageBuilderSections: BuilderSection[] = [
  {
    id: "sec-hero-01",
    type: "hero",
    name: "Hero Banner",
    enabled: true,
    badgeText: "British Accredited Training",
    headline: "Live classes with real tutors. Qualifications that move your career forward.",
    subheadline:
      "Study recognized UK diplomas in health, social care, education, and business through interactive live evening classes with dedicated tutor mentoring.",
    buttonText: "Get free advice",
    buttonLink: "/book",
    secondaryButtonText: "View all courses",
    secondaryButtonLink: "/courses",
    image: "/images/hero-learner.jpg",
  },
  {
    id: "sec-trust-02",
    type: "trust_strip",
    name: "Accreditation & Trust Strip",
    enabled: true,
    headline: "Recognised British Standards",
    subheadline: "Accredited by leading UK awarding bodies under Ofqual oversight",
    items: [
      {
        title: "Ofqual",
        desc: "Regulated",
        icon: "ofqual",
        tag: "National Regulator",
        link: "https://www.gov.uk/government/organisations/ofqual",
      },
      {
        title: "TQUK",
        desc: "Approved Centre",
        icon: "tquk",
        tag: "Awarding Organisation",
        link: "https://www.tquk.org",
      },
      {
        title: "The CPD Group",
        desc: "Accredited Provider",
        icon: "cpd",
        tag: "Professional CPD",
        link: "https://thecpd.group",
      },
      {
        title: "Skills for Health",
        desc: "NOS Aligned",
        icon: "skills-health",
        tag: "Health & Social Care",
        link: "https://www.skillsforhealth.org.uk",
      },
      {
        title: "UKRLP",
        desc: "Registered Provider",
        icon: "ukrlp",
        tag: "UK Register: 10094821",
        link: "https://www.ukrlp.co.uk",
      },
    ],
  },
  {
    id: "sec-pathway-03",
    type: "choose_path",
    name: "Choose Your Path by Outcome",
    enabled: true,
    headline: "Choose your path by outcome",
    subheadline: "Select where you want your qualification to take you.",
  },
  {
    id: "sec-journey-04",
    type: "how_it_works",
    name: "How It Works 4-Step Journey",
    enabled: true,
    headline: "How it works: from consultation to qualification",
    subheadline:
      "Our structured route gives you personal tutor support from day one, fitting around your working week with both live classes and 24/7 access to recordings.",
  },
  {
    id: "sec-pricing-05",
    type: "pricing",
    name: "0% Interest Tuition Flexibility",
    enabled: true,
    headline: "Flexible ways to pay — no hidden fees, no interest charges",
    subheadline:
      "We believe career qualifications should be accessible. Choose an upfront discount, spread your fees monthly with zero markup, or check whether your course is covered by government funding.",
  },
  {
    id: "sec-courses-06",
    type: "featured_courses",
    name: "Featured Qualifications Grid",
    enabled: true,
    headline: "Popular live-taught qualifications",
    subheadline:
      "Explore our most requested British diplomas. Every programme features live tutor-led sessions, continuous mentor support, and flexible instalment schedules.",
    buttonText: "View all courses",
    buttonLink: "/courses",
  },
  {
    id: "sec-testimonials-07",
    type: "testimonials",
    name: "Student Reviews & Outcomes",
    enabled: true,
    headline: "Real stories from qualified graduates",
    subheadline:
      "Read how healthcare workers, aspiring tutors, and career changers achieved their Ofqual-regulated certificates with Smartminds.",
    videoTitle: "Watch learners share their qualification journey",
    videoDesc:
      "Real feedback recorded by our graduates sharing their study experience, tutor support, and career progression.",
    videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    videoThumbnail: "/images/certificate-moment.jpg",
  },
  {
    id: "sec-faqs-08",
    type: "faq_accordion",
    name: "Frequently Asked Questions",
    enabled: true,
    headline: "Everything you need to know before enrolling",
    subheadline:
      "Clear answers about class schedules, Ofqual accreditation, flexible instalment plans, and tutor support.",
    items: [
      {
        title: "Are your qualifications recognised by UK employers and CQC inspectors?",
        desc: "Yes. Our regulated qualifications are awarded by established UK awarding organisations (such as TQUK) and regulated by Ofqual. They meet the strict workforce standards required by the Care Quality Commission (CQC), Skills for Care, and local education authorities across England and Wales.",
        tag: "Accreditation",
      },
      {
        title: "Are classes live or pre-recorded?",
        desc: "All core teaching is delivered through live online classes led by qualified UK tutors, not automated pre-recorded slide decks. You interact directly with your tutor, participate in group discussions, and receive live guidance on assignment criteria.",
        tag: "Teaching",
      },
      {
        title: "What happens if I miss an evening live class?",
        desc: "Every single live webinar is recorded in high definition and made available to your personal student portal within 24 hours. You can rewatch recordings anytime, as many times as you need, ensuring you never fall behind if your shift pattern changes.",
        tag: "Flexibility",
      },
      {
        title: "How do instalment plans work? Is there any interest or APR?",
        desc: "We never charge interest, finance fees, or APR. You pay an initial deposit followed by equal monthly payments across 3, 6, 10, or 12 months. The total amount you pay in instalments is the exact same standard course price — at no extra charge.",
        tag: "Payments",
      },
      {
        title: "Can I study while working full-time or doing shift work?",
        desc: "Yes. Over 80% of our adult learners work full-time in care, education, or office environments. Live sessions run on weekday evenings (typically 6:30 PM to 8:30 PM), and your coursework portfolio can be completed flexibly around your work rota.",
        tag: "Flexibility",
      },
      {
        title: "Am I eligible for government-funded training?",
        desc: "Eligible learners can access fully funded routes through schemes such as the Adult Education Budget (AEB) and Free Courses for Jobs, depending on UK residency status, employment, age, and existing qualification levels. You can check your eligibility with our admissions team on a free 15-minute call.",
        tag: "Funding",
      },
      {
        title: "How soon can I start after enrolling?",
        desc: "We operate a rolling start model, with new cohorts launching every two to four weeks. Once you choose your course and complete registration, our admissions team will confirm your cohort schedule and provide your student access details immediately.",
        tag: "Enrolment",
      },
      {
        title: "What tutor support do I receive between classes?",
        desc: "You are assigned a dedicated course tutor whom you can reach via student messaging and email. Tutors review your draft portfolio submissions, give unit-by-unit constructive feedback, and offer 1-on-1 tutorials if you require additional support on specific units.",
        tag: "Support",
      },
    ],
  },
  {
    id: "sec-cta-09",
    type: "cta_banner",
    name: "Free Advisory Call Band",
    enabled: true,
    badgeText: "Personalised Guidance",
    headline: "Not sure which course? Book a free call.",
    subheadline:
      "Speak directly with an academic adviser. We will assess your background, confirm entry requirements, check government funding eligibility, and help you select the right payment plan.",
    buttonText: "Book a free call",
    buttonLink: "/book",
    secondaryButtonText: "Prefer WhatsApp? Message us",
    secondaryButtonLink: "https://wa.me/447123456789",
  },
];

export const collegePageBuilderSections: BuilderSection[] = [
  ...defaultPageBuilderSections,
];

export const seedCompositeTemplates: BuilderSection[] = [
  {
    id: "tmpl-composite-advisor-split",
    type: "composite_block",
    name: "Tutor & Assessor Spotlight",
    templateCategory: "Featured Layouts",
    templateDesc: "2-column split featuring mentor narrative, qualification badge, and arc-masked imagery.",
    enabled: true,
    headline: "Learn directly from practicing UK care & education practitioners",
    subheadline: "Every diploma includes 1-on-1 portfolio feedback, live evening seminars, and dedicated assessor guidance.",
    bgColor: "paper",
    columns: 2,
    columnRatio: "60-40",
    paddingDensity: "normal",
    compositeColumns: [
      {
        id: "col-1",
        widgets: [
          {
            id: "w-txt-1",
            type: "text",
            eyebrow: "Dedicated Faculty",
            title: "Expert Tutor Mentoring from Day One",
            content: "You are paired with a certified UK assessor who reviews draft unit submissions within 48 hours and hosts live interactive evening classes.",
          },
          {
            id: "w-icon-1",
            type: "icon_box",
            icon: "shield-check",
            title: "Ofqual Regulated Criteria",
            content: "Assessment portfolios strictly adhere to national occupational standards without exams.",
            badge: "Accredited",
          },
          {
            id: "w-icon-2",
            type: "icon_box",
            icon: "sparkles",
            title: "24/7 Class Webinar Replays",
            content: "Watch high-definition seminar recordings anytime your working shifts change.",
            badge: "Flexible",
          },
          {
            id: "w-cta-1",
            type: "cta_button",
            buttonText: "Book Free Tutor Consultation",
            buttonLink: "/book",
            secondaryButtonText: "Explore Diplomas",
            secondaryButtonLink: "/courses",
          },
        ],
      },
      {
        id: "col-2",
        widgets: [
          {
            id: "w-img-1",
            type: "image",
            imageUrl: "/images/adult-care-training.jpg",
            imageAlt: "Healthcare practitioner training",
            aspectRatio: "portrait",
            useArcMask: true,
          },
        ],
      },
    ],
  },
  {
    id: "tmpl-composite-intake-form",
    type: "composite_block",
    name: "Quick Callback & Funding Check",
    templateCategory: "Lead Capture",
    templateDesc: "High-conversion 2-column split with funding eligibility checklist and inline telephone callback form.",
    enabled: true,
    headline: "Check your qualification eligibility in 60 seconds",
    subheadline: "Confirm prior experience exemptions, government funding support, and flexible instalment options.",
    bgColor: "white",
    columns: 2,
    columnRatio: "50-50",
    paddingDensity: "normal",
    compositeColumns: [
      {
        id: "col-1",
        widgets: [
          {
            id: "w-txt-2",
            type: "text",
            eyebrow: "Admissions Fast-Track",
            title: "Start Your Accredited Pathway This Month",
            content: "Rolling cohort starts every 2 to 4 weeks. Spread your fees with 0% interest monthly direct debit or check fully-funded AEB qualification criteria.",
          },
          {
            id: "w-icon-3",
            type: "icon_box",
            icon: "check",
            title: "0% Interest Instalments",
            content: "Split tuition evenly across 3, 6, 10, or 12 months with zero credit check markups.",
          },
          {
            id: "w-icon-4",
            type: "icon_box",
            icon: "graduation-cap",
            title: "Recognised British Diplomas",
            content: "Direct pathway into senior healthcare management, education, or specialized care roles.",
          },
        ],
      },
      {
        id: "col-2",
        widgets: [
          {
            id: "w-form-1",
            type: "lead_form",
            title: "Request Advisor Callback",
            subtitle: "An academic adviser will call you to confirm qualification entry criteria.",
            buttonText: "Confirm My Free Consultation",
            formFields: {
              showName: true,
              showPhone: true,
              showEmail: true,
              showCourse: true,
              showNotes: false,
              buttonLabel: "Request Callback",
            },
          },
        ],
      },
    ],
  },
  {
    id: "tmpl-composite-features-3col",
    type: "composite_block",
    name: "3-Pillars Academic Framework",
    templateCategory: "Trust & Proof",
    templateDesc: "Balanced 3-column feature cards with gold accent line icons, subtitles, and accreditation guarantees.",
    enabled: true,
    headline: "The Smartminds Training Advantage",
    subheadline: "Designed specifically for busy adults balancing full-time employment and professional qualifications.",
    bgColor: "paper",
    columns: 3,
    paddingDensity: "normal",
    compositeColumns: [
      {
        id: "col-1",
        widgets: [
          {
            id: "w-icon-5",
            type: "icon_box",
            icon: "shield-check",
            title: "100% Coursework & Evidence",
            content: "Zero stressful end-of-year exams. Prove real occupational competency through structured workplace portfolios.",
            badge: "Exam-Free",
          },
        ],
      },
      {
        id: "col-2",
        widgets: [
          {
            id: "w-icon-6",
            type: "icon_box",
            icon: "video",
            title: "Live Interactive Evening Classes",
            content: "Engage with expert tutors in live Zoom seminars. Complete recordings uploaded to your portal next morning.",
            badge: "Live Mentoring",
          },
        ],
      },
      {
        id: "col-3",
        widgets: [
          {
            id: "w-icon-7",
            type: "icon_box",
            icon: "star",
            title: "Dedicated Personal Assessor",
            content: "Receive unit-by-unit constructive reviews with average 48-hour turnarounds to keep you progressing steadily.",
            badge: "1-on-1 Guidance",
          },
        ],
      },
    ],
  },
];

export interface NavDropdownChild {
  id: string;
  label: string;
  href: string;
  desc?: string;
  badge?: string;
}

export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  children?: NavDropdownChild[];
}

export interface HeaderNavConfig {
  logoType?: "vector" | "image";
  logoImageUrl?: string;
  logoHeight?: number;
  siteName?: string;
  tagline?: string;
  announcementActive: boolean;
  announcementText: string;
  announcementLink?: string;
  supportPhone: string;
  whatsappNumber: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  navLinks: NavLinkItem[];
}

export const defaultHeaderNavConfig: HeaderNavConfig = {
  logoType: "vector",
  logoImageUrl: "/images/logo-color.png",
  logoHeight: 44,
  siteName: "Smartminds",
  tagline: "Training College",
  announcementActive: true,
  announcementText:
    "Autumn & Winter 2026 Cohorts Enrolling Now — Spread Fees over 12 Months with 0% Interest",
  announcementLink: "/funding",
  supportPhone: "01452 225 225",
  whatsappNumber: "07932 034 548",
  ctaButtonText: "Get free advice",
  ctaButtonLink: "/book",
  navLinks: [
    {
      id: "nav-1",
      label: "Courses",
      href: "/courses",
      children: [
        {
          id: "sub-1",
          label: "Diploma in Adult Care (Level 3)",
          href: "/courses/diploma-in-adult-care",
          desc: "RQF accredited qualification for senior healthcare workers.",
          badge: "Level 3",
        },
        {
          id: "sub-2",
          label: "Children & Young People's Workforce",
          href: "/courses/children-young-people-workforce",
          desc: "Nursery & early years educator practitioner pathway.",
          badge: "Level 3",
        },
        {
          id: "sub-3",
          label: "All Accredited Diplomas",
          href: "/courses",
          desc: "Browse our complete prospectus of regulated qualifications.",
        },
      ],
    },
    { id: "nav-2", label: "CPD", href: "/cpd" },
    { id: "nav-3", label: "Private Tutoring", href: "/private-tutoring" },
    { id: "nav-4", label: "Funding", href: "/funding" },
    {
      id: "nav-5",
      label: "About",
      href: "/about",
      children: [
        {
          id: "sub-4",
          label: "About Smartminds College",
          href: "/about",
          desc: "Our mission, educational values, and tutor faculty.",
        },
        {
          id: "sub-5",
          label: "Safeguarding & Student Welfare",
          href: "/safeguarding-student-welfare",
          desc: "Our safeguarding framework and student support commitments.",
        },
      ],
    },
    { id: "nav-6", label: "Contact", href: "/contact" },
  ],
};

export interface FooterConfig {
  logoType?: "vector" | "crest" | "image";
  logoImageUrl?: string;
  logoHeight?: number;
  siteName?: string;
  tagline?: string;
  bioText: string;
  badge1: string;
  badge2: string;
  exploreLinks: { id: string; label: string; href: string }[];
  collegeLinks: { id: string; label: string; href: string }[];
  phone: string;
  email: string;
  whatsappNumber: string;
  openingHours: string;
  headOfficeAddress: string;
  accreditationHeadline: string;
  accreditationSubtext: string;
  legalLine: string;
  copyrightText: string;
}

export const defaultFooterConfig: FooterConfig = {
  logoType: "crest",
  logoImageUrl: "",
  logoHeight: 44,
  siteName: "Smartminds",
  tagline: "Training College",
  bioText:
    "UK professional training provider delivering 100% online distance learning with certified tutors and assessors for Ofqual-regulated qualifications, CPD courses, and private tutoring.",
  badge1: "Live Online Classes",
  badge2: "UK Registered Provider",
  exploreLinks: [
    { id: "f-1", label: "All Qualifications", href: "/courses" },
    { id: "f-2", label: "CPD Short Courses", href: "/cpd" },
    { id: "f-3", label: "Private Tutoring", href: "/private-tutoring" },
    { id: "f-4", label: "Funded Options", href: "/funding" },
  ],
  collegeLinks: [
    { id: "f-5", label: "About Smartminds", href: "/about" },
    { id: "f-6", label: "Contact & Location", href: "/contact" },
    { id: "f-7", label: "Privacy Policy", href: "/privacy" },
    { id: "f-8", label: "Cookie Policy", href: "/cookies" },
    { id: "f-9", label: "Terms & Conditions", href: "/terms" },
    { id: "f-10", label: "Refund Policy", href: "/refunds" },
  ],
  phone: "01452 225 225",
  email: "help@smartmindstraining.co.uk",
  whatsappNumber: "07932 034 548",
  openingHours: "Mon – Thurs: 9:30 AM – 5:30 PM | Fri: Online Sessions",
  headOfficeAddress: "62 High Street, Aveley, South Ockendon, RM15 4BX",
  accreditationHeadline: "Accreditations & Awarding Organisations",
  accreditationSubtext:
    "Recognised British qualifications delivered through regulated frameworks.",
  legalLine:
    "Smartminds Training College is a trading name of Smartminds Empire Ltd, Company No. 13492661",
  copyrightText: "© 2026 Smartminds Training College. All rights reserved.",
};

export const collegePagesData: Record<string, BuilderSection[]> = {
  "/": [...defaultPageBuilderSections],
  "/courses": [
    {
      id: "sec-courses-hero",
      type: "hero",
      name: "Qualifications Hero",
      enabled: true,
      badgeText: "UK Registered Learning Provider • UKPRN: 10094821",
      headline: "Accredited Vocational Qualifications & Healthcare Diplomas",
      subheadline:
        "Regulated RQF diplomas in Adult Care, Early Years, and Teacher Education with live weekly evening classes, zero exams, and dedicated 1-to-1 assessor allocation.",
      buttonText: "Browse Qualifications",
      buttonLink: "#courses-grid",
      secondaryButtonText: "Book Free Consultation",
      secondaryButtonLink: "/book",
      image: "/images/adult-care-training.jpg",
    },
    {
      id: "sec-courses-trust",
      type: "trust_strip",
      name: "Accreditation Strip",
      enabled: true,
      headline: "Ofqual Regulated Standards",
      subheadline: "NCFE & TQUK approved centre with 100% coursework assessment",
      items: [
        { title: "NCFE & TQUK Approved", desc: "Regulated Frameworks" },
        { title: "100% Coursework", desc: "No Written Exams" },
        { title: "Live Evening Classes", desc: "Weekly Interactive Zoom" },
        { title: "0% Interest Plans", desc: "Spread over 3–12 Months" },
      ],
    },
    {
      id: "sec-courses-grid",
      type: "featured_courses",
      name: "All Regulated Qualifications",
      enabled: true,
      headline: "Choose Your Accredited Career Pathway",
      subheadline:
        "Every diploma includes all learning materials, weekly interactive seminars, and dedicated 1-to-1 tutor support.",
      buttonText: "View Course Details",
      buttonLink: "/courses",
    },
    {
      id: "sec-courses-why",
      type: "why_smartminds",
      name: "Why Study with Smartminds",
      enabled: true,
      headline: "The Smarter Way to Gain Your British Diploma",
      subheadline:
        "Designed specifically for working healthcare and education practitioners.",
      items: [
        {
          title: "100% Coursework & Evidence Portfolio",
          desc: "Demonstrate competency via real workplace evidence without exam stress.",
          tag: "Assessment",
        },
        {
          title: "Flexible Evening Zoom Seminars",
          desc: "Attend live classes from home with recorded replays available 24/7.",
          tag: "Flexibility",
        },
      ],
    },
    {
      id: "sec-courses-faq",
      type: "faq_accordion",
      name: "Qualifications FAQ",
      enabled: true,
      headline: "Common Questions About Enrolment",
      subheadline:
        "Everything you need to know about eligibility, evidence, and certificates.",
      items: [
        {
          title: "Do I need prior qualifications to enrol?",
          desc: "For Level 2 and Level 3 diplomas, no formal prior qualifications are required. A basic standard of English and employment/volunteering in care or education is sufficient.",
        },
        {
          title: "When can I begin my course?",
          desc: "We offer rolling weekly intakes so you can start your induction immediately upon completing enrolment.",
        },
      ],
    },
    {
      id: "sec-courses-cta",
      type: "cta_banner",
      name: "Course Consultation Call",
      enabled: true,
      badgeText: "Speak with an Assessor",
      headline: "Unsure Which Level Is Right for Your Career?",
      subheadline:
        "Our senior training advisors provide free 15-minute consultations to review your experience and recommend the best qualification.",
      buttonText: "Book Free 1-to-1 Advice",
      buttonLink: "/book",
    },
  ],
  "/funding": [
    {
      id: "sec-funding-hero",
      type: "hero",
      name: "Funding & Instalments Hero",
      enabled: true,
      badgeText: "0% Interest Guaranteed • No Credit Checks",
      headline: "Affordable Tuition with Flexible 0% Interest Monthly Plans",
      subheadline:
        "We believe financial barriers should never stop you advancing your career. Spread your course fees over 3 to 12 months with zero interest.",
      buttonText: "See Monthly Plans",
      buttonLink: "/courses",
      secondaryButtonText: "Speak with Finance Team",
      secondaryButtonLink: "/contact",
      image: "/images/teacher-training.jpg",
    },
    {
      id: "sec-funding-trust",
      type: "trust_strip",
      name: "Funding Guarantees",
      enabled: true,
      headline: "Transparent Tuition Standards",
      subheadline:
        "No hidden registration fees, no interest charges, and no third-party loans",
      items: [
        { title: "0% Fixed Interest", desc: "Zero APR on all instalment plans" },
        { title: "No Credit Checks", desc: "Simple direct college agreement" },
        { title: "14-Day Refund Guarantee", desc: "Full peace of mind" },
        { title: "10% Upfront Discount", desc: "When paying tuition in full" },
      ],
    },
    {
      id: "sec-funding-why",
      type: "why_smartminds",
      name: "How Payment Works",
      enabled: true,
      headline: "Three Flexible Ways to Fund Your Diploma",
      subheadline:
        "Choose the payment option that matches your monthly budget.",
      items: [
        {
          title: "Option 1: Pay in Full (10% Discount)",
          desc: "Pay upfront via card or BACS bank transfer and receive an immediate 10% discount on your full tuition fee.",
          tag: "Best Value",
        },
        {
          title: "Option 2: 0% Interest Monthly Instalments",
          desc: "Pay a low deposit (from £150) and spread the balance equally across 3 to 12 monthly payments with zero interest.",
          tag: "Most Popular",
        },
        {
          title: "Option 3: Employer or Workplace Sponsorship",
          desc: "Many care homes and nurseries fund employee qualifications directly. We issue official VAT invoices.",
          tag: "Sponsored",
        },
        {
          title: "Option 4: Government Grant Assistance",
          desc: "Our team can advise if you qualify for local authority training bursaries or workforce development funding.",
          tag: "Bursaries",
        },
      ],
    },
    {
      id: "sec-funding-faq",
      type: "faq_accordion",
      name: "Funding FAQ",
      enabled: true,
      headline: "Frequently Asked Questions About Fees",
      subheadline:
        "Transparent answers to all payment plan and instalment questions.",
      items: [
        {
          title: "Will my credit score be checked?",
          desc: "No. Our 0% instalment plans are an internal college arrangement. We do not run credit checks.",
        },
        {
          title: "What happens if my circumstances change?",
          desc: "You can pause your course or adjust your payment schedule by speaking with our student accounts advisor.",
        },
      ],
    },
    {
      id: "sec-funding-cta",
      type: "cta_banner",
      name: "Finance Consultation",
      enabled: true,
      headline: "Need a Custom Payment Schedule?",
      subheadline:
        "Our accounts team can tailor an instalment schedule that aligns with your monthly pay date.",
      buttonText: "Discuss Payment Options",
      buttonLink: "/contact",
    },
  ],
  "/about": [
    {
      id: "sec-about-hero",
      type: "hero",
      name: "About College Hero",
      enabled: true,
      badgeText: "UK Registered Learning Provider: 10094821",
      headline: "Empowering Healthcare and Education Professionals Across Britain",
      subheadline:
        "Smartminds Training College is dedicated to delivering accessible, rigorous, and career-defining vocational qualifications led by practicing specialists.",
      buttonText: "Explore Our Diplomas",
      buttonLink: "/courses",
      image: "/images/early-years-training.jpg",
    },
    {
      id: "sec-about-stats",
      type: "stats_counter",
      name: "College Impact Metrics",
      enabled: true,
      headline: "Our Track Record in Further Education",
      subheadline:
        "Real achievements supporting learners into promotions and senior practitioner roles.",
      items: [
        { title: "98%", desc: "Student Completion Rate", tag: "Excellence" },
        { title: "500+", desc: "Graduates Practicing in UK Care", tag: "Community" },
        { title: "48h", desc: "Average Assignment Feedback Window", tag: "Support" },
        { title: "100%", desc: "Coursework & Portfolio Based", tag: "No Exams" },
      ],
    },
    {
      id: "sec-about-why",
      type: "why_smartminds",
      name: "Our Core Teaching Standards",
      enabled: true,
      headline: "What Sets Smartminds Training College Apart",
      subheadline:
        "We combine academic quality with the practical flexibility that working professionals require.",
      items: [
        {
          title: "Practicing Assessors & Mentors",
          desc: "Every tutor is an active or senior practitioner with direct clinical and educational experience.",
          tag: "Expertise",
        },
        {
          title: "Inclusive & Flexible Learning",
          desc: "Evening seminars, recorded replays, and remote portfolio submission allow you to balance work and study.",
          tag: "Accessibility",
        },
      ],
    },
    {
      id: "sec-about-cta",
      type: "cta_banner",
      name: "Admissions Call",
      enabled: true,
      headline: "Ready to Advance Your Healthcare Career?",
      subheadline:
        "Join our next intake cohort and study with experienced British tutors.",
      buttonText: "Explore Qualifications",
      buttonLink: "/courses",
    },
  ],
  "/contact": [
    {
      id: "sec-contact-hero",
      type: "hero",
      name: "Contact Page Hero",
      enabled: true,
      badgeText: "Admissions Office • London, UK",
      headline: "Speak Directly with Our Admissions Advisory Team",
      subheadline:
        "Whether you need guidance on qualification levels, instalment plans, or employer funding, our friendly advisors are here to help.",
      buttonText: "Request Fast Callback",
      buttonLink: "#callback-form",
      image: "/images/tutor-teaching.jpg",
    },
    {
      id: "sec-contact-form",
      type: "contact_block",
      name: "Consultation Request Form",
      enabled: true,
      headline: "Book a Free Phone Consultation",
      subheadline:
        "Leave your details and a course advisor will contact you within 2 business hours.",
      buttonText: "Request Free Advice",
    },
    {
      id: "sec-contact-faq",
      type: "faq_accordion",
      name: "Admissions FAQ",
      enabled: true,
      headline: "Quick Answers Before You Call",
      subheadline:
        "Common questions regarding office hours, enrolment, and response times.",
      items: [
        {
          title: "What are your admissions office hours?",
          desc: "Our advisory team is available Monday to Friday from 9:00 AM to 6:30 PM, and Saturdays from 10:00 AM to 2:00 PM.",
        },
        {
          title: "Can I receive course specs via WhatsApp?",
          desc: "Yes. Message our admissions WhatsApp number at +44 7123 456789 and an advisor will send the syllabus immediately.",
        },
      ],
    },
  ],
  "/privacy": [
    {
      id: "sec-privacy-hero",
      type: "hero",
      name: "Privacy Policy Hero",
      enabled: true,
      badgeText: "UK GDPR & Data Protection Act 2018",
      headline: "Privacy Policy & Data Handling Principles",
      subheadline:
        "Transparent information on how Smartminds Training College collects, secures, and uses your personal data across student enrolments, assessment portfolios, and advisory consultations.",
      buttonText: "Read Data Policies",
      buttonLink: "#sec-privacy-clauses",
      secondaryButtonText: "Contact Data Protection Officer",
      secondaryButtonLink: "/contact",
      image: "/images/hero-learner.jpg",
    },
    {
      id: "sec-privacy-clauses",
      type: "why_smartminds",
      name: "Statutory Privacy Articles",
      enabled: true,
      headline: "Data Protection Principles & Information Collection",
      subheadline:
        "Every learner and website visitor is protected under strict UK General Data Protection Regulation standards.",
      columns: 2,
      items: [
        {
          title: "1. Data Controller Information",
          desc: "Smartminds Training College is a trading name of Smartminds Empire Ltd (Company No. 13492661), registered in England and Wales. Registered office: 62 High Street, Aveley, South Ockendon, RM15 4BX, United Kingdom. Email: dpo@smartmindstraining.co.uk.",
          tag: "Controller",
        },
        {
          title: "2. Personal Data We Collect",
          desc: "We collect full legal names, contact numbers, email addresses, identification proof, employment details, and academic evidence required for Ofqual-regulated course registration.",
          tag: "Collection",
        },
        {
          title: "3. How We Process Your Data",
          desc: "Your data is processed strictly to deliver live online classes, register your portfolio with awarding organisations (NCFE, TQUK), issue accredited certificates, and administer 0% instalment plans.",
          tag: "Purpose",
        },
        {
          title: "4. Lawful Basis for Processing",
          desc: "Processing relies on contractual necessity (to deliver enrolled educational programmes), statutory compliance (Ofqual regulatory audits), and legitimate interest in learner progress.",
          tag: "Legal Basis",
        },
        {
          title: "5. Data Retention & Security Standards",
          desc: "Learner portfolios and records are securely stored with 256-bit encryption for standard statutory qualification verification periods, after which data is safely anonymised or deleted.",
          tag: "Security",
        },
        {
          title: "6. Your Individual Statutory Rights",
          desc: "Under UK GDPR, you have the right to access your records (SAR), correct inaccuracies, request erasure where applicable, and restrict processing by contacting our Data Protection Officer.",
          tag: "Learner Rights",
        },
      ],
    },
    {
      id: "sec-privacy-cta",
      type: "cta_banner",
      name: "Data Privacy Enquiries",
      enabled: true,
      badgeText: "Compliance & Governance",
      headline: "Need Assistance with Your Personal Data?",
      subheadline:
        "Our data compliance team handles Subject Access Requests (SAR) and privacy enquiries within statutory timeframes.",
      buttonText: "Contact Data Protection Officer",
      buttonLink: "/contact",
    },
  ],
  "/terms": [
    {
      id: "sec-terms-hero",
      type: "hero",
      name: "Terms & Conditions Hero",
      enabled: true,
      badgeText: "Contractual Agreement • Version 1.0",
      headline: "Terms and Conditions of Enrolment",
      subheadline:
        "Clear contractual terms governing student registration, interactive webinar attendance, coursework portfolio submissions, and qualification delivery.",
      buttonText: "Review Terms",
      buttonLink: "#sec-terms-clauses",
      secondaryButtonText: "Admissions Consultation",
      secondaryButtonLink: "/contact",
      image: "/images/certificate-moment.jpg",
    },
    {
      id: "sec-terms-clauses",
      type: "why_smartminds",
      name: "Key Contractual Conditions",
      enabled: true,
      headline: "Enrolment, Delivery & Academic Policies",
      subheadline:
        "Designed to ensure transparent standards between Smartminds Training College and enrolled learners.",
      columns: 2,
      items: [
        {
          title: "1. Enrolment & Agreement",
          desc: "By registering for a qualification or signing an instalment agreement, you enter into a binding educational contract with Smartminds Training College (Smartminds Empire Ltd).",
          tag: "Enrolment",
        },
        {
          title: "2. Live Webinar Classes & Attendance",
          desc: "Qualifications feature live interactive evening Zoom webinars led by qualified assessors. Learners are expected to participate or review recorded sessions where unavoidable absence occurs.",
          tag: "Attendance",
        },
        {
          title: "3. Coursework Assessment & Quality Assurance",
          desc: "All awards are assessed via workplace evidence portfolios and continuous assignment submissions verified by an appointed Internal Quality Assurer (IQA) with zero written exam requirements.",
          tag: "Assessment",
        },
        {
          title: "4. Tuition Fees & 0% Monthly Payment Plans",
          desc: "Instalment payments carry zero interest and must be honoured on the agreed monthly due dates. Failure to maintain payments may temporarily restrict portfolio grading access.",
          tag: "Tuition",
        },
        {
          title: "5. Learner Code of Conduct",
          desc: "Students are required to maintain professional conduct during live webinars and in written submissions. Plagiarism or disruptive conduct is strictly handled under our academic policy.",
          tag: "Conduct",
        },
        {
          title: "6. Awarding Organisation Certification",
          desc: "Official qualification certificates are claimed and issued upon successful completion of all mandatory units, external moderation, and full settlement of tuition accounts.",
          tag: "Certification",
        },
      ],
    },
    {
      id: "sec-terms-cta",
      type: "cta_banner",
      name: "Registry & Admissions Guidance",
      enabled: true,
      badgeText: "Student Registry",
      headline: "Have Any Questions About Course Terms?",
      subheadline:
        "Our admissions advisors are available to walk through course specifications and answer contractual questions.",
      buttonText: "Speak with Admissions",
      buttonLink: "/contact",
    },
  ],
  "/cookies": [
    {
      id: "sec-cookies-hero",
      type: "hero",
      name: "Cookie Policy Hero",
      enabled: true,
      badgeText: "Privacy & Tracking Controls",
      headline: "Cookie Policy & Tracking Preferences",
      subheadline:
        "Learn how cookies and secure local storage are used on our website to maintain secure student sessions and enhance your learning experience.",
      buttonText: "View Cookie Details",
      buttonLink: "#sec-cookies-clauses",
      image: "/images/hero-learner.jpg",
    },
    {
      id: "sec-cookies-clauses",
      type: "why_smartminds",
      name: "Cookie Categories & Usage",
      enabled: true,
      headline: "How We Categorise and Manage Cookies",
      subheadline:
        "We prioritize your privacy by blocking third-party scripts and marketing trackers until explicit user consent is granted.",
      columns: 2,
      items: [
        {
          title: "1. What Are Cookies?",
          desc: "Cookies are small text records stored on your device that allow web applications to identify your session and remember your preferences between page visits.",
          tag: "Overview",
        },
        {
          title: "2. Strictly Necessary Cookies",
          desc: "Essential cookies maintain secure login states across the student and admin portals, CSRF protection, and your cookie consent settings. These cannot be disabled.",
          tag: "Essential",
        },
        {
          title: "3. Functional & Experience Cookies",
          desc: "These cookies remember choices such as dismissed advisory banners and selected audio/video volume settings to provide a smooth browsing experience.",
          tag: "Functional",
        },
        {
          title: "4. Marketing & Video Embed Cookies",
          desc: "Third-party embedded content (such as YouTube videos or social media links) is held behind consent guards and loaded only when you explicitly allow marketing cookies.",
          tag: "Third-Party",
        },
      ],
    },
    {
      id: "sec-cookies-cta",
      type: "cta_banner",
      name: "Consent Management",
      enabled: true,
      headline: "Manage or Update Your Cookie Preferences",
      subheadline:
        "You can review or withdraw cookie consent at any time through our interactive preference modal in the website footer.",
      buttonText: "Contact Support",
      buttonLink: "/contact",
    },
  ],
  "/refunds": [
    {
      id: "sec-refunds-hero",
      type: "hero",
      name: "Refund Policy Hero",
      enabled: true,
      badgeText: "Consumer Rights & Protections",
      headline: "Refund & Cancellation Policy",
      subheadline:
        "Clear statutory cancellation rights, 14-day cooling-off protections, and fair withdrawal procedures for all distance learning courses.",
      buttonText: "Read Refund Terms",
      buttonLink: "#sec-refunds-clauses",
      secondaryButtonText: "Accounts Help",
      secondaryButtonLink: "/contact",
      image: "/images/tutor-teaching.jpg",
    },
    {
      id: "sec-refunds-clauses",
      type: "why_smartminds",
      name: "Cancellation & Refund Standards",
      enabled: true,
      headline: "Cooling-Off Rights & Payment Adjustments",
      subheadline:
        "Committed to fair, transparent consumer protections in line with UK distance selling legislation.",
      columns: 2,
      items: [
        {
          title: "1. 7-Day Statutory Cooling-Off Period",
          desc: "Under the Consumer Contracts Regulations 2013 and college policy, distance learners have 7 calendar days from initial payment to cancel their enrolment, provided live induction and classes have not commenced.",
          tag: "Cooling-Off",
        },
        {
          title: "2. Notification to Finance",
          desc: "To exercise your cancellation right, submit written notice directly to finance@smartminds.co.uk stating your full legal name, student reference, and course title.",
          tag: "Procedure",
        },
        {
          title: "3. Non-Refundable Deposit Once Classes Commence",
          desc: "Once your scheduled induction or first live lesson takes place, the initial deposit is strictly non-refundable due to immediate external awarding body registration fees and dedicated tutor allocations.",
          tag: "Commitment",
        },
        {
          title: "4. Post-Commencement Mitigating Circumstances",
          desc: "After course commencement, fee refunds are not granted, but learners facing severe unexpected hardships may apply to pause studies and join a future intake without penalty.",
          tag: "Mitigating",
        },
        {
          title: "5. Flexible Payment Plan Adjustments",
          desc: "Learners on instalment agreements who experience temporary financial changes can request a restructured payment timetable directly with the finance office.",
          tag: "Support",
        },
      ],
    },
    {
      id: "sec-refunds-cta",
      type: "cta_banner",
      name: "Accounts Consultation",
      enabled: true,
      headline: "Need Advice Regarding Your Tuition Account?",
      subheadline:
        "Our finance and registry team is available to assist with confidential, fair payment solutions.",
      buttonText: "Contact Student Accounts",
      buttonLink: "/contact",
    },
  ],
  "/safeguarding-student-welfare": [
    {
      id: "sec-safeguarding-hero",
      type: "hero",
      name: "Safeguarding Hero",
      enabled: true,
      badgeText: "Student Safety & Duty of Care",
      headline: "Safeguarding & Student Welfare Policy",
      subheadline:
        "Smartminds Training College is dedicated to maintaining an uncompromising standard of student welfare, mental health support, and online classroom safety.",
      buttonText: "Read Safeguarding Policy",
      buttonLink: "#sec-safeguarding-clauses",
      secondaryButtonText: "Confidential Welfare Contact",
      secondaryButtonLink: "/contact",
      image: "/images/adult-care-training.jpg",
    },
    {
      id: "sec-safeguarding-clauses",
      type: "why_smartminds",
      name: "Core Safeguarding Standards",
      enabled: true,
      headline: "Our Welfare Framework & Preventative Safeguards",
      subheadline:
        "Every adult learner, young person, and faculty member is protected by robust institutional safeguarding measures.",
      columns: 2,
      items: [
        {
          title: "1. Institutional Duty of Care",
          desc: "We foster an inclusive, supportive learning environment free from harassment, discrimination, or exploitation across all live seminars, online forums, and 1-to-1 assessor meetings.",
          tag: "Duty of Care",
        },
        {
          title: "2. Enhanced DBS & Vetting Procedures",
          desc: "Every tutor, assessor, and private instructor undergoes Enhanced Disclosure and Barring Service (DBS) vetting, identity verification, and professional reference checks prior to teaching.",
          tag: "DBS Checked",
        },
        {
          title: "3. Digital Classroom Safety Protocols",
          desc: "Live Zoom webinars are monitored for quality assurance and recorded to protect learners. Assessor sessions follow strict one-to-one digital safeguarding guidelines.",
          tag: "Digital Safety",
        },
        {
          title: "4. Designated Safeguarding Lead (DSL)",
          desc: "The college maintains an active Designated Safeguarding Lead responsible for receiving confidential concerns, liaising with statutory bodies, and updating annual policies.",
          tag: "DSL Appointed",
        },
        {
          title: "5. Mental Health & Wellbeing Support",
          desc: "We understand balancing study with care and education roles can be demanding. Our welfare advisors provide confidential guidance and signposting to support resources.",
          tag: "Wellbeing",
        },
        {
          title: "6. Confidential Reporting Channel",
          desc: "Any learner, parent, or staff member who experiences or witnesses a safeguarding concern can report it confidentially to safeguarding@smartmindstraining.co.uk.",
          tag: "Reporting",
        },
      ],
    },
    {
      id: "sec-safeguarding-cta",
      type: "cta_banner",
      name: "Confidential Safeguarding Lead",
      enabled: true,
      headline: "Speak with Our Safeguarding & Welfare Lead",
      subheadline:
        "If you have a safeguarding query or need personal welfare guidance, contact our designated officer in complete confidence.",
      buttonText: "Contact Safeguarding Lead",
      buttonLink: "/contact",
    },
  ],
};


