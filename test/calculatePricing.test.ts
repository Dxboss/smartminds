import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculatePricing, formatCurrency } from "../src/content/pricing";
import { courses } from "../src/content/courses";
import { globalSettings } from "../src/content/globals";

describe("calculatePricing engine (PRD 10.4)", () => {
  const defaultGlobals = {
    default_full_pay_discount_percent: 10,
  };

  it("calculates full-pay price with global default discount (10%)", () => {
    const level = {
      price_gbp: 1000,
      full_pay_discount_percent: null,
    };
    const plan = {
      months: 3,
      deposit_type: "fixed" as const,
      deposit_value: 100,
    };

    const result = calculatePricing(level, plan, defaultGlobals);

    assert.equal(result.fullPayPrice, 900);
    assert.equal(result.saving, 100);
  });

  it("calculates full-pay price with course-level discount override (15%)", () => {
    const level = {
      price_gbp: 1000,
      full_pay_discount_percent: 15, // Override
    };
    const plan = {
      months: 3,
      deposit_type: "fixed" as const,
      deposit_value: 100,
    };

    const result = calculatePricing(level, plan, defaultGlobals);

    assert.equal(result.fullPayPrice, 850);
    assert.equal(result.saving, 150);
  });

  it("supports zero discount override (0%)", () => {
    const level = {
      price_gbp: 95,
      full_pay_discount_percent: 0,
    };
    const plan = {
      months: 1,
      deposit_type: "fixed" as const,
      deposit_value: 0,
    };

    const result = calculatePricing(level, plan, defaultGlobals);

    assert.equal(result.fullPayPrice, 95);
    assert.equal(result.saving, 0);
  });

  it("calculates fixed deposit accurately", () => {
    const level = { price_gbp: 1200, full_pay_discount_percent: 10 };
    const plan = {
      months: 6,
      deposit_type: "fixed" as const,
      deposit_value: 200,
    };

    const result = calculatePricing(level, plan, defaultGlobals);

    assert.equal(result.deposit, 200);
    assert.equal(result.total, 1200);
  });

  it("calculates percentage deposit accurately", () => {
    const level = { price_gbp: 1250, full_pay_discount_percent: 10 };
    const plan = {
      months: 6,
      deposit_type: "percent" as const,
      deposit_value: 20, // 20% of 1250 = 250
    };

    const result = calculatePricing(level, plan, defaultGlobals);

    assert.equal(result.deposit, 250);
    assert.equal(result.total, 1250);
  });

  it("handles rounding edge case where monthly division has remainder (e.g. £1000 over 3 months with 0 deposit)", () => {
    const level = { price_gbp: 1000, full_pay_discount_percent: 10 };
    const plan = {
      months: 3,
      deposit_type: "fixed" as const,
      deposit_value: 0,
    };

    const result = calculatePricing(level, plan, defaultGlobals);

    // 1000 / 3 = 333.333333...
    assert.equal(result.monthly, 333.33);
    // Month 1: 333.33, Month 2: 333.33, Month 3: 333.34
    assert.equal(result.finalPayment, 333.34);
    // Strict requirement: sum of instalments must equal price_gbp exactly
    assert.equal(result.total, 1000);
    assert.equal(
      result.deposit + result.monthly * 2 + result.finalPayment,
      1000
    );
  });

  it("absorbs rounding remainder with percentage deposit (e.g. £1450, 15% deposit, 10 months)", () => {
    const level = { price_gbp: 1450, full_pay_discount_percent: 10 };
    const plan = {
      months: 10,
      deposit_type: "percent" as const,
      deposit_value: 15, // 15% of 1450 = 217.50
    };

    const result = calculatePricing(level, plan, defaultGlobals);

    assert.equal(result.deposit, 217.5);
    // Remaining = 1450 - 217.50 = 1232.50
    // 1232.50 / 10 = 123.25
    assert.equal(result.monthly, 123.25);
    assert.equal(result.finalPayment, 123.25);
    assert.equal(result.total, 1450);
  });

  it("handles single payment (1 month) plan", () => {
    const level = { price_gbp: 95, full_pay_discount_percent: 0 };
    const plan = {
      months: 1,
      deposit_type: "fixed" as const,
      deposit_value: 0,
    };

    const result = calculatePricing(level, plan, defaultGlobals);

    assert.equal(result.months, 1);
    assert.equal(result.deposit, 0);
    assert.equal(result.monthly, 95);
    assert.equal(result.finalPayment, 95);
    assert.equal(result.total, 95);
  });

  it("works with seeded courses from /content (sale price displays as entered; non-sale receives upfront discount)", () => {
    // Test against real seeded content: Adult Care Level 2 (has sale price / price slash)
    const adultCare = courses.find((c) => c.slug === "diploma-in-adult-care");
    assert.ok(adultCare, "Adult Care course must exist in seeded content");

    const level2 = adultCare.levels[0];
    const plan3m = level2.plans[0];

    const result = calculatePricing(level2, plan3m, globalSettings);

    // Rule: Sale price must display as entered and must not receive a second discount
    assert.equal(result.hasPriceSlash, true);
    assert.equal(result.sellingPrice, 850);
    assert.equal(result.regularPrice, 995);
    assert.equal(result.fullPayPrice, 850);
    assert.equal(result.total, 850);

    // Course level without price slash receives full pay discount
    const standardLevel = {
      price_gbp: 1000,
      full_pay_discount_percent: 10,
    };
    const standardResult = calculatePricing(standardLevel, plan3m, globalSettings);
    assert.equal(standardResult.fullPayPrice, 900);
    assert.equal(standardResult.saving, 100);
    assert.equal(standardResult.total, 1000);
  });

  it("reflects changes in course level price or discount dynamically", () => {
    const modifiedLevel = {
      price_gbp: 800,
      full_pay_discount_percent: 20,
    };
    const plan = {
      months: 4,
      deposit_type: "fixed" as const,
      deposit_value: 100,
    };

    const result = calculatePricing(modifiedLevel, plan, defaultGlobals);

    assert.equal(result.fullPayPrice, 640); // 800 * 0.8
    assert.equal(result.saving, 160);
    assert.equal(result.deposit, 100);
    // Remaining = 700 / 4 = 175
    assert.equal(result.monthly, 175);
    assert.equal(result.finalPayment, 175);
    assert.equal(result.total, 800);
  });

  it("formatCurrency formats prices to two decimals with thousands separators", () => {
    assert.equal(formatCurrency(445.5), "£445.50");
    assert.equal(formatCurrency(1305), "£1,305.00");
    assert.equal(formatCurrency(0), "£0.00");
    assert.equal(formatCurrency(1234567.8), "£1,234,567.80");
  });
});
