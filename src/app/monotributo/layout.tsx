import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";
const sectionUrl = `${siteUrl}/monotributo`;

export const metadata: Metadata = {
  title: "Monotributo 2026 — Categorías, Cuotas y Topes de Facturación",
  description:
    "Guía completa del Monotributo 2026 en Argentina. Todas las categorías de la A a la K con cuotas mensuales, topes de facturación y desglose de aportes. Datos oficiales de ARCA.",
  keywords: [
    "monotributo 2026",
    "categorias monotributo",
    "cuota monotributo",
    "tope facturacion monotributo",
    "monotributo argentina",
    "ARCA monotributo",
    "AFIP monotributo",
    "tabla monotributo 2026",
    "recategorizacion monotributo",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: sectionUrl,
    siteName: "GARCA",
    title: "Monotributo 2026 — Categorías, Cuotas y Topes",
    description:
      "Todas las categorías del Monotributo 2026 con cuotas mensuales, topes anuales y desglose de aportes. Datos actualizados de ARCA.",
    images: [
      {
        url: "/og/monotributo.png",
        width: 1200,
        height: 630,
        alt: "Monotributo 2026 — categorías A a K",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monotributo 2026 — Categorías y Cuotas",
    description:
      "Todas las categorías del Monotributo 2026 con cuotas, topes y aportes. Datos oficiales de ARCA.",
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
  return <>{children}</>;
}
