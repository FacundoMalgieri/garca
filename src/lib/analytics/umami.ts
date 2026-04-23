/**
 * First-party analytics (self-hosted Umami, analytics.garca.app).
 * No PII: only aggregate event names and numeric counts.
 *
 * Funnel in Umami: configure ordered steps, e.g.
 * 1) funnel_arc_companies_ok
 * 2) funnel_arc_invoices_ok
 * (optional) funnel_landing_demo_open
 */

/**
 * Reusable codes for error events (A–Z, 0–9, _ only; no user-facing messages).
 */
export function sanitizeErrorCode(code: string | null | undefined): string {
  if (code == null || code === "") return "UNKNOWN";
  const s = String(code)
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
  return s || "UNKNOWN";
}

/**
 * @see https://umami.is/docs/track-events
 */
export function trackUmamiEvent(
  name: string,
  data?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  const umami = window.umami;
  if (!umami || typeof umami.track !== "function") return;
  try {
    if (data && Object.keys(data).length > 0) {
      (umami.track as (a: string, b?: Record<string, string | number | boolean>) => void)(name, data);
    } else {
      (umami.track as (a: string) => void)(name);
    }
  } catch {
    // Script blocked or version mismatch
  }
}

export const UMAMI_EVENTS = {
  /** ARCA: empresas obtenidas (paso 1 del flujo de ingreso). */
  ArcCompaniesOk: "funnel_arc_companies_ok",
  /** ARCA: comprobantes obtenidos (paso 2, éxito). */
  ArcInvoicesOk: "funnel_arc_invoices_ok",
  /** Home: "Ver demo" cargó el panel con datos mockeados. */
  LandingDemoOpen: "funnel_landing_demo_open",
  /**
   * Panel: exportación (PDF/CSV/JSON). `context`: comprobantes vs proyección.
   * @example data: { context: 'invoices'|'projection', format: 'pdf'|'csv'|'json' }
   */
  PanelExport: "funnel_panel_export",
  /** ARCA: fallo al listar empresas (código de API, sin mensaje de usuario). */
  ArcCompaniesFail: "funnel_arc_companies_fail",
  /** ARCA: fallo al obtener comprobantes. */
  ArcInvoicesFail: "funnel_arc_invoices_fail",
  /** Home: click en CTA hacia /ingresar o /calculadora-monotributo. @example { target: 'ingresar' | 'calculadora' } */
  LandingCta: "funnel_landing_cta",
} as const;

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, string | number | boolean>) => void;
    };
  }
}
