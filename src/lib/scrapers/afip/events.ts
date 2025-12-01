/**
 * Event types for AFIP scraper progress streaming.
 */

export type ScraperEventType =
  | "queue"           // Waiting in queue
  | "start"           // Starting scraper
  | "login"           // Logging into AFIP
  | "navigate"        // Navigating to portal
  | "monotributo"     // Fetching Monotributo info
  | "company"         // Selecting company
  | "filters"         // Applying date filters
  | "extract"         // Extracting invoices
  | "invoice"         // Processing individual invoice
  | "complete"        // Scraping complete
  | "error";          // Error occurred

export interface ScraperEvent {
  type: ScraperEventType;
  message: string;
  progress?: number;      // 0-100
  data?: unknown;         // Additional data (e.g., invoice count)
}

/**
 * Event emitter callback type.
 */
export type EventEmitter = (event: ScraperEvent) => void;

/**
 * Creates a noop emitter for when events aren't needed.
 */
export const noopEmitter: EventEmitter = () => {};

/**
 * Helper to create events with consistent structure.
 */
export function createEvent(
  type: ScraperEventType,
  message: string,
  progress?: number,
  data?: unknown
): ScraperEvent {
  return { type, message, progress, data };
}

// Average time per scraper process in seconds (based on Render logs)
// Companies: ~30s, Invoices: ~60s, Average: ~45s
const AVG_PROCESS_TIME_SECONDS = 45;

/**
 * Formats seconds into a human-readable string.
 */
function formatWaitTime(seconds: number): string {
  if (seconds < 60) {
    return `~${seconds} segundos`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} minuto${minutes > 1 ? "s" : ""}`;
}

/**
 * Predefined events for common scraper steps.
 */
export const SCRAPER_EVENTS = {
  // Queue events with estimated wait time
  queue: (position: number) => {
    const waitTime = position * AVG_PROCESS_TIME_SECONDS;
    const timeStr = formatWaitTime(waitTime);
    return createEvent(
      "queue",
      `En cola (posición ${position}) - Tiempo estimado: ${timeStr}`,
      0,
      { position, estimatedWaitSeconds: waitTime }
    );
  },
  queueWaiting: () =>
    createEvent("queue", "Esperando turno...", 0),
  
  // Start
  start: () => 
    createEvent("start", "Iniciando proceso...", 5),
  
  // Login steps (for companies fetch - progress 0-100)
  loginStart: () => 
    createEvent("login", "Conectando con ARCA...", 10),
  loginCuit: () => 
    createEvent("login", "Ingresando CUIT...", 20),
  loginPassword: () => 
    createEvent("login", "Verificando credenciales...", 40),
  loginSuccess: () => 
    createEvent("login", "Sesión iniciada correctamente", 60),
  
  // Monotributo info fetch (between login and companies)
  monotributoStart: () =>
    createEvent("monotributo", "Consultando información de Monotributo...", 65),
  monotributoFound: (categoria: string) =>
    createEvent("monotributo", `Categoría actual: ${categoria}`, 75, { categoria }),
  monotributoNotFound: () =>
    createEvent("monotributo", "No se encontró información de Monotributo", 75),
  
  // Navigation to get companies
  navigatePortal: () => 
    createEvent("navigate", "Navegando al portal de comprobantes...", 80),
  navigateRcel: () => 
    createEvent("navigate", "Accediendo a comprobantes en línea...", 90),
  
  // Companies fetch complete
  companiesFound: (count: number) =>
    createEvent("complete", `Se encontraron ${count} empresa(s)`, 100, { count }),
  
  // Company selection (for invoices fetch)
  companySelect: (name: string) => 
    createEvent("company", `Seleccionando empresa: ${name}`, 50),
  
  // Filters
  filtersApply: (from: string, to: string) => 
    createEvent("filters", `Aplicando filtros: ${from} - ${to}`, 55),
  filtersSearch: () => 
    createEvent("filters", "Buscando comprobantes...", 60),
  
  // Extraction
  extractStart: () => 
    createEvent("extract", "Extrayendo comprobantes...", 65),
  extractProgress: (current: number, total: number) => 
    createEvent(
      "invoice", 
      `Procesando comprobante ${current} de ${total}...`,
      65 + Math.round((current / total) * 30),
      { current, total }
    ),
  extractComplete: (count: number) => 
    createEvent("extract", `Se encontraron ${count} comprobante(s)`, 95),
  
  // Complete
  complete: (count: number) => 
    createEvent("complete", `¡Listo! ${count} comprobante(s) obtenidos`, 100, { count }),
  
  // Error
  error: (message: string) => 
    createEvent("error", message, undefined),
};

