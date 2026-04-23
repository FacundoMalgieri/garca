import { afterEach, describe, expect, it, vi } from "vitest";

import { sanitizeErrorCode, trackUmamiEvent, UMAMI_EVENTS } from "./umami";

describe("trackUmamiEvent", () => {
  afterEach(() => {
    try {
      Reflect.deleteProperty(globalThis.window, "umami");
    } catch {
      /* no-op */
    }
  });

  it("does not throw when umami is not loaded", () => {
    // Default jsdom: window exists; umami is undefined
    expect(() => trackUmamiEvent(UMAMI_EVENTS.ArcCompaniesOk)).not.toThrow();
  });

  it("sanitizeErrorCode coerces empty to UNKNOWN and strips unsafely", () => {
    expect(sanitizeErrorCode(null)).toBe("UNKNOWN");
    expect(sanitizeErrorCode("INVALID_CREDENTIALS")).toBe("INVALID_CREDENTIALS");
    expect(sanitizeErrorCode("bad!code")).toBe("bad_code");
  });

  it("forwards to umami.track with optional data", () => {
    const track = vi.fn();
    Object.defineProperty(globalThis.window, "umami", {
      value: { track },
      configurable: true,
    });
    trackUmamiEvent("test_event", { count: 2 });
    expect(track).toHaveBeenCalledWith("test_event", { count: 2 });
  });
});
