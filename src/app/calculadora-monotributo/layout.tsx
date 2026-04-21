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
  return children
}
