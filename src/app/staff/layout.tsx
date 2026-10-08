import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { DemoOutbox } from "@/components/layout/DemoOutbox";
import { demoOutbox } from "@/lib/repositories/seedData";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Tutor Console | Smartminds Training College",
  description: "Tutor teaching portal, cohort sessions, assignment grading, and student submissions.",
};

const TUTOR_NAV = [
  { href: "/staff", label: "My classes", icon: "calendar" as const },
  { href: "/staff/assignments", label: "Assignments & marking", icon: "file-text" as const },
  { href: "/staff/recordings", label: "Recordings", icon: "video" as const },
  { href: "/staff/tasks", label: "My tasks", icon: "check-circle" as const },
];

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/staff");
  }

  if (
    session.role !== "tutor" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DemoModeBanner user={session} />

      <header className="bg-white border-b border-line sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/staff" className="flex items-center gap-2">
                <span className="font-heading text-xl font-bold tracking-tight text-navy-900">
                  SMARTMINDS
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-navy-900 text-white uppercase">
                  Tutor Console
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-ink-soft">
                {TUTOR_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-sm hover:text-navy-900 hover:bg-paper transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy-900">{session.name}</p>
                <p className="text-[11px] text-ink-soft">Teaching Faculty</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                {session.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden border-t border-line/60 bg-white/95 backdrop-blur-sm overflow-x-auto scrollbar-none px-4 py-2">
          <div className="flex items-center gap-2 min-w-max">
            {TUTOR_NAV.map((link) => (
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

      <main className="flex-1 py-6 sm:py-8">{children}</main>

      {/* Floating Demo Outbox Drawer */}
      <DemoOutbox messages={demoOutbox} />
    </div>
  );
}
