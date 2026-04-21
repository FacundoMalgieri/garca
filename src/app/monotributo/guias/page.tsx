import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SupportBanner } from "@/components/ui/SupportBanner";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";
import { guiasFaqEntries } from "@/lib/seo/page-schemas";

const dateModified = MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString().split("T")[0];

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export const metadata: Metadata = {
  title: "Guías de Monotributo 2026 — Recategorización, Topes y Facturación | GARCA",
  description:
    "Índice completo de guías sobre Monotributo en Argentina 2026: recategorización, exclusión del régimen, Monotributo vs Responsable Inscripto, servicios vs. venta de bienes y facturación. Datos oficiales de ARCA.",
  keywords: [
    "guias monotributo",
    "monotributo argentina",
    "recategorizacion monotributo",
    "monotributo 2026",
    "ARCA monotributo",
    "arca afip monotributo",
  ],
  alternates: { canonical: "/monotributo/guias" },
  openGraph: {
    title: "Guías de Monotributo 2026 — GARCA",
    description:
      "Todo lo que un monotributista necesita saber, explicado corto y claro. Con datos oficiales de ARCA y actualizaciones semestrales.",
    url: "/monotributo/guias",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guías de Monotributo 2026 — GARCA",
    description: "Índice completo: recategorización, exclusión, comparativas y facturación. Datos oficiales de ARCA.",
  },
};

type Category = "Fundamentos" | "Trámites" | "Comparativas";

type Guide = {
  href: string;
  title: string;
  description: string;
  category: Category;
  readingTime: string;
  accent: {
    border: string;
    bg: string;
    categoryText: string;
    hoverShadow: string;
    ctaText: string;
    chipBg: string;
  };
};

const GUIDES: readonly Guide[] = [
  {
    href: "/monotributo",
    title: "Monotributo 2026: categorías, cuotas y topes",
    description:
      "Punto de partida. Las 11 categorías vigentes de la A a la K con cuotas mensuales, topes de facturación anual y desglose de aportes, al día con los últimos valores de ARCA.",
    category: "Fundamentos",
    readingTime: "6 min de lectura",
    accent: {
      border: "border-blue-200 dark:border-blue-800/40",
      bg: "from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20",
      categoryText: "text-blue-700 dark:text-blue-300",
      hoverShadow: "hover:shadow-blue-500/10",
      ctaText: "text-blue-700 dark:text-blue-300",
      chipBg: "bg-blue-100 dark:bg-blue-900/40",
    },
  },
  {
    href: "/monotributo/recategorizacion",
    title: "Recategorización paso a paso",
    description:
      "Cuándo corresponde, qué mira ARCA al evaluar tu situación y qué pasa si no la hacés. Trámite completo en enero y julio.",
    category: "Trámites",
    readingTime: "5 min de lectura",
    accent: {
      border: "border-indigo-200 dark:border-indigo-800/40",
      bg: "from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/20 dark:to-violet-950/20",
      categoryText: "text-indigo-700 dark:text-indigo-300",
      hoverShadow: "hover:shadow-indigo-500/10",
      ctaText: "text-indigo-700 dark:text-indigo-300",
      chipBg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
  },
  {
    href: "/monotributo/que-pasa-si-me-paso",
    title: "¿Qué pasa si me paso del tope?",
    description:
      "Qué es la recategorización de oficio, cuándo aparece la exclusión del régimen y cómo volver al Monotributo si ya te excluyeron.",
    category: "Trámites",
    readingTime: "6 min de lectura",
    accent: {
      border: "border-amber-200 dark:border-amber-800/40",
      bg: "from-amber-50/70 to-orange-50/70 dark:from-amber-950/20 dark:to-orange-950/20",
      categoryText: "text-amber-700 dark:text-amber-300",
      hoverShadow: "hover:shadow-amber-500/10",
      ctaText: "text-amber-700 dark:text-amber-300",
      chipBg: "bg-amber-100 dark:bg-amber-900/40",
    },
  },
  {
    href: "/monotributo/servicios-vs-bienes",
    title: "Servicios vs. Venta de bienes",
    description:
      "Por qué los monotributistas que venden bienes pueden facturar más que los de servicios, con la tabla oficial 2026 comparada.",
    category: "Comparativas",
    readingTime: "4 min de lectura",
    accent: {
      border: "border-purple-200 dark:border-purple-800/40",
      bg: "from-purple-50/70 to-pink-50/70 dark:from-purple-950/20 dark:to-pink-950/20",
      categoryText: "text-purple-700 dark:text-purple-300",
      hoverShadow: "hover:shadow-purple-500/10",
      ctaText: "text-purple-700 dark:text-purple-300",
      chipBg: "bg-purple-100 dark:bg-purple-900/40",
    },
  },
  {
    href: "/monotributo/vs-responsable-inscripto",
    title: "Monotributo vs. Responsable Inscripto",
    description:
      "Comparativa 2026 entre regímenes: IVA, Ganancias, obligaciones formales y cuándo conviene dar el salto.",
    category: "Comparativas",
    readingTime: "7 min de lectura",
    accent: {
      border: "border-teal-200 dark:border-teal-800/40",
      bg: "from-teal-50/70 to-cyan-50/70 dark:from-teal-950/20 dark:to-cyan-950/20",
      categoryText: "text-teal-700 dark:text-teal-300",
      hoverShadow: "hover:shadow-teal-500/10",
      ctaText: "text-teal-700 dark:text-teal-300",
      chipBg: "bg-teal-100 dark:bg-teal-900/40",
    },
  },
];

const CATEGORIES: { id: Category; label: string; description: string }[] = [
  {
    id: "Fundamentos",
    label: "Fundamentos",
    description: "Lo que todo monotributista tiene que saber sí o sí.",
  },
  {
    id: "Trámites",
    label: "Trámites",
    description: "Cómo hacerlos, cuándo y qué pasa si te olvidás.",
  },
  {
    id: "Comparativas",
    label: "Comparativas",
    description: "Diferencias entre regímenes y tipos de actividad.",
  },
];

export default function GuiasMonotributoPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Monotributo", href: "/monotributo" },
          { label: "Guías" },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-6 md:p-10 mb-10 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold mb-4 shadow-lg shadow-blue-500/25">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Guías de Monotributo
          </span>

          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Todo lo que un monotributista necesita saber
          </h1>
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mb-3 max-w-3xl">
            Artículos cortos y al grano sobre Monotributo en Argentina, con los datos oficiales de ARCA
            actualizados dos veces por año (enero y julio).
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {GUIDES.length} guías publicadas · Actualizadas el{" "}
            <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
          </p>
        </div>
      </section>

      {/* Category legend */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {CATEGORIES.map((cat) => {
          const count = GUIDES.filter((g) => g.category === cat.id).length;
          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-border bg-white dark:bg-muted/40 p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-foreground">{cat.label}</p>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {count} {count === 1 ? "guía" : "guías"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
            </div>
          );
        })}
      </section>

      {/* Guides list grouped by category */}
      {CATEGORIES.map((cat) => {
        const guides = GUIDES.filter((g) => g.category === cat.id);
        if (guides.length === 0) return null;
        return (
          <section key={cat.id} className="mb-12">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{cat.label}</h2>
              <p className="text-xs text-muted-foreground">
                {guides.length} {guides.length === 1 ? "artículo" : "artículos"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
              {guides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className={`group relative overflow-hidden rounded-2xl border ${guide.accent.border} bg-gradient-to-br ${guide.accent.bg} p-5 hover:shadow-lg ${guide.accent.hoverShadow} hover:-translate-y-0.5 transition-all flex flex-col`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${guide.accent.chipBg} ${guide.accent.categoryText}`}
                    >
                      {guide.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{guide.readingTime}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-2 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {guide.description}
                  </p>
                  <p
                    className={`text-xs font-semibold ${guide.accent.ctaText} group-hover:translate-x-0.5 transition-transform`}
                  >
                    Leer guía →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

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

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
        <FaqAccordion items={guiasFaqEntries} />
      </section>

      <SupportBanner />
    </div>
  );
}
