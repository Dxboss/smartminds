import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { Icon } from "@/components/ui/Icon";



import { PortalSidebarLayout } from "@/components/portal/PortalSidebarLayout";
import { pullLatestFromNeon, syncPersistedRecords } from "@/lib/persistedData";


export const metadata: Metadata = {
  title: "Student Portal | Smartminds Training College",
  description: "Learner study console, course units, live class timetable, and assignments.",
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

const NAV_LINKS = [
  { href: "/student", label: "Dashboard", icon: "book-open" as const },
  { href: "/student/courses", label: "My courses", icon: "graduation-cap" as const },
  { href: "/student/materials", label: "Learning materials", icon: "download" as const },
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

  await pullLatestFromNeon();
  syncPersistedRecords(false);

  return (
    <PortalSidebarLayout
      user={session}
      portalTitle="Learner Study Portal"
      roleBadge="Student"
      roleSubtitle="Active Registered Learner"
      navItems={NAV_LINKS}
    >
      {children}
    </PortalSidebarLayout>
  );
}
