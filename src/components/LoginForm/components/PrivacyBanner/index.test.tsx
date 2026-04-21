import { describe, expect, it } from "vitest";

import { PrivacyBanner } from "./index";

import { render, screen } from "@testing-library/react";

describe("PrivacyBanner", () => {
  it("should render privacy title", () => {
    render(<PrivacyBanner />);
    expect(screen.getByText("Cómo cuidamos tus credenciales")).toBeInTheDocument();
  });

  it("should render privacy description", () => {
    render(<PrivacyBanner />);
    expect(screen.getByText(/Tu clave fiscal se cifra con AES-256/)).toBeInTheDocument();
    expect(
      screen.getByText(/Los comprobantes se guardan únicamente en/),
    ).toBeInTheDocument();
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
