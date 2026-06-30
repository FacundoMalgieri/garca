/**
 * Monotributo Categories Scraper.
 *
 * Scrapes the AFIP/ARCA website to get current Monotributo category limits and
 * costs. Playwright is used ONLY to fetch raw text (table header, rows,
 * caption); all parsing and validation happens in pure functions from
 * `./utils`. This keeps `page.evaluate` free of helper functions (avoiding the
 * esbuild `__name is not defined` error) and makes the logic unit-testable.
 */

import { chromium, type Page } from "playwright";

import type { MonotributoData } from "@/types/monotributo";

import { MAX_ATTEMPTS, MONOTRIBUTO_URL, RETRY_BACKOFF_MS, SELECTORS, TIMING } from "./constants";
import {
  extractFechaVigencia,
  findMissingHeaderLabels,
  parseCategorias,
  validateMonotributoData,
} from "./utils";

export { parseMontoArgentino } from "./utils";

interface RawTable {
  header: string;
  rows: string[][];
  /** Full page text — the effective date lives in a <span> outside the table. */
  pageText: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pulls raw text out of the page: the table header (for a structural sanity
 * check), every row as an array of cell strings, and the full page text (the
 * effective date lives in a <span> outside the table, not in the caption). No
 * parsing helpers run inside the browser context — only string extraction.
 */
async function extractRawTable(page: Page): Promise<RawTable> {
  return page.evaluate(
    ({ headerSel, rowSel }) => {
      const header = document.querySelector(headerSel)?.textContent || "";
      const rows = Array.from(document.querySelectorAll(rowSel)).map((row) =>
        Array.from(row.querySelectorAll("td, th")).map((cell) => cell.textContent || "")
      );
      const pageText = document.body?.textContent || "";
      return { header, rows, pageText };
    },
    { headerSel: SELECTORS.TABLE_HEADER, rowSel: SELECTORS.TABLE_ROWS }
  );
}

/** One navigation + extraction attempt. Throws on any failure. */
async function scrapeOnce(): Promise<MonotributoData> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("[Monotributo Scraper] Navigating to AFIP monotributo page...");
    await page.goto(MONOTRIBUTO_URL, {
      waitUntil: "domcontentloaded",
      timeout: TIMING.NAVIGATION_TIMEOUT,
    });
    await page.waitForSelector(SELECTORS.TABLE, { timeout: TIMING.TABLE_WAIT_TIMEOUT });

    console.log("[Monotributo Scraper] Extracting table...");
    const raw = await extractRawTable(page);

    const missing = findMissingHeaderLabels(raw.header);
    if (missing.length > 0) {
      throw new Error(
        `La estructura de la tabla cambió: faltan columnas esperadas [${missing.join(", ")}]`
      );
    }

    const categorias = parseCategorias(raw.rows);
    // The date is only reliable when it carries a label; the whole page is too
    // broad for a bare-date guess.
    const fechaVigencia = extractFechaVigencia(raw.pageText, { allowBareDate: false });

    return { categorias, fechaVigencia };
  } finally {
    await browser.close();
  }
}

/**
 * Scrapes Monotributo categories with retries and validation.
 * @param previous - last known data, used for drift detection.
 * @returns MonotributoData with categories and effective date.
 */
export async function scrapeMonotributoCategories(
  previous?: MonotributoData | null
): Promise<MonotributoData> {
  console.log("[Monotributo Scraper] Starting...");

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const data = await scrapeOnce();

      const { ok, errors, warnings } = validateMonotributoData(data, previous);
      warnings.forEach((w) => console.warn(`[Monotributo Scraper] ⚠️  ${w}`));
      if (!ok) {
        throw new Error(`Validación falló:\n- ${errors.join("\n- ")}`);
      }

      console.log(`[Monotributo Scraper] Extracted ${data.categorias.length} categories`);
      console.log(`[Monotributo Scraper] Vigencia: ${data.fechaVigencia || "(no detectada)"}`);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`[Monotributo Scraper] Attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error);
      if (attempt < MAX_ATTEMPTS) await sleep(RETRY_BACKOFF_MS * attempt);
    }
  }

  throw new Error(
    `Failed to scrape monotributo categories after ${MAX_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}
