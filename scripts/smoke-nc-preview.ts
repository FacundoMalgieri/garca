/**
 * Smoke MANUAL del flujo Nota de Crédito — FASE 1 (preview), NO emite nada.
 *
 * Login → navigate → fill NC (universo 4 + comprobante asociado) → capturePreview,
 * frena en el Resumen sin confirmar. Verifica que los selectores del bloque asociado
 * y el flujo NC funcionan contra el DOM real de RCEL.
 *
 * Uso (credenciales por env, NO se guardan):
 *   AFIP_CUIT=20xxxxxxxx9 AFIP_PASS='clave' npx tsx scripts/smoke-nc-preview.ts
 *
 * Opcional: HEADLESS=1
 */
import { chromium } from "playwright";

import { universoToOficial } from "../src/lib/facturador/codes";
import { buildCreditNote } from "../src/lib/facturador/credit-note";
import { buildFillPlan } from "../src/lib/facturador/fill-plan";
import { DEFAULT_TIMEOUT, USER_AGENT } from "../src/lib/scrapers/afip/constants";
import { fillComprobante } from "../src/lib/scrapers/afip/steps/emission/fill";
import { navigateToEmission } from "../src/lib/scrapers/afip/steps/emission/navigate";
import { capturePreview } from "../src/lib/scrapers/afip/steps/emission/preview";
import { login } from "../src/lib/scrapers/afip/steps/login";
import type { StoredInvoice } from "../src/types/facturador";

const cuit = process.env.AFIP_CUIT;
const password = process.env.AFIP_PASS;
if (!cuit || !password) {
  console.error("Faltan credenciales. Usá: AFIP_CUIT=.. AFIP_PASS=.. npx tsx scripts/smoke-nc-preview.ts");
  process.exit(1);
}

// Factura a "deshacer": DEBE existir en tu cuenta, sino RCEL rechaza la asociación
// (valida PV=5 dígitos y Nro=8 dígitos; el padding lo hace buildCreditNote).
// Ajustá puntoVenta/numero/fecha a una Factura C real tuya (mirá Consultas en RCEL).
const original: StoredInvoice = {
  fecha: "17/07/2026",
  tipo: "FACTURA C",
  tipoComprobante: 11,
  puntoVenta: 3,
  numero: 89,
  numeroCompleto: "0003-00000089",
  cuitEmisor: cuit!,
  razonSocialEmisor: "",
  cuitReceptor: "30711437580",
  razonSocialReceptor: "",
  importeNeto: 3000000,
  importeIVA: 0,
  importeTotal: 3000000,
  moneda: "ARS",
  emittedByGarca: false,
};

async function main() {
  const browser = await chromium.launch({ headless: process.env.HEADLESS === "1" });
  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);

    console.log("→ login...");
    const res = await login(page, { cuit: cuit!, password: password! }, DEFAULT_TIMEOUT);
    if (!res.success) { console.error("login falló:", res); return; }

    console.log("→ navigate a Generar Comprobantes...");
    const rcel = await navigateToEmission(page, context);

    const { plantilla, opts } = buildCreditNote({ original, condicionIVA: "1" });

    console.log("→ fill NC (pantallas 0-3, universo 4 + asociado)...");
    await fillComprobante(rcel, buildFillPlan(plantilla, opts), { domicilio: plantilla.cliente.domicilio });

    console.log("→ capturePreview (Resumen, sin confirmar)...");
    const preview = await capturePreview(rcel, {
      puntoVenta: plantilla.puntoDeVenta,
      tipoComprobante: universoToOficial(opts.universo!) ?? 13,
    });

    console.log("\n===== PREVIEW NC (Resumen real de RCEL) =====");
    console.log(JSON.stringify({ ...preview, html: `[${preview.html.length} chars]` }, null, 2));
    console.log("\n⚠️  NO se confirmó nada. Cerrando en 10s.");
    await rcel.waitForTimeout(10000);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
