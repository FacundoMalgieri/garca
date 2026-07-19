"use client";

import { formatCurrency } from "@/components/InvoiceTable/utils/formatters";
import { totalImporte } from "@/lib/facturador/validation";
import { cn } from "@/lib/utils";
import type { Plantilla } from "@/types/facturador";

interface TemplateSidebarProps {
  templates: Plantilla[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onManage: () => void;
}

export function TemplateSidebar({ templates, activeId, onSelect, onManage }: TemplateSidebarProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantillas</p>

      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-current={activeId === t.id ? "true" : undefined}
          onClick={() => onSelect(t.id)}
          className={cn(
            "text-left rounded-lg border px-3 py-2 transition-colors cursor-pointer",
            activeId === t.id
              ? "border-primary bg-primary/10"
              : "border-border bg-muted/40 hover:bg-muted"
          )}
        >
          <span className="block text-sm font-medium text-foreground">{t.nombre}</span>
          <span className="block text-xs text-muted-foreground">
            PV {t.puntoDeVenta} · ${formatCurrency(totalImporte(t))}
          </span>
        </button>
      ))}

      <button
        type="button"
        aria-current={activeId === null ? "true" : undefined}
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer",
          activeId === null && "border-primary text-foreground"
        )}
      >
        + Factura en blanco
      </button>

      <button
        type="button"
        onClick={onManage}
        className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        ⚙ Gestionar plantillas
      </button>
    </div>
  );
}
