export type CourseType = "regulated" | "cpd" | "tutoring";

export type DeliveryMode = "live_online" | "blended";

export type StartMode = "rolling" | "fixed";

export type AssessmentMethod = "criteria" | "completion" | "quiz";

export type FundingType = "self_pay" | "funded" | "both";

export type DepositType = "fixed" | "percent";

export type AfterGraceAction = "pause_access" | "manual_review";

export interface Unit {
  code: string;
  title: string;
  credits?: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PaymentPlanTemplate {
  id?: string;
  name: string;
  months: number;
  deposit_type: DepositType;
  deposit_value: number;
  grace_days: number;
  after_grace: AfterGraceAction;
}

export interface CourseLevel {
  course_id: string;
  level_label: string; // e.g. "Level 2", "Level 3", "KS3", "GCSE"
  price_gbp: number;
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
  free_textbook: boolean;
  faqs: FAQ[];
  job_prospects: string[];
  progression: string[];
  image: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
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
