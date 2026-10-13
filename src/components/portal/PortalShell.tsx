"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Logo } from "@/components/layout/Logo";
import { Icon, IconName } from "@/components/ui/Icon";

export interface PortalMenuItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: string | number;
}

interface PortalShellProps {
  role: UserRole;
  portalTitle: string;
  portalSubtitle?: string;
  menuItems: PortalMenuItem[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  children: React.ReactNode;
}

export const PortalShell: React.FC<PortalShellProps> = ({
  role,
  portalTitle,
  portalSubtitle,
  menuItems,
  activeSection,
  onSectionChange,
  children,
}) => {
  const { user, loginAs, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string }> = {
    student: {
      title: "Learner Portal",
      badge: "Enrolled Learner",
      color: "bg-gold-500/20 text-gold-300 border-gold-500/40",
    },
    staff: {
      title: "Tutor Console",
      badge: "Lead Assessor",
      color: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    },
    owner_admin: {
      title: "Admin / Owner Hub",
      badge: "Executive Admin",
      color: "bg-amber-500/20 text-gold-300 border-gold-500/40",
    },
    super_admin: {
      title: "Super Admin Governance",
      badge: "Master Governance",
      color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
  };

  const currentRoleInfo = roleLabels[role] || roleLabels.owner_admin;
  const activeItem = menuItems.find((item) => item.id === activeSection) || menuItems[0];

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-navy-900/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar: Desktop Sticky + Mobile Slide-over */}
      <aside
        aria-label="Portal Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-30 flex flex-col bg-navy-900 text-white border-r border-navy-700 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${
          mobileDrawerOpen
            ? "translate-x-0 w-72 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header & Brand */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-navy-700/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo
              variant={collapsed ? "mark-only" : "white"}
              className="flex-shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-300 truncate">
                  {currentRoleInfo.title}
                </span>
                <span className="text-xs text-white/70 truncate">
                  {currentRoleInfo.badge}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 text-white/70 hover:text-white hover:bg-navy-700 rounded-sm transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon
              name={collapsed ? "chevron-right" : "chevron-left"}
              size={18}
            />
          </button>

          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-navy-700 rounded-sm"
            aria-label="Close sidebar menu"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav
          className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto"
          aria-label="Portal Navigation"
        >
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSectionChange(item.id);
                  setMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-sm text-sm font-semibold transition-all relative group min-h-[44px] ${
                  isActive
                    ? "bg-navy-700 text-white font-bold shadow-sm"
                    : "text-white/75 hover:bg-navy-700/50 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <span
                    className="absolute left-0 inset-y-1 w-1 bg-gold-500 rounded-r"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  name={item.icon}
                  size={20}
                  className={`flex-shrink-0 ${
                    isActive ? "text-gold-300" : "text-white/70 group-hover:text-gold-300"
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gold-500 text-navy-900 flex-shrink-0">
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Badge Dot Indicator */}
                {collapsed && item.badge !== undefined && (
                  <span
                    className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gold-500"
                    title={`${item.label}: ${item.badge}`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Role Switcher (Evaluation Pill) */}
        {!collapsed ? (
          <div className="p-3 mx-3 mb-4 rounded-sm bg-navy-700/60 border border-navy-700 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gold-300">
              <span>Quick Role Switch</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => loginAs("student")}
                className={`py-1 px-1 rounded transition-colors text-center ${
                  role === "student"
                    ? "bg-gold-500 text-navy-900"
                    : "bg-navy-900 text-white/75 hover:text-white"
                }`}
                title="Switch to Student view"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => loginAs("staff")}
                className={`py-1 px-1 rounded transition-colors text-center ${
                  role === "staff"
                    ? "bg-gold-500 text-navy-900"
                    : "bg-navy-900 text-white/75 hover:text-white"
                }`}
                title="Switch to Tutor view"
              >
                Tutor
              </button>
              <button
                type="button"
                onClick={() => loginAs("owner_admin")}
                className={`py-1 px-1 rounded transition-colors text-center ${
                  role === "owner_admin"
                    ? "bg-gold-500 text-navy-900"
                    : "bg-navy-900 text-white/75 hover:text-white"
                }`}
                title="Switch to Admin view"
              >
                Admin
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center border-t border-navy-700">
            <button
              type="button"
              onClick={() => {
                const nextRole: UserRole =
                  role === "student" ? "staff" : role === "staff" ? "owner_admin" : "student";
                loginAs(nextRole);
              }}
              className="p-2 text-gold-300 hover:text-white"
              title="Click to cycle role view (Student/Tutor/Admin)"
            >
              <Icon name="sparkles" size={18} />
            </button>
          </div>
        )}

        {/* User Identity & Portal Actions */}
        <div className="p-3 border-t border-navy-700/80 bg-navy-900/90 space-y-2">
          <div className="flex items-center gap-3 p-1.5 rounded-sm">
            <div className="w-9 h-9 rounded-full bg-gold-500 text-navy-900 font-heading font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            {!collapsed && (
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || "College User"}
                </p>
                <p className="text-[11px] text-white/60 truncate">
                  {user?.email || "signed in"}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1 pt-1">
            <Link
              href="/"
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-white/75 hover:text-white hover:bg-navy-700/60 rounded-sm transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
              title="Return to Public Website"
            >
              <Icon name="arrow-left" size={15} />
              {!collapsed && <span>Main Website</span>}
            </Link>

            <button
              type="button"
              onClick={logout}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-300 hover:text-white hover:bg-red-900/40 rounded-sm transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
              title="Sign Out of College Portal"
            >
              <Icon name="log-out" size={15} />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Clean Application Top Bar (Single Bar) */}
        <header className="h-16 bg-white border-b border-line px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-sm text-navy-900 hover:bg-paper border border-line min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Open sidebar menu"
            >
              <Icon name="menu" size={20} />
            </button>

            {/* Breadcrumb / Active View Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <span>{portalTitle}</span>
                <span>/</span>
                <span className="font-semibold text-navy-900">{activeItem?.label}</span>
              </div>
              {portalSubtitle && (
                <p className="text-[11px] text-ink-soft hidden md:block">
                  {portalSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-3">
            {/* Live System Status Dot */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Portal Connected</span>
            </div>

            {/* Active User Badge */}
            <div className="flex items-center gap-2 text-xs font-bold text-navy-900 bg-paper px-3 py-1.5 rounded border border-line">
              <span className="max-w-[120px] truncate">{user?.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-ink-soft bg-white px-1.5 py-0.5 rounded border border-line hidden sm:inline">
                {currentRoleInfo.badge}
              </span>
            </div>

            {/* Quick Sign Out */}
            <button
              type="button"
              onClick={logout}
              className="p-2 text-ink-soft hover:text-navy-900 hover:bg-paper rounded-sm border border-transparent hover:border-line transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <Icon name="log-out" size={17} />
            </button>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
