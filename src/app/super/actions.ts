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
  updatePlatformUserInStore,
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
    return { success: false, error: "Unauthorized: Super Administrator privileges required." };
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
  const actorRole = session?.originalRole || session?.role;
  if (!session || (actorRole !== "super_admin" && actorRole !== "owner_admin")) {
    return { success: false, error: "Unauthorized: Administrator privileges required." };
  }

  if (actorRole === "owner_admin" && data.role === "super_admin") {
    return { success: false, error: "Access Denied: Only Super Administrators can create Super Admin accounts." };
  }

  if (data.password && data.password.trim().length < 8) {
    return { success: false, error: "Initial passwords must be at least 8 characters long." };
  }

  const temporaryPassword = data.password?.trim() || randomBytes(18).toString("base64url");
  const user = createPlatformUserInStore({ ...data, password: temporaryPassword });
  try {
    const { syncUserCredentialToNeon } = await import("@/lib/persistedData");
    await syncUserCredentialToNeon(user);
  } catch {}

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
      invitedByName: session.name || "Administrator",
    });

    await sendEmail({
      to: data.email.trim().toLowerCase(),
      recipientName: data.name.trim(),
      department: "security",
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
      templateKey: "staff_invitation",
      triggerEvent: `User Creation (${data.role})`,
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
  revalidatePath("/admin/staff");
  return { success: true, user };
}

export async function updatePlatformUserAction(data: {
  userIdOrEmail: string;
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  specialism?: string;
  facultyId?: string;
  facultyName?: string;
  active?: boolean;
}) {
  const session = await getServerSession();
  const actorRole = session?.originalRole || session?.role;
  if (!session || (actorRole !== "super_admin" && actorRole !== "owner_admin")) {
    return { success: false, error: "Unauthorized: Privileges required to edit users." };
  }

  const { listAllPlatformUsers } = await import("@/lib/persistedData");
  const allUsers = listAllPlatformUsers();
  const target = allUsers.find(
    (u) =>
      u.id === data.userIdOrEmail ||
      u.email.toLowerCase() === data.userIdOrEmail.toLowerCase().trim()
  );

  // Security barrier: Owner Admin cannot edit Super Admin accounts
  if (actorRole === "owner_admin" && target?.role === "super_admin") {
    return { success: false, error: "Access Denied: College Owner cannot modify Super Administrator accounts." };
  }

  if (actorRole === "owner_admin" && data.role === "super_admin") {
    return { success: false, error: "Access Denied: Only Super Administrators can grant Super Admin role." };
  }

  const result = updatePlatformUserInStore(data);
  if (!result.success) {
    return { success: false, error: result.error || `Failed to update user '${data.userIdOrEmail}'.` };
  }

  // Append audit event
  try {
    const repo = getEntitlementRepo();
    await (repo as any).recordCustomAudit?.({
      action: "USER_UPDATED",
      details: `Updated user ${data.userIdOrEmail} (Role: ${data.role || "unchanged"}, Dept: ${data.department || "unchanged"}, Specialism: ${data.specialism || "unchanged"}) by ${session.email}`,
      actor: session,
    });
  } catch {}

  revalidatePath("/super");
  revalidatePath("/admin");
  revalidatePath("/admin/staff");
  revalidatePath("/admin/tutors");
  return { success: true, user: result.user };
}

export async function updatePlatformUserRoleAction(data: {
  userIdOrEmail: string;
  newRole: UserRole;
}) {
  return updatePlatformUserAction({
    userIdOrEmail: data.userIdOrEmail,
    role: data.newRole,
  });
}

export async function deletePlatformUserAction(userIdOrEmail: string) {
  const session = await getServerSession();
  const actorRole = session?.originalRole || session?.role;
  if (!session || (actorRole !== "super_admin" && actorRole !== "owner_admin")) {
    return { success: false, error: "Unauthorized: Privileges required to delete users." };
  }

  const { listAllPlatformUsers } = await import("@/lib/persistedData");
  const allUsers = listAllPlatformUsers();
  const target = allUsers.find(
    (u) =>
      u.id === userIdOrEmail ||
      u.email.toLowerCase() === userIdOrEmail.toLowerCase().trim()
  );

  if (actorRole === "owner_admin" && target?.role === "super_admin") {
    return { success: false, error: "Access Denied: Cannot delete Super Administrator accounts." };
  }

  const success = deleteUserFromStore(userIdOrEmail);
  revalidatePath("/super");
  revalidatePath("/admin");
  revalidatePath("/admin/staff");
  revalidatePath("/admin/learners");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/availability");
  return { success };
}

export async function cleanDemoUsersAction() {
  const session = await getServerSession();
  if (!session || (session.role !== "super_admin" && session.originalRole !== "super_admin")) {
    return { success: false, error: "Unauthorized: Super Administrator privileges required." };
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
    return { success: false, error: "Unauthorized: Super Administrator privileges required." };
  }

  const result = purgeAllTestRecordsFromStore();
  revalidatePath("/super");
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  return { success: true, ...result };
}

export async function impersonateUserAction(userIdOrEmail: string): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  const session = await getServerSession();
  const actorRole = session?.originalRole || session?.role;
  if (
    !session ||
    (actorRole !== "super_admin" && actorRole !== "owner_admin")
  ) {
    return {
      success: false,
      error: "Unauthorized: Centre Director or Super Administrator privileges required to impersonate users.",
    };
  }

  const { findUserForImpersonationAsync, recordImpersonationAuditLog } = await import("@/lib/persistedData");
  const target = await findUserForImpersonationAsync(userIdOrEmail);

  if (!target) {
    return {
      success: false,
      error: `User or Learner '${userIdOrEmail}' not found.`,
    };
  }

  // Security guard: Centre Director cannot impersonate Super Admin
  if (actorRole === "owner_admin" && target.role === "super_admin") {
    return {
      success: false,
      error: "Access Denied: College Admin cannot impersonate a Super Administrator.",
    };
  }

  // Record audit log
  await recordImpersonationAuditLog({
    id: `imp-${Date.now()}-${randomBytes(4).toString("hex")}`,
    actorEmail: session.impersonatorEmail || session.email,
    actorRole,
    targetUserId: target.id,
    targetEmail: target.email,
    targetName: target.name,
    targetRole: target.role,
    action: "impersonation_started",
    timestamp: new Date().toISOString(),
  });

  // Set session cookie as target user with impersonation metadata
  await setSessionCookie({
    id: target.id,
    email: target.email,
    name: target.name,
    role: target.role as UserRole,
    learnerId: target.learnerId,
    tutorId: target.tutorId,
    isImpersonating: true,
    impersonatorEmail: session.impersonatorEmail || session.email,
    originalRole: actorRole,
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

  const actorRole = session.originalRole || "owner_admin";

  // Record audit log
  try {
    const { recordImpersonationAuditLog } = await import("@/lib/persistedData");
    await recordImpersonationAuditLog({
      id: `imp-end-${Date.now()}-${randomBytes(4).toString("hex")}`,
      actorEmail: session.impersonatorEmail || session.email,
      actorRole,
      targetUserId: session.id,
      targetEmail: session.email,
      targetName: session.name,
      targetRole: session.role,
      action: "impersonation_ended",
      timestamp: new Date().toISOString(),
    });
  } catch {}

  if (actorRole === "super_admin") {
    await setSessionCookie(DEMO_USERS.super_admin);
    revalidatePath("/super");
    return { success: true, redirectUrl: "/super" };
  } else {
    await setSessionCookie(DEMO_USERS.owner_admin);
    revalidatePath("/admin");
    return { success: true, redirectUrl: "/admin" };
  }
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
