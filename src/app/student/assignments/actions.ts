"use server";

import { getServerSession } from "@/lib/session";
import { seedSubmissions } from "@/lib/repositories/seedData";
import { revalidatePath } from "next/cache";

export async function uploadCourseworkAction(formData: {
  assignmentId: string;
  unitCode: string;
  fileName: string;
  fileSizeBytes: number;
}) {
  const session = await getServerSession();
  if (!session || session.role !== "student") {
    throw new Error("Unauthorized: Student session required.");
  }

  const learnerId = session.learnerId || "learner-001";

  // Check if submission exists
  const existingIdx = seedSubmissions.findIndex(
    (s) => s.assignmentId === formData.assignmentId && s.learnerId === learnerId
  );

  const newSub = {
    id: `sub-demo-${Date.now()}`,
    assignmentId: formData.assignmentId,
    learnerId,
    learnerName: session.name,
    unitCode: formData.unitCode,
    fileName: formData.fileName,
    fileSizeBytes: formData.fileSizeBytes,
    submittedAt: new Date().toISOString(),
    status: "submitted" as const,
    outcome: "pending" as const,
  };

  if (existingIdx >= 0) {
    seedSubmissions[existingIdx] = {
      ...seedSubmissions[existingIdx],
      ...newSub,
    };
  } else {
    seedSubmissions.push(newSub);
  }

  revalidatePath(`/student/assignments/${formData.assignmentId}`);
  revalidatePath("/student/assignments");
  revalidatePath("/student");

  return { success: true };
}
