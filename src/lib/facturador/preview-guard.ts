import type { EmissionPreview } from "@/types/facturador";

/**
 * Motivo por el que un preview no debería confirmarse.
 */
export interface PreviewBlocker {
  campo: string;
  detalle: string;
}

/**
 * RCEL corre sobre JSP: cuando un campo de su sesión quedó en null, el Resumen
 * imprime el literal "null" en vez de dejarlo vacío. Detectar ese caso importa
 * porque no es un problema de parseo — es RCEL diciendo que no tiene el dato.
 */
function faltante(valor: string | undefined | null): boolean {
  const v = valor?.trim().toLowerCase();
  return !v || v === "null" || v === "undefined";
}

/**
 * Revisa un preview del Resumen antes de habilitar la confirmación.
 *
 * Existe por un caso real (05/08/2026): una corrida dejó la condición de venta en
 * "null" porque el checkbox no quedó marcado en RCEL, y nada en la app impedía
 * confirmar — el modal solo mostraba el valor. Confirmar así emite un comprobante
 * fiscal REAL incompleto, que después hay que anular con otra nota de crédito.
 *
 * Devuelve la lista vacía cuando el preview está sano.
 */
export function findPreviewBlockers(preview: EmissionPreview): PreviewBlocker[] {
  const blockers: PreviewBlocker[] = [];

  if (faltante(preview.receptor.condicionVenta)) {
    blockers.push({
      campo: "Condición de venta",
      detalle: "RCEL no la registró. Volvé a preparar el comprobante.",
    });
  }

  if (faltante(preview.receptor.condicionIVA)) {
    blockers.push({
      campo: "Condición frente al IVA",
      detalle: "RCEL no la registró. Volvé a preparar el comprobante.",
    });
  }

  if (preview.lineas.length === 0) {
    blockers.push({ campo: "Detalle", detalle: "El Resumen no trae ninguna línea." });
  }

  if (!(preview.importeTotal > 0)) {
    blockers.push({
      campo: "Importe total",
      detalle: `El Resumen informa ${preview.importeTotal}.`,
    });
  }

  // El total tiene que cerrar con el detalle: si no, se está mirando un Resumen
  // distinto del que se armó.
  const sumaLineas = preview.lineas.reduce((acc, l) => acc + l.subtotal, 0);
  const esperado = sumaLineas + preview.importeOtrosTributos;
  if (preview.lineas.length > 0 && Math.abs(esperado - preview.importeTotal) > 0.01) {
    blockers.push({
      campo: "Importe total",
      detalle: `No cierra con el detalle (${esperado} vs ${preview.importeTotal}).`,
    });
  }

  if (faltante(preview.emisor.razonSocial)) {
    blockers.push({ campo: "Emisor", detalle: "El Resumen no trae la razón social." });
  }

  return blockers;
}
