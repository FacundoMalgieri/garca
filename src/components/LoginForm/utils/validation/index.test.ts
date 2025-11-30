import { describe, expect, it } from "vitest";

import { validateDateRange } from "./index";

describe("validateDateRange", () => {
  it("should return null for valid date range", () => {
    expect(validateDateRange("2025-01-01", "2025-06-01")).toBeNull();
  });

  it("should return error when from is after to", () => {
    const result = validateDateRange("2025-06-01", "2025-01-01");
    expect(result).toContain("posterior");
  });

  it("should return error when range exceeds 1 year", () => {
    const result = validateDateRange("2024-01-01", "2025-06-01");
    expect(result).toContain("1 año");
  });

  it("should accept range of exactly 365 days", () => {
    // 365 days from 2025-01-01 to 2026-01-01 (non-leap year)
    expect(validateDateRange("2025-01-01", "2026-01-01")).toBeNull();
  });
});

