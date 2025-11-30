/**
 * Constants for AFIP Scraper
 * Centralized selectors, URLs, and configuration values.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

export const DEFAULT_TIMEOUT = 120000; // 2 minutes
export const DEFAULT_HEADLESS = true;
export const MAX_RETRIES = 2;

// ============================================================================
// URLS
// ============================================================================

export const URLS = {
  LOGIN: "https://auth.afip.gob.ar/contribuyente_/login.xhtml",
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
    COMPANY_BUTTON: 'input[type="button"].btn_empresa, input.btn_empresa, button.btn_empresa, input[onclick*="seleccionaEmpresaForm"]',
    CONSULTAS_BUTTON: 'a#btn_consultas, a:has-text("Consultas"), a[href*="filtrarComprobantesGenerados"]',
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
} as const;

// ============================================================================
// USER AGENT
// ============================================================================

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

