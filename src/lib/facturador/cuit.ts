/**
 * Caracteres de formato que vienen pegados a un CUIT copiado de otro lado.
 *
 * El caso que motivó esto (06/08/2026): un CUIT válido pegado desde otra app se
 * rechazaba como inválido. Los invisibles son los peores porque el número se ve
 * perfecto en pantalla y no hay forma de que el usuario entienda el error:
 * zero-width space/joiners (200B-200D), marcas de dirección (200E-200F), soft
 * hyphen (00AD), word joiner (2060) y BOM (FEFF). Se suman los separadores
 * visibles habituales: puntos, espacios de cualquier tipo y guiones tipográficos.
 *
 * No se limpia cualquier cosa: lo que queda tiene que ser exactamente 11
 * dígitos, así que "30707915281x" sigue siendo inválido.
 */
const DOC_FORMATTING = /[\s.\u002D\u00AD\u2010-\u2015\u200B-\u200F\u2060\uFEFF]/g;

/**
 * Deja sólo el número de un documento, sacando el formato con el que se pegó.
 *
 * Exportada para que el input del formulario normalice lo que muestra: así lo
 * que el usuario ve es exactamente lo que se valida.
 */
export function normalizeDocNumber(input: string): string {
  return input.replace(DOC_FORMATTING, "");
}

/**
 * Valida un CUIT/CUIL argentino verificando el dígito verificador (algoritmo mod-11).
 * Tolera el formato con el que suele venir pegado (ver DOC_FORMATTING).
 * Devuelve true solo si tiene 11 dígitos y el DV coincide.
 */
export function validateCuit(input: string): boolean {
  const digits = normalizeDocNumber(input);
  if (!/^\d{11}$/.test(digits)) return false;

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(digits[i]), 0);
  const mod = sum % 11;
  let dv = 11 - mod;
  if (dv === 11) dv = 0;
  // Lenidad deliberada: AFIP no emite el prefijo natural cuando dv===10 (reasigna
  // otro tipo), así que este caso solo false-acepta números sintéticos. Como esto es
  // un pre-filtro client-side y el padrón de RCEL es la verdad final, NO lo endurecer.
  if (dv === 10) dv = 9;

  return dv === Number(digits[10]);
}
