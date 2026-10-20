import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { listNewsletterSubscribers } from "@/lib/persistedData";
import { SubscribersManagerView } from "@/components/admin/SubscribersManagerView";

export const metadata: Metadata = {
  title: "Newsletter Subscribers | Smartminds Training College",
  description: "Audience mailing list, subscriber verification, and CSV export.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSubscribersPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin/subscribers");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  const subscribers = listNewsletterSubscribers();

  return (
    <main className="py-6">
      <SubscribersManagerView
        initialSubscribers={subscribers}
        userRole={session.role}
      />
    </main>
  );
}
