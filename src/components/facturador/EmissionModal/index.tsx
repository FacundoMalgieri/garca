"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { formatCurrency } from "@/components/InvoiceTable/utils/formatters";
import { LoadingSplash } from "@/components/LoadingSplash";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/TurnstileWidget";
import { useEmission } from "@/hooks/useEmission";
import { useModalA11y } from "@/hooks/useModalA11y";
import { encryptCredentials } from "@/lib/crypto";
import { COND_IVA_RECEPTOR } from "@/lib/facturador/codes";
import { formatDMY } from "@/lib/facturador/dates";
import { computeTopeAlert } from "@/lib/facturador/tope";
import type { Plantilla, StoredInvoice } from "@/types/facturador";

interface EmissionModalProps {
  isOpen: boolean;
  mode?: "emit" | "creditNote";
  plantilla?: Plantilla | null;
  invoiceToVoid?: StoredInvoice | null;
  cuit: string;
  companyIndex: number;
  margenDisponible: number | null;
  onClose: () => void;
}

export function EmissionModal({ isOpen, mode = "emit", plantilla, invoiceToVoid, cuit, companyIndex, margenDisponible, onClose }: EmissionModalProps) {
  const { phase, preview, result, error, startPreview, confirm, reset } = useEmission();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [typed, setTyped] = useState("");
  const [ncCondIVA, setNcCondIVA] = useState<string>(COND_IVA_RECEPTOR.consumidorFinal);
  const passwordRef = useRef<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  useEffect(() => setMounted(true), []);
  const target = mode === "creditNote" ? invoiceToVoid : plantilla;
  const esNC = mode === "creditNote";
  const necesitaCondIVA = esNC && invoiceToVoid !== null && invoiceToVoid !== undefined && !invoiceToVoid.emittedByGarca;

  const buildCreds = (token: string | null) => ({
    ...encryptCredentials(cuit, passwordRef.current),
    companyIndex,
    fecha: formatDMY(new Date()),
    turnstileToken: token,
  });

  const buildTarget = () =>
    esNC
      ? { kind: "notaCreditoC" as const, original: invoiceToVoid as StoredInvoice, condicionIVA: ncCondIVA }
      : { kind: "facturaC" as const, plantilla: plantilla as Plantilla };

  const handleGeneratePreview = () => {
    passwordRef.current = password;
    startPreview(buildTarget(), buildCreds(turnstileToken));
    turnstileRef.current?.reset();
    setTurnstileToken(null);
  };

  const handleConfirm = () => confirm(buildTarget(), buildCreds(turnstileToken));

  const handleReset = () => {
    // Defense-in-depth: descartar la clave en plano también al "emitir otra",
    // no solo al cerrar. Se re-ingresa en el próximo preview.
    passwordRef.current = "";
    setPassword(""); setAgree(false); setTyped(""); setTurnstileToken(null); setNcCondIVA(COND_IVA_RECEPTOR.consumidorFinal);
    turnstileRef.current?.reset();
    reset();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleBackdrop = (e: React.MouseEvent) => { if (e.target === e.currentTarget) handleClose(); };

  // [Contrato A P0] Diferenciar el error de fase-preview (fase 1, no se emitió
  // nada → seguro re-previsualizar/resetear) del error de fase-confirm (fase 2,
  // la emisión pudo haber ocurrido → NO resetear; re-llamar confirm() reusa la
  // MISMA idempotencyKey (ref de useEmission) y el server devuelve el CAE
  // cacheado en vez de re-emitir un duplicado legal).
  // `preview !== null` es el estado observable que lo distingue: startPreview
  // limpia `preview` al arrancar (error fase 1 → preview null); confirm no lo
  // toca (error fase 2 → preview sigue seteado).
  const confirmFailed = phase === "error" && preview !== null;

  // [Contrato A P0] En el retry post-confirm re-solvemos Turnstile pero NO
  // reseteamos: confirm() reusa la key estable, evitando la doble emisión.
  const handleRetryConfirm = () => confirm(buildTarget(), buildCreds(turnstileToken));

  const tope = !esNC && preview ? computeTopeAlert(margenDisponible !== null ? { margenDisponible } : null, preview.importeTotal) : null;
  const canConfirm = agree && typed.trim().toUpperCase() === "EMITIR" && !!turnstileToken;

  // [Contrato B] Emisión confirmada legalmente pero sin CAE resuelto vía
  // Consultas. NO es error: la factura YA se emitió.
  const caePendiente = phase === "done" && !!result && !result.cae;

  const titleId = "emission-modal-title";
  const active = isOpen && mounted && !!target;
  const dialogRef = useModalA11y<HTMLDivElement>(active, handleClose);
  if (!active) return null;

  return createPortal(
    <div data-testid="emission-backdrop" className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-2xl">

        {phase === "idle" && (
          <div className="p-6">
            <h2 id={titleId} className="text-lg font-semibold mb-2">{esNC ? "🔒 Reingresá tu clave para deshacer" : "🔒 Reingresá tu clave"}</h2>
            <p className="text-sm text-muted-foreground mb-4">Por seguridad no guardamos tu clave fiscal. Reingresala para emitir esta factura; se descarta al terminar.</p>
            <label className="block text-xs text-muted-foreground mb-1">CUIT</label>
            <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground mb-3">{cuit}</div>
            {necesitaCondIVA && (
              <div className="mb-3">
                <label className="block text-xs text-muted-foreground mb-1">Condición frente al IVA del receptor</label>
                <select data-testid="nc-cond-iva" value={ncCondIVA} onChange={(e) => setNcCondIVA(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="5">Consumidor Final</option>
                  <option value="1">IVA Responsable Inscripto</option>
                  <option value="6">Responsable Monotributo</option>
                  <option value="4">IVA Sujeto Exento</option>
                </select>
              </div>
            )}
            <label className="block text-xs text-muted-foreground mb-1">Clave fiscal</label>
            <input data-testid="clave-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mb-4" />
            <TurnstileWidget ref={turnstileRef} onSuccess={setTurnstileToken} onExpired={() => setTurnstileToken(null)} onError={() => setTurnstileToken(null)} />
            <div className="flex gap-2 mt-4">
              <button onClick={handleClose} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted cursor-pointer">Cancelar</button>
              <button onClick={handleGeneratePreview} disabled={!password || !turnstileToken} className="flex-[2] rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer">Generar preview →</button>
            </div>
          </div>
        )}

        {(phase === "previewing" || phase === "confirming") && (
          <LoadingSplash
            isLoading
            message={phase === "previewing" ? "Conectando con ARCA" : "Emitiendo el comprobante"}
          />
        )}

        {phase === "preview" && preview && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="text-lg font-semibold">{esNC ? "Deshacer factura" : "Revisá antes de emitir"}</h2>
              <span className="rounded-md bg-muted px-2 py-1 text-xs text-primary dark:text-primary-foreground">{esNC ? "NOTA DE CRÉDITO C · PV " : "FACTURA C · PV "}{preview.puntoVenta}</span>
            </div>

            <PreviewBlock title="Emisor" rows={[
              ["Razón social", preview.emisor.razonSocial], ["Punto de venta", preview.emisor.puntoVenta],
              ["Domicilio", preview.emisor.domicilio], ["Concepto", preview.emisor.concepto],
              ["Período desde", preview.emisor.periodoDesde ?? "—"], ["Período hasta", preview.emisor.periodoHasta ?? "—"],
              ["Vto. pago", preview.emisor.vtoPago ?? "—"],
            ]} />

            <PreviewBlock title="Receptor" rows={[
              ["CUIT", preview.receptor.cuit], ["Razón social", preview.receptor.razonSocial],
              ["Domicilio", preview.receptor.domicilio], ["Email", preview.receptor.email],
              ["Cond. IVA", preview.receptor.condicionIVA], ["Cond. venta", preview.receptor.condicionVenta],
            ]} />

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs uppercase tracking-wide text-primary dark:text-primary-foreground mb-2">Detalle</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-muted-foreground text-right">
                    <th className="text-left py-1">Descripción</th><th>Cant.</th><th>Unidad</th><th>P.Unit</th><th>Bonif%</th><th>Bonif$</th><th>Subtotal</th>
                  </tr></thead>
                  <tbody>
                    {preview.lineas.map((l, i) => (
                      <tr key={i} className="text-right border-t border-border">
                        <td className="text-left py-1">{l.descripcion}</td><td>{l.cantidad}</td><td>{l.unidad}</td>
                        <td>{formatCurrency(l.precioUnitario)}</td><td>{l.porcentajeBonificacion}%</td>
                        <td>{formatCurrency(l.importeBonificacion)}</td><td>{formatCurrency(l.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${formatCurrency(preview.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Otros tributos</span><span>${formatCurrency(preview.importeOtrosTributos)}</span></div>
                <div className="flex justify-between border-t border-border pt-1 text-xl font-bold"><span>TOTAL</span><span>{formatCurrency(preview.importeTotal)}</span></div>
              </div>
            </div>

            {tope && (
              <div data-testid="tope-alert" className={`rounded-lg border px-3 py-2 text-sm ${
                tope.level === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : tope.level === "warning" ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-destructive/50 bg-destructive/10 text-destructive"
              }`}>
                {tope.level === "exceeds"
                  ? `⚠️ Esta factura supera tu tope de categoría por $${formatCurrency(Math.abs(tope.margenRestante))}.`
                  : `Después de esta factura te quedan $${formatCurrency(tope.margenRestante)} de margen en tu categoría.`}
              </div>
            )}

            <div className="rounded-lg border border-[#FF6B5C]/50 bg-[#FF6B5C]/10 p-4">
              <p className="text-sm font-medium text-[#FF6B5C] mb-2">{esNC ? "⚠️ Esto emite una Nota de Crédito real e irreversible." : `⚠️ Esto es REAL. Se emite en tu punto de venta ${preview.puntoVenta} y no se puede deshacer (solo con una Nota de Crédito).`}</p>
              <p data-testid="modal-total" className="text-center text-2xl font-extrabold mb-3">{esNC ? "Vas a emitir una NC por $" : "Vas a emitir $"}{formatCurrency(preview.importeTotal)}</p>
              <label className="flex items-start gap-2 text-sm mb-2 cursor-pointer">
                <input data-testid="confirm-check" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
                <span>{esNC ? "Confirmo que revisé los datos y quiero emitir esta nota de crédito real." : "Confirmo que revisé los datos y quiero emitir esta factura real."}</span>
              </label>
              <label className="block text-xs text-muted-foreground mb-1">Escribí <b>EMITIR</b> para habilitar:</label>
              <input data-testid="confirm-typed" value={typed} onChange={(e) => setTyped(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mb-3" />
              <TurnstileWidget ref={turnstileRef} onSuccess={setTurnstileToken} onExpired={() => setTurnstileToken(null)} onError={() => setTurnstileToken(null)} />
              <div className="flex gap-2 mt-3">
                <button onClick={handleClose} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted cursor-pointer">Cancelar</button>
                <button onClick={handleConfirm} disabled={!canConfirm} className="flex-[2] rounded-lg bg-[#FF6B5C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#FF6B5C]/90 disabled:opacity-50 cursor-pointer">{esNC ? "Emitir Nota de Crédito" : "Emitir factura"}</button>
              </div>
            </div>
          </div>
        )}

        {phase === "done" && result && (
          <div className="p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p id={titleId} className="font-semibold text-emerald-600 dark:text-emerald-400">{esNC ? "Nota de crédito emitida" : "Factura emitida"}</p>
            {result.numeroCompleto && <p className="text-2xl font-bold my-2">{result.numeroCompleto}</p>}
            {caePendiente && (
              <p data-testid="cae-pendiente" className="mx-auto max-w-xs rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400 my-2">
                Emitida — CAE pendiente de confirmación. El comprobante ya está emitido; el CAE se verá al refrescar tus comprobantes desde ARCA.
              </p>
            )}
            <div className="mx-auto max-w-xs rounded-lg border border-border p-3 text-sm space-y-1 text-left">
              {result.cae && <div className="flex justify-between"><span className="text-muted-foreground">CAE</span><span>{result.cae}</span></div>}
              {result.vencimientoCae && <div className="flex justify-between"><span className="text-muted-foreground">Vto. CAE</span><span>{result.vencimientoCae}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>${formatCurrency(result.importeTotal)}</span></div>
            </div>
            {result.pdfBase64 && (
              <a href={`data:application/pdf;base64,${result.pdfBase64}`} download={`${result.numeroCompleto}.pdf`} className="mt-4 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer">⬇ Descargar PDF</a>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={handleReset} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted cursor-pointer">Emitir otra</button>
              <button onClick={handleClose} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted cursor-pointer">Cerrar</button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Ya quedó agregada a tus facturas.</p>
          </div>
        )}

        {phase === "error" && (
          <div className="p-6">
            <h2 id={titleId} className="text-lg font-semibold text-destructive mb-2">No se pudo completar la emisión</h2>
            <p className="text-sm mb-3">{error}</p>
            {confirmFailed && (
              <>
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400 mb-3">
                  Antes de reintentar, verificá en <b>Mis Comprobantes</b> de ARCA si la factura ya se emitió, para no duplicarla.
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Reintentando no se vuelve a emitir: si el comprobante ya se emitió, se recupera automáticamente.
                </p>
                <TurnstileWidget ref={turnstileRef} onSuccess={setTurnstileToken} onExpired={() => setTurnstileToken(null)} onError={() => setTurnstileToken(null)} />
              </>
            )}
            <div className="flex gap-2 mt-3">
              {confirmFailed ? (
                <button data-testid="retry-confirm" onClick={handleRetryConfirm} disabled={!turnstileToken} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted disabled:opacity-50 cursor-pointer">Reintentar</button>
              ) : (
                <button data-testid="retry-reset" onClick={handleReset} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted cursor-pointer">Reintentar</button>
              )}
              <button onClick={handleClose} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted cursor-pointer">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function PreviewBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  // Ocultamos filas sin valor (ej. un Consumidor Final no tiene CUIT/razón social/
  // domicilio/email) para que el bloque no muestre etiquetas vacías.
  const visibleRows = rows.filter(([, v]) => v != null && v.trim() !== "" && v.trim() !== "—");
  if (visibleRows.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-wide text-primary dark:text-primary-foreground mb-2">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
        {visibleRows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-dashed border-border py-1">
            <span className="text-muted-foreground shrink-0">{k}</span><span className="text-right break-words">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
