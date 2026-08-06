/**
 * AFIP Monotributo scraper step.
 * Navigates to Monotributo portal and extracts category/activity information.
 */

import type { BrowserContext, Page } from "playwright";

import type { MonotributoAFIPInfo } from "@/types/afip-scraper";

import { MONOTRIBUTO_TIMEOUTS, READ_TIMEOUT, SELECTORS, TIMING, URLS } from "../../constants";
import { pickProximaRecategorizacion } from "./parse";

/**
 * ¿Esta URL es el portal de Monotributo?
 *
 * ARCA sirve el portal desde monotributo.afip.gob.ar y algunas variantes lo
 * rutean por /seti/.
 */
function isMonotributoUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    // Por host, no por substring suelta: "seti" como substring matchea
    // cualquier URL con "settings" adentro.
    return hostname.includes("monotributo") || /(^|\/)seti(\/|$)/.test(pathname);
  } catch {
    return false;
  }
}

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
  context: BrowserContext,
  /**
   * Momento (epoch ms) a partir del cual no se clickea ni se reintenta.
   * Por defecto, el presupuesto del step contado desde ahora.
   */
  deadline: number = Date.now() + MONOTRIBUTO_TIMEOUTS.STEP_BUDGET
): Promise<MonotributoScrapingResult> {
  console.log("[AFIP Monotributo] Starting Monotributo info fetch...");

  try {
    // Navigate to Monotributo via service card / search
    const monotributoPage = await navigateToMonotributo(page, context, deadline);

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

    console.log("[AFIP Monotributo] ✅ Successfully extracted Monotributo info");

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
 * Espera a que la página de Monotributo tenga el dato que se va a extraer.
 *
 * Antes se esperaba "networkidle". Medido el 05/08/2026 contra el DOM real, esa
 * espera no era el problema (cerraba a 5,6s vs 4,9s del nodo), pero es una señal
 * frágil acá: Inicio.aspx hace polling AJAX cada 2s (`CalcularFacturacion` del
 * facturómetro) mientras la ventana de recategorización está abierta. Los datos
 * que necesitamos vienen server-rendered, así que se espera el nodo concreto.
 */
async function waitForMonotributoReady(target: Page): Promise<void> {
  await target.waitForLoadState("domcontentloaded").catch(() => {});
  await target
    .waitForSelector(".jumbotron_body h2.h3", { timeout: MONOTRIBUTO_TIMEOUTS.READY })
    .catch(() => {
      console.log("[AFIP Monotributo] jumbotron no visible dentro del timeout, sigo igual");
    });
  await target.waitForTimeout(TIMING.AFTER_CLICK_WAIT);
}

/**
 * Intentos de navegación antes de rendirse.
 *
 * Dos, no tres. El único modo de falla confirmado (05/08/2026) es
 * monotributo.afip.gob.ar colgado — acepta la conexión TCP y no responde
 * nunca — y contra eso reintentar no sirve: sólo multiplica el tiempo perdido.
 * El segundo intento queda como seguro barato por si el click se pierde de
 * verdad (que es lo que asume `navigateToComprobantes`, que reintenta 3 veces).
 */
export const MAX_NAV_ATTEMPTS = 2;

/**
 * Margen mínimo para que valga la pena arrancar otro intento.
 *
 * Evita empezar un intento que el presupuesto del step va a cortar por la
 * mitad, dejando el browser a medio camino.
 */
const RETRY_MIN_REMAINING_MS = 12000;

/**
 * Un disparador de navegación ya localizado y listo para clickear.
 *
 * Localizar y clickear están separados a propósito: el listener de pestaña
 * nueva tiene un timeout corto y hay que armarlo JUSTO antes del click. Si se
 * arma antes de buscar el trigger, la búsqueda (hasta 5s si la tarjeta no está,
 * más 1,5s del typeahead) se come el presupuesto del listener y la pestaña
 * nueva —el camino feliz— queda sin detectar.
 */
interface NavigationTrigger {
  kind: "card" | "search";
  click: () => Promise<void>;
}

/**
 * Localiza la tarjeta de "Servicios | Más utilizados".
 *
 * @returns null si la tarjeta no está en el portal (sección personalizada).
 */
async function findServiceCardTrigger(page: Page): Promise<NavigationTrigger | null> {
  const card = page.locator(SELECTORS.NAVIGATION.MONOTRIBUTO_CARD).first();

  try {
    await card.waitFor({ state: "visible", timeout: MONOTRIBUTO_TIMEOUTS.CARD });
  } catch {
    return null;
  }

  console.log("[AFIP Monotributo] Tarjeta de Monotributo encontrada");
  return {
    kind: "card",
    click: () => card.click({ timeout: MONOTRIBUTO_TIMEOUTS.CARD }),
  };
}

/**
 * Localiza el resultado de Monotributo en el buscador del portal.
 *
 * @returns null si el buscador no devolvió un resultado de Monotributo.
 */
async function findSearchTrigger(page: Page): Promise<NavigationTrigger | null> {
  console.log("[AFIP Monotributo] Searching for 'Monotributo'...");

  const searchInput = page.locator(SELECTORS.NAVIGATION.SEARCH_INPUT).first();
  await searchInput.waitFor({ state: "visible", timeout: MONOTRIBUTO_TIMEOUTS.SEARCH });
  await searchInput.click({ timeout: MONOTRIBUTO_TIMEOUTS.SEARCH });
  await searchInput.fill("monotributo", { timeout: MONOTRIBUTO_TIMEOUTS.SEARCH });
  console.log("[AFIP Monotributo] Typed in search box, waiting for results...");

  await page.waitForTimeout(TIMING.AFTER_CLICK_WAIT);

  // Los resultados son li[role="option"] del typeahead (react-bootstrap-typeahead).
  const monotributoResult = page.locator('li[role="option"]:has-text("Monotributo")').first();

  try {
    await monotributoResult.waitFor({ state: "visible", timeout: MONOTRIBUTO_TIMEOUTS.SEARCH });
    console.log("[AFIP Monotributo] Found Monotributo search result");
  } catch {
    console.log("[AFIP Monotributo] No Monotributo result found in search");
    return null;
  }

  return {
    kind: "search",
    click: () => monotributoResult.click({ timeout: MONOTRIBUTO_TIMEOUTS.SEARCH }),
  };
}

/**
 * Espera el resultado del click: pestaña nueva o navegación en la misma.
 *
 * @returns La página de Monotributo, o null si el click no produjo nada.
 */
async function waitForLanding(
  page: Page,
  newPagePromise: Promise<Page | null>
): Promise<Page | null> {
  console.log("[AFIP Monotributo] Waiting for Monotributo portal...");

  const newPage = await newPagePromise;

  if (newPage) {
    console.log("[AFIP Monotributo] ✅ New tab opened!");
    return newPage;
  }

  // Sin pestaña nueva: ARCA pudo haber navegado en la misma. Se espera por la
  // URL, no por el contenido: si el click no navegó a ningún lado, esperar el
  // jumbotron es tiempo tirado (y en prod fueron 60s de stream mudo).
  console.log("[AFIP Monotributo] No new tab, checking current page...");
  await page
    .waitForURL((url) => isMonotributoUrl(url.toString()), {
      timeout: MONOTRIBUTO_TIMEOUTS.SAME_TAB_NAV,
    })
    .catch(() => {});

  return isMonotributoUrl(page.url()) ? page : null;
}

/**
 * Navigates to Monotributo portal, reintentando el disparador.
 *
 * Ni la tarjeta ni el resultado del buscador son links: son `<a>` sin href con
 * un handler onClick de React. Un click que cae mientras React re-renderiza no
 * hace nada — no navega, no abre pestaña y no tira error — así que el único
 * modo de saber si funcionó es verificar el efecto y reintentar. Es el mismo
 * patrón que ya usa `navigateToComprobantes` para el portal de comprobantes.
 *
 * @param deadline - Momento (epoch ms) a partir del cual no se arrancan más intentos.
 */
async function navigateToMonotributo(
  page: Page,
  context: BrowserContext,
  deadline: number
): Promise<Page | null> {
  // Una tarjeta cuyo click no hizo nada no se reintenta: la premisa del fix es
  // justamente que ese onClick se puede perder, así que insistir con el mismo
  // elemento no prueba nada nuevo. El segundo intento va por el buscador.
  let cardExhausted = false;

  for (let attempt = 1; attempt <= MAX_NAV_ATTEMPTS; attempt++) {
    try {
      // La tarjeta no depende de resultados asíncronos, así que va primero.
      // Si no está (la sección es personalizada), se usa el buscador.
      const trigger =
        (cardExhausted ? null : await findServiceCardTrigger(page)) ??
        (await findSearchTrigger(page));

      if (trigger) {
        // Fuera de presupuesto no se clickea: un click huérfano navegaría la
        // página compartida por debajo del scrape de empresas, que no es
        // opcional. Ver withTimeout en el caller.
        if (Date.now() >= deadline) {
          console.log("[AFIP Monotributo] Presupuesto agotado antes del click, corto acá");
          break;
        }

        // El listener se arma acá, con el trigger ya localizado: su timeout
        // corto cuenta sólo el tiempo que ARCA tarda en abrir la pestaña.
        const newPagePromise = context
          .waitForEvent("page", { timeout: MONOTRIBUTO_TIMEOUTS.NEW_TAB })
          .catch(() => null);

        await trigger.click();
        if (trigger.kind === "card") cardExhausted = true;
        console.log(`[AFIP Monotributo] Click en el trigger (${trigger.kind})`);

        const landed = await waitForLanding(page, newPagePromise);
        if (landed) {
          await waitForMonotributoReady(landed);
          return landed;
        }
      }

      console.log(
        `[AFIP Monotributo] Intento ${attempt}/${MAX_NAV_ATTEMPTS} sin navegación (URL: ${page.url()})`
      );
    } catch (error) {
      console.error(`[AFIP Monotributo] Intento ${attempt} falló:`, error);
    }

    const isLastAttempt = attempt === MAX_NAV_ATTEMPTS;
    const remaining = deadline - Date.now();

    if (isLastAttempt || remaining < RETRY_MIN_REMAINING_MS) {
      if (!isLastAttempt) {
        console.log("[AFIP Monotributo] Sin presupuesto para otro intento, corto acá");
      }
      break;
    }

    // El click pudo haber dejado el portal en un estado raro (menú abierto,
    // navegación a medias). Se vuelve a una base conocida antes de reintentar.
    await page
      .goto(URLS.PORTAL, { waitUntil: "domcontentloaded" })
      .catch(() => console.warn("[AFIP Monotributo] No pude volver al portal para reintentar"));
  }

  return null;
}

/**
 * Extracts Monotributo information from the portal page.
 * 
 * Expected HTML structure:
 * <h2 class="h3 m-b-2">JUAN CARLOS PEREZ</h2>
 * <p class="lead m-b-0"><strong>CUIT</strong> 20-30123456-3</p>
 * <p class="lead"><strong>Categoría H LOCACIONES DE SERVICIOS</strong></p>
 * <div id="divProxRecategorizacion">Próximo período de recategorización: <strong>Enero 2026</strong></div>
 *
 * Verificado contra monotributo.afip.gob.ar/app/Inicio.aspx el 05/08/2026: los
 * selectores del nombre, CUIT y categoría siguen vigentes. El de la próxima
 * recategorización cambia de forma según el momento (ver pickProximaRecategorizacion).
 */
async function extractMonotributoInfo(page: Page): Promise<MonotributoAFIPInfo | null> {
  console.log("[AFIP Monotributo] Extracting info from page...");

  try {
    // Wait for the jumbotron body to be visible
    await page.waitForSelector(".jumbotron_body", { timeout: MONOTRIBUTO_TIMEOUTS.READY }).catch(() => {
      console.log("[AFIP Monotributo] jumbotron_body not found, trying alternative selectors...");
    });

    // Extract name
    const nombreElement = page.locator(".jumbotron_body h2.h3").first();
    const nombreCompleto = await nombreElement.textContent({ timeout: READ_TIMEOUT }).catch(() => null);

    if (!nombreCompleto) {
      console.log("[AFIP Monotributo] Could not find name element");
      return null;
    }

    // Extract CUIT
    const cuitElement = page.locator(".jumbotron_body p.lead").first();
    const cuitText = await cuitElement.textContent({ timeout: READ_TIMEOUT }).catch(() => null);

    // Parse CUIT (format: "CUIT 20-30123456-3")
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
      const text = await categoriaElements.nth(i).textContent({ timeout: READ_TIMEOUT }).catch(() => null);

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
        }
      }
    }

    if (!categoria) {
      console.log("[AFIP Monotributo] Could not find category");
      return null;
    }

    // Extract próxima recategorización.
    // El <strong> sólo existe fuera de la ventana de recategorización; con la
    // ventana abierta ARCA pone texto plano ("Podés recategorizarte hasta el
    // 05/08/2026."), así que se leen los dos y decide el parser.
    const recategDiv = page.locator("#divProxRecategorizacion").first();
    const strongText = await recategDiv
      .locator("strong")
      .first()
      .textContent({ timeout: READ_TIMEOUT })
      .catch(() => null);
    const divText = await recategDiv.textContent({ timeout: READ_TIMEOUT }).catch(() => null);
    const proximaRecategorizacion = pickProximaRecategorizacion(strongText, divText);

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

