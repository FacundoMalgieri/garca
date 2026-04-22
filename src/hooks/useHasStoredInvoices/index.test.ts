import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHasStoredInvoices } from "./index";

import { act, renderHook } from "@testing-library/react";

const STORAGE_KEY = "garca_invoices";

describe("useHasStoredInvoices", () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k]);
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k]);
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when no invoices are stored", () => {
    const { result } = renderHook(() => useHasStoredInvoices());
    expect(result.current).toBe(false);
  });

  it("returns false when stored value is an empty array", () => {
    mockLocalStorage[STORAGE_KEY] = "[]";
    const { result } = renderHook(() => useHasStoredInvoices());
    expect(result.current).toBe(false);
  });

  it("returns true when invoices are stored", () => {
    mockLocalStorage[STORAGE_KEY] = JSON.stringify([{ id: 1 }]);
    const { result } = renderHook(() => useHasStoredInvoices());
    expect(result.current).toBe(true);
  });

  it("reacts to cross-tab storage events", () => {
    const { result } = renderHook(() => useHasStoredInvoices());
    expect(result.current).toBe(false);

    act(() => {
      mockLocalStorage[STORAGE_KEY] = JSON.stringify([{ id: 1 }]);
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    });

    expect(result.current).toBe(true);
  });

  it("reacts to window focus", () => {
    const { result } = renderHook(() => useHasStoredInvoices());
    expect(result.current).toBe(false);

    act(() => {
      mockLocalStorage[STORAGE_KEY] = JSON.stringify([{ id: 1 }]);
      window.dispatchEvent(new Event("focus"));
    });

    expect(result.current).toBe(true);
  });

  it("returns false if localStorage throws", () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => {
          throw new Error("denied");
        }),
      },
      writable: true,
    });

    const { result } = renderHook(() => useHasStoredInvoices());
    expect(result.current).toBe(false);
  });

  it("removes event listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useHasStoredInvoices());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("storage", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("focus", expect.any(Function));
  });
});
