import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app"
const pageUrl = `${siteUrl}/ingresar`

export const metadata: Metadata = {
  title: "Ingresar - Conectá con ARCA",
  description:
    "Ingresá con tu CUIT y clave fiscal para recuperar tus comprobantes de ARCA. Credenciales cifradas con AES-256 y descartadas al terminar. Sin base de datos.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: pageUrl,
    siteName: "GARCA",
    title: "Ingresar a GARCA - Conectá con ARCA",
    description:
      "Recuperá tus comprobantes de ARCA. Ingresá tu CUIT y clave fiscal de forma segura y privada.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GARCA - Ingresar con Clave Fiscal",
      },
    ],
  },
}

export default function IngresarLayout({ children }: { children: React.ReactNode }) {
  return children
}
