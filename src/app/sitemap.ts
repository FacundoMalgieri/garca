import type { MetadataRoute } from "next";

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

/**
 * Data freshness date (when Monotributo tables were last refreshed from ARCA).
 * Used as lastmod for Monotributo-related pages so Google has a stable,
 * content-driven signal instead of the build timestamp.
 */
const monotributoLastMod = MONOTRIBUTO_DATA.lastUpdated
  ? new Date(MONOTRIBUTO_DATA.lastUpdated)
  : new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  const categoriaEntries: MetadataRoute.Sitemap = MONOTRIBUTO_DATA.categorias.map((cat) => ({
    url: `${siteUrl}/monotributo/categoria/${cat.categoria.toLowerCase()}`,
    lastModified: monotributoLastMod,
    changeFrequency: "monthly" as const,
    priority: 0.8,
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
      lastModified: monotributoLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/monotributo`,
      lastModified: monotributoLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...categoriaEntries,
    {
      url: `${siteUrl}/ingresar`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
