import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getCourseRepo } from "@/lib/repositories";
import { getPersistedFaculties } from "@/lib/persistedData";
import { CoursesManagerView } from "@/components/admin/CoursesManagerView";

export const instant = false;

export const metadata: Metadata = {
  title: "Courses & Pricing Schedule | Smartminds Administration",
  description:
    "College course catalogue, tuition pricing, instalment deposits, and regulated Ofqual qualification specifications.",
};

export default async function AdminCoursesPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/admin/courses");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const courseRepo = getCourseRepo();
  const courses = await courseRepo.listCourses();
  const faculties = getPersistedFaculties();

  return <CoursesManagerView courses={courses} userRole={session.role} initialFaculties={faculties} />;
}
