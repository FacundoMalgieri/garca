"use client";

import { useRef, useState } from "react";

import { useSectionVisible } from "@/components/landing/hooks/useScrollReveal";
import { homeFaqEntries } from "@/lib/seo/page-schemas";

export function FaqSection() {
  const ref = useRef<HTMLElement>(null);
  const visible = useSectionVisible(ref, 0.15);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section ref={ref} id="faq" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium mb-4">
            Preguntas frecuentes
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">¿Tenés dudas?</h2>
        </div>

        <div className="space-y-4">
          {homeFaqEntries.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <span>{faq.question}</span>
                  <span
                    className="shrink-0 text-slate-400 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
