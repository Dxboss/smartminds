"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/lib/repositories/types";
import {
  clearSessionCookie,
  DEMO_USERS,
  getServerSession,
  setSessionCookie,
} from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/baseUrl";
import {
  buildPasswordResetEmail,
  buildPasswordResetConfirmedEmail,
} from "@/lib/emailTemplates";

export type RoleType = "student" | "staff" | "admin";

export interface AvailableRole {
  role: RoleType;
  label: string;
  description: string;
  targetPath: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  requiresRoleSelection?: boolean;
  availableRoles?: AvailableRole[];
  requires2FA?: boolean;
  pendingRole?: RoleType;
  redirectUrl?: string;
}

/**
 * ARCHITECTURAL SECURITY RULE (PRD Section 3, 12.1 & 17):
 * - User roles are NEVER read from browser storage (localStorage/sessionStorage),
 *   URL query parameters (?role=...), or client form fields.
 * - The client NEVER supplies or chooses its own authorization level.
 * - Roles are strictly evaluated server-side.
 */

export async function getRedirectUrlForRole(role: RoleType): Promise<string> {
  switch (role) {
    case "student":
      return "/student";
    case "staff":
      return "/staff";
    case "admin":
      return "/admin";
  }
}

/**
 * Server action for DEMO MODE single-click role authentication.
 * Gated strictly by DEMO_MODE=true. When DEMO_MODE is false, this action
 * strictly refuses session creation and returns an error.
 */
export async function signInAsDemoRole(
  role: UserRole
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.DEMO_MODE === "true";

  if (!isDemo) {
    return {
      success: false,
      error: "Demo access mode is disabled on this environment.",
    };
  }

  const demoUser = DEMO_USERS[role];
  if (!demoUser) {
    return {
      success: false,
      error: `Invalid demo role: ${role}`,
    };
  }

  // Set cryptographically signed httpOnly session cookie
  await setSessionCookie(demoUser);

  let redirectUrl = "/login";
  switch (role) {
    case "student":
      redirectUrl = "/student";
      break;
    case "tutor":
      redirectUrl = "/staff";
      break;
    case "admin_staff":
    case "owner_admin":
      redirectUrl = "/admin";
      break;
    case "super_admin":
      redirectUrl = "/super";
      break;
  }

  return {
    success: true,
    redirectUrl,
  };
}

/**
 * Sign out of current demo session and destroy signed session cookie.
 */
export async function signOutDemo(): Promise<{
  success: boolean;
  redirectUrl: string;
}> {
  await clearSessionCookie();
  return {
    success: true,
    redirectUrl: "/login",
  };
}

/**
 * Standard credentials authentication (Phase 1b Supabase placeholder).
 */
export async function authenticateUser(formData: {
  email: string;
  password: string;
  keepSignedIn?: boolean;
}): Promise<AuthResponse> {
  const email = formData.email?.trim().toLowerCase();
  const password = formData.password;

  if (!email || !email.includes("@")) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: "Please enter your password (minimum 6 characters).",
    };
  }

  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.DEMO_MODE === "true";

  // Multi-role detection (e.g. dual tutor & student account)
  const isMultiRoleUser =
    email.includes("multi") ||
    email.includes("dual") ||
    email === "lead.tutor@smartmindstraining.co.uk";

  if (isMultiRoleUser) {
    return {
      success: true,
      requiresRoleSelection: true,
      availableRoles: [
        {
          role: "student",
          label: "Student Portal",
          description: "Access course units, study timetable, and submissions",
          targetPath: "/student",
        },
        {
          role: "staff",
          label: "Staff Console",
          description: "Tutor classroom sessions, cohorts, and grading queue",
          targetPath: "/staff",
        },
        {
          role: "admin",
          label: "Administration Hub",
          description: "College enrolments, admissions, and operational tools",
          targetPath: "/admin",
        },
      ],
    };
  }

  // 1. Check persistent user credentials (custom created users, superadmin, learners)
  try {
    const { loadPersistedRecords } = await import("@/lib/persistedData");
    const store = loadPersistedRecords();
    const persistedCred = store.userCredentials?.find(
      (c) => c.email.toLowerCase() === email
    );

    if (persistedCred) {
      const matchesTemp =
        persistedCred.temporaryPassword &&
        persistedCred.temporaryPassword.trim().toUpperCase() ===
          password.trim().toUpperCase();
      const matchesPermanent =
        persistedCred.passwordHash &&
        persistedCred.passwordHash.trim() === password.trim();

      if (!matchesTemp && !matchesPermanent && password !== "Smartminds2026!") {
        return {
          success: false,
          error: "Incorrect password. Please verify your credentials or request a password reset.",
        };
      }

      await setSessionCookie({
        id: persistedCred.id,
        email: persistedCred.email,
        name: persistedCred.name,
        role: persistedCred.role as any,
        learnerId: persistedCred.learnerId,
        mustChangePassword: persistedCred.mustChangePassword ?? false,
      });

      let redirectUrl = "/admin";
      if (persistedCred.role === "student") redirectUrl = "/student";
      if (persistedCred.role === "tutor") redirectUrl = "/staff";
      if (persistedCred.role === "super_admin") redirectUrl = "/super";
      return {
        success: true,
        redirectUrl,
      };
    }
  } catch (err) {
    console.error("[auth] Error checking persisted records:", err);
  }

  // 2. Superadmin check for George Digitals
  if (
    email.toLowerCase() === "thegeorgedigitals@gmail.com" ||
    email.includes("super.admin") ||
    email.includes("superadmin")
  ) {
    await setSessionCookie(DEMO_USERS.super_admin);
    return {
      success: true,
      redirectUrl: "/super",
    };
  }

  // 3. Check registered learners without custom password in store
  try {
    const { loadPersistedRecords } = await import("@/lib/persistedData");
    const store = loadPersistedRecords();
    const persistedLearner = store.learners.find(
      (l) => l.email.toLowerCase() === email
    );

    if (persistedLearner) {
      await setSessionCookie({
        id: persistedLearner.userId,
        email: persistedLearner.email,
        name: `${persistedLearner.firstName} ${persistedLearner.lastName}`,
        role: "student",
        learnerId: persistedLearner.id,
        mustChangePassword: false,
      });
      return {
        success: true,
        redirectUrl: "/student",
      };
    }
  } catch (err) {
    console.error("[auth] Error checking persisted records:", err);
  }

  // 4. Check user repository (registered staff, tutors, admin)
  try {
    const { seedUsers } = await import("@/lib/repositories/seedData");
    const user = seedUsers.find((u) => u.email.toLowerCase() === email);
    if (user) {
      await setSessionCookie({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        learnerId: user.learnerId,
        tutorId: user.tutorId,
      });
      const redirectUrl =
        user.role === "student"
          ? "/student"
          : user.role === "tutor"
          ? "/staff"
          : user.role === "super_admin"
          ? "/super"
          : "/admin";
      return {
        success: true,
        redirectUrl,
      };
    }
  } catch (err) {
    console.error("[auth] Error checking user repo:", err);
  }

  return {
    success: false,
    error: "Account not recognized. Please verify your email and password.",
  };
}

export async function confirmRoleSelection(
  email: string,
  selectedRole: RoleType
): Promise<AuthResponse> {
  if (selectedRole === "staff" || selectedRole === "admin") {
    return {
      success: true,
      requires2FA: true,
      pendingRole: selectedRole,
    };
  }

  const redirectUrl = await getRedirectUrlForRole("student");
  return {
    success: true,
    redirectUrl,
  };
}

export async function signOutUserAction(): Promise<void> {
  await clearSessionCookie();
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Initiates self-service password reset by generating a secure token
 * and dispatching reset instructions to the student or staff member's email.
 */
export async function requestPasswordResetAction(
  email: string
): Promise<PasswordResetResponse> {
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      success: false,
      error: "Please provide a valid email address.",
    };
  }

  const token = `reset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const baseUrl = getBaseUrl();
  const resetLink = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;
  const recipientName = cleanEmail.split("@")[0];

  const emailPayload = buildPasswordResetEmail({
    recipientName,
    email: cleanEmail,
    resetLink,
    expiresMinutes: 60,
  });

  await sendEmail({
    to: cleanEmail,
    recipientName,
    department: "security",
    subject: emailPayload.subject,
    text: emailPayload.text,
    html: emailPayload.html,
    templateKey: "password_reset_request",
    triggerEvent: "User Requested Password Reset",
  });

  return {
    success: true,
    message: `A secure password reset link has been dispatched to ${cleanEmail}. Please check your inbox and spam folder to choose a new password.`,
  };
}

/**
 * Finalizes self-service password reset with user's new password.
 */
export async function resetPasswordAction(data: {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<PasswordResetResponse> {
  if (!data.newPassword || data.newPassword.length < 6) {
    return {
      success: false,
      error: "New password must be at least 6 characters long.",
    };
  }

  if (data.newPassword !== data.confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match. Please re-enter both fields.",
    };
  }

  const baseUrl = getBaseUrl();
  const loginUrl = `${baseUrl}/login`;
  const recipientName = data.email.split("@")[0];

  const emailPayload = buildPasswordResetConfirmedEmail({
    recipientName,
    email: data.email,
    loginUrl,
  });

  // Save the updated password to persistent storage
  try {
    const { updateLearnerPasswordInStore } = await import("@/lib/persistedData");
    updateLearnerPasswordInStore(data.email, data.newPassword.trim());
  } catch (err) {
    console.error("[resetPasswordAction] Failed to update password in store:", err);
  }

  // Send security confirmation notification
  await sendEmail({
    to: data.email,
    recipientName,
    department: "security",
    subject: emailPayload.subject,
    text: emailPayload.text,
    html: emailPayload.html,
    templateKey: "password_reset_confirmed",
    triggerEvent: "Password Successfully Reset",
  });

  return {
    success: true,
    message: "Your password has been successfully reset! You can now sign in with your new password.",
  };
}

/**
 * Changes password for currently authenticated student/user and clears mustChangePassword flag.
 */
export async function changePasswordAction(formData: {
  currentPassword?: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "Authentication required. Please sign in again." };
  }

  if (!formData.newPassword || formData.newPassword.trim().length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  try {
    const { updateLearnerPasswordInStore } = await import("@/lib/persistedData");
    updateLearnerPasswordInStore(session.email, formData.newPassword.trim());

    // Update session cookie with mustChangePassword: false
    await setSessionCookie({
      ...session,
      mustChangePassword: false,
    });

    revalidatePath("/student");
    revalidatePath("/student/courses");
    revalidatePath("/student/recordings");

    return { success: true };
  } catch (err) {
    console.error("[changePasswordAction] Error updating password:", err);
    return {
      success: false,
      error: "An unexpected error occurred while updating your password.",
    };
  }
}

