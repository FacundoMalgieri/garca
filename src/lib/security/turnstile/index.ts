const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Result of a Turnstile validation.
 *
 * `errorCodes` carries Cloudflare's own `error-codes` (e.g. `timeout-or-duplicate`,
 * `invalid-input-response`) so callers can surface *why* verification failed —
 * useful for telling an expired/reused token apart from a genuine bot.
 */
export interface TurnstileResult {
  success: boolean;
  errorCodes?: string[];
}

/**
 * Validates a Turnstile token against Cloudflare's API.
 *
 * SECURITY: This function fails closed - missing keys or tokens result in rejection.
 *
 * @param token - The token received from the frontend widget
 * @param ip - Optional IP address of the user for additional validation
 * @returns A result with `success` and, on failure, Cloudflare's `errorCodes`.
 */
export async function validateTurnstile(token: string, ip?: string): Promise<TurnstileResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // FAIL CLOSED: Reject if no secret key configured
  if (!secretKey) {
    console.error("[Security] TURNSTILE_SECRET_KEY not configured - rejecting request");
    return { success: false, errorCodes: ["not-configured"] };
  }

  // FAIL CLOSED: Reject if no token provided
  if (!token) {
    console.error("[Security] Turnstile token missing but required");
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error("[Turnstile] Verification request failed:", response.status);
      return { success: false, errorCodes: ["http-error"] };
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.warn("[Turnstile] Verification failed:", data["error-codes"]);
      return { success: false, errorCodes: data["error-codes"] ?? ["unknown"] };
    }

    return { success: true };
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return { success: false, errorCodes: ["request-error"] };
  }
}

/**
 * Extracts the Turnstile token from request headers.
 *
 * @param request - The incoming request
 * @returns The token or null if not present
 */
export function getTurnstileToken(request: Request): string | null {
  return request.headers.get("x-turnstile-token");
}

/**
 * Gets the client IP from request headers.
 * Supports common proxy headers.
 *
 * @param request - The incoming request
 * @returns The client IP or undefined
 */
export function getClientIP(request: Request): string | undefined {
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((s) => s.trim());
    return parts[parts.length - 1];
  }

  return undefined;
}

