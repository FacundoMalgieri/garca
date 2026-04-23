/**
 * JSON-LD Structured Data for SEO
 *
 * Provides Schema.org structured data to help search engines
 * understand the content and purpose of GARCA.
 */

import { headers } from "next/headers";

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import { getSchemasForPath } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

/**
 * XSS-safe JSON-LD serialization.
 * Replaces `<` so a stray `</script>` inside the payload can't break out of
 * the surrounding `<script>` tag. Follows the Next.js JSON-LD guide.
 */
function serializeSchema(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

const dateModified = MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString().split("T")[0];

// Software Application Schema
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}#software`,
  name: "GARCA",
  alternateName: "Gestor de Recuperación de Comprobantes de ARCA",
  description:
    "Herramienta gratuita para recuperar comprobantes de ARCA. Credenciales cifradas con AES-256, sin base de datos y sin retención de comprobantes en servidores.",
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  dateModified,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ARS",
  },
  featureList: [
    "Consulta de comprobantes de ARCA/AFIP",
    "Cálculo automático de categoría de Monotributo",
    "Proyección inteligente de facturación",
    "Simulador de recategorización",
    "Exportación a Excel, PDF y JSON",
    "Gráficos de facturación interactivos",
    "Credenciales cifradas con AES-256 y descartadas al terminar la consulta",
    "Sin base de datos ni retención de comprobantes en servidores",
  ],
  screenshot: `${siteUrl}/og-image.png`,
  softwareHelp: {
    "@type": "WebPage",
    url: `${siteUrl}/privacidad`,
  },
  author: { "@id": `${siteUrl}#person` },
  maintainer: { "@id": `${siteUrl}#person` },
  publisher: { "@id": `${siteUrl}#organization` },
  isAccessibleForFree: true,
  inLanguage: "es-AR",
  countryOfOrigin: {
    "@type": "Country",
    name: "Argentina",
  },
};

// WebSite Schema
const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}#website`,
  name: "GARCA",
  alternateName: "Gestor de Recuperación de Comprobantes de ARCA",
  url: siteUrl,
  description:
    "Herramienta gratuita para recuperar comprobantes de ARCA. Credenciales cifradas con AES-256, sin base de datos y sin retención de comprobantes en servidores.",
  inLanguage: "es-AR",
  publisher: { "@id": `${siteUrl}#organization` },
};

// Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}#organization`,
  name: "GARCA",
  alternateName: "Gestor de Recuperación de Comprobantes de ARCA",
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/favicon-512x512.png`,
    width: 512,
    height: 512,
  },
  image: `${siteUrl}/og-image.png`,
  description:
    "GARCA es una herramienta gratuita y open source para monotributistas argentinos. Permite recuperar comprobantes del portal ARCA (ex AFIP), calcular la categoría de Monotributo, proyectar la facturación y simular recategorizaciones. Las credenciales se cifran con AES-256 antes de salir del navegador y GARCA no retiene comprobantes en ningún servidor.",
  slogan: "ARCA Monotributo: comprobantes, categorías y calculadora",
  foundingDate: "2025",
  founder: { "@id": `${siteUrl}#person` },
  areaServed: {
    "@type": "Country",
    name: "Argentina",
  },
  knowsAbout: [
    "Monotributo",
    "ARCA",
    "AFIP",
    "Recategorización del Monotributo",
    "Categorías del Monotributo",
    "Responsable Inscripto",
    "Facturación electrónica",
    "Comprobantes electrónicos",
    "Impuestos Argentina",
  ],
  sameAs: [
    "https://github.com/FacundoMalgieri/garca",
    "https://github.com/FacundoMalgieri",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "technical support",
    url: "https://github.com/FacundoMalgieri/garca/issues",
    availableLanguage: ["es", "es-AR"],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}#person`,
  name: "Facundo Malgieri",
  givenName: "Facundo",
  familyName: "Malgieri",
  url: "https://fmalgieri.com",
  jobTitle: "Software Engineer",
  description:
    "Software engineer argentino con más de 10 años de experiencia. Creador y mantenedor de GARCA.",
  worksFor: {
    "@type": "Organization",
    name: "Lumenalta",
    url: "https://lumenalta.com",
  },
  nationality: { "@type": "Country", name: "Argentina" },
  knowsAbout: [
    "Monotributo",
    "ARCA",
    "AFIP",
    "Facturación electrónica",
    "Impuestos Argentina",
    "Next.js",
    "React",
    "TypeScript",
  ],
  sameAs: [
    "https://github.com/FacundoMalgieri",
    "https://www.linkedin.com/in/facundo-malgieri/",
    "https://fmalgieri.com",
  ],
};

export async function JsonLd() {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname");
  // Without middleware's `x-pathname`, defaulting to "/" would inject the home FAQ/WebPage on every URL.
  const pageSchemas = pathname != null && pathname !== "" ? getSchemasForPath(pathname) : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema(softwareApplicationSchema) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(webSiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(personSchema) }} />
      {pageSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}
        />
      ))}
    </>
  );
}
