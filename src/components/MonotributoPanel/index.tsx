"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useMonotributo } from "@/hooks/useMonotributo";
import { cn } from "@/lib/utils";
import type { MonotributoAFIPInfo } from "@/types/afip-scraper";

interface MonotributoPanelProps {
  ingresosAnuales: number;
  isCurrentYearData?: boolean;
}

export function MonotributoPanel({ ingresosAnuales, isCurrentYearData = true }: MonotributoPanelProps) {
  const { data, tipoActividad, updateTipoActividad, status } = useMonotributo(ingresosAnuales);
  const { clearInvoices, monotributoInfo } = useInvoiceContext();

  // Use scraped activity type if available, otherwise allow manual selection
  const hasScrapedActivity = monotributoInfo?.tipoActividad !== null && monotributoInfo?.tipoActividad !== undefined;

  // Sync scraped activity type with hook
  useEffect(() => {
    if (hasScrapedActivity && monotributoInfo?.tipoActividad && monotributoInfo.tipoActividad !== tipoActividad) {
      updateTipoActividad(monotributoInfo.tipoActividad);
    }
  }, [hasScrapedActivity, monotributoInfo?.tipoActividad, tipoActividad, updateTipoActividad]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <Card className={cn("h-full flex flex-col", isCurrentYearData ? "min-h-[352px]" : "min-h-[352px]")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardIcon />
          Monotributo
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Message when no current year data */}
        {!isCurrentYearData && (
          <div className="rounded-lg border-2 border-muted bg-muted/30 p-6 text-center">
            <div className="flex justify-center mb-3">
              <InfoIcon />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Datos de Monotributo no disponibles</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Los cálculos de Monotributo solo están disponibles cuando consultás el año actual completo.
            </p>
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">💡 Consejo:</strong> Para ver tu categoría actual,{" "}
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-destructive hover:text-destructive/80 underline font-medium cursor-pointer transition-colors"
                >
                  limpiá los datos
                </button>{" "}
                y consultá desde el 1 de enero del {new Date().getFullYear()} hasta hoy.
              </p>
            </div>
          </div>
        )}

        {/* Normal content when current year data exists */}
        {isCurrentYearData && status && status.categoriaActual && (
          <div className="space-y-4">
            {/* Scraped Monotributo info from AFIP - includes current monthly payment */}
            {monotributoInfo && (
              <MonotributoInfoCard
                monotributoInfo={monotributoInfo}
                categorias={data.categorias}
                tipoActividad={tipoActividad}
              />
            )}

            {/* Activity type - show as info if scraped, otherwise as selector */}
            {!hasScrapedActivity && (
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Tipo de actividad:</label>
                <div className="flex gap-2">
                  <ActivityButton
                    active={tipoActividad === "servicios"}
                    onClick={() => updateTipoActividad("servicios")}
                  >
                    Servicios
                  </ActivityButton>
                  <ActivityButton active={tipoActividad === "venta"} onClick={() => updateTipoActividad("venta")}>
                    Venta de Bienes
                  </ActivityButton>
                </div>
              </div>
            )}

            {/* Calculated category for next recategorization */}
            <div className="rounded-lg bg-primary/10 p-4 border-2 border-primary/20">
              <div className="text-center mb-2">
                <span className="text-sm text-muted-foreground block mb-1">
                  {monotributoInfo ? "En la próxima recategorización tu categoría sería:" : "Tu categoría calculada:"}
                </span>
                <span className="text-4xl font-bold text-primary dark:text-white">
                  {status.categoriaActual.categoria}
                </span>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Límite: ${status.categoriaActual.ingresosBrutos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Ingresos acumulados</span>
                <span>{status.porcentajeUtilizado.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    status.porcentajeUtilizado > 90
                      ? "bg-destructive"
                      : status.porcentajeUtilizado > 75
                        ? "bg-yellow-500"
                        : "bg-success"
                  }`}
                  style={{ width: `${Math.min(status.porcentajeUtilizado, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="font-mono text-muted-foreground">
                  ${status.ingresosAcumulados.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-muted-foreground">
                  ${status.categoriaActual.ingresosBrutos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Available margin */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margen disponible:</span>
                <span className="font-mono font-medium">
                  ${status.margenDisponible.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {status.categoriaSiguiente && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Para categoría {status.categoriaSiguiente.categoria}:</span>
                  <span className="font-mono text-xs">
                    $
                    {(status.categoriaSiguiente.ingresosBrutos - status.ingresosAcumulados).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-border my-3"></div>

            {/* Monthly payments - calculated category */}
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {monotributoInfo
                    ? `Pago mensual estimado (${status.categoriaActual.categoria}):`
                    : "Pago mensual:"}
                </span>
                <span className="font-mono font-bold text-lg text-primary dark:text-white">
                  ${status.pagoMensual.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {monotributoInfo && (
                <div className="text-xs text-muted-foreground text-center">
                  Basado en tus ingresos acumulados del año
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 items-center justify-center">
              <a
                href="https://www.arca.gob.ar/monotributo/categorias.asp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                Ver categorías oficiales
                <ExternalLinkIcon />
              </a>
            </div>

            {/* Validity info and disclaimer */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border space-y-1">
              {data.fechaVigencia && <p>Vigente desde: {data.fechaVigencia}</p>}
              <p className="text-muted-foreground/70">
                * Los topes de cada categoría pueden actualizarse en cada período de recategorización.
              </p>
              <p className="text-muted-foreground/70">
              ** Los valores corresponden al Regimen General. En el Regimen Simplificado, pueden variar según tu jurisdicción.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Clear Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearInvoices}
        title="¿Limpiar todos los datos?"
        description="Esta acción eliminará todas las facturas y datos almacenados en tu navegador. No se puede deshacer."
        confirmText="Sí, limpiar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </Card>
  );
}

// Sub-components

/**
 * Displays scraped Monotributo info from AFIP portal.
 */
function MonotributoInfoCard({
  monotributoInfo,
  categorias,
  tipoActividad,
}: {
  monotributoInfo: MonotributoAFIPInfo;
  categorias: import("@/types/monotributo").CategoriaMonotributo[];
  tipoActividad: import("@/types/monotributo").TipoActividad;
}) {
  // Find the current category from ARCA in the scraped data
  const categoriaActualARCA = categorias.find((cat) => cat.categoria === monotributoInfo.categoria);
  const pagoMensualActual = categoriaActualARCA
    ? tipoActividad === "servicios"
      ? categoriaActualARCA.total.servicios
      : categoriaActualARCA.total.venta
    : null;

  return (
    <div className="rounded-lg bg-muted/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Tu actividad:</span>
        <span className="text-sm font-medium text-foreground">
          {monotributoInfo.tipoActividad === "servicios"
            ? "Servicios"
            : monotributoInfo.tipoActividad === "venta"
              ? "Venta de Bienes"
              : monotributoInfo.actividadDescripcion || "No especificada"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Categoría actual:</span>
        <span className="text-sm font-bold text-primary dark:text-white">{monotributoInfo.categoria}</span>
      </div>
      {pagoMensualActual && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Pago mensual actual:</span>
          <span className="text-sm font-bold text-foreground">
            ${pagoMensualActual.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
      {monotributoInfo.proximaRecategorizacion && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Próxima recategorización:</span>
          <span className="text-sm text-foreground">{monotributoInfo.proximaRecategorizacion}</span>
        </div>
      )}
    </div>
  );
}

function ActivityButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

// Icons

function ClipboardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}
