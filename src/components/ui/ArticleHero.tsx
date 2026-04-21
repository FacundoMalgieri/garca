import Image from "next/image";
import type { ReactNode } from "react";

import { ArticleByline } from "./ArticleByline";

type ArticleHeroProps = {
  /** Path to the hero/OG image under /public (e.g. "/og/factura-c.png"). */
  image: string;
  /** Alt text for the hero image. */
  imageAlt: string;
  /** Badge label shown inside the pill above the title. */
  badgeLabel: string;
  /** Optional SVG/icon rendered before the badge label. */
  badgeIcon?: ReactNode;
  /** Hero H1 title. */
  title: ReactNode;
  /** Hero description paragraph. Accepts inline elements like <strong> or <Link>. */
  description: ReactNode;
  /**
   * When both are provided, renders an `<ArticleByline variant="on-image" />` at the bottom
   * of the hero. For pages that don't have an author byline (e.g. index pages), use `footer`
   * instead.
   */
  dateModified?: string;
  readingTime?: string;
  /** Custom footer node (takes precedence over byline). */
  footer?: ReactNode;
};

/**
 * Shared hero banner for article and index pages. Uses a dark navy base with the provided
 * image. On desktop the image fills the full hero and the content overlays the left half
 * with a horizontal gradient. On mobile the image renders as a strip above a solid-navy
 * content block, which keeps the illustration visible on narrow viewports instead of being
 * washed out by a horizontal overlay.
 */
export function ArticleHero({
  image,
  imageAlt,
  badgeLabel,
  badgeIcon,
  title,
  description,
  dateModified,
  readingTime,
  footer,
}: ArticleHeroProps) {
  const byline =
    footer ??
    (dateModified && readingTime ? (
      <ArticleByline dateModified={dateModified} readingTime={readingTime} variant="on-image" />
    ) : null);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 mb-10 shadow-[0_8px_40px_-8px_rgba(38,47,85,0.35)] dark:shadow-none bg-[#0a0f24] md:min-h-[380px]">
      {/* Image wrapper — strip above content on mobile, absolute fill on desktop */}
      <div className="relative h-44 sm:h-56 md:absolute md:inset-0 md:h-full">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 896px, 100vw"
          className="object-cover object-center md:object-right opacity-90 md:opacity-80"
        />
        {/* Desktop overlay: horizontal gradient so content on the left stays legible */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#0a0f24] via-[#0a0f24]/85 to-[#0a0f24]/25" />
        {/* Mobile overlay: longer, softer fade into the solid content block below */}
        <div className="md:hidden absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-[#0a0f24]/60 to-[#0a0f24]" />
      </div>

      {/* Content */}
      <div className="relative p-6 md:p-10 md:absolute md:inset-0 flex flex-col justify-center md:max-w-2xl">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold mb-4 w-fit border border-white/15">
          {badgeIcon}
          {badgeLabel}
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-sm">{title}</h1>
        <p className="text-base md:text-lg text-slate-200 mb-4 max-w-xl">{description}</p>
        {byline}
      </div>
    </section>
  );
}
