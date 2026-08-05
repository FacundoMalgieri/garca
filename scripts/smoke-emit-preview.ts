/**
 * Smoke test MANUAL del facturador — FASE 1 (preview), NO emite nada.
 *
 * Corre los steps reales de Playwright (login → navigate → fill → capturePreview)
 * contra RCEL real, con browser VISIBLE, y frena en el Resumen (pantalla 4) sin
 * confirmar. Sirve para verificar que los selectores/waits del código funcionan
 * contra el DOM real.
 *
 * Uso (credenciales por env, NO se guardan):
 *   npx tsx scripts/smoke-emit-preview.ts
 *
 * Opcional: HEADLESS=1 para correr sin ventana.
 */
import { chromium } from "playwright";

import { TIPO_OFICIAL } from "../src/lib/facturador/codes";
import { buildFillPlan } from "../src/lib/facturador/fill-plan";
import { DEFAULT_TIMEOUT, USER_AGENT } from "../src/lib/scrapers/afip/constants";
import { fillComprobante } from "../src/lib/scrapers/afip/steps/emission/fill";
import { navigateToEmission } from "../src/lib/scrapers/afip/steps/emission/navigate";
import { capturePreview } from "../src/lib/scrapers/afip/steps/emission/preview";
import { login } from "../src/lib/scrapers/afip/steps/login";
import type { Plantilla } from "../src/types/facturador";
import { requireCredentials } from "./lib/smoke-env";

const { cuit, password } = requireCredentials("scripts/smoke-emit-preview.ts");

// Plantilla de prueba (monto chico; NUNCA se confirma).
const plantilla: Plantilla = {
  id: "smoke",
  nombre: "Smoke GSA",
  puntoDeVenta: "3",
  concepto: "servicios",
  cliente: {
    condicionIVA: "1", // Responsable Inscripto
    tipoDoc: "80", // CUIT
    nroDoc: "30707915281", // GSA COLLECTIONS ARGENTINA SA
    razonSocial: "GSA COLLECTIONS ARGENTINA SA",
    condicionVenta: ["6"], // Transferencia Bancaria
  },
  periodo: { desde: "01/06/2026", hasta: "30/06/2026", vtoPago: "13/07/2026" },
  lineas: [{ descripcion: "SMOKE TEST - no confirmar", cantidad: 1, unidad: "7", precioUnitario: 1000 }],
};

async function main() {
  const browser = await chromium.launch({ headless: process.env.HEADLESS === "1" });
  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);

    console.log("→ login...");
    const res = await login(page, { cuit, password }, DEFAULT_TIMEOUT);
    if (!res.success) {
      console.error("login falló:", res);
      return;
    }

    console.log("→ navigate a Generar Comprobantes...");
    const rcel = await navigateToEmission(page, context);

    console.log("→ fill (pantallas 0-3)...");
    await fillComprobante(rcel, buildFillPlan(plantilla));

    console.log("→ capturePreview (pantalla 4, sin confirmar)...");
    const preview = await capturePreview(rcel, {
      puntoVenta: plantilla.puntoDeVenta,
      tipoComprobante: TIPO_OFICIAL.facturaC,
    });

    console.log("\n===== PREVIEW COMPLETO (Resumen real de RCEL) =====");
    // Todo lo estructurado (lo que el modal propio va a mostrar).
    console.log(JSON.stringify(preview, null, 2));
    console.log("===================================================\n");
    console.log("⚠️  NO se confirmó nada. Cerrando en 10s (mirá la ventana en el Resumen).");
    await rcel.waitForTimeout(10000);
  } catch (err) {
    console.error("SMOKE FALLÓ en algún step:", err instanceof Error ? err.message : err);
    console.error("(Esto nos dice qué selector/wait ajustar.)");
  } finally {
    await browser.close();
  }
}

void main();
