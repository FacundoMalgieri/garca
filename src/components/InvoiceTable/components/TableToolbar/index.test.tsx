import { describe, expect, it, vi } from "vitest";

import { TableToolbar } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

describe("TableToolbar", () => {
  it("should return null when hasInvoices is false", () => {
    const { container } = render(<TableToolbar showFilters={false} onToggleFilters={vi.fn()} hasInvoices={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when hasInvoices is true", () => {
    render(<TableToolbar showFilters={false} onToggleFilters={vi.fn()} hasInvoices={true} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should display 'Filtros' when showFilters is false", () => {
    render(<TableToolbar showFilters={false} onToggleFilters={vi.fn()} hasInvoices={true} />);
    expect(screen.getByText("Filtros")).toBeInTheDocument();
  });

  it("should display 'Ocultar' when showFilters is true", () => {
    render(<TableToolbar showFilters={true} onToggleFilters={vi.fn()} hasInvoices={true} />);
    expect(screen.getByText("Ocultar")).toBeInTheDocument();
  });

  it("should call onToggleFilters when button is clicked", () => {
    const mockToggle = vi.fn();
    render(<TableToolbar showFilters={false} onToggleFilters={mockToggle} hasInvoices={true} />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
