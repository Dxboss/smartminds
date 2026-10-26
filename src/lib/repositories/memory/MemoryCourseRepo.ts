import { courses } from "@/content/courses";
import { Course } from "@/content/types";
import { CourseRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";
import {
  getLiveCourses,
  savePersistedCourse,
  deletePersistedCourse,
  pullLatestFromNeon,
} from "@/lib/persistedData";

export class MemoryCourseRepo implements CourseRepo {
  private courseList: Course[] = [];

  constructor() {
    this.hydrateFromStore();
  }

  private hydrateFromStore() {
    try {
      this.courseList = getLiveCourses();
    } catch {
      this.courseList = [...courses];
    }
  }

  async listCourses(): Promise<Course[]> {
    try {
      await pullLatestFromNeon();
    } catch {}
    this.hydrateFromStore();
    return [...this.courseList];
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    try {
      await pullLatestFromNeon();
    } catch {}
    this.hydrateFromStore();
    const found = this.courseList.find((c) => c.slug === slug);
    return found ? { ...found } : null;
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      await pullLatestFromNeon();
    } catch {}
    this.hydrateFromStore();
    const found = this.courseList.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  async updateCourse(actor: SessionUser, updated: Course): Promise<Course> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin" && actor.role !== "admin_staff") {
      throw new PermissionDeniedError(
        "Administrative privileges required to edit courses."
      );
    }
    const idx = this.courseList.findIndex((c) => c.id === updated.id);
    if (idx >= 0) {
      this.courseList[idx] = { ...updated };
      await savePersistedCourse(this.courseList[idx]);
      return this.courseList[idx];
    }
    this.courseList.push({ ...updated });
    await savePersistedCourse(updated);
    return updated;
  }

  async createCourse(actor: SessionUser, newCourse: Course): Promise<Course> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin" && actor.role !== "admin_staff") {
      throw new PermissionDeniedError(
        "Administrative privileges required to create new courses."
      );
    }
    this.courseList.push({ ...newCourse });
    await savePersistedCourse(newCourse);
    return newCourse;
  }

  async deleteCourse(actor: SessionUser, id: string): Promise<boolean> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin" && actor.role !== "admin_staff") {
      throw new PermissionDeniedError(
        "Administrative privileges required to delete courses."
      );
    }
    const idx = this.courseList.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.courseList.splice(idx, 1);
      await deletePersistedCourse(id);
      return true;
    }
    return false;
  }
}
