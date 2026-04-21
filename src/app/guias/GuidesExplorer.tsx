"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CATEGORIES, type Category,GUIDES } from "./guides-data";

/**
 * Client-side explorer for the /guias index.
 *
 * Renders the four category chips as toggleable filters (multi-select) and,
 * underneath, the grouped list of guides. When no filter is active every
 * guide is shown; when one or more are active only those categories render.
 */
export function GuidesExplorer() {
  const [selected, setSelected] = useState<ReadonlySet<Category>>(new Set());

  const toggle = (cat: Category) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const hasSelection = selected.size > 0;

  const visibleCategories = useMemo(
    () => (hasSelection ? CATEGORIES.filter((c) => selected.has(c.id)) : CATEGORIES),
    [selected, hasSelection],
  );

  const visibleCount = useMemo(
    () => (hasSelection ? GUIDES.filter((g) => selected.has(g.category)).length : GUIDES.length),
    [selected, hasSelection],
  );

  return (
    <>
      {/* Filter chips */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        role="group"
        aria-label="Filtrar guías por categoría"
      >
        {CATEGORIES.map((cat) => {
          const count = GUIDES.filter((g) => g.category === cat.id).length;
          const active = selected.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              aria-pressed={active}
              className={[
                "text-left rounded-2xl border p-4 cursor-pointer transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                active
                  ? `${cat.accent.activeBorder} ${cat.accent.activeBg} ring-2 ${cat.accent.activeRing} shadow-sm`
                  : "border-border bg-white dark:bg-muted/40 hover:border-foreground/20 hover:shadow-sm",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  {cat.label}
                  {active && (
                    <svg
                      className="h-3.5 w-3.5 text-foreground/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </p>
                <span
                  className={[
                    "text-xs font-semibold tabular-nums rounded-full px-2 py-0.5 transition-colors",
                    active ? cat.accent.activeCountBg : "text-muted-foreground",
                  ].join(" ")}
                >
                  {count} {count === 1 ? "guía" : "guías"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
            </button>
          );
        })}
      </section>

      {/* Filter status bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 mb-8 text-sm"
        aria-live="polite"
      >
        <p className="text-muted-foreground">
          {hasSelection ? (
            <>
              Mostrando <strong className="text-foreground tabular-nums">{visibleCount}</strong> de{" "}
              <span className="tabular-nums">{GUIDES.length}</span> guías
            </>
          ) : (
            <>
              Tocá una categoría para filtrar. Mostrando{" "}
              <strong className="text-foreground tabular-nums">{GUIDES.length}</strong> guías.
            </>
          )}
        </p>
        {hasSelection && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white dark:bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground hover:border-foreground/30 hover:shadow-sm transition-all cursor-pointer"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Guides list, grouped by category */}
      {visibleCategories.map((cat) => {
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
    </>
  );
}
