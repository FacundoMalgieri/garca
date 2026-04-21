/**
 * Page-level JSON-LD schemas and FAQ data.
 *
 * Why this file exists:
 * In Next.js 16 + React 19, `<script type="application/ld+json">` tags
 * rendered inside a page or child-layout component get serialized into
 * the RSC streaming payload instead of the initial HTML response.
 * That means the first byte of HTML that Googlebot / Bing / Yandex see
 * contains only the root-layout schemas — page-specific structured data
 * only materializes after hydration.
 *
 * To fix that, we:
 *  1. Centralize every page-specific schema here.
 *  2. Let the root layout's `JsonLd` component read the current pathname
 *     (via a middleware-set `x-pathname` header) and emit the matching
 *     schemas inside `<head>`. Anything rendered inside `<head>` at the
 *     root layout ends up in the initial server-rendered HTML.
 *
 * Pages that render FAQ UI import their `faqEntries` from here so there is
 * a single source of truth for every schema + visible FAQ.
 */

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import { getCategoriaByLetter } from "@/lib/projection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateModified = MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString().split("T")[0];

/**
 * Page-level Article schemas reference the canonical Person and Organization
 * entities defined in the root `JsonLd` component via `@id`, so Google merges
 * them into a single knowledge graph instead of treating each inline copy as a
 * separate entity.
 */
const PUBLISHER = { "@id": `${siteUrl}#person` } as const;
const ORGANIZATION = { "@id": `${siteUrl}#organization` } as const;

/**
 * Shared Article `image` (1200×630 social card). Google treats `image` as one
 * of the strongest signals for Article rich results.
 */
const ARTICLE_IMAGE = {
  "@type": "ImageObject",
  url: `${siteUrl}/og-image.png`,
  width: 1200,
  height: 630,
} as const;

function buildMainEntityOfPage(pageUrl: string): Schema {
  return {
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    primaryImageOfPage: ARTICLE_IMAGE,
    isPartOf: { "@id": `${siteUrl}#website` },
  };
}

export type FaqEntry = { question: string; answer: string };

type Schema = Record<string, unknown>;

function buildFaqSchema(entries: readonly FaqEntry[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

// ----- Homepage -----

export const homeFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Para qué sirve GARCA?",
    answer:
      "GARCA te permite consultar y exportar los comprobantes que tenés en 'Comprobantes en línea' de ARCA de forma rápida y sencilla. También calcula automáticamente tu categoría de Monotributo según tus ingresos acumulados, ayudándote a saber si tenés que recategorizarte.",
  },
  {
    question: "¿Es seguro ingresar mis credenciales de AFIP?",
    answer:
      "Sí. Tus credenciales nunca se guardan en ningún servidor. La conexión con AFIP se hace directamente desde tu navegador de forma encriptada, y los datos solo se almacenan temporalmente en tu dispositivo (localStorage). Podés verificar el código fuente en GitHub.",
  },
  {
    question: "¿Guardan mis datos o contraseñas?",
    answer:
      "No. GARCA no tiene base de datos ni servidor que almacene información. Todo se procesa en tu navegador y se guarda localmente en tu dispositivo. Cuando cerrás la sesión, podés borrar todos los datos.",
  },
  {
    question: "¿Por qué tarda en cargar mis comprobantes?",
    answer:
      "ARCA no tiene una API pública, así que GARCA usa web scraping para navegar por el portal y extraer tus datos, similar a como lo harías manualmente. Dependiendo de la cantidad de comprobantes y la velocidad de ARCA, puede tomar entre 30 segundos y 2 minutos.",
  },
  {
    question: "¿Funciona con cualquier tipo de contribuyente?",
    answer:
      "Actualmente GARCA está optimizado para Monotributistas. Lee únicamente los comprobantes disponibles en 'Comprobantes en línea' de ARCA. Si tenés otro tipo de situación fiscal, puede que algunas funciones no estén disponibles.",
  },
  {
    question: "¿Cómo puedo planificar mi facturación para no cambiar de categoría?",
    answer:
      "GARCA incluye una herramienta de Proyección Inteligente que te permite calcular cuánto podés facturar cada mes para mantenerte en tu categoría objetivo. Podés simular diferentes escenarios, configurar un margen de seguridad y ver en tiempo real cómo impactan en tu próxima recategorización.",
  },
  {
    question: "¿Puedo exportar los datos para mi contador?",
    answer:
      "Podés exportar tus comprobantes a Excel (CSV), JSON o PDF. El PDF incluye gráficos y un resumen de tu situación en Monotributo, ideal para compartir con tu contador.",
  },
  {
    question: "¿Es gratis?",
    answer:
      "Sí, GARCA es 100% gratis y open source. Si te resulta útil y querés apoyar el desarrollo, podés hacer una donación voluntaria o dejar una estrella en GitHub.",
  },
  {
    question: "¿Qué pasa si AFIP cambia su página?",
    answer:
      "Como GARCA depende de la estructura del portal de AFIP, cambios en su sitio pueden afectar el funcionamiento. El proyecto se mantiene activamente, así que ante cualquier problema, revisá si hay actualizaciones o reportá el issue en GitHub.",
  },
  {
    question: "¿Necesito instalar algo?",
    answer:
      "No, GARCA es 100% web. Funciona directamente desde el navegador sin necesidad de instalar ningún programa, extensión o aplicación. Solo necesitás una conexión a internet.",
  },
  {
    question: "¿Funciona en celular?",
    answer:
      "Sí, GARCA está optimizado para funcionar en dispositivos móviles. Podés consultar y exportar tus comprobantes desde tu celular o tablet sin problemas.",
  },
  {
    question: "¿Puedo usar GARCA para varias empresas?",
    answer:
      "Sí, podés ingresar con diferentes CUITs. Sin embargo, los datos se guardan por sesión, así que si querés cambiar de empresa tenés que volver a ingresar con las credenciales correspondientes.",
  },
  {
    question: "¿Qué hago si me da error?",
    answer:
      "Primero verificá que tus credenciales de AFIP sean correctas. Si el error persiste, puede ser que AFIP esté experimentando problemas (suele pasar). Esperá unos minutos e intentá de nuevo. Si sigue fallando, podés reportar el problema en GitHub.",
  },
];

const homeBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl }],
};

// ----- /calculadora-monotributo -----

const calculadoraWebAppSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculadora de Monotributo 2026",
  description:
    "Calculadora gratuita para determinar tu categoría de Monotributo según tus ingresos brutos anuales. Incluye tabla de categorías actualizada de ARCA.",
  url: `${siteUrl}/calculadora-monotributo`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser",
  offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
  isAccessibleForFree: true,
  inLanguage: "es",
  author: PUBLISHER,
  publisher: ORGANIZATION,
};

const calculadoraFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Cómo funciona la calculadora de Monotributo?",
    answer:
      "Esta calculadora gratuita te permite proyectar en qué categoría de Monotributo vas a quedar en tu próxima recategorización. Ingresás tu facturación mes a mes para los últimos 12 meses y los meses futuros, y la herramienta calcula automáticamente tu categoría resultante. Podés usar el botón \"Aplicar recomendación\" para que la calculadora llene los meses futuros con el monto máximo que podés facturar sin cambiar de categoría.",
  },
  {
    question: "¿Cuándo me tengo que recategorizar?",
    answer:
      "La recategorización del Monotributo se realiza dos veces al año: en enero y en julio. Debés evaluar tus ingresos brutos acumulados de los últimos 12 meses y verificar si corresponde cambiar de categoría. Si tus ingresos superan el límite de tu categoría actual, debés subir. Si bajaron, podés bajar y pagar menos.",
  },
  {
    question: "¿Qué incluye el pago mensual del Monotributo?",
    answer:
      "El pago mensual tiene tres componentes: Impuesto integrado (reemplaza IVA y Ganancias, varía según categoría y actividad), Aportes jubilatorios (SIPA) al sistema previsional, y Obra social (cobertura de salud obligatoria).",
  },
  {
    question: "¿Qué pasa si me paso de categoría?",
    answer:
      "Si al momento de la recategorización tus ingresos superan el tope de tu categoría, ARCA te va a recategorizar de oficio a la categoría que corresponda. Esto implica un aumento en tu cuota mensual. Por eso es importante monitorear tus ingresos y planificar tu facturación. Si superás la categoría K, debés inscribirte como Responsable Inscripto.",
  },
  {
    question: "¿Cómo me ayuda GARCA con esto?",
    answer:
      "GARCA se conecta directamente con ARCA (ex AFIP), descarga tus comprobantes reales y te muestra tu situación actual con datos precisos. Podés ver tu categoría actual, cuánto te falta para el tope, y proyectar tu facturación futura. Es gratis y no almacena tus datos en ningún servidor.",
  },
];

const calculadoraBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "GARCA", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Calculadora Monotributo", item: `${siteUrl}/calculadora-monotributo` },
  ],
};

// ----- /monotributo (hub) -----

export const monotributoHubFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Cuántas categorías de Monotributo hay en 2026?",
    answer:
      "En 2026 el Monotributo tiene 11 categorías, de la A a la K. Cada una tiene un tope de facturación anual y una cuota mensual distinta. La categoría más baja es la A y la más alta es la K.",
  },
  {
    question: "¿Cómo sé en qué categoría de Monotributo estoy?",
    answer:
      "Tu categoría depende de tus ingresos brutos acumulados de los últimos 12 meses. Tenés que comparar ese total con el tope anual de cada categoría y ubicarte en la que te corresponde. En GARCA podés hacerlo automáticamente conectándote a ARCA, o usar la calculadora gratuita.",
  },
  {
    question: "¿Cuándo se actualizan las categorías?",
    answer:
      "Los topes y cuotas del Monotributo se actualizan dos veces al año, en enero y julio, siguiendo la evolución del índice de inflación. La recategorización del contribuyente también es semestral.",
  },
  {
    question: "¿Qué diferencia hay entre servicios y venta de bienes?",
    answer:
      "Desde la categoría C en adelante, el impuesto integrado es distinto según si prestás servicios o vendés bienes. Quienes venden bienes pagan menos impuesto integrado. Los topes de facturación en cambio son iguales para ambos rubros.",
  },
];

const monotributoHubBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
  ],
};

const monotributoHubArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Monotributo 2026 — Categorías, Cuotas y Topes de Facturación",
  description:
    "Guía completa del Monotributo 2026 en Argentina: las 11 categorías de la A a la K, con cuotas mensuales, topes de facturación y desglose de aportes. Datos oficiales de ARCA.",
  image: ARTICLE_IMAGE,
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo`),
  inLanguage: "es-AR",
};

// ----- /monotributo/recategorizacion -----

export const recategorizacionFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Cuándo se hace la recategorización del Monotributo?",
    answer:
      "La recategorización se realiza dos veces al año: la primera entre enero y principios de febrero, y la segunda entre julio y principios de agosto. ARCA publica la fecha exacta de cierre cada semestre (en 2026, por ejemplo, el plazo cerró el 5 de febrero y cierra el 5 de agosto). En esas dos ventanas tenés que revisar tus ingresos de los últimos 12 meses y confirmar o cambiar tu categoría.",
  },
  {
    question: "¿Qué datos evalúa ARCA en la recategorización?",
    answer:
      "ARCA mira cuatro parámetros: ingresos brutos de los últimos 12 meses, energía eléctrica consumida, superficie afectada a la actividad y alquileres devengados. El que te ubique en la categoría más alta es el que aplica. En la práctica, para la mayoría de monotributistas lo determinante son los ingresos brutos.",
  },
  {
    question: "¿Qué pasa si no me recategorizo en el plazo?",
    answer:
      "Si superaste el tope de tu categoría y no te recategorizaste en la ventana de enero o julio, ARCA te recategoriza de oficio cuando cruza datos (facturación electrónica, bancos, plataformas de pago). Implica pagar la diferencia de cuota retroactiva más una multa del 50% del impuesto integrado y la cotización previsional omitidos.",
  },
  {
    question: "¿Tengo que recategorizarme si no cambié de categoría?",
    answer:
      "Técnicamente la recategorización es obligatoria solamente cuando cambiás de categoría. Si seguís en la misma, no es necesario hacer ningún trámite. De todas formas, muchos monotributistas hacen el trámite igualmente para confirmar su situación y dejar constancia.",
  },
  {
    question: "¿Puedo bajar de categoría en la recategorización?",
    answer:
      "Sí. Si tus ingresos de los últimos 12 meses bajaron y ya no alcanzan el tope de tu categoría actual, podés recategorizarte a una categoría inferior y pagar menos cuota. Es especialmente útil después de meses con poca facturación.",
  },
  {
    question: "¿Cómo se hace la recategorización en ARCA?",
    answer:
      "Ingresá al portal de ARCA con tu CUIT y clave fiscal, entrá al servicio 'Monotributo', seleccioná 'Recategorización' y completá el formulario con tus ingresos acumulados de los últimos 12 meses y los demás parámetros. El sistema te sugiere la categoría que corresponde y te permite confirmarla.",
  },
];

const recategorizacionBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
    { "@type": "ListItem", position: 3, name: "Recategorización", item: `${siteUrl}/monotributo/recategorizacion` },
  ],
};

const recategorizacionArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Recategorización del Monotributo 2026 — Guía paso a paso",
  description:
    "Cuándo y cómo recategorizarte en el Monotributo en 2026: fechas, datos que evalúa ARCA, recategorización de oficio y consecuencias de no hacerla.",
  image: ARTICLE_IMAGE,
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/recategorizacion`),
  inLanguage: "es-AR",
};

// ----- /monotributo/servicios-vs-bienes -----

export const serviciosVsBienesFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Qué diferencia hay entre servicios y venta de bienes en el Monotributo?",
    answer:
      "La diferencia está en el impuesto integrado, no en el tope de facturación ni en los aportes. Desde la categoría C en adelante, quienes venden bienes pagan un impuesto integrado menor que quienes prestan servicios, aunque los topes de facturación anual son iguales para ambos rubros.",
  },
  {
    question: "¿Los topes de facturación son distintos entre servicios y bienes?",
    answer:
      "No. Los topes anuales de facturación son exactamente los mismos para servicios y venta de bienes en las 11 categorías. Lo único que cambia es el impuesto integrado, que hace que la cuota total mensual sea distinta.",
  },
  {
    question: "¿Cómo se declara si presto servicios y también vendo bienes?",
    answer:
      "Si desarrollás las dos actividades, tenés que declarar la actividad principal (la que te genera mayores ingresos) al momento de la inscripción. Si el grueso de tu facturación es de servicios, te inscribís como servicios; si es venta de bienes, al revés. La cuota que pagás se define por la actividad principal.",
  },
  {
    question: "¿Puedo cambiar de servicios a venta de bienes más adelante?",
    answer:
      "Sí. Podés modificar la actividad principal en el portal de ARCA, dentro del servicio Monotributo. Tené en cuenta que el cambio afecta tu cuota mensual desde el mes siguiente, porque el impuesto integrado puede ser distinto.",
  },
  {
    question: "¿Por qué los bienes pagan menos impuesto integrado?",
    answer:
      "Porque en la venta de bienes ya existe un margen comercial que tributa IVA en la cadena productiva, mientras que en la prestación de servicios el valor agregado se genera íntegramente en el monotributista. Por eso, desde la categoría C en adelante, el impuesto integrado es menor para bienes.",
  },
];

const serviciosVsBienesBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
    {
      "@type": "ListItem",
      position: 3,
      name: "Servicios vs Venta de Bienes",
      item: `${siteUrl}/monotributo/servicios-vs-bienes`,
    },
  ],
};

const serviciosVsBienesArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Monotributo: Servicios vs Venta de Bienes 2026 — Diferencias de cuota",
  description:
    "Comparativa oficial de cuotas entre prestación de servicios y venta de bienes en el Monotributo 2026, categoría por categoría.",
  image: ARTICLE_IMAGE,
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/servicios-vs-bienes`),
  inLanguage: "es-AR",
};

// ----- /monotributo/que-pasa-si-me-paso -----

export const quePasaSiMePasoFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Cómo saben en ARCA que me pasé del tope?",
    answer:
      "ARCA cruza tu facturación electrónica (todos los comprobantes que emitís tienen que ser electrónicos y quedan registrados), con datos de terceros (bancos, tarjetas, plataformas de pago) y con los parámetros que declarás en la recategorización. Es muy difícil pasar desapercibido.",
  },
  {
    question: "¿Qué pasa si me pasé solo por un mes?",
    answer:
      "El Monotributo no mira mes a mes, mira el acumulado de los últimos 12 meses. Si tuviste un pico en un mes pero el acumulado anual sigue dentro del tope de tu categoría, no pasa nada. Solo te preocupés si el total anualizado supera el tope.",
  },
  {
    question: "¿Qué diferencia hay entre recategorización y exclusión?",
    answer:
      "La recategorización es subir a una categoría superior del Monotributo (por ejemplo, de F a G). La exclusión es salir del régimen: tus ingresos superaron la categoría más alta (K) o incumpliste requisitos no numéricos, y tenés que inscribirte como Responsable Inscripto en IVA y Ganancias.",
  },
  {
    question: "¿Puedo seguir en el Monotributo si me pasé de K?",
    answer:
      "No. La categoría K es la más alta del régimen. Si tu acumulado de los últimos 12 meses supera su tope (y también por otras causales del art. 20 de la Ley 26.565), quedás automáticamente excluido y tenés que inscribirte como Responsable Inscripto. La exclusión tiene efectos desde las 0 hs del día en que ocurrió la causal, no desde el mes siguiente. Además, no podés volver al Monotributo hasta que pasen 3 años calendario desde la exclusión.",
  },
  {
    question: "¿Me pueden multar por no haber recategorizado?",
    answer:
      "Sí. Si ARCA detecta que debías recategorizarte y no lo hiciste, te aplica una recategorización de oficio e incluye la diferencia de cuota retroactiva más una multa del 50% del impuesto integrado y la cotización previsional omitidos. Tenés 15 días desde la notificación para manifestar disconformidad a través de 'Presentaciones Digitales'.",
  },
];

const quePasaSiMePasoBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
    {
      "@type": "ListItem",
      position: 3,
      name: "¿Qué pasa si me paso?",
      item: `${siteUrl}/monotributo/que-pasa-si-me-paso`,
    },
  ],
};

const quePasaSiMePasoArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "¿Qué pasa si me paso del Monotributo? — Guía 2026",
  description:
    "Qué sucede cuando superás el tope del Monotributo: recategorización, recategorización de oficio, exclusión del régimen y pase a Responsable Inscripto.",
  image: ARTICLE_IMAGE,
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/que-pasa-si-me-paso`),
  inLanguage: "es-AR",
};

// ----- /monotributo/vs-responsable-inscripto -----

export const vsResponsableInscriptoFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Qué conviene: Monotributo o Responsable Inscripto?",
    answer:
      "Depende del tipo de clientes, de si podés computar crédito fiscal (compras con IVA) y del volumen. Si facturás poco y tus clientes son consumidores finales, el Monotributo suele ser más conveniente por la simplicidad y la cuota fija. Si facturás mucho, tenés muchos costos con IVA (importaciones, insumos) y le vendés a empresas grandes, el Responsable Inscripto puede ser más eficiente.",
  },
  {
    question: "¿Cuándo es obligatorio pasar a Responsable Inscripto?",
    answer:
      "Cuando tus ingresos de los últimos 12 meses superan el tope de la categoría K del Monotributo, quedás excluido del régimen simplificado y el pase a Responsable Inscripto es obligatorio. También cuando se da alguna causal del art. 20 de la Ley 26.565: más de 3 actividades simultáneas o más de 3 unidades de explotación, importaciones de bienes para reventa, compras y gastos superiores al 80% de tus ingresos (o 40% en servicios), o quedar inscripto en REPSAL, entre otras.",
  },
  {
    question: "¿Puedo volver al Monotributo después de ser Responsable Inscripto?",
    answer:
      "Depende. Si pasaste voluntariamente a Responsable Inscripto (por ejemplo, renunciaste al Monotributo sin haber sido excluido), podés reinscribirte cuando quieras siempre que cumplas las condiciones de inclusión. Pero si fuiste excluido por ARCA (por ejemplo, por superar el tope de K), tenés que esperar 3 años calendario completos desde la exclusión para poder reingresar al régimen simplificado.",
  },
  {
    question: "¿Tengo que contratar un contador si paso a Responsable Inscripto?",
    answer:
      "No es obligatorio por ley, pero en la práctica sí se recomienda. El Responsable Inscripto presenta DDJJ mensuales de IVA, DDJJ anual de Ganancias, lleva libros IVA y muchas veces convive con Ingresos Brutos multijurisdiccional. Un contador te ahorra errores y posibles multas.",
  },
  {
    question: "¿Qué pasa con las facturas ya emitidas si cambio de régimen?",
    answer:
      "Las facturas emitidas antes del cambio siguen siendo válidas con el régimen que tenías al momento de emitirlas. Desde la fecha del cambio, tus comprobantes nuevos tienen que respetar el nuevo régimen (factura A si sos Responsable Inscripto, factura C si sos Monotributista).",
  },
];

const vsResponsableInscriptoBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
    {
      "@type": "ListItem",
      position: 3,
      name: "vs Responsable Inscripto",
      item: `${siteUrl}/monotributo/vs-responsable-inscripto`,
    },
  ],
};

const vsResponsableInscriptoArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Monotributo vs Responsable Inscripto 2026 — Diferencias y cuándo conviene cada uno",
  description:
    "Comparativa entre Monotributo y Responsable Inscripto en Argentina: IVA, Ganancias, facturación, retenciones y recomendaciones.",
  image: ARTICLE_IMAGE,
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/vs-responsable-inscripto`),
  inLanguage: "es-AR",
};

// ----- /about -----

const aboutBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Sobre el autor", item: `${siteUrl}/about` },
  ],
};

const aboutPageSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${siteUrl}/about`,
  url: `${siteUrl}/about`,
  name: "Sobre el autor — Quién está detrás de GARCA",
  description:
    "GARCA lo mantiene Facundo Malgieri, software engineer argentino con más de 10 años de experiencia. Proyecto independiente, open source, no afiliado a ARCA.",
  inLanguage: "es-AR",
  isPartOf: { "@id": `${siteUrl}#website` },
  primaryImageOfPage: ARTICLE_IMAGE,
  mainEntity: { "@id": `${siteUrl}#person` },
  about: { "@id": `${siteUrl}#person` },
  dateModified,
};

// ----- /ingresar · /privacidad · /terminos -----

const ingresarBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Ingresar", item: `${siteUrl}/ingresar` },
  ],
};

const privacidadBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Política de Privacidad", item: `${siteUrl}/privacidad` },
  ],
};

const terminosBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Términos y Condiciones", item: `${siteUrl}/terminos` },
  ],
};

// ----- Dynamic: /monotributo/categoria/[letra] -----

export function buildCategoriaFaqEntries(letra: string): FaqEntry[] {
  const upper = letra.toUpperCase();
  const categoria = getCategoriaByLetter(upper, MONOTRIBUTO_DATA.categorias);
  if (!categoria) return [];

  const categorias = MONOTRIBUTO_DATA.categorias;
  const index = categorias.findIndex((c) => c.categoria === upper);
  const anterior = index > 0 ? categorias[index - 1] : null;
  const siguiente = index < categorias.length - 1 ? categorias[index + 1] : null;
  const topeMensual = categoria.ingresosBrutos / 12;
  const topeAnteriorStr = anterior ? currencyFormatter.format(anterior.ingresosBrutos) : "-";

  return [
    {
      question: `¿Cuánto se paga por la categoría ${upper} del Monotributo en 2026?`,
      answer: `La cuota mensual de la categoría ${upper} es de ${currencyFormatter.format(
        categoria.total.servicios,
      )} para servicios y ${currencyFormatter.format(
        categoria.total.venta,
      )} para venta de bienes. Incluye impuesto integrado, aportes jubilatorios (SIPA) y obra social.`,
    },
    {
      question: `¿Cuánto puedo facturar en la categoría ${upper}?`,
      answer: `El tope anual de facturación de la categoría ${upper} es de ${currencyFormatter.format(
        categoria.ingresosBrutos,
      )}. Esto da un promedio de ${currencyFormatter.format(
        topeMensual,
      )} por mes. Si superás ese monto en los últimos 12 meses, tenés que subir de categoría.`,
    },
    anterior
      ? {
          question: `¿Cuál es la diferencia entre la categoría ${upper} y la ${anterior.categoria}?`,
          answer: `La categoría ${upper} permite facturar hasta ${currencyFormatter.format(
            categoria.ingresosBrutos,
          )} al año, mientras que la ${anterior.categoria} tope en ${topeAnteriorStr}. La cuota mensual pasa de ${currencyFormatter.format(
            anterior.total.servicios,
          )} (${anterior.categoria}) a ${currencyFormatter.format(
            categoria.total.servicios,
          )} (${upper}) para servicios.`,
        }
      : {
          question: `¿Qué pasa si gano menos del tope de la categoría ${upper}?`,
          answer: `La categoría ${upper} es la más baja del Monotributo. Si tus ingresos son menores al tope anual, seguís pagando la cuota de la ${upper} igual — no hay una categoría inferior. Si tu actividad no supera este monto, esta es tu categoría correspondiente.`,
        },
    siguiente
      ? {
          question: `¿Qué pasa si supero el tope de la categoría ${upper}?`,
          answer: `Si superás los ${currencyFormatter.format(
            categoria.ingresosBrutos,
          )} anuales, tenés que recategorizarte a la categoría ${siguiente.categoria}, cuya cuota mensual es de ${currencyFormatter.format(
            siguiente.total.servicios,
          )} para servicios. La recategorización se hace en enero o julio. Si no la hacés, ARCA te recategoriza de oficio.`,
        }
      : {
          question: `¿Qué pasa si supero el tope de la categoría ${upper}?`,
          answer: `La categoría ${upper} es la más alta del Monotributo. Si superás su tope anual de ${currencyFormatter.format(
            categoria.ingresosBrutos,
          )}, salís del régimen simplificado y tenés que inscribirte como Responsable Inscripto en IVA y Ganancias.`,
        },
  ];
}

function buildCategoriaSchemas(letra: string): Schema[] {
  const upper = letra.toUpperCase();
  const categoria = getCategoriaByLetter(upper, MONOTRIBUTO_DATA.categorias);
  if (!categoria) return [];

  const pageUrl = `${siteUrl}/monotributo/categoria/${letra.toLowerCase()}`;
  const breadcrumb: Schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
      { "@type": "ListItem", position: 3, name: `Categoría ${upper}`, item: pageUrl },
    ],
  };
  const article: Schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Monotributo Categoría ${upper} 2026 — Cuánto Pago y Cuánto Puedo Facturar`,
    description: `Categoría ${upper} del Monotributo 2026: cuota mensual de ${currencyFormatter.format(
      categoria.total.servicios,
    )}, tope anual de facturación de ${currencyFormatter.format(
      categoria.ingresosBrutos,
    )}. Desglose de aportes, requisitos y comparativa con otras categorías.`,
    image: ARTICLE_IMAGE,
    author: PUBLISHER,
    publisher: ORGANIZATION,
    datePublished: "2026-01-20",
    dateModified,
    mainEntityOfPage: buildMainEntityOfPage(pageUrl),
    inLanguage: "es-AR",
  };
  return [breadcrumb, article, buildFaqSchema(buildCategoriaFaqEntries(letra))];
}

// ----- Dynamic: /monotributo/cuanto-puedo-facturar-por-mes/[letra] -----

export function buildCuantoFacturarFaqEntries(letra: string): FaqEntry[] {
  const upper = letra.toUpperCase();
  const categoria = getCategoriaByLetter(upper, MONOTRIBUTO_DATA.categorias);
  if (!categoria) return [];

  const categorias = MONOTRIBUTO_DATA.categorias;
  const index = categorias.findIndex((c) => c.categoria === upper);
  const anterior = index > 0 ? categorias[index - 1] : null;
  const siguiente = index < categorias.length - 1 ? categorias[index + 1] : null;
  const topeAnual = categoria.ingresosBrutos;
  const topeMensual = topeAnual / 12;
  const topeSemanal = topeAnual / 52;
  const topeDiario = topeAnual / 365;

  return [
    {
      question: `¿Cuánto puedo facturar por mes en la categoría ${upper}?`,
      answer: `En promedio podés facturar hasta ${currencyFormatter.format(
        topeMensual,
      )} por mes. El cálculo sale de dividir el tope anual de la categoría ${upper} (${currencyFormatter.format(
        topeAnual,
      )}) por 12 meses. No es un límite estricto mensual: podés facturar más en un mes y menos en otro, siempre que el acumulado de los últimos 12 meses no supere el tope anual.`,
    },
    {
      question: `¿Qué pasa si un mes facturo más del promedio mensual?`,
      answer: `No pasa nada mientras el acumulado de los últimos 12 meses siga por debajo del tope anual de ${currencyFormatter.format(
        topeAnual,
      )}. El Monotributo se evalúa sobre una ventana móvil de 12 meses, no mes a mes. Si un mes facturás más, podés compensar facturando menos otro mes.`,
    },
    {
      question: `¿Qué pasa si me paso del tope anual de ${currencyFormatter.format(topeAnual)}?`,
      answer: siguiente
        ? `Si en los últimos 12 meses superás los ${currencyFormatter.format(
            topeAnual,
          )}, te corresponde recategorizarte a la categoría ${siguiente.categoria}, cuyo tope es de ${currencyFormatter.format(
            siguiente.ingresosBrutos,
          )}. La recategorización se hace en enero o julio. Si no la hacés, ARCA te recategoriza de oficio.`
        : `La categoría ${upper} es la más alta del Monotributo. Si superás su tope anual de ${currencyFormatter.format(
            topeAnual,
          )}, salís del régimen simplificado y tenés que inscribirte como Responsable Inscripto en IVA y Ganancias.`,
    },
    {
      question: `¿Cuánto puedo facturar por día o por semana en la categoría ${upper}?`,
      answer: `Si dividís el tope anual en partes iguales, la categoría ${upper} permite facturar en promedio ${currencyFormatter.format(
        topeSemanal,
      )} por semana o ${currencyFormatter.format(
        topeDiario,
      )} por día. Importante: ARCA no controla esos cortes, solo mira el acumulado de los últimos 12 meses.`,
    },
    anterior
      ? {
          question: `¿Cuánto más puedo facturar en ${upper} que en la categoría ${anterior.categoria}?`,
          answer: `La categoría ${upper} permite facturar ${currencyFormatter.format(
            topeAnual - anterior.ingresosBrutos,
          )} más al año que la ${anterior.categoria} (${currencyFormatter.format(
            (topeAnual - anterior.ingresosBrutos) / 12,
          )} más por mes). A cambio, la cuota mensual sube de ${currencyFormatter.format(
            anterior.total.servicios,
          )} a ${currencyFormatter.format(categoria.total.servicios)} para servicios.`,
        }
      : {
          question: `¿Qué pasa si facturo poco en la categoría ${upper}?`,
          answer: `La categoría ${upper} es la más baja del Monotributo. Aunque factures muy poco, pagás la cuota completa de ${currencyFormatter.format(
            categoria.total.servicios,
          )} para servicios. No existe una categoría con cuota menor.`,
        },
  ];
}

function buildCuantoFacturarSchemas(letra: string): Schema[] {
  const upper = letra.toUpperCase();
  const categoria = getCategoriaByLetter(upper, MONOTRIBUTO_DATA.categorias);
  if (!categoria) return [];

  const pageUrl = `${siteUrl}/monotributo/cuanto-puedo-facturar-por-mes/${letra.toLowerCase()}`;
  const topeAnual = categoria.ingresosBrutos;
  const topeMensual = topeAnual / 12;

  const breadcrumb: Schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
      {
        "@type": "ListItem",
        position: 3,
        name: `Cuánto facturar por mes — ${upper}`,
        item: pageUrl,
      },
    ],
  };
  const article: Schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `¿Cuánto puedo facturar por mes en la categoría ${upper} del Monotributo 2026?`,
    description: `En la categoría ${upper} del Monotributo podés facturar en promedio hasta ${currencyFormatter.format(
      topeMensual,
    )} por mes (${currencyFormatter.format(topeAnual)} al año). Desglose mensual, semanal, diario y qué pasa si te pasás.`,
    image: ARTICLE_IMAGE,
    author: PUBLISHER,
    publisher: ORGANIZATION,
    datePublished: "2026-01-20",
    dateModified,
    mainEntityOfPage: buildMainEntityOfPage(pageUrl),
    inLanguage: "es-AR",
  };
  return [breadcrumb, article, buildFaqSchema(buildCuantoFacturarFaqEntries(letra))];
}

// ----- Matcher -----

/**
 * Resolves the list of JSON-LD schemas (beyond the sitewide ones) that should
 * be rendered in `<head>` for the given pathname. Returns an empty array when
 * the path is not a recognized static page.
 */
export function getSchemasForPath(pathname: string): Schema[] {
  const clean = pathname.replace(/\/$/, "") || "/";

  switch (clean) {
    case "/":
      return [homeBreadcrumbSchema, buildFaqSchema(homeFaqEntries)];
    case "/calculadora-monotributo":
      return [calculadoraWebAppSchema, buildFaqSchema(calculadoraFaqEntries), calculadoraBreadcrumbSchema];
    case "/monotributo":
      return [
        monotributoHubBreadcrumbSchema,
        monotributoHubArticleSchema,
        buildFaqSchema(monotributoHubFaqEntries),
      ];
    case "/monotributo/recategorizacion":
      return [recategorizacionBreadcrumbSchema, recategorizacionArticleSchema, buildFaqSchema(recategorizacionFaqEntries)];
    case "/monotributo/servicios-vs-bienes":
      return [
        serviciosVsBienesBreadcrumbSchema,
        serviciosVsBienesArticleSchema,
        buildFaqSchema(serviciosVsBienesFaqEntries),
      ];
    case "/monotributo/que-pasa-si-me-paso":
      return [quePasaSiMePasoBreadcrumbSchema, quePasaSiMePasoArticleSchema, buildFaqSchema(quePasaSiMePasoFaqEntries)];
    case "/monotributo/vs-responsable-inscripto":
      return [
        vsResponsableInscriptoBreadcrumbSchema,
        vsResponsableInscriptoArticleSchema,
        buildFaqSchema(vsResponsableInscriptoFaqEntries),
      ];
    case "/about":
      return [aboutBreadcrumbSchema, aboutPageSchema];
    case "/ingresar":
      return [ingresarBreadcrumbSchema];
    case "/privacidad":
      return [privacidadBreadcrumbSchema];
    case "/terminos":
      return [terminosBreadcrumbSchema];
    default: {
      const catMatch = clean.match(/^\/monotributo\/categoria\/([a-k])$/i);
      if (catMatch) return buildCategoriaSchemas(catMatch[1]);
      const cuantoMatch = clean.match(/^\/monotributo\/cuanto-puedo-facturar-por-mes\/([a-k])$/i);
      if (cuantoMatch) return buildCuantoFacturarSchemas(cuantoMatch[1]);
      return [];
    }
  }
}
