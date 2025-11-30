import { describe, expect, it } from "vitest";

import { parseMontoArgentino, scrapeMonotributoCategories } from "./index";

describe("Monotributo Scraper", () => {
  describe("exports", () => {
    it("should export scrapeMonotributoCategories function", () => {
      expect(scrapeMonotributoCategories).toBeDefined();
    });

    it("should export parseMontoArgentino utility", () => {
      expect(parseMontoArgentino).toBeDefined();
    });
  });

  // Note: Full integration tests would require mocking Playwright
  // or running against a test environment
});

