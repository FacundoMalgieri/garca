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

/**
 * Editorial last-review date for hand-written guides. We keep this separate from
 * `MONOTRIBUTO_DATA.lastUpdated` (scraped from ARCA every 6 months) so that a
 * manual content/fact-check refresh can bump the guide's `dateModified` even if
 * the numerical tables haven't changed, and vice-versa. Update this constant
 * whenever we review wording, legal citations, or prose across the guides.
 */
export const GUIDES_LAST_REVIEWED = "2026-04-21";

/**
 * Single source of truth for the `dateModified` value displayed in guide pages
 * and their Article JSON-LD. Returns the more recent between the scraped ARCA
 * data timestamp and the manual editorial review date.
 */
export function getGuideDateModified(): string {
  const scraped = MONOTRIBUTO_DATA.lastUpdated || "";
  return GUIDES_LAST_REVIEWED > scraped
    ? GUIDES_LAST_REVIEWED
    : scraped || new Date().toISOString().split("T")[0];
}

const dateModified = getGuideDateModified();

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

/**
 * Build a per-article ImageObject pointing to the dedicated OG image for that
 * guide. Used in Article JSON-LD so Google associates the right hero image
 * with each article in the knowledge graph and rich results.
 */
function buildArticleImage(slug: string): Schema {
  return {
    "@type": "ImageObject",
    url: `${siteUrl}/og/${slug}.png`,
    width: 1200,
    height: 630,
  };
}

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
    question: "¿Es seguro ingresar mis credenciales de ARCA?",
    answer:
      "Sí. Tus credenciales se cifran en el navegador con AES-256 antes de viajar al backend de GARCA, que las usa únicamente para conectarse a ARCA en tu nombre durante esa sesión. Nunca quedan guardadas en ningún servidor ni base de datos y los comprobantes que devuelve la consulta se almacenan solo en el navegador (localStorage). Podés verificar el código fuente en GitHub.",
  },
  {
    question: "¿Guardan mis datos o contraseñas?",
    answer:
      "No. GARCA no tiene base de datos que almacene credenciales ni comprobantes: las credenciales viajan cifradas y se descartan al terminar la consulta; los comprobantes se guardan localmente en tu navegador. Cuando cerrás la sesión, podés borrar todos los datos.",
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
    question: "¿Qué pasa si ARCA cambia su página?",
    answer:
      "Como GARCA depende de la estructura del portal de ARCA (ex AFIP), cambios en su sitio pueden afectar el funcionamiento. El proyecto se mantiene activamente, así que ante cualquier problema, revisá si hay actualizaciones o reportá el issue en GitHub.",
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
      "Primero verificá que tus credenciales de ARCA (ex AFIP) sean correctas. Si el error persiste, puede ser que el portal de ARCA esté experimentando problemas (suele pasar). Esperá unos minutos e intentá de nuevo. Si sigue fallando, podés reportar el problema en GitHub.",
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
  image: buildArticleImage("monotributo"),
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
  {
    question: "¿Puedo recategorizarme antes del cierre del plazo?",
    answer:
      "Sí. La recategorización se puede hacer desde el primer día de la ventana (1 de enero o 1 de julio) hasta la fecha de cierre que publica ARCA. No conviene esperar al último día porque el portal suele saturarse. La nueva categoría empieza a regir desde el mes siguiente.",
  },
  {
    question: "¿Qué pasa si me equivoco al recategorizarme?",
    answer:
      "Mientras la ventana de recategorización siga abierta, podés rectificar el trámite en el mismo servicio: el sistema te permite enviar una nueva recategorización con los datos corregidos. Si la ventana ya cerró, tenés que esperar al próximo semestre o presentar una multinota explicando la situación, según el caso.",
  },
  {
    question: "¿La recategorización me cambia el código de actividad?",
    answer:
      "No. La recategorización solo actualiza la categoría (A, B, C, ... K) según ingresos brutos y los demás parámetros. El código de actividad (CLAE) se modifica en el servicio 'Sistema Registral' → 'Modificación de actividad', no en la recategorización.",
  },
];

const recategorizacionBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
    { "@type": "ListItem", position: 3, name: "Recategorización", item: `${siteUrl}/monotributo/recategorizacion` },
  ],
};

const recategorizacionArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Recategorización del Monotributo 2026 — Guía paso a paso",
  description:
    "Cuándo y cómo recategorizarte en el Monotributo en 2026: fechas, datos que evalúa ARCA, recategorización de oficio y consecuencias de no hacerla.",
  image: buildArticleImage("recategorizacion"),
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
  {
    question: "¿Cómo declaro mi actividad principal en ARCA?",
    answer:
      "Desde el portal de ARCA con CUIT y clave fiscal, entrá a 'Sistema Registral', sección 'Registro Tributario' → 'Actividades económicas'. Ahí podés agregar, modificar o dar de baja códigos de actividad (CLAE) y marcar cuál es la principal. Tenés que indicar como principal la que te genere mayor facturación.",
  },
  {
    question: "¿Las ventas en Mercado Libre cuentan como venta de bienes?",
    answer:
      "Sí, en general. Si lo que vendés son productos físicos a través de Mercado Libre, Tienda Nube u otra plataforma de comercio electrónico, encuadra como venta de bienes. Si vendés servicios digitales (cursos, suscripciones, consultoría) a través de plataformas, encuadra como prestación de servicios.",
  },
  {
    question: "¿Si cambio de servicios a venta de bienes, desde cuándo se aplica la nueva cuota?",
    answer:
      "El cambio de actividad principal se aplica al período fiscal del mes siguiente al de la modificación en el portal. Es decir, si cambiás en marzo, la cuota de abril ya viene calculada con el impuesto integrado del nuevo rubro.",
  },
  {
    question: "¿Puedo combinar servicios y venta de bienes en el Monotributo?",
    answer:
      "Sí, podés tener varias actividades simultáneas en el Monotributo, siempre que no superes 3 actividades distintas ni 3 unidades de explotación. La actividad principal define el impuesto integrado que pagás, pero todas las actividades suman al mismo tope anual.",
  },
];

const serviciosVsBienesBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
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
  image: buildArticleImage("servicios-vs-bienes"),
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
  {
    question: "¿Cómo calculo si me pasé del tope del Monotributo?",
    answer:
      "Sumá el total bruto facturado en los últimos 12 meses (todos los importes de tus facturas C y E, sin restar IVA porque no se discrimina). Si esa suma supera el tope anual de tu categoría actual, te tenés que recategorizar; si supera el tope de la K, quedaste fuera del régimen. Podés hacerlo a mano o usar la calculadora gratuita de GARCA.",
  },
  {
    question: "¿Puedo seguir facturando después de que ARCA me excluya?",
    answer:
      "No con factura C ni E. Una vez excluido, ya no podés emitir comprobantes de Monotributo. Tenés que inscribirte como Responsable Inscripto en IVA y Ganancias y empezar a emitir factura A o B según el cliente. Hasta hacer la inscripción, no podés facturar válidamente.",
  },
  {
    question: "¿Cuánto tiempo tengo para inscribirme como Responsable Inscripto después de la exclusión?",
    answer:
      "La exclusión tiene efectos desde las 0 hs del día en que se configuró la causal (por ejemplo, el día que tu acumulado superó el tope de la categoría K). A partir de ahí, lo recomendable es inscribirse como Responsable Inscripto cuanto antes para regularizar la situación; cualquier facturación emitida con factura C después de la exclusión queda sin respaldo válido.",
  },
  {
    question: "¿Si después bajo la facturación, puedo volver al Monotributo?",
    answer:
      "Solo si fuiste excluido por ARCA, tenés que esperar 3 años calendario completos desde la exclusión para reingresar al Monotributo. Si en cambio renunciaste voluntariamente al régimen, podés volver cuando quieras siempre que cumplas las condiciones de inclusión (tope, cantidad de actividades, etc.).",
  },
];

const quePasaSiMePasoBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
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
  image: buildArticleImage("que-pasa-si-me-paso"),
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
  {
    question: "¿Cómo se renuncia al Monotributo voluntariamente?",
    answer:
      "Desde el portal de ARCA, en el servicio 'Monotributo', hay una opción de 'Baja' o 'Renuncia'. Al renunciar tenés que indicar el motivo (en este caso, pase a Responsable Inscripto) y la fecha. La renuncia tiene efectos a partir del primer día del mes siguiente, e impide reingresar al Monotributo durante los 3 años calendario siguientes si la renuncia fue por opción al régimen general.",
  },
  {
    question: "¿Qué obligaciones nuevas asumo como Responsable Inscripto?",
    answer:
      "Pasás a presentar declaración jurada mensual de IVA, declaración jurada anual de Ganancias y, según el caso, anticipos de Ganancias y Bienes Personales. Tenés que llevar libros IVA Compras e IVA Ventas, emitir factura A o B según el cliente, y en muchos casos sumar Ingresos Brutos multijurisdiccional (Convenio Multilateral).",
  },
  {
    question: "¿Tengo que pagar Ingresos Brutos como Responsable Inscripto?",
    answer:
      "Sí, igual que como monotributista. Ingresos Brutos es un impuesto provincial independiente del régimen nacional. La diferencia es que como Responsable Inscripto generalmente liquidás Ingresos Brutos sobre la base imponible neta de IVA, y si tenés clientes en varias provincias podés tener que inscribirte en Convenio Multilateral.",
  },
  {
    question: "¿Puedo computar el IVA de mis compras si paso a Responsable Inscripto?",
    answer:
      "Sí. Esa es una de las grandes diferencias respecto al Monotributo: como Responsable Inscripto, el IVA que te facturan en tus compras (factura A) lo podés tomar como crédito fiscal y restarlo del IVA que cobrás en tus ventas. Es especialmente útil cuando tenés muchas compras con IVA alto o importás insumos.",
  },
];

const vsResponsableInscriptoBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
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
  image: buildArticleImage("vs-responsable-inscripto"),
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/vs-responsable-inscripto`),
  inLanguage: "es-AR",
};

// ----- /monotributo/2026 -----

export const monotributo2026FaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Cuáles son las novedades del Monotributo en 2026?",
    answer:
      "Para 2026 siguen vigentes las 11 categorías de la A a la K y la recategorización semestral en enero y julio. Los topes de facturación y las cuotas mensuales se actualizan en cada una de esas fechas siguiendo la evolución del índice de inflación. Además, todo el régimen se opera desde ARCA (Agencia de Recaudación y Control Aduanero), que reemplazó a AFIP a fines de 2024.",
  },
  {
    question: "¿Cuándo actualiza ARCA los valores del Monotributo?",
    answer:
      "ARCA actualiza los topes de facturación y las cuotas dos veces por año: en enero (vigente febrero a julio) y en julio (vigente agosto a enero del año siguiente). La actualización no requiere trámite de tu parte: se aplica automáticamente a tu categoría vigente.",
  },
  {
    question: "¿Qué fechas clave tiene el Monotributo 2026?",
    answer:
      "Enero y julio para la recategorización semestral, y el día 20 de cada mes para el vencimiento de la cuota mensual (si es fin de semana o feriado, se corre al día hábil siguiente). ARCA publica las fechas exactas de cierre de cada recategorización con anticipación.",
  },
  {
    question: "¿La facturación electrónica es obligatoria en 2026?",
    answer:
      "Sí. Todos los comprobantes que emita un monotributista en 2026 tienen que ser electrónicos con CAE, incluyendo las ventas a consumidor final. El talonario manual ya no es válido como vía regular de emisión.",
  },
  {
    question: "¿Qué cambios trajo ARCA respecto a AFIP para el monotributista?",
    answer:
      "En la práctica, casi nada. Cambió el nombre del organismo, el dominio web (arca.gob.ar) y el logo. No cambió la clave fiscal, las categorías, las cuotas, los topes, la recategorización semestral, la factura C ni los servicios del portal.",
  },
  {
    question: "¿Cuáles son los topes anuales de facturación del Monotributo en 2026?",
    answer:
      "Los topes vigentes desde la última actualización aplican por categoría (de A a K) y se ajustan dos veces al año. Los valores exactos se publican en el portal de ARCA y los podés consultar actualizados en la guía de categorías de GARCA, que se sincroniza con cada actualización oficial.",
  },
  {
    question: "¿Hay que adherirse al débito automático sí o sí?",
    answer:
      "No es obligatorio, pero sí recomendado. Si pagás la cuota con débito automático en cuenta, débito en tarjeta de crédito o billetera virtual adherida al sistema de cobranza electrónica (CBU), ARCA te bonifica una parte de la cuota anual (en general el equivalente a una mensualidad si cumplís todos los meses).",
  },
  {
    question: "¿Cómo afecta la inflación a la cuota mensual del Monotributo?",
    answer:
      "Como las cuotas se actualizan dos veces al año por inflación, en períodos de inflación alta la cuota nominal sube cada semestre, pero el tope de facturación también, manteniendo (en teoría) la equivalencia en términos reales. Por eso es importante revisar tu acumulado en cada ventana de recategorización.",
  },
];

const monotributo2026BreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
    { "@type": "ListItem", position: 3, name: "Monotributo 2026", item: `${siteUrl}/monotributo/2026` },
  ],
};

const monotributo2026ArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Monotributo 2026 — Guía completa, cambios y fechas clave",
  description:
    "Cómo funciona el Monotributo en 2026: actualización semestral de valores, fechas clave, cambios con ARCA y checklist para el monotributista.",
  image: buildArticleImage("monotributo-2026"),
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/2026`),
  inLanguage: "es-AR",
};

// ----- /monotributo/arca-vs-afip -----

export const arcaVsAfipFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Qué es ARCA?",
    answer:
      "ARCA es la Agencia de Recaudación y Control Aduanero, el organismo que reemplazó a AFIP en Argentina a fines de 2024 por el Decreto 953/2024 (publicado en el Boletín Oficial el 25 de octubre de 2024). Mantiene dos direcciones generales: la Dirección General Impositiva (DGI), que además absorbió las funciones de la ex Dirección General de los Recursos de la Seguridad Social (DGRSS), y la Dirección General de Aduanas (DGA).",
  },
  {
    question: "¿AFIP dejó de existir?",
    answer:
      "En términos prácticos sí: AFIP como marca y sigla dejó de usarse y fue reemplazada por ARCA. El organismo sigue siendo el mismo en términos de atribuciones y personal (aunque con reducción anunciada), y todas las obligaciones impositivas y previsionales migraron sin cambios.",
  },
  {
    question: "¿Cambió mi clave fiscal con el paso a ARCA?",
    answer:
      "No. La clave fiscal que usabas en AFIP es la misma que vas a usar en ARCA. No hace falta volver a tramitarla ni elevar el nivel de seguridad por el cambio de nombre.",
  },
  {
    question: "¿Cambió algo para el monotributista con ARCA?",
    answer:
      "Para el día a día del monotributista, casi nada. Se mantienen las 11 categorías (A a K), la recategorización semestral de enero y julio, el vencimiento del día 20, la factura C y la factura E, y los servicios del portal (Comprobantes en Línea, Monotributo, etc.). Lo que cambió es el nombre del organismo, el dominio (arca.gob.ar) y la identidad visual.",
  },
  {
    question: "¿Los enlaces viejos a afip.gob.ar siguen funcionando?",
    answer:
      "En la mayoría de los casos sí: los dominios viejos redirigen al nuevo arca.gob.ar. Igualmente, conviene actualizar marcadores y referencias al dominio nuevo para evitar cualquier interrupción futura si se desactivan los redirects.",
  },
  {
    question: "¿Por qué se reemplazó AFIP por ARCA?",
    answer:
      "El cambio se formalizó por el Decreto 953/2024 con el objetivo declarado de reorganizar y reducir la estructura del organismo recaudador. ARCA mantiene dos direcciones generales (DGI y DGA) y consolidó dentro de la DGI las funciones de la ex DGRSS (recursos de la seguridad social), manteniendo la unidad funcional del cobro impositivo, aduanero y previsional.",
  },
  {
    question: "¿Mis comprobantes emitidos cuando se llamaba AFIP siguen siendo válidos?",
    answer:
      "Sí. Todos los comprobantes electrónicos (factura C, factura E, recibos, notas de crédito y débito) emitidos bajo la denominación AFIP siguen siendo plenamente válidos. No hay que reemitirlos ni hacer ninguna conversión.",
  },
  {
    question: "¿Tengo que actualizar mis facturas o sistemas porque ahora es ARCA?",
    answer:
      "Si emitís facturas desde el portal oficial 'Comprobantes en Línea', el cambio es transparente: ARCA ya emite los comprobantes con su propia denominación. Si usás un sistema externo (facturador, ERP), conviene verificar que esté actualizado para que el pie de página, el QR y la integración por web service apunten correctamente a ARCA.",
  },
];

const arcaVsAfipBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
    { "@type": "ListItem", position: 3, name: "ARCA vs AFIP", item: `${siteUrl}/monotributo/arca-vs-afip` },
  ],
};

const arcaVsAfipArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "ARCA vs AFIP — Qué cambió para el monotributista (2026)",
  description:
    "Transición de AFIP a ARCA (Agencia de Recaudación y Control Aduanero) por el Decreto 953/2024: qué cambió y qué sigue igual para el monotributista.",
  image: buildArticleImage("arca-vs-afip"),
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/arca-vs-afip`),
  inLanguage: "es-AR",
};

// ----- /monotributo/factura-c -----

export const facturaCFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Qué es la factura C?",
    answer:
      "La factura C es el comprobante electrónico que emiten los monotributistas y los responsables exentos o no alcanzados por IVA para respaldar sus ventas en el mercado local argentino. A diferencia de la factura A o B, no discrimina IVA: muestra un único importe total.",
  },
  {
    question: "¿Quién emite factura C?",
    answer:
      "Emiten factura C los monotributistas en cualquiera de las 11 categorías (A a K), los responsables exentos en IVA (por ejemplo, ciertas actividades agropecuarias o profesionales de salud específicos) y los sujetos no alcanzados por IVA. Si sos responsable inscripto, no emitís factura C: emitís factura A o B según el cliente.",
  },
  {
    question: "¿Un monotributista puede emitir factura A o B?",
    answer:
      "No. Como monotributista, el único comprobante que emitís para el mercado local es la factura C (y el recibo C, y la nota de crédito/débito C). Para ventas al exterior, la factura E. La factura A y B son para responsables inscriptos en IVA.",
  },
  {
    question: "¿Cómo se emite una factura C en ARCA?",
    answer:
      "Se emite desde el portal de ARCA (arca.gob.ar) usando el servicio 'Comprobantes en Línea'. Ingresás con CUIT y clave fiscal, seleccionás el punto de venta, elegís 'Factura C', cargás los datos del cliente y la descripción del producto o servicio, y el sistema te genera el CAE al instante.",
  },
  {
    question: "¿Hay un plazo máximo para emitir factura C después de la venta?",
    answer:
      "Sí. La factura se tiene que emitir en el momento de la operación o, a más tardar, en los días siguientes dentro del plazo que admite ARCA para cada tipo de operación. Emitirla antes de la operación tampoco se puede: la fecha no puede ser posterior a los 5 días siguientes al de la generación.",
  },
  {
    question: "¿La factura C cuenta para el tope del Monotributo?",
    answer:
      "Sí. El total bruto facturado en factura C suma directamente al acumulado anual de ingresos brutos que ARCA usa para evaluar tu categoría en cada recategorización semestral. Como no se discrimina IVA, el importe de la factura es el monto que entra al cómputo.",
  },
  {
    question: "¿Cómo anulo o corrijo una factura C ya emitida?",
    answer:
      "No se puede modificar una factura C después de tener CAE: lo que corresponde es emitir una nota de crédito C por el monto a anular y, si la operación se hizo por un monto distinto, emitir una nueva factura C correcta. Las dos operaciones se hacen desde 'Comprobantes en Línea'.",
  },
  {
    question: "¿Necesito un punto de venta especial para emitir factura C?",
    answer:
      "Para empezar a emitir, usás el punto de venta '00001' que ARCA genera por defecto al adherirte al servicio de Comprobantes en Línea. Si querés organizar tus comprobantes por sucursal o canal, podés crear puntos de venta adicionales desde 'Administración de puntos de venta y domicilios'.",
  },
];

const facturaCBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
    { "@type": "ListItem", position: 3, name: "Factura C", item: `${siteUrl}/monotributo/factura-c` },
  ],
};

const facturaCArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Factura C 2026 — Qué es, quién la emite y cómo hacerla en ARCA",
  description:
    "Guía de la factura C para monotributistas y responsables exentos: datos obligatorios, paso a paso en Comprobantes en Línea, diferencias con A y B y cómo impacta en el tope.",
  image: buildArticleImage("factura-c"),
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/factura-c`),
  inLanguage: "es-AR",
};

// ----- /monotributo/factura-e -----

export const facturaEFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Un monotributista puede emitir factura E?",
    answer:
      "Sí. Los monotributistas pueden emitir factura E para respaldar operaciones de exportación, tanto de bienes como de servicios prestados a clientes del exterior. Se emite con CAE desde el portal de ARCA, usando un punto de venta específico habilitado para exportación.",
  },
  {
    question: "¿Cuándo corresponde factura E y no factura C?",
    answer:
      "Corresponde factura E cuando el destinatario de la operación está fuera de Argentina: por ejemplo, desarrollo de software para una empresa de EE.UU., diseño para un cliente en Europa, servicios de consultoría a una empresa latinoamericana. Si el cliente está en Argentina, incluso si te paga en dólares, la factura es C.",
  },
  {
    question: "¿Los ingresos por factura E cuentan para el tope del Monotributo?",
    answer:
      "Sí. El total facturado por exportación (convertido a pesos según la cotización del día de la factura) suma al mismo tope anual que la facturación local. No hay una exención por exportación a efectos del tope del Monotributo, solo la exención de IVA propia de la operación.",
  },
  {
    question: "¿Cómo se informa la moneda extranjera en la factura E?",
    answer:
      "Al emitir factura E en Comprobantes en Línea, ARCA te pide la moneda (usualmente USD o EUR) y la cotización del día. El sistema calcula automáticamente el equivalente en pesos. Ese monto en pesos es el que queda registrado a efectos impositivos y del tope del Monotributo.",
  },
  {
    question: "¿Necesito un punto de venta especial para emitir factura E?",
    answer:
      "Sí. Tenés que tener dado de alta un punto de venta específico habilitado para comprobantes de exportación (factura E, nota de crédito E, etc.). Se crea desde el servicio 'Administración de puntos de venta y domicilios' dentro del portal de ARCA.",
  },
  {
    question: "¿Tengo que liquidar las divisas de la factura E en el mercado oficial?",
    answer:
      "Las exportaciones de servicios tienen un régimen específico de liquidación de divisas regulado por el BCRA. Las reglas y los plazos se modifican con frecuencia: a 2026, el monotributista exportador de servicios suele tener flexibilidad para mantener parte de los cobros en moneda extranjera. Conviene chequear las normas vigentes antes de cada cobro.",
  },
  {
    question: "¿La factura E paga IVA?",
    answer:
      "No. Las exportaciones de bienes y servicios están exentas o no alcanzadas por IVA en Argentina (según el caso). Por eso la factura E no discrimina IVA, similar a la factura C. La diferencia es que la factura E respalda una operación con destino exterior.",
  },
  {
    question: "¿Cómo se prueba que el cliente está realmente en el exterior?",
    answer:
      "El respaldo típico es la factura misma (con datos del cliente extranjero), el contrato o acuerdo de servicios y el comprobante del cobro internacional (transferencia SWIFT, plataforma como Payoneer, Wise o similar, o ingreso de divisas registrado por el banco). Conviene guardar toda esta documentación al menos por el plazo de prescripción fiscal.",
  },
];

const facturaEBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
    { "@type": "ListItem", position: 3, name: "Factura E", item: `${siteUrl}/monotributo/factura-e` },
  ],
};

const facturaEArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Factura E 2026 — Exportación de servicios para monotributistas",
  description:
    "Cómo emitir factura E como monotributista en 2026: requisitos, paso a paso en ARCA, impacto en el tope anual y uso para exportación de servicios a clientes del exterior.",
  image: buildArticleImage("factura-e"),
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/factura-e`),
  inLanguage: "es-AR",
};

// ----- /monotributo/factura-c-vs-factura-e -----

export const facturaCvsEFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Cuál es la diferencia principal entre factura C y factura E?",
    answer:
      "La diferencia fundamental es el destinatario. La factura C se emite a clientes residentes en Argentina y respalda operaciones locales. La factura E respalda operaciones de exportación: bienes que salen del país o servicios prestados a clientes no residentes en el exterior.",
  },
  {
    question: "Si me pagan en dólares, ¿corresponde factura C o factura E?",
    answer:
      "Depende de dónde está el cliente, no de la moneda del pago. Si el cliente tiene domicilio fiscal en Argentina, corresponde factura C aunque te pague en dólares (por ejemplo, dólar MEP o transferencia en dólares). Si el cliente está en el exterior, corresponde factura E.",
  },
  {
    question: "¿Las dos facturas suman al mismo tope del Monotributo?",
    answer:
      "Sí. Tanto la factura C como la factura E suman al mismo tope anual de ingresos brutos que usa ARCA para la recategorización. La factura E se convierte a pesos con la cotización del día de emisión.",
  },
  {
    question: "¿Puedo tener un punto de venta que emita las dos?",
    answer:
      "No. El punto de venta que emite factura C es distinto del que emite factura E. Cada uno se habilita por separado en 'Administración de puntos de venta y domicilios' y podés tener los dos activos simultáneamente si tu actividad lo requiere.",
  },
  {
    question: "¿Qué pasa si emití factura C cuando correspondía factura E (o viceversa)?",
    answer:
      "Tenés que anular la factura emitida incorrectamente (con una nota de crédito del mismo tipo) y volver a emitirla con el tipo correcto. Si no se corrige, podés tener problemas con el encuadre fiscal de la operación (por ejemplo, tratamiento de IVA) y con la liquidación de divisas en caso de exportación.",
  },
  {
    question: "¿Si trabajo para una empresa argentina con sede en EE.UU., qué factura emito?",
    answer:
      "Lo que define la factura es dónde está domiciliada fiscalmente la entidad que recibe el servicio. Si la empresa que te contrata es la sociedad estadounidense (con su Tax ID propio en EE.UU.), corresponde factura E. Si te contrata la entidad argentina (CUIT argentino) y solo el pago viene del exterior, corresponde factura C.",
  },
  {
    question: "¿Una factura E impacta distinto que una factura C en la recategorización?",
    answer:
      "No en el monto: ambos tipos suman al mismo tope anual de ingresos brutos. Sí cambia cómo se contabiliza el importe en el caso de la factura E: se toma el equivalente en pesos según la cotización oficial vigente al día de emisión del comprobante.",
  },
  {
    question: "¿Puedo facturar a un cliente del exterior con factura C si me lo pide?",
    answer:
      "No. Aunque el cliente lo pida (por ejemplo, para facilitar su contabilidad), la operación con destinatario en el exterior tiene que respaldarse con factura E. Emitir factura C a un cliente extranjero es un error formal que puede traer problemas con ARCA y con la liquidación de divisas.",
  },
];

const facturaCvsEBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
    {
      "@type": "ListItem",
      position: 3,
      name: "Factura C vs Factura E",
      item: `${siteUrl}/monotributo/factura-c-vs-factura-e`,
    },
  ],
};

const facturaCvsEArticleSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Factura C vs Factura E — Cuándo usar cada una (Monotributo 2026)",
  description:
    "Comparativa entre factura C (mercado local) y factura E (exportación) para monotributistas: diferencias clave, ejemplos prácticos e impacto en el tope anual.",
  image: buildArticleImage("factura-c-vs-factura-e"),
  author: PUBLISHER,
  publisher: ORGANIZATION,
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: buildMainEntityOfPage(`${siteUrl}/monotributo/factura-c-vs-factura-e`),
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

// ----- /guias (standalone guides index) -----

export const guiasFaqEntries: readonly FaqEntry[] = [
  {
    question: "¿Para qué sirven estas guías?",
    answer:
      "Son artículos cortos y prácticos sobre los temas que más consulta el monotributista argentino: cuándo recategorizarse, qué pasa si superás el tope, diferencias con el Responsable Inscripto, servicios vs. venta de bienes y más. Cada guía está actualizada con datos oficiales de ARCA.",
  },
  {
    question: "¿Cada cuánto se actualizan?",
    answer:
      "Las guías se revisan cada semestre, cuando ARCA publica la actualización oficial de topes y cuotas (enero y julio). Los cambios normativos significativos se reflejan en el momento, con la fecha de actualización visible al pie de cada artículo.",
  },
  {
    question: "¿Puedo usar estas guías como asesoramiento contable?",
    answer:
      "No. GARCA es una herramienta de información basada en los datos oficiales de ARCA, pero no reemplaza el asesoramiento de un contador matriculado. Si tenés una situación compleja (exclusión del régimen, combinación de regímenes, actividad internacional), consultá con un profesional.",
  },
];

const guiasBreadcrumbSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${siteUrl}/guias` },
  ],
};

const guiasCollectionPageSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${siteUrl}/guias`,
  url: `${siteUrl}/guias`,
  name: "Guías — Monotributo, ARCA y facturación",
  description:
    "Índice de guías sobre Monotributo en Argentina: recategorización, exclusión, comparativa con Responsable Inscripto, servicios vs. bienes, facturación y más.",
  inLanguage: "es-AR",
  isPartOf: { "@id": `${siteUrl}#website` },
  primaryImageOfPage: buildArticleImage("guias"),
  dateModified,
  about: {
    "@type": "Thing",
    name: "Monotributo Argentina",
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        url: `${siteUrl}/monotributo`,
        name: "Monotributo 2026 — Categorías, cuotas y topes",
      },
      {
        "@type": "ListItem",
        position: 2,
        url: `${siteUrl}/monotributo/2026`,
        name: "Monotributo 2026 — Guía del año",
      },
      {
        "@type": "ListItem",
        position: 3,
        url: `${siteUrl}/monotributo/recategorizacion`,
        name: "Recategorización del Monotributo paso a paso",
      },
      {
        "@type": "ListItem",
        position: 4,
        url: `${siteUrl}/monotributo/servicios-vs-bienes`,
        name: "Servicios vs. Venta de bienes en Monotributo",
      },
      {
        "@type": "ListItem",
        position: 5,
        url: `${siteUrl}/monotributo/que-pasa-si-me-paso`,
        name: "¿Qué pasa si me paso del tope del Monotributo?",
      },
      {
        "@type": "ListItem",
        position: 6,
        url: `${siteUrl}/monotributo/vs-responsable-inscripto`,
        name: "Monotributo vs. Responsable Inscripto",
      },
      {
        "@type": "ListItem",
        position: 7,
        url: `${siteUrl}/monotributo/arca-vs-afip`,
        name: "ARCA vs AFIP — Qué cambió para el monotributista",
      },
      {
        "@type": "ListItem",
        position: 8,
        url: `${siteUrl}/monotributo/factura-c`,
        name: "Factura C — Qué es y cómo emitirla",
      },
      {
        "@type": "ListItem",
        position: 9,
        url: `${siteUrl}/monotributo/factura-e`,
        name: "Factura E — Exportación de servicios",
      },
      {
        "@type": "ListItem",
        position: 10,
        url: `${siteUrl}/monotributo/factura-c-vs-factura-e`,
        name: "Factura C vs Factura E",
      },
    ],
  },
};

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
    case "/guias":
      return [guiasBreadcrumbSchema, guiasCollectionPageSchema, buildFaqSchema(guiasFaqEntries)];
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
    case "/monotributo/2026":
      return [
        monotributo2026BreadcrumbSchema,
        monotributo2026ArticleSchema,
        buildFaqSchema(monotributo2026FaqEntries),
      ];
    case "/monotributo/arca-vs-afip":
      return [
        arcaVsAfipBreadcrumbSchema,
        arcaVsAfipArticleSchema,
        buildFaqSchema(arcaVsAfipFaqEntries),
      ];
    case "/monotributo/factura-c":
      return [facturaCBreadcrumbSchema, facturaCArticleSchema, buildFaqSchema(facturaCFaqEntries)];
    case "/monotributo/factura-e":
      return [facturaEBreadcrumbSchema, facturaEArticleSchema, buildFaqSchema(facturaEFaqEntries)];
    case "/monotributo/factura-c-vs-factura-e":
      return [
        facturaCvsEBreadcrumbSchema,
        facturaCvsEArticleSchema,
        buildFaqSchema(facturaCvsEFaqEntries),
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
