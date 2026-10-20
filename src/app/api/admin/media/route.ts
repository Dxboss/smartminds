import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSession } from "@/lib/session";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  category: "photography" | "logos" | "uploads";
  createdAt: string;
}

const STOCK_MEDIA_METADATA: Record<string, { label: string; category: "photography" | "logos" | "uploads" }> = {
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

function ensureUploadsDir(): string {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.role !== "owner_admin" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets: MediaAsset[] = [];

    // 1. Scan /public/images
    const imagesDir = path.join(process.cwd(), "public", "images");
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      for (const file of files) {
        if (/\.(jpg|jpeg|png|webp|svg)$/i.test(file)) {
          const filePath = path.join(imagesDir, file);
          const stat = fs.statSync(filePath);
          const meta = STOCK_MEDIA_METADATA[file] || {
            label: file.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
            category: file.includes("logo") ? "logos" : "photography",
          };
          assets.push({
            id: `img-${file}`,
            name: meta.label,
            url: `/images/${file}`,
            sizeBytes: stat.size,
            category: meta.category,
            createdAt: stat.birthtime.toISOString(),
          });
        }
      }
    }

    // 2. Scan /public/uploads
    const uploadsDir = ensureUploadsDir();
    const uploadedFiles = fs.readdirSync(uploadsDir);
    for (const file of uploadedFiles) {
      if (/\.(jpg|jpeg|png|webp|svg)$/i.test(file)) {
        const filePath = path.join(uploadsDir, file);
        const stat = fs.statSync(filePath);
        assets.push({
          id: `upload-${file}`,
          name: file.replace(/^\d+-/, "").replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
          url: `/uploads/${file}`,
          sizeBytes: stat.size,
          category: "uploads",
          createdAt: stat.birthtime.toISOString(),
        });
      }
    }

    // Sort newest first
    assets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ assets });
  } catch (err: any) {
    console.error("[Media API] GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to list media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.role !== "owner_admin" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const base64Data = formData.get("base64") as string | null;
    const fileName = (formData.get("fileName") as string | null) || "uploaded-image";

    const uploadsDir = ensureUploadsDir();

    let savedUrl = "";
    let savedSizeBytes = 0;
    const timestamp = Date.now();
    const cleanBaseName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const targetFilename = `${timestamp}-${cleanBaseName.replace(/\.[^.]+$/, "")}${ext}`;
      const targetPath = path.join(uploadsDir, targetFilename);
      fs.writeFileSync(targetPath, buffer);
      savedUrl = `/uploads/${targetFilename}`;
      savedSizeBytes = buffer.length;
    } else if (base64Data) {
      // Decode base64 data URL
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "Invalid base64 payload" }, { status: 400 });
      }
      const mime = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      const ext = mime.includes("png") ? ".png" : mime.includes("svg") ? ".svg" : mime.includes("webp") ? ".webp" : ".jpg";
      const targetFilename = `${timestamp}-${cleanBaseName.replace(/\.[^.]+$/, "")}${ext}`;
      const targetPath = path.join(uploadsDir, targetFilename);
      fs.writeFileSync(targetPath, buffer);
      savedUrl = `/uploads/${targetFilename}`;
      savedSizeBytes = buffer.length;
    } else {
      return NextResponse.json({ error: "No file or base64 data provided" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      asset: {
        id: `upload-${path.basename(savedUrl)}`,
        name: cleanBaseName.replace(/\.[^.]+$/, ""),
        url: savedUrl,
        sizeBytes: savedSizeBytes,
        category: "uploads",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[Media API] POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload image" }, { status: 500 });
  }
}
