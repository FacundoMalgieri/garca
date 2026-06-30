# Fuentes — Mi primera factura electrónica en el Monotributo (2026)

Investigación: junio 2026. Tema procedimental (ARCA ex-AFIP). Se priorizaron fuentes oficiales (afip.gob.ar / argentina.gob.ar) y se cruzaron datos sensibles.

## Afirmaciones y fuentes

| Fuente | URL | Dato que respalda | Confianza |
|--------|-----|-------------------|-----------|
| ARCA — Facturación Monotributo (ayuda) | https://www.afip.gob.ar/monotributo/ayuda/facturacion.asp | Monotributista emite Factura C; vía Comprobantes en Línea; concepto Productos/Servicios | Alta |
| Argentina.gob.ar — Emitir factura electrónica (monotributistas) | https://www.argentina.gob.ar/emitir-factura-electronica | Paso a paso Comprobantes en Línea, datos del receptor, confirmar/generar, descarga PDF | Alta |
| ARCA — Facturación electrónica / CAE | https://www.afip.gob.ar/fe/ | CAE = Código de Autorización Electrónico; cita "no tendrán efectos fiscales hasta que este Organismo otorgue el CAE"; entrega al comprador dentro de 10 días corridos | Alta |
| ARCA — Exportación de servicios | https://www.afip.gob.ar/monotributo/exportacion-servicios/ | Excepción exportación → Factura E (punto de venta de Comprobantes de exportación) | Alta |
| ARCA — Guía Administración de Puntos de Venta y Domicilios | https://www.afip.gob.ar/landing/default.asp (servicio id=135) | Alta del PV: A/B/M, número de 5 dígitos correlativo desde 00001, "Factura en Línea – Monotributo", "cada método deberá tener un punto de venta diferente", domicilio previo en Sistema Registral | Alta |
| ARCA — Novedad: identificación del consumidor final | https://www.afip.gob.ar/ (novedad RG 5700/2025) | Umbral de identificación del consumidor final $10.000.000 a 2026; consignar CUIT si pide la factura para deducir Ganancias | Media (monto volátil) |
| Intecsoft — RG 5616/2024 | https://www.intecsoft.com.ar/ (nota RG 5616/2024) | Condición frente al IVA del receptor: campo obligatorio desde 01/07/2025 | Media-Alta |

## Notas de redacción

- **Clave fiscal nivel 3 + servicios + Domicilio Fiscal Electrónico**: requisitos estándar de ARCA para Comprobantes en Línea; el nivel 3 se obtiene por validación biométrica (app ARCA) o presencial. Cruzado con la ayuda de ARCA y experiencia estándar.
- **Diferencia A/B/C**: A = RI a RI (IVA discriminado); B = RI a consumidor final/monotributista; C = monotributistas y exentos (sin IVA). Coincide con la guía factura-c del repo.
- **Nota de Crédito C** para corregir (no se anula la factura con CAE): práctica oficial estándar; idealmente antes del día 10 del mes siguiente.
- **Facturador / Facturador Móvil**: Facturador web (facturador.afip.gob.ar, instalable como PWA) + Facturador Móvil (Android). RG 5602/2024 lo habilitó para todos los monotributistas. NO reemplazan Comprobantes en Línea.

## ⚠️ DATOS VOLÁTILES / NO VERIFICADOS DEL TODO — PARA REVISIÓN

1. **Umbral de identificación del consumidor final ($10.000.000, RG 5700/2025)**: monto que ARCA actualiza periódicamente. En el texto se enmarca "a {MONOTRIBUTO_YEAR}, verificá el monto vigente" y NO se presenta como número permanente. Confirmar contra la novedad vigente de ARCA antes de tomarlo como dato fijo.

2. **Obligatoriedad ampliada al 1-jul-2026 (mención de una RG 5824/2026)**: aparece en comentarios/blogs como ampliación del campo "condición frente al IVA del receptor" u otros, pero NO la confirmé en el Boletín Oficial. NO se incluyó como afirmación dura en el texto; la obligatoriedad citada es la de RG 5616/2024 desde 01/07/2025.

3. **Tope / límite del Facturador**: algunas fuentes mencionan límites de uso del Facturador (montos o cantidad de comprobantes). No verificado; no se incluyó cifra en el texto.

4. **Nombre de la app de ARCA**: la app general es "ARCA Móvil" (ex "Mi AFIP"); el componente para facturar es el "Facturador Móvil". Se evitó afirmar una app "Mi ARCA" para facturar porque no se confirmó ese nombre.

5. **RG 5602/2024 (habilitación del Facturador para todos los monotributistas)**: número y alcance tomados de fuentes secundarias; razonablemente sólido pero conviene confirmar el texto oficial.

6. **Plazo de impacto del alta de punto de venta ("al día siguiente")**: comportamiento habitual reportado por usuarios/contadores; puede variar.
