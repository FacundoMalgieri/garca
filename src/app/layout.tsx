import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Navbar } from "@/components/Navbar";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { TourProvider } from "@/contexts/TourContext";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GARCA — comprobantes ARCA, calculadora y categorías (sin registro)",
    template: "%s | GARCA",
  },
  description:
    "GARCA: calculadora de Monotributo 2026, consulta de comprobantes ARCA (ex AFIP) y guías. Gratis, cifrado en el navegador, sin base de datos ni registro. Descubrí en segundos tu categoría y exportá a Excel.",
  keywords: [
    "AFIP",
    "ARCA",
    "comprobantes",
    "facturas",
    "Argentina",
    "impuestos",
    "monotributo",
    "facturación electrónica",
    "recuperar facturas",
    "consulta comprobantes",
    "exportar facturas Excel",
    "gestión fiscal",
    "proyección monotributo",
    "simulador recategorización",
    "calcular facturación mensual",
    "planificar categoría monotributo",
  ],
  authors: [{ name: "Facundo Malgieri", url: "https://github.com/FacundoMalgieri" }],
  creator: "Facundo Malgieri",
  publisher: "GARCA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "GARCA",
    title: "GARCA — calculadora Monotributo 2026 y comprobantes ARCA, sin registro",
    description:
      "Calculá tu categoría 2026, leé guías (ARCA/AFIP, facturas) y consultá comprobantes con cifrado en el navegador. Gratis y open source.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GARCA: calculadora Monotributo 2026, comprobantes ARCA, sin registro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GARCA — calculadora Monotributo 2026 y comprobantes ARCA, sin registro",
    description:
      "Calculá tu categoría 2026, guías y comprobantes ARCA. Gratis, cifrado en el navegador, sin registro ni instalación.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "es-AR": siteUrl,
      "x-default": siteUrl,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <JsonLd />
        <link rel="preconnect" href="https://analytics.garca.app" />
        <script defer src="https://analytics.garca.app/script.js" data-website-id="e8daefba-6b2f-477c-9245-007c70563143" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <TourProvider>
            <InvoiceProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </InvoiceProvider>
          </TourProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
