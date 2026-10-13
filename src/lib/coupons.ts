import type { PricingResult } from "@/content/pricing";
import type { Coupon } from "@/content/types";
import { defaultCoupons } from "@/content/coupons";

export type { Coupon };

/**
 * Active College Coupons & Bursaries loaded from typed config in /content/coupons.ts.
 * Not hardcoded in components or library code.
 */
export const VALID_COUPONS: Coupon[] = defaultCoupons;

export function validateCoupon(inputCode: string): {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
} {
  const clean = inputCode?.trim().toUpperCase();
  if (!clean) {
    return { valid: false, error: "Please enter a voucher or coupon code." };
  }

  const found = VALID_COUPONS.find(
    (c) => c.code.toUpperCase() === clean && c.active
  );

  if (!found) {
    return {
      valid: false,
      error: `Coupon "${clean}" is invalid, expired, or not applicable.`,
    };
  }

  return { valid: true, coupon: found };
}

export function computeCouponDiscount(
  basePrice: number,
  coupon?: Coupon | null
): {
  discountAmount: number;
  finalPrice: number;
} {
  if (!coupon || basePrice <= 0) {
    return { discountAmount: 0, finalPrice: Math.max(0, basePrice) };
  }

  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round(((basePrice * coupon.value) / 100) * 100) / 100;
  } else if (coupon.type === "fixed") {
    discount = Math.min(basePrice, coupon.value);
  }

  const finalPrice = Math.max(0, Math.round((basePrice - discount) * 100) / 100);
  return {
    discountAmount: discount,
    finalPrice,
  };
}

export function calculateDiscountedPricing(
  pricing: PricingResult,
  coupon?: Coupon | null
): PricingResult & { discountAmount: number } {
  if (!coupon) {
    return { ...pricing, discountAmount: 0 };
  }

  if (coupon.type === "percent") {
    const factor = Math.max(0, (100 - coupon.value) / 100);
    const discountedFull = Math.round(pricing.fullPayPrice * factor * 100) / 100;
    const discountedTotal = Math.round(pricing.total * factor * 100) / 100;
    const discountedDeposit = Math.round(pricing.deposit * factor * 100) / 100;
    const remaining = Math.max(0, discountedTotal - discountedDeposit);
    const discountedMonthly =
      pricing.months > 0 ? Math.round((remaining / pricing.months) * 100) / 100 : 0;
    const finalPayment =
      pricing.months > 0
        ? Math.max(
            0,
            Math.round(
              (remaining - discountedMonthly * (pricing.months - 1)) * 100
            ) / 100
          )
        : 0;

    return {
      ...pricing,
      fullPayPrice: discountedFull,
      total: discountedTotal,
      deposit: discountedDeposit,
      monthly: discountedMonthly,
      finalPayment,
      saving: Math.round((pricing.total - discountedFull) * 100) / 100,
      discountAmount: Math.round((pricing.fullPayPrice - discountedFull) * 100) / 100,
    };
  } else {
    const fixed = coupon.value;
    const discountedFull = Math.max(
      0,
      Math.round((pricing.fullPayPrice - fixed) * 100) / 100
    );
    const discountedTotal = Math.max(
      0,
      Math.round((pricing.total - fixed) * 100) / 100
    );
    const discountedDeposit = Math.max(
      0,
      Math.round((pricing.deposit - fixed) * 100) / 100
    );
    const remaining = Math.max(0, discountedTotal - discountedDeposit);
    const discountedMonthly =
      pricing.months > 0 ? Math.round((remaining / pricing.months) * 100) / 100 : 0;
    const finalPayment =
      pricing.months > 0
        ? Math.max(
            0,
            Math.round(
              (remaining - discountedMonthly * (pricing.months - 1)) * 100
            ) / 100
          )
        : 0;

    return {
      ...pricing,
      fullPayPrice: discountedFull,
      total: discountedTotal,
      deposit: discountedDeposit,
      monthly: discountedMonthly,
      finalPayment,
      saving: Math.round((pricing.total - discountedFull) * 100) / 100,
      discountAmount: Math.min(pricing.fullPayPrice, fixed),
    };
  }
}

