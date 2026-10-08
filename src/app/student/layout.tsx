import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";

export const metadata: Metadata = {
  title: "Student Portal | Smartminds Training College",
  description: "Learner study console, course units, live class timetable, and assignments.",
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/student");
  }

  if (
    session.role !== "student" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DemoModeBanner user={session} />

      {/* Student Portal Navigation Bar */}
      <header className="bg-white border-b border-line sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/student" className="flex items-center gap-2">
                <span className="font-heading text-xl font-bold tracking-tight text-navy-900">
                  SMARTMINDS
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 uppercase">
                  Student
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-ink-soft">
                <Link
                  href="/student"
                  className="px-3 py-1.5 rounded-sm text-navy-900 bg-navy-900/5 font-bold"
                >
                  Dashboard
                </Link>
                <Link
                  href="/student/courses"
                  className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                >
                  My courses
                </Link>
                <Link
                  href="/student/recordings"
                  className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                >
                  Recordings
                </Link>
                <Link
                  href="/student/assignments"
                  className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                >
                  Assignments
                </Link>
                <Link
                  href="/student/payments"
                  className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                >
                  My payments
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy-900">{session.name}</p>
                <p className="text-[11px] text-ink-soft">{session.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                {session.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}
