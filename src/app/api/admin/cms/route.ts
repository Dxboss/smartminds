import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action = "publish_page", pagePath = "/", sections, headerNav, footerConfig, globalContent } = body;

    const {
      savePersistedCmsPage,
      savePersistedCmsDraft,
      loadPersistedRecords,
      syncStoreSnapshotToNeon,
    } = await import("@/lib/persistedData");
    const { savePersistentSiteTheme } = await import("@/lib/siteTheme");

    const {
      collegePageBuilderSections,
      collegePagesData,
      defaultHeaderNavConfig,
      defaultFooterConfig,
      collegeCmsContent,
    } = await import("@/lib/repositories/seedData");

    if (action === "publish_page") {
      if (!Array.isArray(sections)) {
        return NextResponse.json(
          { success: false, error: "Sections must be a valid array." },
          { status: 400 }
        );
      }

      if (collegePagesData) {
        collegePagesData[pagePath] = sections;
      }
      if (pagePath === "/") {
        collegePageBuilderSections.length = 0;
        collegePageBuilderSections.push(...sections);
      }

      // Persist to local store file AND await Neon cloud commit
      await savePersistedCmsPage(pagePath, sections);

      // Save header and footer if provided during publish
      if (headerNav || footerConfig) {
        const { savePersistentSiteTheme } = await import("@/lib/siteTheme");
        if (headerNav) {
          Object.assign(defaultHeaderNavConfig, headerNav);
          if (headerNav.logoType === "image" && headerNav.logoImageUrl) {
            defaultFooterConfig.logoType = "image";
            defaultFooterConfig.logoImageUrl = headerNav.logoImageUrl;
            if (headerNav.logoHeight) defaultFooterConfig.logoHeight = headerNav.logoHeight;
          }
        }
        if (footerConfig) {
          Object.assign(defaultFooterConfig, footerConfig);
        }
        savePersistentSiteTheme({
          headerNav: headerNav || undefined,
          footer:
            footerConfig ||
            (headerNav?.logoType === "image"
              ? {
                  logoType: "image",
                  logoImageUrl: headerNav.logoImageUrl,
                  logoHeight: headerNav.logoHeight,
                }
              : undefined),
        });
      }

      try {
        revalidatePath("/admin/cms");
        revalidatePath(pagePath);
        revalidatePath("/");
        revalidatePath("/", "layout");
      } catch {}

      return NextResponse.json({ success: true, pagePath, publishedAt: new Date().toISOString() });
    }

    if (action === "save_draft") {
      if (Array.isArray(sections)) {
        savePersistedCmsDraft(pagePath, sections);
        return NextResponse.json({ success: true, pagePath });
      }
    }

    if (action === "save_header" && headerNav) {
      const { savePersistentSiteThemeAsync } = await import("@/lib/siteTheme");
      Object.assign(defaultHeaderNavConfig, headerNav);
      await savePersistentSiteThemeAsync({ headerNav });
      try {
        revalidatePath("/", "layout");
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true });
    }

    if (action === "save_footer" && footerConfig) {
      const { savePersistentSiteThemeAsync } = await import("@/lib/siteTheme");
      Object.assign(defaultFooterConfig, footerConfig);
      await savePersistentSiteThemeAsync({ footer: footerConfig });
      try {
        revalidatePath("/", "layout");
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true });
    }

    if (action === "save_global" && globalContent) {
      Object.assign(collegeCmsContent, globalContent);
      const store = loadPersistedRecords();
      (store as any).cmsGlobalContent = globalContent;
      await syncStoreSnapshotToNeon(store);
      try {
        revalidatePath("/", "layout");
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[API /api/admin/cms] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
