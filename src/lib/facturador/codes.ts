import type { Concepto } from "@/types/facturador";

/** Códigos de emisión (RCEL universoComprobante, pantalla 0 de Generar Comprobantes). */
export const UNIVERSO_COMPROBANTE = {
  facturaC: "2",
  notaDebitoC: "3",
  notaCreditoC: "4",
  reciboC: "5",
} as const;

/** Códigos oficiales (RCEL idTipoComprobante / WSFE cbte tipo, usados en Consulta). */
export const TIPO_OFICIAL = {
  facturaC: 11,
  notaDebitoC: 12,
  notaCreditoC: 13,
} as const;

/** Traduce un código de emisión (universo) al código oficial. */
export function universoToOficial(universo: string): number | null {
  switch (universo) {
    case UNIVERSO_COMPROBANTE.facturaC:
      return TIPO_OFICIAL.facturaC;
    case UNIVERSO_COMPROBANTE.notaDebitoC:
      return TIPO_OFICIAL.notaDebitoC;
    case UNIVERSO_COMPROBANTE.notaCreditoC:
      return TIPO_OFICIAL.notaCreditoC;
    default:
      return null;
  }
}

/** Código de concepto de RCEL (idConcepto). */
export const CONCEPTO_CODE: Record<Concepto, string> = {
  productos: "1",
  servicios: "2",
  ambos: "3",
};

/** Códigos de unidad de medida más usados (RCEL detalleMedida). */
export const UNIDAD_MEDIDA = {
  unidades: "7",
  otrasUnidades: "98",
  kilogramos: "1",
  litros: "5",
  metros: "2",
  docenas: "9",
  packs: "96",
} as const;

/** Códigos de condición IVA del receptor (RCEL idIVAReceptor). */
export const COND_IVA_RECEPTOR = {
  responsableInscripto: "1",
  exento: "4",
  consumidorFinal: "5",
  monotributo: "6",
  clienteExterior: "9",
} as const;

/** Códigos de forma de pago / condición de venta (RCEL formaDePago). */
export const FORMA_PAGO = {
  contado: "1",
  tarjetaDebito: "2",
  tarjetaCredito: "3",
  cuentaCorriente: "4",
  cheque: "5",
  transferencia: "6",
  otra: "7",
  otrosElectronicos: "8",
} as const;
