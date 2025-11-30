import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/Footer";
import { InitialLoader } from "@/components/InitialLoader";
import { JsonLd } from "@/components/JsonLd";
import { Navbar } from "@/components/Navbar";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GARCA - Gestor de Recuperación de Comprobantes de ARCA",
    template: "%s | GARCA",
  },
  description:
    "Recuperá tus comprobantes de ARCA de forma segura. Consultá facturas, calculá monotributo y exportá a Excel. 100% privado.",
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
    title: "GARCA - Gestor de Recuperación de Comprobantes de ARCA",
    description:
      "Recuperá tus comprobantes de ARCA de forma segura. Consultá facturas, calculá monotributo y exportá a Excel.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GARCA - Gestor de Recuperación de Comprobantes de ARCA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GARCA - Gestor de Recuperación de Comprobantes de ARCA",
    description:
      "Recuperá tus comprobantes de ARCA de forma segura. Consultá facturas, calculá monotributo y exportá a Excel.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
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
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <InvoiceProvider>
            <InitialLoader>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </InitialLoader>
          </InvoiceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
