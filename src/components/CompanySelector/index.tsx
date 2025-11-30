"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { AFIPCompany } from "@/types/afip-scraper";

interface CompanySelectorProps {
  companies: AFIPCompany[];
  onSelect: (company: AFIPCompany) => void;
}

/**
 * Component for selecting a company from the list of available companies.
 */
export function CompanySelector({ companies, onSelect }: CompanySelectorProps) {
  if (companies.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No se encontraron empresas asociadas a este CUIT.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BuildingIcon className="w-5 h-5 text-primary dark:text-white" />
          Seleccioná una empresa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {companies.length === 1
            ? "Confirmá la empresa para continuar"
            : `Tenés ${companies.length} empresas asociadas. Elegí con cuál querés consultar facturas.`}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {companies.map((company) => (
          <button
            key={company.index}
            onClick={() => onSelect(company)}
            className="w-full p-4 text-left rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {company.razonSocial}
                </p>
                {company.cuit && (
                  <p className="text-sm text-muted-foreground">CUIT: {formatCuit(company.cuit)}</p>
                )}
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
            </div>
          </button>
        ))}

      </CardContent>
    </Card>
  );
}

function formatCuit(cuit: string): string {
  const clean = cuit.replace(/\D/g, "");
  if (clean.length === 11) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
  }
  return cuit;
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}


