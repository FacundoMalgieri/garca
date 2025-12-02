import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { detectAutomation } from "./detect-automation";
import { performBasicSecurityChecks, performSecurityChecks } from "./index";
import { rateLimit } from "./rate-limit";
import { getClientIP, getTurnstileToken, validateTurnstile } from "./turnstile";

// Mock the sub-modules
vi.mock("./detect-automation", () => ({
  detectAutomation: vi.fn(),
  BOT_DETECTED_RESPONSE: {
    success: false,
    error: "Bot detected",
    errorCode: "BOT_DETECTED",
  },
}));

vi.mock("./rate-limit", () => ({
  rateLimit: vi.fn(),
  RATE_LIMIT_RESPONSE: {
    success: false,
    error: "Rate limited",
    errorCode: "RATE_LIMIT_EXCEEDED",
  },
}));

vi.mock("./turnstile", () => ({
  validateTurnstile: vi.fn(),
  getTurnstileToken: vi.fn(),
  getClientIP: vi.fn(),
}));

describe("performSecurityChecks", () => {
  const mockRequest = new Request("http://localhost/api/test");
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    // Default: all checks pass
    vi.mocked(rateLimit).mockReturnValue(true);
    vi.mocked(detectAutomation).mockReturnValue(false);
    vi.mocked(getTurnstileToken).mockReturnValue(null);
    vi.mocked(getClientIP).mockReturnValue("192.168.1.1");
    vi.mocked(validateTurnstile).mockResolvedValue(true);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetAllMocks();
  });

  describe("execution order", () => {
    it("should check rate limit first", async () => {
      vi.mocked(rateLimit).mockReturnValue(false);

      const result = await performSecurityChecks(mockRequest);

      expect(result.allowed).toBe(false);
      expect(result.response?.status).toBe(429);
      // Bot detection should not be called if rate limited
      expect(detectAutomation).not.toHaveBeenCalled();
    });

    it("should check bot detection after rate limit", async () => {
      vi.mocked(rateLimit).mockReturnValue(true);
      vi.mocked(detectAutomation).mockReturnValue(true);

      const result = await performSecurityChecks(mockRequest);

      expect(result.allowed).toBe(false);
      expect(result.response?.status).toBe(403);
      expect(rateLimit).toHaveBeenCalled();
      expect(detectAutomation).toHaveBeenCalled();
      // Turnstile should not be called if bot detected
      expect(getTurnstileToken).not.toHaveBeenCalled();
    });

    it("should check turnstile after bot detection", async () => {
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
      process.env.TURNSTILE_SECRET_KEY = "test-secret-key";
      vi.mocked(rateLimit).mockReturnValue(true);
      vi.mocked(detectAutomation).mockReturnValue(false);
      vi.mocked(getTurnstileToken).mockReturnValue("test-token");
      vi.mocked(validateTurnstile).mockResolvedValue(false);

      const result = await performSecurityChecks(mockRequest);

      expect(result.allowed).toBe(false);
      expect(result.response?.status).toBe(403);
      expect(rateLimit).toHaveBeenCalled();
      expect(detectAutomation).toHaveBeenCalled();
      expect(validateTurnstile).toHaveBeenCalled();
    });
  });

  describe("rate limiting", () => {
    it("should return 429 when rate limited", async () => {
      vi.mocked(rateLimit).mockReturnValue(false);

      const result = await performSecurityChecks(mockRequest);

      expect(result.allowed).toBe(false);
      expect(result.response?.status).toBe(429);

      const body = await result.response?.json();
      expect(body.errorCode).toBe("RATE_LIMIT_EXCEEDED");
    });
  });

  describe("bot detection", () => {
    it("should return 403 when bot detected", async () => {
      vi.mocked(detectAutomation).mockReturnValue(true);

      const result = await performSecurityChecks(mockRequest);

      expect(result.allowed).toBe(false);
      expect(result.response?.status).toBe(403);

      const body = await result.response?.json();
      expect(body.errorCode).toBe("BOT_DETECTED");
    });
  });

  describe("turnstile validation", () => {
    describe("when turnstile keys are NOT configured (fail closed)", () => {
      it("should return 503 when SITE_KEY is missing", async () => {
        delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        process.env.TURNSTILE_SECRET_KEY = "test-secret-key";

        const result = await performSecurityChecks(mockRequest);

        expect(result.allowed).toBe(false);
        expect(result.response?.status).toBe(503);

        const body = await result.response?.json();
        expect(body.errorCode).toBe("TURNSTILE_NOT_CONFIGURED");
      });

      it("should return 503 when SECRET_KEY is missing", async () => {
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
        delete process.env.TURNSTILE_SECRET_KEY;

        const result = await performSecurityChecks(mockRequest);

        expect(result.allowed).toBe(false);
        expect(result.response?.status).toBe(503);

        const body = await result.response?.json();
        expect(body.errorCode).toBe("TURNSTILE_NOT_CONFIGURED");
      });

      it("should return 503 when BOTH keys are missing", async () => {
        delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        delete process.env.TURNSTILE_SECRET_KEY;

        const result = await performSecurityChecks(mockRequest);

        expect(result.allowed).toBe(false);
        expect(result.response?.status).toBe(503);

        const body = await result.response?.json();
        expect(body.errorCode).toBe("TURNSTILE_NOT_CONFIGURED");
      });
    });

    describe("when turnstile IS fully configured", () => {
      beforeEach(() => {
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
        process.env.TURNSTILE_SECRET_KEY = "test-secret-key";
      });

      it("should return 403 TURNSTILE_MISSING when token is missing", async () => {
        vi.mocked(getTurnstileToken).mockReturnValue(null);

        const result = await performSecurityChecks(mockRequest);

        expect(result.allowed).toBe(false);
        expect(result.response?.status).toBe(403);

        const body = await result.response?.json();
        expect(body.errorCode).toBe("TURNSTILE_MISSING");
      });

      it("should validate turnstile when token is present", async () => {
        vi.mocked(getTurnstileToken).mockReturnValue("test-token");
        vi.mocked(getClientIP).mockReturnValue("192.168.1.1");
        vi.mocked(validateTurnstile).mockResolvedValue(true);

        const result = await performSecurityChecks(mockRequest);

        expect(result.allowed).toBe(true);
        expect(validateTurnstile).toHaveBeenCalledWith("test-token", "192.168.1.1");
      });

      it("should return 403 TURNSTILE_FAILED when validation fails", async () => {
        vi.mocked(getTurnstileToken).mockReturnValue("invalid-token");
        vi.mocked(validateTurnstile).mockResolvedValue(false);

        const result = await performSecurityChecks(mockRequest);

        expect(result.allowed).toBe(false);
        expect(result.response?.status).toBe(403);

        const body = await result.response?.json();
        expect(body.errorCode).toBe("TURNSTILE_FAILED");
      });

      it("should return allowed when token is valid", async () => {
        vi.mocked(getTurnstileToken).mockReturnValue("valid-token");
        vi.mocked(validateTurnstile).mockResolvedValue(true);

        const result = await performSecurityChecks(mockRequest);

        expect(result.allowed).toBe(true);
        expect(result.response).toBeUndefined();
      });
    });
  });

  describe("successful validation", () => {
    it("should return allowed when all checks pass with valid turnstile", async () => {
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
      process.env.TURNSTILE_SECRET_KEY = "test-secret-key";
      vi.mocked(getTurnstileToken).mockReturnValue("valid-token");
      vi.mocked(validateTurnstile).mockResolvedValue(true);

      const result = await performSecurityChecks(mockRequest);

      expect(result.allowed).toBe(true);
      expect(result.response).toBeUndefined();
    });
  });
});

describe("performBasicSecurityChecks", () => {
  const mockRequest = new Request("http://localhost/api/test");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimit).mockReturnValue(true);
    vi.mocked(detectAutomation).mockReturnValue(false);
  });

  it("should return allowed when all basic checks pass", () => {
    const result = performBasicSecurityChecks(mockRequest);

    expect(result.allowed).toBe(true);
    expect(result.response).toBeUndefined();
  });

  it("should return 429 when rate limited", async () => {
    vi.mocked(rateLimit).mockReturnValue(false);

    const result = performBasicSecurityChecks(mockRequest);

    expect(result.allowed).toBe(false);
    expect(result.response?.status).toBe(429);

    const body = await result.response?.json();
    expect(body.errorCode).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("should return 403 when bot detected", async () => {
    vi.mocked(detectAutomation).mockReturnValue(true);

    const result = performBasicSecurityChecks(mockRequest);

    expect(result.allowed).toBe(false);
    expect(result.response?.status).toBe(403);

    const body = await result.response?.json();
    expect(body.errorCode).toBe("BOT_DETECTED");
  });

  it("should check rate limit before bot detection", () => {
    vi.mocked(rateLimit).mockReturnValue(false);

    performBasicSecurityChecks(mockRequest);

    expect(rateLimit).toHaveBeenCalled();
    expect(detectAutomation).not.toHaveBeenCalled();
  });

  it("should not check turnstile (basic checks only)", () => {
    const result = performBasicSecurityChecks(mockRequest);

    expect(result.allowed).toBe(true);
    expect(getTurnstileToken).not.toHaveBeenCalled();
    expect(validateTurnstile).not.toHaveBeenCalled();
  });
});
