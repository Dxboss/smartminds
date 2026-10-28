import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";
import {
  pullLatestFromNeon,
  saveTutoringAttendanceRecord,
  deleteTutoringAttendanceRecord,
  updateOneToOneEnrolmentAssignment,
} from "@/lib/persistedData";
import { TutoringAttendanceStatus, TutoringDeliveryMode } from "@/lib/repositories/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "tutor" &&
        session.role !== "admin_staff" &&
        session.role !== "owner_admin" &&
        session.role !== "super_admin")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Staff or Tutor session required." },
        { status: 401 }
      );
    }

    await pullLatestFromNeon(true).catch(() => {});
    const body = await req.json();
    const action = body?.action as string;

    if (action === "save_attendance") {
      const record = await saveTutoringAttendanceRecord({
        id: body.id ? String(body.id) : undefined,
        enrolmentId: String(body.enrolmentId || ""),
        learnerId: String(body.learnerId || ""),
        studentName: String(body.studentName || "Pupil"),
        parentName: body.parentName ? String(body.parentName) : undefined,
        yearGroupOrLevel: String(body.yearGroupOrLevel || "Year 7"),
        tutorId: String(body.tutorId || session.tutorId || session.id),
        tutorName: String(body.tutorName || session.name),
        sessionDate: String(body.sessionDate || new Date().toISOString().slice(0, 10)),
        timeSlot: String(body.timeSlot || "Saturday, 10:00am"),
        durationMinutes: Number(body.durationMinutes) || 60,
        deliveryMode: (body.deliveryMode as TutoringDeliveryMode) || "physical_centre",
        locationOrRoom: String(body.locationOrRoom || "Gloucester College Centre"),
        status: (body.status as TutoringAttendanceStatus) || "present",
        topicCovered: String(body.topicCovered || ""),
        homeworkOrNotes: body.homeworkOrNotes ? String(body.homeworkOrNotes) : undefined,
      });

      revalidatePath("/staff");
      revalidatePath("/staff/tutoring");
      revalidatePath("/admin/tutoring");
      revalidatePath("/admin/learners");

      return NextResponse.json({ success: true, record });
    }

    if (action === "delete_attendance") {
      const id = String(body?.id || "").trim();
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Attendance record ID is required." },
          { status: 400 }
        );
      }
      await deleteTutoringAttendanceRecord(id);

      revalidatePath("/staff");
      revalidatePath("/staff/tutoring");
      revalidatePath("/admin/tutoring");
      return NextResponse.json({ success: true });
    }

    if (action === "update_assignment") {
      const enrolmentId = String(body?.enrolmentId || "").trim();
      if (!enrolmentId) {
        return NextResponse.json(
          { success: false, error: "Enrolment ID is required." },
          { status: 400 }
        );
      }

      const updated = await updateOneToOneEnrolmentAssignment({
        enrolmentId,
        learnerId: body.learnerId ? String(body.learnerId) : undefined,
        tutorId: body.tutorId !== undefined ? String(body.tutorId) : undefined,
        tutorName: body.tutorName !== undefined ? String(body.tutorName) : undefined,
        preferredTimeSlot:
          body.preferredTimeSlot !== undefined ? String(body.preferredTimeSlot) : undefined,
        deliveryMode: body.deliveryMode as TutoringDeliveryMode | undefined,
        roomOrAddress:
          body.roomOrAddress !== undefined ? String(body.roomOrAddress) : undefined,
        zoomLink: body.zoomLink !== undefined ? String(body.zoomLink) : undefined,
        focusSubjects:
          body.focusSubjects !== undefined ? String(body.focusSubjects) : undefined,
      });

      revalidatePath("/staff");
      revalidatePath("/staff/tutoring");
      revalidatePath("/admin/tutoring");
      revalidatePath("/admin/learners");
      return NextResponse.json({ success: updated });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported action." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[/api/tutoring/attendance] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to process 1-on-1 tutoring request.",
      },
      { status: 500 }
    );
  }
}

