/**
 * Inventario de lo que GARCA guarda en localStorage, agrupado por lo que
 * significa para el usuario. Fuente única del borrado selectivo: una key nueva
 * en el código va acá también, o "Limpiar Datos" miente.
 */

export type StorageGroupId = "comprobantes" | "facturador" | "preferencias";

export interface StorageGroup {
  id: StorageGroupId;
  label: string;
  description: string;
  keys: string[];
  /** Keys con sufijo variable (un tour por clave). */
  keyPrefixes?: string[];
}

export const STORAGE_GROUPS: StorageGroup[] = [
  {
    id: "comprobantes",
    label: "Comprobantes y sesión",
    description:
      "Las facturas traídas de ARCA, la empresa, tus puntos de venta, los datos de Monotributo y las cotizaciones que cargaste a mano. Vas a tener que volver a consultar ARCA.",
    keys: [
      "garca_invoices",
      "garca_invoices_ts",
      "garca_company",
      "garca_pdv",
      "garca_monotributo",
      "garca_manual_fx_rates",
    ],
  },
  {
    id: "facturador",
    label: "Facturador",
    description:
      "Tus plantillas de facturación y los clientes recordados (CUIT, razón social y condición IVA). No se recuperan: no están en ARCA, sólo acá.",
    keys: ["garca_facturador_templates", "garca_clientes"],
  },
  {
    id: "preferencias",
    label: "Preferencias",
    description:
      "La simulación de proyección, tu tipo de actividad, el CUIT recordado del login, el tema (queda en oscuro, que es el default) y los tutoriales ya vistos.",
    keys: ["garca_projection", "monotributo-tipo-actividad", "garca_afip_cuit", "theme"],
    keyPrefixes: ["garca_tour_"],
  },
];

function resolveKeys(group: StorageGroup): string[] {
  const prefixed = (group.keyPrefixes ?? []).flatMap((prefix) =>
    Object.keys(localStorage).filter((k) => k.startsWith(prefix)),
  );
  return [...group.keys, ...prefixed];
}

/** Borra las keys de los grupos indicados. Ignora ids que no existen y keys ausentes. */
export function clearStorageGroups(ids: StorageGroupId[]): void {
  try {
    for (const group of STORAGE_GROUPS) {
      if (!ids.includes(group.id)) continue;
      for (const key of resolveKeys(group)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // localStorage no disponible (SSR, modo restringido).
  }
}

/** ¿Queda algo guardado por GARCA? Gatea el botón de "Limpiar Datos". */
export function hasAnyStoredData(): boolean {
  try {
    return STORAGE_GROUPS.some((group) =>
      resolveKeys(group).some((key) => localStorage.getItem(key) !== null),
    );
  } catch {
    return false;
  }
}
