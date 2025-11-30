import { describe, expect, it, vi } from "vitest";

import { FilterBar } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

describe("FilterBar", () => {
  const defaultProps = {
    filters: {
      searchText: "",
      filterTipo: "all",
      filterMoneda: "all",
      minMonto: "",
      maxMonto: "",
    },
    uniqueTypes: ["Factura C", "Factura E"],
    activeFiltersCount: 0,
    onSearchTextChange: vi.fn(),
    onFilterTipoChange: vi.fn(),
    onFilterMonedaChange: vi.fn(),
    onMinMontoChange: vi.fn(),
    onMaxMontoChange: vi.fn(),
    onClearFilters: vi.fn(),
  };

  it("should render search input", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText("Número o receptor...")).toBeInTheDocument();
  });

  it("should render tipo dropdown", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText("Tipo de Factura")).toBeInTheDocument();
  });

  it("should render moneda dropdown", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText("Moneda")).toBeInTheDocument();
  });

  it("should render monto inputs", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("∞")).toBeInTheDocument();
  });

  it("should call onSearchTextChange when typing", () => {
    const onSearchTextChange = vi.fn();
    render(<FilterBar {...defaultProps} onSearchTextChange={onSearchTextChange} />);

    fireEvent.change(screen.getByPlaceholderText("Número o receptor..."), { target: { value: "test" } });
    expect(onSearchTextChange).toHaveBeenCalledWith("test");
  });

  it("should call onMinMontoChange when typing min amount", () => {
    const onMinMontoChange = vi.fn();
    render(<FilterBar {...defaultProps} onMinMontoChange={onMinMontoChange} />);

    fireEvent.change(screen.getByPlaceholderText("0"), { target: { value: "1000" } });
    expect(onMinMontoChange).toHaveBeenCalledWith("1000");
  });

  it("should call onMaxMontoChange when typing max amount", () => {
    const onMaxMontoChange = vi.fn();
    render(<FilterBar {...defaultProps} onMaxMontoChange={onMaxMontoChange} />);

    fireEvent.change(screen.getByPlaceholderText("∞"), { target: { value: "5000" } });
    expect(onMaxMontoChange).toHaveBeenCalledWith("5000");
  });

  it("should not show clear button when no active filters", () => {
    render(<FilterBar {...defaultProps} activeFiltersCount={0} />);
    expect(screen.queryByText("Limpiar filtros")).not.toBeInTheDocument();
  });

  it("should show clear button when there are active filters", () => {
    render(<FilterBar {...defaultProps} activeFiltersCount={2} />);
    expect(screen.getByText("Limpiar filtros")).toBeInTheDocument();
  });

  it("should call onClearFilters when clear button is clicked", () => {
    const onClearFilters = vi.fn();
    render(<FilterBar {...defaultProps} activeFiltersCount={2} onClearFilters={onClearFilters} />);

    fireEvent.click(screen.getByText("Limpiar filtros"));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("should display current filter values", () => {
    const filters = {
      searchText: "test search",
      filterTipo: "all",
      filterMoneda: "all",
      minMonto: "100",
      maxMonto: "500",
    };

    render(<FilterBar {...defaultProps} filters={filters} />);

    expect(screen.getByDisplayValue("test search")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
  });

  it("should render labels for all filter fields", () => {
    render(<FilterBar {...defaultProps} />);

    expect(screen.getByText("Buscar")).toBeInTheDocument();
    expect(screen.getByText("Tipo de Factura")).toBeInTheDocument();
    expect(screen.getByText("Moneda")).toBeInTheDocument();
    expect(screen.getByText("Monto Mínimo")).toBeInTheDocument();
    expect(screen.getByText("Monto Máximo")).toBeInTheDocument();
  });
});
