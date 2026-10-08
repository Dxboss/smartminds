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
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError(
        "Only the owner or super admin can list staff and tutors."
      );
    }
    return this.users
      .filter((u) => u.role === "tutor" || u.role === "admin_staff")
      .map((u) => ({ ...u }));
  }

  async inviteUser(
    actor: SessionUser,
    data: { email: string; name: string; role: UserRole }
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
      tutorId: data.role === "tutor" ? `tutor-${(this.users.length + 1).toString().padStart(3, "0")}` : undefined,
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
}
