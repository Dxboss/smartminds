"use server";

import fs from "fs";
import path from "path";
import { siteConfig } from "@/content/siteConfig";
import {
  freeAdviceSchema,
  fundedEligibilitySchema,
  privateTutoringSchema,
  generalContactSchema,
  AnyLeadInput,
} from "@/lib/validation/leadSchemas";

export interface LeadSubmissionResult {
  success: boolean;
  message?: string;
  leadId?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Persists lead to local dev storage if Supabase credentials are not yet configured.
 */
function recordDevLead(leadData: Record<string, unknown>) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "dev_leads.json");
    let leads: Array<Record<string, unknown>> = [];
    if (fs.existsSync(filePath)) {
      try {
        leads = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch {
        leads = [];
      }
    }
    leads.unshift(leadData);
    fs.writeFileSync(filePath, JSON.stringify(leads, null, 2));
  } catch (err) {
    console.error("[dev_leads] Error writing local dev lead:", err);
  }
}

/**
 * Records dispatched email to local dev outbox if Resend is in test/unconfigured mode.
 */
function recordDevEmail(emailData: Record<string, unknown>) {
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
    emails.unshift(emailData);
    fs.writeFileSync(filePath, JSON.stringify(emails, null, 2));
  } catch (err) {
    console.error("[dev_emails] Error writing local dev email:", err);
  }
}

/**
 * Sends notification and auto-reply emails via Resend or test outbox.
 */
async function sendEmails(lead: {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string;
  course_interest?: string;
  message?: string;
  extra_data?: Record<string, unknown>;
  utm_source?: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "admissions@smartmindstraining.co.uk";
  const ownerEmail = process.env.OWNER_EMAIL || siteConfig.contact.email;

  // 1. Email to College Owner
  const ownerSubject = `[New Lead: ${lead.type}] ${lead.name} - ${lead.course_interest || "General Enquiry"}`;
  const ownerBodyText = `New enquiry received on Smartminds website:
Type: ${lead.type}
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || "Not provided"}
Course: ${lead.course_interest || "N/A"}
Message: ${lead.message || "None"}
Details: ${JSON.stringify(lead.extra_data || {}, null, 2)}
UTM Source: ${lead.utm_source || "direct"}
Lead ID: ${lead.id}
`;

  // 2. Auto-reply to Visitor
  const visitorSubject =
    "We have received your enquiry - Smartminds Training College";
  const visitorBodyText = `Hello ${lead.name},

Thank you for contacting Smartminds Training College. We have received your enquiry regarding ${
    lead.course_interest || "our accredited courses"
  }.

One of our academic advisers will review your details and contact you within one working day to answer your questions and guide you through entry requirements and flexible payment options.

If you have urgent questions, you can also reach our team directly via WhatsApp:
${siteConfig.contact.whatsappUrl}

Opening hours: ${siteConfig.contact.openingHours}
Phone: ${siteConfig.contact.phoneDisplay}

Warm regards,
Admissions Team
Smartminds Training College
${siteConfig.legalLine}
`;

  if (resendApiKey) {
    try {
      // Send owner notification
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: ownerEmail,
          subject: ownerSubject,
          text: ownerBodyText,
        }),
      });

      // Send visitor auto-reply
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: lead.email,
          subject: visitorSubject,
          text: visitorBodyText,
        }),
      });
    } catch (error) {
      console.error("[Resend] Error calling Resend API:", error);
    }
  }

  // Always record in local dev outbox for verification and test suites
  recordDevEmail({
    to: ownerEmail,
    subject: ownerSubject,
    body: ownerBodyText,
    sentAt: new Date().toISOString(),
  });
  recordDevEmail({
    to: lead.email,
    subject: visitorSubject,
    body: visitorBodyText,
    sentAt: new Date().toISOString(),
  });
}

/**
 * Universal Server Action to process and validate any of the 4 enquiry forms.
 */
export async function submitLeadAction(
  rawInput: Record<string, unknown>
): Promise<LeadSubmissionResult> {
  const formType = (rawInput.type as string) || "free_advice";

  // 1. Zod Validation per form type
  let parsed: AnyLeadInput;
  try {
    switch (formType) {
      case "free_advice":
        parsed = freeAdviceSchema.parse(rawInput);
        break;
      case "funded_eligibility":
        parsed = fundedEligibilitySchema.parse(rawInput);
        break;
      case "private_tutoring":
        parsed = privateTutoringSchema.parse(rawInput);
        break;
      case "general_contact":
        parsed = generalContactSchema.parse(rawInput);
        break;
      default:
        parsed = freeAdviceSchema.parse(rawInput);
    }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "flatten" in err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const zodErr = err as any;
      return {
        success: false,
        message: "Please correct the highlighted errors before submitting.",
        fieldErrors: zodErr.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      message: "Validation failed. Please verify your details.",
    };
  }

  // 2. Anti-spam check (honeypot)
  if (parsed.botCheck && parsed.botCheck.length > 0) {
    // Silently return success to fool bots
    return {
      success: true,
      message: "Thank you for your enquiry.",
      leadId: "bot-filtered",
    };
  }

  // 3. Strict consent check (PRD Section 14 & Prompt 7 Done When criteria)
  if (parsed.consent !== true) {
    return {
      success: false,
      message:
        "Consent to the Privacy Policy is required to submit your enquiry.",
    };
  }

  // Generate lead ID & timestamp
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const consent_at = new Date().toISOString();

  // Extract extra data based on type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = parsed as any;
  const extra_data: Record<string, unknown> = {};
  if (p.preferred_time) extra_data.preferred_time = p.preferred_time;
  if (p.employment_status) extra_data.employment_status = p.employment_status;
  if (p.prior_qualification)
    extra_data.prior_qualification = p.prior_qualification;
  if (p.postcode) extra_data.postcode = p.postcode;
  if (p.student_name) extra_data.student_name = p.student_name;
  if (p.student_year_group)
    extra_data.student_year_group = p.student_year_group;
  if (p.subject_interest) extra_data.subject_interest = p.subject_interest;
  if (p.subject) extra_data.subject = p.subject;

  const leadRow = {
    id: leadId,
    type: parsed.type,
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone || null,
    course_interest: p.course_interest || p.subject_interest || null,
    message: p.message || null,
    extra_data,
    utm_source: parsed.utm_source || null,
    utm_medium: parsed.utm_medium || null,
    utm_campaign: parsed.utm_campaign || null,
    utm_term: parsed.utm_term || null,
    utm_content: parsed.utm_content || null,
    source_page: parsed.source_page || "/",
    consent_at,
    status: "new",
    created_at: consent_at,
  };

  // 4. Save to Supabase if configured
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(leadRow),
      });
    } catch (dbError) {
      console.error("[Supabase] Error inserting lead to database:", dbError);
    }
  }

  // Always record local dev lead for offline/dev verification
  recordDevLead(leadRow);

  // 5. Send Resend notification and auto-reply
  await sendEmails({
    id: leadId,
    type: parsed.type,
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    course_interest: leadRow.course_interest || undefined,
    message: leadRow.message || undefined,
    extra_data,
    utm_source: parsed.utm_source,
  });

  return {
    success: true,
    leadId,
    message:
      "Thank you! Your enquiry has been received. An academic adviser will contact you shortly.",
  };
}
