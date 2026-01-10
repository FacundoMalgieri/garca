"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import type { MonotributoData } from "@/types/monotributo";

interface ChartsPanelProps {
  monotributoData: MonotributoData | null;
  ingresosAnuales: number;
  isCurrentYearData?: boolean;
}

type TabType = "progreso" | "distribucion" | "mensual";

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "progreso", label: "Progreso Monotributo", icon: <TrendingUpIcon /> },
  { id: "distribucion", label: "Distribución", icon: <PieChartIcon /> },
  { id: "mensual", label: "Mensual", icon: <BarChartIcon /> },
];

export function ChartsPanel({ monotributoData, ingresosAnuales, isCurrentYearData = true }: ChartsPanelProps) {
  const { state } = useInvoiceContext();
  const [activeTab, setActiveTab] = useState<TabType>("progreso");

  if (!isCurrentYearData) {
    return <NoDataMessage />;
  }

  const monthlyData = prepareMonthlyData(state.invoices);
  const distributionData = prepareDistributionData(state.invoices);
  const currentCategory = getCurrentCategory(monotributoData, ingresosAnuales);

  return (
    <Card className="h-full flex flex-col border-b-0 md:border-b min-h-[352px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartIcon />
          Análisis Visual
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Chart Content */}
        <div className="min-h-[400px]">
          {activeTab === "progreso" && <ProgresoChart monthlyData={monthlyData} currentCategory={currentCategory} />}
          {activeTab === "distribucion" && <DistribucionChart distributionData={distributionData} />}
          {activeTab === "mensual" && <MensualChart monthlyData={monthlyData} />}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Data preparation functions
// ============================================================================

interface MonthlyDataPoint {
  month: string;
  monthNum: number;
  acumulado: number;
  mensual: number;
}

/**
 * Determines the multiplier for an invoice based on its type.
 * Credit notes are subtracted (-1), everything else is added (+1).
 */
function getInvoiceMultiplier(tipo: string): number {
  const lower = tipo.toLowerCase();
  if (lower.includes("nota de credito") || lower.includes("nota de crédito")) {
    return -1;
  }
  return 1;
}

/**
 * Calculates the total in pesos for an invoice, considering exchange rate.
 */
function calculateTotalEnPesos(
  importeTotal: number,
  moneda: string,
  exchangeRate?: number
): number {
  // If it's a foreign currency and has exchange rate, convert
  if (moneda !== "ARS" && exchangeRate && exchangeRate > 0) {
    return importeTotal * exchangeRate;
  }
  // For ARS or missing exchange rate, return as-is
  return importeTotal;
}

function prepareMonthlyData(
  invoices: { fecha: string; tipo: string; moneda: string; importeTotal: number; xmlData?: { exchangeRate?: number } }[]
): MonthlyDataPoint[] {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  // Group by year-month to handle periods spanning multiple years
  const monthlyTotals: Record<string, { 
    month: string; 
    monthNum: number; 
    year: number;
    sortKey: number; // YYYYMM for sorting
    mensual: number;
  }> = {};

  // Process all invoices (already filtered by date range)
  invoices.forEach((invoice) => {
    const [, month, year] = invoice.fecha.split("/");
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const key = `${year}-${month}`; // Unique key per year-month
    const sortKey = yearNum * 100 + monthNum; // YYYYMM for chronological sorting

    const multiplier = getInvoiceMultiplier(invoice.tipo);
    const totalEnPesos = calculateTotalEnPesos(
      invoice.importeTotal,
      invoice.moneda,
      invoice.xmlData?.exchangeRate
    );

    if (!monthlyTotals[key]) {
      // Show abbreviated year if period spans multiple years
      const monthLabel = monthNames[monthNum - 1];
      monthlyTotals[key] = { 
        month: monthLabel, 
        monthNum, 
        year: yearNum,
        sortKey,
        mensual: 0 
      };
    }

    monthlyTotals[key].mensual += totalEnPesos * multiplier;
  });

  // Sort chronologically and calculate cumulative
  let acumulado = 0;
  const sortedData = Object.values(monthlyTotals).sort((a, b) => a.sortKey - b.sortKey);
  
  // Check if data spans multiple years
  const years = [...new Set(sortedData.map(d => d.year))];
  const spansMultipleYears = years.length > 1;

  return sortedData.map((item) => {
    acumulado += item.mensual;
    return {
      // Add year suffix if spanning multiple years (e.g., "Ene 25")
      month: spansMultipleYears ? `${item.month} ${String(item.year).slice(-2)}` : item.month,
      monthNum: item.sortKey, // Use sortKey for proper ordering
      acumulado,
      mensual: item.mensual,
    };
  });
}

interface DistributionDataPoint {
  name: string;
  value: number;
  color: string;
  currency: string;
  [key: string]: string | number;
}

/**
 * Color palette for currencies in charts.
 * Ensures consistent and distinct colors for each currency.
 */
const CHART_COLORS: Record<string, string> = {
  USD: "#22c55e", // Green
  EUR: "#f59e0b", // Amber
  ARS: "#3b82f6", // Blue
  JPY: "#ef4444", // Red
  GBP: "#a855f7", // Purple
  BRL: "#10b981", // Emerald
  CHF: "#f43f5e", // Rose
  CAD: "#f97316", // Orange
  AUD: "#06b6d4", // Cyan
  MXN: "#84cc16", // Lime
};

/**
 * Fallback colors for unknown currencies.
 */
const FALLBACK_CHART_COLORS = [
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#d946ef", // Fuchsia
];

/**
 * Simple hash function to generate consistent index for unknown currencies.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Gets the chart color for a currency.
 */
function getChartColor(currency: string): string {
  if (CHART_COLORS[currency]) {
    return CHART_COLORS[currency];
  }
  const index = hashString(currency) % FALLBACK_CHART_COLORS.length;
  return FALLBACK_CHART_COLORS[index];
}

function prepareDistributionData(
  invoices: { tipo: string; moneda: string; importeTotal: number; xmlData?: { exchangeRate?: number } }[]
): DistributionDataPoint[] {
  // Group totals by currency dynamically
  const totalsByCurrency: Record<string, number> = {};

  invoices.forEach((invoice) => {
    const currency = invoice.moneda;
    const multiplier = getInvoiceMultiplier(invoice.tipo);
    const totalEnPesos = calculateTotalEnPesos(
      invoice.importeTotal,
      currency,
      invoice.xmlData?.exchangeRate
    );

    if (!totalsByCurrency[currency]) {
      totalsByCurrency[currency] = 0;
    }
    totalsByCurrency[currency] += totalEnPesos * multiplier;
  });

  // Convert to array format for chart, filtering out zero or negative values
  return Object.entries(totalsByCurrency)
    .filter(([, value]) => value > 0)
    .map(([currency, value]) => ({
      name: `Facturas en ${currency}`,
      value,
      color: getChartColor(currency),
      currency,
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending
}

function getCurrentCategory(monotributoData: MonotributoData | null, ingresosAnuales: number) {
  if (!monotributoData) return null;
  const categorias = [...monotributoData.categorias].sort((a, b) => a.ingresosBrutos - b.ingresosBrutos);
  return categorias.find((cat) => ingresosAnuales <= cat.ingresosBrutos) || categorias[categorias.length - 1];
}

// ============================================================================
// Chart components
// ============================================================================

/**
 * Rounds a number up to the next "nice" value for chart axis.
 * E.g., 18.5M -> 19M, 16.8M -> 17M
 */
function roundUpToNiceValue(value: number): number {
  const million = 1_000_000;
  const inMillions = value / million;
  // Round up to next integer million
  return Math.ceil(inMillions) * million;
}

function ProgresoChart({
  monthlyData,
  currentCategory,
}: {
  monthlyData: MonthlyDataPoint[];
  currentCategory: { categoria: string; ingresosBrutos: number } | null;
}) {
  // Calculate Y-axis domain to always show the category limit line
  const maxAccumulated = monthlyData.length > 0 
    ? Math.max(...monthlyData.map(d => d.acumulado)) 
    : 0;
  
  const categoryLimit = currentCategory?.ingresosBrutos || 0;
  
  // The max Y value should be the higher of: max data point or category limit
  // Then round up to a nice value to ensure the reference line is always visible
  const maxDataValue = Math.max(maxAccumulated, categoryLimit);
  const yAxisMax = roundUpToNiceValue(maxDataValue * 1.05); // Add 5% padding then round up

  return (
    <div id="chart-progreso" className="h-[400px] md:h-[500px] flex flex-col">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex-none">Ingresos Acumulados vs Límites de Categorías</h3>
      <ResponsiveContainer width="100%" height="100%" className="flex-1 min-h-0">
        <AreaChart data={monthlyData}>
          <defs>
            <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis 
            fontSize={12} 
            tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
            domain={[0, yAxisMax]}
          />
          <Tooltip
            formatter={(value: number) => [
              `$${value.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
              "Acumulado",
            ]}
            contentStyle={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
          />
          <Area
            type="monotone"
            dataKey="acumulado"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAcumulado)"
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          {currentCategory && (
            <ReferenceLine
              y={currentCategory.ingresosBrutos}
              stroke="#22c55e"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={({ viewBox }) => {
                const { x, y } = viewBox as { x?: number; y?: number };
                return (
                  <g>
                    <text x={(x || 0) + 200} y={(y || 0) - 6} fill="#15803d" fontSize={12} fontWeight="bold" textAnchor="end">
                      Límite Cat. {currentCategory.categoria}
                    </text>
                    <text x={(x || 0) + 200} y={(y || 0) + 14} fill="#15803d" fontSize={12} fontWeight="500" textAnchor="end">
                      ${currentCategory.ingresosBrutos.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                    </text>
                  </g>
                );
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DistribucionChart({ distributionData }: { distributionData: DistributionDataPoint[] }) {
  return (
    <div id="chart-distribucion" className="h-[400px] md:h-[500px] pb-4 flex flex-col">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex-none">Distribución de Ingresos por Moneda</h3>
      <ResponsiveContainer width="100%" height="100%" className="flex-1 min-h-0">
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius="70%"
            fill="#8884d8"
            dataKey="value"
          >
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "var(--color-background)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            itemStyle={{ color: "var(--color-foreground)" }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 -mt-2">
        {distributionData.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MensualChart({ monthlyData }: { monthlyData: MonthlyDataPoint[] }) {
  return (
    <div id="chart-mensual" className="h-[400px] md:h-[500px] flex flex-col">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex-none">Ingresos por Mes</h3>
      <ResponsiveContainer width="100%" height="100%" className="flex-1 min-h-0">
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`, "Ingresos"]}
            contentStyle={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
          />
          <Bar dataKey="mensual" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function NoDataMessage() {
  return (
    <Card className="min-h-[352px] h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartIcon />
          Análisis Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-full flex flex-col justify-center items-center rounded-lg border-2 border-muted bg-muted/30 p-6 text-center">
          <div className="flex justify-center mb-3">
            <InfoIcon />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Gráficos no disponibles</h3>
          <p className="text-sm text-muted-foreground">
            Los gráficos de progreso de Monotributo solo están disponibles con datos del año actual.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ChartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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

function TrendingUpIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function PieChartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}
