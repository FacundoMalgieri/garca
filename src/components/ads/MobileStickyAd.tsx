"use client";

import { useState } from "react";

import { AdsterraBanner } from "./AdsterraBanner";

/**
 * Sticky anchor ad for mobile — the 320×50 banner pinned to the bottom of the
 * viewport, where mobile ad viewability is highest (a footer ad in long content
 * is rarely scrolled to). Mobile-only (`md:hidden`) and dismissible.
 *
 * Same isolation guarantees as AdsterraBanner: the ad runs in a cross-origin
 * iframe (ads.garca.app) and cannot read garca.app data. Mount ONLY on content
 * pages — never on /ingresar or /panel.
 */
export function MobileStickyAd() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-center justify-center border-t border-border bg-background py-1.5"
      // Safari: backdrop-filter rompe el render de iframes anidados, y un
      // contenedor sin altura puede medirse en 0 al cargar el ad. Fondo sólido
      // + altura explícita (50 del banner + padding).
      style={{ minHeight: 62 }}
    >
      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="Cerrar anuncio"
        className="absolute -top-6 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <AdsterraBanner format="mobile" hideLabel loading="eager" />
    </div>
  );
}
