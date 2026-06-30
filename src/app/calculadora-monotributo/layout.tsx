import type { Metadata } from "next"

import { MONOTRIBUTO_YEAR } from "@/data/monotributo-categorias"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app"
const pageUrl = `${siteUrl}/calculadora-monotributo`

export const metadata: Metadata = {
  title: `Calculadora Monotributo ${MONOTRIBUTO_YEAR} - Categorías, Cuotas y Recategorización`,
  description:
    `Calculá gratis tu Monotributo ${MONOTRIBUTO_YEAR}: categoría, cuota y tope. Sin registro ni base de datos; tabla y topes alineados con ARCA. Ideal antes de recategorizarte en enero o julio.`,
  keywords: [
    "calculadora monotributo",
    `calculadora monotributo ${MONOTRIBUTO_YEAR}`,
    `categorias monotributo ${MONOTRIBUTO_YEAR}`,
    "categorias monotributo",
    `tabla monotributo ${MONOTRIBUTO_YEAR}`,
    `cuota monotributo ${MONOTRIBUTO_YEAR}`,
    "recategorizacion monotributo",
    `recategorizacion monotributo ${MONOTRIBUTO_YEAR}`,
    "monotributo categorias",
    "monotributo categoria A B C D E F G H I J K",
    "cuanto pago de monotributo",
    "simulador monotributo",
    "calcular categoria monotributo",
    `topes monotributo ${MONOTRIBUTO_YEAR}`,
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
    title: `Calculadora Monotributo ${MONOTRIBUTO_YEAR} - Categorías y Cuotas Actualizadas`,
    description:
      `Calculá gratis tu categoría de Monotributo ${MONOTRIBUTO_YEAR}. Ingresá tus ingresos y obtené tu categoría, cuota mensual y margen. Tabla completa actualizada de ARCA.`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `Calculadora Monotributo ${MONOTRIBUTO_YEAR} - GARCA`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Calculadora Monotributo ${MONOTRIBUTO_YEAR} - Categorías y Cuotas`,
    description:
      "Calculá gratis tu categoría de Monotributo. Tabla completa actualizada con cuotas, topes y aportes.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: pageUrl,
  },
}

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return children
}
