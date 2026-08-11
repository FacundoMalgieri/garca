"use client";

import { useInvoiceContext } from "@/contexts/InvoiceContext";

interface LastSyncNoticeProps {
  /** Ausente sin empresa guardada: ahí no hay con qué re-consultar. */
  onRefresh?: () => void;
}

/**
 * Días de diferencia por fecha CALENDARIO, no por 24hs: de las 20:00 de ayer a
 * las 08:00 de hoy pasaron 12 horas, pero es ayer.
 */
function diasDesde(desde: Date, hasta: Date): number {
  const a = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const b = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Frescura en palabras. Es la pregunta real frente al banner —"¿esto está al
 * día?"— y una fecha absoluta obliga a calcularla mentalmente. Sin colores ni
 * umbrales: sigue informando, no alarma. Más de un mes no se cuenta en días
 * (nadie lee "hace 47 días"): ahí manda la fecha, que ya está al lado.
 */
function frescura(dias: number): string | null {
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  return null;
}

/**
 * Recordatorio de cuándo se trajeron los comprobantes por última vez. Sin
 * umbrales ni escalada de color a propósito: informa, no alarma.
 */
export function LastSyncNotice({ onRefresh }: LastSyncNoticeProps) {
  const { state } = useInvoiceContext();

  const sync = state.lastSyncedAt === null ? null : new Date(state.lastSyncedAt);
  const fecha =
    sync === null
      ? null
      : sync.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const cuando = sync === null ? null : frescura(diasDesde(sync, new Date()));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {/* La fecha en mono porque es un dato, igual que todos los importes del
            panel. La frescura adelante porque es lo que se viene a saber. */}
        <p className="text-sm text-foreground">
          {fecha === null ? (
            "Fecha de actualización desconocida."
          ) : (
            <>
              Comprobantes actualizados {cuando ? `${cuando} · ` : "el "}
              <span className="font-mono text-[13px]">{fecha}</span>
            </>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {onRefresh
            ? "Si emitís desde ARCA, actualizá para verlos acá."
            : "No tenemos guardada la empresa de la sesión, así que para actualizarlos usá \"Limpiar Datos\" y volvé a ingresar."}
        </p>
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          /* El token --color-primary es el MISMO en light y dark (#262F55), así
             que `text-primary` sobre el fondo oscuro daba ~1.4:1 y el botón era
             invisible. En dark se pasa a un azul claro (~10.8:1). Mismo idioma
             que el resto del panel, que ya hace `text-primary dark:text-blue-*`. */
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors cursor-pointer hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/20 dark:focus-visible:ring-blue-400"
        >
          <RefreshIcon />
          Actualizar
        </button>
      )}
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 11v-5h-5M20 9A8 8 0 006.3 6.3L4 9m0 6a8 8 0 0013.7 2.7L20 15" />
    </svg>
  );
}
