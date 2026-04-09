import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app"
const pageUrl = `${siteUrl}/calculadora-monotributo`

export const metadata: Metadata = {
  title: "Calculadora Monotributo 2026 - Categorías, Cuotas y Recategorización",
  description:
    "Calculadora gratuita de Monotributo 2026. Ingresá tus ingresos y descubrí tu categoría, cuota mensual y margen disponible. Tabla completa de categorías ARCA actualizada.",
  keywords: [
    "calculadora monotributo",
    "calculadora monotributo 2026",
    "categorias monotributo 2026",
    "categorias monotributo",
    "tabla monotributo 2026",
    "cuota monotributo 2026",
    "recategorizacion monotributo",
    "recategorizacion monotributo 2026",
    "monotributo categorias",
    "monotributo categoria A B C D E F G H I J K",
    "cuanto pago de monotributo",
    "simulador monotributo",
    "calcular categoria monotributo",
    "topes monotributo 2026",
    "limites monotributo",
    "AFIP monotributo",
    "ARCA monotributo",
    "monotributo servicios",
    "monotributo venta de bienes",
    "pago mensual monotributo",
    "aportes monotributo",
    "obra social monotributo",
    "monotributo argentina",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: pageUrl,
    siteName: "GARCA",
    title: "Calculadora Monotributo 2026 - Categorías y Cuotas Actualizadas",
    description:
      "Calculá gratis tu categoría de Monotributo 2026. Ingresá tus ingresos y obtené tu categoría, cuota mensual y margen. Tabla completa actualizada de ARCA.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Calculadora Monotributo 2026 - GARCA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora Monotributo 2026 - Categorías y Cuotas",
    description:
      "Calculá gratis tu categoría de Monotributo. Tabla completa actualizada con cuotas, topes y aportes.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: pageUrl,
  },
}

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculadora de Monotributo 2026",
    description:
      "Calculadora gratuita para determinar tu categoría de Monotributo según tus ingresos brutos anuales. Incluye tabla de categorías actualizada de ARCA.",
    url: pageUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ARS",
    },
    isAccessibleForFree: true,
    inLanguage: "es",
    author: {
      "@type": "Person",
      name: "Facundo Malgieri",
    },
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo funciona la calculadora de Monotributo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Esta calculadora gratuita te permite proyectar en qué categoría de Monotributo vas a quedar en tu próxima recategorización. Ingresás tu facturación mes a mes para los últimos 12 meses y los meses futuros, y la herramienta calcula automáticamente tu categoría resultante. Podés usar el botón \"Aplicar recomendación\" para que la calculadora llene los meses futuros con el monto máximo que podés facturar sin cambiar de categoría.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuándo me tengo que recategorizar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La recategorización del Monotributo se realiza dos veces al año: en enero y en julio. Debés evaluar tus ingresos brutos acumulados de los últimos 12 meses y verificar si corresponde cambiar de categoría. Si tus ingresos superan el límite de tu categoría actual, debés subir. Si bajaron, podés bajar y pagar menos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué incluye el pago mensual del Monotributo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El pago mensual tiene tres componentes: Impuesto integrado (reemplaza IVA y Ganancias, varía según categoría y actividad), Aportes jubilatorios (SIPA) al sistema previsional, y Obra social (cobertura de salud obligatoria).",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué pasa si me paso de categoría?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Si al momento de la recategorización tus ingresos superan el tope de tu categoría, ARCA te va a recategorizar de oficio a la categoría que corresponda. Esto implica un aumento en tu cuota mensual. Por eso es importante monitorear tus ingresos y planificar tu facturación. Si superás la categoría K, debés inscribirte como Responsable Inscripto.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo me ayuda GARCA con esto?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "GARCA se conecta directamente con ARCA (ex AFIP), descarga tus comprobantes reales y te muestra tu situación actual con datos precisos. Podés ver tu categoría actual, cuánto te falta para el tope, y proyectar tu facturación futura. Es gratis y no almacena tus datos en ningún servidor.",
        },
      },
    ],
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GARCA", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Calculadora Monotributo", item: pageUrl },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  )
}
