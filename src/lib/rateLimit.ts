/**
 * In-memory sliding window rate limiter for form submissions and API routes.
 * Suitable for serverless / edge runtime within memory lifetime.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

let lastCleanup = Date.now();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Checks whether an identifier has exceeded allowed requests within the time window.
 * Default: 5 submissions per 60 seconds.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 15,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();

  // Passive cleanup
  if (now - lastCleanup > 60000) {
    lastCleanup = now;
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }

  const existing = rateLimitMap.get(identifier);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt,
    });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    resetAt: existing.resetAt,
  };
}
