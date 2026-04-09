import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app"
const pageUrl = `${siteUrl}/privacidad`

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "GARCA funciona 100% en tu navegador. No recopilamos, almacenamos ni transmitimos tus datos personales. Conocé cómo protegemos tu información.",
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
      "GARCA funciona 100% en tu navegador. No recopilamos ni almacenamos tus datos personales.",
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
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GARCA", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Política de Privacidad", item: pageUrl },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  )
}
