import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t border-slate-200 dark:border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-none py-8">
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center gap-6">
          {/* Logo and branding */}
          <div className="flex items-center gap-3">
            <img src="/logo-icon.svg" alt="GARCA" className="h-8 w-8" />
            <span className="font-bold text-slate-900 dark:text-white">GARCA</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="/privacidad"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Términos
            </Link>
            <a
              href="https://www.arca.gob.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              ARCA Oficial
            </a>
            <a
              href="https://github.com/FacundoMalgieri/garca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Divider */}
          <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-border to-transparent" />

          {/* Copyright */}
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date().getFullYear()} • No afiliado con ARCA
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desarrollado por{" "}
              <a
                href="https://fmalgieri.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors underline underline-offset-2"
              >
                Facundo Malgieri
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
