-- Migration: 0001_core_schema.sql
-- Description: Core tables for Smartminds Training College PostgreSQL database

-- Migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course catalog table
CREATE TABLE IF NOT EXISTS course_catalog (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT true,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learner profiles
CREATE TABLE IF NOT EXISTS learners (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    access_status TEXT NOT NULL DEFAULT 'active' CHECK (access_status IN ('active', 'paused', 'archived')),
    archive_reason TEXT,
    archived_at TIMESTAMPTZ,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Class cohorts
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    course_level_label TEXT,
    tutor_id TEXT,
    tutor_name TEXT,
    name TEXT NOT NULL,
    intake_label TEXT,
    schedule_description TEXT,
    next_session_date TIMESTAMPTZ,
    zoom_link TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Class sessions & recordings
CREATE TABLE IF NOT EXISTS class_sessions (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    zoom_link TEXT,
    recording_url TEXT,
    attendance_tracked BOOLEAN NOT NULL DEFAULT false,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enrolments
CREATE TABLE IF NOT EXISTS enrolments (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE RESTRICT,
    course_id TEXT NOT NULL,
    course_slug TEXT NOT NULL,
    course_title TEXT NOT NULL,
    course_level_label TEXT,
    class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    funding_type TEXT NOT NULL DEFAULT 'self_pay' CHECK (funding_type IN ('self_pay', 'funded')),
    assessment_method TEXT NOT NULL DEFAULT 'criteria' CHECK (assessment_method IN ('criteria', 'completion', 'quiz')),
    completed_units JSONB NOT NULL DEFAULT '[]'::jsonb,
    certificate_issued BOOLEAN NOT NULL DEFAULT false,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments ledger (strict financial barrier)
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    enrolment_id TEXT REFERENCES enrolments(id) ON DELETE SET NULL,
    learner_id TEXT REFERENCES learners(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'GBP',
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'refunded', 'failed', 'chargeback')),
    payment_method TEXT NOT NULL DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'bank_transfer', 'manual', 'funded')),
    reference TEXT,
    notes TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scheduled payment instalments
CREATE TABLE IF NOT EXISTS payment_schedules (
    id TEXT PRIMARY KEY,
    enrolment_id TEXT NOT NULL REFERENCES enrolments(id) ON DELETE CASCADE,
    learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE RESTRICT,
    instalment_number INTEGER NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    paid_at TIMESTAMPTZ,
    payment_reference TEXT,
    grace_expiry_date TIMESTAMPTZ,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Task delegation board
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to_id TEXT NOT NULL,
    assigned_to_name TEXT NOT NULL,
    assigned_by_role TEXT NOT NULL CHECK (assigned_by_role IN ('owner_admin', 'super_admin')),
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    is_overdue BOOLEAN NOT NULL DEFAULT false,
    satisfaction TEXT CHECK (satisfaction IN ('satisfied', 'needs_revision', 'unsatisfied')),
    feedback TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Native consultation bookings
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    course_interest TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    time_zone TEXT NOT NULL DEFAULT 'Europe/London',
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show')),
    meeting_platform TEXT NOT NULL DEFAULT 'google_meet' CHECK (meeting_platform IN ('google_meet', 'zoom', 'phone', 'in_person')),
    meeting_link TEXT,
    assigned_staff_id TEXT,
    assigned_staff_name TEXT,
    notes TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Booking availability rules
CREATE TABLE IF NOT EXISTS availability_rules (
    id TEXT PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
    data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Blocked consultation days
CREATE TABLE IF NOT EXISTS blocked_days (
    date TEXT PRIMARY KEY,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Approved message templates
CREATE TABLE IF NOT EXISTS message_templates (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('enrolment', 'attendance', 'assignment', 'payment', 'general')),
    subject TEXT NOT NULL,
    body_template TEXT NOT NULL,
    allowed_placeholders JSONB NOT NULL DEFAULT '[]'::jsonb,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Message logs (immutable send log)
CREATE TABLE IF NOT EXISTS message_logs (
    id TEXT PRIMARY KEY,
    template_key TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    rendered_body TEXT NOT NULL,
    sent_by_user_id TEXT,
    sent_by_role TEXT,
    status TEXT NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Feature entitlements
CREATE TABLE IF NOT EXISTS feature_entitlements (
    module_key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    enabled_by TEXT,
    enabled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security and governance audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student feedback submissions
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    page_url TEXT,
    reviewer_name TEXT,
    user_id TEXT,
    role TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'done', 'pending', 'reviewed', 'published')),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User credentials & profiles
CREATE TABLE IF NOT EXISTS user_credentials (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'tutor', 'admin_staff', 'owner_admin', 'super_admin')),
    learner_id TEXT,
    tutor_id TEXT,
    password_hash TEXT,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    department TEXT,
    specialism TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- General system store (key-value store for site-wide settings & themes)
CREATE TABLE IF NOT EXISTS system_store (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CMS pages store
CREATE TABLE IF NOT EXISTS cms_pages (
    path TEXT PRIMARY KEY,
    sections JSONB NOT NULL,
    draft_sections JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inbound marketing leads
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('free_advice', 'funded_eligibility', 'private_tutoring', 'general_contact')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    course_interest TEXT,
    message TEXT,
    source_page TEXT NOT NULL,
    consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'enrolled', 'lost')),
    assigned_to TEXT,
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source TEXT,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    data JSONB NOT NULL DEFAULT '{}'::jsonb
);
