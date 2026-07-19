/**
 * AFIP Emission Confirm API Route.
 *
 * ⚠️  IRREVERSIBLE — confirms the emission and assigns a CAE.
 * Once this route is called successfully, the invoice is legally registered
 * with AFIP. There is no undo.
 */

import { NextRequest, NextResponse } from "next/server";

import { withConcurrencyLimit } from "@/lib/concurrency";
import { decryptCredentials } from "@/lib/crypto";
import { buildCreditNote } from "@/lib/facturador/credit-note";
import { createIdempotencyStore } from "@/lib/facturador/idempotency";
import { validateEmitBody } from "@/lib/facturador/validate-emit-body";
import { confirmEmissionFlow } from "@/lib/scrapers/afip/emit";
import { performSecurityChecks } from "@/lib/security";
import type { AFIPCredentials } from "@/types/afip-scraper";
import type { EmissionResult, Plantilla, StoredInvoice } from "@/types/facturador";

/**
 * Store de idempotencia a nivel módulo (Contrato A).
 * ⚠️ Es por-instancia (por-lambda) en serverless: no cubre cold starts, page
 * reload, ni requests que caigan en otra instancia. Combinado con el
 * `idempotencyKey` estable del cliente (que sobrevive los reintentos post-error)
 * cubre el caso realista de retry contra el MISMO lambda caliente. La cobertura
 * cross-instance real (Redis/KV) queda fuera de alcance (M5).
 */
const emissionStore = createIdempotencyStore<EmissionResult>();

/**
 * POST /api/arca/emit/confirm
 *
 * ⚠️  IRREVERSIBLE — only call after the user has reviewed the preview returned
 * by POST /api/arca/emit.
 *
 * Body:
 * - cuit: string (CUIT, puede estar encriptado)
 * - password: string (Password, puede estar encriptado)
 * - encrypted?: boolean (indica si las credenciales están encriptadas)
 * - plantilla: Plantilla (plantilla de factura a emitir)
 * - fecha?: string (DD/MM/YYYY — override de fecha del comprobante)
 * - companyIndex?: number (índice de la empresa a seleccionar, default 0)
 */
export async function POST(request: NextRequest) {
  // Security checks: rate limiting, bot detection, turnstile
  const securityCheck = await performSecurityChecks(request);
  if (!securityCheck.allowed) {
    return securityCheck.response;
  }

  try {
    const body = await request.json();
    const {
      cuit: encryptedCuit,
      password: encryptedPassword,
      encrypted = false,
      kind = "facturaC",
      plantilla,
      original,
      condicionIVA,
      fecha,
      companyIndex = 0,
      idempotencyKey,
    } = body;

    if (!idempotencyKey || typeof idempotencyKey !== "string") {
      return NextResponse.json(
        { success: false, error: "idempotencyKey es requerido" },
        { status: 400 }
      );
    }

    if (!encrypted) {
      return NextResponse.json(
        { success: false, error: "Credentials must be encrypted" },
        { status: 400 }
      );
    }

    let cuit = encryptedCuit;
    let password = encryptedPassword;
    if (encrypted) {
      const decrypted = decryptCredentials(encryptedCuit, encryptedPassword);
      cuit = decrypted.cuit;
      password = decrypted.password;
    }

    if (!cuit || !password) {
      return NextResponse.json(
        { success: false, error: "CUIT y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Validación + whitelist server-side ANTES de lanzar el browser (M2/M3).
    const validation = validateEmitBody({ kind, plantilla, original, condicionIVA });
    if (!validation.ok) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // Resolver plantilla + opts según el tipo de comprobante
    let plantillaFinal = plantilla as Plantilla | undefined;
    let extraOpts: { universo?: string; asociado?: { tipo: string; puntoVenta: string; numero: string; fecha?: string } } = {};

    if (kind === "notaCreditoC") {
      const nc = buildCreditNote({ original: original as StoredInvoice, condicionIVA: String(condicionIVA) });
      plantillaFinal = nc.plantilla;
      extraOpts = { universo: nc.opts.universo, asociado: nc.opts.asociado };
    }

    const credentials: AFIPCredentials = { cuit, password };

    // Idempotencia (C1/H2): la misma key devuelve el result cacheado sin re-emitir;
    // un doble request concurrente comparte la misma promise. Cubre el retry
    // post-error del cliente (misma key) contra el mismo lambda caliente.
    const result = await emissionStore.run(idempotencyKey, () =>
      withConcurrencyLimit(() =>
        confirmEmissionFlow(credentials, plantillaFinal as Plantilla, { fecha, companyIndex, ...extraOpts })
      )
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    // Log completo server-side; el cliente recibe un mensaje genérico (L1) —
    // no exponer el error crudo de Playwright/RCEL.
    console.error("[AFIP Emit Confirm API] Error:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo procesar la solicitud", errorCode: "UNKNOWN" },
      { status: 500 }
    );
  }
}
