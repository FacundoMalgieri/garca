/**
 * Parseo puro del portal de Monotributo, separado del scraping para poder
 * testearlo sin conexión a ARCA (los steps con Playwright se prueban a mano).
 */

/**
 * Texto de la próxima recategorización.
 *
 * ARCA cambia el contenido de `#divProxRecategorizacion` según el momento:
 * - Fuera de la ventana: "Próximo período de recategorización: <strong>Enero 2026</strong>"
 * - Con la ventana abierta: "Podés recategorizarte hasta el 05/08/2026." (sin <strong>)
 *
 * El scraper leía sólo el `<strong>`, así que durante la ventana de
 * recategorización el campo volvía vacío. Prioriza el `<strong>` (formato
 * viejo, ya normalizado) y si no está deriva el dato del texto del div.
 */
export function pickProximaRecategorizacion(strongText?: string | null, divText?: string | null): string {
  const strong = strongText?.trim();
  if (strong) return strong;

  const text = divText?.replace(/\s+/g, " ").trim();
  if (!text) return "";

  // "Podés recategorizarte hasta el 05/08/2026." → "Hasta el 05/08/2026"
  const hasta = text.match(/hasta el\s+(\d{1,2}[/-][\w]{2,3}[/-]\d{2,4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (hasta) return `Hasta el ${hasta[1]}`;

  // "Próximo período de recategorización: Enero 2026" → "Enero 2026"
  const sinPrefijo = text.replace(/^pr[óo]ximo per[íi]odo de recategorizaci[óo]n:?\s*/i, "").trim();
  return sinPrefijo.replace(/\.$/, "");
}
