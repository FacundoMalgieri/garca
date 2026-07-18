import type { AFIPInvoice } from "@/types/afip-scraper";

/** Concepto del comprobante (RCEL idConcepto: 1=productos, 2=servicios, 3=ambos). */
export type Concepto = "productos" | "servicios" | "ambos";

/** Una línea de detalle del comprobante. */
export interface LineaFactura {
  /** Código de artículo (opcional). */
  codigo?: string;
  /** Descripción del producto/servicio. */
  descripcion: string;
  /** Cantidad (default 1). */
  cantidad: number;
  /** Código de unidad de medida (RCEL detalleMedida, ej. "7" = unidades). */
  unidad: string;
  /** Precio unitario. */
  precioUnitario: number;
  /** Porcentaje de bonificación (default 0). */
  bonificacion?: number;
}

/** Datos del receptor de la factura. */
export interface ClienteFactura {
  /** Código de condición IVA (RCEL idIVAReceptor, ej. "1" = Responsable Inscripto). */
  condicionIVA: string;
  /** Código de tipo de documento (RCEL idTipoDocReceptor, ej. "80" = CUIT). */
  tipoDoc: string;
  /** Número de documento. */
  nroDoc: string;
  /** Razón social (cacheada del padrón; se revalida al emitir). */
  razonSocial: string;
  /** Domicilio comercial (selección del combo o texto). */
  domicilio?: string;
  /** Email del receptor. */
  email?: string;
  /** Códigos de condición de venta (RCEL formaDePago, ej. ["6"] = Transferencia). */
  condicionVenta: string[];
}

/** Período facturado (solo aplica a servicios). Todo opcional. */
export interface PeriodoFactura {
  /** DD/MM/YYYY */
  desde?: string;
  /** DD/MM/YYYY */
  hasta?: string;
  /** DD/MM/YYYY */
  vtoPago?: string;
}

/** Plantilla de factura reutilizable, persistida en localStorage. */
export interface Plantilla {
  id: string;
  nombre: string;
  /** Número de punto de venta (ej. "3"). */
  puntoDeVenta: string;
  concepto: Concepto;
  /** Valor exacto de la opción de actividad en RCEL (`#actiAsociadaId`, ej. "620100 - ..."). */
  actividad?: string;
  cliente: ClienteFactura;
  periodo?: PeriodoFactura;
  lineas: LineaFactura[];
}

/**
 * Factura conocida por GARCA con marca de origen. `emittedByGarca` es boolean para
 * tolerar el round-trip por localStorage (JSON.parse no preserva literales).
 */
export interface StoredInvoice extends AFIPInvoice {
  emittedByGarca: boolean;
}

/** Retorno del constructor de emisión: garantiza que fue emitida por GARCA. */
export interface EmittedInvoice extends AFIPInvoice {
  emittedByGarca: true;
}

/** Línea del detalle tal como se muestra en el Resumen (pantalla 4 de RCEL). */
export interface PreviewLinea {
  codigo: string;
  descripcion: string;
  cantidad: number;
  /** Unidad de medida como texto ("unidades", "kilogramos", ...). */
  unidad: string;
  precioUnitario: number;
  porcentajeBonificacion: number;
  importeBonificacion: number;
  subtotal: number;
}

/** Datos del emisor tal como aparecen en el Resumen. */
export interface PreviewEmisor {
  razonSocial: string;
  puntoVenta: string;
  domicilio: string;
  concepto: string;
  periodoDesde?: string;
  periodoHasta?: string;
  vtoPago?: string;
}

/** Datos del receptor tal como aparecen en el Resumen. */
export interface PreviewReceptor {
  cuit: string;
  razonSocial: string;
  domicilio: string;
  email: string;
  condicionIVA: string;
  condicionVenta: string;
}

/**
 * Datos COMPLETOS parseados del Resumen de RCEL (preview real, antes de confirmar).
 * Estructura todo lo que el usuario va a emitir para poder mostrarlo en un diseño propio.
 */
export interface EmissionPreview {
  puntoVenta: string;
  tipoComprobante: number;
  emisor: PreviewEmisor;
  receptor: PreviewReceptor;
  lineas: PreviewLinea[];
  subtotal: number;
  importeOtrosTributos: number;
  importeTotal: number;
}

/** Resultado de una emisión confirmada. */
export interface EmissionResult extends EmissionPreview {
  numeroCompleto: string;
  cae: string;
  vencimientoCae: string;
  pdfBase64?: string;
}
