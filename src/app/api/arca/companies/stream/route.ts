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
import { startSseHeartbeat } from "@/lib/sse/heartbeat";

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

    if (!encrypted) {
      return new Response(
        JSON.stringify({ error: "Credentials must be encrypted" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

    // Hoisted para que cancel() (desconexión del cliente) también corte el
    // heartbeat, sin esperar al finally de start().
    let stopHeartbeat: () => void = () => {};

    const stream = new ReadableStream({
      async start(controller) {
        const sendRaw = (chunk: string) => {
          // Skip if controller is already closed (user cancelled)
          if (isControllerClosed || abortSignal.aborted) return;

          try {
            controller.enqueue(encoder.encode(chunk));
          } catch {
            // Controller was closed (user disconnected/cancelled)
            isControllerClosed = true;
          }
        };

        const sendEvent = (
          event: ScraperEvent | { type: "result"; message: string; data: unknown }
        ) => {
          sendRaw(`data: ${JSON.stringify(event)}\n\n`);
        };

        // Check cancellation function for scraper
        const isCancelled = () => isControllerClosed || abortSignal.aborted;

        // Cloudflare corta la conexión tras ~100s sin bytes. Los pasos del
        // scraper pueden tardar más que eso sin emitir eventos, así que el
        // heartbeat mantiene el stream vivo.
        stopHeartbeat = startSseHeartbeat(sendRaw);

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
          sendEvent(finalEvent);
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
          sendEvent(errorResult);
        } finally {
          stopHeartbeat();
          if (!isControllerClosed) {
            isControllerClosed = true;
            controller.close();
          }
        }
      },
      cancel() {
        // Called when client disconnects
        isControllerClosed = true;
        stopHeartbeat();
        console.log("[AFIP Companies Stream] Client disconnected, cancelling...");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store",
        "X-Accel-Buffering": "no",
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

