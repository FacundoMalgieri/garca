import { describe, expect, it } from "vitest";

import { MONOTRIBUTO_URL, SELECTORS, TIMING } from "./index";

describe("Monotributo Scraper Constants", () => {
  it("should have valid AFIP monotributo URL", () => {
    expect(MONOTRIBUTO_URL).toContain("afip.gob.ar");
    expect(MONOTRIBUTO_URL).toContain("monotributo");
  });

  it("should have table selectors defined", () => {
    expect(SELECTORS.TABLE).toBeDefined();
    expect(SELECTORS.TABLE_ROWS).toBeDefined();
    expect(SELECTORS.TABLE_CAPTION).toBeDefined();
  });

  it("should have timing values as positive numbers", () => {
    expect(TIMING.NAVIGATION_TIMEOUT).toBeGreaterThan(0);
    expect(TIMING.TABLE_WAIT_TIMEOUT).toBeGreaterThan(0);
  });
});

