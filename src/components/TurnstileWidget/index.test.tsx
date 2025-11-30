import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { render } from "@testing-library/react";

describe("TurnstileWidget", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("window", {
      ...window,
      turnstile: undefined,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  describe("when site key is NOT configured", () => {
    it("should render nothing (return null)", async () => {
      process.env = { ...originalEnv, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "" };
      const { TurnstileWidget } = await import("./index");

      const onSuccess = vi.fn();
      const { container } = render(<TurnstileWidget onSuccess={onSuccess} />);

      // When no site key, component returns null
      expect(container.firstChild).toBeNull();
    });

    it("should call onSuccess with empty token", async () => {
      process.env = { ...originalEnv, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "" };
      const { TurnstileWidget } = await import("./index");

      const onSuccess = vi.fn();
      render(<TurnstileWidget onSuccess={onSuccess} />);

      // Without NEXT_PUBLIC_TURNSTILE_SITE_KEY, it should call onSuccess with empty token
      expect(onSuccess).toHaveBeenCalledWith("");
    });
  });

  describe("when site key IS configured", () => {
    it("should render container element", async () => {
      process.env = { ...originalEnv, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "test-site-key" };
      const { TurnstileWidget } = await import("./index");

      const onSuccess = vi.fn();
      const { container } = render(<TurnstileWidget onSuccess={onSuccess} />);

      const widget = container.firstChild as HTMLElement;
      expect(widget).toBeInTheDocument();
      expect(widget.className).toBe("turnstile-container");
    });

    it("should accept onError callback", async () => {
      process.env = { ...originalEnv, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "test-site-key" };
      const { TurnstileWidget } = await import("./index");

      const onSuccess = vi.fn();
      const onError = vi.fn();
      const { container } = render(<TurnstileWidget onSuccess={onSuccess} onError={onError} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should accept onExpired callback", async () => {
      process.env = { ...originalEnv, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "test-site-key" };
      const { TurnstileWidget } = await import("./index");

      const onSuccess = vi.fn();
      const onExpired = vi.fn();
      const { container } = render(<TurnstileWidget onSuccess={onSuccess} onExpired={onExpired} />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
