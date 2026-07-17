"use client";

import { useCallback, useState } from "react";

import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { TIPO_OFICIAL } from "@/lib/facturador/codes";
import type { AFIPInvoice } from "@/types/afip-scraper";
import type { EmissionPreview, EmissionResult, Plantilla, StoredInvoice } from "@/types/facturador";

export type EmitTarget =
  | { kind?: "facturaC"; plantilla: Plantilla; fecha?: string }
  | { kind: "notaCreditoC"; original: StoredInvoice; condicionIVA: string };

/** Separa el token de Turnstile del payload y arma headers + body según el target. */
function buildRequest(credsPayload: Record<string, unknown>, target: EmitTarget) {
  const { turnstileToken, ...creds } = credsPayload;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof turnstileToken === "string" && turnstileToken.length > 0) {
    headers["x-turnstile-token"] = turnstileToken;
  }
  const payload =
    target.kind === "notaCreditoC"
      ? { ...creds, kind: "notaCreditoC", original: target.original, condicionIVA: target.condicionIVA }
      : { ...creds, kind: "facturaC", plantilla: target.plantilla };
  return { headers, body: JSON.stringify(payload) };
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
   * Phase 1 — POST /api/arca/emit.
   * On success: stores preview, moves to "preview".
   * On error: moves to "error" with a descriptive message.
   */
  const startPreview = useCallback(
    async (target: EmitTarget, credsPayload: Record<string, unknown>): Promise<void> => {
      setPhase("previewing");
      setError(null);
      setPreview(null);

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
      setPhase("confirming");
      setError(null);
      setResult(null);

      try {
        const { headers, body } = buildRequest(credsPayload, target);
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

        // Parse numero from numeroCompleto (e.g. "00003-00000089" → 89)
        const numeroPart = emissionResult.numeroCompleto?.split("-")[1];
        const numero = numeroPart ? Number.parseInt(numeroPart, 10) : 0;

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

        addEmittedInvoice(afipInvoice);
        setPhase("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error de red al confirmar la emisión";
        setError(msg);
        setPhase("error");
      }
    },
    [addEmittedInvoice]
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setPreview(null);
    setResult(null);
    setError(null);
  }, []);

  return { phase, preview, result, error, startPreview, confirm, reset };
}
