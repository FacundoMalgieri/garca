/**
 * XML download and processing for AFIP invoices.
 */

import { promises as fs } from "fs";
import { join } from "path";
import type { Download, Page } from "playwright";

import type { AFIPInvoice } from "@/types/afip-scraper";

import { ELEMENT_TIMEOUT, SELECTORS, TIMING } from "../../constants";
import { parseAfipXml } from "../../xml-parser";

/**
 * Downloads and parses XML files for invoices.
 * @param page - Playwright page instance
 * @param invoices - Array of invoices to download XMLs for
 */
export async function downloadXMLs(page: Page, invoices: AFIPInvoice[]): Promise<void> {
  console.log("[AFIP Scraper] Downloading XMLs for", invoices.length, "invoices...");

  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    try {
      await downloadInvoiceXML(page, invoice, i, invoices.length);
    } catch {
      console.warn(`[AFIP Scraper] Error downloading XML for invoice ${i + 1}/${invoices.length}`);
    }
  }

  console.log("[AFIP Scraper] ✅ XML downloads completed");
}

/**
 * Downloads XML for a single invoice.
 */
async function downloadInvoiceXML(page: Page, invoice: AFIPInvoice, _index: number, _total: number): Promise<void> {
  // Look for XML download button
  const xmlButton = page.locator(SELECTORS.XML.DOWNLOAD_BUTTON(invoice.numeroCompleto)).first();

  const buttonCount = await xmlButton.count();
  if (buttonCount === 0) {
    return;
  }

  // Setup download listener before clicking
  const downloadPromise = page.waitForEvent("download", { timeout: ELEMENT_TIMEOUT });

  // Click the XML download button
  await xmlButton.click();

  // Wait for download to complete
  const download: Download = await downloadPromise;

  // Process the download
  await processDownload(download, invoice);

  // Wait a bit between downloads to avoid rate limiting
  await page.waitForTimeout(TIMING.BETWEEN_XML_DOWNLOADS);
}

/**
 * Processes a downloaded XML file.
 */
async function processDownload(download: Download, invoice: AFIPInvoice): Promise<void> {
  // Save to temp location and read content
  const tempPath = join("/tmp", `afip-${Date.now()}.xml`);
  await download.saveAs(tempPath);

  // Read and parse XML content
  const xmlContent = await fs.readFile(tempPath, "utf-8");

  // Parse XML using our parser
  const parsedData = parseAfipXml(xmlContent);

  // Store XML data in invoice object
  invoice.xmlUrl = download.url();
  invoice.xmlData = parsedData;

  // Clean up temp file
  try {
    await fs.unlink(tempPath);
  } catch {
    // Ignore cleanup errors
  }
}

