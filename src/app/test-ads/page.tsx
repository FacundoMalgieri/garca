// TEMPORARY — página de prueba para validar fill rate de Adsterra bajo iframe
// sandboxed (origen opaco). NO linkeada, NO para producción. Borrar tras probar.
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";

export const metadata = { robots: { index: false, follow: false } };

export default function TestAdsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-12">
      <h1 className="text-2xl font-bold">Test Adsterra (sandboxed)</h1>
      <p className="text-sm text-muted-foreground">
        Si un slot queda vacío, Adsterra no rellenó bajo origen opaco → habría que
        evaluar la Ruta B (subdominio de ads). Dale unos segundos a cada uno.
      </p>

      <section>
        <h2 className="mb-3 font-semibold">Leaderboard 728×90</h2>
        <AdsterraBanner format="leaderboard" />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Rectangle 300×250</h2>
        <AdsterraBanner format="rectangle" />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Mobile 320×50</h2>
        <AdsterraBanner format="mobile" />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Skyscraper 160×600</h2>
        <AdsterraBanner format="skyscraper" />
      </section>
    </div>
  );
}
