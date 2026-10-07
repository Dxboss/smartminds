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

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openBooking } = useBooking();
  const { user, isAuthenticated, logout } = useAuth();

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line shadow-subtle transition-all">
      <Container>
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo variant="full-color" />

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {siteConfig.navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
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
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href={portalHref}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-navy-900 bg-paper border border-line rounded-sm hover:border-gold-500 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-[130px] truncate">{user?.name}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900 bg-white px-1.5 py-0.5 rounded border border-line">
                    {user?.role === "student"
                      ? "Learner"
                      : user?.role === "staff"
                      ? "Tutor"
                      : "Admin"}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-ink-soft hover:text-navy-900 hover:bg-paper rounded-sm border border-transparent hover:border-line transition-colors"
                  aria-label="Sign out of portal"
                >
                  <Icon name="log-out" size={17} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 px-3 py-2 rounded-sm transition-colors"
              >
                <Icon name="user" size={16} />
                <span>Log in</span>
              </Link>
            )}

            <Button variant="primary" size="md" onClick={() => openBooking()}>
              Get free advice
            </Button>
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

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-x-0 top-20 bottom-0 z-50 bg-white border-t border-line flex flex-col justify-between overflow-y-auto p-6 animate-slide-up"
        >
          <div className="space-y-6">
            <nav className="flex flex-col space-y-1">
              {siteConfig.navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between py-3.5 px-4 rounded-sm text-lg font-semibold transition-colors min-h-[44px] ${
                      isActive
                        ? "bg-paper text-navy-900 border-l-4 border-gold-500"
                        : "text-ink hover:bg-paper/60 hover:text-navy-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    <Icon
                      name="chevron-right"
                      size={18}
                      className="text-ink-soft"
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-line space-y-3">
              {isAuthenticated ? (
                <div className="p-3 bg-paper border border-line rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-navy-900">
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
                    <span className="text-xs px-2 py-0.5 bg-white border border-line font-medium text-navy-900 rounded">
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={portalHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-navy-900 text-white rounded-sm text-sm font-semibold"
                    >
                      <span>My Portal</span>
                      <Icon name="arrow-right" size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-line text-ink rounded-sm text-sm font-semibold hover:bg-paper"
                    >
                      <Icon name="log-out" size={14} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[44px] px-4 py-2.5 text-base font-semibold rounded-sm border border-navy-900 text-navy-900 flex items-center justify-center gap-2 hover:bg-navy-900 hover:text-white transition-colors"
                >
                  <Icon name="user" size={18} />
                  <span>Student & Staff Login</span>
                </Link>
              )}

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBooking();
                }}
              >
                Get free advice
              </Button>
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-6 py-2.5 text-base font-semibold rounded-sm border border-line flex items-center justify-center gap-2 text-navy-900 hover:bg-paper transition-colors"
              >
                <Icon name="whatsapp" size={18} className="text-gold-500" />
                Message on WhatsApp
              </a>
            </div>
          </div>

          {/* Bottom contact info inside mobile sheet */}
          <div className="pt-6 border-t border-line text-sm text-ink-soft space-y-1">
            <p className="font-semibold text-navy-900">
              Smartminds Training College
            </p>
            <p>{siteConfig.contact.openingHours}</p>
            <p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="underline hover:text-navy-900"
              >
                {siteConfig.contact.email}
              </a>
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
