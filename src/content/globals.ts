import { GlobalSettings } from "./types";

export const globalSettings: GlobalSettings = {
  default_full_pay_discount_percent: 10,
  whatsapp_number: "447932034548",
  whatsapp_display: "07932 034 548",
  whatsapp_url:
    "https://wa.me/447932034548?text=Hello%20Smartminds%2C%20I%20would%20like%20free%20course%20advice",
  default_grace_days: 7,
  is_staging:
    process.env.NEXT_PUBLIC_STAGING === "true" ||
    process.env.STAGING === "true",
};
