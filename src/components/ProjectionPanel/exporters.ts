import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { CompanyInfo } from "@/hooks/useInvoices";
import type { MonthlyTotal,ProjectionData, ProjectionResult } from "@/types/projection";

interface ExportData {
  companyInfo: CompanyInfo | null;
  projectionData: ProjectionData;
  projectionResult: ProjectionResult;
  monthlyTotals: MonthlyTotal[];
  futureMonths: string[];
  tipoActividad: string;
}

/**
 * Formats a month key (YYYY-MM) to a readable format.
 */
function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

/**
 * Formats a month key to short format (Ene '26)
 */
function formatMonthShort(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", 
                      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

/**
 * Generates a filename based on company info.
 */
function generateFilename(company: CompanyInfo | null, suffix: string, extension: string): string {
  const date = new Date().toISOString().split("T")[0];

  if (company) {
    const sanitizedName = company.razonSocial
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    return `${sanitizedName}-${suffix}_${date}.${extension}`;
  }

  return `${suffix}_${date}.${extension}`;
}

/**
 * Exports projection to CSV format.
 */
export function exportProjectionToCSV(data: ExportData): void {
  const { companyInfo, projectionData, projectionResult, monthlyTotals, futureMonths } = data;

  // Build header info
  const headerRows = [
    ["PROYECCIÓN MONOTRIBUTO"],
    [""],
    ["Configuración"],
    ["Recategorización objetivo", formatMonth(projectionData.targetRecategorizacion)],
    ["Categoría objetivo", projectionData.targetCategoria || "Automático"],
    ["Margen de seguridad", `$${projectionData.margenSeguridad.toLocaleString("es-AR")}`],
    [""],
    ["Resultados"],
    ["Categoría resultante", projectionResult.categoriaResultante],
    ["Tope categoría", `$${projectionResult.topeCategoria.toLocaleString("es-AR")}`],
    ["Total ventana 12 meses", `$${projectionResult.totalVentana.toLocaleString("es-AR")}`],
    ["Total histórico", `$${projectionResult.totalHistorico.toLocaleString("es-AR")}`],
    ["Total proyectado", `$${projectionResult.totalProyectado.toLocaleString("es-AR")}`],
    ["Monto recomendado mensual", `$${Math.round(projectionResult.montoRecomendadoMensual).toLocaleString("es-AR")}`],
    [""],
    ["Detalle por mes"],
    ["Mes", "Tipo", "Monto"],
  ];

  // Build historical data from monthlyTotals
  const historicalMap = new Map(monthlyTotals.map(m => [m.month, m.totalArs]));
  
  // Add all months in window
  projectionResult.ventana.forEach((month) => {
    const isHistorical = !futureMonths.includes(month);
    const amount = isHistorical 
      ? historicalMap.get(month) || 0
      : projectionData.monthlyProjections[month] || 0;
    
    headerRows.push([
      formatMonthShort(month),
      isHistorical ? "Histórico" : "Proyectado",
      `$${amount.toLocaleString("es-AR")}`,
    ]);
  });

  const csvContent = headerRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = generateFilename(companyInfo, "proyeccion", "csv");
  link.click();
}

/**
 * Exports projection to JSON format.
 */
export function exportProjectionToJSON(data: ExportData): void {
  const { companyInfo, projectionData, projectionResult, monthlyTotals, futureMonths, tipoActividad } = data;

  const historicalMap = new Map(monthlyTotals.map(m => [m.month, m.totalArs]));

  const jsonData = {
    empresa: companyInfo
      ? {
          cuit: companyInfo.cuit,
          razonSocial: companyInfo.razonSocial,
        }
      : null,
    exportadoEl: new Date().toISOString(),
    tipoActividad,
    configuracion: {
      recategorizacionObjetivo: projectionData.targetRecategorizacion,
      recategorizacionObjetivoLabel: formatMonth(projectionData.targetRecategorizacion),
      categoriaObjetivo: projectionData.targetCategoria || "auto",
      margenSeguridad: projectionData.margenSeguridad,
    },
    resultado: {
      categoriaResultante: projectionResult.categoriaResultante,
      topeCategoria: projectionResult.topeCategoria,
      totalVentana: projectionResult.totalVentana,
      totalHistorico: projectionResult.totalHistorico,
      totalProyectado: projectionResult.totalProyectado,
      montoRecomendadoMensual: Math.round(projectionResult.montoRecomendadoMensual),
      excedeObjetivo: projectionResult.excedeObjetivo,
    },
    detalleMensual: projectionResult.ventana.map((month) => {
      const isHistorical = !futureMonths.includes(month);
      const amount = isHistorical 
        ? historicalMap.get(month) || 0
        : projectionData.monthlyProjections[month] || 0;
      
      return {
        mes: month,
        mesLabel: formatMonthShort(month),
        tipo: isHistorical ? "historico" : "proyectado",
        monto: amount,
      };
    }),
  };

  const jsonContent = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = generateFilename(companyInfo, "proyeccion", "json");
  link.click();
}

/**
 * Exports projection to PDF format.
 */
export function exportProjectionToPDF(data: ExportData): void {
  const { companyInfo, projectionData, projectionResult, monthlyTotals, futureMonths, tipoActividad } = data;

  const doc = new jsPDF();

  // ========== HEADER ==========
  doc.setFontSize(18);
  doc.setTextColor(38, 47, 85);
  doc.text("Proyección Monotributo", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  if (companyInfo) {
    doc.text(`${companyInfo.razonSocial} - CUIT: ${companyInfo.cuit}`, 14, 27);
  }
  doc.text(`Generado: ${new Date().toLocaleDateString("es-AR")}`, 14, companyInfo ? 33 : 27);

  // ========== CONFIGURATION ==========
  const configStartY = companyInfo ? 43 : 37;
  doc.setFontSize(12);
  doc.setTextColor(38, 47, 85);
  doc.text("Configuración", 14, configStartY);

  const configData = [
    ["Tipo de actividad:", tipoActividad === "servicios" ? "Servicios" : "Venta de Bienes"],
    ["Recategorización objetivo:", formatMonth(projectionData.targetRecategorizacion)],
    ["Categoría objetivo:", projectionData.targetCategoria || "Automático (menor posible)"],
    ["Margen de seguridad:", `$${projectionData.margenSeguridad.toLocaleString("es-AR")}`],
  ];

  autoTable(doc, {
    startY: configStartY + 5,
    body: configData,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50, textColor: [100, 100, 100] },
      1: { cellWidth: 80, fontStyle: "bold", textColor: [38, 47, 85] },
    },
    margin: { left: 14, right: 14 },
  });

  // ========== RESULTS ==========
  const resultsStartY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(38, 47, 85);
  doc.text("Resultado de la Proyección", 14, resultsStartY);

  // Main recommendation box
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(14, resultsStartY + 5, 90, 25, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(255);
  doc.text("FACTURACIÓN RECOMENDADA", 18, resultsStartY + 13);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`$${Math.round(projectionResult.montoRecomendadoMensual).toLocaleString("es-AR")} /mes`, 18, resultsStartY + 24);
  doc.setFont("helvetica", "normal");

  // Category badge
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(110, resultsStartY + 5, 40, 25, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Categoría", 118, resultsStartY + 13);
  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text(projectionResult.categoriaResultante, 125, resultsStartY + 25);
  doc.setFont("helvetica", "normal");

  // Summary stats
  const summaryStartY = resultsStartY + 35;
  const summaryData = [
    ["Total ventana 12 meses:", `$${projectionResult.totalVentana.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`],
    ["  └ Histórico:", `$${projectionResult.totalHistorico.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`],
    ["  └ Proyectado:", `$${projectionResult.totalProyectado.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`],
    [`Límite categoría ${  projectionResult.categoriaResultante  }:`, `$${projectionResult.topeCategoria.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`],
    ["Distancia al límite:", `$${(projectionResult.topeCategoria - projectionResult.totalVentana).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`],
  ];

  autoTable(doc, {
    startY: summaryStartY,
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 60, textColor: [100, 100, 100] },
      1: { cellWidth: 50, fontStyle: "bold", textColor: [38, 47, 85], halign: "right" as const },
    },
    margin: { left: 14, right: 14 },
  });

  // ========== PROGRESS BAR ==========
  const progressBarY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  const progressBarWidth = 182;
  const progressBarHeight = 8;
  const progressPercent = Math.min((projectionResult.totalVentana / projectionResult.topeCategoria) * 100, 100);
  const filledWidth = (progressPercent / 100) * progressBarWidth;

  // Background
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(14, progressBarY, progressBarWidth, progressBarHeight, 2, 2, "F");

  // Filled portion
  const isOverLimit = projectionResult.totalVentana > projectionResult.topeCategoria;
  const isInMargin = projectionResult.totalVentana > (projectionResult.topeCategoria - projectionData.margenSeguridad);
  const progressColor = isOverLimit ? [239, 68, 68] : isInMargin ? [234, 179, 8] : [34, 197, 94];
  doc.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
  if (filledWidth > 0) {
    doc.roundedRect(14, progressBarY, Math.max(filledWidth, 4), progressBarHeight, 2, 2, "F");
  }

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`${progressPercent.toFixed(0)}% del límite`, 14, progressBarY + 14);

  // ========== MONTHLY DETAIL ==========
  const monthlyStartY = progressBarY + 22;
  doc.setFontSize(12);
  doc.setTextColor(38, 47, 85);
  doc.text("Detalle Mensual", 14, monthlyStartY);

  const historicalMap = new Map(monthlyTotals.map(m => [m.month, m.totalArs]));

  const monthlyData = projectionResult.ventana.map((month) => {
    const isHistorical = !futureMonths.includes(month);
    const amount = isHistorical 
      ? historicalMap.get(month) || 0
      : projectionData.monthlyProjections[month] || 0;
    
    return [
      formatMonthShort(month),
      isHistorical ? "Histórico" : "Proyectado",
      `$${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
    ];
  });

  autoTable(doc, {
    startY: monthlyStartY + 5,
    head: [["Mes", "Tipo", "Monto"]],
    body: monthlyData,
    theme: "grid",
    headStyles: {
      fillColor: [38, 47, 85],
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: 50,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40, halign: "right" as const },
    },
    didParseCell: (cellData) => {
      if (cellData.section === "body" && cellData.column.index === 1) {
        const tipo = cellData.cell.raw as string;
        if (tipo === "Histórico") {
          cellData.cell.styles.textColor = [100, 100, 100];
        } else {
          cellData.cell.styles.textColor = [16, 185, 129];
          cellData.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ========== FOOTER ==========
  const footerY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("* Proyección estimativa. Puede variar según cotización del dólar al momento de facturar.", 14, footerY);
  doc.text("* Los topes de cada categoría pueden actualizarse en cada período de recategorización.", 14, footerY + 4);

  // Page number
  doc.setFontSize(8);
  doc.text("Página 1 de 1", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {
    align: "center",
  });

  doc.save(generateFilename(companyInfo, "proyeccion", "pdf"));
}


