import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app"
const pageUrl = `${siteUrl}/privacidad`

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo protege GARCA tus datos: credenciales cifradas con AES-256, descartadas al terminar la consulta, sin base de datos ni retención en servidores. Comprobantes guardados solo en tu navegador.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: pageUrl,
    siteName: "GARCA",
    title: "Política de Privacidad - GARCA",
    description:
      "Credenciales cifradas con AES-256 y descartadas al terminar. Sin base de datos en servidores. Comprobantes solo en tu navegador.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GARCA - Política de Privacidad",
      },
    ],
  },
}

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return children
}
