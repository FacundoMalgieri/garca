# Security Audit Report

**Application:** GARCA (Next.js App Router)  
**Date:** 2026-04-09  
**Auditor:** Claude (automated review)  
**Scope:** API routes, crypto module, security middleware, client-side credential handling, HTTP security headers

---

## Executive Summary

The application demonstrates a solid security posture for its scope: a stateless Next.js app that proxies user-supplied AFIP credentials to a server-side Playwright scraper. Key strengths include fail-closed Turnstile validation, layered security checks (rate limiting, bot detection, CAPTCHA), strong HTTP security headers, and the explicit acknowledgment that client-side encryption is obfuscation only.

Seven findings were identified. There are no critical vulnerabilities. The most impactful issues are the client-controllable `headless` parameter (Medium) and IP header spoofability affecting rate limiting (Medium). Most other findings are low-severity hardening recommendations.

---

## Findings

### Medium Severity

#### M-1: Client-Controllable `headless` Parameter Allows Non-Headless Browser Launch

**Location:** `src/app/api/arca/invoices/route.ts:47`, `src/app/api/arca/invoices/stream/route.ts:41`

**Description:** The `headless` option is accepted directly from the POST request body and passed to the Playwright scraper:

```typescript
headless = true,
// ...later:
headless,
```

An attacker can send `{ "headless": false }` to launch a visible Chromium window on the server. On a headless server this would fail harmlessly, but on a server with a display (e.g., a developer machine, certain container configurations with Xvfb), it could:
- Consume additional resources (GPU compositing, window management).
- Potentially expose the browser UI if VNC/remote desktop is accessible.
- Enable screenshot/recording attacks if combined with other server compromises.

**Recommendation:** Ignore the client-supplied value and always force `headless: true` in production:

```typescript
headless: process.env.NODE_ENV === "production" ? true : (body.headless ?? true),
```

---

#### M-2: IP-Based Rate Limiting Is Spoofable via `X-Forwarded-For`

**Location:** `src/lib/security/rate-limit/index.ts:57-59`, `src/lib/security/turnstile/index.ts:89-92`

**Description:** Both the rate limiter and Turnstile IP extraction trust the first value of `X-Forwarded-For` without validation:

```typescript
const forwardedFor = request.headers.get("x-forwarded-for");
if (forwardedFor) {
  return forwardedFor.split(",")[0].trim();
}
```

If the application is not behind a trusted reverse proxy that strips/overwrites this header, an attacker can send arbitrary `X-Forwarded-For` values to:
1. Bypass rate limiting entirely (different fake IP per request).
2. Send a false IP to Cloudflare Turnstile verification.
3. Cause the rate limiter to log misleading IPs (polluting `rateLimitStore`).

**Recommendation:**
- If deployed behind Cloudflare, prefer `cf-connecting-ip` as the highest-priority header (Cloudflare sets this reliably and it cannot be spoofed by the client).
- Alternatively, configure the reverse proxy to set a trusted header and only read that one.
- Change header priority order to: `cf-connecting-ip` > `x-real-ip` > `x-forwarded-for` (last entry, not first).

---

### Low Severity

#### L-1: CryptoJS Passphrase-Based AES Is Weak Key Derivation

**Location:** `src/lib/crypto/index.ts:38`

**Description:** `CryptoJS.AES.encrypt(text, getEncryptionKey())` uses a string passphrase, which triggers CryptoJS's internal `EvpKDF` key derivation (MD5-based, single iteration). This is cryptographically weak for key derivation.

The code already documents this as "obfuscation, not true security," which is appropriate. However:
- Each call generates a random salt/IV, so ciphertexts are non-deterministic (good).
- The key is public (`NEXT_PUBLIC_*`), so encryption strength is irrelevant for confidentiality.

**Recommendation:** This is acceptable given the documented threat model (preventing plaintext in logs/network tabs). If the threat model ever changes to require real confidentiality (e.g., server-only key), switch to `CryptoJS.AES.encrypt(text, CryptoJS.enc.Hex.parse(key), { iv })` with a proper key, or use the Web Crypto API with PBKDF2/HKDF.

---

#### L-2: In-Memory Rate Limit Store Does Not Survive Restarts or Scale Horizontally

**Location:** `src/lib/security/rate-limit/index.ts:16`

**Description:** The rate limit store is a plain `Map<string, RateLimitEntry>` in process memory. This means:
- A server restart resets all rate limits.
- In a multi-instance deployment (e.g., multiple Docker containers), each instance has its own independent store, effectively multiplying the allowed request rate by the number of instances.

**Recommendation:** For the current single-instance deployment, this is acceptable. If scaling horizontally, consider Redis-backed rate limiting or Cloudflare's built-in rate limiting rules.

---

#### L-3: `encrypted` Flag Is Client-Controlled, Allowing Plaintext Credential Submission

**Location:** `src/app/api/arca/invoices/route.ts:49`, `src/app/api/arca/companies/route.ts:35`

**Description:** The `encrypted` boolean is sent by the client:

```typescript
const { cuit: encryptedCuit, password: encryptedPassword, encrypted = false } = body;
```

A client can send `encrypted: false` with plaintext credentials and the server will accept them. Since the encryption key is public anyway, this doesn't represent a real confidentiality bypass, but it means the "encryption" layer can be trivially skipped.

**Recommendation:** Consider always requiring `encrypted: true` on the server side and rejecting requests without it. This ensures credentials are never sent in plaintext even by custom API clients, reducing the chance of accidental plaintext logging.

---

#### L-4: Invoice Data Persisted in `localStorage` Without Expiry

**Location:** `src/hooks/useInvoices/index.ts:140` (key: `garca_invoices`)

**Description:** Scraped invoice data (including company CUITs, amounts, counterparty names) is stored in `localStorage` indefinitely. On shared computers or if the browser is compromised, this data persists across sessions.

**Recommendation:** Add a TTL mechanism (e.g., store a timestamp and clear data older than 24 hours on load) or use `sessionStorage` instead so data is cleared when the tab closes.

---

### Info

#### I-1: Bot Detection Is Easily Bypassed

**Location:** `src/lib/security/detect-automation/index.ts:41-98`

**Description:** The bot detection relies on user-agent string matching and header presence checks. Any moderately sophisticated attacker can set a realistic user-agent, include standard headers (`accept`, `accept-language`, `sec-ch-ua`), and bypass all checks. This is expected -- the Turnstile CAPTCHA is the real bot-mitigation layer, and this module serves as a lightweight first filter.

**Recommendation:** No action required. The layered approach (bot detection + Turnstile + rate limiting) is sound. The bot detection catches unsophisticated automated tools and reduces load on the Turnstile verification endpoint.

---

#### I-2: CSP Requires `unsafe-inline` for Scripts

**Location:** `next.config.ts:21`

**Description:** The CSP includes `script-src 'self' 'unsafe-inline' ...`, which weakens XSS protection since injected inline scripts would be allowed. As documented in the code comments, this is a known Next.js App Router limitation -- Next.js injects inline hydration scripts that require it.

**Recommendation:** No immediate action. This is a framework constraint. If Next.js adds nonce-based CSP support for App Router in the future, adopt it. The risk is mitigated by React's built-in XSS escaping in JSX.

---

## Summary Table

| ID  | Severity | Finding                                          |
|-----|----------|--------------------------------------------------|
| M-1 | Medium   | Client-controllable `headless` browser parameter  |
| M-2 | Medium   | IP spoofing bypasses rate limiting                |
| L-1 | Low      | Weak KDF in CryptoJS (documented as obfuscation)  |
| L-2 | Low      | In-memory rate limit doesn't scale horizontally    |
| L-3 | Low      | `encrypted` flag is client-controlled              |
| L-4 | Low      | Invoice data in localStorage without expiry        |
| I-1 | Info     | Bot detection easily bypassed (by design)          |
| I-2 | Info     | CSP requires unsafe-inline (Next.js limitation)    |

---

## Positive Observations

- **Fail-closed Turnstile validation:** Missing keys or tokens result in rejection, not bypass (`src/lib/security/turnstile/index.ts:23-31`, `src/lib/security/index.ts:63-78`).
- **No credential storage:** Credentials are used transiently for scraping and never persisted server-side.
- **Concurrency limiting:** Playwright instances are capped at 2 to prevent resource exhaustion (`src/lib/concurrency/index.ts:8`).
- **Comprehensive HTTP headers:** HSTS, X-Frame-Options DENY, frame-ancestors 'none', X-Content-Type-Options, Referrer-Policy, Permissions-Policy all properly configured.
- **Honest crypto documentation:** The crypto module explicitly states it provides obfuscation, not security -- avoiding a false sense of security.
- **Input validation:** Date format validation with regex, required field checks on all API routes.
- **SSE cancellation support:** Stream routes properly handle client disconnection and abort signals.

## Validation Notes (2026-04-09)

### Addressed in this pass
- M-1: `headless` parameter now forced to `true` in production
- M-2: IP header priority changed to cf-connecting-ip > x-real-ip > x-forwarded-for (last entry)
- L-1: CryptoJS weak KDF — INTENTIONALLY NOT FIXED. The code explicitly documents this as obfuscation, not security. The encryption key is public (NEXT_PUBLIC_*), so the KDF strength is irrelevant. Changing to proper KDF would add complexity with zero security benefit given the threat model.
- L-2: In-memory rate limit — INTENTIONALLY NOT FIXED. Single-instance deployment makes this acceptable. Adding Redis would introduce infrastructure complexity for marginal benefit. If horizontal scaling is needed, Cloudflare's built-in rate limiting should be used instead.
- L-3: `encrypted` flag now enforced server-side — requests without encryption are rejected
- L-4: localStorage data now has 24-hour TTL
- I-1: Bot detection — by design, documented as lightweight first filter
- I-2: CSP unsafe-inline — Next.js framework constraint, not actionable
