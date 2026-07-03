/**
 * Captures and parses the RCEL Resumen screen (Screen 4 / genComResumenDatos.do).
 *
 * The page must already be on Screen 4 when called — fillComprobante() leaves it there.
 * This step is read-only; it does NOT confirm the emission.
 */

import type { Page } from "playwright";

import { parseResumen } from "@/lib/facturador/resumen-parser";
import type { EmissionPreview } from "@/types/facturador";

import { ELEMENT_TIMEOUT } from "../../constants";

/**
 * Waits for the Resumen screen, grabs the raw HTML, and returns a parsed EmissionPreview.
 *
 * @param page - RCEL Page on Screen 4.
 * @param meta - Punto de venta and tipo comprobante code (carried from the fill plan).
 */
export async function capturePreview(
  page: Page,
  meta: { puntoVenta: string; tipoComprobante: number },
): Promise<EmissionPreview> {
  console.log("[AFIP Facturador] Waiting for Resumen screen...");

  await page.waitForFunction(
    () => document.body.textContent?.includes("RESUMEN DE DATOS"),
    { timeout: ELEMENT_TIMEOUT },
  );

  const html = await page.content();

  // Check for the observations div — it may signal warnings but is not a blocker at preview
  const observaciones = await page.locator("#observaciones").textContent().catch(() => "");
  if (observaciones && observaciones.trim().length > 0) {
    console.warn("[AFIP Facturador] ⚠️  Observaciones en Resumen:", observaciones.trim());
  }

  const preview = parseResumen(html, meta);
  console.log(
    `[AFIP Facturador] ✅ Preview captured — total: ${preview.importeTotal}, lines: ${preview.lineas.length}`,
  );
  return preview;
}
