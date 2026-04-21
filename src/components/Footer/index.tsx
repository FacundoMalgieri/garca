import Link from "next/link";
import { Fragment } from "react";

type FooterLink = { href: string; label: string; external?: boolean };

const FOOTER_LINKS: Array<FooterLink> = [
  { href: "/calculadora-monotributo", label: "Calculadora" },
  { href: "/monotributo", label: "Monotributo" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
  { href: "https://www.arca.gob.ar", label: "ARCA Oficial", external: true },
  { href: "https://github.com/FacundoMalgieri/garca", label: "GitHub", external: true },
];

function FooterLinkGroup({ links }: { links: Array<FooterLink> }) {
  return (
    <div className="flex items-center gap-x-3">
      {links.map((link, i) => (
        <Fragment key={link.href}>
          {i > 0 && (
            <span aria-hidden className="text-slate-400 dark:text-slate-600 select-none">
              ·
            </span>
          )}
          {link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ) : (
            <Link
              href={link.href}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}

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
          <nav className="flex flex-col items-center justify-center gap-y-2 text-sm md:flex-row">
            <FooterLinkGroup links={FOOTER_LINKS.slice(0, 3)} />
            <span aria-hidden className="hidden md:inline text-slate-400 dark:text-slate-600 select-none mx-3">
              ·
            </span>
            <FooterLinkGroup links={FOOTER_LINKS.slice(3)} />
          </nav>

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
