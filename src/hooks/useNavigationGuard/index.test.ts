import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNavigationGuard } from "./index";

import { act, renderHook } from "@testing-library/react";

describe("useNavigationGuard", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    pushStateSpy = vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    vi.spyOn(window.history, "back").mockImplementation(() => {});
    vi.spyOn(window.history, "go").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when disabled", () => {
    it("should not add event listeners", () => {
      renderHook(() => useNavigationGuard({ enabled: false }));

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
    });

    it("should return isPending as false", () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: false }));

      expect(result.current.isPending).toBe(false);
    });
  });

  describe("when enabled", () => {
    it("should add beforeunload event listener", () => {
      renderHook(() => useNavigationGuard({ enabled: true }));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
    });

    it("should add popstate event listener", () => {
      renderHook(() => useNavigationGuard({ enabled: true }));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function)
      );
    });

    it("should push a dummy history state", () => {
      renderHook(() => useNavigationGuard({ enabled: true }));

      expect(pushStateSpy).toHaveBeenCalledWith(
        { navigationGuard: true },
        ""
      );
    });

    it("should remove event listeners on unmount", () => {
      const { unmount } = renderHook(() => useNavigationGuard({ enabled: true }));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function)
      );
    });
  });

  describe("confirmNavigation", () => {
    it("should reset isPending to false", () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      // Simulate pending state
      act(() => {
        result.current.confirmNavigation();
      });

      expect(result.current.isPending).toBe(false);
    });
  });

  describe("cancelNavigation", () => {
    it("should reset isPending to false", () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      act(() => {
        result.current.cancelNavigation();
      });

      expect(result.current.isPending).toBe(false);
    });
  });
});

