import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearRateLimitStore, getRateLimitStatus, RATE_LIMIT_RESPONSE,rateLimit } from "./index";

describe("rateLimit", () => {
  beforeEach(() => {
    clearRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createRequest = (ip?: string): Request => {
    const headers = new Headers();
    if (ip) {
      headers.set("x-forwarded-for", ip);
    }
    return new Request("http://localhost/api/test", { headers });
  };

  describe("rateLimit function", () => {
    it("should allow first request from an IP", () => {
      const request = createRequest("192.168.1.1");
      expect(rateLimit(request)).toBe(true);
    });

    it("should allow multiple requests within limit", () => {
      const request = createRequest("192.168.1.2");

      for (let i = 0; i < 30; i++) {
        expect(rateLimit(request)).toBe(true);
      }
    });

    it("should block requests exceeding limit", () => {
      const request = createRequest("192.168.1.3");

      // Make 30 requests (the limit)
      for (let i = 0; i < 30; i++) {
        rateLimit(request);
      }

      // 31st request should be blocked
      expect(rateLimit(request)).toBe(false);
    });

    it("should track different IPs separately", () => {
      const request1 = createRequest("192.168.1.4");
      const request2 = createRequest("192.168.1.5");

      // Exhaust limit for IP1
      for (let i = 0; i < 31; i++) {
        rateLimit(request1);
      }

      // IP2 should still be allowed
      expect(rateLimit(request2)).toBe(true);
    });

    it("should reset after window expires", () => {
      const request = createRequest("192.168.1.6");

      // Exhaust limit
      for (let i = 0; i < 31; i++) {
        rateLimit(request);
      }

      expect(rateLimit(request)).toBe(false);

      // Advance time past the window (60 seconds)
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      expect(rateLimit(request)).toBe(true);
    });

    it("should handle requests without IP headers", () => {
      const request = createRequest();
      expect(rateLimit(request)).toBe(true);
    });

    it("should use x-real-ip header if x-forwarded-for is not present", () => {
      const headers = new Headers();
      headers.set("x-real-ip", "10.0.0.1");
      const request = new Request("http://localhost/api/test", { headers });

      expect(rateLimit(request)).toBe(true);
    });

    it("should use cf-connecting-ip header for Cloudflare", () => {
      const headers = new Headers();
      headers.set("cf-connecting-ip", "172.16.0.1");
      const request = new Request("http://localhost/api/test", { headers });

      expect(rateLimit(request)).toBe(true);
    });
  });

  describe("getRateLimitStatus", () => {
    it("should return full limit for new IP", () => {
      const request = createRequest("192.168.1.10");
      const status = getRateLimitStatus(request);

      expect(status.remaining).toBe(30);
      expect(status.limit).toBe(30);
    });

    it("should return decremented remaining after requests", () => {
      const request = createRequest("192.168.1.11");

      rateLimit(request);
      rateLimit(request);
      rateLimit(request);

      const status = getRateLimitStatus(request);
      expect(status.remaining).toBe(27);
    });

    it("should return 0 remaining when limit exceeded", () => {
      const request = createRequest("192.168.1.12");

      for (let i = 0; i < 35; i++) {
        rateLimit(request);
      }

      const status = getRateLimitStatus(request);
      expect(status.remaining).toBe(0);
    });
  });

  describe("RATE_LIMIT_RESPONSE", () => {
    it("should have correct structure", () => {
      expect(RATE_LIMIT_RESPONSE).toEqual({
        success: false,
        error: expect.any(String),
        errorCode: "RATE_LIMIT_EXCEEDED",
      });
    });
  });
});

