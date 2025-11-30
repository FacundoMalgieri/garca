/**
 * In-memory rate limiter based on IP address.
 * No external dependencies - uses a simple Map.
 *
 * Configuration:
 * - Window: 60 seconds
 * - Limit: 30 requests per window per IP
 */

interface RateLimitEntry {
  hits: number;
  last: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 60_000; // 60 seconds
const MAX_REQUESTS = 30; // 30 requests per window

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60_000; // 5 minutes

/**
 * Periodically cleans up expired entries to prevent memory leaks.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.last > WINDOW_MS) {
      rateLimitStore.delete(ip);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    // Silently clean up expired entries
  }
}

// Start cleanup interval (only in Node.js environment)
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
}

/**
 * Extracts the client IP from a request.
 *
 * @param request - The incoming request
 * @returns The client IP or a fallback value
 */
function getIP(request: Request): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback - in development this might be the only option
  return "unknown";
}

/**
 * Checks if a request should be rate limited.
 *
 * @param request - The incoming request
 * @returns true if the request is allowed, false if it should be blocked
 */
export function rateLimit(request: Request): boolean {
  const ip = getIP(request);
  const now = Date.now();

  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitStore.set(ip, { hits: 1, last: now });
    return true;
  }

  // Check if window has expired
  if (now - entry.last > WINDOW_MS) {
    // Reset the window
    rateLimitStore.set(ip, { hits: 1, last: now });
    return true;
  }

  // Increment hits
  entry.hits++;
  entry.last = now;

  // Check if over limit
  if (entry.hits > MAX_REQUESTS) {
    console.warn(`[RateLimit] IP ${ip} exceeded rate limit: ${entry.hits} requests`);
    return false;
  }

  return true;
}

/**
 * Gets the current rate limit status for an IP.
 * Useful for debugging and headers.
 *
 * @param request - The incoming request
 * @returns Rate limit status
 */
export function getRateLimitStatus(request: Request): {
  remaining: number;
  limit: number;
  reset: number;
} {
  const ip = getIP(request);
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.last > WINDOW_MS) {
    return {
      remaining: MAX_REQUESTS,
      limit: MAX_REQUESTS,
      reset: now + WINDOW_MS,
    };
  }

  return {
    remaining: Math.max(0, MAX_REQUESTS - entry.hits),
    limit: MAX_REQUESTS,
    reset: entry.last + WINDOW_MS,
  };
}

/**
 * Response for rate limit exceeded.
 */
export const RATE_LIMIT_RESPONSE = {
  success: false,
  error: "Demasiadas solicitudes. Por favor, esperá un momento antes de intentar nuevamente.",
  errorCode: "RATE_LIMIT_EXCEEDED",
} as const;

/**
 * Clears the rate limit store.
 * Only for testing purposes.
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

