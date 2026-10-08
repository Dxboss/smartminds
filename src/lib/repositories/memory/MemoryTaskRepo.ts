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
}
