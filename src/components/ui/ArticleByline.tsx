import Link from "next/link";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

type ArticleBylineProps = {
  dateModified: string;
  /**
   * Optional reading-time label (e.g. "5 min de lectura"). When present it's
   * appended to the byline as a third segment.
   */
  readingTime?: string;
  /**
   * Visual variant:
   * - `default` (default): muted slate tones that blend with a light/dark page background.
   * - `on-image`: light tones intended for use on top of a dark image hero. Ignores theme.
   */
  variant?: "default" | "on-image";
  className?: string;
};

export function ArticleByline({
  dateModified,
  readingTime,
  variant = "default",
  className = "",
}: ArticleBylineProps) {
  const isOnImage = variant === "on-image";
  const baseTone = isOnImage ? "text-slate-200" : "text-slate-600 dark:text-slate-400";
  const linkTone = isOnImage
    ? "text-white hover:text-cyan-300"
    : "text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400";

  return (
    <p className={`text-xs ${baseTone} ${className}`}>
      Por{" "}
      <Link href="/about" rel="author" className={`font-semibold transition-colors ${linkTone}`}>
        Facundo Malgieri
      </Link>
      {" · "}
      Actualizado el{" "}
      <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>
      {readingTime ? ` · ${readingTime}` : "."}
    </p>
  );
}
