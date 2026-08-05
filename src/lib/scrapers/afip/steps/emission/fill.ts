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
 * Aplica una acción sin verificar nada.
 */
async function rawApply(page: Page, a: FillAction): Promise<void> {
  switch (a.action) {
    case "select":
      await page.selectOption(a.selector, a.value);
      break;

    case "fill":
      await page.fill(a.selector, a.value);
      break;

    case "check": {
      const el = page.locator(a.selector);
      // RCEL registra la forma de pago desde el handler del click, no desde el
      // estado del DOM. `page.check()` no hace NADA si la casilla ya está
      // marcada (no dispara click), así que cuando RCEL la renderiza pre-marcada
      // —recordando la emisión anterior de la sesión— el handler nunca corre y
      // el servidor recibe null: el Resumen sale con la condición de venta en
      // "null" aunque el DOM se vea correcto. Medido: fallaba 3 de 5 corridas.
      // Desmarcar y volver a marcar garantiza el evento con el estado final ok.
      if (await el.isChecked()) {
        await el.uncheck();
        await page.waitForTimeout(TIMING.ROW_SCROLL_WAIT);
      }
      await el.check();
      break;
    }

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

/**
 * ¿El DOM refleja la acción? `null` = no verificable (fill/lookup: RCEL reformatea
 * y normaliza lo tipeado, así que comparar texto daría falsos negativos).
 */
async function matchesDom(page: Page, a: FillAction): Promise<boolean | null> {
  if (a.action === "check") {
    return page.locator(a.selector).isChecked();
  }

  if (a.action === "select") {
    // `selectOption` matchea por value O por label, así que se aceptan las dos:
    // comparar solo contra el value daría un falso negativo en las opciones
    // elegidas por texto y bloquearía una emisión válida.
    const sel = await page.locator(a.selector).evaluate((el) => {
      const select = el as HTMLSelectElement;
      const opt = select.selectedOptions[0];
      return { value: select.value, label: opt?.label ?? "", text: opt?.textContent?.trim() ?? "" };
    });
    return sel.value === a.value || sel.label === a.value || sel.text === a.value;
  }

  return null;
}

/**
 * Reaplica lo que se perdió entre que se seteó y ahora.
 *
 * Medido contra RCEL (05/08/2026): 3 de 5 corridas llegaban al Resumen con la
 * condición de venta en el literal "null" — un null de sesión impreso por el JSP,
 * o sea que el checkbox `#formadepago*` no llegó al servidor. El checkbox SÍ
 * quedaba marcado al aplicarlo (verificar en ese momento no detectaba nada): lo
 * borra algo posterior de la misma pantalla, el candidato más fuerte es el
 * `onchange` de `#domicilioreceptorcombo`, que re-renderiza la sección del
 * receptor después.
 *
 * Por eso la verificación va acá, inmediatamente antes de Continuar: es el único
 * momento en que el DOM ya no va a cambiar más y todavía se puede corregir.
 */
async function reapplyDrifted(page: Page, actions: FillAction[]): Promise<void> {
  for (const a of actions) {
    const ok = await matchesDom(page, a).catch(() => null);
    if (ok !== false) continue;

    console.warn(
      `[AFIP Facturador] ⚠️  ${a.selector} se perdió después de aplicarlo (RCEL lo reseteó), reaplicando...`,
    );
    await rawApply(page, a);
    await page.waitForTimeout(TIMING.JS_PROCESS_WAIT);

    if ((await matchesDom(page, a).catch(() => null)) === false) {
      throw new Error(
        `No se pudo dejar ${a.selector} en "${a.value}": RCEL lo descartó dos veces. ` +
          `Emitir así generaría un comprobante incompleto.`,
      );
    }
  }
}

/**
 * Applies one FillAction to the page, verificando select/check en el momento.
 *
 * La verificación fuerte está en reapplyDrifted(), justo antes de Continuar: acá
 * solo se detecta el caso en que la acción no prende de entrada.
 */
export async function applyAction(page: Page, a: FillAction): Promise<void> {
  await rawApply(page, a);

  if ((await matchesDom(page, a).catch(() => null)) === false) {
    console.warn(`[AFIP Facturador] ⚠️  ${a.selector} no quedó aplicado, reintentando...`);
    await page.waitForTimeout(TIMING.JS_PROCESS_WAIT);
    await rawApply(page, a);
  }
}

// ---------------------------------------------------------------------------
// Continuar button
// ---------------------------------------------------------------------------

async function clickContinuar(page: Page, verificar: FillAction[] = []): Promise<void> {
  // Último momento para corregir lo que RCEL reseteó: después de esto el estado
  // del formulario ya viaja al servidor.
  await reapplyDrifted(page, verificar);

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
  await clickContinuar(page, plan.pantalla0);

  // ---- Screen 1 ----
  console.log("[AFIP Facturador] Screen 1 – datos del emisor");
  for (const a of plan.pantalla1) {
    await applyAction(page, a);
    // #idconcepto onchange reveals the período block — give JS a moment
    if (a.selector === "#idconcepto") {
      await page.waitForTimeout(TIMING.JS_PROCESS_WAIT);
    }
  }
  await clickContinuar(page, plan.pantalla1);

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

  await clickContinuar(page, plan.pantalla2);

  // ---- Screen 3 ----
  await fillPantalla3(page, plan.pantalla3);
  await clickContinuar(page, plan.pantalla3);

  // Now on Screen 4 (Resumen de Datos) — caller handles from here
  console.log("[AFIP Facturador] ✅ On Screen 4 (Resumen de Datos)");
}
