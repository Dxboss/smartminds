import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

/**
 * Returns the Stripe SDK client initialized with STRIPE_SECRET_KEY.
 * Returns null if the secret key is not set.
 */
export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia" as any,
      appInfo: {
        name: "Smartminds Training College",
        version: "1.0.0",
      },
    });
  }
  return stripeSingleton;
}

/**
 * Checks whether Stripe is configured with a valid secret key.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/**
 * Checks whether Stripe Webhook secret is configured.
 */
export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}
