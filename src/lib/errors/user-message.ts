/**
 * Traduce códigos de error internos a algo accionable para el usuario.
 *
 * El mensaje crudo del scraper no distingue entre "esto lo arreglás vos
 * recargando" y "esto es ARCA y hay que esperar", y esa diferencia es la única
 * que le importa a alguien parado frente al error.
 */

/** Aviso permanente en el formulario de ingreso. */
export const ARCA_DEPENDENCY_NOTICE =
  "GARCA depende de los servicios de ARCA. Si algo falla, casi siempre es de su lado.";

/**
 * Token de Turnstile vencido o reusado.
 *
 * Es la familia de fallas más común (41 de 77 en 60 días, medido el
 * 05/08/2026) y la única que el usuario resuelve solo: recargando.
 */
const TURNSTILE_MESSAGE =
  "La verificación de seguridad venció. Recargá la página y volvé a intentar.";

/**
 * ARCA no responde.
 *
 * Confirmado el 05/08/2026: monotributo.afip.gob.ar aceptaba la conexión TCP y
 * no respondía nunca, mientras el portal contestaba en 82ms. Recargar no
 * arregla nada acá, así que el mensaje NO lo sugiere. El chiste tiene función:
 * corta en seco la idea de que el usuario escribió mal la clave.
 */
const ARCA_DOWN_MESSAGE =
  "ARCA no está respondiendo. No sos vos, es su sitio: probá de nuevo en unos minutos.";

/**
 * Se cortó la conexión con nuestro server (el fetch tiró TypeError).
 *
 * Es el síntoma que originó el incidente. El mensaje crudo del browser
 * ("Failed to fetch", "Load failed") está en inglés y no dice nada.
 */
const CONNECTION_LOST_MESSAGE =
  "Se cortó la conexión con el servidor. Revisá tu internet y volvé a intentar.";

/** Códigos donde el mensaje del scraper ya es el correcto (culpa del usuario o de su cuenta). */
const KEEP_ORIGINAL = new Set(["INVALID_CREDENTIALS", "ACCOUNT_BLOCKED", "CAPTCHA_REQUIRED"]);

/**
 * Turnstile mal configurado en el server (faltan claves): 503, no es del
 * usuario y recargar no lo arregla. Su mensaje original ya dice qué hacer.
 */
const TURNSTILE_SERVER_MISCONFIG = "TURNSTILE_NOT_CONFIGURED";

/** Códigos que significan "ARCA está caído o lento". */
const ARCA_DOWN_CODES = new Set(["TIMEOUT", "NAVIGATION_ERROR", "SERVICE_UNAVAILABLE"]);

/** Códigos que significan "se cayó la conexión con GARCA". */
const CONNECTION_LOST_CODES = new Set(["NETWORK", "CLIENT"]);

/**
 * @param error - Mensaje crudo que devolvió el backend.
 * @param errorCode - Código asociado, si lo hay.
 * @returns Mensaje para mostrar, o null si no hay error.
 */
export function getUserFacingError(
  error: string | null | undefined,
  errorCode: string | null | undefined
): string | null {
  // Un código sin mensaje sigue alcanzando para aconsejar: la tabla de /panel
  // llama con error=null y sólo el código.
  if (!error && !errorCode) return null;
  if (!errorCode) return error ?? null;

  // Cloudflare pega su razón al código (TURNSTILE_FAILED_timeout_or_duplicate),
  // así que se matchea por prefijo — salvo el de mala configuración del server,
  // que NO se arregla recargando.
  if (errorCode.startsWith("TURNSTILE")) {
    return errorCode === TURNSTILE_SERVER_MISCONFIG ? (error ?? null) : TURNSTILE_MESSAGE;
  }

  if (KEEP_ORIGINAL.has(errorCode)) return error ?? null;
  if (ARCA_DOWN_CODES.has(errorCode)) return ARCA_DOWN_MESSAGE;
  if (CONNECTION_LOST_CODES.has(errorCode)) return CONNECTION_LOST_MESSAGE;

  return error ?? null;
}
