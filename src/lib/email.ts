import fs from "fs";
import path from "path";
import { demoOutbox } from "@/lib/repositories/seedData";
import { siteConfig } from "@/content/siteConfig";
import {
  getEmailSettings,
  getDepartmentSender,
  DepartmentKey,
} from "@/lib/emailSettings";

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 string
  content_id?: string;
  contentId?: string;
  content_type?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  department?: DepartmentKey;
  replyTo?: string;
  templateKey?: string;
  triggerEvent?: string;
  recipientName?: string;
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  dispatchedVia: "resend" | "dev_outbox";
  error?: string;
}

// In-memory cache for base64 encoded logos
let cachedWhiteLogoBase64: string | null = null;
let cachedColorLogoBase64: string | null = null;

function getLogoBase64(filename: string): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", filename);
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath).toString("base64");
    }
  } catch (err) {
    console.warn(`[email] Could not read logo asset public/images/${filename}:`, err);
  }
  return null;
}

/**
 * Centralized email dispatcher for Smartminds Training College.
 * 
 * 1. Resolves departmental sender settings from Superadmin configuration.
 * 2. Prepares inline CID attachments for logos so images render reliably in all email clients.
 * 3. Records every email into local `data/dev_emails.json` and in-memory `demoOutbox`.
 * 4. If `RESEND_API_KEY` is configured, dispatches live email via Resend API.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const primaryRecipient = recipients[0] || siteConfig.contact.email;
  const resendApiKey = process.env.RESEND_API_KEY;
  const settings = getEmailSettings();

  // 1. Resolve departmental sender and display name
  let fromEmail = options.from;
  let replyToEmail = options.replyTo;

  if (!fromEmail) {
    if (options.department) {
      const dept = getDepartmentSender(options.department);
      fromEmail = dept.from;
      replyToEmail = replyToEmail || dept.email;
    } else {
      fromEmail =
        process.env.RESEND_FROM_EMAIL ||
        `${settings.admissions.senderName} <${settings.admissions.email}>`;
    }
  }

  // 2. Prepare inline CID attachments for headers & footers
  const preparedAttachments: EmailAttachment[] = [...(options.attachments || [])];
  const effectiveHtml = options.html;

  if (effectiveHtml?.includes("cid:logo-white")) {
    if (!cachedWhiteLogoBase64) {
      cachedWhiteLogoBase64 = getLogoBase64("logo-white.png");
    }
    if (cachedWhiteLogoBase64) {
      preparedAttachments.push({
        filename: "logo-white.png",
        content: cachedWhiteLogoBase64,
        content_id: "logo-white",
        contentId: "logo-white",
        content_type: "image/png",
      });
    }
  }

  if (effectiveHtml?.includes("cid:logo-color")) {
    if (!cachedColorLogoBase64) {
      cachedColorLogoBase64 = getLogoBase64("logo-color.png");
    }
    if (cachedColorLogoBase64) {
      preparedAttachments.push({
        filename: "logo-color.png",
        content: cachedColorLogoBase64,
        content_id: "logo-color",
        contentId: "logo-color",
        content_type: "image/png",
      });
    }
  }

  // 3. Log to in-memory demo outbox for portal audit
  demoOutbox.unshift({
    id: `outbox-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    recipientEmail: primaryRecipient,
    recipientName: options.recipientName || primaryRecipient.split("@")[0],
    subject: options.subject,
    renderedBody: options.text,
    templateKey: options.templateKey || "notification",
    sentAt: new Date().toISOString(),
    triggerEvent: options.triggerEvent || (options.department ? `Department: ${options.department}` : "System Notification"),
  });

  // 4. Persist to local dev_emails.json
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "dev_emails.json");
    let emails: Array<Record<string, unknown>> = [];
    if (fs.existsSync(filePath)) {
      try {
        emails = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch {
        emails = [];
      }
    }
    emails.unshift({
      to: primaryRecipient,
      from: fromEmail,
      department: options.department || "general",
      subject: options.subject,
      body: options.text,
      sentAt: new Date().toISOString(),
      templateKey: options.templateKey,
      attachmentsCount: preparedAttachments.length,
    });
    fs.writeFileSync(filePath, JSON.stringify(emails.slice(0, 100), null, 2));
  } catch (err) {
    console.error("[dev_emails] Failed to write local email file:", err);
  }

  // 5. Dispatch via live Resend API if API key is provided
  if (resendApiKey && resendApiKey.trim().length > 0) {
    const ownerEmail = process.env.OWNER_EMAIL?.trim();
    const isSandboxDomain = fromEmail.includes("resend.dev");

    let targetRecipients = recipients;
    let effectiveSubject = options.subject;
    let effectiveText = options.text;
    let finalHtml = effectiveHtml;

    const hasExternalRecipients = recipients.some(
      (r) => !ownerEmail || r.toLowerCase() !== ownerEmail.toLowerCase()
    );

    // If using the default Resend sandbox domain (onboarding@resend.dev), route to ownerEmail
    // to prevent Resend test rejection, and display testing notice banner.
    if (isSandboxDomain && ownerEmail && hasExternalRecipients) {
      targetRecipients = [ownerEmail];
      effectiveSubject = `[Test Sandbox -> ${primaryRecipient}] ${options.subject}`;
      const sandboxNotice = `--- RESEND SANDBOX NOTICE ---\nThis email was dispatched via onboarding@resend.dev.\nIntended Recipient: ${primaryRecipient}\nTo send directly to external recipients in production, verify your custom domain at resend.com/domains.\n-----------------------------\n\n`;
      effectiveText = sandboxNotice + options.text;
      if (finalHtml) {
        finalHtml = `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px;margin-bottom:16px;border-radius:4px;font-family:sans-serif;font-size:12px;color:#92400e;"><strong>Resend Sandbox Notice:</strong> Dispatched via <code>${fromEmail}</code>.<br/>Intended Recipient: <strong>${primaryRecipient}</strong><br/>To send directly to external student inboxes, verify your domain at <a href="https://resend.com/domains">resend.com/domains</a>.</div>` + finalHtml;
      }
    }

    const payload: Record<string, unknown> = {
      from: fromEmail,
      to: targetRecipients,
      subject: effectiveSubject,
      text: effectiveText,
      html: finalHtml || effectiveText.replace(/\n/g, "<br/>"),
    };

    if (replyToEmail) {
      payload.reply_to = replyToEmail;
    }

    if (preparedAttachments.length > 0) {
      payload.attachments = preparedAttachments;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[Resend Success] Email delivered via Resend API (ID: ${data.id}) to:`, targetRecipients);
        return {
          success: true,
          id: data.id,
          dispatchedVia: "resend",
        };
      } else {
        const errorText = await response.text();
        console.warn("[Resend API Warning]:", errorText);

        // Fallback: If custom domain isn't verified yet (HTTP 403), retry using sandbox sender with reply-to
        if (response.status === 403 && !fromEmail.includes("resend.dev")) {
          try {
            console.log("[Resend Recovery] Domain not verified yet. Retrying via sandbox sender with Reply-To header...");
            const fallbackFrom = "Smartminds College <onboarding@resend.dev>";
            const retryPayload = {
              ...payload,
              from: fallbackFrom,
              to: ownerEmail ? [ownerEmail] : targetRecipients,
              subject: `[Unverified Domain Fallback] ${effectiveSubject}`,
              reply_to: replyToEmail || settings.admissions.email,
            };
            const retryRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey.trim()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(retryPayload),
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              console.log("[Resend Recovery Success] Delivered via fallback sender:", retryData.id);
              return {
                success: true,
                id: retryData.id,
                dispatchedVia: "resend",
              };
            }
          } catch (retryErr) {
            console.error("[Resend Retry Error]:", retryErr);
          }
        }

        return {
          success: true,
          dispatchedVia: "dev_outbox",
          error: errorText,
        };
      }
    } catch (err) {
      console.error("[Resend API Error]:", err);
      return {
        success: true,
        dispatchedVia: "dev_outbox",
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  return {
    success: true,
    dispatchedVia: "dev_outbox",
  };
}
