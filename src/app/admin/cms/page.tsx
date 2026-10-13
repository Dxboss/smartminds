import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import {
  collegeCmsContent,
  collegePageBuilderSections,
  collegePagesData,
  defaultHeaderNavConfig,
  defaultFooterConfig,
} from "@/lib/repositories/seedData";
import { SiteCmsEditorView } from "@/components/admin/SiteCmsEditorView";

export const instant = false;

export const metadata: Metadata = {
  title: "Visual Page Builder & CMS | Smartminds Administration",
  description:
    "Drag-and-drop website builder with live preview, multi-page selector, menu editor, and public copy controls.",
};

export default async function AdminCmsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/admin/cms");
  }

  if (session.role !== "owner_admin" && session.role !== "super_admin") {
    redirect("/login");
  }

  return (
    <SiteCmsEditorView
      initialSections={collegePageBuilderSections}
      initialPagesData={collegePagesData}
      initialHeaderNav={defaultHeaderNavConfig}
      initialFooterConfig={defaultFooterConfig}
      initialContent={collegeCmsContent}
      userRole={session.role}
    />
  );
}
