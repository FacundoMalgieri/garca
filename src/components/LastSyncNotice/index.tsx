"use client";

import { useInvoiceContext } from "@/contexts/InvoiceContext";

interface LastSyncNoticeProps {
  /**
   * Ausente cuando no hay de dónde re-consultar (sin empresa guardada): en ese
   * caso no se ofrece Actualizar, porque el modal no tendría CUIT ni índice de
   * empresa y el submit sería un no-op silencioso.
   */
  onRefresh?: () => void;
}

/**
 * Recordatorio neutro de cuándo se trajeron los comprobantes por última vez.
 * Sin umbrales ni escalada de color a propósito: informa, no alarma. Reemplaza
 * al TTL de 24 h que antes forzaba a re-scrapear.
 */
export function LastSyncNotice({ onRefresh }: LastSyncNoticeProps) {
  const { state } = useInvoiceContext();

  const fecha =
    state.lastSyncedAt === null
      ? null
      : new Date(state.lastSyncedAt).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        {fecha === null ? (
          <>Fecha de actualización desconocida.</>
        ) : (
          <>Comprobantes actualizados el {fecha}.</>
        )}{" "}
        {onRefresh
          ? "Si emitís desde ARCA, actualizá para verlos acá."
          : "No tenemos guardada la empresa de la sesión, así que para actualizarlos vas a tener que ingresar de nuevo con tu clave fiscal."}
      </p>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="shrink-0 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 cursor-pointer"
        >
          Actualizar
        </button>
      )}
    </div>
  );
}
