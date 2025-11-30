import { describe, expect, it, vi } from "vitest";

import { CuitInput } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

describe("CuitInput", () => {
  it("should render input with label", () => {
    render(<CuitInput value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText("CUIT")).toBeInTheDocument();
  });

  it("should display the value", () => {
    render(<CuitInput value="20123456789" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("20123456789")).toBeInTheDocument();
  });

  it("should call onChange when typing", () => {
    const onChange = vi.fn();
    render(<CuitInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "20123" } });
    expect(onChange).toHaveBeenCalledWith("20123");
  });

  it("should strip non-numeric characters", () => {
    const onChange = vi.fn();
    render(<CuitInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "20-123-abc" } });
    expect(onChange).toHaveBeenCalledWith("20123");
  });

  it("should limit to 11 characters", () => {
    const onChange = vi.fn();
    render(<CuitInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "123456789012345" } });
    expect(onChange).toHaveBeenCalledWith("12345678901");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<CuitInput value="" onChange={vi.fn()} disabled={true} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should show helper text", () => {
    render(<CuitInput value="" onChange={vi.fn()} />);
    expect(screen.getByText(/Ingresá tu CUIT sin guiones/)).toBeInTheDocument();
  });

  it("should have placeholder", () => {
    render(<CuitInput value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("20123456789")).toBeInTheDocument();
  });
});
