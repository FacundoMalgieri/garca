"use client";

import { useEffect, useRef, useState } from "react";

import type { FaqEntry } from "@/lib/seo/page-schemas";

type FaqAccordionProps = {
  items: readonly FaqEntry[];
  /**
   * Animate the entrance with a staggered fade/translate once the list
   * scrolls into view (matches the homepage FAQ behavior). Defaults to true.
   */
  animateOnScroll?: boolean;
  className?: string;
};

export function FaqAccordion({
  items,
  animateOnScroll = true,
  className = "",
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(!animateOnScroll);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animateOnScroll) {
      setIsVisible(true);
      return;
    }
    const node = rootRef.current;
    if (!node || typeof window === "undefined") return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [animateOnScroll]);

  return (
    <div ref={rootRef} className={`space-y-4 ${className}`}>
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
            className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.98)",
              transitionProperty: "opacity, transform, box-shadow, border-color",
              transitionDuration: "500ms",
              transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.3, 1)",
              transitionDelay: isVisible ? `${index * 75}ms` : "0ms",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
            >
              <span>{faq.question}</span>
              <span
                className="shrink-0 text-slate-400 transition-transform duration-300"
                style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                aria-hidden
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
              }}
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
  );
}
