/**
 * AFIP Invoice/Receipt types for scraped data.
 */

/**
 * Represents an invoice/receipt scraped from AFIP portal.
 */
export interface AFIPInvoice {
  /** Fecha del comprobante (formato: DD/MM/YYYY) */
  fecha: string;
  /** Tipo de comprobante (ej: "FACTURAS A", "NOTA DE CREDITO B") */
  tipo: string;
  /** Código numérico del tipo de comprobante */
  tipoComprobante: number;
  /** Punto de venta */
  puntoVenta: number;
  /** Número de comprobante */
  numero: number;
  /** Número completo formateado (ej: "00001-00000123") */
  numeroCompleto: string;
  /** CUIT del emisor */
  cuitEmisor: string;
  /** Razón social del emisor */
  razonSocialEmisor: string;
  /** CUIT del receptor */
  cuitReceptor: string;
  /** Razón social del receptor */
  razonSocialReceptor: string;
  /** Importe neto gravado */
  importeNeto: number;
  /** Importe de IVA */
  importeIVA: number;
  /** Importe total */
  importeTotal: number;
  /** Moneda (ej: "PES", "DOL") */
  moneda: string;
  /** Código de Autorización Electrónico */
  cae?: string;
  /** Fecha de vencimiento del CAE (formato: DD/MM/YYYY) */
  vencimientoCae?: string;
  /** Estado del comprobante (ej: "APROBADO", "RECHAZADO") */
  estado?: string;
  /** URL del XML si está disponible */
  xmlUrl?: string;
  /** Contenido del XML parseado (opcional) */
  xmlContent?: string;
  /** Datos parseados del XML (opcional) */
  xmlData?: {
    tipo?: string;
    puntoVenta?: string;
    numero?: string;
    fecha?: string;
    importe?: string;
    moneda?: string;
    cuitEmisor?: string;
    cuitReceptor?: string;
    cae?: string;
    caeVto?: string;
    exchangeRate?: number;
  };
}

/**
 * Filters for querying AFIP invoices.
 */
export interface AFIPInvoiceFilters {
  /** CUIT del contribuyente */
  cuit: string;
  /** Fecha desde (formato: DD/MM/YYYY) */
  fechaDesde: string;
  /** Fecha hasta (formato: DD/MM/YYYY) */
  fechaHasta: string;
  /** Punto de venta (opcional) */
  puntoVenta?: number;
  /** Tipo de comprobante (opcional) */
  tipoComprobante?: number;
  /** Rol: "EMISOR" o "RECEPTOR" */
  rol?: "EMISOR" | "RECEPTOR";
}

/**
 * Credentials for AFIP login.
 */
export interface AFIPCredentials {
  /** CUIT del usuario */
  cuit: string;
  /** Contraseña de AFIP */
  password: string;
}

/**
 * Result of the scraping operation.
 */
export interface AFIPScraperResult {
  /** Indicates if the operation was successful */
  success: boolean;
  /** List of invoices found */
  invoices: AFIPInvoice[];
  /** Total count of invoices */
  total: number;
  /** Error message if any */
  error?: string;
  /** Error code for specific error types */
  errorCode?: AFIPErrorCode;
}

/**
 * Error codes for AFIP scraper.
 */
export enum AFIPErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  CAPTCHA_REQUIRED = "CAPTCHA_REQUIRED",
  ACCOUNT_BLOCKED = "ACCOUNT_BLOCKED",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  TIMEOUT = "TIMEOUT",
  NO_DATA = "NO_DATA",
  NAVIGATION_ERROR = "NAVIGATION_ERROR",
  PARSING_ERROR = "PARSING_ERROR",
  UNKNOWN = "UNKNOWN",
}

/**
 * Options for the AFIP scraper.
 */
export interface AFIPScraperOptions {
  /** Whether to run in headless mode (default: true) */
  headless?: boolean;
  /** Timeout for page operations in ms (default: 30000) */
  timeout?: number;
  /** Whether to download and parse XML (default: false) */
  downloadXML?: boolean;
  /** Company index to select if multiple companies available (default: 0) */
  companyIndex?: number;
}

/**
 * Company/Contributor information from AFIP portal.
 */
export interface AFIPCompany {
  /** CUIT of the company */
  cuit: string;
  /** Business name (razón social) */
  razonSocial: string;
  /** Index in the company list (for selection) */
  index: number;
}

/**
 * Extended result including company information.
 */
export interface AFIPScraperResultWithCompany extends AFIPScraperResult {
  /** Company information */
  company?: AFIPCompany;
  /** Available companies if multiple found */
  availableCompanies?: AFIPCompany[];
}

