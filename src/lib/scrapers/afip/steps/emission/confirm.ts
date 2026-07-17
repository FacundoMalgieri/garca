/**
 * ⚠️  IRREVERSIBLE STEP — confirms the RCEL emission and downloads the PDF.
 *
 * Flow mapeado EN VIVO contra RCEL v4.9.9 (2026-07-17, emisión real):
 *   1. Click "Confirmar Datos..." (input[type=button], onclick=observarOConfirmar()).
 *   2. Aparece un modal jQuery-UI "Generar Comprobante" → click su botón "Confirmar".
 *   3. La pantalla pasa a "✅ Comprobante Generado" (misma URL, body actualizado).
 *   4. `window.idComprobante` queda seteado (se usa para el PDF).
 *
 * ⚠️ CAE y número NO se muestran en esta pantalla — se leen de Consultas
 * (ver confirmEmissionFlow en emit.ts). Acá solo devolvemos idComprobante.
 */

import type { Page } from "playwright";

import { ELEMENT_TIMEOUT, TIMING } from "../../constants";

// ---------------------------------------------------------------------------
// Confirm result
// ---------------------------------------------------------------------------

export interface ConfirmRaw {
  /** JS global `idComprobante` value — used to build the PDF download URL. */
  idComprobante: string;
}

// ---------------------------------------------------------------------------
// Confirm
// ---------------------------------------------------------------------------

/**
 * Confirms the emission: clicks "Confirmar Datos…" then the modal's "Confirmar".
 *
 * ⚠️  IRREVERSIBLE — only call this after the user has reviewed the preview.
 * Leaves the page on the post-emit "Comprobante Generado" screen.
 */
export async function confirmEmission(page: Page): Promise<ConfirmRaw> {
  console.log("[AFIP Facturador] ⚠️  Confirming emission — IRREVERSIBLE");

  // Step 1 — "Confirmar Datos..." (input[type=button], onclick=observarOConfirmar())
  const confirmBtn = page.locator('input[type="button"][value="Confirmar Datos..."]');
  await confirmBtn.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await confirmBtn.click();

  // Step 2 — jQuery-UI modal "Generar Comprobante" → botón "Confirmar".
  // Es un <button class="ui-button"> con el texto "Confirmar" (no un confirm() nativo).
  const modalConfirm = page.locator(".ui-dialog button", { hasText: /^\s*Confirmar\s*$/ });
  await modalConfirm.first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await modalConfirm.first().click();

  // Step 3 — esperar el indicador de éxito "Comprobante Generado"
  await page.waitForFunction(
    () => /Comprobante\s+Generado/i.test(document.body.textContent ?? ""),
    { timeout: ELEMENT_TIMEOUT },
  );
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);

  // Step 4 — idComprobante (global JS de la pantalla post-emisión)
  const idComprobante = await page
    .evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = window as any;
      return String(g.idComprobante ?? "");
    })
    .catch(() => "");

  console.log(`[AFIP Facturador] ✅ Comprobante generado — idComprobante=${idComprobante}`);
  return { idComprobante };
}

// ---------------------------------------------------------------------------
// PDF download
// ---------------------------------------------------------------------------

/**
 * Downloads the PDF for the just-emitted comprobante.
 *
 * RCEL serves the PDF at imprimirComprobante.do?c=<idComprobante> (confirmado en
 * vivo v4.9.9: la navegación directa "aborta" porque dispara una descarga, que es
 * exactamente lo que captura page.waitForEvent("download")).
 */
export async function downloadPdf(page: Page, idComprobante: string): Promise<Buffer> {
  console.log(`[AFIP Facturador] Downloading PDF for idComprobante=${idComprobante}...`);

  const downloadUrl = `imprimirComprobante.do?c=${idComprobante}`;

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: ELEMENT_TIMEOUT }),
    page.goto(downloadUrl, { waitUntil: "commit" }),
  ]);

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  const pdf = Buffer.concat(chunks);
  console.log(`[AFIP Facturador] ✅ PDF downloaded (${pdf.length} bytes)`);
  return pdf;
}
