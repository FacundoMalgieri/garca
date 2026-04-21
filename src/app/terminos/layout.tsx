import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app"
const pageUrl = `${siteUrl}/terminos`

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de GARCA. Herramienta gratuita y de código abierto para recuperar comprobantes de ARCA.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: pageUrl,
    siteName: "GARCA",
    title: "Términos y Condiciones - GARCA",
    description:
      "Términos de uso de GARCA, herramienta gratuita y open source para gestión de comprobantes de ARCA.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GARCA - Términos y Condiciones",
      },
    ],
  },
}

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return children
}
