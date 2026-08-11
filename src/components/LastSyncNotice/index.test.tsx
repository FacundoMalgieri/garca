import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LastSyncNotice } from "./index";

import { fireEvent, render, screen } from "@testing-library/react";

const mockState = { lastSyncedAt: null as number | null };
vi.mock("@/contexts/InvoiceContext", () => ({
  useInvoiceContext: () => ({ state: mockState }),
}));

describe("LastSyncNotice", () => {
  beforeEach(() => {
    mockState.lastSyncedAt = null;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra la fecha del último scrape", () => {
    mockState.lastSyncedAt = new Date(2026, 7, 10).getTime();
    render(<LastSyncNotice onRefresh={vi.fn()} />);
    expect(screen.getByText(/10\/08\/2026/)).toBeInTheDocument();
  });

  it("dice 'hoy' cuando el scrape fue hoy", () => {
    // La pregunta real frente al banner es "¿esto está fresco?", y una fecha
    // absoluta obliga a calcularlo mentalmente. Sin escalada de color: informa.
    vi.setSystemTime(new Date(2026, 7, 11, 18, 0));
    mockState.lastSyncedAt = new Date(2026, 7, 11, 9, 30).getTime();

    render(<LastSyncNotice onRefresh={vi.fn()} />);

    expect(screen.getByText(/actualizados hoy/i)).toBeInTheDocument();
  });

  it("dice 'ayer' por día calendario, no por 24 horas", () => {
    // 20:00 de ayer a 08:00 de hoy son 12 horas, pero es ayer.
    vi.setSystemTime(new Date(2026, 7, 11, 8, 0));
    mockState.lastSyncedAt = new Date(2026, 7, 10, 20, 0).getTime();

    render(<LastSyncNotice onRefresh={vi.fn()} />);

    expect(screen.getByText(/actualizados ayer/i)).toBeInTheDocument();
  });

  it("cuenta los días cuando hace más de dos", () => {
    vi.setSystemTime(new Date(2026, 7, 11, 8, 0));
    mockState.lastSyncedAt = new Date(2026, 7, 8, 20, 0).getTime();

    render(<LastSyncNotice onRefresh={vi.fn()} />);

    expect(screen.getByText(/hace 3 días/i)).toBeInTheDocument();
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
    // La salida es Limpiar Datos: /ingresar rebota a /panel mientras hasQueried
    // siga en true, así que no sirve como instrucción.
    expect(screen.getByText(/Limpiar Datos.*volvé a ingresar/)).toBeInTheDocument();
  });
});
