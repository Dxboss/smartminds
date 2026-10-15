import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { submitLeadAction } from "@/app/actions/leadActions";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  try {
    const { getServerSession } = await import("@/lib/session");
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "owner_admin" && session.role !== "super_admin")
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Super Admin or Owner privileges required." },
        { status: 401 }
      );
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const { getServerSession } = await import("@/lib/session");
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "owner_admin" && session.role !== "super_admin")
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Super Admin or Owner privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "dev_leads.json");

    if (clearAll) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return NextResponse.json({ success: true, message: "All leads permanently deleted." });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "Lead ID is required" }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const leads = JSON.parse(raw);
      const filtered = leads.filter((l: any) => l.id !== id && l._id !== id);
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
    }

    return NextResponse.json({ success: true, message: "Lead permanently deleted." });
  } catch (error) {
    console.error("[API /api/leads DELETE] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete lead" },
      { status: 500 }
    );
  }
}

