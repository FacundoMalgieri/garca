/**
 * AFIP Monotributo scraper step.
 * Navigates to Monotributo portal and extracts category/activity information.
 */

import type { BrowserContext, Page } from "playwright";

import type { MonotributoAFIPInfo } from "@/types/afip-scraper";

import { ELEMENT_TIMEOUT, NEW_TAB_TIMEOUT, SELECTORS, TIMING } from "../../constants";

/**
 * Result of Monotributo scraping.
 */
export interface MonotributoScrapingResult {
  success: boolean;
  info: MonotributoAFIPInfo | null;
  error?: string;
}

/**
 * Navigates to Monotributo portal and extracts category information.
 * This should be called after login but before navigating to Comprobantes.
 * 
 * @param page - Playwright page instance
 * @param context - Browser context for handling new tabs
 * @returns Monotributo info or null if not found/not applicable
 */
export async function scrapeMonotributoInfo(
  page: Page,
  context: BrowserContext
): Promise<MonotributoScrapingResult> {
  console.log("[AFIP Monotributo] Starting Monotributo info fetch...");

  try {
    // Navigate to Monotributo via search
    const monotributoPage = await navigateToMonotributo(page, context);

    if (!monotributoPage) {
      console.log("[AFIP Monotributo] Could not navigate to Monotributo portal");
      return { success: false, info: null, error: "No se pudo acceder al portal de Monotributo" };
    }

    // Extract info from the page
    const info = await extractMonotributoInfo(monotributoPage);

    if (!info) {
      console.log("[AFIP Monotributo] Could not extract Monotributo info (user may not be Monotributista)");
      return { success: false, info: null };
    }

    console.log("[AFIP Monotributo] ✅ Successfully extracted Monotributo info:", info.categoria, info.tipoActividad);

    // Close the Monotributo tab if it's different from the original
    if (monotributoPage !== page) {
      await monotributoPage.close().catch(() => {});
    }

    return { success: true, info };
  } catch (error) {
    console.error("[AFIP Monotributo] Error scraping Monotributo:", error);
    return { 
      success: false, 
      info: null, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}

/**
 * Navigates to Monotributo portal using search box.
 */
async function navigateToMonotributo(
  page: Page,
  context: BrowserContext
): Promise<Page | null> {
  console.log("[AFIP Monotributo] Searching for 'Monotributo'...");

  try {
    // Use search box to find Monotributo
    const searchInput = page.locator(SELECTORS.NAVIGATION.SEARCH_INPUT).first();
    await searchInput.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    await searchInput.click();
    await searchInput.fill("monotributo");
    console.log("[AFIP Monotributo] Typed in search box, waiting for results...");

    await page.waitForTimeout(TIMING.AFTER_CLICK_WAIT);

    // Use a generic selector for search results that contain "monotributo"
    // The search results are li elements with role="option"
    const monotributoResult = page.locator('li[role="option"]:has-text("Monotributo")').first();
    
    try {
      await monotributoResult.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
      console.log("[AFIP Monotributo] Found Monotributo search result, clicking...");
    } catch {
      console.log("[AFIP Monotributo] No Monotributo result found in search");
      return null;
    }

    // Setup listener for new page/tab before clicking
    const newPagePromise = context.waitForEvent("page", { timeout: NEW_TAB_TIMEOUT }).catch(() => null);
    
    await monotributoResult.click();
    console.log("[AFIP Monotributo] Waiting for Monotributo portal...");

    // Wait for new tab or navigation
    const newPage = await newPagePromise;
    
    if (newPage) {
      console.log("[AFIP Monotributo] ✅ New tab opened!");
      await newPage.waitForLoadState("networkidle");
      await newPage.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);
      console.log("[AFIP Monotributo] Current URL:", newPage.url());
      return newPage;
    } else {
      // No new tab, check if we navigated in the same page
      console.log("[AFIP Monotributo] No new tab, checking current page...");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);
      console.log("[AFIP Monotributo] Current URL:", page.url());

      // Check if we're on a Monotributo page
      const url = page.url();
      if (url.includes("monotributo") || url.includes("seti")) {
        return page;
      }

      return null;
    }
  } catch (error) {
    console.error("[AFIP Monotributo] Error navigating to Monotributo:", error);
    return null;
  }
}

/**
 * Extracts Monotributo information from the portal page.
 * 
 * Expected HTML structure:
 * <h2 class="h3 m-b-2">FACUNDO ARIEL MALGIERI</h2>
 * <p class="lead m-b-0"><strong>CUIT</strong> 20-35410407-6</p>
 * <p class="lead"><strong>Categoría H LOCACIONES DE SERVICIOS</strong></p>
 * <div id="divProxRecategorizacion">Próximo período de recategorización: <strong>Enero 2026</strong></div>
 */
async function extractMonotributoInfo(page: Page): Promise<MonotributoAFIPInfo | null> {
  console.log("[AFIP Monotributo] Extracting info from page...");

  try {
    // Wait for the jumbotron body to be visible
    await page.waitForSelector(".jumbotron_body", { timeout: ELEMENT_TIMEOUT }).catch(() => {
      console.log("[AFIP Monotributo] jumbotron_body not found, trying alternative selectors...");
    });

    // Extract name
    const nombreElement = page.locator(".jumbotron_body h2.h3").first();
    const nombreCompleto = await nombreElement.textContent().catch(() => null);
    console.log("[AFIP Monotributo] Nombre:", nombreCompleto);

    if (!nombreCompleto) {
      console.log("[AFIP Monotributo] Could not find name element");
      return null;
    }

    // Extract CUIT
    const cuitElement = page.locator(".jumbotron_body p.lead").first();
    const cuitText = await cuitElement.textContent().catch(() => null);
    console.log("[AFIP Monotributo] CUIT text:", cuitText);

    // Parse CUIT (format: "CUIT 20-35410407-6")
    const cuitMatch = cuitText?.match(/CUIT\s*([\d-]+)/i);
    const cuit = cuitMatch ? cuitMatch[1].replace(/-/g, "") : "";

    // Extract category and activity
    // Look for the paragraph with "Categoría"
    const categoriaElements = page.locator(".jumbotron_body p.lead");
    const categoriaCount = await categoriaElements.count();
    
    let categoria = "";
    let actividadDescripcion = "";
    let tipoActividad: "servicios" | "venta" | null = null;

    for (let i = 0; i < categoriaCount; i++) {
      const text = await categoriaElements.nth(i).textContent();
      console.log(`[AFIP Monotributo] Lead paragraph ${i}:`, text);

      if (text && text.includes("Categoría")) {
        // Parse: "Categoría H LOCACIONES DE SERVICIOS"
        const match = text.match(/Categoría\s+([A-K])\s+(.+)/i);
        if (match) {
          categoria = match[1].toUpperCase();
          actividadDescripcion = match[2].trim();

          // Determine activity type
          const actividadLower = actividadDescripcion.toLowerCase();
          if (actividadLower.includes("servicio") || actividadLower.includes("locacion")) {
            tipoActividad = "servicios";
          } else if (actividadLower.includes("venta") || actividadLower.includes("mueble") || actividadLower.includes("comercio")) {
            tipoActividad = "venta";
          }

          console.log("[AFIP Monotributo] Categoría:", categoria);
          console.log("[AFIP Monotributo] Actividad:", actividadDescripcion);
          console.log("[AFIP Monotributo] Tipo:", tipoActividad);
        }
      }
    }

    if (!categoria) {
      console.log("[AFIP Monotributo] Could not find category");
      return null;
    }

    // Extract próxima recategorización
    const recategElement = page.locator("#divProxRecategorizacion strong").first();
    const proximaRecategorizacion = await recategElement.textContent().catch(() => null) || "";
    console.log("[AFIP Monotributo] Próxima recategorización:", proximaRecategorizacion);

    return {
      categoria,
      tipoActividad,
      actividadDescripcion,
      proximaRecategorizacion: proximaRecategorizacion.trim(),
      nombreCompleto: nombreCompleto.trim(),
      cuit,
    };
  } catch (error) {
    console.error("[AFIP Monotributo] Error extracting info:", error);
    return null;
  }
}

