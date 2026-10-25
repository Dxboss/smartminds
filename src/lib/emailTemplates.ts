import { siteConfig } from "@/content/siteConfig";
import { formatCurrency } from "@/content/pricing";
import { getBaseUrl } from "@/lib/baseUrl";

interface BrandedEmailWrapperOptions {
  preheader: string;
  heading: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  badgeText?: string;
  isMarketing?: boolean;
}

/**
 * Generates an email-client compliant, responsive HTML email
 * adhering strictly to the Smartminds Training College design tokens:
 * Navy (#23216B), Gold (#D9B84A), Paper (#FAF8F3), Line (#E6E1D5).
 */
export function wrapBrandedEmailHtml({
  preheader,
  heading,
  bodyHtml,
  ctaText,
  ctaUrl,
  badgeText,
  isMarketing,
}: BrandedEmailWrapperOptions): string {
  const currentYear = new Date().getFullYear();
  const baseUrl = getBaseUrl();

  // Use inline CID attachments by default so email clients (Gmail, Outlook, Apple Mail)
  // render the logos reliably without external proxy or localhost blockers.
  const useCid = process.env.EMAIL_USE_CID !== "false";
  const whiteLogoSrc = useCid
    ? "cid:logo-white"
    : process.env.EMAIL_LOGO_WHITE_URL || `${baseUrl}/images/logo-white.png`;

  const colorLogoSrc = useCid
    ? "cid:logo-color"
    : process.env.EMAIL_LOGO_COLOR_URL || `${baseUrl}/images/logo-color.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF8F3;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1B1B2B;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
    }
    a {
      color: #23216B;
      text-decoration: underline;
    }
    .btn-primary {
      background-color: #23216B;
      color: #FFFFFF !important;
      padding: 14px 28px;
      font-size: 14px;
      font-weight: bold;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
      letter-spacing: 0.5px;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 12px !important;
      }
      .content-card {
        padding: 20px 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F3;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F3; padding: 24px 0;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #E6E1D5; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          
          <!-- Header Banner (Blue Background) -->
          <tr>
            <td style="background-color: #23216B; border-top: 4px solid #D9B84A; padding: 24px 20px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${whiteLogoSrc}" alt="Smartminds Training College" width="115" style="max-width: 115px; width: 115px; height: auto; display: block; margin: 0 auto 12px auto; border: 0;" />
                    <div style="font-size: 11px; font-weight: 700; color: #D9B84A; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;">
                      Official College Communication
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; text-transform: uppercase;">
                      SMARTMINDS TRAINING COLLEGE
                    </div>
                    <div style="font-size: 12px; color: #F3E58A; margin-top: 4px; letter-spacing: 0.5px;">
                      Regulated Vocational Qualifications &amp; Professional Training
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td class="content-card" style="padding: 32px 28px; background-color: #FFFFFF;">
              ${
                badgeText
                  ? `<div style="display: inline-block; background-color: #FAF8F3; border: 1px solid #D9B84A; color: #23216B; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 3px 10px; border-radius: 3px; margin-bottom: 16px;">
                      ${badgeText}
                    </div>`
                  : ""
              }

              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #23216B; line-height: 1.25;">
                ${heading}
              </h1>

              <div style="font-size: 14px; color: #1B1B2B; line-height: 1.65;">
                ${bodyHtml}
              </div>

              ${
                ctaText && ctaUrl
                  ? `<div style="text-align: center; margin: 32px 0 24px 0;">
                      <a href="${ctaUrl}" class="btn-primary" target="_blank" style="background-color: #23216B; color: #FFFFFF !important; padding: 14px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 4px; display: inline-block;">
                        ${ctaText} &rarr;
                      </a>
                      <div style="font-size: 11px; color: #5A5A6E; margin-top: 10px;">
                        Direct link: <a href="${ctaUrl}" style="color: #23216B; word-break: break-all;">${ctaUrl}</a>
                      </div>
                    </div>`
                  : ""
              }

              <!-- Contact & Support Strip -->
              <div style="margin-top: 32px; padding: 16px; background-color: #FAF8F3; border-left: 3px solid #23216B; border-radius: 0 4px 4px 0; font-size: 12px; color: #5A5A6E;">
                <strong style="color: #23216B; display: block; margin-bottom: 4px;">Need Assistance with Your Account?</strong>
                Admissions & Student Services: <a href="tel:${siteConfig.contact.phone.replace(/\s+/g, '')}" style="color: #23216B; font-weight: 600;">${siteConfig.contact.phoneDisplay}</a> |
                WhatsApp: <a href="${siteConfig.contact.whatsappUrl}" style="color: #23216B; font-weight: 600;">${siteConfig.contact.whatsappDisplay}</a> |
                Email: <a href="mailto:${siteConfig.contact.email}" style="color: #23216B; font-weight: 600;">${siteConfig.contact.email}</a>
              </div>
            </td>
          </tr>

          <!-- Footer (Light/Paper Background) -->
          <tr>
            <td style="padding: 24px 28px; background-color: #FAF8F3; border-top: 1px solid #E6E1D5; text-align: center; font-size: 11px; color: #5A5A6E; line-height: 1.6;">
              <div style="text-align: center; margin-bottom: 12px;">
                <img src="${colorLogoSrc}" alt="Smartminds Training College" width="85" style="max-width: 85px; width: 85px; height: auto; display: inline-block; border: 0;" />
              </div>
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #23216B;">
                Smartminds Training College
              </p>
              <p style="margin: 0 0 8px 0;">
                ${siteConfig.contact.address}
              </p>
              <p style="margin: 0; color: #8F8FA0;">
                &copy; ${currentYear} Smartminds Training College. Registered in England &amp; Wales. All rights reserved.
              </p>
              ${
                isMarketing
                  ? `<p style="margin: 10px 0 0 0; color: #8F8FA0; font-size: 10px;">
                      You are receiving this celebratory message as a registered learner of Smartminds Training College.
                      <br />To manage email preferences, contact <a href="mailto:${siteConfig.contact.email}" style="color: #23216B;">${siteConfig.contact.email}</a>.
                    </p>`
                  : ""
              }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Branded Welcome Pack for FIRST-TIME students.
 */
/**
 * Branded Welcome Pack for FIRST-TIME students (Stage 1: Enrolment Confirmation).
 * Confirms timing preference only; cohort day, tutor, and Zoom link follow upon Admissions allocation.
 */
export function buildStudentWelcomeEmail(data: {
  studentName: string;
  studentId: string;
  courseTitle: string;
  levelName: string;
  awardingBody?: string;
  amountCharged: number;
  receiptRef: string;
  paymentPlanLabel: string;
  portalUrl: string;
  loginEmail: string;
  tempPassword?: string;
  preferredTiming?: "afternoon" | "evening" | string;
  cohortDay?: string;
  cohortTime?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Enrolment Confirmed: Welcome to Smartminds Training College (${data.studentId})`;

  const timingPreferenceLabel =
    data.preferredTiming === "afternoon"
      ? "Afternoon Session (14:00 – 16:00 UK Time)"
      : data.preferredTiming === "evening"
      ? "Evening Session (18:30 – 20:30 UK Time)"
      : data.cohortTime || "Evening Session (18:30 – 20:30 UK Time)";

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>Congratulations and welcome! Your enrolment in <strong>${data.courseTitle} (${data.levelName})</strong> has been successfully processed, and your official student profile is now <strong>active</strong>.</p>

    <!-- Registration Details Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 40%;">Official Student ID:</td>
        <td style="font-weight: 700; color: #23216B; font-family: monospace; font-size: 14px; border-bottom: 1px solid #E6E1D5;">${data.studentId}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Qualification:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.courseTitle} (${data.levelName})</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Awarding Organisation:</td>
        <td style="color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.awardingBody || "TQUK"} (Regulated by Ofqual)</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Preferred Study Window:</td>
        <td style="font-weight: 600; color: #23216B; border-bottom: 1px solid #E6E1D5;">${timingPreferenceLabel}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Payment Collected:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${formatCurrency(data.amountCharged)}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Receipt Reference:</td>
        <td style="font-family: monospace; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.receiptRef}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Payment Plan:</td>
        <td style="color: #1B1B2B;">${data.paymentPlanLabel}</td>
      </tr>
    </table>

    <h2 style="font-size: 16px; font-weight: 700; color: #23216B; margin: 24px 0 8px 0;">Your Student Portal Credentials</h2>
    <p>Your interactive learning dashboard has been created with these initial credentials:</p>
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 14px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Portal URL:</td>
        <td style="border-bottom: 1px solid #E6E1D5;"><a href="${data.portalUrl}" style="color: #23216B; font-weight: bold;">${data.portalUrl}</a></td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Username / Login:</td>
        <td style="font-family: monospace; font-size: 13px; color: #23216B; font-weight: bold; border-bottom: 1px solid #E6E1D5;">${data.loginEmail}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Temporary Password:</td>
        <td style="font-family: monospace; font-size: 14px; color: #23216B; font-weight: 800; letter-spacing: 1px;">
          ${data.tempPassword || "Supplied on account creation"}
        </td>
      </tr>
    </table>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 12px; border-radius: 4px; margin: 12px 0 20px 0; font-size: 12px; color: #1E40AF;">
      <strong>First-Time Login Security:</strong> When you sign into your portal using this temporary password, the system will automatically prompt you to choose your own permanent, private password.
    </div>

    <h2 style="font-size: 16px; font-weight: 700; color: #23216B; margin: 24px 0 8px 0;">What Happens Next?</h2>
    <ol style="padding-left: 20px; margin: 8px 0 16px 0; color: #1B1B2B; line-height: 1.6;">
      <li><strong>Class Schedule & Cohort Allocation:</strong> You have selected your preferred study window (<strong>${timingPreferenceLabel}</strong>). College Admissions will review your group allocation and confirm your specific cohort day of the week, starting induction date, designated course tutor, and permanent Zoom link within 24–48 hours via email.</li>
      <li><strong>Explore Your Student Portal:</strong> Log into the student portal right away to view your course curriculum, unit learning outcomes, and student handbook.</li>
      <li><strong>Dedicated Tutor Support:</strong> Your assigned tutor will support you throughout your qualification, review draft submissions, and provide guidance before final grading.</li>
      <li><strong>24/7 Catch-Up Recordings:</strong> All live cohort webinars are automatically recorded and made available in your portal for stream-only revision.</li>
    </ol>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Welcome to Smartminds College! Student ID: ${data.studentId} — Course: ${data.courseTitle}`,
    heading: "Welcome to Smartminds Training College",
    badgeText: "Official Enrolment Confirmed",
    bodyHtml,
    ctaText: "Access Your Student Portal",
    ctaUrl: data.portalUrl,
  });

  const text = `Dear ${data.studentName},

Congratulations and welcome to Smartminds Training College!
Your enrolment in ${data.courseTitle} (${data.levelName}) is now ACTIVE.

STUDENT REGISTRATION:
- Student ID: ${data.studentId}
- Course: ${data.courseTitle} (${data.levelName})
- Awarding Organisation: ${data.awardingBody || "TQUK"} (Regulated by Ofqual)
- Preferred Study Window: ${timingPreferenceLabel}
- Payment Collected: ${formatCurrency(data.amountCharged)}
- Receipt Reference: ${data.receiptRef}
- Plan: ${data.paymentPlanLabel}

PORTAL ACCESS CREDENTIALS:
- Portal URL: ${data.portalUrl}
- Username: ${data.loginEmail}
- Temporary Password: ${data.tempPassword || "N/A"}
(You will be prompted to set your permanent password upon your first sign in.)

WHAT HAPPENS NEXT:
Admissions is allocating your study group based on your preferred time (${timingPreferenceLabel}). You will receive a follow-up email confirming your exact day of the week, starting date, course tutor, and permanent Zoom classroom link within 24–48 hours.

Warm regards,
Admissions & Learner Services
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Stage 2: Cohort Allocation & Schedule Confirmation Email.
 * Triggered by Admissions when assigning a student to a specific cohort, day of week, tutor, and recurring Zoom link.
 */
export function buildCohortAssignmentEmail(data: {
  studentName: string;
  studentId: string;
  courseTitle: string;
  levelName: string;
  cohortName: string;
  scheduleDescription: string;
  tutorName: string;
  zoomLink?: string;
  portalUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Class Schedule Confirmed: Cohort Allocation for ${data.courseTitle} (${data.studentId})`;
  const zoomDisplay = data.zoomLink || "https://zoom.us/j/smartminds-live-classroom";

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>Your class schedule and tutor assignment for <strong>${data.courseTitle} (${data.levelName})</strong> have now been confirmed by College Admissions.</p>

    <!-- Cohort & Timetable Card -->
    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #D9B84A; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Assigned Cohort:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.cohortName}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Weekly Class Schedule:</td>
        <td style="font-weight: 700; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.scheduleDescription}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Assigned Course Tutor:</td>
        <td style="font-weight: 600; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.tutorName}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Live Virtual Classroom:</td>
        <td>
          <a href="${data.portalUrl}" style="color: #23216B; font-weight: bold; text-decoration: underline;">
            Enter via Student Portal
          </a>
          <div style="font-size: 11px; color: #5A5A6E; margin-top: 4px;">
            Log in to your authenticated student dashboard to join live Zoom seminars with one click.
          </div>
        </td>
      </tr>
    </table>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px; border-radius: 4px; margin: 16px 0; font-size: 13px; color: #1E40AF; line-height: 1.5;">
      <strong>Secure Live Classroom Entry:</strong> To ensure cohort security and academic integrity, live seminar links are accessible exclusively from your verified <strong>Student Portal Dashboard</strong>.
    </div>

    <h2 style="font-size: 16px; font-weight: 700; color: #23216B; margin: 24px 0 8px 0;">Preparation for Your First Session</h2>
    <ul style="padding-left: 20px; margin: 8px 0 16px 0; color: #1B1B2B; line-height: 1.6;">
      <li>Please test your audio and video connection 5–10 minutes prior to session start.</li>
      <li>Have your learner workbook and unit specification ready from your portal.</li>
      <li>Sessions are interactive; questions and discussions are actively encouraged.</li>
    </ul>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Class Schedule Confirmed: ${data.cohortName} — Tutor: ${data.tutorName}`,
    heading: "Your Cohort Timetable is Ready",
    badgeText: "Class Schedule Confirmed",
    bodyHtml,
    ctaText: "Enter Student Portal",
    ctaUrl: data.portalUrl,
  });

  const text = `Dear ${data.studentName},

Your class schedule and tutor assignment for ${data.courseTitle} (${data.levelName}) are now confirmed.

COHORT DETAILS:
- Assigned Cohort: ${data.cohortName}
- Weekly Schedule: ${data.scheduleDescription}
- Assigned Tutor: ${data.tutorName}
- Live Classroom Access: Accessible directly via your Student Portal Dashboard

Log in to your Student Portal to join your live classes:
${data.portalUrl}

Warm regards,
Admissions & Academic Operations
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Cohort Schedule Update Notification Email.
 * Sent to all students in a cohort when a tutor or administrator updates class timings or the Zoom link.
 */
export function buildCohortScheduleUpdateEmail(data: {
  studentName: string;
  courseTitle: string;
  cohortName: string;
  newScheduleDescription: string;
  newZoomLink?: string;
  tutorName: string;
  updateReason?: string;
  portalUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Schedule Update: Class Timetable for ${data.cohortName}`;

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>Please note that an update has been made to the schedule details for your cohort, <strong>${data.cohortName}</strong> (${data.courseTitle}).</p>

    <!-- Updated Schedule Card -->
    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #D9B84A; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Cohort:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.cohortName}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Updated Schedule:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.newScheduleDescription}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Course Tutor:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.tutorName}</td>
      </tr>
      ${
        data.updateReason
          ? `<tr>
              <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Note / Reason:</td>
              <td style="color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.updateReason}</td>
            </tr>`
          : ""
      }
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Live Virtual Classroom:</td>
        <td>
          <a href="${data.portalUrl}" style="color: #23216B; font-weight: bold; text-decoration: underline;">
            Enter via Student Portal
          </a>
          <div style="font-size: 11px; color: #5A5A6E; margin-top: 4px;">
            Log in to your authenticated student dashboard to join live Zoom seminars.
          </div>
        </td>
      </tr>
    </table>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 12px; color: #1E40AF;">
      Your Student Portal dashboard has been automatically updated to reflect this schedule. To ensure student cohort security, live seminar links are accessible exclusively from within your student portal.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Schedule Update: ${data.cohortName} now scheduled for ${data.newScheduleDescription}`,
    heading: "Cohort Timetable Update",
    badgeText: "Schedule Notice",
    bodyHtml,
    ctaText: "Check Student Portal",
    ctaUrl: data.portalUrl,
  });

  const text = `Dear ${data.studentName},

Please note an update to the schedule for ${data.cohortName} (${data.courseTitle}):

- Updated Timetable: ${data.newScheduleDescription}
- Course Tutor: ${data.tutorName}
${data.updateReason ? `- Reason: ${data.updateReason}\n` : ""}- Live Classroom Access: Accessible via your Student Portal: ${data.portalUrl}

Your timetable is updated in your student portal:
${data.portalUrl}

Warm regards,
Academic Operations
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Branded Confirmation for RETURNING students adding an additional course.
 */
export function buildCourseAddedEmail(data: {
  studentName: string;
  studentId: string;
  courseTitle: string;
  levelName: string;
  awardingBody?: string;
  amountCharged: number;
  receiptRef: string;
  paymentPlanLabel: string;
  portalUrl: string;
  loginEmail: string;
}): { subject: string; html: string; text: string } {
  const subject = `Course Added: ${data.courseTitle} is Now Active on Your Account (${data.studentId})`;

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>Welcome back! We are pleased to confirm that your new qualification, <strong>${data.courseTitle} (${data.levelName})</strong>, has been successfully activated and added directly to your existing student portal.</p>

    <!-- Registration Details Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 40%;">Official Student ID:</td>
        <td style="font-weight: 700; color: #23216B; font-family: monospace; font-size: 14px; border-bottom: 1px solid #E6E1D5;">${data.studentId}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">New Qualification:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.courseTitle} (${data.levelName})</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Payment Collected:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${formatCurrency(data.amountCharged)}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Receipt Reference:</td>
        <td style="font-family: monospace; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.receiptRef}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Payment Plan:</td>
        <td style="color: #1B1B2B;">${data.paymentPlanLabel}</td>
      </tr>
    </table>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #1E40AF;">
      <strong>Unified Login Notice:</strong> Because you are an existing learner, you do not need to create a new password or manage separate accounts. Sign in using your existing username (<code>${data.loginEmail}</code>) and your current password to switch between your enrolled courses.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Course Added: ${data.courseTitle} is now available in your portal!`,
    heading: "Additional Course Activated",
    badgeText: "Existing Student Update",
    bodyHtml,
    ctaText: "View Your Courses in Student Portal",
    ctaUrl: `${data.portalUrl}/courses`,
  });

  const text = `Dear ${data.studentName},

Welcome back to Smartminds Training College!
Your new qualification, ${data.courseTitle} (${data.levelName}), is now active on your student portal.

STUDENT RECORD:
- Student ID: ${data.studentId}
- New Course: ${data.courseTitle} (${data.levelName})
- Payment Collected: ${formatCurrency(data.amountCharged)}
- Receipt Reference: ${data.receiptRef}
- Plan: ${data.paymentPlanLabel}

UNIFIED LOGIN:
You can log into your portal at ${data.portalUrl} with your existing email (${data.loginEmail}) and current password.

Warm regards,
Admissions & Learner Services
Smartminds Training College
`;

  return { subject, html, text };
}

/**
 * Branded Password Reset Instructions email.
 */
export function buildPasswordResetEmail(data: {
  recipientName: string;
  email: string;
  resetLink: string;
  expiresMinutes: number;
}): { subject: string; html: string; text: string } {
  const subject = "Password Reset Instructions — Smartminds Training College";

  const bodyHtml = `
    <p>Dear <strong>${data.recipientName}</strong>,</p>
    <p>We received an automated request to reset the password associated with your Smartminds Training College portal account (<code>${data.email}</code>).</p>
    <p>Click the button below to securely choose your new password. This link is valid for <strong>${data.expiresMinutes} minutes</strong> and can only be used once.</p>
    
    <div style="background-color: #FAF8F3; border: 1px solid #E6E1D5; padding: 14px; border-radius: 4px; margin: 20px 0; font-size: 12px; color: #5A5A6E;">
      <strong>Security notice:</strong> If you did not request a password reset, you can safely ignore this email. Your existing credentials remain completely secure and unchanged.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: "Reset instructions for your Smartminds Training College account.",
    heading: "Reset Your Portal Password",
    badgeText: "Security Verification",
    bodyHtml,
    ctaText: "Set New Password",
    ctaUrl: data.resetLink,
  });

  const text = `Dear ${data.recipientName},

We received a request to reset the password for your Smartminds Training College account (${data.email}).

Click the link below to choose a new password:
${data.resetLink}

This link is valid for ${data.expiresMinutes} minutes. If you did not request this, you can safely ignore this message.

Warm regards,
Admissions & IT Support Team
Smartminds Training College
`;

  return { subject, html, text };
}

/**
 * Security notification confirming password was successfully updated.
 */
export function buildPasswordResetConfirmedEmail(data: {
  recipientName: string;
  email: string;
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Security Alert: Your Smartminds Password Was Reset";

  const bodyHtml = `
    <p>Dear <strong>${data.recipientName}</strong>,</p>
    <p>This is confirmation that the password for your Smartminds Training College account (<code>${data.email}</code>) was successfully updated.</p>
    <p>You can now sign in using your new credentials.</p>
    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; padding: 14px; border-radius: 4px; margin: 20px 0; font-size: 12px; color: #991B1B;">
      <strong>Important:</strong> If you did not perform this change, please contact admissions and IT support immediately at <a href="mailto:${siteConfig.contact.email}" style="color: #991B1B; font-weight: bold;">${siteConfig.contact.email}</a>.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: "Confirmation that your portal password was updated.",
    heading: "Password Successfully Updated",
    badgeText: "Security Alert",
    bodyHtml,
    ctaText: "Sign In to Your Account",
    ctaUrl: data.loginUrl,
  });

  const text = `Dear ${data.recipientName},

Your password for Smartminds Training College (${data.email}) has been successfully updated.

Sign in at: ${data.loginUrl}

If you did not perform this change, please contact support immediately at ${siteConfig.contact.email}.

Smartminds Training College
`;

  return { subject, html, text };
}

/**
 * Branded Alert for Administration on New Student Enrolment & Payment.
 */
export function buildAdminPaymentAlertEmail(data: {
  studentName: string;
  studentId: string;
  email: string;
  phone: string;
  courseTitle: string;
  levelName: string;
  amountCharged: number;
  receiptRef: string;
  paymentType: string;
  isReturningStudent: boolean;
}): { subject: string; html: string; text: string } {
  const subject = `New Enrolment Alert: ${data.studentName} - ${data.courseTitle} (${formatCurrency(data.amountCharged)})`;

  const bodyHtml = `
    <p>A new student enrolment and tuition payment have been confirmed on the college website.</p>

    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 40%;">Student Name:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.studentName}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Student ID:</td>
        <td style="font-family: monospace; font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.studentId}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Email Address:</td>
        <td style="color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.email}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Telephone:</td>
        <td style="color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.phone}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Enrolled Course:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.courseTitle} (${data.levelName})</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Learner Type:</td>
        <td style="color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.isReturningStudent ? "Returning Learner (Additional Course)" : "New Learner (First Registration)"}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Payment Collected:</td>
        <td style="font-weight: 700; color: #047857; font-size: 15px; border-bottom: 1px solid #E6E1D5;">${formatCurrency(data.amountCharged)}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Receipt Reference:</td>
        <td style="font-family: monospace; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.receiptRef}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Payment Method / Plan:</td>
        <td style="color: #1B1B2B;">${data.paymentType}</td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #5A5A6E;">
      This transaction has been logged in the college Payments Ledger, and the student's cohort records have been synchronized.
    </p>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `New enrolment: ${data.studentName} paid ${formatCurrency(data.amountCharged)} for ${data.courseTitle}`,
    heading: "New Student Enrolment Confirmed",
    badgeText: "Tuition Receipt",
    bodyHtml,
  });

  const text = `NEW ENROLMENT & PAYMENT RECEIVED
Student: ${data.studentName} (${data.studentId})
Email: ${data.email} | Phone: ${data.phone}
Course: ${data.courseTitle} (${data.levelName})
Amount Collected: ${formatCurrency(data.amountCharged)}
Receipt Ref: ${data.receiptRef}
Plan: ${data.paymentType}
Status: ${data.isReturningStudent ? "Returning Student" : "New Student"}
`;

  return { subject, html, text };
}

/**
 * Branded Birthday Promotional Offer Email (e.g. 10% off next course).
 */
export function buildBirthdayDiscountEmail(data: {
  studentName: string;
  discountPercent: number;
  promoCode: string;
  portalUrl?: string;
  coursesUrl?: string;
  expiryDays?: number;
}): { subject: string; html: string; text: string } {
  const baseUrl = getBaseUrl();
  const coursesUrl = data.coursesUrl || `${baseUrl}/courses`;
  const subject = `Happy Birthday from Smartminds! Here is ${data.discountPercent}% Off Your Next Qualification`;

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>The entire faculty and academic team at Smartminds Training College wish you a wonderful and joyful <strong>Happy Birthday</strong>!</p>
    
    <p>To celebrate your special day and support your continued professional growth, we have activated an exclusive <strong>${data.discountPercent}% Birthday Scholarship</strong> towards your next accredited course or qualification upgrade.</p>

    <!-- Birthday Gift Voucher Card -->
    <div style="margin: 24px 0; padding: 24px; background-color: #FAF8F3; border: 2px dashed #D9B84A; border-radius: 6px; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #B78A2E; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
        Official College Birthday Voucher
      </div>
      <div style="font-size: 28px; font-weight: 800; color: #23216B; margin-bottom: 8px;">
        ${data.discountPercent}% OFF TUITION
      </div>
      <div style="display: inline-block; background-color: #23216B; color: #FFFFFF; font-family: monospace; font-size: 16px; font-weight: 700; padding: 8px 18px; border-radius: 4px; letter-spacing: 2px;">
        ${data.promoCode}
      </div>
      <div style="font-size: 12px; color: #5A5A6E; margin-top: 10px;">
        Valid for ${data.expiryDays || 30} days on any accredited qualification. Simply enter this coupon at enrolment.
      </div>
    </div>

    <h2 style="font-size: 16px; font-weight: 700; color: #23216B; margin: 24px 0 8px 0;">Popular Next Step Qualifications:</h2>
    <ul style="padding-left: 20px; margin: 8px 0 16px 0; color: #1B1B2B; font-size: 13px;">
      <li><strong>Level 5 Diploma in Education and Training (DET)</strong> — Qualify to teach in FE colleges & adult education.</li>
      <li><strong>Level 3 Certificate in Assessing Vocational Achievement (CAVA)</strong> — Become a certified assessor in your sector.</li>
      <li><strong>Level 4 Award in Internal Quality Assurance (IQA)</strong> — Lead quality assurance across training centres.</li>
    </ul>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Happy Birthday ${data.studentName}! Enjoy ${data.discountPercent}% off your next qualification with code ${data.promoCode}.`,
    heading: "Happy Birthday from Smartminds College!",
    badgeText: "Exclusive Birthday Gift",
    bodyHtml,
    ctaText: "Explore Qualifications & Claim 10%",
    ctaUrl: coursesUrl,
    isMarketing: true,
  });

  const text = `Dear ${data.studentName},

Happy Birthday from all of us at Smartminds Training College!

To celebrate, here is an exclusive ${data.discountPercent}% Birthday Scholarship towards your next accredited course.

VOUCHER CODE: ${data.promoCode}
DISCOUNT: ${data.discountPercent}% off tuition fees
EXPIRY: Valid for ${data.expiryDays || 30} days

Browse courses and claim your birthday discount here:
${coursesUrl}

Warm regards,
Admissions & Learner Services
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Branded Course Completion & Qualification Achievement Email.
 */
export function buildCourseCompletedEmail(data: {
  studentName: string;
  studentId: string;
  courseTitle: string;
  levelName: string;
  awardingBody?: string;
  portalUrl?: string;
  nextLevelTitle?: string;
  nextLevelUrl?: string;
}): { subject: string; html: string; text: string } {
  const baseUrl = getBaseUrl();
  const portalUrl = data.portalUrl || `${baseUrl}/student`;
  const subject = `Congratulations: You Have Completed ${data.courseTitle} (${data.studentId})`;

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>We are delighted to congratulate you on successfully completing all curriculum units and assessment criteria for <strong>${data.courseTitle} (${data.levelName})</strong>!</p>
    
    <!-- Achievement Summary Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 40%;">Official Student ID:</td>
        <td style="font-family: monospace; font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.studentId}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Completed Qualification:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.courseTitle} (${data.levelName})</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Awarding Organisation:</td>
        <td style="color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.awardingBody || "TQUK"} (Regulated by Ofqual)</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Final Status:</td>
        <td style="font-weight: 700; color: #047857;">Completed &amp; Quality Assured</td>
      </tr>
    </table>

    <h2 style="font-size: 16px; font-weight: 700; color: #23216B; margin: 24px 0 8px 0;">Official Certification Dispatch</h2>
    <p>Your portfolio has been signed off by the Internal Quality Assurer (IQA). Your official certificate is currently being processed by <strong>${data.awardingBody || "TQUK"}</strong> and will be dispatched to your registered postal address. You can also download your e-certificate transcript directly from your student portal.</p>

    ${
      data.nextLevelTitle
        ? `<div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 16px; border-radius: 4px; margin: 24px 0; font-size: 13px; color: #1E40AF;">
            <strong>Recommended Next Progression:</strong> As a graduate of this qualification, you are eligible to fast-track into <strong>${data.nextLevelTitle}</strong>. Contact admissions to claim your alumni discount!
          </div>`
        : ""
    }

    <p style="font-size: 13px; color: #5A5A6E; margin-top: 16px;">
      We would love to hear your feedback on your learning journey. Please take 2 minutes to share your experience with other prospective learners!
    </p>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Congratulations ${data.studentName}! You have successfully completed ${data.courseTitle}.`,
    heading: "Qualification Completed — Congratulations!",
    badgeText: "Official Course Completion",
    bodyHtml,
    ctaText: "View Completed Portfolio in Portal",
    ctaUrl: portalUrl,
  });

  const text = `Dear ${data.studentName},

Congratulations on successfully completing ${data.courseTitle} (${data.levelName})!

STUDENT RECORD:
- Student ID: ${data.studentId}
- Qualification: ${data.courseTitle} (${data.levelName})
- Awarding Body: ${data.awardingBody || "TQUK"} (Regulated by Ofqual)
- Status: Completed & Quality Assured

Your official certificate is being processed and will be delivered to your registered postal address.
You can view your completed portfolio anytime at:
${portalUrl}

Warm regards,
Academic Directorate & Student Services
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Branded Live Zoom Class Scheduled Email.
 * Notifies students of an upcoming live session with a direct link to their Student Portal
 * (where they join securely and catch up on stream-only recordings).
 */
export function buildZoomClassScheduledEmail(data: {
  studentName: string;
  courseTitle: string;
  sessionTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  tutorName: string;
  portalUrl?: string;
}): { subject: string; html: string; text: string } {
  const baseUrl = getBaseUrl();
  const portalUrl = data.portalUrl || `${baseUrl}/student`;
  const subject = `Live Class Scheduled: ${data.sessionTitle} — Smartminds College`;

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>Your tutor, <strong>${data.tutorName}</strong>, has scheduled an upcoming live interactive classroom session for <strong>${data.courseTitle}</strong>.</p>
    
    <!-- Class Session Details Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Session Topic:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.sessionTitle}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Course:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.courseTitle}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Date &amp; Time:</td>
        <td style="font-weight: 700; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.scheduledDate} at ${data.scheduledTime}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Assigned Tutor:</td>
        <td style="font-weight: 600; color: #1B1B2B;">${data.tutorName}</td>
      </tr>
    </table>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #1E40AF; line-height: 1.5;">
      <strong>How to Join:</strong> To ensure verified attendance tracking and secure access, please join the live Zoom session directly from your <strong>Student Portal</strong> dashboard using the link below.
    </div>

    <div style="background-color: #FAF8F3; border: 1px solid #E6E1D5; padding: 14px 16px; border-radius: 4px; margin: 16px 0; font-size: 12px; color: #5A5A6E; line-height: 1.5;">
      <strong>Unable to attend live?</strong> A stream-only catch-up recording will be automatically published to your student portal classroom archives within 24 hours of session conclusion.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Upcoming Live Class: ${data.sessionTitle} with ${data.tutorName} on ${data.scheduledDate}. Join from your Student Portal.`,
    heading: "Live Interactive Class Scheduled",
    badgeText: "Live Cohort Seminar",
    bodyHtml,
    ctaText: "Open Student Portal to Join",
    ctaUrl: portalUrl,
  });

  const text = `Dear ${data.studentName},

Your tutor, ${data.tutorName}, has scheduled an upcoming live interactive classroom session for ${data.courseTitle}.

SESSION DETAILS:
- Topic: ${data.sessionTitle}
- Course: ${data.courseTitle}
- Date & Time: ${data.scheduledDate} at ${data.scheduledTime}
- Assigned Tutor: ${data.tutorName}

HOW TO JOIN:
Please log in to your student portal to access the secure live Zoom session:
${portalUrl}

CATCH-UP RECORDINGS:
If you are unable to attend live, a stream-only recording will be available in your Student Portal archives after the class.

Warm regards,
Student Services & Academic Faculty
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Branded 20-Minute Live Zoom Class Reminder Email.
 * Sent 20 minutes before a scheduled class to ensure learners don't miss live interaction.
 */
export function buildZoomClassReminderEmail(data: {
  studentName: string;
  courseTitle: string;
  sessionTitle: string;
  scheduledTime: string;
  tutorName: string;
  zoomLink?: string;
  portalUrl?: string;
}): { subject: string; html: string; text: string } {
  const baseUrl = getBaseUrl();
  const portalUrl = data.portalUrl || `${baseUrl}/student`;
  const subject = `Starting in 20 Mins: Live Class for ${data.courseTitle} — Smartminds College`;

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>This is a quick reminder that your live interactive classroom seminar for <strong>${data.courseTitle}</strong> begins in <strong>20 minutes</strong> at <strong>${data.scheduledTime}</strong>.</p>
    
    <!-- Urgent Class Alert Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 2px solid #D9B84A; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Session Topic:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.sessionTitle}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Start Time:</td>
        <td style="font-weight: 700; color: #B78A2E; border-bottom: 1px solid #E6E1D5;">${data.scheduledTime} (in 20 minutes)</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Assigned Tutor:</td>
        <td style="font-weight: 600; color: #1B1B2B;">${data.tutorName}</td>
      </tr>
    </table>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #1E40AF; line-height: 1.5;">
      <strong>Direct Access:</strong> Click the button below to open your Student Portal and enter the live interactive classroom immediately.
    </div>

    <div style="background-color: #FAF8F3; border: 1px solid #E6E1D5; padding: 12px 14px; border-radius: 4px; margin: 16px 0; font-size: 12px; color: #5A5A6E; line-height: 1.5;">
      <em>Please join 3–5 minutes early to test your audio connection. Attendance is logged automatically upon entry.</em>
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Starting in 20 minutes: ${data.sessionTitle} with ${data.tutorName}. Click to join now.`,
    heading: "Live Class Starting in 20 Minutes",
    badgeText: "Immediate Class Alert",
    bodyHtml,
    ctaText: "Join Live Zoom Session Now",
    ctaUrl: portalUrl,
  });

  const text = `Dear ${data.studentName},

This is an urgent reminder that your live interactive classroom seminar for ${data.courseTitle} begins in 20 minutes at ${data.scheduledTime}.

SESSION DETAILS:
- Topic: ${data.sessionTitle}
- Course: ${data.courseTitle}
- Time: ${data.scheduledTime} (starting in 20 mins)
- Assigned Tutor: ${data.tutorName}

HOW TO JOIN:
Please click the link below to enter your secure student portal and join the session:
${portalUrl}

Warm regards,
Academic Faculty & Student Services
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Branded Class Recording Ready Email.
 * Dispatched automatically when a tutor publishes or links the catch-up video recording.
 */
export function buildZoomClassRecordingReadyEmail(data: {
  studentName: string;
  courseTitle: string;
  sessionTitle: string;
  sessionDate: string;
  tutorName: string;
  recordingsUrl?: string;
}): { subject: string; html: string; text: string } {
  const baseUrl = getBaseUrl();
  const recordingsUrl = data.recordingsUrl || `${baseUrl}/student/recordings`;
  const subject = `Recording Available: ${data.sessionTitle} — Smartminds College`;

  const bodyHtml = `
    <p>Dear <strong>${data.studentName}</strong>,</p>
    <p>The stream-only classroom recording for your recent live session, <strong>${data.sessionTitle}</strong>, is now ready to rewatch in your Student Portal archives.</p>
    
    <!-- Recording Details Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Session Topic:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.sessionTitle}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Course:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.courseTitle}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Recorded Date:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.sessionDate}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Assigned Tutor:</td>
        <td style="font-weight: 600; color: #1B1B2B;">${data.tutorName}</td>
      </tr>
    </table>

    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #166534; line-height: 1.5;">
      <strong>Stream-Only Access:</strong> As part of our student data protection and accredited quality standard, seminar recordings are streamed directly within your secure portal without requiring video downloads.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Class recording ready: ${data.sessionTitle} recorded on ${data.sessionDate}. Stream now in your portal.`,
    heading: "Class Recording Published",
    badgeText: "Archive Available",
    bodyHtml,
    ctaText: "Watch Recording in Student Portal",
    ctaUrl: recordingsUrl,
  });

  const text = `Dear ${data.studentName},

The classroom recording for your recent live session, ${data.sessionTitle}, has been uploaded and is now available to rewatch in your Student Portal archives.

SESSION DETAILS:
- Topic: ${data.sessionTitle}
- Course: ${data.courseTitle}
- Recorded On: ${data.sessionDate}
- Lead Tutor: ${data.tutorName}

HOW TO WATCH:
Click the link below to stream the video recording in your secure Student Portal:
${recordingsUrl}

Warm regards,
Academic Faculty & Student Services
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Branded Advisory Consultation Reminder Email.
 * Sent to prospective learners prior to their scheduled advice call with an admissions advisor.
 */
export function buildBookingReminderEmail(data: {
  fullName: string;
  courseInterest: string;
  scheduledDate: string;
  phone: string;
}): { subject: string; html: string; text: string } {
  const subject = `Reminder: Your Consultation with Smartminds College (${data.courseInterest})`;

  const bodyHtml = `
    <p>Dear <strong>${data.fullName}</strong>,</p>
    <p>This is a quick reminder regarding your upcoming free academic consultation with an admissions adviser at Smartminds Training College.</p>
    
    <!-- Consultation Details Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Course Interest:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.courseInterest}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Appointment Slot:</td>
        <td style="font-weight: 700; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.scheduledDate} (UK Time)</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">We Will Call:</td>
        <td style="font-weight: 600; color: #1B1B2B;">${data.phone}</td>
      </tr>
    </table>

    <div style="background-color: #FAF8F3; border: 1px solid #E6E1D5; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #5A5A6E; line-height: 1.5;">
      <strong>What We Will Discuss:</strong> Prior learning exemptions, national occupational standards (Ofqual regulated), flexible evening Zoom schedules, and 0% interest monthly payment instalment options.
    </div>

    <p style="font-size: 12px; color: #5A5A6E;">
      Need to reschedule or speak right away? You can reply directly to this email or message admissions on WhatsApp: <strong>${siteConfig.contact.whatsappDisplay}</strong>.
    </p>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Reminder: Consultation appointment on ${data.scheduledDate} for ${data.courseInterest}.`,
    heading: "Advisory Consultation Reminder",
    badgeText: "Upcoming Appointment",
    bodyHtml,
    ctaText: "Chat with Admissions on WhatsApp",
    ctaUrl: `https://wa.me/${siteConfig.contact.whatsappNumber}?text=Hi,%20I%20have%20a%20consultation%20booked%20for%20${encodeURIComponent(data.courseInterest)}`,
  });

  const text = `Dear ${data.fullName},

This is a reminder of your free academic consultation with Smartminds Training College.

APPOINTMENT DETAILS:
- Course Interest: ${data.courseInterest}
- Scheduled Time: ${data.scheduledDate} (London Time)
- Telephone Number: ${data.phone}

Our advisor will call you to discuss syllabus entry criteria, study schedules, and flexible payment plans.

Need to reschedule or message sooner?
WhatsApp: ${siteConfig.contact.whatsappDisplay}
Phone: ${siteConfig.contact.phoneDisplay}
Email: ${siteConfig.contact.email}

Warm regards,
Admissions Team
Smartminds Training College
Head Office: ${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Branded Advisory Consultation Booking Confirmation Email (to Applicant).
 * Dispatched immediately when a prospective learner schedules an appointment.
 */
export function buildBookingConfirmationEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  courseInterest: string;
  formattedDate: string;
  meetingPlatform: "google_meet" | "phone";
  meetingLink?: string;
  notes?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Consultation Confirmed: Smartminds Training College (${data.courseInterest})`;
  const isMeet = data.meetingPlatform === "google_meet";

  const bodyHtml = `
    <p>Dear <strong>${data.fullName}</strong>,</p>
    <p>Thank you for scheduling your 1-on-1 academic consultation with Smartminds Training College. Your appointment is now confirmed.</p>

    <!-- Appointment Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #D9B84A; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Course Interest:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.courseInterest}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Confirmed Date &amp; Time:</td>
        <td style="font-weight: 700; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.formattedDate} (UK Time)</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Meeting Format:</td>
        <td style="font-weight: 600; color: #23216B; border-bottom: 1px solid #E6E1D5;">
          ${isMeet ? "Google Meet Video Call" : `Telephone Consultation (Adviser calls ${data.phone})`}
        </td>
      </tr>
      ${
        isMeet && data.meetingLink
          ? `<tr>
              <td style="font-weight: 600; color: #5A5A6E;">Video Room Link:</td>
              <td>
                <a href="${data.meetingLink}" style="color: #23216B; font-weight: bold; text-decoration: underline;" target="_blank">
                  Join Google Meet Call
                </a>
                <div style="font-size: 11px; color: #5A5A6E; margin-top: 4px;">
                  Runs directly in your web browser — no software download required.
                </div>
              </td>
            </tr>`
          : ""
      }
    </table>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #1E40AF; line-height: 1.5;">
      <strong>What We Will Discuss:</strong> Prior learning exemptions, national occupational standards (Ofqual regulated), flexible evening class schedules, and 0% interest monthly payment instalment options.
    </div>

    <div style="background-color: #FAF8F3; border: 1px solid #E6E1D5; padding: 12px 14px; border-radius: 4px; margin: 16px 0; font-size: 12px; color: #5A5A6E; line-height: 1.5;">
      <em>Need to reschedule or speak sooner?</em> You can WhatsApp admissions on <a href="${siteConfig.contact.whatsappUrl}" style="color: #23216B; font-weight: bold;">${siteConfig.contact.whatsappDisplay}</a> or call <a href="tel:${siteConfig.contact.phone}" style="color: #23216B; font-weight: bold;">${siteConfig.contact.phoneDisplay}</a>.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Consultation Confirmed: ${data.formattedDate} for ${data.courseInterest}.`,
    heading: "Consultation Appointment Confirmed",
    badgeText: "Booking Confirmed",
    bodyHtml,
    ctaText: isMeet ? "Open Google Meet Session" : "Message Admissions on WhatsApp",
    ctaUrl: isMeet && data.meetingLink ? data.meetingLink : siteConfig.contact.whatsappUrl,
  });

  const text = `Dear ${data.fullName},

Thank you for booking your free 1-on-1 consultation with Smartminds Training College.

APPOINTMENT DETAILS:
- Course Interest: ${data.courseInterest}
- Scheduled Time: ${data.formattedDate} (UK Time)
- Format: ${isMeet ? `Google Meet Video Call (${data.meetingLink})` : `Phone Consultation (Adviser calls ${data.phone})`}

During this consultation, we will review your career goals, verify entry criteria for ${data.courseInterest}, and discuss flexible 0% interest monthly instalment options.

Need to reschedule or speak sooner?
WhatsApp: ${siteConfig.contact.whatsappDisplay}
Phone: ${siteConfig.contact.phoneDisplay}
Email: ${siteConfig.contact.email}

Warm regards,
Admissions Team
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * Branded Advisory Consultation Alert Email (to College Admissions / Admin).
 */
export function buildBookingAdminAlertEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  courseInterest: string;
  formattedDate: string;
  meetingPlatform: "google_meet" | "phone";
  meetingLink?: string;
  notes?: string;
}): { subject: string; html: string; text: string } {
  const subject = `[New Consultation Booked] ${data.fullName} — ${data.courseInterest}`;
  const isMeet = data.meetingPlatform === "google_meet";
  const baseUrl = getBaseUrl();

  const bodyHtml = `
    <p>A new prospective student has booked an advisory consultation on the college website.</p>

    <!-- Consultation Summary Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #D9B84A; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Applicant Name:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.fullName}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Email Address:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">
          <a href="mailto:${data.email}" style="color: #23216B; text-decoration: underline;">${data.email}</a>
        </td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Phone Number:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">
          <a href="tel:${data.phone}" style="color: #23216B; text-decoration: underline;">${data.phone}</a>
        </td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Course Interest:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.courseInterest}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Scheduled Slot:</td>
        <td style="font-weight: 700; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.formattedDate} (UK Time)</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Consultation Format:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">
          ${isMeet ? `Google Meet Video (${data.meetingLink})` : `Adviser Calls Applicant on ${data.phone}`}
        </td>
      </tr>
      ${
        data.notes
          ? `<tr>
              <td style="font-weight: 600; color: #5A5A6E;">Applicant Notes:</td>
              <td style="color: #1B1B2B;">${data.notes}</td>
            </tr>`
          : ""
      }
    </table>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 12px 14px; border-radius: 4px; margin: 16px 0; font-size: 12px; color: #1E40AF;">
      <strong>Action Required:</strong> Please assign an available admissions adviser to host this consultation or mark attendance in the Admin Portal.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `New consultation booked: ${data.fullName} for ${data.courseInterest} on ${data.formattedDate}.`,
    heading: "New Academic Consultation Booked",
    badgeText: "Admissions Directive",
    bodyHtml,
    ctaText: "Review in Admin Bookings Hub",
    ctaUrl: `${baseUrl}/admin/bookings`,
  });

  const text = `New Academic Consultation Booked!

Applicant: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Course: ${data.courseInterest}
Slot: ${data.formattedDate} (UK Time)
Format: ${isMeet ? `Google Meet Video (${data.meetingLink})` : `Telephone Call to ${data.phone}`}
Notes: ${data.notes || "None"}

Manage in Admin Hub: ${baseUrl}/admin/bookings
`;

  return { subject, html, text };
}

/**
 * Branded Staff & Tutor Invitation / Account Activation Email.
 * Dispatched automatically when an administrator or superadmin creates a staff or tutor account.
 */
export function buildStaffInvitationEmail(data: {
  name: string;
  email: string;
  role: "tutor" | "admin_staff" | "super_admin" | "owner_admin";
  roleLabel: string;
  department?: string;
  specialism?: string;
  temporaryPassword?: string;
  portalUrl?: string;
  invitedByName?: string;
}): { subject: string; html: string; text: string } {
  const baseUrl = getBaseUrl();
  const portalUrl =
    data.portalUrl ||
    (data.role === "tutor" ? `${baseUrl}/staff` : `${baseUrl}/admin`);
  const subject = `Welcome to Faculty: Staff Onboarding Credentials (${data.roleLabel}) — Smartminds College`;

  const securityNoteHtml =
    data.role === "admin_staff"
      ? `<div style="background-color: #FEF3C7; border: 1px solid #FCD34D; padding: 12px 14px; border-radius: 4px; margin: 16px 0; font-size: 12px; color: #92400E; line-height: 1.5;">
          <strong>Security Boundary:</strong> Under college governance policies, administrative staff accounts operate with zero access to financial ledgers and bank payment processing.
        </div>`
      : "";

  const bodyHtml = `
    <p>Dear <strong>${data.name}</strong>,</p>
    <p>You have been formally invited to join the staff and academic faculty of <strong>Smartminds Training College</strong> as <strong>${data.roleLabel}</strong>.</p>

    <!-- Faculty Credentials Card -->
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 4px; font-size: 13px;">
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Assigned Role:</td>
        <td style="font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.roleLabel}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Department:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.department || "Faculty Operations"}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Specialism / Focus:</td>
        <td style="font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.specialism || "Regulated Qualifications"}</td>
      </tr>
      <tr>
        <td style="font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Login Email:</td>
        <td style="font-weight: 700; color: #23216B; font-family: monospace; border-bottom: 1px solid #E6E1D5;">${data.email}</td>
      </tr>
      ${
        data.temporaryPassword
          ? `
      <tr>
        <td style="font-weight: 600; color: #5A5A6E;">Initial Password:</td>
        <td style="font-weight: 700; color: #B78A2E; font-family: monospace; font-size: 14px;">${data.temporaryPassword}</td>
      </tr>
      `
          : ""
      }
    </table>

    ${securityNoteHtml}

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #1E40AF; line-height: 1.5;">
      <strong>Action Required:</strong> Sign in via your staff portal link below using these credentials. You can update your password at any time in your account settings.
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Welcome to Smartminds College faculty. Your login credentials and portal access link are ready.`,
    heading: "Faculty & Staff Onboarding",
    badgeText: "Official Staff Invitation",
    bodyHtml,
    ctaText:
      data.role === "tutor"
        ? "Open Tutor Console & Classrooms"
        : "Open Staff Management Portal",
    ctaUrl: portalUrl,
  });

  const text = `Dear ${data.name},

You have been formally invited to join the staff and academic faculty of Smartminds Training College as ${data.roleLabel}.

YOUR CREDENTIALS & ACCESS:
- Role: ${data.roleLabel}
- Department: ${data.department || "Faculty Operations"}
- Specialism: ${data.specialism || "Regulated Qualifications"}
- Login Email: ${data.email}
${data.temporaryPassword ? `- Temporary Password: ${data.temporaryPassword}\n` : ""}- Portal URL: ${portalUrl}

Please sign in to access your teaching cohorts, learner records, and operational tools.

Warm regards,
College Leadership & Centre Directorate
Smartminds Training College
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

export function renderNewsletterWelcomeEmail(data: {
  email: string;
  discountCode?: string;
}): { subject: string; html: string; text: string } {
  const discountCode = data.discountCode || "WELCOME5";
  const baseUrl = getBaseUrl();
  const subject = "Welcome to Smartminds Training College — Exclusive Tuition Discount";

  const bodyHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #1B1B2B; line-height: 1.6;">
      Thank you for subscribing to the <strong>Smartminds Training College</strong> newsletter.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 15px; color: #1B1B2B; line-height: 1.6;">
      You are now subscribed to receive our latest British qualification announcements, early cohort enrolment windows, career advancement insights, and government funding updates directly in your inbox.
    </p>

    <!-- Exclusive Voucher Code Box -->
    <div style="background-color: #FAF8F3; border: 2px dashed #D9B84A; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0;">
      <span style="font-size: 11px; font-weight: 700; color: #B78A2E; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">
        Exclusive Subscriber Tuition Voucher
      </span>
      <div style="font-size: 26px; font-weight: 800; color: #23216B; letter-spacing: 3px; font-family: monospace; background-color: #FFFFFF; display: inline-block; padding: 8px 24px; border: 1px solid #E6E1D5; border-radius: 4px; margin: 8px 0;">
        ${discountCode}
      </div>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #5A5A6E;">
        Enjoy <strong>5% off tuition fees</strong> on any accredited Level 2, 3, 4, or 5 diploma programme when enrolling. Mention this voucher during your enrolment consultation.
      </p>
    </div>

    <!-- Highlights Grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1px solid #E6E1D5; border-radius: 4px; background-color: #FFFFFF;">
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #E6E1D5;">
          <strong style="color: #23216B; font-size: 14px;">🎓 Regulated Qualifications:</strong>
          <span style="color: #5A5A6E; font-size: 13px; display: block; margin-top: 2px;">
            Ofqual-regulated diplomas in Adult Social Care, Teacher Training (AET/CAVA), Early Years Childcare, and Business Management.
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #E6E1D5;">
          <strong style="color: #23216B; font-size: 14px;">💻 Live Evening Classes:</strong>
          <span style="color: #5A5A6E; font-size: 13px; display: block; margin-top: 2px;">
            Interactive live online seminars led by certified UK assessors with recordings available 24/7.
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 16px;">
          <strong style="color: #23216B; font-size: 14px;">💳 0% Interest Flexible Plans:</strong>
          <span style="color: #5A5A6E; font-size: 13px; display: block; margin-top: 2px;">
            Transparent monthly instalment plans with zero credit checks and zero hidden charges.
          </span>
        </td>
      </tr>
    </table>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #5A5A6E; line-height: 1.5;">
      Ready to start or advance your career? Explore our full course catalogue or speak with an admissions advisor today.
    </p>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: "Welcome to Smartminds College! Here is your exclusive 5% tuition discount code.",
    heading: "Welcome to Smartminds College",
    badgeText: "Exclusive Welcome Gift",
    bodyHtml,
    ctaText: "Explore Accredited Qualifications",
    ctaUrl: `${baseUrl}/courses`,
    isMarketing: true,
  });

  const text = `Welcome to Smartminds Training College!

Thank you for subscribing to our newsletter. You will receive qualification announcements, cohort schedules, and funding updates directly in your inbox.

YOUR EXCLUSIVE SUBSCRIBER DISCOUNT CODE:
${discountCode}
(Save 5% on tuition fees on any Level 2–5 qualification programme)

Explore all courses: ${baseUrl}/courses
Book free admissions consultation: ${baseUrl}/book

Warm regards,
Admissions & Student Advisory Team
Smartminds Training College
${siteConfig.contact.email} | ${siteConfig.contact.phone}
${siteConfig.contact.address}
`;

  return { subject, html, text };
}

/**
 * 15. Automated Live Class Recording Available Notification
 * Dispatched to enrolled cohort learners when Zoom + Cloudflare finishes processing a recording.
 */
export function generateNewRecordingNotificationEmail(data: {
  studentName: string;
  courseTitle: string;
  sessionTitle: string;
  sessionDate: string;
  portalUrl?: string;
}): { subject: string; html: string; text: string } {
  const baseUrl = getBaseUrl();
  const portalLink = data.portalUrl || `${baseUrl}/student/recordings`;
  const subject = `New Class Recording Ready: ${data.sessionTitle} - ${data.courseTitle}`;

  const bodyHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #1B1B2B; line-height: 1.5;">
      Dear <strong>${data.studentName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #5A5A6E; line-height: 1.5;">
      The video recording for your recent interactive live class on <strong>${data.courseTitle}</strong> is now processed and ready to watch inside your Student Portal.
    </p>

    <!-- Session Details Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #FAF8F3; border: 1px solid #E6E1D5; border-radius: 6px; overflow: hidden; font-size: 13px;">
      <tr>
        <td style="padding: 12px 16px; font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5; width: 35%;">Session Title:</td>
        <td style="padding: 12px 16px; font-weight: 700; color: #23216B; border-bottom: 1px solid #E6E1D5;">${data.sessionTitle}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-weight: 600; color: #5A5A6E; border-bottom: 1px solid #E6E1D5;">Class Date:</td>
        <td style="padding: 12px 16px; font-weight: 600; color: #1B1B2B; border-bottom: 1px solid #E6E1D5;">${data.sessionDate}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-weight: 600; color: #5A5A6E;">Delivery Format:</td>
        <td style="padding: 12px 16px; font-weight: 600; color: #23216B;">Protected Stream (High Definition)</td>
      </tr>
    </table>

    <div style="background-color: #F8FAFC; border-left: 3px solid #D9B84A; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 12px; color: #5A5A6E; line-height: 1.4;">
        <strong style="color: #23216B;">Study Notice:</strong> Recordings are watermarked and provided exclusively for your personal qualification study. Streaming is available 24/7 across all devices.
      </p>
    </div>
  `;

  const html = wrapBrandedEmailHtml({
    preheader: `Your class recording for ${data.sessionTitle} is now available in your portal.`,
    heading: "Class Recording Ready",
    badgeText: "Study Material Available",
    bodyHtml,
    ctaText: "Watch Class Recording",
    ctaUrl: portalLink,
  });

  const text = `Dear ${data.studentName},

The video recording for your recent interactive live class on ${data.courseTitle} is now processed and ready to watch inside your Student Portal.

SESSION DETAILS:
• Session Title: ${data.sessionTitle}
• Date: ${data.sessionDate}
• Delivery: Protected HD Stream

Watch now: ${portalLink}

Warm regards,
Academic Support & Tutor Team
Smartminds Training College
${siteConfig.contact.email} | ${siteConfig.contact.phone}
`;

  return { subject, html, text };
}




