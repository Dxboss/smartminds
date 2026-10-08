import { FeedbackRepo } from "../interfaces";
import { FeedbackItem, PermissionDeniedError, SessionUser } from "../types";
import { seedFeedback } from "../seedData";

export class MemoryFeedbackRepo implements FeedbackRepo {
  private feedbackList: FeedbackItem[] = [...seedFeedback];

  async submitFeedback(
    item: Omit<FeedbackItem, "id" | "createdAt" | "status">
  ): Promise<FeedbackItem> {
    const newItem: FeedbackItem = {
      ...item,
      id: `fb-${(this.feedbackList.length + 1).toString().padStart(3, "0")}`,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    this.feedbackList.push(newItem);
    return { ...newItem };
  }

  async listFeedback(actor: SessionUser): Promise<FeedbackItem[]> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can review feedback entries."
      );
    }
    return this.feedbackList.map((f) => ({ ...f }));
  }

  async updateFeedbackStatus(
    actor: SessionUser,
    id: string,
    status: FeedbackItem["status"]
  ): Promise<FeedbackItem> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can update feedback triage status."
      );
    }
    const item = this.feedbackList.find((f) => f.id === id);
    if (!item) throw new Error(`Feedback item ${id} not found.`);
    item.status = status;
    return { ...item };
  }
}
