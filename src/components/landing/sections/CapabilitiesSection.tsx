"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { SparklesIcon } from "@/components/ui/icons";
import {
  CalculatorIcon,
  ChartIcon,
  ClipboardIcon,
  DocumentIcon,
  DownloadIcon,
  TrendingIcon,
} from "@/components/ui/landing-icons";

const CAPABILITIES = [
  {
    icon: <DocumentIcon />,
    title: "Recuperación automática",
    body: "Traé todas tus facturas de ARCA, con tipo de cambio incluido en la exportación.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <ChartIcon />,
    title: "Análisis visual",
    body: "Gráficos de ingresos, progreso de Monotributo y distribución por moneda.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: <ClipboardIcon />,
    title: "Tu categoría, al instante",
    body: "Sabé en qué categoría estás y cuánto te falta para la siguiente.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: <CalculatorIcon />,
    title: "Proyección inteligente",
    body: "Calculá cuánto podés facturar para mantenerte en tu categoría objetivo.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: <TrendingIcon />,
    title: "Multi-moneda",
    body: "ARS, USD, EUR y más, con conversión ponderada a pesos.",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: <DownloadIcon />,
    title: "Exportación completa",
    body: "PDF profesional para tu contador, CSV para Excel o JSON.",
    gradient: "from-sky-500 to-indigo-500",
  },
];

const CURRENCIES = ["ARS", "USD", "EUR", "JPY", "BRL"];

export function CapabilitiesSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.15);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-blue-500/25">
            <SparklesIcon />
            Qué hace GARCA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-balance mb-4">
            De comprobantes dispersos a una foto clara
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Todo lo que necesitás para entender tu facturación y planificar tu año de Monotributo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CAPABILITIES.map((c, i) => (
            <div
              key={c.title}
              className="group rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-muted/60 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transitionDelay: `${i * 70}ms`,
              }}
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {c.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{c.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Chips de monedas (absorbe la sección multi-moneda) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Soporta:</span>
          {CURRENCIES.map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-full border border-slate-200 dark:border-border bg-white/70 dark:bg-white/5 px-4 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              {c}
            </span>
          ))}
          <span className="text-sm text-slate-500 dark:text-slate-400">y más…</span>
        </div>
      </div>
    </section>
  );
}
