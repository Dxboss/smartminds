import { MessageTemplate, MessageLogEntry } from "@/lib/repositories/types";
import { TemplateRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";
import { sql, isDbConfigured } from "@/lib/db";
import { sanitizeDbError } from "@/lib/migrations";

export class PostgresTemplateRepo implements TemplateRepo {
  async listTemplates(actor: SessionUser): Promise<MessageTemplate[]> {
    if (actor.role === "student") {
      throw new PermissionDeniedError("Students cannot access staff communication templates.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT id, key, title, category, subject, body_template, allowed_placeholders
        FROM message_templates
        ORDER BY title ASC;
      `) as {
        id: string;
        key: string;
        title: string;
        category: MessageTemplate["category"];
        subject: string;
        body_template: string;
        allowed_placeholders: string[];
      }[];

      return rows.map((r) => ({
        id: r.id,
        key: r.key,
        title: r.title,
        category: r.category,
        subject: r.subject,
        bodyTemplate: r.body_template,
        allowedPlaceholders: Array.isArray(r.allowed_placeholders) ? r.allowed_placeholders : [],
      }));
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresTemplateRepo] listTemplates error:", sanitizeDbError(err));
      throw new Error(`Failed to list message templates: ${sanitizeDbError(err)}`);
    }
  }

  async createTemplate(
    actor: SessionUser,
    template: Omit<MessageTemplate, "id">
  ): Promise<MessageTemplate> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only the College Owner can create approved message templates.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const id = `tmpl-${Date.now()}`;
      const newTmpl: MessageTemplate = {
        ...template,
        id,
      };

      await sql`
        INSERT INTO message_templates (id, key, title, category, subject, body_template, allowed_placeholders, updated_at)
        VALUES (${newTmpl.id}, ${newTmpl.key}, ${newTmpl.title}, ${newTmpl.category}, ${newTmpl.subject}, ${newTmpl.bodyTemplate}, ${JSON.stringify(newTmpl.allowedPlaceholders || [])}::jsonb, now());
      `;

      return newTmpl;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresTemplateRepo] createTemplate error:", sanitizeDbError(err));
      throw new Error(`Failed to create template: ${sanitizeDbError(err)}`);
    }
  }

  async updateTemplate(
    actor: SessionUser,
    id: string,
    template: Partial<MessageTemplate>
  ): Promise<MessageTemplate> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only the College Owner can modify approved message templates.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT id, key, title, category, subject, body_template, allowed_placeholders
        FROM message_templates WHERE id = ${id} LIMIT 1;
      `) as any[];

      const existing = rows[0];
      if (!existing) throw new Error(`Template ${id} not found.`);

      const updated: MessageTemplate = {
        id,
        key: template.key || existing.key,
        title: template.title || existing.title,
        category: template.category || existing.category,
        subject: template.subject || existing.subject,
        bodyTemplate: template.bodyTemplate || existing.body_template,
        allowedPlaceholders: template.allowedPlaceholders || existing.allowed_placeholders || [],
      };

      await sql`
        UPDATE message_templates
        SET key = ${updated.key},
            title = ${updated.title},
            category = ${updated.category},
            subject = ${updated.subject},
            body_template = ${updated.bodyTemplate},
            allowed_placeholders = ${JSON.stringify(updated.allowedPlaceholders)}::jsonb,
            updated_at = now()
        WHERE id = ${id};
      `;

      return updated;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error(`[PostgresTemplateRepo] updateTemplate(${id}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to update template: ${sanitizeDbError(err)}`);
    }
  }

  async sendMessage(
    actor: SessionUser,
    payload: {
      templateKey: string;
      recipientEmail: string;
      replacements: Record<string, string>;
    }
  ): Promise<MessageLogEntry> {
    if (actor.role === "student") {
      throw new PermissionDeniedError("Students cannot dispatch staff message templates.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT key, title, subject, body_template, allowed_placeholders
        FROM message_templates WHERE key = ${payload.templateKey} LIMIT 1;
      `) as any[];

      const template = rows[0];
      if (!template) {
        throw new Error(`Approved template '${payload.templateKey}' does not exist.`);
      }

      let renderedBody = template.body_template;
      let renderedSubject = template.subject;

      for (const [key, value] of Object.entries(payload.replacements)) {
        const regex = new RegExp(`\\{${key}\\}`, "g");
        renderedBody = renderedBody.replace(regex, value);
        renderedSubject = renderedSubject.replace(regex, value);
      }

      const logEntry: MessageLogEntry = {
        id: `msg-${Date.now()}`,
        templateId: template.id,
        recipientEmail: payload.recipientEmail,
        subject: renderedSubject,
        renderedBody,
        sentByUserId: actor.id,
        sentByRole: actor.role,
        sentAt: new Date().toISOString(),
      };

      await sql`
        INSERT INTO message_logs (
          id, template_key, recipient_email, recipient_name, subject,
          rendered_body, sent_by_user_id, sent_by_role, status, sent_at, data
        ) VALUES (
          ${logEntry.id},
          ${payload.templateKey},
          ${logEntry.recipientEmail},
          ${payload.replacements["first_name"] || logEntry.recipientEmail},
          ${logEntry.subject},
          ${logEntry.renderedBody},
          ${logEntry.sentByUserId},
          ${logEntry.sentByRole},
          'sent',
          ${logEntry.sentAt},
          ${JSON.stringify(logEntry)}::jsonb
        );
      `;

      return logEntry;
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresTemplateRepo] sendMessage error:", sanitizeDbError(err));
      throw new Error(`Failed to send template message: ${sanitizeDbError(err)}`);
    }
  }

  async getMessageLog(actor: SessionUser): Promise<MessageLogEntry[]> {
    if (actor.role === "student") {
      throw new PermissionDeniedError("Students cannot access communication dispatch logs.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const rows = (await sql`
        SELECT data FROM message_logs ORDER BY sent_at DESC LIMIT 100;
      `) as { data: MessageLogEntry }[];

      return rows.map((r) => r.data);
    } catch (err) {
      if (err instanceof PermissionDeniedError) throw err;
      console.error("[PostgresTemplateRepo] getMessageLog error:", sanitizeDbError(err));
      throw new Error(`Failed to get message log: ${sanitizeDbError(err)}`);
    }
  }
}
