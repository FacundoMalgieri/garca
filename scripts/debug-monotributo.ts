/**
 * Debug MANUAL del step de Monotributo — solo lectura, no emite ni modifica nada.
 *
 * Abre Chromium headed en el login de ARCA y espera que vos te loguees a mano
 * (el script nunca lee ni escribe el campo de clave). Cuando detecta el portal,
 * corre el código real de `scrapeMonotributoInfo` para ver si sigue funcionando
 * y, pase lo que pase, volcá el DOM de la página de Monotributo para comparar
 * contra los selectores que espera el scraper.
 *
 * Uso:
 *   npx tsx scripts/debug-monotributo.ts
 *
 * Salida: JSON + HTML + screenshot en OUT_DIR (por defecto tmp/debug-monotributo,
 * que está gitignoreado: el HTML volcado incluye nombre, CUIT y sesión).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page } from "playwright";

import { SELECTORS, URLS, USER_AGENT } from "../src/lib/scrapers/afip/constants";
import { scrapeMonotributoInfo } from "../src/lib/scrapers/afip/steps/monotributo";

const OUT_DIR = process.env.OUT_DIR || join(process.cwd(), "tmp", "debug-monotributo");
/** Perfil de Chromium persistente (gitignoreado): guarda la sesión de ARCA entre corridas. */
const PROFILE_DIR = process.env.PROFILE_DIR || join(process.cwd(), "tmp", "debug-monotributo-profile");
const LOGIN_WAIT_MS = Number(process.env.LOGIN_WAIT_MS || 10 * 60 * 1000);
const HOLD_MS = Number(process.env.HOLD_MS || 15 * 60 * 1000);

const log = (...args: unknown[]) => console.log("[debug]", ...args);

/** Espera a que el usuario complete el login: la URL deja de ser la de auth. */
async function waitForManualLogin(page: Page): Promise<boolean> {
  const deadline = Date.now() + LOGIN_WAIT_MS;
  while (Date.now() < deadline) {
    const url = page.url();
    if (!url.includes("auth.afip.gob.ar") && !url.includes("login")) {
      log("Login detectado. URL:", url);
      return true;
    }
    await page.waitForTimeout(2000);
  }
  return false;
}

/**
 * Volcado del DOM como STRING a propósito: tsx/esbuild reescribe las funciones
 * del closure con su helper `__name`, que no existe en el browser y tira
 * "ReferenceError: __name is not defined" dentro de page.evaluate.
 */
const DUMP_SCRIPT = `(() => {
  const text = function (el) { return el && el.textContent ? el.textContent.replace(/\\s+/g, " ").trim() : null; };
  const desc = function (el) {
    return { tag: el.tagName.toLowerCase(), id: el.id, class: String(el.className || ""), text: text(el) };
  };

  return {
    url: location.href,
    title: document.title,
    esperados: {
      ".jumbotron_body": !!document.querySelector(".jumbotron_body"),
      ".jumbotron_body h2.h3": text(document.querySelector(".jumbotron_body h2.h3")),
      ".jumbotron_body p.lead": Array.prototype.map.call(
        document.querySelectorAll(".jumbotron_body p.lead"), text
      ),
      "#divProxRecategorizacion strong": text(document.querySelector("#divProxRecategorizacion strong")),
    },
    encontrado: {
      headings: Array.prototype.map.call(document.querySelectorAll("h1,h2,h3,h4"), desc),
      conCategoria: Array.prototype.filter
        .call(document.querySelectorAll("*"), function (el) {
          return el.children.length === 0 && /categor[íi]a/i.test(el.textContent || "");
        })
        .slice(0, 15)
        .map(desc),
      conRecategorizacion: Array.prototype.map.call(
        document.querySelectorAll("[id*='ecateg'], [class*='ecateg']"), desc
      ),
      clasesJumbotron: Array.prototype.map.call(
        document.querySelectorAll("[class*='jumbotron']"), function (el) { return String(el.className || ""); }
      ),
      pLead: Array.prototype.map.call(document.querySelectorAll("p.lead"), text),
      iframes: Array.prototype.map.call(document.querySelectorAll("iframe"), function (el) { return el.src; }),
    },
  };
})()`;

/** Vuelca todo lo que el scraper mira, más contexto para ver qué se movió. */
async function dumpPage(page: Page, tag: string) {
  const info = (await page.evaluate(DUMP_SCRIPT)) as {
    url: string;
    esperados: Record<string, unknown>;
    encontrado: Record<string, unknown>;
  };

  writeFileSync(join(OUT_DIR, `${tag}.json`), JSON.stringify(info, null, 2));
  writeFileSync(join(OUT_DIR, `${tag}.html`), await page.content());
  await page.screenshot({ path: join(OUT_DIR, `${tag}.png`), fullPage: true }).catch(() => {});
  log(`Volcado ${tag}:`, JSON.stringify(info.esperados, null, 2));
  return info;
}

/**
 * Navega a Monotributo con los mismos selectores que el step pero SIN extraer
 * ni cerrar la pestaña, para poder volcar el DOM real (el step la cierra cuando
 * tiene éxito, así que en el modo normal no se puede inspeccionar).
 */
async function navigateAndDump(page: Page, context: import("playwright").BrowserContext) {
  const searchInput = page.locator(SELECTORS.NAVIGATION.SEARCH_INPUT).first();
  await searchInput.waitFor({ state: "visible", timeout: 15_000 });
  await searchInput.click();
  await searchInput.fill("monotributo");
  await page.waitForTimeout(1500);

  const result = page.locator('li[role="option"]:has-text("Monotributo")').first();
  await result.waitFor({ state: "visible", timeout: 15_000 });

  const newPagePromise = context.waitForEvent("page", { timeout: 30_000 }).catch(() => null);
  await result.click();
  const newPage = await newPagePromise;
  const target = newPage ?? page;

  await target.waitForLoadState("domcontentloaded").catch(() => {});
  await target.waitForTimeout(4000);
  log("Página de Monotributo:", target.url());
  await safeDump(target, "4-monotributo-dom");
}

/**
 * Reproduce el modo de producción (headless, contexto limpio) reusando la sesión
 * ya abierta via storageState, así el login manual se hace una sola vez.
 * Responde si el step falla sistemáticamente en headless aunque ande headed.
 */
async function runHeadlessPass(storageStatePath: string) {
  log("── Segunda pasada: HEADLESS con la misma sesión (como prod) ──");
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ userAgent: USER_AGENT, storageState: storageStatePath });
    const page = await ctx.newPage();
    await page.goto("https://portalcf.cloud.afip.gob.ar/portal/app/", { waitUntil: "domcontentloaded" });

    if (page.url().includes("auth.afip.gob.ar")) {
      log("⚠️ La sesión no viajó al contexto headless (ARCA la rechazó). No concluyente.");
      return null;
    }

    await page.waitForLoadState("networkidle").catch(() => {});
    const t0 = Date.now();
    const result = await scrapeMonotributoInfo(page, ctx);
    log(`Resultado headless (${Date.now() - t0}ms):`, JSON.stringify(result, null, 2));
    writeFileSync(join(OUT_DIR, "5-resultado-headless.json"), JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    log("ERROR en la pasada headless:", e instanceof Error ? e.stack : e);
    return null;
  } finally {
    await browser.close().catch(() => {});
  }
}

/** Un volcado que falla nunca debe matar la sesión (login manual = caro). */
async function safeDump(page: Page, tag: string) {
  try {
    return await dumpPage(page, tag);
  } catch (e) {
    log(`⚠️ Falló el volcado ${tag}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

const main = async () => {
  mkdirSync(OUT_DIR, { recursive: true });

  // Perfil persistente: la sesión de ARCA sobrevive entre corridas, así no hay
  // que volver a tipear la clave fiscal en cada iteración del debug.
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: process.env.HEADLESS === "1",
    userAgent: USER_AGENT,
    viewport: null,
    args: ["--start-maximized"],
  });

  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await page.goto(URLS.LOGIN, { waitUntil: "domcontentloaded" });

    const enLogin = page.url().includes("auth.afip.gob.ar") || page.url().includes("login");

    // En headless no hay nadie que pueda tipear la clave: si la sesión del
    // perfil expiró, cortar en el acto en vez de esperar un login imposible.
    if (enLogin && process.env.HEADLESS === "1") {
      log("❌ Sesión del perfil expirada y estamos en headless: no hay forma de loguearse. Abortando.");
      return;
    }

    if (enLogin) {
      log("👉 Logueate en la ventana de Chromium (CUIT + clave fiscal). Espero hasta 10 min.");
    } else {
      log("Sesión previa reutilizada del perfil, no hace falta loguearse.");
    }

    if (!(await waitForManualLogin(page))) {
      log("❌ No detecté login a tiempo.");
      return;
    }

    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    // Snapshot de la sesión para poder repetir el flujo en headless (modo prod)
    // sin pedir la clave otra vez.
    const storageStatePath = join(OUT_DIR, "session.json");
    await context.storageState({ path: storageStatePath }).catch(() => {});

    // ¿Sigue existiendo el buscador del portal que usa el step?
    const searchCount = await page.locator(SELECTORS.NAVIGATION.SEARCH_INPUT).count();
    log("Buscador del portal encontrado:", searchCount, `(selector: ${SELECTORS.NAVIGATION.SEARCH_INPUT})`);
    await safeDump(page, "1-portal");

    // MODE=dump: solo navegar y volcar el DOM de Monotributo, sin correr el step
    if (process.env.MODE === "dump") {
      await navigateAndDump(page, context);
      log(`Listo (modo dump). Archivos en ${OUT_DIR}.`);
      await page.waitForTimeout(HOLD_MS).catch(() => {});
      await context.close().catch(() => {});
      return;
    }

    // Código real del scraper
    log("── Corriendo scrapeMonotributoInfo() real ──");
    const result = await scrapeMonotributoInfo(page, context);
    log("Resultado:", JSON.stringify(result, null, 2));
    writeFileSync(join(OUT_DIR, "3-resultado.json"), JSON.stringify(result, null, 2));

    // Si quedó abierta una pestaña de Monotributo, volcarla
    const monoPage = context.pages().find((p) => /monotributo|seti/i.test(p.url()) && p !== page);
    if (monoPage) {
      log("Pestaña de Monotributo abierta, volcando DOM…");
      await safeDump(monoPage, "2-monotributo");
    } else if (/monotributo|seti/i.test(page.url())) {
      await safeDump(page, "2-monotributo");
    } else {
      log("No quedó pestaña de Monotributo abierta (el step la cierra si tuvo éxito).");
      // Reintento de navegación sólo para volcar el DOM del portal de Monotributo
      await safeDump(page, "2b-portal-post-scrape");
    }

    // Misma sesión, ahora headless: es el modo en que corre en producción.
    if (process.env.SKIP_HEADLESS !== "1") {
      await runHeadlessPass(storageStatePath);
    }

    log(`Listo. Archivos en ${OUT_DIR}.`);
  } catch (e) {
    log("ERROR en el flujo:", e instanceof Error ? e.stack : e);
  }

  // La ventana queda abierta para poder mirar a mano lo que haga falta.
  log(`Dejo la ventana abierta ${Math.round(HOLD_MS / 1000)}s (HOLD_MS para cambiarlo).`);
  await page.waitForTimeout(HOLD_MS).catch(() => {});
  await context.close().catch(() => {});
};

main().catch((e) => {
  console.error("[debug] ERROR", e);
  process.exit(1);
});
