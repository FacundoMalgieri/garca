/**
 * AFIP Emission Orchestrator.
 *
 * Two high-level flows:
 *   buildEmissionPreview  — navigates RCEL up to Screen 4 (Resumen), returns preview. Does NOT confirm.
 *   confirmEmissionFlow   — ⚠️ IRREVERSIBLE. Same flow then confirms and returns EmissionResult.
 *   listEmitted           — logs in and queries issued comprobantes for a date range.
 *
 * Browser lifecycle: each function launches its own Chromium instance and closes it in finally.
 * Pattern mirrors src/lib/scrapers/afip/index.ts exactly (chromium.launch, context with USER_AGENT,
 * page.setDefaultTimeout(DEFAULT_TIMEOUT)).
 */

import { Browser, BrowserContext, chromium, Page } from "playwright";

import { TIPO_OFICIAL, UNIVERSO_COMPROBANTE, universoToOficial } from "@/lib/facturador/codes";
import { formatDMY } from "@/lib/facturador/dates";
import { buildFillPlan } from "@/lib/facturador/fill-plan";
import { pickEmittedMatch } from "@/lib/facturador/pick-emitted-match";
import type { AFIPCredentials, AFIPInvoice } from "@/types/afip-scraper";
import type { EmissionPreview, EmissionResult, Plantilla } from "@/types/facturador";

import { DEFAULT_HEADLESS, DEFAULT_TIMEOUT, TIMING, USER_AGENT } from "./constants";
import { confirmEmission, downloadPdf } from "./steps/emission/confirm";
import { consultarEmitidas } from "./steps/emission/consulta";
import { fillComprobante } from "./steps/emission/fill";
import { navigateToEmission } from "./steps/emission/navigate";
import { capturePreview } from "./steps/emission/preview";
import { login } from "./steps/login";
import { navigateToComprobantes, selectCompany } from "./steps/navigation";

// ---------------------------------------------------------------------------
// Shared options
// ---------------------------------------------------------------------------

export interface EmitOpts {
  /** Override the comprobante date (DD/MM/YYYY). If omitted RCEL uses today. */
  fecha?: string;
  /** Which company button to click when the AFIP account has multiple representadas (default 0). */
  companyIndex?: number;
  /** Universo de comprobante (pantalla 0). Default Factura C ("2"). NC = "4". */
  universo?: string;
  /** Comprobante asociado (pantalla 2). Requerido para NC. */
  asociado?: { tipo: string; puntoVenta: string; numero: string; fecha?: string };
}

// ---------------------------------------------------------------------------
// Internal browser bootstrap (mirrors index.ts exactly)
// ---------------------------------------------------------------------------

interface BrowserBundle {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

async function launchBrowser(): Promise<BrowserBundle> {
  const browser = await chromium.launch({
    headless: DEFAULT_HEADLESS,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    userAgent: USER_AGENT,
  });

  const page = await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT);

  return { browser, context, page };
}

async function closeBrowser(bundle: Partial<BrowserBundle>): Promise<void> {
  if (bundle.page) await bundle.page.close().catch(() => {});
  if (bundle.context) await bundle.context.close().catch(() => {});
  if (bundle.browser) await bundle.browser.close().catch(() => {});
}

// ---------------------------------------------------------------------------
// buildEmissionPreview
// ---------------------------------------------------------------------------

/**
 * Navigates RCEL through screens 0-4 (Resumen) and captures the preview.
 * Does NOT click "Confirmar Datos…" — safe to call without side effects.
 *
 * @param credentials  - Decrypted AFIP credentials.
 * @param plantilla    - Invoice template to fill.
 * @param opts         - Optional fecha override and companyIndex.
 * @returns            Parsed EmissionPreview from Screen 4.
 */
export async function buildEmissionPreview(
  credentials: AFIPCredentials,
  plantilla: Plantilla,
  opts: EmitOpts = {},
): Promise<EmissionPreview> {
  const { companyIndex = 0, fecha, universo, asociado } = opts;
  const bundle = await launchBrowser();

  try {
    console.log("[AFIP Emit] Starting preview flow...");

    const loginResult = await login(bundle.page, credentials, DEFAULT_TIMEOUT);
    if (!loginResult.success) {
      throw new Error(loginResult.error ?? "Login en AFIP falló");
    }

    const rcelPage = await navigateToEmission(bundle.page, bundle.context, companyIndex);

    const plan = buildFillPlan(plantilla, { fecha, universo, asociado });
    await fillComprobante(rcelPage, plan);

    const preview = await capturePreview(rcelPage, {
      puntoVenta: plantilla.puntoDeVenta,
      tipoComprobante: universoToOficial(universo ?? UNIVERSO_COMPROBANTE.facturaC) ?? TIPO_OFICIAL.facturaC,
    });

    console.log("[AFIP Emit] ✅ Preview captured successfully");
    return preview;
  } finally {
    await closeBrowser(bundle);
  }
}

// ---------------------------------------------------------------------------
// confirmEmissionFlow
// ---------------------------------------------------------------------------

/**
 * ⚠️  IRREVERSIBLE — emits the comprobante and returns the result with CAE.
 *
 * Runs the full fill flow (same as buildEmissionPreview) then clicks
 * "Confirmar Datos…" on Screen 4.  Once confirmed, AFIP assigns a CAE
 * and the invoice is legally registered.
 *
 * TODO(manual-verify): This function re-fills the form and confirms in a single
 * request (serverless fase-1/fase-2 design). Idempotency hardening is deferred
 * to the manual verification phase per spec §6 — if the network fails between
 * fillComprobante and confirmEmission the CAE may already be assigned.
 *
 * @param credentials  - Decrypted AFIP credentials.
 * @param plantilla    - Invoice template to fill.
 * @param opts         - Optional fecha override and companyIndex.
 * @returns            EmissionResult spread over the preview fields + CAE data.
 */
export async function confirmEmissionFlow(
  credentials: AFIPCredentials,
  plantilla: Plantilla,
  opts: EmitOpts = {},
): Promise<EmissionResult> {
  const { companyIndex = 0, fecha, universo, asociado } = opts;
  const bundle = await launchBrowser();

  try {
    console.log("[AFIP Emit] ⚠️  Starting IRREVERSIBLE confirm flow...");

    const loginResult = await login(bundle.page, credentials, DEFAULT_TIMEOUT);
    if (!loginResult.success) {
      throw new Error(loginResult.error ?? "Login en AFIP falló");
    }

    const rcelPage = await navigateToEmission(bundle.page, bundle.context, companyIndex);

    const plan = buildFillPlan(plantilla, { fecha, universo, asociado });
    await fillComprobante(rcelPage, plan);

    // Capture preview data (needed for the EmissionResult spread)
    const preview = await capturePreview(rcelPage, {
      puntoVenta: plantilla.puntoDeVenta,
      tipoComprobante: universoToOficial(universo ?? UNIVERSO_COMPROBANTE.facturaC) ?? TIPO_OFICIAL.facturaC,
    });

    // Confirm — IRREVERSIBLE from this point. Deja la página en "Comprobante Generado".
    const { idComprobante } = await confirmEmission(rcelPage);

    // PDF (best-effort) — se baja ANTES de salir de la pantalla post-emisión.
    let pdfBase64: string | undefined;
    if (idComprobante) {
      try {
        const pdf = await downloadPdf(rcelPage, idComprobante);
        pdfBase64 = pdf.toString("base64");
      } catch (err) {
        console.warn("[AFIP Emit] PDF download failed (non-critical):", err);
      }
    }

    // CAE + número NO están en la pantalla post-emisión → se leen de Consultas
    // (verificado en vivo v4.9.9). Consultas no expone Vto CAE (queda en el PDF).
    const oficial = universoToOficial(universo ?? UNIVERSO_COMPROBANTE.facturaC) ?? TIPO_OFICIAL.facturaC;
    const consultaFecha = fecha ?? formatDMY(new Date());
    let numeroCompleto = "";
    let cae = "";
    try {
      // Volver al menú principal para que consultarEmitidas pueda clickear "Consultas".
      await rcelPage.locator('input[type="button"][value="Menú Principal"]').first().click();
      await rcelPage.waitForLoadState("networkidle");
      await rcelPage.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);

      const emitidas = await consultarEmitidas(rcelPage, consultaFecha, consultaFecha);
      // Compare de PV numérico (Consultas puede padding-ear el PV) + selección del
      // más reciente. Extraído a helper puro testeable (H1). Sin match → cae:"".
      const match = pickEmittedMatch(emitidas, { oficial, puntoVenta: plantilla.puntoDeVenta });

      if (match) {
        numeroCompleto = match.numeroCompleto;
        cae = match.cae ?? "";
      } else {
        console.warn("[AFIP Emit] ⚠️  No se encontró el comprobante recién emitido en Consultas");
      }
    } catch (err) {
      console.warn("[AFIP Emit] Lookup de CAE/número en Consultas falló:", err);
    }

    const result: EmissionResult = {
      ...preview,
      numeroCompleto,
      cae,
      vencimientoCae: "",
      pdfBase64,
    };

    console.log(`[AFIP Emit] ✅ Emission confirmed — CAE: ${cae || "(pendiente Consultas)"}, Nro: ${numeroCompleto}`);
    return result;
  } finally {
    await closeBrowser(bundle);
  }
}

// ---------------------------------------------------------------------------
// listEmitted
// ---------------------------------------------------------------------------

/**
 * Logs in, navigates to RCEL → Consultas, and returns issued comprobantes
 * for the given date range.
 *
 * @param credentials  - Decrypted AFIP credentials.
 * @param fechaDesde   - From date, DD/MM/YYYY.
 * @param fechaHasta   - To date, DD/MM/YYYY.
 * @param companyIndex - Which company to select (default 0).
 * @returns            Parsed AFIPInvoice list.
 */
export async function listEmitted(
  credentials: AFIPCredentials,
  fechaDesde: string,
  fechaHasta: string,
  companyIndex: number = 0,
): Promise<AFIPInvoice[]> {
  const bundle = await launchBrowser();

  try {
    console.log(`[AFIP Emit] Listing emitted ${fechaDesde} – ${fechaHasta}...`);

    const loginResult = await login(bundle.page, credentials, DEFAULT_TIMEOUT);
    if (!loginResult.success) {
      throw new Error(loginResult.error ?? "Login en AFIP falló");
    }

    // Navigate to RCEL and select company — lands on RCEL main menu
    const rcelPage = await navigateToComprobantes(bundle.page, bundle.context);
    await selectCompany(rcelPage, companyIndex);

    const invoices = await consultarEmitidas(rcelPage, fechaDesde, fechaHasta);
    console.log(`[AFIP Emit] ✅ Found ${invoices.length} emitted comprobante(s)`);
    return invoices;
  } finally {
    await closeBrowser(bundle);
  }
}
