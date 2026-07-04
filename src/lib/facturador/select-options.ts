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

/**
 * Catálogo completo de unidades de medida de RCEL (`detalleMedida`, v4.9.7),
 * capturado en vivo del `<select id="detalle_medida1">`. Los `value` son los
 * códigos exactos de RCEL (el fill-plan selecciona por value). "Unidades" (7)
 * va primero y "Otras unidades" (98) última por conveniencia; el resto sigue el
 * orden de RCEL.
 */
export const UNIDAD_OPTIONS: SelectOption[] = [
  { value: UNIDAD_MEDIDA.unidades, label: "Unidades" }, // 7
  { value: UNIDAD_MEDIDA.kilogramos, label: "Kilogramos" }, // 1
  { value: "14", label: "Gramos" },
  { value: "41", label: "Miligramos" },
  { value: "33", label: "Microgramos" },
  { value: "34", label: "Nanogramos" },
  { value: "35", label: "Picogramos" },
  { value: UNIDAD_MEDIDA.metros, label: "Metros" }, // 2
  { value: "20", label: "Centímetros" },
  { value: "15", label: "Milímetros" },
  { value: "17", label: "Kilómetros" },
  { value: "3", label: "Metros cuadrados" },
  { value: "4", label: "Metros cúbicos" },
  { value: "27", label: "Centímetros cúbicos" },
  { value: "16", label: "Milímetros cúbicos" },
  { value: "30", label: "Decámetros cúbicos" },
  { value: "31", label: "Hectómetros cúbicos" },
  { value: "32", label: "Kilómetros cúbicos" },
  { value: UNIDAD_MEDIDA.litros, label: "Litros" }, // 5
  { value: "47", label: "Mililitros" },
  { value: "18", label: "Hectolitros" },
  { value: "29", label: "Toneladas" },
  { value: "53", label: "Kg base" },
  { value: "61", label: "Kg bruto" },
  { value: "66", label: "Kg activo" },
  { value: "67", label: "Gramo activo" },
  { value: "68", label: "Gramo base" },
  { value: "6", label: "1000 kWh" },
  { value: "8", label: "Pares" },
  { value: UNIDAD_MEDIDA.docenas, label: "Docenas" }, // 9
  { value: "11", label: "Millares" },
  { value: "10", label: "Quilates" },
  { value: "54", label: "Gruesa" },
  { value: "25", label: "Jgo./pqt./mazo de naipes" },
  { value: "48", label: "Curie" },
  { value: "49", label: "Milicurie" },
  { value: "50", label: "Microcurie" },
  { value: "51", label: "UIACTHOR" },
  { value: "52", label: "MUIACTHOR" },
  { value: "62", label: "UIACTANT" },
  { value: "63", label: "MUIACTANT" },
  { value: "64", label: "UIACTIG" },
  { value: "65", label: "MUIACTIG" },
  { value: UNIDAD_MEDIDA.packs, label: "Packs" }, // 96
  { value: UNIDAD_MEDIDA.otrasUnidades, label: "Otras unidades" }, // 98
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
