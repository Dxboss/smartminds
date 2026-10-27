import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getLiveBlogPosts, getLiveCourses } from "@/lib/persistedData";
import { BlogManagerView } from "@/components/admin/BlogManagerView";


export const metadata: Metadata = {
  title: "Blog & Educational Articles Manager | Smartminds Administration",
  description:
    "Author, edit, and publish vocational guidance articles, career pathways, and regulatory insights for the public website.",
};

export default async function AdminBlogPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?from=/admin/blog");
  }

  // Strict role separation: Only Center Director (owner_admin) and Super Admin can manage blog articles
  if (session.role !== "owner_admin" && session.role !== "super_admin") {
    redirect("/admin");
  }

  const livePosts = getLiveBlogPosts();
  const liveCourses = getLiveCourses();

  return (
    <BlogManagerView
      initialPosts={livePosts}
      liveCourses={liveCourses}
      userRole={session.role}
    />
  );
}
