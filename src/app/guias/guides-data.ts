/**
 * Shared data for the /guias route.
 *
 * Lives in a plain TS module (no "use client") so both the server page
 * (for metadata + the hero's guide-count) and the client GuidesExplorer
 * can import it without duplicating or crossing the server/client boundary.
 */

export type Category = "Fundamentos" | "Trámites" | "Comparativas" | "Facturación";

export type Guide = {
  href: string;
  title: string;
  description: string;
  category: Category;
  readingTime: string;
  accent: {
    border: string;
    bg: string;
    categoryText: string;
    hoverShadow: string;
    ctaText: string;
    chipBg: string;
  };
};

/**
 * Category-level accent for the filter chip active state. Inactive state uses
 * neutral `border-border` + muted bg so selections stand out.
 */
export type CategoryAccent = {
  /** Ring + border when the chip is active. */
  activeBorder: string;
  /** Background wash when the chip is active. */
  activeBg: string;
  /** Color of the count pill when the chip is active. */
  activeCountBg: string;
  /** Tailwind ring color utility for the active chip. */
  activeRing: string;
};

export type CategoryDef = {
  id: Category;
  label: string;
  description: string;
  accent: CategoryAccent;
};

export const CATEGORIES: readonly CategoryDef[] = [
  {
    id: "Fundamentos",
    label: "Fundamentos",
    description: "Lo que todo monotributista tiene que saber sí o sí.",
    accent: {
      activeBorder: "border-blue-400 dark:border-blue-500/60",
      activeBg: "bg-blue-50 dark:bg-blue-950/40",
      activeCountBg: "bg-blue-500 text-white",
      activeRing: "ring-blue-400/40 dark:ring-blue-500/30",
    },
  },
  {
    id: "Trámites",
    label: "Trámites",
    description: "Cómo hacerlos, cuándo y qué pasa si te olvidás.",
    accent: {
      activeBorder: "border-amber-400 dark:border-amber-500/60",
      activeBg: "bg-amber-50 dark:bg-amber-950/40",
      activeCountBg: "bg-amber-500 text-white",
      activeRing: "ring-amber-400/40 dark:ring-amber-500/30",
    },
  },
  {
    id: "Facturación",
    label: "Facturación",
    description: "Qué comprobante emitir, cuándo y cómo hacerlo.",
    accent: {
      activeBorder: "border-purple-400 dark:border-purple-500/60",
      activeBg: "bg-purple-50 dark:bg-purple-950/40",
      activeCountBg: "bg-purple-500 text-white",
      activeRing: "ring-purple-400/40 dark:ring-purple-500/30",
    },
  },
  {
    id: "Comparativas",
    label: "Comparativas",
    description: "Diferencias entre regímenes y tipos de actividad.",
    accent: {
      activeBorder: "border-teal-400 dark:border-teal-500/60",
      activeBg: "bg-teal-50 dark:bg-teal-950/40",
      activeCountBg: "bg-teal-500 text-white",
      activeRing: "ring-teal-400/40 dark:ring-teal-500/30",
    },
  },
];

export const GUIDES: readonly Guide[] = [
  {
    href: "/monotributo",
    title: "Monotributo 2026: categorías, cuotas y topes",
    description:
      "Punto de partida. Las 11 categorías vigentes de la A a la K con cuotas mensuales, topes de facturación anual y desglose de aportes, al día con los últimos valores de ARCA.",
    category: "Fundamentos",
    readingTime: "6 min de lectura",
    accent: {
      border: "border-blue-200 dark:border-blue-800/40",
      bg: "from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20",
      categoryText: "text-blue-700 dark:text-blue-300",
      hoverShadow: "hover:shadow-blue-500/10",
      ctaText: "text-blue-700 dark:text-blue-300",
      chipBg: "bg-blue-100 dark:bg-blue-900/40",
    },
  },
  {
    href: "/monotributo/recategorizacion",
    title: "Recategorización paso a paso",
    description:
      "Cuándo corresponde, qué mira ARCA al evaluar tu situación y qué pasa si no la hacés. Trámite completo en enero y julio.",
    category: "Trámites",
    readingTime: "5 min de lectura",
    accent: {
      border: "border-indigo-200 dark:border-indigo-800/40",
      bg: "from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/20 dark:to-violet-950/20",
      categoryText: "text-indigo-700 dark:text-indigo-300",
      hoverShadow: "hover:shadow-indigo-500/10",
      ctaText: "text-indigo-700 dark:text-indigo-300",
      chipBg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
  },
  {
    href: "/monotributo/que-pasa-si-me-paso",
    title: "¿Qué pasa si me paso del tope?",
    description:
      "Qué es la recategorización de oficio, cuándo aparece la exclusión del régimen y cómo volver al Monotributo si ya te excluyeron.",
    category: "Trámites",
    readingTime: "6 min de lectura",
    accent: {
      border: "border-amber-200 dark:border-amber-800/40",
      bg: "from-amber-50/70 to-orange-50/70 dark:from-amber-950/20 dark:to-orange-950/20",
      categoryText: "text-amber-700 dark:text-amber-300",
      hoverShadow: "hover:shadow-amber-500/10",
      ctaText: "text-amber-700 dark:text-amber-300",
      chipBg: "bg-amber-100 dark:bg-amber-900/40",
    },
  },
  {
    href: "/monotributo/servicios-vs-bienes",
    title: "Servicios vs. Venta de bienes",
    description:
      "Por qué los monotributistas que venden bienes pueden facturar más que los de servicios, con la tabla oficial 2026 comparada.",
    category: "Comparativas",
    readingTime: "4 min de lectura",
    accent: {
      border: "border-purple-200 dark:border-purple-800/40",
      bg: "from-purple-50/70 to-pink-50/70 dark:from-purple-950/20 dark:to-pink-950/20",
      categoryText: "text-purple-700 dark:text-purple-300",
      hoverShadow: "hover:shadow-purple-500/10",
      ctaText: "text-purple-700 dark:text-purple-300",
      chipBg: "bg-purple-100 dark:bg-purple-900/40",
    },
  },
  {
    href: "/monotributo/vs-responsable-inscripto",
    title: "Monotributo vs. Responsable Inscripto",
    description:
      "Comparativa 2026 entre regímenes: IVA, Ganancias, obligaciones formales y cuándo conviene dar el salto.",
    category: "Comparativas",
    readingTime: "7 min de lectura",
    accent: {
      border: "border-teal-200 dark:border-teal-800/40",
      bg: "from-teal-50/70 to-cyan-50/70 dark:from-teal-950/20 dark:to-cyan-950/20",
      categoryText: "text-teal-700 dark:text-teal-300",
      hoverShadow: "hover:shadow-teal-500/10",
      ctaText: "text-teal-700 dark:text-teal-300",
      chipBg: "bg-teal-100 dark:bg-teal-900/40",
    },
  },
  {
    href: "/monotributo/2026",
    title: "Monotributo 2026: guía del año",
    description:
      "Novedades del año, actualización semestral de valores, fechas clave y checklist para el monotributista en 2026.",
    category: "Fundamentos",
    readingTime: "5 min de lectura",
    accent: {
      border: "border-violet-200 dark:border-violet-800/40",
      bg: "from-violet-50/70 to-indigo-50/70 dark:from-violet-950/20 dark:to-indigo-950/20",
      categoryText: "text-violet-700 dark:text-violet-300",
      hoverShadow: "hover:shadow-violet-500/10",
      ctaText: "text-violet-700 dark:text-violet-300",
      chipBg: "bg-violet-100 dark:bg-violet-900/40",
    },
  },
  {
    href: "/monotributo/arca-vs-afip",
    title: "ARCA vs AFIP: qué cambió",
    description:
      "AFIP pasó a llamarse ARCA por el Decreto 953/2024. Qué cambió en la práctica y qué sigue exactamente igual para el monotributista.",
    category: "Fundamentos",
    readingTime: "4 min de lectura",
    accent: {
      border: "border-emerald-200 dark:border-emerald-800/40",
      bg: "from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/20 dark:to-teal-950/20",
      categoryText: "text-emerald-700 dark:text-emerald-300",
      hoverShadow: "hover:shadow-emerald-500/10",
      ctaText: "text-emerald-700 dark:text-emerald-300",
      chipBg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
  },
  {
    href: "/monotributo/factura-c",
    title: "Factura C: qué es y cómo emitirla",
    description:
      "Quién emite factura C, datos obligatorios, paso a paso en Comprobantes en Línea de ARCA y diferencias con A y B.",
    category: "Facturación",
    readingTime: "5 min de lectura",
    accent: {
      border: "border-purple-200 dark:border-purple-800/40",
      bg: "from-purple-50/70 to-fuchsia-50/70 dark:from-purple-950/20 dark:to-fuchsia-950/20",
      categoryText: "text-purple-700 dark:text-purple-300",
      hoverShadow: "hover:shadow-purple-500/10",
      ctaText: "text-purple-700 dark:text-purple-300",
      chipBg: "bg-purple-100 dark:bg-purple-900/40",
    },
  },
  {
    href: "/monotributo/factura-e",
    title: "Factura E: exportación de servicios",
    description:
      "Cómo emitir factura E como monotributista: requisitos, paso a paso y cómo impacta en el tope anual la facturación al exterior.",
    category: "Facturación",
    readingTime: "6 min de lectura",
    accent: {
      border: "border-sky-200 dark:border-sky-800/40",
      bg: "from-sky-50/70 to-cyan-50/70 dark:from-sky-950/20 dark:to-cyan-950/20",
      categoryText: "text-sky-700 dark:text-sky-300",
      hoverShadow: "hover:shadow-sky-500/10",
      ctaText: "text-sky-700 dark:text-sky-300",
      chipBg: "bg-sky-100 dark:bg-sky-900/40",
    },
  },
  {
    href: "/monotributo/factura-c-vs-factura-e",
    title: "Factura C vs. Factura E",
    description:
      "Cuándo corresponde cada una: diferencias, ejemplos prácticos (freelance, exportación, venta local) y cómo impactan en el tope.",
    category: "Facturación",
    readingTime: "4 min de lectura",
    accent: {
      border: "border-indigo-200 dark:border-indigo-800/40",
      bg: "from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/20 dark:to-violet-950/20",
      categoryText: "text-indigo-700 dark:text-indigo-300",
      hoverShadow: "hover:shadow-indigo-500/10",
      ctaText: "text-indigo-700 dark:text-indigo-300",
      chipBg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
  },
];
