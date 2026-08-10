import { beforeEach, describe, expect, it, vi } from "vitest";

import { LastSyncNotice } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

const mockState = { lastSyncedAt: null as number | null };
vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({ state: mockState }),
}));

describe("LastSyncNotice", () => {
  beforeEach(() => {
    mockState.lastSyncedAt = null;
  });

  it("muestra la fecha del último scrape", () => {
    mockState.lastSyncedAt = new Date(2026, 7, 10).getTime();
    render(<LastSyncNotice onRefresh={vi.fn()} />);
    expect(screen.getByText(/10\/08\/2026/)).toBeInTheDocument();
  });

  it("avisa cuándo hay que actualizar", () => {
    mockState.lastSyncedAt = new Date(2026, 7, 10).getTime();
    render(<LastSyncNotice onRefresh={vi.fn()} />);
    expect(screen.getByText(/Si emitís desde ARCA/)).toBeInTheDocument();
  });

  it("sin timestamp dice que la fecha es desconocida", () => {
    render(<LastSyncNotice onRefresh={vi.fn()} />);
    expect(screen.getByText(/Fecha de actualización desconocida/)).toBeInTheDocument();
  });

  it("sin timestamp también avisa cuándo hay que actualizar", () => {
    render(<LastSyncNotice onRefresh={vi.fn()} />);
    expect(screen.getByText(/Si emitís desde ARCA/)).toBeInTheDocument();
  });

  it("llama onRefresh al clickear Actualizar", () => {
    const onRefresh = vi.fn();
    render(<LastSyncNotice onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole("button", { name: /Actualizar/ }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("sin onRefresh no ofrece Actualizar y explica por qué", () => {
    mockState.lastSyncedAt = new Date(2026, 7, 10).getTime();
    render(<LastSyncNotice />);

    // /panel omite onRefresh cuando no hay empresa guardada: ofrecer el botón
    // abriría un modal con el CUIT vacío y un submit que no hace nada.
    expect(screen.queryByRole("button", { name: /Actualizar/ })).not.toBeInTheDocument();
    expect(screen.getByText(/10\/08\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/ingresar de nuevo con tu clave fiscal/)).toBeInTheDocument();
  });
});
