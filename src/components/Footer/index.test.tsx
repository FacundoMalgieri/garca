import { describe, expect, it } from "vitest";

import { Footer } from "./index";

import { render, screen } from "@testing-library/react";

describe("Footer", () => {
  it("should render the footer", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("should display GARCA title", () => {
    render(<Footer />);
    expect(screen.getByText("GARCA")).toBeInTheDocument();
  });

  it("should display disclaimer", () => {
    render(<Footer />);
    expect(screen.getByText(/No afiliado con ARCA/)).toBeInTheDocument();
  });

  it("should display navigation links", () => {
    render(<Footer />);
    expect(screen.getByText("Privacidad")).toBeInTheDocument();
    expect(screen.getByText("Términos")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("should display copyright with current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });
});
