import Link from "next/link";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

type ArticleBylineProps = {
  dateModified: string;
  className?: string;
};

export function ArticleByline({ dateModified, className = "" }: ArticleBylineProps) {
  return (
    <p className={`text-xs text-slate-600 dark:text-slate-400 ${className}`}>
      Por{" "}
      <Link
        href="/about"
        rel="author"
        className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Facundo Malgieri
      </Link>
      {" · "}
      Actualizado el{" "}
      <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
    </p>
  );
}
