import { GlobalSettings } from "./types";

export const globalSettings: GlobalSettings = {
  default_full_pay_discount_percent: 10,
  whatsapp_number: "447000000000", // PLACEHOLDER
  whatsapp_display: "+44 7000 000000",
  whatsapp_url:
    "https://wa.me/447000000000?text=Hello%20Smartminds%2C%20I%20would%20like%20free%20course%20advice",
  default_grace_days: 7,
  is_staging:
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_STAGING === "true" ||
    true, // Staging flag for Phase 1a preview
};
