/**
 * Scrape de puntos de venta + su universo de comprobantes.
 *
 * En RCEL Screen 0 (buscarPtosVtas.do), el select #puntodeventa lista los PV
 * habilitados. Al elegir uno, un AJAX (ajaxFunction) repuebla #universocomprobante
 * con los tipos de comprobante que ESE PV puede emitir (Factura C, Factura E, etc.).
 *
 * Este módulo recorre cada PV, dispara el AJAX y lee el universo resultante para
 * construir el mapa `PuntoDeVenta[]`. Es best-effort: si algo falla, quien llama
 * debe capturar el error y seguir (el facturador cae al input de texto libre).
 *
 * RCEL constraint: navegar solo clickeando la UI — nada de page.goto().
 */

import type { Page } from "playwright";

import type { PuntoDeVenta } from "@/types/afip-scraper";

import { ELEMENT_TIMEOUT, TIMING } from "../../constants";

interface RawOption {
  value: string;
  label: string;
}

/** Lee las opciones (no vacías) de un <select> por id. */
async function readOptions(page: Page, selectId: string): Promise<RawOption[]> {
  return page.$eval(selectId, (el) => {
    const sel = el as HTMLSelectElement;
    return [...sel.options]
      .map((o) => ({ value: o.value, label: o.text.trim() }))
      .filter((o) => o.value !== "");
  });
}

/**
 * Navega desde donde esté la sesión RCEL (típicamente la pantalla de Consultas
 * tras extraer facturas) de vuelta al menú principal y luego a Screen 0.
 */
async function navigateToScreen0(page: Page): Promise<void> {
  // "Menú Principal" — puede ser <input type=button> o <button>.
  const menu = page
    .locator('input[type="button"][value="Menú Principal"], button:has-text("Menú Principal")')
    .first();
  await menu.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await menu.click();
  await page.waitForLoadState("networkidle");

  // "Generar Comprobantes" — <a role="button" href="buscarPtosVtas.do">.
  const generar = page.locator('a[href="buscarPtosVtas.do"]');
  await generar.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  await generar.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(TIMING.AFTER_NAVIGATION_WAIT);
}

/**
 * Recorre los PV de Screen 0 y devuelve, por cada uno, su universo de comprobantes.
 * `page` debe estar ya en Screen 0 (buscarPtosVtas.do).
 */
export async function scrapePuntosDeVentaFromScreen0(page: Page): Promise<PuntoDeVenta[]> {
  const pvOptions = await readOptions(page, "#puntodeventa");
  const result: PuntoDeVenta[] = [];

  for (const pv of pvOptions) {
    // Seleccionar el PV dispara ajaxFunction() que repuebla #universocomprobante.
    await page.selectOption("#puntodeventa", pv.value);
    // Esperar a que el universo tenga opciones reales (el AJAX terminó).
    try {
      await page.waitForFunction(
        () => {
          const sel = document.querySelector<HTMLSelectElement>("#universocomprobante");
          return !!sel && [...sel.options].some((o) => o.value !== "");
        },
        undefined,
        { timeout: ELEMENT_TIMEOUT },
      );
    } catch {
      // Este PV no pobló universo alguno; lo registramos sin tipos y seguimos.
      result.push({ value: pv.value, label: pv.label, tipos: [] });
      continue;
    }
    // Pequeño settle para evitar leer un universo a medio poblar.
    await page.waitForTimeout(TIMING.JS_PROCESS_WAIT);
    const tipos = await readOptions(page, "#universocomprobante");
    result.push({ value: pv.value, label: pv.label, tipos });
  }

  return result;
}

/**
 * Wrapper best-effort: navega a Screen 0 (desde donde esté la sesión RCEL) y
 * scrapea los PV. Devuelve `null` si algo falla — nunca lanza.
 */
export async function scrapePuntosDeVentaBestEffort(page: Page): Promise<PuntoDeVenta[] | null> {
  try {
    console.log("[AFIP Facturador] Scrapeando puntos de venta...");
    await navigateToScreen0(page);
    const pdv = await scrapePuntosDeVentaFromScreen0(page);
    console.log(`[AFIP Facturador] ✅ ${pdv.length} punto(s) de venta scrapeados`);
    return pdv;
  } catch (err) {
    console.warn("[AFIP Facturador] Scrape de puntos de venta falló (best-effort):", err);
    return null;
  }
}
