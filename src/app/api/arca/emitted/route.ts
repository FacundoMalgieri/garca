/**
 * AFIP Emitted Comprobantes API Route.
 *
 * Logs in, navigates to RCEL → Consultas, and returns the list of
 * issued comprobantes for the requested date range.
 */

import { NextRequest, NextResponse } from "next/server";

import { withConcurrencyLimit } from "@/lib/concurrency";
import { decryptCredentials } from "@/lib/crypto";
import { listEmitted } from "@/lib/scrapers/afip/emit";
import { performSecurityChecks } from "@/lib/security";
import type { AFIPCredentials } from "@/types/afip-scraper";

/**
 * POST /api/arca/emitted
 *
 * Body:
 * - cuit: string (CUIT, puede estar encriptado)
 * - password: string (Password, puede estar encriptado)
 * - encrypted?: boolean (indica si las credenciales están encriptadas)
 * - fechaDesde: string (DD/MM/YYYY)
 * - fechaHasta: string (DD/MM/YYYY)
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
      fechaDesde,
      fechaHasta,
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

    if (!fechaDesde || !fechaHasta) {
      return NextResponse.json(
        { success: false, error: "Rango de fechas es requerido (fechaDesde, fechaHasta)" },
        { status: 400 }
      );
    }

    // Validate date format (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(fechaDesde) || !dateRegex.test(fechaHasta)) {
      return NextResponse.json(
        { success: false, error: "Formato de fecha inválido. Use DD/MM/YYYY" },
        { status: 400 }
      );
    }

    console.log("[AFIP Emitted API] Starting emitted comprobantes query...");
    console.log("[AFIP Emitted API] Date range:", fechaDesde, "to", fechaHasta);
    console.log("[AFIP Emitted API] Company index:", companyIndex);

    const credentials: AFIPCredentials = { cuit, password };

    // Query with concurrency limit to prevent memory exhaustion
    const invoices = await withConcurrencyLimit(() =>
      listEmitted(credentials, fechaDesde, fechaHasta, companyIndex)
    );

    console.log("[AFIP Emitted API] ✅ Found", invoices.length, "emitted comprobante(s)");

    return NextResponse.json({
      success: true,
      invoices,
      total: invoices.length,
    });
  } catch (error) {
    console.error("[AFIP Emitted API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: `Error al procesar solicitud: ${errorMessage}`, errorCode: "UNKNOWN" },
      { status: 500 }
    );
  }
}
