import { describe, expect, it } from "vitest";

import { BOT_DETECTED_RESPONSE, detectAutomation } from "./index";

describe("detectAutomation", () => {
  const createRequest = (userAgent?: string, extraHeaders?: Record<string, string>): Request => {
    const headers = new Headers();
    if (userAgent) {
      headers.set("user-agent", userAgent);
    }
    headers.set("accept", "text/html,application/xhtml+xml");
    headers.set("accept-language", "en-US,en;q=0.9");

    if (extraHeaders) {
      Object.entries(extraHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    return new Request("http://localhost/api/test", { headers });
  };

  describe("legitimate browsers", () => {
    it("should allow Chrome browser", () => {
      const request = createRequest(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36"
      );
      expect(detectAutomation(request)).toBe(false);
    });

    it("should allow Firefox browser", () => {
      const request = createRequest(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
      );
      expect(detectAutomation(request)).toBe(false);
    });

    it("should allow Safari browser", () => {
      const request = createRequest(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
      );
      expect(detectAutomation(request)).toBe(false);
    });

    it("should allow Edge browser", () => {
      const request = createRequest(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91"
      );
      expect(detectAutomation(request)).toBe(false);
    });

    it("should allow mobile Chrome", () => {
      const request = createRequest(
        "Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Mobile Safari/537.36"
      );
      expect(detectAutomation(request)).toBe(false);
    });
  });

  describe("bot detection", () => {
    it("should detect HeadlessChrome", () => {
      const request = createRequest(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36"
      );
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect Puppeteer", () => {
      const request = createRequest("Puppeteer/1.0.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect Playwright", () => {
      const request = createRequest("Playwright/1.40.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect Selenium", () => {
      const request = createRequest("Selenium/4.0.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect curl", () => {
      const request = createRequest("curl/7.88.1");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect wget", () => {
      const request = createRequest("Wget/1.21.3");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect python-requests", () => {
      const request = createRequest("python-requests/2.28.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect axios", () => {
      const request = createRequest("axios/1.6.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect node-fetch", () => {
      const request = createRequest("node-fetch/3.0.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect generic bot", () => {
      const request = createRequest("MyCustomBot/1.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect crawler", () => {
      const request = createRequest("WebCrawler/2.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect spider", () => {
      const request = createRequest("SearchSpider/1.0");
      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect scraper", () => {
      const request = createRequest("DataScraper/1.0");
      expect(detectAutomation(request)).toBe(true);
    });
  });

  describe("missing headers", () => {
    it("should detect missing user-agent", () => {
      const headers = new Headers();
      headers.set("accept", "text/html");
      const request = new Request("http://localhost/api/test", { headers });

      expect(detectAutomation(request)).toBe(true);
    });

    it("should detect missing accept and accept-language headers", () => {
      const headers = new Headers();
      headers.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.6099.109");
      const request = new Request("http://localhost/api/test", { headers });

      expect(detectAutomation(request)).toBe(true);
    });
  });

  describe("suspicious Chrome versions", () => {
    it("should allow Chrome with real build number (120.0.0.0 format)", () => {
      // Chrome 120.0.0.0 is actually a valid format - modern Chrome uses this
      const headers = new Headers();
      headers.set("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");
      headers.set("accept", "text/html");
      headers.set("accept-language", "en-US");
      const request = new Request("http://localhost/api/test", { headers });

      // This should NOT be detected as automation - it's a valid Chrome UA
      expect(detectAutomation(request)).toBe(false);
    });
  });

  describe("BOT_DETECTED_RESPONSE", () => {
    it("should have correct structure", () => {
      expect(BOT_DETECTED_RESPONSE).toEqual({
        success: false,
        error: expect.any(String),
        errorCode: "BOT_DETECTED",
      });
    });
  });
});

