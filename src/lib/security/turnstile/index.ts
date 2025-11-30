const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Validates a Turnstile token against Cloudflare's API.
 *
 * @param token - The token received from the frontend widget
 * @param ip - Optional IP address of the user for additional validation
 * @returns true if the token is valid, false otherwise
 */
export async function validateTurnstile(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || "";

  // Skip validation if no secret key configured (development mode)
  if (!secretKey) {
    console.warn("[Turnstile] No secret key configured, skipping validation");
    return true;
  }

  // Empty token means widget wasn't loaded (no site key in dev)
  if (!token) {
    console.warn("[Turnstile] Empty token received, skipping validation");
    return true;
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
      return false;
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.warn("[Turnstile] Verification failed:", data["error-codes"]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return false;
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
  // Try various headers in order of preference
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
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

  return undefined;
}

