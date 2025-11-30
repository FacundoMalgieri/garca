import { describe, expect, it, vi } from "vitest";

import { ExportDropdown } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

describe("ExportDropdown", () => {
  const defaultProps = {
    onExportPDF: vi.fn(),
    onExportCSV: vi.fn(),
    onExportJSON: vi.fn(),
  };

  it("renders the export button", () => {
    render(<ExportDropdown {...defaultProps} />);

    expect(screen.getByText("Exportar")).toBeInTheDocument();
  });

  it("shows dropdown items when clicked", () => {
    render(<ExportDropdown {...defaultProps} />);

    const trigger = screen.getByText("Exportar").closest("button") as HTMLElement;
    fireEvent.click(trigger);

    expect(screen.getByText("PDF")).toBeInTheDocument();
    expect(screen.getByText("CSV")).toBeInTheDocument();
    expect(screen.getByText("JSON")).toBeInTheDocument();
  });

  it("calls onExportPDF when PDF option is clicked", () => {
    render(<ExportDropdown {...defaultProps} />);

    const trigger = screen.getByText("Exportar").closest("button") as HTMLElement;
    fireEvent.click(trigger);

    const pdfOption = screen.getByText("PDF");
    fireEvent.click(pdfOption);

    expect(defaultProps.onExportPDF).toHaveBeenCalled();
  });

  it("calls onExportCSV when CSV option is clicked", () => {
    render(<ExportDropdown {...defaultProps} />);

    const trigger = screen.getByText("Exportar").closest("button") as HTMLElement;
    fireEvent.click(trigger);

    const csvOption = screen.getByText("CSV");
    fireEvent.click(csvOption);

    expect(defaultProps.onExportCSV).toHaveBeenCalled();
  });

  it("calls onExportJSON when JSON option is clicked", () => {
    render(<ExportDropdown {...defaultProps} />);

    const trigger = screen.getByText("Exportar").closest("button") as HTMLElement;
    fireEvent.click(trigger);

    const jsonOption = screen.getByText("JSON");
    fireEvent.click(jsonOption);

    expect(defaultProps.onExportJSON).toHaveBeenCalled();
  });

  it("disables button when disabled prop is true", () => {
    render(<ExportDropdown {...defaultProps} disabled={true} />);

    const trigger = screen.getByText("Exportar").closest("button");
    expect(trigger).toBeDisabled();
  });

  it("enables button when disabled prop is false", () => {
    render(<ExportDropdown {...defaultProps} disabled={false} />);

    const trigger = screen.getByText("Exportar").closest("button");
    expect(trigger).not.toBeDisabled();
  });

  it("enables button when disabled prop is undefined", () => {
    render(<ExportDropdown {...defaultProps} />);

    const trigger = screen.getByText("Exportar").closest("button");
    expect(trigger).not.toBeDisabled();
  });

  it("applies custom className", () => {
    const { container } = render(<ExportDropdown {...defaultProps} className="custom-class" />);

    // The className is applied to the ActionDropdown wrapper (relative div)
    const wrapper = container.querySelector(".custom-class");
    expect(wrapper).toBeInTheDocument();
  });

  it("works without className prop", () => {
    const { container } = render(<ExportDropdown {...defaultProps} />);

    // Should render without crashing
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("renders all icon components", () => {
    render(<ExportDropdown {...defaultProps} />);

    // Open dropdown to render icons
    const trigger = screen.getByText("Exportar").closest("button") as HTMLElement;
    fireEvent.click(trigger);

    // Check that SVG icons are rendered (they're inside the dropdown items)
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});
