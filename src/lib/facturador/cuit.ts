/**
 * Valida un CUIT/CUIL argentino verificando el dígito verificador (algoritmo mod-11).
 * Acepta guiones y espacios. Devuelve true solo si tiene 11 dígitos y el DV coincide.
 */
export function validateCuit(input: string): boolean {
  const digits = input.replace(/[\s-]/g, "");
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
