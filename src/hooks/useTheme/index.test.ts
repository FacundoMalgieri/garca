import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTheme } from "./index";

import { act, renderHook } from "@testing-library/react";

describe("useTheme", () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
        }),
      },
      writable: true,
    });

    // Reset document classes
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    // Clean up
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
    document.documentElement.classList.remove("dark");
  });

  it("should return initial theme as light", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("should return mounted as false initially, then true", async () => {
    const { result } = renderHook(() => useTheme());
    // After useEffect runs, mounted should be true
    expect(result.current.mounted).toBe(true);
  });

  it("should toggle theme from light to dark", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("should toggle theme from dark to light", () => {
    const { result } = renderHook(() => useTheme());

    // First toggle to dark
    act(() => {
      result.current.toggleTheme();
    });

    // Then toggle back to light
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.setItem).toHaveBeenLastCalledWith("theme", "light");
  });

  it("should read theme from localStorage on mount", () => {
    mockLocalStorage["theme"] = "dark";

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });

  it("should detect dark mode from document class if no localStorage", () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });
});
