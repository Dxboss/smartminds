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
    notes:
      person.status === "paused"
        ? "Access paused: payment review pending."
        : "Good academic engagement.",
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
    notes: "Paid in full via BACS transfer (verified by Millie)",
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
    notes: "Interested in online delivery schedule.",
    createdAt: "2026-10-07T09:00:00Z",
    assignedStaffId: "user-admin-01",
    assignedStaffName: "Sarah Jenkins",
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

export const seedAuditLog: AuditLogEntry[] = [];

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

export const demoOutbox: OutboxMessage[] = [];

export const seedEnquiries: EnquiryLead[] = [
  {
    id: "enq-001",
    fullName: "Eleanor Wright",
    email: "eleanor.w@example.com",
    phone: "+44 7700 900111",
    courseInterest: "Diploma in Adult Care (Level 3)",
    formType: "funding_check",
    stage: "new",
    notes: "Applied via workplace funding eligibility form. Employed as senior care assistant.",
    employmentStatus: "Employed 30+ hrs/wk",
    workplaceLocation: "Birmingham",
    submittedAt: "2026-10-06T11:20:00Z",
  },
  {
    id: "enq-002",
    fullName: "Kofi Mensah",
    email: "kofi.mensah@example.com",
    phone: "+44 7700 900222",
    courseInterest: "Leadership in Adult Care (Level 5)",
    formType: "free_advice",
    stage: "contacted",
    notes: "Called 07 Oct. Looking for CQC registered manager progression. Follow-up booked for next Tuesday.",
    employmentStatus: "Deputy Manager",
    workplaceLocation: "London",
    submittedAt: "2026-10-05T09:15:00Z",
  },
  {
    id: "enq-003",
    fullName: "Sophie Green",
    email: "sophie.green@example.com",
    phone: "+44 7700 900333",
    courseInterest: "Early Years Educator (Level 3)",
    formType: "funding_check",
    stage: "new",
    notes: "Nursery assistant checking apprenticeship / funded placement eligibility.",
    employmentStatus: "Early Years Assistant",
    workplaceLocation: "Manchester",
    submittedAt: "2026-10-07T14:40:00Z",
  },
  {
    id: "enq-004",
    fullName: "Tariq Al-Mansoor",
    email: "tariq.m@example.com",
    phone: "+44 7700 900444",
    courseInterest: "Mental Health Awareness (CPD)",
    formType: "contact",
    stage: "contacted",
    notes: "Enquired about team group rates for 12 care home staff members.",
    submittedAt: "2026-10-04T16:00:00Z",
  },
  {
    id: "enq-005",
    fullName: "Rachel Davies",
    email: "rachel.d@example.com",
    phone: "+44 7700 900555",
    courseInterest: "Diploma in Adult Care (Level 3)",
    formType: "free_advice",
    stage: "enrolled",
    notes: "Completed onboarding call, accepted place on Autumn 2026 Cohort.",
    submittedAt: "2026-10-03T11:00:00Z",
  },
];

export const seedMessageLogs: MessageLogEntry[] = [];

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
  | "composite_block"
  | "student_benefits"
  | "staff_training"
  | "coral_promo"
  | "exclusive_bundles"
  | "courses_listing"
  | "page_header"
  | "about_story"
  | "accreditations_block"
  | "team_grid"
  | "legal_notice"
  | "contact_split"
  | "funding_split"
  | "cpd_listing"
  | "tutoring_split"
  | "scheduler_block";

export type CompositeWidgetType =
  | "text"
  | "icon_box"
  | "image"
  | "cta_button"
  | "lead_form"
  | "video_player"
  | "divider"
  | "stats_metric"
  | "quote_card"
  | "badge_strip"
  | "checklist";

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
  statNumber?: string;
  statLabel?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  rating?: number;
  checklistItems?: string[];
  badgeList?: string[];
  formFields?: {
    showName?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showCourse?: boolean;
    showNotes?: boolean;
    buttonLabel?: string;
  };
  fontFamily?: "heading" | "body" | "serif";
  fontSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  fontStyle?: "normal" | "italic";
  textColor?: "auto" | "navy" | "white" | "gold" | "ink_soft" | (string & {});
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonFontFamily?: "heading" | "body";
  buttonFontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  buttonTextTransform?: "normal" | "uppercase";
  buttonIcon?: string;
  buttonIconPosition?: "left" | "right";
  buttonRadius?: "none" | "sm" | "md" | "full";
  buttonSize?: "sm" | "md" | "lg";
  secondaryButtonBgColor?: string;
  secondaryButtonTextColor?: string;
  secondaryButtonFontFamily?: "heading" | "body";
  secondaryButtonFontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  secondaryButtonTextTransform?: "normal" | "uppercase";
  secondaryButtonIcon?: string;
  secondaryButtonIconPosition?: "left" | "right";
  secondaryButtonRadius?: "none" | "sm" | "md" | "full";
  secondaryButtonSize?: "sm" | "md" | "lg";
}

export interface CompositeColumn {
  id: string;
  widgets: CompositeWidget[];
}

export interface BuilderTagItem {
  id?: string;
  label: string;
  variant?: "live" | "navy" | "gold" | "default";
}

export interface BuilderSectionItem {
  id?: string;
  title: string;
  desc?: string;
  icon?: string;
  tag?: string;
  rating?: number;
  link?: string;
  image?: string;
  badge?: string;
  subtitle?: string;
  bullets?: string[];
  number?: string;
  price?: string;
  originalPrice?: string;
  monthly?: string;
  saveAmount?: string;
  cardBg?: "white" | "paper" | "navy" | "gold_subtle" | "transparent" | "mint" | "peach" | "lavender" | "sky" | (string & {});
  cardBorder?: "line" | "gold" | "navy" | "none";
  cardRadius?: "sm" | "xl" | "none";
  cardPadding?: "compact" | "normal" | "spacious";
  titleColor?: "auto" | "navy" | "gold" | "white" | "ink_soft" | (string & {});
  titleSize?: "sm" | "md" | "lg" | "xl";
  titleWeight?: "normal" | "medium" | "semibold" | "bold";
  descColor?: "auto" | "navy" | "ink_soft" | "white" | "gold" | (string & {});
  iconColor?: string;
  textAlign?: "left" | "center" | "right";
  badgeVariant?: "live" | "navy" | "gold" | "default";
}

export interface BuilderSection {
  id: string;
  type: BuilderSectionType;
  name: string;
  enabled: boolean;
  headline: string;
  subheadline: string;
  eyebrow?: string;
  badgeText?: string;
  badgeVariant?: "live" | "navy" | "gold" | "default";
  badgeColor?: string;
  badgeBgColor?: string;
  badgeFontFamily?: "heading" | "body" | "serif";
  badgeFontSize?: string;
  badgeIcon?: string;
  badgeWeight?: "normal" | "medium" | "semibold" | "bold";
  trustNoteColor?: string;
  trustNoteFontFamily?: "heading" | "body" | "serif";
  trustNoteFontSize?: string;
  headlineAlign?: "left" | "center" | "right";
  headlineTransform?: "normal" | "uppercase";
  subheadlineAlign?: "left" | "center" | "right";
  tags?: BuilderTagItem[];
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image?: string;
  image2?: string;
  image3?: string;
  trustNote?: string;
  trustNoteIcon?: string;
  bgColor?: "white" | "paper" | "navy" | "cream" | "slate" | "sage" | "sand" | "mint" | "navy_gradient" | (string & {});
  align?: "left" | "center";
  alignMobile?: "left" | "center";
  mediaPosition?: "left" | "right";
  columns?: 1 | 2 | 3 | 4;
  rows?: 1 | 2 | 3 | 4 | "all";
  courseLimit?: number;
  courseCategoryFilter?: string;
  columnRatio?: "50-50" | "60-40" | "70-30" | "40-60" | "33-67";
  paddingDensity?: "compact" | "normal" | "spacious";
  paddingDensityMobile?: "compact" | "normal" | "spacious";
  videoUrl?: string;
  videoThumbnail?: string;
  videoTitle?: string;
  videoDesc?: string;
  videoTag?: string;
  videoTagColor?: string;
  videoTagBgColor?: string;
  videoBadge?: string;
  videoBadgeColor?: string;
  videoTitleColor?: string;
  videoTitleFontFamily?: "heading" | "body" | "serif";
  videoTitleFontSize?: "sm" | "md" | "lg" | "xl";
  videoTitleFontWeight?: "normal" | "medium" | "semibold" | "bold";
  videoDescColor?: string;
  videoDescFontSize?: string;
  items?: BuilderSectionItem[];
  compositeColumns?: CompositeColumn[];
  templateCategory?: string;
  templateDesc?: string;
  headlineFontFamily?: "heading" | "body" | "serif";
  headlineFontSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  headlineFontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  headlineFontStyle?: "normal" | "italic";
  headlineColor?: "auto" | "navy" | "white" | "gold" | "ink_soft" | (string & {});
  subheadlineFontFamily?: "heading" | "body" | "serif";
  subheadlineFontSize?: "sm" | "md" | "lg" | "xl";
  subheadlineFontWeight?: "normal" | "medium" | "semibold" | "bold";
  subheadlineFontStyle?: "normal" | "italic";
  subheadlineColor?: "auto" | "navy" | "white" | "gold" | "ink_soft" | (string & {});
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonHoverBgColor?: string;
  buttonHoverTextColor?: string;
  buttonFontFamily?: "heading" | "body";
  buttonFontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  buttonTextTransform?: "normal" | "uppercase";
  buttonIcon?: string;
  buttonIconPosition?: "left" | "right";
  buttonRadius?: "none" | "sm" | "md" | "full";
  buttonSize?: "sm" | "md" | "lg";
  buttonEnabled?: boolean;
  secondaryButtonBgColor?: string;
  secondaryButtonTextColor?: string;
  secondaryButtonHoverBgColor?: string;
  secondaryButtonHoverTextColor?: string;
  secondaryButtonFontFamily?: "heading" | "body";
  secondaryButtonFontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  secondaryButtonTextTransform?: "normal" | "uppercase";
  secondaryButtonIcon?: string;
  secondaryButtonIconPosition?: "left" | "right";
  secondaryButtonRadius?: "none" | "sm" | "md" | "full";
  secondaryButtonSize?: "sm" | "md" | "lg";
  floatingBadgeTitle?: string;
  floatingBadgeSubtitle?: string;
  floatingBadgeIcon?: string;
  floatingBadgeEnabled?: boolean;
  calloutHeadline?: string;
  calloutText?: string;
  calloutBadge?: string;
  calloutIcon?: string;
  calloutBgColor?: string;
  calloutTextColor?: string;
  showCallout?: boolean;
  sealText?: string;
  sealLink?: string;
  sealVideoUrl?: string;
  sealBgColor?: string;
  sealTextColor?: string;
  sealPlayColor?: string;
  sealFontSize?: string;
  sealEnabled?: boolean;
  metricsBannerTitle?: string;
  metricsBannerSubtitle?: string;
  metricsBannerIcon?: string;
  // Hero Social Proof & Rating
  socialProofEnabled?: boolean;
  avatar1Text?: string;
  avatar1Bg?: string;
  avatar1Color?: string;
  avatar2Text?: string;
  avatar2Bg?: string;
  avatar2Color?: string;
  avatar3Text?: string;
  avatar3Bg?: string;
  avatar3Color?: string;
  socialProofRating?: string;
  socialProofRatingColor?: string;
  socialProofStars?: number;
  socialProofStarColor?: string;
  socialProofText?: string;
  socialProofTextColor?: string;
  // Hero Reassurance Perk
  reassuranceEnabled?: boolean;
  reassuranceText?: string;
  reassuranceIcon?: string;
  reassuranceTextColor?: string;
  reassuranceIconColor?: string;
}

export const defaultPageBuilderSections: BuilderSection[] = [
  {
    id: "sec-hero-01",
    type: "hero",
    name: "Hero Banner",
    enabled: true,
    bgColor: "#13416B",
    headlineColor: "#FFFFFF",
    badgeText: "Ofqual Regulated Courses",
    tags: [],
    headline: "Bringing Live Classes to your Doorstep.",
    subheadline:
      "Experts in Career Building, Career Switching, or Career Upgrade. We help you find the Right Course, at the Right Level in tune with your Dream.",
    buttonText: "Get free advice",
    buttonLink: "/book",
    buttonIcon: "phone",
    secondaryButtonText: "View all courses",
    secondaryButtonLink: "/courses",
    secondaryButtonIcon: "arrow-right",
    secondaryButtonIconPosition: "right",
    image: "/images/hero-learner-live.webp",
    floatingBadgeTitle: "Weekly Live Classes",
    floatingBadgeSubtitle: "Recordings available 24/7 for Revision",
    floatingBadgeIcon: "star",
    floatingBadgeEnabled: true,
    sealBgColor: "#074C4E",
    sealPlayColor: "#FF5722",
    sealTextColor: "#ffffff",
    socialProofRatingColor: "mint",
    socialProofTextColor: "white",
    reassuranceTextColor: "white",
    reassuranceIconColor: "white",
  },
  {
    id: "sec-trust-02",
    type: "trust_strip",
    name: "Accreditation & Trust Strip",
    enabled: true,
    bgColor: "navy",
    headline: "OFFICIAL AWARDING & REGULATED BODIES",
    subheadline: "Rated 4.9/5 by 300+ UK Healthcare & Education Professionals",
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
    bgColor: "white",
    headline: "Specialist Career Pathways",
    subheadline: "Select your sector to discover regulated qualifications and salary outcomes.",
    buttonText: "View All Categories",
    buttonLink: "/courses",
    items: [
      {
        title: "Work in Adult Care",
        subtitle: "Care Assistant to Registered Manager",
        desc: "Ofqual-regulated Level 2 to Level 5 diplomas preparing you for direct care, supervisory, and CQC registered management roles.",
        icon: "shield-check",
        badge: "Levels 2 – 5",
        link: "/courses?category=Health+%26+Social+Care",
      },
      {
        title: "Teach & Train Adults",
        subtitle: "College Lecturer or Corporate Trainer",
        desc: "Qualify to teach in further education colleges and training organisations with the Level 3 Award in Education & Training (AET).",
        icon: "graduation-cap",
        badge: "Level 3",
        link: "/courses/award-in-education-and-training-aet",
      },
      {
        title: "Business & Office Administration",
        subtitle: "Administrative Officer to Office Manager",
        desc: "Master organisational workflows, commercial communication, and executive administration with regulated Level 2 & 3 diplomas.",
        icon: "book-open",
        badge: "Levels 2 – 3",
        link: "/courses/diploma-in-business-administration",
      },
      {
        title: "Early Years & Nursery Practice",
        subtitle: "Early Years Educator / Nursery Practitioner",
        desc: "Full licence-to-practise qualification enabling you to work in pre-schools, nurseries, and reception classes across the UK.",
        icon: "user",
        badge: "Level 3 EYE",
        link: "/courses/diploma-early-years-educator",
      },
      {
        title: "CPD for Your Current Job",
        subtitle: "Mandatory Healthcare & Compliance Refreshers",
        desc: "Fast 1-day accredited certificates in Safeguarding, Medication Administration, and Equality & Diversity to keep your records compliant.",
        icon: "clock",
        badge: "Certificates",
        link: "/cpd",
      },
      {
        title: "1-on-1 Tutoring for Your Child",
        subtitle: "KS3 & GCSE Academic Grade Boost",
        desc: "Dedicated weekly sessions in English and Mathematics delivered by verified DBS-checked educators to build confidence and exam technique.",
        icon: "star",
        badge: "KS3 & GCSE",
        link: "/private-tutoring",
      },
    ],
  },
  {
    id: "sec-why-choose-us",
    type: "why_smartminds",
    name: "Why Choose Us (Innovative Learning)",
    enabled: false,
    badgeText: "WHY CHOOSE US?",
    headline: "Innovative and effective learning approaches",
    subheadline:
      "Educate the ultimate destination for knowledge seekers and educators alike. We are committed to transforming special education impact global channels without standards compliant systems",
    trustNote: "24/7 Hrs Ready to our support team",
    trustNoteIcon: "asterisk",
    buttonText: "GET STARTED",
    buttonLink: "/courses",
    buttonBgColor: "emerald",
    bgColor: "mint",
    image: "/images/hero-learner.jpg",
    image2: "/images/tutor-sarah.jpg",
    image3: "/images/classroom.jpg",
    floatingBadgeTitle: "26+",
    floatingBadgeSubtitle: "Years of Experiences",
    floatingBadgeIcon: "star",
    floatingBadgeEnabled: true,
    items: [
      {
        title: "Course Management",
        desc: "",
        icon: "check-circle",
        cardBg: "mint",
        iconColor: "emerald",
      },
      {
        title: "Students Progress Tracking",
        desc: "",
        icon: "check-circle",
        cardBg: "peach",
        iconColor: "amber",
      },
      {
        title: "Interactive Live Class",
        desc: "",
        icon: "check-circle",
        cardBg: "lavender",
        iconColor: "purple",
      },
      {
        title: "Quiz and Assignments",
        desc: "",
        icon: "check-circle",
        cardBg: "sky",
        iconColor: "cyan",
      },
    ],
  },
  {
    id: "sec-journey-04",
    type: "how_it_works",
    name: "How It Works 4-Step Journey",
    enabled: true,
    bgColor: "white",
    headline: "Your 4-Step Pathway to Awarding Body Certification",
    subheadline:
      "From initial induction to receiving your official certificate, your assessor guides you through workplace evidence with zero exam pressure.",
    items: [
      {
        number: "01",
        title: "Talk to us",
        subtitle: "Free, zero-pressure advice call",
        desc: "Speak directly with an academic adviser. We review your career objectives, prior experience, and confirm whether you are eligible for government funding or self-paced instalments.",
        badge: "15-minute call",
      },
      {
        number: "02",
        title: "Choose course & plan",
        subtitle: "Transparent pricing with no hidden fees",
        desc: "Select your qualification level. Pay in full to save with an upfront discount, or spread the exact full price over monthly instalments at no extra charge.",
        badge: "Flexible payment",
      },
      {
        number: "03",
        title: "Join live classes",
        subtitle: "Interactive teaching with real tutors",
        desc: "Participate in structured evening webinars with experienced UK practitioners. Ask questions in real time, participate in discussions, and receive individual tutor guidance.",
        badge: "Live + recordings",
      },
      {
        number: "04",
        title: "Get certified",
        subtitle: "Ofqual-regulated British diploma",
        desc: "Submit coursework units with step-by-step marker feedback. Earn your accredited qualification from recognised awarding bodies (TQUK / CPD) to unlock new career opportunities.",
        badge: "Official diploma",
      },
    ],
  },
  {
    id: "sec-pricing-05",
    type: "pricing",
    name: "0% Interest Tuition Flexibility",
    enabled: true,
    bgColor: "navy",
    badgeText: "Honest, Transparent Pricing",
    trustNote: "Smartminds instalment plans are direct payment schedules between the learner and the college. No credit checks, no loan agreements, and no third-party lenders.",
    headline: "Transparent Tuition with Institutional Guarantees",
    subheadline:
      "Spread fees over 12 months with 0% interest, or pay in full and save. Awarding body registration and certificate fees are always included.",
    items: [
      {
        number: "Option 01",
        title: "Pay in full",
        subtitle: "Save 10% on your total course fee",
        desc: "Pay your tuition upfront in a single secure payment and receive an instant 10% discount across any regulated or CPD diploma.",
        badge: "Best Value",
        bullets: [
          "Instant 10% reduction applied to course total",
          "Immediate enrolment and access to course materials",
          "Includes free official textbook and all assessment registration fees",
        ],
        link: "/courses",
      },
      {
        number: "Option 02",
        title: "Monthly instalments",
        subtitle: "0% interest, spread over 3–12 months",
        desc: "Spread your course fees equally across monthly payments with zero APR, zero hidden admin charges, and direct college agreement.",
        badge: "Most Popular",
        bullets: [
          "Fixed, predictable monthly instalments aligned with your pay date",
          "Low initial deposit from just £100",
          "Direct college arrangement with no third-party lender involvement",
        ],
        link: "/courses",
      },
      {
        number: "Option 03",
        title: "Government funding",
        subtitle: "Check eligibility for fully-funded places",
        desc: "Depending on your UK location, employment status, and prior qualifications, your training may be 100% funded through official grant schemes.",
        badge: "Grant Funded",
        bullets: [
          "Available through AEB and Free Courses for Jobs",
          "Zero tuition fees for eligible candidates",
          "Admissions team checks eligibility during your free consultation",
        ],
        link: "/funding",
      },
    ],
  },
  {
    id: "sec-courses-06",
    type: "featured_courses",
    name: "Featured Qualifications Grid",
    enabled: true,
    bgColor: "paper",
    headline: "Explore Regulated Qualifications & Diplomas",
    subheadline:
      "Ofqual regulated RQF diplomas with transparent fees and 0% interest monthly instalment options. Every programme includes your dedicated personal assessor.",
    buttonText: "View all courses",
    buttonLink: "/courses",
    columns: 4,
    rows: 2,
  },
  {
    id: "sec-testimonials-07",
    type: "testimonials",
    name: "Student Reviews & Outcomes",
    enabled: true,
    bgColor: "paper",
    badgeText: "Learner Experiences",
    headline: "Taught & Mentored by Senior Qualified Assessors",
    subheadline:
      "Our tutors are active CQC Registered Managers and Early Years inspectors dedicated to mentoring working adults with empathy, not bureaucracy.",
    videoTag: "Spotlight Video",
    videoBadge: "Student Stories",
    videoTitle: "Watch learners share their qualification journey",
    videoDesc:
      "Real feedback recorded by our graduates sharing their study experience, tutor support, and career progression.",
    videoUrl: "",
    videoThumbnail: "/images/certificate-moment.jpg",
    items: [
      {
        title: "Sarah M.",
        subtitle: "Level 5 Diploma in Leadership & Management for Adult Care",
        desc: "The evening classes made studying manageable while working full-time as a deputy manager. My tutor, Dr. Vance, gave detailed feedback on every unit. I passed with confidence and was promoted to Registered Manager within two months.",
        image: "/images/hero-learner.jpg",
        rating: 5,
      },
      {
        title: "David K.",
        subtitle: "Level 3 Award in Education and Training (AET)",
        desc: "I needed the AET to start teaching clinical skills at a local college. The live micro-teach session on Zoom was brilliant — supportive, practical, and constructive. Excellent tutor guidance from start to finish.",
        image: "/images/tutor-teaching.jpg",
        rating: 5,
      },
      {
        title: "Amara O.",
        subtitle: "Level 3 Diploma for the Early Years Educator",
        desc: "Spreading the course fees over 10 months with 0% interest made this possible for me. The learning resources and observation guidance were crystal clear. I am now fully qualified and leading a nursery room.",
        image: "/images/early-years-training.jpg",
        rating: 5,
      },
    ],
  },
  {
    id: "sec-faqs-08",
    type: "faq_accordion",
    name: "Frequently Asked Questions",
    enabled: true,
    bgColor: "white",
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
    bgColor: "navy",
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

export interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
  badge?: string;
  active: boolean;
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
  announcements?: AnnouncementItem[];
  supportPhone: string;
  whatsappNumber: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  ctaButtonBgColor?: string;
  ctaButtonTextColor?: string;
  ctaButtonFontFamily?: "heading" | "body";
  ctaButtonFontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  ctaButtonTextTransform?: "normal" | "uppercase";
  ctaButtonIcon?: string;
  ctaButtonIconPosition?: "left" | "right";
  ctaButtonRadius?: "none" | "sm" | "md" | "full";
  ctaButtonSize?: "sm" | "md" | "lg";
  headerBgColor?: string;
  headerTextColor?: string;
  headerActiveLinkColor?: string;
  headerFontFamily?: "heading" | "body";
  announcementBgColor?: string;
  announcementTextColor?: string;
  navLinks: NavLinkItem[];
}

export const defaultAnnouncements: AnnouncementItem[] = [
  {
    id: "ann-1",
    text: "Autumn & Winter 2026 Cohorts Enrolling Now — Spread Fees over 12 Months with 0% Interest",
    link: "/funding",
    badge: "0% FINANCE",
    active: true,
  },
  {
    id: "ann-2",
    text: "100% Coursework & Portfolio Assessed — No Written Exams for NVQ Diplomas",
    link: "/courses",
    badge: "ACCREDITED",
    active: true,
  },
  {
    id: "ann-3",
    text: "Book a Free 1-to-1 Course Advisory Call with a Vocational Assessor",
    link: "/contact",
    badge: "FREE ADVICE",
    active: true,
  },
];

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
  announcements: defaultAnnouncements,
  supportPhone: "01452 225 225",
  whatsappNumber: "07932 034 548",
  ctaButtonText: "Get free advice",
  ctaButtonLink: "/book",
  headerBgColor: "",
  headerTextColor: "",
  headerActiveLinkColor: "",
  headerFontFamily: "body",
  announcementBgColor: "#D9B84A",
  announcementTextColor: "#FFFFFF",
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
    { id: "nav-blog", label: "Guides", href: "/blog" },
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

export interface AccreditationBadgeItemConfig {
  id?: string;
  title: string;
  desc?: string;
  icon?: string;
  tag?: string;
  image?: string;
  link?: string;
}

export interface FooterConfig {
  logoType?: "vector" | "crest" | "image";
  logoImageUrl?: string;
  logoHeight?: number;
  siteName?: string;
  tagline?: string;
  bioText: string;
  badge1: string;
  badge2: string;

  // Newsletter Section
  showNewsletter?: boolean;
  newsletterEyebrow?: string;
  newsletterEyebrowColor?: string;
  newsletterInputBgColor?: string;
  newsletterInputTextColor?: string;
  newsletterInputBorderColor?: string;
  newsletterHeadline?: string;
  newsletterSubtext?: string;
  newsletterButtonText?: string;
  newsletterBgColor?: string;
  newsletterTextColor?: string;
  newsletterButtonBgColor?: string;
  newsletterButtonTextColor?: string;

  // Columns & Headings
  showExploreColumn?: boolean;
  exploreColumnTitle?: string;
  showCollegeColumn?: boolean;
  collegeColumnTitle?: string;
  showContactColumn?: boolean;
  contactColumnTitle?: string;
  columnTitleColor?: string;
  columnTitleFontFamily?: "heading" | "body";
  columnTitleFontSize?: "sm" | "md" | "lg" | "xl";
  columnTitleFontWeight?: "normal" | "semibold" | "bold" | "extrabold";
  columnTitleTextTransform?: "none" | "uppercase" | "capitalize";

  // Links Typography & Colors
  linkColor?: string;
  linkHoverColor?: string;
  linkFontSize?: "xs" | "sm" | "md";

  exploreLinks: { id: string; label: string; href: string }[];
  collegeLinks: { id: string; label: string; href: string }[];

  // Contact items & toggles
  showPhone?: boolean;
  showEmail?: boolean;
  showWhatsapp?: boolean;
  showOpeningHours?: boolean;
  phone: string;
  email: string;
  whatsappNumber: string;
  openingHours: string;
  headOfficeAddress: string;

  // Accreditations
  showAccreditations?: boolean;
  accreditationHeadline: string;
  accreditationSubtext: string;
  accreditations?: AccreditationBadgeItemConfig[];
  accreditationBgStyle?: "transparent" | "white" | "subtle" | "dark";
  accreditationBgColor?: string;
  accreditationTextColor?: string;
  accreditationBadgeStyle?: "solid-white" | "flat" | "pill";
  accreditationLayout?: "row" | "stacked";

  // Footer Theme & Background
  footerTheme?: "light" | "dark";
  footerBgColor?: string;
  legalLine: string;
  copyrightText: string;
  legalLineTextColor?: string;
  copyrightTextColor?: string;
}

export const DEFAULT_ACCREDITATION_BADGES: AccreditationBadgeItemConfig[] = [
  { id: "acc-1", title: "ofqual", desc: "Regulated", icon: "ofqual" },
  { id: "acc-2", title: "TQUK", desc: "Approved Centre", icon: "tquk" },
  { id: "acc-3", title: "THE CPD GROUP", desc: "Accredited Provider", icon: "cpd" },
  { id: "acc-4", title: "Skills for Health", desc: "NOS Aligned", icon: "health" },
  { id: "acc-5", title: "UKRLP", desc: "Registered Provider", icon: "ukrlp" },
];

export const defaultFooterConfig: FooterConfig = {
  logoType: "crest",
  logoImageUrl: "/images/logo-color.png",
  logoHeight: 44,
  siteName: "Smartminds",
  tagline: "Training College",
  bioText:
    "UK professional training provider delivering blended learning and live online distance learning with certified tutors and assessors for Ofqual-regulated qualifications, CPD courses, and private tutoring.",
  badge1: "Live Online Classes",
  badge2: "UK Registered Provider",
  showNewsletter: true,
  newsletterEyebrow: "Stay Ahead in Your Career",
  newsletterHeadline: "Subscribe to our Newsletter",
  newsletterSubtext:
    "Get the latest qualification updates, exclusive fee discounts, and accredited career resources directly in your inbox.",
  newsletterButtonText: "Subscribe Now",
  showExploreColumn: true,
  exploreColumnTitle: "Explore",
  showCollegeColumn: true,
  collegeColumnTitle: "College",
  showContactColumn: true,
  contactColumnTitle: "Contact",
  columnTitleFontFamily: "heading",
  columnTitleFontWeight: "bold",
  columnTitleTextTransform: "uppercase",
  exploreLinks: [
    { id: "f-1", label: "All Qualifications", href: "/courses" },
    { id: "f-2", label: "CPD Short Courses", href: "/cpd" },
    { id: "f-3", label: "Private Tutoring", href: "/private-tutoring" },
    { id: "f-4", label: "Funded Options", href: "/funding" },
    { id: "f-blog", label: "Career Guides & Advice", href: "/blog" },
  ],
  collegeLinks: [
    { id: "f-5", label: "About Smartminds", href: "/about" },
    { id: "f-6", label: "Contact & Location", href: "/contact" },
    { id: "f-7", label: "Privacy Policy", href: "/privacy" },
    { id: "f-8", label: "Cookie Policy", href: "/cookies" },
    { id: "f-9", label: "Terms & Conditions", href: "/terms" },
    { id: "f-10", label: "Refund Policy", href: "/refunds" },
  ],
  showPhone: true,
  showEmail: true,
  showWhatsapp: true,
  showOpeningHours: true,
  phone: "01452 225 225",
  email: "help@smartmindstraining.co.uk",
  whatsappNumber: "07932 034 548",
  openingHours: "Mon – Thurs: 9:30 AM – 5:30 PM | Fri: Online Sessions",
  headOfficeAddress: "62 High Street, Aveley, South Ockendon, RM15 4BX",
  showAccreditations: true,
  accreditationHeadline: "Accreditations & Awarding Organisations",
  accreditationSubtext:
    "Recognised British qualifications delivered through regulated frameworks.",
  accreditations: [...DEFAULT_ACCREDITATION_BADGES],
  accreditationBgStyle: "transparent",
  accreditationBadgeStyle: "solid-white",
  accreditationLayout: "row",
  footerTheme: "light",
  footerBgColor: "#E8F4F1",
  legalLine:
    "Smartminds Training College is a trading name of Smartminds Empire Ltd, Company No. 13492661",
  copyrightText: "© 2026 Smartminds Training College. All rights reserved.",
};

export const collegePagesData: Record<string, BuilderSection[]> = {
  "/": [...defaultPageBuilderSections],
  "/courses": [
    {
      id: "sec-courses-listing",
      type: "courses_listing",
      name: "Qualifications & Courses Catalogue",
      enabled: true,
      badgeText: "British Regulated Qualifications",
      headline: "British Regulated Qualifications & Diplomas",
      subheadline:
        "Explore Ofqual-regulated frameworks with live tutor seminars, coursework assessments, and 0% interest monthly payment plans.",
    },
  ],
  "/about": [
    {
      id: "sec-about-header",
      type: "page_header",
      name: "About Purpose Header",
      enabled: true,
      badgeText: "Our Purpose & Heritage",
      headline: "About Smartminds Training College",
      subheadline:
        "We provide recognised British vocational qualifications and professional development through interactive live evening classes led by expert tutors — making career advancement accessible, flexible, and supportive for working adults.",
    },
    {
      id: "sec-about-ethos",
      type: "about_story",
      name: "Our Ethos & Story",
      enabled: true,
      badgeText: "Our Ethos",
      headline: "Real Tutors, Not Automated Slide Decks",
      subheadline:
        "Smartminds was founded to solve a major problem in distance learning: isolation. Too many learners enrol in online courses only to receive automated slides and no teacher interaction.\n\nAt Smartminds, our classes are delivered live by experienced UK tutors. You can ask questions, debate real workplace scenarios with classmates, and receive structured mentor guidance throughout your portfolio submission.",
      buttonText: "Browse our qualifications",
      buttonLink: "/courses",
      image: "/images/tutor-teaching.jpg",
    },
    {
      id: "sec-about-why-choose-us",
      type: "why_smartminds",
      name: "Why Choose Us Showcase",
      enabled: true,
      badgeText: "WHY CHOOSE US?",
      headline: "Innovative and effective learning approaches",
      subheadline:
        "The premier destination for healthcare, adult care, and education professionals seeking accredited British qualifications with dedicated mentor support.",
      trustNote: "24/7 Dedicated Support Team",
      trustNoteIcon: "asterisk",
      buttonText: "GET STARTED",
      buttonLink: "/courses",
      buttonBgColor: "emerald",
      bgColor: "mint",
      image: "/images/hero-learner.jpg",
      image2: "/images/tutor-sarah.jpg",
      image3: "/images/classroom.jpg",
      floatingBadgeTitle: "26+",
      floatingBadgeSubtitle: "Years of Combined Experience",
      floatingBadgeIcon: "star",
      floatingBadgeEnabled: true,
      items: [
        {
          title: "Course Management",
          desc: "Structured modules with 100% coursework",
          icon: "check-circle",
          cardBg: "mint",
          iconColor: "emerald",
        },
        {
          title: "Student Progress Tracking",
          desc: "Real-time portfolio grading and assessor feedback",
          icon: "check-circle",
          cardBg: "peach",
          iconColor: "amber",
        },
        {
          title: "Interactive Live Classes",
          desc: "Weekly evening Zoom seminars with expert teachers",
          icon: "check-circle",
          cardBg: "lavender",
          iconColor: "purple",
        },
        {
          title: "Portfolio Assessments",
          desc: "Zero stressful exams, authentic workplace evidence",
          icon: "check-circle",
          cardBg: "sky",
          iconColor: "cyan",
        },
      ],
    },
    {
      id: "sec-about-accreditations",
      type: "accreditations_block",
      name: "Recognised Standards & Accreditations",
      enabled: true,
      badgeText: "Recognised Standards",
      headline: "Accredited by Leading Awarding Organisations",
      subheadline:
        "Our qualifications are recognised across the NHS, private healthcare providers, care homes, and education authorities.",
      items: [
        {
          title: "NCFE CACHE",
          tag: "Northern Council for Further Education",
          desc: "UK regulated awarding body for Health, Social Care, and Early Years qualifications on the Ofqual Register.",
          icon: "shield-check",
        },
        {
          title: "TQUK",
          tag: "Training Qualifications UK",
          desc: "Ofqual-regulated awarding organisation offering modern, flexible vocational qualifications with national recognition.",
          icon: "shield-check",
        },
        {
          title: "The CPD Group",
          tag: "Continuing Professional Development",
          desc: "Accreditation standard for healthcare mandatory training, clinical compliance, and professional refresher certificates.",
          icon: "shield-check",
        },
      ],
    },
    {
      id: "sec-about-team",
      type: "team_grid",
      name: "Academic Leadership & Teaching Team",
      enabled: true,
      badgeText: "Leadership & Teaching",
      headline: "Meet Our Academic Team",
      subheadline:
        "Experienced healthcare professionals, qualified teachers, and dedicated learner support coordinators.",
      items: [
        {
          title: "Sarah Jenkins",
          tag: "Head of Health & Social Care",
          desc: "RGN, BSc Nursing, PGCert Medical Education, QTLS",
          image: "/images/tutor-sarah.jpg",
        },
        {
          title: "David Okonjo",
          tag: "Lead Tutor — Early Years & Education",
          desc: "BA (Hons) Early Childhood Studies, PGCE Primary, NPQEL",
          image: "/images/tutor-david.jpg",
        },
        {
          title: "Priya Sharma",
          tag: "Quality Assurance & Student Welfare Lead",
          desc: "Level 4 Lead IQA, BSc Healthcare Management, Chartered MCIPD",
          image: "/images/tutor-priya.jpg",
        },
      ],
    },
    {
      id: "sec-about-legal",
      type: "legal_notice",
      name: "Company Legal Registration Line",
      enabled: true,
      headline: "Company Legal Registration",
      subheadline:
        "Smartminds Training College is a trading name of Smartminds Empire Ltd, Company No. 13492661",
    },
  ],
  "/contact": [
    {
      id: "sec-contact-header",
      type: "page_header",
      name: "Contact Header Block",
      enabled: true,
      badgeText: "Admissions & Student Office • Response Within 24h",
      headline: "Contact Smartminds College",
      subheadline:
        "Have questions about qualification entry requirements, funding opportunities, or course schedules? Our team is available by phone, email, WhatsApp, or through the contact form below.",
    },
    {
      id: "sec-contact-split",
      type: "contact_split",
      name: "Direct Channels & General Enquiry Form",
      enabled: true,
      headline: "Admissions & Student Support Office",
      subheadline:
        "Speak directly with our admissions advisors or send an enquiry below.",
    },
  ],
  "/funding": [
    {
      id: "sec-funding-header",
      type: "page_header",
      name: "Government Funded Routes Header",
      enabled: true,
      badgeText: "Government Funded Routes • Adult Skills Funding",
      headline: "Government-Funded Qualifications",
      subheadline:
        "Eligible adult learners living in England can access fully funded accredited training through government-backed initiatives, including the Adult Education Budget (AEB) and the Free Courses for Jobs scheme.",
    },
    {
      id: "sec-funding-split",
      type: "funding_split",
      name: "Funding Details & Eligibility Checker",
      enabled: true,
      headline: "How does government funding work?",
      subheadline:
        "Check whether your course fees can be 100% covered by UK government funding.",
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
  "/cpd": [
    {
      id: "sec-cpd-header",
      type: "page_header",
      name: "CPD Courses Header",
      enabled: true,
      badgeText: "Accredited by The CPD Group • Fast Certification",
      headline: "Continuing Professional Development (CPD)",
      subheadline:
        "Essential mandatory compliance refresher and skills certificates for healthcare assistants, support workers, nurses, and nursery practitioners.",
    },
    {
      id: "sec-cpd-benefits",
      type: "trust_strip",
      name: "CPD Benefits Strip",
      enabled: true,
      headline: "Certified Professional Standards",
      subheadline: "Accredited courses with fast UK certification",
      items: [
        {
          title: "1-Day Study Options",
          desc: "Designed to fit easily around work rotas with evening or intensive weekend webinar sessions.",
          icon: "clock",
        },
        {
          title: "CQC & Care Compliant",
          desc: "Mapped against the Care Certificate standards and regulatory inspection expectations.",
          icon: "shield-check",
        },
        {
          title: "Immediate Digital Diploma",
          desc: "Download your verified certificate of completion immediately upon tutor sign-off.",
          icon: "star",
        },
      ],
    },
    {
      id: "sec-cpd-grid",
      type: "cpd_listing",
      name: "Available CPD Programmes",
      enabled: true,
      headline: "Available CPD Programmes",
      subheadline:
        "Accredited short courses and certificates mapped against UK health and education standards.",
    },
    {
      id: "sec-cpd-group-cta",
      type: "cta_banner",
      name: "Corporate Group Training CTA",
      enabled: true,
      badgeText: "Team Training",
      headline: "Group Bookings for Care Homes & Schools",
      subheadline:
        "Do you have a team of staff who need mandatory refresher training? We offer custom in-house cohort deliveries with dedicated tutors and multi-seat billing.",
      buttonText: "Enquire About Team Training",
      buttonLink: "/contact",
      secondaryButtonText: "Message on WhatsApp",
      secondaryButtonLink:
        "https://wa.me/447932034548?text=Hello%20Smartminds%2C%20I%20would%20like%20course%20advice",
    },
  ],
  "/private-tutoring": [
    {
      id: "sec-tutoring-header",
      type: "page_header",
      name: "Private Tutoring Header",
      enabled: true,
      badgeText: "KS3 & GCSE Support • 1-on-1 Live Sessions • Enhanced DBS Checked",
      headline: "Dedicated 1-on-1 Private Tutoring",
      subheadline:
        "Personalised weekly online tutoring in Mathematics and English Language & Literature, designed to boost confidence, master exam technique, and accelerate academic achievement.",
    },
    {
      id: "sec-tutoring-split",
      type: "tutoring_split",
      name: "Tutoring Subjects & Enquiry Form",
      enabled: true,
      headline: "What We Offer",
      subheadline:
        "Dedicated 1-to-1 tutoring with patient, Enhanced DBS-checked British educators.",
    },
  ],
  "/book": [
    {
      id: "sec-book-header",
      type: "page_header",
      name: "Consultation Booking Header",
      enabled: true,
      badgeText: "15-Minute Consultation • Live With A Tutor",
      headline: "Book Your Free Consultation",
      subheadline:
        "Choose a time that works for you. We will discuss your background, verify entry criteria, and check whether your qualification can be funded through government schemes.",
    },
    {
      id: "sec-book-scheduler",
      type: "scheduler_block",
      name: "Native Consultation Scheduler",
      enabled: true,
      headline: "Schedule Your 15-Minute Consultation",
      subheadline:
        "Pick a date and time that fits your work rota. No sales pressure, no obligation.",
    },
  ],
};


