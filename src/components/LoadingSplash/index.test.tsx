import { afterEach,beforeEach, describe, expect, it, vi } from "vitest";

import { LoadingSplash } from "./index";

import { act,fireEvent, render, screen } from "@testing-library/react";

describe("LoadingSplash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be defined", () => {
    expect(LoadingSplash).toBeDefined();
  });

  it("returns null when isLoading is false", () => {
    const { container } = render(<LoadingSplash isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders when isLoading is true", () => {
    render(<LoadingSplash isLoading={true} />);
    expect(screen.getByAltText("GARCA Logo")).toBeInTheDocument();
  });

  it("displays default loading message", () => {
    render(<LoadingSplash isLoading={true} />);
    expect(screen.getByText("Cargando")).toBeInTheDocument();
  });

  it("displays custom loading message", () => {
    render(<LoadingSplash isLoading={true} message="Recuperando comprobantes" />);
    expect(screen.getByText("Recuperando comprobantes")).toBeInTheDocument();
  });

  it("displays subtitle text", () => {
    render(<LoadingSplash isLoading={true} />);
    expect(screen.getByText("Esto puede tardar unos momentos...")).toBeInTheDocument();
  });

  it("displays a tip", () => {
    render(<LoadingSplash isLoading={true} />);
    // Should display one of the tips - check for common elements
    const tipTitles = [
      "¿Qué es GARCA?",
      "100% Privado",
      "Credenciales Seguras",
      "Sin límites",
      "Múltiples monedas",
      "Cálculo automático",
      "Exportación fácil",
      "Filtros inteligentes",
      "Gráficos interactivos",
      "Almacenamiento local",
    ];

    const foundTitle = tipTitles.some((title) => screen.queryByText(title) !== null);
    expect(foundTitle).toBe(true);
  });

  it("renders tip navigation dots", () => {
    render(<LoadingSplash isLoading={true} />);
    // There are 10 tips, so 10 navigation dots
    const dots = screen.getAllByRole("button", { name: /Ver tip/i });
    expect(dots).toHaveLength(10);
  });

  it("changes tip when navigation dot is clicked", () => {
    render(<LoadingSplash isLoading={true} />);

    const dots = screen.getAllByRole("button", { name: /Ver tip/i });

    // Click on the third dot
    act(() => {
      fireEvent.click(dots[2]);
    });

    // Wait for the fade transition
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // The third dot should now be active (wider) - checking inline style
    expect(dots[2]).toHaveStyle({ width: "2rem" });
  });

  it("auto-advances tips after 5 seconds", () => {
    render(<LoadingSplash isLoading={true} />);

    const dots = screen.getAllByRole("button", { name: /Ver tip/i });

    // First tip should be active - checking inline style
    expect(dots[0]).toHaveStyle({ width: "2rem" });

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Wait for fade transition
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Second tip should now be active - checking inline style
    expect(dots[1]).toHaveStyle({ width: "2rem" });
  });

  it("renders the logo image", () => {
    render(<LoadingSplash isLoading={true} />);
    const logo = screen.getByAltText("GARCA Logo");
    expect(logo).toHaveAttribute("src", "/logo-icon.svg");
  });

  it("applies overflow hidden to body when loading", () => {
    render(<LoadingSplash isLoading={true} />);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("restores overflow when unmounted", () => {
    const { unmount } = render(<LoadingSplash isLoading={true} />);

    unmount();

    // Overflow should be restored (empty string means default)
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });
});
