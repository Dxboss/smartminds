import { NextRequest, NextResponse } from "next/server";
import { submitLeadAction } from "@/app/actions/leadActions";

export async function POST(request: NextRequest) {
  try {
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
