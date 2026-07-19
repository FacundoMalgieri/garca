"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { formatCurrency } from "@/components/InvoiceTable/utils/formatters";
import { Dropdown } from "@/components/ui/Dropdown";
import { type ClientIndex,resolveClient } from "@/lib/facturador/client-index";
import { COND_IVA_RECEPTOR } from "@/lib/facturador/codes";
import { defaultVtoPago,previousMonthPeriod } from "@/lib/facturador/dates";
import {
  CONCEPTO_OPTIONS, COND_IVA_OPTIONS, FORMA_PAGO_OPTIONS, TIPO_DOC_OPTIONS,
UNIDAD_OPTIONS, } from "@/lib/facturador/select-options";
import { totalImporte, validateEmissionInput } from "@/lib/facturador/validation";
import type { PuntoDeVenta } from "@/types/afip-scraper";
import type { Concepto, LineaFactura, Plantilla } from "@/types/facturador";

// Tipos de documento del receptor (RCEL): 80 = CUIT, 96 = DNI.
// Para un Consumidor Final sin identificar, RCEL factura con tipo doc DNI (96) y
// número vacío — el código 99 NO figura en #idtipodocreceptor cuando la condición
// IVA es Consumidor Final (verificado: selectOption a 99 tira timeout).
const TIPO_DOC_CUIT = "80";
const TIPO_DOC_DNI = "96";

// Universo (tipo de comprobante) de Factura C en RCEL. La tab "Emitir" siempre emite Factura C.
const UNIVERSO_FACTURA_C = "2";

/** ¿Este punto de venta puede emitir Factura C? */
function pvSupportsFacturaC(p: PuntoDeVenta): boolean {
  return p.tipos.some((t) => t.value === UNIVERSO_FACTURA_C);
}

/**
 * Parsea el value de un <input type="number">. Vacío → 0 (el display de precio lo
 * muestra vacío al ser 0). Basura o paste no-numérico → null: el caller ignora el
 * cambio en vez de escribir NaN en el estado, que renderizaría "$NaN" en el CTA.
 */
function parseNumericInput(raw: string): number | null {
  if (raw.trim() === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Etiqueta corta que le dice al usuario qué emite el PV (C vs E). */
function pvSummary(p: PuntoDeVenta): string {
  const numero = /(\d{4,5})/.exec(p.label)?.[1] ?? p.value;
  const kind = pvSupportsFacturaC(p)
    ? "Factura C"
    : p.tipos.some((t) => /exportaci[oó]n/i.test(t.label))
      ? "Factura E (exportación)"
      : (p.tipos[0]?.label ?? "sin comprobantes");
  return `${numero} · ${kind}`;
}

interface EmissionFormProps {
  initial: Plantilla | null;
  onPreview: (plantilla: Plantilla) => void;
  onUpdateTemplate: (id: string, plantilla: Plantilla) => void;
  onSaveAsNew: (plantilla: Omit<Plantilla, "id">) => void;
  /** Puntos de venta scrapeados (best-effort). Si viene null/vacío, se usa input de texto. */
  puntosDeVenta?: PuntoDeVenta[] | null;
  /** Índice de clientes conocidos (historial + memoria) para autocompletar por documento. */
  clientHints?: ClientIndex;
}

function blankForm(): Plantilla {
  return {
    id: "", nombre: "", puntoDeVenta: "1", concepto: "servicios",
    cliente: { condicionIVA: "1", tipoDoc: "80", nroDoc: "", condicionVenta: ["6"] },
    periodo: {},
    lineas: [{ descripcion: "", cantidad: 1, unidad: "7", precioUnitario: 0 }],
  };
}

function stripId(p: Plantilla): Omit<Plantilla, "id"> {
  const { id: _id, ...rest } = p;
  void _id;
  return rest;
}

export function EmissionForm({ initial, onPreview, onUpdateTemplate, onSaveAsNew, puntosDeVenta, clientHints }: EmissionFormProps) {
  const [form, setForm] = useState<Plantilla>(initial ?? blankForm());
  const [lineKeys, setLineKeys] = useState<number[]>(() => (initial ?? blankForm()).lineas.map((_, i) => i));
  const nextKey = useRef((initial ?? blankForm()).lineas.length);
  // Doc sobre el que ya aplicamos un hint (prefill de condicionIVA/condicionVenta/razonSocial).
  // Evita re-clobberear un override manual del usuario cuando re-tipea el mismo doc.
  const lastPrefilledDoc = useRef<string | null>(null);

  useEffect(() => {
    const base = initial ?? blankForm();
    setForm(base);
    setLineKeys(base.lineas.map((_, i) => i));
    nextKey.current = base.lineas.length;
  }, [initial?.id]); // only re-run when the selected template changes

  const hint = clientHints ? resolveClient(clientHints, form.cliente.nroDoc) : null;
  const resolvedName = form.cliente.razonSocial || hint?.razonSocial || "";

  const total = useMemo(() => totalImporte(form), [form]);
  const validation = useMemo(() => validateEmissionInput(form, new Date()), [form]);
  const showPeriodo = form.concepto === "servicios" || form.concepto === "ambos";

  // Si el usuario eligió manualmente un PV que no puede emitir Factura C (ej. uno
  // de exportación), no lo dejamos emitir: RCEL se cuelga ~60s en ese caso. Solo
  // aplica cuando conocemos el universo del PV (viene de los scrapeados).
  const selectedPv = puntosDeVenta?.find((p) => p.value === form.puntoDeVenta) ?? null;
  const pvUnsupported = selectedPv !== null && !pvSupportsFacturaC(selectedPv);

  const dirty = initial !== null && JSON.stringify(stripId(form)) !== JSON.stringify(stripId(initial));
  const blankHasData = initial === null && validation.ok;
  // ¿El usuario ya empezó a cargar datos? Para no mostrar los errores de validación
  // sobre un formulario pristino (recién abierto), solo los mostramos cuando hay algo cargado.
  const hasData =
    total > 0 ||
    form.lineas.some((l) => l.descripcion.trim() !== "") ||
    form.cliente.nroDoc.trim() !== "" ||
    false;

  const set = (patch: Partial<Plantilla>) => setForm((f) => ({ ...f, ...patch }));
  const setCliente = (patch: Partial<Plantilla["cliente"]>) => setForm((f) => ({ ...f, cliente: { ...f.cliente, ...patch } }));
  // Al elegir Consumidor Final, RCEL factura "sin identificar": autoseleccionamos
  // tipo doc DNI (96) y limpiamos el número (si no, el botón queda deshabilitado por
  // "CUIT inválido" sin explicar por qué). Al salir de CF con tipo DNI, volvemos a CUIT.
  const setCondicionIVA = (condicionIVA: string) =>
    setForm((f) => {
      const cliente = { ...f.cliente, condicionIVA };
      if (condicionIVA === COND_IVA_RECEPTOR.consumidorFinal) {
        cliente.tipoDoc = TIPO_DOC_DNI;
        cliente.nroDoc = "";
      } else if (f.cliente.tipoDoc === TIPO_DOC_DNI && !f.cliente.nroDoc.trim()) {
        cliente.tipoDoc = TIPO_DOC_CUIT;
      }
      return { ...f, cliente };
    });
  const setNroDoc = (nroDoc: string) =>
    setForm((f) => {
      const h = clientHints ? resolveClient(clientHints, nroDoc) : null;
      const cliente = { ...f.cliente, nroDoc };
      // Solo prefillear cuando el doc recién resuelve a un hint que no aplicamos
      // todavía en esta instancia del form. Si no, re-tipear el mismo doc después
      // de que el usuario pisó manualmente condicionIVA/condicionVenta lo clobberea.
      if (h && nroDoc !== lastPrefilledDoc.current) {
        if (h.razonSocial !== undefined) cliente.razonSocial = h.razonSocial;
        if (h.condicionIVA !== undefined) cliente.condicionIVA = h.condicionIVA;
        if (h.condicionVenta !== undefined) cliente.condicionVenta = h.condicionVenta;
        lastPrefilledDoc.current = nroDoc;
      }
      return { ...f, cliente };
    });
  const setPeriodo = (patch: Partial<NonNullable<Plantilla["periodo"]>>) => setForm((f) => ({ ...f, periodo: { ...(f.periodo ?? {}), ...patch } }));
  const setLinea = (i: number, patch: Partial<LineaFactura>) =>
    setForm((f) => ({ ...f, lineas: f.lineas.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) }));
  const addLinea = () => {
    const key = nextKey.current++;
    setForm((f) => ({ ...f, lineas: [...f.lineas, { descripcion: "", cantidad: 1, unidad: "7", precioUnitario: 0 }] }));
    setLineKeys((ks) => [...ks, key]);
  };
  const removeLinea = (i: number) => {
    setForm((f) => ({ ...f, lineas: f.lineas.filter((_, idx) => idx !== i) }));
    setLineKeys((ks) => ks.filter((_, idx) => idx !== i));
  };

  const applyMesAnterior = () => {
    const { desde, hasta } = previousMonthPeriod(new Date());
    setPeriodo({ desde, hasta, vtoPago: form.periodo?.vtoPago ?? defaultVtoPago(new Date()) });
  };

  // Cuando llegan los PV scrapeados, si el PV actual no puede emitir Factura C
  // (ej. el default "1" hardcodeado, que en algunas cuentas es de exportación),
  // elegimos automáticamente el primero que sí pueda. Evita el cuelgue de 60s.
  useEffect(() => {
    if (!puntosDeVenta || puntosDeVenta.length === 0) return;
    const current = puntosDeVenta.find((p) => p.value === form.puntoDeVenta);
    if (current && pvSupportsFacturaC(current)) return;
    const target = puntosDeVenta.find(pvSupportsFacturaC) ?? puntosDeVenta[0];
    if (target && target.value !== form.puntoDeVenta) set({ puntoDeVenta: target.value });
  }, [puntosDeVenta]);

  const labelCls = "block text-xs text-muted-foreground mb-1";
  // Inputs blancos en light (como el Dropdown) para que resalten sobre las cards
  // grises; en dark siguen usando el fondo del tema.
  const inputCls = "w-full rounded-md border border-border bg-white dark:bg-background px-3 py-2 text-sm";
  // Cards con más presencia en light (muted más sólido + sombra sutil) para
  // separarlas del fondo de la página, que es casi del mismo gris.
  const sectionCls = "rounded-lg border border-border bg-muted/60 dark:bg-muted/30 p-3 shadow-sm dark:shadow-none";
  const sectionTitleCls = "text-xs uppercase tracking-wide text-primary dark:text-primary-foreground mb-2";

  return (
    <div className="space-y-3">
      {(dirty || blankHasData) && (
        <div data-testid="dirty-bar" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          <span>{dirty ? `Editaste "${initial?.nombre}" — hay cambios sin guardar` : "Podés guardar estos datos como plantilla"}</span>
          <span className="flex gap-2">
            {dirty && (
              <button type="button" onClick={() => onUpdateTemplate((initial as Plantilla).id, form)} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted cursor-pointer">Actualizar plantilla</button>
            )}
            <button type="button" onClick={() => onSaveAsNew(stripId(form))} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted cursor-pointer">
              {dirty ? "Guardar como nueva" : "Guardar como plantilla"}
            </button>
          </span>
        </div>
      )}

      <div className={sectionCls}>
        <p className={sectionTitleCls}>Comprobante</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Punto de venta</label>
            {puntosDeVenta && puntosDeVenta.length > 0 ? (
              <Dropdown
                options={puntosDeVenta.map((p) => ({ value: p.value, label: pvSummary(p) }))}
                value={form.puntoDeVenta}
                onChange={(v) => set({ puntoDeVenta: v })}
              />
            ) : (
              <input data-testid="punto-venta" className={inputCls} value={form.puntoDeVenta} onChange={(e) => set({ puntoDeVenta: e.target.value })} />
            )}
          </div>
          <div>
            <label className={labelCls}>Concepto</label>
            <Dropdown options={CONCEPTO_OPTIONS} value={form.concepto} onChange={(v) => set({ concepto: v as Concepto })} />
          </div>
          <div>
            <label className={labelCls}>Actividad (opcional)</label>
            <input data-testid="actividad" className={inputCls} value={form.actividad ?? ""} onChange={(e) => set({ actividad: e.target.value })} />
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <p className={sectionTitleCls}>Cliente / Receptor</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Condición IVA</label>
            <Dropdown options={COND_IVA_OPTIONS} value={form.cliente.condicionIVA} onChange={setCondicionIVA} />
          </div>
          <div>
            <label className={labelCls}>Tipo doc</label>
            <Dropdown options={TIPO_DOC_OPTIONS} value={form.cliente.tipoDoc} onChange={(v) => setCliente({ tipoDoc: v })} />
          </div>
          <div>
            <label className={labelCls}>Nro documento</label>
            <input data-testid="nro-doc" className={inputCls} value={form.cliente.nroDoc} onChange={(e) => setNroDoc(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Cliente</label>
            <p data-testid="cliente-resuelto" className="text-sm px-3 py-2 rounded-md bg-muted/40 text-muted-foreground">
              {resolvedName ? `AFIP: ${resolvedName}` : "AFIP completa la razón social al emitir"}
            </p>
          </div>
          <div>
            <label className={labelCls}>Condición de venta</label>
            <Dropdown options={FORMA_PAGO_OPTIONS} value={form.cliente.condicionVenta[0] ?? "6"} onChange={(v) => setCliente({ condicionVenta: [v] })} />
          </div>
        </div>
      </div>

      {showPeriodo && (
        <div className={sectionCls}>
          <div className="flex items-center justify-between">
            <p className={sectionTitleCls}>Período de servicio</p>
            <button type="button" onClick={applyMesAnterior} className="text-xs text-primary dark:text-primary-foreground hover:underline cursor-pointer">mes anterior</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Desde</label>
              <input data-testid="periodo-desde" className={inputCls} value={form.periodo?.desde ?? ""} onChange={(e) => setPeriodo({ desde: e.target.value })} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <label className={labelCls}>Hasta</label>
              <input data-testid="periodo-hasta" className={inputCls} value={form.periodo?.hasta ?? ""} onChange={(e) => setPeriodo({ hasta: e.target.value })} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <label className={labelCls}>Vto. pago</label>
              <input data-testid="periodo-vto" className={inputCls} value={form.periodo?.vtoPago ?? ""} onChange={(e) => setPeriodo({ vtoPago: e.target.value })} placeholder="DD/MM/AAAA" />
            </div>
          </div>
        </div>
      )}

      <div className={sectionCls}>
        <p className={sectionTitleCls}>Detalle</p>
        <div className="space-y-2">
          {form.lineas.map((l, i) => (
            <div key={lineKeys[i]} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-12 sm:col-span-5">
                <label className={labelCls}>Descripción</label>
                <input data-testid={`linea-desc-${i}`} className={inputCls} value={l.descripcion} onChange={(e) => setLinea(i, { descripcion: e.target.value })} />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className={labelCls}>Cant.</label>
                <input data-testid={`linea-cant-${i}`} type="number" inputMode="decimal" min="0" className={inputCls} value={l.cantidad} onChange={(e) => { const n = parseNumericInput(e.target.value); if (n !== null) setLinea(i, { cantidad: n }); }} />
              </div>
              <div className="col-span-5 sm:col-span-2">
                <label className={labelCls}>Unidad</label>
                <Dropdown options={UNIDAD_OPTIONS} value={l.unidad} onChange={(v) => setLinea(i, { unidad: v })} />
              </div>
              <div className="col-span-3 sm:col-span-3">
                <label className={labelCls}>P. unitario</label>
                <input data-testid={`linea-precio-${i}`} type="number" inputMode="decimal" min="0" step="0.01" className={inputCls} value={l.precioUnitario === 0 ? "" : l.precioUnitario} onChange={(e) => { const n = parseNumericInput(e.target.value); if (n !== null) setLinea(i, { precioUnitario: n }); }} />
              </div>
              <div className="col-span-1">
                <button type="button" data-testid={`linea-remove-${i}`} onClick={() => removeLinea(i)} disabled={form.lineas.length === 1} className="rounded-md border border-border px-2 py-2 text-xs hover:bg-muted disabled:opacity-40 cursor-pointer" aria-label="Quitar línea">✕</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLinea} className="mt-2 text-sm text-primary dark:text-primary-foreground hover:underline cursor-pointer">+ Agregar línea</button>
      </div>

      {!validation.ok && hasData && (
        <div data-testid="validation-errors" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          <p className="font-medium mb-1">Para poder emitir, revisá:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {validation.errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      {pvUnsupported && (
        <div data-testid="pv-unsupported" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          El punto de venta seleccionado no puede emitir Factura C. Elegí otro para continuar.
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Factura C</p>
          <p data-testid="form-total" className="text-2xl font-bold">${formatCurrency(total)}</p>
        </div>
        <button
          type="button"
          disabled={!validation.ok || pvUnsupported}
          onClick={() => onPreview(form)}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
        >
          Previsualizar y emitir →
        </button>
      </div>
    </div>
  );
}
