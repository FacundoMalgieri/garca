#!/usr/bin/env npx tsx
/**
 * Updates the Monotributo categories static data file.
 *
 * This script scrapes the AFIP website and updates src/data/monotributo-categorias.ts
 *
 * Usage:
 *   npm run update-monotributo
 *
 * Or directly:
 *   npx tsx scripts/update-monotributo.ts
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

interface CategoriaMonotributo {
  categoria: string;
  ingresosBrutos: number;
  superficieAfectada: string;
  energiaElectrica: string;
  alquileres: number;
  precioUnitarioMax: number;
  impuestoIntegrado: {
    servicios: number;
    venta: number;
  };
  aportesSIPA: number;
  aportesObraSocial: number;
  total: {
    servicios: number;
    venta: number;
  };
}

interface MonotributoData {
  categorias: CategoriaMonotributo[];
  fechaVigencia: string;
}

const MONOTRIBUTO_URL = "https://www.arca.gob.ar/monotributo/categorias.asp";
const OUTPUT_FILE = path.join(__dirname, "..", "src", "data", "monotributo-categorias.ts");

/**
 * Extracts the vigencia date from the table caption.
 */
function extractFechaVigencia(captionText: string | null): string {
  if (!captionText) return "";
  const match = captionText.match(/Vigente\s+a\s+partir\s+del?\s*:?\s*([\d\/]+)/i);
  return match ? match[1] : "";
}

/**
 * Scrapes Monotributo categories from AFIP website.
 */
async function scrapeMonotributoCategories(): Promise<MonotributoData> {
  console.log("[Update Monotributo] Starting scraper...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("[Update Monotributo] Navigating to AFIP monotributo page...");
    await page.goto(MONOTRIBUTO_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for table to load
    await page.waitForSelector("table", { timeout: 10000 });

    // Extract categories
    console.log("[Update Monotributo] Extracting categories...");
    const categorias = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tbody tr"));

      const parseMonto = (texto: string): number => {
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
      };

      return rows.map((row) => {
        const cells = row.querySelectorAll("td, th");

        return {
          categoria: cells[0]?.textContent?.trim() || "",
          ingresosBrutos: parseMonto(cells[1]?.textContent || ""),
          superficieAfectada: cells[2]?.textContent?.trim() || "",
          energiaElectrica: cells[3]?.textContent?.trim() || "",
          alquileres: parseMonto(cells[4]?.textContent || ""),
          precioUnitarioMax: parseMonto(cells[5]?.textContent || ""),
          impuestoIntegrado: {
            servicios: parseMonto(cells[6]?.textContent || ""),
            venta: parseMonto(cells[7]?.textContent || ""),
          },
          aportesSIPA: parseMonto(cells[8]?.textContent || ""),
          aportesObraSocial: parseMonto(cells[9]?.textContent || ""),
          total: {
            servicios: parseMonto(cells[10]?.textContent || ""),
            venta: parseMonto(cells[11]?.textContent || ""),
          },
        };
      });
    });

    // Extract effective date
    const captionText = await page.evaluate(() => {
      const caption = document.querySelector("table caption");
      return caption?.textContent || null;
    });

    const fechaVigencia = extractFechaVigencia(captionText);

    await browser.close();

    const validCategorias = categorias.filter((c) => c.categoria && !isNaN(c.ingresosBrutos) && c.ingresosBrutos > 0);

    console.log(`[Update Monotributo] Extracted ${validCategorias.length} categories`);
    console.log(`[Update Monotributo] Vigencia: ${fechaVigencia}`);

    return {
      categorias: validCategorias,
      fechaVigencia,
    };
  } catch (error) {
    await browser.close();
    console.error("[Update Monotributo] Error:", error);
    throw new Error("Failed to scrape monotributo categories");
  }
}

/**
 * Generates the TypeScript file content.
 */
function generateFileContent(data: MonotributoData): string {
  const today = new Date().toISOString().split("T")[0];

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

export const MONOTRIBUTO_DATA: MonotributoData = ${JSON.stringify(data, null, 2).replace(/"([^"]+)":/g, "$1:")};
`;
}

/**
 * Main function.
 */
async function main() {
  try {
    const data = await scrapeMonotributoCategories();

    if (data.categorias.length === 0) {
      console.error("[Update Monotributo] No categories found. Aborting update.");
      process.exit(1);
    }

    const content = generateFileContent(data);
    fs.writeFileSync(OUTPUT_FILE, content, "utf-8");

    console.log(`[Update Monotributo] Successfully updated ${OUTPUT_FILE}`);
    console.log(`[Update Monotributo] Categories: ${data.categorias.length}`);
    console.log(`[Update Monotributo] Vigencia: ${data.fechaVigencia}`);
  } catch (error) {
    console.error("[Update Monotributo] Failed:", error);
    process.exit(1);
  }
}

main();

