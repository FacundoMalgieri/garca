import type { Metadata } from "next";
import Link from "next/link";

import { ArticleHero } from "@/components/ui/ArticleHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { getGuideDateModified, guiasFaqEntries } from "@/lib/seo/page-schemas";

import { GUIDES } from "./guides-data";
import { GuidesExplorer } from "./GuidesExplorer";

const dateModified = getGuideDateModified();

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export const metadata: Metadata = {
  title: "Guías — Monotributo, ARCA y facturación en Argentina",
  description:
    "Índice de guías sobre Monotributo en Argentina 2026: recategorización, exclusión del régimen, Monotributo vs Responsable Inscripto, servicios vs. venta de bienes y facturación. Datos oficiales de ARCA.",
  keywords: [
    "guias monotributo",
    "guias arca",
    "monotributo argentina",
    "recategorizacion monotributo",
    "monotributo 2026",
    "ARCA monotributo",
    "arca afip monotributo",
  ],
  alternates: { canonical: "/guias" },
  openGraph: {
    title: "Guías — Monotributo, ARCA y facturación | GARCA",
    description:
      "Todo lo que un monotributista necesita saber, explicado corto y claro. Con datos oficiales de ARCA y actualizaciones semestrales.",
    url: "/guias",
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: "/og/guias.png",
        width: 1200,
        height: 630,
        alt: "Guías de Monotributo, ARCA y facturación",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/guias.png"],
    title: "Guías — Monotributo, ARCA y facturación | GARCA",
    description: "Índice completo: recategorización, exclusión, comparativas y facturación. Datos oficiales de ARCA.",
  },
};

export default function GuiasPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Guías" },
        ]}
      />

      <ArticleHero
        image="/og/guias.png"
        imageAlt="Índice de guías de Monotributo, ARCA y facturación"
        badgeLabel="Guías"
        badgeIcon={
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        title="Todo lo que un monotributista necesita saber"
        description="Artículos cortos y al grano sobre Monotributo en Argentina, con los datos oficiales de ARCA actualizados dos veces por año (enero y julio)."
        footer={
          <p className="text-xs text-slate-300">
            {GUIDES.length} guías publicadas · Actualizadas el{" "}
            <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
          </p>
        }
      />

      {/* Interactive category filter + guides grid */}
      <GuidesExplorer />

      {/* Interconnect CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-8 mb-12 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Herramientas que complementan las guías
          </h2>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-5 max-w-2xl">
            Lo que leés acá podés ponerlo a prueba con números reales: proyectá tu próxima categoría o consultá
            tus facturas directamente desde ARCA.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/calculadora-monotributo"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all"
            >
              Calculadora de categoría
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/ingresar"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-200 hover:bg-white dark:hover:bg-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
            >
              Consultar mis facturas
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-12">
        <SupportBanner />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={guiasFaqEntries} />
      </section>
    </div>
  );
}
