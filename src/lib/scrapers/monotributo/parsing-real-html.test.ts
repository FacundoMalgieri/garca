/**
 * Integration test against a REAL captured snapshot of ARCA's monotributo page
 * (src/lib/scrapers/monotributo/__fixtures__/arca-categorias.html).
 *
 * This is the test that protects the heuristic parse against ARCA's actual
 * structure — the source carries a commented-out "Actividad" column (so the
 * cell count is easy to miscount) and the effective date lives in a <span>
 * outside the table, neither of which the synthetic unit tests exercise.
 *
 * To refresh the fixture:
 *   curl -A "Mozilla/5.0" https://www.arca.gob.ar/monotributo/categorias.asp
 * and re-extract the region containing the date span + the bordered table.
 */
/* global DOMParser */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SELECTORS } from "./constants";
import { extractFechaVigencia, findMissingHeaderLabels, parseCategorias } from "./utils";

const fixtureHtml = readFileSync(
  join(process.cwd(), "src/lib/scrapers/monotributo/__fixtures__/arca-categorias.html"),
  "utf-8"
);

/** Replicates exactly what the scraper's page.evaluate extracts (runs in the
 *  vitest jsdom environment, so DOM globals are available). */
function extractRaw(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const header = document.querySelector(SELECTORS.TABLE_HEADER)?.textContent || "";
  const rows = Array.from(document.querySelectorAll(SELECTORS.TABLE_ROWS)).map((row) =>
    Array.from(row.querySelectorAll("td, th")).map((cell) => cell.textContent || "")
  );
  const pageText = document.body?.textContent || "";
  return { header, rows, pageText };
}

describe("Monotributo parser against real ARCA HTML", () => {
  const raw = extractRaw(fixtureHtml);
  const categorias = parseCategorias(raw.rows);

  it("real ARCA rows render 12 cells (Actividad column is commented out in source)", () => {
    expect(raw.rows[0].length).toBe(12);
  });

  it("parses exactly categories A through K", () => {
    expect(categorias.map((c) => c.categoria)).toEqual(
      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]
    );
  });

  it("maps category A's values correctly by anchoring on the money columns", () => {
    const a = categorias[0];
    expect(a.ingresosBrutos).toBe(10277988.13);
    expect(a.superficieAfectada).toBe("Hasta 30 m2");
    expect(a.energiaElectrica).toBe("Hasta 3330 Kw");
    expect(a.alquileres).toBe(2390229.8);
    expect(a.precioUnitarioMax).toBe(613492.31);
    expect(a.impuestoIntegrado.servicios).toBe(4780.46);
    expect(a.aportesSIPA).toBe(15616.17);
    expect(a.aportesObraSocial).toBe(21990.11);
    expect(a.total.servicios).toBe(42386.74);
    expect(a.total.venta).toBe(42386.74);
  });

  it("maps the top category K (income limit + split totals)", () => {
    const k = categorias[categorias.length - 1];
    expect(k.categoria).toBe("K");
    expect(k.ingresosBrutos).toBe(108357084.05);
    expect(k.total.servicios).toBe(1381687.9);
    expect(k.total.venta).toBe(600879.51);
  });

  it("recognizes the table header as structurally valid", () => {
    expect(findMissingHeaderLabels(raw.header)).toEqual([]);
  });

  it("extracts the effective date from the <span> outside the table", () => {
    expect(extractFechaVigencia(raw.pageText, { allowBareDate: false })).toBe("1/02/2026");
  });
});
