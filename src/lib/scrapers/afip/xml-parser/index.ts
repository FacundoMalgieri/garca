/**
 * XML Parser for AFIP Export E invoices
 * Extracts exchange rate and other relevant data from XML files
 */

export interface ParsedInvoiceXML {
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
}

/**
 * XML tag patterns for data extraction.
 */
const XML_PATTERNS = {
  // Exchange rate patterns (try multiple)
  EXCHANGE_RATE: [/<Mon_ctz>([\d.]+)<\/Mon_ctz>/, /<MonCotiz>([\d.]+)<\/MonCotiz>/],
  // Currency code
  CURRENCY: /<MonId>([^<]+)<\/MonId>/,
  // Total amount
  AMOUNT: /<ImpTotal>([\d.]+)<\/ImpTotal>/,
  // CAE (authorization code)
  CAE: /<CodAutorizacion>(\d+)<\/CodAutorizacion>/,
  // Invoice date (format: YYYYMMDD)
  DATE: /<FchEmis>(\d{8})<\/FchEmis>/,
  // Punto de venta
  PUNTO_VENTA: /<PtoVta>(\d+)<\/PtoVta>/,
  // Invoice number
  NUMERO: /<Nro>(\d+)<\/Nro>/,
  // Invoice type
  TIPO: /<CbteTipo>(\d+)<\/CbteTipo>/,
} as const;

/**
 * Extracts a value from XML content using a regex pattern.
 * @param xmlContent - XML string
 * @param pattern - Regex pattern with capture group
 * @returns Captured value or undefined
 */
function extractValue(xmlContent: string, pattern: RegExp): string | undefined {
  const match = xmlContent.match(pattern);
  return match ? match[1] : undefined;
}

/**
 * Converts YYYYMMDD date format to DD/MM/YYYY.
 * @param dateStr - Date string in YYYYMMDD format
 * @returns Date string in DD/MM/YYYY format
 */
function formatDate(dateStr: string): string {
  return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
}

/**
 * Parses AFIP XML export data to extract exchange rate and other data.
 * @param xmlContent - Raw XML content from AFIP export
 * @returns Parsed invoice data
 */
export function parseAfipXml(xmlContent: string): ParsedInvoiceXML {
  const result: ParsedInvoiceXML = {};

  try {
    // Extract exchange rate (try multiple patterns)
    for (const pattern of XML_PATTERNS.EXCHANGE_RATE) {
      const value = extractValue(xmlContent, pattern);
      if (value) {
        result.exchangeRate = parseFloat(value);
        break;
      }
    }

    // Extract currency code
    const currency = extractValue(xmlContent, XML_PATTERNS.CURRENCY);
    if (currency) {
      result.moneda = currency;
    }

    // Extract total amount
    const amount = extractValue(xmlContent, XML_PATTERNS.AMOUNT);
    if (amount) {
      result.importe = amount;
    }

    // Extract CAE
    const cae = extractValue(xmlContent, XML_PATTERNS.CAE);
    if (cae) {
      result.cae = cae;
    }

    // Extract and format date
    const date = extractValue(xmlContent, XML_PATTERNS.DATE);
    if (date) {
      result.fecha = formatDate(date);
    }

    // Extract punto de venta
    const puntoVenta = extractValue(xmlContent, XML_PATTERNS.PUNTO_VENTA);
    if (puntoVenta) {
      result.puntoVenta = puntoVenta;
    }

    // Extract invoice number
    const numero = extractValue(xmlContent, XML_PATTERNS.NUMERO);
    if (numero) {
      result.numero = numero;
    }

    // Extract invoice type
    const tipo = extractValue(xmlContent, XML_PATTERNS.TIPO);
    if (tipo) {
      result.tipo = tipo;
    }
  } catch (error) {
    console.error("[XML Parser] Error parsing XML:", error);
  }

  return result;
}

