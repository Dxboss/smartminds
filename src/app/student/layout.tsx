import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Student Portal | Smartminds Training College",
  description: "Learner study console, course units, live class timetable, and assignments.",
};

const NAV_LINKS = [
  { href: "/student", label: "Dashboard", icon: "book-open" as const },
  { href: "/student/courses", label: "My courses", icon: "graduation-cap" as const },
  { href: "/student/recordings", label: "Recordings", icon: "video" as const },
  { href: "/student/assignments", label: "Assignments", icon: "file-text" as const },
  { href: "/student/payments", label: "My payments", icon: "credit-card" as const },
  { href: "/student/profile", label: "Profile", icon: "user" as const },
];

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

      {/* Main Student Portal Header */}
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

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-ink-soft">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/student/profile"
                className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-navy-900">{session.name}</p>
                  <p className="text-[11px] text-ink-soft">{session.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                  {session.name.charAt(0)}
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        <div className="lg:hidden border-t border-line/60 bg-white/95 backdrop-blur-sm overflow-x-auto scrollbar-none px-4 py-2">
          <div className="flex items-center gap-2 min-w-max">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-navy-900 bg-paper hover:bg-navy-900 hover:text-white transition-colors min-h-[36px]"
              >
                <Icon name={link.icon} size={14} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-6 sm:py-8">{children}</main>
    </div>
  );
}
