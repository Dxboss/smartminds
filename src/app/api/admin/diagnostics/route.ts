import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { runDatabaseDiagnostics } from "@/lib/dbDiagnostics";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "owner_admin" && session.role !== "super_admin")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator privileges required." },
        { status: 401 }
      );
    }

    const diagnostics = await runDatabaseDiagnostics();
    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: "Diagnostics run failed" },
      { status: 500 }
    );
  }
}
