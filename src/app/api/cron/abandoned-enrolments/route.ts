import { NextResponse } from "next/server";
import { processAbandonedCheckoutRecovery } from "@/lib/abandonedCheckoutRecovery";

export const dynamic = "force-dynamic";

/**
 * Endpoint for running the 5-stage abandoned checkout recovery sequence.
 * Can be triggered via curl / Hostinger scheduled task / external ping.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cronKey = searchParams.get("key");
    const expectedKey = process.env.CRON_SECRET || process.env.ADMIN_SECRET;

    // If an expectedKey is defined, enforce it
    if (expectedKey && cronKey !== expectedKey) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { pullLatestFromNeon } = await import("@/lib/persistedData");
      await pullLatestFromNeon();
    } catch {}

    const result = await processAbandonedCheckoutRecovery();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error running checkout recovery";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}

