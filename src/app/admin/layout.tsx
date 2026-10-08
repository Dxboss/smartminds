import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";

export const metadata: Metadata = {
  title: "Administration | Smartminds Training College",
  description: "College operations, admissions pipeline, learner management, and financials.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const isOwnerOrSuper =
    session.role === "owner_admin" || session.role === "super_admin";

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DemoModeBanner user={session} />

      <header className="bg-white border-b border-line sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="font-heading text-xl font-bold tracking-tight text-navy-900">
                  SMARTMINDS
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-navy-900 text-gold-300 uppercase">
                  {isOwnerOrSuper ? "Owner Admin" : "Staff Hub"}
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-ink-soft">
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-sm text-navy-900 bg-navy-900/5 font-bold"
                >
                  Overview
                </Link>

                {/* Common operational links */}
                <Link
                  href="/admin/learners"
                  className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                >
                  Learners
                </Link>
                <Link
                  href="/admin/bookings"
                  className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                >
                  Bookings
                </Link>
                <Link
                  href="/admin/templates"
                  className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                >
                  Messages
                </Link>

                {/* Owner-only administrative links (Strictly hidden from admin staff) */}
                {isOwnerOrSuper && (
                  <>
                    <Link
                      href="/admin/payments"
                      className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors text-navy-900 font-bold"
                    >
                      Payments ledger
                    </Link>
                    <Link
                      href="/admin/courses"
                      className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                    >
                      Courses & prices
                    </Link>
                    <Link
                      href="/admin/tutors"
                      className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                    >
                      Staff
                    </Link>
                    <Link
                      href="/admin/availability"
                      className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                    >
                      Availability
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy-900">{session.name}</p>
                <p className="text-[11px] text-ink-soft">
                  {isOwnerOrSuper ? "College Principal" : "Office Administrator"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                {session.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}
