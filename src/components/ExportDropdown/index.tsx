"use client";

import { ActionDropdown, ActionDropdownItem } from "@/components/ui/Dropdown";

interface ExportDropdownProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Dropdown component for exporting data in various formats.
 */
export function ExportDropdown({ onExportPDF, onExportCSV, onExportJSON, disabled, className }: ExportDropdownProps) {
  return (
    <ActionDropdown
      align="auto"
      className={className}
      trigger={
        <button
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg border border-foreground/20 hover:border-foreground/30 hover:bg-muted cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ExportIcon />
          <span className="hidden sm:inline">Exportar</span>
          <ChevronDownIcon />
        </button>
      }
    >
      <ActionDropdownItem onClick={onExportPDF} icon={<PdfIcon />}>
        PDF
      </ActionDropdownItem>
      <ActionDropdownItem onClick={onExportCSV} icon={<CsvIcon />}>
        CSV
      </ActionDropdownItem>
      <ActionDropdownItem onClick={onExportJSON} icon={<JsonIcon />}>
        JSON
      </ActionDropdownItem>
    </ActionDropdown>
  );
}

function ExportIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function CsvIcon() {
  return (
    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function JsonIcon() {
  return (
    <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

