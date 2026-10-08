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
} from "./types";

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
  // Owner Admin (College Principal & Data Controller)
  {
    id: "user-owner-01",
    email: "kemi.adeleke@smartmindstraining.co.uk",
    name: "Kemi Adeleke",
    role: "owner_admin",
    active: true,
    createdAt: "2026-09-01T08:30:00Z",
  },
  // Administrative Staff (Office Team - No Financial Access)
  {
    id: "user-admin-01",
    email: "sarah.jenkins@smartmindstraining.co.uk",
    name: "Sarah Jenkins",
    role: "admin_staff",
    active: true,
    createdAt: "2026-09-05T09:00:00Z",
  },
  {
    id: "user-admin-02",
    email: "brian.miller@smartmindstraining.co.uk",
    name: "Brian Miller",
    role: "admin_staff",
    active: true,
    createdAt: "2026-09-05T09:15:00Z",
  },
  {
    id: "user-admin-03",
    email: "fatima.almansoor@smartmindstraining.co.uk",
    name: "Fatima Al-Mansoor",
    role: "admin_staff",
    active: true,
    createdAt: "2026-09-05T09:30:00Z",
  },
  // 5 Tutors (Teaching Staff)
  {
    id: "user-tutor-01",
    email: "eleanor.vance@smartmindstraining.co.uk",
    name: "Dr. Eleanor Vance",
    role: "tutor",
    tutorId: "tutor-001",
    active: true,
    createdAt: "2026-09-08T10:00:00Z",
  },
  {
    id: "user-tutor-02",
    email: "marcus.sterling@smartmindstraining.co.uk",
    name: "Marcus Sterling",
    role: "tutor",
    tutorId: "tutor-002",
    active: true,
    createdAt: "2026-09-08T10:30:00Z",
  },
  {
    id: "user-tutor-03",
    email: "amara.patel@smartmindstraining.co.uk",
    name: "Amara Patel",
    role: "tutor",
    tutorId: "tutor-003",
    active: true,
    createdAt: "2026-09-08T11:00:00Z",
  },
  {
    id: "user-tutor-04",
    email: "david.kalu@smartmindstraining.co.uk",
    name: "David Kalu",
    role: "tutor",
    tutorId: "tutor-004",
    active: true,
    createdAt: "2026-09-08T11:30:00Z",
  },
  {
    id: "user-tutor-05",
    email: "chloe.davies@smartmindstraining.co.uk",
    name: "Chloe Davies",
    role: "tutor",
    tutorId: "tutor-005",
    active: true,
    createdAt: "2026-09-08T12:00:00Z",
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

export const seedLearners: Learner[] = learnerNames.map((person, index) => {
  const num = (index + 1).toString().padStart(3, "0");
  const emailName = `${person.first.toLowerCase()}.${person.last.toLowerCase().replace(/['\s]/g, "")}`;
  return {
    id: `learner-${num}`,
    userId: `user-learner-${num}`,
    firstName: person.first,
    lastName: person.last,
    email: `${emailName}@example.com`,
    phone: `+44 7700 900${num}`,
    enrolmentDate: "2026-09-15T09:00:00Z",
    accessStatus: person.status === "paused" ? "paused" : "active",
    notes: person.status === "paused" ? "Access paused: payment review pending." : "Good academic engagement.",
  };
});

// Also append student user profiles for all 24 learners
seedLearners.forEach((l) => {
  seedUsers.push({
    id: l.userId,
    email: l.email,
    name: `${l.firstName} ${l.lastName}`,
    role: "student",
    learnerId: l.id,
    active: l.accessStatus === "active",
    createdAt: l.enrolmentDate,
  });
});

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
    courseId: "course-leadership-care",
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

export const seedPaymentRecords: PaymentRecord[] = [
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
    notes: "Paid in full via BACS transfer (verified by Kemi)",
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
];

export const seedPaymentSchedules: PaymentScheduleItem[] = [
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
];

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

export const seedSubmissions: Submission[] = [
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
];

// ============================================================================
// 7. Tasks Assigned by Owner
// ============================================================================

export const seedTasks: Task[] = [
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
];

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

export const seedBookings: Booking[] = [
  {
    id: "book-001",
    fullName: "Claire Jenkins",
    email: "claire.jenkins@example.com",
    phone: "+44 7911 123456",
    courseInterest: "Diploma in Adult Care (Level 3)",
    scheduledAt: "2026-10-09T14:00:00Z",
    status: "confirmed",
    timeZone: "Europe/London",
    notes: "Wants to know if workplace funding is available.",
    createdAt: "2026-10-05T10:00:00Z",
  },
  {
    id: "book-002",
    fullName: "Adebayo Ogun",
    email: "adebayo.ogun@example.com",
    phone: "+44 7922 654321",
    courseInterest: "Leadership in Adult Care (Level 5)",
    scheduledAt: "2026-10-10T11:00:00Z",
    status: "confirmed",
    timeZone: "Europe/London",
    notes: "Deputy manager preparing for registered manager promotion.",
    createdAt: "2026-10-06T14:30:00Z",
  },
];

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

export const seedAuditLog: AuditLogEntry[] = [
  {
    id: "audit-001",
    actorUserId: "user-super-01",
    actorEmail: "super.admin@smartmindstraining.co.uk",
    actorRole: "super_admin",
    action: "SEED_INIT",
    details: "Demo prototype initialized with initial sample dataset and entitlements",
    timestamp: "2026-09-01T00:00:00Z",
  },
];

export const seedFeedback: FeedbackItem[] = [];
