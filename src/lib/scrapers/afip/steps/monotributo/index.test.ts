import { describe, expect, it, vi } from "vitest";

import { MONOTRIBUTO_TIMEOUTS } from "../../constants";
import { MAX_NAV_ATTEMPTS, scrapeMonotributoInfo } from "./index";

/**
 * Fakes mínimos de Playwright.
 *
 * El step de Monotributo no se testea contra ARCA real (ver vitest.config.ts),
 * pero sí se testean sus decisiones de navegación, que son la fuente de la
 * flakiness observada en prod el 05/08/2026:
 *
 * - El portal no expone links: tanto la tarjeta de "Más utilizados" como el
 *   resultado del buscador son `<a>` SIN href, con handler onClick de React. Un
 *   click que cae mientras React re-renderiza no hace absolutamente nada: ni
 *   navega, ni abre pestaña, ni tira error.
 * - Sin reintento, ese click perdido terminaba el step. Encima las esperas eran
 *   de 60s cada una, así que el stream SSE quedaba 120s mudo y Cloudflare (que
 *   corta a los ~100s) mataba la conexión: el usuario veía un error de red.
 */
const PORTAL_URL = "https://portalcf.cloud.afip.gob.ar/portal/app/";
const MONOTRIBUTO_URL = "https://monotributo.afip.gob.ar/app/Inicio.aspx";

interface FakePageOptions {
  /** Selectores que NO existen en la página (su waitFor rechaza). */
  missingSelectors?: string[];
  /** Nº de click a partir del cual la navegación realmente ocurre. */
  navigatesOnClick?: number;
}

function createFakePage(options: FakePageOptions = {}) {
  const missing = options.missingSelectors ?? [];
  let currentUrl = PORTAL_URL;
  let clicks = 0;
  /** Secuencia de operaciones, para verificar CUÁNDO se arma el listener. */
  const sequence: string[] = [];

  const locators: { selector: string; waitFor: ReturnType<typeof vi.fn>; click: ReturnType<typeof vi.fn> }[] = [];

  const page = {
    url: () => currentUrl,
    locator: vi.fn((selector: string) => {
      const isMissing = missing.some((fragment) => selector.includes(fragment));
      // Sólo la tarjeta y el resultado del buscador disparan navegación.
      // Clickear el input del buscador no cuenta como intento.
      const isTrigger = selector.includes("serviciosMasUtilizados") || selector.includes("option");
      const locator = {
        first: () => locator,
        nth: () => locator,
        locator: () => locator,
        count: vi.fn().mockResolvedValue(0),
        textContent: vi.fn().mockResolvedValue(null),
        fill: vi.fn().mockResolvedValue(undefined),
        waitFor: vi.fn().mockImplementation(() => {
          if (isTrigger) sequence.push("trigger:waitFor");
          return isMissing ? Promise.reject(new Error("no existe")) : Promise.resolve(undefined);
        }),
        click: vi.fn().mockImplementation(() => {
          if (isMissing) return Promise.reject(new Error("no existe"));
          if (isTrigger) {
            sequence.push("trigger:click");
            clicks += 1;
            if (options.navigatesOnClick && clicks >= options.navigatesOnClick) {
              currentUrl = MONOTRIBUTO_URL;
            }
          }
          return Promise.resolve(undefined);
        }),
      };
      locators.push({ selector, waitFor: locator.waitFor, click: locator.click });
      return locator;
    }),
    goto: vi.fn().mockImplementation((url: string) => {
      currentUrl = url;
      return Promise.resolve(null);
    }),
    waitForTimeout: vi.fn().mockResolvedValue(undefined),
    waitForLoadState: vi.fn().mockResolvedValue(undefined),
    waitForSelector: vi.fn().mockResolvedValue(undefined),
    waitForURL: vi.fn().mockImplementation((predicate: (url: URL) => boolean) => {
      if (predicate(new URL(currentUrl))) return Promise.resolve(undefined);
      return Promise.reject(new Error("Timeout esperando la URL"));
    }),
    close: vi.fn().mockResolvedValue(undefined),
  };

  return {
    page,
    locators,
    sequence,
    get clicks() {
      return clicks;
    },
  };
}

/**
 * @param newPage - Página que devuelve el evento "page" (pestaña nueva). null =
 *   nunca se abre pestaña.
 * @param sequence - Log compartido con la página, para verificar el orden.
 * @param probeFails - true simula el host de Monotributo colgado: el goto de la
 *   sonda nunca resuelve (en la vida real, timeout).
 */
function createFakeContext(newPage: unknown = null, sequence: string[] = [], probeFails = false) {
  const probePage = {
    goto: vi.fn().mockImplementation(() => {
      sequence.push("probe");
      return probeFails ? Promise.reject(new Error("Timeout")) : Promise.resolve(null);
    }),
    close: vi.fn().mockResolvedValue(undefined),
  };

  return {
    probePage,
    newPage: vi.fn().mockResolvedValue(probePage),
    waitForEvent: vi.fn().mockImplementation(() => {
      sequence.push("armListener");
      return newPage ? Promise.resolve(newPage) : Promise.reject(new Error("sin pestaña nueva"));
    }),
  };
}

/** Todos los timeouts pedidos a Playwright durante la corrida. */
function collectTimeouts(fake: ReturnType<typeof createFakePage>, context: ReturnType<typeof createFakeContext>) {
  const timeouts: number[] = [];
  for (const locator of fake.locators) {
    for (const call of [...locator.waitFor.mock.calls, ...locator.click.mock.calls]) {
      const options = call[0] as { timeout?: number } | undefined;
      if (options?.timeout) timeouts.push(options.timeout);
    }
  }
  for (const call of fake.page.waitForURL.mock.calls) {
    const options = call[1] as { timeout?: number } | undefined;
    if (options?.timeout) timeouts.push(options.timeout);
  }
  for (const call of fake.page.waitForSelector.mock.calls) {
    const options = call[1] as { timeout?: number } | undefined;
    if (options?.timeout) timeouts.push(options.timeout);
  }
  for (const call of context.waitForEvent.mock.calls) {
    const options = call[1] as { timeout?: number } | undefined;
    if (options?.timeout) timeouts.push(options.timeout);
  }
  return timeouts;
}

describe("scrapeMonotributoInfo", () => {
  it("should be defined", () => {
    expect(scrapeMonotributoInfo).toBeDefined();
  });

  it("reintenta cuando el click no produjo ninguna navegación", async () => {
    // El caso de prod: el <a> no tiene href y el onClick de React se pierde.
    // El primer click no hace nada; el segundo sí.
    const fake = createFakePage({ navigatesOnClick: 2 });
    const context = createFakeContext();

    await scrapeMonotributoInfo(fake.page as never, context as never);

    expect(fake.clicks).toBeGreaterThanOrEqual(2);
    expect(fake.page.url()).toBe(MONOTRIBUTO_URL);
  });

  it("no clickea nada si el host de Monotributo no responde", async () => {
    // El modo de falla real (05/08 y 11/08 de 2026): monotributo.afip.gob.ar
    // acepta la conexión y no contesta nunca. Los triggers del portal entonces
    // no navegan a ningún lado y el step quemaba 32s clickeando al vacío.
    const fake = createFakePage({ navigatesOnClick: 1 });
    const context = createFakeContext(null, fake.sequence, true);

    const result = await scrapeMonotributoInfo(fake.page as never, context as never);

    expect(result.success).toBe(false);
    expect(result.info).toBeNull();
    expect(fake.clicks).toBe(0);
  });

  it("sondea el host antes de clickear el portal", async () => {
    const fake = createFakePage({ navigatesOnClick: 1 });
    const context = createFakeContext(null, fake.sequence);

    await scrapeMonotributoInfo(fake.page as never, context as never);

    expect(fake.sequence.indexOf("probe")).toBeGreaterThanOrEqual(0);
    expect(fake.sequence.indexOf("probe")).toBeLessThan(fake.sequence.indexOf("trigger:click"));
  });

  it("cierra la pestaña de la sonda incluso cuando el host no responde", async () => {
    // Una pestaña huérfana por consulta se acumula en el browser del server.
    const fake = createFakePage();
    const context = createFakeContext(null, fake.sequence, true);

    await scrapeMonotributoInfo(fake.page as never, context as never);

    expect(context.probePage.close).toHaveBeenCalled();
  });

  it("corta después de un número acotado de intentos", async () => {
    // Nunca navega: el step tiene que rendirse, no reintentar para siempre.
    const fake = createFakePage();
    const context = createFakeContext();

    const result = await scrapeMonotributoInfo(fake.page as never, context as never);

    expect(result.success).toBe(false);
    expect(result.info).toBeNull();
    // Exacto, no "a lo sumo": un regreso a 3 intentos tiene que romper el test.
    expect(fake.clicks).toBe(MAX_NAV_ATTEMPTS);
  });

  it("no espera el jumbotron cuando la navegación nunca ocurrió", async () => {
    const fake = createFakePage();
    const context = createFakeContext();

    await scrapeMonotributoInfo(fake.page as never, context as never);

    expect(fake.page.waitForSelector).not.toHaveBeenCalled();
  });

  it("usa la tarjeta de 'Más utilizados' antes que el buscador", async () => {
    // La tarjeta no depende de resultados asíncronos del typeahead, así que es
    // el disparador con menos partes móviles.
    const fake = createFakePage({ navigatesOnClick: 1 });
    const context = createFakeContext();

    await scrapeMonotributoInfo(fake.page as never, context as never);

    const usados = fake.locators.map((locator) => locator.selector);
    expect(usados.some((selector) => selector.includes("serviciosMasUtilizados"))).toBe(true);
    expect(usados.some((selector) => selector.includes("buscadorInput"))).toBe(false);
  });

  it("cae al buscador cuando la tarjeta no está en el portal", async () => {
    // "Más utilizados" es personalizado: puede no incluir Monotributo.
    const fake = createFakePage({
      missingSelectors: ["serviciosMasUtilizados"],
      navigatesOnClick: 1,
    });
    const context = createFakeContext(null, fake.sequence);

    await scrapeMonotributoInfo(fake.page as never, context as never);

    const usados = fake.locators.map((locator) => locator.selector);
    expect(usados.some((selector) => selector.includes("buscadorInput"))).toBe(true);
    // No alcanza con que se haya tipeado en el buscador: tiene que haber
    // clickeado el resultado y llegado a destino.
    expect(fake.clicks).toBeGreaterThan(0);
    expect(fake.page.url()).toBe(MONOTRIBUTO_URL);
  });

  it("mantiene cada espera individual lejos del corte de Cloudflare", async () => {
    const fake = createFakePage();
    const context = createFakeContext();

    await scrapeMonotributoInfo(fake.page as never, context as never);

    const timeouts = collectTimeouts(fake, context);
    expect(timeouts.length).toBeGreaterThan(0);
    for (const timeout of timeouts) {
      expect(timeout).toBeLessThanOrEqual(15_000);
    }
  });

  it("mantiene el presupuesto del step por debajo del corte de Cloudflare", () => {
    expect(MONOTRIBUTO_TIMEOUTS.STEP_BUDGET).toBeLessThan(100_000);
  });

  it("arma el listener de pestaña nueva JUSTO antes del click, no antes de buscar el trigger", async () => {
    // El listener tiene su propio timeout corto (NEW_TAB). Si se arma antes de
    // localizar el trigger, todo lo que tarde esa búsqueda se le come el
    // presupuesto: con la tarjeta ausente son 5s de CARD + 1.5s del typeahead,
    // así que el listener de 6s ya venció cuando por fin se clickea y la
    // pestaña nueva —el camino feliz— queda sin detectar.
    const fake = createFakePage({ missingSelectors: ["serviciosMasUtilizados"] });
    const context = createFakeContext(null, fake.sequence);

    await scrapeMonotributoInfo(fake.page as never, context as never);

    const armed = fake.sequence.indexOf("armListener");
    const click = fake.sequence.indexOf("trigger:click");
    const lastWaitBeforeClick = fake.sequence.lastIndexOf("trigger:waitFor", click);

    expect(armed).toBeGreaterThan(-1);
    expect(click).toBeGreaterThan(-1);
    expect(armed).toBeGreaterThan(lastWaitBeforeClick);
    expect(armed).toBeLessThan(click);
  });

  it("usa la pestaña nueva cuando ARCA la abre", async () => {
    // El camino feliz documentado ("✅ New tab opened!"). El fake anterior
    // siempre rechazaba el evento, así que esta rama no se ejercitaba.
    const fake = createFakePage();
    const nueva = createFakePage();
    const context = createFakeContext(nueva.page, fake.sequence);

    await scrapeMonotributoInfo(fake.page as never, context as never);

    expect(nueva.page.waitForSelector).toHaveBeenCalled();
  });

  it("no insiste con la tarjeta si su click no hizo nada: cae al buscador", async () => {
    // La premisa del fix es que el <a> no tiene href y el onClick se puede
    // perder. Reintentar la MISMA tarjeta dos veces no prueba nada nuevo.
    const fake = createFakePage();
    const context = createFakeContext(null, fake.sequence);

    await scrapeMonotributoInfo(fake.page as never, context as never);

    const usados = fake.locators.map((locator) => locator.selector);
    expect(usados.some((selector) => selector.includes("serviciosMasUtilizados"))).toBe(true);
    expect(usados.some((selector) => selector.includes("buscadorInput"))).toBe(true);
  });

  it("no clickea nada una vez agotado el presupuesto del step", async () => {
    // El click huérfano de un intento fuera de presupuesto navegaría la página
    // compartida por debajo del scrape de empresas, que NO es opcional.
    const fake = createFakePage();
    const context = createFakeContext(null, fake.sequence);

    await scrapeMonotributoInfo(fake.page as never, context as never, Date.now() - 1);

    expect(fake.clicks).toBe(0);
  });
});
