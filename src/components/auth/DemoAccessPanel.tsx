"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAsDemoRole } from "@/app/login/actions";
import { UserRole } from "@/lib/repositories/types";
import { Icon, IconName } from "@/components/ui/Icon";

interface RoleCard {
  role: UserRole;
  label: string;
  name: string;
  destination: string;
  description: string;
  icon: IconName;
  badge?: string;
}

const ROLES: RoleCard[] = [
  {
    role: "student",
    label: "Student",
    name: "Maya Lin",
    destination: "/student",
    description: "Units, timetable, stream-only recordings, assignments, own balance",
    icon: "book-open",
  },
  {
    role: "tutor",
    label: "Tutor",
    name: "Dr. Eleanor Vance",
    destination: "/staff",
    description: "Assigned classes, Zoom links, marking criteria, outbox notifications",
    icon: "users",
  },
  {
    role: "admin_staff",
    label: "Administrative Staff",
    name: "Sarah Jenkins",
    destination: "/admin",
    description: "Enquiries, bookings, class moves, approved templates (no financial data)",
    icon: "user",
    badge: "No payments access",
  },
  {
    role: "owner_admin",
    label: "Owner Admin",
    name: "Kemi Adeleke",
    destination: "/admin",
    description: "Financials, bank transfers, course pricing, staff, calendar availability",
    icon: "shield-check",
    badge: "Full college admin",
  },
  {
    role: "super_admin",
    label: "Super Admin",
    name: "Dev Super Admin",
    destination: "/super",
    description: "Feature entitlement switches, audit logs, data reset controls",
    icon: "sparkles",
    badge: "Agency developer",
  },
];

export const DemoAccessPanel: React.FC = () => {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  // In demo mode this is rendered; if DEMO_MODE=false this returns null
  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.DEMO_MODE === "true";

  if (!isDemo) {
    return null;
  }

  const handleRoleClick = async (role: UserRole) => {
    setLoadingRole(role);
    setError(null);
    try {
      const result = await signInAsDemoRole(role);
      if (!result.success || !result.redirectUrl) {
        setError(result.error || "Failed to initialize demo session.");
        setLoadingRole(null);
        return;
      }
      router.push(result.redirectUrl);
    } catch {
      setError("An unexpected error occurred during demo session creation.");
      setLoadingRole(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 p-6 bg-paper rounded-md border-2 border-dashed border-navy-700/40 space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-navy-900 text-gold-300 text-xs font-semibold">
            <Icon name="sparkles" size={12} />
            <span>Clickable Prototype Review</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-navy-900">
            Demo access
          </h2>
          <p className="text-xs text-ink-soft leading-relaxed">
            Select a role below to explore the prototype with pre-populated fictional sample data.
            Each button signs you into a server-authenticated demo session.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-xs text-red-800 flex items-center gap-2">
          <Icon name="alert-circle" size={16} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2.5">
        {ROLES.map((r) => {
          const isLoading = loadingRole === r.role;
          return (
            <button
              key={r.role}
              type="button"
              onClick={() => handleRoleClick(r.role)}
              disabled={loadingRole !== null}
              className="w-full text-left p-3.5 bg-white hover:bg-navy-900/5 rounded-sm border border-line hover:border-navy-900 transition-all flex items-center justify-between group min-h-[56px] disabled:opacity-50"
            >
              <div className="space-y-1 pr-3">
                <div className="flex items-center gap-2">
                  <Icon
                    name={r.icon}
                    size={16}
                    className="text-navy-900 flex-shrink-0"
                  />
                  <span className="text-sm font-bold text-navy-900">
                    {r.label}: {r.name}
                  </span>
                  {r.badge && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-sm bg-navy-900/5 text-ink-soft">
                      {r.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft pl-6 line-clamp-1">
                  {r.description}
                </p>
              </div>

              <div className="flex-shrink-0 text-navy-900 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {isLoading ? (
                  <span className="text-xs text-ink-soft">Entering...</span>
                ) : (
                  <>
                    <span>Enter {r.destination}</span>
                    <Icon name="arrow-right" size={14} />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2 text-center text-[11px] text-ink-soft">
        <span>Protected demo session with signed HTTP cookie. Excluded from production builds.</span>
      </div>
    </div>
  );
};
