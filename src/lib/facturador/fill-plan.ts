import { CONCEPTO_CODE, UNIVERSO_COMPROBANTE } from "@/lib/facturador/codes";
import type { Plantilla } from "@/types/facturador";

/** Una acción de llenado sobre RCEL. `lookup` = escribir y disparar la búsqueda de padrón. */
export interface FillAction {
  selector: string;
  action: "select" | "fill" | "check" | "lookup";
  value: string;
}

export interface FillPlan {
  pantalla0: FillAction[];
  pantalla1: FillAction[];
  pantalla2: FillAction[];
  pantalla3: FillAction[];
}

/** Opciones de emisión no persistidas en la plantilla (ej. fecha del comprobante). */
export interface FillPlanOptions {
  /** Fecha del comprobante (DD/MM/YYYY). Si se omite, RCEL usa la de hoy por defecto. */
  fecha?: string;
  /** Universo (pantalla 0). Default UNIVERSO_COMPROBANTE.facturaC ("2"). NC = "4". */
  universo?: string;
  /** Comprobante asociado (pantalla 2). Requerido para NC. Campos ya coercionados a string. */
  asociado?: { tipo: string; puntoVenta: string; numero: string; fecha?: string };
}

/** Convierte una Plantilla en un plan declarativo de acciones para las pantallas 0-3 de RCEL. */
export function buildFillPlan(p: Plantilla, opts: FillPlanOptions = {}): FillPlan {
  const pantalla0: FillAction[] = [
    { selector: "#puntodeventa", action: "select", value: p.puntoDeVenta },
    { selector: "#universocomprobante", action: "select", value: opts.universo ?? UNIVERSO_COMPROBANTE.facturaC },
  ];

  const pantalla1: FillAction[] = [];
  if (opts.fecha) pantalla1.push({ selector: "#fc", action: "fill", value: opts.fecha });
  pantalla1.push({ selector: "#idconcepto", action: "select", value: CONCEPTO_CODE[p.concepto] });
  if (p.concepto !== "productos") {
    if (p.periodo?.desde) pantalla1.push({ selector: "#fsd", action: "fill", value: p.periodo.desde });
    if (p.periodo?.hasta) pantalla1.push({ selector: "#fsh", action: "fill", value: p.periodo.hasta });
    if (p.periodo?.vtoPago) pantalla1.push({ selector: "#vencimientopago", action: "fill", value: p.periodo.vtoPago });
  }
  if (p.actividad) pantalla1.push({ selector: "#actiAsociadaId", action: "select", value: p.actividad });

  const pantalla2: FillAction[] = [
    { selector: "#idivareceptor", action: "select", value: p.cliente.condicionIVA },
    { selector: "#idtipodocreceptor", action: "select", value: p.cliente.tipoDoc },
  ];
  // Lookup de padrón: CUIT (80), CUIL (86) y DNI (96) con número. RCEL resuelve
  // razón social/domicilio para los tres (verificado en vivo). CF sin documento
  // (nroDoc vacío) NO dispara lookup: el padrón nunca respondería.
  const puedeLookup =
    ["80", "86", "96"].includes(p.cliente.tipoDoc) && p.cliente.nroDoc.trim().length > 0;
  if (puedeLookup) {
    pantalla2.push({ selector: "#nrodocreceptor", action: "lookup", value: p.cliente.nroDoc });
  } else {
    pantalla2.push({ selector: "#nrodocreceptor", action: "fill", value: p.cliente.nroDoc });
  }
  for (const fp of p.cliente.condicionVenta) {
    pantalla2.push({ selector: `#formadepago${fp}`, action: "check", value: "true" });
  }
  if (opts.asociado) {
    pantalla2.push({ selector: "#cmp_asoc_tipo", action: "select", value: opts.asociado.tipo });
    pantalla2.push({ selector: '[name="cmpAsociadoPtoVta"]', action: "fill", value: opts.asociado.puntoVenta });
    pantalla2.push({ selector: '[name="cmpAsociadoNro"]', action: "fill", value: opts.asociado.numero });
    if (opts.asociado.fecha) {
      pantalla2.push({ selector: '[name="cmpAsociadoFechaEmision"]', action: "fill", value: opts.asociado.fecha });
    }
  }

  const pantalla3: FillAction[] = [];
  p.lineas.forEach((l, i) => {
    const n = i + 1;
    pantalla3.push({ selector: `#detalle_descripcion${n}`, action: "fill", value: l.descripcion });
    pantalla3.push({ selector: `#detalle_cantidad${n}`, action: "fill", value: String(l.cantidad) });
    pantalla3.push({ selector: `#detalle_medida${n}`, action: "select", value: l.unidad });
    pantalla3.push({ selector: `#detalle_precio${n}`, action: "fill", value: String(l.precioUnitario) });
    if (l.bonificacion) pantalla3.push({ selector: `#detalle_porcentaje${n}`, action: "fill", value: String(l.bonificacion) });
  });

  return { pantalla0, pantalla1, pantalla2, pantalla3 };
}
