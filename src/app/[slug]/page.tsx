import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import {
  getAllPublishedCmsPages,
  getPublishedCmsPageSections,
  getLiveCourses,
} from "@/lib/persistedData";

// Satisfy Next.js 16 Partial Prefetching / Instant Navigation for dynamic route params
export const instant = false;

const RESERVED_SLUGS = [
  "admin",
  "api",
  "portal",
  "staff",
  "student",
  "super",
  "login",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
];

export async function generateStaticParams() {
  const allPages = getAllPublishedCmsPages();
  return Object.keys(allPages || {})
    .filter(
      (path) =>
        path.startsWith("/") &&
        path !== "/" &&
        !RESERVED_SLUGS.includes(path.slice(1))
    )
    .map((path) => ({
      slug: path.replace(/^\//, ""),
    }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (RESERVED_SLUGS.includes(slug)) {
    return { title: "Page Not Found" };
  }

  const path = "/" + slug;
  const sections = getPublishedCmsPageSections(path);

  if (!sections || sections.length === 0) {
    return {
      title: "Page Not Found",
    };
  }

  const hero = sections.find((s) => s.type === "hero");
  const fallbackTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const title = hero?.headline || fallbackTitle;
  const desc =
    hero?.subheadline ||
    "Accredited British qualifications with Smartminds Training College.";

  return {
    title: `${title} | Smartminds Training College`,
    description: desc,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | Smartminds Training College`,
      description: desc,
      type: "website",
    },
  };
}

async function CmsPageContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  const { slug } = await paramsPromise;

  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }

  const path = "/" + slug;
  const sections = getPublishedCmsPageSections(path);

  if (!sections || sections.length === 0) {
    notFound();
  }

  const liveCourses = getLiveCourses();

  return (
    <div className="bg-white min-h-screen">
      {sections.map((sec) => {
        if (!sec.enabled) return null;
        return <SectionRenderer key={sec.id} section={sec} courses={liveCourses} />;
      })}
    </div>
  );
}

export default function DynamicCmsPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-navy-900 border-t-gold-500 animate-spin" />
        </div>
      }
    >
      <CmsPageContent paramsPromise={params} />
    </Suspense>
  );
}
