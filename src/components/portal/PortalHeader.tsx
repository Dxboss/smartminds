"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/layout/Logo";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";

interface PortalHeaderProps {
  portalRole: "student" | "staff" | "owner_admin";
  portalTitle: string;
  subtitle?: string;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  portalRole,
  portalTitle,
  subtitle,
}) => {
  const { user, logout } = useAuth();

  const roleBadge = {
    student: {
      label: "Enrolled Learner",
      badgeColor: "bg-gold-500/15 text-navy-900 border-gold-500/40",
    },
    staff: {
      label: "Lead Assessor & Tutor",
      badgeColor: "bg-navy-900 text-white border-navy-900",
    },
    owner_admin: {
      label: "Owner / Administration",
      badgeColor: "bg-navy-900 text-gold-300 border-navy-700",
    },
  }[portalRole];

  return (
    <header className="bg-white border-b border-line sticky top-0 z-30 shadow-subtle">
      <Container>
        <div className="flex items-center justify-between h-20">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Logo variant="full-color" />
            <div className="hidden sm:block h-8 w-[1px] bg-line" aria-hidden="true" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg uppercase tracking-tight text-navy-900">
                  {portalTitle}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${roleBadge.badgeColor}`}
                >
                  {roleBadge.label}
                </span>
              </div>
              {subtitle && <p className="text-xs text-ink-soft">{subtitle}</p>}
            </div>
          </div>

          {/* Profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User identification */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-paper rounded-sm border border-line">
              <div className="w-8 h-8 rounded-full bg-navy-900 text-white font-heading font-bold text-sm flex items-center justify-center">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-navy-900 leading-tight">
                  {user?.name || "College User"}
                </p>
                <p className="text-[11px] text-ink-soft leading-tight truncate max-w-[140px]">
                  {user?.email || "Signed in"}
                </p>
              </div>
            </div>

            {/* Link back to public site */}
            <Link
              href="/"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-900 px-3 py-2 rounded-sm border border-transparent hover:border-line transition-colors"
            >
              <span>Main Site</span>
              <Icon name="external-link" size={14} />
            </Link>

            {/* Sign Out CTA */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink-soft hover:text-navy-900 hover:bg-paper border border-line rounded-sm transition-colors min-h-[38px]"
              title="Sign out of portal session"
            >
              <Icon name="log-out" size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
};
