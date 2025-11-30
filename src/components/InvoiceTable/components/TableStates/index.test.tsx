import { describe, expect, it } from "vitest";

import { EmptyState, ErrorState, LoadingState } from "./index";

import { render, screen } from "@testing-library/react";

describe("TableStates", () => {
  describe("LoadingState", () => {
    it("should render with default message", () => {
      render(<LoadingState />);
      expect(screen.getByText("Consultando ARCA...")).toBeInTheDocument();
      expect(screen.getByText("Esto puede tomar entre 30-60 segundos")).toBeInTheDocument();
    });

    it("should render with custom message", () => {
      render(<LoadingState message="Cargando datos..." />);
      expect(screen.getByText("Cargando datos...")).toBeInTheDocument();
    });

    it("should render spinner", () => {
      const { container } = render(<LoadingState />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("ErrorState", () => {
    it("should render error message", () => {
      render(<ErrorState error="Error de conexión" errorCode={null} />);
      expect(screen.getByText(/Error de conexión/)).toBeInTheDocument();
    });

    it("should render with error code", () => {
      render(<ErrorState error="Error" errorCode="INVALID_CREDENTIALS" />);
      expect(screen.getByText(/Credenciales inválidas/)).toBeInTheDocument();
    });

    it("should have destructive styling", () => {
      const { container } = render(<ErrorState error="Error" errorCode={null} />);
      const errorDiv = container.querySelector(".bg-destructive\\/10");
      expect(errorDiv).toBeInTheDocument();
    });
  });

  describe("EmptyState", () => {
    it("should render empty state message", () => {
      render(<EmptyState />);
      expect(screen.getByText("No hay comprobantes cargados aún")).toBeInTheDocument();
      expect(screen.getByText("Ingresá tus credenciales para consultar")).toBeInTheDocument();
    });

    it("should render icon", () => {
      const { container } = render(<EmptyState />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });
});
