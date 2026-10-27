-- Migration: 0002_indexes_and_constraints.sql
-- Description: Indexes and query optimization for Smartminds Training College tables

-- Course catalog indexes
CREATE INDEX IF NOT EXISTS idx_course_catalog_slug ON course_catalog (slug);
CREATE INDEX IF NOT EXISTS idx_course_catalog_category ON course_catalog (category);
CREATE INDEX IF NOT EXISTS idx_course_catalog_type ON course_catalog (type);
CREATE INDEX IF NOT EXISTS idx_course_catalog_published ON course_catalog (published);

-- Learner indexes
CREATE INDEX IF NOT EXISTS idx_learners_email ON learners (email);
CREATE INDEX IF NOT EXISTS idx_learners_access_status ON learners (access_status);
CREATE INDEX IF NOT EXISTS idx_learners_user_id ON learners (user_id);

-- Classes & sessions
CREATE INDEX IF NOT EXISTS idx_classes_course_id ON classes (course_id);
CREATE INDEX IF NOT EXISTS idx_classes_tutor_id ON classes (tutor_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_class_id ON class_sessions (class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_scheduled_at ON class_sessions (scheduled_at);

-- Enrolments indexes
CREATE INDEX IF NOT EXISTS idx_enrolments_learner_id ON enrolments (learner_id);
CREATE INDEX IF NOT EXISTS idx_enrolments_course_id ON enrolments (course_id);
CREATE INDEX IF NOT EXISTS idx_enrolments_class_id ON enrolments (class_id);
CREATE INDEX IF NOT EXISTS idx_enrolments_status ON enrolments (status);

-- Payments & schedules indexes
CREATE INDEX IF NOT EXISTS idx_payments_enrolment_id ON payments (enrolment_id);
CREATE INDEX IF NOT EXISTS idx_payments_learner_id ON payments (learner_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_enrolment_id ON payment_schedules (enrolment_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_learner_id ON payment_schedules (learner_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_due_date ON payment_schedules (due_date);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_status ON payment_schedules (status);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_id ON tasks (assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks (deadline);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings (scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_staff_id ON bookings (assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings (email);

-- Leads & enquiries indexes
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads (type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);

-- Message logs & templates
CREATE INDEX IF NOT EXISTS idx_message_logs_sent_at ON message_logs (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_logs_recipient_email ON message_logs (recipient_email);
CREATE INDEX IF NOT EXISTS idx_message_templates_key ON message_templates (key);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

-- User credentials
CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials (email);
CREATE INDEX IF NOT EXISTS idx_user_credentials_role ON user_credentials (role);
