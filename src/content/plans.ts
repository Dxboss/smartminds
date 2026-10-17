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

