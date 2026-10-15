"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/siteConfig";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";

import {
  HeaderNavConfig,
  defaultHeaderNavConfig,
} from "@/lib/repositories/seedData";

export interface HeaderProps {
  config?: HeaderNavConfig;
  isEditor?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  isEditor = false,
}) => {
  const effectiveConfig = config || defaultHeaderNavConfig;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<
    Record<string, boolean>
  >({});
  const pathname = usePathname();
  const { openBooking } = useBooking();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isClientAuth = mounted && isAuthenticated;

  const portalHref =
    user?.role === "student"
      ? "/portal/student"
      : user?.role === "staff"
      ? "/portal/tutor"
      : "/portal/admin";

  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile menu whenever route changes during render per React guidelines
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Hide marketing website header completely inside application portals (unless forced in editor)
  if (
    !isEditor &&
    (pathname.startsWith("/portal") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/staff") ||
      pathname.startsWith("/student") ||
      pathname.startsWith("/super"))
  ) {
    return null;
  }

  const navItems = effectiveConfig.navLinks || siteConfig.navigation;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line shadow-subtle transition-all">
      {/* 1. Dynamic Top Announcement Ticker */}
      {effectiveConfig.announcementActive && (
        <aside
          aria-label="College Announcement"
          className="bg-gold-500 text-navy-900 py-2 text-xs font-bold tracking-wide border-b border-gold-600/20 overflow-hidden relative cursor-default select-none"
        >
          <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap will-change-transform">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-6 shrink-0"
              >
                <Icon name="sparkles" size={13} className="text-navy-900 shrink-0" />
                <span>{effectiveConfig.announcementText}</span>
                {effectiveConfig.announcementLink && !isEditor && (
                  <Link
                    href={effectiveConfig.announcementLink}
                    className="underline hover:text-navy-950 font-black ml-1 inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Learn more</span>
                    <Icon name="arrow-right" size={11} />
                  </Link>
                )}
                <span className="text-navy-900/35 text-[10px] mx-2 font-black">•</span>
              </div>
            ))}
          </div>
        </aside>
      )}

      <Container>
        <div className="flex items-center justify-between h-20">
          {/* Logo with dynamic Vector vs Image option */}
          <Logo
            variant="full-color"
            logoType={effectiveConfig.logoType}
            logoImageUrl={effectiveConfig.logoImageUrl}
            logoHeight={effectiveConfig.logoHeight}
            siteName={effectiveConfig.siteName}
            tagline={effectiveConfig.tagline}
          />

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {navItems.map((item) => {
              const hasChildren = Boolean(
                item.children && item.children.length > 0
              );
              const isChildActive = Boolean(
                item.children &&
                  item.children.some((c) => pathname === c.href)
              );
              const isActive = pathname === item.href || isChildActive;
              const isDropdownActive = activeDropdownId === item.id;

              if (hasChildren) {
                return (
                  <div
                    key={item.id || item.href}
                    className="relative group/nav"
                    onMouseEnter={() => setActiveDropdownId(item.id)}
                    onMouseLeave={() => setActiveDropdownId(null)}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdownId(
                          isDropdownActive ? null : item.id
                        )
                      }
                      aria-expanded={isDropdownActive}
                      aria-haspopup="true"
                      className={`flex items-center gap-1.5 text-base font-semibold transition-colors py-2 relative cursor-pointer ${
                        isActive
                          ? "text-navy-900 font-bold"
                          : "text-ink-soft hover:text-navy-900"
                      }`}
                    >
                      <span>{item.label}</span>
                      <Icon
                        name="chevron-down"
                        size={13}
                        className={`transition-transform duration-200 text-ink-soft group-hover/nav:text-navy-900 ${
                          isDropdownActive ? "rotate-180" : ""
                        }`}
                      />
                      {isActive && (
                        <span
                          className="absolute bottom-0 inset-x-0 h-0.5 bg-gold-500 rounded-full"
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    {/* Dropdown Menu Popover */}
                    <div
                      className={`absolute top-full left-0 pt-2 z-50 w-72 transition-all duration-200 ${
                        isDropdownActive
                          ? "opacity-100 visible translate-y-0 pointer-events-auto"
                          : "opacity-0 invisible -translate-y-1 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto"
                      }`}
                    >
                      <div className="bg-white rounded-md border border-line shadow-xl p-2 space-y-1">
                        {item.children?.map((child) => {
                          const isCurrent = pathname === child.href;
                          return isEditor ? (
                            <div
                              key={child.id || child.href}
                              className={`p-2.5 rounded-sm transition-colors cursor-default ${
                                isCurrent
                                  ? "bg-paper text-navy-900 font-bold"
                                  : "hover:bg-paper"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-navy-900">
                                  {child.label}
                                </span>
                                {child.badge && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-navy-900/10 text-navy-900">
                                    {child.badge}
                                  </span>
                                )}
                              </div>
                              {child.desc && (
                                <p className="text-[11px] text-ink-soft leading-tight mt-0.5">
                                  {child.desc}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Link
                              key={child.id || child.href}
                              href={child.href}
                              onClick={() => setActiveDropdownId(null)}
                              className={`block p-2.5 rounded-sm transition-colors ${
                                isCurrent
                                  ? "bg-paper text-navy-900 font-bold border-l-2 border-gold-500"
                                  : "hover:bg-paper text-ink hover:text-navy-900"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-navy-900">
                                  {child.label}
                                </span>
                                {child.badge && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-navy-900/10 text-navy-900">
                                    {child.badge}
                                  </span>
                                )}
                              </div>
                              {child.desc && (
                                <p className="text-[11px] text-ink-soft leading-tight mt-0.5">
                                  {child.desc}
                                </p>
                              )}
                            </Link>
                          );
                        })}

                        {/* Direct parent link */}
                        <div className="pt-1.5 border-t border-line/60 mt-1">
                          <Link
                            href={item.href}
                            onClick={() => setActiveDropdownId(null)}
                            className="flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-navy-900 hover:text-navy-700 hover:underline decoration-gold-500 transition-colors"
                          >
                            <span>Explore all {item.label}</span>
                            <Icon name="arrow-right" size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return isEditor ? (
                <span
                  key={item.href}
                  className={`text-base font-semibold py-2 cursor-default ${
                    isActive
                      ? "text-navy-900 font-bold"
                      : "text-ink-soft hover:text-navy-900"
                  }`}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-base font-semibold transition-colors py-2 relative ${
                    isActive
                      ? "text-navy-900 font-bold"
                      : "text-ink-soft hover:text-navy-900"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-gold-500 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isClientAuth ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-line bg-paper hover:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all cursor-pointer"
                  aria-expanded={userMenuOpen}
                  aria-label="User account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-300 font-bold text-xs flex items-center justify-center relative shadow-xs">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "SM"}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
                  </div>
                  <Icon
                    name={userMenuOpen ? "chevron-up" : "chevron-down"}
                    size={13}
                    className="text-ink-soft pr-1"
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-sm bg-white border border-line shadow-lg py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-line/70">
                      <p className="text-xs font-bold text-navy-900 truncate">
                        {user?.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-navy-900 bg-gold-300/40 px-1.5 py-0.5 rounded-xs border border-gold-500/30">
                          {user?.role === "student"
                            ? "Student"
                            : user?.role === "staff"
                            ? "Tutor"
                            : "Admin"}
                        </span>
                        <span className="text-[11px] text-ink-soft truncate font-mono">
                          {user?.email}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href={portalHref}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-navy-900 hover:bg-paper transition-colors"
                      >
                        <Icon name="home" size={14} className="text-navy-900" />
                        <span>Go to Portal Dashboard</span>
                      </Link>

                      {user?.role === "student" && (
                        <>
                          <Link
                            href="/student/courses"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors"
                          >
                            <Icon name="book-open" size={14} />
                            <span>My Qualifications</span>
                          </Link>
                          <Link
                            href="/student/assignments"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors"
                          >
                            <Icon name="file-text" size={14} />
                            <span>Assignments</span>
                          </Link>
                        </>
                      )}

                      {user?.role === "staff" && (
                        <>
                          <Link
                            href="/staff/classes"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors"
                          >
                            <Icon name="calendar" size={14} />
                            <span>My Classes &amp; Cohorts</span>
                          </Link>
                          <Link
                            href="/staff/assignments"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors"
                          >
                            <Icon name="file-text" size={14} />
                            <span>Marking &amp; Submissions</span>
                          </Link>
                        </>
                      )}

                      {user?.role === "super_admin" && (
                        <>
                          <Link
                            href="/admin/learners"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors"
                          >
                            <Icon name="users" size={14} />
                            <span>Learner Management</span>
                          </Link>
                          <Link
                            href="/admin/pipeline"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors"
                          >
                            <Icon name="message-square" size={14} />
                            <span>Pipeline &amp; Enquiries</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-line/70">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <Icon name="log-out" size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-navy-700 px-3 py-2 rounded-sm transition-colors"
              >
                <Icon name="user" size={16} />
                <span>Log in</span>
              </Link>
            )}

            <Link
              href="/enrol"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border border-gold-500/60 text-navy-900 bg-gold-300/40 hover:bg-gold-500 transition-colors shadow-xs"
            >
              <span>Enrol Now</span>
            </Link>

            {effectiveConfig.ctaButtonLink &&
            effectiveConfig.ctaButtonLink !== "/book" ? (
              <Button
                variant="primary"
                size="md"
                href={effectiveConfig.ctaButtonLink}
              >
                {effectiveConfig.ctaButtonText || "Get free advice"}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => (isEditor ? null : openBooking())}
              >
                {effectiveConfig.ctaButtonText || "Get free advice"}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-sm text-navy-900 hover:bg-paper border border-line min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Icon name={mobileMenuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </Container>

      {/* Off-Canvas Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none invisible"
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Off-Canvas Slide-Over Drawer */}
      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={`fixed top-0 bottom-0 right-0 z-[60] h-dvh w-[88vw] max-w-[340px] sm:max-w-[380px] bg-white shadow-2xl flex flex-col justify-between overflow-y-auto overscroll-contain transform transition-all duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen
            ? "translate-x-0 opacity-100 visible pointer-events-auto"
            : "translate-x-full opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Off-Canvas Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <Logo
              variant="full-color"
              logoType={effectiveConfig.logoType}
              logoImageUrl={effectiveConfig.logoImageUrl}
              logoHeight={effectiveConfig.logoHeight}
              siteName={effectiveConfig.siteName}
              tagline={effectiveConfig.tagline}
            />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-sm text-navy-900 hover:bg-paper border border-line min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Close menu"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const hasChildren = Boolean(
                item.children && item.children.length > 0
              );
              const isChildActive = Boolean(
                item.children &&
                  item.children.some((c) => pathname === c.href)
              );
              const isActive = pathname === item.href || isChildActive;
              const isExpanded = expandedMobileMenu[item.id] ?? false;

              if (hasChildren) {
                return (
                  <div
                    key={item.id || item.href}
                    className="border border-line/60 rounded-sm overflow-hidden bg-paper/30"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex-1 py-3 px-3.5 text-base font-semibold transition-colors min-h-[44px] flex items-center ${
                          isActive
                            ? "text-navy-900 font-bold"
                            : "text-ink hover:text-navy-900"
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMobileMenu((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }))
                        }
                        aria-label={`Toggle ${item.label} sub-menu`}
                        aria-expanded={isExpanded}
                        className="p-3 text-ink-soft hover:text-navy-900 min-h-[44px] min-w-[44px] flex items-center justify-center transition-transform"
                      >
                        <Icon
                          name="chevron-down"
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Expandable Sub-items */}
                    {isExpanded && (
                      <div className="bg-white border-t border-line/60 p-2 space-y-1">
                        {item.children?.map((child) => {
                          const isCurrent = pathname === child.href;
                          return (
                            <Link
                              key={child.id || child.href}
                              href={child.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block p-2.5 rounded-sm transition-colors ${
                                isCurrent
                                  ? "bg-paper text-navy-900 font-bold border-l-2 border-gold-500"
                                  : "hover:bg-paper/80 text-ink"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-navy-900">
                                  {child.label}
                                </span>
                                {child.badge && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-navy-900/10 text-navy-900">
                                    {child.badge}
                                  </span>
                                )}
                              </div>
                              {child.desc && (
                                <p className="text-[11px] text-ink-soft leading-tight mt-0.5">
                                  {child.desc}
                                </p>
                              )}
                            </Link>
                          );
                        })}
                        <div className="pt-1 border-t border-line/40">
                          <Link
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-navy-900 hover:text-navy-700"
                          >
                            <span>View all {item.label}</span>
                            <Icon name="arrow-right" size={12} />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-3 px-3.5 rounded-sm text-base font-semibold transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-paper text-navy-900 border-l-4 border-gold-500 font-bold"
                      : "text-ink hover:bg-paper/70 hover:text-navy-900"
                  }`}
                >
                  <span>{item.label}</span>
                  <Icon
                    name="chevron-right"
                    size={16}
                    className="text-ink-soft"
                  />
                </Link>
              );
            })}
          </nav>

          {/* User Account / Login Area */}
          <div className="pt-4 border-t border-line space-y-3">
            {isClientAuth ? (
              <div className="p-3.5 bg-paper border border-line rounded-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-bold text-navy-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {user?.role === "student"
                        ? "Learner Portal"
                        : user?.role === "staff"
                        ? "Tutor Console"
                        : "College Administrator"}
                    </p>
                  </div>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white border border-line text-navy-900 rounded">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={portalHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-navy-900 text-white rounded-sm text-xs font-semibold hover:bg-navy-700 transition-colors min-h-[40px]"
                  >
                    <span>My Portal</span>
                    <Icon name="arrow-right" size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-line text-ink rounded-sm text-xs font-semibold hover:bg-paper transition-colors min-h-[40px]"
                  >
                    <Icon name="log-out" size={13} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[44px] px-4 py-2.5 text-sm font-semibold rounded-sm border border-navy-900 text-navy-900 flex items-center justify-center gap-2 hover:bg-navy-900 hover:text-white transition-colors"
              >
                <Icon name="user" size={16} />
                <span>Student, Staff & Admin Login</span>
              </Link>
            )}

            <Link
              href="/enrol"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-[44px] px-4 py-2.5 text-sm font-bold rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center gap-2 hover:bg-navy-800 transition-colors shadow-xs"
            >
              <Icon name="graduation-cap" size={16} />
              <span>Online Enrolment & Registration</span>
            </Link>

            {effectiveConfig.ctaButtonLink &&
            effectiveConfig.ctaButtonLink !== "/book" ? (
              <Button
                variant="primary"
                fullWidth
                size="md"
                href={effectiveConfig.ctaButtonLink}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px]"
              >
                {effectiveConfig.ctaButtonText || "Get free advice"}
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBooking();
                }}
                className="min-h-[44px]"
              >
                {effectiveConfig.ctaButtonText || "Get free advice"}
              </Button>
            )}
            <a
              href={`https://wa.me/${effectiveConfig.whatsappNumber.replace(/\D/g, "")}?text=Hello%20Smartminds%2C%20I%20would%20like%20course%20advice`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] px-4 py-2.5 text-sm font-semibold rounded-sm border border-line flex items-center justify-center gap-2 text-navy-900 hover:bg-paper transition-colors"
            >
              <Icon name="whatsapp" size={16} className="text-gold-500" />
              <span>WhatsApp: {effectiveConfig.whatsappNumber}</span>
            </a>
          </div>
        </div>

        {/* Drawer Footer with Registered Office Details */}
        <div className="p-6 bg-paper/60 border-t border-line text-xs text-ink-soft space-y-1.5">
          <p className="font-bold text-navy-900">
            {effectiveConfig.siteName} {effectiveConfig.tagline}
          </p>
          <p>Head Office: 62 High Street, Aveley, RM15 4BX</p>
          <p>
            <a href={`tel:${effectiveConfig.supportPhone.replace(/\s+/g, "")}`} className="font-medium text-navy-900 underline hover:text-navy-700">
              {effectiveConfig.supportPhone}
            </a>
          </p>
          <p>{siteConfig.contact.openingHours}</p>
        </div>
      </div>
    </header>
  );
};
