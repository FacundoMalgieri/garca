import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InitialLoader } from "./index";

import { act, render, screen } from "@testing-library/react";

describe("InitialLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show loading state initially", () => {
    render(
      <InitialLoader>
        <div>Content</div>
      </InitialLoader>
    );

    expect(screen.getByText("GARCA")).toBeInTheDocument();
    expect(screen.getByText(/Gestor Automático/)).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("should show logo during loading", () => {
    render(
      <InitialLoader>
        <div>Content</div>
      </InitialLoader>
    );

    expect(screen.getByAltText("GARCA Logo")).toBeInTheDocument();
  });

  it("should show children after timeout", async () => {
    render(
      <InitialLoader>
        <div>Content</div>
      </InitialLoader>
    );

    // Initially loading
    expect(screen.queryByText("Content")).not.toBeInTheDocument();

    // Advance timer past the 1500ms timeout
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should hide loading state after timeout", async () => {
    render(
      <InitialLoader>
        <div>Content</div>
      </InitialLoader>
    );

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.queryByText("GARCA")).not.toBeInTheDocument();
  });

  it("should have spinner animation", () => {
    const { container } = render(
      <InitialLoader>
        <div>Content</div>
      </InitialLoader>
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should have pulse animation on logo", () => {
    const { container } = render(
      <InitialLoader>
        <div>Content</div>
      </InitialLoader>
    );

    const logo = container.querySelector(".animate-pulse");
    expect(logo).toBeInTheDocument();
  });
});
