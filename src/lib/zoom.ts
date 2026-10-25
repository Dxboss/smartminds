import crypto from "crypto";

export interface ZoomAccountConfig {
  id: string;
  name: string;
  accountId?: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
}

export interface ZoomMeetingResult {
  meetingId: string;
  joinUrl: string;
  startUrl: string;
  password?: string;
  hostEmail?: string;
  accountId: string;
}

export interface ZoomRecordingFile {
  id: string;
  fileType: string;
  downloadUrl?: string;
  playUrl?: string;
  recordingStart?: string;
  recordingEnd?: string;
  fileSizeBytes?: number;
}

export interface ZoomRecordingDetails {
  meetingId: string;
  topic: string;
  shareUrl?: string;
  password?: string;
  durationMinutes?: number;
  files: ZoomRecordingFile[];
  mp4DownloadUrl?: string;
  mp4PlayUrl?: string;
}

// In-memory cache for OAuth access tokens: { [accountKey]: { token: string, expiresAt: number } }
const tokenCache: Record<string, { token: string; expiresAt: number }> = {};

/**
 * Reads and returns the configured Zoom accounts from environment variables.
 * Supports dual-account pool (Account 1 & Account 2) and falls back to legacy single account.
 */
export function getZoomAccounts(): ZoomAccountConfig[] {
  const accounts: ZoomAccountConfig[] = [];

  // Account 1 (Afternoon Pool Primary)
  const acc1Id = process.env.ZOOM_ACCOUNT_1_ID || process.env.ZOOM_ACCOUNT_ID;
  const acc1ClientId = process.env.ZOOM_ACCOUNT_1_CLIENT_ID || process.env.ZOOM_CLIENT_ID;
  const acc1Secret = process.env.ZOOM_ACCOUNT_1_CLIENT_SECRET || process.env.ZOOM_CLIENT_SECRET;
  const acc1Webhook =
    process.env.ZOOM_ACCOUNT_1_WEBHOOK_SECRET || process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

  if (acc1Id && acc1ClientId && acc1Secret) {
    accounts.push({
      id: "account-1",
      name: "Smartminds Zoom Account 1 (Afternoon Pool)",
      accountId: acc1Id,
      clientId: acc1ClientId,
      clientSecret: acc1Secret,
      webhookSecret: acc1Webhook,
    });
  }

  // Account 2 (Evening Pool Primary)
  const acc2Id = process.env.ZOOM_ACCOUNT_2_ID;
  const acc2ClientId = process.env.ZOOM_ACCOUNT_2_CLIENT_ID;
  const acc2Secret = process.env.ZOOM_ACCOUNT_2_CLIENT_SECRET;
  const acc2Webhook = process.env.ZOOM_ACCOUNT_2_WEBHOOK_SECRET;

  if (acc2Id && acc2ClientId && acc2Secret) {
    accounts.push({
      id: "account-2",
      name: "Smartminds Zoom Account 2 (Evening Pool)",
      accountId: acc2Id,
      clientId: acc2ClientId,
      clientSecret: acc2Secret,
      webhookSecret: acc2Webhook,
    });
  }

  return accounts;
}

export function isZoomConfigured(): boolean {
  return getZoomAccounts().length > 0;
}

/**
 * Retrieves a Server-to-Server OAuth access token for the given account config.
 * Tokens are cached in-memory and automatically refreshed before expiry.
 */
export async function getZoomAccessToken(account: ZoomAccountConfig): Promise<string | null> {
  if (!account.accountId || !account.clientId || !account.clientSecret) {
    return null;
  }

  const cacheKey = account.id;
  const cached = tokenCache[cacheKey];
  const now = Date.now();

  // Return cached token if valid for at least 5 more minutes
  if (cached && cached.expiresAt > now + 300000) {
    return cached.token;
  }

  try {
    const authHeader = Buffer.from(
      `${account.clientId}:${account.clientSecret}`
    ).toString("base64");

    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(
      account.accountId
    )}`;

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Zoom OAuth] Failed to get token for ${account.name}:`, errText);
      return null;
    }

    const data = await res.json();
    const token = data.access_token as string;
    const expiresIn = (data.expires_in as number) || 3600;

    tokenCache[cacheKey] = {
      token,
      expiresAt: now + expiresIn * 1000,
    };

    return token;
  } catch (err) {
    console.error(`[Zoom OAuth Exception] Error fetching token for ${account.name}:`, err);
    return null;
  }
}

/**
 * Selects the optimal Zoom account from the dual-account pool based on class timing.
 * Default mapping:
 * - Afternoon sessions (12:00pm - 3:30pm) -> Account 1
 * - Evening sessions (3:30pm onwards) -> Account 2
 * If only 1 account is configured, always selects that account.
 */
export function selectZoomAccountForSchedule(
  scheduledAt?: string,
  preferredTiming?: "afternoon" | "evening"
): ZoomAccountConfig | null {
  const accounts = getZoomAccounts();
  if (accounts.length === 0) return null;
  if (accounts.length === 1) return accounts[0];

  let isEvening = preferredTiming === "evening";

  if (!preferredTiming && scheduledAt) {
    try {
      const date = new Date(scheduledAt);
      const hours = date.getUTCHours();
      // If 15:30 (3:30pm) or later, classify as evening
      isEvening = hours >= 15;
    } catch {
      isEvening = false;
    }
  }

  // Account 2 is index 1 (Evening), Account 1 is index 0 (Afternoon)
  return isEvening ? accounts[1] || accounts[0] : accounts[0];
}

/**
 * Creates an automated class meeting on Zoom with Cloud Recording enabled.
 * Returns the joinUrl for students and startUrl for the assigned tutor.
 */
export async function createZoomMeetingForClass(params: {
  topic: string;
  startTime: string; // ISO 8601 string
  durationMinutes?: number;
  sessionTiming?: "afternoon" | "evening";
  agenda?: string;
}): Promise<ZoomMeetingResult | null> {
  const account = selectZoomAccountForSchedule(params.startTime, params.sessionTiming);
  if (!account) return null;

  const accessToken = await getZoomAccessToken(account);
  if (!accessToken) return null;

  try {
    const payload = {
      topic: params.topic,
      type: 2, // Scheduled meeting
      start_time: new Date(params.startTime).toISOString(),
      duration: params.durationMinutes || 60,
      timezone: "Europe/London",
      agenda: params.agenda || "Smartminds Training College live interactive class",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        // Mandatory for automated student recording pipeline
        auto_recording: "cloud",
        audio: "both",
        meeting_authentication: false,
      },
    };

    const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Zoom API] Failed to create meeting on ${account.name}:`, errText);
      return null;
    }

    const meeting = await res.json();

    return {
      meetingId: String(meeting.id),
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      password: meeting.password,
      hostEmail: meeting.host_email,
      accountId: account.id,
    };
  } catch (err) {
    console.error("[Zoom API Exception] Error creating meeting:", err);
    return null;
  }
}

/**
 * Fetches recording files and playback URLs for a completed Zoom meeting.
 */
export async function getZoomMeetingRecordings(
  meetingId: string
): Promise<ZoomRecordingDetails | null> {
  const accounts = getZoomAccounts();
  if (accounts.length === 0) return null;

  // Search through configured accounts to locate recording
  for (const account of accounts) {
    const accessToken = await getZoomAccessToken(account);
    if (!accessToken) continue;

    try {
      const res = await fetch(
        `https://api.zoom.us/v2/meetings/${encodeURIComponent(meetingId)}/recordings`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const files: ZoomRecordingFile[] = (data.recording_files || []).map(
          (f: any) => ({
            id: f.id,
            fileType: f.file_type,
            downloadUrl: f.download_url,
            playUrl: f.play_url,
            recordingStart: f.recording_start,
            recordingEnd: f.recording_end,
            fileSizeBytes: f.file_size,
          })
        );

        const mp4File = files.find((f) => f.fileType === "MP4");

        return {
          meetingId: String(data.id),
          topic: data.topic,
          shareUrl: data.share_url,
          password: data.password,
          durationMinutes: data.duration,
          files,
          mp4DownloadUrl: mp4File?.downloadUrl,
          mp4PlayUrl: mp4File?.playUrl || data.share_url,
        };
      }
    } catch {
      // Continue to check next account
    }
  }

  return null;
}

/**
 * Validates a Zoom webhook signature against all configured account webhook secret tokens.
 * Returns true if valid for at least one configured account.
 */
export function verifyAnyZoomWebhookSignature(
  signatureHeader: string | null,
  timestampHeader: string | null,
  rawBody: string
): boolean {
  if (!signatureHeader || !timestampHeader) return false;

  // Prevent replay attacks (must be within 5 minutes)
  const timestampNum = parseInt(timestampHeader, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (isNaN(timestampNum) || Math.abs(nowSeconds - timestampNum) > 300) {
    return false;
  }

  const message = `v0:${timestampHeader}:${rawBody}`;
  const accounts = getZoomAccounts();

  // If no webhook tokens configured and non-production, allow simulation token
  if (accounts.every((a) => !a.webhookSecret)) {
    if (process.env.NODE_ENV !== "production") {
      const defaultToken = "smartminds_zoom_webhook_secret_2026";
      const hash = crypto.createHmac("sha256", defaultToken).update(message).digest("hex");
      return signatureHeader === `v0=${hash}`;
    }
    return false;
  }

  for (const account of accounts) {
    if (!account.webhookSecret) continue;
    const hash = crypto
      .createHmac("sha256", account.webhookSecret)
      .update(message)
      .digest("hex");
    const expected = `v0=${hash}`;

    try {
      if (
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
      ) {
        return true;
      }
    } catch {
      // Continue to next account
    }
  }

  return false;
}

/**
 * Handles the Zoom URL validation challenge response for webhook setup.
 */
export function handleZoomUrlValidationChallenge(plainToken: string): {
  plainToken: string;
  encryptedToken: string;
} | null {
  const accounts = getZoomAccounts();
  const secret =
    accounts.find((a) => a.webhookSecret)?.webhookSecret ||
    process.env.ZOOM_WEBHOOK_SECRET_TOKEN ||
    (process.env.NODE_ENV !== "production" ? "smartminds_zoom_webhook_secret_2026" : null);

  if (!secret) return null;

  const encryptedToken = crypto
    .createHmac("sha256", secret)
    .update(plainToken)
    .digest("hex");

  return { plainToken, encryptedToken };
}
