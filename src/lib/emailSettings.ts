import fs from "fs";
import path from "path";

export interface DepartmentSenderConfig {
  email: string;
  senderName: string;
}

export interface EmailAutomationsConfig {
  birthdayDiscountEnabled: boolean;
  birthdayDiscountPercent: number; // e.g., 10 for 10% off
  birthdayPromoCode: string; // e.g. "BIRTHDAY10"
  courseCompletionEmailEnabled: boolean;
  leadAutoReplyEnabled: boolean;
  enrolmentWelcomeEnabled: boolean;
  paymentReceiptEnabled: boolean;
}

export interface EmailSettings {
  admissions: DepartmentSenderConfig;
  finance: DepartmentSenderConfig;
  students: DepartmentSenderConfig;
  security: DepartmentSenderConfig;
  marketing: DepartmentSenderConfig;
  adminNotificationEmail: string;
  automations: EmailAutomationsConfig;
  collegeName: string;
  updatedAt: string;
  updatedBy?: string;
}

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  admissions: {
    email: "admissions@smartmindstraining.co.uk",
    senderName: "Smartminds Admissions",
  },
  finance: {
    email: "finance@smartmindstraining.co.uk",
    senderName: "Smartminds Finance & Accounts",
  },
  students: {
    email: "students@smartmindstraining.co.uk",
    senderName: "Smartminds Student Services",
  },
  security: {
    email: "security@smartmindstraining.co.uk",
    senderName: "Smartminds Account Security",
  },
  marketing: {
    email: "news@smartmindstraining.co.uk",
    senderName: "Smartminds Training College",
  },
  adminNotificationEmail: process.env.OWNER_EMAIL || "thegeorgedigitals@gmail.com",
  automations: {
    birthdayDiscountEnabled: true,
    birthdayDiscountPercent: 10,
    birthdayPromoCode: "BIRTHDAY10",
    courseCompletionEmailEnabled: true,
    leadAutoReplyEnabled: true,
    enrolmentWelcomeEnabled: true,
    paymentReceiptEnabled: true,
  },
  collegeName: "Smartminds Training College",
  updatedAt: new Date().toISOString(),
};

function getSettingsFilePath(): string {
  return path.join(process.cwd(), "data", "email_settings.json");
}

let memoryCache: EmailSettings | null = null;

/**
 * Loads current email settings.
 * Reads from data/email_settings.json with fallback to default settings.
 */
export function getEmailSettings(): EmailSettings {
  if (memoryCache) {
    return memoryCache;
  }

  const filePath = getSettingsFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content) as Partial<EmailSettings>;
      memoryCache = {
        admissions: { ...DEFAULT_EMAIL_SETTINGS.admissions, ...(parsed.admissions || {}) },
        finance: { ...DEFAULT_EMAIL_SETTINGS.finance, ...(parsed.finance || {}) },
        students: { ...DEFAULT_EMAIL_SETTINGS.students, ...(parsed.students || {}) },
        security: { ...DEFAULT_EMAIL_SETTINGS.security, ...(parsed.security || {}) },
        marketing: { ...DEFAULT_EMAIL_SETTINGS.marketing, ...(parsed.marketing || {}) },
        adminNotificationEmail: parsed.adminNotificationEmail || process.env.OWNER_EMAIL || DEFAULT_EMAIL_SETTINGS.adminNotificationEmail,
        automations: { ...DEFAULT_EMAIL_SETTINGS.automations, ...(parsed.automations || {}) },
        collegeName: parsed.collegeName || DEFAULT_EMAIL_SETTINGS.collegeName,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        updatedBy: parsed.updatedBy,
      };
      return memoryCache;
    }
  } catch (err) {
    console.error("[emailSettings] Error reading email settings file:", err);
  }

  memoryCache = { ...DEFAULT_EMAIL_SETTINGS };
  return memoryCache;
}

/**
 * Persists updated email settings to data/email_settings.json.
 */
export function saveEmailSettings(settings: Partial<EmailSettings>, updatedBy?: string): EmailSettings {
  const current = getEmailSettings();
  const updated: EmailSettings = {
    admissions: { ...current.admissions, ...(settings.admissions || {}) },
    finance: { ...current.finance, ...(settings.finance || {}) },
    students: { ...current.students, ...(settings.students || {}) },
    security: { ...current.security, ...(settings.security || {}) },
    marketing: { ...current.marketing, ...(settings.marketing || {}) },
    adminNotificationEmail: settings.adminNotificationEmail || current.adminNotificationEmail,
    automations: { ...current.automations, ...(settings.automations || {}) },
    collegeName: settings.collegeName || current.collegeName,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || current.updatedBy || "super_admin",
  };

  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(getSettingsFilePath(), JSON.stringify(updated, null, 2), "utf-8");
    memoryCache = updated;
  } catch (err) {
    console.error("[emailSettings] Error saving email settings file:", err);
    throw new Error("Failed to persist email settings to storage.");
  }

  return updated;
}

export type DepartmentKey = "admissions" | "finance" | "students" | "security" | "marketing";

/**
 * Formats a ready-to-use RFC 5322 From header: "Display Name <email@domain>"
 */
export function getDepartmentSender(department: DepartmentKey): { from: string; email: string; name: string } {
  const settings = getEmailSettings();
  const dept = settings[department] || settings.admissions;
  return {
    from: `${dept.senderName} <${dept.email}>`,
    email: dept.email,
    name: dept.senderName,
  };
}
