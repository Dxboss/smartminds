import { Coupon } from "./types";

/**
 * Typed configuration of official College coupon codes, bursaries, and birthday discounts.
 * Per PRD Section 10 & Project Architecture:
 * All discount rates, voucher codes, and bursaries are loaded from typed config in /content,
 * never hardcoded inside components.
 */
export const defaultCoupons: Coupon[] = [
  {
    code: "BIRTHDAY10",
    type: "percent",
    value: 10,
    label: "Birthday Voucher (10% Off)",
    description: "10% birthday privilege discount applied to course tuition.",
    active: true,
  },
  {
    code: "BIRTHDAY15",
    type: "percent",
    value: 15,
    label: "Birthday Voucher (15% Off)",
    description: "15% birthday celebration bursary applied across all payment options.",
    active: true,
  },
  {
    code: "BIRTHDAY20",
    type: "percent",
    value: 20,
    label: "Birthday VIP Voucher (20% Off)",
    description: "20% exclusive birthday scholarship reduction applied to tuition.",
    active: true,
  },
  {
    code: "BURSARY50",
    type: "fixed",
    value: 50,
    label: "Community Bursary (-£50)",
    description: "£50 direct tuition grant deducted from upfront or deposit payment.",
    active: true,
  },
  {
    code: "WELCOME50",
    type: "fixed",
    value: 50,
    label: "New Learner Grant (-£50)",
    description: "£50 welcome bursary applied towards your first qualification.",
    active: true,
  },
  {
    code: "SMART10",
    type: "percent",
    value: 10,
    label: "Smartminds Advantage (10% Off)",
    description: "10% promotional privilege applied to overall qualification tuition.",
    active: true,
  },
];
