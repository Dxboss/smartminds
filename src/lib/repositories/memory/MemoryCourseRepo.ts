import { courses } from "@/content/courses";
import { Course } from "@/content/types";
import { CourseRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";
import {
  getLiveCourses,
  savePersistedCourse,
  deletePersistedCourse,
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
    this.hydrateFromStore();
    return [...this.courseList];
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    this.hydrateFromStore();
    const found = this.courseList.find((c) => c.slug === slug);
    return found ? { ...found } : null;
  }

  async getCourseById(id: string): Promise<Course | null> {
    this.hydrateFromStore();
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
      savePersistedCourse(this.courseList[idx]);
      return this.courseList[idx];
    }
    this.courseList.push({ ...updated });
    savePersistedCourse(updated);
    return updated;
  }

  async createCourse(actor: SessionUser, newCourse: Course): Promise<Course> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only owner or super admin can create new courses."
      );
    }
    this.courseList.push({ ...newCourse });
    savePersistedCourse(newCourse);
    return newCourse;
  }

  async deleteCourse(actor: SessionUser, id: string): Promise<boolean> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only owner or super admin can delete or unpublish courses."
      );
    }
    const idx = this.courseList.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.courseList.splice(idx, 1);
      deletePersistedCourse(id);
      return true;
    }
    return false;
  }
}
