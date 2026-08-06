/**
 * Constants for AFIP Scraper
 * Centralized selectors, URLs, and configuration values.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

export const DEFAULT_TIMEOUT = 120000; // 2 minutes - overall navigation timeout
export const ELEMENT_TIMEOUT = 60000; // 1 minute - timeout for waiting for individual elements
export const NEW_TAB_TIMEOUT = 60000; // 1 minute - timeout for waiting for new tabs to open
/**
 * Timeout para LEER texto/atributos de un nodo que ya deberia estar en el DOM.
 *
 * `locator.textContent()` / `getAttribute()` sin `timeout` usan el default de
 * Playwright (30s): si el nodo falta, la lectura espera esos 30s antes de fallar.
 * Medido contra ARCA el 05/08/2026, eso hacia que el step de Monotributo tardara
 * 35s en vez de 6,6s (una sola lectura de un nodo que ARCA elimino). Estas
 * lecturas se hacen despues de esperar el contenedor, asi que si el nodo no
 * aparece en 2s es porque no esta.
 */
export const READ_TIMEOUT = 2000;
/**
 * Igual que READ_TIMEOUT pero para las celdas de la tabla de comprobantes.
 *
 * Ahi la asimetria es distinta: si una lectura tira, el caller saltea la fila y
 * la factura desaparece del total con solo un console.warn. Un limite corto
 * cambiaria un cuelgue hipotetico por perdida de datos silenciosa, asi que se
 * usa un margen amplio: sigue acotado (3x mas rapido que el default de 30s) pero
 * lejos de cualquier lectura lenta que igual habria funcionado.
 */
export const ROW_READ_TIMEOUT = 10000;

/**
 * Timeouts del step de Monotributo.
 *
 * El dato de Monotributo es opcional: si no sale, el flujo de empresas sigue
 * igual. Por eso este step no puede usar los timeouts generales de 60s.
 *
 * El 05/08/2026, con la navegacion a Monotributo fallando, el step estuvo 120s
 * sin emitir un solo evento (60s de NEW_TAB_TIMEOUT esperando una pestana que
 * nunca se abrio + 60s de ELEMENT_TIMEOUT esperando el jumbotron en una pagina
 * que no era la de Monotributo). Cloudflare corta una conexion proxeada tras
 * ~100s sin bytes, asi que el stream SSE murio y el usuario vio un error de
 * red. El camino feliz completo tarda ~6,6s (ver commit 0d37b5d), asi que estos
 * margenes siguen siendo holgados.
 */
export const MONOTRIBUTO_TIMEOUTS = {
  /** Tarjeta de "Servicios | Mas utilizados": ya esta en el DOM del portal. */
  CARD: 5000,
  /** Buscador del portal y su resultado: ya estan en pantalla post-login. */
  SEARCH: 8000,
  /** Sonda "se abrio pestana nueva?". El caso feliz resuelve en ~1-2s. */
  NEW_TAB: 6000,
  /** Navegacion en la misma pestana hacia el portal de Monotributo. */
  SAME_TAB_NAV: 6000,
  /** Contenido renderizado (jumbotron) una vez que ya estamos en la pagina. */
  READY: 12000,
  /**
   * Presupuesto total del step, como red de seguridad sobre los anteriores:
   * cubre cualquier operacion de Playwright sin timeout explicito, que caeria
   * en el default de la pagina (DEFAULT_TIMEOUT, 120s) y volveria a pasarse
   * del corte de Cloudflare.
   */
  STEP_BUDGET: 45000,
} as const;
// Headless por defecto. Poné AFIP_HEADLESS=false en el entorno (dev) para
// ver la ventana de Chromium y observar el scraping/emisión en vivo.
export const DEFAULT_HEADLESS = process.env.AFIP_HEADLESS !== "false";
export const MAX_RETRIES = 2;

// ============================================================================
// URLS
// ============================================================================

export const URLS = {
  LOGIN: "https://auth.afip.gob.ar/contribuyente_/login.xhtml",
  PORTAL: "https://portalcf.cloud.afip.gob.ar/portal/app/",
  RCEL: "https://fe.arca.gob.ar/rcel/jsp/index_bis.jsp",
} as const;

// ============================================================================
// SELECTORS - LOGIN
// ============================================================================

export const SELECTORS = {
  // Login page
  LOGIN: {
    CUIT_INPUT: 'input[name*="cuit"], input[id*="cuit"], input[placeholder*="CUIT"], input#F1\\:username',
    SIGUIENTE_BUTTON: 'button:has-text("Siguiente"), input[value*="Siguiente"], button#F1\\:btnSiguiente',
    PASSWORD_INPUT: 'input[type="password"], input[name*="password"], input[id*="password"], input#F1\\:password',
    INGRESAR_BUTTON: 'button:has-text("Ingresar"), input[value*="Ingresar"], button[type="submit"], button#F1\\:btnIngresar',
    CAPTCHA: 'img[alt*="captcha"], img[alt*="CAPTCHA"]',
    ERROR_MESSAGE: '.error, .alert-danger, [class*="error"], .text-danger, #F1\\:msg, span[id*="msg"]',
  },

  // Portal navigation
  NAVIGATION: {
    COMPROBANTES_LINK: 'a[href*="fe.afip.gob.ar/rcel"], a[href*="/rcel/"], a:has-text("Comprobantes en línea")',
    SEARCH_INPUT: 'input#buscadorInput, input[placeholder*="Buscá trámites"]',
    SEARCH_RESULT: 'li[role="option"]:has-text("Sistema de emisión de comprobantes"), li[role="option"]:has-text("Comprobantes en línea")',
    // Multiple selectors for company button - ARCA uses different variants
    COMPANY_BUTTON: 'input[type="button"].btn_empresa, input[type="submit"].btn_empresa, input.btn_empresa, button.btn_empresa, input[onclick*="seleccionaEmpresaForm"], input[onclick*="empresa"], input[value][class*="btn"]',
    CONSULTAS_BUTTON: 'a#btn_consultas, a:has-text("Consultas"), a[href*="filtrarComprobantesGenerados"]',
    /**
     * Tarjeta de Monotributo en "Servicios | Mas utilizados" del portal.
     *
     * Ojo: es un `<a>` SIN href (la navegacion la hace un onClick de React),
     * igual que los resultados del buscador. Por eso hay que verificar que la
     * navegacion ocurrio en vez de asumirlo. La seccion es personalizada, asi
     * que la tarjeta puede no estar: el caller cae al buscador.
     */
    MONOTRIBUTO_CARD: '#serviciosMasUtilizados a:has-text("Monotributo")',
  },

  // Filters
  FILTERS: {
    DATE_FROM: 'input[name="fechaEmisionDesde"], input#fed, input[id*="fechaDesde"], input[name*="fechaDesde"]',
    DATE_TO: 'input[name="fechaEmisionHasta"], input#feh, input[id*="fechaHasta"], input[name*="fechaHasta"]',
    PUNTO_VENTA: 'select[name="puntoDeVenta"], select#puntodeventa, select[id*="puntoVenta"], select[name*="puntoVenta"]',
    TIPO_COMPROBANTE: 'select[name="idTipoComprobante"], select[id*="tipoComprobante"], select[name*="tipo"]',
    BUSCAR_BUTTON: 'input[value="Buscar"], button:has-text("Buscar"), input[type="button"][value="Buscar"], button:has-text("Consultar"), input[value="Consultar"]',
  },

  // Results table
  TABLE: {
    CONTAINER: "table.jig_table",
    DATA_ROWS: "table.jig_table tbody tr.jig_par, table.jig_table tbody tr.jig_impar",
    NO_DATA: 'text="Sin resultados", text="No se encontraron", text="No hay datos"',
  },

  // XML download
  XML: {
    DOWNLOAD_BUTTON: (invoiceNumber: string) =>
      `tr:has-text("${invoiceNumber}") a:has-text("XML"), ` +
      `tr:has-text("${invoiceNumber}") a[href*="xml"], ` +
      `tr:has-text("${invoiceNumber}") button:has-text("XML"), ` +
      `tr:has-text("${invoiceNumber}") img[alt*="XML"]`,
  },
} as const;

// ============================================================================
// TIMING
// ============================================================================

export const TIMING = {
  AFTER_LOGIN_WAIT: 2000,
  AFTER_CLICK_WAIT: 1500,
  AFTER_NAVIGATION_WAIT: 2000,
  BETWEEN_XML_DOWNLOADS: 500,
  ROW_SCROLL_WAIT: 100,
  TABLE_SCROLL_WAIT: 500,
  JS_PROCESS_WAIT: 1000,
  LOOKUP_WAIT: 8000,
} as const;

// ============================================================================
// USER AGENT
// ============================================================================

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

