import { describe, expect, it } from "vitest";

import { Footer } from "./index";

import { render, screen } from "@testing-library/react";

describe("Footer", () => {
  it("should render the footer", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("should display GARCA title", () => {
    render(<Footer />);
    expect(screen.getByText("GARCA")).toBeInTheDocument();
  });

  it("should display disclaimer", () => {
    render(<Footer />);
    expect(screen.getByText(/No afiliado con ARCA/)).toBeInTheDocument();
  });

  it("should display navigation links", () => {
    render(<Footer />);
    expect(screen.getByText("Privacidad")).toBeInTheDocument();
    expect(screen.getByText("Términos")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("enlaza las guías con texto de ancla, no sólo con el ícono del navbar", () => {
    // El navbar enlaza /guias con un ícono sin texto. El texto del ancla importa
    // para SEO, así que el footer lo aporta.
    render(<Footer />);

    const guias = screen.getByRole("link", { name: "Guías" });
    expect(guias).toHaveAttribute("href", "/guias");
  });

  it("should display copyright with current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
  });
});
