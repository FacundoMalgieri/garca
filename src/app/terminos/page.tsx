import Link from "next/link";

import { TermsContent } from "@/components/TermsContent";

export default function TerminosPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Términos y Condiciones de Uso</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: Abril 2026</p>

      <TermsContent />

      <div className="pt-8 mt-8 border-t border-border">
        <Link href="/" className="text-primary dark:text-primary-foreground hover:underline text-sm">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
