"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionUser } from "@/lib/repositories/types";
import { Icon, IconName } from "@/components/ui/Icon";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { DemoOutbox } from "@/components/layout/DemoOutbox";
import { OutboxMessage } from "@/lib/repositories/seedData";
import { signOutUserAction, changePasswordAction } from "@/app/login/actions";
import { useAuth } from "@/context/AuthContext";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: string | number;
}

interface PortalSidebarLayoutProps {
  user: SessionUser;
  portalTitle: string;
  roleBadge: string;
  roleSubtitle: string;
  navItems: PortalNavItem[];
  children: React.ReactNode;
  outboxMessages?: OutboxMessage[];
}

export const PortalSidebarLayout: React.FC<PortalSidebarLayoutProps> = ({
  user,
  portalTitle,
  roleBadge,
  roleSubtitle,
  navItems,
  children,
  outboxMessages,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  // Desktop sidebar collapsed state (persisted in local state)
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer open state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // In-dashboard password change modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({
        type: "error",
        text: "New password must be at least 12 characters long.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        text: "Passwords do not match. Please re-enter both fields.",
      });
      return;
    }
    setPasswordSubmitting(true);
    setPasswordFeedback(null);
    try {
      const res = await changePasswordAction({ newPassword });
      if (!res.success) {
        setPasswordFeedback({
          type: "error",
          text: res.error || "Failed to update password.",
        });
      } else {
        setPasswordFeedback({
          type: "success",
          text: "Your password has been successfully updated!",
        });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setNewPassword("");
          setConfirmPassword("");
          setPasswordFeedback(null);
        }, 1600);
      }
    } catch (err: any) {
      setPasswordFeedback({
        type: "error",
        text: err?.message || "Failed to update password.",
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const handleSignOut = async () => {
    try {
      await signOutUserAction();
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem("smartminds_auth_session_v1");
      window.dispatchEvent(new Event("smartminds_auth_updated"));
    } catch {}
    window.location.href = "/login";
  };

  const isDedicatedEditor =
    pathname === "/admin/cms" || pathname?.startsWith("/admin/cms");

  if (isDedicatedEditor) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen overflow-hidden bg-paper flex flex-col antialiased">
      {/* Thin Demo Mode Notice Bar (pinned to the very top) */}
      <DemoModeBanner user={user} />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ======================================================== */}
        {/* DESKTOP COLLAPSIBLE SIDEBAR */}
        {/* ======================================================== */}
        <aside
          aria-label="Portal Navigation"
          className={`hidden lg:flex flex-col h-full bg-white border-r border-line transition-all duration-300 ease-in-out shrink-0 z-30 select-none shadow-2xs relative ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Floating Seam Toggle Button (Linear / Notion style: positioned on the divider) */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-5 z-40 w-6 h-6 rounded-full bg-white border border-line shadow-xs flex items-center justify-center text-ink-soft hover:text-navy-900 hover:border-navy-900 transition-all cursor-pointer hover:scale-105"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon name={collapsed ? "chevron-right" : "chevron-left"} size={13} />
          </button>

          {/* Sidebar Header / Brand */}
          <div
            className={`h-16 flex items-center border-b border-line shrink-0 ${
              collapsed ? "justify-center px-2" : "px-4"
            }`}
          >
            {collapsed ? (
              <Link
                href={navItems[0]?.href || "#"}
                className="flex items-center justify-center p-1 rounded-sm hover:opacity-80 transition-opacity"
                title="Smartminds College Portal"
              >
                <img
                  src="/images/logo-color.png"
                  alt="Smartminds Training College"
                  className="h-8 w-auto object-contain"
                />
              </Link>
            ) : (
              <Link
                href={navItems[0]?.href || "#"}
                className="flex items-center gap-2.5 overflow-hidden min-w-0"
                title="Smartminds College Portal"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <img
                    src="/images/logo-color.png"
                    alt="Smartminds Training College"
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <div className="min-w-0 transition-opacity duration-200">
                  <span className="font-heading font-bold text-base tracking-tight text-navy-900 block truncate leading-tight">
                    SMARTMINDS
                  </span>
                  <span className="text-[10px] font-semibold text-gold-700 block uppercase tracking-wider truncate">
                    {portalTitle}
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* User Profile Mini Card */}
          <div
            className={`border-b border-line bg-paper/50 shrink-0 overflow-hidden ${
              collapsed ? "py-3 px-2 flex justify-center" : "p-3"
            }`}
          >
            {collapsed ? (
              <div className="flex justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-2 ring-line cursor-default"
                  title={`${user.name} (${roleBadge})`}
                >
                  {user.name.charAt(0)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-navy-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-ink-soft truncate">
                    {roleSubtitle}
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded-sm bg-navy-900/10 text-navy-900 uppercase">
                    {roleBadge}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links - clean scroll without ugly OS scrollbar or horizontal shift */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-2 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  item.href !== "/staff" &&
                  item.href !== "/student" &&
                  pathname.startsWith(item.href));

              if (collapsed) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.badge ? `${item.label} (${item.badge})` : item.label}
                    className={`w-10 h-10 mx-auto flex items-center justify-center rounded-sm transition-all cursor-pointer relative shrink-0 ${
                      isActive
                        ? "bg-navy-900 text-white shadow-xs font-bold"
                        : "text-ink-soft hover:bg-paper hover:text-navy-900"
                    }`}
                    aria-label={item.label}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      className={
                        isActive
                          ? "text-gold-300"
                          : "text-ink-soft group-hover:text-navy-900"
                      }
                    />
                    {item.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500 ring-2 ring-white" />
                    )}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors group relative cursor-pointer ${
                    isActive
                      ? "bg-navy-900 text-white shadow-xs font-bold"
                      : "text-ink-soft hover:bg-paper hover:text-navy-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      name={item.icon}
                      size={17}
                      className={
                        isActive
                          ? "text-gold-300"
                          : "text-ink-soft group-hover:text-navy-900"
                      }
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-line text-ink"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer: Public site link & Sign out */}
          <div className="p-2 pb-5 border-t border-line space-y-1 bg-paper/30 shrink-0 overflow-hidden">
            {collapsed ? (
              <div className="flex flex-col items-center space-y-1.5">
                <Link
                  href="/"
                  title="Return to Public Website"
                  className="w-10 h-10 rounded-sm flex items-center justify-center text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors cursor-pointer shrink-0"
                  aria-label="Return to Public Website"
                >
                  <Icon name="external-link" size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  title="Change Password"
                  className="w-10 h-10 rounded-sm flex items-center justify-center text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors cursor-pointer shrink-0"
                  aria-label="Change Password"
                >
                  <Icon name="shield-check" size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="w-10 h-10 rounded-sm flex items-center justify-center text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors cursor-pointer shrink-0"
                  aria-label="Sign out"
                >
                  <Icon name="log-out" size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors cursor-pointer"
                  title="Return to Public Website"
                >
                  <Icon name="external-link" size={15} />
                  <span>Public Website</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors cursor-pointer"
                  title="Change Password"
                >
                  <Icon name="shield-check" size={15} />
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <Icon name="log-out" size={15} />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* ======================================================== */}
        {/* MAIN WORKSPACE CONTENT AREA */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-paper">
          {/* Top Mobile/App Header Bar */}
          <header className="h-16 shrink-0 bg-white border-b border-line flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 shadow-2xs">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-sm text-navy-900 hover:bg-paper border border-line min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Open portal navigation"
              >
                <Icon name="menu" size={20} />
              </button>

              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/images/logo-color.png"
                  alt="Smartminds Training College"
                  className="h-8 w-auto lg:hidden object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="font-heading font-bold text-lg sm:text-xl text-navy-900 leading-tight truncate">
                    {portalTitle}
                  </h1>
                  <p className="text-[11px] text-ink-soft hidden sm:block truncate">
                    {roleSubtitle} • {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Right Utilities */}
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Session Active
              </span>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-navy-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-ink-soft">{roleBadge}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Page Slot */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto bg-paper">
            {children}
          </main>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE OFF-CANVAS NAVIGATION DRAWER */}
      {/* ======================================================== */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none invisible"
        }`}
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Portal Navigation"
        className={`fixed top-0 bottom-0 left-0 z-[60] h-dvh w-[85vw] max-w-[320px] bg-white shadow-2xl flex flex-col justify-between overflow-y-auto overscroll-contain transform transition-all duration-300 ease-in-out lg:hidden ${
          mobileDrawerOpen
            ? "translate-x-0 opacity-100 visible pointer-events-auto"
            : "-translate-x-full opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="p-5 space-y-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/logo-color.png"
                alt="Smartminds Training College"
                style={{ height: "36px", width: "auto" }}
                className="object-contain shrink-0"
              />
              <div>
                <span className="font-heading font-bold text-base text-navy-900 block leading-tight">
                  SMARTMINDS
                </span>
                <span className="text-[10px] font-semibold text-gold-700 block uppercase">
                  {portalTitle}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2 rounded-sm text-navy-900 hover:bg-paper border border-line min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close portal menu"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* User profile card */}
          <div className="p-3 bg-paper rounded-sm border border-line flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-navy-900 truncate">{user.name}</p>
              <p className="text-[11px] text-ink-soft truncate">{roleSubtitle}</p>
              <span className="inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded-sm bg-navy-900/10 text-navy-900 uppercase">
                {roleBadge}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  item.href !== "/staff" &&
                  item.href !== "/student" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-sm text-sm font-semibold transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-navy-900 text-white font-bold"
                      : "text-ink hover:bg-paper"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={item.icon}
                      size={18}
                      className={isActive ? "text-gold-300" : "text-ink-soft"}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-line text-ink"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-5 border-t border-line space-y-2 bg-paper/40">
          <Link
            href="/"
            onClick={() => setMobileDrawerOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-xs font-medium text-ink-soft hover:text-navy-900 hover:bg-paper min-h-[44px]"
          >
            <Icon name="external-link" size={16} />
            <span>View Public Website</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              setIsPasswordModalOpen(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-sm text-xs font-medium text-ink-soft hover:text-navy-900 hover:bg-paper min-h-[44px]"
          >
            <Icon name="shield-check" size={16} />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-sm text-xs font-semibold text-red-700 hover:bg-red-50 min-h-[44px]"
          >
            <Icon name="log-out" size={16} />
            <span>Sign out of Portal</span>
          </button>
        </div>
      </div>

      {/* Floating Outbox for demo audit if provided */}
      {outboxMessages && <DemoOutbox messages={outboxMessages} />}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-md border border-line shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  Update Account Password
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Set a new confidential password for {user.email}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordFeedback(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-ink-soft hover:text-navy-900 p-1 cursor-pointer"
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {passwordFeedback && (
              <div
                role="status"
                className={`p-3 rounded-sm text-xs font-semibold flex items-center gap-2 ${
                  passwordFeedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : "bg-red-50 border border-red-200 text-red-900"
                }`}
              >
                <Icon
                  name={
                    passwordFeedback.type === "success"
                      ? "check-circle"
                      : "alert-circle"
                  }
                  size={16}
                />
                <span>{passwordFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  New Password (min. 12 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 pr-10 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-navy-900"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Confirm New Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordFeedback(null);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-3 py-2 rounded-sm border border-line text-ink-soft hover:text-navy-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-4 py-2 rounded-sm bg-navy-900 text-white font-semibold hover:bg-navy-800 disabled:opacity-50 cursor-pointer"
                >
                  {passwordSubmitting ? "Updating..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
