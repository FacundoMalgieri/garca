/**
 * AFIP Companies SSE Stream API Route.
 *
 * This route streams progress events during company fetching via Server-Sent Events.
 */

import { NextRequest } from "next/server";

import { getConcurrencyStats, withConcurrencyLimit } from "@/lib/concurrency";
import { decryptCredentials } from "@/lib/crypto";
import { getAFIPCompaniesWithEvents } from "@/lib/scrapers/afip";
import { SCRAPER_EVENTS, type ScraperEvent } from "@/lib/scrapers/afip/events";
import { performSecurityChecks } from "@/lib/security";

export const dynamic = "force-dynamic";

/**
 * POST /api/arca/companies/stream
 *
 * Returns a Server-Sent Events stream with login/company fetch progress.
 * Final event contains the complete result.
 */
export async function POST(request: NextRequest) {
  // Security checks
  const securityCheck = await performSecurityChecks(request);
  if (!securityCheck.allowed) {
    return securityCheck.response;
  }

  try {
    const body = await request.json();
    const { cuit: encryptedCuit, password: encryptedPassword, encrypted = false } = body;

    // Decrypt credentials if needed
    let cuit = encryptedCuit;
    let password = encryptedPassword;

    if (encrypted) {
      const decrypted = decryptCredentials(encryptedCuit, encryptedPassword);
      cuit = decrypted.cuit;
      password = decrypted.password;
    }

    // Validate required parameters
    if (!cuit || !password) {
      return new Response(
        JSON.stringify({ error: "CUIT y contraseña son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create SSE stream with cancellation support
    const encoder = new TextEncoder();
    let isControllerClosed = false;
    
    // Use request.signal to detect client disconnection
    const abortSignal = request.signal;
    
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: ScraperEvent) => {
          // Skip if controller is already closed (user cancelled)
          if (isControllerClosed || abortSignal.aborted) return;
          
          try {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          } catch {
            // Controller was closed (user disconnected/cancelled)
            isControllerClosed = true;
          }
        };
        
        // Check cancellation function for scraper
        const isCancelled = () => isControllerClosed || abortSignal.aborted;

        try {
          // Check queue status
          const stats = getConcurrencyStats();
          if (stats.active >= stats.max) {
            sendEvent(SCRAPER_EVENTS.queue(stats.waiting + 1));
          }

          // Run with concurrency limit
          const result = await withConcurrencyLimit(async () => {
            return getAFIPCompaniesWithEvents({ cuit, password }, { onEvent: sendEvent, isCancelled });
          });

          // Send final result
          const finalEvent = {
            type: "result" as const,
            message: result.success ? "Empresas obtenidas" : "Error en el proceso",
            data: result,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error desconocido";
          sendEvent(SCRAPER_EVENTS.error(errorMessage));

          // Send error result
          const errorResult = {
            type: "result" as const,
            message: "Error en el proceso",
            data: {
              success: false,
              error: errorMessage,
              errorCode: "UNKNOWN",
              companies: [],
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResult)}\n\n`));
        } finally {
          if (!isControllerClosed) {
            isControllerClosed = true;
            controller.close();
          }
        }
      },
      cancel() {
        // Called when client disconnects
        isControllerClosed = true;
        console.log("[AFIP Companies Stream] Client disconnected, cancelling...");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AFIP Companies Stream API] Error:", error);
    return new Response(
      JSON.stringify({ error: "Error al procesar solicitud" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

