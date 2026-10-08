"use server";

import { UserRole } from "@/lib/repositories/types";
import {
  clearSessionCookie,
  DEMO_USERS,
  setSessionCookie,
} from "@/lib/session";

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

  // Determine server-side role based on identity
  const isStaff =
    email.includes("tutor") ||
    email.includes("staff") ||
    email.includes("teacher") ||
    email.includes("marcus.vance");

  const isAdmin =
    email.includes("admin") ||
    email.includes("owner") ||
    email.includes("admissions") ||
    email.includes("principal");

  if (isAdmin || isStaff) {
    return {
      success: true,
      requires2FA: true,
      pendingRole: isAdmin ? "admin" : "staff",
    };
  }

  if (isDemo) {
    const redirectUrl = await getRedirectUrlForRole("student");
    await setSessionCookie(DEMO_USERS.student);
    return {
      success: true,
      redirectUrl,
    };
  }

  return {
    success: false,
    error:
      "Staff sign-in opens soon. If you are an enrolled student, your login details will be sent with your course induction materials.",
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
