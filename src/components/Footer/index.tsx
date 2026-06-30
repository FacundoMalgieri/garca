import Link from "next/link";
import { Fragment } from "react";

type FooterLink = { href: string; label: string; external?: boolean };

const FOOTER_LINKS: Array<FooterLink> = [
  { href: "/calculadora-monotributo", label: "Calculadora" },
  { href: "/monotributo", label: "Monotributo" },
  { href: "/about", label: "Autor" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
  { href: "https://www.arca.gob.ar", label: "ARCA", external: true },
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
    <footer className="relative overflow-hidden bg-background border-t border-slate-200 dark:border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-none py-8">
      {/* Atmósfera de marca (misma del hero, sin grilla) anclada abajo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-50/80 via-transparent to-transparent dark:from-[#1b2347] dark:via-[#111]/0 dark:to-transparent" />
        <div className="absolute -left-40 bottom-[-16rem] h-[40rem] w-[40rem] rounded-full bg-[#64D3DE]/15 blur-[150px] dark:bg-[#2E3A66]/70" />
        <div className="absolute -right-24 bottom-[-18rem] h-[40rem] w-[40rem] rounded-full bg-[#64D3DE]/25 blur-[140px] dark:bg-[#64D3DE]/20" />
        <div className="absolute left-1/3 top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[#FF6B5C]/12 blur-[150px] dark:bg-[#FF6B5C]/10" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
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
