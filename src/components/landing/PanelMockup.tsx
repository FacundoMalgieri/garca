"use client";

import { useEffect, useState } from "react";

import { MOCK_PANEL } from "@/components/landing/mock-panel-data";

const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/**
 * Mockup estilizado del panel de GARCA para el hero de la landing.
 * No es interactivo: comunica "esto es lo que vas a ver" con datos mock.
 */
export function PanelMockup() {
  const [animated, setAnimated] = useState(false);
  const maxTotal = MOCK_PANEL.acumulado[MOCK_PANEL.acumulado.length - 1].total;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-border bg-white/90 dark:bg-muted/70 backdrop-blur-sm shadow-2xl shadow-primary/10 p-5 md:p-6"
      aria-hidden
    >
      {/* Header empresa */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tecnología Innovadora SRL</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Panel · 2026</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800/60">
          Categoría {MOCK_PANEL.categoria}
        </span>
      </div>

      {/* Barra de progreso de tope */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Tope anual</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {ARS.format(MOCK_PANEL.acumuladoAnual)} / {ARS.format(MOCK_PANEL.topeAnual)}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-[width] duration-1000 ease-out"
            style={{ width: animated ? `${MOCK_PANEL.progresoTope}%` : "0%" }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          {MOCK_PANEL.progresoTope}% del tope · margen para no recategorizar
        </p>
      </div>

      {/* Mini-gráfico de barras del acumulado */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Ingresos acumulados</p>
        {/* Fila de barras con altura fija para que el % de cada barra resuelva */}
        <div className="flex items-end gap-1.5 h-20">
          {MOCK_PANEL.acumulado.map((p, i) => (
            <div
              key={p.mes}
              className="flex-1 rounded-t-md bg-gradient-to-t from-primary/70 to-cyan-400/70 transition-[height] duration-700 ease-out"
              style={{
                height: animated ? `${(p.total / maxTotal) * 100}%` : "0%",
                transitionDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
        {/* Etiquetas de meses, alineadas a las barras */}
        <div className="flex gap-1.5 mt-1">
          {MOCK_PANEL.acumulado.map((p) => (
            <span key={p.mes} className="flex-1 text-center text-[9px] text-slate-400">
              {p.mes}
            </span>
          ))}
        </div>
      </div>

      {/* Filas de comprobantes */}
      <div className="space-y-2">
        {MOCK_PANEL.comprobantes.map((row) => (
          <div
            key={`${row.fecha}-${row.detalle}`}
            className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-mono text-slate-400 shrink-0">{row.fecha}</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{row.detalle}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-semibold text-slate-400">{row.moneda}</span>
              <span className="text-xs font-medium text-slate-900 dark:text-white">{ARS.format(row.monto)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
