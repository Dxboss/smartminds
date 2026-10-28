import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSession } from "@/lib/session";
import {
  pullLatestFromNeon,
  getPersistedMediaLibrary,
  savePersistedMediaItem,
  deletePersistedMediaItem,
} from "@/lib/persistedData";

export interface MediaAsset {
  id: string;
  name: string;
  title?: string;
  fileName?: string;
  url: string;
  altText?: string;
  mimeType?: string;
  sizeBytes: number;
  category: "photography" | "logos" | "uploads" | "image" | "brand" | "document" | "video";
  createdAt: string;
}

const STOCK_MEDIA_METADATA: Record<
  string,
  { label: string; category: "photography" | "logos" | "uploads" }
> = {
  "adult-care-training.jpg": { label: "Adult Care Clinical Suite", category: "photography" },
  "certificate-moment.jpg": { label: "Graduate Receiving Certificate", category: "photography" },
  "early-years-training.jpg": { label: "Early Years & Nursery Classroom", category: "photography" },
  "hero-learner.jpg": { label: "Healthcare Student Online Study", category: "photography" },
  "hero-student-thumbsup.jpg": { label: "Confident College Graduate", category: "photography" },
  "staff-training-team.jpg": { label: "Professional Healthcare Faculty", category: "photography" },
  "teacher-training.jpg": { label: "Education & Lecturer Seminar", category: "photography" },
  "tutor-teaching.jpg": { label: "1-on-1 Assessor Mentoring Session", category: "photography" },
  "promo-woman-card.jpg": { label: "Student ID & Card Benefits", category: "photography" },
  "logo-color.png": { label: "Smartminds Official Full-Color Crest", category: "logos" },
  "logo-white.png": { label: "Smartminds White Reverse Crest", category: "logos" },
};

export async function GET() {
  try {
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await pullLatestFromNeon();
    const persisted = getPersistedMediaLibrary();
    const map = new Map<string, MediaAsset>();

    // 1. Persisted & Neon items first
    for (const item of persisted) {
      map.set(item.url, {
        id: item.id,
        name: item.title || item.fileName,
        title: item.title,
        fileName: item.fileName,
        url: item.url,
        altText: item.altText || item.title,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes || 120000,
        category:
          item.category === "brand"
            ? "logos"
            : item.url.startsWith("data:") || item.url.startsWith("/uploads/")
              ? "uploads"
              : "photography",
        createdAt: item.createdAt,
      });
    }

    // 2. Scan /public/images for any extra stock images
    const imagesDir = path.join(process.cwd(), "public", "images");
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      for (const file of files) {
        if (/\.(jpg|jpeg|png|webp|svg)$/i.test(file)) {
          const url = `/images/${file}`;
          if (map.has(url)) continue;
          const filePath = path.join(imagesDir, file);
          const stat = fs.statSync(filePath);
          const meta = STOCK_MEDIA_METADATA[file] || {
            label: file.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
            category: file.includes("logo") ? "logos" : "photography",
          };
          map.set(url, {
            id: `img-${file}`,
            name: meta.label,
            title: meta.label,
            fileName: file,
            url,
            altText: meta.label,
            mimeType: file.endsWith(".png")
              ? "image/png"
              : file.endsWith(".svg")
                ? "image/svg+xml"
                : "image/jpeg",
            sizeBytes: stat.size,
            category: meta.category,
            createdAt: stat.birthtime.toISOString(),
          });
        }
      }
    }

    const assets = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ assets });
  } catch (err: any) {
    console.error("[Media API] GET error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list media" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const base64Data = formData.get("base64") as string | null;
    const fileName =
      (formData.get("fileName") as string | null) || file?.name || "uploaded-image.jpg";

    let dataUrl = "";
    let savedSizeBytes = 0;
    let mimeType = "image/jpeg";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      mimeType = file.type || "image/jpeg";
      dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      savedSizeBytes = buffer.length;
    } else if (base64Data) {
      dataUrl = base64Data;
      savedSizeBytes = Math.round((base64Data.length * 3) / 4);
      const match = base64Data.match(/^data:([^;]+);base64,/);
      if (match) mimeType = match[1];
    } else {
      return NextResponse.json(
        { error: "No file or base64 data provided" },
        { status: 400 }
      );
    }

    const savedItem = await savePersistedMediaItem({
      fileName,
      url: dataUrl,
      mimeType,
      sizeBytes: savedSizeBytes,
      uploadedBy: session.name || session.email,
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: savedItem.id,
        name: savedItem.title,
        title: savedItem.title,
        fileName: savedItem.fileName,
        url: savedItem.url,
        altText: savedItem.altText,
        mimeType: savedItem.mimeType,
        sizeBytes: savedItem.sizeBytes || savedSizeBytes,
        category: "uploads",
        createdAt: savedItem.createdAt,
      },
    });
  } catch (err: any) {
    console.error("[Media API] POST error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      (session.role !== "owner_admin" &&
        session.role !== "super_admin" &&
        session.role !== "admin_staff")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing media id" }, { status: 400 });
    }

    await deletePersistedMediaItem(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}
