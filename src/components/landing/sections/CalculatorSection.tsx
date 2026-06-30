"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { TrackedLandingCtaLink } from "@/components/landing/TrackedLandingCtaLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MONOTRIBUTO_YEAR } from "@/data/monotributo-categorias";

const FEATURES = [
  "Tabla de categorías actualizada",
  "Cuota mensual por actividad",
  "Proyección inteligente",
];

export function CalculatorSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.3);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/30 p-8 md:p-10 overflow-hidden shadow-[0_8px_40px_-8px_rgba(59,130,246,0.25)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" aria-hidden />
          <div className="relative text-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-blue-500/25 transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
            >
              Herramienta gratuita
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Calculadora de Monotributo {MONOTRIBUTO_YEAR}
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Ingresá tu facturación mes a mes y descubrí en qué categoría vas a quedar. Planificá
              cuánto podés facturar para no pasarte.{" "}
              <strong className="text-slate-800 dark:text-slate-200">Sin login, sin registrarte.</strong>
            </p>
            <div
              className="flex items-center justify-center transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transitionDelay: "200ms" }}
            >
              <TrackedLandingCtaLink
                href="/calculadora-monotributo"
                target="calculadora"
                className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">Abrir calculadora</span>
                <ArrowRightIcon className="relative group-hover:translate-x-1 transition-transform duration-300" />
              </TrackedLandingCtaLink>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              {FEATURES.map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
