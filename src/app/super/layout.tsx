import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";

export const metadata: Metadata = {
  title: "Super Admin Console | Smartminds Training College",
  description: "Developer engineering tools, feature entitlements, audit logs, and demo controls.",
};

export default async function SuperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/super");
  }

  if (session.role !== "super_admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DemoModeBanner user={session} />

      <header className="bg-navy-900 border-b border-navy-700 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/super" className="flex items-center gap-2">
                <span className="font-heading text-xl font-bold tracking-tight text-white">
                  SMARTMINDS
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-gold-500 text-navy-900 uppercase">
                  Super Admin
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-white/80">
                <Link
                  href="/super"
                  className="px-3 py-1.5 rounded-sm text-white bg-white/10 font-bold"
                >
                  Feature Entitlements
                </Link>
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-sm hover:text-white hover:bg-white/5 transition-colors"
                >
                  View College Admin
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{session.name}</p>
                <p className="text-[11px] text-white/60">Agency Engineer</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center font-bold text-xs">
                S
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}
