export interface CloudflareStreamVideo {
  uid: string;
  creator?: string;
  thumbnailUrl: string;
  readyToStream: boolean;
  status: {
    state: "queued" | "downloading" | "ready" | "error";
    errorReasonCode?: string;
    errorReasonText?: string;
    pctComplete?: string;
  };
  meta: {
    name?: string;
    cohort?: string;
  };
  durationSeconds?: number;
  iframeUrl: string;
  hlsUrl: string;
  dashUrl: string;
}

export function isCloudflareStreamConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_ACCOUNT_ID.trim().length > 0 &&
      process.env.CLOUDFLARE_STREAM_API_TOKEN &&
      process.env.CLOUDFLARE_STREAM_API_TOKEN.trim().length > 0
  );
}

const PRIMARY_ALLOWED_ORIGINS = [
  "https://smartmindstraining.co.uk",
  "https://www.smartmindstraining.co.uk",
  "http://localhost:3000",
];

/**
 * Initiates an asynchronous server-side copy of a Zoom recording MP4 into Cloudflare Stream.
 * Restricts playback origins to smartmindstraining.co.uk and disables downloads for students.
 */
export async function uploadToCloudflareStreamFromUrl(params: {
  videoUrl: string;
  title: string;
  cohortName?: string;
}): Promise<CloudflareStreamVideo | null> {
  if (!isCloudflareStreamConfigured()) {
    return null;
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!.trim();
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN!.trim();

  try {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/copy`;

    const payload = {
      url: params.videoUrl,
      meta: {
        name: params.title,
        cohort: params.cohortName || "General Cohort",
        uploadedVia: "Smartminds Automated Zoom Pipeline",
      },
      allowedOrigins: PRIMARY_ALLOWED_ORIGINS,
      requireSignedURLs: false,
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("[Cloudflare Stream] Ingestion failed:", errText);
      return null;
    }

    const json = await res.json();
    const result = json.result;

    if (!result?.uid) {
      return null;
    }

    const uid = result.uid as string;

    return {
      uid,
      thumbnailUrl: `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=15s`,
      readyToStream: result.readyToStream || false,
      status: result.status || { state: "queued" },
      meta: result.meta || {},
      durationSeconds: result.duration,
      iframeUrl: `https://iframe.videodelivery.net/${uid}`,
      hlsUrl: `https://videodelivery.net/${uid}/manifest/video.m3u8`,
      dashUrl: `https://videodelivery.net/${uid}/manifest/video.mpd`,
    };
  } catch (err) {
    console.error("[Cloudflare Stream Exception] Error copying video:", err);
    return null;
  }
}

/**
 * Checks the ingestion and processing status of a video on Cloudflare Stream.
 */
export async function getCloudflareStreamStatus(
  uid: string
): Promise<CloudflareStreamVideo | null> {
  if (!isCloudflareStreamConfigured() || !uid) return null;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!.trim();
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN!.trim();

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${encodeURIComponent(
        uid
      )}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    const result = json.result;

    return {
      uid,
      thumbnailUrl: `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=15s`,
      readyToStream: result.readyToStream || false,
      status: result.status || { state: "ready" },
      meta: result.meta || {},
      durationSeconds: result.duration,
      iframeUrl: `https://iframe.videodelivery.net/${uid}`,
      hlsUrl: `https://videodelivery.net/${uid}/manifest/video.m3u8`,
      dashUrl: `https://videodelivery.net/${uid}/manifest/video.mpd`,
    };
  } catch {
    return null;
  }
}

/**
 * Generates an admin-only MP4 download link for offline backups and archiving.
 * Only accessible by college Superadmin / Owner.
 */
export async function getCloudflareStreamAdminDownloadUrl(
  uid: string
): Promise<string | null> {
  if (!isCloudflareStreamConfigured() || !uid) return null;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!.trim();
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN!.trim();

  try {
    // Generate an MP4 download on demand for admin archive
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${encodeURIComponent(
      uid
    )}/downloads`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const json = await res.json();
      return json.result?.default?.url || `https://videodelivery.net/${uid}/downloads/default.mp4`;
    }

    return `https://videodelivery.net/${uid}/downloads/default.mp4`;
  } catch {
    return null;
  }
}
