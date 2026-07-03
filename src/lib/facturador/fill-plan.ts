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

/** Convierte una Plantilla en un plan declarativo de acciones para las pantallas 0-3 de RCEL. */
export function buildFillPlan(p: Plantilla): FillPlan {
  const pantalla0: FillAction[] = [
    { selector: "#puntodeventa", action: "select", value: p.puntoDeVenta },
    { selector: "#universocomprobante", action: "select", value: UNIVERSO_COMPROBANTE.facturaC },
  ];

  const pantalla1: FillAction[] = [
    { selector: "#idconcepto", action: "select", value: CONCEPTO_CODE[p.concepto] },
  ];
  if (p.concepto !== "productos") {
    if (p.periodo?.desde) pantalla1.push({ selector: "#fsd", action: "fill", value: p.periodo.desde });
    if (p.periodo?.hasta) pantalla1.push({ selector: "#fsh", action: "fill", value: p.periodo.hasta });
    if (p.periodo?.vtoPago) pantalla1.push({ selector: "#vencimientopago", action: "fill", value: p.periodo.vtoPago });
  }

  const pantalla2: FillAction[] = [
    { selector: "#idivareceptor", action: "select", value: p.cliente.condicionIVA },
    { selector: "#idtipodocreceptor", action: "select", value: p.cliente.tipoDoc },
    { selector: "#nrodocreceptor", action: "lookup", value: p.cliente.nroDoc },
  ];
  for (const fp of p.cliente.condicionVenta) {
    pantalla2.push({ selector: `#formadepago${fp}`, action: "check", value: "true" });
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
