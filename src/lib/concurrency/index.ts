/**
 * Simple in-memory concurrency limiter for Playwright scrapers.
 *
 * Limits the number of concurrent browser instances to prevent
 * memory exhaustion. Each Chromium instance uses ~150-200MB RAM.
 */

const MAX_CONCURRENT_SCRAPERS = 2;

// How long to wait before checking again (ms)
const POLL_INTERVAL = 500;

// Maximum time to wait in queue before timing out (ms)
const MAX_QUEUE_WAIT = 60000; // 60 seconds

/**
 * Presupuesto de tiempo por slot.
 *
 * El slot se libera en el `finally` de `withConcurrencyLimit`, o sea sólo cuando
 * la función envuelta termina. Un `await` colgado adentro de Playwright lo
 * retiene para siempre: el contador es memoria del proceso y no se resetea. El
 * 2026-09-17 eso dejó los 2 slots tomados sin nada corriendo y toda consulta de
 * facturas murió con "El servidor está ocupado" hasta reiniciar el contenedor.
 *
 * El número acota un cuelgue infinito, no una demora: no hay ninguna medición de
 * un scrape completo en el repo, así que 10 minutos es un techo deliberadamente
 * holgado y no un pronóstico de cuánto tarda el camino feliz. Lo que acota de
 * verdad las esperas individuales son los timeouts de cada step.
 */
export const SLOT_BUDGET = 600_000;

/**
 * Gracia entre abortar la señal y abandonar el slot.
 *
 * El abort es cancelación real: el scraper cierra el browser, las operaciones
 * pendientes de Playwright rechazan y el scrape se desenrolla solo. Pero
 * `browser.close()` también puede colgarse, así que el slot no puede quedar
 * atado a que eso funcione.
 */
export const SLOT_KILL_GRACE = 30_000;

/**
 * El trabajo se pasó del presupuesto y no se desenrolló tras el abort.
 *
 * Es distinto de un fallo del scrape: el trabajo **sigue corriendo**. Quien lo
 * reciba no puede asumir que la operación no ocurrió — `createIdempotencyStore`
 * depende de esta distinción para no borrar una emisión en vuelo y dejar que un
 * reintento la duplique.
 */
export class SlotAbandonedError extends Error {
  constructor() {
    super("El scrape excedió su presupuesto de tiempo y fue abandonado.");
    this.name = "SlotAbandonedError";
  }
}

// Current active scraper count
let activeScrapers = 0;

/**
 * Slots cuyo trabajo se abandonó y sigue vivo.
 *
 * Cada uno es, muy probablemente, un Chromium que no se pudo cerrar. Restan
 * capacidad mientras su promise siga pendiente: sin esto el limitador seguiría
 * admitiendo de a 2 mientras los huérfanos se acumulan, y el contenedor termina
 * por OOM — cambiando un "servidor ocupado" estable por una caída.
 */
let orphanedScrapers = 0;

// Queue for waiting requests
let waitingCount = 0;

/**
 * Gets current concurrency stats.
 */
export function getConcurrencyStats() {
  return {
    active: activeScrapers,
    orphaned: orphanedScrapers,
    waiting: waitingCount,
    max: MAX_CONCURRENT_SCRAPERS,
    available: Math.max(0, MAX_CONCURRENT_SCRAPERS - activeScrapers - orphanedScrapers),
  };
}

/**
 * Resetea el estado del limitador. **Sólo para tests.**
 *
 * Los contadores son de módulo y sobreviven entre casos: sin esto, un test que
 * deja un slot tomado hace fallar a los siguientes por timeout en vez de por
 * assertion, y la causa real queda enterrada.
 */
export function __resetConcurrencyForTests(): void {
  activeScrapers = 0;
  orphanedScrapers = 0;
  waitingCount = 0;
}

/**
 * Acquires a slot for running a scraper.
 * Waits if all slots are occupied.
 *
 * @throws Error if wait time exceeds MAX_QUEUE_WAIT
 */
async function acquireSlot(): Promise<void> {
  const startTime = Date.now();
  let queued = false;

  try {
    while (activeScrapers + orphanedScrapers >= MAX_CONCURRENT_SCRAPERS) {
      // Check for timeout
      if (Date.now() - startTime > MAX_QUEUE_WAIT) {
        throw new Error(
          `El servidor está ocupado. Por favor, intentá de nuevo en unos segundos. ` +
          `(${waitingCount} solicitudes en espera)`
        );
      }

      // Una línea por request encolado, no una cada 500ms. El log anterior
      // escribía 2 líneas/seg por waiter y tapaba todo lo anterior: el
      // 2026-09-17 no se pudo ver quién había tomado los slots porque
      // `readLogs` devuelve las últimas ~100 líneas y eran todas del poller.
      if (!queued) {
        queued = true;
        waitingCount++;
        console.log(
          `[Concurrency] En cola (${activeScrapers}/${MAX_CONCURRENT_SCRAPERS} activos, ` +
          `${orphanedScrapers} abandonados, ${waitingCount} esperando)`
        );
      }

      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  } finally {
    // El contador se lleva al encolar y no alrededor del `await`: antes valía 0
    // justo en el instante del chequeo de timeout, así que el mensaje de error
    // decía siempre "(0 solicitudes en espera)".
    if (queued) waitingCount--;
  }

  activeScrapers++;
  console.log(
    `[Concurrency] Slot tomado (${activeScrapers}/${MAX_CONCURRENT_SCRAPERS} activos)`
  );
}

/**
 * Releases a scraper slot.
 *
 * Loguea cuánto lo tuvo tomado: es una línea por scrape, no por poll, y es
 * exactamente la evidencia que faltó el 2026-09-17 — con los tiempos de retención
 * a la vista se ve de una si un slot se está yendo de presupuesto.
 */
function releaseSlot(heldMs: number): void {
  activeScrapers = Math.max(0, activeScrapers - 1);
  console.log(
    `[Concurrency] Slot liberado tras ${Math.round(heldMs / 1000)}s ` +
    `(${activeScrapers}/${MAX_CONCURRENT_SCRAPERS} activos)`
  );
}

/**
 * Wraps an async function with concurrency limiting.
 * Ensures only MAX_CONCURRENT_SCRAPERS run simultaneously.
 *
 * La función recibe una `AbortSignal` que se dispara a los `SLOT_BUDGET`. Quien
 * la reciba debería usarla para cortar su trabajo — el scraper cierra el
 * browser, y eso hace rechazar toda operación de Playwright pendiente, con lo
 * cual el scrape se desenrolla por su propio `catch`/`finally`. Ignorarla sólo
 * significa que el slot se abandona `SLOT_KILL_GRACE` después en vez de
 * liberarse limpio.
 *
 * @example
 * const result = await withConcurrencyLimit((signal) => {
 *   return scrapeAFIPInvoices(credentials, filters, { signal });
 * });
 */
export async function withConcurrencyLimit<T>(
  fn: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  await acquireSlot();

  const acquiredAt = Date.now();
  const controller = new AbortController();
  let budgetTimer: ReturnType<typeof setTimeout> | undefined;
  let graceTimer: ReturnType<typeof setTimeout> | undefined;

  const work = fn(controller.signal);

  // `Promise.race` le engancha handlers a las dos ramas, así que un rechazo
  // tardío del trabajo abandonado no queda sin manejar.
  const backstop = new Promise<never>((_, reject) => {
    budgetTimer = setTimeout(() => {
      console.warn(
        `[Concurrency] Presupuesto de ${SLOT_BUDGET}ms agotado: abortando el scrape`
      );
      controller.abort();

      graceTimer = setTimeout(() => {
        orphanedScrapers++;
        console.error(
          `[Concurrency] El scrape no se desenrolló tras el abort: se abandona ` +
          `(${orphanedScrapers} abandonados, probablemente otros tantos Chromium vivos). ` +
          `Si este número no baja, el proceso necesita reiniciarse.`
        );

        // Si alguna vez termina, devuelve la capacidad que tenía reservada.
        void work
          .then(
            () => { orphanedScrapers = Math.max(0, orphanedScrapers - 1); },
            () => { orphanedScrapers = Math.max(0, orphanedScrapers - 1); }
          );

        reject(new SlotAbandonedError());
      }, SLOT_KILL_GRACE);
    }, SLOT_BUDGET);
  });

  try {
    return await Promise.race([work, backstop]);
  } finally {
    clearTimeout(budgetTimer);
    clearTimeout(graceTimer);
    releaseSlot(Date.now() - acquiredAt);
  }
}
