/**
 * Emission fill helpers: apply a FillAction and drive all 4 RCEL screens (0-3)
 * ending with the page positioned on Screen 4 (Resumen).
 *
 * RCEL constraint: navigate ONLY by clicking UI elements — no page.goto().
 */

import type { Page } from "playwright";

import type { FillAction, FillPlan } from "@/lib/facturador/fill-plan";

import { ELEMENT_TIMEOUT, TIMING } from "../../constants";

// ---------------------------------------------------------------------------
// Single-action helper
// ---------------------------------------------------------------------------

/**
 * Applies one FillAction to the page.
 *
 * action types:
 *   select  → page.selectOption
 *   fill    → page.fill
 *   check   → page.check
 *   lookup  → page.fill + Enter + wait for #razonsocialreceptor to be non-empty
 */
export async function applyAction(page: Page, a: FillAction): Promise<void> {
  switch (a.action) {
    case "select":
      await page.selectOption(a.selector, a.value);
      break;

    case "fill":
      await page.fill(a.selector, a.value);
      break;

    case "check":
      await page.check(a.selector);
      break;

    case "lookup":
      await page.fill(a.selector, a.value);
      await page.press(a.selector, "Enter");
      // Esperar que el padrón llene #razonsocialreceptor, pero acotado y tolerante:
      // un DNI/CUIT no registrado no responde, y no debe colgar ni abortar la emisión.
      try {
        await page.waitForFunction(
          () => {
            const el = document.querySelector<HTMLInputElement>("#razonsocialreceptor");
            return el !== null && el.value.trim().length > 0;
          },
          { timeout: TIMING.LOOKUP_WAIT },
        );
      } catch {
        // sin resolución de padrón: seguir con lo tipeado (RCEL acepta CF sin razón social)
      }
      break;
  }
}

// ---------------------------------------------------------------------------
// Continuar button
// ---------------------------------------------------------------------------

async function clickContinuar(page: Page): Promise<void> {
  const btn = page.locator('input[type="button"][value="Continuar >"]');
  await btn.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await btn.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);
}

// ---------------------------------------------------------------------------
// Screen 0 – punto de venta + tipo comprobante
//
// Selecting #puntodeventa triggers an AJAX (ajaxFunction()) that repopulates
// #universocomprobante.  We must wait until the target option exists before
// calling selectOption on #universocomprobante.
// ---------------------------------------------------------------------------

async function fillPantalla0(page: Page, actions: FillAction[]): Promise<void> {
  console.log("[AFIP Facturador] Screen 0 – punto de venta / tipo comprobante");

  for (const a of actions) {
    if (a.selector === "#universocomprobante") {
      // El PV recién seleccionado dispara un AJAX que repuebla el universo.
      // Esperamos a que termine (haya alguna opción real), NO a la opción objetivo:
      // si ese PV no emite el comprobante pedido, la opción nunca llegaría y
      // esperaríamos los 60s completos. En su lugar, apenas pobló, verificamos.
      await page.waitForFunction(
        () => {
          const sel = document.querySelector<HTMLSelectElement>("#universocomprobante");
          return !!sel && [...sel.options].some((o) => o.value !== "");
        },
        undefined,
        { timeout: ELEMENT_TIMEOUT },
      );
      const available = await page.$eval("#universocomprobante", (el) =>
        [...(el as HTMLSelectElement).options]
          .map((o) => ({ value: o.value, label: o.text.trim() }))
          .filter((o) => o.value !== ""),
      );
      if (!available.some((o) => o.value === a.value)) {
        const tipos = available.map((o) => o.label).join(", ") || "ninguno";
        throw new Error(
          `El punto de venta seleccionado no puede emitir este tipo de comprobante. ` +
            `Ese punto de venta emite: ${tipos}. ` +
            `Elegí un punto de venta habilitado para el comprobante que querés emitir.`,
        );
      }
    }
    await applyAction(page, a);
  }
}

// ---------------------------------------------------------------------------
// Screen 3 – detalle de la operación
//
// Line rows are 1-indexed.  For row n > 1 we must call insertarFilaDetalle()
// from the page JS before filling the row's fields.
// The plan contains selectors like #detalle_descripcion1, #detalle_descripcion2…
// We infer lineCount from the maximum trailing digit found in pantalla3 selectors.
// ---------------------------------------------------------------------------

function inferLineCount(actions: FillAction[]): number {
  let max = 1;
  for (const a of actions) {
    const m = /(\d+)$/.exec(a.selector);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return max;
}

async function fillPantalla3(page: Page, actions: FillAction[]): Promise<void> {
  console.log("[AFIP Facturador] Screen 3 – detalle de la operación");

  const lineCount = inferLineCount(actions);
  console.log(`[AFIP Facturador] Line rows: ${lineCount}`);

  // Create extra rows (rows 2…n) via the page's JS helper
  for (let i = 1; i < lineCount; i++) {
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).insertarFilaDetalle();
    });
    await page.waitForTimeout(TIMING.JS_PROCESS_WAIT);
  }

  for (const a of actions) {
    await applyAction(page, a);
  }
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

export interface FillComprobanteOpts {
  /**
   * Label of the domicilio option in #domicilioreceptorcombo.
   * If not provided (or not found) the second option (index 1) is selected.
   */
  domicilio?: string;
}

/**
 * Drives RCEL screens 0-3, ending on Screen 4 (Resumen de Datos).
 *
 * The page must already be on Screen 0 (buscarPtosVtas.do) when called —
 * use navigateToEmission() to get there.
 */
export async function fillComprobante(
  page: Page,
  plan: FillPlan,
  opts: FillComprobanteOpts = {},
): Promise<void> {
  // ---- Screen 0 ----
  await fillPantalla0(page, plan.pantalla0);
  await clickContinuar(page);

  // ---- Screen 1 ----
  console.log("[AFIP Facturador] Screen 1 – datos del emisor");
  for (const a of plan.pantalla1) {
    await applyAction(page, a);
    // #idconcepto onchange reveals the período block — give JS a moment
    if (a.selector === "#idconcepto") {
      await page.waitForTimeout(TIMING.JS_PROCESS_WAIT);
    }
  }
  await clickContinuar(page);

  // ---- Screen 2 ----
  console.log("[AFIP Facturador] Screen 2 – datos del receptor");
  for (const a of plan.pantalla2) {
    await applyAction(page, a);
    // #idivareceptor onchange repopulates tipo doc — wait before next action
    if (a.selector === "#idivareceptor") {
      await page.waitForTimeout(TIMING.JS_PROCESS_WAIT);
    }
  }

  // Select domicilio: prefer the provided label, fall back to option index 1
  const domicilioSel = page.locator("#domicilioreceptorcombo");
  const domicilioCount = await domicilioSel.locator("option").count();
  if (domicilioCount > 0) {
    if (opts.domicilio) {
      try {
        await domicilioSel.selectOption({ label: opts.domicilio });
      } catch {
        console.warn(
          `[AFIP Facturador] Domicilio label "${opts.domicilio}" not found, falling back to index 1`,
        );
        // index 1 = second option (first is usually blank placeholder)
        const fallback = await domicilioSel.locator("option").nth(1).getAttribute("value");
        if (fallback !== null) await domicilioSel.selectOption(fallback);
      }
    } else if (domicilioCount > 1) {
      const fallback = await domicilioSel.locator("option").nth(1).getAttribute("value");
      if (fallback !== null) await domicilioSel.selectOption(fallback);
    }
  }

  await clickContinuar(page);

  // ---- Screen 3 ----
  await fillPantalla3(page, plan.pantalla3);
  await clickContinuar(page);

  // Now on Screen 4 (Resumen de Datos) — caller handles from here
  console.log("[AFIP Facturador] ✅ On Screen 4 (Resumen de Datos)");
}
