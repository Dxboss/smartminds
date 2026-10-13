/**
 * Resolves the active base URL dynamically across localhost, staging, and production.
 * Ensures zero manual code changes are required when promoting to production.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim().length > 0) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim().length > 0) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return "https://smartmindstraining.co.uk";
}
