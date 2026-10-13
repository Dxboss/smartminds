import { UserRepo } from "../interfaces";
import {
  PermissionDeniedError,
  SessionUser,
  UserProfile,
  UserRole,
} from "../types";
import { seedUsers } from "../seedData";

export class MemoryUserRepo implements UserRepo {
  private users: UserProfile[] = [...seedUsers];

  async getUserById(
    actor: SessionUser,
    id: string
  ): Promise<UserProfile | null> {
    if (
      actor.id !== id &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Users can only retrieve their own account profile."
      );
    }
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async listStaffAndTutors(actor: SessionUser): Promise<UserProfile[]> {
    if (
      actor.role !== "admin_staff" &&
      actor.role !== "owner_admin" &&
      actor.role !== "super_admin"
    ) {
      throw new PermissionDeniedError(
        "Only staff members and administrators can list college staff and tutors."
      );
    }
    return this.users
      .filter((u) => u.role === "tutor" || u.role === "admin_staff" || u.role === "owner_admin")
      .map((u) => ({ ...u }));
  }

  async inviteUser(
    actor: SessionUser,
    data: {
      email: string;
      name: string;
      role: UserRole;
      specialism?: string;
      department?: string;
    }
  ): Promise<UserProfile> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can issue staff/tutor invitations."
      );
    }

    const newUser: UserProfile = {
      id: `user-${(this.users.length + 1).toString().padStart(3, "0")}`,
      email: data.email.toLowerCase().trim(),
      name: data.name,
      role: data.role,
      active: true,
      createdAt: new Date().toISOString(),
      tutorId:
        data.role === "tutor"
          ? `tutor-${(this.users.length + 1).toString().padStart(3, "0")}`
          : undefined,
      specialism: data.specialism,
      department: data.department,
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async deactivateUser(actor: SessionUser, id: string): Promise<UserProfile> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can deactivate staff members."
      );
    }
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found.`);
    user.active = false;
    return { ...user };
  }

  async toggleUserStatus(actor: SessionUser, id: string): Promise<UserProfile> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can change staff activation status."
      );
    }
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found.`);
    user.active = !user.active;
    return { ...user };
  }

  async deleteUser(actor: SessionUser, id: string): Promise<boolean> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can remove staff members."
      );
    }
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    const target = this.users[idx];
    if (target.role === "owner_admin" || target.role === "super_admin") {
      throw new Error("Cannot delete primary Owner or Super Administrator account.");
    }
    this.users.splice(idx, 1);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { deleteUserFromStore } = require("@/lib/persistedData");
      deleteUserFromStore(id);
      deleteUserFromStore(target.email);
    } catch {}
    return true;
  }
}

