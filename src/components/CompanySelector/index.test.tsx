import { beforeEach,describe, expect, it, vi } from "vitest";

import type { AFIPCompany } from "@/types/afip-scraper";

import { CompanySelector } from "./index";

import { fireEvent,render, screen } from "@testing-library/react";

describe("CompanySelector", () => {
  const mockOnSelect = vi.fn();

  const mockCompanies: AFIPCompany[] = [
    {
      razonSocial: "Empresa Test SA",
      cuit: "30712345678",
      index: 0,
    },
    {
      razonSocial: "Otra Empresa SRL",
      cuit: "20345678901",
      index: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(CompanySelector).toBeDefined();
  });

  it("renders empty state when no companies", () => {
    render(<CompanySelector companies={[]} onSelect={mockOnSelect} />);
    expect(screen.getByText("No se encontraron empresas asociadas a este CUIT.")).toBeInTheDocument();
  });

  it("renders title and description for single company", () => {
    render(<CompanySelector companies={[mockCompanies[0]]} onSelect={mockOnSelect} />);
    expect(screen.getByText("Seleccioná una empresa")).toBeInTheDocument();
    expect(screen.getByText("Confirmá la empresa para continuar")).toBeInTheDocument();
  });

  it("renders title and description for multiple companies", () => {
    render(<CompanySelector companies={mockCompanies} onSelect={mockOnSelect} />);
    expect(screen.getByText("Seleccioná una empresa")).toBeInTheDocument();
    expect(
      screen.getByText("Tenés 2 empresas asociadas. Elegí con cuál querés consultar facturas.")
    ).toBeInTheDocument();
  });

  it("renders all companies", () => {
    render(<CompanySelector companies={mockCompanies} onSelect={mockOnSelect} />);
    expect(screen.getByText("Empresa Test SA")).toBeInTheDocument();
    expect(screen.getByText("Otra Empresa SRL")).toBeInTheDocument();
  });

  it("formats CUIT correctly", () => {
    render(<CompanySelector companies={mockCompanies} onSelect={mockOnSelect} />);
    expect(screen.getByText("CUIT: 30-71234567-8")).toBeInTheDocument();
    expect(screen.getByText("CUIT: 20-34567890-1")).toBeInTheDocument();
  });

  it("calls onSelect when company is clicked", () => {
    render(<CompanySelector companies={mockCompanies} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByText("Empresa Test SA"));
    expect(mockOnSelect).toHaveBeenCalledWith(mockCompanies[0]);
  });

  it("calls onSelect with correct company when second company is clicked", () => {
    render(<CompanySelector companies={mockCompanies} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByText("Otra Empresa SRL"));
    expect(mockOnSelect).toHaveBeenCalledWith(mockCompanies[1]);
  });

  it("handles company with empty CUIT", () => {
    const companiesWithEmptyCuit: AFIPCompany[] = [
      {
        razonSocial: "Empresa Sin CUIT",
        cuit: "",
        index: 0,
      },
    ];
    render(<CompanySelector companies={companiesWithEmptyCuit} onSelect={mockOnSelect} />);
    expect(screen.getByText("Empresa Sin CUIT")).toBeInTheDocument();
    expect(screen.queryByText(/CUIT:/)).not.toBeInTheDocument();
  });

  it("handles CUIT with non-standard length", () => {
    const companiesWithShortCuit: AFIPCompany[] = [
      {
        razonSocial: "Empresa CUIT Corto",
        cuit: "12345",
        index: 0,
      },
    ];
    render(<CompanySelector companies={companiesWithShortCuit} onSelect={mockOnSelect} />);
    // Should display the CUIT as-is without formatting
    expect(screen.getByText("CUIT: 12345")).toBeInTheDocument();
  });
});
