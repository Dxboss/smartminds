import { Task } from "@/lib/repositories/types";
import { TaskRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";
import { sql, isDbConfigured } from "@/lib/db";
import { sanitizeDbError } from "@/lib/migrations";

export class PostgresTaskRepo implements TaskRepo {
  async listTasks(actor: SessionUser): Promise<Task[]> {
    if (actor.role === "student") {
      throw new PermissionDeniedError("Students cannot access staff task delegation records.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      let query;
      if (actor.role === "tutor" || actor.role === "admin_staff") {
        query = sql`
          SELECT data FROM tasks
          WHERE assigned_to_id = ${actor.id} OR assigned_to_name = ${actor.name}
          ORDER BY deadline ASC;
        `;
      } else {
        query = sql`SELECT data FROM tasks ORDER BY deadline ASC;`;
      }

      const rows = (await query) as { data: Task }[];
      const now = new Date();
      return rows.map((r) => {
        const t = r.data;
        t.isOverdue = t.status !== "completed" && new Date(t.deadline) < now;
        return t;
      });
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresTaskRepo] listTasks error:", sanitizeDbError(err));
      throw new Error(`Failed to list tasks: ${sanitizeDbError(err)}`);
    }
  }

  async createTask(
    actor: SessionUser,
    task: Omit<Task, "id" | "createdAt" | "isOverdue">
  ): Promise<Task> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only the College Owner or Super Administrator can delegate operational tasks.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const id = `task-${Date.now()}`;
      const newTask: Task = {
        ...task,
        id,
        status: task.status || "pending",
        isOverdue: new Date(task.deadline) < new Date(),
        createdAt: new Date().toISOString(),
      };

      await sql`
        INSERT INTO tasks (id, title, description, assigned_to_id, assigned_to_name, assigned_by_role, deadline, status, is_overdue, data, created_at, updated_at)
        VALUES (${newTask.id}, ${newTask.title}, ${newTask.description || null}, ${newTask.assignedToId}, ${newTask.assignedToName}, ${newTask.assignedByRole}, ${newTask.deadline}, ${newTask.status}, ${newTask.isOverdue}, ${JSON.stringify(newTask)}::jsonb, now(), now());
      `;

      return newTask;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresTaskRepo] createTask error:", sanitizeDbError(err));
      throw new Error(`Failed to create task: ${sanitizeDbError(err)}`);
    }
  }

  async markTaskComplete(actor: SessionUser, taskId: string): Promise<Task> {
    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT data FROM tasks WHERE id = ${taskId} LIMIT 1;
      `) as { data: Task }[];

      const task = rows[0]?.data;
      if (!task) {
        throw new Error(`Task ${taskId} not found.`);
      }

      if (
        actor.role !== "owner_admin" &&
        actor.role !== "super_admin" &&
        task.assignedToId !== actor.id &&
        task.assignedToName !== actor.name
      ) {
        throw new PermissionDeniedError("You can only complete tasks assigned to you.");
      }

      task.status = "completed";
      task.completedAt = new Date().toISOString();
      task.isOverdue = false;

      await sql`
        UPDATE tasks
        SET status = 'completed',
            is_overdue = false,
            data = ${JSON.stringify(task)}::jsonb,
            updated_at = now()
        WHERE id = ${taskId};
      `;

      return task;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresTaskRepo] markTaskComplete(${taskId}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to complete task: ${sanitizeDbError(err)}`);
    }
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
      throw new PermissionDeniedError("Only the College Owner can review submitted task work.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT data FROM tasks WHERE id = ${taskId} LIMIT 1;
      `) as { data: Task }[];

      const task = rows[0]?.data;
      if (!task) {
        throw new Error(`Task ${taskId} not found.`);
      }

      task.adminSatisfaction = review.satisfaction;
      task.adminFeedback = review.feedback;
      task.reviewedAt = new Date().toISOString();
      task.reviewedByAdminName = actor.email;

      if (review.satisfaction === "satisfied") {
        task.status = "reviewed";
      } else if (review.satisfaction === "needs_revision") {
        task.status = "in_progress";
      }

      await sql`
        UPDATE tasks
        SET status = ${task.status},
            data = ${JSON.stringify(task)}::jsonb,
            updated_at = now()
        WHERE id = ${taskId};
      `;

      return task;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresTaskRepo] reviewTask(${taskId}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to review task: ${sanitizeDbError(err)}`);
    }
  }

  async flagTaskRed(
    actor: SessionUser,
    taskId: string,
    reason?: string
  ): Promise<{ task: Task; totalStaffStrikes: number; penaltyTriggered: boolean }> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only executive leadership can issue operational strike flags.");
    }

    const task = await this.markTaskComplete(actor, taskId);
    task.isRedFlagged = true;
    task.redFlagReason = reason || "Operational failure flagged by leadership.";
    task.redFlaggedAt = new Date().toISOString();
    task.isOverdue = true;

    return {
      task,
      totalStaffStrikes: 1,
      penaltyTriggered: false,
    };
  }

  async applyStaffPenalty(
    actor: SessionUser,
    staffId: string,
    penalty: { bonusReductionAmount: number; penaltyNote: string }
  ): Promise<{ success: boolean; staffId: string; bonusReductionAmount: number }> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only the College Owner can apply financial penalty deductions.");
    }

    return {
      success: true,
      staffId,
      bonusReductionAmount: penalty.bonusReductionAmount,
    };
  }
}
