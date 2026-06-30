import type { Metadata } from "next";

import { AdsterraBanner } from "@/components/ads/AdsterraBanner";
import { NativeAd } from "@/components/ads/NativeAd";
import { MONOTRIBUTO_YEAR } from "@/data/monotributo-categorias";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";
const sectionUrl = `${siteUrl}/monotributo`;

export const metadata: Metadata = {
  title: `Monotributo ${MONOTRIBUTO_YEAR} — Categorías, Cuotas y Topes de Facturación`,
  description: `Guía completa del Monotributo ${MONOTRIBUTO_YEAR} en Argentina. Todas las categorías de la A a la K con cuotas mensuales, topes de facturación y desglose de aportes. Datos oficiales de ARCA.`,
  keywords: [
    `monotributo ${MONOTRIBUTO_YEAR}`,
    "categorias monotributo",
    "cuota monotributo",
    "tope facturacion monotributo",
    "monotributo argentina",
    "ARCA monotributo",
    "AFIP monotributo",
    `tabla monotributo ${MONOTRIBUTO_YEAR}`,
    "recategorizacion monotributo",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: sectionUrl,
    siteName: "GARCA",
    title: `Monotributo ${MONOTRIBUTO_YEAR} — Categorías, Cuotas y Topes`,
    description: `Todas las categorías del Monotributo ${MONOTRIBUTO_YEAR} con cuotas mensuales, topes anuales y desglose de aportes. Datos actualizados de ARCA.`,
    images: [
      {
        url: "/og/monotributo.png",
        width: 1200,
        height: 630,
        alt: `Monotributo ${MONOTRIBUTO_YEAR} — categorías A a K`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Monotributo ${MONOTRIBUTO_YEAR} — Categorías y Cuotas`,
    description: `Todas las categorías del Monotributo ${MONOTRIBUTO_YEAR} con cuotas, topes y aportes. Datos oficiales de ARCA.`,
    images: ["/og/monotributo.png"],
  },
  alternates: {
    canonical: sectionUrl,
  },
};

export default function MonotributoSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Ad superior (leaderboard, solo desktop — el 728 no entra en mobile).
          Aplica al hub y a todas las guías de /monotributo/*. */}
      <div className="mx-auto hidden max-w-5xl px-4 pt-6 md:block">
        <AdsterraBanner format="leaderboard" />
      </div>
      {children}
      {/* Ad de cierre (native, responsive) — hub y todas las guías.
          Nunca en producto (/panel, /ingresar) ni en la calculadora. */}
      <div className="mx-auto max-w-5xl px-4 md:px-6 pb-12">
        <NativeAd />
      </div>
    </>
  );
}
