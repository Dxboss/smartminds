-- Migration: 0003_seed_catalog_and_defaults.sql
-- Description: Seed baseline defaults (entitlements, message templates, availability rules)

-- Feature Entitlements default state (PRD Section 6)
INSERT INTO feature_entitlements (module_key, name, description, enabled, enabled_by, enabled_at)
VALUES
    ('payments_ledger', 'Payments Ledger', 'Financial tracking and bank transfer reconciliation (Owner only)', true, 'system', now()),
    ('booking_native', 'Native Booking & Availability', 'Calendar slots, hours, and blocked days management', true, 'system', now()),
    ('tutors_management', 'Tutor & Staff Management', 'Invite and assign roles to instructors and office staff', true, 'system', now()),
    ('tasks', 'Task Board', 'Task delegation and deadline tracking', true, 'system', now()),
    ('student_portal', 'Student Portal (Phase 2)', 'Self-service student course viewer and timetable', false, 'system', now()),
    ('assignments_grading', 'Assignments & Marking (Phase 2)', 'Unit criteria grading and feedback workflow', false, 'system', now()),
    ('recordings', 'Stream-only Recordings (Phase 2)', 'Protected stream player with watermark', false, 'system', now()),
    ('evidence_packs', 'Evidence Packs & Authority Docs (Phase 3)', 'Awarding body audit compilations and signed dossiers', false, 'system', now()),
    ('ai_submission_checks', 'AI Submission Integrity Checks (Phase 3)', 'Academic honesty screening for assignment submissions', false, 'system', now()),
    ('advanced_reports', 'Advanced Analytics & Reports (Phase 3)', 'Detailed cohort completion rates and financial forecasting', false, 'system', now()),
    ('mobile_app', 'Mobile App Access (Phase 3)', 'Dedicated iOS and Android student app endpoints', false, 'system', now())
ON CONFLICT (module_key) DO NOTHING;

-- Approved Message Templates (PRD Section 12.5)
INSERT INTO message_templates (id, key, title, category, subject, body_template, allowed_placeholders)
VALUES
    (
        'tmpl-welcome',
        'welcome_induction',
        'Course Welcome & Induction Pack',
        'enrolment',
        'Welcome to Smartminds Training College — {course_title}',
        'Dear {first_name},\n\nWelcome to Smartminds Training College. Your enrolment on {course_title} starting {intake_date} is now active. Your induction materials and study timetable are available on your student portal.',
        '["first_name", "course_title", "intake_date"]'::jsonb
    ),
    (
        'tmpl-zoom-link',
        'zoom_session_link',
        'Live Class Zoom Access Link',
        'attendance',
        'Live Class Link: {class_name} ({session_date})',
        'Dear {first_name},\n\nYour upcoming interactive live class for {class_name} will take place on {session_date}.\n\nPlease join the meeting using this link: {zoom_link}\n\nPlease join 5 minutes prior to start.',
        '["first_name", "class_name", "session_date", "zoom_link"]'::jsonb
    ),
    (
        'tmpl-assignment-due',
        'assignment_due_reminder',
        'Assignment Deadline Reminder',
        'assignment',
        'Reminder: {assignment_title} due on {deadline_date}',
        'Dear {first_name},\n\nThis is a friendly reminder that your submission for {assignment_title} is due on {deadline_date}. Please upload your completed work via your portal.',
        '["first_name", "assignment_title", "deadline_date"]'::jsonb
    ),
    (
        'tmpl-payment-reminder',
        'payment_instalment_due',
        'Payment Plan Instalment Notice',
        'payment',
        'Notice: Instalment of £{amount_due} due on {due_date}',
        'Dear {first_name},\n\nThis is a notification regarding your payment plan with Smartminds Training College. Your next instalment of £{amount_due} is due on {due_date}.',
        '["first_name", "amount_due", "due_date"]'::jsonb
    )
ON CONFLICT (key) DO NOTHING;

-- Default Availability Rules (Mon–Fri 09:00–17:00 / 16:00)
INSERT INTO availability_rules (id, day_of_week, start_time, end_time, slot_duration_minutes)
VALUES
    ('avail-mon', 1, '09:00', '17:00', 30),
    ('avail-tue', 2, '09:00', '17:00', 30),
    ('avail-wed', 3, '09:00', '17:00', 30),
    ('avail-thu', 4, '09:00', '17:00', 30),
    ('avail-fri', 5, '09:00', '16:00', 30)
ON CONFLICT (id) DO NOTHING;
