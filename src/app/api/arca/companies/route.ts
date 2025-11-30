/**
 * AFIP Companies API Route.
 *
 * This route handles login to AFIP and returns the list of available companies.
 */

import { NextRequest, NextResponse } from "next/server";

import { decryptCredentials } from "@/lib/crypto";
import { getAFIPCompanies } from "@/lib/scrapers/afip";
import { performSecurityChecks } from "@/lib/security";

/**
 * POST /api/arca/companies
 *
 * Body:
 * - cuit: string (CUIT del contribuyente, puede estar encriptado)
 * - password: string (Contraseña de AFIP, puede estar encriptada)
 * - encrypted?: boolean (indica si las credenciales están encriptadas)
 *
 * Response:
 * - success: boolean
 * - companies: AFIPCompany[]
 */
export async function POST(request: NextRequest) {
  // Security checks: rate limiting, bot detection, turnstile
  const securityCheck = await performSecurityChecks(request);
  if (!securityCheck.allowed) {
    return securityCheck.response;
  }

  try {
    const body = await request.json();
    const { cuit: encryptedCuit, password: encryptedPassword, encrypted = false } = body;

    // Decrypt credentials if they were encrypted
    let cuit = encryptedCuit;
    let password = encryptedPassword;

    if (encrypted) {
      const decrypted = decryptCredentials(encryptedCuit, encryptedPassword);
      cuit = decrypted.cuit;
      password = decrypted.password;
    }

    // Validate required parameters
    if (!cuit || !password) {
      return NextResponse.json({ success: false, error: "CUIT y contraseña son requeridos" }, { status: 400 });
    }

    console.log("[AFIP Companies API] Starting login and company fetch...");

    // Get companies from AFIP
    const result = await getAFIPCompanies({ cuit, password });

    if (!result.success) {
      console.error("[AFIP Companies API] Failed:", result.error);
      return NextResponse.json(
        { success: false, error: result.error, errorCode: result.errorCode },
        { status: result.errorCode === "INVALID_CREDENTIALS" ? 401 : 500 }
      );
    }

    console.log("[AFIP Companies API] ✅ Success! Found", result.companies.length, "company(ies)");

    return NextResponse.json({
      success: true,
      companies: result.companies,
    });
  } catch (error) {
    console.error("[AFIP Companies API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: `Error al procesar solicitud: ${errorMessage}`, errorCode: "UNKNOWN" },
      { status: 500 }
    );
  }
}
