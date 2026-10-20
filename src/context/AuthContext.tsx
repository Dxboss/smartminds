"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";

export type UserRole = "student" | "staff" | "owner_admin" | "super_admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  learnerId?: string;
  enrolledCourse?: string;
  enrolledCourseTitle?: string;
  enrolledLevelLabel?: string;
  cohort?: string;
  keepSignedIn?: boolean;
  accountType?: "adult_learner" | "parent_guardian";
  childName?: string;
  childYearGroup?: string;
  trainingLocation?: string;
  instalmentPlanMonths?: number;
  totalFee?: number;
  depositPaid?: number;
  balanceRemaining?: number;
  safeguardingCompleted?: boolean;
  childConcerns?: string;
  emergencyPhone?: string;
  parentSignature?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginAs: (role: UserRole, keepSignedIn?: boolean) => void;
  loginWithCredentials: (
    email: string,
    role?: UserRole,
    keepSignedIn?: boolean
  ) => Promise<boolean>;
  updateUserSession: (data: Partial<AuthUser>) => void;
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
    id: "user-owner-01",
    name: "Millie Davis",
    email: "millie@smartmindstraining.co.uk",
    role: "owner_admin",
    enrolledCourse: "Smartminds Empire Ltd",
    cohort: "Training Director & Centre Lead",
  },
  super_admin: {
    id: "usr_super_george",
    name: "David George",
    email: "thegeorgedigitals@gmail.com",
    role: "super_admin",
    cohort: "Master Governance",
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

  const loginAs = (targetRole: UserRole, keepSignedIn = false) => {
    const demoUser = { ...DEMO_USERS[targetRole], keepSignedIn };
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch {
      // Storage write error
    }

    if (targetRole === "student") {
      router.push("/student");
    } else if (targetRole === "staff") {
      router.push("/staff");
    } else if (targetRole === "owner_admin") {
      router.push("/admin");
    } else if (targetRole === "super_admin") {
      router.push("/super");
    }
  };

  const loginWithCredentials = async (
    email: string,
    targetRole: UserRole = "student",
    keepSignedIn = false
  ): Promise<boolean> => {
    const profile: AuthUser = {
      id: `usr_${Date.now()}`,
      name: email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: targetRole,
      keepSignedIn,
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
    } else if (targetRole === "super_admin") {
      router.push("/super");
    }

    return true;
  };

  const updateUserSession = (data: Partial<AuthUser>) => {
    try {
      const current = getSnapshot();
      const existing = current ? JSON.parse(current) : (user || {});
      const updated = { ...existing, ...data };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch {
      // Storage error
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch {
      // Storage remove error
    }
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loginAs,
        loginWithCredentials,
        updateUserSession,
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
