# Spec: Cliente del facturador — menos campos + autocompletar desde historial

**Fecha:** 2026-07-18
**Branch:** `feat/facturador`
**Origen:** brainstorming tras el review; verificado EN VIVO contra RCEL v4.9.9 (padrón real, read-only).

## Problema

El form de emisión (`EmissionForm`) pide al usuario datos del receptor que **AFIP ya conoce y autocompleta**, o que **no se usan**:
- **`razonSocial`**: la pedimos, pero nunca se manda a RCEL — el padrón la trae del documento. La tipeamos al pedo.
- **`domicilio`**: idem, RCEL lo resuelve del padrón (o lo deja vacío para consumidor final, y lo acepta).
- **`email`**: no existe campo email en el receptor de RCEL. Peso muerto.

Además, para clientes repetidos el usuario re-tipea todo cada vez, cuando **ya tenemos su razón social en el historial de facturas** que scrapeamos.

## Evidencia empírica (RCEL, lookup real del padrón)

Probado con lookup real en la pantalla del receptor (CUIT, CUIL y DNI):

| receptor | razón social | domicilio |
|---|---|---|
| Empresa RI (CUIT) | ✅ resuelve | ✅ varios domicilios |
| Persona monotributo (CUIL/DNI) | ✅ resuelve | ✅ 1 domicilio |
| Persona consumidor final no inscripta (DNI) | ✅ **nombre** | ❌ ninguno (RCEL lo acepta vacío) |

**Reglas confirmadas:**
1. AFIP resuelve la **razón social/nombre para todos** los tipos de doc (CUIT, CUIL, DNI) — viene del registro de personas.
2. El **domicilio** solo existe para contribuyentes inscriptos; un consumidor final común no tiene, y RCEL emite igual.
3. La **condición IVA NUNCA la trae el padrón** — siempre es input manual. Y **condiciona qué tipos de doc permite RCEL**: Consumidor Final → 10 tipos (incluye DNI, Pasaporte…); RI/Monotributo → solo CUIT.
4. Nuestra app hoy dispara el lookup solo para CUIT/CUIL; **RCEL también resuelve DNI** si se dispara el "Enter".
5. No hay API pública gratis de padrón (AFIP oficial pide certificado; TusFacturas/AfipSDK son pagas). Fuera de alcance.

## Objetivo

Que el usuario cargue **lo mínimo**: condición IVA + tipo/número de doc + líneas. Todo lo demás lo pone AFIP o nuestro historial. Los clientes repetidos quedan casi 1-click.

## Diseño

### 1. Recorte de campos del receptor (`EmissionForm`)
Quitar del form: **razón social, domicilio, email**. Quedan: condición IVA, tipo de doc, número de doc, condición de venta, concepto, PV, líneas.

- La razón social **no** es input del usuario. Se muestra **read-only** como confirmación cuando la conocemos (del historial), con copy tipo *"AFIP: PEREZ JUAN CARLOS"* o, si es cliente nuevo, *"AFIP va a completar la razón social al emitir"*.
- El **preview real** (Resumen de RCEL) sigue siendo la red de seguridad: muestra la razón social/domicilio efectivos que AFIP resolvió, antes de confirmar.

### 2. Tipos (`types/facturador.ts`)
- `ClienteFactura`: **eliminar `domicilio` y `email`**. `razonSocial` pasa a **opcional** (`razonSocial?: string`) — cache de display/almacenamiento, no input obligatorio.
- Quitar el threading de `domicilio` en `emit.ts` (`fillComprobante(..., { domicilio })`) → `fill.ts` ya cae al domicilio del combo (índice 1) o vacío. Sin cambios de comportamiento en RCEL.
- Migración: plantillas viejas en localStorage con `domicilio`/`email`/`razonSocial` se leen sin romper (campos extra ignorados; `razonSocial` opcional).

### 3. Índice de clientes desde historial (nuevo, puro)
`src/lib/facturador/client-index.ts`:
- `buildClientIndex(invoices: AFIPInvoice[], memory: ClientMemory): Map<cuit, ClientHint>`.
- `ClientHint = { razonSocial?: string; condicionIVA?: string; condicionVenta?: string[] }`.
- Fuente de `razonSocial`: `invoices[].cuitReceptor → razonSocialReceptor` (lo que ya scrapeamos).
- Fuente de `condicionIVA`/`condicionVenta`: **memoria de cliente** (abajo), porque las facturas scrapeadas NO guardan la condición IVA del receptor.
- Puro y testeable.

### 4. Memoria de cliente (nuevo) — resuelve también la limitación de NC
`src/lib/facturador/client-memory.ts` + persistencia en `localStorage` (key `garca_clientes`):
- Al **emitir** (GARCA), guardar por `cuitReceptor`: `{ razonSocial, condicionIVA, condicionVenta }` efectivamente usados.
- Beneficio doble: (a) autocompletar condición IVA/venta de clientes repetidos; (b) **la NC ya no defaultea a Consumidor Final** — usa la condición IVA real recordada (cierra la limitación V2 anotada en PROGRESO).
- SSR-safe, try/catch en parse (mismo patrón que el resto).

### 5. Autocompletar en el form (`EmissionForm` + hook)
- `useClientes()` (o consumir el índice) para: al elegir/tipear un CUIT/nroDoc conocido, prefill de condición IVA + condición de venta, y mostrar la razón social read-only.
- Selector/typeahead de cliente conocido (opcional, MVP puede ser: al completar el nroDoc, si está en el índice, prefill).
- Mantener el filtro **condición IVA → tipos de doc válidos** (ya validado en vivo): elegís condición IVA y solo se ofrecen los tipos de doc que RCEL permite.

### 6. Lookup de DNI (fill-plan/fill) — tolerante
- `fill-plan.ts`: extender el `puedeLookup` para incluir **DNI (`96`) con nroDoc no vacío**, de modo que el nombre del receptor por DNI también quede resuelto/registrado.
- `fill.ts`: el `lookup` debe ser **tolerante** — esperar la razón social con timeout **acotado** y **no tirar** si no resuelve (un DNI/CUIT puede no estar en padrón). Hoy espera `ELEMENT_TIMEOUT` y podría colgar/throw; pasar a wait corto + seguir con lo que haya. Consumidor Final SIN documento sigue sin disparar lookup (comportamiento actual correcto).

### 7. Plantillas / naming
- Como se quita el input de razón social, el nombre por defecto de una plantilla deriva de: razón social conocida (historial) → si no, del CUIT/nroDoc. Ajuste menor en `page.tsx`/`TemplateSidebar`.

## Fuera de alcance
- API paga de constancia (TusFacturas/AfipSDK) para traer condición IVA de clientes **nuevos** antes de emitir. La costura (`ClientHint`) queda lista para enchufarla si hay volumen; se paga recién ahí.
- Persistir domicilio (descartado: no aporta, RCEL lo maneja).
- Typeahead sofisticado / búsqueda difusa de clientes (MVP: match exacto por doc).

## Criterios de éxito
- El form no pide razón social, domicilio ni email.
- Cliente repetido: al poner el doc, se autocompletan condición IVA + condición de venta y se muestra el nombre.
- Emisión a consumidor final por DNI/sin doc sigue funcionando (RCEL acepta domicilio vacío).
- La NC usa la condición IVA real recordada, no el default CF.
- Typecheck + lint + suite verdes; nada pusheado.
