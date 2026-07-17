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
