"use client";

import { useCallback, useRef, useState } from "react";

import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { saveClientHint } from "@/lib/facturador/client-memory";
import { TIPO_OFICIAL } from "@/lib/facturador/codes";
import type { AFIPInvoice } from "@/types/afip-scraper";
import type { EmissionPreview, EmissionResult, Plantilla, StoredInvoice } from "@/types/facturador";

export type EmitTarget =
  | { kind?: "facturaC"; plantilla: Plantilla; fecha?: string }
  | { kind: "notaCreditoC"; original: StoredInvoice; condicionIVA: string };

/**
 * Separa el token de Turnstile del payload y arma headers + body según el target.
 *
 * `idempotencyKey` (Contrato A): sólo se agrega al body cuando se provee (fase
 * confirm). El server la usa para deduplicar reintentos de emisión y NO re-emitir
 * un comprobante ya asignado. La key la maneja el hook (ver `idempotencyKeyRef`).
 */
function buildRequest(
  credsPayload: Record<string, unknown>,
  target: EmitTarget,
  idempotencyKey?: string
) {
  const { turnstileToken, ...creds } = credsPayload;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof turnstileToken === "string" && turnstileToken.length > 0) {
    headers["x-turnstile-token"] = turnstileToken;
  }
  const base =
    target.kind === "notaCreditoC"
      ? { ...creds, kind: "notaCreditoC", original: target.original, condicionIVA: target.condicionIVA }
      : { ...creds, kind: "facturaC", plantilla: target.plantilla };
  const payload = idempotencyKey ? { ...base, idempotencyKey } : base;
  return { headers, body: JSON.stringify(payload) };
}

/**
 * Deriva el número de comprobante desde `numeroCompleto` (ej. "00003-00000089" → 89).
 *
 * [L2-hooks] Hardening: si no hay guion, no colapsamos a 0 ciegamente (eso genera
 * claves de dedupe colisionantes entre comprobantes distintos). Intentamos extraer
 * los dígitos del último segmento disponible; sólo caemos a 0 si no hay dígito alguno.
 */
function parseNumeroFromCompleto(numeroCompleto: string | undefined): number {
  if (!numeroCompleto) return 0;
  const segments = numeroCompleto.split("-");
  const last = segments[segments.length - 1] ?? "";
  const digits = last.replace(/\D/g, "");
  if (digits.length === 0) return 0;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

export type EmissionPhase = "idle" | "previewing" | "preview" | "confirming" | "done" | "error";

export interface UseEmissionReturn {
  phase: EmissionPhase;
  preview: EmissionPreview | null;
  result: EmissionResult | null;
  error: string | null;
  startPreview: (target: EmitTarget, credsPayload: Record<string, unknown>) => Promise<void>;
  confirm: (target: EmitTarget, credsPayload: Record<string, unknown>) => Promise<void>;
  reset: () => void;
}

/**
 * Drives the 2-phase emission flow (preview → confirm) and appends the
 * confirmed invoice to InvoiceContext via addEmittedInvoice.
 *
 * `credsPayload` is an opaque object assembled by the caller that mirrors the
 * encrypted fields expected by the routes (cuit, password, encrypted, and any
 * optional fields like fecha, companyIndex). The hook just forwards it merged
 * with `{ plantilla }`.
 */
export function useEmission(): UseEmissionReturn {
  const { addEmittedInvoice } = useInvoiceContext();

  const [phase, setPhase] = useState<EmissionPhase>("idle");
  const [preview, setPreview] = useState<EmissionPreview | null>(null);
  const [result, setResult] = useState<EmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * [H2] Guard anti doble-click sincrónico: si ya hay un `confirm()` en vuelo,
   * el segundo es no-op (no dispara un segundo fetch de emisión).
   */
  const inFlightRef = useRef(false);

  /**
   * [Contrato A — CRÍTICO P0] idempotencyKey estable por comprobante.
   * - Se genera fresca SÓLO al arrancar un preview (`startPreview`) = un comprobante.
   * - `confirm()` SIEMPRE reusa esta key, INCLUIDOS los reintentos tras error.
   * - `reset()` NO la toca: un retry post-error re-llama `confirm()` con la MISMA
   *   key, así el server devuelve el result cacheado en vez de re-emitir un
   *   duplicado legal (caso: la red se corta DESPUÉS de que AFIP asignó el CAE).
   * Fallback: si se llama `confirm()` sin preview previo, se genera una vez acá
   *   (primer intento) y se reusa en los reintentos.
   */
  const idempotencyKeyRef = useRef<string | null>(null);

  /**
   * Phase 1 — POST /api/arca/emit.
   * On success: stores preview, moves to "preview".
   * On error: moves to "error" with a descriptive message.
   */
  const startPreview = useCallback(
    async (target: EmitTarget, credsPayload: Record<string, unknown>): Promise<void> => {
      setPhase("previewing");
      setError(null);
      setPreview(null);

      // [Contrato A P0] Un nuevo preview = un comprobante nuevo → key fresca.
      // Este es el ÚNICO lugar donde la key se regenera.
      idempotencyKeyRef.current = crypto.randomUUID();

      try {
        const { headers, body } = buildRequest(credsPayload, target);
        const response = await fetch("/api/arca/emit", { method: "POST", headers, body });

        let data: Record<string, unknown>;
        try {
          data = await response.json();
        } catch {
          setError("Error al parsear la respuesta del servidor");
          setPhase("error");
          return;
        }

        if (!response.ok || data.error) {
          const msg =
            typeof data.error === "string"
              ? data.error
              : `Error ${response.status} al obtener el preview`;
          setError(msg);
          setPhase("error");
          return;
        }

        // The route wraps the preview under `preview` key on success
        const previewData = (data.preview ?? data) as EmissionPreview;
        setPreview(previewData);
        setPhase("preview");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error de red al obtener el preview";
        setError(msg);
        setPhase("error");
      }
    },
    []
  );

  /**
   * Phase 2 — POST /api/arca/emit/confirm.
   * ⚠️  IRREVERSIBLE — only call after the user has reviewed the preview.
   * On success: stores result, maps to AFIPInvoice, calls addEmittedInvoice,
   * moves to "done".
   */
  const confirm = useCallback(
    async (target: EmitTarget, credsPayload: Record<string, unknown>): Promise<void> => {
      // [H2] Anti doble-click: si ya hay una emisión en vuelo, no dispares otra.
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      setPhase("confirming");
      setError(null);
      setResult(null);

      // [Contrato A P0] Reusar la key del ref (fresca desde startPreview, o
      // generada acá una sola vez si se confirmó sin preview previo). Nunca se
      // regenera en un retry: eso es lo que evita la re-emisión duplicada.
      if (idempotencyKeyRef.current === null) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }
      const idempotencyKey = idempotencyKeyRef.current;

      try {
        const { headers, body } = buildRequest(credsPayload, target, idempotencyKey);
        const response = await fetch("/api/arca/emit/confirm", { method: "POST", headers, body });

        let data: Record<string, unknown>;
        try {
          data = await response.json();
        } catch {
          setError("Error al parsear la respuesta del servidor");
          setPhase("error");
          return;
        }

        if (!response.ok || data.error) {
          const msg =
            typeof data.error === "string"
              ? data.error
              : `Error ${response.status} al confirmar la emisión`;
          setError(msg);
          setPhase("error");
          return;
        }

        // The route wraps the result under `result` key on success
        const emissionResult = (data.result ?? data) as EmissionResult;
        setResult(emissionResult);

        // Map EmissionResult → AFIPInvoice and append to context
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const todayStr = `${dd}/${mm}/${yyyy}`;

        // Parse numero from numeroCompleto (e.g. "00003-00000089" → 89).
        // [L2-hooks] Hardening: sin guion, no colapsar a 0 ciegamente.
        const numero = parseNumeroFromCompleto(emissionResult.numeroCompleto);

        const esNC = target.kind === "notaCreditoC";
        const afipInvoice: AFIPInvoice & { emittedByGarca: true } = {
          fecha: todayStr,
          tipo: esNC ? "NOTA DE CREDITO C" : "FACTURA C",
          tipoComprobante: esNC ? TIPO_OFICIAL.notaCreditoC : TIPO_OFICIAL.facturaC,
          puntoVenta: Number(emissionResult.puntoVenta),
          numero,
          numeroCompleto: emissionResult.numeroCompleto,
          cuitReceptor: emissionResult.receptor.cuit,
          razonSocialReceptor: emissionResult.receptor.razonSocial,
          importeNeto: emissionResult.importeTotal,
          importeTotal: emissionResult.importeTotal,
          importeIVA: 0,
          moneda: "ARS",
          cae: emissionResult.cae,
          vencimientoCae: emissionResult.vencimientoCae,
          cuitEmisor: "",
          razonSocialEmisor: emissionResult.emisor.razonSocial,
          emittedByGarca: true,
        };

        // [Contrato B] `cae === ""` (emitida legalmente, CAE pendiente vía
        // Consultas) NO es error: seguimos a "done" y la UI (WS5) deriva el
        // estado "CAE pendiente" desde el cae vacío.
        addEmittedInvoice(afipInvoice);

        // [Task 6] Recordar el cliente (razón social real + condición IVA/venta)
        // para autocompletar la próxima vez. Solo facturas, no NC (no hay "cliente
        // nuevo" en una NC — es la misma factura original que se anula).
        if (target.kind !== "notaCreditoC") {
          const c = target.plantilla?.cliente;
          if (c?.nroDoc) {
            saveClientHint(c.nroDoc, {
              razonSocial: emissionResult.receptor.razonSocial || c.razonSocial,
              condicionIVA: c.condicionIVA,
              condicionVenta: c.condicionVenta,
            });
          }
        }

        setPhase("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error de red al confirmar la emisión";
        setError(msg);
        setPhase("error");
      } finally {
        // [H2] Liberar el guard pase lo que pase (éxito, error, o early-return).
        inFlightRef.current = false;
      }
    },
    [addEmittedInvoice]
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setPreview(null);
    setResult(null);
    setError(null);
    // [Contrato A P0] NO tocar `idempotencyKeyRef` acá: un retry post-error
    // re-llama `confirm()` (posiblemente tras un reset de UI) y debe mandar la
    // MISMA key para que el server no re-emita un duplicado legal. La key sólo
    // se regenera al arrancar un nuevo comprobante (startPreview).
  }, []);

  return { phase, preview, result, error, startPreview, confirm, reset };
}
