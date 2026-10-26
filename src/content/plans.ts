import { PaymentPlanTemplate } from "./types";

export const defaultPlan3Months: PaymentPlanTemplate = {
  id: "plan-3m",
  name: "3 Monthly Payments",
  months: 3,
  deposit_type: "percent",
  deposit_value: 20, // 20% initial deposit
  grace_days: 7,
  after_grace: "pause_access",
};

export const defaultPlan6Months: PaymentPlanTemplate = {
  id: "plan-6m",
  name: "6 Monthly Payments",
  months: 6,
  deposit_type: "percent",
  deposit_value: 15, // 15% initial deposit
  grace_days: 7,
  after_grace: "pause_access",
};

export const defaultPlan10Months: PaymentPlanTemplate = {
  id: "plan-10m",
  name: "10 Monthly Payments",
  months: 10,
  deposit_type: "fixed",
  deposit_value: 100, // £100 fixed deposit
  grace_days: 7,
  after_grace: "pause_access",
};

export const defaultPlan12Months: PaymentPlanTemplate = {
  id: "plan-12m",
  name: "12 Monthly Payments",
  months: 12,
  deposit_type: "fixed",
  deposit_value: 100, // £100 fixed deposit
  grace_days: 7,
  after_grace: "pause_access",
};

export const defaultPlan14Months: PaymentPlanTemplate = {
  id: "plan-14m",
  name: "14 Monthly Payments",
  months: 14,
  deposit_type: "fixed",
  deposit_value: 150, // £150 fixed deposit
  grace_days: 7,
  after_grace: "pause_access",
};

/**
 * Standard payment plans for Level 2, Level 3, and Level 4 courses:
 * 3, 6, 10, and 12 months.
 */
export const standardPaymentPlans: PaymentPlanTemplate[] = [
  defaultPlan3Months,
  defaultPlan6Months,
  defaultPlan10Months,
  defaultPlan12Months,
];

/**
 * Dedicated payment plans for Level 5 courses (up to 14 months duration):
 * 6, 10, 12, and 14 months.
 */
export const level5PaymentPlans: PaymentPlanTemplate[] = [
  defaultPlan6Months,
  defaultPlan10Months,
  defaultPlan12Months,
  defaultPlan14Months,
];

/**
 * Dedicated term-based payment plans for 1-on-1 Children's Tutoring (12-Week Term):
 * Full Term, 2 Payments (every 6 weeks), or 3 Monthly Payments.
 */
export const tutoringPaymentPlans: PaymentPlanTemplate[] = [
  {
    id: "plan-1m",
    name: "Full Term (12 Weeks)",
    months: 1,
    deposit_type: "percent",
    deposit_value: 100,
    grace_days: 7,
    after_grace: "pause_access",
  },
  {
    id: "plan-2m",
    name: "2 Instalments (Every 6 Weeks)",
    months: 2,
    deposit_type: "percent",
    deposit_value: 50,
    grace_days: 7,
    after_grace: "pause_access",
  },
  {
    id: "plan-3m",
    name: "3 Monthly Payments (Term Length)",
    months: 3,
    deposit_type: "fixed",
    deposit_value: 50,
    grace_days: 7,
    after_grace: "pause_access",
  },
];

/**
 * Extracts the numeric qualification level from a level label (e.g. "Level 5 Diploma" -> 5).
 * Defaults to 3 if not specified or unparseable.
 */
export function getLevelNumber(label?: string): number {
  if (!label) return 3;
  const match = label.match(/\b(?:level|lvl|nvq|rqf)?\s*(\d+)\b/i);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num)) return num;
  }
  const anyDigits = label.match(/\d+/);
  if (anyDigits) {
    const num = parseInt(anyDigits[0], 10);
    if (!isNaN(num)) return num;
  }
  return 3;
}

/**
 * Checks if qualification level is Level 5 or above (Level 5, 6, 7).
 */
export function isLevel5OrAbove(label?: string): boolean {
  return getLevelNumber(label) >= 5;
}

/**
 * Returns dynamic instalment spread months:
 * - Lower than Level 5 (Levels 1, 2, 3, 4, etc.): 3, 6, 10, 12 months.
 * - Level 5 and above (Levels 5, 6, 7, etc.): 6, 10, 12, 14 months.
 */
export function getSpreadMonthsForLevel(label?: string): number[] {
  return isLevel5OrAbove(label) ? [6, 10, 12, 14] : [3, 6, 10, 12];
}

/**
 * Generates the 4 dynamic PaymentPlanTemplates for a qualification level with specified deposit.
 */
export function generatePaymentPlansForLevel(
  label?: string,
  depositValue = 100
): PaymentPlanTemplate[] {
  const monthsList = getSpreadMonthsForLevel(label);
  return monthsList.map((months) => ({
    id: `plan-${months}m`,
    name: `${months} Monthly Payments`,
    months,
    deposit_type: "fixed" as const,
    deposit_value: depositValue,
    grace_days: 7,
    after_grace: "pause_access" as const,
  }));
}

