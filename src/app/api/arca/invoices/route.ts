/**
 * AFIP Invoice Scraper API Route.
 *
 * This route handles automated scraping of AFIP's web portal
 * to retrieve invoice data without WSAA/WSFEv1 integration.
 */

import { NextRequest, NextResponse } from "next/server";

import { withConcurrencyLimit } from "@/lib/concurrency";
import { decryptCredentials } from "@/lib/crypto";
import { scrapeAFIPInvoices } from "@/lib/scrapers/afip";
import { performSecurityChecks } from "@/lib/security";
import type { AFIPCredentials, AFIPInvoiceFilters } from "@/types/afip-scraper";

/**
 * POST /api/arca/invoices
 *
 * Body:
 * - cuit: string (CUIT, puede estar encriptado)
 * - password: string (Password, puede estar encriptado)
 * - encrypted?: boolean (indica si las credenciales están encriptadas)
 * - companyIndex?: number (índice de la empresa a seleccionar, default 0)
 * - fechaDesde: string (DD/MM/YYYY)
 * - fechaHasta: string (DD/MM/YYYY)
 * - rol?: "EMISOR" | "RECEPTOR"
 * - headless?: boolean
 * - downloadXML?: boolean
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
      fechaDesde,
      fechaHasta,
      puntoVenta,
      tipoComprobante,
      rol = "EMISOR",
      headless = true,
      downloadXML = true,
      encrypted = false,
      companyIndex = 0,
    } = body;

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

    if (!fechaDesde || !fechaHasta) {
      return NextResponse.json(
        { success: false, error: "Rango de fechas es requerido (fechaDesde, fechaHasta)" },
        { status: 400 }
      );
    }

    // Validate date format (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(fechaDesde) || !dateRegex.test(fechaHasta)) {
      return NextResponse.json({ success: false, error: "Formato de fecha inválido. Use DD/MM/YYYY" }, { status: 400 });
    }

    console.log("[AFIP API] Starting scraping process...");
    console.log("[AFIP API] Date range:", fechaDesde, "to", fechaHasta);
    console.log("[AFIP API] Company index:", companyIndex);

    const credentials: AFIPCredentials = { cuit, password };
    const filters: AFIPInvoiceFilters = {
      cuit,
      fechaDesde,
      fechaHasta,
      puntoVenta,
      tipoComprobante,
      rol,
    };

    // Scrape with concurrency limit to prevent memory exhaustion
    const result = await withConcurrencyLimit(() =>
      scrapeAFIPInvoices(credentials, filters, {
        headless,
        downloadXML,
        timeout: 60000,
        companyIndex,
      })
    );

    if (!result.success) {
      console.error("[AFIP API] Scraping failed:", result.error);
      return NextResponse.json(
        { success: false, error: result.error, errorCode: result.errorCode, invoices: [], total: 0 },
        { status: result.errorCode === "INVALID_CREDENTIALS" ? 401 : 500 }
      );
    }

    console.log("[AFIP API] ✅ Success! Retrieved", result.total, "invoices");

    return NextResponse.json({
      success: true,
      invoices: result.invoices,
      total: result.total,
      count: result.total,
      company: result.company,
      availableCompanies: result.availableCompanies,
    });
  } catch (error) {
    console.error("[AFIP API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: `Error al procesar solicitud: ${errorMessage}`, errorCode: "UNKNOWN", invoices: [], total: 0 },
      { status: 500 }
    );
  }
}
