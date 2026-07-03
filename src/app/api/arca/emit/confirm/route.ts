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
import { confirmEmissionFlow } from "@/lib/scrapers/afip/emit";
import { performSecurityChecks } from "@/lib/security";
import type { AFIPCredentials } from "@/types/afip-scraper";
import type { Plantilla } from "@/types/facturador";

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
      plantilla,
      fecha,
      companyIndex = 0,
    } = body;

    if (!encrypted) {
      return NextResponse.json(
        { success: false, error: "Credentials must be encrypted" },
        { status: 400 }
      );
    }

    // Decrypt credentials
    let cuit = encryptedCuit;
    let password = encryptedPassword;

    if (encrypted) {
      const decrypted = decryptCredentials(encryptedCuit, encryptedPassword);
      cuit = decrypted.cuit;
      password = decrypted.password;
    }

    // Validate required parameters
    if (!cuit || !password) {
      return NextResponse.json(
        { success: false, error: "CUIT y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (!plantilla) {
      return NextResponse.json(
        { success: false, error: "Plantilla es requerida" },
        { status: 400 }
      );
    }

    console.log("[AFIP Emit Confirm API] ⚠️  Starting IRREVERSIBLE emission confirm...");
    console.log("[AFIP Emit Confirm API] Company index:", companyIndex);

    const credentials: AFIPCredentials = { cuit, password };

    // Confirm emission with concurrency limit
    const result = await withConcurrencyLimit(() =>
      confirmEmissionFlow(credentials, plantilla as Plantilla, { fecha, companyIndex })
    );

    console.log("[AFIP Emit Confirm API] ✅ Emission confirmed — CAE:", result.cae, "Nro:", result.numeroCompleto);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("[AFIP Emit Confirm API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: `Error al procesar solicitud: ${errorMessage}`, errorCode: "UNKNOWN" },
      { status: 500 }
    );
  }
}
