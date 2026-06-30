/**
 * Grilla de líneas de fondo (la del hero), reutilizable en secciones.
 * Decorativa: líneas con currentColor + máscara radial para que se desvanezca
 * en los bordes. El color/opacidad se controlan vía className (text-* / opacity-*)
 * y se puede pasar una máscara distinta para variar la posición del fade.
 */
export function GridPattern({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:46px_46px] ${className}`}
    />
  );
}
