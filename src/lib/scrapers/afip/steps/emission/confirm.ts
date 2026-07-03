/**
 * ⚠️  IRREVERSIBLE STEP — confirms the RCEL emission and downloads the PDF.
 *
 * confirmEmission() clicks "Confirmar Datos…" on Screen 4. Once clicked a CAE
 * is assigned and the invoice is legally emitted. There is no undo.
 *
 * Post-emission selectors are best-effort (the live HTML was not captured during
 * spec authoring). All extraction points are marked TODO(manual-verify) so they
 * can be adjusted after the first real run.
 */

import type { Page } from "playwright";

import { ELEMENT_TIMEOUT, TIMING } from "../../constants";

// ---------------------------------------------------------------------------
// Confirm result
// ---------------------------------------------------------------------------

export interface ConfirmRaw {
  /** Formatted invoice number, e.g. "00003-00000001". */
  numeroCompleto: string;
  /** CAE code assigned by AFIP. */
  cae: string;
  /** CAE expiry date, e.g. "YYYYMMDD" or "DD/MM/YYYY" depending on RCEL version. */
  vencimientoCae: string;
  /** JS global `idComprobante` value — used to build the PDF download URL. */
  idComprobante: string;
}

// ---------------------------------------------------------------------------
// Confirm
// ---------------------------------------------------------------------------

/**
 * Confirms the emission by clicking "Confirmar Datos…" on Screen 4.
 *
 * ⚠️  IRREVERSIBLE — only call this after the user has reviewed the preview.
 *
 * Post-emit extraction is best-effort. The exact selectors depend on the HTML
 * that RCEL renders after CAE assignment, which was not captured live.
 *
 * TODO(manual-verify): run once with a real AFIP account, capture page.content()
 * on the post-emit page, and adjust the extraction regexes/selectors below.
 */
export async function confirmEmission(page: Page): Promise<ConfirmRaw> {
  console.log("[AFIP Facturador] ⚠️  Confirming emission — IRREVERSIBLE");

  // Click "Confirmar Datos..." — RCEL renders it as an input[type=button]
  // with onclick=observarOConfirmar()
  const confirmBtn = page.locator('input[type="button"][value="Confirmar Datos..."]');
  await confirmBtn.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await confirmBtn.click();

  // Wait for post-emit indicator (page should contain "CAE" text)
  await page.waitForFunction(
    () => /CAE/i.test(document.body.textContent ?? ""),
    { timeout: ELEMENT_TIMEOUT },
  );

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);

  const html = await page.content();

  // -----------------------------------------------------------------------
  // TODO(manual-verify): adjust selectors/regexes after first real emission.
  // The patterns below are based on common RCEL v4 post-emit page structure
  // but must be verified against the actual rendered HTML.
  // -----------------------------------------------------------------------

  // idComprobante — JS global set by RCEL after emission, used for PDF URL
  // TODO(manual-verify): confirm this global name in post-emit page source
  const idComprobante = await page
    .evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = window as any;
      return String(g.idComprobante ?? g.nroComprobante ?? "");
    })
    .catch(() => "");

  // CAE — typically a 14-digit number
  // TODO(manual-verify): confirm regex pattern matches actual post-emit HTML
  const caeMatch = /CAE\s*N[°º]?\s*:?\s*(\d{14})/i.exec(html);
  const cae = caeMatch ? caeMatch[1] : "";

  // Vencimiento CAE
  // TODO(manual-verify): confirm label and date format in actual post-emit HTML
  const vtoCaeMatch = /Vencimiento\s+CAE\s*:?\s*([\d/]+)/i.exec(html);
  const vencimientoCae = vtoCaeMatch ? vtoCaeMatch[1] : "";

  // Número de comprobante (XXXXX-XXXXXXXX format)
  // TODO(manual-verify): confirm selector/pattern in actual post-emit HTML
  const nroMatch = /(\d{5}-\d{8})/i.exec(html);
  const numeroCompleto = nroMatch ? nroMatch[1] : "";

  if (!cae) {
    console.warn("[AFIP Facturador] ⚠️  CAE not found in post-emit HTML — TODO(manual-verify)");
  } else {
    console.log(`[AFIP Facturador] ✅ Emission confirmed — CAE: ${cae}, Nro: ${numeroCompleto}`);
  }

  return { numeroCompleto, cae, vencimientoCae, idComprobante };
}

// ---------------------------------------------------------------------------
// PDF download
// ---------------------------------------------------------------------------

/**
 * Downloads the PDF for the just-emitted comprobante.
 *
 * RCEL serves the PDF at imprimirComprobante.do?c=<idComprobante>.
 * We trigger it via page.goto() (same tab) and wait for the download event.
 *
 * TODO(manual-verify): confirm the download URL path and that RCEL doesn't
 * redirect to a different endpoint on this RCEL version.
 */
export async function downloadPdf(page: Page, idComprobante: string): Promise<Buffer> {
  console.log(`[AFIP Facturador] Downloading PDF for idComprobante=${idComprobante}...`);

  // TODO(manual-verify): confirm base URL matches current RCEL deployment
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
