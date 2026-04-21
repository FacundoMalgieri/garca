import Link from "next/link";

export type TocItem = {
  id: string;
  label: string;
};

type TableOfContentsProps = {
  items: readonly TocItem[];
  className?: string;
  title?: string;
};

/**
 * Inline table of contents rendered above the article body.
 *
 * - On mobile, collapses into a native `<details>` for UX (tap to expand).
 * - On desktop, renders as a visible nav card.
 * - Uses anchor links (`#id`). Each target `<h2>` must set the matching `id`
 *   and apply `scroll-mt-20` (or similar) so the sticky Navbar doesn't overlap it.
 *
 * Rendering the TOC in the initial HTML also helps Google surface the
 * section anchors as sitelinks under the main search result.
 */
export function TableOfContents({
  items,
  className = "",
  title = "En esta guía",
}: TableOfContentsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={title} className={className}>
      {/* Mobile: collapsible */}
      <details className="md:hidden group rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/40 overflow-hidden shadow-sm">
        <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-slate-900 dark:text-white">
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 text-slate-500 dark:text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h10M4 18h16"
              />
            </svg>
            {title}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ({items.length})
            </span>
          </span>
          <svg
            className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <ol className="list-decimal list-inside px-5 pb-4 pt-1 space-y-2 text-sm text-slate-700 dark:text-slate-300 marker:text-slate-400 dark:marker:text-slate-500">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`#${item.id}`}
                className="text-blue-700 dark:text-blue-300 hover:underline underline-offset-2"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </details>

      {/* Desktop: always visible */}
      <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/40 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
          </svg>
          {title}
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside marker:text-slate-400 dark:marker:text-slate-500">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`#${item.id}`}
                className="text-blue-700 dark:text-blue-300 hover:underline underline-offset-2"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
