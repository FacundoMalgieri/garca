/**
 * Security module - combines all security checks.
 *
 * Order of execution:
 * 1. Rate limiting (429 if exceeded)
 * 2. Bot detection (403 if detected)
 * 3. Turnstile validation (403 if invalid)
 */

import { NextResponse } from "next/server";

import { BOT_DETECTED_RESPONSE, detectAutomation } from "./detect-automation";
import { RATE_LIMIT_RESPONSE, rateLimit } from "./rate-limit";
import { getClientIP, getTurnstileToken, validateTurnstile } from "./turnstile";

export { BOT_DETECTED_RESPONSE, detectAutomation } from "./detect-automation";
export { clearRateLimitStore, getRateLimitStatus, RATE_LIMIT_RESPONSE, rateLimit } from "./rate-limit";
export { getClientIP, getTurnstileToken, validateTurnstile } from "./turnstile";

/**
 * Result of security validation.
 */
export interface SecurityCheckResult {
  allowed: boolean;
  response?: NextResponse;
}

/**
 * Performs all security checks on a request.
 *
 * Checks in order:
 * 1. Rate limiting
 * 2. Bot detection
 * 3. Turnstile validation
 *
 * @param request - The incoming request
 * @returns SecurityCheckResult with allowed status and optional error response
 */
export async function performSecurityChecks(request: Request): Promise<SecurityCheckResult> {
  // 1. Rate limiting
  if (!rateLimit(request)) {
    return {
      allowed: false,
      response: NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 }),
    };
  }

  // 2. Bot detection
  if (detectAutomation(request)) {
    return {
      allowed: false,
      response: NextResponse.json(BOT_DETECTED_RESPONSE, { status: 403 }),
    };
  }

  // 3. Turnstile validation
  const token = getTurnstileToken(request);
  const ip = getClientIP(request);
  const siteKeyConfigured = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKeyConfigured = !!process.env.TURNSTILE_SECRET_KEY;

  // SECURITY: Both keys MUST be configured - fail if either is missing
  if (!siteKeyConfigured || !secretKeyConfigured) {
    console.error(
      "[Security] Turnstile not fully configured - " +
        `SITE_KEY: ${siteKeyConfigured ? "✓" : "✗"}, SECRET_KEY: ${secretKeyConfigured ? "✓" : "✗"}`
    );
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Servicio temporalmente no disponible. Contactá al administrador.",
          errorCode: "TURNSTILE_NOT_CONFIGURED",
        },
        { status: 503 }
      ),
    };
  }

  // Token is REQUIRED
  if (!token) {
    console.warn("[Security] Turnstile token missing but required");
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Verificación de seguridad requerida. Por favor, recargá la página e intentá nuevamente.",
          errorCode: "TURNSTILE_MISSING",
        },
        { status: 403 }
      ),
    };
  }

  const isValid = await validateTurnstile(token, ip);
  if (!isValid) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Verificación de seguridad fallida. Por favor, recargá la página e intentá nuevamente.",
          errorCode: "TURNSTILE_FAILED",
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Performs basic security checks without Turnstile validation.
 * Use this for public endpoints that don't require user verification.
 *
 * Checks in order:
 * 1. Rate limiting
 * 2. Bot detection
 *
 * @param request - The incoming request
 * @returns SecurityCheckResult with allowed status and optional error response
 */
export function performBasicSecurityChecks(request: Request): SecurityCheckResult {
  // 1. Rate limiting
  if (!rateLimit(request)) {
    return {
      allowed: false,
      response: NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 }),
    };
  }

  // 2. Bot detection
  if (detectAutomation(request)) {
    return {
      allowed: false,
      response: NextResponse.json(BOT_DETECTED_RESPONSE, { status: 403 }),
    };
  }

  return { allowed: true };
}
