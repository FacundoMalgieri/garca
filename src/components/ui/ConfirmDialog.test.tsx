import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

import { fireEvent, render, screen } from "@testing-library/react";

describe("ConfirmDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: "Test Title",
    description: "Test Description",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
  });

  it("displays default button texts", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("displays custom button texts", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Sí, eliminar"
        cancelText="No, volver"
      />
    );
    expect(screen.getByText("Sí, eliminar")).toBeInTheDocument();
    expect(screen.getByText("No, volver")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm and onClose when confirm button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("Confirmar"));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);
    // Click on the outer container (backdrop)
    const backdrop = screen.getByRole("dialog").parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("does not call onClose when dialog content is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole("dialog"));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for other keys", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("has correct accessibility attributes", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
    expect(dialog).toHaveAttribute("aria-describedby", "dialog-description");
  });

  it("renders destructive variant with warning icon", () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />);
    // The warning icon should be present (check for SVG with destructive color)
    const icon = document.querySelector(".text-destructive");
    expect(icon).toBeInTheDocument();
  });

  it("renders default variant with question icon", () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />);
    // The question icon should be present (check for SVG with primary color)
    const icon = document.querySelector(".text-primary");
    expect(icon).toBeInTheDocument();
  });

  it("prevents body scroll when open", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(<ConfirmDialog {...defaultProps} />);
    rerender(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("moves focus inside the dialog when opened", () => {
    render(<ConfirmDialog {...defaultProps} />);
    // First focusable is the Cancelar button (safe default for a destructive dialog)
    expect(document.activeElement).toBe(screen.getByText("Cancelar"));
  });

  it("traps focus within the dialog (Tab from last wraps to first)", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const cancelBtn = screen.getByText("Cancelar");
    const confirmBtn = screen.getByText("Confirmar");

    // Move focus to the last focusable, then Tab should wrap back to the first
    confirmBtn.focus();
    expect(document.activeElement).toBe(confirmBtn);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(cancelBtn);

    // Shift+Tab from the first wraps back to the last
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(confirmBtn);
  });

  it("restores focus to the trigger when closed", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { rerender } = render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    rerender(<ConfirmDialog {...defaultProps} isOpen={true} />);
    // Focus moved into the dialog
    expect(document.activeElement).not.toBe(trigger);

    rerender(<ConfirmDialog {...defaultProps} isOpen={false} />);
    // Focus restored to the trigger element
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
  });

  it("dialog container is focusable as a fallback (tabIndex -1)", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("tabindex", "-1");
  });
});

