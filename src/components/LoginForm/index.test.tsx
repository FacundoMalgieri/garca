import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AFIPCompany } from "@/types/afip-scraper";

import { LoginForm } from "./index";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// Mock child components
vi.mock("./components/CuitInput", () => ({
  CuitInput: ({
    value,
    onChange,
    disabled,
  }: {
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
  }) => (
    <input
      data-testid="cuit-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="CUIT"
    />
  ),
}));

vi.mock("./components/PasswordInput", () => ({
  PasswordInput: ({
    value,
    onChange,
    disabled,
  }: {
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
  }) => (
    <input
      data-testid="password-input"
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Password"
    />
  ),
}));

vi.mock("./components/DateRangePicker", () => ({
  DateRangePicker: ({
    fechaDesde,
    fechaHasta,
    onFechaDesdeChange,
    onFechaHastaChange,
    error,
    disabled,
  }: {
    fechaDesde: string;
    fechaHasta: string;
    onFechaDesdeChange: (v: string) => void;
    onFechaHastaChange: (v: string) => void;
    error: string | null;
    disabled: boolean;
  }) => (
    <div data-testid="date-range-picker">
      <input
        data-testid="fecha-desde"
        type="date"
        value={fechaDesde}
        onChange={(e) => onFechaDesdeChange(e.target.value)}
        disabled={disabled}
      />
      <input
        data-testid="fecha-hasta"
        type="date"
        value={fechaHasta}
        onChange={(e) => onFechaHastaChange(e.target.value)}
        disabled={disabled}
      />
      {error && <span data-testid="date-error">{error}</span>}
    </div>
  ),
}));

vi.mock("./components/PrivacyBanner", () => ({
  PrivacyBanner: () => <div data-testid="privacy-banner">Privacy Banner</div>,
}));

vi.mock("@/components/CompanySelector", () => ({
  CompanySelector: ({
    companies,
    onSelect,
  }: {
    companies: AFIPCompany[];
    onSelect: (company: AFIPCompany) => void;
  }) => (
    <div data-testid="company-selector">
      {companies.map((company) => (
        <button key={company.index} data-testid={`company-${company.index}`} onClick={() => onSelect(company)}>
          {company.razonSocial}
        </button>
      ))}
    </div>
  ),
}));

// Mock TurnstileWidget to auto-trigger onSuccess with a mock token
vi.mock("@/components/TurnstileWidget", () => ({
  TurnstileWidget: ({ onSuccess }: { onSuccess: (token: string) => void }) => {
    // Use React's useEffect to call onSuccess after component mounts
    const { useEffect } = require("react");
    useEffect(() => {
      onSuccess("mock-turnstile-token");
    }, [onSuccess]);
    return <div data-testid="turnstile-widget">Turnstile</div>;
  },
}));

describe("LoginForm", () => {
  const mockOnFetchCompanies = vi.fn();
  const mockOnSelectCompany = vi.fn();

  const defaultProps = {
    onFetchCompanies: mockOnFetchCompanies,
    onSelectCompany: mockOnSelectCompany,
    isLoadingCompanies: false,
    isLoadingInvoices: false,
    error: null,
    companies: [] as AFIPCompany[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Credentials Step", () => {
    it("renders the login form", () => {
      render(<LoginForm {...defaultProps} />);

      expect(screen.getByText("Acceso con Clave Fiscal")).toBeInTheDocument();
      expect(screen.getByTestId("cuit-input")).toBeInTheDocument();
      expect(screen.getByTestId("password-input")).toBeInTheDocument();
      expect(screen.getByTestId("date-range-picker")).toBeInTheDocument();
      expect(screen.getByTestId("privacy-banner")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
    });

    it("disables submit button when fields are empty", () => {
      render(<LoginForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /continuar/i });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when CUIT and password are filled", () => {
      render(<LoginForm {...defaultProps} />);

      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");

      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      const submitButton = screen.getByRole("button", { name: /continuar/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("calls onFetchCompanies when form is submitted", async () => {
      mockOnFetchCompanies.mockResolvedValue(true);
      render(<LoginForm {...defaultProps} />);

      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");

      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      const submitButton = screen.getByRole("button", { name: /continuar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Third argument is the turnstile token from the mocked TurnstileWidget
        expect(mockOnFetchCompanies).toHaveBeenCalledWith("20345678901", "mypassword", "mock-turnstile-token");
      });
    });

    it("does not submit when CUIT is empty", async () => {
      render(<LoginForm {...defaultProps} />);

      const passwordInput = screen.getByTestId("password-input");
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      const form = screen.getByRole("button", { name: /continuar/i }).closest("form") as globalThis.HTMLFormElement;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnFetchCompanies).not.toHaveBeenCalled();
      });
    });

    it("shows loading state when fetching companies", () => {
      render(<LoginForm {...defaultProps} isLoadingCompanies={true} />);

      // First message in the progressive loading sequence
      expect(screen.getByText(/verificando seguridad/i)).toBeInTheDocument();
    });

    it("disables inputs when loading", () => {
      render(<LoginForm {...defaultProps} isLoadingCompanies={true} />);

      expect(screen.getByTestId("cuit-input")).toBeDisabled();
      expect(screen.getByTestId("password-input")).toBeDisabled();
    });

    it("displays error message when error prop is provided", () => {
      render(<LoginForm {...defaultProps} error="Credenciales inválidas" />);

      expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
    });

    it("saves CUIT to localStorage when remember is checked", async () => {
      mockOnFetchCompanies.mockResolvedValue(true);
      render(<LoginForm {...defaultProps} />);

      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      const rememberCheckbox = screen.getByRole("checkbox", { name: /recordar mi cuit/i });

      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });
      fireEvent.click(rememberCheckbox);

      const submitButton = screen.getByRole("button", { name: /continuar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("garca_afip_cuit")).toBe("20345678901");
      });
    });

    it("removes CUIT from localStorage when remember is unchecked", async () => {
      localStorage.setItem("garca_afip_cuit", "20345678901");
      mockOnFetchCompanies.mockResolvedValue(true);
      render(<LoginForm {...defaultProps} />);

      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      const rememberCheckbox = screen.getByRole("checkbox", { name: /recordar mi cuit/i });

      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      // The checkbox is checked by default when CUIT was saved, so uncheck it
      if ((rememberCheckbox as globalThis.HTMLInputElement).checked) {
        fireEvent.click(rememberCheckbox);
      }

      const submitButton = screen.getByRole("button", { name: /continuar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("garca_afip_cuit")).toBeNull();
      });
    });
  });

  describe("Company Selection Step", () => {
    const companiesProps = {
      ...defaultProps,
      companies: [
        { cuit: "20345678901", razonSocial: "Mi Empresa SA", index: 0 },
        { cuit: "30709876543", razonSocial: "Otra Empresa SRL", index: 1 },
      ],
    };

    it("shows company selector after successful login", async () => {
      mockOnFetchCompanies.mockResolvedValue(true);
      const { rerender } = render(<LoginForm {...defaultProps} />);

      // Fill and submit form
      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      const submitButton = screen.getByRole("button", { name: /continuar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnFetchCompanies).toHaveBeenCalled();
      });

      // Rerender with companies
      rerender(<LoginForm {...companiesProps} />);

      // Now it should show company selector
      expect(screen.getByTestId("company-selector")).toBeInTheDocument();
      expect(screen.getByText("Mi Empresa SA")).toBeInTheDocument();
      expect(screen.getByText("Otra Empresa SRL")).toBeInTheDocument();
    });

    it("calls onSelectCompany when a company is selected", async () => {
      mockOnFetchCompanies.mockResolvedValue(true);
      const { rerender } = render(<LoginForm {...defaultProps} />);

      // Fill and submit form
      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      const submitButton = screen.getByRole("button", { name: /continuar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnFetchCompanies).toHaveBeenCalled();
      });

      // Rerender with companies
      rerender(<LoginForm {...companiesProps} />);

      // Select a company
      fireEvent.click(screen.getByTestId("company-0"));

      expect(mockOnSelectCompany).toHaveBeenCalledWith(
        "20345678901",
        "mypassword",
        0,
        expect.objectContaining({ from: expect.any(String), to: expect.any(String) }),
        "mock-turnstile-token" // turnstile token from the mocked TurnstileWidget
      );
    });

    it("shows back button when not loading invoices", async () => {
      mockOnFetchCompanies.mockResolvedValue(true);
      const { rerender } = render(<LoginForm {...defaultProps} />);

      // Fill and submit form
      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

      await waitFor(() => {
        expect(mockOnFetchCompanies).toHaveBeenCalled();
      });

      rerender(<LoginForm {...companiesProps} />);

      expect(screen.getByText(/volver a ingresar credenciales/i)).toBeInTheDocument();
    });

    it("hides back button when loading invoices", async () => {
      mockOnFetchCompanies.mockResolvedValue(true);
      const { rerender } = render(<LoginForm {...defaultProps} />);

      // Fill and submit form
      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

      await waitFor(() => {
        expect(mockOnFetchCompanies).toHaveBeenCalled();
      });

      rerender(<LoginForm {...companiesProps} isLoadingInvoices={true} />);

      expect(screen.queryByText(/volver a ingresar credenciales/i)).not.toBeInTheDocument();
    });

    it("shows error in company selection step", async () => {
      mockOnFetchCompanies.mockResolvedValue(true);
      const { rerender } = render(<LoginForm {...defaultProps} />);

      // Fill and submit form
      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

      await waitFor(() => {
        expect(mockOnFetchCompanies).toHaveBeenCalled();
      });

      rerender(<LoginForm {...companiesProps} error="Error al cargar facturas" />);

      expect(screen.getByText("Error al cargar facturas")).toBeInTheDocument();
    });

    it("goes back to credentials step when back button is clicked", async () => {
      mockOnFetchCompanies.mockResolvedValue(true);
      const { rerender } = render(<LoginForm {...defaultProps} />);

      // Fill and submit form
      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });

      fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

      await waitFor(() => {
        expect(mockOnFetchCompanies).toHaveBeenCalled();
      });

      rerender(<LoginForm {...companiesProps} />);

      // Click back button
      fireEvent.click(screen.getByText(/volver a ingresar credenciales/i));

      // Rerender with empty companies to simulate going back
      rerender(<LoginForm {...defaultProps} />);

      // Should show login form again
      expect(screen.getByText("Acceso con Clave Fiscal")).toBeInTheDocument();
    });
  });

  describe("Date Range Validation", () => {
    it("shows date error when range is invalid", async () => {
      render(<LoginForm {...defaultProps} />);

      const fechaDesde = screen.getByTestId("fecha-desde");
      const fechaHasta = screen.getByTestId("fecha-hasta");

      // Set invalid range (more than 1 year)
      fireEvent.change(fechaDesde, { target: { value: "2023-01-01" } });
      fireEvent.change(fechaHasta, { target: { value: "2024-06-01" } });

      // The error should be displayed
      expect(screen.getByTestId("date-error")).toBeInTheDocument();
    });

    it("does not submit when date range is invalid", async () => {
      render(<LoginForm {...defaultProps} />);

      const cuitInput = screen.getByTestId("cuit-input");
      const passwordInput = screen.getByTestId("password-input");
      const fechaDesde = screen.getByTestId("fecha-desde");
      const fechaHasta = screen.getByTestId("fecha-hasta");

      fireEvent.change(cuitInput, { target: { value: "20345678901" } });
      fireEvent.change(passwordInput, { target: { value: "mypassword" } });
      fireEvent.change(fechaDesde, { target: { value: "2023-01-01" } });
      fireEvent.change(fechaHasta, { target: { value: "2024-06-01" } });

      const form = screen.getByRole("button", { name: /continuar/i }).closest("form") as globalThis.HTMLFormElement;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnFetchCompanies).not.toHaveBeenCalled();
      });
    });
  });
});
