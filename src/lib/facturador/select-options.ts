import { COND_IVA_RECEPTOR, FORMA_PAGO, UNIDAD_MEDIDA } from "@/lib/facturador/codes";
import type { Concepto } from "@/types/facturador";

export interface SelectOption {
  value: string;
  label: string;
}

export const CONCEPTO_OPTIONS: { value: Concepto; label: string }[] = [
  { value: "productos", label: "Productos" },
  { value: "servicios", label: "Servicios" },
  { value: "ambos", label: "Productos y servicios" },
];

export const UNIDAD_OPTIONS: SelectOption[] = [
  { value: UNIDAD_MEDIDA.unidades, label: "Unidades" },
  { value: UNIDAD_MEDIDA.kilogramos, label: "Kilogramos" },
  { value: UNIDAD_MEDIDA.litros, label: "Litros" },
  { value: UNIDAD_MEDIDA.metros, label: "Metros" },
  { value: UNIDAD_MEDIDA.docenas, label: "Docenas" },
  { value: UNIDAD_MEDIDA.packs, label: "Packs" },
  { value: UNIDAD_MEDIDA.otrasUnidades, label: "Otras unidades" },
];

export const COND_IVA_OPTIONS: SelectOption[] = [
  { value: COND_IVA_RECEPTOR.responsableInscripto, label: "Responsable Inscripto" },
  { value: COND_IVA_RECEPTOR.monotributo, label: "Monotributo" },
  { value: COND_IVA_RECEPTOR.exento, label: "Exento" },
  { value: COND_IVA_RECEPTOR.consumidorFinal, label: "Consumidor Final" },
  { value: COND_IVA_RECEPTOR.clienteExterior, label: "Cliente del Exterior" },
];

export const FORMA_PAGO_OPTIONS: SelectOption[] = [
  { value: FORMA_PAGO.transferencia, label: "Transferencia bancaria" },
  { value: FORMA_PAGO.contado, label: "Contado" },
  { value: FORMA_PAGO.tarjetaDebito, label: "Tarjeta de débito" },
  { value: FORMA_PAGO.tarjetaCredito, label: "Tarjeta de crédito" },
  { value: FORMA_PAGO.cuentaCorriente, label: "Cuenta corriente" },
  { value: FORMA_PAGO.cheque, label: "Cheque" },
  { value: FORMA_PAGO.otrosElectronicos, label: "Otros medios electrónicos" },
  { value: FORMA_PAGO.otra, label: "Otra" },
];

export const TIPO_DOC_OPTIONS: SelectOption[] = [
  { value: "80", label: "CUIT" },
  { value: "86", label: "CUIL" },
  { value: "96", label: "DNI" },
  { value: "99", label: "Consumidor Final" },
];
