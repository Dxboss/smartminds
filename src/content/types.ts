export type CourseType = "regulated" | "cpd" | "tutoring";

export type DeliveryMode = "live_online" | "blended" | "self_paced" | "classroom";

export type StartMode = "rolling" | "fixed";

export type AssessmentMethod = "criteria" | "completion" | "quiz";

export type FundingType = "self_pay" | "funded" | "both";

export type DepositType = "fixed" | "percent";

export type AfterGraceAction = "pause_access" | "manual_review";

export interface Unit {
  code: string;
  title: string;
  credits?: number;
  learningOutcomes?: string[];
  outcomes?: string[];
  evidence?: string;
  guided_learning_hours?: number;
  mandatory?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PaymentPlanTemplate {
  id?: string;
  name: string;
  months: number;
  interval_weeks?: number;
  deposit_type: DepositType;
  deposit_value: number;
  grace_days: number;
  after_grace: AfterGraceAction;
}

export interface CourseLevel {
  course_id: string;
  level_label: string; // e.g. "Level 2", "Level 3", "KS3", "GCSE"
  price_gbp: number; // Selling price (actual payable price)
  regular_price_gbp?: number | null; // Regular / RRP price (slashed / strikethrough price)
  full_pay_discount_percent: number | null; // null uses global default (e.g. 10%)
  duration_text: string;
  guided_learning_hours: number;
  entry_requirements: string[];
  units: Unit[];
  plans: PaymentPlanTemplate[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  type: CourseType;
  delivery: DeliveryMode;
  start_mode: StartMode;
  start_dates: string[];
  awarding_body: string | null;
  awarding_reference: string | null;
  assessment_method: AssessmentMethod;
  funding: FundingType;
  funding_notes?: string;
  intro_video_url: string | null;
  intro_video_poster?: string | null;
  custom_delivery_text?: string;
  training_locations?: string[];
  tutoring_slots?: string[];
  home_study_note?: string;
  is_private_tutoring?: boolean;
  session_duration_info?: string;
  attendance_type?: "online_only" | "blended_practical" | "physical_venue";
  workplace_evidence_text?: string;
  observation_methods_text?: string;
  tuition_includes?: string[];
  intake_text?: string;
  assessment_model_text?: string;
  support_model_text?: string;
  free_textbook: boolean;
  faqs: FAQ[];
  job_prospects: string[];
  progression: string[];
  image: string;
  imageAlt?: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
  target_audience?: "adult" | "minor_tutoring" | "all";
  banner_theme?: "classic" | "navy_hero" | "emerald" | "warm" | "slate" | "custom";
  banner_bg_color?: string;
  banner_text_color?: string;
  accent_color?: string;
  show_glh?: boolean;
  show_workplace_assessment?: boolean;
  show_career_progression?: boolean;
  show_video_showcase?: boolean;
  show_dbs_guarantee?: boolean;
  show_exam_boards?: boolean;
  levels: CourseLevel[];
}

export interface GlobalSettings {
  default_full_pay_discount_percent: number;
  whatsapp_number: string;
  whatsapp_display: string;
  whatsapp_url: string;
  default_grace_days: number;
  is_staging: boolean;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number; // e.g. 15 for 15% or 50 for £50
  label: string;
  description: string;
  active: boolean;
  expiryDate?: string;
}

