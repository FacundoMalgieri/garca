# Facturador GARCA — Diseño

> Spec de diseño. Fecha: 2026-07-03. Estado: borrador para revisión.
> Autor: Facundo + Claude (brainstorming).

## 1. Contexto y objetivo

GARCA hoy es **read-only**: scrapea el portal de AFIP/ARCA (Mis Comprobantes) con user/pass
efímero vía Playwright, sin guardar nada persistente en el server. El diferenciador de marca es
*"100% en el browser, nada se guarda, AES-256"*.

**Objetivo:** agregar un **facturador** para que el usuario emita sus facturas repetitivas
(típicamente 2-3/mes, siempre al mismo cliente y monto) con 1 click, sin abrir el portal de AFIP.

Caso testigo del dueño: Factura C mensual, mismo cliente (Responsable Inscripto), mismo monto
(a veces se actualiza), concepto Servicios, período = mes anterior.

## 2. Decisión de arquitectura

### 2.1. Cómo emiten las facturas (investigación previa)

Existen 3 caminos técnicos para emitir en AFIP:

- **Modelo A — API oficial + delegación (WSFEv1/WSFEXv1 + WSAA).** GARCA tendría 1 certificado
  propio y los usuarios delegarían "Facturación Electrónica" al CUIT de GARCA. No se guardan claves
  de usuarios, pero GARCA se vuelve **"proveedor de facturación"** (entidad legal, custodia,
  posible registro ante ARCA, responsabilidad por emitir en nombre de terceros). Zona gris legal.
- **Modelo B — API oficial + cert por usuario.** Cada usuario sube su cert X.509 + clave privada;
  GARCA los usa. Rompe frontal el "nada se guarda" (guardar claves privadas ajenas). Mala UX
  (generar cert, no anda en mobile, hay que subirlo). Descartado.
- **Modelo C — Playwright sobre "Comprobantes en Línea" (RCEL).** Emitir manejando el formulario
  web con user/pass efímero, **idéntico al modelo del scraper actual**. Cero cert, cero storage,
  anda en mobile, cero fricción de setup.

### 2.2. Elección: **Modelo C (Playwright/RCEL)** para el MVP

Razones:
- Coherente 100% con la arquitectura y el posicionamiento de privacidad actuales (user/pass
  efímero, nada persistente en server).
- Reusa toda la infra del scraper (login, eventos, streaming, Playwright).
- Cero fricción de certificado, funciona desde mobile.
- La "fragilidad" (RCEL cambia el HTML) es teórica: RCEL es un sistema legacy que AFIP no toca
  hace años. El costo es de mantenimiento nuestro, no de UX del usuario.

**La API oficial (WSFE/WSFEX) queda como evolución futura** (robustez, o un "GARCA Pro"
gestionado), **no bloqueante**.

### 2.3. Hechos clave de la investigación (verificados)

- **Emitir por API es viable** (WSFEv1, Factura C = cbte tipo 11; Factura E = WSFEXv1). No es el
  camino del MVP, pero valida que la migración futura es posible.
- **No existe API oficial de lectura masiva** ("Mis Comprobantes" es web app, no web service).
  Confirma por qué GARCA scrapea. El scraper sigue siendo necesario para histórico + recibidas.
- Lo emitido por GARCA se **appendea desde la respuesta de emisión**, sin depender de re-scrapear.

## 3. Alcance

### MVP
- Emisión **Factura C** (monotributo) vía Playwright/RCEL.
- **Plantillas** guardadas + **repetir última** (desde histórico scrapeado).
- **Preview real de RCEL** (pantalla 4 "Resumen") + confirmación con monto grande.
- **Anti-duplicado** + botón idempotente.
- **CAE + PDF** + append a InvoiceContext/localStorage con dedupe.
- **Notas de Crédito C** ("Deshacer" última + puntual desde lista de emitidas).
- **Lista de facturas emitidas**.
- ⭐ **Alerta de tope de monotributo** al emitir (diferencial: nadie más lo hace).
- Soporte de **múltiples líneas** de detalle (varios servicios en una factura).
- Concepto **Servicios / Productos / Productos y Servicios** (aunque el caso testigo es Servicios).

### V2 (no bloqueante)
- ⭐ Anomalía de monto vs histórico ("normalmente facturás $X, pusiste $Y").
- **Factura E** (exportación) vía Playwright sobre el PV de exportación (o WSFEX).
- Nota de Crédito **parcial**.
- **API oficial WSFE** (robustez / Pro).
- Modelo A (delegación / GARCA Pro gestionado).
- Sección "Otros Tributos" (para responsables inscriptos; monotributo no la usa).

## 4. Modelo de datos (cero server)

Todo en `localStorage`, igual que el resto de GARCA. Nada sensible persiste.

```
Plantilla {
  id: string
  nombre: string                       // "Factura mensual GSA"
  puntoDeVenta: string                 // nro de PV (ej. "3")
  concepto: "productos" | "servicios" | "ambos"
  cliente: {
    condicionIVA: string               // código idIVAReceptor (ej. "1" RI)
    tipoDoc: string                    // código idTipoDocReceptor (ej. "80" CUIT)
    nroDoc: string
    razonSocial: string                // cacheada del padrón (se revalida al emitir)
    domicilio?: string                 // selección del combo / texto
    email?: string
    condicionVenta: string[]           // ["6"] = Transferencia Bancaria
  }
  periodo?: {                          // solo servicios; opcional
    desde?: string, hasta?: string, vtoPago?: string
  }
  lineas: [ {
    codigo?: string
    descripcion: string
    cantidad: number                   // default 1
    unidad: string                     // código detalleMedida (ej. "7" unidades)
    precioUnitario: number             // lo que suele cambiar mes a mes
    bonificacion?: number              // % default 0
  } ]
}
```

- **Emitidas**: se guardan en InvoiceContext + localStorage con flag `emittedByGarca: true`,
  incluyendo CAE, número (`PV-nro`), fecha, importe, y ref al PDF.
- **Dedupe** al re-scrapear: por `tipoComprobante + puntoVenta + numero`.
- **Borrador de emisión en curso**: se persiste en localStorage para recuperar si el proceso se
  corta (ver §6).
- Persistencia sigue el patrón de `useInvoices` (STORAGE_KEY, TTL, save silencioso).

## 5. Autenticación / credenciales

- El facturador es **exclusivo de usuarios logueados**.
- Hoy la pass **no se persiste** (solo vive en memoria durante el fetch; ver `useInvoices`).
  Por lo tanto:
  - Si la pass está **en memoria** (scrapeó en esta sesión) → emitir es transparente, no se
    re-pide.
  - Si **no** está (sesión fresca, solo cache de facturas) → se re-pide la clave con copy claro:
    *"Para emitir necesitamos que ingreses tu clave de nuevo — no la guardamos, es solo para esta
    operación."*
- La credencial se cifra (`encryptCredentials`) y se manda a la API route, se usa efímera y se
  descarta. Nunca toca localStorage.

## 6. Flujo de emisión

**Una sola sesión de Playwright con pausa en el preview** (no dos procesos separados que
dupliquen el llenado):

```
Fase 1 (build + preview):
  1. Login RCEL (reusa step de login del scraper) + seleccionar empresa
  2. Navegar por CLICKS (no deep-link, ver §7) hasta "Generar Comprobantes"
  3. Llenar pantallas 0→3 con los datos de la plantilla (eventos reales, no inyección JS)
  4. Llegar a la pantalla 4 "Resumen" (= preview REAL de AFIP)
  5. Capturar el resumen (screenshot + parse) y devolverlo al browser del usuario
  → La sesión de Playwright queda viva esperando confirmación

Validaciones locales ANTES de la fase 1 (o entre 1 y 2):
  - CUIT/CUIL del receptor válido (dígito verificador — reusar util existente)
  - Monto > 0, formato válido, vtoPago <= hoy+10 (tope AFIP)
  - Anti-duplicado (ver §8)
  - ⭐ Alerta de tope de monotributo (ver §9)

Fase 2 (commit):
  6. Usuario ve el preview + modal "monto grande + ES REAL + no se deshace (solo NC)"
  7. Confirma → Playwright hace click en "Confirmar Datos..." (observarOConfirmar())
  8. Se obtiene CAE + número; se descarga el PDF (imprimirComprobante.do?c=<id>)
  9. Append a InvoiceContext/localStorage con flag emittedByGarca + dedupe
```

**Recovery vía Pre-Comprobante (draft):** RCEL soporta guardar borradores ("Pre-Comprobantes",
estado *Pendiente*, se autoeliminan a los 30 días). Si la sesión muere entre fase 1 y 2, o hay
timeout, el borrador es la garantía para retomar sin re-cargar. (A confirmar en implementación
en qué punto exacto del flujo se ofrece "guardar borrador".)

**Idempotencia:** el botón se deshabilita al primer click. Si la fase 2 tiene timeout/incertidumbre
("no sé si se emitió"), **NO reintentar a ciegas** → consultar el último comprobante del PV
(`FECompUltimoAutorizado` conceptual, acá vía Consulta de RCEL) antes de decidir.

## 7. Mapeo técnico de RCEL (verificado en vivo, v4.9.7)

### Entrada (¡importante!)
- **No se puede deep-linkear** las URLs `.do` (dan **403 Forbidden**). Hay que navegar por
  **clicks** desde el portal → "Comprobantes en línea" → seleccionar empresa → menú.
- Navegar por URL directa **rompe la sesión** de RCEL (referer-sensitive).
- **Inyectar `value` por JS NO sobrevive la validación de submit** de RCEL. Playwright debe usar
  interacciones reales (`selectOption`, `type`, eventos reales) o el server rechaza los campos.

### Flujo de 5 pantallas (Factura C)

| # | URL | Contenido | Selectores clave |
|---|-----|-----------|------------------|
| 0 | `buscarPtosVtas.do` | PV + tipo comprobante | `#puntodeventa` (value=nro PV), `#universocomprobante`; Continuar = `validarCampos()` |
| 1 | `genComDatosEmisor.do` | Datos de emisión (Paso 1/4) | `#fc` fecha, `#idconcepto` (1=Prod,2=Serv,3=Ambos, onchange `mostrarOcultar()`), `#monedaextranjera`, `#actiAsociadaId`, período (servicios): `#fsd` desde, `#fsh` hasta, `#vencimientopago` |
| 2 | `genComDatosReceptor.do` | Datos del receptor (Paso 2/4) | `#idivareceptor`, `#idtipodocreceptor`, `#nrodocreceptor`, `#razonsocialreceptor` (readonly, auto), `#domicilioreceptorcombo`/`#domicilioreceptor`, `#email`, `#formadepago1..8`, comprobantes asociados (`cmpAsociado*`) |
| 3 | `genComDatosOperacion.do` | Detalle/importe (Paso 3/4) | `#detalle_descripcion1`, `#detalle_cantidad1`, `#detalle_medida1`, `#detalle_precio1`, `#detalle_porcentaje1`, `#detalle_subtotal21`; `insertarFilaDetalle()`; totales `#subtotal3`, `#imptotal`; precisión `#numdecimalescantidad`/`#numdecimalespreciounit` |
| 4 | `genComResumenDatos.do` | Resumen/preview (Paso 4/4) | Botón **"Confirmar Datos..."** = `observarOConfirmar()` ← **EMITE**; post: `imprimirComprobante.do?c=<idComprobante>` (PDF) |

### Dos sets de códigos (¡ojo!)
- **Emisión** (`universoComprobante` en pantalla 0): Factura C = **2**, ND C = 3, NC C = **4**,
  Recibo C = 5.
- **Oficial / Consulta** (`idTipoComprobante`): Factura C = **11**, ND C = 12, NC C = **13**
  (coinciden con WSFE). Se usa en la Consulta de comprobantes.

### Lookup de padrón (pantalla 2) — orden estricto
1. Seleccionar `#idivareceptor` → **repuebla** `#idtipodocreceptor` (para RI fuerza CUIT=80).
2. Seleccionar `#idtipodocreceptor`.
3. Cargar `#nrodocreceptor` → disparar `change` (equiv. Enter; el handler
   `recuperarReceptorSiEnter` hace `$("#nrodocreceptor").change()` → `recuperarDatosReceptor`).
4. Esperar a que `#razonsocialreceptor` tenga valor + se pueble `#domicilioreceptorcombo`.
- Si se toca IVA, se **resetea** el tipo doc → no volver atrás; respetar el orden.
- **Domicilio Comercial es obligatorio** para RI (elegir del combo).

### Unidades de medida (pantalla 3)
44 opciones. Comunes: `7`=unidades, `98`=otras unidades, `1`=kilogramos, `5`=litros, `2`=metros,
`9`=docenas, `96`=packs. Default sugerido: **unidades** (o "otras unidades" para horas).

### Consulta de emitidas (para "deshacer" + dedupe)
- `filtrarComprobantesGenerados.do` → `buscarComprobantesGenerados.do`.
- Filtros: fechas (`#fed`/`#feh`), `idTipoComprobante` (oficial: 11/13...), `#puntodeventa`,
  `nroComprobante`, doc.
- Tabla: Fecha, Tipo, Nro (`0003-00000088`), Doc receptor, **CAE**, Importe, acciones.
- Acciones: **Ver PDF** = `imprimirComprobante.do?c=<idInterno>`; export XML/ventas.

### Pre-Comprobantes (drafts)
- `pcBuscarPreComprobantes.do`. Estados: **Pendiente** (borrador, sin CAE) / **Generado**.
- Se **autoeliminan a los 30 días**.
- Un pre-comprobante Pendiente **no es documento fiscal** (no tiene CAE).

## 8. Notas de Crédito ("Deshacer")

- Fiscalmente no se borra: se emite una **Nota de Crédito C (cbte tipo 13, universo 4)** que
  referencia y anula la factura original.
- El vínculo va en **Comprobantes Asociados** (pantalla 2 del flujo de NC): tipo + PV + número +
  fecha de la original. GARCA lo rellena solo; el usuario nunca lo ve.
- **Deshacer última** = NC contra la última factura emitida por GARCA.
- **Deshacer puntual** = elegir de la lista de emitidas → NC contra esa.
- MVP: **NC total** (anula 100%). NC parcial = V2.
- Copy de confirmación deja clarísimo que **genera una NC en tu PV** (no desaparece nada).
- ⚠️ A validar en implementación: reglas de AFIP sobre qué comprobante se puede asociar (fechas,
  tipo compatible).

## 9. Alerta de tope de monotributo (diferencial)

- GARCA ya calcula categoría/proyección (`useMonotributo`, `useProjection`).
- Al emitir, **antes de confirmar**: *"Esta factura te deja a $Z del tope de la categoría B"* o
  *"⚠️ Te hace pasar de categoría"*.
- Único porque GARCA tiene el histórico + la lógica de categorías. Nadie más avisa esto al facturar.

## 10. Prevención de errores / UX de seguridad

- **Preview = pantalla 4 real de AFIP** (no reconstruida por nosotros → imposible que mienta).
- **Confirmación** con monto en grande, cliente, y "esto es REAL y no se deshace (solo NC)". Click
  deliberado.
- **Anomalía de monto** vs histórico del cliente (V2).
- **Anti-duplicado**: "ya emitiste $X a Cliente Y hace N min / este mes, ¿otra?".
- **Idempotencia** (ver §6).
- **Validaciones**: CUIT válido, monto > 0, vtoPago ≤ hoy+10.
- Ningún insulto ni copy ofensivo en el código (ni en console.log).

## 11. Componentes / UI

- Feature **solo para logueados**. Si no está logueado, `/facturar` es la entrada (login primero).
  Si está logueado, vive como sección dentro de `/panel` (o `/facturar` dedicada — decisión de UI).
- Componentes:
  - **Selector**: plantillas guardadas + "repetir última a [cliente]".
  - **Form de emisión**: cliente, concepto, período, líneas (N), monto. Defaults precargados.
  - **PreviewModal**: screenshot/parse del Resumen de RCEL + confirmación.
  - **EmittedList**: emitidas por GARCA con botón "Deshacer" por fila (reusar `InvoiceTable`).
  - **Plantillas CRUD**: en localStorage.

## 12. Backend (API routes + scraper steps)

Reusa la infra de `src/lib/scrapers/afip/`. Nuevos steps de emisión paralelos a los de extracción:

```
src/lib/scrapers/afip/steps/emission/
  factura-c.ts       // llena pantallas 0→3, llega al Resumen (pantalla 4), NO confirma
  confirmar.ts       // click "Confirmar Datos..." (observarOConfirmar) → CAE + PDF
  nota-credito.ts    // NC C (tipo 13), referencia original en Comprobantes Asociados
  preview.ts         // captura/parse del Resumen
  consulta.ts        // lista emitidas (CAE, PDF) para deshacer/dedupe
```

```
POST /api/arca/emit          (+ /stream)  // fase 1: build + preview (no emite)
POST /api/arca/emit/confirm  (+ /stream)  // fase 2: confirma → CAE + PDF
POST /api/arca/credit-note   (+ /stream)  // deshacer (NC)
POST /api/arca/emitted                    // consulta de emitidas
```

Protegidas por Turnstile + rate limiting como las rutas actuales.

## 13. Estrategia de testing

- RCEL es **solo producción** (no hay homologación) → cada emisión real es una factura real.
- **Los pre-comprobantes (drafts) son el camino de testing seguro**: recorren el flujo completo
  (pantallas 0→4) pero se guardan como borrador → **no generan CAE, no son documento fiscal**.
- Los scrapers/emisión quedan **excluidos de los tests automatizados** (como los scrapers actuales;
  requieren conexión real a AFIP). Se testean manualmente vía pre-comprobantes.
- El "frenar en la pantalla 4 sin confirmar" también permite verificar todo el llenado sin emitir.

## 14. Riesgos y preguntas abiertas

- **Legal**: emitir en nombre del propio usuario (Modelo C) no convierte a GARCA en proveedor de
  facturación (el usuario usa su propia clave fiscal). El Modelo A (delegación) sí — queda fuera del
  MVP.
- **Factura C con moneda extranjera**: verificar si RCEL lo permite (el dueño usa Factura E para
  moneda extranjera). Low priority.
- **Reglas de NC**: qué comprobante se puede asociar y en qué plazos (validar en implementación).
- **`observarOConfirmar()`**: el nombre sugiere que puede haber un paso de "observaciones" antes de
  confirmar. Mapear ese sub-flujo al implementar (vía pre-comprobante).
- **Fragilidad de RCEL**: mitigada por lo legacy del sistema, pero los selectores deben tener
  fallback por texto/label donde no haya id estable (ej. botones "Continuar" van por `onclick`).
- **Multi-actividad / multi-PV**: si el usuario tiene varias actividades o PV, preguntar en la
  plantilla en vez de asumir.
```
