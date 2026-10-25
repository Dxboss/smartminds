import { NextRequest, NextResponse } from "next/server";
import { seedSessions, seedClasses, seedEnrolments, seedLearners } from "@/lib/repositories/seedData";
import {
  verifyAnyZoomWebhookSignature,
  handleZoomUrlValidationChallenge,
} from "@/lib/zoom";
import {
  uploadToCloudflareStreamFromUrl,
  isCloudflareStreamConfigured,
} from "@/lib/cloudflareStream";
import { sendEmail } from "@/lib/email";
import { generateNewRecordingNotificationEmail } from "@/lib/emailTemplates";
import { isDbConfigured, sql } from "@/lib/db";

/**
 * Zoom Cloud Recording & Webhook Handler for Smartminds Training College.
 *
 * 1. Responds to Zoom endpoint validation challenges (HMAC SHA-256 encryptedToken)
 *    supporting dual Zoom accounts.
 * 2. Ingests `recording.completed` webhooks and verifies HMAC-SHA256 signature.
 * 3. Automatically offloads the raw MP4 into Cloudflare Stream (with zero-download
 *    protection and domain restriction to smartmindstraining.co.uk).
 * 4. Persists the streaming playback URL into the database.
 * 5. Dispatches an automated email notification to all enrolled cohort learners.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    // 1. Zoom Endpoint URL Validation Challenge
    if (body.event === "endpoint.url_validation") {
      const plainToken = body.payload?.plainToken;
      if (!plainToken) {
        return NextResponse.json(
          { error: "Missing plainToken in URL validation challenge." },
          { status: 400 }
        );
      }

      const challengeResponse = handleZoomUrlValidationChallenge(plainToken);
      if (!challengeResponse) {
        return NextResponse.json(
          { error: "Zoom webhook secret is not configured on server." },
          { status: 500 }
        );
      }

      return NextResponse.json(challengeResponse);
    }

    // 2. Simulation Action Check (strictly non-production)
    if (body.action === "simulate_recording") {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Simulation endpoints are disabled in production." },
          { status: 403 }
        );
      }
    }

    // 3. Zoom Recording Completed Event
    if (body.event === "recording.completed" || body.action === "simulate_recording") {
      // In production, verify HMAC signature across configured Zoom accounts
      if (body.event === "recording.completed") {
        const sigHeader = req.headers.get("x-zm-signature");
        const tsHeader = req.headers.get("x-zm-request-timestamp");

        const isValid = verifyAnyZoomWebhookSignature(sigHeader, tsHeader, rawBody);
        if (!isValid) {
          console.warn("[Zoom Webhook] Signature verification failed.");
          return NextResponse.json(
            { error: "Invalid webhook signature." },
            { status: 401 }
          );
        }
      }

      const recordingObject = body.payload?.object || body.object || {};
      const topic = recordingObject.topic || "Online Training Webinar";
      const startTime = recordingObject.start_time || new Date().toISOString();
      const duration = recordingObject.duration || 60;
      const meetingId = String(recordingObject.id || recordingObject.uuid || "");

      // Extract raw MP4 download URL from Zoom
      const mp4File = (recordingObject.recording_files || []).find(
        (f: { file_type?: string }) => f.file_type === "MP4"
      );
      const rawDownloadUrl =
        mp4File?.download_url ||
        mp4File?.play_url ||
        recordingObject.share_url;

      // Associate recording with matching class cohort
      const matchedClass =
        seedClasses.find((c) =>
          topic.toLowerCase().includes(c.name.toLowerCase().slice(0, 15))
        ) || seedClasses[0];

      let effectivePlaybackUrl =
        recordingObject.share_url ||
        mp4File?.play_url ||
        `https://smartmindstraining.co.uk/recordings/stream/${Date.now()}`;

      let cloudflareUid: string | undefined = undefined;

      // Offload to Cloudflare Stream if configured (Zero-download & domain-restricted)
      if (isCloudflareStreamConfigured() && rawDownloadUrl) {
        try {
          console.log(`[Zoom Webhook] Offloading recording "${topic}" to Cloudflare Stream...`);
          const cfResult = await uploadToCloudflareStreamFromUrl({
            videoUrl: rawDownloadUrl,
            title: topic,
            cohortName: matchedClass?.name,
          });

          if (cfResult?.iframeUrl) {
            effectivePlaybackUrl = cfResult.iframeUrl;
            cloudflareUid = cfResult.uid;
            console.log(`[Zoom Webhook] Cloudflare Stream ready with UID: ${cfResult.uid}`);
          }
        } catch (streamErr) {
          console.error("[Zoom Webhook] Cloudflare Stream offload error, falling back to Zoom URL:", streamErr);
        }
      }

      const newSessionId = `sess-zoom-${Date.now()}`;
      const newSession = {
        id: newSessionId,
        classId: matchedClass?.id || "class-care-l3",
        title: topic,
        scheduledAt: startTime,
        durationMinutes: duration,
        zoomLink: matchedClass?.zoomLink,
        recordingUrl: effectivePlaybackUrl,
        cloudflareStreamUid: cloudflareUid,
        attendanceTracked: true,
      };

      // Add to in-memory store
      seedSessions.unshift(newSession);

      // Persist to Neon DB if configured
      if (isDbConfigured) {
        try {
          await sql`
            INSERT INTO system_store (key, value, updated_at)
            VALUES (${`recording_${newSessionId}`}, ${JSON.stringify(newSession)}, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
          `;
        } catch (dbErr) {
          console.warn("[Zoom Webhook DB Sync Notice]:", dbErr);
        }
      }

      // Automated Student Notification Pipeline: Dispatch Resend emails to all enrolled learners in this cohort
      try {
        const enrolledLearnerIds = seedEnrolments
          .filter((e) => e.classId === newSession.classId && e.status === "active")
          .map((e) => e.learnerId);

        const recipients = seedLearners.filter((l) =>
          enrolledLearnerIds.includes(l.id)
        );

        const formattedDate = new Date(startTime).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        for (const learner of recipients) {
          const emailTemplate = generateNewRecordingNotificationEmail({
            studentName: `${learner.firstName} ${learner.lastName}`,
            courseTitle: matchedClass?.name || "Diploma Qualification",
            sessionTitle: topic,
            sessionDate: formattedDate,
            portalUrl: "https://smartmindstraining.co.uk/student/recordings",
          });

          await sendEmail({
            to: learner.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
            department: "students",
          });
        }

        console.log(
          `[Zoom Webhook] Successfully notified ${recipients.length} enrolled student(s) of new recording.`
        );
      } catch (notifyErr) {
        console.error("[Zoom Webhook Notification Error]:", notifyErr);
      }

      return NextResponse.json({
        success: true,
        message: "Zoom recording ingested, streamed, and notifications sent.",
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
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Simulation triggers are disabled in production." },
        { status: 403 }
      );
    }

    // Admin/Dev simulation trigger for local review
    const matchedClass = seedClasses[0];
    const simulatedSession = {
      id: `sess-sim-${Date.now()}`,
      classId: matchedClass.id,
      title: `${matchedClass.name} — Live Class Replay`,
      scheduledAt: new Date().toISOString(),
      durationMinutes: 60,
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
