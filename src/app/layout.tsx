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
    default: "GARCA — ARCA Monotributo: Comprobantes, Categorías y Calculadora 2026",
    template: "%s | GARCA",
  },
  description:
    "Consultá comprobantes de ARCA, calculá tu categoría de Monotributo 2026 y proyectá tu facturación. Gratis, open source, sin base de datos ni registro. No instalás nada.",
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
    title: "GARCA — ARCA Monotributo: Comprobantes, Categorías y Calculadora 2026",
    description:
      "Consultá comprobantes de ARCA, calculá tu categoría de Monotributo 2026 y proyectá tu facturación. Gratis, open source y sin base de datos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GARCA - ARCA Monotributo: comprobantes, categorías y calculadora 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GARCA — ARCA Monotributo: Comprobantes, Categorías y Calculadora 2026",
    description:
      "Consultá comprobantes de ARCA, calculá tu categoría de Monotributo 2026 y proyectá tu facturación. Gratis, open source y sin base de datos.",
    images: ["/og-image.png"],
  },
  alternates: {
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
          <InvoiceProvider>
            <TourProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </TourProvider>
          </InvoiceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
