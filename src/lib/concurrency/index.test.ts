import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetConcurrencyForTests,
  getConcurrencyStats,
  SLOT_BUDGET,
  SLOT_KILL_GRACE,
  SlotAbandonedError,
  withConcurrencyLimit,
} from "./index";

describe("concurrency", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // El contador es estado de módulo y sobrevive entre casos: sin esto, un
    // test que deja un slot tomado hace fallar a los siguientes por timeout en
    // vez de por assertion, y la causa real queda enterrada.
    __resetConcurrencyForTests();
  });

  describe("getConcurrencyStats", () => {
    it("should return initial stats", () => {
      const stats = getConcurrencyStats();
      expect(stats.active).toBe(0);
      expect(stats.waiting).toBe(0);
      expect(stats.max).toBe(2);
      expect(stats.available).toBe(2);
    });
  });

  describe("withConcurrencyLimit", () => {
    it("should execute function and return result", async () => {
      const result = await withConcurrencyLimit(async () => {
        return "test-result";
      });

      expect(result).toBe("test-result");
    });

    it("should release slot after function completes", async () => {
      await withConcurrencyLimit(async () => {
        const stats = getConcurrencyStats();
        expect(stats.active).toBe(1);
        return "done";
      });

      const statsAfter = getConcurrencyStats();
      expect(statsAfter.active).toBe(0);
    });

    it("should release slot even if function throws", async () => {
      await expect(
        withConcurrencyLimit(async () => {
          throw new Error("test error");
        })
      ).rejects.toThrow("test error");

      const stats = getConcurrencyStats();
      expect(stats.active).toBe(0);
    });

    it("should allow only one concurrent execution", async () => {
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const task = async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise(resolve => setTimeout(resolve, 100));
        currentConcurrent--;
        return "done";
      };

      // Start 1 task
      const promise1 = withConcurrencyLimit(task);

      // Advance timers to complete task
      await vi.advanceTimersByTimeAsync(150);

      await promise1;

      expect(maxConcurrent).toBe(1);
    });

    it("should queue second request when first is running", async () => {
      // First task that takes a while
      const longTask = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return "first";
      };

      // Start first task
      const promise1 = withConcurrencyLimit(longTask);

      // Check stats - should have 1 active
      await vi.advanceTimersByTimeAsync(10);
      const statsWhileRunning = getConcurrencyStats();
      expect(statsWhileRunning.active).toBe(1);

      // Complete first task
      await vi.advanceTimersByTimeAsync(1000);
      await promise1;

      // Should be released
      const statsAfter = getConcurrencyStats();
      expect(statsAfter.active).toBe(0);
    });

    it("should timeout if waiting too long in queue", async () => {
      // Block both slots with long tasks
      let resolveBlocking1: (value: string) => void = () => {};
      let resolveBlocking2: (value: string) => void = () => {};
      const blockingTask1 = new Promise<string>((resolve) => {
        resolveBlocking1 = resolve;
      });
      const blockingTask2 = new Promise<string>((resolve) => {
        resolveBlocking2 = resolve;
      });

      // Fill both slots
      const promise1 = withConcurrencyLimit(() => blockingTask1);
      const promise2 = withConcurrencyLimit(() => blockingTask2);

      // Wait a bit for slots to be acquired
      await vi.advanceTimersByTimeAsync(10);

      // Third task should wait and eventually timeout
      let promise3Error: Error | undefined;
      const promise3 = withConcurrencyLimit(async () => "third").catch((err: Error) => {
        promise3Error = err;
        return "error";
      });

      // Advance past the MAX_QUEUE_WAIT (60 seconds)
      for (let i = 0; i < 130; i++) {
        await vi.advanceTimersByTimeAsync(500);
      }

      await promise3;

      expect(promise3Error).toBeDefined();
      if (promise3Error) {
        expect(promise3Error.message).toMatch(/El servidor está ocupado/);
      }

      // Clean up
      resolveBlocking1("blocking1");
      resolveBlocking2("blocking2");
      await promise1;
      await promise2;
    });

    it("should track waiting count while in queue", async () => {
      // Block the slot
      const blockingTask = new Promise<string>((resolve) => {
        setTimeout(() => resolve("blocking"), 5000);
      });

      // Start blocking task
      const promise1 = withConcurrencyLimit(() => blockingTask);

      // Wait for slot to be acquired
      await vi.advanceTimersByTimeAsync(10);

      // Start second task that will wait
      const promise2 = withConcurrencyLimit(async () => "second");

      // Advance one poll interval - should be waiting
      await vi.advanceTimersByTimeAsync(500);

      // Complete the blocking task
      await vi.advanceTimersByTimeAsync(5000);

      // Both should complete
      const result1 = await promise1;
      const result2 = await promise2;

      expect(result1).toBe("blocking");
      expect(result2).toBe("second");
    });
  });

  // El 2026-09-17 los 2 slots quedaron tomados sin nada corriendo y toda
  // consulta de facturas murió con "El servidor está ocupado" hasta reiniciar
  // el contenedor: el slot sólo se liberaba si la función envuelta terminaba, y
  // un await colgado adentro de Playwright no termina nunca.
  describe("presupuesto de slot", () => {
    /** Se cuelga para siempre, como el scrape del incidente. */
    const seCuelga = () => new Promise<string>(() => {});

    it("libera el slot cuando la función envuelta nunca resuelve", async () => {
      const colgada = withConcurrencyLimit(seCuelga).catch((err: Error) => err);

      await vi.advanceTimersByTimeAsync(0);
      expect(getConcurrencyStats().active).toBe(1);

      await vi.advanceTimersByTimeAsync(SLOT_BUDGET + SLOT_KILL_GRACE);

      await expect(colgada).resolves.toBeInstanceOf(SlotAbandonedError);
      expect(getConcurrencyStats().active).toBe(0);

      // Y un request nuevo entra sin pagar la cola.
      await expect(withConcurrencyLimit(async () => "entra")).resolves.toBe("entra");
    });

    it("aborta la señal al vencer el presupuesto", async () => {
      let vista: AbortSignal | undefined;

      const colgada = withConcurrencyLimit((signal) => {
        vista = signal;
        return seCuelga();
      }).catch(() => "abandonada");

      await vi.advanceTimersByTimeAsync(0);
      expect(vista?.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(SLOT_BUDGET);
      expect(vista?.aborted).toBe(true);

      await vi.advanceTimersByTimeAsync(SLOT_KILL_GRACE);
      await colgada;
    });

    it("libera el slot en cuanto el scrape se desenrolla tras el abort", async () => {
      // Camino feliz del guard: el scraper escucha el abort, cierra el browser y
      // su promise resuelve dentro de la gracia. El backstop no llega a correr,
      // así que no queda huérfano.
      const cooperativa = withConcurrencyLimit(
        (signal) =>
          new Promise<string>((resolve) => {
            signal.addEventListener("abort", () => resolve("cancelada"), { once: true });
          })
      );

      await vi.advanceTimersByTimeAsync(SLOT_BUDGET);

      await expect(cooperativa).resolves.toBe("cancelada");
      expect(getConcurrencyStats().active).toBe(0);
      expect(getConcurrencyStats().orphaned).toBe(0);
    });

    it("no aborta ni deja timers cuando la función termina a tiempo", async () => {
      const timersAntes = vi.getTimerCount();
      let vista: AbortSignal | undefined;

      const result = await withConcurrencyLimit(async (signal) => {
        vista = signal;
        return "ok";
      });

      expect(result).toBe("ok");
      expect(vista?.aborted).toBe(false);
      expect(getConcurrencyStats().active).toBe(0);
      expect(vi.getTimerCount()).toBe(timersAntes);
    });
  });

  describe("slots abandonados", () => {
    const seCuelga = () => new Promise<string>(() => {});

    it("reserva capacidad mientras el trabajo abandonado siga vivo", async () => {
      // Cada backstop que dispara deja un Chromium vivo: si el limitador
      // siguiera admitiendo de a 2, el contenedor termina por OOM.
      const uno = withConcurrencyLimit(seCuelga).catch(() => "1");
      const dos = withConcurrencyLimit(seCuelga).catch(() => "2");

      await vi.advanceTimersByTimeAsync(SLOT_BUDGET + SLOT_KILL_GRACE);
      await uno;
      await dos;

      const stats = getConcurrencyStats();
      expect(stats.active).toBe(0);
      expect(stats.orphaned).toBe(2);
      expect(stats.available).toBe(0);

      // Con la capacidad tomada, el request nuevo falla rápido y con un mensaje
      // honesto en vez de tumbar el proceso.
      let mensaje = "";
      const tercera = withConcurrencyLimit(async () => "entra").catch((err: Error) => {
        mensaje = err.message;
      });

      for (let i = 0; i < 130; i++) {
        await vi.advanceTimersByTimeAsync(500);
      }
      await tercera;

      expect(mensaje).toMatch(/El servidor está ocupado/);
      expect(mensaje).toMatch(/1 solicitudes en espera/);
    });

    it("devuelve la capacidad si el trabajo abandonado termina tarde", async () => {
      let resolverTarde: (value: string) => void = () => {};
      const tarde = new Promise<string>((resolve) => {
        resolverTarde = resolve;
      });

      const abandonada = withConcurrencyLimit(() => tarde).catch(() => "abandonada");
      await vi.advanceTimersByTimeAsync(SLOT_BUDGET + SLOT_KILL_GRACE);
      await abandonada;

      expect(getConcurrencyStats().orphaned).toBe(1);
      expect(getConcurrencyStats().available).toBe(1);

      resolverTarde("al fin");
      await vi.advanceTimersByTimeAsync(0);

      expect(getConcurrencyStats().orphaned).toBe(0);
      expect(getConcurrencyStats().available).toBe(2);
    });
  });
});

