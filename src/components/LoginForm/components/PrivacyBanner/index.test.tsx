import { describe, expect, it } from "vitest";

import { PrivacyBanner } from "./index";

import { render, screen } from "@testing-library/react";

describe("PrivacyBanner", () => {
  it("should render privacy title", () => {
    render(<PrivacyBanner />);
    expect(screen.getByText("Privacidad Garantizada")).toBeInTheDocument();
  });

  it("should render privacy description", () => {
    render(<PrivacyBanner />);
    expect(screen.getByText(/Los datos se almacenan únicamente en localStorage/)).toBeInTheDocument();
    expect(screen.getByText(/No se envían a servidores externos/)).toBeInTheDocument();
  });

  it("should render check icon", () => {
    const { container } = render(<PrivacyBanner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have success styling", () => {
    const { container } = render(<PrivacyBanner />);
    const banner = container.querySelector(".bg-success\\/10");
    expect(banner).toBeInTheDocument();
  });
});
