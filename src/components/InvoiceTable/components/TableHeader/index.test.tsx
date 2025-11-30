import { beforeEach,describe, expect, it, vi } from "vitest";

import type { SortDirection, SortField } from "../../types";
import { TableHeader } from "./index";

import { fireEvent,render, screen } from "@testing-library/react";

describe("TableHeader", () => {
  const mockOnSort = vi.fn();

  const defaultProps = {
    sortField: "fecha" as SortField,
    sortDirection: "desc" as SortDirection,
    onSort: mockOnSort,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(TableHeader).toBeDefined();
  });

  it("renders all column headers", () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Número")).toBeInTheDocument();
    expect(screen.getByText("Moneda")).toBeInTheDocument();
    expect(screen.getByText("Total (Extranjera/ARS)")).toBeInTheDocument();
    expect(screen.getByText("Total en Pesos")).toBeInTheDocument();
  });

  it("calls onSort with correct field when Fecha is clicked", () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    fireEvent.click(screen.getByText("Fecha"));
    expect(mockOnSort).toHaveBeenCalledWith("fecha");
  });

  it("calls onSort with correct field when Tipo is clicked", () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    fireEvent.click(screen.getByText("Tipo"));
    expect(mockOnSort).toHaveBeenCalledWith("tipo");
  });

  it("calls onSort with correct field when Número is clicked", () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    fireEvent.click(screen.getByText("Número"));
    expect(mockOnSort).toHaveBeenCalledWith("numero");
  });

  it("calls onSort with correct field when Moneda is clicked", () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    fireEvent.click(screen.getByText("Moneda"));
    expect(mockOnSort).toHaveBeenCalledWith("moneda");
  });

  it("calls onSort with correct field when Total is clicked", () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    fireEvent.click(screen.getByText("Total (Extranjera/ARS)"));
    expect(mockOnSort).toHaveBeenCalledWith("total");
  });

  it("calls onSort with correct field when Total en Pesos is clicked", () => {
    render(
      <table>
        <TableHeader {...defaultProps} />
      </table>
    );

    fireEvent.click(screen.getByText("Total en Pesos"));
    expect(mockOnSort).toHaveBeenCalledWith("totalPesos");
  });

  it("renders with different sort field", () => {
    render(
      <table>
        <TableHeader {...defaultProps} sortField="tipo" />
      </table>
    );

    // Component should still render all columns
    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
  });

  it("renders with ascending sort direction", () => {
    render(
      <table>
        <TableHeader {...defaultProps} sortDirection="asc" />
      </table>
    );

    // Component should still render all columns
    expect(screen.getByText("Fecha")).toBeInTheDocument();
  });

  it("renders with descending sort direction", () => {
    render(
      <table>
        <TableHeader {...defaultProps} sortDirection="desc" />
      </table>
    );

    expect(screen.getByText("Fecha")).toBeInTheDocument();
  });
});
