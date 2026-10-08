import { TemplateRepo } from "../interfaces";
import {
  MessageLogEntry,
  MessageTemplate,
  PermissionDeniedError,
  SessionUser,
} from "../types";
import { seedTemplates } from "../seedData";

export class MemoryTemplateRepo implements TemplateRepo {
  private templates: MessageTemplate[] = [...seedTemplates];
  private messageLog: MessageLogEntry[] = [];

  async listTemplates(actor: SessionUser): Promise<MessageTemplate[]> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only staff and administrators can view approved message templates."
      );
    }
    return this.templates.map((t) => ({ ...t }));
  }

  async createTemplate(
    actor: SessionUser,
    data: Omit<MessageTemplate, "id">
  ): Promise<MessageTemplate> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can define approved message templates."
      );
    }
    const newTmpl: MessageTemplate = {
      ...data,
      id: `tmpl-${(this.templates.length + 1).toString().padStart(3, "0")}`,
    };
    this.templates.push(newTmpl);
    return { ...newTmpl };
  }

  async updateTemplate(
    actor: SessionUser,
    id: string,
    data: Partial<MessageTemplate>
  ): Promise<MessageTemplate> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can modify approved message templates."
      );
    }
    const tmpl = this.templates.find((t) => t.id === id);
    if (!tmpl) throw new Error(`Template with id ${id} not found.`);
    Object.assign(tmpl, data);
    return { ...tmpl };
  }

  async sendMessage(
    actor: SessionUser,
    payload: {
      templateKey: string;
      recipientEmail: string;
      replacements: Record<string, string>;
    }
  ): Promise<MessageLogEntry> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Unauthorized: sender role is not permitted to dispatch template messages."
      );
    }

    const template = this.templates.find((t) => t.key === payload.templateKey);
    if (!template) {
      throw new Error(`Approved template key '${payload.templateKey}' was not found.`);
    }

    // Render body using only allowed placeholders
    let rendered = template.bodyTemplate;
    for (const placeholder of template.allowedPlaceholders) {
      const val = payload.replacements[placeholder] || `[${placeholder}]`;
      rendered = rendered.replace(new RegExp(`\\{${placeholder}\\}`, "g"), val);
    }

    const logEntry: MessageLogEntry = {
      id: `msg-log-${(this.messageLog.length + 1).toString().padStart(3, "0")}`,
      templateId: template.id,
      sentByUserId: actor.id,
      sentByRole: actor.role,
      recipientEmail: payload.recipientEmail,
      subject: template.subject,
      renderedBody: rendered,
      sentAt: new Date().toISOString(),
    };

    this.messageLog.push(logEntry);
    return { ...logEntry };
  }

  async getMessageLog(actor: SessionUser): Promise<MessageLogEntry[]> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner admin or super admin can review dispatched message audit logs."
      );
    }
    return this.messageLog.map((m) => ({ ...m }));
  }
}
