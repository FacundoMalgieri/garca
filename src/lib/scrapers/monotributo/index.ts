/**
 * Monotributo Categories Scraper.
 *
 * Scrapes the AFIP website to get current Monotributo category limits and costs.
 */

import { chromium } from "playwright";

import type { CategoriaMonotributo, MonotributoData } from "@/types/monotributo";

import { MONOTRIBUTO_URL, SELECTORS, TIMING } from "./constants";
import { extractFechaVigencia } from "./utils";

/**
 * Scrapes Monotributo categories from AFIP website.
 * @returns MonotributoData with categories and effective date
 */
export async function scrapeMonotributoCategories(): Promise<MonotributoData> {
  console.log("[Monotributo Scraper] Starting...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the page
    console.log("[Monotributo Scraper] Navigating to AFIP monotributo page...");
    await page.goto(MONOTRIBUTO_URL, {
      waitUntil: "domcontentloaded",
      timeout: TIMING.NAVIGATION_TIMEOUT,
    });

    // Wait for table to load
    await page.waitForSelector(SELECTORS.TABLE, { timeout: TIMING.TABLE_WAIT_TIMEOUT });

    // Extract categories
    console.log("[Monotributo Scraper] Extracting categories...");
    const categorias = await extractCategories(page);

    // Extract effective date
    const captionText = await page.evaluate((selector) => {
      const caption = document.querySelector(selector);
      return caption?.textContent || null;
    }, SELECTORS.TABLE_CAPTION);

    const fechaVigencia = extractFechaVigencia(captionText);

    console.log(`[Monotributo Scraper] Extracted ${categorias.length} categories`);
    console.log(`[Monotributo Scraper] Vigencia: ${fechaVigencia}`);

    await browser.close();

    return {
      categorias: categorias.filter((c) => c.categoria && !isNaN(c.ingresosBrutos)),
      fechaVigencia,
    };
  } catch (error) {
    await browser.close();
    console.error("[Monotributo Scraper] Error:", error);
    throw new Error("Failed to scrape monotributo categories");
  }
}

/**
 * Extracts categories from the table using page.evaluate.
 */
async function extractCategories(page: Awaited<ReturnType<typeof chromium.launch>>["newPage"] extends () => Promise<infer P> ? P : never): Promise<CategoriaMonotributo[]> {
  return page.evaluate((rowSelector) => {
    const rows = Array.from(document.querySelectorAll(rowSelector));

    // Helper function to parse Argentine money format (duplicated for browser context)
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
  }, SELECTORS.TABLE_ROWS);
}

// Re-export utilities for external use
export { parseMontoArgentino } from "./utils";

