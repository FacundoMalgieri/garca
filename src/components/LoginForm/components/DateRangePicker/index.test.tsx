import { describe, expect, it, vi } from "vitest";

import { DateRangePicker } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

describe("DateRangePicker", () => {
  const defaultProps = {
    fechaDesde: "2025-01-01",
    fechaHasta: "2025-11-29",
    onFechaDesdeChange: vi.fn(),
    onFechaHastaChange: vi.fn(),
    error: null,
    maxDate: "2025-11-29",
  };

  it("renders both date inputs", () => {
    render(<DateRangePicker {...defaultProps} />);

    expect(screen.getByLabelText("Desde")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasta")).toBeInTheDocument();
  });

  it("displays the correct values", () => {
    render(<DateRangePicker {...defaultProps} />);

    expect(screen.getByLabelText("Desde")).toHaveValue("2025-01-01");
    expect(screen.getByLabelText("Hasta")).toHaveValue("2025-11-29");
  });

  it("calls onFechaDesdeChange when desde input changes", () => {
    render(<DateRangePicker {...defaultProps} />);

    const desdeInput = screen.getByLabelText("Desde");
    fireEvent.change(desdeInput, { target: { value: "2025-02-01" } });

    expect(defaultProps.onFechaDesdeChange).toHaveBeenCalledWith("2025-02-01");
  });

  it("calls onFechaHastaChange when hasta input changes", () => {
    render(<DateRangePicker {...defaultProps} />);

    const hastaInput = screen.getByLabelText("Hasta");
    fireEvent.change(hastaInput, { target: { value: "2025-10-15" } });

    expect(defaultProps.onFechaHastaChange).toHaveBeenCalledWith("2025-10-15");
  });

  it("disables inputs when disabled prop is true", () => {
    render(<DateRangePicker {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText("Desde")).toBeDisabled();
    expect(screen.getByLabelText("Hasta")).toBeDisabled();
  });

  it("displays error message when error prop is provided", () => {
    render(<DateRangePicker {...defaultProps} error="El rango no puede superar 1 año" />);

    expect(screen.getByText("El rango no puede superar 1 año")).toBeInTheDocument();
  });

  it("does not display error message when error is null", () => {
    render(<DateRangePicker {...defaultProps} error={null} />);

    expect(screen.queryByText(/El rango/)).not.toBeInTheDocument();
  });

  it("sets max attribute on desde input based on fechaHasta", () => {
    render(<DateRangePicker {...defaultProps} />);

    const desdeInput = screen.getByLabelText("Desde");
    expect(desdeInput).toHaveAttribute("max", "2025-11-29");
  });

  it("sets min attribute on hasta input based on fechaDesde", () => {
    render(<DateRangePicker {...defaultProps} />);

    const hastaInput = screen.getByLabelText("Hasta");
    expect(hastaInput).toHaveAttribute("min", "2025-01-01");
  });

  it("sets max attribute on hasta input based on maxDate prop", () => {
    render(<DateRangePicker {...defaultProps} maxDate="2025-12-31" />);

    const hastaInput = screen.getByLabelText("Hasta");
    expect(hastaInput).toHaveAttribute("max", "2025-12-31");
  });

  it("renders the period label", () => {
    render(<DateRangePicker {...defaultProps} />);

    expect(screen.getByText("Período de consulta")).toBeInTheDocument();
  });

  it("renders the help text", () => {
    render(<DateRangePicker {...defaultProps} />);

    expect(screen.getByText("Máximo 1 año de consulta. Por defecto: año actual.")).toBeInTheDocument();
  });
});
