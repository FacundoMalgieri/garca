import Link from "next/link";

import { cn } from "@/lib/utils";
import type { CategoriaMonotributo, TipoActividad } from "@/types/monotributo";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

interface CategoriaCardProps {
  categoria: CategoriaMonotributo;
  tipoActividad?: TipoActividad;
  compact?: boolean;
  className?: string;
}

export function CategoriaCard({
  categoria,
  tipoActividad = "servicios",
  compact = false,
  className,
}: CategoriaCardProps) {
  const cuota = categoria.total[tipoActividad];
  const topeMensualImplicito = categoria.ingresosBrutos / 12;

  return (
    <Link
      href={`/monotributo/categoria/${categoria.categoria.toLowerCase()}`}
      className={cn(
        "group block rounded-lg border border-border bg-white dark:bg-background p-4",
        "shadow-sm hover:shadow-md hover:border-primary/40 dark:hover:border-primary/70 transition",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center justify-center rounded-md bg-primary/10 dark:bg-primary/30 text-primary dark:text-white px-2.5 py-1 text-sm font-bold">
            Categoría {categoria.categoria}
          </span>
          {!compact && (
            <p className="mt-2 text-xs text-muted-foreground">
              Tope anual: {currencyFormatter.format(categoria.ingresosBrutos)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Cuota mensual</p>
          <p className="text-base md:text-lg font-bold text-foreground">
            {currencyFormatter.format(cuota)}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Facturación mensual promedio</p>
            <p className="font-medium text-foreground">
              {currencyFormatter.format(topeMensualImplicito)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Obra social</p>
            <p className="font-medium text-foreground">
              {currencyFormatter.format(categoria.aportesObraSocial)}
            </p>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-primary dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        Ver detalles →
      </p>
    </Link>
  );
}
