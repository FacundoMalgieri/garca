import { FORMA_PAGO, TIPO_OFICIAL, UNIDAD_MEDIDA, UNIVERSO_COMPROBANTE } from "@/lib/facturador/codes";
import { validateCuit } from "@/lib/facturador/cuit";
import type { FillPlanOptions } from "@/lib/facturador/fill-plan";
import type { Plantilla, StoredInvoice } from "@/types/facturador";

/** Datos mínimos para armar una NC total a partir de una factura conocida. */
export interface CreditNoteInput {
  /** La factura a anular (emitida por GARCA o scrapeada). */
  original: StoredInvoice;
  /**
   * Condición IVA del receptor (código RCEL). Para emitidas por GARCA se pasa la guardada;
   * para scrapeadas, la elección del usuario (default Consumidor Final "5").
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
      puntoVenta: String(original.puntoVenta),
      numero: String(original.numero),
      fecha: original.fecha,
    },
  };

  return { plantilla, opts };
}
