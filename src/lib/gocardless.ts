import crypto from "node:crypto";

/**
 * GoCardless REST Client
 * Zero-dependency implementation using native fetch and standard Web APIs.
 */

export interface GoCardlessConfig {
  accessToken: string;
  environment: "live" | "sandbox";
  webhookSecret?: string;
}

export function getGoCardlessConfig(): GoCardlessConfig | null {
  const rawKey = process.env.GOCARDLESS_ACCESS_TOKEN?.trim().replace(/^["']|["']$/g, "").trim();
  if (!rawKey) return null;

  const env =
    process.env.GOCARDLESS_ENVIRONMENT?.toLowerCase() === "live" || rawKey.startsWith("live_")
      ? "live"
      : "sandbox";

  const webhookSecret = process.env.GOCARDLESS_WEBHOOK_SECRET?.trim().replace(/^["']|["']$/g, "").trim();

  return {
    accessToken: rawKey,
    environment: env,
    webhookSecret,
  };
}

export function isGoCardlessConfigured(): boolean {
  return Boolean(process.env.GOCARDLESS_ACCESS_TOKEN?.trim());
}

function getApiBaseUrl(env: "live" | "sandbox"): string {
  return env === "live" ? "https://api.gocardless.com" : "https://api-sandbox.gocardless.com";
}

/**
 * Creates a Redirect Flow in GoCardless for Bacs Direct Debit mandate authorization.
 */
export async function createGoCardlessRedirectFlow(params: {
  sessionToken: string;
  successRedirectUrl: string;
  description: string;
  prefilledCustomer?: {
    givenName?: string;
    familyName?: string;
    email?: string;
    phoneNumber?: string;
    addressLine1?: string;
    postalCode?: string;
  };
}): Promise<{ flowId: string; redirectUrl: string }> {
  const config = getGoCardlessConfig();
  if (!config) {
    throw new Error("GoCardless is not configured in this environment.");
  }

  const baseUrl = getApiBaseUrl(config.environment);
  const res = await fetch(`${baseUrl}/redirect_flows`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "GoCardless-Version": "2015-07-06",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      redirect_flows: {
        description: params.description,
        session_token: params.sessionToken,
        success_redirect_url: params.successRedirectUrl,
        prefilled_customer: params.prefilledCustomer
          ? {
              given_name: params.prefilledCustomer.givenName,
              family_name: params.prefilledCustomer.familyName,
              email: params.prefilledCustomer.email,
              phone_number: params.prefilledCustomer.phoneNumber,
              address_line1: params.prefilledCustomer.addressLine1,
              postal_code: params.prefilledCustomer.postalCode,
            }
          : undefined,
        scheme: "bacs",
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("[GoCardless API Error]:", res.status, errorBody);
    throw new Error(`GoCardless Redirect Flow failed (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const flow = data?.redirect_flows;
  if (!flow?.id || !flow?.redirect_url) {
    throw new Error("Invalid response received from GoCardless Redirect Flow API.");
  }

  return {
    flowId: flow.id,
    redirectUrl: flow.redirect_url,
  };
}

/**
 * Completes a Redirect Flow once the customer returns from the GoCardless hosted page.
 * Returns the confirmed mandate ID and customer ID.
 */
export async function completeGoCardlessRedirectFlow(
  flowId: string,
  sessionToken: string
): Promise<{ mandateId: string; customerId: string }> {
  const config = getGoCardlessConfig();
  if (!config) {
    throw new Error("GoCardless is not configured in this environment.");
  }

  const baseUrl = getApiBaseUrl(config.environment);
  const res = await fetch(`${baseUrl}/redirect_flows/${flowId}/actions/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "GoCardless-Version": "2015-07-06",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        session_token: sessionToken,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("[GoCardless Complete Error]:", res.status, errorBody);
    throw new Error(`Failed to complete GoCardless redirect flow: ${errorBody}`);
  }

  const data = await res.json();
  const flow = data?.redirect_flows;
  const mandateId = flow?.links?.mandate;
  const customerId = flow?.links?.customer;

  if (!mandateId) {
    throw new Error("Direct Debit mandate was not created in completed redirect flow.");
  }

  return {
    mandateId,
    customerId: customerId || "",
  };
}

/**
 * Triggers a payment charge against an existing Bacs Direct Debit mandate.
 * @param amountPence Amount in pence (e.g. £150.00 = 15000)
 */
export async function createGoCardlessPayment(params: {
  mandateId: string;
  amountPence: number;
  description: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}): Promise<{ paymentId: string; status: string }> {
  const config = getGoCardlessConfig();
  if (!config) {
    throw new Error("GoCardless is not configured in this environment.");
  }

  const baseUrl = getApiBaseUrl(config.environment);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.accessToken}`,
    "GoCardless-Version": "2015-07-06",
    "Content-Type": "application/json",
  };

  if (params.idempotencyKey) {
    headers["Idempotency-Key"] = params.idempotencyKey;
  }

  const res = await fetch(`${baseUrl}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      payments: {
        amount: Math.round(params.amountPence),
        currency: "GBP",
        description: params.description,
        links: {
          mandate: params.mandateId,
        },
        metadata: params.metadata,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("[GoCardless Payment Error]:", res.status, errorBody);
    throw new Error(`Failed to initiate GoCardless payment: ${errorBody}`);
  }

  const data = await res.json();
  const payment = data?.payments;
  return {
    paymentId: payment?.id || "",
    status: payment?.status || "pending_submission",
  };
}

/**
 * Validates the Webhook signature header from GoCardless using HMAC SHA-256.
 */
export function verifyGoCardlessWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;
  try {
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader.trim()),
      Buffer.from(computedSignature.trim())
    );
  } catch (err) {
    console.warn("[GoCardless Webhook Verify Error]:", err);
    return false;
  }
}
