"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { LoadingSplash } from "@/components/LoadingSplash";
import { DateRangePicker } from "@/components/LoginForm/components/DateRangePicker";
import { PasswordInput } from "@/components/LoginForm/components/PasswordInput";
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
  const { state, fetchInvoicesWithCompany } = useInvoiceContext();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const defaultRange = getDefaultDateRange();
  const [fechaDesde, setFechaDesde] = useState(defaultRange.from);
  const [fechaHasta, setFechaHasta] = useState(defaultRange.to);
  // El error del contexto solo se limpia cuando arranca un fetch nuevo, no
  // cuando el modal se cierra. Sin esta bandera local, cerrar el modal tras un
  // submit fallido y reabrirlo más tarde (sin volver a enviar) mostraría de
  // nuevo el error viejo. Se gatea la sección de error con esto en vez de
  // tocarle los semánticos de error al hook/contexto para el resto de
  // consumidores.
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

  const puedeEnviar = password.length > 0 && turnstileToken !== null && !state.isLoading;

  const handleClose = () => {
    // Mientras el fetch está en curso no hay Cancelar ni backdrop en pantalla
    // (ver el branch de `state.isLoading` más abajo), pero el listener de
    // Escape del hook de a11y sigue atado a `document` sin importar qué se
    // esté renderizando. Sin esta guarda, Escape cerraría el modal a mitad de
    // una carga no abortable y el resultado llegaría al contexto con el modal
    // ya desmontado — el mismo agujero que ocultar la tarjeta buscaba cerrar.
    // Se gatea acá adentro (no en el `isOpen` que recibe useModalA11y) porque
    // alternar ese argumento dispara el cleanup de foco-restore del hook en
    // cada transición true→false→true, lo que saca el foco al fondo de la
    // página durante la carga; no vale la pena por un cierre que de por sí no
    // debe ocurrir.
    if (state.isLoading) return;
    setPassword("");
    rearmTurnstile();
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

  // Mientras el fetch está en curso se muestra SOLO el splash de progreso: si
  // el backdrop/tarjeta del modal quedan montados encima (ambos son `fixed`
  // con z-index explícito, así que compiten por la misma capa), el splash
  // termina tapado por la tarjeta opaca y el scraping se ve "colgado" sin
  // spinner ni progreso. Como bonus, sin la tarjeta montada no hay botón
  // Cancelar ni backdrop para cerrar el modal a mitad del fetch (que no se
  // aborta) y perder de vista un resultado que igual va a llegar al contexto.
  if (state.isLoading) {
    return createPortal(
      <LoadingSplash isLoading message="Actualizando comprobantes…" progress={state.progress} />,
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
            error={null}
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
