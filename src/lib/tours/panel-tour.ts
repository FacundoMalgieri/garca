import type { DriveStep } from "driver.js";

export const PANEL_TOUR_KEY = "panel";

export function getPanelTourSteps(): DriveStep[] {
  const steps: DriveStep[] = [
    {
      element: "#company-header",
      popover: {
        title: "Tu empresa y exportaciones",
        description:
          "Acá ves los datos de tu empresa, período consultado y totales. " +
          "Desde el botón \"Exportar\" podés descargar todo en PDF, CSV o JSON.",
        side: "bottom",
        align: "center",
      },
    },
  ];

  if (typeof document !== "undefined" && document.getElementById("fx-rate-banner")) {
    steps.push({
      element: "#fx-rate-banner",
      popover: {
        title: "Tipo de cambio manual",
        description:
          "Algunas facturas en moneda extranjera no traen tipo de cambio desde ARCA. " +
          "Acá podés ingresar el TC manualmente para que se incluyan en los cálculos.",
        side: "bottom",
        align: "center",
      },
    });
  }

  steps.push(
    {
      element: "#monotributo",
      popover: {
        title: "Tu categoría de Monotributo",
        description:
          "Muestra tu categoría actual, el porcentaje utilizado del tope y la cuota mensual estimada. " +
          "Se calcula automáticamente con tus facturas de los últimos 12 meses.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#graficos",
      popover: {
        title: "Gráficos de facturación",
        description:
          "Visualizá tu progreso hacia el tope, la distribución por cliente y la evolución mensual. " +
          "Usá las pestañas para cambiar entre gráficos.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#totales",
      popover: {
        title: "Totales por mes y año",
        description:
          "Desglose mes a mes de tu facturación por moneda, con tipo de cambio promedio y total en pesos.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#proyectar",
      popover: {
        title: "Proyección de facturación",
        description:
          "Simulá cuánto podés facturar por mes para mantenerte en la categoría que quieras. " +
          "Configurá la recategorización objetivo y el margen de seguridad.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#facturas",
      popover: {
        title: "Tabla de facturas",
        description:
          "Todas tus facturas con filtros por tipo, moneda y búsqueda. " +
          "Podés ordenar por cualquier columna haciendo click en el encabezado.",
        side: "top",
        align: "center",
      },
    }
  );

  return steps;
}
