"use server";

import { randomBytes } from "node:crypto";

import { getServerSession, setSessionCookie, DEMO_USERS } from "@/lib/session";
import { getEntitlementRepo } from "@/lib/repositories";
import { FeatureModuleKey, UserRole } from "@/lib/repositories/types";
import { revalidatePath } from "next/cache";
import {
  createPlatformUserInStore,
  deleteUserFromStore,
  cleanDemoUsersFromStore,
  updateUserRoleInStore,
  purgeAllTestRecordsFromStore,
  generatePlatformBackupData,
  restorePlatformBackupData,
  listAllPlatformUsers,
} from "@/lib/persistedData";

export async function toggleEntitlementAction(
  moduleKey: FeatureModuleKey,
  enabled: boolean
) {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required.");
  }
  const repo = getEntitlementRepo();
  await repo.updateEntitlement(session, moduleKey, enabled);
  revalidatePath("/super");
  revalidatePath("/admin");
  return { success: true };
}

export async function createPlatformUserAction(data: {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  department?: string;
  specialism?: string;
}) {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required.");
  }

  if (data.password && data.password.trim().length < 12) {
    throw new Error("Initial passwords must be at least 12 characters long.");
  }

  const temporaryPassword = data.password?.trim() || randomBytes(18).toString("base64url");
  const user = createPlatformUserInStore({ ...data, password: temporaryPassword });

  // Automatically dispatch branded onboarding credentials email
  try {
    const { sendEmail } = await import("@/lib/email");
    const { buildStaffInvitationEmail } = await import("@/lib/emailTemplates");
    const roleLabels: Record<string, string> = {
      tutor: "Course Tutor & Vocational Assessor",
      admin_staff: "Operations & Admissions Administrator",
      owner_admin: "Centre Director & Lead Administrator",
      super_admin: "Super Administrator (Platform Governance)",
      student: "Enrolled Student",
    };
    const roleLabel = roleLabels[data.role] || data.role;
    const emailPayload = buildStaffInvitationEmail({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role as any,
      roleLabel,
      department: data.department,
      specialism: data.specialism,
      temporaryPassword,
      invitedByName: session.name || "Super Administrator",
    });

    await sendEmail({
      to: data.email.trim().toLowerCase(),
      recipientName: data.name.trim(),
      department: "security",
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
      templateKey: "staff_invitation",
      triggerEvent: `Superadmin User Creation (${data.role})`,
    });
  } catch (err) {
    console.error("[createPlatformUserAction] Failed to dispatch onboarding email:", err);
  }

  // Append audit event
  try {
    const repo = getEntitlementRepo();
    await (repo as any).recordCustomAudit?.({
      action: "USER_CREATED",
      details: `Created new user ${data.name} (${data.email}) with role '${data.role}' by ${session.email}`,
      actor: session,
    });
  } catch {}

  revalidatePath("/super");
  revalidatePath("/admin");
  return { success: true, user };
}

export async function updatePlatformUserRoleAction(data: {
  userIdOrEmail: string;
  newRole: UserRole;
}) {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required.");
  }

  const result = updateUserRoleInStore(data.userIdOrEmail, data.newRole);
  if (!result.success) {
    throw new Error(`Failed to update role for '${data.userIdOrEmail}'.`);
  }

  // Append audit event
  try {
    const repo = getEntitlementRepo();
    await (repo as any).recordCustomAudit?.({
      action: "ROLE_CHANGED",
      details: `Changed role of user ${data.userIdOrEmail} to '${data.newRole}' by ${session.email}`,
      actor: session,
    });
  } catch {}

  revalidatePath("/super");
  revalidatePath("/admin");
  return { success: true, user: result.user };
}

export async function deletePlatformUserAction(userIdOrEmail: string) {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required.");
  }

  const success = deleteUserFromStore(userIdOrEmail);
  revalidatePath("/super");
  revalidatePath("/admin");
  return { success };
}

export async function cleanDemoUsersAction() {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required.");
  }

  const result = purgeAllTestRecordsFromStore();
  revalidatePath("/super");
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  return { success: true, ...result };
}

export async function purgeAllTestRecordsAction() {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required.");
  }

  const result = purgeAllTestRecordsFromStore();
  revalidatePath("/super");
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  return { success: true, ...result };
}

export async function impersonateUserAction(userIdOrEmail: string) {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required to impersonate users.");
  }

  const allUsers = listAllPlatformUsers();
  const target = allUsers.find(
    (u) =>
      u.id === userIdOrEmail ||
      u.email.toLowerCase() === userIdOrEmail.toLowerCase().trim()
  );

  if (!target) {
    throw new Error(`User '${userIdOrEmail}' not found.`);
  }

  // Set session cookie as target user with impersonation metadata
  await setSessionCookie({
    id: target.id,
    email: target.email,
    name: target.name,
    role: target.role as UserRole,
    learnerId: target.learnerId,
    isImpersonating: true,
    impersonatorEmail: session.impersonatorEmail || session.email,
    originalRole: "super_admin",
  });

  let redirectUrl = "/admin";
  if (target.role === "student") redirectUrl = "/student";
  if (target.role === "tutor") redirectUrl = "/staff";
  if (target.role === "admin_staff" || target.role === "owner_admin") redirectUrl = "/admin";
  if (target.role === "super_admin") redirectUrl = "/super";

  return { success: true, redirectUrl };
}

export async function stopImpersonationAction() {
  const session = await getServerSession();
  if (!session) {
    return { success: true, redirectUrl: "/login" };
  }

  // Restore primary superadmin account for George Digitals
  await setSessionCookie(DEMO_USERS.super_admin);
  revalidatePath("/super");
  return { success: true, redirectUrl: "/super" };
}

export async function getPlatformBackupJsonAction() {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required.");
  }

  const backup = generatePlatformBackupData();
  return {
    success: true,
    data: backup,
    filename: `smartminds_backup_${new Date().toISOString().slice(0, 10)}.json`,
  };
}

export async function restorePlatformBackupAction(jsonContent: string) {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    throw new Error("Unauthorized: Super Administrator privileges required.");
  }

  try {
    const parsed = JSON.parse(jsonContent);
    const result = restorePlatformBackupData(parsed);
    revalidatePath("/super");
    revalidatePath("/admin");
    revalidatePath("/student");
    revalidatePath("/staff");
    return result;
  } catch (err: any) {
    return { success: false, message: `Invalid JSON format: ${err?.message || "parse error"}` };
  }
}
