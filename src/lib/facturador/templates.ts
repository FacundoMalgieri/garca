import { asFiniteNumber, asString, asStringArray, isRecord } from "@/lib/storage/sanitize";
import { generateId } from "@/lib/utils";
import type { ClienteFactura, LineaFactura, Plantilla } from "@/types/facturador";

export const TEMPLATES_STORAGE_KEY = "garca_facturador_templates";

/** Concepto válido, o "servicios" (el caso más común en Monotributo). */
function sanitizeConcepto(raw: unknown): Plantilla["concepto"] {
  return raw === "productos" || raw === "servicios" || raw === "ambos" ? raw : "servicios";
}

function sanitizeLinea(raw: unknown): LineaFactura | null {
  if (!isRecord(raw)) return null;
  return {
    descripcion: asString(raw.descripcion),
    // Cantidad 0 dejaría la línea sin importe sin que se vea por qué.
    cantidad: asFiniteNumber(raw.cantidad, 1) || 1,
    unidad: asString(raw.unidad, "7"),
    precioUnitario: asFiniteNumber(raw.precioUnitario),
    ...(typeof raw.codigo === "string" ? { codigo: raw.codigo } : {}),
    ...(raw.bonificacion !== undefined ? { bonificacion: asFiniteNumber(raw.bonificacion) } : {}),
  };
}

function sanitizeCliente(raw: unknown): ClienteFactura {
  const cliente = isRecord(raw) ? raw : {};
  return {
    condicionIVA: asString(cliente.condicionIVA, "1"),
    tipoDoc: asString(cliente.tipoDoc, "80"),
    nroDoc: asString(cliente.nroDoc),
    condicionVenta: asStringArray(cliente.condicionVenta),
    ...(typeof cliente.razonSocial === "string" ? { razonSocial: cliente.razonSocial } : {}),
  };
}

/**
 * Sanea las plantillas guardadas.
 *
 * Se descarta una plantilla sólo si no tiene `id`: sin eso no se puede
 * seleccionar ni actualizar. El resto se completa con defaults, porque son datos
 * que el usuario cargó a mano y perderlos en silencio es peor que mostrarlos
 * incompletos.
 */
export function sanitizeTemplates(raw: unknown): Plantilla[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = asString(item.id);
    if (id === "") return [];

    const lineas = Array.isArray(item.lineas)
      ? item.lineas.map(sanitizeLinea).filter((l): l is LineaFactura => l !== null)
      : [];

    return [
      {
        id,
        nombre: asString(item.nombre),
        puntoDeVenta: asString(item.puntoDeVenta),
        concepto: sanitizeConcepto(item.concepto),
        cliente: sanitizeCliente(item.cliente),
        lineas,
        ...(typeof item.actividad === "string" ? { actividad: item.actividad } : {}),
        ...(isRecord(item.periodo)
          ? {
              periodo: {
                desde: asString(item.periodo.desde) || undefined,
                hasta: asString(item.periodo.hasta) || undefined,
                vtoPago: asString(item.periodo.vtoPago) || undefined,
              },
            }
          : {}),
      },
    ];
  });
}

/** Lee todas las plantillas. Tolera storage ausente o corrupto. */
export function listTemplates(): Plantilla[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    // Array.isArray no alcanza: cada plantilla tiene que tener `lineas` y
    // `cliente`, que el form recorre sin guarda (totalImporte hace
    // `p.lineas.reduce`). Ver sanitizeTemplates.
    return sanitizeTemplates(JSON.parse(raw));
  } catch {
    return [];
  }
}

/** Persiste la lista completa (silencioso si falla, ej. quota). */
function writeAll(list: Plantilla[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota / unavailable */
  }
}

/**
 * Crea (si no tiene id) o actualiza (si el id existe) una plantilla.
 * Devuelve la plantilla persistida (con id).
 */
export function saveTemplate(input: Plantilla | Omit<Plantilla, "id">): Plantilla {
  const list = listTemplates();
  const withId: Plantilla = "id" in input && input.id ? (input as Plantilla) : { ...(input as Omit<Plantilla, "id">), id: generateId() };
  const idx = list.findIndex((t) => t.id === withId.id);
  if (idx >= 0) list[idx] = withId;
  else list.push(withId);
  writeAll(list);
  return withId;
}

/** Elimina una plantilla por id. */
export function deleteTemplate(id: string): void {
  writeAll(listTemplates().filter((t) => t.id !== id));
}
