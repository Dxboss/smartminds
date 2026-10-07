import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { submitLeadAction } from "@/app/actions/leadActions";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "dev_leads.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: true, leads: [] });
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const leads = JSON.parse(raw);
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error("[API /api/leads GET] Error reading leads:", error);
    return NextResponse.json({ success: false, leads: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "api_client";
    const rateCheck = checkRateLimit(`api_${ip}`, 15, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again shortly.",
        },
        { status: 429 }
      );
    }

    const json = await request.json();
    const result = await submitLeadAction(json);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[API /api/leads] Error processing request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
