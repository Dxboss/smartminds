import { cookies } from "next/headers";
import { connection } from "next/server";
import { SessionUser, UserRole } from "./repositories/types";

export const DEMO_COOKIE_NAME = "smartminds_demo_session";

const DEFAULT_FALLBACK_SECRET = "smartminds-demo-secret-key-2026-for-client-review-only";
const EXAMPLE_ENV_SECRET = "smartminds-session-secret-change-in-production-2026";
let _runtimeEphemeralSecret: string | null = null;

export function getSessionSecret(): string {
  const envSecret = process.env.SESSION_SECRET || process.env.DEMO_SESSION_SECRET;
  const trimmedSecret = envSecret?.trim();
  if (
    trimmedSecret &&
    trimmedSecret.length >= 32 &&
    trimmedSecret !== DEFAULT_FALLBACK_SECRET &&
    trimmedSecret !== EXAMPLE_ENV_SECRET
  ) {
    return trimmedSecret;
  }

  // In production, NEVER trust or sign with the public GitHub fallback string!
  if (process.env.NODE_ENV === "production") {
    if (!_runtimeEphemeralSecret) {
      const random = new Uint8Array(32);
      crypto.getRandomValues(random);
      _runtimeEphemeralSecret = Array.from(random, (byte) => byte.toString(16).padStart(2, "0")).join("");
      console.warn(
        "[SECURITY] Notice: SESSION_SECRET is not configured or using public default in production. Generated dynamic runtime secret to prevent token forgery."
      );
    }
    return _runtimeEphemeralSecret;
  }

  return DEFAULT_FALLBACK_SECRET;
}

export const DEMO_USERS: Record<UserRole, SessionUser> = {
  student: {
    id: "user-learner-001",
    email: "maya.lin@example.com",
    name: "Maya Lin",
    role: "student",
    learnerId: "learner-001",
  },
  tutor: {
    id: "user-tutor-01",
    email: "eleanor.vance@smartmindstraining.co.uk",
    name: "Dr. Eleanor Vance",
    role: "tutor",
    tutorId: "tutor-001",
  },
  admin_staff: {
    id: "user-admin-01",
    email: "sarah.jenkins@smartmindstraining.co.uk",
    name: "Sarah Jenkins",
    role: "admin_staff",
  },
  owner_admin: {
    id: "user-owner-01",
    email: "millie@smartmindstraining.co.uk",
    name: "Millie Davis",
    role: "owner_admin",
  },
  super_admin: {
    id: "user-super-george",
    email: "thegeorgedigitals@gmail.com",
    name: "David George",
    role: "super_admin",
  },
};

function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64url");
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64url: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64url, "base64url").toString("utf-8");
  }
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buf).toString("base64url");
  }
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8Array(base64url: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64url, "base64url"));
  }
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

interface SessionPayload {
  user: SessionUser;
  iat: number;
  exp: number; // Unix timestamp ms
}

export async function signSession(
  payload: SessionUser,
  maxAgeSeconds: number = 60 * 60 * 24
): Promise<string> {
  const sessionPayload: SessionPayload = {
    user: payload,
    iat: Date.now(),
    exp: Date.now() + maxAgeSeconds * 1000,
  };
  const data = JSON.stringify(sessionPayload);
  const encoder = new TextEncoder();
  const secret = getSessionSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const b64Data = toBase64Url(data);
  const b64Sig = bufferToBase64Url(signature);
  return `${b64Data}.${b64Sig}`;
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [b64Data, b64Sig] = parts;
    const data = fromBase64Url(b64Data);
    const encoder = new TextEncoder();
    const secret = getSessionSecret();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBuffer = base64UrlToUint8Array(b64Sig);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer as unknown as BufferSource,
      encoder.encode(data)
    );
    if (!isValid) return null;

    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== "object") return null;

    if (
      !("user" in parsed) ||
      typeof parsed.exp !== "number" ||
      !Number.isFinite(parsed.exp) ||
      Date.now() > parsed.exp
    ) {
      return null;
    }

    const user = parsed.user as Partial<SessionUser> | null;
    const allowedRoles: UserRole[] = [
      "student",
      "tutor",
      "admin_staff",
      "owner_admin",
      "super_admin",
    ];
    if (
      !user ||
      typeof user.id !== "string" ||
      typeof user.email !== "string" ||
      typeof user.name !== "string" ||
      !allowedRoles.includes(user.role as UserRole)
    ) {
      return null;
    }

    return user as SessionUser;

    return null;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<SessionUser | null> {
  try {
    try {
      await connection();
    } catch {}
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(DEMO_COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    return await verifySession(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSession(user);
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
