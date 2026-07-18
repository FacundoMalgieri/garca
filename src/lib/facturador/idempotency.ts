/**
 * Idempotencia de emisión (Contrato A del plan de fixes del facturador).
 *
 * Deduplica confirmaciones de emisión por `idempotencyKey`:
 *   - key nueva      → ejecuta la operación, cachea el resultado.
 *   - key `in-flight`→ devuelve la MISMA promise (doble request concurrente).
 *   - key `done`     → devuelve el resultado cacheado (NO re-emite).
 *
 * ⚠️ Limitación documentada (fuera de alcance esta ronda): en serverless el Map
 * es por-instancia (por-lambda). No cubre cold starts, page reload, ni requests
 * que caigan en otra instancia. Junto con el `idempotencyKey` estable del cliente
 * (que sobrevive los reintentos post-error) esto cubre el caso realista de retry
 * contra el MISMO lambda caliente. La cobertura cross-instance real (Redis/KV)
 * requiere infra externa y queda para más adelante (M5).
 *
 * Si la operación THROWS, la entrada se borra: un throw significa que la emisión
 * falló antes/durante el fill (confirmEmissionFlow NUNCA throw-ea cuando el CAE
 * ya fue asignado — devuelve `cae:""`, ver Contrato B), así que es seguro permitir
 * un reintento genuino con la misma key.
 */

/** TTL de las entradas del store (~10 min). */
export const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

export interface IdempotencyEntry<T> {
  status: "in-flight" | "done";
  promise?: Promise<T>;
  result?: T;
  /** Epoch ms del inicio del request que registró la entrada. */
  ts: number;
}

export interface IdempotencyStore<T> {
  /**
   * Ejecuta `fn` bajo la `key` con semántica de idempotencia.
   * `now` es inyectable para tests (default `Date.now()`).
   */
  run(key: string, fn: () => Promise<T>, now?: number): Promise<T>;
  /** Cantidad de entradas vivas (para tests/introspección). */
  size(): number;
}

/**
 * Crea un store de idempotencia aislado. Puro y testeable: el TTL y el reloj
 * (`now`) son inyectables.
 */
export function createIdempotencyStore<T>(opts: { ttlMs?: number } = {}): IdempotencyStore<T> {
  const ttlMs = opts.ttlMs ?? IDEMPOTENCY_TTL_MS;
  const map = new Map<string, IdempotencyEntry<T>>();

  function cleanup(now: number): void {
    for (const [k, entry] of map) {
      if (now - entry.ts > ttlMs) {
        map.delete(k);
      }
    }
  }

  async function run(key: string, fn: () => Promise<T>, now: number = Date.now()): Promise<T> {
    cleanup(now);

    const existing = map.get(key);
    if (existing) {
      if (existing.status === "done") {
        return existing.result as T;
      }
      if (existing.promise) {
        return existing.promise;
      }
    }

    const promise = (async () => {
      try {
        const result = await fn();
        map.set(key, { status: "done", result, ts: now });
        return result;
      } catch (err) {
        // Falla genuina → borrar para permitir un reintento real con la misma key.
        map.delete(key);
        throw err;
      }
    })();

    map.set(key, { status: "in-flight", promise, ts: now });
    return promise;
  }

  return { run, size: () => map.size };
}
