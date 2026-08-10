"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { LoadingSplash } from "@/components/LoadingSplash";
import { DateRangePicker } from "@/components/LoginForm/components/DateRangePicker";
import { PasswordInput } from "@/components/LoginForm/components/PasswordInput";
import { validateDateRange } from "@/components/LoginForm/utils/validation";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/TurnstileWidget";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { getDefaultDateRange } from "@/hooks/useInvoices";
import { useModalA11y } from "@/hooks/useModalA11y";
import { getUserFacingError } from "@/lib/errors/user-message";

interface RefreshInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Re-trae los comprobantes sin rehacer el login: el CUIT y el índice de empresa
 * salen de la sesión guardada y sólo se pide la clave (que no persistimos) más
 * el rango, que no guardamos a propósito.
 *
 * Pasa replaceLocal: descarta todo lo local, incluidas las emitidas por GARCA,
 * y se queda con lo que devuelve ARCA. Una emitida que ARCA todavía no indexó
 * reaparece en el refresh siguiente.
 */
export function RefreshInvoicesModal({ isOpen, onClose }: RefreshInvoicesModalProps) {
  const { state, fetchInvoicesWithCompany, cancelOperation, clearError } = useInvoiceContext();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const defaultRange = getDefaultDateRange();
  const [fechaDesde, setFechaDesde] = useState(defaultRange.from);
  const [fechaHasta, setFechaHasta] = useState(defaultRange.to);
  // La sección de error se muestra sólo después de un intento propio. El
  // cierre por `handleClose` ya llama a `clearError()`, pero el contexto puede
  // traer un error de otro origen (un fetch fallido de /ingresar, o un cierre
  // que no pasó por handleClose): esta bandera evita que el modal lo adopte
  // como si fuera el resultado de su propio submit.
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // La clave no se guarda ni se retiene entre aperturas.
  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setTurnstileToken(null);
      setHasSubmitted(false);
    }
  }, [isOpen]);

  const rearmTurnstile = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  // Mismo tope que /ingresar (rango invertido y más de 366 días): el server
  // sólo valida el formato, así que si el modal no lo chequea un rango de
  // varios años llega derecho al scraper.
  const dateError = validateDateRange(fechaDesde, fechaHasta);

  const puedeEnviar =
    password.length > 0 &&
    turnstileToken !== null &&
    !state.isLoading &&
    dateError === null &&
    // Sin empresa guardada no hay CUIT ni índice con qué re-consultar: el
    // submit sería un no-op silencioso.
    state.company !== null;

  const handleClose = () => {
    // Durante la carga sólo se ve el splash con su propio Cancelar (ver el
    // branch de `state.isLoading` más abajo), pero el listener de Escape del
    // hook de a11y sigue atado a `document` sin importar qué se esté
    // renderizando. Escape queda inerte a propósito: es una tecla fácil de
    // apretar sin querer y abortar un scraping de varios minutos por accidente
    // es peor que no hacer nada; para cortar está el botón explícito.
    // Se gatea acá adentro (no en el `isOpen` que recibe useModalA11y) porque
    // alternar ese argumento dispara el cleanup de foco-restore del hook en
    // cada transición true→false→true, lo que saca el foco al fondo de la
    // página durante la carga.
    if (state.isLoading) return;
    setPassword("");
    rearmTurnstile();
    // El error del contexto no se limpia solo: sin esto, un refresh fallido
    // deja el cartel rojo en InvoiceTable y rompe el redirect de /ingresar
    // para el resto de la sesión.
    clearError();
    onClose();
  };

  // Aborta el fetch en curso y vuelve al panel. `cancelOperation` conserva
  // `hasQueried`, así que /panel no expulsa al usuario a /ingresar.
  const handleCancelFetch = () => {
    cancelOperation();
    setPassword("");
    rearmTurnstile();
    clearError();
    onClose();
  };

  const handleSubmit = () => {
    if (!puedeEnviar || !state.company) return;
    setHasSubmitted(true);
    void fetchInvoicesWithCompany(
      state.company.cuit,
      password,
      state.company.index,
      { from: fechaDesde, to: fechaHasta },
      "EMISOR",
      turnstileToken ?? undefined,
      true
    ).then((ok) => {
      setPassword("");
      rearmTurnstile();
      if (ok) onClose();
    });
  };

  const active = isOpen && mounted;
  const titleId = "refresh-invoices-modal-title";
  const dialogRef = useModalA11y<HTMLDivElement>(active, handleClose);

  if (!active) return null;

  // Mientras el fetch está en curso se esconde la tarjeta del formulario: si
  // el backdrop/tarjeta quedan montados encima (ambos son `fixed` con z-index
  // explícito, así que compiten por la misma capa), el splash termina tapado
  // por la tarjeta opaca y el scraping se ve "colgado" sin spinner ni
  // progreso. Encima del splash queda un único botón para cortar: la petición
  // SÍ se aborta (`cancelOperation` corta `invoicesAbortRef`), así que un
  // refresh que quedó largo no puede aterrizar más tarde y pisar lo que el
  // usuario hizo mientras tanto (p. ej. una factura recién emitida).
  if (state.isLoading) {
    return createPortal(
      <>
        <LoadingSplash isLoading message="Actualizando comprobantes…" progress={state.progress} />
        <div className="fixed inset-x-0 bottom-4 z-[110] flex justify-center px-4">
          <button
            type="button"
            onClick={handleCancelFetch}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-lg transition-colors hover:bg-muted cursor-pointer"
          >
            Cancelar actualización
          </button>
        </div>
      </>,
      document.body
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg"
      >
        <h2 id={titleId} className="mb-2 text-lg font-semibold">
          🔒 Reingresá tu clave para actualizar
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Por seguridad no guardamos tu clave fiscal. Se descarta al terminar. Vamos a reemplazar
          los comprobantes guardados por los que devuelva ARCA.
        </p>

        <label className="mb-1 block text-xs text-muted-foreground">CUIT</label>
        <div className="mb-3 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          {state.company?.cuit}
        </div>

        <div className="mb-3">
          <PasswordInput value={password} onChange={setPassword} disabled={state.isLoading} />
        </div>

        <div className="mb-4">
          <DateRangePicker
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            onFechaDesdeChange={setFechaDesde}
            onFechaHastaChange={setFechaHasta}
            error={dateError}
            disabled={state.isLoading}
            maxDate={defaultRange.to}
          />
        </div>

        <TurnstileWidget
          ref={turnstileRef}
          onSuccess={setTurnstileToken}
          onExpired={rearmTurnstile}
          onError={rearmTurnstile}
        />

        {hasSubmitted && state.error && (
          <p className="mt-3 text-sm text-destructive">
            {getUserFacingError(state.error, state.errorCode)}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!puedeEnviar}
            className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground cursor-pointer hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Traer comprobantes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
