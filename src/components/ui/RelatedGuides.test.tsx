import { describe, expect, it } from "vitest";

import { GUIDES } from "@/app/guias/guides-data";

import { RelatedGuides } from "./RelatedGuides";

import { render, screen } from "@testing-library/react";

describe("RelatedGuides", () => {
  it("prioriza guías de la misma categoría que la actual", () => {
    const actual = GUIDES.find((g) => g.href === "/monotributo/factura-e");
    if (!actual) throw new Error("La guía de factura E ya no existe en GUIDES");

    render(<RelatedGuides currentHref={actual.href} />);

    const mismaCategoria = GUIDES.filter(
      (g) => g.category === actual.category && g.href !== actual.href
    );
    expect(mismaCategoria.length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: new RegExp(mismaCategoria[0].title, "i") })).toBeInTheDocument();
  });

  it("nunca se enlaza a sí misma", () => {
    const actual = GUIDES[1];
    render(<RelatedGuides currentHref={actual.href} />);

    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).not.toContain(actual.href);
  });

  it("acepta una categoría explícita para páginas que no están en GUIDES", () => {
    // Las rutas dinámicas no viven en GUIDES: sin esto caerían siempre en las
    // mismas guías, sin relación con el tema de la página.
    render(<RelatedGuides currentHref="/monotributo/categoria/h" category="Trámites" />);

    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    const tramites = GUIDES.filter((g) => g.category === "Trámites").map((g) => g.href);

    // Las de la categoría pedida van primero; el resto completa hasta el límite.
    expect(tramites.length).toBeGreaterThan(0);
    expect(links.slice(0, tramites.length)).toEqual(tramites);
  });

  it("completa con otras categorías si la pedida no alcanza", () => {
    render(<RelatedGuides currentHref="/monotributo/categoria/h" category="Trámites" limit={6} />);

    const links = screen.getAllByRole("link");
    expect(links.length).toBe(6);
  });
});
