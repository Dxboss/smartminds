import { CourseLevel, PaymentPlanTemplate, GlobalSettings } from "./types";

export interface PricingResult {
  fullPayPrice: number;
  saving: number;
  deposit: number;
  months: number;
  monthly: number;
  finalPayment: number;
  total: number;
  regularPrice: number;
  sellingPrice: number;
  hasPriceSlash: boolean;
  regularSaving: number;
  regularDiscountPercent: number;
}

/**
 * Pure function to calculate course pricing per PRD Section 10.4.
 *
 * Rules:
 * 1. Pay in full: receives a percentage discount (course override or global default).
 * 2. Instalments: spread over full price (no uplift, no interest/APR).
 * 3. Deposit: fixed amount or percentage of the full price.
 * 4. Monthly payment: (price - deposit) / months, rounded to pence.
 * 5. Final payment: absorbs any rounding remainder so that total strictly equals price_gbp.
 * 6. Regular vs Selling: if regular_price_gbp > price_gbp, compute strikethrough savings.
 */
export function calculatePricing(
  level: Pick<CourseLevel, "price_gbp" | "full_pay_discount_percent"> & {
    regular_price_gbp?: number | null;
  },
  plan: Pick<PaymentPlanTemplate, "months" | "deposit_type" | "deposit_value">,
  globals: Pick<GlobalSettings, "default_full_pay_discount_percent">
): PricingResult {
  const price = Math.max(0, level.price_gbp);
  const regularPrice =
    typeof level.regular_price_gbp === "number" && level.regular_price_gbp > price
      ? level.regular_price_gbp
      : price;
  const hasPriceSlash = regularPrice > price;
  const regularSaving = roundPence(regularPrice - price);
  const regularDiscountPercent =
    hasPriceSlash && regularPrice > 0
      ? Math.round((regularSaving / regularPrice) * 100)
      : 0;

  // 1. Full-pay discount calculation
  const discountPercent =
    level.full_pay_discount_percent !== null &&
    level.full_pay_discount_percent !== undefined
      ? level.full_pay_discount_percent
      : globals.default_full_pay_discount_percent;

  const validDiscountPercent = Math.max(0, Math.min(100, discountPercent));
  const fullPayPrice = roundPence(price * (1 - validDiscountPercent / 100));
  const saving = roundPence(price - fullPayPrice);

  // 2. Deposit calculation
  let deposit = 0;
  if (plan.deposit_type === "percent") {
    deposit = roundPence(price * (Math.max(0, plan.deposit_value) / 100));
  } else {
    // Fixed deposit
    deposit = roundPence(Math.min(price, Math.max(0, plan.deposit_value)));
  }

  // 3. Instalments calculation over remaining balance
  const remaining = roundPence(price - deposit);
  const months = Math.max(1, Math.floor(plan.months));

  if (months === 1) {
    return {
      fullPayPrice,
      saving,
      deposit,
      months: 1,
      monthly: remaining,
      finalPayment: remaining,
      total: roundPence(deposit + remaining),
      regularPrice,
      sellingPrice: price,
      hasPriceSlash,
      regularSaving,
      regularDiscountPercent,
    };
  }

  // Monthly installment amount (rounded to pence)
  const rawMonthly = remaining / months;
  const monthly = roundPence(rawMonthly);

  // First (months - 1) payments are at the rounded monthly amount
  const initialPaymentsTotal = roundPence(monthly * (months - 1));

  // The final payment absorbs the rounding remainder
  const finalPayment = roundPence(remaining - initialPaymentsTotal);

  // Total amount paid over the plan
  const total = roundPence(deposit + initialPaymentsTotal + finalPayment);

  return {
    fullPayPrice,
    saving,
    deposit,
    months,
    monthly,
    finalPayment,
    total,
    regularPrice,
    sellingPrice: price,
    hasPriceSlash,
    regularSaving,
    regularDiscountPercent,
  };
}

/**
 * Rounds a number to exactly two decimal places (pence) avoiding floating point jitter.
 */
function roundPence(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a monetary amount in GBP to two decimal places with thousands separators per PRD 10.4.
 * Examples: 445.5 -> £445.50, 1305 -> £1,305.00
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
