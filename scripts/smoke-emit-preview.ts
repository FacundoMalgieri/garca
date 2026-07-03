/**
 * Smoke test MANUAL del facturador — FASE 1 (preview), NO emite nada.
 *
 * Corre los steps reales de Playwright (login → navigate → fill → capturePreview)
 * contra RCEL real, con browser VISIBLE, y frena en el Resumen (pantalla 4) sin
 * confirmar. Sirve para verificar que los selectores/waits del código funcionan
 * contra el DOM real.
 *
 * Uso (credenciales por env, NO se guardan):
 *   AFIP_CUIT=20xxxxxxxx9 AFIP_PASS='tu-clave' npx tsx scripts/smoke-emit-preview.ts
 *
 * Opcional: HEADLESS=1 para correr sin ventana.
 */
import { chromium } from "playwright";

import { DEFAULT_TIMEOUT, USER_AGENT } from "../src/lib/scrapers/afip/constants";
import { TIPO_OFICIAL } from "../src/lib/facturador/codes";
import { buildFillPlan } from "../src/lib/facturador/fill-plan";
import { login } from "../src/lib/scrapers/afip/steps/login";
import { navigateToEmission } from "../src/lib/scrapers/afip/steps/emission/navigate";
import { fillComprobante } from "../src/lib/scrapers/afip/steps/emission/fill";
import { capturePreview } from "../src/lib/scrapers/afip/steps/emission/preview";
import type { Plantilla } from "../src/types/facturador";

const cuit = process.env.AFIP_CUIT;
const password = process.env.AFIP_PASS;

if (!cuit || !password) {
  console.error("Faltan credenciales. Usá: AFIP_CUIT=.. AFIP_PASS=.. npx tsx scripts/smoke-emit-preview.ts");
  process.exit(1);
}

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
    const res = await login(page, { cuit: cuit!, password: password! }, DEFAULT_TIMEOUT);
    if (!res.success) {
      console.error("login falló:", res);
      return;
    }

    console.log("→ navigate a Generar Comprobantes...");
    const rcel = await navigateToEmission(page, context);

    console.log("→ fill (pantallas 0-3)...");
    await fillComprobante(rcel, buildFillPlan(plantilla), { domicilio: plantilla.cliente.domicilio });

    console.log("→ capturePreview (pantalla 4, sin confirmar)...");
    const preview = await capturePreview(rcel, {
      puntoVenta: plantilla.puntoDeVenta,
      tipoComprobante: TIPO_OFICIAL.facturaC,
    });

    console.log("\n===== PREVIEW COMPLETO (Resumen real de RCEL) =====");
    // Todo lo estructurado (lo que el modal propio va a mostrar); el html crudo se abrevia.
    console.log(JSON.stringify({ ...preview, html: `[${preview.html.length} chars — Resumen crudo completo]` }, null, 2));
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
