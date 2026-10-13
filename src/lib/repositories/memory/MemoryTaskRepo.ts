import { TaskRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser, Task } from "../types";
import { seedTasks } from "../seedData";

export class MemoryTaskRepo implements TaskRepo {
  private tasks: Task[] = [...seedTasks];

  async listTasks(actor: SessionUser): Promise<Task[]> {
    if (actor.role === "student") {
      throw new PermissionDeniedError(
        "Students do not have access to operational tasks."
      );
    }

    if (actor.role === "tutor" || actor.role === "admin_staff") {
      return this.tasks
        .filter((t) => t.assignedToId === actor.id)
        .map((t) => ({ ...t }));
    }

    // owner_admin, super_admin see all tasks
    return this.tasks.map((t) => ({ ...t }));
  }

  async createTask(
    actor: SessionUser,
    data: Omit<Task, "id" | "createdAt" | "isOverdue">
  ): Promise<Task> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can assign operational tasks."
      );
    }

    const newTask: Task = {
      ...data,
      id: `task-${(this.tasks.length + 1).toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      isOverdue: false,
    };
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async markTaskComplete(actor: SessionUser, taskId: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found.`);
    }

    if (
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin" &&
      task.assignedToId !== actor.id
    ) {
      throw new PermissionDeniedError(
        "You can only mark tasks assigned to you as completed."
      );
    }

    task.status = "completed";
    task.completedAt = new Date().toISOString();
    task.isOverdue = false;
    return { ...task };
  }

  async reviewTask(
    actor: SessionUser,
    taskId: string,
    review: {
      feedback: string;
      satisfaction: "satisfied" | "needs_revision" | "unsatisfied";
    }
  ): Promise<Task> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super administrator can review and evaluate staff tasks."
      );
    }

    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found.`);
    }

    task.adminFeedback = review.feedback;
    task.adminSatisfaction = review.satisfaction;
    task.reviewedAt = new Date().toISOString();
    task.reviewedByAdminName = actor.email;

    if (review.satisfaction === "satisfied") {
      task.status = "reviewed";
    } else if (review.satisfaction === "needs_revision") {
      task.status = "in_progress";
    }

    return { ...task };
  }

  async flagTaskRed(
    actor: SessionUser,
    taskId: string,
    reason?: string
  ): Promise<{ task: Task; totalStaffStrikes: number; penaltyTriggered: boolean }> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super administrator can flag overdue directives or issue strikes."
      );
    }

    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found.`);
    }

    task.isRedFlagged = true;
    task.redFlagReason = reason || "Directive not completed within the mandatory deadline.";
    task.redFlaggedAt = new Date().toISOString();
    task.isOverdue = true;

    // Count all red marks for this staff member
    const totalStaffStrikes = this.tasks.filter(
      (t) => t.assignedToId === task.assignedToId && t.isRedFlagged
    ).length;

    const penaltyTriggered = totalStaffStrikes >= 3;

    return {
      task: { ...task },
      totalStaffStrikes,
      penaltyTriggered,
    };
  }

  async applyStaffPenalty(
    actor: SessionUser,
    staffId: string,
    penalty: {
      bonusReductionAmount: number;
      penaltyNote: string;
    }
  ): Promise<{ success: boolean; staffId: string; bonusReductionAmount: number }> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the college owner or super administrator can impose staff bonus penalties."
      );
    }

    // Apply penalty record across all red-flagged tasks for this staff member
    const staffTasks = this.tasks.filter((t) => t.assignedToId === staffId && t.isRedFlagged);
    staffTasks.forEach((t) => {
      t.penaltyApplied = true;
      t.penaltyNote = penalty.penaltyNote;
      t.bonusReductionAmount = penalty.bonusReductionAmount;
    });

    return {
      success: true,
      staffId,
      bonusReductionAmount: penalty.bonusReductionAmount,
    };
  }
}
