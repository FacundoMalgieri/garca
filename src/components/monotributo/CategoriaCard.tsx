import Link from "next/link";

import { cn } from "@/lib/utils";
import type { CategoriaMonotributo, TipoActividad } from "@/types/monotributo";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

// Paleta por categoría — progresión visual A→K (verde → rosa)
// Cada letra mapea a un conjunto de clases coherentes para gradient/accent/glow
const CATEGORIA_COLORS: Record<
  string,
  {
    badge: string;
    accent: string;
    blob: string;
    glow: string;
    progress: string;
  }
> = {
  A: {
    badge: "from-emerald-500 to-green-500",
    accent: "from-emerald-500/0 via-emerald-500 to-green-500/0",
    blob: "from-emerald-400/20 to-green-400/20",
    glow: "hover:shadow-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500/60",
    progress: "from-emerald-500 to-green-500",
  },
  B: {
    badge: "from-teal-500 to-emerald-500",
    accent: "from-teal-500/0 via-teal-500 to-emerald-500/0",
    blob: "from-teal-400/20 to-emerald-400/20",
    glow: "hover:shadow-teal-500/20 hover:border-teal-400 dark:hover:border-teal-500/60",
    progress: "from-teal-500 to-emerald-500",
  },
  C: {
    badge: "from-cyan-500 to-teal-500",
    accent: "from-cyan-500/0 via-cyan-500 to-teal-500/0",
    blob: "from-cyan-400/20 to-teal-400/20",
    glow: "hover:shadow-cyan-500/20 hover:border-cyan-400 dark:hover:border-cyan-500/60",
    progress: "from-cyan-500 to-teal-500",
  },
  D: {
    badge: "from-sky-500 to-cyan-500",
    accent: "from-sky-500/0 via-sky-500 to-cyan-500/0",
    blob: "from-sky-400/20 to-cyan-400/20",
    glow: "hover:shadow-sky-500/20 hover:border-sky-400 dark:hover:border-sky-500/60",
    progress: "from-sky-500 to-cyan-500",
  },
  E: {
    badge: "from-blue-500 to-sky-500",
    accent: "from-blue-500/0 via-blue-500 to-sky-500/0",
    blob: "from-blue-400/20 to-sky-400/20",
    glow: "hover:shadow-blue-500/20 hover:border-blue-400 dark:hover:border-blue-500/60",
    progress: "from-blue-500 to-sky-500",
  },
  F: {
    badge: "from-indigo-500 to-blue-500",
    accent: "from-indigo-500/0 via-indigo-500 to-blue-500/0",
    blob: "from-indigo-400/20 to-blue-400/20",
    glow: "hover:shadow-indigo-500/20 hover:border-indigo-400 dark:hover:border-indigo-500/60",
    progress: "from-indigo-500 to-blue-500",
  },
  G: {
    badge: "from-violet-500 to-indigo-500",
    accent: "from-violet-500/0 via-violet-500 to-indigo-500/0",
    blob: "from-violet-400/20 to-indigo-400/20",
    glow: "hover:shadow-violet-500/20 hover:border-violet-400 dark:hover:border-violet-500/60",
    progress: "from-violet-500 to-indigo-500",
  },
  H: {
    badge: "from-purple-500 to-violet-500",
    accent: "from-purple-500/0 via-purple-500 to-violet-500/0",
    blob: "from-purple-400/20 to-violet-400/20",
    glow: "hover:shadow-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/60",
    progress: "from-purple-500 to-violet-500",
  },
  I: {
    badge: "from-fuchsia-500 to-purple-500",
    accent: "from-fuchsia-500/0 via-fuchsia-500 to-purple-500/0",
    blob: "from-fuchsia-400/20 to-purple-400/20",
    glow: "hover:shadow-fuchsia-500/20 hover:border-fuchsia-400 dark:hover:border-fuchsia-500/60",
    progress: "from-fuchsia-500 to-purple-500",
  },
  J: {
    badge: "from-pink-500 to-fuchsia-500",
    accent: "from-pink-500/0 via-pink-500 to-fuchsia-500/0",
    blob: "from-pink-400/20 to-fuchsia-400/20",
    glow: "hover:shadow-pink-500/20 hover:border-pink-400 dark:hover:border-pink-500/60",
    progress: "from-pink-500 to-fuchsia-500",
  },
  K: {
    badge: "from-rose-500 to-pink-500",
    accent: "from-rose-500/0 via-rose-500 to-pink-500/0",
    blob: "from-rose-400/20 to-pink-400/20",
    glow: "hover:shadow-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500/60",
    progress: "from-rose-500 to-pink-500",
  },
};

const CATEGORIA_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

const FALLBACK_COLORS = CATEGORIA_COLORS.E;

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
  const upper = categoria.categoria.toUpperCase();
  const colors = CATEGORIA_COLORS[upper] ?? FALLBACK_COLORS;
  const idx = CATEGORIA_ORDER.indexOf(upper);
  const progressPct = idx >= 0 ? ((idx + 1) / CATEGORIA_ORDER.length) * 100 : 50;

  return (
    <Link
      href={`/monotributo/categoria/${categoria.categoria.toLowerCase()}`}
      className={cn(
        "group relative block rounded-xl border border-border bg-white dark:bg-background p-4 overflow-hidden",
        "shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        colors.glow,
        className
      )}
    >
      {/* Accent line top — gradient that fades in on hover */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity",
          colors.accent
        )}
      />

      {/* Decorative blob — top right */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity bg-gradient-to-br",
          colors.blob
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold text-white shadow-sm bg-gradient-to-r",
              colors.badge
            )}
          >
            Categoría {categoria.categoria}
          </span>
          {!compact && (
            <p className="mt-2 text-xs text-muted-foreground">
              Tope anual:{" "}
              <span className="font-medium text-foreground/80">
                {currencyFormatter.format(categoria.ingresosBrutos)}
              </span>
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Cuota mensual</p>
          <p className="text-base md:text-lg font-bold text-foreground">
            {currencyFormatter.format(cuota)}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="relative mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Facturación mensual promedio</p>
            <p className="font-semibold text-foreground">
              {currencyFormatter.format(topeMensualImplicito)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Obra social</p>
            <p className="font-semibold text-foreground">
              {currencyFormatter.format(categoria.aportesObraSocial)}
            </p>
          </div>
        </div>
      )}

      {/* Progress bar — shows position in A→K scale */}
      {!compact && (
        <div className="relative mt-3">
          <div className="h-1 w-full rounded-full bg-muted/40 dark:bg-muted/30 overflow-hidden">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r transition-all", colors.progress)}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground/70 uppercase tracking-wide font-medium">
            <span>A</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              Ver detalles →
            </span>
            <span>K</span>
          </div>
        </div>
      )}
    </Link>
  );
}
