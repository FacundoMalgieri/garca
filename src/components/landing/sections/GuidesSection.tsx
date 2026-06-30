"use client";

import Link from "next/link";
import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { ArrowRightIcon } from "@/components/ui/icons";

const MONOTRIBUTO_GUIDES = [
  {
    href: "/monotributo/recategorizacion",
    category: "Trámite",
    title: "Recategorización paso a paso",
    description: "Cuándo corresponde, qué mira ARCA y qué pasa si no la hacés en enero o julio.",
    readingTime: "5 min de lectura",
    accent: "from-indigo-500 to-blue-500",
    accentText: "text-indigo-700 dark:text-indigo-300",
    chip: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-200 ring-indigo-200 dark:ring-indigo-800/60",
  },
  {
    href: "/monotributo/vs-responsable-inscripto",
    category: "Comparativa",
    title: "Monotributo vs Responsable Inscripto",
    description: "IVA, Ganancias, obligaciones formales y cuándo conviene dar el salto de régimen.",
    readingTime: "7 min de lectura",
    accent: "from-teal-500 to-cyan-500",
    accentText: "text-teal-700 dark:text-teal-300",
    chip: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-200 ring-teal-200 dark:ring-teal-800/60",
  },
  {
    href: "/monotributo/que-pasa-si-me-paso",
    category: "Caso límite",
    title: "¿Qué pasa si me paso del tope?",
    description: "Recategorización de oficio, exclusión del régimen y cómo volver si ya te excluyeron.",
    readingTime: "6 min de lectura",
    accent: "from-amber-500 to-orange-500",
    accentText: "text-amber-700 dark:text-amber-300",
    chip: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-200 ring-amber-200 dark:ring-amber-800/60",
  },
];

export function GuidesSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.15);

  return (
    <section ref={ref} id="monotributo-guias" className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-indigo-500/25">
            Guías y recursos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Todo sobre Monotributo 2026
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Artículos para entender el régimen, planificar tu año y resolver las dudas más comunes.
            Datos tomados directo de ARCA y actualizados cada semestre.
          </p>
        </div>

        {/* Guía pilar */}
        <Link
          href="/monotributo"
          className="group relative overflow-hidden block rounded-3xl border border-blue-200 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 p-6 md:p-8 mb-8 hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-0.5 transition-all"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out, box-shadow 300ms ease-out",
          }}
        >
          <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 mb-3">
                Fundamentos
              </span>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                Monotributo 2026: categorías, cuotas y topes
              </h3>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                La referencia completa: las 11 categorías de la A a la K con cuotas mensuales, topes
                anuales y desglose de aportes. Datos oficiales de ARCA.
              </p>
            </div>
            <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-all shrink-0 self-start md:self-center whitespace-nowrap">
              Abrir guía completa
              <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Lecturas cortas */}
        <ol className="flex flex-col gap-3 mb-8">
          {MONOTRIBUTO_GUIDES.map((guide, index) => (
            <li
              key={guide.href}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: `${150 + index * 90}ms`,
              }}
            >
              <Link
                href={guide.href}
                className="group flex items-stretch gap-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 sm:px-6 py-5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.05] transition-colors"
              >
                <div className={`w-1 rounded-full bg-gradient-to-b ${guide.accent}`} aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${guide.chip}`}>
                      {guide.category}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{guide.readingTime}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug">{guide.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{guide.description}</p>
                </div>
                <span className={`self-center text-xs font-semibold ${guide.accentText} inline-flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform`}>
                  Leer
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="text-center">
          <Link
            href="/guias"
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-white/70 dark:bg-white/5 px-6 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105 transition-all"
          >
            Ver todas las guías
            <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
