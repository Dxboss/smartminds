import { LearnerRepo } from "../interfaces";
import { Learner, PermissionDeniedError, SessionUser } from "../types";
import { seedLearners, seedClasses, seedEnrolments } from "../seedData";

export class MemoryLearnerRepo implements LearnerRepo {
  private learners: Learner[] = [...seedLearners];

  private getLearnerIdsForTutor(tutorId?: string): Set<string> {
    if (!tutorId) return new Set();
    const tutorClassIds = new Set(
      seedClasses.filter((c) => c.tutorId === tutorId).map((c) => c.id)
    );
    const learnerIds = seedEnrolments
      .filter((e) => tutorClassIds.has(e.classId))
      .map((e) => e.learnerId);
    return new Set(learnerIds);
  }

  async listLearners(actor: SessionUser): Promise<Learner[]> {
    if (actor.role === "student") {
      throw new PermissionDeniedError(
        "Students are strictly prohibited from listing other learners."
      );
    }

    if (actor.role === "tutor") {
      const allowedLearnerIds = this.getLearnerIdsForTutor(actor.tutorId);
      return this.learners
        .filter((l) => allowedLearnerIds.has(l.id))
        .map((l) => ({ ...l }));
    }

    // admin_staff, owner_admin, super_admin
    return this.learners.map((l) => ({ ...l }));
  }

  async getLearnerById(
    actor: SessionUser,
    id: string
  ): Promise<Learner | null> {
    if (actor.role === "student") {
      if (actor.learnerId !== id) {
        throw new PermissionDeniedError(
          "Students may only access their own learner record."
        );
      }
    } else if (actor.role === "tutor") {
      const allowedLearnerIds = this.getLearnerIdsForTutor(actor.tutorId);
      if (!allowedLearnerIds.has(id)) {
        throw new PermissionDeniedError(
          "Tutors may only access learners enrolled in their assigned classes."
        );
      }
    }

    const found = this.learners.find((l) => l.id === id);
    return found ? { ...found } : null;
  }

  async updateLearnerStatus(
    actor: SessionUser,
    id: string,
    status: "active" | "paused" | "archived",
    archiveReason?: string
  ): Promise<Learner> {
    if (actor.role !== "admin_staff" && actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only administrative staff and owner admin can modify learner status."
      );
    }

    const learner = this.learners.find((l) => l.id === id);
    if (!learner) {
      throw new Error(`Learner with id ${id} not found.`);
    }

    learner.accessStatus = status;
    if (status === "archived") {
      learner.archivedAt = new Date().toISOString();
      if (archiveReason) learner.archiveReason = archiveReason;
    } else {
      delete learner.archivedAt;
      delete learner.archiveReason;
    }

    // Also update seedLearners in-memory reference if present
    const seedMatch = seedLearners.find((s) => s.id === id);
    if (seedMatch) {
      seedMatch.accessStatus = status;
      if (status === "archived") {
        seedMatch.archivedAt = learner.archivedAt;
        seedMatch.archiveReason = learner.archiveReason;
      } else {
        delete seedMatch.archivedAt;
        delete seedMatch.archiveReason;
      }
    }

    return { ...learner };
  }
}
