import fs from "fs";
import { randomBytes } from "crypto";
import { siteConfig } from "@/content/siteConfig";
import { sendEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/baseUrl";
import {
  loadPersistedRecords,
  getStoreFilePath,
  syncPersistedRecords,
} from "@/lib/persistedData";

export interface AbandonedCheckoutDraft {
  id: string; // e.g. "chk_xxxxx"
  fullName: string;
  email: string;
  phone: string;
  courseId: string;
  courseTitle: string;
  levelLabel?: string;
  planId?: string;
  paymentOption?: "full" | "instalments";
  learnerType?: "myself" | "child";
  dob?: string;
  address?: string;
  postcode?: string;
  trainingLocation?: string;
  preferredTimeSlot?: string;
  couponCode?: string;
  depositAmount?: number;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  recoveryStage: number; // 0 = none, 1 = 1-2h, 2 = 24h, 3 = Day 3, 4 = Day 5, 5 = Day 7
  lastEmailSentAt?: string;
  emailHistory?: Array<{
    stage: number;
    sentAt: string;
    subject: string;
    success: boolean;
  }>;
}

/**
 * Saves or updates an in-progress checkout draft.
 */
export async function saveCheckoutDraft(
  input: Partial<AbandonedCheckoutDraft> & {
    email: string;
    courseId: string;
    fullName: string;
    phone: string;
  }
): Promise<AbandonedCheckoutDraft> {
  const store = loadPersistedRecords();
  if (!store.abandonedCheckouts) store.abandonedCheckouts = [];

  const cleanEmail = input.email.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(cleanEmail);
  if (!isValidEmail) {
    throw new Error("Incomplete or invalid email format for checkout draft");
  }

  const existingIdx = store.abandonedCheckouts.findIndex(
    (c: AbandonedCheckoutDraft) =>
      c.email.toLowerCase() === cleanEmail &&
      c.courseId === input.courseId &&
      !c.completed
  );

  const now = new Date().toISOString();
  let draft: AbandonedCheckoutDraft;

  if (existingIdx >= 0) {
    draft = {
      ...store.abandonedCheckouts[existingIdx],
      ...input,
      email: cleanEmail,
      updatedAt: now,
    };
    store.abandonedCheckouts[existingIdx] = draft;
  } else {
    draft = {
      id: `chk_${Date.now().toString(36)}_${randomBytes(3).toString("hex")}`,
      fullName: input.fullName.trim(),
      email: cleanEmail,
      phone: input.phone.trim(),
      courseId: input.courseId,
      courseTitle: input.courseTitle || "Accredited Qualification",
      levelLabel: input.levelLabel,
      planId: input.planId || "full",
      paymentOption: input.paymentOption || "full",
      learnerType: input.learnerType || "myself",
      dob: input.dob,
      address: input.address,
      postcode: input.postcode,
      trainingLocation: input.trainingLocation,
      preferredTimeSlot: input.preferredTimeSlot,
      couponCode: input.couponCode,
      depositAmount: input.depositAmount,
      totalAmount: input.totalAmount,
      createdAt: now,
      updatedAt: now,
      completed: false,
      recoveryStage: 0,
      emailHistory: [],
    };
    store.abandonedCheckouts.unshift(draft);
  }

  // Also record in admissions enquiries pipeline so staff have visibility
  if (!store.enquiries) store.enquiries = [];
  const cleanPhone = (input.phone || "").replace(/\D/g, "");

  // Match existing enquiry by email or phone (to update in-place rather than duplicate)
  const existingEnqIdx = store.enquiries.findIndex(
    (e: any) =>
      e.formType === "abandoned_checkout" &&
      (e.email?.toLowerCase() === cleanEmail ||
        (cleanPhone.length >= 7 && (e.phone || "").replace(/\D/g, "") === cleanPhone))
  );

  const enqData = {
    id: existingEnqIdx >= 0 ? store.enquiries[existingEnqIdx].id : `enq-chk-${draft.id}`,
    fullName: draft.fullName,
    email: cleanEmail,
    phone: draft.phone,
    courseInterest: `${draft.courseTitle}${draft.levelLabel ? ` (${draft.levelLabel})` : ""}`,
    formType: "abandoned_checkout",
    stage: existingEnqIdx >= 0 ? store.enquiries[existingEnqIdx].stage : "new",
    submittedAt: now,
    notes: `Checkout started. Selected plan: ${draft.paymentOption === "full" ? "Pay in Full" : "Flexible Instalments"}. Recovery stage: ${draft.recoveryStage}/5.`,
  };

  if (existingEnqIdx >= 0) {
    store.enquiries[existingEnqIdx] = { ...store.enquiries[existingEnqIdx], ...enqData };
  } else {
    store.enquiries.unshift(enqData as any);
  }

  // Clean up any stale partial/malformed abandoned checkout records for this phone/person
  if (cleanPhone.length >= 7) {
    store.enquiries = store.enquiries.filter(
      (e: any) =>
        !(
          e.formType === "abandoned_checkout" &&
          e.email?.toLowerCase() !== cleanEmail &&
          (e.phone || "").replace(/\D/g, "") === cleanPhone &&
          !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(e.email || "")
        )
    );
  }

  try {
    fs.writeFileSync(getStoreFilePath(), JSON.stringify(store, null, 2));
    syncPersistedRecords(true);
  } catch (err) {
    console.error("[abandonedCheckout] Error saving draft:", err);
  }

  return draft;
}

/**
 * Retrieves a checkout draft by ID (for resuming).
 */
export async function getCheckoutDraft(
  id: string
): Promise<AbandonedCheckoutDraft | null> {
  const store = loadPersistedRecords();
  const draft = (store.abandonedCheckouts || []).find(
    (c: AbandonedCheckoutDraft) => c.id === id
  );
  return draft ? { ...draft } : null;
}

/**
 * Marks a checkout draft as completed so no further abandonment emails are sent.
 */
export async function markCheckoutDraftCompleted(
  email: string,
  courseId?: string
): Promise<boolean> {
  const store = loadPersistedRecords();
  if (!store.abandonedCheckouts) return false;

  const cleanEmail = email.trim().toLowerCase();
  let updated = false;

  for (const c of store.abandonedCheckouts) {
    if (
      c.email.toLowerCase() === cleanEmail &&
      (!courseId || c.courseId === courseId) &&
      !c.completed
    ) {
      c.completed = true;
      c.updatedAt = new Date().toISOString();
      updated = true;
    }
  }

  if (updated) {
    try {
      fs.writeFileSync(getStoreFilePath(), JSON.stringify(store, null, 2));
      syncPersistedRecords(true);
    } catch {}
  }

  return updated;
}

/**
 * Lists all abandoned checkouts for admin oversight.
 */
export async function listAbandonedCheckouts(): Promise<AbandonedCheckoutDraft[]> {
  const store = loadPersistedRecords();
  return (store.abandonedCheckouts || []).map((c: any) => ({ ...c }));
}

/**
 * Builds the recovery email copy for stages 1 to 5.
 */
function buildRecoveryEmailContent(
  draft: AbandonedCheckoutDraft,
  stage: number,
  baseUrl: string
): { subject: string; text: string; html: string } {
  const firstName = draft.fullName.split(" ")[0] || "there";
  const courseName = draft.courseTitle;
  const resumeUrl = `${baseUrl}/enrol?course=${draft.courseId}&resume=${draft.id}${
    stage >= 4 ? "&coupon=WELCOME50" : ""
  }`;
  const whatsappUrl = siteConfig.contact.whatsappUrl;

  switch (stage) {
    case 1: {
      const subject = `Did something interrupt your enrolment, ${firstName}?`;
      const text = `Hi ${firstName},\n\nWe noticed you began enrolling for ${courseName} at Smartminds Training College, but didn't finish completing your application.\n\nYour reserved place in the upcoming cohort is temporarily held for you.\n\nDid you run into a payment issue or have a quick question about course entry?\n\nResume your enrolment here: ${resumeUrl}\n\nNeed immediate help? Reply to this email or chat with our Admissions team on WhatsApp: ${whatsappUrl}\n\nWarm regards,\nSmartminds Admissions Team`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E6E1D5; border-radius: 6px; overflow: hidden;">
          <div style="background: #23216B; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">${siteConfig.name}</h1>
            <p style="color: #F3E58A; margin: 4px 0 0; font-size: 12px; font-weight: 600;">Admissions & Enrolment Support</p>
          </div>
          <div style="padding: 32px 24px; color: #1B1B2B; line-height: 1.6;">
            <h2 style="color: #23216B; font-size: 18px; margin-top: 0;">Did something interrupt your enrolment, ${firstName}?</h2>
            <p>We noticed you began your application for <strong>${courseName}</strong>, but didn't quite make it across the finish line.</p>
            <p>Your place in the upcoming intake is temporarily saved so you don't lose your spot.</p>
            <div style="background: #FAF8F3; border-left: 4px solid #D9B84A; padding: 14px 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #5A5A6E;">
                <strong>Course:</strong> ${courseName}${draft.levelLabel ? ` (${draft.levelLabel})` : ""}<br>
                <strong>Payment Option:</strong> ${draft.paymentOption === "full" ? "Pay in Full" : "Flexible Monthly Instalments"}
              </p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resumeUrl}" style="background: #23216B; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 14px; display: inline-block;">
                Resume My Application &rarr;
              </a>
            </div>
            <p style="font-size: 13px; color: #5A5A6E;">
              Have questions about schedule times, campus practicals, or payment options? Simply reply to this email or <a href="${whatsappUrl}" style="color: #23216B; font-weight: 600;">chat with us on WhatsApp</a>.
            </p>
          </div>
        </div>
      `;
      return { subject, text, html };
    }

    case 2: {
      const subject = `Flexible ways to fund your ${courseName}`;
      const text = `Hi ${firstName},\n\nWe understand that investing in a professional qualification is an important financial decision.\n\nAt Smartminds, you never have to worry about large upfront tuition costs. We offer:\n- 0% interest monthly instalment plans spread over 3 to 14 months\n- Automated Bacs Direct Debit via GoCardless\n- Pay in Full with an immediate ~10% discount\n\nChoose the payment schedule that works for your budget and resume your application here: ${resumeUrl}\n\nWarm regards,\nSmartminds Admissions`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E6E1D5; border-radius: 6px; overflow: hidden;">
          <div style="background: #23216B; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">${siteConfig.name}</h1>
            <p style="color: #F3E58A; margin: 4px 0 0; font-size: 12px;">Tuition Funding & Flexible Instalments</p>
          </div>
          <div style="padding: 32px 24px; color: #1B1B2B; line-height: 1.6;">
            <h2 style="color: #23216B; font-size: 18px; margin-top: 0;">Affordable payment options for ${courseName}</h2>
            <p>Hi ${firstName}, investing in your professional qualification should never be a financial strain.</p>
            <p>To help you fit training into your monthly budget, you can choose:</p>
            <ul style="color: #5A5A6E; padding-left: 20px; font-size: 14px;">
              <li><strong>0% Interest Instalments:</strong> Spread tuition over monthly payments from £85/mo.</li>
              <li><strong>Bacs Direct Debit:</strong> Set up protected automated instalments with GoCardless.</li>
              <li><strong>Debit / Credit Card:</strong> Visa, Mastercard, Apple Pay, and Google Pay accepted.</li>
              <li><strong>Pay in Full:</strong> Save up to 10% on your total course fee.</li>
            </ul>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resumeUrl}" style="background: #23216B; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 14px; display: inline-block;">
                Select Your Payment Plan &rarr;
              </a>
            </div>
            <p style="font-size: 13px; color: #5A5A6E; text-align: center;">
              Need a custom plan? <a href="${whatsappUrl}" style="color: #23216B; font-weight: 600;">Speak directly with our Finance Team on WhatsApp</a>.
            </p>
          </div>
        </div>
      `;
      return { subject, text, html };
    }

    case 3: {
      const subject = `How our learners balance study with full-time shifts`;
      const text = `Hi ${firstName},\n\nOne of the most common hesitations we hear from prospective students is: "Will I have enough time to finish this around my job and family?"\n\nOver 80% of Smartminds learners balance their studies while working full-time shifts.\n\nHere is how Smartminds makes it manageable:\n- Evening live Zoom sessions with session recordings available 24/7\n- Practical weekend workshops at our regional training hubs\n- Dedicated 1-on-1 tutor and assessor guidance\n- Manageable coursework units with generous completion windows\n\nContinue your application here: ${resumeUrl}\n\nWarm regards,\nSmartminds Admissions`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E6E1D5; border-radius: 6px; overflow: hidden;">
          <div style="background: #23216B; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">${siteConfig.name}</h1>
            <p style="color: #F3E58A; margin: 4px 0 0; font-size: 12px;">Flexible Vocational Qualifications</p>
          </div>
          <div style="padding: 32px 24px; color: #1B1B2B; line-height: 1.6;">
            <h2 style="color: #23216B; font-size: 18px; margin-top: 0;">Built for working professionals</h2>
            <p>Hi ${firstName}, whether you work shifts in healthcare, education, or busy office hours, Smartminds was designed for adult learners like you.</p>
            <div style="background: #FAF8F3; padding: 18px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0 0 10px; font-weight: 700; color: #23216B;">What makes studying with us different:</p>
              <p style="margin: 4px 0; font-size: 13px; color: #5A5A6E;">&#10003; <strong>Live Evening Zoom Classes</strong> with interactive assessor feedback.</p>
              <p style="margin: 4px 0; font-size: 13px; color: #5A5A6E;">&#10003; <strong>24/7 Digital Student Portal</strong> for coursework submission and materials.</p>
              <p style="margin: 4px 0; font-size: 13px; color: #5A5A6E;">&#10003; <strong>1-on-1 Assessor Mentoring</strong> to ensure you succeed on your first attempt.</p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resumeUrl}" style="background: #23216B; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 14px; display: inline-block;">
                Continue Your Enrolment &rarr;
              </a>
            </div>
          </div>
        </div>
      `;
      return { subject, text, html };
    }

    case 4: {
      const subject = `A £50 bursary towards your ${courseName} tuition`;
      const text = `Hi ${firstName},\n\nWe would love to welcome you to Smartminds Training College.\n\nTo help you take the next step in your career, the college has approved a £50 New Learner Bursary towards your course tuition.\n\nYour voucher code: WELCOME50\n(Deducts £50 immediately from your upfront payment or deposit)\n\nThis bursary is valid for the next 48 hours.\n\nApply your bursary and complete your enrolment here: ${resumeUrl}\n\nWarm regards,\nSmartminds Admissions`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E6E1D5; border-radius: 6px; overflow: hidden;">
          <div style="background: #23216B; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">${siteConfig.name}</h1>
            <p style="color: #F3E58A; margin: 4px 0 0; font-size: 12px;">Special New Learner Bursary</p>
          </div>
          <div style="padding: 32px 24px; color: #1B1B2B; line-height: 1.6;">
            <h2 style="color: #23216B; font-size: 18px; margin-top: 0;">We've approved a £50 bursary for your tuition</h2>
            <p>Hi ${firstName}, to help you get started towards your qualification, we have allocated an official <strong>£50 New Learner Grant</strong> towards your tuition for <strong>${courseName}</strong>.</p>
            <div style="background: #FAF8F3; border: 2px dashed #D9B84A; padding: 20px; text-align: center; border-radius: 6px; margin: 24px 0;">
              <span style="display: block; font-size: 12px; color: #5A5A6E; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Your Exclusive Voucher Code</span>
              <span style="display: inline-block; font-size: 24px; font-weight: 800; color: #23216B; background: #ffffff; border: 1px solid #E6E1D5; padding: 6px 20px; border-radius: 4px; margin-top: 8px; font-family: monospace;">WELCOME50</span>
              <p style="margin: 8px 0 0; font-size: 12px; color: #5A5A6E;">Valid for 48 hours &bull; Deducts £50 directly at checkout</p>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resumeUrl}" style="background: #23216B; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 14px; display: inline-block;">
                Claim £50 Bursary & Enrol &rarr;
              </a>
            </div>
          </div>
        </div>
      `;
      return { subject, text, html };
    }

    case 5:
    default: {
      const subject = `Final notice: Closing your reserved enrolment for ${courseName}`;
      const text = `Hi ${firstName},\n\nThis is a final courtesy notice regarding your application for ${courseName}.\n\nYour reserved cohort place and your £50 bursary (code: WELCOME50) are set to expire tonight.\n\nIf you would like to secure your place before our upcoming cohort closes, please complete your enrolment here: ${resumeUrl}\n\nIf your circumstances have changed or you would like us to close your application file, no further action is required.\n\nWarm regards,\nSmartminds Admissions Team`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E6E1D5; border-radius: 6px; overflow: hidden;">
          <div style="background: #23216B; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">${siteConfig.name}</h1>
            <p style="color: #F3E58A; margin: 4px 0 0; font-size: 12px;">Admissions Courtesy Notice</p>
          </div>
          <div style="padding: 32px 24px; color: #1B1B2B; line-height: 1.6;">
            <h2 style="color: #23216B; font-size: 18px; margin-top: 0;">Final notice regarding your application</h2>
            <p>Hi ${firstName}, this is a polite final check-in regarding your reserved place for <strong>${courseName}</strong>.</p>
            <p>Our upcoming cohort registration is closing, and unconfirmed reservations will be released to applicants on our waiting list tonight.</p>
            <p>Your £50 bursary code <code>WELCOME50</code> will also expire at midnight.</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resumeUrl}" style="background: #23216B; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 14px; display: inline-block;">
                Complete Application Before Expiry &rarr;
              </a>
            </div>
            <p style="font-size: 13px; color: #5A5A6E;">
              If you have decided not to proceed at this time, please ignore this email and we will quietly archive your application.
            </p>
          </div>
        </div>
      `;
      return { subject, text, html };
    }
  }
}

/**
 * Evaluates all pending abandoned checkout drafts and sends the appropriate stage email.
 */
export async function processAbandonedCheckoutRecovery(): Promise<{
  processed: number;
  sent: number;
  logs: string[];
}> {
  try {
    const { pullLatestFromNeon } = await import("@/lib/persistedData");
    await pullLatestFromNeon();
  } catch {}
  const store = loadPersistedRecords();
  const drafts = store.abandonedCheckouts || [];
  const now = Date.now();
  const baseUrl = getBaseUrl();
  const logs: string[] = [];
  let sentCount = 0;

  for (const draft of drafts) {
    if (draft.completed) continue;
    if (draft.recoveryStage >= 5) continue; // Final stage already reached

    const createdTime = new Date(draft.createdAt).getTime();
    const lastSentTime = draft.lastEmailSentAt
      ? new Date(draft.lastEmailSentAt).getTime()
      : createdTime;

    let targetStage = 0;

    if (draft.recoveryStage === 0) {
      // Stage 1: 20 minutes after drop-off (configurable via CHECKOUT_RECOVERY_STAGE_1_MINUTES)
      const stage1DelayMs =
        (Number(process.env.CHECKOUT_RECOVERY_STAGE_1_MINUTES) || 20) * 60 * 1000;
      if (now - createdTime >= stage1DelayMs) {
        targetStage = 1;
      }
    } else if (draft.recoveryStage === 1) {
      // Stage 2: 4 hours (240 min) after Stage 1 (configurable via CHECKOUT_RECOVERY_STAGE_2_MINUTES)
      const stage2DelayMs =
        (Number(process.env.CHECKOUT_RECOVERY_STAGE_2_MINUTES) || 240) * 60 * 1000;
      if (now - lastSentTime >= stage2DelayMs) {
        targetStage = 2;
      }
    } else if (draft.recoveryStage === 2) {
      // Stage 3: 24 hours (1440 min) after Stage 2 (configurable via CHECKOUT_RECOVERY_STAGE_3_MINUTES)
      const stage3DelayMs =
        (Number(process.env.CHECKOUT_RECOVERY_STAGE_3_MINUTES) || 1440) * 60 * 1000;
      if (now - lastSentTime >= stage3DelayMs) {
        targetStage = 3;
      }
    } else if (draft.recoveryStage === 3) {
      // Stage 4: 48 hours (2880 min) after Stage 3 (configurable via CHECKOUT_RECOVERY_STAGE_4_MINUTES)
      const stage4DelayMs =
        (Number(process.env.CHECKOUT_RECOVERY_STAGE_4_MINUTES) || 2880) * 60 * 1000;
      if (now - lastSentTime >= stage4DelayMs) {
        targetStage = 4;
      }
    } else if (draft.recoveryStage === 4) {
      // Stage 5: 48 hours (2880 min) after Stage 4 (configurable via CHECKOUT_RECOVERY_STAGE_5_MINUTES)
      const stage5DelayMs =
        (Number(process.env.CHECKOUT_RECOVERY_STAGE_5_MINUTES) || 2880) * 60 * 1000;
      if (now - lastSentTime >= stage5DelayMs) {
        targetStage = 5;
      }
    }

    if (targetStage > 0) {
      try {
        const emailContent = buildRecoveryEmailContent(draft, targetStage, baseUrl);
        await sendEmail({
          to: draft.email,
          recipientName: draft.fullName,
          department: "admissions",
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
          templateKey: `checkout_abandonment_stage_${targetStage}`,
          triggerEvent: `Checkout Recovery Stage ${targetStage}`,
        });

        draft.recoveryStage = targetStage;
        draft.lastEmailSentAt = new Date().toISOString();
        if (!draft.emailHistory) draft.emailHistory = [];
        draft.emailHistory.push({
          stage: targetStage,
          sentAt: draft.lastEmailSentAt,
          subject: emailContent.subject,
          success: true,
        });

        sentCount++;
        logs.push(`Sent Stage ${targetStage} email to ${draft.email} (${draft.courseTitle})`);
      } catch (err) {
        logs.push(`Failed to send Stage ${targetStage} email to ${draft.email}: ${err}`);
      }
    }
  }

  if (sentCount > 0) {
    try {
      fs.writeFileSync(getStoreFilePath(), JSON.stringify(store, null, 2));
      syncPersistedRecords(true);
    } catch {}
  }

  return { processed: drafts.length, sent: sentCount, logs };
}

/**
 * Manually dispatches a recovery email from the Admin portal.
 */
export async function sendManualRecoveryEmail(
  draftId: string,
  stage: number
): Promise<{ success: boolean; message: string }> {
  const store = loadPersistedRecords();
  const draft = (store.abandonedCheckouts || []).find((c: any) => c.id === draftId);
  if (!draft) {
    return { success: false, message: "Checkout draft not found." };
  }

  const baseUrl = getBaseUrl();
  const emailContent = buildRecoveryEmailContent(draft, stage, baseUrl);

  try {
    await sendEmail({
      to: draft.email,
      recipientName: draft.fullName,
      department: "admissions",
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      templateKey: `checkout_abandonment_stage_${stage}`,
      triggerEvent: `Manual Recovery Trigger Stage ${stage}`,
    });

    draft.recoveryStage = stage;
    draft.lastEmailSentAt = new Date().toISOString();
    if (!draft.emailHistory) draft.emailHistory = [];
    draft.emailHistory.push({
      stage,
      sentAt: draft.lastEmailSentAt,
      subject: emailContent.subject,
      success: true,
    });

    fs.writeFileSync(getStoreFilePath(), JSON.stringify(store, null, 2));
    syncPersistedRecords(true);

    return {
      success: true,
      message: `Stage ${stage} recovery email dispatched to ${draft.email}.`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to dispatch email.",
    };
  }
}
