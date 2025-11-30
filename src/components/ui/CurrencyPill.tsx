"use client";

import { useEffect, useRef, useState } from "react";

interface CurrencyPillProps {
  currency: string;
  label: string;
  color: "blue" | "green" | "amber" | "red";
  delay?: number;
}

const colorClasses: Record<string, string> = {
  blue: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600",
  green:
    "from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600",
  amber:
    "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600",
  red: "from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:border-red-400 dark:hover:border-red-600",
};

export function CurrencyPill({ currency, label, color, delay = 0 }: CurrencyPillProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${colorClasses[color]} border backdrop-blur-sm transition-all duration-500 cursor-default ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
      } hover:scale-110 hover:shadow-lg`}
    >
      <span className="font-bold">{currency}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}

