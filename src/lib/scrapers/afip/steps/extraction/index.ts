/**
 * Invoice extraction from AFIP results table.
 */

import type { Page } from "playwright";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { SELECTORS, TIMING } from "../../constants";
import { parseCurrencyInfo, parseImporte, parseNumeroComprobante, parseTipoComprobante } from "../../utils";

/**
 * Extracts invoices from the AFIP results table.
 * @param page - Playwright page instance
 * @returns Array of extracted invoices
 */
export async function extractInvoices(page: Page): Promise<AFIPInvoice[]> {
  console.log("[AFIP Scraper] Extracting invoices from table...");

  const invoices: AFIPInvoice[] = [];

  // Check if "no data" message exists
  const noDataMessage = await page.locator(SELECTORS.TABLE.NO_DATA).count();

  if (noDataMessage > 0) {
    console.log("[AFIP Scraper] No invoices found");
    return invoices;
  }

  // Scroll to the table to make sure it's in view
  const table = page.locator(SELECTORS.TABLE.CONTAINER).first();
  if ((await table.count()) > 0) {
    await table.scrollIntoViewIfNeeded();
    await page.waitForTimeout(TIMING.TABLE_SCROLL_WAIT);
    console.log("[AFIP Scraper] Scrolled to table");
  }

  // Find all data rows
  const rows = page.locator(SELECTORS.TABLE.DATA_ROWS);
  const rowCount = await rows.count();

  console.log("[AFIP Scraper] Found", rowCount, "invoice rows");

  for (let i = 0; i < rowCount; i++) {
    try {
      const invoice = await extractInvoiceFromRow(page, rows, i);
      if (invoice) {
        invoices.push(invoice);
      }
    } catch (error) {
      console.warn("[AFIP Scraper] Error parsing row", i, ":", error);
      continue;
    }
  }

  console.log("[AFIP Scraper] ✅ Extracted", invoices.length, "invoices");
  return invoices;
}

/**
 * Extracts invoice data from a single table row.
 * @param page - Playwright page instance
 * @param rows - Locator for all rows
 * @param index - Row index
 * @returns Extracted invoice or null if invalid
 */
async function extractInvoiceFromRow(
  page: Page,
  rows: ReturnType<Page["locator"]>,
  index: number
): Promise<AFIPInvoice | null> {
  const row = rows.nth(index);

  // Scroll the row into view
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(TIMING.ROW_SCROLL_WAIT);

  const cells = row.locator("td");
  const cellCount = await cells.count();

  console.log(`[AFIP Scraper] Row ${index}: ${cellCount} cells`);

  // Skip rows that don't have enough cells
  if (cellCount < 8) {
    console.log(`[AFIP Scraper] Row ${index}: Skipping - not enough cells`);
    return null;
  }

  // Extract raw data from cells
  const fecha = (await cells.nth(0).textContent()) || "";
  const tipo = (await cells.nth(1).textContent()) || "";
  const numeroCompleto = (await cells.nth(2).textContent()) || "";
  const tipoDocReceptor = (await cells.nth(3).textContent()) || "";
  const cuitReceptor = (await cells.nth(4).textContent()) || "";
  const cae = (await cells.nth(5).textContent()) || "";
  const importeCell = cells.nth(6);
  const importeText = (await importeCell.textContent()) || "0";
  const importeTitle = (await importeCell.getAttribute("title")) || "";

  // Debug logging
  logRowData(index, { fecha, tipo, numeroCompleto, cae, importeText, importeTitle });

  // Parse data
  const { puntoVenta, numero } = parseNumeroComprobante(numeroCompleto.trim());
  const importeTotal = parseImporte(importeText);
  const { moneda, exchangeRate } = parseCurrencyInfo(importeTitle);

  // Parse emisor/receptor
  const [cuitEmisor, ...razonEmisorParts] = tipoDocReceptor.split(" - ");
  const razonSocialEmisor = razonEmisorParts.join(" - ").trim();
  const [cuitReceptorParsed, ...razonReceptorParts] = cuitReceptor.split(" - ");
  const razonSocialReceptor = razonReceptorParts.join(" - ").trim();

  // Build invoice object
  const invoice: AFIPInvoice = {
    fecha: fecha.trim(),
    tipo: tipo.trim(),
    tipoComprobante: parseTipoComprobante(tipo.trim()),
    puntoVenta,
    numero,
    numeroCompleto: numeroCompleto.trim(),
    cuitEmisor: cuitEmisor.trim(),
    razonSocialEmisor,
    cuitReceptor: cuitReceptorParsed.trim(),
    razonSocialReceptor,
    importeNeto: importeTotal * 0.79, // Approximate (21% IVA)
    importeIVA: importeTotal * 0.21,
    importeTotal,
    moneda: moneda.trim(),
    cae: cae.trim() || undefined,
  };

  // Store exchange rate if available
  if (exchangeRate) {
    invoice.xmlData = {
      tipo: tipo.trim(),
      puntoVenta: puntoVenta.toString().padStart(4, "0"),
      numero: numero.toString().padStart(8, "0"),
      fecha: fecha.trim(),
      importe: importeTotal.toString(),
      moneda,
      cuitEmisor: cuitEmisor.trim(),
      cuitReceptor: cuitReceptorParsed.trim(),
      cae: cae.trim(),
      exchangeRate,
    };
  }

  console.log(
    `  [${index}] ✅ ${tipo.trim()} ${numeroCompleto.trim()} - $${importeTotal} ${moneda}${
      exchangeRate ? ` (TC: $${exchangeRate})` : ""
    }`
  );

  return invoice;
}

/**
 * Logs row data for debugging.
 */
function logRowData(
  index: number,
  data: { fecha: string; tipo: string; numeroCompleto: string; cae: string; importeText: string; importeTitle: string }
) {
  console.log(`  [${index}] Fecha: ${data.fecha.trim()}`);
  console.log(`  [${index}] Tipo: ${data.tipo.trim()}`);
  console.log(`  [${index}] Num: ${data.numeroCompleto.trim()}`);
  console.log(`  [${index}] CAE: ${data.cae.trim()}`);
  console.log(`  [${index}] Importe: ${data.importeText.trim()}`);
  console.log(`  [${index}] Importe Title: ${data.importeTitle}`);
}

