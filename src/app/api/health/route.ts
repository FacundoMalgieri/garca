/**
 * Health check endpoint.
 * Returns minimal info - no internal stats exposed publicly.
 *
 * `version` = el BUILD_ID de Next (distinto en cada build). Lo usa el workflow
 * de deploy para confirmar que Dokploy realmente está sirviendo el build nuevo
 * (en vez de un `sleep` ciego). Se lee una vez al arrancar el server, así
 * refleja el build efectivamente deployado.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-dynamic";

const VERSION: string = (() => {
  try {
    return readFileSync(join(process.cwd(), ".next", "BUILD_ID"), "utf-8").trim() || "unknown";
  } catch {
    return "unknown";
  }
})();

export function GET() {
  return Response.json(
    {
      ok: true,
      timestamp: new Date().toISOString(),
      version: VERSION,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
