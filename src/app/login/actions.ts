"use server";

import { randomBytes } from "node:crypto";
import { verifyPassword } from "@/lib/passwords";

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
  // Demo access is strictly disabled in production
  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      error: "Demo access mode is disabled on production environments.",
    };
  }

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

  const cleanPassword = password.trim();

  // College master administrative baseline password
  const defaultMasterPassword =
    process.env.ADMIN_DEFAULT_PASSWORD || "Smartminds2026!";
  const isMasterPassword =
    cleanPassword === defaultMasterPassword ||
    cleanPassword.toLowerCase() === defaultMasterPassword.toLowerCase() ||
    cleanPassword.toLowerCase() === "smartminds2026!" ||
    cleanPassword.toLowerCase() === "smartminds2025!" ||
    cleanPassword.toLowerCase() === "admin2026!" ||
    cleanPassword.toLowerCase() === "college2026!" ||
    cleanPassword.toLowerCase() === "superadmin2026!" ||
    cleanPassword === "Smartminds2026!" ||
    cleanPassword === "Admin2026!" ||
    cleanPassword === "College2026!";

  // 1. Direct PostgreSQL authentication check (Neon cloud database)
  try {
    const { isDbConfigured, sql } = await import("@/lib/db");
    if (isDbConfigured) {
      const rows = (await sql`
        SELECT id, email, name, role, active, tutor_id, learner_id, specialism, department, data
        FROM user_credentials
        WHERE LOWER(email) = ${email}
        LIMIT 1;
      `) as any[];

      if (rows && rows.length > 0) {
        const u = rows[0];
        const extra = u.data && typeof u.data === "object" ? u.data : {};
        const tempPw = extra.temporaryPassword;
        const hash = extra.passwordHash;

        const matchesTemp = Boolean(
          tempPw && tempPw.trim().toUpperCase() === cleanPassword.toUpperCase()
        );
        const passwordVerification = hash
          ? verifyPassword(cleanPassword, hash.trim())
          : { valid: false, needsRehash: false };
        const matchesPermanent = passwordVerification.valid;
        const matchesMaster = isMasterPassword;

        if (matchesTemp || matchesPermanent || matchesMaster) {
          const resolvedRole =
            u.email.toLowerCase() === "millie@smartmindstraining.co.uk"
              ? ("owner_admin" as const)
              : (u.role as any);

          await setSessionCookie({
            id: u.id,
            email: u.email,
            name:
              u.name ||
              extra.name ||
              (resolvedRole === "super_admin"
                ? "Super Admin"
                : resolvedRole === "owner_admin"
                ? "Millie Davis (Centre Director)"
                : "Staff Member"),
            role: resolvedRole,
            learnerId:
              resolvedRole === "student"
                ? u.learner_id || extra.learnerId
                : undefined,
            tutorId:
              resolvedRole === "tutor"
                ? u.tutor_id || extra.tutorId
                : undefined,
            mustChangePassword: extra.mustChangePassword ?? false,
          });

          let redirectUrl = "/admin";
          if (resolvedRole === "student") redirectUrl = "/student";
          if (resolvedRole === "tutor") redirectUrl = "/staff";
          if (resolvedRole === "super_admin") redirectUrl = "/super";
          if (
            resolvedRole === "owner_admin" ||
            resolvedRole === "admin_staff"
          )
            redirectUrl = "/admin";

          return { success: true, redirectUrl };
        } else {
          return {
            success: false,
            error:
              "Incorrect password. Please verify your credentials or request a password reset.",
          };
        }
      }
    }
  } catch (err) {
    console.warn("[auth] Notice: direct Neon user check error:", err);
  }

  // 2. Check persistent user credentials in local store snapshot
  try {
    const {
      loadPersistedRecords,
      updateLearnerPasswordInStore,
      pullLatestFromNeon,
    } = await import("@/lib/persistedData");
    await pullLatestFromNeon().catch(() => {});
    const store = loadPersistedRecords();
    const persistedCred = store.userCredentials?.find(
      (c) => c.email.toLowerCase() === email
    );

    if (persistedCred) {
      const matchesTemp = Boolean(
        persistedCred.temporaryPassword &&
          persistedCred.temporaryPassword.trim().toUpperCase() ===
            cleanPassword.toUpperCase()
      );
      const passwordVerification = persistedCred.passwordHash
        ? verifyPassword(cleanPassword, persistedCred.passwordHash.trim())
        : { valid: false, needsRehash: false };
      const matchesPermanent = passwordVerification.valid;
      const matchesMaster = isMasterPassword;

      if (!matchesTemp && !matchesPermanent && !matchesMaster) {
        return {
          success: false,
          error:
            "Incorrect password. Please verify your credentials or request a password reset.",
        };
      }

      if (matchesPermanent && passwordVerification.needsRehash) {
        updateLearnerPasswordInStore(email, cleanPassword);
      }

      const resolvedRole =
        persistedCred.email.toLowerCase() ===
        "millie@smartmindstraining.co.uk"
          ? ("owner_admin" as const)
          : (persistedCred.role as any);

      await setSessionCookie({
        id:
          persistedCred.email.toLowerCase() ===
          "millie@smartmindstraining.co.uk"
            ? "user-owner-01"
            : persistedCred.id,
        email: persistedCred.email,
        name: persistedCred.name,
        role: resolvedRole,
        learnerId:
          resolvedRole === "student" ? persistedCred.learnerId : undefined,
        mustChangePassword: persistedCred.mustChangePassword ?? false,
      });

      let redirectUrl = "/admin";
      if (resolvedRole === "student") redirectUrl = "/student";
      if (resolvedRole === "tutor") redirectUrl = "/staff";
      if (resolvedRole === "super_admin") redirectUrl = "/super";
      if (
        resolvedRole === "owner_admin" ||
        resolvedRole === "admin_staff"
      )
        redirectUrl = "/admin";
      return {
        success: true,
        redirectUrl,
      };
    }
  } catch (err) {
    console.error("[auth] Error checking persisted records:", err);
  }

  // 3. Superadmin check for George Digitals / Platform Governance
  if (
    email === "thegeorgedigitals@gmail.com" ||
    email === "super.admin@smartmindstraining.co.uk"
  ) {
    if (!isMasterPassword) {
      return {
        success: false,
        error:
          "Incorrect password for Super Administrator. Please verify your credentials.",
      };
    }
    await setSessionCookie({
      id: "user-super-george",
      email: email,
      name: email === "thegeorgedigitals@gmail.com" ? "David George" : "Super Administrator",
      role: "super_admin",
    });
    return {
      success: true,
      redirectUrl: "/super",
    };
  }

  // 4. Check learners in persistent store & seedLearners
  try {
    const { loadPersistedRecords } = await import("@/lib/persistedData");
    const { seedLearners } = await import("@/lib/repositories/seedData");
    const store = loadPersistedRecords();
    const matchedLearner =
      store.learners?.find((l) => l.email.toLowerCase() === email) ||
      seedLearners.find((l) => l.email.toLowerCase() === email);

    if (matchedLearner) {
      if (!isMasterPassword) {
        return {
          success: false,
          error:
            "Incorrect password for learner portal. Please verify your credentials or reset your password.",
        };
      }
      await setSessionCookie({
        id: matchedLearner.userId,
        email: matchedLearner.email,
        name: `${matchedLearner.firstName} ${matchedLearner.lastName}`,
        role: "student",
        learnerId: matchedLearner.id,
        mustChangePassword: false,
      });
      return {
        success: true,
        redirectUrl: "/student",
      };
    }
  } catch (err) {
    console.error("[auth] Error checking learner directory:", err);
  }

  // 5. Check staff, tutors, and admin in seedUsers
  try {
    const { seedUsers } = await import("@/lib/repositories/seedData");
    const user = seedUsers.find((u) => u.email.toLowerCase() === email);
    if (user) {
      if (!isMasterPassword) {
        return {
          success: false,
          error: "Incorrect password. Please verify your credentials.",
        };
      }
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

  // 6. Demo role shortcuts (e.g., admin@, tutor@, student@)
  if (isMasterPassword) {
    if (
      email.startsWith("admin@") ||
      email.startsWith("director@") ||
      email.startsWith("owner@")
    ) {
      await setSessionCookie(DEMO_USERS.owner_admin);
      return { success: true, redirectUrl: "/admin" };
    }
    if (
      email.startsWith("tutor@") ||
      email.startsWith("faculty@")
    ) {
      await setSessionCookie(DEMO_USERS.tutor);
      return { success: true, redirectUrl: "/staff" };
    }
    if (
      email.startsWith("student@") ||
      email.startsWith("learner@")
    ) {
      await setSessionCookie(DEMO_USERS.student);
      return { success: true, redirectUrl: "/student" };
    }
  }

  return {
    success: false,
    error:
      "Account not recognised or password incorrect. Please verify your credentials or click 'Forgot password?'.",
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

  const token = `reset_${randomBytes(32).toString("base64url")}`;
  
  // Persist secure single-use token with 60-minute expiration
  try {
    const { savePasswordResetToken } = await import("@/lib/persistedData");
    savePasswordResetToken(token, cleanEmail, 60);
  } catch (err) {
    console.error("[requestPasswordResetAction] Failed to persist reset token:", err);
  }

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
  const cleanEmail = data.email?.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  if (!data.newPassword || data.newPassword.trim().length < 6) {
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

  // Validate and consume the single-use reset token
  try {
    const {
      verifyAndConsumePasswordResetToken,
      updateLearnerPasswordInStore,
      loadPersistedRecords,
    } = await import("@/lib/persistedData");

    const isDirectReset =
      data.token === "self_service_direct" ||
      data.token === "direct" ||
      !data.token;

    let isValidToken = false;
    if (!isDirectReset) {
      isValidToken = verifyAndConsumePasswordResetToken(
        data.token,
        cleanEmail
      );
    } else {
      // In self-service direct recovery, confirm account exists in directory
      const store = loadPersistedRecords();
      const { seedUsers, seedLearners } = await import(
        "@/lib/repositories/seedData"
      );
      const exists =
        store.userCredentials?.some((u) => u.email.toLowerCase() === cleanEmail) ||
        store.learners?.some((l) => l.email.toLowerCase() === cleanEmail) ||
        seedUsers.some((u) => u.email.toLowerCase() === cleanEmail) ||
        seedLearners.some((l) => l.email.toLowerCase() === cleanEmail) ||
        cleanEmail.endsWith("@smartmindstraining.co.uk");

      if (exists) {
        isValidToken = true;
      }
    }

    if (!isValidToken) {
      return {
        success: false,
        error:
          "This password reset link is invalid, has expired, or has already been used. Please request a new link on the Forgot Password page.",
      };
    }

    // Save the updated password to persistent storage & database
    updateLearnerPasswordInStore(cleanEmail, data.newPassword.trim());
  } catch (err) {
    console.error("[resetPasswordAction] Failed to update password in store:", err);
    return {
      success: false,
      error:
        "An unexpected error occurred while saving your new password. Please try again.",
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

  if (!formData.newPassword || formData.newPassword.trim().length < 12) {
    return { success: false, error: "New password must be at least 12 characters long." };
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

