import { describe, expect, it, vi } from "vitest";

import { MobileSortPanel, TableToolbar } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

const defaultProps = {
  showFilters: false,
  onToggleFilters: vi.fn(),
  hasInvoices: true,
  showSortMenu: false,
  onToggleSortMenu: vi.fn(),
};

describe("TableToolbar", () => {
  it("should return null when hasInvoices is false", () => {
    const { container } = render(<TableToolbar {...defaultProps} hasInvoices={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when hasInvoices is true", () => {
    render(<TableToolbar {...defaultProps} />);
    expect(screen.getByText("Filtros")).toBeInTheDocument();
  });

  it("should display 'Filtros' when showFilters is false", () => {
    render(<TableToolbar {...defaultProps} showFilters={false} />);
    expect(screen.getByText("Filtros")).toBeInTheDocument();
  });

  it("should display 'Ocultar' when showFilters is true", () => {
    render(<TableToolbar {...defaultProps} showFilters={true} />);
    expect(screen.getByText("Ocultar")).toBeInTheDocument();
  });

  it("should call onToggleFilters when filter button is clicked", () => {
    const mockToggle = vi.fn();
    render(<TableToolbar {...defaultProps} onToggleFilters={mockToggle} />);

    fireEvent.click(screen.getByText("Filtros"));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should display 'Ordenar' when showSortMenu is false", () => {
    render(<TableToolbar {...defaultProps} showSortMenu={false} />);
    expect(screen.getByText("Ordenar")).toBeInTheDocument();
  });

  it("should display 'Cerrar' when showSortMenu is true", () => {
    render(<TableToolbar {...defaultProps} showSortMenu={true} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("should call onToggleSortMenu when sort button is clicked", () => {
    const mockToggle = vi.fn();
    render(<TableToolbar {...defaultProps} onToggleSortMenu={mockToggle} />);

    fireEvent.click(screen.getByText("Ordenar"));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});

describe("MobileSortPanel", () => {
  const sortPanelProps = {
    sortField: "fecha" as const,
    sortDirection: "desc" as const,
    onSort: vi.fn(),
    onDirectionChange: vi.fn(),
  };

  it("should render all sort options", () => {
    render(<MobileSortPanel {...sortPanelProps} />);

    // Use getAllByRole to find buttons with specific text
    const buttons = screen.getAllByRole("button");
    const sortOptionTexts = ["Fecha", "Tipo", "Número", "Moneda", "Total extranjera", "Total ARS"];
    
    sortOptionTexts.forEach(text => {
      const button = buttons.find(btn => btn.textContent?.includes(text));
      expect(button).toBeDefined();
    });
  });

  it("should render direction buttons", () => {
    render(<MobileSortPanel {...sortPanelProps} />);

    expect(screen.getByText("↑ Ascendente")).toBeInTheDocument();
    expect(screen.getByText("↓ Descendente")).toBeInTheDocument();
  });

  it("should call onSort when a sort option is clicked", () => {
    const mockOnSort = vi.fn();
    render(<MobileSortPanel {...sortPanelProps} onSort={mockOnSort} />);

    fireEvent.click(screen.getByText("Tipo"));
    expect(mockOnSort).toHaveBeenCalledWith("tipo");
  });

  it("should call onDirectionChange when ascending button is clicked", () => {
    const mockOnDirectionChange = vi.fn();
    render(<MobileSortPanel {...sortPanelProps} onDirectionChange={mockOnDirectionChange} />);

    fireEvent.click(screen.getByText("↑ Ascendente"));
    expect(mockOnDirectionChange).toHaveBeenCalledWith("asc");
  });

  it("should call onDirectionChange when descending button is clicked", () => {
    const mockOnDirectionChange = vi.fn();
    render(<MobileSortPanel {...sortPanelProps} onDirectionChange={mockOnDirectionChange} />);

    fireEvent.click(screen.getByText("↓ Descendente"));
    expect(mockOnDirectionChange).toHaveBeenCalledWith("desc");
  });

  it("should display current sort info with descending direction", () => {
    render(<MobileSortPanel {...sortPanelProps} sortField="fecha" sortDirection="desc" />);

    expect(screen.getByText(/Ordenando por:/)).toBeInTheDocument();
    expect(screen.getByText(/Z→A/)).toBeInTheDocument();
  });

  it("should display A→Z for ascending direction", () => {
    render(<MobileSortPanel {...sortPanelProps} sortDirection="asc" />);

    expect(screen.getByText(/A→Z/)).toBeInTheDocument();
  });

  it("should highlight the selected sort field button", () => {
    render(<MobileSortPanel {...sortPanelProps} sortField="tipo" />);

    // Find all buttons and check the one containing "Tipo" has the highlight class
    const buttons = screen.getAllByRole("button");
    const tipoButton = buttons.find(btn => btn.textContent?.includes("Tipo"));
    expect(tipoButton).toHaveClass("bg-primary/20");
  });

  it("should highlight the selected direction button", () => {
    render(<MobileSortPanel {...sortPanelProps} sortDirection="asc" />);

    const ascButton = screen.getByText("↑ Ascendente");
    expect(ascButton).toHaveClass("bg-primary");
  });

  it("should call onSort with correct values for each sort option", () => {
    const mockOnSort = vi.fn();
    render(<MobileSortPanel {...sortPanelProps} onSort={mockOnSort} />);

    // Test clicking on different sort options
    fireEvent.click(screen.getByText("Tipo"));
    expect(mockOnSort).toHaveBeenCalledWith("tipo");

    fireEvent.click(screen.getByText("Número"));
    expect(mockOnSort).toHaveBeenCalledWith("numero");

    fireEvent.click(screen.getByText("Moneda"));
    expect(mockOnSort).toHaveBeenCalledWith("moneda");

    fireEvent.click(screen.getByText("Total extranjera"));
    expect(mockOnSort).toHaveBeenCalledWith("total");

    fireEvent.click(screen.getByText("Total ARS"));
    expect(mockOnSort).toHaveBeenCalledWith("totalPesos");
  });

  it("should render section labels", () => {
    render(<MobileSortPanel {...sortPanelProps} />);

    expect(screen.getByText("Ordenar por")).toBeInTheDocument();
    expect(screen.getByText("Dirección")).toBeInTheDocument();
  });

  it("should show different sort field in summary when changed", () => {
    render(<MobileSortPanel {...sortPanelProps} sortField="numero" sortDirection="asc" />);

    // The summary should show "Número" in the strong tag - use selector to find the one in the summary
    const summaryDiv = screen.getByText(/Ordenando por:/).closest("div");
    const strongElement = summaryDiv?.querySelector("strong");
    expect(strongElement?.textContent).toBe("Número");
  });
});
