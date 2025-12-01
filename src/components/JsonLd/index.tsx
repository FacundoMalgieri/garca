/**
 * JSON-LD Structured Data for SEO
 *
 * Provides Schema.org structured data to help search engines
 * understand the content and purpose of GARCA.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.onrender.com";

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
// These should match the FAQ_ITEMS in src/app/page.tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Para qué sirve GARCA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GARCA te permite consultar y exportar los comprobantes que tenés en 'Comprobantes en línea' de ARCA de forma rápida y sencilla. También calcula automáticamente tu categoría de Monotributo según tus ingresos acumulados, ayudándote a saber si tenés que recategorizarte.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es seguro ingresar mis credenciales de AFIP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Tus credenciales nunca se guardan en ningún servidor. La conexión con AFIP se hace directamente desde tu navegador de forma encriptada, y los datos solo se almacenan temporalmente en tu dispositivo (localStorage). Podés verificar el código fuente en GitHub.",
      },
    },
    {
      "@type": "Question",
      name: "¿Guardan mis datos o contraseñas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. GARCA no tiene base de datos ni servidor que almacene información. Todo se procesa en tu navegador y se guarda localmente en tu dispositivo. Cuando cerrás la sesión, podés borrar todos los datos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Por qué tarda en cargar mis comprobantes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ARCA no tiene una API pública, así que GARCA usa web scraping para navegar por el portal y extraer tus datos, similar a como lo harías manualmente. Dependiendo de la cantidad de comprobantes y la velocidad de ARCA, puede tomar entre 30 segundos y 2 minutos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Funciona con cualquier tipo de contribuyente?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Actualmente GARCA está optimizado para Monotributistas. Lee únicamente los comprobantes disponibles en 'Comprobantes en línea' de ARCA. Si tenés otro tipo de situación fiscal, puede que algunas funciones no estén disponibles.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo exportar los datos para mi contador?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "¡Sí! Podés exportar tus comprobantes a Excel (CSV), JSON o PDF. El PDF incluye gráficos y un resumen de tu situación en Monotributo, ideal para compartir con tu contador.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es gratis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, GARCA es 100% gratis y open source. Si te resulta útil y querés apoyar el desarrollo, podés hacer una donación voluntaria o dejar una estrella en GitHub.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué pasa si AFIP cambia su página?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Como GARCA depende de la estructura del portal de AFIP, cambios en su sitio pueden afectar el funcionamiento. El proyecto se mantiene activamente, así que ante cualquier problema, revisá si hay actualizaciones o reportá el issue en GitHub.",
      },
    },
    {
      "@type": "Question",
      name: "¿Necesito instalar algo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, GARCA es 100% web. Funciona directamente desde el navegador sin necesidad de instalar ningún programa, extensión o aplicación. Solo necesitás una conexión a internet.",
      },
    },
    {
      "@type": "Question",
      name: "¿Funciona en celular?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, GARCA está optimizado para funcionar en dispositivos móviles. Podés consultar y exportar tus comprobantes desde tu celular o tablet sin problemas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo usar GARCA para varias empresas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, podés ingresar con diferentes CUITs. Sin embargo, los datos se guardan por sesión, así que si querés cambiar de empresa tenés que volver a ingresar con las credenciales correspondientes.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué hago si me da error?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Primero verificá que tus credenciales de AFIP sean correctas. Si el error persiste, puede ser que AFIP esté experimentando problemas (suele pasar). Esperá unos minutos e intentá de nuevo. Si sigue fallando, podés reportar el problema en GitHub.",
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

