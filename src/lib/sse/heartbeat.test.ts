import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SSE_HEARTBEAT_INTERVAL_MS, startSseHeartbeat } from "./heartbeat";

describe("startSseHeartbeat", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mantiene el intervalo por debajo del corte de Cloudflare (~100s)", () => {
    // Cloudflare corta una conexión proxeada tras ~100s sin bytes. El heartbeat
    // tiene que entrar cómodo dentro de esa ventana, no rozarla.
    expect(SSE_HEARTBEAT_INTERVAL_MS).toBeLessThanOrEqual(30_000);
  });

  it("emite un ping por intervalo mientras está activo", () => {
    const send = vi.fn();
    startSseHeartbeat(send, 1000);

    expect(send).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);

    expect(send).toHaveBeenCalledTimes(3);
  });

  it("emite un comentario SSE, no un evento con data", () => {
    // El cliente parsea líneas que empiezan con "data: ". Un ping tiene que ser
    // un comentario para que lo ignore sin romper el parseo.
    const send = vi.fn();
    startSseHeartbeat(send, 1000);

    vi.advanceTimersByTime(1000);

    expect(send).toHaveBeenCalledWith(": ping\n\n");
  });

  it("deja de emitir después de stop()", () => {
    const send = vi.fn();
    const stop = startSseHeartbeat(send, 1000);

    vi.advanceTimersByTime(2000);
    expect(send).toHaveBeenCalledTimes(2);

    stop();
    vi.advanceTimersByTime(10_000);

    expect(send).toHaveBeenCalledTimes(2);
  });

  it("stop() es idempotente", () => {
    const send = vi.fn();
    const stop = startSseHeartbeat(send, 1000);

    stop();
    stop();
    vi.advanceTimersByTime(5000);

    expect(send).not.toHaveBeenCalled();
  });

  it("corta el heartbeat si el envío tira (controller cerrado)", () => {
    const send = vi.fn(() => {
      throw new Error("controller closed");
    });
    startSseHeartbeat(send, 1000);

    expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
    expect(send).toHaveBeenCalledTimes(1);
  });
});
