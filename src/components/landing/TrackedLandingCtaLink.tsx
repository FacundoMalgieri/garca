"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { trackUmamiEvent, UMAMI_EVENTS } from "@/lib/analytics/umami";

type Target = "ingresar" | "calculadora";

interface TrackedLandingCtaLinkProps {
  href: string;
  target: Target;
  className?: string;
  children: ReactNode;
}

/**
 * Hero / landing CTA: fires one Umami event per click (which route the user intent is).
 */
export function TrackedLandingCtaLink({ href, target, className, children }: TrackedLandingCtaLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackUmamiEvent(UMAMI_EVENTS.LandingCta, { target })}
    >
      {children}
    </Link>
  );
}
