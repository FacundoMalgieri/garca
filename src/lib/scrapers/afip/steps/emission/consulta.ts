/**
 * Consulta de comprobantes emitidos via RCEL.
 *
 * Clicks "Consultas" from the RCEL main menu, fills the date range, clicks
 * "Buscar", and parses the results table via parseConsulta().
 *
 * The page must be on the RCEL menu (post-company-selection) when called.
 * navigateToEmission() leaves the page on Screen 0; for consulta you should
 * use navigateToInvoices() or call navigateToComprobantes+selectCompany and
 * then call this function directly.
 */

import type { Page } from "playwright";

import { parseConsulta } from "@/lib/facturador/consulta-parser";
import type { AFIPInvoice } from "@/types/afip-scraper";

import { ELEMENT_TIMEOUT, SELECTORS, TIMING } from "../../constants";

/**
 * Queries issued comprobantes for a date range.
 *
 * @param page       - RCEL Page on the main menu (or any screen where the
 *                     "Consultas" navigation link is visible).
 * @param fechaDesde - From date, DD/MM/YYYY.
 * @param fechaHasta - To date, DD/MM/YYYY.
 * @returns Parsed list of AFIPInvoice records.
 */
export async function consultarEmitidas(
  page: Page,
  fechaDesde: string,
  fechaHasta: string,
): Promise<AFIPInvoice[]> {
  console.log(`[AFIP Facturador] Consultando emitidas ${fechaDesde} – ${fechaHasta}...`);

  // Click "Consultas" link in RCEL menu
  const consultasBtn = page.locator(SELECTORS.NAVIGATION.CONSULTAS_BUTTON);
  await consultasBtn.first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await consultasBtn.first().click();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);

  // Fill date filters (#fed = fechaDesde, #feh = fechaHasta)
  await page.fill("#fed", fechaDesde);
  await page.fill("#feh", fechaHasta);

  // Click "Buscar"
  const buscarBtn = page.locator(SELECTORS.FILTERS.BUSCAR_BUTTON);
  await buscarBtn.first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await buscarBtn.first().click();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);

  const html = await page.content();
  const invoices = parseConsulta(html);

  console.log(`[AFIP Facturador] ✅ Found ${invoices.length} comprobante(s)`);
  return invoices;
}
