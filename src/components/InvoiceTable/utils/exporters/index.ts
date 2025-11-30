import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { CompanyInfo } from "@/hooks/useInvoices";
import type { AFIPInvoice } from "@/types/afip-scraper";

import { formatInvoiceType } from "../formatters";

/**
 * Calculates total in pesos for an invoice (handles all foreign currencies).
 */
function calculateInvoiceTotalPesos(invoice: AFIPInvoice): number {
  const exchangeRate = invoice.xmlData?.exchangeRate || 0;
  // If it's not ARS and has exchange rate, convert
  if (invoice.moneda !== "ARS" && exchangeRate) {
    return invoice.importeTotal * exchangeRate;
  }
  return invoice.importeTotal;
}

/**
 * Generates a filename based on company info.
 * Format: razon-social-cuit_YYYY-MM-DD.extension
 */
function generateFilename(company: CompanyInfo | null, extension: string): string {
  const date = new Date().toISOString().split("T")[0];

  if (company) {
    // Sanitize company name for filename (remove special chars, replace spaces with dashes)
    const sanitizedName = company.razonSocial
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/-+/g, "-") // Remove multiple dashes
      .substring(0, 50); // Limit length

    return `${sanitizedName}-${company.cuit}_${date}.${extension}`;
  }

  return `facturas_${date}.${extension}`;
}

/**
 * Exports invoices to CSV format.
 */
export function exportToCSV(invoices: AFIPInvoice[], company: CompanyInfo | null = null): void {
  const headers = ["Fecha", "Tipo", "Número", "Receptor", "Moneda", "Total", "Total en Pesos", "CAE"];
  const rows = invoices.map((inv) => {
    const totalEnPesos = calculateInvoiceTotalPesos(inv);

    return [
      inv.fecha,
      formatInvoiceType(inv.tipo),
      inv.numeroCompleto,
      inv.razonSocialReceptor,
      inv.moneda,
      inv.importeTotal.toFixed(2),
      totalEnPesos.toFixed(2),
      inv.cae || "N/A",
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = generateFilename(company, "csv");
  link.click();
}

/**
 * Exports invoices to JSON format.
 */
export function exportToJSON(invoices: AFIPInvoice[], company: CompanyInfo | null = null): void {
  const data = {
    empresa: company
      ? {
          cuit: company.cuit,
          razonSocial: company.razonSocial,
        }
      : null,
    exportadoEl: new Date().toISOString(),
    totalFacturas: invoices.length,
    facturas: invoices.map((inv) => {
      const exchangeRate = inv.xmlData?.exchangeRate || 0;
      const totalEnPesos = calculateInvoiceTotalPesos(inv);

      return {
        fecha: inv.fecha,
        tipo: formatInvoiceType(inv.tipo),
        numero: inv.numeroCompleto,
        receptor: inv.razonSocialReceptor,
        cuitReceptor: inv.cuitReceptor,
        moneda: inv.moneda,
        total: inv.importeTotal,
        totalEnPesos,
        cae: inv.cae || "N/A",
        ...(exchangeRate > 0 && { tipoDeCambio: exchangeRate }),
      };
    }),
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = generateFilename(company, "json");
  link.click();
}

/** Totals for a single currency */
interface CurrencyTotal {
  amount: number;
  amountInPesos: number;
  avgExchangeRate: number;
  count: number;
}

/** Totals for a period (month or year) */
interface PeriodTotals {
  byCurrency: Record<string, CurrencyTotal>;
  totalPesos: number;
}

/**
 * Checks if invoice is a credit note (should be subtracted).
 */
function isNotaCredito(tipo: string): boolean {
  const tipoLower = tipo.toLowerCase();
  return tipoLower.includes("nota de credito") || tipoLower.includes("nota de crédito");
}

/**
 * Calculates monthly and yearly totals from invoices.
 * Groups by individual currency for maximum flexibility.
 */
function calculateTotals(invoices: AFIPInvoice[]): {
  byMonth: Record<string, PeriodTotals>;
  byYear: Record<string, PeriodTotals>;
} {
  const byMonth: Record<string, PeriodTotals> = {};
  const byYear: Record<string, PeriodTotals> = {};

  invoices.forEach((invoice) => {
    const [, month, year] = invoice.fecha.split("/");
    const monthKey = `${year}-${month}`;
    const yearKey = year;
    const currency = invoice.moneda;

    // Credit notes should be subtracted
    const multiplier = isNotaCredito(invoice.tipo) ? -1 : 1;

    const isForeign = currency !== "ARS";
    const exchangeRate = invoice.xmlData?.exchangeRate || 0;
    const amountInPesos = isForeign && exchangeRate
      ? invoice.importeTotal * exchangeRate * multiplier
      : invoice.importeTotal * multiplier;

    // Initialize month if needed
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { byCurrency: {}, totalPesos: 0 };
    }
    if (!byMonth[monthKey].byCurrency[currency]) {
      byMonth[monthKey].byCurrency[currency] = { amount: 0, amountInPesos: 0, avgExchangeRate: 0, count: 0 };
    }

    // Add to month
    byMonth[monthKey].byCurrency[currency].amount += invoice.importeTotal * multiplier;
    byMonth[monthKey].byCurrency[currency].amountInPesos += amountInPesos;
    byMonth[monthKey].totalPesos += amountInPesos;
    if (isForeign && exchangeRate > 0) {
      byMonth[monthKey].byCurrency[currency].avgExchangeRate += exchangeRate;
      byMonth[monthKey].byCurrency[currency].count += 1;
    }

    // Initialize year if needed
    if (!byYear[yearKey]) {
      byYear[yearKey] = { byCurrency: {}, totalPesos: 0 };
    }
    if (!byYear[yearKey].byCurrency[currency]) {
      byYear[yearKey].byCurrency[currency] = { amount: 0, amountInPesos: 0, avgExchangeRate: 0, count: 0 };
    }

    // Add to year
    byYear[yearKey].byCurrency[currency].amount += invoice.importeTotal * multiplier;
    byYear[yearKey].byCurrency[currency].amountInPesos += amountInPesos;
    byYear[yearKey].totalPesos += amountInPesos;
    if (isForeign && exchangeRate > 0) {
      byYear[yearKey].byCurrency[currency].avgExchangeRate += exchangeRate;
      byYear[yearKey].byCurrency[currency].count += 1;
    }
  });

  // Calculate average exchange rates
  const calculateAvgRates = (periods: Record<string, PeriodTotals>) => {
    Object.values(periods).forEach((period) => {
      Object.values(period.byCurrency).forEach((currencyData) => {
        if (currencyData.count > 0) {
          currencyData.avgExchangeRate = currencyData.avgExchangeRate / currencyData.count;
        }
      });
    });
  };

  calculateAvgRates(byMonth);
  calculateAvgRates(byYear);

  return { byMonth, byYear };
}

/**
 * Gets all unique currencies from the totals data.
 */
function getAllCurrencies(
  byMonth: Record<string, PeriodTotals>,
  byYear: Record<string, PeriodTotals>
): string[] {
  const currencies = new Set<string>();

  Object.values(byMonth).forEach((period) => {
    Object.keys(period.byCurrency).forEach((c) => currencies.add(c));
  });
  Object.values(byYear).forEach((period) => {
    Object.keys(period.byCurrency).forEach((c) => currencies.add(c));
  });

  // Sort: ARS first, then alphabetically
  return Array.from(currencies).sort((a, b) => {
    if (a === "ARS") return -1;
    if (b === "ARS") return 1;
    return a.localeCompare(b);
  });
}

/**
 * Formats a month key (YYYY-MM) to a readable format.
 */
function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

/**
 * Exports invoices to PDF format with totals and charts.
 * 
 * Order:
 * 1. Company Header + Monotributo
 * 2. Totals
 * 3. Invoice Table (complete)
 * 4. Charts
 */
export async function exportToPDF(invoices: AFIPInvoice[], company: CompanyInfo | null = null): Promise<void> {
  const doc = new jsPDF();

  // Calculate totals first (needed for monotributo)
  const { byMonth, byYear } = calculateTotals(invoices);
  const currentYear = new Date().getFullYear();
  const yearTotals = byYear[currentYear.toString()];
  const ingresosAnuales = yearTotals?.totalPesos || 0;

  // ========== PAGE 1: COMPANY HEADER + MONOTRIBUTO ==========
  doc.setFontSize(18);
  doc.setTextColor(38, 47, 85);

  // Company Header
  if (company) {
    doc.text(company.razonSocial, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`CUIT: ${company.cuit}`, 14, 27);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-AR")} | Total: ${invoices.length} comprobantes`, 14, 32);
  } else {
    doc.text("GARCA - Facturas y Comprobantes", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-AR")}`, 14, 27);
    doc.text(`Total de comprobantes: ${invoices.length}`, 14, 32);
  }

  // Monotributo section (if current year data exists)
  let monotributoEndY = 45;
  
  if (yearTotals && yearTotals.totalPesos > 0) {
    doc.setFontSize(14);
    doc.setTextColor(38, 47, 85);
    doc.text("Monotributo", 14, 45);

    const categorias = [
      { categoria: "A", ingresosBrutos: 6450000, cuotaMensual: 15000 },
      { categoria: "B", ingresosBrutos: 9450000, cuotaMensual: 16800 },
      { categoria: "C", ingresosBrutos: 13250000, cuotaMensual: 19200 },
      { categoria: "D", ingresosBrutos: 16450000, cuotaMensual: 22900 },
      { categoria: "E", ingresosBrutos: 19350000, cuotaMensual: 27400 },
      { categoria: "F", ingresosBrutos: 24200000, cuotaMensual: 34200 },
      { categoria: "G", ingresosBrutos: 29050000, cuotaMensual: 42700 },
      { categoria: "H", ingresosBrutos: 44100000, cuotaMensual: 66500 },
      { categoria: "I", ingresosBrutos: 49200000, cuotaMensual: 76800 },
      { categoria: "J", ingresosBrutos: 55850000, cuotaMensual: 88900 },
      { categoria: "K", ingresosBrutos: 68000000, cuotaMensual: 110000 },
    ];

    const categoriaActual =
      categorias.find((cat) => ingresosAnuales <= cat.ingresosBrutos) || categorias[categorias.length - 1];
    const porcentajeUsado = Math.min((ingresosAnuales / categoriaActual.ingresosBrutos) * 100, 100);
    const restanteSiguienteCategoria = categorias.find((cat) => cat.ingresosBrutos > categoriaActual.ingresosBrutos);
    const montoRestante = restanteSiguienteCategoria ? restanteSiguienteCategoria.ingresosBrutos - ingresosAnuales : 0;

    const monotributoData: string[][] = [
      ["Categoría Actual", `Categoría ${categoriaActual.categoria}`],
      ["Ingresos Anuales", `$${ingresosAnuales.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`],
      [
        "Límite de Categoría",
        `$${categoriaActual.ingresosBrutos.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`,
      ],
      ["Porcentaje Utilizado", `${porcentajeUsado.toFixed(1)}%`],
      ["Cuota Mensual", `$${categoriaActual.cuotaMensual.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`],
    ];

    if (restanteSiguienteCategoria && montoRestante > 0) {
      monotributoData.push([
        `Restante para Cat. ${restanteSiguienteCategoria.categoria}`,
        `$${montoRestante.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`,
      ]);
    } else if (ingresosAnuales > categoriaActual.ingresosBrutos) {
      const excedente = ingresosAnuales - categoriaActual.ingresosBrutos;
      monotributoData.push([
        "Excedente sobre límite",
        `$${excedente.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`,
      ]);
    }

    autoTable(doc, {
      startY: 50,
      body: monotributoData,
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold", textColor: [80, 80, 80] },
        1: { cellWidth: 100, textColor: [38, 47, 85], fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });

    monotributoEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // ========== TOTALS (on same page if fits, otherwise new page) ==========
  doc.setFontSize(14);
  doc.setTextColor(38, 47, 85);
  doc.text("Totales", 14, monotributoEndY);
  const allCurrencies = getAllCurrencies(byMonth, byYear);
  const foreignCurrencies = allCurrencies.filter((c) => c !== "ARS");
  const hasForeign = foreignCurrencies.length > 0;

  const sortedMonths = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0])); // Chronological order
  const sortedYears = Object.entries(byYear).sort((a, b) => a[0].localeCompare(b[0]));

  // Build table rows with dynamic currency columns
  const buildRow = (period: string, totals: PeriodTotals) => {
    const row: string[] = [period];

    // Add foreign currency columns
    foreignCurrencies.forEach((currency) => {
      const data = totals.byCurrency[currency];
      row.push(data && data.amount !== 0
        ? `$${data.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
        : "-");
    });

    // Add ARS column
    row.push(totals.byCurrency.ARS?.amount
      ? `$${totals.byCurrency.ARS.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
      : "-");

    // Add foreign in pesos and avg TC if there are foreign currencies
    if (hasForeign) {
      let totalForeignInPesos = 0;
      let weightedTCSum = 0;
      let totalCount = 0;

      foreignCurrencies.forEach((currency) => {
        const data = totals.byCurrency[currency];
        if (data) {
          totalForeignInPesos += data.amountInPesos;
          if (data.count > 0) {
            weightedTCSum += data.avgExchangeRate * data.count;
            totalCount += data.count;
          }
        }
      });

      const avgTC = totalCount > 0 ? weightedTCSum / totalCount : 0;

      row.push(totalForeignInPesos !== 0
        ? `$${totalForeignInPesos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
        : "-");
      row.push(avgTC > 0
        ? `$${avgTC.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
        : "-");
    }

    // Add total pesos
    row.push(`$${totals.totalPesos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`);

    return row;
  };

  const allTableData = [
    ...sortedMonths.map(([monthKey, totals]) => buildRow(formatMonth(monthKey), totals)),
    ...sortedYears.map(([year, totals]) => buildRow(`${year} (Año)`, totals)),
  ];

  // Build headers dynamically
  const headers = ["Período", ...foreignCurrencies, "ARS"];
  if (hasForeign) {
    headers.push("Extranjera en $", "TC Prom.");
  }
  headers.push("Total Pesos");

  autoTable(doc, {
    startY: monotributoEndY + 5,
    head: [headers],
    body: allTableData,
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
      0: { cellWidth: 25 },
      // Right-align all numeric columns
      ...Object.fromEntries(
        Array.from({ length: headers.length - 1 }, (_, i) => [i + 1, { halign: "right" as const }])
      ),
    },
    didParseCell: (data) => {
      const rowIndex = data.row.index;
      const monthsCount = sortedMonths.length;

      if (rowIndex >= monthsCount) {
        data.cell.styles.fillColor = [38, 47, 85];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ========== PAGE 2: INVOICE TABLE (complete) ==========
  doc.addPage();

  doc.setFontSize(18);
  doc.setTextColor(38, 47, 85);
  doc.text("Facturas", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${invoices.length} comprobante${invoices.length !== 1 ? "s" : ""}`, 14, 27);

  // Table data (without Receptor column)
  const tableData = invoices.map((inv) => {
    const exchangeRate = inv.xmlData?.exchangeRate || 0;
    const totalEnPesos = inv.moneda !== "ARS" && exchangeRate ? inv.importeTotal * exchangeRate : inv.importeTotal;

    return [
      inv.fecha,
      formatInvoiceType(inv.tipo),
      inv.numeroCompleto,
      inv.moneda,
      `$${inv.importeTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
      `$${totalEnPesos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    ];
  });

  autoTable(doc, {
    startY: 33,
    head: [["Fecha", "Tipo", "Número", "Mon.", "Total", "Total ARS"]],
    body: tableData,
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
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 35, halign: "right" },
      5: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // ========== PAGE 3: CHARTS ==========
  doc.addPage();

  doc.setFontSize(18);
  doc.setTextColor(38, 47, 85);
  doc.text("Gráficos y Análisis", 14, 20);

  // Force light mode temporarily to avoid oklch errors in dark mode
  const htmlElement = document.documentElement;
  const wasDarkMode = htmlElement.classList.contains("dark");
  if (wasDarkMode) {
    htmlElement.classList.remove("dark");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const chartIds = ["chart-progreso", "chart-distribucion", "chart-mensual"];

  let chartY = 25;
  let chartsAdded = 0;
  const pageHeight = 290;
  const imgWidth = 190;

  const chartsSection = document.getElementById("graficos");
  if (chartsSection) {
    const tabButtons = chartsSection.querySelectorAll("button");

    for (let i = 0; i < chartIds.length && i < tabButtons.length; i++) {
      if (tabButtons[i]) {
        (tabButtons[i] as HTMLElement).click();

        await new Promise((resolve) => setTimeout(resolve, 2500));

        const chartElement = document.getElementById(chartIds[i]);
        if (chartElement) {
          try {
            const canvas = await html2canvas(chartElement, {
              scale: 2,
              backgroundColor: "#ffffff",
              logging: false, // Disable html2canvas debug logs
            });

            const imgData = canvas.toDataURL("image/png");
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (chartY + imgHeight + 10 > pageHeight && chartsAdded > 0) {
              doc.addPage();
              chartY = 20;
            }

            const xOffset = (210 - imgWidth) / 2;
            doc.addImage(imgData, "PNG", xOffset, chartY, imgWidth, imgHeight);
            chartY += imgHeight + 5;
            chartsAdded++;
          } catch (error) {
            console.error(`Error capturing chart ${chartIds[i]}:`, error);
          }
        }
      }
    }

    if (chartsAdded === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Los gráficos están disponibles en la versión web.", 14, 40);
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("No hay gráficos disponibles", 14, 40);
  }

  // Restore dark mode if it was active
  if (wasDarkMode) {
    htmlElement.classList.add("dark");
  }

  // Footer on all pages
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {
      align: "center",
    });
  }

  doc.save(generateFilename(company, "pdf"));
}

