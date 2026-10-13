import { cookies } from "next/headers";
import { SessionUser, UserRole } from "./repositories/types";

export const DEMO_COOKIE_NAME = "smartminds_demo_session";
const DEMO_SECRET =
  process.env.DEMO_SESSION_SECRET ||
  "smartminds-demo-secret-key-2026-for-client-review-only";

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

export async function signSession(payload: SessionUser): Promise<string> {
  const data = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(DEMO_SECRET),
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
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(DEMO_SECRET),
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
    return JSON.parse(data) as SessionUser;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<SessionUser | null> {
  try {
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
