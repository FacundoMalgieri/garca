import { describe, expect, it, vi } from "vitest";

import { ActionDropdown, ActionDropdownItem, Dropdown } from "./Dropdown";

import { fireEvent, render, screen } from "@testing-library/react";

describe("Dropdown", () => {
  const options = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ];

  it("should render with placeholder when no value selected", () => {
    render(<Dropdown options={options} value="" onChange={vi.fn()} placeholder="Select..." />);
    expect(screen.getByText("Select...")).toBeInTheDocument();
  });

  it("should display selected option label", () => {
    render(<Dropdown options={options} value="b" onChange={vi.fn()} />);
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("should open menu when clicked", () => {
    render(<Dropdown options={options} value="" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  it("should call onChange when option is selected", () => {
    const onChange = vi.fn();
    render(<Dropdown options={options} value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Option B"));

    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("should close menu after selection", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Dropdown options={options} value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Option A"));

    // Simulate parent updating the value after onChange
    rerender(<Dropdown options={options} value="a" onChange={onChange} />);

    // Menu should be closed - Option A should only appear in the button, not in a menu
    expect(screen.queryAllByText("Option A")).toHaveLength(1);
  });

  it("should close menu when clicking outside", () => {
    render(
      <div>
        <Dropdown options={options} value="" onChange={vi.fn()} />
        <div data-testid="outside">Outside</div>
      </div>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Option A")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByText("Option A")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Dropdown options={options} value="" onChange={vi.fn()} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should highlight selected option in menu", () => {
    render(<Dropdown options={options} value="b" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button"));

    // The selected option should have primary background
    // The first button is the trigger, the rest are menu items
    const buttons = screen.getAllByRole("button");
    // Filter to menu items only (skip trigger)
    const menuButtons = buttons.slice(1);
    const selectedButton = menuButtons.find((btn) => btn.textContent === "Option B");
    expect(selectedButton).toHaveClass("bg-primary");
  });

  it("should render option with icon", () => {
    const optionsWithIcon = [{ value: "a", label: "Option A", icon: <span data-testid="icon">🔥</span> }];

    render(<Dropdown options={optionsWithIcon} value="a" onChange={vi.fn()} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

describe("ActionDropdown", () => {
  it("should render trigger", () => {
    render(
      <ActionDropdown trigger={<button>Trigger</button>}>
        <ActionDropdownItem>Item 1</ActionDropdownItem>
      </ActionDropdown>
    );

    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });

  it("should open menu when trigger is clicked", () => {
    render(
      <ActionDropdown trigger={<button>Trigger</button>}>
        <ActionDropdownItem>Item 1</ActionDropdownItem>
      </ActionDropdown>
    );

    fireEvent.click(screen.getByText("Trigger"));
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("should close menu when item is clicked", () => {
    render(
      <ActionDropdown trigger={<button>Trigger</button>}>
        <ActionDropdownItem>Item 1</ActionDropdownItem>
      </ActionDropdown>
    );

    fireEvent.click(screen.getByText("Trigger"));
    fireEvent.click(screen.getByText("Item 1"));

    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });
});

describe("ActionDropdownItem", () => {
  it("should render children", () => {
    render(<ActionDropdownItem>Test Item</ActionDropdownItem>);
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ActionDropdownItem onClick={onClick}>Test Item</ActionDropdownItem>);

    fireEvent.click(screen.getByText("Test Item"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render with icon", () => {
    render(<ActionDropdownItem icon={<span data-testid="item-icon">📄</span>}>Test Item</ActionDropdownItem>);
    expect(screen.getByTestId("item-icon")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(<ActionDropdownItem className="custom-item">Test Item</ActionDropdownItem>);
    expect(screen.getByRole("button")).toHaveClass("custom-item");
  });
});

