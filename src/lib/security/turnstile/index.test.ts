import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getClientIP, getTurnstileToken, validateTurnstile } from "./index";

describe("validateTurnstile", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  describe("validateTurnstile function", () => {
    it("should skip validation when no secret key is configured", async () => {
      process.env.TURNSTILE_SECRET_KEY = "";
      const result = await validateTurnstile("test-token");
      expect(result).toBe(true);
    });

    it("should skip validation for empty token", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-secret";
      const result = await validateTurnstile("");
      expect(result).toBe(true);
    });

    it("should return true for valid token", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      // Re-import to get the updated env
      const { validateTurnstile: validate } = await import("./index");
      const result = await validate("valid-token");

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
      );
    });

    it("should return false for invalid token", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, "error-codes": ["invalid-input-response"] }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const { validateTurnstile: validate } = await import("./index");
      const result = await validate("invalid-token");

      expect(result).toBe(false);
    });

    it("should return false on fetch error", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.stubGlobal("fetch", mockFetch);

      const { validateTurnstile: validate } = await import("./index");
      const result = await validate("test-token");

      expect(result).toBe(false);
    });

    it("should return false on non-ok response", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      vi.stubGlobal("fetch", mockFetch);

      const { validateTurnstile: validate } = await import("./index");
      const result = await validate("test-token");

      expect(result).toBe(false);
    });

    it("should include IP in request when provided", async () => {
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const { validateTurnstile: validate } = await import("./index");
      await validate("test-token", "192.168.1.1");

      const callBody = mockFetch.mock.calls[0][1].body;
      expect(callBody).toContain("remoteip=192.168.1.1");
    });
  });

  describe("getTurnstileToken", () => {
    it("should return token from header", () => {
      const headers = new Headers();
      headers.set("x-turnstile-token", "test-token-123");
      const request = new Request("http://localhost/api/test", { headers });

      expect(getTurnstileToken(request)).toBe("test-token-123");
    });

    it("should return null when header is missing", () => {
      const request = new Request("http://localhost/api/test");
      expect(getTurnstileToken(request)).toBeNull();
    });
  });

  describe("getClientIP", () => {
    it("should return IP from x-forwarded-for header", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.1");
      const request = new Request("http://localhost/api/test", { headers });

      expect(getClientIP(request)).toBe("192.168.1.1");
    });

    it("should return IP from x-real-ip header", () => {
      const headers = new Headers();
      headers.set("x-real-ip", "10.0.0.1");
      const request = new Request("http://localhost/api/test", { headers });

      expect(getClientIP(request)).toBe("10.0.0.1");
    });

    it("should return IP from cf-connecting-ip header", () => {
      const headers = new Headers();
      headers.set("cf-connecting-ip", "172.16.0.1");
      const request = new Request("http://localhost/api/test", { headers });

      expect(getClientIP(request)).toBe("172.16.0.1");
    });

    it("should return undefined when no IP headers present", () => {
      const request = new Request("http://localhost/api/test");
      expect(getClientIP(request)).toBeUndefined();
    });

    it("should prioritize x-forwarded-for over other headers", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.1");
      headers.set("x-real-ip", "10.0.0.1");
      headers.set("cf-connecting-ip", "172.16.0.1");
      const request = new Request("http://localhost/api/test", { headers });

      expect(getClientIP(request)).toBe("192.168.1.1");
    });
  });
});

