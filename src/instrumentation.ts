/**
 * Smartminds Next.js Server Lifecycle Instrumentation
 * Automatically executes on server startup in development and production (Hostinger / Docker).
 * Restores all master CMS pages, course adjustments, academic faculties, and learners from Neon PostgreSQL.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { pullLatestFromNeon } = await import("@/lib/persistedData");
      const hydrated = await pullLatestFromNeon();
      if (hydrated) {
        console.log("[Smartminds Instrumentation] Master store successfully hydrated from Neon PostgreSQL.");
      } else {
        console.log("[Smartminds Instrumentation] Neon store initialized or already synchronized.");
      }
    } catch (err) {
      console.warn("[Smartminds Instrumentation] Notice during startup hydration:", err);
    }
  }
}
