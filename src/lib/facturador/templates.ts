import { generateId } from "@/lib/utils";
import type { Plantilla } from "@/types/facturador";

export const TEMPLATES_STORAGE_KEY = "garca_facturador_templates";

/** Lee todas las plantillas. Tolera storage ausente o corrupto. */
export function listTemplates(): Plantilla[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Plantilla[]) : [];
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
