/**
 * ⚠️  SMOKE QUE EMITE DE VERDAD — valida el path completo de confirmEmissionFlow
 * (confirm.ts + emit.ts) contra RCEL real, desde el CÓDIGO, pasando por el
 * idempotencyStore (Contrato A) igual que el route de prod.
 *
 * Emite una Factura C de $1 a Consumidor Final y luego una Nota de Crédito que la
 * cancela, ambas vía `store.run(key, () => confirmEmissionFlow(...))`. Además, tras
 * cada emisión re-corre `store.run` con la MISMA key y verifica que:
 *   - confirmEmissionFlow se invocó UNA sola vez (no re-emite), y
 *   - el segundo run devuelve el MISMO resultado cacheado.
 * Imprime numeroCompleto + CAE (leídos de Consultas) + tamaño del PDF (base64).
 *
 * IRREVERSIBLE. Requiere env explícito para correr:
 *   AFIP_CUIT=20xxxxxxxx9 AFIP_PASS='clave' EMIT_REAL=1 npx tsx scripts/smoke-emit-confirm.ts
 */
import { buildCreditNote } from "../src/lib/facturador/credit-note";
import { formatDMY } from "../src/lib/facturador/dates";
import { createIdempotencyStore } from "../src/lib/facturador/idempotency";
import { confirmEmissionFlow } from "../src/lib/scrapers/afip/emit";
import type { EmissionResult, Plantilla, StoredInvoice } from "../src/types/facturador";

const cuit = process.env.AFIP_CUIT;
const password = process.env.AFIP_PASS;

if (!cuit || !password) {
  console.error("Faltan credenciales. Usá: AFIP_CUIT=.. AFIP_PASS=.. EMIT_REAL=1 npx tsx scripts/smoke-emit-confirm.ts");
  process.exit(1);
}
if (process.env.EMIT_REAL !== "1") {
  console.error("⚠️  Este script EMITE comprobantes fiscales reales. Reintentá con EMIT_REAL=1 para confirmar.");
  process.exit(1);
}

const facturaPlantilla: Plantilla = {
  id: "smoke-confirm",
  nombre: "Smoke confirm",
  puntoDeVenta: "3",
  concepto: "productos",
  cliente: {
    condicionIVA: "5", // Consumidor Final
    tipoDoc: "96", // DNI
    nroDoc: "", // sin documento (aceptado para CF de bajo monto)
    razonSocial: "",
    condicionVenta: ["1"], // Contado
  },
  lineas: [{ descripcion: "Prueba GARCA confirm - anular", cantidad: 1, unidad: "7", precioUnitario: 1 }],
};

const creds = { cuit: cuit!, password: password! };

/**
 * Corre `confirmEmissionFlow` bajo el store con una key, luego re-corre con la
 * MISMA key y verifica que la operación real se ejecutó una sola vez (no re-emite)
 * y que el segundo run devuelve el resultado cacheado idéntico.
 */
async function emitirIdempotente(
  label: string,
  plantilla: Plantilla,
  opts: Parameters<typeof confirmEmissionFlow>[2]
): Promise<EmissionResult> {
  const store = createIdempotencyStore<EmissionResult>();
  const key = crypto.randomUUID();
  let calls = 0;
  const op = () => {
    calls += 1;
    return confirmEmissionFlow(creds, plantilla, opts);
  };

  const first = await store.run(key, op);
  const second = await store.run(key, op); // misma key → NO debe re-emitir

  if (calls !== 1) {
    throw new Error(`${label}: idempotencia ROTA — confirmEmissionFlow se ejecutó ${calls} veces (esperado 1). Se pudo haber emitido un duplicado.`);
  }
  if (first !== second) {
    throw new Error(`${label}: el segundo run devolvió un objeto distinto (esperado el resultado cacheado).`);
  }
  console.log(`   ✓ idempotencia OK (${label}): 2 store.run, 1 sola emisión real.`);
  return first;
}

async function main() {
  console.log("→ [1/2] Emitiendo Factura C $1 Consumidor Final (REAL, vía idempotencyStore)...");
  const fact = await emitirIdempotente("factura", facturaPlantilla, {});
  console.log("   Factura:", {
    numeroCompleto: fact.numeroCompleto,
    cae: fact.cae,
    pdfBytesB64: fact.pdfBase64?.length ?? 0,
  });

  if (!fact.numeroCompleto || !fact.cae) {
    console.error("   ⚠️  No se pudo leer numeroCompleto/CAE de Consultas — revisar el flujo.");
  }

  // Construir el StoredInvoice original desde el resultado para armar la NC.
  const [pvStr, nroStr] = (fact.numeroCompleto || "0-0").split("-");
  const original: StoredInvoice = {
    fecha: formatDMY(new Date()),
    tipo: "FACTURA C",
    tipoComprobante: 11,
    puntoVenta: Number(pvStr),
    numero: Number(nroStr),
    numeroCompleto: fact.numeroCompleto,
    cuitEmisor: cuit!,
    razonSocialEmisor: "",
    cuitReceptor: fact.receptor.cuit || "",
    razonSocialReceptor: fact.receptor.razonSocial || "",
    importeNeto: fact.importeTotal,
    importeIVA: 0,
    importeTotal: fact.importeTotal,
    moneda: "ARS",
    emittedByGarca: true,
  };

  const { plantilla, opts } = buildCreditNote({ original, condicionIVA: "5" });
  console.log(`→ [2/2] Emitiendo Nota de Crédito que cancela ${fact.numeroCompleto} (REAL, vía idempotencyStore)...`);
  const nc = await emitirIdempotente("nota-credito", plantilla, opts);
  console.log("   Nota de Crédito:", {
    numeroCompleto: nc.numeroCompleto,
    cae: nc.cae,
    pdfBytesB64: nc.pdfBase64?.length ?? 0,
  });

  console.log("\n✅ Ciclo completo desde código. Verificá en Consultas de RCEL:");
  console.log(`   Factura ${fact.numeroCompleto} (CAE ${fact.cae})`);
  console.log(`   NC      ${nc.numeroCompleto} (CAE ${nc.cae}) → asociada a la factura`);
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
