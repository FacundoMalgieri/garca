import { describe, expect, it } from "vitest";

import {
  calculateLimitPercentage,
  calculateRemainingMargin,
  cn,
  fileToBase64,
  formatCurrencyARS,
  formatCurrencyUSD,
  formatDate,
  generateId,
  validateFileExtension,
} from "./index";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isHidden = false;
    expect(cn("base", isActive && "active", isHidden && "hidden")).toBe("base active");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles undefined and null values", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("formatCurrencyARS", () => {
  it("formats positive numbers", () => {
    const result = formatCurrencyARS(1000);
    expect(result).toContain("1.000");
    expect(result).toContain("$");
  });

  it("formats large numbers", () => {
    const result = formatCurrencyARS(1000000);
    expect(result).toContain("1.000.000");
  });

  it("formats decimal numbers", () => {
    const result = formatCurrencyARS(1234.56);
    expect(result).toContain("1.234");
  });

  it("formats zero", () => {
    const result = formatCurrencyARS(0);
    expect(result).toContain("0");
  });

  it("formats negative numbers", () => {
    const result = formatCurrencyARS(-1000);
    expect(result).toContain("1.000");
  });
});

describe("formatCurrencyUSD", () => {
  it("formats positive numbers", () => {
    const result = formatCurrencyUSD(1000);
    expect(result).toContain("1,000");
    expect(result).toContain("$");
  });

  it("formats decimal numbers", () => {
    const result = formatCurrencyUSD(1234.56);
    expect(result).toContain("1,234.56");
  });

  it("formats zero", () => {
    const result = formatCurrencyUSD(0);
    expect(result).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2025-11-15");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("formats date with time", () => {
    const result = formatDate("2025-11-15T10:30:00");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe("calculateRemainingMargin", () => {
  it("calculates remaining margin correctly", () => {
    expect(calculateRemainingMargin(3000000, 5000000)).toBe(2000000);
  });

  it("returns 0 when current exceeds limit", () => {
    expect(calculateRemainingMargin(6000000, 5000000)).toBe(0);
  });

  it("returns full limit when current is 0", () => {
    expect(calculateRemainingMargin(0, 5000000)).toBe(5000000);
  });

  it("handles equal values", () => {
    expect(calculateRemainingMargin(5000000, 5000000)).toBe(0);
  });
});

describe("calculateLimitPercentage", () => {
  it("calculates percentage correctly", () => {
    expect(calculateLimitPercentage(2500000, 5000000)).toBe(50);
  });

  it("returns 0 when limit is 0", () => {
    expect(calculateLimitPercentage(1000, 0)).toBe(0);
  });

  it("caps at 100 when exceeding limit", () => {
    expect(calculateLimitPercentage(6000000, 5000000)).toBe(100);
  });

  it("returns 0 when current is 0", () => {
    expect(calculateLimitPercentage(0, 5000000)).toBe(0);
  });

  it("handles exact limit", () => {
    expect(calculateLimitPercentage(5000000, 5000000)).toBe(100);
  });
});

describe("validateFileExtension", () => {
  it("validates allowed extension", () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    expect(validateFileExtension(file, ["pdf", "doc"])).toBe(true);
  });

  it("rejects disallowed extension", () => {
    const file = new File(["content"], "test.exe", { type: "application/octet-stream" });
    expect(validateFileExtension(file, ["pdf", "doc"])).toBe(false);
  });

  it("handles uppercase extensions", () => {
    const file = new File(["content"], "test.PDF", { type: "application/pdf" });
    expect(validateFileExtension(file, ["pdf"])).toBe(true);
  });

  it("handles files without extension", () => {
    const file = new File(["content"], "testfile", { type: "text/plain" });
    expect(validateFileExtension(file, ["pdf"])).toBe(false);
  });

  it("handles empty allowed extensions array", () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    expect(validateFileExtension(file, [])).toBe(false);
  });
});

describe("generateId", () => {
  it("generates a string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("generates unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("generates non-empty strings", () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });
});

describe("fileToBase64", () => {
  it("converts a file to base64", async () => {
    const content = "Hello, World!";
    const file = new File([content], "test.txt", { type: "text/plain" });

    const result = await fileToBase64(file);

    // Base64 encoded "Hello, World!" is "SGVsbG8sIFdvcmxkIQ=="
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles empty files", async () => {
    const file = new File([""], "empty.txt", { type: "text/plain" });

    const result = await fileToBase64(file);

    expect(typeof result).toBe("string");
  });

  it("handles binary content", async () => {
    const binaryData = new Uint8Array([0, 1, 2, 3, 255]);
    const file = new File([binaryData], "binary.bin", { type: "application/octet-stream" });

    const result = await fileToBase64(file);

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

