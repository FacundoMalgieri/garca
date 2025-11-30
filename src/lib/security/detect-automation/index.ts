/**
 * Known automation/bot user agent patterns.
 */
const BOT_USER_AGENT_PATTERNS = [
  /HeadlessChrome/i,
  /PhantomJS/i,
  /Puppeteer/i,
  /Playwright/i,
  /Selenium/i,
  /WebDriver/i,
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /axios/i,
  /node-fetch/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
];

/**
 * Suspicious Chrome version patterns (headless often has mismatched versions).
 */
const SUSPICIOUS_CHROME_PATTERN = /Chrome\/(\d+)\.0\.0\.0/;

/**
 * Detects if a request appears to come from an automated source.
 *
 * Checks for:
 * - Known bot/automation user agents
 * - Missing or suspicious headers
 * - Headless browser indicators
 *
 * @param request - The incoming request
 * @returns true if automation is detected, false otherwise
 */
export function detectAutomation(request: Request): boolean {
  const userAgent = request.headers.get("user-agent");

  // No user agent is highly suspicious
  if (!userAgent) {
    console.warn("[Security] Request without user-agent detected");
    return true;
  }

  // Check against known bot patterns
  for (const pattern of BOT_USER_AGENT_PATTERNS) {
    if (pattern.test(userAgent)) {
      console.warn("[Security] Bot user-agent detected:", userAgent.substring(0, 100));
      return true;
    }
  }

  // Check for suspicious Chrome version (headless often reports Chrome/xxx.0.0.0)
  const chromeMatch = SUSPICIOUS_CHROME_PATTERN.exec(userAgent);
  if (chromeMatch) {
    // Chrome versions with .0.0.0 suffix are suspicious
    // Real Chrome has actual build numbers like Chrome/120.0.6099.109
    const hasRealBuildNumber = /Chrome\/\d+\.\d+\.\d+\.\d+/.test(userAgent);
    if (!hasRealBuildNumber) {
      console.warn("[Security] Suspicious Chrome version detected:", userAgent.substring(0, 100));
      return true;
    }
  }

  // Check for missing common headers that browsers always send
  const acceptHeader = request.headers.get("accept");
  const acceptLanguage = request.headers.get("accept-language");

  // Browsers always send accept and accept-language headers
  if (!acceptHeader && !acceptLanguage) {
    console.warn("[Security] Missing standard browser headers");
    return true;
  }

  // Check for sec-ch-ua header (modern browsers send this)
  // Its absence isn't definitive but combined with other factors can be suspicious
  const secChUa = request.headers.get("sec-ch-ua");
  const isModernChrome = userAgent.includes("Chrome/") && parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || "0") >= 90;

  if (isModernChrome && !secChUa) {
    // Modern Chrome should have sec-ch-ua, but don't block - just log
    console.warn("[Security] Modern Chrome without sec-ch-ua header");
    // Not returning true here as some legitimate requests might miss this
  }

  return false;
}

/**
 * Response for bot detection.
 */
export const BOT_DETECTED_RESPONSE = {
  success: false,
  error: "Solicitud bloqueada por razones de seguridad",
  errorCode: "BOT_DETECTED",
} as const;

