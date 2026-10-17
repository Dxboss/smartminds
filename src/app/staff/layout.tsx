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

export const instant = false;

export const metadata: Metadata = {
  title: "Tutor Console | Smartminds Training College",
  description: "Tutor teaching portal, cohort sessions, assignment grading, and student submissions.",
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
    <PortalSidebarLayout
      user={session}
      portalTitle="Tutor & Assessor Console"
      roleBadge="Faculty"
      roleSubtitle="Accredited Assessor & Tutor"
      navItems={TUTOR_NAV}
    >
      {children}
    </PortalSidebarLayout>
  );
}
