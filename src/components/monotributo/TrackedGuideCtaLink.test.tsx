import { afterEach, describe, expect, it, vi } from "vitest";

import { TrackedGuideCtaLink } from "./TrackedGuideCtaLink";

import { fireEvent, render, screen } from "@testing-library/react";

describe("TrackedGuideCtaLink", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renderiza un link con el href y el texto", () => {
    render(
      <TrackedGuideCtaLink href="/calculadora-monotributo" target="calculadora" guide="recategorizacion">
        Abrir calculadora
      </TrackedGuideCtaLink>
    );
    const link = screen.getByRole("link", { name: "Abrir calculadora" });
    expect(link).toHaveAttribute("href", "/calculadora-monotributo");
  });

  it("dispara funnel_guide_cta con { guide, target } al hacer click", () => {
    const track = vi.fn();
    vi.stubGlobal("umami", { track });

    render(
      <TrackedGuideCtaLink href="/ingresar" target="ingresar" guide="que-pasa-si-me-paso">
        Ingresar
      </TrackedGuideCtaLink>
    );
    fireEvent.click(screen.getByRole("link", { name: "Ingresar" }));

    expect(track).toHaveBeenCalledWith("funnel_guide_cta", {
      guide: "que-pasa-si-me-paso",
      target: "ingresar",
    });
  });
});
