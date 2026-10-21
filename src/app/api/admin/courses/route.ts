import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "admin_staff" &&
        session.role !== "owner_admin" &&
        session.role !== "super_admin")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, faculty, facultyId, courseId, updates } = body;

    const {
      saveFacultyToStore,
      deleteFacultyFromStore,
      loadPersistedRecords,
      syncStoreSnapshotToNeon,
    } = await import("@/lib/persistedData");

    if (action === "save_faculty" && faculty) {
      const id = faculty.id || faculty.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const updatedFaculties = await saveFacultyToStore({
        id,
        name: faculty.name.trim(),
        description: faculty.description?.trim(),
        icon: faculty.icon || "shield-check",
        color: faculty.color || "navy",
        status: faculty.status || "active",
      });

      try {
        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        revalidatePath("/enrol");
        revalidatePath("/");
      } catch {}

      return NextResponse.json({ success: true, faculties: updatedFaculties });
    }

    if (action === "delete_faculty" && facultyId) {
      const updatedFaculties = await deleteFacultyFromStore(facultyId);
      try {
        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        revalidatePath("/enrol");
        revalidatePath("/");
      } catch {}

      return NextResponse.json({ success: true, faculties: updatedFaculties });
    }

    if (action === "update_course" && courseId && updates) {
      const store = loadPersistedRecords();
      if (!store.courseOverrides) store.courseOverrides = {};
      store.courseOverrides[courseId] = {
        ...(store.courseOverrides[courseId] || {}),
        ...updates,
      };

      await syncStoreSnapshotToNeon(store);

      try {
        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        revalidatePath(`/courses/${courseId}`);
        revalidatePath("/");
      } catch {}

      return NextResponse.json({ success: true, courseId });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[API /api/admin/courses] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
