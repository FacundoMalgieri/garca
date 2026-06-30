# Fuentes — CRS 2.0 / ARCA (guía `crs-arca`)

Investigación cerrada a **junio 2026**. Tema fiscal sensible: las afirmaciones por plataforma
están deliberadamente hedgeadas en la página. El **principio** (qué régimen aplica según el
domicilio de la entidad legal que contrata tu cuenta) está sólido y triple-verificado; el
**mapeo plataforma → país de domicilio** NO lo está (las fuentes se contradicen) y se presenta
como "según la entidad", no como dato firme.

## Hechos centrales (confianza ALTA)

- **CRS** = Common Reporting Standard de la OCDE; estándar **multilateral** de intercambio
  automático de información financiera (AEOI), >100/120 jurisdicciones. Confianza: ALTA.
- **CRS 2.0** = enmiendas a la CRS (CRS amendments, 2023) + **Addendum al MCAA** (Multilateral
  Competent Authority Agreement). Amplía la definición de "cuenta financiera" a dinero
  electrónico (e-money), CBDCs y activos cripto en custodia/derivados. Confianza: ALTA.
  - OECD: https://www.oecd.org/en/topics/sub-issues/international-standards-on-tax-transparency/tax-transparency-resource-centre.html
  - PwC ME (UAE firmó el Addendum el 11/08/2025): https://www.pwc.com/m1/en/services/tax/middle-east-tax-news-alerts/2025/uae-ministry-finance-crs-amendments.html
- **CARF** = Crypto-Asset Reporting Framework de la OCDE; marco **separado** específico para
  cripto. 48 jurisdicciones comprometidas al período 2026, primer reporte 30/06/2027; otras
  arrancan 2028/2029. Confianza: ALTA.
  - OECD CARF commitments: https://www.oecd.org/content/dam/oecd/en/networks/global-forum-tax-transparency/commitments-carf.pdf
  - OECD CARF 2025 update: https://www.oecd.org/content/dam/oecd/en/networks/global-forum-tax-transparency/crypto-asset-reporting-framework-monitoring-implementation-update-2025.pdf
- **Timeline CRS 2.0 (general OCDE):** legislación doméstica al cierre de 2025; **recolección
  de datos desde 1/1/2026**; **primer intercambio en 2027** (usando el nuevo CRS XML Schema 3.0).
  Confianza: ALTA.
  - Taina: https://www.taina.tech/resources-news-and-awards/crs-2-0-carf-global-rollout-update-and-what-it-means-for-multinational-financial-institutions
  - OECD Peer Review 2025 Update: https://www.oecd.org/en/publications/peer-review-of-the-automatic-exchange-of-financial-account-information-2025-update_bbf150e4-en.html

## El punto crítico FATCA vs CRS (confianza ALTA — triple verificado)

- **EE.UU. NO participa de CRS.** Usa **FATCA**, sistema bilateral vía IGAs y en gran medida
  **NO recíproco**: EE.UU. recibe info global pero generalmente NO devuelve datos equivalentes.
  Confianza: ALTA.
  - Wikipedia FATCA: https://en.wikipedia.org/wiki/Foreign_Account_Tax_Compliance_Act
  - BearGuard (US CRS non-participation): https://regulatorik.ai/en/framework/us-warn
  - TaxesForExpats: https://www.taxesforexpats.com/articles/fbar-fatca/fatca-crs-reporting-requirements.html
- **IGA Argentina–EE.UU.:** firmado **5 de diciembre de 2022** (Modelo 1), vigencia desde
  1/1/2023; **primer intercambio efectivo a la (entonces) AFIP/ARCA en septiembre de 2024**
  con datos del período fiscal 2023; luego cada septiembre. Confianza: ALTA.
  - Canosa Abogados: https://canosa.com/argentina-united-states-surprisingly-move-forward-agreement-implementing-fatca-possibly-iga-1/
  - Infobae (abril 2024): https://www.infobae.com/economia/2024/04/10/evasion-la-afip-acordo-con-los-bancos-la-implementacion-del-intercambio-automatico-de-datos-con-eeuu-a-fin-de-septiembre/
  - PwC Tax Summaries Argentina: https://taxsummaries.pwc.com/argentina/corporate/other-issues
- **Qué manda FATCA hacia Argentina (asimétrico):** principalmente importes brutos de rentas
  de fuente estadounidense (intereses sobre depósitos, dividendos de origen EE.UU.) y datos
  identificatorios; **se EXCLUYEN** saldos finales de cuenta, movimientos y detalle de
  transacciones. Hay un umbral (rentas > USD 10). Confianza: ALTA.
  - Wallbit: https://www.wallbit.io/en/blog/fatca-and-crs-2-0
  - Bloomberg Línea (memorándum FATCA): https://www.bloomberglinea.com/2022/12/14/fatca-que-dice-el-memorandum-de-argentina-sobre-el-intercambio-de-informacion-financiera-con-eeuu/
- **Qué manda CRS 2.0 (más amplio):** saldo a fin de año, rentas reportables y movimientos
  relevantes, sin de minimis para cuentas nuevas de individuos. Confianza: ALTA.
  - Wallbit (íd.).

## Argentina y CRS 2.0 (confianza MEDIA-ALTA)

- **Argentina firmó/adhirió al Addendum CRS 2.0 ~julio 2025** (una fuente da "1 de julio de
  2025"). Recolección desde 1/1/2026, primer intercambio 2027. Confianza: MEDIA-ALTA en el mes
  exacto; ALTA en "mediados de 2025 + recolección 2026 + intercambio 2027".
  - Firmaway: https://firmaway.us/crs-2-0-argentina/
  - Contablix: https://contablix.ar/blog/crs-2-0-y-fatca-que-sabra-arca-de-tus-criptos-billeteras-y-cuentas-en-el-exterior
  - Errepar (ARCA recibirá datos desde 2026): https://documento.errepar.com/actualidad/intercambio-fiscal-arca-recibira-datos-de-cuentas-en-el-exterior-desde-2026-20260220174528031
- **Régimen de información local de cobros del exterior / billeteras (febrero 2026):** algunas
  notas mencionan que ARCA empieza a recibir/cruzar datos de billeteras internacionales en
  feb-2026. OJO: hay confusión periodística entre (a) el intercambio internacional CRS/FATCA y
  (b) regímenes de información LOCALES (PSP/billeteras que operan en Argentina). En la página
  esto se trata con cautela y se separa de CRS. Confianza: MEDIA.
  - El Cronista: https://www.cronista.com/economia-politica/arca-controlara-estas-billeteras-virtuales-internacionales-en-febrero-de-2026/
  - Derecho en Zapatillas: https://www.derechoenzapatillas.com/2026/arca-y-billeteras-en-2026-umbrales-en-argentina-y-regimen-de-informacion-de-cobros-del-exterior/

## CLAIMS QUE NO PUDE VERIFICAR DEL TODO (revisar antes de publicar)

1. **Mes exacto de adhesión argentina al Addendum CRS 2.0.** Una fuente (Firmaway) dice
   "1 de julio de 2025". No lo confirmé contra la lista oficial OCDE de signatarios del
   Addendum al MCAA (esa lista existe, "last updated 4 Nov 2025", pero no la abrí entrada por
   entrada). **La página dice "hacia mediados de 2025"**, no una fecha cerrada. → Verificar en
   la lista OCDE de signatarios del Addendum si querés afirmar el día exacto.

2. **País de domicilio de cada plataforma.** Las fuentes se CONTRADICEN:
   - Payoneer: Contablix/Wallbit → "Irlanda"; Firmaway → "Gibraltar/Belice"; Cronista →
     "base EE.UU. con subsidiaria europea".
   - Wise: una fuente "UK", otra implica Irlanda/europea.
   - PayPal: estructura híbrida (entidad EE.UU. + entidades europeas) — depende del producto.
   - Deel: mencionada como EE.UU. en una sola fuente.
   **La página NO afirma un país por plataforma como dato firme.** Explica el PRINCIPIO (manda
   el domicilio de la entidad legal que figura en tus términos y condiciones) y dice
   explícitamente que el usuario debe chequear en qué entidad tiene la cuenta. → Si querés
   poner una tabla plataforma→país, verificá contra los Términos y Condiciones vigentes de cada
   plataforma para usuarios argentinos (la entidad contratante figura ahí), porque cambian.

3. **"Feb 2026 ARCA controla billeteras internacionales".** Probable mezcla entre régimen de
   información LOCAL (RG ARCA sobre PSP) y el intercambio internacional CRS. No verifiqué el
   número de RG ni los umbrales exactos en ARS. → Verificar la RG y umbrales si se quiere ser
   específico; la página lo deja como "regímenes locales, distintos de CRS".

4. **Umbrales en USD para reportar (USD 500 e-money / USD 1.000 cripto).** Aparecen en Firmaway
   pero no los crucé con texto OCDE. La página NO los afirma como números cerrados. → Verificar
   contra el texto del Addendum/CRS amendments si se quieren citar montos.

## Enlaces internos usados en la página (algunos aún NO existen — confirmar antes de publicar)

- `/monotributo/arca-vs-afip` — EXISTE.
- `/monotributo/factura-e` — EXISTE.
- `/monotributo/cobrar-del-exterior` — **NO existe todavía** (link forward-looking pedido).
- `/monotributo/declarar-ingresos-exterior` — **NO existe todavía** (link forward-looking pedido).
- `/monotributo/wise-vs-payoneer-vs-deel` — **NO existe todavía** (link forward-looking pedido).
