"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { renderNewsletterWelcomeEmail } from "@/lib/emailTemplates";
import {
  saveNewsletterSubscriber,
  listNewsletterSubscribers,
  deleteNewsletterSubscriber,
  toggleNewsletterSubscriberStatus,
  NewsletterSubscriber,
} from "@/lib/persistedData";

export interface NewsletterActionResult {
  success: boolean;
  message?: string;
  isNew?: boolean;
  alreadySubscribed?: boolean;
  subscriber?: NewsletterSubscriber;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public Server Action for visitors to subscribe to the Smartminds newsletter.
 * Automatically saves the subscriber and delivers an auto-reply welcome email with a 5% discount code.
 */
export async function subscribeNewsletterAction(
  email: string,
  source: string = "website_footer"
): Promise<NewsletterActionResult> {
  const cleanEmail = email ? email.trim().toLowerCase() : "";

  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  try {
    const result = saveNewsletterSubscriber(cleanEmail, source);

    if (result.isNew || result.reActivated) {
      // Dispatch auto-reply welcome email with promotional tuition code
      const { subject, html, text } = renderNewsletterWelcomeEmail({
        email: cleanEmail,
        discountCode: "WELCOME5",
      });

      await sendEmail({
        to: cleanEmail,
        subject,
        html,
        text,
        department: "admissions",
        triggerEvent: "Newsletter Subscription Welcome",
      });

      return {
        success: true,
        isNew: true,
        subscriber: result.subscriber,
        message:
          "Thank you for subscribing! We have dispatched your exclusive 5% tuition voucher code to your inbox.",
      };
    }

    // Already subscribed and active
    return {
      success: true,
      alreadySubscribed: true,
      subscriber: result.subscriber,
      message: "You are already subscribed to Smartminds College updates!",
    };
  } catch (err) {
    console.error("[newsletterActions] Error subscribing:", err);
    return {
      success: false,
      message: "An unexpected error occurred while processing your subscription. Please try again.",
    };
  }
}

/**
 * Admin action to fetch the complete list of newsletter subscribers.
 */
export async function listNewsletterSubscribersAction(): Promise<{
  success: boolean;
  subscribers?: NewsletterSubscriber[];
  error?: string;
}> {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "admin_staff" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin")
  ) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const subscribers = listNewsletterSubscribers();
    return { success: true, subscribers };
  } catch (err) {
    console.error("[newsletterActions] Error listing subscribers:", err);
    return { success: false, error: "Failed to load subscribers" };
  }
}

/**
 * Admin action to delete a subscriber record.
 */
export async function deleteNewsletterSubscriberAction(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "admin_staff" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin")
  ) {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const removed = deleteNewsletterSubscriber(id);
    if (removed) {
      revalidatePath("/admin/subscribers");
      return { success: true, message: "Subscriber removed successfully." };
    }
    return { success: false, message: "Subscriber not found." };
  } catch (err) {
    console.error("[newsletterActions] Error deleting subscriber:", err);
    return { success: false, message: "Failed to delete subscriber." };
  }
}

/**
 * Admin action to toggle subscriber status between active and unsubscribed.
 */
export async function toggleNewsletterSubscriberStatusAction(
  id: string
): Promise<{ success: boolean; newStatus?: "active" | "unsubscribed"; message?: string }> {
  const session = await getServerSession();
  if (
    !session ||
    (session.role !== "admin_staff" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin")
  ) {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const res = toggleNewsletterSubscriberStatus(id);
    if (res.success) {
      revalidatePath("/admin/subscribers");
      return {
        success: true,
        newStatus: res.newStatus,
        message: `Subscriber marked as ${res.newStatus}.`,
      };
    }
    return { success: false, message: "Subscriber not found." };
  } catch (err) {
    console.error("[newsletterActions] Error toggling status:", err);
    return { success: false, message: "Failed to update subscriber status." };
  }
}
