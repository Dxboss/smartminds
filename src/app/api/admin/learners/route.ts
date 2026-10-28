import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import {
  adminEnrolNewStudentAction,
  updateLearnerAndEnrolmentAction,
  logLearnerPaymentAction,
  assignLearnerTutorAndSessionAction,
} from "@/app/admin/actions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "admin_staff" &&
        session.role !== "owner_admin" &&
        session.role !== "super_admin")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = body?.action || "enrol";

    if (action === "enrol") {
      const res = await adminEnrolNewStudentAction(body.payload || body);
      return NextResponse.json(res);
    }

    if (action === "update") {
      const res = await updateLearnerAndEnrolmentAction(body.payload || body);
      return NextResponse.json(res);
    }

    if (action === "log_payment") {
      const res = await logLearnerPaymentAction(body.payload || body);
      return NextResponse.json(res);
    }

    if (action === "assign_tutor") {
      const { enrolmentId, tutorName, sessionTiming, classId } = body.payload || body;
      await assignLearnerTutorAndSessionAction(enrolmentId, {
        tutorName,
        sessionTiming,
        classId,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[/api/admin/learners] POST error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to process learner request.",
      },
      { status: 500 }
    );
  }
}

