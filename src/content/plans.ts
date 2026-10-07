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

export const standardPaymentPlans: PaymentPlanTemplate[] = [
  defaultPlan3Months,
  defaultPlan6Months,
  defaultPlan10Months,
  defaultPlan12Months,
];
