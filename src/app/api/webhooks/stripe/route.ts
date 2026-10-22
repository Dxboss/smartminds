import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { fulfillStripeCheckoutSession } from "@/app/actions/enrolmentActions";

/**
 * Stripe Webhook Handler: Listens for events sent directly by Stripe servers.
 * Verifies cryptographic signature using STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe) {
    console.error("[Stripe Webhook]: Stripe SDK client is not configured.");
    return NextResponse.json(
      { error: "Stripe is not configured in environment" },
      { status: 503 }
    );
  }

  if (!webhookSecret) {
    console.warn(
      "[Stripe Webhook Warning]: STRIPE_WEBHOOK_SECRET is not set. Webhooks require signature verification."
    );
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is missing" },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook Signature Verification Failed]:", err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle supported events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as { id: string; payment_status?: string };
      try {
        console.log(`[Stripe Webhook]: Processing checkout.session.completed for ${session.id}`);
        await fulfillStripeCheckoutSession(session.id);
      } catch (err: any) {
        console.error(
          `[Stripe Webhook Fulfillment Error for ${session.id}]:`,
          err.message || err
        );
        // Return 500 so Stripe automatically retries exponential backoff if a temporary error occurs
        return NextResponse.json(
          { error: "Enrolment fulfillment failed" },
          { status: 500 }
        );
      }
      break;
    }

    default:
      // Acknowledge receipt of unhandled events so Stripe does not retry
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
