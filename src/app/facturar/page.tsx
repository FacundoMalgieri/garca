"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AnularTab } from "@/components/facturador/AnularTab";
import { EmissionForm } from "@/components/facturador/EmissionForm";
import { EmissionModal } from "@/components/facturador/EmissionModal";
import { EmittedTab } from "@/components/facturador/EmittedTab";
import { TemplateSidebar } from "@/components/facturador/TemplateSidebar";
import { TemplatesManager } from "@/components/facturador/TemplatesManager";
import { Dropdown } from "@/components/ui/Dropdown";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useMonotributo } from "@/hooks/useMonotributo";
import { useTemplates } from "@/hooks/useTemplates";
import { computeAnnualIncome } from "@/lib/facturador/annual-income";
import { buildClientIndex } from "@/lib/facturador/client-index";
import { type ClientMemory, loadClientMemory } from "@/lib/facturador/client-memory";
import { getNextRecategorizacionDates } from "@/lib/projection";
import { cn } from "@/lib/utils";
import type { Plantilla, StoredInvoice } from "@/types/facturador";

export default function FacturarPage() {
  const router = useRouter();
  const { state, manualExchangeRates } = useInvoiceContext();
  const { templates, save, remove } = useTemplates();

  const [tab, setTab] = useState<"emitir" | "emitidas" | "anular">("emitir");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [emitOpen, setEmitOpen] = useState(false);
  const [plantillaAEmitir, setPlantillaAEmitir] = useState<Plantilla | null>(null);
  const [invoiceToVoid, setInvoiceToVoid] = useState<StoredInvoice | null>(null);
  const [ncOpen, setNcOpen] = useState(false);

  const ventana = useMemo(() => getNextRecategorizacionDates()[0].ventana, []);
  const { ingresosAnuales, hasCurrentYearData, droppedForeignCount } = useMemo(
    () => computeAnnualIncome(state.invoices, manualExchangeRates, ventana),
    [state.invoices, manualExchangeRates, ventana]
  );
  const { status } = useMonotributo(hasCurrentYearData ? ingresosAnuales : 0);
  const margenDisponible = status?.margenDisponible ?? null;

  const [clientMemory, setClientMemory] = useState<ClientMemory>({});
  useEffect(() => { setClientMemory(loadClientMemory()); }, [state.invoices]);
  const clientHints = useMemo(
    () => buildClientIndex(state.invoices, clientMemory),
    [state.invoices, clientMemory]
  );

  const initial = activeId ? templates.find((t) => t.id === activeId) ?? null : null;

  if (!state.isHydrated) {
    return <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center p-8 text-center text-muted-foreground">Cargando…</div>;
  }
  if (!state.company) {
    return (
      <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold mb-2">Iniciá sesión para facturar</h1>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">Para emitir necesitás una sesión activa con tu empresa seleccionada.</p>
        <button onClick={() => router.push("/ingresar")} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer">Ir a ingresar</button>
      </div>
    );
  }

  const tabBtn = (id: "emitir" | "emitidas" | "anular", label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={cn("px-4 py-2 rounded-lg text-sm cursor-pointer", tab === id ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:bg-muted/70")}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full min-h-[calc(100svh-4rem)] max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        🏢 Vas a facturar como <b>{state.company.razonSocial}</b>.{" "}
        <span className="text-muted-foreground">¿Otra empresa? Cerrá sesión o usá otra ventana / incógnito para tener otra sesión.</span>
      </div>

      {droppedForeignCount > 0 && (
        <div
          role="status"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300"
        >
          ⚠️ {droppedForeignCount} {droppedForeignCount === 1 ? "comprobante" : "comprobantes"} en moneda extranjera sin cotización — cargá el tipo de cambio para un cálculo correcto.
        </div>
      )}

      <div className="flex gap-2">{tabBtn("emitir", "Emitir")}{tabBtn("emitidas", "Emitidas")}{tabBtn("anular", "Anular")}</div>

      {tab === "emitir" && (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          <div className="hidden md:block">
            <TemplateSidebar templates={templates} activeId={activeId} onSelect={setActiveId} onManage={() => setManagerOpen(true)} />
          </div>
          <div className="md:hidden space-y-2">
            <Dropdown
              options={[{ value: "", label: "Factura en blanco" }, ...templates.map((t) => ({ value: t.id, label: t.nombre }))]}
              value={activeId ?? ""}
              onChange={(v) => setActiveId(v === "" ? null : v)}
              placeholder="Elegí una plantilla"
            />
            <button
              type="button"
              onClick={() => setManagerOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              ⚙ Gestionar plantillas
            </button>
          </div>

          <EmissionForm
            key={activeId ?? "blank"}
            initial={initial}
            puntosDeVenta={state.puntosDeVenta}
            clientHints={clientHints}
            onPreview={(p) => { setPlantillaAEmitir(p); setEmitOpen(true); }}
            onUpdateTemplate={(id, p) => save({ ...p, id })}
            onSaveAsNew={(p) => { const nombre = p.nombre || (p.cliente.razonSocial ? `Factura ${p.cliente.razonSocial}` : (p.cliente.nroDoc ? `Factura ${p.cliente.nroDoc}` : "Nueva plantilla")); save({ ...p, nombre }); }}
          />
        </div>
      )}
      {tab === "emitidas" && <EmittedTab />}
      {tab === "anular" && (
        <AnularTab onVoid={(inv) => { setInvoiceToVoid(inv); setNcOpen(true); }} />
      )}

      <TemplatesManager
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        templates={templates}
        onRename={(id, nombre) => { const t = templates.find((x) => x.id === id); if (t) save({ ...t, nombre }); }}
        onDelete={remove}
      />

      <EmissionModal
        isOpen={emitOpen}
        plantilla={plantillaAEmitir}
        cuit={state.company.cuit}
        companyIndex={state.company.index}
        margenDisponible={margenDisponible}
        onClose={() => setEmitOpen(false)}
      />

      <EmissionModal
        isOpen={ncOpen}
        mode="creditNote"
        invoiceToVoid={invoiceToVoid}
        cuit={state.company.cuit}
        companyIndex={state.company.index}
        margenDisponible={margenDisponible}
        onClose={() => setNcOpen(false)}
      />
    </div>
  );
}
