import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { seedSessions, seedClasses } from "@/lib/repositories/seedData";


/**
 * Zoom Cloud Recording & Webhook Handler for Smartminds Training College.
 * 
 * 1. Responds to Zoom endpoint validation challenges (HMAC SHA-256 encryptedToken).
 * 2. Ingests `recording.completed` webhooks and automatically links recording playback
 *    URLs to student and tutor classroom archives.
 * 3. Provides a test simulation endpoint for local review.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    // 1. Zoom Endpoint URL Validation Challenge
    if (body.event === "endpoint.url_validation") {
      const plainToken = body.payload?.plainToken;
      const secretToken =
        process.env.ZOOM_WEBHOOK_SECRET_TOKEN || "smartminds_zoom_webhook_secret_2026";

      const encryptedToken = crypto
        .createHmac("sha256", secretToken)
        .update(plainToken)
        .digest("hex");

      return NextResponse.json({
        plainToken,
        encryptedToken,
      });
    }

    // 2. Zoom Recording Completed Event
    if (body.event === "recording.completed" || body.action === "simulate_recording") {
      const recordingObject = body.payload?.object || body.object || {};
      const topic = recordingObject.topic || "Online Training Webinar";
      const startTime = recordingObject.start_time || new Date().toISOString();
      const duration = recordingObject.duration || 120;

      // Extract MP4 playback or stream URL
      const mp4File = (recordingObject.recording_files || []).find(
        (f: { file_type?: string }) => f.file_type === "MP4"
      );
      const recordingUrl =
        mp4File?.play_url ||
        mp4File?.download_url ||
        recordingObject.share_url ||
        `https://smartmindstraining.co.uk/recordings/stream/${Date.now()}`;

      // Associate recording with matching class cohort or default care cohort
      const matchedClass =
        seedClasses.find((c) =>
          topic.toLowerCase().includes(c.name.toLowerCase().slice(0, 15))
        ) || seedClasses[0];

      const newSessionId = `sess-zoom-${Date.now()}`;
      const newSession = {
        id: newSessionId,
        classId: matchedClass?.id || "class-care-l3",
        title: topic,
        scheduledAt: startTime,
        durationMinutes: duration,
        zoomLink: matchedClass?.zoomLink,
        recordingUrl,
        attendanceTracked: true,
      };

      seedSessions.unshift(newSession);

      return NextResponse.json({
        success: true,
        message: "Zoom recording ingested and added to classroom archives successfully.",
        session: newSession,
      });
    }

    return NextResponse.json({ received: true, event: body.event });
  } catch (err) {
    console.error("[Zoom Webhook Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const simulate = url.searchParams.get("simulate");

  if (simulate === "1" || simulate === "true") {
    // Admin/Dev simulation trigger
    const matchedClass = seedClasses[0];
    const simulatedSession = {
      id: `sess-sim-${Date.now()}`,
      classId: matchedClass.id,
      title: `${matchedClass.name} — Live Class Replay`,
      scheduledAt: new Date().toISOString(),
      durationMinutes: 90,
      zoomLink: matchedClass.zoomLink,
      recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      attendanceTracked: true,
    };
    seedSessions.unshift(simulatedSession);

    return NextResponse.json({
      success: true,
      simulated: true,
      message: "Simulated live recording added to student archive.",
      session: simulatedSession,
    });
  }

  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/zoom",
    supportedEvents: ["endpoint.url_validation", "recording.completed"],
  });
}
