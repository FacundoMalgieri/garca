import Link from "next/link";

import { type Guide,GUIDES } from "@/app/guias/guides-data";

type RelatedGuidesProps = {
  currentHref: string;
  title?: string;
  subtitle?: string;
  /** Max number of guides to show. Defaults to 3. */
  limit?: number;
  className?: string;
};

/**
 * Picks `limit` guides related to the current one:
 *   1. Prioritizes guides in the same category (excluding the current).
 *   2. If the category doesn't have enough, fills with other categories.
 *
 * Rendered at the bottom of each guide to distribute link juice and keep
 * readers inside the content hub.
 */
export function RelatedGuides({
  currentHref,
  title = "Seguí leyendo",
  subtitle = "Otras guías que te pueden servir",
  limit = 3,
  className = "",
}: RelatedGuidesProps) {
  const current = GUIDES.find((g) => g.href === currentHref);
  const others = GUIDES.filter((g) => g.href !== currentHref);

  const sameCategory = current
    ? others.filter((g) => g.category === current.category)
    : [];
  const rest = others.filter((g) => !sameCategory.includes(g));

  const picked: Guide[] = [...sameCategory, ...rest].slice(0, limit);

  if (picked.length === 0) return null;

  return (
    <section aria-labelledby="related-guides-heading" className={className}>
      <header className="mb-6">
        <h2
          id="related-guides-heading"
          className="text-2xl md:text-3xl font-bold text-foreground"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {picked.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className={`group relative overflow-hidden rounded-2xl border ${guide.accent.border} bg-gradient-to-br ${guide.accent.bg} p-5 transition-all hover:shadow-lg ${guide.accent.hoverShadow} hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <span
                className={`inline-flex items-center rounded-md ${guide.accent.chipBg} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${guide.accent.categoryText}`}
              >
                {guide.category}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {guide.readingTime}
              </span>
            </div>
            <p className="font-bold text-foreground leading-snug group-hover:underline underline-offset-2">
              {guide.title}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              {guide.description}
            </p>
            <p
              className={`mt-4 text-xs font-semibold ${guide.accent.ctaText} inline-flex items-center gap-1 group-hover:gap-2 transition-all`}
            >
              Leer guía
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
