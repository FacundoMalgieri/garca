import { describe, expect, it, vi } from "vitest";

import { TableToolbar } from "./index";

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
});
