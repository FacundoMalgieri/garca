/**
 * Utility functions for the Monotributo scraper.
 *
 * Everything here is PURE (no Playwright, no DOM): the scrapers extract raw
 * cell text from the page and delegate all parsing/validation to these
 * functions. This keeps the logic unit-testable and avoids running parsing
 * helpers inside `page.evaluate` (which broke the cron in Jan 2026 with the
 * esbuild `__name is not defined` error).
 */

import type { CategoriaMonotributo, MonotributoData } from "@/types/monotributo";

/**
 * Parses an Argentine monetary value string to a number.
 * Handles format: "$ 8.992.597,87" -> 8992597.87
 * @param texto - Text containing monetary value
 * @returns Parsed number (0 if unparseable)
 */
export function parseMontoArgentino(texto: string): number {
  return (
    parseFloat(
      texto
        .replace(/\$/g, "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .trim()
    ) || 0
  );
}

/** Normalizes text for keyword matching: lowercase, no accents, single spaces. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts the effective date (DD/MM/YYYY) from caption/heading text.
 *
 * ARCA's wording has changed over time, so we don't anchor on a single label.
 * We try labelled patterns first ("Vigente a partir del", "Valores de
 * aplicación desde el", "vigentes desde"). Day/month may be one or two digits
 * ("1/02/2026").
 *
 * The bare-date fallback (first DD/MM/YYYY anywhere) is only safe on a small,
 * targeted string — pass `allowBareDate: false` when searching a large blob
 * like the whole page, where an unrelated date could be matched.
 *
 * @returns The matched date string, or "" if none found.
 */
export function extractFechaVigencia(
  text: string | null,
  options?: { allowBareDate?: boolean }
): string {
  if (!text) return "";
  const allowBareDate = options?.allowBareDate ?? true;

  const date = "(\\d{1,2}\\/\\d{1,2}\\/\\d{4})";
  const labelled = [
    new RegExp(`vigente\\s+a\\s+partir\\s+del?\\s*:?\\s*${date}`, "i"),
    new RegExp(`valores\\s+de\\s+aplicaci[oó]n\\s+desde\\s+el?\\s*:?\\s*${date}`, "i"),
    new RegExp(`vigentes?\\s+desde\\s+el?\\s*:?\\s*${date}`, "i"),
  ];

  for (const re of labelled) {
    const m = text.match(re);
    if (m) return m[1];
  }

  if (!allowBareDate) return "";

  // Fallback: first bare date anywhere in the text.
  const bare = text.match(new RegExp(date));
  return bare ? bare[1] : "";
}

/**
 * Number of monetary columns a valid category row must have, in order:
 * ingresosBrutos, alquileres, precioUnitarioMax, impuesto(servicios),
 * impuesto(venta), aportesSIPA, aportesObraSocial, total(servicios),
 * total(venta).
 *
 * We key the parse off these instead of fixed column indices so it survives a
 * variable number of *text* columns before the money block. ARCA's source even
 * carries a commented-out "Actividad" column ("No excluida" / "Venta de Bs.
 * muebles") that would become a real column if un-commented; anchoring on the
 * money columns means that wouldn't break us.
 */
const MONEY_COLUMN_COUNT = 9;

/**
 * Header keywords we expect to find somewhere in the table header. If any are
 * missing, the page structure likely changed and we should NOT trust a
 * positional parse. Used as a cheap "are we still on the right table?" check.
 */
export const REQUIRED_HEADER_LABELS = [
  "ingresos brutos",
  "energia",
  "alquileres",
  "obra social",
  "sipa",
] as const;

/**
 * Returns the required header labels that are NOT present in the given header
 * text. An empty array means the header looks as expected.
 */
export function findMissingHeaderLabels(headerText: string | null): string[] {
  const haystack = normalize(headerText || "");
  return REQUIRED_HEADER_LABELS.filter((label) => !haystack.includes(label));
}

/**
 * Parses a single table row (array of raw cell strings) into a category.
 *
 * Returns `null` for rows that don't look like a category row. A valid row
 * must: have its first cell be a single category letter (A-M, intentionally
 * wider than today's A-K so a future category isn't silently dropped — the
 * count is enforced by `validateMonotributoData`), and contain exactly
 * `MONEY_COLUMN_COUNT` monetary cells.
 *
 * Money columns are identified by being parseable as a positive amount; the
 * text columns (Actividad, Superficie, Energía) parse to 0 and are skipped.
 * Superficie and Energía are then recovered by content ("m2" / "Kw") rather
 * than position, so the parse doesn't depend on how many text columns precede
 * the money block.
 */
export function parseCategoriaRow(cells: string[]): CategoriaMonotributo | null {
  const categoria = (cells[0] || "").trim().toUpperCase();
  if (!/^[A-M]$/.test(categoria)) return null;

  const trimmed = cells.map((c) => (c || "").trim());

  // Monetary cells, in document order (skipping the category letter at 0).
  const montos = trimmed
    .slice(1)
    .map(parseMontoArgentino)
    .filter((n) => n > 0);
  if (montos.length !== MONEY_COLUMN_COUNT) return null;

  const [
    ingresosBrutos,
    alquileres,
    precioUnitarioMax,
    impuestoServicios,
    impuestoVenta,
    aportesSIPA,
    aportesObraSocial,
    totalServicios,
    totalVenta,
  ] = montos;

  // Text columns recovered by content, not position.
  const textCells = trimmed.slice(1).filter((c) => parseMontoArgentino(c) <= 0);
  const superficieAfectada = textCells.find((c) => /m2|m²/i.test(c)) || "";
  const energiaElectrica = textCells.find((c) => /kw/i.test(c)) || "";

  return {
    categoria,
    ingresosBrutos,
    superficieAfectada,
    energiaElectrica,
    alquileres,
    precioUnitarioMax,
    impuestoIntegrado: { servicios: impuestoServicios, venta: impuestoVenta },
    aportesSIPA,
    aportesObraSocial,
    total: { servicios: totalServicios, venta: totalVenta },
  };
}

/** Maps raw table rows to categories, dropping rows that aren't categories. */
export function parseCategorias(rows: string[][]): CategoriaMonotributo[] {
  return rows
    .map(parseCategoriaRow)
    .filter((c): c is CategoriaMonotributo => c !== null);
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidateOptions {
  /** Min/max category count expected (A-K = 11). */
  minCategorias?: number;
  maxCategorias?: number;
  /**
   * Max allowed ratio change of `ingresosBrutos` vs the previous dataset for
   * the same category. A column shift produces values off by large factors,
   * so this catches silent corruption. 3 = allow up to 3x up or 1/3 down.
   */
  maxRatioChange?: number;
}

const DEFAULT_VALIDATE_OPTIONS: Required<ValidateOptions> = {
  minCategorias: 8,
  maxCategorias: 13,
  maxRatioChange: 3,
};

/**
 * Every monetary field of a category, with a human-readable name. Used both
 * for the "must be positive" check and for drift detection vs the previous
 * dataset — so a column shift that swaps any two of these (not just
 * ingresosBrutos) is caught.
 */
const MONETARY_FIELDS: Array<{ name: string; get: (c: CategoriaMonotributo) => number }> = [
  { name: "ingresosBrutos", get: (c) => c.ingresosBrutos },
  { name: "alquileres", get: (c) => c.alquileres },
  { name: "precioUnitarioMax", get: (c) => c.precioUnitarioMax },
  { name: "impuestoIntegrado.servicios", get: (c) => c.impuestoIntegrado.servicios },
  { name: "impuestoIntegrado.venta", get: (c) => c.impuestoIntegrado.venta },
  { name: "aportesSIPA", get: (c) => c.aportesSIPA },
  { name: "aportesObraSocial", get: (c) => c.aportesObraSocial },
  { name: "total.servicios", get: (c) => c.total.servicios },
  { name: "total.venta", get: (c) => c.total.venta },
];

/**
 * Validation gate run before persisting scraped data. Returns structured
 * errors (block the update) and warnings (proceed but flag).
 *
 * Checks: category count, contiguous A-B-C… letters, strictly increasing
 * income limits, all monetary fields positive, and — if `previous` is given —
 * that no income limit moved by an implausible factor vs the last known data.
 */
export function validateMonotributoData(
  data: MonotributoData,
  previous?: MonotributoData | null,
  options?: ValidateOptions
): ValidationResult {
  const opts = { ...DEFAULT_VALIDATE_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];
  const cats = data.categorias;

  // 1. Count
  if (cats.length < opts.minCategorias || cats.length > opts.maxCategorias) {
    errors.push(
      `Cantidad de categorías fuera de rango: ${cats.length} (esperado ${opts.minCategorias}-${opts.maxCategorias})`
    );
  }

  // 2. Contiguous letters starting at A, no duplicates
  const letters = cats.map((c) => c.categoria);
  const expected = letters.map((_, i) => String.fromCharCode(65 + i));
  if (letters.join(",") !== expected.join(",")) {
    errors.push(
      `Las categorías no son A-${expected[expected.length - 1] ?? "?"} contiguas: [${letters.join(", ")}]`
    );
  }

  // 3. All monetary fields strictly positive
  for (const cat of cats) {
    const bad = MONETARY_FIELDS.find((f) => !(f.get(cat) > 0));
    if (bad) {
      errors.push(`Categoría ${cat.categoria}: ${bad.name} está en cero o es inválido`);
    }
  }

  // 4. Strictly increasing income limits
  for (let i = 1; i < cats.length; i++) {
    if (cats[i].ingresosBrutos <= cats[i - 1].ingresosBrutos) {
      errors.push(
        `Ingresos brutos no son crecientes: ${cats[i - 1].categoria} (${cats[i - 1].ingresosBrutos}) ≥ ${cats[i].categoria} (${cats[i].ingresosBrutos})`
      );
    }
  }

  // 5. Effective date present (warning only — not all scrapes capture it)
  if (!data.fechaVigencia) {
    warnings.push("No se pudo extraer la fecha de vigencia del caption");
  }

  // 6. Drift vs previous dataset (catches silent column shifts). We check
  //    EVERY monetary field, not just ingresosBrutos: a swap of two columns
  //    (e.g. SIPA ↔ obra social) leaves ingresosBrutos intact but shows up as
  //    an implausible ratio on the swapped fields.
  if (previous?.categorias?.length) {
    const prevByCat = new Map(previous.categorias.map((c) => [c.categoria, c]));
    for (const cat of cats) {
      const prev = prevByCat.get(cat.categoria);
      if (!prev) continue;
      for (const field of MONETARY_FIELDS) {
        const before = field.get(prev);
        const after = field.get(cat);
        if (before <= 0) continue;
        const ratio = after / before;
        if (ratio > opts.maxRatioChange || ratio < 1 / opts.maxRatioChange) {
          errors.push(
            `Categoría ${cat.categoria}: ${field.name} cambió x${ratio.toFixed(2)} vs dato anterior (${before} → ${after}) — posible error de parseo`
          );
        } else if (ratio < 1) {
          warnings.push(
            `Categoría ${cat.categoria}: ${field.name} bajó (${before} → ${after})`
          );
        }
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
