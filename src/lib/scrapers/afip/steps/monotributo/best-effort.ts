import type { BrowserContext } from "playwright"

import type { MonotributoAFIPInfo } from "@/types/afip-scraper"

import { URLS } from "../../constants"
import { scrapeMonotributoInfo } from "./index"

/**
 * Trae la categoría de Monotributo sin poder romper nada.
 *
 * Existe para el flujo de comprobantes, donde el dato es un extra: los
 * comprobantes ya están extraídos cuando esto corre, así que cualquier falla
 * —ARCA caída, portal que no navega, pestaña que no abre— tiene que terminar en
 * `null` y nunca en una excepción.
 *
 * Abre su propia pestaña sobre el portal en vez de reusar la que recibió el
 * scrape: esa es la de RCEL, y navegarla al portal rompería la sesión que usa el
 * resto del flujo. El contexto comparte cookies, así que la pestaña nueva abre
 * el portal ya logueado.
 *
 * @param scrape - Inyectable para poder testear las decisiones de este helper
 *   sin ARCA real (el step de verdad necesita conexión; ver vitest.config.ts).
 */
export async function scrapeMonotributoBestEffort(
  context: BrowserContext,
  scrape: typeof scrapeMonotributoInfo = scrapeMonotributoInfo
): Promise<MonotributoAFIPInfo | null> {
  let portalPage = null

  try {
    portalPage = await context.newPage()
    await portalPage.goto(URLS.PORTAL, { waitUntil: "domcontentloaded" })

    const result = await scrape(portalPage, context)
    return result.success && result.info ? result.info : null
  } catch (error) {
    console.warn(
      "[AFIP Monotributo] Refresco best-effort falló (no afecta los comprobantes):",
      error instanceof Error ? error.message : error
    )
    return null
  } finally {
    await portalPage?.close().catch(() => {})
  }
}
