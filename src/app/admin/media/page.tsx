import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { pullLatestFromNeon, getPersistedMediaLibrary } from "@/lib/persistedData";
import { MediaLibraryView } from "@/components/admin/MediaLibraryView";

export const metadata: Metadata = {
  title: "Media Library | Smartminds Administration",
  description:
    "Central WordPress-style media library for managing college photos, branding crests, banners, documents, and videos.",
};

export default async function AdminMediaLibraryPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?from=/admin/media");
  }

  if (
    session.role !== "admin_staff" &&
    session.role !== "owner_admin" &&
    session.role !== "super_admin"
  ) {
    redirect("/login");
  }

  await pullLatestFromNeon();
  const initialItems = getPersistedMediaLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <MediaLibraryView initialItems={initialItems} />
    </div>
  );
}

