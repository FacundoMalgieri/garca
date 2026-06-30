# Fuentes — Wise vs Payoneer vs Deel (Monotributo 2026)

Investigación realizada en **junio 2026**. Todas las comisiones/datos están date-stamped abajo.
Las tarifas y la disponibilidad cambian seguido: confirmar en el sitio oficial antes de publicar cambios.

---

## WISE

| Fuente | Fecha que refleja | Dato tomado | Confianza |
|--------|-------------------|-------------|-----------|
| https://wise.com/ar/blog/wise-argentina | pub. 30-sep-2025 | Residente AR puede abrir cuenta online; multidivisa 50+; datos de recepción en 9 zonas (USD, EUR, GBP, AUD, CAD, NZD, HUF, SGD, TRY); **tarjeta NO disponible en AR**; no se puede ingresar ARS | ALTA |
| https://wise.com/us/pricing/business/receive | jun-2026 | Recibir USD por ACH = gratis; wire SWIFT USD = **6,11 USD fijo** (EUR 2,39 €, GBP 2,16 £) | ALTA |
| https://wise.com/us/pricing | jun-2026 | Conversión = tipo medio de mercado + fee variable (~0,33%–2% según par; típico freelancer 0,5%–2%) | MEDIA (rango) |
| https://wise.com/es/help/articles/2962718/transferencias-hacia-pesos-argentinos-ars | jun-2026 | Se puede enviar desde balance USD a banco AR convirtiendo a ARS; **tope equivalente a USD 18.000 por transferencia y por mes**; conversión hasta 2 días hábiles + ~1 día acreditación | ALTA (tope/plazos); la cotización exacta no la especifica la página |
| https://blog.saldo.com.ar/convertir-saldo-wise-a-pesos-argentinos-2026 | 2026 | Conversión a ARS al **tipo oficial** (poco favorable); usuarios usan cripto/P2P para salir | MEDIA (fuente independiente) |
| https://wise.com/help/articles/2974131/what-are-the-wise-group-entities | 2025/2026 | Entidades por región: Wise Europe SA (Bélgica/EEA), Wise Payments Ltd (UK), Wise US Inc | ALTA (existencia de entidades) |

**Sin verificar (Wise):**
- Tiempo exacto de apertura de cuenta para AR.
- Si la cuenta **personal** AR cobra el setup ~31 USD (ese dato es de pricing **business**) — **no incluido como afirmación en la página**.
- % exacto de conversión USD→ARS (variable).
- Cotización exacta que usa Wise al convertir a ARS (independientes dicen "oficial"; la página oficial no lo dice) → en la página se redactó como "según fuentes independientes usa tipo oficial".
- **Entidad/jurisdicción concreta que titulariza el saldo de un residente argentino** (crítico para CRS). No mapeado en fuente oficial.

---

## PAYONEER

| Fuente | Fecha que refleja | Dato tomado | Confianza |
|--------|-------------------|-------------|-----------|
| https://www.payoneer.com/about/pricing/ | **"Last Updated 1 January 2026"** | Recibir P2P = gratis; recibir en cuenta receptora moneda local = gratis; moneda no local = 1% (mín 1 USD); ACH/banco UE-UK = 1%; tarjeta de crédito = hasta 3,99% + 0,49 USD; conversión swap interno = **0,50%**; retiro mismo país/moneda = 1,50 USD; retiro con conversión = **1,2%–4%**; tarjeta anual = **29,95 USD** | ALTA |
| https://wise.com/ar/blog/payoneer-recibir-pagos | verificado 30-ene-2026 | Residente AR puede abrir; cuentas receptoras USD/EUR/GBP; KYC; conversión menciona hasta ~3,5% | MEDIA |
| https://wise.com/ar/blog/retirar-dinero-de-payoneer-en-argentina | verificado 2-sep-2025 | Retiro a USD en Santander AR ~3,3% end-to-end; intermediarios: Bitso 2,9%, Prex 3,8% (MEP), Belo 4% (USDC), Airtm 5%; retiro a banco 2–3 días | MEDIA |
| https://www.payoneer.com/es/resources/estrategias-para-usar-y-mover-tus-fondos-en-argentina/ | 2025/2026 | Pago a cuentas ARS propias/terceros, comisión "hasta 2%", "tipo de cambio competitivo" | MEDIA (conflicto con fuente abajo) |
| https://blog.saldo.com.ar/guia-payoneer-argentina-2026/ | 2026 | Afirma que NO permite extraer directo a pesos; recomienda intermediarios | MEDIA (conflicto) |
| https://payoneer.custhelp.com/app/answers/detail/a_id/18786/ | — | Cuenta receptora GBP = Payoneer Payment Services (UK) Limited | ALTA |
| https://thebanks.eu/emis/payoneer-europe-355112 ; Wikipedia Payoneer | — | Cuenta receptora EUR = Payoneer Europe Limited (Irlanda), e-money regulada por Central Bank of Ireland | ALTA (entidad) |

**Sin verificar (Payoneer):**
- **Retiro directo a cuenta en PESOS**: conflicto entre fuente oficial Payoneer ES (sí, ~2%, TC competitivo) y guía AR (no directo). En la página se redactó con cautela ("conviene confirmarlo en tu cuenta… las fuentes no coinciden").
- Efecto del fin del cepo / cambios FX 2025-2026 sobre el TC del retiro — NO confirmado por ninguna fuente fechada 2026.
- % exacto de conversión para AR (0,50% interno vs 1,2%–4% retiro vs 3,5% citado).
- Fee de marketplaces: "varía según plataforma", sin % fijo de Payoneer.
- **Entidad jurídica exacta que titulariza el balance de un cliente argentino** (solo la UK está confirmada oficialmente).

---

## DEEL

| Fuente | Fecha que refleja | Dato tomado | Confianza |
|--------|-------------------|-------------|-----------|
| help.letsdeel.com (Withdrawal Fees & Minimums; How Contractors Can Withdraw) | 2026 (vía snippets; el Help devuelve HTTP 403) | Banco local = USD 0; SWIFT desde USD 5 (tope ~10); Wise sin fee Deel; PayPal 2,5% (mín 0,25); Payoneer 1% (mín 12, otras dicen 50); Revolut sin fee; Deel Card virtual 5 / física 10, no-USD 1,25%; Instant Card 2%; Coinbase 1,5%; USDC/USDT 2% + red | MEDIA (snippets, no página directa) |
| https://www.deel.com/blog (Contractor's Guide to Flexible Payment Terms) | 2026 | Plan de contractor gratis para el contractor; el cliente paga el abono | ALTA |
| Yahoo Finance / CCN / The Defiant / Crowdfund Insider | 3-jun-2026 | Lanzamiento DLUSD (stablecoin), Argentina mercado early-access; 85% contractors AR pidieron cobrar en USD en 2025 | ALTA (existencia/fecha) |
| eco.com/support (DLUSD/Deel Wallet stack) | 2026 | Deel Wallet (residentes US) provista por Mezu (NA) Inc. dba Alviere y/o agente de Community Federal Savings Bank (FDIC); stack DLUSD: Bridge/Tempo/Privy | MEDIA |
| wise.com/ar/blog/deel-argentina | act. 3-sep-2025 | Retiro a ARS al tipo de cambio oficial | ALTA |
| Fuentes contables AR (Contablix) + BCRA Com. "A" 8330 (sep-2025) | 2025/2026 | Exportación con Factura E; eliminación del tope USD 36.000 para no liquidar divisas; bancos no cobran comisión por recibir transferencias del exterior | MEDIA |

**Sin verificar (Deel):**
- Fee exacto de DolarApp (≈0,75%) — solo snippet, Help bloquea fetch. **No incluido como número en la página.**
- Payoneer mín. (12 vs 50 USD) — discrepancia. (No usado como número en la página.)
- Estructura Coinbase (1,5% vs 5 USD/1,6%). (No usado como número en la página.)
- Margen de conversión exacto (rango 1%–3%, sin número oficial único).
- Cifras de planes (≈USD 49/contractor/mes, EOR ≈599) de blogs de pricing de terceros, no de deel.com directo.
- **Entidad/jurisdicción del Deel Wallet y DLUSD para un residente fiscal argentino** — solo confirmada para residentes US (Alviere/CFSB). Implicancia CRS para un argentino NO confirmada → en la página se redactó sin afirmar.

---

## Marco CRS (general)

- Argentina participa en CRS (intercambio automático) — ALTA.
- EE.UU. NO participa en CRS; usa FATCA, no recíproco — ALTA.
- Irlanda, Bélgica, UE y Reino Unido participan en CRS y reportarían cuentas de no-residentes — ALTA (marco general).
- **Aplicación concreta a cada plataforma**: MEDIA/BAJA, porque ninguna publica claramente qué entidad titulariza el saldo de un residente argentino. La página lo redacta cualificando por entidad/jurisdicción y SIN sobre-afirmar, recordando que igual hay que declarar ante ARCA.

---

## Resumen de hechos a doble-chequear antes/después de publicar

1. Cotización que aplica Wise al convertir a ARS (oficial según independientes; no confirmado en sitio oficial).
2. Payoneer: ¿se puede retirar directo a PESOS y a qué TC? (fuentes en conflicto).
3. Efecto del fin del cepo / FX 2025-2026 sobre retiros a ARS (Payoneer y Deel) — sin fuente 2026.
4. % exactos de conversión de cada plataforma (todos son rangos).
5. Entidad/jurisdicción que titulariza el saldo de un residente argentino en cada una (clave para CRS) — sin confirmación oficial en ninguna.
6. Deel: fees por método de retiro (Help bloquea fetch; verificar en cuenta real).
