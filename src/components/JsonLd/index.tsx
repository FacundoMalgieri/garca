/**
 * JSON-LD Structured Data for SEO
 *
 * Provides Schema.org structured data to help search engines
 * understand the content and purpose of GARCA.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

// Software Application Schema
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GARCA",
  alternateName: "Gestor de Recuperación de Comprobantes de ARCA",
  description:
    "Herramienta segura y privada para recuperar comprobantes de ARCA. Funciona completamente en el navegador sin almacenar datos.",
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ARS",
  },
  featureList: [
    "Consulta de comprobantes de ARCA/AFIP",
    "Cálculo automático de categoría de Monotributo",
    "Exportación a Excel",
    "Gráficos de facturación",
    "100% privado - datos en tu navegador",
    "Sin almacenamiento en servidores",
  ],
  screenshot: `${siteUrl}/og-image.png`,
  softwareHelp: {
    "@type": "WebPage",
    url: `${siteUrl}/privacidad`,
  },
  author: {
    "@type": "Person",
    name: "Facundo Malgieri",
    url: "https://github.com/FacundoMalgieri",
  },
  maintainer: {
    "@type": "Person",
    name: "Facundo Malgieri",
  },
  isAccessibleForFree: true,
  inLanguage: "es",
  countryOfOrigin: {
    "@type": "Country",
    name: "Argentina",
  },
};

// WebSite Schema for sitelinks search box
const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GARCA",
  alternateName: "Gestor de Recuperación de Comprobantes de ARCA",
  url: siteUrl,
  description:
    "Herramienta segura y privada para recuperar comprobantes de ARCA. Funciona completamente en el navegador sin almacenar datos.",
  inLanguage: "es",
  publisher: {
    "@type": "Person",
    name: "Facundo Malgieri",
  },
};

// Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GARCA",
  url: siteUrl,
  logo: `${siteUrl}/og-image.png`,
  sameAs: ["https://github.com/FacundoMalgieri/garca"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "technical support",
    url: "https://github.com/FacundoMalgieri/garca/issues",
  },
};

// FAQ Schema - Critical for Google AI Overviews
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es GARCA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GARCA es una herramienta gratuita y segura para recuperar comprobantes de ARCA (ex AFIP). Permite consultar facturas emitidas y recibidas, calcular tu categoría de Monotributo y exportar los datos a Excel.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es seguro usar GARCA con mis datos de ARCA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, GARCA es 100% seguro. Tus credenciales nunca se almacenan en ningún servidor. Todo el procesamiento ocurre en tu navegador y los datos se guardan localmente en tu dispositivo. El código es open source y auditable en GitHub.",
      },
    },
    {
      "@type": "Question",
      name: "¿GARCA guarda mis datos en algún servidor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. GARCA funciona completamente en tu navegador. Tus facturas y datos se almacenan únicamente en el almacenamiento local de tu navegador (localStorage). No enviamos ni guardamos tus datos en ningún servidor externo.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué monedas soporta GARCA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GARCA soporta todas las monedas que maneja ARCA: Pesos Argentinos (ARS), Dólares Estadounidenses (USD), Euros (EUR) y Reales Brasileños (BRL).",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo calcula GARCA mi categoría de Monotributo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GARCA suma automáticamente tus ingresos del año actual y los compara con los límites de cada categoría de Monotributo vigentes. Te muestra tu categoría actual, el porcentaje utilizado y cuánto margen te queda antes de pasar a la siguiente categoría.",
      },
    },
    {
      "@type": "Question",
      name: "¿GARCA está afiliado con ARCA o AFIP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. GARCA es un proyecto independiente y open source. No tiene ninguna afiliación oficial con ARCA, AFIP ni ningún organismo gubernamental argentino.",
      },
    },
  ],
};

// Breadcrumb Schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Ingresar",
      item: `${siteUrl}/ingresar`,
    },
  ],
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

