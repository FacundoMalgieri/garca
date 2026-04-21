import Link from "next/link";

import { CategoriaCard } from "@/components/monotributo/CategoriaCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateModified = MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString().split("T")[0];

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Monotributo", item: `${siteUrl}/monotributo` },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Monotributo 2026 — Categorías, Cuotas y Topes de Facturación",
  description:
    "Guía completa del Monotributo 2026 en Argentina: las 11 categorías de la A a la K, con cuotas mensuales, topes de facturación y desglose de aportes. Datos oficiales de ARCA.",
  author: { "@type": "Person", name: "Facundo Malgieri", url: "https://github.com/FacundoMalgieri" },
  publisher: { "@type": "Organization", name: "GARCA", url: siteUrl },
  datePublished: "2026-01-20",
  dateModified,
  mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/monotributo` },
  inLanguage: "es-AR",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuántas categorías de Monotributo hay en 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En 2026 el Monotributo tiene 11 categorías, de la A a la K. Cada una tiene un tope de facturación anual y una cuota mensual distinta. La categoría más baja es la A y la más alta es la K.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo sé en qué categoría de Monotributo estoy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tu categoría depende de tus ingresos brutos acumulados de los últimos 12 meses. Tenés que comparar ese total con el tope anual de cada categoría y ubicarte en la que te corresponde. En GARCA podés hacerlo automáticamente conectándote a ARCA, o usar la calculadora gratuita.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuándo se actualizan las categorías?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Los topes y cuotas del Monotributo se actualizan dos veces al año, en enero y julio, siguiendo la evolución del índice de inflación. La recategorización del contribuyente también es semestral.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué diferencia hay entre servicios y venta de bienes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Desde la categoría C en adelante, el impuesto integrado es distinto según si prestás servicios o vendés bienes. Quienes venden bienes pagan menos impuesto integrado. Los topes de facturación en cambio son iguales para ambos rubros.",
      },
    },
  ],
};

export default function MonotributoIndexPage() {
  const categorias = MONOTRIBUTO_DATA.categorias;
  const primera = categorias[0];
  const ultima = categorias[categorias.length - 1];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-4"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Monotributo" },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Monotributo 2026 — Categorías, Cuotas y Topes
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-3 max-w-3xl">
          Las <strong className="text-foreground">11 categorías vigentes del Monotributo</strong> en Argentina, de
          la A a la K, con sus cuotas mensuales, topes de facturación anual y desglose de aportes. Datos tomados
          directamente de ARCA (ex-AFIP) y actualizados automáticamente.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          Actualizado el{" "}
          <time dateTime={dateModified}>{dateFormatter.format(new Date(dateModified))}</time>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border border-border bg-primary/5 dark:bg-primary/20 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Categoría más baja</p>
            <p className="text-2xl font-bold text-foreground mt-1">{primera.categoria}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cuota desde {currencyFormatter.format(primera.total.servicios)} / mes
            </p>
          </div>
          <div className="rounded-lg border border-border bg-primary/5 dark:bg-primary/20 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tope máximo anual</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {currencyFormatter.format(ultima.ingresosBrutos)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Categoría {ultima.categoria}</p>
          </div>
          <div className="rounded-lg border border-border bg-primary/5 dark:bg-primary/20 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Recategorización</p>
            <p className="text-2xl font-bold text-foreground mt-1">2 veces / año</p>
            <p className="text-sm text-muted-foreground mt-1">Enero y Julio</p>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Tabla completa de categorías</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {categorias.map((cat) => (
            <CategoriaCard key={cat.categoria} categoria={cat} />
          ))}
        </div>

        <section className="rounded-lg border border-primary/30 dark:border-primary/60 bg-primary/5 dark:bg-primary/20 p-6 mb-10">
          <h2 className="text-xl font-bold text-foreground mb-2">
            ¿Querés saber en qué categoría vas a quedar?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Usá la calculadora gratuita de GARCA. Ingresás tu facturación mes a mes y te proyecta en qué
            categoría vas a caer en tu próxima recategorización. Sin registro, sin datos guardados.
          </p>
          <Link
            href="/calculadora-monotributo"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Abrir calculadora →
          </Link>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
          {faqJsonLd.mainEntity.map((item) => (
            <details key={item.name} className="rounded-lg border border-border bg-white dark:bg-background p-4">
              <summary className="cursor-pointer text-base font-semibold text-foreground">{item.name}</summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.acceptedAnswer.text}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
