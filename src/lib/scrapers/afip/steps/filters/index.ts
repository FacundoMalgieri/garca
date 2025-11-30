/**
 * Filter application for AFIP invoice search.
 */

import type { Page } from "playwright";

import type { AFIPInvoiceFilters } from "@/types/afip-scraper";

import { SELECTORS, TIMING } from "../../constants";

/**
 * Applies filters to the AFIP invoice search form.
 * @param page - Playwright page instance
 * @param filters - Filter options
 */
export async function applyFilters(page: Page, filters: AFIPInvoiceFilters): Promise<void> {
  console.log("[AFIP Scraper] Applying filters...");
  console.log("[AFIP Scraper] Date from:", filters.fechaDesde);
  console.log("[AFIP Scraper] Date to:", filters.fechaHasta);
  console.log("[AFIP Scraper] Rol:", filters.rol);

  // Fill date from
  await fillDateInput(page, SELECTORS.FILTERS.DATE_FROM, filters.fechaDesde, "date from");

  // Fill date to
  await fillDateInput(page, SELECTORS.FILTERS.DATE_TO, filters.fechaHasta, "date to");

  // Select punto de venta if specified
  if (filters.puntoVenta) {
    await selectOption(page, SELECTORS.FILTERS.PUNTO_VENTA, filters.puntoVenta.toString(), "punto de venta");
  }

  // Select tipo de comprobante if specified
  if (filters.tipoComprobante) {
    await selectOption(page, SELECTORS.FILTERS.TIPO_COMPROBANTE, filters.tipoComprobante.toString(), "tipo comprobante");
  }

  // Select rol (emisor/receptor) if specified
  if (filters.rol) {
    const rolRadio = page.locator(`input[type="radio"][value*="${filters.rol}"]`).first();
    if ((await rolRadio.count()) > 0) {
      await rolRadio.check();
      console.log("[AFIP Scraper] ✅ Selected rol:", filters.rol);
    }
  }

  // Wait a bit for any JS to process
  await page.waitForTimeout(TIMING.JS_PROCESS_WAIT);

  // Click "Buscar" button
  await clickBuscarButton(page);
}

/**
 * Fills a date input field.
 */
async function fillDateInput(page: Page, selector: string, value: string, fieldName: string): Promise<void> {
  const input = page.locator(selector).first();
  const count = await input.count();
  console.log(`[AFIP Scraper] Found ${count} ${fieldName} input(s)`);

  if (count > 0) {
    await input.click();
    await page.keyboard.press("Control+a"); // Select all (Windows/Linux)
    await page.keyboard.press("Meta+a"); // Select all (Mac)
    await input.fill(value);
    await page.keyboard.press("Tab"); // Trigger validation
    console.log(`[AFIP Scraper] ✅ Filled ${fieldName}:`, value);
  }
}

/**
 * Selects an option in a dropdown.
 */
async function selectOption(page: Page, selector: string, value: string, fieldName: string): Promise<void> {
  const select = page.locator(selector).first();
  if ((await select.count()) > 0) {
    await select.selectOption(value);
    console.log(`[AFIP Scraper] ✅ Selected ${fieldName}:`, value);
  }
}

/**
 * Clicks the search button.
 */
async function clickBuscarButton(page: Page): Promise<void> {
  console.log("[AFIP Scraper] Clicking 'Buscar' button...");
  const buscarButton = page.locator(SELECTORS.FILTERS.BUSCAR_BUTTON).first();

  const buttonCount = await buscarButton.count();
  console.log("[AFIP Scraper] Found", buttonCount, "buscar button(s)");

  if (buttonCount > 0) {
    await buscarButton.click();
    console.log("[AFIP Scraper] ✅ Clicked 'Buscar' button");

    // Wait for results to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);
    console.log("[AFIP Scraper] ✅ Filters applied and results loaded");
  } else {
    console.error("[AFIP Scraper] ❌ 'Buscar' button not found!");
  }
}

