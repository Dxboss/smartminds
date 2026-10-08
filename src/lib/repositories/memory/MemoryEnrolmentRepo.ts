import { EnrolmentRepo } from "../interfaces";
import { Enrolment, PermissionDeniedError, SessionUser } from "../types";
import { seedEnrolments, seedClasses } from "../seedData";

export class MemoryEnrolmentRepo implements EnrolmentRepo {
  private enrolments: Enrolment[] = [...seedEnrolments];

  private getTutorClassIds(tutorId?: string): Set<string> {
    if (!tutorId) return new Set();
    return new Set(
      seedClasses.filter((c) => c.tutorId === tutorId).map((c) => c.id)
    );
  }

  async listEnrolments(
    actor: SessionUser,
    filter?: { learnerId?: string; classId?: string }
  ): Promise<Enrolment[]> {
    let result = [...this.enrolments];

    if (actor.role === "student") {
      if (filter?.learnerId && filter.learnerId !== actor.learnerId) {
        throw new PermissionDeniedError(
          "Students cannot access enrolments of another learner."
        );
      }
      result = result.filter((e) => e.learnerId === actor.learnerId);
    } else if (actor.role === "tutor") {
      const allowedClasses = this.getTutorClassIds(actor.tutorId);
      if (filter?.classId && !allowedClasses.has(filter.classId)) {
        throw new PermissionDeniedError(
          "Tutors cannot view enrolments in classes they do not teach."
        );
      }
      result = result.filter((e) => allowedClasses.has(e.classId));
    }

    if (filter?.learnerId && actor.role !== "student") {
      result = result.filter((e) => e.learnerId === filter.learnerId);
    }

    if (filter?.classId && actor.role !== "tutor") {
      result = result.filter((e) => e.classId === filter.classId);
    }

    return result.map((e) => ({ ...e }));
  }

  async getEnrolmentById(
    actor: SessionUser,
    id: string
  ): Promise<Enrolment | null> {
    const found = this.enrolments.find((e) => e.id === id);
    if (!found) return null;

    if (actor.role === "student" && found.learnerId !== actor.learnerId) {
      throw new PermissionDeniedError(
        "Students cannot view another learner's enrolment."
      );
    }

    if (actor.role === "tutor") {
      const allowedClasses = this.getTutorClassIds(actor.tutorId);
      if (!allowedClasses.has(found.classId)) {
        throw new PermissionDeniedError(
          "Tutors cannot view enrolments outside their assigned classes."
        );
      }
    }

    return { ...found };
  }

  async createEnrolment(
    actor: SessionUser,
    data: Omit<Enrolment, "id">
  ): Promise<Enrolment> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only administrative staff and owner admin can create enrolments."
      );
    }

    const newEnrolment: Enrolment = {
      ...data,
      id: `enrolment-${(this.enrolments.length + 1).toString().padStart(3, "0")}`,
    };
    this.enrolments.push(newEnrolment);
    return { ...newEnrolment };
  }

  async moveLearnerClass(
    actor: SessionUser,
    enrolmentId: string,
    newClassId: string
  ): Promise<Enrolment> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only administrative staff and owner admin can reassign class cohorts."
      );
    }

    const enrolment = this.enrolments.find((e) => e.id === enrolmentId);
    if (!enrolment) {
      throw new Error(`Enrolment with id ${enrolmentId} not found.`);
    }

    const targetClass = seedClasses.find((c) => c.id === newClassId);
    if (!targetClass) {
      throw new Error(`Target class ${newClassId} does not exist.`);
    }

    enrolment.classId = newClassId;
    return { ...enrolment };
  }

  async updateStatus(
    actor: SessionUser,
    enrolmentId: string,
    status: Enrolment["status"]
  ): Promise<Enrolment> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only administrative staff and owner admin can change enrolment status."
      );
    }

    const enrolment = this.enrolments.find((e) => e.id === enrolmentId);
    if (!enrolment) {
      throw new Error(`Enrolment with id ${enrolmentId} not found.`);
    }

    enrolment.status = status;
    return { ...enrolment };
  }
}
