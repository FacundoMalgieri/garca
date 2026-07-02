import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garca.app";

export const metadata: Metadata = {
  title: "Kit de prensa — GARCA",
  description:
    "Kit de prensa de GARCA: qué es, audiencia, temas que cubrimos, recursos de marca y contacto. Para medios, marcas y programas de afiliados.",
  alternates: { canonical: `${siteUrl}/prensa` },
  openGraph: {
    title: "Kit de prensa — GARCA",
    description:
      "Qué es GARCA, su audiencia, temas de cobertura, marca y contacto. Para medios, marcas y programas de afiliados.",
    type: "website",
    url: `${siteUrl}/prensa`,
    siteName: "GARCA",
  },
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-muted/40 p-5">
      <p className="text-2xl md:text-3xl font-bold text-primary dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function PrensaPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Image src="/logo-icon.svg" alt="GARCA" width={40} height={40} className="h-10 w-10" />
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f7d8c] dark:text-[#64D3DE]">
          Kit de prensa
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">GARCA en resumen</h1>
      <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-2xl">
        Todo lo que un medio, una marca o un programa de afiliados necesita para entender GARCA y su
        audiencia. Datos a 2026 — escribinos para cifras actualizadas.
      </p>

      <Section title="Qué es GARCA">
        <p className="text-base text-foreground leading-relaxed">
          <strong>GARCA</strong> (
          <Link href="/" className="text-primary hover:underline dark:text-[#64D3DE]">
            garca.app
          </Link>
          ) es una web app gratuita y open source para monotributistas y freelancers argentinos:
          consulta de comprobantes de ARCA (ex AFIP), cálculo de categoría de Monotributo y un hub de
          guías sobre facturación, recategorización y cobro del exterior. Todo el procesamiento es{" "}
          <strong>100% en el navegador</strong> (credenciales cifradas AES-256, sin base de datos).
        </p>
      </Section>

      <Section title="Audiencia">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Stat value="~620/mes" label="Visitas mensuales" />
          <Stat value="98%" label="Tráfico orgánico (SEO)" />
          <Stat value="73%" label="Argentina" />
          <Stat value="Nicho" label="Monotributistas y freelancers" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Audiencia con alta intención comercial en pagos internacionales, cobro en USD, facturación y
          software financiero. Perfil: trabajadores independientes y pymes de LATAM.
        </p>
      </Section>

      <Section title="Temas que cubrimos">
        <ul className="list-disc list-inside space-y-1.5 text-base text-foreground marker:text-primary">
          <li>Monotributo: categorías, cuotas, topes y recategorización.</li>
          <li>Facturación electrónica en ARCA (Factura C, Factura E).</li>
          <li>Cobro del exterior: Wise, Payoneer, Deel, cuentas en USD.</li>
          <li>Régimen fiscal para freelancers y comparativas de regímenes.</li>
        </ul>
      </Section>

      <Section title="Marca">
        <p className="text-base text-foreground leading-relaxed mb-3">
          Colores: navy <code className="text-sm">#262F55</code>, cyan{" "}
          <code className="text-sm">#64D3DE</code>, coral <code className="text-sm">#FF6B5C</code>.
          Recursos:
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/logo-icon.svg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white dark:bg-muted/40 px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
          >
            Logo (isotipo) SVG
          </a>
          <a
            href="/logo-full.svg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white dark:bg-muted/40 px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
          >
            Logo completo SVG
          </a>
        </div>
      </Section>

      <Section title="Contacto">
        <p className="text-base text-foreground leading-relaxed">
          Consultas de prensa, marcas y afiliados:{" "}
          <a
            href="https://www.linkedin.com/in/facundo-malgieri/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline dark:text-[#64D3DE]"
          >
            LinkedIn
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/FacundoMalgieri/garca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline dark:text-[#64D3DE]"
          >
            GitHub
          </a>
        </p>
      </Section>
    </div>
  );
}
