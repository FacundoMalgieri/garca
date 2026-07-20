#!/usr/bin/env npx tsx
/**
 * Updates the Monotributo categories static data file.
 *
 * Scrapes the ARCA website and rewrites src/data/monotributo-categorias.ts.
 * All scraping/parsing/validation logic lives in the shared scraper module
 * (src/lib/scrapers/monotributo) so the runtime API and this script stay in
 * sync. This script only adds: loading the previous data (for drift checks)
 * and writing the generated file.
 *
 * It exits non-zero on any failure — the GitHub Action turns that into an
 * issue (see .github/workflows/update-monotributo.yml) and leaves the existing
 * data untouched.
 *
 * Usage:
 *   npm run update-monotributo
 */

import * as fs from "fs";
import * as path from "path";

import { scrapeMonotributoCategories } from "../src/lib/scrapers/monotributo";
import type { MonotributoData } from "../src/types/monotributo";

const OUTPUT_FILE = path.join(__dirname, "..", "src", "data", "monotributo-categorias.ts");

/** Loads the currently committed data, if any, for drift detection. */
async function loadPreviousData(): Promise<MonotributoData | null> {
  try {
    const mod = await import("../src/data/monotributo-categorias");
    return mod.MONOTRIBUTO_DATA ?? null;
  } catch {
    console.warn("[Update Monotributo] No previous data found (skipping drift check)");
    return null;
  }
}

/** Generates the TypeScript file content. */
function generateFileContent(data: MonotributoData): string {
  const today = new Date().toISOString().split("T")[0];
  const payload: MonotributoData = { ...data, lastUpdated: today };

  return `/**
 * Monotributo category data.
 *
 * This data is updated twice a year (January and July) via GitHub Actions.
 * To update manually, run: npm run update-monotributo
 *
 * Source: https://www.arca.gob.ar/monotributo/categorias.asp
 * Last updated: ${today}
 */

import type { MonotributoData } from "@/types/monotributo";

export const MONOTRIBUTO_DATA: MonotributoData = ${JSON.stringify(payload, null, 2).replace(/"([^"]+)":/g, "$1:")};

/**
 * Año vigente del régimen, derivado de la data (no del reloj): cuando GitHub
 * Actions actualiza \`lastUpdated\` al refrescar las categorías, este año se
 * mueve solo y arrastra todos los labels/SEO que lo referencian. Usar esto en
 * lugar de hardcodear el año en copy, títulos o metadata.
 */
export const MONOTRIBUTO_YEAR = Number(
  (MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString()).slice(0, 4),
);
`;
}

async function main() {
  try {
    const previous = await loadPreviousData();
    const data = await scrapeMonotributoCategories(previous);

    fs.writeFileSync(OUTPUT_FILE, generateFileContent(data), "utf-8");

    console.log(`[Update Monotributo] Successfully updated ${OUTPUT_FILE}`);
    console.log(`[Update Monotributo] Categories: ${data.categorias.length}`);
    console.log(`[Update Monotributo] Vigencia: ${data.fechaVigencia || "(no detectada)"}`);
  } catch (error) {
    console.error("[Update Monotributo] Failed:", error);
    process.exit(1);
  }
}

main();
