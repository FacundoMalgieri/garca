/**
 * Heartbeat para respuestas Server-Sent Events.
 *
 * garca.app está detrás de Cloudflare, que corta una conexión proxeada tras
 * ~100s sin bytes. Los scrapers tienen pasos largos que no emiten eventos (el
 * 05/08/2026 el step de Monotributo estuvo 120s en silencio y Cloudflare mató
 * el stream: el cliente lo vio como un error de red genérico). Un comentario
 * SSE periódico mantiene la conexión viva sin tocar el protocolo de eventos.
 */

/** Intervalo entre pings. Muy por debajo del corte de ~100s de Cloudflare. */
export const SSE_HEARTBEAT_INTERVAL_MS = 15_000;

/**
 * Comentario SSE. El cliente parsea sólo líneas que empiezan con "data: ",
 * así que esto lo ignora sin romper el parseo.
 */
const HEARTBEAT_CHUNK = ": ping\n\n";

/**
 * Arranca un heartbeat sobre un stream SSE.
 *
 * @param send - Escribe un chunk crudo en el stream. Si tira (controller ya
 *   cerrado), el heartbeat se detiene solo.
 * @param intervalMs - Intervalo entre pings.
 * @returns Función para detener el heartbeat. Idempotente.
 */
export function startSseHeartbeat(
  send: (chunk: string) => void,
  intervalMs: number = SSE_HEARTBEAT_INTERVAL_MS
): () => void {
  const timer = setInterval(() => {
    try {
      send(HEARTBEAT_CHUNK);
    } catch {
      clearInterval(timer);
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
