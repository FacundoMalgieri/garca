"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { trackUmamiEvent, UMAMI_EVENTS } from "@/lib/analytics/umami";

type Target = "ingresar" | "calculadora" | "facturar";

interface TrackedGuideCtaLinkProps {
  href: string;
  /** Ruta a la que apunta el CTA (intención del usuario). */
  target: Target;
  /** Slug de la guía donde vive el CTA (p. ej. "recategorizacion"). */
  guide: string;
  className?: string;
  children: ReactNode;
}

/**
 * CTA dentro de una guía (/monotributo/*) hacia la app. Dispara un evento Umami
 * por click con `{ guide, target }` para medir qué guía convierte a uso real.
 * Isla cliente: las guías son server components; este componente aporta el onClick.
 */
export function TrackedGuideCtaLink({ href, target, guide, className, children }: TrackedGuideCtaLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackUmamiEvent(UMAMI_EVENTS.GuideCta, { guide, target })}
    >
      {children}
    </Link>
  );
}
