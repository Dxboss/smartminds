"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";

export type UserRole = "student" | "staff" | "owner_admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  enrolledCourse?: string;
  cohort?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginAs: (role: UserRole) => void;
  loginWithCredentials: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
}

const DEMO_USERS: Record<UserRole, AuthUser> = {
  student: {
    id: "usr_student_01",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.co.uk",
    role: "student",
    enrolledCourse: "Level 3 Diploma in Adult Care (RQF)",
    cohort: "Cohort March 2026",
  },
  staff: {
    id: "usr_tutor_01",
    name: "Dr. Marcus Vance",
    email: "marcus.vance@smartmindstraining.co.uk",
    role: "staff",
    enrolledCourse: "Health & Social Care Faculty",
    cohort: "Lead Tutor & Assessor",
  },
  owner_admin: {
    id: "usr_admin_01",
    name: "College Administration",
    email: "admissions@smartmindstraining.co.uk",
    role: "owner_admin",
    enrolledCourse: "Smartminds Empire Ltd",
    cohort: "Owner / Administrator",
  },
};

const AUTH_STORAGE_KEY = "smartminds_auth_session_v1";
const AUTH_CHANGE_EVENT = "smartminds_auth_updated";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const rawUserJson = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const user: AuthUser | null = useMemo(() => {
    if (!rawUserJson) return null;
    try {
      return JSON.parse(rawUserJson) as AuthUser;
    } catch {
      return null;
    }
  }, [rawUserJson]);

  const loginAs = (targetRole: UserRole) => {
    const demoUser = DEMO_USERS[targetRole];
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch {
      // Storage write error
    }

    if (targetRole === "student") {
      router.push("/portal/student");
    } else if (targetRole === "staff") {
      router.push("/portal/tutor");
    } else if (targetRole === "owner_admin") {
      router.push("/portal/admin");
    }
  };

  const loginWithCredentials = async (
    email: string,
    targetRole: UserRole = "student"
  ): Promise<boolean> => {
    const profile: AuthUser = {
      id: `usr_${Date.now()}`,
      name: email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: targetRole,
      enrolledCourse:
        targetRole === "student"
          ? "Level 3 Diploma in Adult Care (RQF)"
          : undefined,
      cohort: "2026 Academic Year",
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch {
      // Storage write error
    }

    if (targetRole === "student") {
      router.push("/portal/student");
    } else if (targetRole === "staff") {
      router.push("/portal/tutor");
    } else if (targetRole === "owner_admin") {
      router.push("/portal/admin");
    }

    return true;
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch {
      // Storage remove error
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loginAs,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
