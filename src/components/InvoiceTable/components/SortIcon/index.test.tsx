import { describe, expect, it } from "vitest";

import { SortIcon } from "./index";

import { render } from "@testing-library/react";

describe("SortIcon", () => {
  it("should render neutral icon when field is not active", () => {
    const { container } = render(<SortIcon field="fecha" currentField="tipo" direction="asc" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-muted-foreground");
  });

  it("should render ascending icon when field is active and direction is asc", () => {
    const { container } = render(<SortIcon field="fecha" currentField="fecha" direction="asc" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-primary");
    // Check for up arrow path (M5 15l7-7 7 7)
    const path = container.querySelector("path");
    expect(path?.getAttribute("d")).toBe("M5 15l7-7 7 7");
  });

  it("should render descending icon when field is active and direction is desc", () => {
    const { container } = render(<SortIcon field="fecha" currentField="fecha" direction="desc" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-primary");
    // Check for down arrow path (M19 9l-7 7-7-7)
    const path = container.querySelector("path");
    expect(path?.getAttribute("d")).toBe("M19 9l-7 7-7-7");
  });
});
