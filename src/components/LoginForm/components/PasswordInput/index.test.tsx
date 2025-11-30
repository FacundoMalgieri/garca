import { describe, expect, it, vi } from "vitest";

import { PasswordInput } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

describe("PasswordInput", () => {
  it("should render input with label", () => {
    render(<PasswordInput value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  it("should display the value", () => {
    render(<PasswordInput value="secret123" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("secret123")).toBeInTheDocument();
  });

  it("should call onChange when typing", () => {
    const onChange = vi.fn();
    render(<PasswordInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "newpass" } });
    expect(onChange).toHaveBeenCalledWith("newpass");
  });

  it("should be password type by default", () => {
    render(<PasswordInput value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "password");
  });

  it("should toggle to text type when show button is clicked", () => {
    render(<PasswordInput value="" onChange={vi.fn()} />);

    // Click the toggle button
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "text");
  });

  it("should toggle back to password type on second click", () => {
    render(<PasswordInput value="" onChange={vi.fn()} />);

    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "password");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<PasswordInput value="" onChange={vi.fn()} disabled={true} />);
    expect(screen.getByLabelText("Contraseña")).toBeDisabled();
  });

  it("should show helper text", () => {
    render(<PasswordInput value="" onChange={vi.fn()} />);
    expect(screen.getByText(/Tu contraseña de ARCA/)).toBeInTheDocument();
  });

  it("should have placeholder", () => {
    render(<PasswordInput value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });
});
