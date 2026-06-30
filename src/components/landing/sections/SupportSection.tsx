"use client";

import { useRef } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { GitHubSponsorsIcon, PayPalIcon } from "@/components/ui/icons";

export function SupportSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.3);

  return (
    <section ref={ref} className="relative py-20 md:py-24 overflow-hidden">
      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold mb-4 shadow-lg shadow-amber-500/25">
          Open Source
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">Apoyá el proyecto</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          GARCA es gratis y open source. Si te ahorra tiempo, considerá apoyar el desarrollo.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
        >
          <a
            href="https://github.com/sponsors/FacundoMalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ea4aaa] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#ea4aaa]/20 hover:shadow-2xl hover:shadow-[#ea4aaa]/40 transition-all duration-300 hover:scale-105"
          >
            <GitHubSponsorsIcon className="h-5 w-5" />
            Sponsor
          </a>
          <a
            href="https://paypal.me/facundomalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0070ba] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#0070ba]/20 hover:shadow-2xl hover:shadow-[#0070ba]/40 transition-all duration-300 hover:scale-105"
          >
            <PayPalIcon className="h-5 w-5" />
            PayPal
          </a>
          <a
            href="https://buymeacoffee.com/facundo.malgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-52 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFDD00] px-6 py-4 text-sm font-semibold text-black shadow-xl shadow-[#FFDD00]/20 hover:shadow-2xl hover:shadow-[#FFDD00]/40 transition-all duration-300 hover:scale-105"
          >
            <img src="/icons/bmc-logo.svg" alt="BMC" className="h-5 w-5" />
            Buy me a coffee
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-600 dark:text-slate-400">
          También podés dejar una ⭐ en{" "}
          <a
            href="https://github.com/FacundoMalgieri/garca"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </p>
      </div>
    </section>
  );
}
