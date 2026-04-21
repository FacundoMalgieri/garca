import type { MetadataRoute } from "next";

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import { getGuideDateModified } from "@/lib/seo/page-schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

/**
 * Data freshness date for category pages driven by the ARCA scrape
 * (categoria/[letra] and cuanto-puedo-facturar-por-mes/[letra]).
 * These only change when MONOTRIBUTO_DATA is refreshed.
 */
const monotributoDataLastMod = MONOTRIBUTO_DATA.lastUpdated
  ? new Date(MONOTRIBUTO_DATA.lastUpdated)
  : new Date();

/**
 * Freshness date for editorial guides. Uses the most recent between the
 * ARCA scrape date and the manual editorial review date so Google sees
 * an updated `lastmod` whenever we revise copy or structure.
 */
const guideLastMod = new Date(getGuideDateModified());

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  const categoriaEntries: MetadataRoute.Sitemap = MONOTRIBUTO_DATA.categorias.map((cat) => ({
    url: `${siteUrl}/monotributo/categoria/${cat.categoria.toLowerCase()}`,
    lastModified: monotributoDataLastMod,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const cuantoFacturarEntries: MetadataRoute.Sitemap = MONOTRIBUTO_DATA.categorias.map((cat) => ({
    url: `${siteUrl}/monotributo/cuanto-puedo-facturar-por-mes/${cat.categoria.toLowerCase()}`,
    lastModified: monotributoDataLastMod,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/calculadora-monotributo`,
      lastModified: monotributoDataLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/monotributo`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/guias`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/monotributo/recategorizacion`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/monotributo/servicios-vs-bienes`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/monotributo/que-pasa-si-me-paso`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/monotributo/vs-responsable-inscripto`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/monotributo/2026`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/monotributo/arca-vs-afip`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/monotributo/factura-c`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/monotributo/factura-e`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/monotributo/factura-c-vs-factura-e`,
      lastModified: guideLastMod,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    ...categoriaEntries,
    ...cuantoFacturarEntries,
    {
      url: `${siteUrl}/about`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/ingresar`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
