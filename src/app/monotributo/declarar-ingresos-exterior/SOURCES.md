# Fuentes — Declarar ingresos del exterior en el monotributo (2026)

Investigación: junio 2026. Tema sensible (impositivo AR). Cruce de 2-3 fuentes por afirmación.

## Afirmaciones verificadas

### 1. Los ingresos del exterior (exportación de servicios, factura E) SÍ computan para el tope anual del monotributo
- **Confianza: ALTA** (fuente oficial + contador).
- ARCA (oficial): "Los monotributistas pueden exportar servicios, sin superar los límites de facturación de la categoría máxima correspondiente a su actividad." → No hay liberación del límite anual por exportación. Los ingresos se contabilizan dentro del tope.
  - https://www.afip.gob.ar/monotributo/exportacion-servicios/
- Estudio Piacentini: "Se puede ser monotributista y exportar servicios, mientras no se pase de la facturación máxima del último tramo de monotributo." Las exportaciones cuentan para ese techo; no hay cupo de exportación ilimitado dentro del monotributo.
  - https://www.estudiopiacentini.com.ar/exportacion-de-servicios-liberacion-del-limite-anual/

### 2. La conversión a pesos se hace con el tipo de cambio del día de la factura (BNA vendedor al cierre)
- **Confianza: MEDIA-ALTA.**
- Contablix: la factura E usa "el tipo de cambio BNA vendedor al cierre del día de la factura". Ese monto en pesos es el que queda registrado a efectos impositivos.
  - https://contablix.ar/blog/factura-e-exportacion-servicios-2026
- En la guía lo redactamos como "cotización del día de la factura" sin afirmar la fuente exacta del tipo de cambio (BNA) como regla rígida, para no sobre-precisar.

### 3. Recategorización: dos ventanas al año; evalúa los últimos 12 meses corridos
- **Confianza: ALTA.**
- ARCA (oficial): "La recategorización se realiza dos veces por año: En febrero y en agosto", "hasta el día 5", evaluando "los últimos 12 meses de actividad".
  - https://www.afip.gob.ar/monotributo/ayuda/recategorizacion.asp
- Sterba & Asociados (julio 2026): ventana del 15 de julio al 5 de agosto de 2026; período evaluado julio 2025 – junio 2026 (los 12 meses previos).
  - https://sterbayasociados.com/noticias/arca/recategorizacion-monotributo-julio-2026/
- NOTA de redacción: en el ecosistema se habla de "ventana de enero" y "ventana de julio" pero el trámite y deadline caen a principios de febrero y agosto. En la guía usamos "ventanas de enero/julio (con vencimiento a comienzos de febrero y agosto)" para ser precisos y consistentes con las otras guías del sitio (que ya dicen "enero o julio").

### 4. Liquidación de divisas / BCRA — flexibilización 2026
- **Confianza: MEDIA** (normativa cambiante, no es eje impositivo del monotributo).
- Se eliminó el viejo tope de USD 36.000 anuales sin liquidar para exportación de servicios (Com. A 8330, gestión actual). Plazo de liquidación mencionado: ~30 días corridos (Com. A 6770 como referencia histórica).
  - https://tributosimple.com/monotributistas-exportacion-servicios/
  - https://todoparamonotributistas.com/exportadores-servicios-ampliacion-monto-sin-liquidar/
  - https://contablix.ar/blog/factura-e-exportacion-servicios-2026
- En la guía se trata "a junio 2026" con disclaimer de que cambia seguido y que el régimen de divisas (BCRA/MULC) es independiente del tope del monotributo (impositivo, ARCA).

### 5. Actualización de valores del monotributo 2026
- **Confianza: MEDIA.** Una nota menciona actualización ~14,3% desde febrero 2026. No hardcodeamos números en la guía: linkeamos a la calculadora y a /monotributo. Los topes vigentes salen de src/data/monotributo-categorias.ts (lastUpdated 2026-01-20).
  - https://www.iprofesional.com/impuestos/446005-monotributo-2026-cuales-son-los-nuevos-topes-de-facturacion-y-montos-mensuales

## Conflicto detectado / a revisar (FLAG)

- **CONFLICTO IMPORTANTE:** Contablix afirma lo contrario al resto: "El cobro del exterior NO suma al límite de facturación del monotributo si se trata de exportación de servicios genuina."
  - https://contablix.ar/blog/factura-e-exportacion-servicios-2026
  - Esta postura contradice a ARCA (oficial) y a Piacentini. Parece confundir el tope IMPOSITIVO del monotributo (ARCA) con el viejo cupo de divisas del BCRA (USD 36.000), que sí era un límite distinto y fue flexibilizado.
  - **Decisión editorial:** seguimos la postura OFICIAL de ARCA (los ingresos del exterior SÍ computan para el tope) y tratamos la idea contraria como el "error más común" de la guía. Recomendado que un contador confirme antes de publicar, dado que es el dato más sensible de la página.

## Claims no verificados / dejados deliberadamente vagos
- Nombre/UI exacta de pantallas de Comprobantes en Línea (mirrorea factura-e/page.tsx, ya revisado en el sitio).
- Tipo de cambio exacto obligatorio (BNA vendedor) — lo dejamos como "cotización del día de la factura".
- Plazos de liquidación de divisas vigentes — sujetos a normativa BCRA cambiante; disclaimer explícito.
