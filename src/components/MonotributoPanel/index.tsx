"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useMonotributo } from "@/hooks/useMonotributo";
import type { RecategorizacionOutlook } from "@/lib/monotributo/outlook";
import { getRecategorizacionOutlook } from "@/lib/monotributo/outlook";
import { cn } from "@/lib/utils";
import type { MonotributoAFIPInfo } from "@/types/afip-scraper";
import type { CategoriaMonotributo, TipoActividad, VentanaRecategorizacion } from "@/types/monotributo";

const MONTH_NAMES_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatWindowMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTH_NAMES_SHORT[month - 1]} ${year}`;
}

function formatPesos(amount: number): string {
  return `$${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

function pagoMensualDe(categoria: CategoriaMonotributo, tipoActividad: TipoActividad): number {
  return tipoActividad === "servicios" ? categoria.total.servicios : categoria.total.venta;
}

/** Primer día del mes en DD/MM/YYYY, para que el usuario lo copie al formulario. */
function primerDiaDe(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `01/${month}/${year}`;
}

/** Último día del mes en DD/MM/YYYY. El día 0 del mes siguiente es éste. */
function ultimoDiaDe(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const dia = new Date(year, month, 0).getDate();
  return `${String(dia).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/**
 * Por qué no hay categoría vigente, y qué hacer al respecto.
 *
 * Los tres casos son distintos para el usuario y sólo uno tiene arreglo a mano:
 * si faltan meses de la ventana, la salida es consultar el rango exacto — y hay
 * que decirle cuál, porque no tiene forma de deducir que le falta Julio 2025.
 */
function describeFaltaCategoria(ventana: VentanaRecategorizacion): string {
  const rango = `${primerDiaDe(ventana.desde)} a ${ultimoDiaDe(ventana.hasta)}`;

  // Dos salidas, y las dos sirven: Actualizar reintenta leerla de ARCA (el
  // scrape de comprobantes la trae best-effort, así que no hace falta re-login),
  // y consultar el rango exacto de la ventana la deja calculable.
  const reintento = "Probá Actualizar para reintentar leerla de ARCA";

  if (ventana.cobertura.estado === "parcial") {
    const faltantes = ventana.cobertura.faltantes.map(formatWindowMonth).join(", ");
    return `No pudimos leerla de ARCA y la consultamos incompleta: falta ${faltantes} de la ventana ${formatWindowMonth(ventana.desde)} a ${formatWindowMonth(ventana.hasta)}. ${reintento}, o consultá el período ${rango} para calcularla.`;
  }

  if (ventana.cobertura.estado === "desconocida") {
    return `No pudimos leerla de ARCA y no sabemos qué período se consultó en esta sesión. ${reintento}, o volvé a consultar el período ${rango} para calcularla.`;
  }

  return `No pudimos leerla de ARCA y no hay comprobantes en la última ventana cerrada (${formatWindowMonth(ventana.desde)} a ${formatWindowMonth(ventana.hasta)}). ${reintento}.`;
}

type OutlookTone = "amber" | "success" | "muted";

const TONE_CLASSES: Record<OutlookTone, { box: string; accent: string; detail: string }> = {
  amber: {
    box: "border-amber-500/50 bg-amber-500/10",
    accent: "text-amber-500",
    detail: "text-amber-600 dark:text-amber-400",
  },
  success: {
    box: "border-success/50 bg-success/10",
    accent: "text-success",
    detail: "text-success dark:text-emerald-400",
  },
  muted: {
    box: "border-muted bg-muted/30",
    accent: "text-foreground",
    detail: "text-muted-foreground",
  },
};

/**
 * Tono y texto según lo que le va a pasar a la categoría. Una baja sólo se
 * presenta como oportunidad ("pagás menos") cuando la ventana ya cerró: con
 * datos parciales los ingresos todavía pueden subir.
 */
function describeOutlook(
  outlook: RecategorizacionOutlook,
  categoriaVigente: CategoriaMonotributo,
  ventana: VentanaRecategorizacion
): { tone: OutlookTone; detail: string } {
  const estimada = outlook.categoriaEstimada?.categoria ?? "—";
  const mesesFaltantes = ventana.totalMeses - ventana.mesesCerrados;

  switch (outlook.kind) {
    case "suba-confirmada":
      return {
        tone: "amber",
        detail: `Ya superaste el tope de ${categoriaVigente.categoria} por ${formatPesos(outlook.excedente)} en esta ventana: te recategorizás a ${estimada} en ${ventana.label}.`,
      };
    case "suba-proyectada":
      return {
        tone: "amber",
        detail: `Si seguís a este ritmo, la ventana cierra en ${estimada} y tenés que recategorizarte en ${ventana.label}.`,
      };
    case "baja-confirmada":
      return {
        tone: "success",
        detail: `La ventana cerró en ${estimada}: podés recategorizarte y pagar menos.`,
      };
    case "baja-posible":
      return {
        tone: "muted",
        detail: `Al ritmo actual cerrarías en ${estimada}, pero faltan ${mesesFaltantes} ${mesesFaltantes === 1 ? "mes" : "meses"} de la ventana. Esperá el cierre antes de bajar de categoría.`,
      };
    case "estable":
      return {
        tone: "success",
        detail: `Al ritmo actual te mantenés en ${categoriaVigente.categoria}.`,
      };
    case "sin-datos":
    default:
      return {
        tone: "muted",
        detail: `La ventana ${formatWindowMonth(ventana.desde)} a ${formatWindowMonth(ventana.hasta)} recién arrancó: todavía no hay meses cerrados para estimar.`,
      };
  }
}

interface MonotributoPanelProps {
  /** Última ventana de recategorización cerrada: define la categoría vigente */
  ventanaVigente: VentanaRecategorizacion;
  /** Ventana en curso, la que se evalúa en la próxima recategorización */
  ventanaProxima: VentanaRecategorizacion;
  /** Categoría vigente (ARCA o derivada de la ventana cerrada) */
  categoriaVigente: CategoriaMonotributo | null;
  isCurrentYearData?: boolean;
}

export function MonotributoPanel({
  ventanaVigente,
  ventanaProxima,
  categoriaVigente,
  isCurrentYearData = true,
}: MonotributoPanelProps) {
  const { data, tipoActividad, updateTipoActividad } = useMonotributo(ventanaVigente.ingresos);
  const { monotributoInfo } = useInvoiceContext();

  // Use scraped activity type if available, otherwise allow manual selection
  const hasScrapedActivity = monotributoInfo?.tipoActividad !== null && monotributoInfo?.tipoActividad !== undefined;

  // Sync scraped activity type with hook
  useEffect(() => {
    if (hasScrapedActivity && monotributoInfo?.tipoActividad && monotributoInfo.tipoActividad !== tipoActividad) {
      updateTipoActividad(monotributoInfo.tipoActividad);
    }
  }, [hasScrapedActivity, monotributoInfo?.tipoActividad, tipoActividad, updateTipoActividad]);

  const outlook = useMemo(
    () =>
      getRecategorizacionOutlook({
        categoriaVigente,
        ventana: ventanaProxima,
        categorias: data.categorias,
      }),
    [categoriaVigente, ventanaProxima, data.categorias]
  );

  const acumulado = ventanaProxima.ingresos;
  const topeVigente = categoriaVigente?.ingresosBrutos ?? 0;
  const porcentajeUtilizado = topeVigente > 0 ? (acumulado / topeVigente) * 100 : 0;
  const margenDisponible = topeVigente - acumulado;
  const categoriaEstimada = outlook.categoriaEstimada;
  const outlookCopy = categoriaVigente ? describeOutlook(outlook, categoriaVigente, ventanaProxima) : null;
  const tone = outlookCopy ? TONE_CLASSES[outlookCopy.tone] : null;

  return (
    <Card className="h-full flex flex-col min-h-[352px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardIcon />
          Monotributo
        </CardTitle>
        {isCurrentYearData && (
          <p className="text-xs text-muted-foreground -mt-1">
            {monotributoInfo
              ? `Categoría vigente informada por ARCA · próxima recategorización ${ventanaProxima.label}`
              : `Categoría vigente según ${formatWindowMonth(ventanaVigente.desde)} a ${formatWindowMonth(ventanaVigente.hasta)} (no pudimos leerla de ARCA) · próxima recategorización ${ventanaProxima.label}`}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {/* Message when insufficient data for last 12 months */}
        {!isCurrentYearData && (
          <div className="rounded-lg border-2 border-muted bg-muted/30 p-6 text-center">
            <div className="flex justify-center mb-3">
              <InfoIcon />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Datos de Monotributo no disponibles</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Los cálculos de Monotributo requieren datos de los últimos 12 meses.
            </p>
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
              {/* Apunta al modal de Actualizar, no a limpiar los datos: re-traer
                  la ventana conserva tus cotizaciones manuales y los datos de
                  Monotributo, mientras que limpiar los borra y obliga a rehacer
                  el login completo. */}
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">💡 Consejo:</strong> Para ver tu categoría actual, usá el botón{" "}
                <strong className="text-foreground">Actualizar</strong> de arriba —o &quot;Limpiar Datos&quot; si no
                aparece— y consultá los últimos 12 meses desde hoy.
              </p>
            </div>
          </div>
        )}

        {/* Normal content when current year data exists */}
        {isCurrentYearData && (
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

            {!categoriaVigente && (
              <div className="rounded-lg border-2 border-muted bg-muted/30 p-4 text-center space-y-1">
                <p className="text-sm font-medium text-foreground">Categoría vigente no disponible</p>
                <p className="text-xs text-muted-foreground">{describeFaltaCategoria(ventanaVigente)}</p>
              </div>
            )}

            {/* Categoría vigente vs estimada al cierre de la ventana en curso */}
            {categoriaVigente && outlookCopy && tone && (
              <div className={`rounded-lg border-2 ${tone.box} p-4 space-y-3`}>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center flex flex-col items-center">
                    <span className="text-[10px] font-medium text-muted-foreground mb-1 tracking-wide">
                      CATEGORÍA ACTUAL
                    </span>
                    <span className="text-2xl font-bold text-foreground leading-none">
                      {categoriaVigente.categoria}
                    </span>
                    {/* De dónde salió la letra. Sin esto, una categoría que
                        nosotros inferimos de lo facturado se lee igual que la que
                        informa ARCA — y son cosas distintas: la nuestra depende
                        de qué período se consultó, la de ARCA es la verdad legal. */}
                    {!monotributoInfo && (
                      <span className="text-[9px] text-muted-foreground mt-1 leading-tight">
                        calculada por nosotros
                      </span>
                    )}
                  </div>

                  <svg className={`w-5 h-5 ${tone.accent} mt-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>

                  <div className="text-center flex flex-col items-center">
                    <span className="text-[10px] font-medium text-muted-foreground mb-1 tracking-wide">
                      ESTIMADA {ventanaProxima.label.toUpperCase()}
                    </span>
                    <span className={`text-2xl font-bold ${tone.accent} leading-none`}>
                      {categoriaEstimada?.categoria ?? "—"}
                    </span>
                  </div>
                </div>

                <div className={`text-center text-xs ${tone.detail}`}>{outlookCopy.detail}</div>

                {!ventanaProxima.completa && ventanaProxima.mesesCerrados > 0 && (
                  <div className="text-[11px] text-muted-foreground text-center">
                    Estimación con {ventanaProxima.mesesCerrados} de {ventanaProxima.totalMeses} meses de la ventana,
                    proyectados a 12 meses.
                  </div>
                )}
              </div>
            )}

            {outlook.excluido && (
              <div
                className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive"
                role="alert"
              >
                La estimación supera el tope del Monotributo. Consultá con un contador o ARCA: podrías necesitar pasar a
                Responsable Inscripto.
              </div>
            )}

            {/* Acumulado de la ventana en curso */}
            <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">
                  Facturado en la ventana ({ventanaProxima.mesesCerrados}/{ventanaProxima.totalMeses} meses):
                </span>
                <span className="font-mono font-medium">{formatPesos(acumulado)}</span>
              </div>
              {!ventanaProxima.completa && ventanaProxima.ingresosAnualizados !== null && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Proyectado a 12 meses:</span>
                  <span className="font-mono font-medium">{formatPesos(ventanaProxima.ingresosAnualizados)}</span>
                </div>
              )}
              {/* Meses de la ventana que la consulta no trajo: suman $0 y tiran
                  el acumulado (y la proyección) para abajo. Se avisa porque el
                  error va en la dirección peligrosa — parecés más lejos del tope
                  de lo que estás. */}
              {ventanaProxima.cobertura.estado === "parcial" && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-1">
                  Falta {ventanaProxima.cobertura.faltantes.map(formatWindowMonth).join(", ")} en lo consultado: el
                  acumulado y la proyección están subestimados.
                </p>
              )}
            </div>

            {/* Progreso del acumulado contra el tope de la categoría vigente */}
            {categoriaVigente && (
              <>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Progreso hacia el tope de {categoriaVigente.categoria}</span>
                    <span>{porcentajeUtilizado.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        porcentajeUtilizado > 100
                          ? "bg-destructive"
                          : porcentajeUtilizado > 85
                            ? "bg-amber-500"
                            : "bg-success"
                      )}
                      style={{ width: `${Math.min(porcentajeUtilizado, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="font-mono text-muted-foreground">{formatPesos(acumulado)}</span>
                    <span className="font-mono text-muted-foreground">{formatPesos(topeVigente)}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {margenDisponible > 0
                        ? `Podés facturar hasta sin pasar de ${categoriaVigente.categoria}:`
                        : `Excediste el tope de ${categoriaVigente.categoria}`}
                    </span>
                    {margenDisponible > 0 && (
                      <span className="font-mono font-medium">{formatPesos(margenDisponible)}</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-border my-3"></div>

            {/* Pagos: vigente y estimado al cierre de la ventana */}
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              {categoriaVigente && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Pago mensual actual ({categoriaVigente.categoria}):
                  </span>
                  <span className="font-mono font-bold text-lg text-primary dark:text-white">
                    ${pagoMensualDe(categoriaVigente, tipoActividad).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {categoriaEstimada && categoriaEstimada.categoria !== categoriaVigente?.categoria && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Estimado en {ventanaProxima.label} ({categoriaEstimada.categoria}):
                  </span>
                  <span className="font-mono font-medium">
                    ${pagoMensualDe(categoriaEstimada, tipoActividad).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="text-xs text-muted-foreground text-center">
                Ventana {formatWindowMonth(ventanaProxima.desde)} a {formatWindowMonth(ventanaProxima.hasta)}
              </div>
            </div>

            {/* Action buttons */}
            {categoriaVigente && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 items-center justify-center">
                <Link
                  href={`/monotributo/categoria/${categoriaVigente.categoria.toLowerCase()}`}
                  className="text-xs text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 transition-colors cursor-pointer flex items-center justify-center gap-1 font-medium"
                >
                  Ver detalle categoría {categoriaVigente.categoria}
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
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
            )}

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
  categorias: CategoriaMonotributo[];
  tipoActividad: TipoActividad;
}) {
  // Find the current category from ARCA in the scraped data
  const categoriaActualARCA = categorias.find((cat) => cat.categoria === monotributoInfo.categoria);
  const pagoMensualActual = categoriaActualARCA ? pagoMensualDe(categoriaActualARCA, tipoActividad) : null;

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
