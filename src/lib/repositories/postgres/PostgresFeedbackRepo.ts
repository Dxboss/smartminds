import { sql } from "../../db";
import { FeedbackRepo } from "../interfaces";
import { FeedbackItem, PermissionDeniedError, SessionUser } from "../types";

export class PostgresFeedbackRepo implements FeedbackRepo {
  async submitFeedback(
    item: Omit<FeedbackItem, "id" | "createdAt" | "status">
  ): Promise<FeedbackItem> {
    const id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();
    const status: FeedbackItem["status"] = "new";

    await sql`
      INSERT INTO feedback (id, page_url, reviewer_name, role, comment, status, data, created_at)
      VALUES (
        ${id},
        ${item.pageUrl || null},
        ${item.reviewerName || null},
        ${item.role || null},
        ${item.note || ""},
        ${status},
        ${JSON.stringify({ ...item, id, createdAt: nowIso, status })}::jsonb,
        ${nowIso}
      )
    `;

    return {
      id,
      pageUrl: item.pageUrl,
      role: item.role,
      reviewerName: item.reviewerName,
      note: item.note,
      status,
      createdAt: nowIso,
    };
  }

  async listFeedback(actor: SessionUser): Promise<FeedbackItem[]> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can review feedback entries."
      );
    }

    const rows = (await sql`
      SELECT id, page_url, reviewer_name, role, comment, status, data, created_at
      FROM feedback
      ORDER BY created_at DESC
      LIMIT 300
    `) as any[];

    return rows.map((r) => {
      const extra = r.data && typeof r.data === "object" ? r.data : {};
      return {
        id: r.id,
        pageUrl: r.page_url || extra.pageUrl || "",
        role: (r.role || extra.role || "student") as any,
        reviewerName: r.reviewer_name || extra.reviewerName || "Anonymous",
        note: r.comment || extra.note || "",
        status: (r.status as FeedbackItem["status"]) || "new",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });
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

    const rows = (await sql`
      SELECT id, page_url, reviewer_name, role, comment, status, data, created_at
      FROM feedback
      WHERE id = ${id}
      LIMIT 1
    `) as any[];

    if (!rows || rows.length === 0) {
      throw new Error(`Feedback item ${id} not found.`);
    }

    const current = rows[0];
    const extra = current.data && typeof current.data === "object" ? current.data : {};
    extra.status = status;

    await sql`
      UPDATE feedback
      SET status = ${status},
          data = ${JSON.stringify(extra)}::jsonb
      WHERE id = ${id}
    `;

    return {
      id: current.id,
      pageUrl: current.page_url || extra.pageUrl || "",
      role: (current.role || extra.role || "student") as any,
      reviewerName: current.reviewer_name || extra.reviewerName || "Anonymous",
      note: current.comment || extra.note || "",
      status,
      createdAt: current.created_at ? new Date(current.created_at).toISOString() : new Date().toISOString(),
    };
  }
}
