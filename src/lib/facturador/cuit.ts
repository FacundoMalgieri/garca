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
  if (dv === 10) dv = 9;

  return dv === Number(digits[10]);
}
