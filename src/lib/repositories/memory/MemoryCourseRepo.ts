import { courses } from "@/content/courses";
import { Course } from "@/content/types";
import { CourseRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";

export class MemoryCourseRepo implements CourseRepo {
  private courseList: Course[] = [...courses];

  async listCourses(): Promise<Course[]> {
    return [...this.courseList];
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    const found = this.courseList.find((c) => c.slug === slug);
    return found ? { ...found } : null;
  }

  async getCourseById(id: string): Promise<Course | null> {
    const found = this.courseList.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  async updateCourse(actor: SessionUser, updated: Course): Promise<Course> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only owner or super admin can edit courses and curriculum."
      );
    }
    const idx = this.courseList.findIndex((c) => c.id === updated.id);
    if (idx >= 0) {
      this.courseList[idx] = { ...updated };
      return this.courseList[idx];
    }
    this.courseList.push({ ...updated });
    return updated;
  }

  async createCourse(actor: SessionUser, newCourse: Course): Promise<Course> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only owner or super admin can create new courses."
      );
    }
    this.courseList.push({ ...newCourse });
    return newCourse;
  }
}
