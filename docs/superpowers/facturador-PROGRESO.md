# Facturador GARCA — Estado del progreso

> Punto de retomada. Fecha: 2026-07-03. Branch: **`feat/facturador`** (35 commits sobre `main`, nada en prod).
> Docs: spec `docs/superpowers/specs/2026-07-03-facturador-design.md` (con addendum de DOM real);
> planes `docs/superpowers/plans/2026-07-03-facturador-plan-{1,2,3}-*.md`.

## Qué es
Facturador para emitir Factura C (monotributo) manejando **RCEL** (Comprobantes en Línea) con
Playwright — mismo modelo que el scraper actual: **user/pass efímero, cero storage, headless en prod**.
API oficial (WSFE) descartada para MVP (guardaría claves privadas). Factura E y API oficial = futuro.

## ✅ Hecho y testeado (802 tests verdes, typecheck/lint/build OK)

**Plan 1 — Fundamentos** (`src/lib/facturador/`, `src/types/facturador.ts`): tipos (`Plantilla`,
`StoredInvoice`, `EmissionPreview`…), códigos RCEL (2 sets: emisión `universoComprobante` FacturaC="2"
NC="4"; oficial `TIPO_OFICIAL` FacturaC=11 NC=13), `validateCuit` (mod-11), fechas (`previousMonthPeriod`,
`defaultVtoPago` hoy+10), `validateEmissionInput`, `templates` (CRUD localStorage), `dedupeInvoices`
(clave tipo+PV+numero), `computeTopeAlert`. Revisado por Opus (SOLID).

**Plan 2 — Backend emisión**:
- Puro: `money` (round2 simétrico, parseARNumber), `fill-plan` (Plantilla→acciones RCEL, soporta
  fecha `#fc` y actividad `#actiAsociadaId`), `resumen-parser` + `consulta-parser` (**ajustados al
  HTML REAL de RCEL v4.9.7**, fixtures reales en `__fixtures__/`).
- Playwright (`src/lib/scrapers/afip/steps/emission/`): `navigate` (reusa navegación del scraper →
  Generar Comprobantes), `fill` (pantallas 0-3, eventos reales, lookup padrón, insertarFilaDetalle),
  `preview` (captura Resumen), `confirm` (⚠️ selectores post-emisión `TODO(manual-verify)`), `consulta`.
- Orquestador `emit.ts` (`buildEmissionPreview`, `confirmEmissionFlow`, `listEmitted`) + rutas
  `POST /api/arca/emit`, `/emit/confirm`, `/emitted` (misma seguridad que invoices: turnstile + rate limit + decrypt).

**Plan 3 — UI (hooks)**: `useTemplates`, `useEmission` (2 fases + append con dedupe al contexto),
`useEmittedRepeat` (última factura a un CUIT), `InvoiceContext.addEmittedInvoice`.

**Plan 3b — UI (componentes) ✅ COMPLETADO** (plan `plans/2026-07-03-facturador-plan-3b-ui-componentes.md`,
spec `specs/2026-07-03-facturador-ui-design.md`). 11 tasks, TDD, subagent-driven con review de spec+calidad
por task + review final holístico (Opus, "ready to merge", invariante de seguridad de la clave verificado).
Suite total **847 tests verdes**, typecheck/lint (0 errores)/build OK. Incluye:
- Fixes: `useEmission` reenvía turnstile como header `x-turnstile-token`; `CompanyInfo.index` persistido;
  `EmissionResult.pdfBase64?` opcional.
- `src/lib/facturador/select-options.ts`, `annual-income.ts` (paridad exacta con el cálculo del panel).
- Componentes `src/components/facturador/`: `TemplateSidebar`, `EmissionForm` (form + barra de cambios de
  plantilla + total en vivo), `TemplatesManager` (renombrar/eliminar), `EmissionModal` (máquina de estados
  clave→preview→confirm→done/error, confirmación checkbox + tipear "EMITIR", alerta de tope 3 estados,
  `<details>` con HTML crudo, PDF condicional), `EmittedTab` (reusa `InvoiceTable` vía prop `invoices?`).
- Página `src/app/facturar/page.tsx` (gate de sesión, banner de empresa, tabs Emitir/Emitidas) + link
  "Facturar" en el navbar. La clave nunca se persiste (ref en el modal, descartada en close/emitir-otra).

## ✅ Verificado EN VIVO contra RCEL real (sin emitir)
Fase 1 completa end-to-end vía `scripts/smoke-emit-preview.ts` (headful/headless):
login → navegación → llenar 4 pantallas → **lookup de padrón** (trae "GSA COLLECTIONS ARGENTINA SA")
→ Resumen → **`EmissionPreview` completo** (emisor+receptor+líneas+totales) parseado OK. Frena sin confirmar.

Correr: `AFIP_CUIT=20354104076 AFIP_PASS='clave' npx tsx scripts/smoke-emit-preview.ts` (HEADLESS=1 opcional).

## ✅ Plan 4 — Notas de Crédito ("Deshacer") — COMPLETADO (2026-07-17)

Spec `specs/2026-07-17-facturador-nota-credito-design.md`, plan `plans/2026-07-17-facturador-notas-credito.md`
(ambos revisados por agente sin contexto antes de ejecutar). Ejecutado subagent-driven (8 tasks, TDD, review
spec+calidad por task + review final holístico Opus "ready to merge"). Suite **869 tests verdes**, typecheck/lint/build OK.
Commits `efb1387`..`2ab05a8` sobre `feat/facturador` (branch **mantenida**, sin merge).

Enfoque A (parametrizar, no duplicar):
- `fill-plan.ts`: `FillPlanOptions` gana `universo` + `asociado` (campos de comprobante asociado por `[name=...]`, `#cmp_asoc_tipo` por id).
- `credit-note.ts` (nuevo, puro): `buildCreditNote(StoredInvoice, condicionIVA)` → Plantilla sintética (1 línea "Anulación Factura C <nro>", precio = importeTotal) + opts NC.
- `emit.ts` + route `/api/arca/emit` (+`/confirm`): body discriminado por `kind` (facturaC | notaCreditoC), `tipoComprobante` dinámico (13 NC).
- `useEmission`: API pasa a `EmitTarget`; NC se mapea al contexto con `tipo` "nota de credito" + `tipoComprobante 13` + `moneda "ARS"` (baja el ingreso). Fix de bug preexistente: emisiones guardaban `moneda "PES"` (no contaban) → ahora "ARS".
- `EmissionModal` modo NC (gate por `invoiceToVoid`, selector condición IVA solo scrapeadas default CF, copy serio, sin alerta de tope) + tab **"Anular"** en `/facturar` (`AnularTab`).
- Smoke read-only `scripts/smoke-nc-preview.ts` (frena en Resumen, no emite).

**Verificación en vivo RCEL v4.9.9 (read-only, 2026-07-17):** universo 4 (NC C) existe; campos asociado por `name`; `formadepago` id↔posición correcto (falso riesgo); **el padrón NO setea condición IVA** (por eso scrapeadas la piden en el modal). Detalle en el spec §2.

**Limitaciones conocidas (V2, del review final):**
- Emitidas por GARCA no persisten la condición IVA del receptor → la NC usa default CF. Persistir/preguntar = V2.
- Receptor sin CUIT válido: `tipoDoc "96"` — el select de RCEL no tiene "99" (sin identificar); confirmar en la verificación real.

## ⏳ Falta (lo único pendiente)

**Follow-ups menores (no bloqueantes):**
- Agregar `emittedByGarca?: boolean` a `AFIPInvoice` (o subtipo) para sacar los casts inline en `EmittedTab`.
- `useEmission` mapea `cuitEmisor: ""` — se podría threadear el CUIT emisor real (cosmético).

**Verificación que requiere UNA emisión real** — ✅ HECHA (2026-07-17, ciclo real por Chrome MCP):
emitida Factura C `0003-00000090` (CAE 86294312835388, $1, Consumidor Final) y su Nota de Crédito C
`0003-00000003` (CAE 86294314778299) que la anula. Ver "Mapeo real de emisión/NC" abajo.

## Mapeo real de emisión + NC (2026-07-17, RCEL v4.9.9) — GAPS A CORREGIR ANTES DEL CODE-RUN

Descubierto emitiendo de verdad por Chrome MCP. Antes de correr el flujo desde código, corregir:

1. **BUG `credit-note.ts` — padding del comprobante asociado (pantalla 2, NC).** RCEL valida por longitud con `alert()` on blur:
   - `cmpAsociadoPtoVta` exige **5 dígitos** → hoy mandamos `String(puntoVenta)` = "3". Debe ser `"3".padStart(5,"0")` = "00003".
   - `cmpAsociadoNro` exige **8 dígitos** → hoy mandamos `String(numero)` = "90". Debe ser `.padStart(8,"0")` = "00000090".
   - ⚠️ Si no se paddea, RCEL dispara `alert()` nativo y el Playwright se cuelga en el diálogo. (Además el flujo Playwright debería tolerar/aceptar diálogos.)

2. **`confirm.ts` — el "Confirmar Datos…" abre un modal jQuery-UI, no un `confirm()` nativo.**
   Secuencia real: click `input#btngenerar` (`observarOConfirmar()`) → aparece modal "Generar Comprobante" → click `button.ui-button` con texto "Confirmar". Recién ahí se emite ("✅ Comprobante Generado").

3. **`confirm.ts` — CAE y número NO están en la pantalla post-emisión.** Esa pantalla solo muestra "Comprobante Generado" + botones. El `idComprobante` sí está como **variable JS global** (`window.idComprobante`, ej. 4918343213). Para obtener número + CAE hay que ir a **Consultas** (ver punto 4) o parsear el PDF. NO se pueden parsear del post-confirm.

4. **CAE/número vía Consultas** (`filtrarComprobantesGenerados.do` → botón Buscar → `buscarComprobantesGenerados.do`):
   tabla HTML con columnas `Fecha Emisión | Tipo Comprobante | Nro. Comprobante | Tipo Doc. Receptor | Nro. Doc. Receptor | CAE | Importe Total`. El `consulta-parser` ya matchea este formato. Correlación con lo recién emitido: no hay `idComprobante` en Consultas → matchear por PV+tipo+importe o "el más reciente".

5. **PDF**: `imprimirComprobante.do?c=<idComprobante>` — navegar directo aborta (se descarga). Hay que bajarlo como blob. También `exportarComprobante.do?t=z&c=<id>` (Duplicados ZIP) y `?t=v` (Ventas ZIP).

6. **Consumidor Final OK**: IVA=5 + tipoDoc=96 (DNI) + `nrodocreceptor` VACÍO + razón social vacía → aceptado para $1 (en Consultas figura receptor "Doc. (otro)" con Nro vacío). Valida el path no-CUIT de `credit-note.ts`.

7. Confirmado sin cambios: universo 4 (NC) existe; `#cmp_asoc_tipo`=11 (Factura C) por id + `cmpAsociado{PtoVta,Nro,FechaEmision}` por `[name=...]`; fecha asociada opcional; forma de pago `#formadepago1..8` por posición; Resumen (pantalla 4) idéntico al fixture del `resumen-parser`.

**Próximo paso:** aplicar fixes 1-5 y correr el flujo desde código (empezando por `smoke-nc-preview.ts`, ya con el padding corregido).

## ✅ Validación de emisión REAL desde código (2026-07-17) — confirm.ts OK

Corrido `scripts/smoke-emit-confirm.ts` (EMIT_REAL=1) → `confirmEmissionFlow` end-to-end contra RCEL real:
emitió **Factura C 0003-00000091** (CAE 86294319907270) y **NC 0003-00000004** (CAE 86294320072368) que la
asocia/cancela. Todo el flujo reescrito (modal jQuery-UI, "Comprobante Generado", idComprobante, CAE vía
Consultas) funcionó. PDF validado aparte: 83.403 bytes, header `%PDF-`.

Dos bugs MÁS que encontró el code-run (que el run manual ocultó) — ya corregidos (commit 540cdb4):
- **`fill-plan.ts`**: el `lookup` de padrón sobre `#nrodocreceptor` se colgaba para Consumidor Final sin
  documento (esperaba una razón social que nunca llega). Ahora `lookup` solo si tipoDoc CUIT/CUIL + nroDoc
  no vacío; si no, `fill` simple.
- **`confirm.ts downloadPdf`**: `page.goto` exige URL absoluta (la relativa daba "invalid URL") y lanza
  "Download is starting" (hay que ignorarlo y quedarse con el evento `download`). Ambos corregidos.

**Limitación conocida restante:** `vencimientoCae` queda vacío (Consultas no expone la columna Vto CAE; está
en el PDF). No bloqueante. Parsearlo del PDF = V2.

**Estado: facturador COMPLETO y validado con emisiones reales (Factura C + NC).** Comprobantes de prueba de
$1 quedaron en la cuenta (se cancelan entre sí).

## ✅ Ronda de hardening post-review (2026-07-18) — 933 tests verdes

Tras completar el facturador se corrió un **review adversarial exhaustivo** (3 agentes Opus: backend,
hooks, UI) sobre todo el trabajo del branch. Los hallazgos se convirtieron en un plan multi-subagente
(`plans/2026-07-18-facturador-review-fixes.md`, gitignored) con 6 workstreams file-disjuntos + 2 contratos
pinneados, **criticado y endurecido por un 4º agente Opus** antes de ejecutar, y luego implementado por 6
agentes Opus en paralelo. Coordinator (sesión principal) integró y verificó: typecheck + lint (0 errores) +
**suite completa 933 tests verdes** (baseline 871 → +62). Commits `d65a69a`..`7298614`, branch mantenida sin push.

**El hallazgo central: cadena de doble-emisión (documento fiscal irreversible), cerrada por 3 lados:**
- **WS2 `useEmission`** (`1f304ec`): `inFlightRef` (early-return si un confirm ya está en vuelo) +
  `idempotencyKey` estable en `useRef` que cambia SOLO en `startPreview` y **sobrevive los reintentos
  post-error** (`reset()` no la toca) → un "Reintentar" manda la misma key.
- **WS1 backend** (`d65a69a`): `idempotencyStore` server-side (`lib/facturador/idempotency.ts`, puro+testeado)
  en el route de confirm — misma key devuelve el result cacheado en vez de re-emitir. Limitación serverless
  (Map por-instancia) documentada.
- **WS5 modal** (`7a0caeb`): "Reintentar" post-confirm re-llama `confirm()` (misma key), no `reset()`/`startPreview`.
- **Estado "CAE pendiente"** (Contrato B): emisión con `cae:""` (Consultas no resolvió) se muestra como
  "Emitida — CAE pendiente", NUNCA como error → el usuario no reenvía.
- Smoke `smoke-emit-confirm.ts` (`7298614`) reescrito para emitir vía `store.run` y verificar en vivo que
  re-correr con la misma key **no re-emite** (2 store.run → 1 emisión real).

**Otros fixes de la ronda:**
- **WS1** (`d65a69a`): resolución de CAE robusta (`pickEmittedMatch`, compare de PV **numérico** — arreglaba
  el bug de padding que dejaba `cae:""`); `validateEmitBody` (whitelist de `kind` + validación server-side,
  400 antes de abrir browser); error genérico al cliente (sin volcar mensajes crudos de RCEL).
- **WS3 `useInvoices`** (`dd3d01d`): `mergeFetchedInvoices` — un re-fetch de ARCA ya no pisa las facturas
  emitidas por GARCA (el row autoritativo con CAE gana sobre el placeholder; reconcilia el caso CAE-pendiente
  sin duplicar; preserva la emitida aún no indexada). `garca_pdv` corrupto aislado en su try/catch (ya no
  deslogueaba al usuario).
- **WS4 parsers** (`a58a555`): `parseARNumber` punto/coma robusto (un punto → decimal `"10.00"→10`; múltiples
  puntos → miles `"1.234.567"→1234567`, evita NaN); `buildCreditNote` deriva `asociado.tipo` y el texto del
  `tipoComprobante` real del original (ya no hardcodea Factura C).
- **WS5 modales** (`7a0caeb`): a11y de teclado (`useModalA11y`: Esc, focus trap, foco inicial+restore,
  aria-labelledby); backdrop-close arreglado (el overlay comía el click); copy del gate NC-aware; test de
  descarga de PDF.
- **WS6 form/landing** (`54217a6`): inputs numéricos sin `$NaN`; guard que no deja emitir con PV export-only
  (evita el cuelgue de 60s); tests de alto riesgo (auto tipoDoc DNI para Consumidor Final, gate de validación,
  PV auto-select); `FacturadorSection` respeta `prefers-reduced-motion`.
- **Coordinator** (`929e700`): globals de browser en `eslint.config.mjs` (`crypto`, `Element`,
  `KeyboardEvent`, `MediaQueryListEvent`).

**Verificado limpio en el review (sin acción):** sin XSS (todo por text nodes; PDF vía `data:` URL); CSP sin
bypass LAN ni `http:`; rutas emit igual de protegidas que invoices (rate-limit → bot → Turnstile); la clave
nunca se persiste/loguea.

**Fuera de alcance (documentado):** idempotencia cross-instance real (Redis/KV) y rate-limit distribuido (M5);
persistir condición IVA real del receptor para NC; hash del preview re-validado antes de confirmar; listener
`storage` multi-tab.

## Decisiones/constraints clave para la UI
- Feature **solo logueados**. Pass en memoria → transparente; sesión fresca → re-login (no se guarda).
- El **preview es la red de seguridad**: mostrar TODO lo que se va a emitir; confirmación deliberada.
- **Alerta de tope de monotributo al emitir** = diferencial (nadie más lo hace).
- Acción **irreversible** → tono serio en confirmación; "deshacer" = emitir NC (Plan 4).
- Diseño: seguir lenguaje de la app (`/panel`; navy `#262F55`, cyan `#64D3DE`, coral `#FF6B5C`).
- No insultos en el código (chiste interno del dueño, queda fuera).

## Riesgos abiertos
- Fase 2 en serverless: `confirmEmissionFlow` re-llena y confirma en un request (idempotencia a
  endurecer — chequear último comprobante antes de reintentar). Documentado en Plan 2 §riesgos.
- Selectores post-emisión sin verificar (no se emitió nunca).
- RCEL headless vs headful: el scraper actual ya corre headless OK; verificar paridad.
