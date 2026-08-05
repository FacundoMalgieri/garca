/**
 * Smoke MANUAL del flujo Nota de Crédito — FASE 1 (preview), NO emite nada.
 *
 * Login → navigate → fill NC (universo 4 + comprobante asociado) → capturePreview,
 * frena en el Resumen sin confirmar. Verifica que los selectores del bloque asociado
 * y el flujo NC funcionan contra el DOM real de RCEL.
 *
 * Uso (credenciales en .env.smoke, gitignoreado — ver scripts/lib/smoke-env.ts):
 *   npx tsx scripts/smoke-nc-preview.ts
 *
 * La factura a anular se toma del env (defaults abajo). DEBE existir en la cuenta,
 * sino RCEL rechaza la asociación:
 *   NC_FECHA=17/07/2026 NC_PV=3 NC_NUM=89 NC_IMPORTE=3000000 NC_CUIT_RECEPTOR=30711437580
 *
 * Opcional: HEADLESS=1 · HOLD_MS=10000 · OUT_DIR=tmp/smoke-nc
 *
 * Sale con código 1 si alguna aserción sobre el Resumen falla.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page } from "playwright";

import { universoToOficial } from "../src/lib/facturador/codes";
import { buildCreditNote } from "../src/lib/facturador/credit-note";
import { buildFillPlan } from "../src/lib/facturador/fill-plan";
import { DEFAULT_TIMEOUT, USER_AGENT } from "../src/lib/scrapers/afip/constants";
import { fillComprobante } from "../src/lib/scrapers/afip/steps/emission/fill";
import { navigateToEmission } from "../src/lib/scrapers/afip/steps/emission/navigate";
import { capturePreview } from "../src/lib/scrapers/afip/steps/emission/preview";
import { login } from "../src/lib/scrapers/afip/steps/login";
import type { StoredInvoice } from "../src/types/facturador";
import { createStopwatch, requireCredentials } from "./lib/smoke-env";

const { cuit, password } = requireCredentials("scripts/smoke-nc-preview.ts");

const OUT_DIR = process.env.OUT_DIR || join(process.cwd(), "tmp", "smoke-nc");
const HOLD_MS = Number(process.env.HOLD_MS || 10_000);

/**
 * Factura a "deshacer". Parametrizable porque una factura hardcodeada deja de
 * existir (o cambia de cuenta) y el smoke empieza a fallar por el fixture, no por
 * el código. RCEL valida PV=5 dígitos y Nro=8 dígitos; el padding lo hace
 * buildCreditNote.
 */
const importeTotal = Number(process.env.NC_IMPORTE || 3_000_000);
const puntoVenta = Number(process.env.NC_PV || 3);
const numero = Number(process.env.NC_NUM || 89);
const original: StoredInvoice = {
  fecha: process.env.NC_FECHA || "17/07/2026",
  tipo: "FACTURA C",
  tipoComprobante: 11,
  puntoVenta,
  numero,
  numeroCompleto: `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`,
  cuitEmisor: cuit,
  razonSocialEmisor: "",
  cuitReceptor: process.env.NC_CUIT_RECEPTOR || "30711437580",
  razonSocialReceptor: "",
  importeNeto: importeTotal,
  importeIVA: 0,
  importeTotal,
  moneda: "ARS",
  emittedByGarca: false,
};

/** Aserciones acumuladas: el smoke tiene que fallar, no solo imprimir. */
const failures: string[] = [];
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`✅ ${name}`);
    return;
  }
  const suffix = detail === undefined ? "" : ` — ${JSON.stringify(detail)}`;
  console.error(`❌ ${name}${suffix}`);
  failures.push(name);
}

/** Evidencia para cuando RCEL cambie algo: sin esto el fallo no es diagnosticable. */
async function dumpArtifacts(page: Page, tag: string) {
  try {
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(OUT_DIR, `${tag}.html`), await page.content());
    await page.screenshot({ path: join(OUT_DIR, `${tag}.png`), fullPage: true }).catch(() => {});
    console.log(`📎 Evidencia en ${OUT_DIR}/${tag}.{html,png}`);
  } catch (e) {
    console.warn("No se pudo guardar evidencia:", e instanceof Error ? e.message : e);
  }
}

async function main() {
  const watch = createStopwatch("nc-preview");
  const browser = await chromium.launch({ headless: process.env.HEADLESS === "1" });
  let rcel: Page | null = null;

  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);

    console.log("→ login...");
    const res = await login(page, { cuit, password }, DEFAULT_TIMEOUT);
    if (!res.success) {
      console.error("login falló:", res);
      failures.push("login");
      return;
    }
    watch.mark("login");

    console.log("→ navigate a Generar Comprobantes...");
    rcel = await navigateToEmission(page, context);
    watch.mark("navigate");

    const { plantilla, opts } = buildCreditNote({ original, condicionIVA: "1" });

    console.log("→ fill NC (pantallas 0-3, universo 4 + asociado)...");
    await fillComprobante(rcel, buildFillPlan(plantilla, opts));
    watch.mark("fill");

    console.log("→ capturePreview (Resumen, sin confirmar)...");
    const preview = await capturePreview(rcel, {
      puntoVenta: plantilla.puntoDeVenta,
      tipoComprobante: universoToOficial(opts.universo!) ?? 13,
    });
    watch.mark("capturePreview");

    // Diagnóstico de #observaciones: es opcional en el Resumen y su lectura sin
    // timeout costaba 30s (ver READ_TIMEOUT en constants). Saber si el nodo existe
    // dice si ese costo se pagaba en cada preview.
    const observacionesCount = await rcel.locator("#observaciones").count();
    console.log(`🔎 #observaciones en el Resumen: ${observacionesCount} nodo(s)`);

    console.log("\n===== PREVIEW NC (Resumen real de RCEL) =====");
    console.log(JSON.stringify(preview, null, 2));

    // Aserciones sobre el Resumen real
    check("total del preview == importe de la original", preview.importeTotal === original.importeTotal, {
      preview: preview.importeTotal,
      original: original.importeTotal,
    });
    check("tiene exactamente 1 línea", preview.lineas.length === 1, preview.lineas.length);
    check(
      "la línea referencia el comprobante anulado",
      preview.lineas[0]?.descripcion.includes(original.numeroCompleto),
      preview.lineas[0]?.descripcion
    );
    check("subtotal == total (NC sin otros tributos)", preview.subtotal === preview.importeTotal, {
      subtotal: preview.subtotal,
      total: preview.importeTotal,
    });
    check("receptor == receptor de la original", preview.receptor.cuit === original.cuitReceptor, {
      preview: preview.receptor.cuit,
      original: original.cuitReceptor,
    });
    check("emisor tiene razón social", Boolean(preview.emisor.razonSocial), preview.emisor.razonSocial);
    // "null" como texto significa que RCEL renderizó el campo sin valor: el fill no
    // llegó a setearlo. Confirmar así emitiría un comprobante incompleto.
    check(
      "condición de venta seteada",
      Boolean(preview.receptor.condicionVenta) && preview.receptor.condicionVenta !== "null",
      preview.receptor.condicionVenta
    );
    check(
      "condición IVA seteada",
      Boolean(preview.receptor.condicionIVA) && preview.receptor.condicionIVA !== "null",
      preview.receptor.condicionIVA
    );

    if (failures.length > 0) await dumpArtifacts(rcel, "resumen-fallido");

    console.log(`\n⚠️  NO se confirmó nada. Cerrando en ${Math.round(HOLD_MS / 1000)}s.`);
    await rcel.waitForTimeout(HOLD_MS);
  } catch (e) {
    failures.push(e instanceof Error ? e.message : String(e));
    console.error("ERROR:", e);
    if (rcel) await dumpArtifacts(rcel, "error");
  } finally {
    await browser.close();
    console.log(`\n⏱ total: ${watch.total()}ms`);
    if (failures.length > 0) {
      console.error(`\n❌ Smoke FALLÓ (${failures.length}): ${failures.join(", ")}`);
      process.exitCode = 1;
    } else {
      console.log("\n✅ Smoke OK — preview coherente, nada emitido.");
    }
  }
}

void main();
