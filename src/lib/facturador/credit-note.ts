import { FORMA_PAGO, TIPO_OFICIAL, UNIDAD_MEDIDA, UNIVERSO_COMPROBANTE } from "@/lib/facturador/codes";
import { validateCuit } from "@/lib/facturador/cuit";
import type { FillPlanOptions } from "@/lib/facturador/fill-plan";
import type { Plantilla, StoredInvoice } from "@/types/facturador";

/** Datos mínimos para armar una NC total a partir de una factura conocida. */
export interface CreditNoteInput {
  /** La factura a anular (emitida por GARCA o scrapeada). */
  original: StoredInvoice;
  /**
   * Condición IVA del receptor (código RCEL). GARCA no persiste la condición IVA
   * del receptor en las facturas conocidas, así que este valor lo provee siempre el
   * caller: para scrapeadas es la elección del usuario en el modal; para emitidas por
   * GARCA es el default (Consumidor Final "5") hasta que se persista la real (V2).
   */
  condicionIVA: string;
}

/**
 * Deriva de un StoredInvoice la Plantilla sintética + las opciones de fill para emitir
 * la Nota de Crédito C total que lo anula. Módulo puro: no toca red ni DOM.
 */
export function buildCreditNote(input: CreditNoteInput): { plantilla: Plantilla; opts: FillPlanOptions } {
  const { original, condicionIVA } = input;

  const esCuitValido = validateCuit(original.cuitReceptor);

  const plantilla: Plantilla = {
    id: `nc-${original.numeroCompleto}`,
    nombre: `NC ${original.numeroCompleto}`,
    puntoDeVenta: String(original.puntoVenta),
    concepto: "productos",
    cliente: {
      condicionIVA,
      tipoDoc: esCuitValido ? "80" : "96",
      nroDoc: esCuitValido ? original.cuitReceptor : "",
      razonSocial: original.razonSocialReceptor,
      condicionVenta: [FORMA_PAGO.contado],
    },
    lineas: [
      {
        descripcion: `Anulación Factura C ${original.numeroCompleto}`,
        cantidad: 1,
        unidad: UNIDAD_MEDIDA.unidades,
        precioUnitario: original.importeTotal,
      },
    ],
  };

  const opts: FillPlanOptions = {
    universo: UNIVERSO_COMPROBANTE.notaCreditoC,
    asociado: {
      tipo: String(TIPO_OFICIAL.facturaC),
      // RCEL valida por longitud (alert nativo on blur): PV = 5 dígitos, Nro = 8 dígitos.
      // Verificado en vivo contra RCEL v4.9.9 (2026-07-17).
      puntoVenta: String(original.puntoVenta).padStart(5, "0"),
      numero: String(original.numero).padStart(8, "0"),
      fecha: original.fecha,
    },
  };

  return { plantilla, opts };
}
