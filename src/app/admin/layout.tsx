import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { DemoOutbox } from "@/components/layout/DemoOutbox";
import { demoOutbox } from "@/lib/repositories/seedData";
import { Icon } from "@/components/ui/Icon";
import { PortalSidebarLayout } from "@/components/portal/PortalSidebarLayout";




export const metadata: Metadata = {
  title: "Administration | Smartminds Training College",
  description: "College operations, admissions pipeline, learner management, and financials.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const STAFF_NAV = [
  { href: "/admin", label: "Overview", icon: "shield-check" as const },
  { href: "/admin/pipeline", label: "Pipeline", icon: "users" as const },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" as const },
  { href: "/admin/learners", label: "Learners", icon: "graduation-cap" as const },
  { href: "/admin/messages", label: "Messages", icon: "mail" as const },
  { href: "/admin/tasks", label: "Tasks", icon: "check-circle" as const },
];

const OWNER_EXTRA_NAV = [
  { href: "/admin/payments", label: "Payments ledger", icon: "credit-card" as const },
  { href: "/admin/courses", label: "Courses & prices", icon: "book-open" as const },
  { href: "/admin/media", label: "Media Library", icon: "image" as const },
  { href: "/admin/subscribers", label: "Subscribers", icon: "mail" as const },
  { href: "/admin/staff", label: "Staff & Tutors", icon: "users" as const },
  { href: "/admin/availability", label: "Availability", icon: "clock" as const },
  { href: "/admin/cms", label: "Site Content & CMS", icon: "file-text" as const },
  { href: "/admin/blog", label: "Articles & Blog", icon: "book-open" as const },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin");
  }

  // Ensure latest cloud changes from Neon PostgreSQL are hydrated into memory/filesystem
  try {
    const { pullLatestFromNeon } = await import("@/lib/persistedData");
    await pullLatestFromNeon();
  } catch {}

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const isOwnerOrSuper =
    session.role === "owner_admin" || session.role === "super_admin";

  const allNavLinks = isOwnerOrSuper
    ? [...STAFF_NAV, ...OWNER_EXTRA_NAV]
    : STAFF_NAV;

  return (
    <PortalSidebarLayout
      user={session}
      portalTitle={isOwnerOrSuper ? "Management Console" : "Operations Hub"}
      roleBadge={isOwnerOrSuper ? "Director" : "Staff"}
      roleSubtitle={
        isOwnerOrSuper
          ? "Training Director & Centre Lead"
          : "Operations Administrator"
      }
      navItems={allNavLinks}
    >
      {children}
    </PortalSidebarLayout>
  );
}
