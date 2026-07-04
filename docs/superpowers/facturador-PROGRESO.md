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

## ✅ Verificado EN VIVO contra RCEL real (sin emitir)
Fase 1 completa end-to-end vía `scripts/smoke-emit-preview.ts` (headful/headless):
login → navegación → llenar 4 pantallas → **lookup de padrón** (trae "GSA COLLECTIONS ARGENTINA SA")
→ Resumen → **`EmissionPreview` completo** (emisor+receptor+líneas+totales) parseado OK. Frena sin confirmar.

Correr: `AFIP_CUIT=20354104076 AFIP_PASS='clave' npx tsx scripts/smoke-emit-preview.ts` (HEADLESS=1 opcional).

## ⏳ Falta

**Plan 3 — Componentes (Tasks 5-9)** — la capa VISUAL, próximo brainstorm de UI/UX:
- `/facturar` con gate de login (reusar `LoginForm`; copy "reingresá tu clave, no la guardamos").
- `TemplateSelector` + `TemplatesManager` (CRUD plantillas).
- `EmissionForm` (precargado de plantilla; período con atajo "mes anterior"; vto ≤ hoy+10).
- **`EmissionPreviewModal`** ← la pantalla clave: **diseño PROPIO mostrando TODO** el `EmissionPreview`
  (emisor/receptor/líneas/totales) + `<details>` con `preview.html` crudo de respaldo + **alerta de
  tope** (`computeTopeAlert`) + confirmación con monto grande ("es REAL, no se deshace, solo NC").
- `EmittedList` (reusa `InvoiceTable`, filtra `emittedByGarca`; botón "Deshacer" stub → Plan 4).

**Plan 4 — Notas de Crédito ("Deshacer")** — aún sin escribir: fill-plan NC (universo "4" + comprobante
asociado en pantalla 2), step `nota-credito`, route `/api/arca/credit-note`, cablear "Deshacer última"
y "Deshacer puntual". NC total en MVP; parcial = V2.

**Verificación pendiente que requiere UNA emisión real** (plan del dueño: hacerla al final, con
Consumidor Final): `confirmEmission` (CAE/número/`idComprobante`), `downloadPdf`, `consultarEmitidas`.
Ajustar los `TODO(manual-verify)` de `confirm.ts` con el HTML post-emisión real.

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
